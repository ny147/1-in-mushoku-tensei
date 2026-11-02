import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useI18n } from "../../i18n/context";
import { sceneDescription, sceneWords } from "../../i18n/life-scene";
import { REGIONS } from "../../game/world";
import { Landscape } from "../Landscape";
import { getSceneLayers } from "./assets";
import type { SceneLayer, ScenePresentation } from "./types";
import "./scene.css";

export function PixelLifeScene({
  presentation,
  onVisibilityChange,
  motionEnabled,
  onMotionChange,
}: {
  presentation: ScenePresentation;
  onVisibilityChange: (visible: boolean) => void;
  motionEnabled: boolean;
  onMotionChange: (enabled: boolean) => void;
}) {
  const { language, t } = useI18n();
  const words = sceneWords[language];
  const { model } = presentation;
  const root = useRef<HTMLElement>(null);
  const reducedDescription = useId();
  const layers = useMemo(() => {
    try {
      return getSceneLayers(model, presentation.clip);
    } catch {
      return [];
    }
  }, [model, presentation.clip]);
  const urls = [...new Set(layers.map((l) => l.asset.url))];
  const signature = urls.join("|");
  const [loaded, setLoaded] = useState("");
  useEffect(() => {
    let disposed = false;
    if (!signature) return;
    const sources = signature.split("|");
    let remaining = sources.length;
    let failed = false;
    const images: HTMLImageElement[] = [];
    for (const url of sources) {
      const image = new Image();
      images.push(image);
      image.onload = () => {
        remaining--;
        if (!disposed && !failed && remaining === 0) setLoaded(signature);
      };
      image.onerror = () => {
        failed = true;
        if (!disposed) setLoaded("");
      };
      image.src = url;
    }
    return () => {
      disposed = true;
      images.forEach((i) => {
        i.onload = null;
        i.onerror = null;
      });
    };
  }, [signature]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const fallback = () => {
      const box = element.getBoundingClientRect();
      onVisibilityChange(
        box.width > 0 &&
          box.height > 0 &&
          box.bottom > 0 &&
          box.top < window.innerHeight,
      );
    };
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver((entries) =>
        onVisibilityChange(entries[0]?.isIntersecting ?? false),
      );
      observer.observe(element);
      return () => observer.disconnect();
    }
    fallback();
    window.addEventListener("resize", fallback);
    window.addEventListener("scroll", fallback, { passive: true });
    return () => {
      window.removeEventListener("resize", fallback);
      window.removeEventListener("scroll", fallback);
    };
  }, [onVisibilityChange, model.lifeId]);
  const ready = !!signature && loaded === signature;
  function style(layer: SceneLayer): CSSProperties {
    const effect = layer.anchor === "effect";
    const hero = layer.anchor === "hero";
    const scale = hero ? 2 : 1;
    const cell = effect ? 128 : 64;
    const moving =
      ready &&
      (hero || effect
        ? presentation.characterMotion
        : presentation.ambientMotion);
    return {
      backgroundImage: `url("${layer.asset.url}")`,
      backgroundSize: `${layer.asset.width * scale}px ${layer.asset.height * scale}px`,
      backgroundPositionY: `${-layer.row * cell * scale}px`,
      width: cell * scale,
      height: cell * scale,
      zIndex: layer.z,
      animationName: moving && layer.frames > 1 ? "pixel-frames" : "none",
      animationDuration: `${layer.durationMs}ms`,
      animationTimingFunction: `steps(${layer.frames})`,
      animationIterationCount: "infinite",
      "--pixel-end": `${-layer.frames * cell * scale}px`,
    } as CSSProperties;
  }
  const ageText =
    model.calendarYear === null
      ? `${t("Scenario year ")}${model.age + 1}`
      : `K${model.calendarYear} · ${t("Age")} ${model.age}`;
  return (
    <section
      className="scene pixel-scene"
      ref={root}
      data-scene-ready={ready}
      data-clip={presentation.clip}
    >
      <div
        className="pixel-world"
        role="img"
        aria-label={sceneDescription(
          { ...model, activity: presentation.clip },
          language,
        )}
      >
        {ready ? (
          layers.map((layer, index) =>
            layer.anchor === "background" ? (
              <div
                key={layer.id}
                className="pixel-backdrop"
                aria-hidden="true"
                style={{ backgroundImage: `url("${layer.asset.url}")` }}
              />
            ) : (
              <div
                key={`${layer.id}-${index}`}
                aria-hidden="true"
                className={`pixel-layer pixel-${layer.anchor} ${layer.anchor === "ambient" ? `pixel-ambient-${layer.row}` : ""}`}
                style={style(layer)}
              />
            ),
          )
        ) : (
          <Landscape alt={words.art} />
        )}
      </div>
      <div className="scene-shade" />
      <div className="scene-top">
        <span>{t(REGIONS[model.region].name)}</span>
        <span>{ageText}</span>
      </div>
      <div className="scene-caption">
        <span>
          {t(
            model.stage === "infant"
              ? "Infancy"
              : model.stage === "child"
                ? "Childhood"
                : model.stage === "teen"
                  ? "Youth"
                  : model.stage === "adult"
                    ? "Adulthood"
                    : "Later years",
          )}
        </span>
        <h2>
          {t(
            model.age < 3
              ? "Everything is new. Except you."
              : model.age < 15
                ? "A whole world to grow into."
                : model.age < 45
                  ? "Make this life your own."
                  : "The things that stay with us.",
          )}
        </h2>
        <p>
          {model.age < 3
            ? t("Small hands. Old memories. Endless possibility.")
            : t(model.careerTitle)}
        </p>
      </div>
      <span className="scene-art-note">{words.art}</span>
      {presentation.reducedMotion && (
        <span className="pixel-motion-note" id={reducedDescription}>
          {words.reduced}
        </span>
      )}
      <button
        className="pixel-motion"
        disabled={presentation.reducedMotion}
        aria-describedby={
          presentation.reducedMotion ? reducedDescription : undefined
        }
        aria-pressed={motionEnabled && !presentation.reducedMotion}
        onClick={() => onMotionChange(!motionEnabled)}
      >
        {words.motion}
        <span aria-hidden="true">
          {motionEnabled && !presentation.reducedMotion ? " ●" : " ○"}
        </span>
      </button>
    </section>
  );
}
