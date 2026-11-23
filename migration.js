/* FACE MIGRATION — one long DOM landscape, not an embeddable widget.
   Terrain is sampled from the real HTML inside #migration-content.
   Every press of #spawnFace releases one authentic, unmodified SVG Face.
*/
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const region = $('migration-content'), finish = $('finish-line'), spawnButton = $('spawnFace');
  if (!region || !finish || !spawnButton) return;
  const SIZE = 26, R = SIZE / 2, SPEED = 1.65, G = .125, MAX_FALL = 7.5;
  const W = () => document.documentElement.clientWidth;
  const world = document.createElement('div');
  world.id = 'migration-actors';
  world.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:1000;pointer-events:none';
  document.body.append(world);
  const faces = [];
  let count = { released:0, arrived:0, lost:0 }, surfaces = [], dirty = true;
  const toDoc = rect => ({ l:rect.left+scrollX, r:rect.right+scrollX, t:rect.top+scrollY, b:rect.bottom+scrollY });
  const bounds = () => region.getBoundingClientRect();
  const isUsable = r => r.r-r.l>12 && r.b-r.t>1;
  const add = (out, r, source) => { const q=toDoc(r);if (isUsable(q)) out.push({...q,source}); };
  function scan() {
    const out=[];
    const s = region.querySelectorAll('img, picture, video, canvas, svg, button, input, textarea, select, blockquote, pre, table, figure, hr, [data-face-platform], .migration-card, .migration-image');
    for (const el of s) {
      if (el.closest('[data-face-ignore]')) continue;
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden')continue;
      // Actual boxes, not wide layout wrappers, become walkable top edges.
      for(const rect of el.getClientRects())add(out,rect,el);
    }
    const walker=document.createTreeWalker(region,NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.textContent.trim() || n.parentElement.closest('[data-face-ignore]')) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION|BUTTON)$/.test(n.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const range=document.createRange();let node;
    while((node=walker.nextNode())) {
      range.selectNodeContents(node);
      for(const rect of range.getClientRects())add(out,rect,node);
    }
    out.sort((a,b)=>a.t-b.t||a.l-b.l);
    // Avoid duplicate rectangles produced by nested markup.
    surfaces=out.filter((q,i)=>!out.slice(Math.max(0,i-5),i).some(p=>Math.abs(p.t-q.t)<1.2 && Math.abs(p.l-q.l)<2 && Math.abs(p.r-q.r)<2));
    dirty=false;
  }
  const display = () => {
    $('releasedCount').textContent=count.released;
    $('arrivedCount').textContent=count.arrived;
    $('lostCount').textContent=count.lost;
  };
  const mark = (p,kind) => {
    if (!p.alive) return;
    p.alive=false;p.el.remove();
    count[kind]++;display();
    $('status').textContent=kind==='arrived'?'A Face has reached its destination. It remains unmoved.':'A Face has left the map.';
  };
  const sampleNext = p => {
    const below = surfaces.filter(s=>s.t>p.y+8 && s.t<p.y+1000 && s.r>8 && s.l<W()-8);
    if(!below.length)return null;
    let winner=null,best=Infinity;
    for(const s of below){
      const center=Math.max(s.l+R,Math.min(s.r-R,p.x));
      const dist=Math.abs(center-p.x),dy=s.t-p.y;
      const score=dy*.7 + dist*.8 + (s.r-s.l<30?60:0);
      if(score<best){best=score;winner=s;}
    }
    return winner;
  };
  const land = (p,s) => {
    p.ground=s;p.y=s.t;p.vy=0;
    const roomRight=s.r-p.x,roomLeft=p.x-s.l;
    p.dir=roomRight>38?1:(roomLeft>38?-1:1);
    p.target=null;
  };
  const getFinishTop = () => finish.getBoundingClientRect().top + scrollY;
  function step(p,dt) {
    if(!p.alive||p.held)return;
    const lastX=p.x,oldY=p.y,stopY=getFinishTop();
    if(p.ground){
      const s=p.ground;
      p.x+=p.dir*SPEED*dt;
      p.y=s.t;
      if(p.x>=s.r-R || p.x<=s.l+R){
        p.ground=null;
        p.target=sampleNext(p);
        p.vy=0.4;
        // The Face tumbles off the ledge toward the next piece of typography.
      }
    } else {
      p.vy=Math.min(MAX_FALL,p.vy+G*dt);
      if(!p.target || p.target.t<p.y-5) p.target=sampleNext(p);
      if(p.target){
        const mid=Math.min(p.target.r-R,Math.max(p.target.l+R,p.x));
        const gap=mid-p.x;
        p.x+=Math.max(-2.4,Math.min(2.4,gap*.035))*dt;
      } else p.x+=p.dir*.35*dt;
      p.y+=p.vy*dt;
      let hit=null;
      if(p.vy>=0){
        // A text line, button, image or box catches a Face only from above.
        for(const s of surfaces){
          if(s.t<oldY-1||s.t>p.y+1)continue;
          if(p.x+R*.35<s.l||p.x-R*.35>s.r)continue;
          if(!hit||s.t<hit.t)hit=s;
        }
      }
      if(hit)land(p,hit);
    }
    p.x=Math.max(R,Math.min(W()-R,p.x));
    p.angle+=(p.x-lastX)*180/(Math.PI*R)+(p.ground?0:dt*1.5);
    p.el.style.transform='translate3d('+(p.x-R).toFixed(1)+'px,'+(p.y-SIZE).toFixed(1)+'px,0) rotate('+p.angle.toFixed(1)+'deg)';
    if(p.y>=stopY)mark(p,'arrived');
    else if(p.y>document.documentElement.scrollHeight+80)mark(p,'lost');
  }
  function spawn(){
    if(dirty)scan();
    const b=$('spawn-station').getBoundingClientRect(), r=region.getBoundingClientRect();
    const x=Math.min(W()-R,Math.max(R,b.left+scrollX+Math.min(100,b.width*.22)));
    const y=b.bottom+scrollY-6;
    const el=document.createElement('div');
    el.className='migration-face';
    el.setAttribute('aria-label','Rolling Face');
    world.append(el);
    const p={el,x,y,vx:0,vy:.5,dir:1,ground:null,target:null,angle:0,alive:true,held:false,trail:[]};
    faces.push(p);count.released++;display();
    // Render immediately so a click visibly creates the Face before any animation frame.
    p.el.style.transform='translate3d('+(p.x-R).toFixed(1)+'px,'+(p.y-SIZE).toFixed(1)+'px,0) rotate(0deg)';
    $('status').textContent='Another Face departs. Its plans are confidential.';
    // Drag and throw remain possible; the content underneath is still interactive.
    const position=e=>{p.x=e.clientX+scrollX;p.y=e.clientY+scrollY+R;p.trail.push({x:p.x,y:p.y,t:e.timeStamp});p.trail=p.trail.filter(z=>e.timeStamp-z.t<130)};
    el.addEventListener('pointerdown',e=>{e.preventDefault();p.held=true;p.ground=null;p.target=null;p.trail=[];el.setPointerCapture(e.pointerId);position(e);});
    el.addEventListener('pointermove',e=>{if(p.held)position(e);});
    const release=e=>{if(!p.held)return;p.held=false;const a=p.trail[0],z=p.trail.at(-1);p.vy=z&&a&&z.t>a.t?Math.min(6,Math.max(-6,(z.y-a.y)/(z.t-a.t)*12)):.5;p.target=sampleNext(p);};
    el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
  }
  function reset(){
    for(const p of faces)p.el.remove();faces.length=0;
    count={released:0,arrived:0,lost:0};display();
    $('status').textContent='The journey begins whenever you wish.';
  }
  $('spawnFace').addEventListener('click',spawn);
  $('spawnMany').addEventListener('click',()=>{for(let i=0;i<5;i++)spawn();});
  $('resetFaces').addEventListener('click',reset);
  const observer=new MutationObserver(()=>{dirty=true;});
  observer.observe(region,{subtree:true,childList:true,characterData:true,attributes:true});
  addEventListener('resize',()=>{dirty=true;});
  addEventListener('load',()=>{dirty=true;});
  if(document.fonts)document.fonts.ready.then(()=>{dirty=true;});
  let previous=performance.now();
  function frame(now){
    const dt=Math.min(2.5,Math.max(.2,(now-previous)/16.67));previous=now;
    if(!document.hidden){
      if(dirty)scan();
      for(const p of faces)step(p,dt);
    }
    requestAnimationFrame(frame);
  }
  display();requestAnimationFrame(frame);
  window.FaceMigration={spawn,reset,get stats(){return {...count};},rescan(){dirty=true;}};
})();