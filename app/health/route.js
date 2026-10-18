// Health endpoint. Local dev tooling (IDE port scanners, MCP servers) probes
// /health constantly; this turns those probes from 404 log noise into a 200.
// Same value after deploy: uptime monitors and load balancers get a plain
// signal with no dependency on the database — a Turso blip should not take
// the storefront's health signal down with it.
export async function GET() {
  return Response.json({ ok: true });
}
