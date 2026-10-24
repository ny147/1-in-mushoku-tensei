export function Landscape({ alt }: { alt: string }) {
  return (
    <picture className="landscape">
      <source srcSet="/assets/asura-countryside.webp" type="image/webp" />
      <img
        src="/assets/asura-countryside.png"
        alt={alt}
        width={1881}
        height={836}
        decoding="async"
      />
    </picture>
  );
}
