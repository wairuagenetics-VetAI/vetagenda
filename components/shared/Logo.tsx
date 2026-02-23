import Image from "next/image";

interface LogoProps {
  src?: string | null;
  alt: string;
  size?: number;
}

// Componente de logo con fallback a las iniciales
export function Logo({ src, alt, size = 40 }: LogoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        style={{ maxHeight: size }}
      />
    );
  }

  // Fallback: iniciales del nombre
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
