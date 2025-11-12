import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const GRAPH = "https://graph.facebook.com/v21.0";
const PAGE_LONG_LIVED_TOKEN = process.env.FB_PAGE_LONG_TOKEN!;
const PAGE_ID = process.env.FB_PAGE_ID!; // Add this to your .env later

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!PAGE_ID || !PAGE_LONG_LIVED_TOKEN) {
      return res.status(500).json({ error: "Missing PAGE_ID or FB_PAGE_LONG_TOKEN" });
    }

    // Get page fans (followers)
    const followersRes = await fetch(
      `${GRAPH}/${PAGE_ID}?fields=followers_count&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    // Page insights (reach, impressions, engagement, etc.)
    const metrics = [
      "page_impressions",
      "page_impressions_unique",
      "page_engaged_users"
    ].join(",");

    const since = Math.floor((Date.now() - 30 * 86400000) / 1000);

    const insightsRes = await fetch(
      `${GRAPH}/${PAGE_ID}/insights?metric=${metrics}&period=day&since=${since}&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    // Combine daily metrics into totals
    const totals: Record<string, number> = {};
    (insightsRes?.data || []).forEach((m: any) => {
      totals[m.name] = (m.values || []).reduce((sum: number, v: any) => sum + (v.value || 0), 0);
    });

    res.status(200).json({
      platform: "facebook",
      views: totals.page_impressions || 0,
      reach: totals.page_impressions_unique || 0,
      engagedUsers: totals.page_engaged_users || 0,
      followers: followersRes?.followers_count || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("FB metrics error:", err);
    res.status(500).json({ error: "FB metrics fetch failed", details: err.message });
  }
}
