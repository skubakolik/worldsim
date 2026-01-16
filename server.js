const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Ensure leaderboard file exists
if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, '[]', 'utf8');
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // API Handlers
    if (req.url === '/api/leaderboard' && req.method === 'GET') {
        fs.readFile(LEADERBOARD_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read leaderboard' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data || '[]');
        });
        return;
    }

    if (req.url === '/api/leaderboard' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newScore = JSON.parse(body);
                if (!newScore.name || typeof newScore.money !== 'number') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid data' }));
                    return;
                }

                const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
                let leaderboard = JSON.parse(data || '[]');

                // Add new score
                leaderboard.push(newScore);

                // Sort descending
                leaderboard.sort((a, b) => b.money - a.money);

                // Limit to top 1000
                leaderboard = leaderboard.slice(0, 1000);

                fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(leaderboard));
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
        return;
    }

    if (req.url === '/api/admin/reset' && req.method === 'POST') {
        try {
            fs.writeFileSync(LEADERBOARD_FILE, '[]', 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Leaderboard reset' }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to reset' }));
        }
        return;
    }

    // Static File Serving
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Leaderboard saved in: ${LEADERBOARD_FILE}`);
});
