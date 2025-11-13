import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  const clientId = process.env.FB_APP_ID;
  const clientSecret = process.env.FB_APP_SECRET;
  const redirectUri = req.query.redirect_uri as string;

  if (!code || !clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${clientSecret}&code=${code}`
    );

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error.message });
    }

    const longLived = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longToken = await longLived.json();

    const redirectWithToken = `${redirectUri}?access_token=${longToken.access_token}`;
    return res.redirect(redirectWithToken);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to exchange access token" });
  }
}
