// Points each "Open …" link in the guide at the right hospital's site (A and B are separate
// sites). Without JavaScript the links stay on this site.
import { SITE } from "./site-config.js";

for (const link of document.querySelectorAll("a[data-site]")) {
  const base = SITE.hospitals[link.dataset.site]?.url;
  if (!base) continue;
  link.href = new URL(link.dataset.path || "", base).href;
  if (link.dataset.site === SITE.id) link.classList.add("is-here");
}
