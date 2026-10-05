// Neutral Monte Carlo forecast: each future game is a 50/50 event.
// Saved scores are fixed. Full ties split one title share equally.
export function titleChances(count,matches,total,iterations=6000){
 const base=Array.from({length:count},()=>({g:0,s:0,v:0})),pending=[];
 const add=(rows,m,a,b)=>{for(const [team,x,y] of [[m.a,a,b],[m.b,b,a]])for(const id of team){rows[id].g+=x;rows[id].s+=x-y;rows[id].v+=x>y?1:0;}};
 let seed=2166136261;
 const key=JSON.stringify([count,total,matches.map(m=>[m.a,m.b,m.saved?m.scoreA:null,m.saved?m.scoreB:null])]);
 for(let i=0;i<key.length;i++)seed=Math.imul(seed^key.charCodeAt(i),16777619)>>>0;
 const random=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
 for(const m of matches){if(m.saved&&m.scoreA!==''&&m.scoreB!==''&&Number.isInteger(+m.scoreA)&&Number.isInteger(+m.scoreB)&&+m.scoreA>=0&&+m.scoreB>=0&&+m.scoreA + +m.scoreB===total)add(base,m,+m.scoreA,+m.scoreB);else pending.push(m)}
 const compare=(a,b)=>a.g-b.g||a.s-b.s||a.v-b.v;
 const credit=rows=>{let leaders=[0];for(let i=1;i<count;i++){const c=compare(rows[i],rows[leaders[0]]);if(c>0)leaders=[i];else if(c===0)leaders.push(i)}for(const i of leaders)wins[i]+=1/leaders.length;};
 const wins=Array(count).fill(0),runs=pending.length?iterations:1;
 for(let run=0;run<runs;run++){const rows=base.map(r=>({...r}));for(const m of pending){let a=0;for(let g=0;g<total;g++)a+=random()<.5?1:0;add(rows,m,a,total-a)}credit(rows)}
 return {percent:wins.map(w=>100*w/runs),complete:!pending.length,iterations:runs};
}
