import {useState} from 'react';
import {ArrowLeft,Flag,RotateCcw,Trophy} from 'lucide-react';
import {Btn,Reminder} from '../../components/ui';
import {createGame,drawCard,startRace,updateBet} from './ravitGameLogic';
import {FINISH_POSITION,SUITS} from './ravitTypes';
import type {GameState,Player,Suit} from './ravitTypes';

const SUIT_NAMES:Record<Suit,string>={'♠':'Spades','♥':'Hearts','♦':'Diamonds','♣':'Clubs'};
const isRed=(suit:Suit)=>suit==='♥'||suit==='♦';
const cardTone=(suit:Suit)=>isRed(suit)?'text-rose-400':'text-zinc-100';
function SuitCard({suit,rank='A'}:{suit:Suit;rank?:string}){
 return <div className={`flex h-12 w-9 shrink-0 flex-col items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-black shadow-lg ${isRed(suit)?'text-red-600':'text-zinc-900'}`}><span>{rank}</span><span className="text-lg leading-4">{suit}</span></div>;
}
function TrackCard({card,hidden}:{card?:GameState['trackCards'][number];hidden:boolean}){
 if(hidden)return <div aria-label="Face-down track card" className="flex aspect-[2/3] w-full items-center justify-center rounded-lg border border-amber-300/30 bg-amber-950/70 text-xs text-amber-200">?</div>;
 if(!card)return null;
 return <div className={`flex aspect-[2/3] w-full flex-col items-center justify-center rounded-lg border border-white/20 bg-white text-xs font-black ${isRed(card.suit)?'text-red-600':'text-zinc-900'}`}><span>{card.rank}</span><span className="text-lg">{card.suit}</span></div>;
}
export default function RavitGame({players,onExit,onRestart}:{players:Player[];onExit:()=>void;onRestart:()=>void}){
 const [state,setState]=useState<GameState>(()=>createGame(players));
 const start=()=>setState(current=>startRace(current));
 const draw=()=>setState(current=>drawCard(current));
 const bettors=state.winner?players.filter(player=>state.bets[player.id]?.suit===state.winner):[];
 const losers=state.winner?players.filter(player=>state.bets[player.id]?.suit!==state.winner):[];

 return <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-4">
  <header className="flex items-center justify-between text-sm text-zinc-400">
   <button aria-label="Back to player setup" onClick={onExit} className="flex items-center gap-2 rounded-xl p-2 hover:text-white"><ArrowLeft size={18}/>Back</button>
   <span className="rounded-full bg-amber-500/15 px-3 py-1 font-bold text-amber-200">{state.deck.length} cards left</span>
  </header>

  {state.status==='betting'&&<main className="pop flex flex-1 flex-col gap-4">
   <div className="text-center"><Trophy className="mx-auto mb-2 text-amber-300" size={32}/><p className="text-xs uppercase tracking-[.3em] text-amber-200">The race is on</p><h1 className="text-4xl font-black">Place your bets</h1></div>
   <p className="rounded-2xl border border-amber-400/20 bg-amber-950/30 p-4 text-center text-sm text-zinc-200">Each player picks a horse and a stake. Before the race, drink half your stake.</p>
   <section className="space-y-2">{players.map(player=>{
    const bet=state.bets[player.id];
    return <div key={player.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl bg-white/5 p-3">
     <span className="min-w-0 truncate font-bold">{player.name}<span className="ml-2 block text-xs font-normal text-zinc-400">Drink {bet.stake/2} before the race</span></span>
     <label className="sr-only" htmlFor={`horse-${player.id}`}>Horse for {player.name}</label>
     <select id={`horse-${player.id}`} value={bet.suit} onChange={event=>setState(current=>updateBet(current,player.id,event.target.value as Suit,bet.stake))} className="h-11 max-w-32 rounded-xl border border-white/10 bg-zinc-900 px-2 text-sm font-bold outline-none focus:border-amber-400">{SUITS.map(suit=><option key={suit} value={suit}>{SUIT_NAMES[suit]} {suit}</option>)}</select>
     <label className="flex items-center gap-1 text-xs text-zinc-400">Stake
      <input aria-label={`${player.name} stake in sips`} type="number" min={1} max={100} step={1} value={bet.stake} onChange={event=>setState(current=>updateBet(current,player.id,bet.suit,Math.min(100,Math.max(1,Math.floor(Number(event.target.value)||1)))))} className="h-11 w-16 rounded-xl border border-white/10 bg-black/40 px-2 text-center text-base font-bold text-white outline-none focus:border-amber-400"/>
     </label>
    </div>;
   })}</section>
   <p className="text-center text-xs text-zinc-500">If your horse wins, give the losing players sips equal to your stake.</p>
   <div className="mt-auto"><Btn tone="amber" onClick={start}>Start the race</Btn></div>
  </main>}

  {state.status==='racing'&&<main className="pop flex flex-1 flex-col gap-4">
   <div className="text-center"><p className="text-xs uppercase tracking-[.3em] text-amber-200">Ravit</p><h1 className="text-4xl font-black">The race</h1></div>
   <section aria-label="Racetrack" className="space-y-2 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-950/60 to-zinc-950 p-4">
    <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Start</p><p className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-amber-200">Finish <Flag size={14}/></p></div>
    {SUITS.map(suit=><div key={suit} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2">
     <div className={`text-center text-2xl ${cardTone(suit)}`} aria-label={SUIT_NAMES[suit]}>{suit}</div>
     <div className="grid grid-cols-9 overflow-hidden rounded-lg border border-white/10 bg-black/30">
      {Array.from({length:FINISH_POSITION+1},(_,index)=><div key={index} className={`relative flex h-11 items-center justify-center border-r border-white/10 last:border-r-0 ${index===FINISH_POSITION?'bg-amber-400/10':''}`}>
       {index===state.positions[suit]&&<div className="pop z-10"><SuitCard suit={suit}/></div>}
       {index===FINISH_POSITION&&<Flag size={14} className="absolute right-1 text-amber-300/60"/>}
       {index!==state.positions[suit]&&index>0&&<span className="text-[10px] text-white/20">{index}</span>}
      </div>)}
     </div>
    </div>)}
   </section>
   <section className="rounded-2xl bg-white/5 p-4">
    <div className="mb-3 flex items-center justify-between"><h2 className="font-black">Track cards</h2><span className="text-xs text-zinc-400">{state.revealedTrackCount} / {state.trackCards.length} revealed</span></div>
    <div className="grid grid-cols-8 gap-1.5">{state.trackCards.map((card,index)=><TrackCard key={card.id} card={card} hidden={index>=state.revealedTrackCount}/>)}</div>
    <p className="mt-3 text-center text-xs text-zinc-400">When all four horses pass the next card, its suit falls back one space.</p>
   </section>
   <div className="flex items-center justify-center gap-4 rounded-2xl bg-black/20 p-3">
    {state.lastCard?<><SuitCard suit={state.lastCard.suit} rank={state.lastCard.rank}/><p className="text-sm"><b>{SUIT_NAMES[state.lastCard.suit]}</b> horse moves forward one space.</p></>:<p className="text-sm text-zinc-400">Waiting for the announcer to draw a card.</p>}
   </div>
   {state.revealedThisTurn.map(card=><p key={card.id} className="rounded-xl bg-amber-500/10 p-3 text-center text-sm text-amber-100">Track card {card.rank}{card.suit}: the {SUIT_NAMES[card.suit]} horse moves back one space.</p>)}
   <div className="mt-auto"><Btn tone="amber" onClick={draw}>Draw next card</Btn></div>
  </main>}

  {state.status==='over'&&state.winner&&<main className="pop flex flex-1 flex-col justify-center gap-5 text-center">
   <Trophy className="mx-auto text-amber-300" size={44}/><p className="text-xs uppercase tracking-[.3em] text-amber-200">Race finished</p><h1 className="text-5xl font-black">Winner!</h1>
   <div className="mx-auto flex items-center gap-3 rounded-3xl border border-amber-300/30 bg-amber-950/40 p-5"><SuitCard suit={state.winner}/><div className={`text-4xl font-black ${cardTone(state.winner)}`}>{SUIT_NAMES[state.winner]}</div></div>
   <section className="space-y-2 text-left">
    {bettors.map(player=><div key={player.id} className="rounded-2xl bg-emerald-500/10 p-4"><p className="font-bold text-emerald-200">{player.name} backed the winning horse</p><p className="text-sm text-zinc-300">Give {state.bets[player.id].stake} sips to the losing players, divided however you like.</p></div>)}
    {losers.map(player=><div key={player.id} className="rounded-2xl bg-rose-500/10 p-4"><p className="font-bold text-rose-200">{player.name} backed a losing horse</p><p className="text-sm text-zinc-300">Drink another {state.bets[player.id].stake/2} sips (you already drank this much before the race).</p></div>)}
    {losers.length===0&&<p className="rounded-2xl bg-white/5 p-4 text-sm text-zinc-300">Everyone backed the winning horse, so there are no losing players to receive the winners' sips.</p>}
   </section>
   <div className="space-y-3"><Btn tone="amber" onClick={onRestart}><RotateCcw className="mr-2 inline" size={18}/>Race again</Btn><button onClick={onExit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold"><ArrowLeft size={18}/>Back</button></div>
  </main>}
  <Reminder/>
 </div>;
}