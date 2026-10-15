import {useState} from 'react';
import {ArrowLeft} from 'lucide-react';
import type {Player,Rank} from '../cheers/cheersTypes';
import {RANKS} from '../cheers/cheersTypes';
import {Btn,Reminder} from '../../components/ui';
import {PlayingCard} from '../cheers/components/PlayingCard';
import {chooseDealer,createHigherLowerGame,guessRank,isRankComplete,nextHigherLowerRound,rankValue} from './higherLowerGameLogic';

const GUESS_RANKS=RANKS as readonly Rank[];

function CardHistory({cards}:{cards:ReturnType<typeof createHigherLowerGame>['revealedCards']}){
 return <section className="space-y-2 rounded-2xl bg-white/5 p-3">
  <div className="flex items-baseline justify-between gap-2"><h2 className="font-bold">Revealed cards</h2><span className="text-xs text-zinc-400">Ace (1) to King (13)</span></div>
  <ol aria-label="Revealed cards arranged from Ace to King" className="grid grid-cols-7 gap-1">
   {RANKS.map(rank=>{
    const rankCards=cards.filter(card=>card.rank===rank);
    const complete=isRankComplete(cards,rank);
    return <li key={rank} aria-label={`${rank} (${rankValue(rank)}): ${complete?'all four revealed':`${rankCards.length} revealed`}`} className={`flex min-h-16 flex-col items-center justify-between rounded-lg border p-1 ${rankCards.length?'border-cyan-400/30 bg-black/30':'border-dashed border-white/10 bg-black/10'}`}>
     <span className="text-xs font-bold text-cyan-200">{rankValue(rank)}</span>
     <span className="relative h-8 w-8" aria-hidden="true">{complete
      ?rankCards.map((card,index)=><span key={card.id} className="absolute h-7 w-6 rounded border border-cyan-200/70 bg-gradient-to-br from-cyan-700 to-blue-950 shadow" style={{left:`${index*2}px`,top:`${index}px`,zIndex:index}}/>)
      :rankCards.map((card,index)=><span key={card.id} className={`absolute flex h-7 w-6 items-center justify-center rounded border border-zinc-300 bg-white text-xs shadow ${card.suit==='♥'||card.suit==='♦'?'text-red-600':'text-zinc-900'}`} style={{left:`${index*2}px`,top:`${index}px`,zIndex:index}}>{card.suit}</span>)}</span>
     <span className="text-[10px] text-zinc-500">{complete?'Done':rankCards.length||'—'}</span>
    </li>;
   })}
  </ol>
 </section>;
}

export default function HigherLowerGame({players,onExit,onRestart}:{players:Player[];onExit:()=>void;onRestart:()=>void}){
 const [s,setS]=useState(()=>createHigherLowerGame(players));
 const [selectedDealer,setSelectedDealer]=useState<number|null>(null);
 const dealer=s.dealerIndex===null?null:s.players[s.dealerIndex];
 const guesser=s.dealerIndex===null?null:s.players[(s.dealerIndex+1)%s.players.length];
 const revealed=s.phase==='result';
 const exit=()=>{if(window.confirm('Leave this game?'))onExit();};

 if(s.phase==='over')return <div className="pop mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-5 text-center">
  <h1 className="text-4xl font-black text-cyan-300">HIGHER OR LOWER — GAME OVER</h1>
  <p className="text-zinc-300">All 52 cards have been revealed.</p>
  <div className="rounded-2xl bg-white/5 p-4"><div className="text-3xl font-black">{s.revealedCards.length} / 52</div><div className="text-xs text-zinc-400">Cards revealed</div></div>
  <CardHistory cards={s.revealedCards}/>
  <Btn onClick={onRestart}>Play again</Btn><Btn tone="ghost" onClick={onExit}>Edit players</Btn><Reminder/></div>;

 return <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-5">
  <div className="flex items-center justify-between text-sm text-zinc-400">
   <button aria-label="Quit" onClick={exit} className="p-2"><ArrowLeft/></button>
   <h1 className="font-black uppercase tracking-wide text-cyan-300">Higher or Lower</h1>
   <span>{s.phase==='chooseDealer'?52:s.deck.length+(revealed?0:1)} unrevealed</span>
  </div>
  {s.phase==='chooseDealer'?<>
   <section className="space-y-3">
    <h2 className="text-3xl font-black">Choose the dealer</h2>
    <p className="text-zinc-400">The player to the dealer’s left guesses the first card, which stays hidden until the guesses are complete.</p>
    <div className="grid grid-cols-2 gap-2">{players.map((player,index)=><button key={player.id} onClick={()=>setSelectedDealer(index)} className={`min-h-14 rounded-2xl p-3 font-bold ${selectedDealer===index?'bg-cyan-600 ring-2 ring-cyan-300':'bg-white/10'}`}>{player.name}</button>)}</div>
   </section>
   <div className="mt-auto"><Btn disabled={selectedDealer===null} onClick={()=>selectedDealer!==null&&setS(s0=>chooseDealer(s0,selectedDealer))}>Start game</Btn></div>
  </>:<>
   <div className="text-center">
    <p className="text-xs uppercase tracking-widest text-zinc-500">Card {s.revealedCards.length+(revealed?0:1)} of 52</p>
    <p className="mt-2 text-sm text-zinc-400">Dealer</p><h2 className="text-3xl font-black">{dealer?.name}</h2>
    <p className="mt-3 text-sm text-zinc-400">Guessing player</p><h3 className="text-2xl font-bold text-cyan-200">{guesser?.name}</h3>
   </div>
   {revealed?<PlayingCard card={s.currentCard}/>:<div className="mx-auto flex h-44 w-32 items-center justify-center rounded-3xl border border-cyan-400/50 bg-gradient-to-br from-cyan-950 to-zinc-950 text-5xl font-black text-cyan-300 shadow-[0_0_40px_-8px_#22d3ee]">?</div>}
   <CardHistory cards={s.revealedCards}/>
   {s.phase==='firstGuess'&&<section className="space-y-3 text-center">
    <p className="text-zinc-300">Guess the rank of the hidden card. Ace is low (1).</p>
    <div className="grid grid-cols-4 gap-2">{GUESS_RANKS.map(rank=><button key={rank} disabled={isRankComplete(s.revealedCards,rank)} onClick={()=>setS(x=>guessRank(x,rank))} className="min-h-12 rounded-xl bg-white/10 font-bold hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-30">{rank}</button>)}</div>
   </section>}
   {s.phase==='secondGuess'&&<section className="space-y-3 text-center">
    <p className="text-zinc-300">Incorrect. The hidden card is <b className="text-cyan-300">{s.hint}</b> than {s.firstGuess}.</p>
    <p className="font-bold">Guess again</p>
    <div className="grid grid-cols-4 gap-2">{GUESS_RANKS.map(rank=><button key={rank} disabled={isRankComplete(s.revealedCards,rank)} onClick={()=>setS(x=>guessRank(x,rank))} className="min-h-12 rounded-xl bg-white/10 font-bold hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-30">{rank}</button>)}</div>
   </section>}
   {revealed&&<section className="pop space-y-3 rounded-2xl bg-white/5 p-4 text-center">
    <h3 className="text-2xl font-black">{s.currentCard?.rank} {s.currentCard?.suit}</h3>
    <p>{s.firstGuess===s.currentCard?.rank?'Correct first guess!':s.dealerSips>0?'Correct second guess!':'Two incorrect guesses.'}</p>
    {s.dealerSips>0&&<p>{dealer?.name} drinks <b className="text-cyan-300">{s.dealerSips} sip{s.dealerSips===1?'':'s'}.</b></p>}
    {s.firstGuess!==s.currentCard?.rank&&s.currentCard&&s.firstGuess&&<p>{guesser?.name} drinks <b className="text-cyan-300">{s.playerSips} sip{s.playerSips===1?'':'s'}.</b></p>}
    <Btn onClick={()=>setS(nextHigherLowerRound)}>{s.deck.length?'Next player':'Finish game'}</Btn>
   </section>}
  </>}
  <div className="mt-auto"><Reminder/></div>
 </div>;
}
