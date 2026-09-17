import { createClient } from "jsr:@supabase/supabase-js@2";
import { renderPage } from "./page.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

export const canonical = `${SUPABASE_URL}/functions/v1/dumpster-atlas`;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type,x-dumpster-atlas-admin",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const allowedEvents = new Set([
  "page_view", "category_filter", "radius_change", "use_location", "location_denied",
  "resource_open", "directions_click", "source_click", "search", "osm_load", "osm_open",
  "favorite_add", "route_add", "route_open", "density_toggle", "crv_calculate",
  "report_submit", "language_change", "install_prompt", "support_filter",
]);
const allowedCategories = new Set(["recycling", "food", "reuse", "electronics", "useful-materials", "community"]);
const allowedAccessTypes = new Set(["public_resource", "public_dropoff", "business_program", "public_event", "other_public"]);

function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { ...cors, ...extra } });
}
function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}
function safeHttps(value: unknown) {
  const raw = clean(value, 1000);
  if (!raw) return null;
  try { const u = new URL(raw); return u.protocol === "https:" ? u.toString() : null; } catch { return null; }
}
function toNumber(value: string | null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function track(req: Request, body?: any) {
  try {
    body = body ?? await req.json();
    const eventName = clean(body?.event_name, 80);
    const sessionId = clean(body?.session_id, 100);
    if (!allowedEvents.has(eventName) || sessionId.length < 8) return json({ ok: false }, 400);
    const meta = body?.meta && typeof body.meta === "object" ? body.meta : {};
    const safeMeta = JSON.stringify(meta).length <= 2000 ? meta : {};
    const resourceId = typeof body?.resource_id === "string" ? clean(body.resource_id, 100) : null;
    const { error } = await db.from("sps_analytics_events").insert({
      site: "dumpster-atlas", event_name: eventName, session_id: sessionId,
      path: new URL(req.url).pathname, resource_id: resourceId, meta: safeMeta,
    });
    return json({ ok: !error }, error ? 500 : 200);
  } catch { return json({ ok: false }, 400); }
}

async function resources() {
  const { data, error } = await db.from("dumpster_atlas_resources")
    .select("id,name,category,tags,address,city,latitude,longitude,description,access_note,source_url,verified_at")
    .eq("active", true).order("name");
  if (error) return json({ error: "resource_load_failed" }, 500);
  return json({ resources: (data || []).map((r: any) => ({ ...r, trust_level: "dumpster_atlas_verified" })), trust: "dumpster_atlas_verified" }, 200, { "cache-control": "public, max-age=300" });
}

async function communityReports() {
  const { data, error } = await db.from("dumpster_atlas_reports")
    .select("id,name,category,tags,address,city,latitude,longitude,description,access_note,source_url,access_type,moderated_at")
    .eq("status", "approved").eq("public_access_confirmed", true).order("moderated_at", { ascending: false }).limit(100);
  if (error) return json({ error: "community_load_failed" }, 500);
  return json({ reports: (data || []).map((r: any) => ({ ...r, trust_level: "moderated_community" })) }, 200, { "cache-control": "public, max-age=180" });
}

async function publicStats() {
  const [{ count: verified }, { count: community }, { count: pending }] = await Promise.all([
    db.from("dumpster_atlas_resources").select("id", { count: "exact", head: true }).eq("active", true),
    db.from("dumpster_atlas_reports").select("id", { count: "exact", head: true }).eq("status", "approved"),
    db.from("dumpster_atlas_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return json({ verified: verified || 0, community_approved: community || 0, pending_review: pending || 0, version: "1.0.0" }, 200, { "cache-control": "public, max-age=60" });
}

async function submitReport(req: Request, body: any) {
  const sessionId = clean(body?.session_id, 100);
  if (sessionId.length < 8) return json({ error: "invalid_session" }, 400);
  if (body?.public_access_confirmed !== true) return json({ error: "public_access_confirmation_required" }, 400);
  const category = clean(body?.category, 40);
  const accessType = clean(body?.access_type, 40) || "public_resource";
  if (!allowedCategories.has(category) || !allowedAccessTypes.has(accessType)) return json({ error: "invalid_category_or_access_type" }, 400);

  const name = clean(body?.name, 140), address = clean(body?.address, 240), city = clean(body?.city, 100) || "San Jose";
  const description = clean(body?.description, 1200), accessNote = clean(body?.access_note, 800);
  if (name.length < 3 || address.length < 5 || description.length < 10) return json({ error: "missing_required_fields" }, 400);
  const latitude = Number(body?.latitude), longitude = Number(body?.longitude);
  const lat = Number.isFinite(latitude) && latitude >= 36.4 && latitude <= 38.4 ? latitude : null;
  const lng = Number.isFinite(longitude) && longitude >= -123.1 && longitude <= -121.0 ? longitude : null;
  const sourceUrl = safeHttps(body?.source_url);
  const tags = Array.isArray(body?.tags) ? body.tags.map((x: unknown) => clean(x, 40).toLowerCase()).filter(Boolean).slice(0, 12) : [];

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db.from("dumpster_atlas_reports").select("id", { count: "exact", head: true }).eq("session_id", sessionId).gte("created_at", since);
  if ((count || 0) >= 5) return json({ error: "rate_limited", message: "Up to five suggestions per hour per browser session." }, 429);

  const { data, error } = await db.from("dumpster_atlas_reports").insert({
    session_id: sessionId, name, category, tags, address, city, latitude: lat, longitude: lng,
    description, access_note: accessNote, source_url: sourceUrl, access_type: accessType, public_access_confirmed: true,
  }).select("id,status,created_at").single();
  if (error) return json({ error: "report_submit_failed" }, 500);
  return json({ ok: true, report: data, message: "Submitted for moderator review. It is not public until approved." }, 201);
}

async function authorizeAdmin(req: Request) {
  const raw = clean(req.headers.get("x-dumpster-atlas-admin"), 200);
  if (raw.length < 20) return null;
  const keyHash = await sha256(raw);
  const { data } = await db.from("dumpster_atlas_admin_keys").select("id,label").eq("key_hash", keyHash).eq("active", true).maybeSingle();
  if (!data) return null;
  await db.from("dumpster_atlas_admin_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data as { id: string; label: string };
}

async function adminQueue(req: Request, url: URL) {
  const admin = await authorizeAdmin(req);
  if (!admin) return json({ error: "unauthorized" }, 401);
  const status = clean(url.searchParams.get("status"), 20) || "pending";
  const valid = new Set(["pending", "approved", "rejected", "all"]);
  if (!valid.has(status)) return json({ error: "invalid_status" }, 400);
  let q = db.from("dumpster_atlas_reports").select("*").order("created_at", { ascending: false }).limit(200);
  if (status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return json({ error: "queue_load_failed" }, 500);
  return json({ ok: true, admin: admin.label, reports: data || [] });
}

async function moderate(req: Request, body: any) {
  const admin = await authorizeAdmin(req);
  if (!admin) return json({ error: "unauthorized" }, 401);
  const id = clean(body?.report_id, 80), status = clean(body?.status, 20), note = clean(body?.moderator_note, 800);
  if (!id || !new Set(["approved", "rejected", "pending"]).has(status)) return json({ error: "invalid_moderation" }, 400);
  const { data, error } = await db.from("dumpster_atlas_reports").update({
    status, moderator_note: note, moderated_at: status === "pending" ? null : new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", id).select("id,status,name").single();
  if (error) return json({ error: "moderation_failed" }, 500);
  const action = status === "pending" ? "reopened" : status;
  await db.from("dumpster_atlas_moderation_log").insert({ report_id: id, action, admin_key_id: admin.id, note });
  return json({ ok: true, report: data });
}

async function osm(url: URL) {
  let south = toNumber(url.searchParams.get("s")), west = toNumber(url.searchParams.get("w"));
  let north = toNumber(url.searchParams.get("n")), east = toNumber(url.searchParams.get("e"));
  if ([south, west, north, east].some((value) => value === null)) return json({ error: "invalid_bbox" }, 400);
  south = Math.max(36.8, Math.min(37.8, south!)); north = Math.max(36.8, Math.min(37.8, north!));
  west = Math.max(-122.5, Math.min(-121.4, west!)); east = Math.max(-122.5, Math.min(-121.4, east!));
  if (north! <= south! || east! <= west! || north! - south! > 0.45 || east! - west! > 0.55) return json({ error: "bbox_too_large" }, 400);
  const query = `[out:json][timeout:15];(nwr["amenity"="recycling"](${south},${west},${north},${east}););out center tags 120;`;
  for (const endpoint of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "DumpsterAtlas/1.0 public-resource-map" }, body: new URLSearchParams({ data: query }), signal: AbortSignal.timeout(14_000) });
      if (!response.ok) continue;
      const payload = await response.json();
      const points = (Array.isArray(payload?.elements) ? payload.elements : []).slice(0, 120).map((item: any) => {
        const latitude = Number(item.lat ?? item.center?.lat), longitude = Number(item.lon ?? item.center?.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        const tags = item.tags || {};
        const materials = Object.entries(tags).filter(([key, value]) => key.startsWith("recycling:") && value === "yes").map(([key]) => key.replace("recycling:", "")).slice(0, 8);
        return { id: `osm-${item.type}-${item.id}`, name: tags.name || tags.operator || "Community recycling point", latitude, longitude, recycling_type: tags.recycling_type || null, materials, opening_hours: tags.opening_hours || null, operator: tags.operator || null, source_url: `https://www.openstreetmap.org/${item.type}/${item.id}`, trust_level: "osm_unverified" };
      }).filter(Boolean);
      return json({ points, source: "OpenStreetMap via Overpass", trust: "community_unverified" }, 200, { "cache-control": "public, max-age=180" });
    } catch { /* try next endpoint */ }
  }
  return json({ error: "osm_unavailable" }, 502);
}

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#08110d"/><path d="M256 62c-91 0-165 72-165 161 0 113 165 227 165 227s165-114 165-227c0-89-74-161-165-161z" fill="#9cf06b"/><circle cx="256" cy="218" r="104" fill="#102016"/><path d="M258 135l38 23-16 26c28 7 50 29 60 56l-43 16c-8-20-24-31-47-32l-12 20-36-22 56-87zm-82 104l31 2-17 26c14 22 36 33 62 32l2 45c-45 2-83-18-106-55l-23 1 51-51zm123 85l-15-27 31 1c13-18 16-40 9-62l43-14c13 41 6 82-20 116l11 20-59-34z" fill="#9cf06b"/></svg>`;
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#08110d"/><circle cx="990" cy="120" r="280" fill="#14261c"/><circle cx="110" cy="610" r="300" fill="#102016"/><g transform="translate(92 115)"><path d="M150 0C67 0 0 66 0 147c0 104 150 208 150 208s150-104 150-208C300 66 233 0 150 0z" fill="#9cf06b"/><circle cx="150" cy="142" r="91" fill="#102016"/><text x="150" y="175" text-anchor="middle" font-size="96" font-family="Arial,sans-serif" fill="#9cf06b">♻</text></g><text x="450" y="230" font-size="78" font-weight="900" font-family="Arial,sans-serif" fill="#edf8f1">DUMPSTER <tspan fill="#9cf06b">ATLAS</tspan></text><text x="450" y="310" font-size="34" font-family="Arial,sans-serif" fill="#b7cbbf">Public recycling, CRV, reuse & support resources</text><text x="450" y="370" font-size="28" font-family="Arial,sans-serif" fill="#ffc45b">Verified sources + clearly labeled community data</text></svg>`;
function asset(url: URL) {
  const a = url.searchParams.get("asset");
  if (a === "icon") return new Response(iconSvg, { headers: { ...cors, "content-type": "image/svg+xml", "cache-control": "public,max-age=86400" } });
  if (a === "og") return new Response(ogSvg, { headers: { ...cors, "content-type": "image/svg+xml", "cache-control": "public,max-age=86400" } });
  if (a === "manifest") return new Response(JSON.stringify({ name: "Dumpster Atlas", short_name: "Dumpster Atlas", description: "Public recycling, CRV, reuse and support resource map.", start_url: canonical, scope: "/functions/v1/dumpster-atlas", display: "standalone", background_color: "#08110d", theme_color: "#9cf06b", icons: [{ src: canonical + "?asset=icon", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }] }), { headers: { ...cors, "content-type": "application/manifest+json", "cache-control": "public,max-age=3600" } });
  if (a === "sw") return new Response(`const CACHE='dumpster-atlas-v1';const HOME='${canonical}';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.add(HOME)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match(HOME))))});`, { headers: { ...cors, "content-type": "application/javascript", "cache-control": "no-cache", "Service-Worker-Allowed": "/functions/v1/dumpster-atlas" } });
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const url = new URL(req.url);
  const assetResponse = asset(url); if (assetResponse) return assetResponse;
  if (req.method === "GET") {
    const api = url.searchParams.get("api");
    if (api === "health") return json({ ok: true, app: "dumpster-atlas", version: "1.0.0", release: "complete-recoverable-requirements" });
    if (api === "resources") return resources();
    if (api === "community") return communityReports();
    if (api === "stats") return publicStats();
    if (api === "osm") return osm(url);
    if (api === "admin") return adminQueue(req, url);
    return new Response(renderPage(canonical), { headers: { ...cors, "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" } });
  }
  if (req.method === "POST") {
    let body: any; try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
    const action = clean(body?.action, 50);
    if (action === "submit_report") return submitReport(req, body);
    if (action === "moderate_report") return moderate(req, body);
    return track(req, body);
  }
  return json({ error: "method_not_allowed" }, 405);
});
