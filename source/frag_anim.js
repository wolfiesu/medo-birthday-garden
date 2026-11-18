/* ============ Medo animation ============ */
function drawMedoFrame(c,name,x,feetY,sc,flip){
  const i=FIDX[name];if(i==null)return;
  const fw=SHEET.fw,fh=SHEET.fh;
  const sx=(i%SHEET.cols)*fw,sy=Math.floor(i/SHEET.cols)*fh;
  const dw=fw*sc,dh=fh*sc;
  c.save();c.imageSmoothingEnabled=false;
  c.translate(Math.round(x),Math.round(feetY-(SHEET.oy+70)*sc));
  if(flip)c.scale(-1,1);
  c.drawImage(imgSheet,sx,sy,fw,fh,-Math.round(dw/2),0,dw,dh);
  c.restore();
}
const IDLE_SEQ=['idle0','idle1','idle2','idle1'];
function animUpdate(){
  const p=P;
  if(p.blinkF>0)p.blinkF--;else if(--p.blinkT<=0){p.blinkF=7;p.blinkT=140+((Math.random()*220)|0);}
  if(p.landT>0)p.landT--;
  if(p.joyT>0)p.joyT--;
  if(p.onGround&&Math.abs(p.vx)>.25){p.walkT+=Math.abs(p.vx)*.072;p.idleT=0;}
  else{p.idleT++;if(p.idleT>4)p.walkT=0;}
}
function medoPose(){
  const p=P;
  if(state==='cut'&&cs)return cs.t<46?'joy':((Math.floor(cs.t/14)&1)?'cheerA':'cheerB');
  if(p.inv>82)return 'hurt';
  if(!p.onGround)return p.vy<-1?'up':'fall';
  if(p.landT>0)return 'land';
  if(Math.abs(p.vx)>.25){
    const dir=(input.right?1:0)-(input.left?1:0);
    if(dir&&Math.sign(p.vx)!==dir&&Math.abs(p.vx)>1.3)return 'skid';
    return 'walk'+(Math.floor(p.walkT)&7);
  }
  if(p.joyT>0)return 'joy';
  return IDLE_SEQ[((p.idleT/24)|0)&3];
}
function drawPlayer(cx,t){
  const p=P;
  let al=1;if(p.inv>0&&Math.floor(p.inv/4)%2)al=.4;
  const ix=lerp(p.px,p.x,ia),iy=lerp(p.py,p.y,ia);
  const fx=Math.round(ix+p.w/2)-cx,fy=Math.round(iy+p.h);
  /* soft shadow on whatever she is above */
  const mid=p.x+p.w/2;let gy=null;
  for(const g of grounds)if(mid>g.x&&mid<g.x+g.w)gy=GY;
  for(const pl of plats)if(mid>pl.x&&mid<pl.x+pl.w&&pl.y>=p.y+p.h-4)gy=gy==null?pl.y:Math.min(gy,pl.y);
  if(gy!=null){const d=clamp(1-(gy-(p.y+p.h))/170,.2,1);ctx.globalAlpha=.28*d;R(fx-10*d,gy-1,20*d,3,'#5aa5e6');ctx.globalAlpha=1;}
  let name=medoPose();
  if(p.blinkF>0&&FIDX[name+'_b']!=null)name+='_b';
  ctx.globalAlpha=al;
  drawMedoFrame(ctx,name,fx,fy,1,p.face<0);
  ctx.globalAlpha=1;
  if(p.hasBQ){
    const wk=name.indexOf('walk')===0?(Math.floor(p.walkT*2)&1):0;
    drawBouquet(fx+(p.face>0?19:-19),fy-20-wk,.8,t);
  }
}
