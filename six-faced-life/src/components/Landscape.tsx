import { useI18n } from "../i18n/context";
export function Landscape({ alt }: { alt: string }) {
  const { t } = useI18n();

  return (
    <picture className="landscape">
      <source srcSet="/assets/asura-countryside.webp" type="image/webp" />
      <img
        src="/assets/asura-countryside.png"
        alt={t(alt)}
        width={1881}
        height={836}
        decoding="async"
      />
    </picture>
  );
}
