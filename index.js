require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const XServerClient = require('xserver-client');

// --- 設定チェック ---
const { DISCORD_TOKEN, LOG_CHANNEL_ID, MAIN_CHANNEL_ID, XSERVER_ID, XSERVER_MAIL, XSERVER_PASS, MC_VERSION } = process.env;

if (!DISCORD_TOKEN || !XSERVER_ID) {
    console.error("エラー: .env ファイルが正しく設定されていません。");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, 
    ],
});

const xserver = new XServerClient(XSERVER_ID, MC_VERSION || 'je', true);

// ログ判定用正規表現
const REGEX = {
    JOIN: /\[.*\]: (.*) joined the game/,
    LEFT: /\[.*\]: (.*) left the game/,
    ADVANCEMENT: /\[.*\]: (.*) has made the advancement \[(.*)\]/,
    DEATH: /\[.*\]: (.*) (was slain by|shot by|blown up by|burned to death|drowned|hit the ground too hard|fell from a high place)/,
    CHAT: /\[.*\]: (?:\[Not Secure\] )?<(.*)> (.*)/
};

// マイクラ色変換
function getMcColor(hex) {
    const colors = {
        '#000000': 'black', '#0000aa': 'dark_blue', '#00aa00': 'dark_green', '#00aaaa': 'dark_aqua',
        '#aa0000': 'dark_red', '#aa00aa': 'dark_purple', '#ffaa00': 'gold', '#aaaaaa': 'gray',
        '#555555': 'dark_gray', '#5555ff': 'blue', '#55ff55': 'green', '#55ffff': 'aqua',
        '#ff5555': 'red', '#ff55ff': 'light_purple', '#ffff55': 'yellow', '#ffffff': 'white'
    };
    return colors[hex?.toLowerCase()] || 'aqua';
}

async function main() {
    console.log("Xserver for Game に接続を試行中...");
    try {
        const loggedIn = await xserver.login(XSERVER_MAIL, XSERVER_PASS);
        if (!loggedIn) throw new Error("Xserverへのログインに失敗しました。");
        await xserver.fetchLoginToken();
        console.log("Xserver 接続完了。");
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }

    client.once('ready', async () => {
        console.log(`Discord Bot 起動完了: ${client.user.tag}`);
        let lastLog = await xserver.getLog() || "";
        
        setInterval(async () => {
            const currentLog = await xserver.getLog();
            if (currentLog && currentLog !== lastLog) {
                const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
                const mainChannel = client.channels.cache.get(MAIN_CHANNEL_ID);
                const newLines = currentLog.replace(lastLog, "").trim().split('\n');
                
                for (let line of newLines) {
                    if (!line.trim()) continue;
                    if (logChannel) logChannel.send(`\`${line.slice(0, 1900)}\``).catch(() => {});

                    if (mainChannel) {
                        let embed = new EmbedBuilder();
                        if (REGEX.CHAT.test(line)) {
                            const match = line.match(REGEX.CHAT);
                            mainChannel.send(`**<${match[1]}>** ${match[2]}`);
                        } else if (REGEX.JOIN.test(line)) {
                            embed.setColor(0x00FF00).setDescription(`📥 **${line.match(REGEX.JOIN)[1]}** が参加しました`);
                            mainChannel.send({ embeds: [embed] });
                        } else if (REGEX.LEFT.test(line)) {
                            embed.setColor(0xFF0000).setDescription(`📤 **${line.match(REGEX.LEFT)[1]}** が退出しました`);
                            mainChannel.send({ embeds: [embed] });
                        }
                    }
                }
                lastLog = currentLog;
            }
        }, 2000);
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // コマンド実行 (Logチャンネル)
        if (message.channel.id === LOG_CHANNEL_ID) {
            try {
                await xserver.sendCommand(message.content);
                await message.react('✅');
            } catch (e) {
                await message.react('❌');
            }
            return;
        }

        // チャット同期 (Mainチャンネル)
        if (message.channel.id === MAIN_CHANNEL_ID) {
            const member = message.member;
            const user = member ? member.displayName : message.author.username;
            const msg = message.content;
            let roleName = "Member";
            let mcColor = "aqua";

            if (member && member.roles.highest && member.roles.highest.name !== "@everyone") {
                roleName = member.roles.highest.name;
                mcColor = getMcColor(member.displayHexColor);
            }

            const tellrawCmd = `tellraw @a [` +
                `{"text":"[Discord] ","color":"blue"},` +
                `{"text":"[${roleName}] ","color":"${mcColor}"},` +
                `{"text":"${user}: ","color":"${mcColor}"},` +
                `{"text":" ${msg}","color":"white"}` +
            `]`;

            try { await xserver.sendCommand(tellrawCmd); } catch (e) {}
        }
    });

    client.login(DISCORD_TOKEN);
}

main().catch(console.error);
