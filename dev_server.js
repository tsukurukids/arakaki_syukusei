const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

// multipart/form-data の簡易パース処理
function parseMultipart(bodyBuffer, boundary) {
    const fields = {};
    const boundaryStr = '--' + boundary;
    const parts = bodyBuffer.toString('binary').split(boundaryStr);
    
    for (const part of parts) {
        if (!part || part.trim() === '--' || part.trim() === '') continue;
        const nameMatch = part.match(/name="([^"]+)"/);
        if (nameMatch) {
            const name = nameMatch[1];
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd !== -1) {
                let value = part.substring(headerEnd + 4);
                // 末尾のCRLFを取り除く
                if (value.endsWith('\r\n')) {
                    value = value.substring(0, value.length - 2);
                }
                // バイナリからUTF-8に戻す
                fields[name] = Buffer.from(value, 'binary').toString('utf8');
            }
        }
    }
    return fields;
}

const server = http.createServer((req, res) => {
    // リクエストログを出力
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // お問い合わせフォームの送信エンドポイントをエミュレート
    if (req.method === 'POST' && req.url === '/send_mail.php') {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
            const boundaryMatch = contentType.match(/boundary=(.+)/);
            const boundary = boundaryMatch ? boundaryMatch[1] : null;
            
            let chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
                try {
                    const bodyBuffer = Buffer.concat(chunks);
                    const fields = parseMultipart(bodyBuffer, boundary);
                    
                    console.log('\n==================================================');
                    console.log('✉️  お問い合わせメール受信 (ローカル開発用エミュレータ)');
                    console.log('==================================================');
                    console.log(`【お名前】: ${fields.name || '未入力'}`);
                    console.log(`【メールアドレス】: ${fields.email || '未入力'}`);
                    console.log(`【電話番号】: ${fields.phone || '未入力'}`);
                    console.log(`【お問い合わせ種別】: ${fields['inquiry-type'] || '未入力'}`);
                    console.log('【お問い合わせ内容】:');
                    console.log(fields.message || '未入力');
                    console.log('==================================================\n');
                    
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        status: 'success',
                        message: '【ローカル送信成功】お問い合わせを受け付けました。\n（※ローカル開発環境のため、メールは送信せずコンソールに出力しました）'
                    }));
                } catch (e) {
                    console.error('パースエラー:', e);
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'データの解析に失敗しました。'
                    }));
                }
            });
            return;
        }
    }

    // 静的ファイル配信
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    
    // ディレクトリトラバーサル防止
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 開発用ローカルサーバーが起動しました！`);
    console.log(`👉 http://localhost:${PORT}/ にブラウザでアクセスしてください。`);
    console.log(`📝 お問い合わせを送信すると、このターミナル上にメール内容が出力されます。`);
});
