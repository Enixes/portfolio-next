import type { MetadataRoute } from "next";
import { notePath, tailCacheSeries } from "@/data/field-notes";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/field-notes", ...tailCacheSeries.map(note => notePath(note.slug))]
    .map(path => ({ url: new URL(path, siteUrl).href }));
}
