// ==UserScript==
// @name         Margonem NI Auto Attacker + Quick Battle + Q Key (right+left click, offset fix v1.9.1)
// @namespace    http://tampermonkey.net/
// @version      1.9.1
// @description  Attacks mobs NI with alternating right/left click + quick battle + presses 'q' every 5s; click a bit higher when approaching from below
// @match        http*://*.margonem.pl/*
// @match        http*://*.margonem.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';
  if (!window.Engine || !Engine.hero || !Engine.npcs || !Engine.map) return;

  // ——— CONFIG ———
  const TARGET_IDS     = ['62345','169841','170535','62359','160694'];
  const SCAN_INTERVAL  = 1000;
  const QUICK_INTERVAL = 2000;
  const Q_INTERVAL     = 5000;
  // ————————————

  let currentTargetIndex = 0;
  let clickToggle = false; // toggle between left and right

  function getNPCs(){
    const raw = Engine.npcs.check()||{};
    const out = {};
    for(const [id,e] of Object.entries(raw)){
      if(e.d && typeof e.d.x==='number') out[id] = {x:e.d.x,y:e.d.y};
    }
    return out;
  }

  function getHeroScreenPos(TILE_SIZE, scale){
    const canvas = document.getElementById('GAME_CANVAS');
    const rect   = canvas.getBoundingClientRect();
    const tilesX = rect.width  / (TILE_SIZE*scale);
    const tilesY = rect.height / (TILE_SIZE*scale);
    const hx = Engine.hero.d.x, hy = Engine.hero.d.y;
    let ax, ay;
    if (hx < tilesX/2) ax = hx * TILE_SIZE * scale;
    else if (Engine.map.size.x - hx < tilesX/2) ax = (hx - (Engine.map.size.x - tilesX/2) + tilesX/2) * TILE_SIZE * scale;
    else ax = (tilesX/2) * TILE_SIZE * scale;
    if (hy < tilesY/2) ay = hy * TILE_SIZE * scale;
    else if (Engine.map.size.y - hy < tilesY/2) ay = (hy - (Engine.map.size.y - tilesY/2) + tilesY/2) * TILE_SIZE * scale;
    else ay = (tilesY/2) * TILE_SIZE * scale;
    return { x: rect.left + ax, y: rect.top + ay };
  }

  function clickMobPrecise(mob){
    const TILE_SIZE = 32;
    const scale     = Engine.map.d?.scale || 1;
    const canvas    = document.getElementById('GAME_CANVAS');
    if(!canvas) return;

    const heroScreen = getHeroScreenPos(TILE_SIZE, scale);
    const dx = mob.x - Engine.hero.d.x;
    const dy = mob.y - Engine.hero.d.y;
    let baseX = Math.round(heroScreen.x + dx * TILE_SIZE * scale + (TILE_SIZE * scale)/2);
    let baseY = Math.round(heroScreen.y + dy * TILE_SIZE * scale + (TILE_SIZE * scale)/2);

    
    if (dy <= 0) {
      baseY -= Math.round(TILE_SIZE * scale * 0.4);
    }

    if(!isFinite(baseX) || !isFinite(baseY)) return;

    // wybór LPM/PPM
    const isRight = clickToggle;
    clickToggle = !clickToggle;
    const types   = isRight
                  ? ['mousedown','mouseup','contextmenu']
                  : ['mousedown','mouseup','click'];
    const button  = isRight ? 2 : 0;
    const buttons = isRight ? 2 : 1;

    types.forEach(type => {
      canvas.dispatchEvent(new MouseEvent(type,{
        view: window,
        bubbles: true,
        cancelable: true,
        button: button,
        buttons: buttons,
        clientX: baseX,
        clientY: baseY
      }));
    });
  }

  function loop(){
    const npcs = getNPCs();
    const id   = TARGET_IDS[currentTargetIndex];
    const mob  = npcs[id];

    if (mob) {
      clickMobPrecise(mob);
    } else {
      currentTargetIndex = (currentTargetIndex + 1) % TARGET_IDS.length;
      clickToggle = false;
    }
  }

  setInterval(loop, SCAN_INTERVAL);
  setInterval(()=>{
    const qb = document.querySelector('#autobattleButton');
    if(qb) qb.click();
  }, QUICK_INTERVAL);
  setInterval(()=>{
    ['keydown','keyup'].forEach(ev=>document.dispatchEvent(new KeyboardEvent(ev,{key:'q',code:'KeyQ',bubbles:true})));
  }, Q_INTERVAL);

})();

// unfinished
