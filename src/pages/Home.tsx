import {Flame,Trophy} from 'lucide-react';
import {Btn,Reminder} from '../components/ui';
export type GameId='cheers'|'ravit';
export default function Home({onStart}:{onStart:(game:GameId)=>void}){
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
  </section>
  <button onClick={quit} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold text-zinc-300 hover:bg-white/15 hover:text-white"><span aria-hidden="true">×</span>Quit</button>
  <div className="mt-auto"><Reminder/></div></div>;
}
