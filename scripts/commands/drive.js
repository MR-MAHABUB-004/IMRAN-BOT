const axios = require("axios");

module.exports.config = {
  name: "drive",
  version: "1.0.5",
  permission: 0,
  credits: "Mahabub",
  description: "Get direct download link from replied Google Drive media",
  prefix: true,
  premium: false,
  category: "utility",
  usages: "reply to Google Drive video/image/file",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  // Check if it's a reply
  if (!event.messageReply) {
    return api.sendMessage("❌ Please reply to a Google Drive video/image/file.", event.threadID);
  }

  // Extract link from text or attachment
  const replied = event.messageReply;
  const driveUrl =
    replied.attachments?.[0]?.url || replied.body?.trim();

  if (!driveUrl || !driveUrl.includes("drive.google.com")) {
    return api.sendMessage("❌ Replied message doesn't contain a valid Google Drive link.", event.threadID);
  }

  const apiURL = `https://glowing-octo-computing-machine-seven.vercel.app/api/upload?url=${encodeURIComponent(driveUrl)}`;

  try {
    const res = await axios.get(apiURL);
    const data = res.data;

    if (!data.success || !data.directLink) {
      return api.sendMessage("❌ Failed to generate direct link. Invalid or restricted Drive link.", event.threadID);
    }

    return api.sendMessage(`🔗 Direct Download Link:\n${data.directLink}`, event.threadID, event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Error while contacting the API.", event.threadID);
  }
};
