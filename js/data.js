// Everything the app knows about schools, dates and the plan comes from the
// College Prep Playbook. To change a date for every family, edit it here and
// push: each family gets it the next time they open the app.

// Graduating class whose cycle the published school dates were checked for
// (students entering college in Fall 2027). Other classes get the same
// month/day pattern shifted by year, marked "estimated".
export const VERIFIED_GRAD_YEAR = 2027;

export const GRAD_YEARS = [2027, 2028, 2029, 2030, 2031];

export const MAJORS = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'cs', label: 'Computer science' },
  { id: 'business', label: 'Business' },
  { id: 'nursing', label: 'Nursing' },
  { id: 'other', label: 'Something else' },
  { id: 'undecided', label: 'Undecided' },
];

export const RANKS = [
  { id: 'top5', label: 'Top 5%' },
  { id: 'top10', label: 'Top 6–10%' },
  { id: 'top25', label: 'Top 11–25%' },
  { id: 'below', label: 'Below top 25%' },
  { id: 'unknown', label: "Don't know yet" },
];

export const STATUSES = [
  { id: 'considering', label: 'Considering' },
  { id: 'applying', label: 'Applying' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'admitted', label: 'Admitted' },
  { id: 'waitlisted', label: 'Waitlisted / deferred' },
  { id: 'denied', label: 'Not admitted' },
  { id: 'deposited', label: 'Deposited 🎉' },
  { id: 'dropped', label: 'No longer applying' },
];

// Deadline dates: m/d plus y = years after the senior-fall calendar year
// (0 = fall of senior year, 1 = spring of senior year).
// kind: open | early | final | scholarship | docs | decision
export const SCHOOLS = [
  {
    id: 'ut', name: 'UT Austin', short: 'UT',
    url: 'https://admissions.utexas.edu/apply/frequently-asked-questions/',
    apply: 'ApplyTexas or Common App',
    testing: 'SAT/ACT required',
    autoAdmit: 'ut',
    recs: true,
    tip: 'Admits by major: the first-choice major box is one of the most important decisions on the application.',
    deadlines: [
      { id: 'open', kind: 'open', label: 'Application opens', m: 8, d: 1, y: 0 },
      { id: 'ea', kind: 'early', label: 'Early Action deadline', m: 10, d: 15, y: 0 },
      { id: 'ea-docs', kind: 'docs', label: 'Early Action documents due', m: 10, d: 22, y: 0 },
      { id: 'rd', kind: 'final', label: 'Final deadline', m: 12, d: 1, y: 0 },
      { id: 'rd-docs', kind: 'docs', label: 'Final documents due', m: 12, d: 10, y: 0 },
      { id: 'ea-dec', kind: 'decision', label: 'Early Action decisions or deferrals', m: 1, d: 15, y: 1 },
      { id: 'rd-dec', kind: 'decision', label: 'Regular decisions', m: 2, d: 15, y: 1 },
    ],
    extras: [
      { id: 'resume', label: 'Expanded resume (optional)' },
      { id: 'calc', label: 'Calculus readiness met (Cockrell)', majors: ['engineering'] },
    ],
  },
  {
    id: 'tamu', name: 'Texas A&M', short: 'A&M',
    url: 'https://admissions.tamu.edu/apply/freshman/index.html',
    apply: 'ApplyTexas or Common App',
    testing: 'Test-optional (uses best single test date)',
    autoAdmit: 'top10',
    recs: false,
    tip: 'Rolling decisions, so earlier is better. Engineering admits to General Engineering, then Entry to a Major after year one.',
    deadlines: [
      { id: 'open', kind: 'open', label: 'Application opens', m: 8, d: 1, y: 0 },
      { id: 'rd', kind: 'final', label: 'Final deadline', m: 12, d: 1, y: 0 },
      { id: 'rd-docs', kind: 'docs', label: 'Documents due', m: 12, d: 15, y: 0 },
    ],
    extras: [
      { id: 'ga', label: 'Read up on Entry to a Major and pathway options', majors: ['engineering'] },
    ],
  },
  {
    id: 'ttu', name: 'Texas Tech', short: 'Tech',
    url: 'https://www.depts.ttu.edu/admissions/apply/ImportantDates/',
    apply: 'ApplyTexas or Common App',
    testing: 'Test-optional; merit grid uses GPA + scores',
    autoAdmit: 'top10',
    recs: false,
    tip: 'Decisions start mid-September. Merit aid is guaranteed if admitted by April 1.',
    deadlines: [
      { id: 'open', kind: 'open', label: 'ApplyTexas opens', m: 7, d: 1, y: 0 },
      { id: 'open-ca', kind: 'open', label: 'Common App opens', m: 8, d: 1, y: 0 },
      { id: 'sch', kind: 'scholarship', label: 'Priority scholarship deadline', m: 12, d: 1, y: 0 },
      { id: 'merit', kind: 'scholarship', label: 'Admitted by today = merit guaranteed', m: 4, d: 1, y: 1 },
      { id: 'rd', kind: 'final', label: 'Priority application deadline', m: 5, d: 1, y: 1 },
    ],
    extras: [
      { id: 'grid', label: 'Check the merit scholarship grid' },
    ],
  },
  {
    id: 'baylor', name: 'Baylor', short: 'Baylor',
    url: 'https://catalog.baylor.edu/undergraduate/general-information/admissions/',
    apply: 'goBAYLOR or Common App',
    testing: 'Test-optional; last early-round tests are Oct SAT / Oct ACT',
    recs: true,
    tip: 'Early Decision is binding. Early FAFSA deadline is November 1.',
    deadlines: [
      { id: 'open', kind: 'open', label: 'Application opens', m: 8, d: 1, y: 0 },
      { id: 'early', kind: 'early', label: 'Early Decision / Early Action deadline', m: 11, d: 1, y: 0 },
      { id: 'fafsa', kind: 'scholarship', label: 'Early FAFSA deadline', m: 11, d: 1, y: 0 },
      { id: 'ed-dec', kind: 'decision', label: 'Early Decision results', m: 12, d: 15, y: 0 },
      { id: 'rd', kind: 'final', label: 'Regular deadline (EA results by today)', m: 2, d: 1, y: 1 },
      { id: 'rd-dec', kind: 'decision', label: 'Regular decisions', m: 4, d: 10, y: 1 },
    ],
    extras: [
      { id: 'ed', label: 'Decide: binding Early Decision or Early Action' },
    ],
  },
  {
    id: 'tcu', name: 'TCU', short: 'TCU',
    url: 'https://admissions.tcu.edu/apply/first-year/index.php',
    apply: 'TCU app, Common App, Coalition or ApplyTexas',
    testing: 'Test-optional through fall 2028',
    recs: true,
    tip: "Chancellor's Scholarship candidates should apply by Nov 1. Uses the CSS Profile in addition to the FAFSA.",
    deadlines: [
      { id: 'open', kind: 'open', label: 'Application opens', m: 8, d: 1, y: 0 },
      { id: 'early', kind: 'early', label: "Early Action / ED I deadline (Chancellor's Scholarship)", m: 11, d: 1, y: 0 },
      { id: 'honors', kind: 'scholarship', label: 'Honors application due', m: 11, d: 15, y: 0 },
      { id: 'early-dec', kind: 'decision', label: 'Early decisions', m: 1, d: 1, y: 1 },
      { id: 'rd', kind: 'final', label: 'Regular / ED II deadline', m: 2, d: 1, y: 1 },
    ],
    extras: [
      { id: 'honors', label: 'Honors application' },
      { id: 'css', label: 'CSS Profile' },
    ],
  },
  {
    id: 'ou', name: 'Oklahoma', short: 'OU',
    url: 'https://www.ou.edu/admissions/apply/early-action-admission-deadline',
    apply: 'OU app or Common App',
    testing: 'Test-optional; superscores; scores can be updated until Apr 30',
    recs: false,
    tip: 'Strong merit aid for Texans with good scores. Early Action gets priority for scholarships, honors and housing.',
    deadlines: [
      { id: 'open', kind: 'open', label: 'Application opens', m: 8, d: 1, y: 0 },
      { id: 'early', kind: 'early', label: 'Early Action deadline', m: 11, d: 1, y: 0 },
      { id: 'sch', kind: 'scholarship', label: 'Scholarship deadline', m: 12, d: 15, y: 0 },
      { id: 'rd', kind: 'final', label: 'Final admission deadline', m: 2, d: 1, y: 1 },
      { id: 'scores', kind: 'scholarship', label: 'Last day to update scores for scholarships', m: 4, d: 30, y: 1 },
    ],
    extras: [],
  },
  {
    id: 'osu', name: 'Oklahoma State', short: 'OSU',
    url: 'https://catalog.okstate.edu/about/admissions/',
    apply: 'OSU app or Common App',
    testing: 'Test-optional, but most scholarships need a score',
    recs: false,
    tip: 'Rolling admission. Complete the leadership and involvement resume in the application.',
    deadlines: [
      { id: 'open', kind: 'open', label: 'OSU application opens', m: 7, d: 1, y: 0 },
      { id: 'early', kind: 'scholarship', label: 'Early Opportunity Scholarship deadline', m: 11, d: 1, y: 0 },
      { id: 'sch', kind: 'final', label: 'Priority scholarship deadline', m: 2, d: 1, y: 1 },
    ],
    extras: [
      { id: 'resume', label: 'Leadership & involvement resume' },
    ],
  },
];

export const CHECKLIST = [
  { id: 'account', label: 'Create application account' },
  { id: 'major', label: 'Choose first- and second-choice major' },
  { id: 'essay', label: 'Main essay added' },
  { id: 'short', label: 'School-specific short answers' },
  { id: 'activities', label: 'Activities list / resume' },
  { id: 'tests', label: 'Send test scores (or decide not to)' },
  { id: 'transcript', label: 'Transcript and class rank sent' },
  { id: 'recs', label: 'Recommendations submitted', onlyIfRecs: true },
  { id: 'fee', label: 'Pay fee or get waiver' },
  { id: 'submitted', label: 'Application submitted' },
  { id: 'complete', label: 'Portal shows complete' },
];

// Dates that apply to every student regardless of school list.
export const KEY_DATES = [
  { id: 'fafsa-open', label: 'FAFSA opens', m: 10, d: 1, y: 0, detail: 'File in October even if you expect no need-based aid.' },
  { id: 'internal', label: 'Recommended: every application submitted', m: 10, d: 15, y: 0, detail: 'Clears UT Early Action and every Nov 1 scholarship and early round.' },
  { id: 'tx-aid', label: 'Texas FAFSA/TASFA priority date', m: 1, d: 15, y: 1 },
  { id: 'decision-day', label: 'National decision day: deposit at one school', m: 5, d: 1, y: 1 },
];

export const PHASES = [
  { id: 'sophomore', label: 'Sophomore year', blurb: 'Set up the next two years: courses, activities and rank strategy.' },
  { id: 'junior', label: 'Junior year', blurb: 'The year that decides it. Junior grades and the first official test score.' },
  { id: 'summer', label: 'Summer before senior year', blurb: 'Write everything. Essays done by mid-August.' },
  { id: 'senior', label: 'Senior year', blurb: 'Submit early, then follow through until every portal says complete.' },
];

// Timeline tasks. Due date: m/d with y = years after the graduation year
// (y: -3 is fall of sophomore year, -1 is fall of senior year).
// Optional filters: schools (show if any is on the list), majors.
export const TASKS = [
  // Sophomore
  { id: 's-log', phase: 'sophomore', m: 9, d: 30, y: -3, title: 'Start an activities log', detail: 'Dates, hours, roles, awards, and one sentence on impact. Every application and scholarship asks for these numbers.' },
  { id: 's-counselor', phase: 'sophomore', m: 10, d: 31, y: -3, title: 'Meet the counselor about class rank', detail: 'Ask how rank is calculated, which courses are weighted, and which semester is used for college applications. Get current rank and class size.' },
  { id: 's-activities', phase: 'sophomore', m: 12, d: 15, y: -3, title: 'Narrow activities to 2–3 that will go deep', detail: 'Depth and leadership by senior year beat a long list of clubs.' },
  { id: 's-courses', phase: 'sophomore', m: 2, d: 15, y: -2, title: 'Map junior and senior courses', detail: 'For engineering or CS, target calculus (AP Calc AB/BC or dual-credit Calc I) by senior year, plus physics and chemistry. Check the math sequence actually gets there.' },
  { id: 's-apdc', phase: 'sophomore', m: 2, d: 15, y: -2, title: 'Decide AP vs. dual credit', detail: 'Dual credit (Tarrant County College, Dallas College) is guaranteed credit at Texas publics; AP is better recognized at out-of-state and private schools. Many students mix them.' },
  { id: 's-summer', phase: 'sophomore', m: 2, d: 28, y: -2, title: 'Plan a meaningful summer', detail: 'A job, camp, project or summer program. Competitive summer program applications often close January–March.' },
  { id: 's-psat10', phase: 'sophomore', m: 4, d: 30, y: -2, title: 'Take the PSAT 10 or a practice PSAT', detail: 'Get a baseline before the junior-year PSAT/NMSQT counts.' },
  { id: 's-visits', phase: 'sophomore', m: 5, d: 31, y: -2, title: 'Casually visit one or two campuses', detail: 'A&M, TCU and Baylor are easy day trips from DFW. Helps students react to big vs. small and urban vs. college town.' },

  // Junior
  { id: 'j-schedule', phase: 'junior', m: 9, d: 15, y: -2, title: 'Lock in the hardest schedule the student can handle well', detail: 'A B in AP Physics usually reads better than an A in on-level, but protect rank if UT auto-admit is in reach.' },
  { id: 'j-utcutoff', phase: 'junior', m: 9, d: 30, y: -2, title: "Look up UT's new auto-admit percentage", detail: 'UT announces each new cutoff in the fall to current juniors.', schools: ['ut'] },
  { id: 'j-picktest', phase: 'junior', m: 9, d: 30, y: -2, title: 'Take a free practice SAT and ACT; pick one', detail: 'Pick whichever scores higher.' },
  { id: 'j-psat', phase: 'junior', m: 10, d: 20, y: -2, title: 'Take the PSAT/NMSQT at school', detail: "It's the National Merit qualifier, which can mean full rides at OU and elsewhere for top scorers." },
  { id: 'j-fair', phase: 'junior', m: 10, d: 31, y: -2, title: 'Attend a college fair; join school mailing lists', detail: 'Mailing lists bring visit-day invitations.' },
  { id: 'j-psatresults', phase: 'junior', m: 12, d: 15, y: -2, title: 'Review PSAT results and set a test-prep plan', detail: 'Results are released in December.' },
  { id: 'j-wintervisit', phase: 'junior', m: 1, d: 3, y: -1, title: 'Winter-break campus visits', detail: 'One or two schools on the list.' },
  { id: 'j-prep', phase: 'junior', m: 1, d: 10, y: -1, title: 'Start structured test prep', detail: '6–10 weeks before the first real test. Free: Khan Academy and College Board Bluebook practice tests.' },
  { id: 'j-register', phase: 'junior', m: 2, d: 15, y: -1, title: 'Register for the March SAT or Feb/April ACT', detail: 'SAT registration closes about two weeks before test day; ACT about five weeks.' },
  { id: 'j-list', phase: 'junior', m: 2, d: 28, y: -1, title: 'Draft a first college list of 8–12 schools', detail: 'Mix reach, target and likely.' },
  { id: 'j-seniorcourses', phase: 'junior', m: 2, d: 28, y: -1, title: 'Pick senior-year courses', detail: 'Engineering hopefuls: confirm calculus and physics are on the schedule.' },
  { id: 'j-summerapps', phase: 'junior', m: 3, d: 15, y: -1, title: 'Apply to summer programs', detail: 'Deadlines cluster January–March. UT, A&M and Tech all run engineering camps.' },
  { id: 'j-springvisit', phase: 'junior', m: 3, d: 31, y: -1, title: 'Spring-break campus visits', detail: 'Include an engineering school info session where offered.' },
  { id: 'j-test1', phase: 'junior', m: 4, d: 15, y: -1, title: 'Take the first official SAT/ACT', detail: 'Plan a second sitting in May/June or August.' },
  { id: 'j-recs', phase: 'junior', m: 5, d: 15, y: -1, title: 'Ask two junior-year teachers for recommendations', detail: 'One in the intended field (math/science for engineering). Teachers fill up fast in the fall.' },
  { id: 'j-ap', phase: 'junior', m: 5, d: 15, y: -1, title: 'AP exams', detail: 'Early to mid May.' },
  { id: 'j-finish', phase: 'junior', m: 6, d: 1, y: -1, title: 'Finish junior year strong', detail: 'Junior grades are usually the last grades in the rank used for early applications.' },
  { id: 'j-essayideas', phase: 'junior', m: 6, d: 1, y: -1, title: 'Brainstorm essay topics', detail: 'A specific moment, not a résumé.' },
  { id: 'j-test2', phase: 'junior', m: 6, d: 15, y: -1, title: 'Second test sitting (May/June SAT or June ACT)', detail: 'Only if the first score left room to grow.' },

  // Summer
  { id: 'su-list', phase: 'summer', m: 6, d: 30, y: -1, title: "Finalize the list and each school's first-choice major", detail: 'In Texas, the major you list is often the admission decision.' },
  { id: 'su-essay', phase: 'summer', m: 7, d: 4, y: -1, title: 'First full draft of the main personal essay', detail: 'One strong main essay does most of the work. Get one or two readers, not ten.' },
  { id: 'su-short', phase: 'summer', m: 7, d: 31, y: -1, title: 'Draft school-specific short answers', detail: 'UT and A&M ask why you chose your major. Keep a master doc of every prompt and answer.' },
  { id: 'su-resume', phase: 'summer', m: 7, d: 31, y: -1, title: 'Build the activities list and resume from the log', detail: "OSU asks for a leadership and involvement resume; UT allows an expanded resume." },
  { id: 'su-accounts', phase: 'summer', m: 8, d: 5, y: -1, title: 'Create application accounts and copy in finished essays', detail: 'Common App, ApplyTexas and most school applications open August 1.' },
  { id: 'su-rank', phase: 'summer', m: 8, d: 20, y: -1, title: 'Ask the counselor about official rank and transcripts', detail: 'Confirm how each school receives rank.' },
  { id: 'su-brag', phase: 'summer', m: 8, d: 25, y: -1, title: 'Send recommenders a brag sheet', detail: 'Activities, goals, and the specific colleges and majors, with deadlines.' },
  { id: 'su-sat', phase: 'summer', m: 8, d: 31, y: -1, title: 'Late-August SAT, if a higher score is needed', detail: 'Only if it moves a UT, engineering or scholarship outcome.', optional: true },

  // Senior
  { id: 'se-rolling', phase: 'senior', m: 9, d: 30, y: -1, title: 'Submit Texas Tech and OSU early', detail: 'Rolling admission; Tech decisions start mid-September.', schools: ['ttu', 'osu'] },
  { id: 'se-finaltest', phase: 'senior', m: 10, d: 10, y: -1, title: 'Final SAT (early Oct) or ACT (mid Oct), only if needed', detail: "Baylor's early round accepts these as the last dates.", optional: true },
  { id: 'se-fafsa', phase: 'senior', m: 10, d: 15, y: -1, title: 'File the FAFSA (and CSS Profile if needed)', detail: 'FAFSA opens October 1. Many merit and state programs check it. TCU also uses the CSS Profile.' },
  { id: 'se-submit', phase: 'senior', m: 10, d: 15, y: -1, title: 'Submit every application', detail: 'The recommended internal deadline. Clears UT Early Action and every November 1 early round.' },
  { id: 'se-portals', phase: 'senior', m: 10, d: 31, y: -1, title: 'Check every applicant portal weekly', detail: 'Clear any missing-document flags. Keep doing this until each one says complete.' },
  { id: 'se-honors', phase: 'senior', m: 11, d: 15, y: -1, title: 'Apply to honors programs', detail: 'TCU Honors Nov 15; check UT, A&M, OU and Baylor honors dates.' },
  { id: 'se-local', phase: 'senior', m: 12, d: 15, y: -1, title: 'Start local scholarship applications', detail: "From the counselor's list. Small ones add up." },
  { id: 'se-midyear', phase: 'senior', m: 1, d: 31, y: 0, title: 'Send mid-year grades if requested; keep grades up', detail: 'Admissions can be revoked.' },
  { id: 'se-compare', phase: 'senior', m: 4, d: 15, y: 0, title: 'Compare aid offers on four-year net cost', detail: 'Ask whether merit aid renews and what GPA it requires. Appeal if one school is far apart from another.' },
  { id: 'se-visits', phase: 'senior', m: 4, d: 20, y: 0, title: 'Admitted-student days for the final two or three', detail: '' },
  { id: 'se-deposit', phase: 'senior', m: 5, d: 1, y: 0, title: 'Deposit at one school, decline the others, pay housing deposit', detail: 'National decision day.' },
  { id: 'se-final', phase: 'senior', m: 6, d: 15, y: 0, title: 'Send final transcript and AP scores', detail: 'After graduation.' },
];

// Published SAT/ACT dates the playbook verified (2026–27 school year).
export const TEST_DATES = [
  { test: 'ACT', date: '2027-02-27', register: '2027-01-22' },
  { test: 'SAT', date: '2027-03-06', register: '2027-02-19' },
  { test: 'ACT', date: '2027-04-10', register: '2027-03-05' },
  { test: 'SAT', date: '2027-05-01', register: '2027-04-16' },
  { test: 'SAT', date: '2027-06-05', register: '2027-05-21' },
  { test: 'ACT', date: '2027-06-12', register: '2027-05-07' },
  { test: 'ACT', date: '2027-07-10', register: '2027-06-04' },
];

export const PLAYBOOK_URL = 'https://claude.ai/artifact/8CY2SDDJYum476qGjSfLak';
