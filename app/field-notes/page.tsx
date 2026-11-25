import type { Metadata } from "next";
import { FieldNotesBoard } from "@/components/FieldNotesBoard";

const title = "Field Notes on Java Cache Performance";
const description = "Asu Singh follows a question from a hackathon through six field notes on Java cache performance. See how Caffeine and Chronicle Map handle repeated reads, updates, and slow requests.";

export const metadata: Metadata = {
  title, description, alternates: { canonical: "/field-notes" },
  openGraph: { type: "website", title, description, url: "/field-notes" },
  twitter: { card: "summary", title, description },
};

export default function FieldNotes() {
  return <main className="tc-archive"><FieldNotesBoard standalone /></main>;
}
