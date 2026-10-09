import {RANKS} from './cheersTypes';
import type {Card,Suit} from './cheersTypes';
export const SUITS:Suit[]=['♠','♥','♦','♣'];
export const createDeck=():Card[]=>SUITS.flatMap(s=>RANKS.map(r=>({id:r+s,rank:r,suit:s})));
export function shuffle<T>(a:T[],rnd:()=>number=Math.random):T[]{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
export const isRed=(c:Card)=>c.suit==='♥'||c.suit==='♦';
