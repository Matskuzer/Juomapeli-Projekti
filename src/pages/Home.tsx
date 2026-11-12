import {ArrowUpRight,BookOpen,Clock3,Gauge,Sparkles,Users} from 'lucide-react';
import {Reminder} from '../components/ui';
export type GameId='cheers'|'ravit'|'higher-lower'|'bus';
export default function Home({onStart,onCaseOpening,onPrivacyPolicy}:{onStart:(game:GameId)=>void;onCaseOpening:()=>void;onPrivacyPolicy:()=>void}){
 const quit=()=>{window.close();if(!window.closed)window.alert('Your browser does not allow this app to close its tab. Close the tab manually to quit.');};
 const games=[
  {title:"King's Cup",description:"Draw a card, follow its rule, and see who gets the fourth King.",players:'3+ players',duration:'20–40 min',difficulty:'Easy',action:()=>onStart('cheers'),label:"Play King's Cup",art:<div className="relative h-44 overflow-hidden bg-[#160d20]"><img src="/kings-cup-art.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#100918] via-[#100918]/15 to-transparent"/><span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-white/85">The classic</span><span className="absolute right-4 top-3 text-3xl text-white/80">♠</span></div>},
  {title:'Ace Race',description:'Back a suit, reveal the track cards, and cheer your ace to the finish.',players:'2+ players',duration:'10–15 min',difficulty:'Easy',action:()=>onStart('ravit'),label:'Play Ace Race',art:<div className="group relative h-44 overflow-hidden bg-[#24103d]"><img src="/ace-race-art.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#100918]/60 via-transparent to-transparent"/></div>},
  {title:'Higher or Lower',description:"Guess the hidden card's rank. Miss twice and pass the deck.",players:'2+ players',duration:'15–25 min',difficulty:'Easy',action:()=>onStart('higher-lower'),label:'Play Higher or Lower',art:<div className="group relative h-44 overflow-hidden bg-[#24103d]"><img src="/higher-lower-art.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#100918]/60 via-transparent to-transparent"/></div>},
  {title:'Beer Opening',description:'Add your friends, spin the bottle, and see who gets picked.',players:'2+ players',duration:'5–10 min',difficulty:'Easy',action:onCaseOpening,label:'Play Beer Opening',art:<div className="group relative h-44 overflow-hidden bg-[#24103d]"><img src="/beer-opening-art.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#100918]/50 via-transparent to-transparent"/></div>},
  {title:'Bus Driver',description:'Play through the guesses, pyramid, and final bus challenge.',players:'1–6 players',duration:'20–30 min',difficulty:'Medium',action:()=>onStart('bus'),label:'Play Bus Driver',art:<div className="group relative h-44 overflow-hidden bg-[#24103d]"><img src="/bus-driver-art.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#100918]/50 via-transparent to-transparent"/></div>},
 ];
 return <div className="home-shell relative isolate min-h-screen overflow-hidden">
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
   <div className="absolute left-8 top-1/4 flex h-44 w-32 -rotate-12 items-center justify-center rounded-2xl border border-[#9425F6]/30 bg-gradient-to-br from-[#9425F6]/10 to-[#5C12A5]/15 text-[#9425F6]/45 shadow-[0_16px_50px_rgba(148,37,246,0.12)]"><span className="absolute left-3 top-2 text-2xl">♠</span><span className="text-8xl">♠</span><span className="absolute bottom-2 right-3 rotate-180 text-2xl">♠</span></div>
   <div className="absolute right-8 top-1/4 flex h-44 w-32 rotate-12 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-bl from-white/[.08] to-zinc-900/20 text-white/45 shadow-[0_16px_50px_rgba(255,255,255,0.06)]"><span className="absolute left-3 top-2 text-2xl">♥</span><span className="text-8xl">♥</span><span className="absolute bottom-2 right-3 rotate-180 text-2xl">♥</span></div>
   <div className="absolute bottom-1/4 left-8 flex h-44 w-32 rotate-12 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-tr from-white/[.08] to-zinc-900/20 text-white/45 shadow-[0_16px_50px_rgba(255,255,255,0.06)]"><span className="absolute left-3 top-2 text-2xl">♦</span><span className="text-8xl">♦</span><span className="absolute bottom-2 right-3 rotate-180 text-2xl">♦</span></div>
   <div className="absolute bottom-1/4 right-8 flex h-44 w-32 -rotate-12 items-center justify-center rounded-2xl border border-[#9425F6]/30 bg-gradient-to-tl from-[#9425F6]/10 to-[#5C12A5]/15 text-[#9425F6]/45 shadow-[0_16px_50px_rgba(148,37,246,0.12)]"><span className="absolute left-3 top-2 text-2xl">♣</span><span className="text-8xl">♣</span><span className="absolute bottom-2 right-3 rotate-180 text-2xl">♣</span></div>
  </div>
  <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-7">
   <header className="flex flex-col items-center gap-3 border-b border-white/[.08] pb-4">
    <a href="#top" aria-label="KippiX home" className="relative isolate rounded-xl px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 before:absolute before:-inset-x-10 before:-inset-y-5 before:-z-10 before:rounded-[50%] before:bg-[radial-gradient(ellipse,rgba(148,37,246,0.18),rgba(92,18,165,0.07)_42%,transparent_72%)] before:blur-xl">
     <img src="/kippix-full-logo.png" alt="KippiX" className="relative h-32 w-[min(84vw,24rem)] object-contain drop-shadow-[0_0_18px_rgba(148,37,246,0.2)] sm:h-40 sm:w-[28rem]" />
    </a>
    <nav aria-label="Main navigation" className="flex items-center gap-1 rounded-full border border-white/[.08] bg-black/20 p-1">
     <a href="#games" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors duration-200 hover:bg-white/[.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">Games</a>
     <a href="#how-to-play" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 transition-colors duration-200 hover:bg-white/[.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><span className="inline-flex items-center gap-2"><BookOpen size={15}/>How to play</span></a>
    </nav>
   </header>
   <section id="top" className="pb-7 pt-9 sm:pb-9 sm:pt-12">
    <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-violet-300"><Sparkles size={14}/>Make tonight a game</p>
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
     <div><h1 className="max-w-2xl text-4xl font-bold tracking-[-.04em] text-white sm:text-5xl">Pick your kind of <span className="text-violet-300">chaos.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Quick rounds, friendly rivalries, and good times with your group.</p></div>
    </div>
   </section>
   <section id="games" aria-labelledby="games-heading" className="scroll-mt-6">
    <div className="mb-4 flex items-end justify-between gap-3">
     <div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Choose your game</p><h2 id="games-heading" className="mt-1 text-2xl font-bold tracking-tight text-white">The game shelf</h2></div>
     <span className="hidden text-xs text-zinc-500 sm:block">5 games · Pick one to get started</span>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {games.map(game=><button type="button" key={game.title} onClick={game.action} aria-label={`${game.label}. ${game.players}, ${game.duration}, ${game.difficulty} difficulty.`} className="group flex min-h-full flex-col overflow-hidden rounded-3xl border border-white/[.09] bg-[#100e15]/85 text-left shadow-[0_12px_36px_rgba(0,0,0,.2)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-300/35 hover:shadow-[0_18px_48px_rgba(49,22,72,.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300">
      {game.art}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
       <div className="flex items-center gap-3"><h3 className="text-lg font-bold tracking-tight text-white">{game.title}</h3></div>
       <p className="mt-3 min-h-10 flex-1 text-sm leading-5 text-zinc-400">{game.description}</p>
       <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[.07] pt-3 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.04] px-2.5 py-1.5"><Users size={13} className="text-violet-300"/>{game.players}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.04] px-2.5 py-1.5"><Clock3 size={13} className="text-violet-300"/>{game.duration}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.04] px-2.5 py-1.5"><Gauge size={13} className="text-violet-300"/>{game.difficulty}</span>
       </div>
       <div aria-hidden="true" className="mt-4 flex items-center justify-between text-sm font-bold text-violet-200"><span>{game.label}</span><ArrowUpRight size={17} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></div>
      </div>
     </button>)}
    </div>
   </section>
   <section id="how-to-play" aria-labelledby="how-to-play-heading" className="mt-8 scroll-mt-6 rounded-3xl border border-white/[.08] bg-white/[.025] p-5 sm:mt-10 sm:p-6">
    <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Easy to get going</p><h2 id="how-to-play-heading" className="mt-1 text-xl font-bold tracking-tight text-white">How to play</h2></div>
    <ol className="grid gap-4 sm:grid-cols-3">
     <li className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-violet-300/20 bg-violet-400/[.08] text-sm font-bold text-violet-200">1</span><div><h3 className="text-sm font-bold text-white">Pick a game</h3><p className="mt-1 text-sm leading-5 text-zinc-400">Choose the game that suits your group and mood.</p></div></li>
     <li className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-violet-300/20 bg-violet-400/[.08] text-sm font-bold text-violet-200">2</span><div><h3 className="text-sm font-bold text-white">Add your players</h3><p className="mt-1 text-sm leading-5 text-zinc-400">Set up the group together on one shared device.</p></div></li>
     <li className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-violet-300/20 bg-violet-400/[.08] text-sm font-bold text-violet-200">3</span><div><h3 className="text-sm font-bold text-white">Play your way</h3><p className="mt-1 text-sm leading-5 text-zinc-400">Keep it friendly, take breaks, and skip any forfeit.</p></div></li>
    </ol>
   </section>
   <footer className="mt-7 flex flex-col gap-4 border-t border-white/[.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
    <div className="sm:max-w-sm"><Reminder/></div>
    <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-zinc-500 sm:justify-end">
     <button onClick={onPrivacyPolicy} className="rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/[.06] hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">Privacy Policy</button>
     <span aria-hidden="true">·</span><span className="px-2">© {new Date().getFullYear()} KippiX</span>
     <button onClick={quit} className="rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/[.06] hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">Quit</button>
    </div>
   </footer>
  </main>
 </div>;
}
