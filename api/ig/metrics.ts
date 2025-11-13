import fetch from "node-fetch";
import * as dotenv from "dotenv";
dotenv.config();

const GRAPH = "https://graph.facebook.com/v21.0";
const IG_USER_ID = process.env.IG_USER_ID!;
const TOKEN = process.env.FB_PAGE_LONG_TOKEN!;

export default async function handler(req: any, res: any) {
  try {
    if (!IG_USER_ID || !TOKEN) {
      return res.status(500).json({ error: "Missing IG_USER_ID or TOKEN" });
    }

    // 1️⃣ Fetch latest media (posts)
    const mediaRes = await fetch(
      `${GRAPH}/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,timestamp,insights.metric(impressions,reach,engagement)&access_token=${TOKEN}`
    ).then(r => r.json());

    const posts = (mediaRes?.data || []).map((m: any) => ({
      id: m.id,
      title: m.caption?.slice(0, 40) || "Untitled Post",
      views:
        m.insights?.data?.find((x: any) => x.name === "impressions")?.values?.[0]?.value || 0,
      reach:
        m.insights?.data?.find((x: any) => x.name === "reach")?.values?.[0]?.value || 0,
      engagement:
        m.insights?.data?.find((x: any) => x.name === "engagement")?.values?.[0]?.value || 0,
      platform: "instagram",
      createdAt: m.timestamp,
    }));

    res.status(200).json({ platform: "instagram", posts });
  } catch (err: any) {
    console.error("IG metrics error:", err);
    res.status(500).json({ error: "IG metrics fetch failed", details: err.message });
  }
}
