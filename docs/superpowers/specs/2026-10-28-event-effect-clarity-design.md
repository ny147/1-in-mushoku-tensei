# Event consequence clarity

The user approved the event audit recommendation and requested the update.
Players should understand gains, costs, duration, danger and focus changes before
choosing, and see actual changes afterward in English and Thai.

## Approach

Use pure presentation helpers beside existing localization code. Generate
structured gains from canonical choices; add explicit descriptions for expanded
domain actions. Keep existing narrative, qualifications, fees and education
quotes. A compact Effects line supplements each choice; actual result feedback
compares before/after state. Rewriting only prose would leave numeric gains and
outcomes inconsistent; simulating choices to preview would consume randomness or
reveal future outcomes. Neither alternative is used.

Preserve existing UI, IDs, deterministic RNG, saves, pause behavior and hidden
talents. Unassessed learning previews identify base gains without revealing the
talent; assessed previews include its multiplier. Risks distinguish fatal expanded
service/challenges from legacy setbacks; never interpret the challenge's risk
marker of 1 as a 100% fatal chance. Explain menus as opening another decision.
Do not expose latent genetics or invent benefits for narrative-only choices.

## Household aid correction

The audit traced the bug to the child/adult resource split in applyEconomyYear:
only child resources include the active +12 aid allowance. Apply that allowance
once to both age groups while retaining the existing inclusive expiry year,
8-coin fee and two upcoming years of support. Preserve child purse behavior,
adult wages, scholarship/loan accounting and legacy rules.

## Verification

Test previews against real choices and outcomes, caps, fractional talent bonuses,
hidden talents, risk semantics, declines, navigation and EN/TH rendering. Test aid
through purchase, adult/child annual necessities, age 15, expiry and save restore.
Run the full Vitest suite and build. Inspect desktop/mobile, keyboard, reload,
console and overflow on an isolated port. Deliver a task PR against main; the user
merges manually and deployment is outside scope.
