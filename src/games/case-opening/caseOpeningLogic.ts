export type CasePlayer={id:string;name:string};
export type Rarity='standard'|'rare'|'epic'|'legendary'|'mythic';
export type CaseSkin={player:CasePlayer;rarity:Rarity};
export type CaseRoll={items:CaseSkin[];winner:CaseSkin};

export const ROLL_STOP_INDEX=34;
const ROLL_LENGTH=40;
const RARITIES:readonly Rarity[]=['standard','rare','epic','legendary','mythic'];
export const RARITY_ODDS:Record<Rarity,number>={
 standard:55,
 rare:25,
 epic:13,
 legendary:4,
 mythic:3,
};

function randomValue(random:()=>number):number{
 const value=random();
 if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Random value must be between 0 and 1.');
 return value;
}

function randomRarity(random:()=>number):Rarity{
 const value=randomValue(random)*100;
 let threshold=0;
 for(const rarity of RARITIES){
  threshold+=RARITY_ODDS[rarity];
  if(value<threshold)return rarity;
 }
 return 'mythic';
}

export function createCaseRoll(players:CasePlayer[],random:()=>number=Math.random):CaseRoll{
 if(players.length<2)throw new RangeError('Add at least two players before opening the case.');
 const winnerPlayer=players[Math.floor(randomValue(random)*players.length)];
 const items=Array.from({length:ROLL_LENGTH},(_,index)=>({
  player:index===ROLL_STOP_INDEX?winnerPlayer:players[Math.floor(randomValue(random)*players.length)],
  rarity:randomRarity(random),
 }));
 return {items,winner:items[ROLL_STOP_INDEX]};
}

export const RARITY_STYLES:Record<Rarity,{label:string;frame:string;glow:string}>={
 standard:{label:'STANDARD',frame:'border-sky-400/70 bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#38bdf8]'},
 rare:{label:'RARE',frame:'border-violet-400/70 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#a78bfa]'},
 epic:{label:'EPIC',frame:'border-fuchsia-400/70 bg-gradient-to-br from-fuchsia-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#e879f9]'},
 legendary:{label:'LEGENDARY',frame:'border-rose-400/70 bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#fb7185]'},
 mythic:{label:'MYTHIC',frame:'border-amber-300/80 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_30px_-8px_#fcd34d]'},
};

export const CASE_RARITIES=RARITIES;
