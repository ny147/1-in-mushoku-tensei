// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LifeTimeline } from "./LifeView";
import { Ending } from "./Archive";
import { beginLife, createLife } from "../game/engine";

afterEach(cleanup);

describe("completed life presentation", () => {
  it("ends the timeline at the final year instead of promising a future", () => {
    const life = beginLife(createLife({ seed: 32 }));
    life.phase = "ended";
    life.pending = null;
    life.age = 74;
    const { container } = render(<LifeTimeline life={life} />);
    expect(screen.queryByText("The story still ahead")).toBeNull();
    expect(container.querySelectorAll(".year-grid > span")).toHaveLength(75);
    expect(container.querySelector('[title*="Unwritten"]')).toBeNull();
  });

  it("does not claim a failed ending save succeeded", () => {
    const life = beginLife(createLife({ seed: 32 }));
    life.phase = "ended";
    life.ending = { cause: "Old age", legacy: "A full life" };
    render(<Ending life={life} onNew={() => {}} saved={false} />);
    expect(
      screen.queryByText("This life is kept in your past lives."),
    ).toBeNull();
    expect(screen.getByText(/not yet saved/i)).toBeTruthy();
  });
});
