/* FACE MIGRATION — DOM terrain engine. Original artwork never geometrically altered. */
(() => {
'use strict';
if (window.__walker?.version === 'migration-2') return;
const SZ=28,R=SZ/2,TICK=1000/60,GRAV=.35,MAX_FALL=11;
const host=document.createElement('div');host.id='face-actors';host.style.cssText='position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483000';
const shadow=host.attachShadow({mode:'open'});
const st=document.createElement('style');
st.textContent='.actor{position:absolute;width:28px;height:28px;pointer-events:auto;touch-action:none;cursor:grab;user-select:none;will-change:transform}.disc{width:100%;height:100%;background:center/contain no-repeat url("Face-svg.svg");transform-origin:center}.actor:active{cursor:grabbing}';
shadow.append(st);const stage=document.createElement('div');shadow.append(stage);
document.documentElement.append(host);
const PALETTE=['red','blue','green','orange'];
const images={black:'Face-svg.svg',red:'Face-red.svg',blue:'Face-blue.svg',orange:'Face-orange.svg',green:'Face-green.svg'};
const people=[];let surfaces=[],changed=true,last=performance.now(),escaped=0;
const emit=()=>dispatchEvent(new CustomEvent('facelemmings',{detail:{count:people.filter(p=>p.alive).length,escaped,total:people.length}}));
const skip=n=>n===host || n.closest?.('#face-actors') || n.closest?.('[data-face-ignore]');
const pick=(p,x)=>surfaces.filter(s=>s.l<x+R*.45&&s.r>x-R*.45&&s.kind!=='exit').sort((a,b)=>a.t-b.t);
function scan(){
  const out=[];const add=(el,rect,kind)=>{if(rect.width<3||rect.height<1)return;out.push({el,kind,l:rect.left+scrollX,r:rect.right+scrollX,t:rect.top+scrollY,b:rect.bottom+scrollY,dir:el.dataset?.dir==='left'?-1:1});};
  for(const el of document.body.querySelectorAll('*')){
    if(skip(el))continue;
    const c=getComputedStyle(el),b=el.getBoundingClientRect();
    if(c.visibility==='hidden'||c.display==='none'||+c.opacity===0||!b.width||!b.height)continue;
    const special=el.dataset.face;
    if(special){add(el,b,special);continue;}
    if(el.matches('img,video,canvas,iframe,button,input,textarea,select,hr,[data-face-platform]')){add(el,b,'box');continue;}
    const border=['Top','Right','Bottom','Left'].some(s=>parseFloat(c['border'+s+'Width'])>0&&c['border'+s+'Style']!=='none');
    if(border||c.backgroundImage!=='none'||c.backgroundColor!=='rgba(0, 0, 0, 0)'&&c.backgroundColor!=='transparent'){
      if(b.width*b.height<innerWidth*innerHeight*.42 && !el.matches('body,main,section,header,footer,article'))add(el,b,'box');
    }
  }
  const tree=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.textContent.trim()&&!skip(n.parentElement)&&!/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(n.parentElement.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const range=document.createRange();let t;
  while(t=tree.nextNode()){range.selectNodeContents(t);for(const rect of range.getClientRects())add(t.parentElement,rect,'text');}
  surfaces=out;changed=false;
}
const topAt=(s,x)=>{
  if(s.kind==='ramp-up')return s.b-(Math.max(0,Math.min(1,(x-s.l)/(s.r-s.l)))*(s.b-s.t));
  if(s.kind==='ramp-down')return s.t+(Math.max(0,Math.min(1,(x-s.l)/(s.r-s.l)))*(s.b-s.t));
  return s.t;
};
const suitable=s=>!['exit'].includes(s.kind);
function getLanding(x,oldY,newY){
  let best=null,lowest=Infinity;
  for(const s of surfaces){
    if(!suitable(s)||x+R*.5<s.l||x-R*.5>s.r)continue;
    const y=topAt(s,x);
    if(oldY<=y+6&&newY>=y-1&&y<lowest){best=s;lowest=y;}
  }
  return best;
}
function inSolid(p){return surfaces.find(s=>s.kind==='box'&&p.x>s.l+2&&p.x<s.r-2&&p.y>s.t+5&&p.y<s.b);}
function rescue(p){
  // Pointer drops inside filled rectangles are projected onto their top.
  const hit=inSolid(p);
  if(hit){p.y=hit.t;p.vy=0;p.on=hit;p.dir=p.x>(hit.l+hit.r)/2?-1:1;return;}
  const above=surfaces.filter(s=>s.kind!=='exit'&&p.x>s.l&&p.x<s.r&&Math.abs(topAt(s,p.x)-p.y)<R).sort((a,b)=>Math.abs(topAt(a,p.x)-p.y)-Math.abs(topAt(b,p.x)-p.y))[0];
  if(above){p.y=topAt(above,p.x);p.on=above;p.vy=0;return;}
  p.on=null;p.vy=Math.min(2,p.vy);
}
function setBirthColor(p,color){
  p.color=color;
  // One permanent dark-ink SVG per Face; no movement-based coloring or glow.
  p.disc.style.backgroundImage='url("'+new URL(images[color], document.baseURI).href+'")';
}
function draw(p){
  p.el.style.transform='translate3d('+ (p.x-R).toFixed(1)+'px,'+(p.y-SZ).toFixed(1)+'px,0)';
  p.disc.style.transform='rotate('+p.angle.toFixed(1)+'deg)';
}
function add(){
  if(changed)scan();
  const n=people.length,el=document.createElement('div');el.className='actor';el.setAttribute('aria-label','Rolling Face');
  const disc=document.createElement('div');disc.className='disc';el.append(disc);stage.append(el);
  const station=document.querySelector('[data-face-spawn]');
  const bounds=station?.getBoundingClientRect();
  const x=bounds?Math.max(R,Math.min(document.documentElement.scrollWidth-R,bounds.left+scrollX+40+(n%6)*7)):scrollX+innerWidth/2+(n%7-3)*30;
  const y=bounds?bounds.bottom+scrollY-4:scrollY+70;
  const p={el,disc,x,y,vx:0,vy:0,angle:0,dir:n%2? -1:1,on:null,held:false,alive:true,trail:[],color:null,stalled:0,lastY:y};
  setBirthColor(p,PALETTE[n % PALETTE.length]);people.push(p);
  function move(e){if(!p.held)return;p.x=e.clientX+scrollX;p.y=e.clientY+scrollY+R;p.trail.push({x:p.x,y:p.y,t:e.timeStamp});p.trail=p.trail.filter(v=>e.timeStamp-v.t<=120);draw(p);}
  el.addEventListener('pointerdown',e=>{e.preventDefault();p.held=true;p.on=null;p.trail=[];el.setPointerCapture(e.pointerId);move(e);});
  el.addEventListener('pointermove',move);
  const release=()=>{if(!p.held)return;p.held=false;const a=p.trail[0],b=p.trail.at(-1);const span=b&&a?b.t-a.t:0;if(span>0){p.vx=Math.max(-6,Math.min(6,(b.x-a.x)*16/span));p.vy=Math.max(-9,Math.min(9,(b.y-a.y)*16/span));}else{p.vx=0;p.vy=.5;}if(p.vx)p.dir=Math.sign(p.vx);rescue(p);};
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);draw(p);emit();return p;
}
function retire(p){p.alive=false;p.el.remove();escaped++;emit();}
function step(p,dt){
 if(p.held||!p.alive)return;
 const prevX=p.x,prevY=p.y;
 // Exit detection includes overlapping a real exit rather than touching the whole bottom of the page.
 for(const s of surfaces){if(s.kind==='exit'&&p.x>s.l-8&&p.x<s.r+8&&p.y>s.t-10&&p.y<s.b+R){retire(p);return;}}
 const on=p.on;
 if(on){
   const surface=surfaces.includes(on)?on:null;if(!surface){p.on=null;p.vy=.3;}
   else{
     const speed=on.kind==='boost'?2.8:1;
     const drift=on.kind==='boost'?on.dir*1.8:0;
     p.x+=(p.dir*.95*speed+drift)*dt;
     if(p.x<=on.l+R*.25||p.x>=on.r-R*.25){p.on=null;p.vy=.3;}
     else p.y=topAt(on,p.x);
     if(on.kind==='spring'){p.on=null;p.vy=-10;p.vx=p.dir*1.9;}
   }
 }else{
   p.vy=Math.min(MAX_FALL,p.vy+GRAV*dt);
   const parts=Math.max(1,Math.ceil(Math.max(Math.abs(p.vx),Math.abs(p.vy))*dt/4));
   for(let j=0;j<parts;j++){
     p.x+=(p.vx||p.dir*.12)*dt/parts;
     let ny=p.y+p.vy*dt/parts;
     const s=p.vy>=0?getLanding(p.x,p.y,ny):null;
     if(s){p.y=topAt(s,p.x);p.on=s;p.vy=0;p.vx=0;break;}
     p.y=ny;
   }
 }
 if(p.x<R){p.x=R;p.dir=1;p.vx=Math.abs(p.vx)*.3;}
 const mx=document.documentElement.scrollWidth-R;
 if(p.x>mx){p.x=mx;p.dir=-1;p.vx=-Math.abs(p.vx)*.3;}
 p.angle+=(p.x-prevX)*180/(Math.PI*R)+(p.on?0:dt*1.2);
 if(Math.abs(p.x-prevX)<.15&&Math.abs(p.y-prevY)<.15)p.stalled++;else p.stalled=0;
 if(p.stalled>45){p.dir*=-1;p.on=null;p.vy=.8;p.x+=p.dir*3;p.stalled=0;}
 if(p.y>document.documentElement.scrollHeight+70){p.y=scrollY+innerHeight-50;p.vy=0;p.on=null;}
 draw(p);
}
function clear(){for(const p of people)p.el.remove();people.length=0;escaped=0;emit();}
let prev=performance.now();
function frame(now){const dt=Math.min(2.5,Math.max(.25,(now-prev)/TICK));prev=now;if(!document.hidden){if(changed)scan();for(const p of people)step(p,dt);}requestAnimationFrame(frame);}
const obs=new MutationObserver(()=>changed=true);
obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});
addEventListener('resize',()=>changed=true);addEventListener('scroll',()=>changed=true,{passive:true});
if(document.fonts)document.fonts.ready.then(()=>changed=true);
window.__walker=window.__faceLemmings={version:'migration-2',add,clear,get count(){return people.filter(p=>p.alive).length;},get escaped(){return escaped;},refresh(){changed=true;}};
emit();requestAnimationFrame(frame);
})();