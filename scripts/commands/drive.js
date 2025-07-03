const axios = require("axios");

module.exports.config = {
  name: "drive",
  version: "1.0.3",
  permission: 0,
  credits: "Mahabub",
  description: "Get direct download link from Google Drive using your API",
  prefix: true,
  premium: false,
  category: "utility",
  usages: "drive <google_drive_link>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const inputUrl = args[0];

  if (!inputUrl || !inputUrl.includes("drive.google.com")) {
    return api.sendMessage("❌ Please provide a valid Google Drive URL.", event.threadID);
  }

  const apiURL = `https://glowing-octo-computing-machine-seven.vercel.app/api/upload?url=${encodeURIComponent(inputUrl)}`;

  try {
    const response = await axios.get(apiURL);
    const data = response.data;

    if (!data.success || !data.directLink) {
      return api.sendMessage("❌ Failed to generate direct download link.", event.threadID);
    }

    return api.sendMessage(`🔗 Direct Download Link:\n${data.directLink}`, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Error while fetching the direct link.", event.threadID);
  }
};
