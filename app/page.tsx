import type { Metadata } from "next";
import { HeroPreview } from "@/components/HeroPreview";
import { WorkCvBoardPortal } from "@/components/WorkCvBoardPortal";

export const metadata: Metadata = {
  title: "Asu Singh — Senior Software Engineer",
  description:
    "Backend engineer building high-throughput, reliable production systems and agentic AI.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HeroPreview />
      <WorkCvBoardPortal />
    </>
  );
}
