const axios = require('axios');
const schedule = require('node-schedule');

async function layKetQuaXoSoMB() {
    try {
        const response = await axios.get('https://api.xoso.me/mien-bac'); // API tham khảo, đổi nếu có link khác
        const data = response.data;

        if (!data || !data.lottery) throw new Error("Không lấy được dữ liệu xổ số Miền Bắc!");

        let ketQua = '【📢】Kết quả xổ số Miền Bắc hôm nay:\n\n';

        data.lottery.prizes.forEach(prize => {
            ketQua += `- ${prize.name}: ${prize.number}\n`;
        });

        return ketQua;
    } catch (error) {
        console.error("Lỗi lấy kết quả xổ số MB:", error);
        return "Không lấy được kết quả xổ số Miền Bắc hôm nay.";
    }
}

async function guiKetQuaXoSoMB(api) {
    const ketQua = await layKetQuaXoSoMB();

    api.getThreadList(50, null, ["INBOX"], (err, list) => {
        if (err) return console.error(err);

        list.forEach(thread => {
            if (thread.isGroup) {
                api.sendMessage(ketQua, thread.threadID, (err) => {
                    if (err) console.error(`Gửi KQXS MB lỗi tại nhóm ${thread.threadID}: ${err}`);
                });
            }
        });
    });
}

function startAutoXoSoMB(api) {
    schedule.scheduleJob('30 18 * * *', () => guiKetQuaXoSoMB(api));  // 18h30 mỗi ngày
}

module.exports = {
    config: {
        name: "autoXoSoMB",
        version: "1.0.0",
        hasPermission: 2,
        credits: "Ngtuan",
        description: "Tự động gửi kết quả xổ số Miền Bắc hàng ngày",
        commandCategory: "Tiện ích",
        usages: "",
        cooldowns: 5
    },
    onLoad({ api }) {
        startAutoXoSoMB(api);
        console.log("Đã bật autoXoSoMB thành công!");
    },
    run({ event, api }) {
        api.sendMessage("Lệnh này tự động chạy, không cần gọi thủ công!", event.threadID);
    }
};