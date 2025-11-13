import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  const redirectUri = process.env.FB_REDIRECT_URI;
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;

  const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

  try {
    const response = await fetch(tokenUrl);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (err) {
    return res.status(500).json({ error: "Failed to exchange code for token" });
  }
}
