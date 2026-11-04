import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactionState, SceneInput, SceneSession, ClipId } from "./types";
import { sampleSceneFacts, resolveScene } from "./model";
import {
  detectSceneReaction,
  reduceReaction,
  EMPTY_REACTION,
} from "./reactions";

export function useLifeScene({
  life,
  enabled,
  playing,
  motionEnabled,
}: SceneInput): SceneSession {
  const facts = useMemo(() => (life ? sampleSceneFacts(life) : null), [life]);
  const model = useMemo(() => (facts ? resolveScene(facts) : null), [facts]);
  const previous = useRef<typeof facts>(null);
  const previousEnabled = useRef(false);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(
    () => !document.hidden,
  );
  const [reduced, setReduced] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  const [reaction, setReaction] = useState<ReactionState>(EMPTY_REACTION);
  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updateMedia = () => setReduced(media?.matches ?? false);
    media?.addEventListener?.("change", updateMedia);
    return () => {
      document.removeEventListener("visibilitychange", update);
      media?.removeEventListener?.("change", updateMedia);
    };
  }, []);
  useEffect(() => {
    setVisible(true);
  }, [facts?.lifeId]);
  const pending = !!life?.pending;
  const suspended =
    !enabled ||
    !visible ||
    !documentVisible ||
    !motionEnabled ||
    reduced ||
    model?.phase === "ended";
  useEffect(() => {
    const reset =
      !enabled ||
      !previousEnabled.current ||
      previous.current?.lifeId !== facts?.lifeId;
    const candidate =
      enabled && facts && !reset
        ? detectSceneReaction(previous.current, facts)
        : null;
    previous.current = facts;
    previousEnabled.current = enabled;
    setReaction((state) =>
      reduceReaction(state, {
        candidate,
        now: Date.now(),
        pending,
        suspended,
        reset,
      }),
    );
  }, [facts, enabled, pending, suspended]);
  useEffect(() => {
    if (suspended || pending || reaction.expiresAt === null) return;
    const timer = window.setTimeout(
      () =>
        setReaction((state) =>
          reduceReaction(state, {
            candidate: null,
            now: Date.now(),
            pending: false,
            suspended: false,
            reset: false,
          }),
        ),
      Math.max(0, reaction.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [reaction.expiresAt, suspended, pending]);
  const reactionClips: Record<NonNullable<typeof reaction.current>, ClipId> = {
    birth: "birth",
    career: "celebrate",
    rank: "celebrate",
    family: "greet",
    arrival: "arrive",
    ending: "ending",
  };
  const clip: ClipId =
    model?.phase === "ended"
      ? "ending"
      : pending
        ? "idle"
        : reaction.current
          ? reactionClips[reaction.current]
          : playing
            ? (model?.activity ?? "idle")
            : "idle";
  return {
    presentation: model
      ? {
          model,
          clip,
          characterMotion: !suspended,
          ambientMotion: !suspended,
          reaction: reaction.current,
          reducedMotion: reduced,
        }
      : null,
    setVisible,
  };
}
