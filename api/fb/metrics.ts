import fetch from "node-fetch";
import * as dotenv from "dotenv";
dotenv.config();

const GRAPH = "https://graph.facebook.com/v21.0";
const PAGE_ID = process.env.FB_PAGE_ID!;
const PAGE_LONG_LIVED_TOKEN = process.env.FB_PAGE_LONG_TOKEN!;

export default async function handler(req: any, res: any) {
  try {
    if (!PAGE_ID || !PAGE_LONG_LIVED_TOKEN) {
      return res.status(500).json({ error: "Missing FB_PAGE_ID or FB_PAGE_LONG_TOKEN" });
    }

    // 1️⃣ Fetch recent posts
    const postsRes = await fetch(
      `${GRAPH}/${PAGE_ID}/posts?fields=id,message,created_time,insights.metric(post_impressions,post_engaged_users)&access_token=${PAGE_LONG_LIVED_TOKEN}`
    ).then(r => r.json());

    const posts = (postsRes?.data || []).map((p: any) => ({
      id: p.id,
      title: p.message?.slice(0, 40) || "Untitled Post",
      views:
        p.insights?.data?.find((m: any) => m.name === "post_impressions")?.values?.[0]?.value || 0,
      engagement:
        p.insights?.data?.find((m: any) => m.name === "post_engaged_users")?.values?.[0]?.value || 0,
      platform: "facebook",
      createdAt: p.created_time,
    }));

    res.status(200).json({ platform: "facebook", posts });
  } catch (err: any) {
    console.error("FB metrics error:", err);
    res.status(500).json({ error: "FB metrics fetch failed", details: err.message });
  }
}
