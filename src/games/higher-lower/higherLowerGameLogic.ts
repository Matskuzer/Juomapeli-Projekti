import {createDeck,shuffle} from '../hitler/hitlerCards';
import {RANKS} from '../hitler/hitlerTypes';
import type {Card,Player,Rank} from '../hitler/hitlerTypes';

export type Hint='higher'|'lower';
export type Phase='chooseDealer'|'firstGuess'|'secondGuess'|'result'|'over';
export interface HigherLowerState{
 players:Player[];
 deck:Card[];
 revealedCards:Card[];
 dealerIndex:number|null;
 round:number;
 currentCard:Card|null;
 phase:Phase;
 firstGuess:Rank|null;
 hint:Hint|null;
 playerSips:number;
 dealerSips:number;
}

export const rankValue=(rank:Rank)=>RANKS.indexOf(rank)+1;
export const isRankComplete=(cards:Card[],rank:Rank)=>cards.filter(card=>card.rank===rank).length===4;
const draw=(deck:Card[])=>({card:deck[0]??null,remaining:deck.slice(1)});

export function createHigherLowerGame(players:Player[],rnd:()=>number=Math.random):HigherLowerState{
 return {players,deck:shuffle(createDeck(),rnd),revealedCards:[],dealerIndex:null,round:0,currentCard:null,phase:'chooseDealer',firstGuess:null,hint:null,playerSips:0,dealerSips:0};
}

export function chooseDealer(s:HigherLowerState,dealerIndex:number):HigherLowerState{
 if(s.phase!=='chooseDealer'||!Number.isInteger(dealerIndex)||dealerIndex<0||dealerIndex>=s.players.length)return s;
 const {card,remaining}=draw(s.deck);
 if(!card)return {...s,phase:'over'};
 return {...s,deck:remaining,dealerIndex,currentCard:card,phase:'firstGuess'};
}

export function guessRank(s:HigherLowerState,guess:Rank):HigherLowerState{
 if(!RANKS.includes(guess)||isRankComplete(s.revealedCards,guess))return s;
 if(!s.currentCard)return s;
 if(s.phase==='firstGuess'&&s.currentCard){
  if(guess===s.currentCard.rank)return {...s,phase:'result',revealedCards:[...s.revealedCards,s.currentCard],firstGuess:guess,dealerSips:rankValue(s.currentCard.rank)};
  return {...s,phase:'secondGuess',firstGuess:guess,hint:rankValue(s.currentCard.rank)>rankValue(guess)?'higher':'lower'};
 }
 if(s.phase==='secondGuess'&&s.currentCard){
  return guess===s.currentCard.rank
   ?{...s,phase:'result',revealedCards:[...s.revealedCards,s.currentCard],dealerSips:s.firstGuess?Math.abs(rankValue(s.currentCard.rank)-rankValue(s.firstGuess)):0}
   :{...s,phase:'result',revealedCards:[...s.revealedCards,s.currentCard],playerSips:Math.abs(rankValue(s.currentCard.rank)-rankValue(guess))};
 }
 return s;
}

export function nextHigherLowerRound(s:HigherLowerState):HigherLowerState{
 if(s.phase!=='result'||s.dealerIndex===null)return s;
 const round=s.round+1;
 if(!s.deck.length)return {...s,round,phase:'over'};
 const dealerIndex=(s.dealerIndex+1)%s.players.length;
 const {card,remaining}=draw(s.deck);
 if(!card)return {...s,round,phase:'over'};
 return {...s,deck:remaining,dealerIndex,round,currentCard:card,phase:'firstGuess',firstGuess:null,hint:null,playerSips:0,dealerSips:0};
}
