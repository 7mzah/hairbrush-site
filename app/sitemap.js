import { SITE_URL } from "@/lib/config";

const images = ["/brush-bristles.jpg", "/brush-curve.jpg", "/brush-side.jpg", "/brush-back.jpg"].map((f) => `${SITE_URL}${f}`);

export default function sitemap() {
  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1, images }];
}
