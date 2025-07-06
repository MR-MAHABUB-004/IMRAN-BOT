const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "0.0.5",
  permission: 0,
  credits: "‎MR᭄﹅ MAHABUB﹅ メꪜ",
  description: "Auto video downloader HD/SD fallback",
  prefix: true,
  premium: false,
  category: "User",
  usages: "",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const content = event.body ? event.body.trim() : '';
  const body = content.toLowerCase();

  if (body.startsWith("auto")) return;
  if (!body.startsWith("https://")) return;

  try {
    api.setMessageReaction("♻", event.messageID, () => {}, true);

    // ✅ Step 1: Get base API URL from GitHub JSON
    const jsonRes = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/APIURL.json");
    const baseAPI = jsonRes.data.Alldl;

    // ✅ Step 2: Request to actual download API
    const response = await axios.get(`${baseAPI}${encodeURIComponent(content)}`);
    const { hd, sd, title, platform } = response.data;

    if (!hd && !sd) {
      api.setMessageReaction("✖", event.messageID, () => {}, true);
      return api.sendMessage("", event.threadID, event.messageID);
    }

    // ✅ Step 3: Set proper headers (especially for Facebook)
    const isFacebook = (hd || sd || "").includes("fbcdn.net");
    const headers = isFacebook
      ? {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Referer": "https://www.facebook.com/"
        }
      : {
          "User-Agent": "Mozilla/5.0"
        };

    // ✅ Step 4: Download the video file (HD first, fallback to SD)
    await fs.ensureDir(path.join(__dirname, "cache"));
    let videoBuffer, qualityUsed = "HD";

    try {
      videoBuffer = (await axios.get(hd, {
        responseType: "arraybuffer",
        timeout: 20000,
        headers
      })).data;
    } catch (hdError) {
      console.warn("⚠️ HD download failed:", hdError.message);
      qualityUsed = "SD";
      try {
        videoBuffer = (await axios.get(sd, {
          responseType: "arraybuffer",
          timeout: 20000,
          headers
        })).data;
      } catch (sdError) {
        console.error("", sdError.message);
        api.setMessageReaction("✖", event.messageID, () => {}, true);
        return api.sendMessage("", event.threadID, event.messageID);
      }
    }

    const filePath = path.join(__dirname, "cache", "auto.mp4");
    fs.writeFileSync(filePath, Buffer.from(videoBuffer, "binary"));

    api.setMessageReaction("✔️", event.messageID, () => {}, true);

    // ✅ Step 5: Generate preview/download link type
    const isForcedDownload = /capcut|youtube/i.test(platform || '');
    const viewType = isForcedDownload ? "📥 Direct Download Link" : "▶️ View in Browser";
    const previewURL = hd || sd;

    // ✅ Step 6: Send video with info
    api.sendMessage({
      body: `《TITLE》: ${title}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => {
      fs.unlink(filePath, () => {});
    }, event.messageID);

  } catch (error) {
    console.error("❌ Download error:", error.response?.data || error.message);
    console.error("🧠 Stack:", error.stack);
    api.setMessageReaction("✖", event.messageID, () => {}, true);
    api.sendMessage("", event.threadID, event.messageID);
  }
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage("send a video link", event.threadID, event.messageID);
};
