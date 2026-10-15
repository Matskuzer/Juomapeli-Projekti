import {describe,it,expect} from 'vitest';
import {createDeck} from '../cheers/cheersCards';
import {chooseDealer,createHigherLowerGame,guessRank,isRankComplete,nextHigherLowerRound,rankValue} from './higherLowerGameLogic';
import type {Player} from '../cheers/cheersTypes';

const players:Player[]=['a','b','c'].map(id=>({id,name:id,gender:'unspecified'}));
const orderedDeck=()=>createDeck();
const startedGame=()=>chooseDealer({...createHigherLowerGame(players,()=>0),deck:orderedDeck()},0);

describe('Higher or Lower logic',()=>{
 it('starts with a hidden first card and no revealed cards',()=>{
  const game=startedGame();
  expect(game.deck).toHaveLength(51);
  expect(game.revealedCards).toHaveLength(0);
  expect(game.currentCard).not.toBeNull();
  expect(game.phase).toBe('firstGuess');
 });
 it('uses Ace as the lowest rank',()=>{
  expect(rankValue('A')).toBe(1);
  expect(rankValue('2')).toBe(2);
  expect(rankValue('K')).toBe(13);
 });
 it('makes the dealer drink the card value for a correct first guess',()=>{
  const game=startedGame();
  const next=guessRank(game,game.currentCard!.rank);
  expect(next).toMatchObject({phase:'result',dealerSips:rankValue(game.currentCard!.rank),playerSips:0,revealedCards:[...game.revealedCards,game.currentCard]});
 });
 it('charges only the rank gap between the second guess and the actual card',()=>{
  const game=startedGame();
  const cards=createDeck();
  const scenario={...game,revealedCards:[cards.find(card=>card.rank==='2')!],currentCard:cards.find(card=>card.rank==='10')!};
  const first=guessRank(scenario,'K');
  expect(first).toMatchObject({phase:'secondGuess',hint:'lower',playerSips:0});
  expect(guessRank(first,'5')).toMatchObject({phase:'result',playerSips:5,revealedCards:[...scenario.revealedCards,scenario.currentCard]});
 });
 it('makes the dealer drink the difference from the first wrong guess when the second guess is correct',()=>{
  const game=startedGame();
  const cards=createDeck();
  const ten=cards.find(card=>card.rank==='10')!;
  const scenario={...game,currentCard:ten};
  const first=guessRank(scenario,'5');
  expect(guessRank(first,'10')).toMatchObject({phase:'result',dealerSips:5,playerSips:0});
  const highFirst=guessRank({...scenario,phase:'firstGuess',firstGuess:null},'K');
  expect(guessRank(highFirst,'10')).toMatchObject({phase:'result',dealerSips:3,playerSips:0});
 });
 it('marks a rank unavailable only after all four matching cards are revealed',()=>{
  const tens=createDeck().filter(card=>card.rank==='10');
  expect(isRankComplete(tens.slice(0,3),'10')).toBe(false);
  expect(isRankComplete(tens,'10')).toBe(true);
  const game={...startedGame(),revealedCards:tens,currentCard:createDeck().find(card=>card.rank==='2')!};
  expect(guessRank(game,'10')).toBe(game);
 });
 it('rotates the dealer and keeps playing until all 52 unique cards are revealed',()=>{
  let game=chooseDealer({...createHigherLowerGame(players,()=>0),deck:orderedDeck()},0);
  const seen=new Set<string>();
  for(let i=0;i<52;i++){
   const current=guessRank(game,game.currentCard!.rank);
   expect(current.phase).toBe('result');
   current.revealedCards.forEach(card=>seen.add(card.id));
   if(i<51){
    game=nextHigherLowerRound(current);
    expect(game.dealerIndex).toBe((i+1)%players.length);
   }else{
    game=nextHigherLowerRound(current);
   }
  }
  expect(seen.size).toBe(52);
  expect(game).toMatchObject({phase:'over',round:52});
  expect(game.revealedCards).toHaveLength(52);
 });
});
