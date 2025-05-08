const schedule = require('node-schedule');

const adminUID = ['100080280230629']; // Thay UID admin thật vào đây, nếu có nhiều admin thì thêm vào mảng

// Danh sách lời chúc
const loiChucAdmin = {
    sang: [
        "Chào buổi sáng nha admin yêu dấu, chúc ngày mới thật nhiều niềm vui!",
        "Admin ơi, dậy chưa nè? Chúc admin ngày mới rực rỡ nha!",
        "Chúc admin buổi sáng tươi tắn, gặp nhiều may mắn nhé!"
    ],
    trua: [
        "Trưa rồi, nghỉ ngơi chút nha admin ơi!",
        "Admin ơi ăn trưa ngon miệng nha, chiều làm việc vui vẻ!",
        "Chúc admin buổi trưa vui vẻ, nghỉ ngơi thư giãn nè!"
    ],
    toi: [
        "Buổi tối an lành nha admin yêu!",
        "Tối rồi, nghỉ ngơi thư giãn đi admin ơi!",
        "Chúc admin buổi tối vui vẻ và ấm áp bên những người thân yêu nha!"
    ]
};

const loiChucBox = {
    sang: [
        "Chào buổi sáng cả nhà nha, chúc mọi người ngày mới tràn đầy năng lượng!",
        "Sáng rồi cả nhà ơi, chúc mọi người một ngày vui vẻ!",
        "Cả nhà dậy chưa nè? Chúc cả nhà buổi sáng rực rỡ nha!"
    ],
    trua: [
        "Trưa rồi, chúc cả nhà nghỉ ngơi thư giãn và ăn trưa ngon miệng nha!",
        "Chúc cả nhà buổi trưa vui vẻ và mát mẻ nha!",
        "Trưa nắng nhớ uống nước đầy đủ nha cả nhà!"
    ],
    toi: [
        "Chúc cả nhà buổi tối an lành và nhiều niềm vui!",
        "Tối rồi, nghỉ ngơi đi cả nhà ơi, chúc mọi người tối thật ấm áp!",
        "Chúc cả nhà một buổi tối thư giãn, ngủ ngon nha!"
    ]
};

// Hàm gửi lời chúc
function guiLoiChuc(api, loai) {
    // Gửi cho Admin
    adminUID.forEach(uid => {
        const loiChuc = loiChucAdmin[loai][Math.floor(Math.random() * loiChucAdmin[loai].length)];
        api.sendMessage(loiChuc, uid, (err) => {
            if (err) console.error(`Gửi lời chúc admin lỗi: ${err}`);
        });
    });

    // Gửi cho tất cả các group (box)
    api.getThreadList(50, null, ["INBOX"], (err, list) => {
        if (err) return console.error(err);

        list.forEach(thread => {
            if (thread.isGroup) {
                const loiChuc = loiChucBox[loai][Math.floor(Math.random() * loiChucBox[loai].length)];
                api.sendMessage(loiChuc, thread.threadID, (err) => {
                    if (err) console.error(`Gửi lời chúc group lỗi: ${err}`);
                });
            }
        });
    });
}

// Định nghĩa các lịch tự động
function startAutoChuc(api) {
    schedule.scheduleJob('0 7 * * *', () => guiLoiChuc(api, 'sang'));  // 7h sáng
    schedule.scheduleJob('0 11 * * *', () => guiLoiChuc(api, 'trua')); // 11h trưa
    schedule.scheduleJob('0 22 * * *', () => guiLoiChuc(api, 'toi'));  // 22h tối
}

// Export module
module.exports = {
    config: {
        name: "autochuc",
        version: "1.0.0",
        hasPermission: 2,
        credits: "ChatGPT Edit",
        description: "Tự động gửi lời chúc hàng ngày vào các khung giờ cố định",
        commandCategory: "Tiện ích",
        usages: "",
        cooldowns: 5
    },
    onLoad({ api }) {
        startAutoChuc(api);
        console.log("Đã bật autoChuc thành công!");
    },
    run({ event, api }) {
        api.sendMessage("Lệnh này chỉ để tự động, không có gì để chạy đâu!", event.threadID);
    }
};