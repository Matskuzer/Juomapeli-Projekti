import type {ReactNode} from 'react';
type Tone='primary'|'ghost'|'danger';
export function Btn({children,onClick,disabled,tone='primary',className=''}:{children:ReactNode;onClick?:()=>void;disabled?:boolean;tone?:Tone;className?:string}){
  const t:Record<Tone,string>={primary:'bg-gradient-to-r from-fuchsia-600 to-rose-600 shadow-[0_0_30px_-5px_rgba(217,70,239,.7)]',ghost:'bg-white/10 border border-white/10',danger:'bg-red-600 shadow-[0_0_30px_-5px_rgba(239,68,68,.8)]'};
  return <button disabled={disabled} onClick={onClick} className={`min-h-14 w-full rounded-2xl px-5 text-lg font-black uppercase tracking-wide text-white transition active:scale-95 disabled:opacity-40 ${t[tone]} ${className}`}>{children}</button>;
}
export const Reminder=()=><p className="px-6 pb-4 text-center text-xs text-zinc-500">Please drink responsibly. Sips only, skip any turn you want, and never drink and drive. 18+.</p>;
