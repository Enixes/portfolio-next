import type { Metadata } from "next";
import { CreativePortfolio } from "@/components/CreativePortfolio";

export const metadata: Metadata = {
  title: "Asu Singh — Senior Software Engineer",
  description:
    "Backend engineer building high-throughput, reliable production systems and agentic AI.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <CreativePortfolio />;
}
