import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const GRAPH = "https://graph.facebook.com/v21.0";
const IG_USER_ID = process.env.IG_USER_ID!;
const PAGE_LONG_LIVED_TOKEN = process.env.FB_PAGE_LONG_TOKEN!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!IG_USER_ID || !PAGE_LONG_LIVED_TOKEN) {
      return res.status(500).json({ error: "Missing IG_USER_ID or FB_PAGE_LONG_TOKEN" });
    }

    // Fetch follower count
    const profileRes = await fetch(
      `${GRAPH}/${IG_USER_ID}?fields=followers_count&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    // Fetch daily insights for last 30 days
    const metrics = ["impressions", "reach", "profile_views"].join(",");
    const since = Math.floor((Date.now() - 30 * 86400000) / 1000);

    const insightsRes = await fetch(
      `${GRAPH}/${IG_USER_ID}/insights?metric=${metrics}&period=day&since=${since}&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    // Combine totals
    const totals: Record<string, number> = {};
    (insightsRes?.data || []).forEach((m: any) => {
      totals[m.name] = (m.values || []).reduce((sum: number, v: any) => sum + (v.value || 0), 0);
    });

    res.status(200).json({
      platform: "instagram",
      views: totals.impressions || 0,
      reach: totals.reach || 0,
      profileViews: totals.profile_views || 0,
      followers: profileRes?.followers_count || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("IG metrics error:", err);
    res.status(500).json({ error: "IG metrics fetch failed", details: err.message });
  }
}
