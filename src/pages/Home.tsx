import {Flame} from 'lucide-react';
import {Btn,Reminder} from '../components/ui';
import type {Game} from '../App';
export default function Home({onStart}:{onStart:(game:Game)=>void}){
 return <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between p-6">
  <header className="pt-10 text-center"><h1 className="bg-gradient-to-r from-fuchsia-400 to-rose-500 bg-clip-text text-6xl font-black tracking-tight text-transparent">JUOMAPELI</h1><p className="mt-2 text-zinc-400">Digital drinking games for your group.</p></header>
  <div className="space-y-4">
   <div className="pop relative overflow-hidden rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-900/60 via-zinc-950 to-red-900/50 p-6 shadow-[0_0_60px_-15px_#d946ef]">
    <Flame className="mb-4 text-rose-400" size={36}/><h2 className="text-5xl font-black">HITLER</h2>
    <p className="mb-6 mt-2 text-zinc-300">52 cards, 13 rules and one frantic reaction round. Draw, drink, survive.</p><Btn onClick={()=>onStart('hitler')}>Play Hitler</Btn></div>
   <div className="pop rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/70 via-zinc-950 to-blue-950/50 p-6">
    <h2 className="text-3xl font-black">HIGHER OR LOWER</h2>
    <p className="mb-6 mt-2 text-zinc-300">Guess a card’s rank. Miss twice and the dealer passes the deck.</p><Btn tone="ghost" onClick={()=>onStart('higher-lower')}>Play Higher or Lower</Btn></div>
  </div>
  <Reminder/></div>;
}
