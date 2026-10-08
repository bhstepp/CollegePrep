// Pure planning logic: turns a student profile into dated deadlines and tasks.
// No DOM access here, so it can be tested in Node.
import { SCHOOLS, TASKS, KEY_DATES, CHECKLIST, VERIFIED_GRAD_YEAR, TEST_DATES } from './data.js';

const pad = (n) => String(n).padStart(2, '0');

// Dates are plain 'YYYY-MM-DD' strings throughout, so time zones never shift a deadline.
export const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export function todayIso(now = new Date()) {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return isoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function daysBetween(fromIso, toIso) {
  const a = Date.UTC(...fromIso.split('-').map((v, i) => (i === 1 ? v - 1 : +v)));
  const b = Date.UTC(...toIso.split('-').map((v, i) => (i === 1 ? v - 1 : +v)));
  return Math.round((b - a) / 86400000);
}

export function formatDate(iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts);
}

export function relativeLabel(iso, today) {
  const n = daysBetween(today, iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n < 0) return `${-n} days ago`;
  if (n < 14) return `In ${n} days`;
  if (n < 60) return `In ${Math.round(n / 7)} weeks`;
  const months = Math.round(n / 30.4);
  return months < 12 ? `In ${months} months` : `In ${(n / 365).toFixed(1).replace('.0', '')} years`;
}

export const isEstimated = (student) => Number(student.gradYear) !== VERIFIED_GRAD_YEAR;

export function schoolById(id) {
  return SCHOOLS.find((s) => s.id === id);
}

// A custom school the family added: { id, name, url, deadlines: [{id,label,kind,date}] }
export function getSchool(student, id) {
  return schoolById(id) || (student.customSchools || []).find((s) => s.id === id);
}

export function studentSchoolIds(student) {
  return Object.keys(student.schools || {});
}

export function activeSchoolIds(student) {
  return studentSchoolIds(student).filter((id) => student.schools[id].status !== 'dropped');
}

export function deadlinesFor(student, school) {
  const seniorFall = Number(student.gradYear) - 1;
  if (school.custom) {
    return (school.deadlines || [])
      .filter((d) => d.date)
      .map((d) => ({ ...d, estimated: false }));
  }
  const est = isEstimated(student);
  // approx: the source gives a typical date ("usually mid-September") or last cycle's date.
  return school.deadlines.map((d) => ({
    ...d,
    date: isoDate(seniorFall + d.y, d.m, d.d),
    estimated: est || !!d.approx,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function keyDatesFor(student) {
  const seniorFall = Number(student.gradYear) - 1;
  return KEY_DATES.map((k) => ({ ...k, date: isoDate(seniorFall + k.y, k.m, k.d) }));
}

export function tasksFor(student) {
  const g = Number(student.gradYear);
  const schools = new Set(activeSchoolIds(student));
  return TASKS
    .filter((t) => !t.schools || t.schools.some((s) => schools.has(s)))
    .filter((t) => !t.majors || t.majors.includes(student.major))
    .map((t) => ({ ...t, date: isoDate(g + t.y, t.m, t.d), done: !!(student.tasks || {})[t.id] }));
}

// Published test dates that fall in the student's junior spring/summer.
export function testDatesFor(student, today) {
  const juniorSpring = Number(student.gradYear) - 1;
  return TEST_DATES.filter((t) => Number(t.date.slice(0, 4)) === juniorSpring && t.date >= today);
}

export function currentPhase(student, today) {
  const g = Number(student.gradYear);
  if (today < isoDate(g - 2, 8, 1)) return 'sophomore';
  if (today < isoDate(g - 1, 6, 1)) return 'junior';
  if (today < isoDate(g - 1, 9, 1)) return 'summer';
  return 'senior';
}

export function gradeLabel(student, today) {
  const g = Number(student.gradYear);
  const [y, m] = today.split('-').map(Number);
  const schoolYearEnd = m >= 8 ? y + 1 : y;
  const grade = 12 - (g - schoolYearEnd);
  if (grade > 12) return 'Graduated';
  if (grade < 9) return `Class of ${g}`;
  return { 9: 'Freshman', 10: 'Sophomore', 11: 'Junior', 12: 'Senior' }[grade];
}

const CAPPED = { ut: ['engineering', 'cs', 'business', 'nursing'], tamu: ['engineering', 'cs', 'business', 'nursing'] };

export function majorNote(student, schoolId) {
  const major = student.major;
  if (!CAPPED[schoolId] || !CAPPED[schoolId].includes(major)) return null;
  if (schoolId === 'tamu' && major === 'engineering') {
    return 'Engineering is reviewed separately, even for Top 10% students. Admits go to General Engineering, then Entry to a Major.';
  }
  if (schoolId === 'ut' && major === 'engineering') {
    return 'Cockrell is a separate, harder admission than UT. Calculus readiness is required by the deadline; choose the second-choice major deliberately.';
  }
  return 'This is a capped major: far more competitive than the university overall. The first-choice major box matters.';
}

export function autoAdmitNote(student, schoolId) {
  const school = schoolById(schoolId);
  if (!school || !school.autoAdmit) return null;
  const r = student.rank;
  if (r === 'unknown' || !r) return { tone: 'info', text: 'Class rank decides automatic admission here. Ask the counselor for current rank.' };
  if (school.autoAdmit === 'ut') {
    if (r === 'top5') return { tone: 'good', text: 'In the top 5% auto-admit range (into UT, not the major). UT announces each new cutoff to juniors in the fall.' };
    return { tone: 'warn', text: 'Outside the top 5% auto-admit range, so holistic review. Treat UT as a reach.' };
  }
  if (r === 'top5' || r === 'top10') return { tone: 'good', text: 'Top 10%: automatic admission to the university (the major may still be reviewed).' };
  return { tone: 'info', text: 'Outside the top 10%, so holistic review.' };
}

export function checklistFor(student, school) {
  const items = CHECKLIST.filter((c) => !c.onlyIfRecs || school.recs);
  const extras = (school.extras || []).filter((e) => !e.majors || e.majors.includes(student.major));
  return [...items, ...extras.map((e) => ({ ...e, id: `x-${e.id}` }))];
}

export function schoolProgress(student, schoolId) {
  const school = getSchool(student, schoolId);
  const entry = student.schools[schoolId];
  const list = checklistFor(student, school);
  const done = list.filter((c) => entry.checks && entry.checks[c.id]).length;
  return { done, total: list.length };
}

// Status values after which a school's pre-submission deadlines no longer apply.
const SUBMITTED = new Set(['submitted', 'admitted', 'waitlisted', 'denied', 'deposited']);

// Everything with a date for one student, for the dashboard and the calendar.
export function agendaFor(student, { includeDone = false } = {}) {
  const items = [];
  for (const t of tasksFor(student)) {
    if (t.done && !includeDone) continue;
    items.push({ type: 'task', uid: `task-${t.id}`, date: t.date, title: t.title, detail: t.detail, phase: t.phase, done: t.done, ref: t.id, optional: !!t.optional });
  }
  for (const id of activeSchoolIds(student)) {
    const school = getSchool(student, id);
    if (!school) continue;
    const submitted = SUBMITTED.has(student.schools[id].status);
    for (const d of deadlinesFor(student, school)) {
      if (submitted && (d.kind === 'open' || d.kind === 'early' || d.kind === 'final')) continue;
      const housing = d.kind === 'housing' && school.housing;
      items.push({ type: 'deadline', uid: `school-${id}-${d.id}`, date: d.date, title: `${school.name}: ${d.label}`, detail: housing ? housing.earliest : school.tip || '', kind: d.kind, school: id, estimated: d.estimated, url: housing ? housing.url : school.url });
    }
  }
  for (const k of keyDatesFor(student)) {
    items.push({ type: 'key', uid: `key-${k.id}`, date: k.date, title: k.label, detail: k.detail || '', kind: 'key' });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

// Housing usually goes first-come by application or deposit date, so the moment
// a school says yes, its housing step becomes the most urgent thing on the list.
export function housingAlerts(student) {
  return activeSchoolIds(student)
    .filter((id) => ['admitted', 'deposited'].includes(student.schools[id].status) && !(student.schools[id].checks || {}).housing)
    .map((id) => {
      const school = getSchool(student, id);
      const h = school.housing || {};
      return { school: id, name: school.name, text: h.earliest || "Apply for housing now: most schools assign rooms in the order applications and deposits come in.", url: h.url || school.url };
    });
}

export function upcoming(student, today, days = 30) {
  const end = addDays(today, days);
  return agendaFor(student).filter((i) => i.date >= today && i.date <= end);
}

// Only recent misses count as overdue: a family joining in junior year
// shouldn't open the app to a wall of sophomore tasks.
export function overdueTasks(student, today, windowDays = 60) {
  const since = addDays(today, -windowDays);
  return tasksFor(student).filter((t) => !t.done && !t.optional && t.date < today && t.date >= since);
}
