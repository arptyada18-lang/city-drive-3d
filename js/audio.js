'use strict';
CD.Audio=class {
  start() {
    try {
      if(!this.ctx) {
        this.ctx=new(window.AudioContext||window.webkitAudioContext)();
        this.osc=this.ctx.createOscillator();
        this.gain=this.ctx.createGain();
        this.osc.type='triangle';
        this.osc.connect(this.gain);
        this.gain.connect(this.ctx.destination);
        this.gain.gain.value=0;
        this.osc.start();
      }
      this.ctx.resume().catch(()=> {
      }
      );
    }
    catch {
      this.ctx=null;
    }
  }
  update(speed,on) {
    if(!this.ctx)return;
    try {
      this.osc.frequency.setTargetAtTime(40+Math.abs(speed)*7,this.ctx.currentTime,.1);
      this.gain.gain.setTargetAtTime(on?.035:0,this.ctx.currentTime,.05);
    }
    catch {
    }
  }
}
;
