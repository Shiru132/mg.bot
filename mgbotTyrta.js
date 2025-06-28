// ==UserScript==
// @name         Margonem NI Auto Attacker + Quick Battle (right-click)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Approaches and attacks mobs on the New Interface (NI) with right-click + automatic quick battle
// @match        http*://*.margonem.pl/*
// @match        http*://*.margonem.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';
  // If New Interface is not present → do nothing
  if (!window.Engine || !Engine.hero || !Engine.npcs || !Engine.map) return;

  // ——— CONFIG ———
  const TARGET_IDS     = ['160694']; // mob id
  const SCAN_INTERVAL  = 2000;       /
  const CLICK_OFFSET   = 1;          
  const TILE_PX        = 32;         
  const QUICK_INTERVAL = 1000;       // delay
  // ————————————

  // cords
  function getHero(){
    const h = Engine.hero.d;
    return { x: h.x, y: h.y };
  }

// npc cords
  function getNPCs(){
    const raw = Engine.npcs.check()||{};
    const out = {};
    for(const [id,e] of Object.entries(raw)){
      if (e.d && typeof e.d.x==='number'){
        out[id] = { x: e.d.x, y: e.d.y };
      }
    }
    return out;
  }

  // right click
  function clickAtTile(mx,my){
    const c = document.getElementById('GAME_CANVAS');
    if(!c) return;
    const r = c.getBoundingClientRect();
    // map size in px
    const mapWpx = Engine.map.size.x * TILE_PX;
    const mapHpx = Engine.map.size.y * TILE_PX;
    // calculate margins inside canvas
    const marginX = (r.width  - mapWpx)/2;
    const marginY = (r.height - mapHpx)/2;
    const px = r.left + marginX + mx*TILE_PX + TILE_PX/2;
    const py = r.top  + marginY + my*TILE_PX + TILE_PX/2;
    if (!isFinite(px)||!isFinite(py)) return;
    
    ['mousedown','mouseup','contextmenu'].forEach(type=>{
      c.dispatchEvent(new MouseEvent(type,{
        view: window,
        bubbles: true,
        cancelable: true,
        button: 2,
        buttons: 2,
        clientX: px,
        clientY: py
      }));
    });
  }

  function loop(){
    const hero = getHero();
    const npcs  = getNPCs();

    for(const id of TARGET_IDS){
      const mob = npcs[id];
      if (!mob) continue;
   
      clickAtTile(mob.x, mob.y);
    }
  }

  setInterval(loop, SCAN_INTERVAL);

  // Automatic clicking of "quick battle" button
  setInterval(()=>{
    const qb = document.querySelector('#autobattleButton');
    if (qb) qb.click();
  }, QUICK_INTERVAL);

})();
