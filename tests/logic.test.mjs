// Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deadlinesFor, tasksFor, agendaFor, upcoming, overdueTasks, currentPhase, gradeLabel,
  autoAdmitNote, majorNote, checklistFor, addDays, daysBetween, schoolById,
} from '../js/logic.js';
import { buildIcs } from '../js/ics.js';

const student = (over = {}) => ({
  id: 's1', name: 'Ava', gradYear: 2028, major: 'engineering', rank: 'top10',
  schools: { ut: { status: 'considering', checks: {} }, tamu: { status: 'applying', checks: {} } },
  tasks: {}, customSchools: [], ...over,
});

test('verified class gets published dates, not estimated', () => {
  const ut = deadlinesFor(student({ gradYear: 2027 }), schoolById('ut'));
  const ea = ut.find((d) => d.id === 'ea');
  assert.equal(ea.date, '2026-10-15');
  assert.equal(ea.estimated, false);
  assert.equal(ut.find((d) => d.id === 'ea-dec').date, '2027-01-15');
});

test('later classes shift by year and are marked estimated', () => {
  const ut = deadlinesFor(student({ gradYear: 2029 }), schoolById('ut'));
  const ea = ut.find((d) => d.id === 'ea');
  assert.equal(ea.date, '2028-10-15');
  assert.equal(ea.estimated, true);
});

test('timeline tasks land in the right school years', () => {
  const tasks = tasksFor(student({ gradYear: 2029 }));
  assert.equal(tasks.find((t) => t.id === 's-counselor').date, '2026-10-31'); // sophomore fall
  assert.equal(tasks.find((t) => t.id === 'j-psat').date, '2027-10-20'); // junior fall
  assert.equal(tasks.find((t) => t.id === 'se-submit').date, '2028-10-15'); // senior fall
  assert.equal(tasks.find((t) => t.id === 'se-deposit').date, '2029-05-01');
});

test('school-filtered tasks only appear when the school is on the list', () => {
  assert.ok(tasksFor(student()).some((t) => t.id === 'j-utcutoff'));
  assert.ok(!tasksFor(student()).some((t) => t.id === 'se-rolling'));
  assert.ok(!tasksFor(student({ schools: {} })).some((t) => t.id === 'j-utcutoff'));
});

test('phases and grade follow the calendar', () => {
  const s = student({ gradYear: 2028 });
  assert.equal(currentPhase(s, '2026-10-07'), 'junior');
  assert.equal(gradeLabel(s, '2026-10-07'), 'Junior');
  assert.equal(currentPhase(s, '2027-07-01'), 'summer');
  assert.equal(currentPhase(s, '2027-09-15'), 'senior');
  assert.equal(currentPhase(student({ gradYear: 2029 }), '2026-10-07'), 'sophomore');
  assert.equal(gradeLabel(student({ gradYear: 2029 }), '2026-10-07'), 'Sophomore');
});

test('upcoming window and overdue window', () => {
  const s = student({ gradYear: 2028 });
  const soon = upcoming(s, '2026-10-07', 30);
  assert.ok(soon.length > 0);
  assert.ok(soon.every((i) => i.date >= '2026-10-07' && i.date <= '2026-11-06'));
  // A junior joining in October shouldn't see sophomore tasks as overdue.
  const late = overdueTasks(s, '2026-10-07');
  assert.ok(late.every((t) => t.phase === 'junior'));
  assert.ok(late.some((t) => t.id === 'j-schedule'));
});

test('done tasks drop off the agenda', () => {
  const s = student({ tasks: { 'j-psat': true } });
  assert.ok(!agendaFor(s).some((i) => i.uid === 'task-j-psat'));
});

test('submitted schools hide their application deadlines', () => {
  const s = student({ gradYear: 2027, schools: { ut: { status: 'submitted', checks: {} } } });
  const uids = agendaFor(s).map((i) => i.uid);
  assert.ok(!uids.includes('school-ut-ea'));
  assert.ok(uids.includes('school-ut-ea-dec'));
});

test('auto-admit and major notes', () => {
  assert.equal(autoAdmitNote(student({ rank: 'top5' }), 'ut').tone, 'good');
  assert.equal(autoAdmitNote(student({ rank: 'top10' }), 'ut').tone, 'warn');
  assert.equal(autoAdmitNote(student({ rank: 'top10' }), 'tamu').tone, 'good');
  assert.equal(autoAdmitNote(student(), 'tcu'), null);
  assert.match(majorNote(student(), 'tamu'), /General Engineering/);
  assert.equal(majorNote(student({ major: 'other' }), 'ut'), null);
});

test('checklist adapts to school and major', () => {
  const ut = checklistFor(student(), schoolById('ut')).map((c) => c.id);
  assert.ok(ut.includes('recs') && ut.includes('x-calc'));
  const tamu = checklistFor(student(), schoolById('tamu')).map((c) => c.id);
  assert.ok(!tamu.includes('recs'));
  assert.ok(!checklistFor(student({ major: 'business' }), schoolById('ut')).some((c) => c.id === 'x-calc'));
});

test('custom schools use their own dates', () => {
  const custom = { id: 'c-1', name: 'SMU', custom: true, deadlines: [{ id: 'final', kind: 'final', label: 'Final deadline', date: '2027-01-15' }] };
  const s = student({ customSchools: [custom], schools: { 'c-1': { status: 'considering', checks: {} } } });
  assert.ok(agendaFor(s).some((i) => i.uid === 'school-c-1-final' && i.date === '2027-01-15'));
});

test('date helpers cross months and years', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(daysBetween('2026-10-07', '2026-10-15'), 8);
});

test('ics output is valid-looking and folds long lines', () => {
  const ics = buildIcs([
    { uid: 'a', date: '2026-10-15', summary: 'UT Austin: Early Action deadline, with; specials', description: 'x'.repeat(200) },
    { uid: 'b', date: '2026-08-01', summary: 'Opens', alerts: false },
  ], { alerts: [7, 1], now: new Date('2026-10-07T12:00:00Z') });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261015\r\nDTEND;VALUE=DATE:20261016/);
  assert.match(ics, /SUMMARY:UT Austin: Early Action deadline\\, with\\; specials/);
  assert.match(ics, /TRIGGER:-P6DT15H/);
  assert.match(ics, /TRIGGER:-P0DT15H/);
  assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, 2); // only the first event has alerts
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, line);
});
