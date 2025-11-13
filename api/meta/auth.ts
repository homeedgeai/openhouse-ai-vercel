import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const appId = process.env.FB_APP_ID;
  const redirectUri = process.env.FB_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return res.status(400).json({ error: "Missing app ID or redirect URI" });
  }

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    [
      "pages_show_list",
      "pages_read_engagement",
      "pages_read_user_content",
      "instagram_basic",
      "instagram_manage_insights",
    ].join(",")
  );

  return res.redirect(authUrl.toString());
}
