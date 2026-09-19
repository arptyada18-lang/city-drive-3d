'use strict';
CD.Input=class {
  constructor(game) {
    this.g=game;
    this.keys=new Set();
    this.pedals=new Map();
    this.wheel=document.getElementById('wheel');
    this.angle=0;
    this.pointer=null;
    const reset=()=>this.clear();
    addEventListener('blur',()=> {
      reset();
      game.pause();
    }
    );
    document.addEventListener('visibilitychange',()=> {
      if(document.hidden) {
        reset();
        game.pause();
      }
    }
    );
    addEventListener('keydown',e=> {
      if(['INPUT','BUTTON'].includes(e.target.tagName))return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyS','KeyA','KeyD'].includes(e.code)) {
        e.preventDefault();
        if(!game.paused)this.keys.add(e.code);
      }
      if(e.repeat)return;
      if(e.code==='KeyR')game.gear(-game.car.gear);
      if(e.code==='KeyC')game.view=1-game.view;
      if(e.code==='Escape'||e.code==='KeyP')game.paused?game.resume():game.pause();
    }
    );
    addEventListener('keyup',e=>this.keys.delete(e.code));
    this.wheel.addEventListener('pointerdown',e=> {
      if(game.paused||this.pointer!==null)return;
      e.preventDefault();
      this.pointer=e.pointerId;
      this.previous=this.polar(e);
      this.wheel.setPointerCapture(e.pointerId);
      game.audio.start();
    }
    );
    this.wheel.addEventListener('pointermove',e=> {
      if(this.pointer!==e.pointerId)return;
      const a=this.polar(e);
      let delta=a-this.previous;
      if(delta>180)delta-=360;
      if(delta< -180)delta+=360;
      this.angle=CD.clamp(this.angle+delta,-135,135);
      this.previous=a;
    }
    );
    const release=e=> {
      if(this.pointer===e.pointerId)this.pointer=null;
    }
    ;
    for(const event of ['pointerup','pointercancel','lostpointercapture'])this.wheel.addEventListener(event,release);
    for(const b of document.querySelectorAll('[data-pedal]')) {
      b.addEventListener('pointerdown',e=> {
        if(game.paused)return;
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        this.pedals.set(e.pointerId,b.dataset.pedal);
        b.classList.add('active');
        game.audio.start();
      }
      );
      const up=e=> {
        this.pedals.delete(e.pointerId);
        b.classList.remove('active');
      }
      ;
      for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,up);
      b.addEventListener('contextmenu',e=>e.preventDefault());
    }
  }
  polar(e) {
    const r=this.wheel.getBoundingClientRect();
    return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;
  }
  update(dt) {
    const left=this.keys.has('KeyA')||this.keys.has('ArrowLeft'),right=this.keys.has('KeyD')||this.keys.has('ArrowRight');
    if(this.pointer===null)this.angle=CD.approach(this.angle,((right?1:0)-(left?1:0))*135,left||right?this.g.settings.response:this.g.settings.returnRate,dt);
    this.wheel.querySelector('svg').style.transform=`rotate(${this.angle}deg)`;
    this.wheel.setAttribute('aria-valuenow',String(Math.round(this.angle)));
    return  {
      steer:this.angle/135,gas:this.keys.has('KeyW')||this.keys.has('ArrowUp')||[...this.pedals.values()].includes('gas'),brake:this.keys.has('KeyS')||this.keys.has('ArrowDown')||this.keys.has('Space')||[...this.pedals.values()].includes('brake')
    }
    ;
  }
  clear() {
    this.keys.clear();
    this.pedals.clear();
    this.pointer=null;
    this.angle=0;
    document.querySelectorAll('[data-pedal]').forEach(b=>b.classList.remove('active'));
  }
}
;
