const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "0.0.4",
  permission: 0,
  credits: "Nayan & Mahabub Edit",
  description: "Auto video downloader using dynamic API with HD/SD fallback and CDN view link",
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
    api.setMessageReaction("🔍", event.messageID, () => {}, true);

    // ✅ Step 1: Get base API URL from GitHub JSON
    const jsonRes = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/APIURL.json");
    const baseAPI = jsonRes.data.Alldl;

    // ✅ Step 2: Request to actual download API
    const response = await axios.get(`${baseAPI}${encodeURIComponent(content)}`);
    const { hd, sd, title, platform } = response.data;

    if (!hd && !sd) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ No valid video links (HD or SD) found.", event.threadID, event.messageID);
    }

    // ✅ Step 3: Download the video file (HD first, fallback to SD)
    await fs.ensureDir(path.join(__dirname, "cache"));
    let videoBuffer, qualityUsed = "HD";

    try {
      videoBuffer = (await axios.get(hd, {
        responseType: "arraybuffer",
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      })).data;
    } catch (hdError) {
      console.warn("⚠️ HD download failed:", hdError.message);
      qualityUsed = "SD";
      try {
        videoBuffer = (await axios.get(sd, {
          responseType: "arraybuffer",
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })).data;
      } catch (sdError) {
        console.error("❌ Both downloads failed:", sdError.message);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ Both HD and SD video downloads failed.", event.threadID, event.messageID);
      }
    }

    const filePath = path.join(__dirname, "cache", "auto.mp4");
    fs.writeFileSync(filePath, Buffer.from(videoBuffer, "binary"));

    api.setMessageReaction("✔️", event.messageID, () => {}, true);

    // ✅ Step 4: Decide view type and generate preview/download link
    const isForcedDownload = /capcut|youtube/i.test(platform || '');
    const viewType = isForcedDownload ? "📥 Direct Download Link" : "▶️ View in Browser";
    const previewURL = isForcedDownload ? (hd || sd) : (hd || sd);

    // ✅ Step 5: Send video with info
    api.sendMessage({
      body: `《TITLE》: ${title || "No Title Found"}\n📥 Quality: ${qualityUsed}\n${viewType}: ${previewURL}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => {
      fs.unlink(filePath, () => {});
    }, event.messageID);

  } catch (error) {
    console.error("Download error:", error.response?.data || error.message);
    console.error("Error stack:", error.stack);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Failed to download the video. Please check the link or try again later.", event.threadID, event.messageID);
  }
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage("📥 Send a video link starting with https:// to auto-download.", event.threadID, event.messageID);
};
