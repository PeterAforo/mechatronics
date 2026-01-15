import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

const sizes = {
  sm: { full: { width: 120, height: 28 }, icon: { width: 24, height: 24 } },
  md: { full: { width: 160, height: 38 }, icon: { width: 32, height: 32 } },
  lg: { full: { width: 200, height: 48 }, icon: { width: 48, height: 48 } },
};

export function Logo({ variant = "full", size = "md", className = "", href }: LogoProps) {
  const dimensions = sizes[size][variant];
  const src = variant === "full" ? "/logo-mono.svg" : "/icon-mono.svg";

  const image = (
    <Image
      src={src}
      alt="Mechatronics"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {image}
      </Link>
    );
  }

  return image;
}

export function LogoIcon({ size = "md", className = "" }: Omit<LogoProps, "variant">) {
  return <Logo variant="icon" size={size} className={className} />;
}

export function LogoFull({ size = "md", className = "", href }: Omit<LogoProps, "variant">) {
  return <Logo variant="full" size={size} className={className} href={href} />;
}
