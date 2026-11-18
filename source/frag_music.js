/* ============ music: one player that never restarts between screens ============ */
const Music=(()=>{
  const SONG_SRC='__SONGSRC__';
  const SPOTIFY_URI='spotify:track:407LgLkk1uM3wMO6jVRe0a';
  const SPOTIFY_URL='https://open.spotify.com/track/407LgLkk1uM3wMO6jVRe0a';
  const pill=$('music'),btn=$('mPlay'),lab=$('mLab'),drawerBtn=$('mDrawer'),box=$('spBox'),note=$('spNote');
  const audio=new Audio();audio.loop=true;audio.preload='auto';audio.volume=.85;
  let mode='probing',playing=false,wantPlay=false,sp=null,verifyT=0,fadeT=0;
  const api={userPaused:false};
  function ui(){
    btn.innerHTML=pix(ICON[playing?'pause':'play']).replace('<svg ','<svg class="ic" ');
    btn.setAttribute('aria-label',playing?'Pause music':'Play music');
    btn.setAttribute('aria-pressed',playing?'true':'false');
    pill.classList.toggle('playing',playing);
    lab.textContent=playing?'NOW PLAYING':mode==='probing'||mode==='loading'?(wantPlay?'STARTING':'LOADING'):mode==='link'?'OPEN SONG':api.userPaused?'PAUSED':'TAP TO PLAY';
    drawerBtn.classList.toggle('hidden',mode!=='spotify');
  }
  function fade(to,ms,done){
    clearInterval(fadeT);const from=audio.volume,t0=performance.now();
    fadeT=setInterval(()=>{const u=Math.min(1,(performance.now()-t0)/ms);audio.volume=Math.max(0,Math.min(1,from+(to-from)*u));if(u>=1){clearInterval(fadeT);if(done)done();}},30);
  }
  function playFile(){
    audio.volume=0;
    const pr=audio.play();
    const ok=()=>{playing=true;ui();fade(.85,700);};
    if(pr&&pr.then)pr.then(ok).catch(err=>{playing=false;wantPlay=false;if(err&&err.name!=='NotAllowedError'&&err.name!=='AbortError'){mode='probing';initSpotify();}ui();});else ok();
  }
  function pauseFile(){fade(0,350,()=>{audio.pause();playing=false;ui();});playing=false;ui();}
  function spPlay(){
    try{sp.play();}catch(e){}
    clearTimeout(verifyT);
    verifyT=setTimeout(()=>{if(!playing){box.classList.add('open');note.textContent='Press play on the Spotify player once. After that the song keeps going while you play.';}},2600);
  }
  function initSpotify(){
    if(mode!=='probing')return;mode='loading';ui();
    window.onSpotifyIframeApiReady=IFrameAPI=>{
      try{
        IFrameAPI.createController($('spHost'),{uri:SPOTIFY_URI,width:'100%',height:80},ctrl=>{
          sp=ctrl;mode='spotify';
          ctrl.addListener('playback_update',e=>{const was=playing;playing=!!e.data&&!e.data.isPaused;if(playing){clearTimeout(verifyT);if(!was)box.classList.remove('open');}ui();});
          ui();if(wantPlay)spPlay();
        });
      }catch(e){mode='link';ui();}
    };
    const s=document.createElement('script');s.src='https://open.spotify.com/embed/iframe-api/v1';s.async=true;
    s.onerror=()=>{if(mode==='loading'){mode='link';ui();}};document.head.appendChild(s);
    setTimeout(()=>{if(mode==='loading'){mode='link';ui();}},9000);
  }
  function init(){
    if(!SONG_SRC){initSpotify();return;}
    mode='file';
    audio.addEventListener('error',()=>{if(mode==='file'){mode='probing';initSpotify();}});
    audio.addEventListener('pause',()=>{if(mode==='file'&&!audio.ended&&audio.volume>0.02){playing=false;ui();}});
    audio.src=SONG_SRC;ui();
  }
  function toggle(){
    if(mode==='file'){if(playing){api.userPaused=true;pauseFile();}else{api.userPaused=false;playFile();}}
    else if(mode==='spotify'){if(playing){api.userPaused=true;try{sp.pause();}catch(e){}}else{api.userPaused=false;spPlay();}}
    else if(mode==='link'){window.open(SPOTIFY_URL,'_blank','noopener');}
    else{wantPlay=!wantPlay;api.userPaused=!wantPlay;ui();}
  }
  function autoStart(){
    if(playing||api.userPaused)return;
    if(mode==='file')playFile();
    else if(mode==='spotify')spPlay();
    else if(mode==='probing'||mode==='loading'){wantPlay=true;ui();}
  }
  btn.addEventListener('click',()=>{ac();toggle();try{btn.blur();}catch(e){}});
  drawerBtn.addEventListener('click',()=>{box.classList.toggle('open');note.textContent='This is the Spotify player for the song.';try{drawerBtn.blur();}catch(e){}});
  api.init=init;api.toggle=toggle;api.autoStart=autoStart;api.ui=ui;
  api.status=()=>({mode,playing});
  return api;
})();
