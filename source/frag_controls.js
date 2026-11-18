/* ============ pixel icons (no emoji anywhere) ============ */
const ICON={
  left:["....X.....","...XX.....","..XXXXXXXX",".XXXXXXXXX","XXXXXXXXXX",".XXXXXXXXX","..XXXXXXXX","...XX.....","....X....."],
  up:["....X....","...XXX...","..XXXXX..",".XXXXXXX.","XXXXXXXXX","...XXX...","...XXX...","...XXX...","...XXX..."],
  play:["X......","XX.....","XXX....","XXXX...","XXXXX..","XXXXXX.","XXXXXXX","XXXXXX.","XXXXX..","XXXX...","XXX....","XX.....","X......"],
  pause:["XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX","XXX..XXX"],
  sfxOn:["....X.....","...XX..X..","XXXXX...X.","XXXXX.X.X.","XXXXX.X.X.","XXXXX.X.X.","XXXXX...X.","...XX..X..","....X....."],
  sfxOff:["....X.....","...XX.X..X","XXXXX..XX.","XXXXX..XX.","XXXXX..XX.","XXXXX.X..X","XXXXX.....","...XX.....","....X....."],
  note:["...XXXXXX","...X....X","...X....X","...X....X","XXXX..XXXX","XXXX..XXXX",".XX....XX."],
  heart:[".XX.XX.","XXXXXXX","XXXXXXX",".XXXXX.","..XXX..","...X..."],
  star:["...X...","...X...","..XXX..","XXXXXXX","..XXX..","...X...","...X..."],
  list:["XXXXXXXXX","XXXXXXXXX","........."," XXXXXXX ".replace(/ /g,'.'),"........."]
};
ICON.right=ICON.left.map(r=>r.split('').reverse().join(''));
function pix(map){
  const h=map.length,w=map[0].length;let d='';
  map.forEach((r,y)=>{let x=0;while(x<w){if(r[x]==='X'){let n=1;while(x+n<w&&r[x+n]==='X')n++;d+='M'+x+' '+y+'h'+n+'v1h-'+n+'z';x+=n;}else x++;}});
  return '<svg viewBox="0 0 '+w+' '+h+'" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true" focusable="false"><path d="'+d+'"/></svg>';
}
function paintIcons(root){
  (root||document).querySelectorAll('[data-ic]').forEach(el=>{
    const old=el.querySelector('svg.ic');if(old)old.remove();
    el.insertAdjacentHTML('afterbegin',pix(ICON[el.dataset.ic]).replace('<svg ','<svg class="ic" '));
  });
}
paintIcons();

/* ============ input ============ */
const input={left:false,right:false,jump:false,down:false,jumpBuf:0};
const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',KeyZ:'jump',KeyX:'jump',ArrowDown:'down',KeyS:'down'};
let state='title',paused=false;
addEventListener('keydown',e=>{
  const k=keyMap[e.code];
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)&&state!=='final')e.preventDefault();
  if(e.code==='KeyM'&&!e.repeat){Music.toggle();return;}
  if(e.code==='Escape'||e.code==='KeyP'){if(!e.repeat&&(state==='play'||state==='cut'))togglePause();return;}
  if(state==='title'&&(e.code==='Enter'||e.code==='Space')){startGame();return;}
  if(!k||state==='final')return;
  if(k==='jump'&&!input.jump&&!e.repeat)input.jumpBuf=7;
  input[k]=true;
});
addEventListener('keyup',e=>{const k=keyMap[e.code];if(k)input[k]=false;});
function clearInput(){input.left=input.right=input.jump=input.down=false;$('dpad').querySelectorAll('.arr').forEach(a=>a.classList.remove('on'));$('jumpBtn').classList.remove('on');}
addEventListener('blur',clearInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state==='play'&&!paused)togglePause();}});
document.addEventListener('contextmenu',e=>e.preventDefault());

/* sliding d-pad: one finger can glide from left to right without lifting */
(function bindControls(){
  const dp=$('dpad'),jb=$('jumpBtn');
  const aL=dp.querySelector('[data-d=left]'),aR=dp.querySelector('[data-d=right]');
  let dpId=null,jId=null;
  const setDir=d=>{input.left=d<0;input.right=d>0;aL.classList.toggle('on',d<0);aR.classList.toggle('on',d>0);};
  const read=e=>{const r=dp.getBoundingClientRect();return (e.clientX-r.left)/r.width<.5?-1:1;};
  dp.addEventListener('pointerdown',e=>{e.preventDefault();ac();dpId=e.pointerId;try{dp.setPointerCapture(dpId);}catch(_){}setDir(read(e));});
  dp.addEventListener('pointermove',e=>{if(e.pointerId===dpId)setDir(read(e));});
  const dUp=e=>{if(e.pointerId===dpId){dpId=null;setDir(0);}};
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>dp.addEventListener(n,dUp));
  jb.addEventListener('pointerdown',e=>{e.preventDefault();ac();jId=e.pointerId;try{jb.setPointerCapture(jId);}catch(_){}if(!input.jump)input.jumpBuf=7;input.jump=true;jb.classList.add('on');});
  const jUp=e=>{if(e.pointerId===jId){jId=null;input.jump=false;jb.classList.remove('on');}};
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>jb.addEventListener(n,jUp));
})();
if(matchMedia('(pointer:coarse)').matches)document.body.classList.add('touch');
addEventListener('touchstart',()=>{if(!document.body.classList.contains('touch')){document.body.classList.add('touch');layout();}},{passive:true,once:true});

/* ============ layout (phone portrait, phone landscape, laptop) ============ */
const rootEl=document.documentElement;
function layout(){
  const vw=innerWidth,vh=innerHeight,portrait=vh>vw*1.05;
  const touch=document.body.classList.contains('touch');
  const topPad=portrait?64:0,botPad=(portrait&&touch)?180:0;
  const ah=Math.max(120,vh-topPad-botPad);
  const s0=Math.min(vw/W,ah/H),s=s0>=2?Math.floor(s0):s0;
  const sw=Math.round(W*s),sh=Math.round(H*s);
  const sx=Math.round((vw-sw)/2),sy=portrait?Math.round(topPad+Math.max(0,(ah-sh)*.3)):Math.round((vh-sh)/2);
  const st=rootEl.style;
  st.setProperty('--s',s.toFixed(3));st.setProperty('--sw',sw+'px');st.setProperty('--sh',sh+'px');
  st.setProperty('--sx',sx+'px');st.setProperty('--sy',sy+'px');
  st.setProperty('--pu',(portrait?1.75:clamp(s,1.15,2.3)).toFixed(2));
  document.body.classList.toggle('portrait',portrait);
  if(hooks.fit)hooks.fit();
}
const hooks={};
addEventListener('resize',layout);addEventListener('orientationchange',()=>setTimeout(layout,120));
layout();

