import express from "express";
import open from "open";

/**
 * Simple OAuth token generator for Twitch bot
 * Run this script to get your OAuth token
 */

const CLIENT_ID =
  process.env.TWITCH_CLIENT_ID || "0shem0dt8f0smk0hv5ta29gmb6iwjx";
const REDIRECT_URI = "http://localhost:3000/oauth/twitch/callback";
const PORT = 3000;

// Required scopes for chat bot
const SCOPES = [
  "chat:read",
  "chat:edit",
  "channel:moderate",
  "whispers:read",
  "whispers:edit",
];

console.log("\n╔═══════════════════════════════════════════════════╗");
console.log("║                                                   ║");
console.log("║       🔑 Twitch OAuth Token Generator 🔑         ║");
console.log("║                                                   ║");
console.log("╚═══════════════════════════════════════════════════╝\n");

const app = express();

// Landing page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Twitch OAuth Token Generator</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #0e0e10;
          color: #efeff1;
        }
        .container {
          background: #18181b;
          padding: 30px;
          border-radius: 8px;
          border: 1px solid #772ce8;
        }
        h1 { color: #9147ff; margin-top: 0; }
        .btn {
          background: #9147ff;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin: 10px 0;
        }
        .btn:hover { background: #772ce8; }
        .info {
          background: #1f1f23;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          border-left: 4px solid #9147ff;
        }
        code {
          background: #1f1f23;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔑 Generate OAuth Token</h1>
        <p>Click the button below to authorize the bot with your Twitch account.</p>
        
        <div class="info">
          <strong>⚠️ Important:</strong>
          <ul>
            <li>Login with your <strong>BOT account</strong> (twitchBot), not your personal account</li>
            <li>The token will be displayed on the next page</li>
            <li>Copy it to your .env file as <code>TWITCH_OAUTH_TOKEN</code></li>
          </ul>
        </div>

        <a href="/auth" class="btn">🚀 Authorize Bot</a>
      </div>
    </body>
    </html>
  `);
});

// Start OAuth flow
app.get("/auth", (req, res) => {
  const authUrl =
    "https://id.twitch.tv/oauth2/authorize?" +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=token` +
    `&scope=${SCOPES.join(" ")}`;

  res.redirect(authUrl);
});

// OAuth callback
app.get("/oauth/twitch/callback", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Token Generated</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #0e0e10;
          color: #efeff1;
        }
        .container {
          background: #18181b;
          padding: 30px;
          border-radius: 8px;
          border: 1px solid #00ff00;
        }
        h1 { color: #00ff00; margin-top: 0; }
        .token-box {
          background: #1f1f23;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          border: 2px solid #9147ff;
        }
        .copy-btn {
          background: #00ff00;
          color: #0e0e10;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }
        .copy-btn:hover { background: #00cc00; }
        .warning {
          background: #ff4444;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          color: white;
        }
        .success {
          background: #00ff00;
          color: #0e0e10;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
          font-weight: bold;
        }
        code {
          background: #1f1f23;
          padding: 2px 6px;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Success! Token Generated</h1>
        
        <div id="tokenContainer" style="display: none;">
          <p>Your OAuth token:</p>
          <div class="token-box">
            <div id="tokenDisplay"></div>
          </div>
          <button class="copy-btn" onclick="copyToken()">📋 Copy Token</button>
          <div id="copySuccess" class="success" style="display: none;">✅ Copied to clipboard!</div>
          
          <div style="margin-top: 30px;">
            <h3>Next Steps:</h3>
            <ol>
              <li>Open your <code>.env</code> file</li>
              <li>Add this line: <code>TWITCH_OAUTH_TOKEN=oauth:YOUR_TOKEN</code></li>
              <li>Replace YOUR_TOKEN with the token above</li>
              <li>Save the file and run <code>npm start</code></li>
            </ol>
          </div>
        </div>

        <div class="warning">
          <strong>🔒 Security Warning:</strong>
          <ul>
            <li>NEVER share this token with anyone</li>
            <li>NEVER commit it to Git</li>
            <li>Keep it in your .env file only</li>
            <li>If exposed, revoke it immediately at <a href="https://www.twitch.tv/settings/connections" style="color: white;">Twitch Settings</a></li>
          </ul>
        </div>

        <p>You can close this window after copying the token.</p>
      </div>

      <script>
        // Extract token from URL fragment
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
          document.getElementById('tokenContainer').style.display = 'block';
          document.getElementById('tokenDisplay').textContent = 'oauth:' + token;
        } else {
          document.getElementById('tokenContainer').innerHTML = '<div class="warning">❌ No token found. Please try again.</div>';
          document.getElementById('tokenContainer').style.display = 'block';
        }

        function copyToken() {
          const tokenText = document.getElementById('tokenDisplay').textContent;
          navigator.clipboard.writeText(tokenText).then(() => {
            document.getElementById('copySuccess').style.display = 'block';
            setTimeout(() => {
              document.getElementById('copySuccess').style.display = 'none';
            }, 3000);
          });
        }
      </script>
    </body>
    </html>
  `);
});

// Start server
const server = app.listen(PORT, () => {
  console.log("✅ Server started on http://localhost:" + PORT);
  console.log("\n📝 Instructions:");
  console.log("1. Your browser should open automatically");
  console.log('2. Click "Authorize Bot"');
  console.log("3. Login with your BOT account (twitchBot)");
  console.log("4. Copy the generated token");
  console.log("5. Add it to your .env file");
  console.log("\n⚠️  If browser doesn't open, visit: http://localhost:" + PORT);
  console.log(
    "\n💡 Press Ctrl+C to stop this server after getting your token\n",
  );

  // Auto-open browser
  setTimeout(() => {
    open("http://localhost:" + PORT).catch(() => {
      console.log(
        "⚠️  Could not open browser automatically. Please visit: http://localhost:" +
          PORT,
      );
    });
  }, 1000);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down token generator...");
  server.close(() => {
    console.log("✅ Server stopped");
    process.exit(0);
  });
});
