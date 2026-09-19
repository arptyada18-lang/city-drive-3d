'use strict';
CD.Game=class {
  constructor() {
    this.car=new CD.Car();
    this.scene=new CD.Scene();
    this.renderer=new CD.Renderer(document.getElementById('world'));
    this.settings= {
      response:6,returnRate:4,sound:true
    }
    ;
    try {
      const d=JSON.parse(localStorage.getItem('city-drive-settings'));
      if(d) {
        for(const key of ['response','returnRate'])if(Number.isFinite(d[key]))this.settings[key]=CD.clamp(d[key],1,10);
        this.settings.sound=d.sound!==false;
      }
    }
    catch {
    }
    this.audio=new CD.Audio();
    this.started=false;
    this.paused=true;
    this.input=new CD.Input(this);
    this.view=0;
    this.cameraYaw=0;
    this.cameraX=0;
    this.cameraZ=20;
    this.last=0;
    this.acc=0;
    this.parkTime=0;
    this.complete=false;
    this.uiTime=0;
    this.toastTimer=0;
    const $=id=>document.getElementById(id);
    this.menu=$('menu');
    this.panel=$('panel');
    this.menu.showModal();
    $('start').onclick=()=> {
      this.started=true;
      this.menu.close();
      $('hud').hidden=false;
      this.resume();
      this.toast('Turn the wheel gently. D = forward · R = reverse');
    }
    ;
    $('pause').onclick=()=>this.pause();
    $('resume').onclick=()=>this.resume();
    $('reset').onclick=()=> {
      this.car.reset();
      this.parkTime=0;
      this.complete=false;
      this.cameraYaw=0;
      this.cameraX=0;
      this.cameraZ=20;
      this.resume();
    }
    ;
    $('camera').onclick=()=> {
      this.view=1-this.view;
      document.activeElement?.blur();
    }
    ;
    document.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=> {
      this.gear(Number(b.dataset.gear));
      b.blur();
    }
    );
    for(const[id,key]of [['response','response'],['return','returnRate']]) {
      const el=$(id);
      el.value=this.settings[key];
      el.oninput=()=> {
        this.settings[key]=Number(el.value);
        this.saveSettings();
      }
      ;
    }
    $('sound').checked=this.settings.sound;
    $('sound').onchange=()=> {
      this.settings.sound=$('sound').checked;
      this.saveSettings();
    }
    ;
    this.menu.addEventListener('cancel',e=>e.preventDefault());
    this.panel.addEventListener('cancel',e=> {
      e.preventDefault();
      this.resume();
    }
    );
    addEventListener('resize',()=>this.renderer.resize());
    requestAnimationFrame(t=>this.frame(t));
  }
  saveSettings() {
    try {
      localStorage.setItem('city-drive-settings',JSON.stringify(this.settings));
    }
    catch {
      this.toast('Settings cannot be saved in this browser');
    }
  }
  pause() {
    if(!this.started)return;
    this.paused=true;
    this.input.clear();
    this.audio.update(0,false);
    if(!this.panel.open)this.panel.showModal();
  }
  resume() {
    if(!this.started)return;
    this.paused=false;
    this.panel.close();
    this.input.clear();
    document.activeElement?.blur();
    this.audio.start();
  }
  gear(g) {
    if(this.paused)return;
    if(!this.car.changeGear(g))this.toast('Brake to a stop before changing gear');
    this.updateHUD();
  }
  toast(message) {
    const el=document.getElementById('toast');
    el.textContent=message;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
  }
  step(dt) {
    const control=this.input.update(dt),old=this.car.contacts;
    this.car.braking=control.brake;
    this.car.update(dt,control,this.settings,this.scene.obstacles);
    if(this.car.contacts>old)this.toast('Contact — brake earlier and leave more space');
    if(!this.complete) {
      this.parkTime=this.car.parked(this.scene.bay)?this.parkTime+dt:0;
      if(this.parkTime>=2) {
        this.complete=true;
        this.toast('PARKED! Smooth finish. Keep practising or reset.');
      }
    }
  }
  updateHUD() {
    document.getElementById('speed').textContent=Math.round(Math.abs(this.car.speed)*3.6);
    document.getElementById('gearText').textContent=this.car.gear===1?'DRIVE':'REVERSE';
    document.getElementById('steerText').textContent='WHEELS '+Math.round(this.car.steer*180/Math.PI)+'°';
    document.getElementById('hits').textContent=this.car.contacts+' contacts';
    document.getElementById('objective').textContent=this.complete?'Parked ✓ · Try a cleaner approach':'Park inside the mint bay';
    document.getElementById('status').textContent=this.parkTime>0&&!this.complete?'Hold still · '+Math.min(100,Math.round(this.parkTime/2*100))+'%':'Free practice · no timer';
    document.querySelectorAll('[data-gear]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.gear)===this.car.gear));
  }
  frame(t) {
    const dt=Math.min(.05,(t-this.last)/1000||0);
    this.last=t;
    if(!this.paused) {
      this.acc+=dt;
      while(this.acc>=1/120) {
        this.step(1/120);
        this.acc-=1/120;
      }
    }
    else this.acc=0;
    let delta=Math.atan2(Math.sin(this.car.yaw-this.cameraYaw),Math.cos(this.car.yaw-this.cameraYaw));
    this.cameraYaw+=delta*(1-Math.exp(-5*dt));
    this.cameraX=CD.approach(this.cameraX,this.car.x,9,dt);
    this.cameraZ=CD.approach(this.cameraZ,this.car.z,9,dt);
    const distance=this.view?14:10,height=this.view?19:4.5,s=Math.sin(this.cameraYaw),c=Math.cos(this.cameraYaw);
    this.renderer.camera([this.cameraX-s*distance,height,this.cameraZ+c*distance],[this.cameraX+s*6,.6,this.cameraZ-c*6]);
    this.renderer.begin();
    this.scene.draw(this.renderer,this.car,this.complete);
    this.audio.update(this.car.speed,!this.paused&&this.settings.sound);
    this.uiTime+=dt;
    if(this.uiTime>.1) {
      this.updateHUD();
      this.uiTime=0;
    }
    requestAnimationFrame(stamp=>this.frame(stamp));
  }
}
;
try {
  window.cityDrive=new CD.Game();
}
catch(error) {
  document.getElementById('error').hidden=false;
  console.error(error);
}
