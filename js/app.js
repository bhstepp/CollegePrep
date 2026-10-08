import { SCHOOLS, MAJORS, RANKS, STATUSES, GRAD_YEARS, PHASES, PLAYBOOK_URL, VERIFIED_GRAD_YEAR } from './data.js';
import {
  todayIso, formatDate, relativeLabel, isEstimated, getSchool, studentSchoolIds, activeSchoolIds,
  deadlinesFor, tasksFor, currentPhase, gradeLabel, majorNote, autoAdmitNote, checklistFor,
  schoolProgress, agendaFor, upcoming, overdueTasks, testDatesFor, daysBetween, housingAlerts,
} from './logic.js';
import { buildIcs } from './ics.js';
import * as store from './store.js';

const $main = document.getElementById('main');
const $header = document.getElementById('header');
const $nav = document.getElementById('nav');

const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const labelOf = (list, id) => (list.find((x) => x.id === id) || {}).label || '';
const today = () => todayIso();

// ---------- routing ----------

function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'today';
  const [view, arg] = hash.split('/');
  return { view, arg: arg && decodeURIComponent(arg) };
}

function go(path) {
  location.hash = `#/${path}`;
}

function render() {
  const { view, arg } = route();
  const st = store.getState();
  const student = store.activeStudent();

  if (!student && view !== 'setup' && view !== 'more') return go('setup');

  renderHeader(student, view);
  renderNav(view);

  const views = { today: viewToday, plan: viewPlan, schools: viewSchools, school: viewSchool, 'add-school': viewAddSchool, calendar: viewCalendar, more: viewMore, setup: viewSetup, edit: viewSetup };
  const fn = views[view] || viewToday;
  $main.innerHTML = fn(student, arg, st);
  $main.focus({ preventScroll: true });
  if (view !== route.lastView) window.scrollTo(0, 0);
  route.lastView = view;
}

function renderHeader(student, view) {
  if (!student || view === 'setup') {
    $header.innerHTML = `<div class="brand"><span class="logo" aria-hidden="true"></span>College Prep</div>`;
    return;
  }
  const st = store.getState();
  const others = st.students.length > 1
    ? `<select class="student-switch" data-action="switch-student" aria-label="Switch student">
        ${st.students.map((s) => `<option value="${h(s.id)}" ${s.id === student.id ? 'selected' : ''}>${h(s.name)}</option>`).join('')}
       </select>`
    : `<span class="student-name">${h(student.name)}</span>`;
  $header.innerHTML = `
    <div class="brand"><span class="logo" aria-hidden="true"></span><span class="brand-text">College Prep</span></div>
    <div class="who">${others}<span class="grade">${h(gradeLabel(student, today()))} · ${h(student.gradYear)}</span></div>`;
}

function renderNav(view) {
  const st = store.getState();
  if (!st.students.length || view === 'setup') {
    $nav.hidden = true;
    return;
  }
  $nav.hidden = false;
  const active = { school: 'schools', 'add-school': 'schools', edit: 'more', calendar: 'today' }[view] || view;
  const tabs = [
    ['today', 'Today', '<path d="M4 5h16v15H4zM4 9h16M9 3v4M15 3v4"/>'],
    ['plan', 'Plan', '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'],
    ['schools', 'Schools', '<path d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-5h6v5"/>'],
    ['more', 'More', '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'],
  ];
  $nav.innerHTML = tabs.map(([id, label, icon]) => `
    <a href="#/${id}" class="${active === id ? 'active' : ''}" ${active === id ? 'aria-current="page"' : ''}>
      <svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${label}</span>
    </a>`).join('');
}

// ---------- shared pieces ----------

function estimateNote(student) {
  if (!isEstimated(student)) return '';
  return `<p class="note">School dates for the Class of ${h(student.gradYear)} are projected from the Fall ${VERIFIED_GRAD_YEAR} cycle. Schools usually keep the same pattern; confirm on each school's site each August.</p>`;
}

function agendaRow(item, t) {
  const n = daysBetween(t, item.date);
  const soon = n >= 0 && n <= 7 ? 'soon' : '';
  const late = n < 0 ? 'late' : '';
  const when = `<div class="when ${soon} ${late}"><b>${h(formatDate(item.date, { month: 'short', day: 'numeric' }))}</b><span>${h(relativeLabel(item.date, t))}</span></div>`;
  if (item.type === 'task') {
    return `<li class="row task ${item.done ? 'done' : ''}">
      <label class="check"><input type="checkbox" data-action="toggle-task" data-id="${h(item.ref)}" ${item.done ? 'checked' : ''}><span></span></label>
      <div class="body"><div class="title">${h(item.title)}${item.optional ? ' <span class="tag">if needed</span>' : ''}</div>${item.detail ? `<div class="detail">${h(item.detail)}</div>` : ''}</div>
      ${when}</li>`;
  }
  const tag = item.type === 'key' ? '<span class="tag key">Key date</span>' : `<span class="tag ${h(item.kind)}">${h(kindLabel(item.kind))}</span>`;
  const est = item.estimated ? ' <span class="tag est" title="Projected from the published cycle">est.</span>' : '';
  const link = item.school ? `href="#/school/${h(item.school)}"` : '';
  return `<li class="row deadline">
      <span class="dot ${h(item.kind)}" aria-hidden="true"></span>
      <${link ? 'a' : 'div'} class="body" ${link}><div class="title">${h(item.title)}</div><div class="detail">${tag}${est}</div></${link ? 'a' : 'div'}>
      ${when}</li>`;
}

function kindLabel(kind) {
  return { open: 'Opens', early: 'Early deadline', final: 'Deadline', scholarship: 'Scholarship', docs: 'Documents', decision: 'Decisions', housing: 'Housing', custom: 'Deadline' }[kind] || 'Deadline';
}

// ---------- views ----------

function viewToday(student) {
  const t = today();
  const phase = currentPhase(student, t);
  const phaseInfo = PHASES.find((p) => p.id === phase);
  const overdue = overdueTasks(student, t);
  const housingNow = housingAlerts(student);
  const soon = upcoming(student, t, 30);
  const later = soon.length ? [] : agendaFor(student).filter((i) => i.date > t).slice(0, 4);
  const schoolIds = activeSchoolIds(student);
  const planTasks = tasksFor(student).filter((x) => x.phase === phase);
  const planDone = planTasks.filter((x) => x.done).length;

  return `
  <section class="hero">
    <p class="eyebrow">${h(phaseInfo.label)}</p>
    <h1>${h(student.name)}'s next 30 days</h1>
    <p>${h(phaseInfo.blurb)}</p>
    <div class="meter" role="img" aria-label="${planDone} of ${planTasks.length} ${h(phaseInfo.label)} tasks done"><span style="width:${planTasks.length ? Math.round((planDone / planTasks.length) * 100) : 0}%"></span></div>
    <p class="meter-label">${planDone} of ${planTasks.length} ${h(phaseInfo.label.toLowerCase())} tasks done · <a href="#/plan">See the plan</a></p>
  </section>

  ${housingNow.length ? `
  <section class="card urgent">
    <h2>Housing: do this now</h2>
    <ul class="list">${housingNow.map((x) => `
      <li class="row deadline">
        <span class="dot housing" aria-hidden="true"></span>
        <a class="body" href="#/school/${h(x.school)}"><div class="title">${h(x.name)}: apply for housing</div><div class="detail">${h(x.text)}</div></a>
      </li>`).join('')}</ul>
  </section>` : ''}

  ${overdue.length ? `
  <section class="card">
    <h2>Catch up</h2>
    <ul class="list">${overdue.map((x) => agendaRow({ type: 'task', ref: x.id, date: x.date, title: x.title, detail: x.detail, done: x.done }, t)).join('')}</ul>
  </section>` : ''}

  <section class="card">
    <h2>${soon.length ? 'Coming up' : 'Nothing due in the next 30 days'}</h2>
    ${soon.length ? `<ul class="list">${soon.map((i) => agendaRow(i, t)).join('')}</ul>` : `
      <p class="muted">Next on the horizon:</p>
      <ul class="list">${later.map((i) => agendaRow(i, t)).join('')}</ul>`}
  </section>

  <section class="card">
    <div class="card-head"><h2>Schools</h2><a class="link" href="#/schools">${schoolIds.length ? 'Manage' : 'Add schools'}</a></div>
    ${schoolIds.length ? `<div class="chips">${schoolIds.map((id) => {
      const s = getSchool(student, id);
      const p = schoolProgress(student, id);
      return `<a class="chip" href="#/school/${h(id)}"><b>${h(s.short || s.name)}</b><span>${h(labelOf(STATUSES, student.schools[id].status))} · ${p.done}/${p.total}</span></a>`;
    }).join('')}</div>` : '<p class="muted">No schools yet. Add the ones on your list to see their deadlines here.</p>'}
  </section>

  <a class="card cta" href="#/calendar">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0"/></svg>
    <div><b>Get reminders on your phone</b><span>Add these dates to your calendar with alerts a week and a day ahead.</span></div>
  </a>
  ${estimateNote(student)}`;
}

function viewPlan(student) {
  const t = today();
  const phase = currentPhase(student, t);
  const tasks = tasksFor(student);
  const tests = testDatesFor(student, t);
  return `
  <h1 class="page-title">The plan</h1>
  <p class="lede">Built from the playbook for the Class of ${h(student.gradYear)}. Check things off as you go.</p>
  ${PHASES.map((p) => {
    const list = tasks.filter((x) => x.phase === p.id);
    const done = list.filter((x) => x.done).length;
    const isNow = p.id === phase;
    return `<details class="phase ${isNow ? 'now' : ''}" ${isNow ? 'open' : ''}>
      <summary><div><b>${h(p.label)}</b>${isNow ? ' <span class="tag now">Now</span>' : ''}<span class="sub">${h(p.blurb)}</span></div><span class="count">${done}/${list.length}</span></summary>
      <ul class="list">${list.map((x) => agendaRow({ type: 'task', ref: x.id, date: x.date, title: x.title, detail: x.detail, done: x.done, optional: x.optional }, t)).join('')}</ul>
    </details>`;
  }).join('')}
  ${tests.length ? `
  <section class="card">
    <h2>Published test dates</h2>
    <table class="tests"><thead><tr><th>Test</th><th>Date</th><th>Register by</th></tr></thead><tbody>
    ${tests.map((x) => `<tr><td>${h(x.test)}</td><td>${h(formatDate(x.date))}</td><td>${h(formatDate(x.register, { month: 'short', day: 'numeric' }))}</td></tr>`).join('')}
    </tbody></table>
    <p class="muted small">Sources: College Board and ACT. ACT registration closes about five weeks before test day.</p>
  </section>` : ''}`;
}

function viewSchools(student) {
  const t = today();
  const ids = studentSchoolIds(student);
  return `
  <div class="page-head"><h1 class="page-title">Schools</h1><a class="btn small" href="#/add-school">Add or remove</a></div>
  ${ids.length ? '' : '<p class="lede">Pick the schools on your list to track their deadlines and application checklists.</p>'}
  <div class="school-list">
  ${ids.map((id) => {
    const s = getSchool(student, id);
    if (!s) return '';
    const entry = student.schools[id];
    const p = schoolProgress(student, id);
    const future = deadlinesFor(student, s).filter((d) => d.date >= t);
    const next = future.find((d) => ['early', 'final', 'scholarship'].includes(d.kind)) || future[0];
    const aa = autoAdmitNote(student, id);
    const mn = majorNote(student, id);
    return `<a class="card school ${entry.status === 'dropped' ? 'dropped' : ''}" href="#/school/${h(id)}">
      <div class="card-head"><h2>${h(s.name)}</h2><span class="status ${h(entry.status)}">${h(labelOf(STATUSES, entry.status))}</span></div>
      ${next ? `<p class="next"><b>${h(next.label)}</b> · ${h(formatDate(next.date, { month: 'short', day: 'numeric', year: 'numeric' }))} <span class="muted">(${h(relativeLabel(next.date, t))})</span></p>` : ''}
      <div class="meter"><span style="width:${Math.round((p.done / p.total) * 100)}%"></span></div>
      <p class="meter-label">${p.done} of ${p.total} checklist items</p>
      ${aa ? `<p class="flag ${h(aa.tone)}">${h(aa.text)}</p>` : ''}
      ${mn ? `<p class="flag warn">${h(mn)}</p>` : ''}
    </a>`;
  }).join('')}
  </div>
  ${ids.length ? estimateNote(student) : '<a class="btn primary block" href="#/add-school">Add schools</a>'}`;
}

function viewSchool(student, id) {
  const s = getSchool(student, id);
  const entry = student.schools[id];
  if (!s || !entry) return `<p>School not found. <a href="#/schools">Back to schools</a></p>`;
  const t = today();
  const aa = autoAdmitNote(student, id);
  const mn = majorNote(student, id);
  const list = checklistFor(student, s);
  return `
  <a class="back" href="#/schools">‹ Schools</a>
  <div class="page-head"><h1 class="page-title">${h(s.name)}</h1>${s.url ? `<a class="btn small" href="${h(s.url)}" target="_blank" rel="noopener">Website ↗</a>` : ''}</div>
  ${s.apply || s.testing ? `<p class="lede">${s.apply ? `Apply with ${h(s.apply)}.` : ''} ${h(s.testing || '')}</p>` : ''}

  <label class="field"><span>Status</span>
    <select data-action="set-status" data-id="${h(id)}">
      ${STATUSES.map((x) => `<option value="${x.id}" ${x.id === entry.status ? 'selected' : ''}>${h(x.label)}</option>`).join('')}
    </select>
  </label>

  ${aa ? `<p class="flag ${h(aa.tone)}">${h(aa.text)}</p>` : ''}
  ${mn ? `<p class="flag warn">${h(mn)}</p>` : ''}
  ${s.tip ? `<p class="flag info">${h(s.tip)}</p>` : ''}

  <section class="card">
    <h2>Deadlines</h2>
    <ul class="list">${deadlinesFor(student, s).map((d) => `
      <li class="row deadline ${d.date < t ? 'past' : ''}">
        <span class="dot ${h(d.kind)}" aria-hidden="true"></span>
        <div class="body"><div class="title">${h(d.label)}</div><div class="detail"><span class="tag ${h(d.kind)}">${h(kindLabel(d.kind))}</span>${d.estimated ? ' <span class="tag est">est.</span>' : ''}</div></div>
        <div class="when"><b>${h(formatDate(d.date, { month: 'short', day: 'numeric', year: 'numeric' }))}</b><span>${h(relativeLabel(d.date, t))}</span></div>
      </li>`).join('') || '<li class="muted">No dates added.</li>'}
    </ul>
  </section>

  ${s.housing ? `
  <section class="card housing">
    <div class="card-head"><h2>Housing</h2><a class="link" href="${h(s.housing.url)}" target="_blank" rel="noopener">Housing site ↗</a></div>
    <p class="flag housing"><b>Earliest move:</b> ${h(s.housing.earliest)}</p>
    <p class="small">${h(s.housing.how)}</p>
  </section>` : ''}

  <section class="card">
    <h2>Application checklist</h2>
    <ul class="list">${list.map((c) => {
      const on = !!(entry.checks || {})[c.id];
      return `<li class="row task ${on ? 'done' : ''}">
        <label class="check"><input type="checkbox" data-action="toggle-check" data-school="${h(id)}" data-id="${h(c.id)}" ${on ? 'checked' : ''}><span></span></label>
        <div class="body"><div class="title">${h(c.label)}</div></div></li>`;
    }).join('')}</ul>
  </section>

  <section class="card">
    <h2>Notes</h2>
    <textarea class="notes" data-action="notes" data-id="${h(id)}" rows="5" placeholder="Portal login hints, essay prompts, who you talked to…">${h(entry.notes || '')}</textarea>
  </section>
  ${s.custom ? '' : estimateNote(student)}`;
}

function viewAddSchool(student) {
  const chosen = new Set(studentSchoolIds(student));
  const custom = student.customSchools || [];
  return `
  <a class="back" href="#/schools">‹ Schools</a>
  <h1 class="page-title">Your school list</h1>
  <p class="lede">The schools from the playbook come with their deadlines built in.</p>
  <section class="card">
    <ul class="list">${SCHOOLS.map((s) => `
      <li class="row task"><label class="check"><input type="checkbox" data-action="toggle-school" data-id="${s.id}" ${chosen.has(s.id) ? 'checked' : ''}><span></span></label>
      <div class="body"><div class="title">${h(s.name)}</div><div class="detail">${h(s.testing)}</div></div></li>`).join('')}
    ${custom.map((s) => `
      <li class="row task"><label class="check"><input type="checkbox" data-action="toggle-school" data-id="${h(s.id)}" ${chosen.has(s.id) ? 'checked' : ''}><span></span></label>
      <div class="body"><div class="title">${h(s.name)}</div><div class="detail">Added by you · <button class="linklike" data-action="delete-custom" data-id="${h(s.id)}">Delete</button></div></div></li>`).join('')}
    </ul>
  </section>

  <section class="card">
    <h2>Add another school</h2>
    <p class="muted small">Enter the dates from the school's admissions site. Leave any you don't know blank.</p>
    <form data-form="custom-school" class="form">
      <label class="field"><span>School name</span><input name="name" required maxlength="80" placeholder="e.g. SMU"></label>
      <label class="field"><span>Admissions website (optional)</span><input name="url" type="url" placeholder="https://"></label>
      <label class="field"><span>Application opens</span><input name="open" type="date"></label>
      <label class="field"><span>Early / priority deadline</span><input name="early" type="date"></label>
      <label class="field"><span>Scholarship deadline</span><input name="scholarship" type="date"></label>
      <label class="field"><span>Final deadline</span><input name="final" type="date"></label>
      <label class="field"><span>Housing application opens</span><input name="housing" type="date"><small>Apply the day it opens; rooms usually go first-come.</small></label>
      <button class="btn primary block" type="submit">Add school</button>
    </form>
  </section>`;
}

function viewCalendar(student, _arg, st) {
  const alerts = st.settings.alerts || [7, 1];
  return `
  <a class="back" href="#/today">‹ Today</a>
  <h1 class="page-title">Reminders on your phone</h1>
  <p class="lede">This adds your deadlines and plan to your phone's calendar, with alerts. Everything stays on your device.</p>

  <form data-form="calendar" class="card form">
    <h2>What to include</h2>
    ${st.students.length > 1 ? `<fieldset><legend>Students</legend>${st.students.map((s) => `
      <label class="opt"><input type="checkbox" name="student" value="${h(s.id)}" ${s.id === student.id ? 'checked' : ''}> ${h(s.name)}</label>`).join('')}</fieldset>` : `<input type="hidden" name="student" value="${h(student.id)}">`}
    <fieldset><legend>Dates</legend>
      <label class="opt"><input type="checkbox" name="deadlines" checked> School deadlines</label>
      <label class="opt"><input type="checkbox" name="tasks" checked> Plan tasks not done yet</label>
      <label class="opt"><input type="checkbox" name="key" checked> Key dates (FAFSA, decision day)</label>
      <label class="opt"><input type="checkbox" name="past"> Include dates that already passed</label>
    </fieldset>
    <fieldset><legend>Alerts</legend>
      <label class="opt"><input type="checkbox" name="alert" value="7" ${alerts.includes(7) ? 'checked' : ''}> 1 week before (9am)</label>
      <label class="opt"><input type="checkbox" name="alert" value="1" ${alerts.includes(1) ? 'checked' : ''}> 1 day before (9am)</label>
      <label class="opt"><input type="checkbox" name="alert" value="0" ${alerts.includes(0) ? 'checked' : ''}> Morning of (9am)</label>
    </fieldset>
    <button class="btn primary block" type="submit">Add to my calendar</button>
  </form>

  <section class="card">
    <h2>How it works</h2>
    <ol class="steps">
      <li><b>iPhone:</b> tap the button, then <b>Add All</b>. Tip: choose a separate calendar named “College Prep” so it's easy to replace later.</li>
      <li><b>Android:</b> tap the button and open the downloaded file with your calendar app. If nothing happens, import it at calendar.google.com → Settings → Import.</li>
      <li><b>When things change</b> (new schools, updated dates), add it again. On iPhone, delete the old “College Prep” calendar first to avoid duplicates.</li>
    </ol>
  </section>`;
}

function viewMore(student, _arg, st) {
  return `
  <h1 class="page-title">More</h1>
  ${st.students.length ? `
  <section class="card">
    <h2>Students</h2>
    <ul class="list">${st.students.map((s) => `
      <li class="row">
        <div class="body"><div class="title">${h(s.name)} ${s.id === (student && student.id) ? '<span class="tag now">Showing</span>' : ''}</div>
        <div class="detail">Class of ${h(s.gradYear)} · ${h(labelOf(MAJORS, s.major))} · ${h(labelOf(RANKS, s.rank))}</div></div>
        <div class="row-actions">
          ${s.id !== (student && student.id) ? `<button class="btn small" data-action="select-student" data-id="${h(s.id)}">Show</button>` : ''}
          <a class="btn small" href="#/edit/${h(s.id)}">Edit</a>
        </div>
      </li>`).join('')}</ul>
    <a class="btn block" href="#/setup">Add another student</a>
  </section>` : `<a class="back" href="#/setup">‹ Start a new plan</a>`}

  <section class="card">
    <h2>Back up your data</h2>
    <p class="muted small">Your data lives only in this browser on this device. Save a backup now and then, or use one to move to a new phone.</p>
    <div class="btn-row">
      <button class="btn" data-action="export">Save backup</button>
      <label class="btn">Restore backup<input type="file" accept="application/json,.json" data-action="import" hidden></label>
    </div>
  </section>

  <section class="card">
    <h2>Put it on your home screen</h2>
    <p class="small"><b>iPhone:</b> in Safari, tap Share → <b>Add to Home Screen</b>. <b>Android:</b> in Chrome, tap ⋮ → <b>Add to Home screen</b>. It opens like an app and works offline.</p>
  </section>

  <section class="card">
    <h2>About</h2>
    <p class="small">Dates and advice come from the <a href="${PLAYBOOK_URL}" target="_blank" rel="noopener">College Prep Playbook for DFW Families</a>. School dates were checked for students entering in Fall ${VERIFIED_GRAD_YEAR}; always confirm on each school's site.</p>
    <p class="small muted">Private by design: nothing you enter leaves this device.</p>
  </section>`;
}

function viewSetup(student, arg, st) {
  const editing = route().view === 'edit' ? st.students.find((s) => s.id === arg) : null;
  const s = editing || { name: '', gradYear: 2028, major: 'undecided', rank: 'unknown' };
  const first = !st.students.length;
  return `
  ${first ? `<section class="hero welcome">
    <h1>Your family's college plan</h1>
    <p>Turn the playbook into a personal plan: a dated checklist, every school's deadlines, and reminders on your phone. Everything stays on this device.</p>
  </section>` : `<a class="back" href="#/more">‹ More</a><h1 class="page-title">${editing ? `Edit ${h(s.name)}` : 'Add a student'}</h1>`}
  <form data-form="student" class="card form" data-id="${h(editing ? editing.id : '')}">
    <label class="field"><span>Student's first name</span><input name="name" required maxlength="40" value="${h(s.name)}" autocomplete="off"></label>
    <label class="field"><span>Graduating class</span><select name="gradYear">${GRAD_YEARS.map((y) => `<option value="${y}" ${Number(s.gradYear) === y ? 'selected' : ''}>Class of ${y}</option>`).join('')}</select></label>
    <label class="field"><span>Intended major</span><select name="major">${MAJORS.map((m) => `<option value="${m.id}" ${s.major === m.id ? 'selected' : ''}>${h(m.label)}</option>`).join('')}</select></label>
    <label class="field"><span>Class rank</span><select name="rank">${RANKS.map((r) => `<option value="${r.id}" ${s.rank === r.id ? 'selected' : ''}>${h(r.label)}</option>`).join('')}</select>
      <small>Decides automatic admission at UT, A&amp;M and Texas Tech.</small></label>
    ${editing ? '' : `<fieldset><legend>Schools you're looking at</legend>${SCHOOLS.map((x) => `
      <label class="opt"><input type="checkbox" name="school" value="${x.id}"> ${h(x.name)}</label>`).join('')}
      <small>You can change these anytime.</small></fieldset>`}
    <button class="btn primary block" type="submit">${editing ? 'Save' : first ? 'Build our plan' : 'Add student'}</button>
    ${editing ? `<button class="btn danger block" type="button" data-action="delete-student" data-id="${h(editing.id)}">Delete ${h(s.name)}</button>` : ''}
  </form>
  ${first ? `<p class="center small"><a href="#/more">Restore from a backup</a></p>` : ''}`;
}

// ---------- actions ----------

function withStudent(fn) {
  store.update((st) => {
    const s = st.students.find((x) => x.id === (store.activeStudent() || {}).id);
    if (s) fn(s, st);
  });
}

const SUBMITTED_OR_LATER = new Set(['submitted', 'admitted', 'waitlisted', 'denied', 'deposited']);

const actions = {
  'toggle-task': (el) => withStudent((s) => { s.tasks[el.dataset.id] = el.checked; if (!el.checked) delete s.tasks[el.dataset.id]; }),
  'toggle-check': (el) => withStudent((s) => {
    const entry = s.schools[el.dataset.school];
    entry.checks = entry.checks || {};
    if (el.checked) entry.checks[el.dataset.id] = true; else delete entry.checks[el.dataset.id];
    if (el.dataset.id === 'submitted' && el.checked && !SUBMITTED_OR_LATER.has(entry.status)) {
      entry.status = 'submitted';
      toast('Marked as submitted');
    } else if (el.checked && entry.status === 'considering') {
      entry.status = 'applying';
    }
  }),
  'set-status': (el) => withStudent((s) => {
    const entry = s.schools[el.dataset.id];
    entry.status = el.value;
    if (SUBMITTED_OR_LATER.has(el.value)) entry.checks = { ...entry.checks, submitted: true };
  }),
  'toggle-school': (el) => withStudent((s) => {
    const id = el.dataset.id;
    if (el.checked) s.schools[id] = s.schools[id] || { status: 'considering', checks: {}, notes: '' };
    else if (hasProgress(s.schools[id]) && !confirm('Remove this school? Its checklist and notes will be deleted.')) el.checked = true;
    else delete s.schools[id];
  }),
  'delete-custom': (el) => withStudent((s) => {
    if (!confirm('Delete this school and its dates?')) return;
    s.customSchools = s.customSchools.filter((x) => x.id !== el.dataset.id);
    delete s.schools[el.dataset.id];
  }),
  'switch-student': (el) => store.update((st) => { st.activeId = el.value; }),
  'select-student': (el) => { store.update((st) => { st.activeId = el.dataset.id; }); go('today'); },
  'delete-student': (el) => {
    const st = store.getState();
    const s = st.students.find((x) => x.id === el.dataset.id);
    if (!s || !confirm(`Delete ${s.name} and everything tracked for them? This can't be undone.`)) return;
    store.update((state) => {
      state.students = state.students.filter((x) => x.id !== s.id);
      if (state.activeId === s.id) state.activeId = state.students[0] ? state.students[0].id : null;
    });
    go(store.getState().students.length ? 'more' : 'setup');
  },
  export: () => {
    const s = store.activeStudent();
    const name = s ? s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'family';
    download(`college-prep-backup-${name}-${today()}.json`, store.exportBackup(), 'application/json');
  },
};

function hasProgress(entry) {
  return entry && ((entry.notes || '').trim() || Object.keys(entry.checks || {}).length || entry.status !== 'considering');
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('button[data-action]');
  if (el && actions[el.dataset.action]) {
    e.preventDefault();
    actions[el.dataset.action](el);
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.action === 'import') return importFile(el);
  if (el.dataset.action === 'notes') return;
  if (el.dataset.action && actions[el.dataset.action]) actions[el.dataset.action](el);
});

let notesTimer;
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.action !== 'notes') return;
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => {
    const s = store.activeStudent();
    if (!s || !s.schools[el.dataset.id]) return;
    s.schools[el.dataset.id].notes = el.value;
    // Save without re-rendering so the cursor stays put.
    quiet = true;
    store.save();
    quiet = false;
  }, 400);
});

document.addEventListener('submit', (e) => {
  const form = e.target;
  const kind = form.dataset.form;
  if (!kind) return;
  e.preventDefault();
  const data = new FormData(form);
  if (kind === 'student') saveStudent(form, data);
  if (kind === 'custom-school') saveCustomSchool(form, data);
  if (kind === 'calendar') exportCalendar(data);
});

function saveStudent(form, data) {
  const id = form.dataset.id;
  const fields = {
    name: String(data.get('name')).trim(),
    gradYear: Number(data.get('gradYear')),
    major: data.get('major'),
    rank: data.get('rank'),
  };
  if (!fields.name) return;
  if (id) {
    store.update((st) => Object.assign(st.students.find((x) => x.id === id), fields));
    toast('Saved');
    return go('more');
  }
  const schools = {};
  for (const sid of data.getAll('school')) schools[sid] = { status: 'considering', checks: {}, notes: '' };
  const student = { id: store.newId(), ...fields, schools, tasks: {}, customSchools: [], createdAt: today() };
  store.update((st) => { st.students.push(student); st.activeId = student.id; });
  store.requestPersistence();
  go('today');
}

function saveCustomSchool(form, data) {
  const name = String(data.get('name')).trim();
  if (!name) return;
  const id = `c-${store.newId()}`;
  const deadlines = [
    ['open', 'open', 'Application opens'],
    ['early', 'early', 'Early / priority deadline'],
    ['scholarship', 'scholarship', 'Scholarship deadline'],
    ['final', 'final', 'Final deadline'],
    ['housing', 'housing', 'Housing application opens'],
  ].map(([field, kind, label]) => ({ id: field, kind, label, date: data.get(field) || '' })).filter((d) => d.date);
  let url = String(data.get('url') || '').trim();
  if (url && !/^https?:\/\//i.test(url)) url = '';
  withStudent((s) => {
    s.customSchools.push({ id, name, short: name, url, custom: true, recs: true, deadlines, extras: [] });
    s.schools[id] = { status: 'considering', checks: {}, notes: '' };
  });
  toast(`${name} added`);
  go(`school/${id}`);
}

function exportCalendar(data) {
  const st = store.getState();
  const ids = data.getAll('student');
  const students = st.students.filter((s) => ids.includes(s.id));
  if (!students.length) return toast('Pick at least one student');
  const include = { task: data.has('tasks'), deadline: data.has('deadlines'), key: data.has('key') };
  const alerts = data.getAll('alert').map(Number);
  store.update((state) => { state.settings.alerts = alerts; });
  const t = today();
  const events = [];
  const seenKey = new Set();
  for (const s of students) {
    for (const item of agendaFor(s)) {
      if (!include[item.type]) continue;
      if (!data.has('past') && item.date < t) continue;
      // Key dates are the same for siblings in the same class; list them once.
      const prefix = students.length > 1 && item.type !== 'key' ? `${s.name}: ` : '';
      if (item.type === 'key') {
        if (seenKey.has(item.uid + item.date)) continue;
        seenKey.add(item.uid + item.date);
      }
      const notes = [item.detail, item.estimated ? 'Date projected from the published cycle; confirm on the school site.' : '', item.type === 'task' ? 'Check it off in the College Prep app.' : ''].filter(Boolean).join('\n\n');
      events.push({
        uid: `${s.id}-${item.uid}-${item.date}`,
        date: item.date,
        summary: `${prefix}${item.title}`,
        description: notes,
        url: item.url,
        alerts: item.kind === 'open' || item.kind === 'decision' ? false : undefined,
      });
    }
  }
  if (!events.length) return toast('Nothing to add with those choices');
  const ics = buildIcs(events, { alerts, calendarName: 'College Prep' });
  download('college-prep.ics', ics, 'text/calendar');
  toast(`${events.length} dates ready for your calendar`);
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && type === 'text/calendar') {
    // iOS opens calendar files in its "Add All" sheet when navigated to directly.
    location.href = url;
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function importFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (store.getState().students.length && !confirm('Replace everything on this device with the backup?')) return;
      store.importBackup(reader.result);
      toast('Backup restored');
      go('today');
    } catch {
      toast("That file isn't a College Prep backup");
    }
  };
  reader.readAsText(file);
  input.value = '';
}

let toastTimer;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- boot ----------

let quiet = false;
store.subscribe(() => { if (!quiet) render(); });
window.addEventListener('hashchange', render);
// Re-render when the app comes back to the foreground on a new day.
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
