const https = require('https');

module.exports.config = {
    name: "livescore",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ngtuandz",
    description: "Xem tỷ số bóng đá",
    commandCategory: "Tiện ích",
    usages: "[giải đấu]",
    cooldowns: 5
};

module.exports.run = function({ api, event, args }) {
    const league = args.join(" ") || "Premier League";

    const url = `https://api.sofascore.com/api/v1/sport/football/events/live`;

    https.get(url, (res) => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                const matches = jsonData.events.filter(match => match.tournament.name.toLowerCase().includes(league.toLowerCase()));

                if (matches.length === 0) {
                    api.sendMessage(`Không tìm thấy trận nào của giải: ${league}`, event.threadID);
                    return;
                }

                let reply = `Tỷ số trực tiếp - ${league}\n\n`;

                matches.forEach(match => {
                    const home = match.homeTeam.name;
                    const away = match.awayTeam.name;
                    const score = `${match.homeScore.current} - ${match.awayScore.current}`;
                    reply += `${home} ${score} ${away}\n`;
                });

                api.sendMessage(reply, event.threadID);
            } catch (error) {
                api.sendMessage("Không lấy được dữ liệu, có thể API bị lỗi.", event.threadID);
            }
        });

    }).on('error', (err) => {
        api.sendMessage("Lỗi kết nối API", event.threadID);
    });
};