#!/usr/bin/env node
// Generates lib/areas.json (the compact district -> village list the order form
// and the orders API use) from the full source dataset in data/.
// Run: node scripts/build-areas.mjs
// The raw file carries lat/lng, aliases, municipality/CAS names and search
// indexes we don't ship to the browser — stripping them takes 1.3 MB to ~75 KB.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(readFileSync(path.join(root, "data", "lebanon_addresses.json"), "utf8"));

const byName = (a, b) => a.name.localeCompare(b.name, "en");

const areas = {
  source: src.meta?.source ?? "data/lebanon_addresses.json",
  generated: new Date().toISOString().slice(0, 10),
  districts: src.districts.map((d) => ({
    id: d.id,
    name: d.name,
    nameAr: d.nameAr,
    governorate: d.governorate,
    governorateAr: d.governorateAr,
    villages: [...d.villages].sort(byName).map((v) => ({ name: v.name, nameAr: v.nameAr })),
  })),
};

const out = path.join(root, "lib", "areas.json");
writeFileSync(out, JSON.stringify(areas) + "\n");

const villages = areas.districts.reduce((n, d) => n + d.villages.length, 0);
console.log(
  `wrote ${path.relative(root, out)}: ${areas.districts.length} districts, ${villages} villages, ` +
    `${(readFileSync(out).length / 1024).toFixed(1)} KB`
);
