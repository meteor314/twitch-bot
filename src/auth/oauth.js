import express from "express";
import https from "https";
import fs from "fs";
import config from "../config/config.js";

/**
 * Sets up OAuth flow for getting user tokens
 * Note: Use the get-token.js script instead for a simpler experience
 */
export function setupOAuthServer() {
  const app = express();
  const port = 3000;

  // OAuth authorization URL
  app.get("/auth", (req, res) => {
    const authUrl =
      `https://id.twitch.tv/oauth2/authorize?` +
      `client_id=${config.twitch.clientId}` +
      `&redirect_uri=${encodeURIComponent(config.twitch.redirectUri)}` +
      `&response_type=code` +
      `&scope=chat:read chat:edit channel:moderate whispers:read whispers:edit`;

    res.redirect(authUrl);
  });

  // OAuth callback
  app.get("/oauth/twitch/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      res.send(`<h1>Error: ${error}</h1>`);
      return;
    }

    if (!code) {
      res.send("<h1>No authorization code received</h1>");
      return;
    }

    try {
      // Exchange code for token
      const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: config.twitch.clientId,
          client_secret: config.twitch.clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: config.twitch.redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        res.send(`
          <h1>Success! </h1>
          <p>Add this to your .env file:</p>
          <pre>TWITCH_OAUTH_TOKEN=oauth:${tokenData.access_token}</pre>
          <p><strong>Keep this token secret!</strong></p>
          <p>Refresh Token: ${tokenData.refresh_token || "N/A"}</p>
          <p>You can close this window now.</p>
        `);
      } else {
        res.send(
          `<h1>Error getting token</h1><pre>${JSON.stringify(
            tokenData,
            null,
            2
          )}</pre>`
        );
      }
    } catch (error) {
      res.send(`<h1>Error: ${error.message}</h1>`);
    }
  });

  // For production, you'd want to use proper SSL certificates
  // For development, you can use self-signed certificates
  try {
    // Uncomment this if you have SSL certificates
    /*
    const httpsServer = https.createServer({
      key: fs.readFileSync('path/to/private-key.pem'),
      cert: fs.readFileSync('path/to/certificate.pem')
    }, app);
    
    httpsServer.listen(port, () => {
      console.log(`OAuth server running at https://localhost:${port}`);
      console.log(`Visit https://localhost:${port}/auth to authorize`);
    });
    */

    // For testing, you can use HTTP (but Twitch requires HTTPS in production)
    app.listen(port, () => {
      console.log(`⚠️  OAuth server running at http://localhost:${port}`);
      console.log(
        `   Note: Twitch requires HTTPS. Run 'npm run get-token' instead for easier setup`
      );
    });
  } catch (error) {
    console.error("Could not start OAuth server:", error.message);
    console.log('💡 Tip: Run "npm run get-token" to get your OAuth token');
  }
}

export default { setupOAuthServer };
