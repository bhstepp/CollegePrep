# College Prep

A private college-application planner for DFW families, built from the
[College Prep Playbook for DFW Families](https://claude.ai/artifact/8CY2SDDJYum476qGjSfLak).

Each family gets:

- **A personal plan.** A dated checklist from sophomore year through decision day, based on the student's graduating class.
- **School tracking.** Deadlines, status, and an application checklist for UT Austin, Texas A&M, Texas Tech, Baylor, TCU, OU and Oklahoma State, plus any school they add themselves.
- **Admission notes.** Auto-admit range by class rank, and warnings for capped majors (engineering, CS, business, nursing).
- **Phone reminders.** "Add to my calendar" exports every date as a calendar file with alerts a week and a day ahead.
- **Privacy.** All data stays in the browser on the family's own device (localStorage). Backup and restore move it between devices.

## How it runs

Plain HTML, CSS and JavaScript modules: no build step, no server, no accounts.
GitHub Pages serves the repository root. It installs to the home screen as an
app (PWA) and works offline.

**One-time setup:** in the repo's Settings → Pages, set *Source* to
"Deploy from a branch", branch `main`, folder `/ (root)`. The app is then at
`https://bhstepp.github.io/CollegePrep/`.

## Updating dates

All school deadlines, plan tasks and test dates live in [`js/data.js`](js/data.js).
Edit and push; every family picks up the change the next time they open the app.
`VERIFIED_GRAD_YEAR` is the class whose cycle the dates were checked for; other
classes see the same pattern shifted by year and marked "est.".

## Development

```sh
npm test     # unit tests for dates, plan logic and the calendar file
npm start    # serve locally at http://localhost:8080
```
