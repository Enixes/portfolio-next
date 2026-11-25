import type { Metadata } from "next";
import { FieldNotesBoard } from "@/components/FieldNotesBoard";

const title = "Field Notes on Java Cache Performance";
const description = "Asu Singh’s TailCache notebook follows a shared-cache prototype through benchmarks of Caffeine and Chronicle Map, JVM heap pressure, write locality, and p99.9 latency.";

export const metadata: Metadata = {
  title, description, alternates: { canonical: "/field-notes" },
  openGraph: { type: "website", title, description, url: "/field-notes" },
  twitter: { card: "summary", title, description },
};

export default function FieldNotes() {
  return <main className="tc-archive"><FieldNotesBoard standalone /></main>;
}
