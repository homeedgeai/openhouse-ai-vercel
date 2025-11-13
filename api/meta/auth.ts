import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.FB_APP_ID;
  const redirectUri = req.query.redirect_uri || "";
  const scope = [
    "pages_show_list",
    "instagram_basic",
    "pages_read_engagement",
    "pages_read_user_content"
  ].join(",");

  if (!clientId || !redirectUri) {
    return res.status(400).json({ error: "Missing client ID or redirect URI" });
  }

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri as string
  )}&scope=${scope}&response_type=code`;

  return res.redirect(authUrl);
}
