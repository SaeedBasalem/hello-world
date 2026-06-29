# Momentum — Daily & Weekly Routine

A self-contained personal routine planner to help you build and stick to a daily
and weekly schedule across five life areas: **Self-study, HR/Work, Gym, Spiritual
practice,** and **Free time** (plus a neutral *Personal* category).

It's a single HTML file — no build step, no server, no account. Just open it.

## How to use it

- **Open** `index.html` in any browser (desktop or phone). On your phone you can
  "Add to Home Screen" so it behaves like an app.
- It ships with a **balanced starter routine** that's fully editable — tap the
  ✏️ pencil on any block (or a row in Week view) to change the time, title,
  category, day, or notes, and the **+ Add** buttons to create new blocks.
- **Today** tab: your schedule for today with check-circles to mark things done.
  The ring up top fills as you complete blocks.
- **Week** tab: the whole week at a glance, color-coded by category.
- **Stats** tab: today's %, your 7-day average, current/best streak, a 7-day
  completion chart, and a **weekly balance** bar so you can see how your hours
  are split across the five areas — and rebalance if one is crowding out another.

## Streaks

A day counts toward your streak when you complete **at least 80%** of that day's
blocks. Days with no blocks scheduled (true rest days) don't break the streak.

## Your data

Everything is saved in your browser's local storage on that one device. Use
**Export backup** in the Stats tab to download a JSON file, and **Import backup**
to restore it on another device or browser.

## Customizing the starter routine

The defaults are just a starting point. Edit freely in the app. If you want to
change the built-in defaults themselves, see `defaultSchedule()` near the top of
the `<script>` in `index.html` (day index `0 = Monday … 6 = Sunday`).
