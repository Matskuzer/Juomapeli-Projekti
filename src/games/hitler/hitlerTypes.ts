export type Suit='♠'|'♥'|'♦'|'♣';
export const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'] as const;
export type Rank=typeof RANKS[number];
export interface Card{id:string;rank:Rank;suit:Suit}
export type Gender='female'|'male'|'unspecified';
export type KingMode='cup'|'bigSip';
export interface Player{id:string;name:string;gender:Gender}
export interface Drink{id:string;sips:number}
export type GameEvent=
 |{type:'waterfall';done:string[]}
 |{type:'pick';purpose:'two'|'partner'|'king'}
 |{type:'result';title:string;note?:string;drinks:Drink[]}
 |{type:'hitler';phase:'countdown'|'go'|'results';startedAt:number}
 |{type:'counting';i:number}
 |{type:'category';mode:'normal'|'elimination';category:string|null;remaining:number;phase:'choose'|'play'|'penalty';penalty:number}
 |{type:'dj';phase:'ready'|'playing'|'results';playerId:string;startedAt:number;songGuesser:string|null;artistGuesser:string|null;timedOut:boolean}
 |{type:'kingPour';playerId:string}
 |{type:'kingsCup';playerId:string}
 |{type:'rule'}
 |{type:'questionMaster';masterId:string};
export interface GameState{
 players:Player[];playerOrder:string[];turn:number;deck:Card[];usedCards:Card[];
 currentCard:Card|null;activeRules:string[];activePartners:[string,string][];
 activeQuestionMaster:string|null;kingMode:KingMode;
 status:'playing'|'over';kingCount:number;reactionTimes:Record<string,number>;event:GameEvent|null;
}
