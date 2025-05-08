const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

// ========== CẤU HÌNH GAME ========== //
const CONFIG = {
  INITIAL_BALANCE: 50000,
  WIN_RATE: 1.96,
  MIN_BET: 1000,
  MAX_BET: 5000000,
  GAME_STATUS: true,
  ADMIN_IDS: ['100000000000000'] // ID admin của bạn
};

// ========== QUẢN LÝ DỮ LIỆU ========== //
const DATA_PATH = path.join(__dirname, 'taixiu_data.json');

// Hàm khởi tạo dữ liệu
function initData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({
      players: {},
      gameHistory: [],
      systemBalance: 10000000
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

let gameData = initData();

function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(gameData, null, 2));
}

// ========== HÀM TẠO HÌNH ẢNH ========== //
async function createGameImage(dices, result, betInfo, userBalance) {
  const canvas = createCanvas(800, 500);
  const ctx = canvas.getContext('2d');
  
  // Vẽ nền
  const gradient = ctx.createLinearGradient(0, 0, 800, 500);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ logo
  ctx.fillStyle = '#f1c40f';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎲 TÀI XỈU SUNWIN 🎲', canvas.width/2, 50);

  // Vẽ xúc xắc
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(200 + i*150, 100, 100, 100);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(dices[i].toString(), 250 + i*150, 170);
  }

  // Vẽ kết quả
  ctx.fillStyle = result === 'TÀI' ? '#2ecc71' : '#e74c3c';
  ctx.font = 'bold 40px Arial';
  ctx.fillText(`KẾT QUẢ: ${result} (${dices.reduce((a,b) => a+b)})`, canvas.width/2, 280);

  // Vẽ thông tin
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`🎯 LỰA CHỌN: ${betInfo.choice.toUpperCase()}`, 50, 340);
  ctx.fillText(`💰 TIỀN CƯỢC: ${betInfo.amount.toLocaleString()}`, 50, 380);
  ctx.fillText(`💎 SỐ DƯ: ${userBalance.toLocaleString()}`, 50, 420);

  return canvas.toBuffer();
}

// ========== CÁC HÀM CHÍNH ========== //
async function handleBet(api, event, choice, amount) {
  const { threadID, senderID, messageID } = event;

  // Kiểm tra game status
  if (!CONFIG.GAME_STATUS) {
    return api.sendMessage('❌ Game đang bảo trì, vui lòng quay lại sau!', threadID, messageID);
  }

  // Kiểm tra lựa chọn
  if (!['tài', 'xỉu'].includes(choice.toLowerCase())) {
    return api.sendMessage('⚠️ Vui lòng chọn "TÀI" hoặc "XỈU"', threadID, messageID);
  }

  // Kiểm tra số tiền
  if (isNaN(amount) || amount < CONFIG.MIN_BET || amount > CONFIG.MAX_BET) {
    return api.sendMessage(
      `⚠️ Số tiền cược phải từ ${CONFIG.MIN_BET.toLocaleString()} đến ${CONFIG.MAX_BET.toLocaleString()}`,
      threadID,
      messageID
    );
  }

  // Khởi tạo người chơi
  if (!gameData.players[senderID]) {
    gameData.players[senderID] = {
      name: (await api.getUserInfo(senderID))[senderID].name,
      balance: CONFIG.INITIAL_BALANCE,
      win: 0,
      lose: 0
    };
  }

  // Kiểm tra số dư
  if (gameData.players[senderID].balance < amount) {
    return api.sendMessage(
      `❌ Số dư không đủ! Bạn còn ${gameData.players[senderID].balance.toLocaleString()}`,
      threadID,
      messageID
    );
  }

  // Trừ tiền cược
  gameData.players[senderID].balance -= amount;
  saveData();

  // Thông báo cược
  api.sendMessage(
    `🎰 ${gameData.players[senderID].name} đã cược ${choice.toUpperCase()} ${amount.toLocaleString()}\n` +
    `⏳ Đang chờ kết quả...`,
    threadID
  );

  // Tạo kết quả sau 5s
  setTimeout(async () => {
    const dices = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    const total = dices.reduce((a, b) => a + b);
    const result = total >= 11 ? 'TÀI' : 'XỈU';
    const isWin = choice.toLowerCase() === result.toLowerCase();

    // Xử lý thắng/thua
    if (isWin) {
      const winAmount = Math.floor(amount * CONFIG.WIN_RATE);
      gameData.players[senderID].balance += winAmount;
      gameData.players[senderID].win++;
      api.sendMessage(
        `🎉 CHÚC MỪNG! Bạn đã thắng ${winAmount.toLocaleString()}\n` +
        `💰 Số dư mới: ${gameData.players[senderID].balance.toLocaleString()}`,
        threadID
      );
    } else {
      gameData.players[senderID].lose++;
      api.sendMessage(
        `😢 RẤT TIẾC! Bạn đã thua ${amount.toLocaleString()}\n` +
        `💰 Số dư còn: ${gameData.players[senderID].balance.toLocaleString()}`,
        threadID
      );
    }

    // Lưu lịch sử
    gameData.gameHistory.unshift({
      player: senderID,
      choice,
      amount,
      result,
      time: new Date().toISOString()
    });
    
    // Giới hạn lịch sử
    if (gameData.gameHistory.length > 50) {
      gameData.gameHistory.pop();
    }

    // Gửi hình ảnh
    const image = await createGameImage(
      dices,
      result,
      { choice, amount },
      gameData.players[senderID].balance
    );
    
    api.sendMessage({
      attachment: image,
      body: `🎲 KẾT QUẢ: ${dices.join(' + ')} = ${total} (${result})`
    }, threadID);

    saveData();
  }, 5000);
}

// ========== LỆNH ADMIN ========== //
function toggleGame(api, event, status) {
  const { threadID, senderID, messageID } = event;
  
  if (!CONFIG.ADMIN_IDS.includes(senderID)) {
    return api.sendMessage('❌ Bạn không có quyền!', threadID, messageID);
  }

  CONFIG.GAME_STATUS = status;
  api.sendMessage(
    `✅ Game đã được ${status ? 'BẬT' : 'TẮT'}`,
    threadID,
    messageID
  );
}

// ========== XỬ LÝ SỰ KIỆN ========== //
module.exports = {
  config: {
    name: "taixiu",
    version: "2.0",
    hasPermission: 0,
    credits: "D-Jukie",
    description: "Game Tài Xỉu đổi thưởng",
    commandCategory: "Game",
    usages: "[tài/xỉu] [số tiền]",
    cooldowns: 5
  },

  onStart: async function({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    
    // Lệnh kiểm tra số dư
    if (args[0] === 'số dư' || args[0] === 'balance') {
      if (!gameData.players[senderID]) {
        gameData.players[senderID] = {
          balance: CONFIG.INITIAL_BALANCE,
          win: 0,
          lose: 0
        };
        saveData();
      }
      
      return api.sendMessage(
        `💰 SỐ DƯ: ${gameData.players[senderID].balance.toLocaleString()}\n` +
        `🏆 THẮNG: ${gameData.players[senderID].win} lần\n` +
        `😢 THUA: ${gameData.players[senderID].lose} lần`,
        threadID,
        messageID
      );
    }
    
    // Lệnh admin
    if (args[0] === 'on' && CONFIG.ADMIN_IDS.includes(senderID)) {
      return toggleGame(api, event, true);
    }
    
    if (args[0] === 'off' && CONFIG.ADMIN_IDS.includes(senderID)) {
      return toggleGame(api, event, false);
    }
    
    // Xử lý cược
    if (['tài', 'xỉu'].includes(args[0]?.toLowerCase()) && !isNaN(args[1])) {
      return handleBet(api, event, args[0], parseInt(args[1]));
    }
    
    // Hướng dẫn
    api.sendMessage(
      `🎰 GAME TÀI XỈU\n` +
      `👉 Cách chơi: tài/xỉu [số tiền]\n` +
      `📌 Ví dụ: tài 10000 hoặc xỉu 5000\n` +
      `💰 Số dư: ${gameData.players[senderID]?.balance.toLocaleString() || CONFIG.INITIAL_BALANCE.toLocaleString()}\n` +
      `📊 Tỷ lệ thắng: x${CONFIG.WIN_RATE}`,
      threadID,
      messageID
    );
  },

  handleEvent: async function({ api, event }) {
    const { body, threadID, senderID } = event;
    
    // Xử lý tin nhắn không prefix
    const betMatch = body.match(/^(tài|xỉu)\s+(\d+)$/i);
    if (betMatch && CONFIG.GAME_STATUS) {
      return handleBet(api, event, betMatch[1], parseInt(betMatch[2]));
    }
  }
};