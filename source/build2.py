import re, json, base64
src = open('game.src.html').read()
m = re.search(r'<script>\n(.*?)\n</script>', src, re.S)
js = m.group(1)

def rep(a, b, count=1):
    global js
    assert a in js, 'missing: ' + a[:70]
    js = js.replace(a, b, count)

def between(start, end, new, keep_end=True):
    global js
    i = js.index(start); j = js.index(end, i)
    js = js[:i] + new + (js[j:] if keep_end else js[j + len(end):])

frag = lambda n: open(n).read()

# 1. ctx can be swapped for offscreen drawing
rep("const cv=$('c'),ctx=cv.getContext('2d');", "const cv=$('c');let ctx=cv.getContext('2d');")

# 2. sprite sheet instead of the single still image
between("const imgGrid=new Image()", "/* ============ audio", """const imgSheet=new Image();
imgSheet.onload=()=>boot();
imgSheet.src='data:image/png;base64,__SHEET__';
const SHEET=__SHEETJSON__;
const FIDX={};SHEET.names.forEach((n,i)=>{FIDX[n]=i;});

""")

# 3. input + layout replaced by the new controls
between("/* ============ input ============ */", "/* ============ level data ============ */", frag('frag_controls.js'))

# 4. level / camera / interpolation state
rep("function buildLevel(){", "let cam0=0,ia=1;\nfunction buildLevel(){")
rep("  cam=0;hearts=3;count=0;parts=[];pops=[];cs=null;lastCp=0;hintT=0;shake=0;flowerPulse=0;",
    "  cam=0;hearts=3;count=0;parts=[];pops=[];cs=null;lastCp=0;hintT=0;shake=0;flowerPulse=0;\n  P.px=P.x;P.py=P.y;cam0=0;P.walkT=0;P.idleT=0;P.blinkT=120;P.blinkF=0;P.landT=0;P.joyT=0;BQ.taken=false;")

# 5. game flow (no card; the letter is the message now)
between("/* ============ game flow ============ */", "function hurt(dir){", """/* ============ game flow ============ */
function startGame(){
  ac();sfx.click();
  try{document.activeElement&&document.activeElement.blur();}catch(e){}
  Final.stop();
  buildLevel();state='play';paused=false;clearInput();
  $('pauseUi').classList.add('hidden');$('titleUi').classList.add('hidden');
  document.body.classList.add('playing');document.body.classList.remove('final');
  Music.autoStart();
}
function togglePause(){
  paused=!paused;$('pauseUi').classList.toggle('hidden',!paused);
  if(paused)clearInput();
}
function goFinal(){
  state='final';paused=false;clearInput();
  $('pauseUi').classList.add('hidden');
  document.body.classList.remove('playing');document.body.classList.add('final');
  Final.show();
}
$('againBtn').addEventListener('click',()=>{sfx.click();startGame();});
$('replayBtn').addEventListener('click',()=>{sfx.click();Final.replay();});
$('startBtn').addEventListener('click',startGame);
$('bPause').addEventListener('click',()=>{togglePause();try{$('bPause').blur();}catch(e){}});
$('resumeBtn').addEventListener('click',togglePause);
$('restartBtn').addEventListener('click',()=>{togglePause();startGame();});
$('bSfx').addEventListener('click',()=>{sfxOn=!sfxOn;$('bSfx').dataset.ic=sfxOn?'sfxOn':'sfxOff';$('bSfx').classList.toggle('off',!sfxOn);paintIcons($('hudBtns'));if(sfxOn)sfx.click();try{$('bSfx').blur();}catch(e){}});
stage.addEventListener('pointerdown',()=>{try{window.focus();}catch(e){}});

""")

# 6. respawn / collect / landing
rep("cam=clamp(P.x-W*.42,0,LEND-W);sfx.oops();", "cam=clamp(P.x-W*.42,0,LEND-W);cam0=cam;P.px=P.x;P.py=P.y;sfx.oops();")
rep("f.got=true;count++;flowerPulse=10;sfx.flower();", "f.got=true;count++;flowerPulse=10;P.joyT=26;sfx.flower();")
rep("if(p.onGround&&!wasGround&&prevY<p.y-3)p.squash=5;",
    "if(p.onGround&&!wasGround&&prevY<p.y-3){p.squash=5;p.landT=7;spark(p.x+p.w/2,p.y+p.h,5,['#ffffff','#dff0ff'],{spd:1.3,g:.02,life:26});}")

# 7. step(): interpolation memory, animation, camera look-ahead, ending
rep("function step(){\n  tick++;", "function step(){\n  tick++;P.px=P.x;P.py=P.y;cam0=cam;")
rep("        physics(state==='cut');", "        physics(state==='cut');\n        animUpdate();")
rep("P.hx=lerp(cs.sx,P.x+P.w/2+22,e);P.hy=lerp(cs.sy,P.y+P.h-8,e)-Math.sin(u*Math.PI)*34;",
    "P.hx=lerp(cs.sx,P.x+P.w/2+19,e);P.hy=lerp(cs.sy,P.y+P.h-20,e)-Math.sin(u*Math.PI)*34;")
rep("if(cs.t===170)showCard();", "if(cs.t===176)goFinal();")
rep("const target=clamp(P.x+P.w/2-W*.42,0,LEND-W);\n      cam+=(target-cam)*.14;cam=clamp(cam,0,LEND-W);",
    "const target=clamp(P.x+P.w/2-W*.42+clamp(P.vx*9,-30,30),0,LEND-W);\n      cam+=(target-cam)*.11;cam=clamp(cam,0,LEND-W);")
between("  }else if(state==='final'){\n    fin.t++;", "function firework(x,y){", "  }else if(state==='final'){\n    Final.step();\n  }\n}\n")

# 8. old still-image helpers out
between("function drawSprite(", "function drawCake(", "")
between("function drawPlayer(cx,t){", "function drawHud(){", frag('frag_anim.js'))

# 9. camera used for drawing is the interpolated one
rep("const cx=Math.round(cam);", "const cx=Math.round(lerp(cam0,cam,ia));")

# 10. title uses the animated idle
rep("drawBigMedo(190,306,2,false,Math.round(Math.sin(t/14)*2));",
    "{const nm=(t%210<8)?'idle0_b':IDLE_SEQ[((t/26)|0)&3];drawMedoFrame(ctx,nm,190,306,3,false);}")
rep("R(150,300,80,5,'rgba(90,165,230,.25)');", "R(128,300,124,5,'rgba(90,165,230,.25)');")

# 11. final scene now lives in the DOM
between("function renderFinal(){", "function render(){", "function renderFinal(){Final.render();}\n")

# 12. loop with interpolation
rep("while(acc>=1000/60){if(!paused||state==='title')step();acc-=1000/60;}\n  render();requestAnimationFrame(frame);",
    "while(acc>=1000/60){if(!paused||state==='title'||state==='final')step();acc-=1000/60;}\n  ia=paused?1:Math.min(1,acc/(1000/60));\n  render();requestAnimationFrame(frame);")

# 13. boot: music, fragments before boot
rep("  $('music').classList.remove('closed');\n", "  Music.init();\n")
rep("/* ============ boot ============ */", frag('frag_music.js') + "\n" + frag('frag_final.js') + "\n/* ============ boot ============ */")
rep("window.__medo={step,render,", "window.__medo={step,render,Music,Final,goFinal,startGame,")

sheet = open('medo_sheet.b64').read()
sj = open('medo_sheet.json').read()
js = js.replace('__SHEET__', sheet).replace('__SHEETJSON__', sj)

song = open('song.b64').read()
tpl = open('game2.tpl.html').read()
js_page = js.replace('__SONGSRC__', '')
js = js.replace('__SONGSRC__', 'data:audio/mpeg;base64,' + song)
out = tpl.replace('/*__SCRIPT__*/', js)
open('index.html', 'w').write(out)
open('game2.js', 'w').write(js)
open('artifact.html','w').write(tpl.replace('/*__SCRIPT__*/', js_page)[tpl.index('<title>') if False else 0:])
print('built', len(out), 'bytes; non-ascii chars:', sorted({c for c in out if ord(c) > 127}))
