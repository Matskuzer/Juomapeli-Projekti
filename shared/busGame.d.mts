export type Suit = '♥' | '♦' | '♣' | '♠';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export interface Card { id: string; rank: Rank; suit: Suit }
export interface Player {
  id: string;
  name: string;
  ready: boolean;
  penalties: number;
  hand: Card[];
  guesses: Array<{ guess: string; card: Card; correct: boolean }>;
}
export interface Room {
  code: string;
  hostId: string;
  status: 'lobby' | 'guessing' | 'pyramid' | 'challenge' | 'over';
  players: Player[];
  settings: { tieRule: 'incorrect' | 'retry'; rowPoints: number[]; challengeLength: number; guessPenalty: number; responseMode: 'sequential' | 'simultaneous'; turnOrder: 'forward' | 'reverse'; matchingRule: 'one' | 'all' };
  deck: Card[];
  randomInt: ((max: number) => number) | null;
  deckNumber: number;
  round: number;
  playerIndex: number;
  pyramid: Card[];
  pyramidIndex: number;
  pyramidAutoAdvanceAt: number | null;
  responseIndex: number;
  respondedPlayers: string[];
  playedCards: Array<{ card: Card; playerId: string; targetId: string; row: number; points: number }>;
  lastReveal: { playerId: string; round: number; guess: string; card: Card; correct: boolean | null; retry: boolean } | null;
  busDriverId: string | null;
  challengeStep: number;
  challengeCards: Card[];
  challengeOutcome: 'complete' | 'ended' | null;
  event: Record<string, unknown> | null;
}
export const SUITS: Suit[];
export const RANKS: Rank[];
export function createDeck(): Card[];
export function shuffledDeck(random?: () => number, randomInt?: (max: number) => number): Card[];
export function createRoom(code: string, hostId: string, hostName: string): Room;
export function addPlayer(room: Room, id: string, name: string): void;
export function updateSettings(room: Room, playerId: string, settings: Room['settings']): void;
export function setReady(room: Room, playerId: string, ready: boolean): void;
export function startGame(room: Room, playerId: string, random?: () => number, randomInt?: (max: number) => number): void;
export function submitGuess(room: Room, playerId: string, guess: string): void;
export function respondToPyramid(room: Room, playerId: string, action: { type: 'pass' } | { type: 'play'; cardId: string; targetId: string }): void;
export function finishChallenge(room: Room, playerId: string): void;
export function restartRoom(room: Room, playerId: string): void;
export function publicState(room: Room, viewerId: string, connectedIds?: Set<string>): Record<string, unknown>;
export function submitChallengeGuess(room: Room, playerId: string, guess: string): void;
export function validGuessOptions(round: number): string[];
export function advanceAutoPyramid(room: Room, now?: number): boolean;
