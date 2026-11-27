# Implementation plan

1. Pin eligibility, both decisions, trust limits, reload, stale actions, defection and chronology with regression tests.
2. Add bounded optional state to expanded politics and reuse the activity gates, manual decision card, chronicle and save validation.
3. Exercise the normal app entry point in English and Thai, verify the full suite and build, and check desktop and phone layouts where available.

## Verification

[Isolated Chrome run](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/45923659644) verified the English desktop and Thai phone-width journeys, reload, dispatch and horizontal fit. The full suite and production build passed in that run.
