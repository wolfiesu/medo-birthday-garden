/* ============ final birthday scene ============ */
function withCtx(c,fn){const o=ctx;ctx=c;try{fn();}finally{ctx=o;}}
const HEXC={};
function hex(h){let v=HEXC[h];if(!v){v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];HEXC[h]=v;}return v;}
/* draw a small sprite per-pixel, then add a 1px outline around it */
function mk(w,h,draw,outline){
  const cvs=document.createElement('canvas');cvs.width=w;cvs.height=h;const c=cvs.getContext('2d');
  const id=c.createImageData(w,h),d=id.data;
  const set=(x,y,col)=>{x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=w||y>=h)return;const k=(y*w+x)*4,r=hex(col);d[k]=r[0];d[k+1]=r[1];d[k+2]=r[2];d[k+3]=255;};
  draw(set,w,h);
  if(outline){
    const o=hex(outline),a=new Uint8Array(w*h);
    for(let i=0;i<w*h;i++)a[i]=d[i*4+3]>0?1:0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x;if(a[i])continue;
      if((x>0&&a[i-1])||(x<w-1&&a[i+1])||(y>0&&a[i-w])||(y<h-1&&a[i+w])){d[i*4]=o[0];d[i*4+1]=o[1];d[i*4+2]=o[2];d[i*4+3]=255;}
    }
  }
  c.putImageData(id,0,0);return cvs;
}
const FL={
  daisy(r,rot){const S=2*r+5;return mk(S,S,(set)=>{const cx=S/2-.5,cy=S/2-.5;
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)+rot;
      const lim=r*(.56+.44*Math.pow(Math.abs(Math.cos(4*a)),.55));
      if(d<=lim){let col='#ffffff';
        if(dy*.8+dx*.5>r*.3&&d>r*.36)col='#dcecfb';
        if(d>lim-1.2&&dy>0)col='#c6def5';
        if(Math.abs(Math.sin(4*a))<.09&&d>r*.42&&d<lim-1.5)col='#eaf4fd';
        set(x,y,col);}
      if(d<=r*.34){let col='#ffd979';if(dx+dy>.5&&d>r*.12)col='#f0b546';if(dx<-.5&&dy<-.5&&d<r*.24)col='#fff0b0';set(x,y,col);}
    }},'#8fbbe6');},
  rose(r,pal,rot){const S=2*r+5;return mk(S,S,(set)=>{const cx=S/2-.5,cy=S/2-.5;
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)+rot;
      const lim=r*(.9+.1*Math.cos(5*a));
      if(d>lim)continue;let col;
      if(d>r*.68){const lobe=((a/(Math.PI*2)+1)*5)%5,fr=lobe-Math.floor(lobe);col=fr<.1||fr>.94?pal[2]:(Math.floor(lobe)%2?pal[0]:pal[1]);if(dy>r*.45)col=pal[2];}
      else{const sw=d*1.15+((a+Math.PI)/(Math.PI*2))*2.4;col=Math.floor(sw)%2?pal[0]:pal[1];if(d<r*.2)col=pal[2];}
      set(x,y,col);}
    },pal[3]);},
  hyd(r,pal,seed){const S=2*r+6;return mk(S,S,(set)=>{const cx=S/2-.5,cy=S/2-.5;
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const d=Math.hypot(x-cx,y-cy);if(d<=r)set(x,y,pal[2]);}
    let n=0;
    for(let gy=-r;gy<=r;gy+=3)for(let gx=-r;gx<=r;gx+=3){
      const jx=((hash(seed+gx*7+gy*13)*2-1)*1.2),jy=((hash(seed+gx*5+gy*3+9)*2-1)*1.2);
      const px=cx+gx+(Math.abs(gy/3)%2?1.5:0)+jx,py=cy+gy+jy;
      if(Math.hypot(px-cx,py-cy)>r-1.2)continue;
      const col=pal[n++%2];
      set(px,py-1,col);set(px-1,py,col);set(px+1,py,col);set(px,py+1,col);set(px,py,'#ffffff');
    }},pal[3]);},
  bell(r,pal){const S=2*r+7;return mk(S,S,(set)=>{const cx=S/2-.5,cy=S/2-.5;
    for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2,px=cx+Math.cos(a)*r*.55,py=cy+Math.sin(a)*r*.55;
      for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)if(Math.hypot(x,y)<=r*.52)set(px+x,py+y,k%2?pal[0]:pal[1]);}
    for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if(Math.abs(x)+Math.abs(y)<2)set(cx+x,cy+y,'#ffd979');},pal[2]);},
  leaf(len,wd,ang){const S=Math.ceil(len*2)+6;return mk(S,S,(set)=>{const c0=S/2,ca=Math.cos(ang),sa=Math.sin(ang);
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=x-c0,dy=y-c0,u=dx*ca+dy*sa,v=-dx*sa+dy*ca;
      if(u<0||u>len)continue;const hw=wd*Math.pow(Math.sin(Math.PI*u/len),.8);
      if(Math.abs(v)<=hw){let col='#aee6d0';if(v>hw*.35)col='#8fd8bb';if(Math.abs(v)<.7)col='#6fc4a4';set(x,y,col);}
    }},'#4fa285');}
};
function blit(c,cvs,cx,cy){c.drawImage(cvs,Math.round(cx-cvs.width/2),Math.round(cy-cvs.height/2));}

/* the big bouquet, drawn once at 150 x 180 art pixels */
function drawBouquetArt(cvs){
  const c=cvs.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,cvs.width,cvs.height);
  const Wd=cvs.width,CX=Wd/2;
  const PK=['#ffd9e8','#ffb9d6','#ff94bf','#e66aa0'],BL=['#e4f2ff','#bfe0fb','#8ec8f5','#4f86c4'],WH=['#ffffff','#eaf4fd','#cfe4f8','#8fbbe6'];
  const xl=y=>27+(y-88)*(41/90),xr=y=>123-(y-88)*(41/90);
  /* back wrapping paper */
  const back=mk(Wd,cvs.height,(set)=>{
    for(let y=72;y<=178;y++){const l=14+(y-72)*(52/106),r=136-(y-72)*(52/106),top=72+Math.abs(Math.sin(y*.1))*0;
      for(let x=Math.floor(l);x<=Math.ceil(r);x++){
        const wave=70+Math.abs(Math.sin((x-14)*.16))*5;if(y<wave)continue;
        let col='#c4e3fc';if((x+y)%14<3)col='#e6f3ff';if(x<l+3)col='#9fcdf2';if(x>r-4)col='#a9d3f5';set(x,y,col);}}
  },'#5f98d2');
  c.drawImage(back,0,0);
  /* leaves and baby's breath behind the blooms */
  const leaves=[[52,70,34,5.5,-2.55],[98,70,34,5.5,-.6],[30,84,30,5,-3.0],[120,84,30,5,-.1],[68,54,30,5,-1.9],[84,54,30,5,-1.25],[40,60,26,4.5,-2.3],[110,60,26,4.5,-.85]];
  leaves.forEach(([x,y,l,w,a])=>{const lf=FL.leaf(l,w,a);c.drawImage(lf,Math.round(x-lf.width/2),Math.round(y-lf.height/2));});
  const sprig=(x,y,ang,len)=>{
    c.fillStyle='#7fcdb0';
    for(let i=0;i<len;i++)c.fillRect(Math.round(x+Math.cos(ang)*i),Math.round(y+Math.sin(ang)*i),1,1);
    const ex=x+Math.cos(ang)*len,ey=y+Math.sin(ang)*len;
    for(const [dx,dy] of [[0,0],[-4,2],[4,2],[-2,-3],[3,-3],[-6,-1],[6,0]]){c.fillStyle='#ffffff';c.fillRect(Math.round(ex+dx),Math.round(ey+dy),2,2);c.fillStyle='#d6e8fb';c.fillRect(Math.round(ex+dx)+1,Math.round(ey+dy)+1,1,1);}
  };
  sprig(60,76,-2.4,34);sprig(90,76,-.75,34);sprig(46,86,-2.9,30);sprig(104,86,-.25,30);sprig(75,62,-1.57,30);
  /* the blooms, back row to front row */
  const F=[
    ['daisy',75,24,10,0.2],['rose',49,34,10,PK,0.3],['rose',101,34,10,BL,0.8],
    ['hyd',26,50,11,BL,3],['daisy',54,46,11,0.5],['rose',78,44,12,PK,1.1],['daisy',102,48,11,0],['hyd',126,54,10,WH,8],
    ['bell',14,66,6,BL],['bell',136,68,6,PK],
    ['rose',34,70,11,WH,0.6],['hyd',58,66,11,BL,5],['daisy',82,66,11,0.9],['rose',106,70,11,BL,2],
    ['daisy',22,86,9,1.2],['bell',48,84,6,PK],['rose',68,84,10,PK,0.4],['hyd',92,86,10,WH,11],['daisy',118,88,9,0.3],['bell',76,98,6,BL]
  ];
  F.forEach(f=>{
    let s;
    if(f[0]==='daisy')s=FL.daisy(f[3],f[4]);
    else if(f[0]==='rose')s=FL.rose(f[3],f[4],f[5]);
    else if(f[0]==='hyd')s=FL.hyd(f[3],f[4],f[5]);
    else s=FL.bell(f[3],f[4]);
    blit(c,s,f[1],f[2]);
  });
  /* front wrapping paper with a folded V edge */
  const front=mk(Wd,cvs.height,(set)=>{
    for(let y=84;y<=178;y++){const l=xl(y),r=xr(y);
      for(let x=Math.floor(l);x<=Math.ceil(r);x++){
        const yv=108-Math.abs(x-CX)*.42;if(y<yv)continue;
        let col='#ffffff';
        if((x-y+400)%16<3)col='#e3f1fe';
        if((x*3+y*5)%37===0)col='#c9d3de';
        if(y<yv+4)col='#b9defa';
        if(x<l+3)col='#cfe6fa';if(x>r-4)col='#bcdcf8';
        const crease=Math.abs((x-CX)*1.9+(y-108)-14);if(x<CX&&y>110&&crease<1.2)col='#bcdcf8';
        set(x,y,col);}}
  },'#5f98d2');
  c.drawImage(front,0,0);
  /* ribbon band, bow, tails */
  const ribbon=mk(Wd,cvs.height,(set)=>{
    const y0=129;
    for(let y=y0;y<y0+7;y++){const l=xl(y)+1,r=xr(y)-1;for(let x=Math.floor(l);x<=Math.ceil(r);x++){let col='#8ec8f5';if(y===y0)col='#cfe8fc';if(y>=y0+5)col='#5aa5e6';if((x*2+y)%9===0)col='#ffffff';set(x,y,col);}}
    const tail=(sx,ex)=>{for(let y=132;y<=166;y++){const u=(y-132)/34,cxm=sx+(ex-sx)*u,hw=5-u*.8;for(let x=Math.floor(cxm-hw);x<=Math.ceil(cxm+hw);x++){
      if(y>160&&Math.abs(x-cxm)<(y-160)*.8)continue;let col='#8ec8f5';if(x<cxm-hw+2)col='#b9defa';if(x>cxm+hw-2)col='#5aa5e6';if(y%7===0&&x%2===0)col='#ffffff';set(x,y,col);}}};
    tail(70,58);tail(80,92);
    const loop=(cx,cy,rx,ry,rot)=>{for(let y=-ry-2;y<=ry+2;y++)for(let x=-rx-2;x<=rx+2;x++){
      const xr_=x*Math.cos(rot)+y*Math.sin(rot),yr_=-x*Math.sin(rot)+y*Math.cos(rot),d=(xr_/rx)**2+(yr_/ry)**2;
      if(d<=1){let col='#8ec8f5';if(d<.42)col='#c4e4fc';if(d>.8)col='#5aa5e6';if(yr_<-ry*.35)col=d<.42?'#e6f3ff':'#b3dbf9';set(cx+x,cy+y,col);}}};
    loop(57,128,17,9,-.28);loop(93,128,17,9,.28);
    for(let y=122;y<=136;y++)for(let x=69;x<=81;x++){let col='#5aa5e6';if(x<72)col='#8ec8f5';if(y<125)col='#b3dbf9';set(x,y,col);}
  },'#3c6fae');
  c.drawImage(ribbon,0,0);
  /* heart charm on a string */
  c.fillStyle='#c9d3de';for(let y=136;y<148;y++)c.fillRect(75,y,1,1);
  const charm=mk(11,10,(set)=>{const m=ICON.heart;m.forEach((row,y)=>{for(let x=0;x<7;x++)if(row[x]==='X')set(x+2,y+2,y<2&&x<3?'#ffd6e7':'#ff8fbb');});},'#d9578f');
  c.drawImage(charm,70,146);
  /* glitter */
  for(let i=0;i<46;i++){const x=Math.floor(hash(i*3.1)*Wd),y=Math.floor(80+hash(i*7.7)*98);if(c.getImageData(x,y,1,1).data[3]>0&&(i%3===0)){c.fillStyle=i%2?'#ffffff':'#c9d3de';c.fillRect(x,y,1,1);}}
}
/* envelope, as four pixel layers */
function envelopeArt(){
  const body=(draw,w,h,ol)=>mk(w,h,draw,ol).toDataURL();
  const back=body((set,w,h)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){set(x,y,y<12?'#8fc0ea':'#a8d2f3');}},78,48,'#4f86c4');
  const front=body((set,w,h)=>{
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      let col='#cfe8fb';
      const dB=y-(h-1-Math.abs(x-w/2)*(h*.52/(w/2))),inBottom=y>h*.5+Math.abs(x-w/2)*(-.64)+ (h*.0);
      /* four fold triangles meeting near the centre */
      const cx=w/2,cy=h*.5,ax=Math.abs(x-cx),ay=Math.abs(y-cy);
      if(y>cy&&ay*(w/h)>ax)col='#eaf5ff';        /* bottom */
      else if(x<cx&&ax>ay*(w/h))col='#bcdcf8';   /* left  */
      else if(x>=cx&&ax>ay*(w/h))col='#c4e2fa';  /* right */
      if(Math.abs(ay*(w/h)-ax)<.8)col='#8ec8f5'; /* fold lines */
      if((x===3||x===w-4)&&y>2&&y<h-3&&y%3===0)col='#ffffff';
      if((y===h-4)&&x>2&&x<w-3&&x%3===0)col='#ffffff';
      set(x,y,col);}
    ICON.heart.forEach((row,y)=>{for(let x=0;x<7;x++)if(row[x]==='X')set(w-17+x,h-14+y,'#ff8fbb');});
  },78,48,'#4f86c4');
  const up=body((set,w,h)=>{for(let y=0;y<h;y++){const hw=(y+1)/h*(w/2);for(let x=Math.floor(w/2-hw);x<=Math.ceil(w/2+hw);x++){
      let col='#dcecfb';if((x+y)%6===0)col='#c9d3de';else if((x-y+300)%6===0)col='#ffffff';if(x<w/2-hw+2||x>w/2+hw-3)col='#9fd0f5';set(x,y,col);}}},78,19,'#4f86c4');
  const down=body((set,w,h)=>{for(let y=0;y<h;y++){const hw=(1-y/h)*(w/2);for(let x=Math.floor(w/2-hw);x<=Math.ceil(w/2+hw);x++){
      let col='#e6f3ff';if(y<2)col='#ffffff';if(x<w/2-hw+2||x>w/2+hw-3)col='#bcdcf8';set(x,y,col);}}
      for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const d=Math.hypot(x,y);if(d<=5.6){set(w/2+x,h-9+y,d>4.5?'#9aa9ba':(x+y<-2?'#eef3f8':'#c9d3de'));}}
      ICON.heart.forEach((row,y)=>{for(let x=0;x<7;x++)if(row[x]==='X'&&y<5)set(w/2-3+x,h-12+y,'#ff8fbb');});
  },78,31,'#4f86c4');
  return {back,front,up,down};
}

const Final=(()=>{
  const root=$('final'),fbg=$('fbg'),bg=fbg.getContext('2d'),bq=$('fbq'),fx=$('fbqfx'),fxc=fx.getContext('2d'),med=$('fmedo'),medc=med.getContext('2d');
  const titleEl=$('fTitle'),envCol=$('envCol'),letter=$('letter'),paper=$('paper'),bqCol=$('bqCol'),medoCol=$('medoCol'),btns=$('fBtns');
  const E={back:$('eBack'),front:$('eFront'),up:$('eUp'),down:$('eDown')};
  let built=false,tok=0,tt=0,ps=3,bw=1,bh=1,balloons=[],fp=[],words=[],active=false,reveal=0;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const CLOUDS=Array.from({length:7},(_,i)=>({x:hash(i+3)*400,y:14+hash(i+9)*90,w:30+hash(i+1)*30,sp:.05+hash(i+5)*.07}));
  const STARS=Array.from({length:50},(_,i)=>({x:hash(i)*500,y:hash(i+50)*260,p:hash(i+9)*6.28,b:hash(i+4)>.8}));
  const HEARTSVG=pix(ICON.heart).replace('<svg ','<svg class="ic" ');
  const MSG=[
    ['happy birthday, medo!',1,'hi'],
    ['a little world made just for u',0,''],
    ['hope your day is as lovely and special as you are.',0,''],
    ['you deserve all the happiness in the world',0,''],
    ['love uuuu',1,'sign']
  ];
  function build(){
    if(built)return;built=true;
    drawBouquetArt(bq);
    const art=envelopeArt();E.back.src=art.back;E.front.src=art.front;E.up.src=art.up;E.down.src=art.down;
    /* title letters */
    const mkLine=(txt,cls)=>{const d=document.createElement('div');d.className=cls;[...txt].forEach((ch,i)=>{const s=document.createElement('span');s.textContent=ch===' '?' ':ch;s.style.setProperty('--i',i);s.className='tl'+(i%2?' b':'');d.appendChild(s);});return d;};
    titleEl.appendChild(mkLine('HAPPY BIRTHDAY','l1'));titleEl.appendChild(mkLine('MEDO!','l2'));
    /* letter text, word by word */
    MSG.forEach(([txt,heart,cls])=>{
      const p=document.createElement('p');p.className='ln '+cls;
      txt.split(' ').forEach(w=>{const s=document.createElement('span');s.className='w';s.textContent=w;p.appendChild(s);p.appendChild(document.createTextNode(' '));words.push(s);});
      if(heart){const h=document.createElement('span');h.className='w hrt';h.innerHTML=HEARTSVG;p.appendChild(h);words.push(h);}
      paper.appendChild(p);
    });
    paper.insertAdjacentHTML('beforeend','<div class="deco d1">'+pix(ICON.star)+'</div><div class="deco d2">'+pix(ICON.star)+'</div>');
  }
  function fit(){
    const vw=innerWidth,vh=innerHeight,portrait=vh>vw*1.05;
    ps=Math.max(2,Math.round(Math.min(vw,vh*16/9)/320));
    const nbw=Math.ceil(vw/ps),nbh=Math.ceil(vh/ps);
    if(nbw!==bw||nbh!==bh){bw=nbw;bh=nbh;fbg.width=bw;fbg.height=bh;if(!balloons.length)initBg();}
    let bH,lw;
    if(portrait){bH=Math.min(vh*.33,vw*.72*180/150);lw=Math.min(vw*.94,460);}
    else{bH=Math.max(150,Math.min(vh-Math.min(vh*.3,vh*.2+30)-84,480));lw=Math.min(vw*.4,bH*.98+40,520);}
    const k=Math.max(.8,bH/180);
    const st=rootEl.style;
    st.setProperty('--k',k.toFixed(3));st.setProperty('--lw',Math.round(lw)+'px');
    st.setProperty('--ew',Math.round(lw*.5)+'px');st.setProperty('--EH',Math.round(lw*.5*48/78)+'px');
    st.setProperty('--fs',clamp(lw*.052,14,25).toFixed(1)+'px');
    st.setProperty('--mk',Math.max(1,k*.8).toFixed(2));
  }
  function initBg(){
    balloons=Array.from({length:Math.max(10,Math.round(bw/26))},(_,i)=>({x:hash(i+40)*bw,y:bh*(.2+hash(i+70)*1.0),c:['#ffffff','#b9defa','#8ec8f5','#c9d3de','#dff0ff','#ffc2dc'][i%6],sp:.12+hash(i+11)*.2,ph:hash(i)*6.28}));
  }
  function burst(x,y,n,spread){
    const cols=['#ffffff','#8ec8f5','#b9defa','#c9d3de','#ffc2dc','#5aa5e6','#ffe9a8'];
    for(let i=0;i<n;i++)fp.push({x:x+(Math.random()-.5)*spread,y,vx:(Math.random()-.5)*3,vy:-2-Math.random()*4.5,g:.1,life:90+Math.random()*60,c:cols[i%cols.length],t:'c',sz:1+((Math.random()*2)|0),ph:Math.random()*6.28,sp:.1+Math.random()*.25});
  }
  function firework(x,y){
    const cols=[['#ffffff','#b9defa'],['#8ec8f5','#ffffff'],['#ffc2dc','#ffffff'],['#c9d3de','#dff0ff']][(Math.random()*4)|0];
    for(let i=0;i<30;i++){const a=i/30*6.283,s=.9+Math.random()*.9;fp.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.03,life:40+Math.random()*24,c:cols[i%2],t:'s'});}
    tone(500+Math.random()*400,.25,'triangle',.025,-300);
  }
  function step(){
    tt++;
    for(const b of balloons){b.y-=b.sp;if(b.y<-30){b.y=bh+20+Math.random()*60;b.x=Math.random()*bw;}}
    for(const p of fp){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;if(p.t==='c'){p.vx*=.985;p.vy=Math.min(p.vy,1.4);p.ph+=p.sp;}p.life--;}
    fp=fp.filter(p=>p.life>0&&p.y<bh+10);
    if(reveal>=2&&tt%46===0)firework(bw*(.12+Math.random()*.76),bh*(.1+Math.random()*.3));
    if(tt%9===0)burst(Math.random()*bw,-4,1,0);
  }
  function drawBg(){
    withCtx(bg,()=>{
      bg.imageSmoothingEnabled=false;
      const g=bg.createLinearGradient(0,0,0,bh);g.addColorStop(0,'#a6d6fa');g.addColorStop(.55,'#d4ecff');g.addColorStop(1,'#f3faff');
      bg.fillStyle=g;bg.fillRect(0,0,bw,bh);
      for(const s of STARS){const tw=(Math.sin(tt/18+s.p)+1)/2;if(tw>.3){bg.globalAlpha=.35+tw*.65;const x=Math.floor(s.x%bw),y=Math.floor(s.y%(bh*.7));if(s.b)sparkle(x,y,1,'#ffffff');else R(x,y,1,1,'#ffffff');}}
      bg.globalAlpha=1;
      for(const c of CLOUDS){const x=(((c.x-tt*c.sp)%(bw+90))+bw+90)%(bw+90)-45;drawCloud(x,c.y*(bh/200),c.w,'rgba(255,255,255,.95)','rgba(190,222,248,.9)');}
      /* soft hills */
      for(let x=0;x<bw;x++){const h1=bh*.74+Math.sin(x/22+1)*5+Math.sin(x/8)*1.5,h2=bh*.82+Math.sin(x/15+3)*4;R(x,h1,1,bh,'#c6e2fa');R(x,h2,1,bh,'#b3d8f7');}
      /* ground with frosting edge */
      const gy=bh-14;R(0,gy,bw,14,'#b9defa');R(0,gy,bw,4,'#ffffff');R(0,gy+4,bw,1,'#e8f4ff');
      for(let x=0;x<bw;x+=3){const dh=2+((hash(x)*3)|0);R(x,gy+4,2,dh,'#ffffff');}
      for(let x=2;x<bw;x+=9)R(x,gy+9,1,1,hash(x)>.5?'#ffc2dc':'#ffffff');
      for(const b of balloons)drawBalloon(b.x+Math.sin(tt/40+b.ph)*3,b.y,b.c,.9,0,14);
      /* bunting across the top */
      const n=Math.max(8,Math.floor(bw/16));
      for(let i=0;i<=n;i++){const u=i/n,x=u*bw,y=3+Math.sin(u*Math.PI)*6,col=['#ffffff','#8ec8f5','#b9defa'][i%3];
        for(let k=0;k<8;k++){const w=Math.max(1,10-k*1.3);R(x-w/2,y+k,w,1,col);}R(x-5,y,10,1,'#9fd0f5');}
      for(const p of fp){bg.globalAlpha=clamp(p.life/20,0,1);const x=Math.round(p.x),y=Math.round(p.y);
        if(p.t==='s')sparkle(x,y,1,p.c);else R(x,y,Math.max(1,Math.round(p.sz*(.5+Math.abs(Math.sin(p.ph))))),p.sz,p.c);}
      bg.globalAlpha=1;
    });
  }
  function drawFx(){
    fxc.clearRect(0,0,fx.width,fx.height);
    if(reveal<1)return;
    withCtx(fxc,()=>{
      const pts=[[18,30],[132,22],[8,100],[142,96],[75,6],[40,12],[112,10],[22,150],[128,150]];
      pts.forEach(([x,y],i)=>{const ph=(tt+i*11)%60;if(ph<30){const s=ph<10||ph>20?1:2;sparkle(x,y,s,i%3===0?'#ffe9a8':'#ffffff');}});
    });
  }
  function drawMedo(){
    medc.clearRect(0,0,med.width,med.height);
    const cyc=Math.floor(tt/20)&1;let nm=reveal>=1?(cyc?'cheerA':'cheerB'):'idle0';
    if(reveal<1&&tt%150<8)nm='idle0_b';
    drawMedoFrame(medc,nm,20,med.height-2,1,false);
  }
  function render(){drawBg();drawFx();drawMedo();}
  const anim=(el,kf,o)=>{try{return el.animate(kf,Object.assign({fill:'both',easing:'ease-out'},o));}catch(e){return null;}};
  function resetScene(){
    [bqCol,medoCol,E.back,E.front,E.up,E.down,letter,btns].forEach(el=>{el.getAnimations&&el.getAnimations().forEach(a=>a.cancel());el.style.cssText='';});
    bqCol.style.opacity='0';E.back.style.opacity=E.front.style.opacity=E.down.style.opacity='0';E.up.style.transform='scaleY(0)';E.up.style.transformOrigin='50% 100%';
    letter.style.opacity='0';medoCol.style.opacity='0';btns.style.opacity='0';
    words.forEach(w=>w.classList.remove('in'));
    document.querySelectorAll('#letter .creases i').forEach(i=>{i.style.opacity='1';});
    letter.classList.remove('open');
  }
  async function play(){
    const my=++tok;const ok=()=>my===tok&&active;
    resetScene();fit();
    await wait(150);if(!ok())return;
    /* 1. bouquet pops in */
    reveal=1;
    anim(bqCol,[{opacity:0,transform:'translateY(40px) scale(.25)'},{opacity:1,transform:'translateY(-6px) scale(1.07)',offset:.7},{opacity:1,transform:'none'}],{duration:1000,easing:'cubic-bezier(.3,1.3,.5,1)'});
    anim(medoCol,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:700,delay:350});
    sfx.heart();burst(bw*.4,bh*.9,40,bw*.4);
    await wait(1250);if(!ok())return;
    /* 2. envelope slides in */
    [E.back,E.front,E.down].forEach(el=>anim(el,[{opacity:0,transform:'translateY(36px)'},{opacity:1,transform:'none'}],{duration:650}));
    if(innerHeight>innerWidth*1.05){try{envCol.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}}
    tone(660,.12,'triangle',.04,200);
    await wait(1000);if(!ok())return;
    /* 3. flap opens */
    anim(E.down,[{transform:'scaleY(1)',transformOrigin:'50% 0%'},{transform:'scaleY(0)',transformOrigin:'50% 0%'}],{duration:480,easing:'ease-in'});
    anim(E.up,[{transform:'scaleY(0)',transformOrigin:'50% 100%'},{transform:'scaleY(1)',transformOrigin:'50% 100%'}],{duration:480,delay:300,easing:'ease-out'});
    sfx.check();
    await wait(850);if(!ok())return;
    /* 4. folded letter rises out */
    const Lh=letter.offsetHeight,EHp=parseFloat(getComputedStyle(rootEl).getPropertyValue('--EH'))||100,sx0=.5,sy0=.46;
    const y0=Math.max(0,sy0*Lh+EHp*.14-EHp+6),rise=Math.max(34,Math.min(90,Lh*.2));
    letter.style.opacity='1';
    letter.querySelectorAll('.paper').forEach(p=>p.style.opacity='0');
    const rs=anim(letter,[{transform:'translateY('+y0+'px) scale('+sx0+','+sy0+')'},{transform:'translateY('+(-rise)+'px) scale('+sx0+','+sy0+')'}],{duration:1100,easing:'cubic-bezier(.3,.7,.3,1)'});
    tone(520,.5,'triangle',.03,260);
    await wait(1180);if(!ok())return;
    /* 5. unfolds, then the handwriting appears */
    anim(letter,[{transform:'translateY('+(-rise)+'px) scale('+sx0+','+sy0+')'},{transform:'translateY(0) scale(1,1)'}],{duration:1000,easing:'cubic-bezier(.3,1.2,.5,1)'});
    document.querySelectorAll('#letter .creases i').forEach(i=>anim(i,[{opacity:1},{opacity:0}],{duration:1100,delay:500}));
    anim(paper,[{opacity:0},{opacity:1}],{duration:500,delay:400});
    reveal=2;sfx.fanfare();burst(bw*.5,bh*.95,60,bw*.8);
    await wait(1100);if(!ok())return;
    letter.classList.add('open');
    words.forEach((w,i)=>setTimeout(()=>{if(my===tok)w.classList.add('in');},i*85));
    anim(btns,[{opacity:0},{opacity:1}],{duration:600,delay:words.length*85});
    if(innerHeight>innerWidth*1.05){try{letter.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){}}
  }
  return{
    fit,render,step,
    show(){active=true;build();root.classList.remove('hidden');root.querySelector('.fscroll').scrollTop=0;tt=0;reveal=0;fp=[];fit();play();},
    replay(){tt=0;reveal=0;fp=[];play();},
    stop(){active=false;tok++;root.classList.add('hidden');},
    get active(){return active;}
  };
})();
hooks.fit=()=>{if(Final.active)Final.fit();};
