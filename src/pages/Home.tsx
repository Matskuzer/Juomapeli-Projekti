import {ArrowUpDown,BusFront,Flame,Trophy} from 'lucide-react';
import {Btn,Reminder} from '../components/ui';
export type GameId='cheers'|'ravit'|'higher-lower';
export default function Home({onStart,onBusDriver}:{onStart:(game:GameId)=>void;onBusDriver:()=>void}){
 const quit=()=>{window.close();if(!window.closed)window.alert('Your browser does not allow this app to close its tab. Close the tab manually to quit.');};
 return <div className="mx-auto flex min-h-screen max-w-md flex-col gap-8 p-6">
  <header className="pt-10 text-center"><h1 className="bg-gradient-to-r from-fuchsia-400 to-rose-500 bg-clip-text text-6xl font-black tracking-tight text-transparent">JUOMAPELI</h1><p className="mt-2 text-zinc-400">Digital drinking games for your group.</p></header>
  <section className="space-y-4">
   <article className="pop relative overflow-hidden rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-900/60 via-zinc-950 to-red-900/50 p-6 shadow-[0_0_60px_-15px_#d946ef]">
    <Flame className="mb-4 text-rose-400" size={36}/><h2 className="text-4xl font-black">KING'S CUP</h2>
    <p className="mb-6 mt-2 text-zinc-300">52 cards, 13 rules and one frantic reaction round. Choose King's Cup or Big Sip rules before you play.</p><Btn onClick={()=>onStart('cheers')}>Choose King's Cup</Btn>
   </article>
   <article className="pop relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-900/50 via-zinc-950 to-orange-950/60 p-6 shadow-[0_0_60px_-15px_rgba(251,191,36,.5)]">
    <Trophy className="mb-4 text-amber-300" size={36}/><h2 className="text-4xl font-black">RAVIT</h2>
    <p className="mb-6 mt-2 text-zinc-300">Pick a suit, place your bets and race four aces to the finish.</p><Btn tone="amber" onClick={()=>onStart('ravit')}>Choose Ravit</Btn>
   </article>
   <article className="pop relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/70 via-zinc-950 to-blue-950/50 p-6">
    <ArrowUpDown className="mb-4 text-cyan-300" size={36}/><h2 className="text-4xl font-black">HIGHER OR LOWER</h2>
    <p className="mb-6 mt-2 text-zinc-300">Guess a card's rank. Miss twice and the dealer passes the deck.</p><Btn tone="ghost" onClick={()=>onStart('higher-lower')}>Choose Higher or Lower</Btn>
   </article>
   <article className="pop rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/70 via-zinc-950 to-blue-950/60 p-6">
    <BusFront className="mb-3 text-cyan-300" size={34}/><h2 className="text-3xl font-black">BUS DRIVER</h2>
    <p className="mb-5 mt-2 text-zinc-300">Ride the Bus together: guess, play the pyramid and face the final challenge.</p>
    <Btn onClick={onBusDriver} className="bg-gradient-to-r from-cyan-700 to-blue-700 shadow-none">Create or join a room</Btn>
   </article>
  </section>
  <button onClick={quit} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold text-zinc-300 hover:bg-white/15 hover:text-white"><span aria-hidden="true">×</span>Quit</button>
  <div className="mt-auto"><Reminder/></div></div>;
}
