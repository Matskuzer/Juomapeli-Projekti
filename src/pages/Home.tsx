import {ArrowUpDown,BusFront,Flame,PackageOpen,Trophy} from 'lucide-react';
import {Reminder} from '../components/ui';
export type GameId='cheers'|'ravit'|'higher-lower';
export default function Home({onStart,onBusDriver,onCaseOpening}:{onStart:(game:GameId)=>void;onBusDriver:()=>void;onCaseOpening:()=>void}){
 const quit=()=>{window.close();if(!window.closed)window.alert('Your browser does not allow this app to close its tab. Close the tab manually to quit.');};
 const games=[
  {title:"King's Cup",description:"Draw cards, follow the rules and choose King's Cup or Big Sip.",icon:<Flame size={22}/>,theme:'border-fuchsia-400/20 bg-fuchsia-950/20 text-fuchsia-300 hover:border-fuchsia-400/40',action:()=>onStart('cheers'),label:"Play King's Cup"},
  {title:'Ravit',description:'Bet on a suit and race four aces to the finish.',icon:<Trophy size={22}/>,theme:'border-amber-400/20 bg-amber-950/20 text-amber-300 hover:border-amber-400/40',action:()=>onStart('ravit'),label:'Play Ravit'},
  {title:'Higher or Lower',description:"Guess the next card's rank. Miss twice and pass the deck.",icon:<ArrowUpDown size={22}/>,theme:'border-cyan-400/20 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400/40',action:()=>onStart('higher-lower'),label:'Play Higher or Lower'},
  {title:'Case Opening',description:'Add your friends, open a case and see who gets picked.',icon:<PackageOpen size={22}/>,theme:'border-violet-400/20 bg-violet-950/20 text-violet-300 hover:border-violet-400/40',action:onCaseOpening,label:'Open a case'},
  {title:'Bus Driver',description:'Play through the guesses, pyramid and final challenge together.',icon:<BusFront size={22}/>,theme:'border-cyan-400/20 bg-cyan-950/20 text-cyan-300 hover:border-cyan-400/40',action:onBusDriver,label:'Create or join a room'},
 ];
 return <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-7 sm:px-8 sm:py-10">
  <header className="border-b border-white/10 pb-5">
   <div className="flex flex-col items-start">
    <span className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">Siply</span>
    <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-fuchsia-300">Drinking Game</span>
   </div>
  </header>
  <section className="pb-7 pt-8 sm:pt-10">
   <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Choose a game</h1>
   <p className="mt-2 text-sm text-zinc-400">Pick something to play with your group.</p>
  </section>
  <section aria-label="All games" className="flex-1">
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {games.map(game=><article key={game.title} className={`flex min-h-44 flex-col rounded-2xl border bg-white/[.025] p-5 transition-colors ${game.theme}`}>
     <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-black/20">{game.icon}</span><h3 className="font-semibold text-white">{game.title}</h3></div>
     <p className="mt-3 flex-1 text-sm leading-5 text-zinc-400">{game.description}</p>
     <button onClick={game.action} className="mt-4 min-h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-bold text-zinc-100 transition-colors hover:bg-white/[.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{game.label}</button>
    </article>)}
   </div>
  </section>
  <footer className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row">
   <div className="sm:max-w-sm"><Reminder/></div>
   <button onClick={quit} className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[.06] hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400">Quit</button>
  </footer>
 </main>;
}
