module.exports.config = {
  name: "chuc",
  version: "1.2.0",
  hasPermission: 1,
  credit: "staw", 
  description: "Tự động chúc theo giờ với chữ đẹp và icon",
  commandCategory: "Nhóm",
  usages: "[on/off]",
  cooldowns: 5
};

const moment = require("moment-timezone");
const cron = require("node-cron");

async function sendAutoMessage(api, threadID) {
  let thread = global.data.threadData.get(threadID) || {};
  if (typeof thread["chuc"] == "undefined" || thread["chuc"] == false) return;

  let hours = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm");
  let date = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

  let session, messageList, icon;
  
  if (hours >= "06:00" && hours < "12:00") {
    session = "𝐒𝐚́𝐧𝐠";
    icon = "☀️🌸🎉";
    messageList = [
      "𝐂𝐡𝐚̀𝐨 𝐛𝐮𝐨̂̉𝐢 𝐬𝐚́𝐧𝐠! Hôm nay là một ngày mới tràn đầy năng lượng. Chúc bạn gặp nhiều may mắn và thành công! 💪✨",
      "𝐆𝐨𝐨𝐝 𝐦𝐨𝐫𝐧𝐢𝐧𝐠! Hãy bắt đầu ngày mới với một nụ cười rạng rỡ nhé! 😊🌞",
      "𝐒𝐚́𝐧𝐠 𝐫𝐨̂̀𝐢! Chúc bạn một buổi sáng tuyệt vời, nhiều niềm vui và đầy cảm hứng! 💖"
    ];
  } else if (hours >= "12:00" && hours < "18:00") {
    session = "𝐓𝐫𝐮̛𝐚";
    icon = "🌤🍱💛";
    messageList = [
      "𝐂𝐡𝐮́𝐜 𝐛𝐮𝐨̂̉𝐢 𝐭𝐫𝐮̛𝐚 𝐯𝐮𝐢 𝐯𝐞̉! Hãy nghỉ ngơi và nạp lại năng lượng để tiếp tục một buổi chiều tràn đầy hứng khởi! 💪🍀",
      "𝐆𝐢𝐮̛̃𝐚 𝐧𝐠𝐚̀𝐲 𝐭𝐡𝐚̉𝐨 𝐦𝐚́𝐢, đừng quên dành chút thời gian để thư giãn nhé! 💆‍♂️✨",
      "𝐓𝐫𝐮̛𝐚 𝐧𝐚̀𝐲 𝐜𝐡𝐚̆́𝐜 𝐡𝐚̆̉𝐧 𝐬𝐞̃ 𝐭𝐡𝐚̣̂𝐭 𝐭𝐮𝐲𝐞̣̂𝐭 𝐯𝐨̛̀𝐢! Hãy ăn uống ngon miệng và tận hưởng từng khoảnh khắc nha! 😋💛"
    ];
  } else if (hours >= "18:00" && hours < "22:00") {
    session = "𝐓𝐨̂́𝐢";
    icon = "🌙✨🍷";
    messageList = [
      "𝐂𝐡𝐮́𝐜 𝐛𝐮𝐨̂̉𝐢 𝐭𝐨̂́𝐢 𝐚̂́𝐦 𝐚́𝐩! Hy vọng bạn có những giây phút thư giãn bên gia đình và bạn bè. 💖🍀",
      "𝐓𝐨̂́𝐢 𝐫𝐨̂̀𝐢, 𝐧𝐠𝐡𝐢̉ 𝐧𝐠𝐨̛𝐢 𝐧𝐚̀𝐨! Hãy tận hưởng khoảng thời gian yên bình này để nạp lại năng lượng cho ngày mai! 🌙✨",
      "𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐦𝐨̣̂𝐭 𝐛𝐮𝐨̂̉𝐢 𝐭𝐨̂́𝐢 𝐭𝐡𝐨̛𝐢 𝐦𝐚́𝐢, 𝐭𝐫𝐚̀𝐧 𝐧𝐠𝐚̣̂𝐩 𝐲𝐞̂𝐮 𝐭𝐡𝐮̛𝐨̛𝐧𝐠! 🥂🎶"
    ];
  } else {
    session = "𝐊𝐡𝐮𝐲𝐚";
    icon = "🌌💤💙";
    messageList = [
      "𝐂𝐡𝐮́𝐜 𝐧𝐠𝐮̉ 𝐧𝐠𝐨𝐧! Hãy để những giấc mơ đẹp đưa bạn đến một ngày mai đầy hứng khởi! 🌙✨",
      "𝐆𝐨𝐨𝐝 𝐧𝐢𝐠𝐡𝐭! Một ngày dài đã qua, giờ là lúc để thư giãn và nghỉ ngơi. Ngủ ngon nhé! 😴💖",
      "𝐂𝐡𝐨 𝐠𝐢𝐚̂́𝐜 𝐧𝐠𝐮̉ 𝐚̂́𝐦 𝐚́𝐩, 𝐧𝐠𝐨̣𝐭 𝐧𝐠𝐚̀𝐨! Hãy để tâm hồn bạn được thư thái trong những giấc mơ đẹp đêm nay. 🌌💙"
    ];
  }

  let text = `🎀 𝐂𝐡𝐮́𝐜 𝐁𝐮𝐨̂̉𝐢 ${session} ${icon} 🎀\n\n${messageList[Math.floor(Math.random() * messageList.length)]}\n⏰ ${hours} 📅 ${date}`;

  let stickers = [
    "2523892817885618", "2523892964552270", "2523893081218925"
  ];
  let sticker = stickers[Math.floor(Math.random() * stickers.length)];

  api.sendMessage({ body: text }, threadID, () => {
    setTimeout(() => {
      api.sendMessage({ sticker: sticker }, threadID);
    }, 100);
  });
}

module.exports.run = async ({ event, api, Threads }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;

  data["chuc"] = !data["chuc"];
  
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  return api.sendMessage(
    `${data["chuc"] ? "✅ 𝐁𝐨𝐭 𝐂𝐡𝐮́𝐜 𝐭𝐮̛̣ đ𝐨̣̂𝐧𝐠 𝐝𝐚̃ 𝐛𝐚̣̂𝐭!" : "❌ 𝐓𝐚̆́𝐭 𝐜𝐡𝐮̛́𝐜 𝐧𝐚̆𝐧𝐠 𝐜𝐡𝐮́𝐜!"}`,
    threadID,
    messageID
  );
};

// Lên lịch gửi tin nhắn tự động
cron.schedule("0 6,12,18,22 * * *", () => {
  global.data.threadData.forEach((_, threadID) => {
    sendAutoMessage(global.api, threadID);
  });
});
