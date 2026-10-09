import type {Card} from '../cheersTypes';
import {isRed} from '../cheersCards';
export function PlayingCard({card}:{card:Card|null}){
 if(!card)return <div className="mx-auto flex h-44 w-32 items-center justify-center rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-900 to-black text-5xl font-black text-fuchsia-300 shadow-[0_0_40px_-8px_#d946ef]">?</div>;
 return <div key={card.id} className={`flip mx-auto flex h-44 w-32 flex-col justify-between rounded-3xl bg-white p-3 shadow-[0_0_50px_-8px_#f0abfc] ${isRed(card)?'text-red-600':'text-zinc-900'}`}><b className="text-2xl leading-none">{card.rank}<br/>{card.suit}</b><span className="text-center text-6xl">{card.suit}</span></div>;
}
