export default {
  serverExternalPackages: ["@libsql/client"],
  // Bound Turbopack to this directory. Without it, Next walks up looking for the
  // workspace root and trips over a stray package-lock.json in ~/. This project
  // is its own git root and owns its node_modules, so nothing outside it should
  // be scanned. Explicit root also skips the detection pass on every build.
  turbopack: { root: import.meta.dirname },
};
