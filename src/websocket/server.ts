import http from 'http';
import fs   from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { WsEvent } from '../protocol/types';
import { logger } from '../utils/logger';

const wsLogger = logger.child({ subsystem: 'websocket' });

let wss: WebSocketServer | null = null;

export function startWsServer(port: number): void {
  const server = http.createServer((req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  });

  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    wsLogger.info({ clients: wss!.clients.size }, 'Client connected');
    ws.on('close', () => wsLogger.info({ clients: wss!.clients.size - 1 }, 'Client disconnected'));
    ws.on('error', (err) => wsLogger.warn({ err }, 'WebSocket client error'));
  });

  server.listen(port, () => {
    wsLogger.info({ port }, 'WebSocket + HTTP server listening');
  });
}

export function broadcast(event: WsEvent): void {
  if (!wss) return;
  const payload = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
