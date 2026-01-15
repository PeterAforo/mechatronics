import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

const sizeConfig = {
  sm: { icon: 24, text: "text-sm" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 48, text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const s = sizeConfig[size];

  const logoIcon = (
    <div 
      className="bg-gray-800 rounded-xl flex items-center justify-center"
      style={{ width: s.icon + 8, height: s.icon + 8, padding: 4 }}
    >
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <rect x="5" y="10" width="4" height="16" rx="1.5" fill="white"/>
        <rect x="11" y="6" width="4" height="20" rx="1.5" fill="white"/>
        <rect x="17" y="8" width="4" height="18" rx="1.5" fill="white"/>
        <circle cx="7" cy="7" r="2" fill="white"/>
        <circle cx="13" cy="3" r="2" fill="white"/>
        <circle cx="19" cy="5" r="2" fill="white"/>
        <path d="M7 7 L13 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M13 3 L19 5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
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
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="6" fill="#1f2937"/>
      <rect x="5" y="10" width="4" height="16" rx="1.5" fill="white"/>
      <rect x="11" y="6" width="4" height="20" rx="1.5" fill="white"/>
      <rect x="17" y="8" width="4" height="18" rx="1.5" fill="white"/>
      <circle cx="7" cy="7" r="2" fill="white"/>
      <circle cx="13" cy="3" r="2" fill="white"/>
      <circle cx="19" cy="5" r="2" fill="white"/>
      <path d="M7 7 L13 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M13 3 L19 5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
