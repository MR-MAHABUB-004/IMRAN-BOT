const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "auto",
  version: "0.0.3",
  permission: 0,
  credits: "Nayan & Mahabub Edit",
  description: "Auto video downloader using dynamic API",
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
    const { downloadurlX, title } = response.data;

    if (!downloadurlX) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ Unable to get download link.", event.threadID, event.messageID);
    }

    // ✅ Step 3: Download the video file
    const video = (await axios.get(downloadurlX, {
      responseType: "arraybuffer"
    })).data;

    const filePath = __dirname + "/cache/auto.mp4";
    fs.writeFileSync(filePath, Buffer.from(video, "binary"));

    api.setMessageReaction("✔️", event.messageID, () => {}, true);

    // ✅ Step 4: Send video with title
    api.sendMessage({
      body: `《TITLE》: ${title || "No Title Found"}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, event.messageID);

  } catch (error) {
    console.error("Download error:", error.response?.data || error.message);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Failed to download the video. Please check the link or try again later.", event.threadID, event.messageID);
  }
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage("📥 Send a video link starting with https:// to auto-download.", event.threadID, event.messageID);
};
