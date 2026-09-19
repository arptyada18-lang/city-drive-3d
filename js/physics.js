'use strict';
window.CD =  {
}
;
CD.clamp = (n,a,b) => Math.max(a,Math.min(b,n));
CD.approach = (a,b,rate,dt) => a+(b-a)*(1-Math.exp(-rate*dt));
// Metres, seconds and radians. Bicycle steering has a stable turning radius
// at parking speeds; speed-sensitive steering avoids abrupt high-speed turns.
CD.Car = class  {
  constructor() {
    this.reset();
  }
  reset() {
    Object.assign(this, {
      x:0,z:20,yaw:0,speed:0,steer:0,gear:1,contacts:0,cooldown:0,wheelSpin:0
    }
    );
  }
  corners(x=this.x,z=this.z) {
    const s=Math.sin(this.yaw),c=Math.cos(this.yaw);
    return [[-.92,-2.05],[.92,-2.05],[.92,2.05],[-.92,2.05]].map(([dx,dz])=>( {
      x:x+c*dx-s*dz,z:z+s*dx+c*dz
    }
    ));
  }
  overlaps(box) {
    // SAT between oriented car rectangle and axis-aligned scenery rectangle.
    const points=this.corners(),other=[ {
      x:box.x-box.w/2,z:box.z-box.d/2
    }
    , {
      x:box.x+box.w/2,z:box.z-box.d/2
    }
    , {
      x:box.x+box.w/2,z:box.z+box.d/2
    }
    , {
      x:box.x-box.w/2,z:box.z+box.d/2
    }
    ];
    const axes=[[1,0],[0,1],[Math.cos(this.yaw),Math.sin(this.yaw)],[-Math.sin(this.yaw),Math.cos(this.yaw)]];
    return axes.every(([x,z])=> {
      const a=points.map(p=>p.x*x+p.z*z),b=other.map(p=>p.x*x+p.z*z);
      return Math.max(...a)>Math.min(...b)&&Math.max(...b)>Math.min(...a);
    }
    );
  }
  update(dt,input,settings,obstacles) {
    this.cooldown=Math.max(0,this.cooldown-dt);
    const target=input.steer*(.61/(1+Math.abs(this.speed)*.045));
    this.steer=CD.approach(this.steer,target,Math.abs(input.steer)>.01?settings.response:settings.returnRate,dt);
    if(input.gas)this.speed+=this.gear*3.6*dt;
    if(input.brake) {
      const reduction=8.5*dt;
      this.speed=Math.sign(this.speed)*Math.max(0,Math.abs(this.speed)-reduction);
    }
    this.speed*=Math.exp(-(input.gas?.11:.42)*dt);
    if(Math.abs(this.speed)<.025&&!input.gas)this.speed=0;
    this.speed=CD.clamp(this.speed,-5.2,15);
    const previous= {
      x:this.x,z:this.z,yaw:this.yaw
    }
    ;
    this.yaw+=this.speed/2.65*Math.tan(this.steer)*dt;
    this.x+=Math.sin(this.yaw)*this.speed*dt;
    this.z-=Math.cos(this.yaw)*this.speed*dt;
    const collision=this.corners().some(p=>Math.abs(p.x)>36||Math.abs(p.z)>42)||obstacles.some(b=>this.overlaps(b));
    if(collision) {
      Object.assign(this,previous);
      if(Math.abs(this.speed)>.3&&this.cooldown===0) {
        this.contacts++;
        this.cooldown=.8;
      }
      this.speed=0;
    }
    this.wheelSpin+=this.speed*dt/.34;
    return collision;
  }
  changeGear(gear) {
    if(Math.abs(this.speed)>.35)return false;
    this.gear=gear;
    this.speed=0;
    return true;
  }
  parked(bay) {
    return Math.abs(this.speed)<.15&&Math.abs(Math.sin(this.yaw-bay.yaw))<.13&&this.corners().every(p=>Math.abs(p.x-bay.x)<bay.w/2&&Math.abs(p.z-bay.z)<bay.d/2);
  }
}
;
