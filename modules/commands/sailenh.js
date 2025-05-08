const axios = require('axios');
this.config = {
    name: "", // Tên mặc định, có thể đổi
    version: "1.0.0",
    hasPermssion: 0,
    credits: "DC-Nam & GPT",
    description: "Xem video theo chủ đề",
    commandCategory: "Tiện ích",
    usages: "[tên_lệnh_json]",
    cooldowns: 0
};

global.ha = [];

this.stream_url = function (url) {
    return axios({
        url: url,
        responseType: 'stream',
    }).then(res => res.data);
};

this.onLoad = async function () {
    // không cần thay đổi gì ở đây
};

this.run = async function (o) {
    const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res || err), o.event.messageID));

    const t = process.uptime(),
        h = Math.floor(t / (60 * 60)),
        p = Math.floor((t % (60 * 60)) / 60),
        s = Math.floor(t % 60);

    const args = o.args;
    const nameFile = args[0] || "vdtiktok"; // mặc định nếu không nhập

    let filePath = `./../../gojo/datajson/${nameFile}.json`;

    let urls;
    try {
        urls = require(filePath);
    } catch (err) {
        return send(`❌ Không tìm thấy file '${nameFile}.json' trong thư mục datajson.`);
    }

    // Tạo danh sách nếu chưa có
    if (!global[`jgfds_${nameFile}`]) {
        global[`jgfds_${nameFile}`] = setInterval(() => {
            if (global.ha.length > 50) return;
            Promise.all([...Array(30)].map(() => this.upload(urls[Math.floor(Math.random() * urls.length)], o)))
                .then(res => global.ha.push(...res));
        }, 1000 * 30);
    }

    if (global.ha.length < 1) {
        const id = o.event.senderID;
        o.api.shareContact(
`┏━━━━━━━━━━━━━━━━━
┃ ⚠️ 𝗧𝗛𝗜𝗘̂́𝗨 𝗩𝗜𝗗𝗘𝗢
┃━━━━━━━━━━━━━━━━━
┃ ⏱️ Uptime: ${h}h ${p}m ${s}s
┃ ❗ Vui lòng thử lại sau vài giây
┗━━━━━━━━━━━━━━━━━`,
            id,
            o.event.threadID
        );
    } else {
        send({
            body:
`┏━━━━━━━━━━━━━━━━━
┃  📹 𝗕𝗼𝘁 𝗩𝗶𝗱𝗲𝗼: ${nameFile}
┃━━━━━━━━━━━━━━━━━
┃ ⏱️ Uptime: ${h}h ${p}m ${s}s
┃ 🎞️ Video khả dụng: ${global.ha.length}
┃ 
┃ ➤ Gửi lệnh để nhận video mới
┗━━━━━━━━━━━━━━━━━`,
            attachment: global.ha.splice(0, 1),
        });
    }
};

this.upload = async function (url, o) {
    const form = {
        upload_1024: await this.stream_url(url),
    };
    return o.api.postFormData('https://upload.facebook.com/ajax/mercury/upload.php', form)
        .then(res => Object.entries(JSON.parse(res.body.replace('for (;;);', '')).payload?.metadata?.[0] || {})[0]);
};