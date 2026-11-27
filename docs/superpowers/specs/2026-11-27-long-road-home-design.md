# The Long Road Home

**Proposed for Weerawich’s review.** Approval covers writing this design. Gameplay implementation requires a separate decision. [Original feature backlog #9](https://github.com/ny147/1-in-mushoku-tensei/issues/9)

## Goal and scope

Give survivors of the K417 Fittoa displacement a personal decision about where to spend the following year. Two short, original scenes appear through Optional activities in the chronicle, in English and Thai, with the existing Short / Full control. Both modes must show the fare, timing, eligibility and consequences needed to choose.

The starting point is the existing calamity. In K417 a life in Asura at the Fittoa locality loses 15 health (clamped), keeps half its silver rounded down, and moves to the displaced locality on the Demon Continent. The existing family simulation resolves the affected relatives and their seeded outcomes. The proposed scenes begin after that resolution. [Calamity and family resolution](../../../six-faced-life/src/game/expanded/history.ts)

## Approaches

Weerawich selected the **optional two-scene arc** for specification. A mandatory sequel would be easier to notice but would interrupt every survivor. A map search and reunion system would require new family movement rules. The optional arc keeps the decision with the player and uses the locations already recorded for relatives. Age eight and the recovery amount are proposed defaults.

## Part 1 — A place to sleep

Once the original calamity decision has cleared, offer the activity to an active expanded life aged eight or older who is still in the Demon Continent’s displaced locality. Require the K417 `calamity` history entry to record **Asura, Fittoa** at the time of exposure, with exposure marked civilian or support. Relief can change exposure to support, so that label alone cannot establish displacement. Birthplace alone also cannot establish it. A child displaced before eight may qualify later while still there. Lives that received only the news are ineligible. [History recording](../../../six-faced-life/src/game/expanded/history.ts) · [Relief and travel choices](../../../six-faced-life/src/game/expanded/events.ts)

A refuge keeper offers a bed for the season. A passage list is open for those who can return to Asura. Present three manual choices:

- **Stay at the refuge.** Free. Remain in the region and unlock a one-time recovery scene next game year. Proposed reward on reading it is up to **+10 health**, capped at 100.
- **Arrange passage to Asura.** Require ordinary travel eligibility, including age 18, permission to enter Asura and enough silver for the current fare. Show the full fare, currently **120 silver** from the Demon Continent, payable only at boarding. Reserve the departure scene for next game year. Keep the refuge available and explain why passage is disabled for a child, someone short of silver, or someone barred from travel. [Activity gates](../../../six-faced-life/src/game/expanded/activities.ts) · [Fare](../../../six-faced-life/src/game/expanded/education.ts) · [Destination restrictions](../../../six-faced-life/src/game/expanded/succession-restrictions.ts)
- **Not now.** Close the scene with no charge, reward or commitment. Allow the player to reopen it while eligible.

## Part 2 — A year later

Use the game year of the player’s **route selection** to determine when the follow-up opens. From the next game year onward it waits in Optional activities until the player has a free decision slot. Watch never chooses a route or resolves the follow-up.

At the refuge, record the actual health gained, including zero if already at full health. At the departure point, recheck the current fare, funds, origin and ordinary travel restrictions. Show the fare again and take payment exactly once on confirmed boarding. Apply the normal Asura move, including arrival in the countryside, the travel period and the migration record. A blocked traveler can wait and retry or cancel without charge. Cancellation closes the committed arc.

If the player moves away independently or dies, close the arc without payment, compensation or relocation. Returning cannot reopen an ended arc. Write the route chosen and its actual resolution into the chronicle. Mention a relative only when the current family record supports the line, including whether that person is alive and where they live. A neutral scene must work when no relative qualifies. Neither route moves relatives or promises a reunion.

## Continuity and acceptance

- Allow one committed arc per life. Persist the chosen route, its due year and terminal resolution. Reopening, reloading, or replaying a stale selection must never repeat a fare or reward. The arc consumes no new random draws.
- Check a displaced Fittoa civilian, a survivor who gave relief, and a news-only relief supporter elsewhere. Check a displaced child turning eight, an underage passenger, insufficient funds, and a travel restriction.
- Verify both completions, including capped recovery, boarding into the Asura countryside, waiting after a fare or eligibility change, cancellation, independent relocation, death and attempted re-entry.
- Reload before and after each commitment. Existing pending and queued decisions take precedence at both stages. Verify both stages remain manual in Watch mode.
- Existing expanded lives may qualify from their surviving history and current locality. Missing evidence leaves the activity unavailable. Preserve legacy lives, completed archives, the save location, faction rules, and the seeded disaster and family outcomes.
- Walk through the chronicle on an English desktop and a Thai phone-width screen. Check Short and Full for readable fare, route, disabled reason and actual outcome. These are acceptance checks for a future implementation.
