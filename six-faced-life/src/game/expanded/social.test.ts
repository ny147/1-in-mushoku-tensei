import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { choose } from "../engine";
describe("individual social ties", () => {
  it("creates friends and rivals independently from aggregate bonds and enables actual contact", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 20;
    l.pending = "expanded.family";
    const friend = choose(l, "expanded.family.friend");
    if (friend.ruleset !== "expanded-1") throw Error("expanded");
    expect(friend.expansion.family.friends).toHaveLength(1);
    expect(friend.expansion.family.friends[0].role).toBe("friend");
    expect(friend.expansion.politics.contact).toBe(true);
    friend.pending = "expanded.family";
    const rival = choose(friend, "expanded.family.rival");
    if (rival.ruleset !== "expanded-1") throw Error("expanded");
    expect(rival.expansion.family.friends[1].role).toBe("rival");
  });
});
