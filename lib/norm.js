// Lowercase, drop accents and Arabic diacritics/punctuation, then collapse
// doubled vowels so the query "amchit" matches "Aamchit" (the dataset's own
// search notes call for this). Both sides of every comparison pass through
// this, so "zahle", "Zahlé" and "زحلة" all behave the same way.
export const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/([aeiou])\1+/g, "$1")
    .trim();

// How many edits we tolerate for closest-spelling suggestions, by query
// length: one typo for short names, two, then three for long ones. Tight on
// purpose — "Amtchit" should reach "Aamchit", gibberish should reach nothing.
export const maxDist = (len) => (len <= 4 ? 1 : len <= 8 ? 2 : 3);

// Optimal string alignment distance (insert/delete/substitute/transpose)
// with a cutoff: returns the real distance, or max + 1 when it is already
// hopeless. The row-minimum early exit keeps the 2,713-village scan cheap.
export const osaDistance = (a, b, max = 2) => {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1; // length alone already exceeds the budget
  if (la === 0) return lb;
  if (lb === 0) return la;
  let prev2 = null, prev = Array.from({ length: lb + 1 }, (_, j) => j);
  for (let i = 1; i <= la; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, prev2[j - 2] + 1); // swapped letters: "Batruon" for "Batroun"
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1; // every path must cross this row, so it cannot recover
    prev2 = prev;
    prev = cur;
  }
  return Math.min(prev[lb], max + 1);
};
