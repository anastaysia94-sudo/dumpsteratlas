import { createClient } from "jsr:@supabase/supabase-js@2";
import { renderPage } from "./page.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

export const canonical = `${SUPABASE_URL}/functions/v1/dumpster-atlas`;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const allowedEvents = new Set([
  "page_view",
  "category_filter",
  "radius_change",
  "use_location",
  "location_denied",
  "resource_open",
  "directions_click",
  "source_click",
  "search",
  "osm_load",
  "osm_open",
]);

async function track(req: Request) {
  try {
    const body = await req.json();
    const eventName = String(body?.event_name || "").slice(0, 80);
    const sessionId = String(body?.session_id || "").slice(0, 100);
    if (!allowedEvents.has(eventName) || sessionId.length < 8) {
      return Response.json({ ok: false }, { status: 400, headers: cors });
    }

    const meta = body?.meta && typeof body.meta === "object" ? body.meta : {};
    const safeMeta = JSON.stringify(meta).length <= 2000 ? meta : {};
    const resourceId = typeof body?.resource_id === "string" ? body.resource_id.slice(0, 100) : null;

    const { error } = await db.from("sps_analytics_events").insert({
      site: "dumpster-atlas",
      event_name: eventName,
      session_id: sessionId,
      path: new URL(req.url).pathname,
      resource_id: resourceId,
      meta: safeMeta,
    });

    return Response.json({ ok: !error }, { status: error ? 500 : 200, headers: cors });
  } catch {
    return Response.json({ ok: false }, { status: 400, headers: cors });
  }
}

async function resources() {
  const { data, error } = await db
    .from("dumpster_atlas_resources")
    .select("id,name,category,tags,address,city,latitude,longitude,description,access_note,source_url,verified_at")
    .eq("active", true)
    .order("name");

  if (error) {
    return Response.json({ error: "resource_load_failed" }, { status: 500, headers: cors });
  }

  return Response.json(
    { resources: data || [], trust: "dumpster_atlas_verified" },
    { headers: { ...cors, "cache-control": "public, max-age=300" } },
  );
}

function toNumber(value: string | null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function osm(url: URL) {
  let south = toNumber(url.searchParams.get("s"));
  let west = toNumber(url.searchParams.get("w"));
  let north = toNumber(url.searchParams.get("n"));
  let east = toNumber(url.searchParams.get("e"));

  if ([south, west, north, east].some((value) => value === null)) {
    return Response.json({ error: "invalid_bbox" }, { status: 400, headers: cors });
  }

  // Keep the public proxy deliberately bounded to the Bay Area MVP region and a modest viewport.
  south = Math.max(36.8, Math.min(37.8, south!));
  north = Math.max(36.8, Math.min(37.8, north!));
  west = Math.max(-122.5, Math.min(-121.4, west!));
  east = Math.max(-122.5, Math.min(-121.4, east!));

  if (north! <= south! || east! <= west! || north! - south! > 0.45 || east! - west! > 0.55) {
    return Response.json({ error: "bbox_too_large" }, { status: 400, headers: cors });
  }

  const query = `[out:json][timeout:15];(nwr["amenity"="recycling"](${south},${west},${north},${east}););out center tags 120;`;
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "DumpsterAtlas/0.3 public-resource-map",
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(14_000),
      });
      if (!response.ok) continue;

      const json = await response.json();
      const points = (Array.isArray(json?.elements) ? json.elements : [])
        .slice(0, 120)
        .map((item: any) => {
          const latitude = Number(item.lat ?? item.center?.lat);
          const longitude = Number(item.lon ?? item.center?.lon);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

          const tags = item.tags || {};
          const materials = Object.entries(tags)
            .filter(([key, value]) => key.startsWith("recycling:") && value === "yes")
            .map(([key]) => key.replace("recycling:", ""))
            .slice(0, 8);

          return {
            id: `osm-${item.type}-${item.id}`,
            osm_type: item.type,
            osm_id: item.id,
            name: tags.name || tags.operator || "Community recycling point",
            latitude,
            longitude,
            recycling_type: tags.recycling_type || null,
            materials,
            opening_hours: tags.opening_hours || null,
            operator: tags.operator || null,
            source_url: `https://www.openstreetmap.org/${item.type}/${item.id}`,
          };
        })
        .filter(Boolean);

      return Response.json(
        { points, source: "OpenStreetMap via Overpass", trust: "community_unverified" },
        { headers: { ...cors, "cache-control": "public, max-age=180" } },
      );
    } catch {
      // Try the next public Overpass endpoint.
    }
  }

  return Response.json({ error: "osm_unavailable" }, { status: 502, headers: cors });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method === "POST") return track(req);

  const url = new URL(req.url);
  if (url.searchParams.get("api") === "health") {
    return Response.json({ ok: true, app: "dumpster-atlas", version: "0.3.0" }, { headers: cors });
  }
  if (url.searchParams.get("api") === "resources") return resources();
  if (url.searchParams.get("api") === "osm") return osm(url);

  return new Response(renderPage(canonical), {
    headers: {
      ...cors,
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
});
