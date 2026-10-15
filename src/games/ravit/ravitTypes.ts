export type Suit='♠'|'♥'|'♦'|'♣';
export const SUITS:Suit[]=['♠','♥','♦','♣'];
export const FINISH_POSITION=8;
export interface Card{id:string;rank:string;suit:Suit}
export interface Player{id:string;name:string}
export interface Bet{suit:Suit;stake:number}
export interface GameState{
 players:Player[];
 bets:Record<string,Bet>;
 positions:Record<Suit,number>;
 trackCards:Card[];
 revealedTrackCount:number;
 deck:Card[];
 discardedCards:Card[];
 lastCard:Card|null;
 revealedThisTurn:Card[];
 winner:Suit|null;
 status:'betting'|'racing'|'over';
}
