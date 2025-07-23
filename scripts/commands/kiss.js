module.exports.config = {
  name: "kiss",
  version: "7.3.1",
  permission: 2,
  prefix: true,
  credits: "MR᭄﹅ MAHABUB﹅ メꪜ",
  description: "kiss someone",
  category: "img",
  usages: "[@mention]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;

  const dirMaterial = resolve(__dirname, "cache", "canvas");
  const path = resolve(dirMaterial, "kissv3.png");

  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });

  if (!existsSync(path)) {
    await downloadFile(
      "https://i.postimg.cc/2jgH7jpQ/undefined-Imgur-1.jpg", // 🔁 Replace with working image if needed
      path
    );
  }
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];

  const __root = path.resolve(__dirname, "cache", "canvas");
  const template = await jimp.read(__root + "/kissv3.png");

  const time = Date.now();
  const pathImg = `${__root}/kiss_${one}_${two}_${time}.png`;
  const avatarOne = `${__root}/avt_${one}.png`;
  const avatarTwo = `${__root}/avt_${two}.png`;

  const getAvatarOne = (
    await axios.get(
      `https://graph.facebook.com/${one}/picture?width=512&height=512`,
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, "utf-8"));

  const getAvatarTwo = (
    await axios.get(
      `https://graph.facebook.com/${two}/picture?width=512&height=512`,
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, "utf-8"));

  const circleOne = await jimp.read(await circle(avatarOne));
  const circleTwo = await jimp.read(await circle(avatarTwo));

  template
    .composite(circleOne.resize(350, 350), 200, 300)
    .composite(circleTwo.resize(350, 350), 600, 80);

  const raw = await template.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args, Currencies }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);

  if (!mention[0]) {
    return api.sendMessage(
      `Please tag 1 person to kiss.\n\nUsage:\n${global.config.PREFIX}kiss @tag`,
      threadID,
      messageID
    );
  }

  const one = senderID;
  const two = mention[0];

  // Random values
  const lovePercent = Math.floor(Math.random() * 101) + 101; // 101–201%
  const bonusMultiplier = Math.floor(Math.random() * 10) + 1; // 1–10
  const reward = lovePercent * bonusMultiplier;

  // Add money to sender
  if (Currencies) {
    await Currencies.increaseMoney(senderID, reward);
  }

  try {
    const path = await makeImage({ one, two });
    const msg = `💚 Congrats ❤️\nYour sympathy after being stolen is ${lovePercent}%\n+${reward} $`;

    api.sendMessage(
      { body: msg, attachment: fs.createReadStream(path) },
      threadID,
      () => fs.unlinkSync(path),
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to generate kiss image.", threadID, messageID);
  }
};
