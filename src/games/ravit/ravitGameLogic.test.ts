import {describe,it,expect} from 'vitest';
import {createGame,drawCard,startRace,updateBet} from './ravitGameLogic';
import type {Card,GameState,Player,Suit} from './ravitTypes';
const players:Player[]=[{id:'a',name:'A'},{id:'b',name:'B'}];
const card=(suit:Suit,rank='2'):Card=>({id:`${rank}${suit}`,rank,suit});

describe('Ravit game logic',()=>{
 it('sets up four horses, eight track cards, and a 40-card draw deck',()=>{
  const game=createGame(players,()=>0);
  expect(game.status).toBe('betting');
  expect(game.trackCards).toHaveLength(8);
  expect(game.deck).toHaveLength(40);
  expect(game.bets.a).toEqual({suit:'♠',stake:2});
  expect(game.bets.b).toEqual({suit:'♥',stake:2});
  expect(Object.values(game.positions)).toEqual([0,0,0,0]);
 });

 it('requires at least two players and accepts valid bets before the race',()=>{
  expect(()=>createGame([players[0]])).toThrow('at least 2 players');
  const game=createGame(players);
  const bet=updateBet(game,'a','♦',7);
  expect(bet.bets.a).toEqual({suit:'♦',stake:7});
  expect(()=>updateBet(game,'a','♦',0)).toThrow('positive whole number');
  expect(startRace(bet).status).toBe('racing');
 });

 it('advances the drawn suit and reveals a track card when all horses pass it',()=>{
  const base=createGame(players,()=>0);
  const game:GameState={...base,status:'racing',trackCards:[card('♦'),...base.trackCards.slice(1)],deck:[card('♣')],positions:{'♠':1,'♥':1,'♦':1,'♣':0}};
  const next=drawCard(game);
  expect(next.positions).toEqual({'♠':1,'♥':1,'♦':0,'♣':1});
  expect(next.revealedTrackCount).toBe(1);
  expect(next.revealedThisTurn).toEqual([card('♦')]);
  expect(next.discardedCards).toEqual([card('♣')]);
 });

 it('declares the first horse to finish and ignores further draws',()=>{
  const base=createGame(players,()=>0);
  const game:GameState={...base,status:'racing',deck:[card('♠')],positions:{'♠':7,'♥':0,'♦':0,'♣':0}};
  const finished=drawCard(game);
  expect(finished.winner).toBe('♠');
  expect(finished.status).toBe('over');
  expect(drawCard(finished)).toBe(finished);
 });

 it('shuffles used race cards back into the draw pile if it runs out',()=>{
  const base=createGame(players,()=>0);
  const previous=card('♥','3');
  const game:GameState={...base,status:'racing',deck:[],discardedCards:[previous],positions:{'♠':0,'♥':0,'♦':0,'♣':0}};
  const next=drawCard(game,()=>0);
  expect(next.lastCard).toEqual(previous);
  expect(next.discardedCards).toEqual([previous]);
 });
});
