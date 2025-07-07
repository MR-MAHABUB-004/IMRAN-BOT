const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "0.0.8",
  permission: 0,
  credits: "MR᭄﹅ MAHABUB﹅ メꪜ ",
  description: "Auto video downloader",
  prefix: true,
  premium: false,
  category: "link",
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

    const jsonRes = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/APIURL.json");
    const baseAPI = jsonRes.data.Alldl;

    const response = await axios.get(`${baseAPI}${encodeURIComponent(content)}`);
    const { hd, sd, title } = response.data;

    if (!hd && !sd) {
      api.setMessageReaction("✖", event.messageID, () => {}, true);
      console.log("✖ 𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝘃𝗶𝗱𝗲𝗼 𝗹𝗶𝗻𝗸𝘀 𝗳𝗼𝘂𝗻𝗱.");
      return;
    }

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

    await fs.ensureDir(path.join(__dirname, "cache"));
    let videoBuffer, qualityUsed = "HD";

    try {
      videoBuffer = (await axios.get(hd, {
        responseType: "arraybuffer",
        timeout: 20000,
        headers
      })).data;
    } catch (hdError) {
      console.warn("⚠ 𝗛𝗗 𝗳𝗮𝗶𝗹𝗱:", hdError.message);
      qualityUsed = "SD";
      try {
        videoBuffer = (await axios.get(sd, {
          responseType: "arraybuffer",
          timeout: 20000,
          headers
        })).data;
      } catch (sdError) {
        console.error("✖ 𝗦𝗗 𝗳𝗮𝗶𝗹𝗱:", sdError.message);
        api.setMessageReaction("✖", event.messageID, () => {}, true);
        return;
      }
    }

    const filePath = path.join(__dirname, "cache", "auto.mp4");
    fs.writeFileSync(filePath, Buffer.from(videoBuffer, "binary"));

    api.setMessageReaction("✔", event.messageID, () => {}, true);

    api.sendMessage({
      body: `《TITLE》: ${title || "No Title Found"}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => {
      fs.unlink(filePath, () => {});
    }, event.messageID);

  } catch (err) {
    api.setMessageReaction("✖", event.messageID, () => {}, true);
    console.error("", err.message || err);
    console.error(err.stack);
  }
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage("", event.threadID, event.messageID);
};
