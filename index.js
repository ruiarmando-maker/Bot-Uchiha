import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import P from 'pino';
import http from 'http';

// Função principal que inicializa e conecta o bot
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // Tratamento robusto do retorno de fetchLatestBaileysVersion()
    const latest = await fetchLatestBaileysVersion();
    // latest pode ser um array [x,y,z] ou um objeto { version: [x,y,z], ... }
    const version = Array.isArray(latest) ? latest : (latest?.version ?? latest);
    console.log(`Usando a versão do WhatsApp Web: ${Array.isArray(version) ? version.join('.') : JSON.stringify(version)}`);

    const sock = makeWASocket({
        auth: state,
        // Defina printQRInTerminal: true temporariamente se quiser ver o QR diretamente
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        version: Array.isArray(version) ? version : undefined,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('--- Escaneie o QR Code abaixo ---');
            qrcode.generate(qr, { small: true });
            console.log('---------------------------------');
            console.log('Se estiver rodando neste mesmo celular, você precisa outro aparelho para escanear o QR.');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Tentando reconectar:', shouldReconnect);
            if (shouldReconnect) {
                // esperar um pouco antes de reconectar para evitar loop rápido
                setTimeout(() => connectToWhatsApp(), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ Conectado com sucesso ao WhatsApp Web!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || !messages.length) return;
        const m = messages[0];
        if (!m.key) return;
        if (m.key.remoteJid === 'status@broadcast' || m.key.fromMe) return;

        const messageText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const remoteJid = m.key.remoteJid;

        switch (messageText.toLowerCase().trim()) {
            case 'oi':
                await sock.sendMessage(remoteJid, { text: 'Olá! Estou online e processando comandos!' });
                break;
            case '!ping':
                await sock.sendMessage(remoteJid, { text: 'Pong! 🏓' });
                break;
            case '!menu':
                const menuMessage = "MENU-BOT\nEscolha uma categoria abaixo:\n\n!ping - Testar conexão";
                await sock.sendMessage(remoteJid, { text: menuMessage });
                break;
        }
    });
}

// Inicia a conexão do bot
connectToWhatsApp().catch(err => {
    console.error('Erro ao conectar ao WhatsApp:', err);
});

// Pequeno servidor HTTP para ficar escutando a porta (útil no Render)
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Uchiha Bot está rodando.\n');
}).listen(port, () => {
    console.log(`Servidor de saúde rodando na porta ${port}`);
});
