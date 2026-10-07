import {createDeck,shuffle} from './hitlerCards';
import {eventFor} from './hitlerRules';
import type {GameState,GameEvent,Player,KingMode} from './hitlerTypes';
export const MIN_PLAYERS=3;
export function createGame(players:Player[],rnd:()=>number=Math.random,kingMode:KingMode='cup'):GameState{
 return {players,playerOrder:shuffle(players.map(p=>p.id),rnd),turn:0,deck:shuffle(createDeck(),rnd),usedCards:[],currentCard:null,activeRules:[],activePartners:[],activeQuestionMaster:null,kingMode,status:'playing',kingCount:0,reactionTimes:{},event:null};
}
export const currentPlayerId=(s:GameState)=>s.playerOrder[s.turn%s.playerOrder.length];
export const orderedFrom=(s:GameState)=>s.playerOrder.map((_,i)=>s.playerOrder[(s.turn+i)%s.playerOrder.length]);
export function drawCard(s:GameState):GameState{
 if(s.status!=='playing'||s.event||!s.deck.length)return s;
 const [card,...deck]=s.deck;
 const n:GameState={...s,deck,usedCards:[...s.usedCards,card],currentCard:card,activeQuestionMaster:card.rank==='J'?currentPlayerId(s):s.activeQuestionMaster,kingCount:s.kingCount+(card.rank==='K'?1:0),reactionTimes:{}};
 return {...n,event:eventFor(n,currentPlayerId(n))};
}
export const setEvent=(s:GameState,event:GameEvent|null):GameState=>({...s,event});
export function endEvent(s:GameState):GameState{
 return s.deck.length===0?{...s,event:null,status:'over'}:{...s,event:null,turn:(s.turn+1)%s.playerOrder.length};
}
export const addRule=(s:GameState,t:string):GameState=>t.trim()?{...s,activeRules:[...s.activeRules,t.trim()]}:s;
export function setPartner(s:GameState,a:string,b:string):GameState{
 if(a===b)return s;
 return {...s,activePartners:[...s.activePartners.filter(([x,y])=>![x,y].some(i=>i===a||i===b)),[a,b]]};
}
export const canPick=(s:GameState,id:string)=>id!==currentPlayerId(s);
export const isDuplicate=(answers:{text:string}[],text:string)=>answers.some(a=>a.text.trim().toLowerCase()===text.trim().toLowerCase());
/** Fastest first; players who never pressed rank last. */
export const rankReactions=(times:Record<string,number>,ids:string[])=>[...ids].sort((a,b)=>(times[a]??Infinity)-(times[b]??Infinity));
