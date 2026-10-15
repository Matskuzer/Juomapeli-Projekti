export const SUITS = ['♥', '♦', '♣', '♠'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const rankValue = rank => RANKS.indexOf(rank) + 2;
const isRed = suit => suit === '♥' || suit === '♦';

export function createDeck() {
  return SUITS.flatMap(suit => RANKS.map(rank => ({ id: `${rank}${suit}`, rank, suit })));
}

export function advanceAutoPyramid(room, now = Date.now()) {
  if (room.status !== 'pyramid' || room.pyramidAutoAdvanceAt === null || now < room.pyramidAutoAdvanceAt) return false;
  advancePyramidCard(room);
  return true;
}

export function shuffledDeck(random = Math.random, randomInt) {
  const deck = createDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt ? randomInt(i + 1) : Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createRoom(code, hostId, hostName) {
  return {
    code,
    hostId,
    status: 'lobby',
    players: [{ id: hostId, name: hostName, ready: false, penalties: 0, hand: [], guesses: [] }],
    settings: { tieRule: 'incorrect', rowPoints: [1, 2, 3, 4, 5], challengeLength: 4, guessPenalty: 1, responseMode: 'sequential', turnOrder: 'forward', matchingRule: 'one' },
    deck: [],
    randomInt: null,
    deckNumber: 1,
    round: 0,
    playerIndex: 0,
    pyramid: [],
    pyramidIndex: 0,
    pyramidAutoAdvanceAt: null,
    responseIndex: 0,
    respondedPlayers: [],
    playedCards: [],
    lastReveal: null,
    busDriverId: null,
    challengeStep: 0,
    challengeCards: [],
    challengeOutcome: null,
    event: null,
  };
}

export function addPlayer(room, id, name) {
  if (room.status !== 'lobby') throw new Error('This room has already started.');
  if (room.players.length >= 6) throw new Error('This room is full (6 players maximum).');
  if (room.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('That display name is already in use in this room.');
  }
  room.players.push({ id, name, ready: false, penalties: 0, hand: [], guesses: [] });
}

export function updateSettings(room, playerId, settings) {
  requireHost(room, playerId);
  if (room.status !== 'lobby') throw new Error('Game settings can only be changed in the lobby.');
  const { tieRule, rowPoints, challengeLength, guessPenalty, responseMode, turnOrder, matchingRule } = settings;
  if (!['incorrect', 'retry'].includes(tieRule)) throw new Error('Invalid tie rule.');
  if (!Array.isArray(rowPoints) || rowPoints.length !== 5 || rowPoints.some(points => !Number.isInteger(points) || points < 1 || points > 20)) {
    throw new Error('Each pyramid row must have a penalty value from 1 to 20.');
  }
  if (!Number.isInteger(challengeLength) || challengeLength < 1 || challengeLength > 4) throw new Error('Challenge length must be between 1 and 4.');
  if (!Number.isInteger(guessPenalty) || guessPenalty < 1 || guessPenalty > 20) throw new Error('Guess penalties must be from 1 to 20 points.');
  if (!['sequential', 'simultaneous'].includes(responseMode)) throw new Error('Invalid response mode.');
  if (!['forward', 'reverse'].includes(turnOrder)) throw new Error('Invalid turn order.');
  if (!['one', 'all'].includes(matchingRule)) throw new Error('Invalid matching-card rule.');
  room.settings = { tieRule, rowPoints: [...rowPoints], challengeLength, guessPenalty, responseMode, turnOrder, matchingRule };
}

export function setReady(room, playerId, ready) {
  const player = requirePlayer(room, playerId);
  if (room.status !== 'lobby') throw new Error('The game has already started.');
  if (typeof ready !== 'boolean') throw new Error('Invalid ready status.');
  player.ready = ready;
}

export function startGame(room, playerId, random = Math.random, randomInt) {
  requireHost(room, playerId);
  if (room.status !== 'lobby') throw new Error('The game has already started.');
  if (room.players.length < 1) throw new Error('At least 1 player is needed.');
  if (room.players.some(player => !player.ready)) throw new Error('Everyone must be ready before the game starts.');
  const requiredCards = room.players.length * 5 + 15 + room.settings.challengeLength;
  if (requiredCards > 52) throw new Error('Not enough cards for these settings. Reduce players or challenge length.');
  room.randomInt = randomInt ?? null;
  room.deck = shuffledDeck(random, room.randomInt ?? undefined);
  room.deckNumber = 1;
  room.status = 'guessing';
  room.round = 0;
  room.playerIndex = 0;
  room.lastReveal = null;
  room.players.forEach(player => {
    player.hand = [];
    player.guesses = [];
    player.penalties = 0;
  });
}

export function submitGuess(room, playerId, guess) {
  requireCurrentPlayer(room, playerId);
  if (room.status !== 'guessing') throw new Error('It is not time to guess.');
  if (!validGuessOptions(room.round).includes(guess)) throw new Error('Choose one of the available options.');
  const player = room.players[room.playerIndex];
  const card = draw(room);
  player.hand.push(card);
  const comparison = compareGuess(room, player, guess, card);
  if (comparison.tie && room.settings.tieRule === 'retry' && room.round === 1) {
    player.hand.pop();
    room.lastReveal = { playerId, round: room.round, guess, card, correct: null, retry: true };
    return;
  }
  const correct = comparison.correct;
  if (!correct) player.penalties += room.settings.guessPenalty;
  player.guesses[room.round] = { guess, card, correct };
  room.lastReveal = { playerId, round: room.round, guess, card, correct, retry: false };
  advanceGuessTurn(room);
}

export function respondToPyramid(room, playerId, action) {
  requireCurrentPlayer(room, playerId);
  if (room.status !== 'pyramid') throw new Error('The pyramid is not accepting responses.');
  const card = room.pyramid[room.pyramidIndex];
  const player = requirePlayer(room, playerId);
  if (player.hand.every(held => held.id !== card.id && held.rank !== card.rank)) {
    throw new Error('You do not have a matching card.');
  }
  if (action.type === 'pass') {
    advancePyramidResponse(room, playerId);
    return;
  }
  if (action.type !== 'play' || typeof action.cardId !== 'string' || typeof action.targetId !== 'string') {
    throw new Error('Invalid pyramid action.');
  }
  const handIndex = player.hand.findIndex(held => held.id === action.cardId && held.rank === card.rank);
  if (handIndex < 0) throw new Error('That card is not in your hand or does not match.');
  if ((action.targetId === playerId && room.players.length > 1) || !room.players.some(target => target.id === action.targetId)) {
    throw new Error('Choose another player to receive the penalty.');
  }
  const playedCard = player.hand[handIndex];
  player.hand.splice(handIndex, 1);
  const target = requirePlayer(room, action.targetId);
  const row = room.pyramidIndex < 5 ? 0 : room.pyramidIndex < 9 ? 1 : room.pyramidIndex < 12 ? 2 : room.pyramidIndex < 14 ? 3 : 4;
  const points = room.settings.rowPoints[row];
  target.penalties += points;
  room.playedCards.push({ card: playedCard, playerId, targetId: action.targetId, row, points });
  room.event = { type: 'cardPlayed', playerId, cardId: action.cardId, targetId: action.targetId, points };
  if (room.settings.matchingRule === 'all' && player.hand.some(held => held.rank === card.rank)) return;
  advancePyramidResponse(room, playerId);
}

export function finishChallenge(room, playerId) {
  requireHost(room, playerId);
  if (room.status !== 'challenge' || room.challengeOutcome === 'complete') throw new Error('The challenge cannot be ended now.');
  room.status = 'over';
  room.challengeOutcome = 'ended';
}

export function restartRoom(room, playerId) {
  requireHost(room, playerId);
  if (room.status !== 'over') throw new Error('The game must be complete before returning to the lobby.');
  room.status = 'lobby';
  room.players.forEach(player => {
    player.ready = false;
    player.penalties = 0;
    player.hand = [];
    player.guesses = [];
  });
  room.deck = [];
  room.deckNumber = 1;
  room.pyramid = [];
  room.pyramidIndex = 0;
  room.round = 0;
  room.playerIndex = 0;
  room.responseIndex = 0;
  room.respondedPlayers = [];
  room.pyramidAutoAdvanceAt = null;
  room.playedCards = [];
  room.lastReveal = null;
  room.event = null;
  room.busDriverId = null;
  room.challengeStep = 0;
  room.challengeCards = [];
  room.challengeOutcome = null;
}

export function publicState(room, viewerId, connectedIds = new Set()) {
  const own = requirePlayer(room, viewerId);
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map(player => ({
      id: player.id,
      name: player.name,
      ready: player.ready,
      connected: connectedIds.has(player.id),
      penalties: player.penalties,
      cardsRemaining: player.hand.length,
      hand: player.id === viewerId ? player.hand : undefined,
      guesses: player.id === viewerId ? player.guesses : undefined,
    })),
    settings: room.settings,
    round: room.round,
    currentPlayerId: room.status === 'guessing' ? room.players[room.playerIndex]?.id : undefined,
    pyramid: room.pyramid.map((card, index) => index <= room.pyramidIndex ? card : null),
    playedCards: room.playedCards,
    pyramidIndex: room.pyramidIndex,
    autoAdvancing: room.pyramidAutoAdvanceAt !== null,
    currentResponsePlayerId: room.status === 'pyramid' && room.settings.responseMode === 'sequential'
      && responseOrder(room)[room.responseIndex]?.id === viewerId
      && own.hand.some(held => held.rank === room.pyramid[room.pyramidIndex]?.rank)
      ? viewerId : undefined,
    canRespond: room.status === 'pyramid' && (room.settings.responseMode === 'simultaneous'
      ? !room.respondedPlayers.includes(viewerId) && own.hand.some(held => held.rank === room.pyramid[room.pyramidIndex]?.rank)
      : responseOrder(room)[room.responseIndex]?.id === viewerId
        && own.hand.some(held => held.rank === room.pyramid[room.pyramidIndex]?.rank)),
    lastReveal: room.status === 'guessing' ? room.lastReveal : null,
    busDriverId: room.busDriverId,
    challengeStep: room.challengeStep,
    challengeCards: room.challengeCards,
    challengeLength: room.settings.challengeLength,
    challengeOutcome: room.challengeOutcome,
    event: room.event,
    deckNumber: room.deckNumber,
  };
}

function compareGuess(room, player, guess, card) {
  const round = room.round;
  if (round === 0) {
    if (!['red', 'black'].includes(guess)) throw new Error('Choose red or black.');
    return { correct: (guess === 'red') === isRed(card.suit), tie: false };
  }
  if (round === 1) {
    if (!['higher', 'lower'].includes(guess)) throw new Error('Choose higher or lower.');
    const first = player.hand[0];
    const tie = rankValue(card.rank) === rankValue(first.rank);
    return { correct: guess === 'higher' ? rankValue(card.rank) > rankValue(first.rank) : rankValue(card.rank) < rankValue(first.rank), tie };
  }
  if (round === 2) {
    if (!['inside', 'outside'].includes(guess)) throw new Error('Choose inside or outside.');
    const [first, second] = player.hand;
    const low = Math.min(rankValue(first.rank), rankValue(second.rank));
    const high = Math.max(rankValue(first.rank), rankValue(second.rank));
    const inside = rankValue(card.rank) > low && rankValue(card.rank) < high;
    return { correct: (guess === 'inside') === inside, tie: low === high };
  }
  if (round === 3) {
    if (!SUITS.includes(guess)) throw new Error('Choose a valid suit.');
    return { correct: guess === card.suit, tie: false };
  }
  throw new Error('Invalid round.');
}

function advanceGuessTurn(room) {
  room.lastReveal = { ...room.lastReveal };
  room.playerIndex += 1;
  if (room.playerIndex < room.players.length) return;
  room.playerIndex = 0;
  room.round += 1;
  if (room.round < 4) return;
  room.status = 'pyramid';
  room.pyramid = Array.from({ length: 15 }, () => draw(room));
  room.pyramidIndex = 0;
  room.responseIndex = 0;
  room.playedCards = [];
  room.respondedPlayers = [];
  advanceToEligibleResponder(room);
}

function advanceToEligibleResponder(room) {
  if (room.status !== 'pyramid') return;
  const card = room.pyramid[room.pyramidIndex];
  if (!card) {
    room.pyramidAutoAdvanceAt = null;
    beginBusDriverChallenge(room);
    return;
  }
  room.pyramidAutoAdvanceAt = null;
  if (room.settings.responseMode === 'simultaneous') {
    const eligible = room.players.some(player => !room.respondedPlayers.includes(player.id) && player.hand.some(held => held.rank === card.rank));
    if (!eligible) room.pyramidAutoAdvanceAt = Date.now() + 900;
    return;
  }
  const order = responseOrder(room);
  const eligible = order.filter(player => player.hand.some(held => held.rank === card.rank));
  if (eligible.length === 0) {
    room.pyramidAutoAdvanceAt = Date.now() + 900;
    return;
  }
  while (room.responseIndex < order.length && !order[room.responseIndex].hand.some(held => held.rank === card.rank)) {
    room.responseIndex += 1;
  }
  if (room.responseIndex >= order.length) advancePyramidCard(room);
}

function advancePyramidResponse(room, playerId) {
  if (room.settings.responseMode === 'simultaneous') room.respondedPlayers.push(playerId);
  else room.responseIndex += 1;
  advanceToEligibleResponder(room);
}

function advancePyramidCard(room) {
  room.pyramidIndex += 1;
  room.responseIndex = 0;
  room.respondedPlayers = [];
  room.pyramidAutoAdvanceAt = null;
  advanceToEligibleResponder(room);
}

function responseOrder(room) {
  return room.settings.turnOrder === 'reverse' ? [...room.players].reverse() : room.players;
}

function beginBusDriverChallenge(room) {
  const mostCards = Math.max(...room.players.map(player => player.hand.length));
  let candidates = room.players.filter(player => player.hand.length === mostCards);
  const mostPenalties = Math.max(...candidates.map(player => player.penalties));
  candidates = candidates.filter(player => player.penalties === mostPenalties);
  if (candidates.length > 1) {
    const cards = [];
    let tied = candidates;
    while (tied.length > 1) {
      const drawn = tied.map(player => ({ player, card: draw(room) }));
      const highest = Math.max(...drawn.map(entry => rankValue(entry.card.rank)));
      cards.push(...drawn.map(({ player, card }) => ({ playerId: player.id, card })));
      tied = drawn.filter(entry => rankValue(entry.card.rank) === highest).map(entry => entry.player);
    }
    room.busDriverId = tied[0].id;
    room.event = { type: 'tiebreak', cards };
  } else {
    room.busDriverId = candidates[0].id;
    room.event = null;
  }
  room.status = 'challenge';
  room.challengeStep = 0;
  room.challengeCards = [];
}

function compareChallengeGuess(room, guess, card) {
  const step = room.challengeStep;
  if (step === 0) {
    if (!['red', 'black'].includes(guess)) throw new Error('Choose red or black.');
    return (guess === 'red') === isRed(card.suit);
  }
  if (step === 1) {
    if (!['higher', 'lower'].includes(guess)) throw new Error('Choose higher or lower.');
    const previous = room.challengeCards[0];
    return guess === 'higher' ? rankValue(card.rank) > rankValue(previous.rank) : rankValue(card.rank) < rankValue(previous.rank);
  }
  if (step === 2) {
    if (!['inside', 'outside'].includes(guess)) throw new Error('Choose inside or outside.');
    const low = Math.min(rankValue(room.challengeCards[0].rank), rankValue(room.challengeCards[1].rank));
    const high = Math.max(rankValue(room.challengeCards[0].rank), rankValue(room.challengeCards[1].rank));
    return (guess === 'inside') === (rankValue(card.rank) > low && rankValue(card.rank) < high);
  }
  if (step === 3) {
    if (!SUITS.includes(guess)) throw new Error('Choose a valid suit.');
    return guess === card.suit;
  }
  throw new Error('Invalid challenge step.');
}

function draw(room) {
  if (!room.deck.length) {
    room.deck = shuffledDeck(Math.random, room.randomInt ?? undefined);
    room.deckNumber += 1;
    room.event = { type: 'newDeck', deckNumber: room.deckNumber };
  }
  return room.deck.shift();
}

function requireCurrentPlayer(room, playerId) {
  const currentId = room.status === 'guessing'
    ? room.players[room.playerIndex]?.id
    : room.status === 'pyramid'
      ? room.settings.responseMode === 'simultaneous'
        ? room.players.some(player => player.id === playerId && !room.respondedPlayers.includes(playerId) && player.hand.some(held => held.rank === room.pyramid[room.pyramidIndex]?.rank)) ? playerId : undefined
        : responseOrder(room)[room.responseIndex]?.id
      : room.busDriverId;
  if (currentId !== playerId) throw new Error('It is not your turn.');
}

function requireHost(room, playerId) {
  if (room.hostId !== playerId) throw new Error('Only the host can do that.');
}

function requirePlayer(room, playerId) {
  const player = room.players.find(entry => entry.id === playerId);
  if (!player) throw new Error('Player is not in this room.');
  return player;
}

export function submitChallengeGuess(room, playerId, guess) {
  requireCurrentPlayer(room, playerId);
  if (room.status !== 'challenge') throw new Error('The Bus Driver challenge is not active.');
  if (!validGuessOptions(room.challengeStep).includes(guess)) throw new Error('Choose one of the available options.');
  const card = draw(room);
  const correct = compareChallengeGuess(room, guess, card);
  room.event = { type: 'challengeReveal', step: room.challengeStep, guess, card, correct };
  if (!correct) {
    room.challengeStep = 0;
    room.challengeCards = [];
    return;
  }
  room.challengeCards.push(card);
  room.challengeStep += 1;
  if (room.challengeStep >= room.settings.challengeLength) {
    room.challengeOutcome = 'complete';
    room.status = 'over';
  }
}

export function validGuessOptions(round) {
  return round === 0 ? ['red', 'black']
    : round === 1 ? ['higher', 'lower']
      : round === 2 ? ['inside', 'outside']
        : SUITS;
}
