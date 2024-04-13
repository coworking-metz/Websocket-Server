const WebSocket = require('ws');
const http = require('http');
const Redis = require('ioredis');

// Create a new Redis client and select database 8
const redis = new Redis({ db: 8 });

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Clear the connected clients set when the server starts
redis.del('connected_clients').then(() => {
    console.log('Connected clients set cleared.');
});

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        
        const { action } = message;

        const clientId = `client_${Date.now()}`;

        if (!action) {
            ws.send('Missing registration information');
            ws.close();
            return;
        }

        // Store the client with action in Redis
        redis.hset('connected_clients', clientId, action).then(() => {
            console.log(`Client ${clientId} registered with action ${action}`);
        });

        // Add client info to the WebSocket
        ws.clientId = clientId;
        ws.action = action;

        // Handle subsequent messages
        ws.on('message', function message(data) {
            let payload;
            try {
                payload = JSON.parse(data);
            } catch (e) {
                console.log('Received non-JSON payload');
                return;
            }

            console.log(`Received from ${clientId}:`, payload);

            // Broadcast message to all clients with the same action
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN && client.action === action) {
                    client.send(JSON.stringify({ clientId, payload }));
                }
            });
        });

        ws.send(`Registered for \`${action}\``);
    });

    ws.on('close', function close() {
        if (ws.clientId) {
            // Remove the client from Redis when they disconnect
            redis.hdel('connected_clients', ws.clientId).then(() => {
                console.log(`Client ${ws.clientId} removed from the connected clients set.`);
            });
        }
    });
});

server.listen(8080, () => {
    console.log('WebSocket server running on http://localhost:8080');
});
