import {FINISH_POSITION,SUITS} from './ravitTypes';
import type {Bet,Card,GameState,Player,Suit} from './ravitTypes';
const RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K'];
export const MIN_PLAYERS=2;

function createDeck():Card[]{
 return SUITS.flatMap(suit=>RANKS.map(rank=>({id:`${rank}${suit}`,rank,suit})));
}

export function shuffle<T>(items:T[],rnd:()=>number=Math.random):T[]{
 const shuffled=[...items];
 for(let i=shuffled.length-1;i>0;i--){
  const j=Math.floor(rnd()*(i+1));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 return shuffled;
}

export function createGame(players:Player[],rnd:()=>number=Math.random):GameState{
 if(players.length<MIN_PLAYERS)throw new RangeError(`Ravit requires at least ${MIN_PLAYERS} players.`);
 const cards=shuffle(createDeck(),rnd);
 const trackCards=cards.slice(0,FINISH_POSITION);
 const deck=cards.slice(FINISH_POSITION);
 const bets=Object.fromEntries(players.map((player,index)=>[player.id,{suit:SUITS[index%SUITS.length],stake:2}])) as Record<string,Bet>;
 return {
  players,bets,positions:{'♠':0,'♥':0,'♦':0,'♣':0},trackCards,revealedTrackCount:0,
  deck,discardedCards:[],lastCard:null,revealedThisTurn:[],winner:null,status:'betting',
 };
}

export function updateBet(state:GameState,playerId:string,suit:Suit,stake:number):GameState{
 if(state.status!=='betting')return state;
 if(!state.players.some(player=>player.id===playerId))throw new RangeError(`Unknown player: ${playerId}`);
 if(!Number.isInteger(stake)||stake<1)throw new RangeError('A bet must be a positive whole number of sips.');
 return {...state,bets:{...state.bets,[playerId]:{suit,stake}}};
}

export function startRace(state:GameState):GameState{
 if(state.status!=='betting')return state;
 for(const player of state.players){
  const bet=state.bets[player.id];
  if(!bet||!Number.isInteger(bet.stake)||bet.stake<1)throw new Error(`Player ${player.name} needs a valid bet.`);
 }
 return {...state,status:'racing'};
}

export function drawCard(state:GameState,rnd:()=>number=Math.random):GameState{
 if(state.status!=='racing'||state.winner)return state;
 const drawPile=state.deck.length?state.deck:shuffle(state.discardedCards,rnd);
 if(!drawPile.length)return state;
 const [card,...deck]=drawPile;
 const positions={...state.positions,[card.suit]:Math.min(FINISH_POSITION,state.positions[card.suit]+1)};
 const discardedCards=[...(!state.deck.length?[]:state.discardedCards),card];
 if(positions[card.suit]===FINISH_POSITION){
  return {...state,deck,discardedCards,positions,lastCard:card,revealedThisTurn:[],winner:card.suit,status:'over'};
 }
 let revealedTrackCount=state.revealedTrackCount;
 const revealedThisTurn:Card[]=[];
 while(revealedTrackCount<state.trackCards.length&&SUITS.every(suit=>positions[suit]>=revealedTrackCount+1)){
  const trackCard=state.trackCards[revealedTrackCount];
  positions[trackCard.suit]=Math.max(0,positions[trackCard.suit]-1);
  revealedThisTurn.push(trackCard);
  revealedTrackCount++;
 }
 return {...state,deck,discardedCards,positions,lastCard:card,revealedTrackCount,revealedThisTurn};
}
