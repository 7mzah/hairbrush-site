export default {
  serverExternalPackages: ["@libsql/client"],
  // Gallery photos: let the browser paint the cached copy instantly and
  // re-check with the server in the background. Without this, Next serves
  // public/ files as revalidate-every-time, so the back button shows a white
  // frame while the 304 round-trip happens. Not `immutable` on purpose — the
  // photos aren't content-hashed and will be replaced under the same names.
  async headers() {
    return [
      {
        source: "/:file.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, stale-while-revalidate=86400" }],
      },
    ];
  },
  // Bound Turbopack to this directory. Without it, Next walks up looking for the
  // workspace root and trips over a stray package-lock.json in ~/. This project
  // is its own git root and owns its node_modules, so nothing outside it should
  // be scanned. Explicit root also skips the detection pass on every build.
  turbopack: { root: import.meta.dirname },
};
