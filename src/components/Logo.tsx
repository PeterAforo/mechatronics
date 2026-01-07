import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, bar: { w: 4, h: [12, 16, 14] }, dot: 2, text: "text-sm" },
    md: { icon: 32, bar: { w: 5, h: [16, 22, 19] }, dot: 2.5, text: "text-lg" },
    lg: { icon: 48, bar: { w: 6, h: [24, 32, 28] }, dot: 3, text: "text-2xl" },
  };

  const s = sizes[size];

  const logoIcon = (
    <div className="flex items-end gap-0.5">
      <div 
        className="rounded-sm bg-[#f74780]" 
        style={{ width: s.bar.w, height: s.bar.h[0] }} 
      />
      <div 
        className="rounded-sm bg-[#3b82f6]" 
        style={{ width: s.bar.w, height: s.bar.h[1] }} 
      />
      <div 
        className="rounded-sm bg-[#10b981]" 
        style={{ width: s.bar.w, height: s.bar.h[2] }} 
      />
    </div>
  );

  const content = (
    <div className="flex items-center gap-2">
      {logoIcon}
      {showText && (
        <span className={`font-bold text-gray-900 ${s.text}`}>
          MECHATRONICS
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  const scale = size / 32;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="6" fill="#1f2937"/>
      <rect x="5" y="13" width="4" height="14" rx="1.5" fill="#f74780"/>
      <rect x="11" y="8" width="4" height="19" rx="1.5" fill="#3b82f6"/>
      <rect x="17" y="10" width="4" height="17" rx="1.5" fill="#10b981"/>
      <circle cx="7" cy="10" r="2" fill="#f74780"/>
      <circle cx="13" cy="5" r="2" fill="#3b82f6"/>
      <circle cx="19" cy="7" r="2" fill="#10b981"/>
      <path d="M7 10 L13 5" stroke="#f74780" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M13 5 L19 7" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="25" cy="16" r="3" fill="none" stroke="#6b7280" strokeWidth="1.5"/>
      <path d="M25 13 L25 11" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M25 21 L25 19" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 16 L20 16" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 16 L28 16" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
