import type { Metadata } from "next";
import { HeroPreview } from "@/components/HeroPreview";
import { WorkCvBoardPortal } from "@/components/WorkCvBoardPortal";
import { ProfileLiveBoardPortal } from "@/components/ProfileLiveBoardPortal";
import { ProfileLiveBoardAnimations } from "@/components/ProfileLiveBoardAnimations";
import { BoardAliveLayer } from "@/components/BoardAliveLayer";
import { BoardTechnicalSketches } from "@/components/BoardTechnicalSketches";
import { BoardZoomBridge } from "@/components/BoardZoomBridge";

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
      <BoardZoomBridge />
      <ProfileLiveBoardAnimations />
      <ProfileLiveBoardPortal />
      <WorkCvBoardPortal />
      <BoardAliveLayer />
      <BoardTechnicalSketches />
    </>
  );
}
