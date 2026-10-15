import { createServer } from 'node:http';
import { randomInt, randomUUID, randomBytes } from 'node:crypto';
import {
  addPlayer, advanceAutoPyramid, createRoom, finishChallenge, publicState, restartRoom, respondToPyramid,
  setReady, startGame, submitChallengeGuess, submitGuess, updateSettings,
} from './shared/busGame.mjs';

const rooms = new Map();
const PORT = Number(process.env.API_PORT || 3001);
const HOST = process.env.API_HOST || '0.0.0.0';
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function newCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
}

async function readBody(request) {
  let data = '';
  for await (const chunk of request) {
    data += chunk;
    if (data.length > 16_384) throw new Error('Request body is too large.');
  }
  try {
    return data ? JSON.parse(data) : {};
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}

function cleanName(value) {
  if (typeof value !== 'string') throw new Error('Enter a display name.');
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 24) throw new Error('Display name must be from 1 to 24 characters.');
  return name;
}

function authorizedRoom(request, code) {
  const room = rooms.get(code);
  if (!room) throw new Error('Room not found. Check the code and try again.');
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const playerId = [...room.tokens].find(([, value]) => value === token)?.[0];
  if (!playerId) throw new Error('Your room session is not valid. Rejoin using the room code.');
  const player = room.game.players.find(entry => entry.id === playerId);
  if (!player) throw new Error('Your player is not part of this room.');
  room.lastSeen.set(playerId, Date.now());
  return { room, playerId };
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/api/health') {
      send(response, 200, { ok: true });
      return;
    }
    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      const body = await readBody(request);
      const id = randomUUID();
      const token = randomBytes(32).toString('hex');
      const code = newCode();
      const game = createRoom(code, id, cleanName(body.name));
      rooms.set(code, { game, tokens: new Map([[id, token]]), lastSeen: new Map([[id, Date.now()]]) });
      send(response, 201, { code, playerId: id, token, state: publicState(game, id, new Set([id])) });
      return;
    }
    const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})(?:\/(actions))?$/);
    if (!match) {
      send(response, 404, { error: 'Not found.' });
      return;
    }
    const code = match[1];
    if (request.method === 'POST' && !match[2]) {
      const body = await readBody(request);
      const room = rooms.get(code);
      if (!room) throw new Error('Room not found. Check the code and try again.');
      const id = randomUUID();
      const token = randomBytes(32).toString('hex');
      addPlayer(room.game, id, cleanName(body.name));
      room.tokens.set(id, token);
      room.lastSeen.set(id, Date.now());
      send(response, 201, { code, playerId: id, token, state: publicState(room.game, id, new Set(room.lastSeen.keys())) });
      return;
    }
    const { room, playerId } = authorizedRoom(request, code);
    if (request.method === 'GET' && !match[2]) {
      advanceAutoPyramid(room.game);
      const connected = new Set([...room.lastSeen].filter(([, at]) => Date.now() - at < 15_000).map(([id]) => id));
      send(response, 200, { state: publicState(room.game, playerId, connected) });
      return;
    }
    if (request.method === 'POST' && match[2]) {
      const body = await readBody(request);
      const game = room.game;
      advanceAutoPyramid(game);
      switch (body.type) {
        case 'ready': setReady(game, playerId, body.ready); break;
        case 'settings': updateSettings(game, playerId, body.settings); break;
        case 'start': startGame(game, playerId, Math.random, max => randomInt(max)); break;
        case 'guess': submitGuess(game, playerId, body.guess); break;
        case 'pyramid': respondToPyramid(game, playerId, body.action); break;
        case 'challenge': submitChallengeGuess(game, playerId, body.guess); break;
        case 'end': finishChallenge(game, playerId); break;
        case 'restart': restartRoom(game, playerId); break;
        default: throw new Error('Unknown game action.');
      }
      send(response, 200, { state: publicState(game, playerId, new Set([...room.lastSeen].filter(([, at]) => Date.now() - at < 15_000).map(([id]) => id))) });
      return;
    }
    send(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The request could not be completed.';
    const status = message.includes('session is not valid') || message.includes('not part of this room') ? 401 : 400;
    send(response, status, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Bus Driver room API listening on ${HOST}:${PORT}`);
});
