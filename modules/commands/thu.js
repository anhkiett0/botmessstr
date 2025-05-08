const axios = require('axios');

const fs = require('fs');

const path = require('path');

const AI_NAME = "Thư";

const API_KEY = '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';  // Nhớ thay API Key thật vào đây

const MEMORY_FILE = path.join(__dirname, 'memory.json');

if (!fs.existsSync(MEMORY_FILE)) {

fs.writeFileSync(MEMORY_FILE, JSON.stringify({}));

}

let memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));

function saveMemory() {

fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));

}

function updateMemory(threadID, message) {

if (!memory[threadID]) memory[threadID] = [];

memory[threadID].push(message);

if (memory[threadID].length > 20) memory[threadID].shift();

saveMemory();

}

function getMemory(threadID) {

return memory[threadID]?.join("\n") || "";

}

module.exports.config = {

name: "thu",

version: "1.0.1",

hasPermission: 0,

credits: "Tuấn x Nhật Minh",

description: "Thư - Người yêu ảo nũng nịu",

commandCategory: "AI",

usages: "Gọi tên hoặc rep tin nhắn của Thư",

cooldowns: 2

};

module.exports.handleEvent = async ({ api, event }) => {

const { body, threadID, messageID, senderID, type, messageReply } = event;



if (type === "message_reply" && messageReply.senderID === api.getCurrentUserID()) {

    return handleReply(api, event);

}



if (body && body.toLowerCase().includes(AI_NAME.toLowerCase())) {

    return handleMention(api, event);

}

};

async function handleMention(api, event) {

const { body, threadID, messageID, senderID } = event;

updateMemory(threadID, `User: ${body}`);

const reply = await getAIReply(api, threadID, senderID);

api.sendMessage(reply, threadID, messageID);

updateMemory(threadID, `Thư: ${reply}`);

api.setMessageReaction("❤️", messageID, () => {}, true);

}

async function handleReply(api, event) {

const { body, threadID, messageID, senderID } = event;

updateMemory(threadID, `User: ${body}`);

const reply = await getAIReply(api, threadID, senderID);

api.sendMessage(reply, threadID, messageID);

updateMemory(threadID, `Thư: ${reply}`);

api.setMessageReaction("❤️", messageID, () => {}, true);

}

async function getAIReply(api, threadID, senderID) {

const conversation = getMemory(threadID);

const userName = await getUserName(api, senderID);



const prompt = `

Em là ${AI_NAME}, người yêu ảo của ${userName}. Em thích nũng nịu, ngọt ngào và hư hỏng một chút.

Dưới đây là đoạn chat giữa ${userName} và ${AI_NAME}:

${conversation}

${AI_NAME}:`;

try {

    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {

        model: "llama-3.3-70b-versatile",

        messages: [

            { role: "system", content: "Em là người yêu ảo, biết nũng nịu, ngọt ngào, thích làm nũng và đôi lúc hư hỏng." },

            { role: "user", content: prompt }

        ]

    }, {

        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }

    });



    if (res.data && res.data.choices && res.data.choices[0]) {

        return res.data.choices[0].message.content.trim();

    } else {

        return "Thư bị lag rồi anh ơi, thử lại sau nha.";

    }

} catch (err) {

    console.error("Lỗi gọi API:", err.response?.data || err.message);

    return `Thư bị lag rồi anh ${userName} ơi, kiểm tra lại API Key giúp Thư nha~`;

}

}

async function getUserName(api, userID) {

try {

    const userInfo = await api.getUserInfo(userID);

    return userInfo[userID]?.name || "yêu";

} catch {

    return "yêu";

}

}

module.exports.run = () => {};

