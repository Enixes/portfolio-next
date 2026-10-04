import Image from "next/image";

export function BrandSticker({ brand, className = "" }: { brand: "linkedin" | "github"; className?: string }) {
  const linkedin = brand === "linkedin";
  return <span className={`brand-sticker brand-sticker-${brand} ${className}`} aria-label={linkedin ? "LinkedIn" : "GitHub"}>
    <Image src={linkedin ? "/brands/linkedin-in.png" : "/brands/github-mark.svg"}
      alt={linkedin ? "LinkedIn [in] logo" : "GitHub Invertocat mark"}
      width={linkedin ? 635 : 20} height={linkedin ? 540 : 20} unoptimized />
  </span>;
}
