const fs = require("fs");
const fetch = require("node-fetch");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function getRecentlyPlayed(accessToken) {
  const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();
  return json.items[0];
}

(async () => {
  try {
    const token = await getAccessToken();
    const track = await getRecentlyPlayed(token);

    const song = track.track.name;
    const artist = track.track.artists.map((a) => a.name).join(", ");
    const link = track.track.external_urls.spotify;

    const content = `### 🎵 Recently Played  
[${song} — ${artist}](${link})`;

    fs.writeFileSync("README.md", content);
  } catch (error) {
    console.error("Error updating Spotify track:", error);
  }
})();
