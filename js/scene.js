'use strict';
CD.Scene=class {
  constructor() {
    this.bay= {
      x:11,z:-20,w:3.6,d:6.4,yaw:0
    }
    ;
    this.obstacles=[ {
      x:-11,z:-4,w:6,d:12
    }
    , {
      x:22,z:8,w:5,d:13
    }
    ,...[-22,-14,-6,2].map(x=>( {
      x,z:-30,w:1,d:1
    }
    ))];
    this.decor=[];
    for(let i=0;
    i<14;
    i++)this.decor.push( {
      x:i%2?-44:44,z:-65+Math.floor(i/2)*20,w:12,h:8+(i*7)%16,d:13,color:['#d5c7ad','#83a1a8','#ba9e88','#acc0b7'][i%4]
    }
    );
  }
  draw(r,car,parked) {
    // Tiled ground ensures nearby pavement remains visible across the near plane.
    for(let x=-70;
    x<80;
    x+=10)for(let z=-80;
    z<90;
    z+=10)r.plane(x,z,10.03,10.03,Math.abs(x)<36&&Math.abs(z)<42?'#59656a':'#819b78');
    r.flush();
    for(let z=-38;
    z<40;
    z+=5) {
      r.plane(0,z,.13,2.4,'#e9d9a1');
      r.plane(-32,z,.15,4,'#c5ccc4');
      r.plane(32,z,.15,4,'#c5ccc4');
    }
    for(let i=0;
    i<5;
    i++) {
      const x=7+i*4;
      r.plane(x,-20,.10,6.5,'#dde3d2');
      r.plane(x+2,-23.2,4,.10,'#dde3d2');
    }
    const b=this.bay;
    r.plane(b.x,b.z,b.w,b.d,parked?'#e5d28a':'#8bbda5');
    r.flush();
    // Car shadow is a flat translucent-looking painted silhouette.
    r.plane(car.x+.25,car.z+.35,2.4,4.8,'#394950');
    r.flush();
    for(const b of this.decor) {
      r.box(b.x,b.h/2,b.z,b.w,b.h,b.d,b.color);
      for(let y=3;
      y<b.h;
      y+=4)r.box(b.x+(b.x>0?-6.03:6.03),y,b.z,.08,1.8,8,'#4e7081');
    }
    for(const b of this.obstacles) {
      r.box(b.x,.12,b.z,b.w,.24,b.d,'#d4cfb8');
      if(b.w>2) {
        r.box(b.x,.3,b.z,b.w-.4,.25,b.d-.4,'#92ab79');
        for(let dz=-b.d/3;
        dz<=b.d/3;
        dz+=b.d/3) {
          r.box(b.x,1,b.z+dz,.3,1.6,.3,'#7e6953');
          r.box(b.x,2.3,b.z+dz,2.3,2.4,2.3,'#678e70');
        }
      }
      else {
        r.box(b.x,.4,b.z,.5,.8,.5,'#ea9b62');
        r.box(b.x,.42,b.z,.53,.18,.53,'#eef0d9');
      }
    }
    for(let z=-40;
    z<=40;
    z+=8)for(const x of [-36,36]) {
      r.box(x,.3,z,.35,.6,7.9,'#c6c6b6');
    }
    for(let x=-32;
    x<=32;
    x+=8)for(const z of [-42,42])r.box(x,.3,z,7.9,.6,.35,'#c6c6b6');
    for(const x of [-27,28]) {
      r.box(x,3,-35,.15,6,.15,'#485f6b');
      r.box(x,5.8,-34,2.2,.2,.7,'#e6ddbd');
    }
    this.drawCar(r,car);
    r.flush();
  }
  drawCar(r,p) {
    const s=Math.sin(p.yaw),c=Math.cos(p.yaw);
    const part=(x,y,z,w,h,d,color,angle=0)=>r.box(p.x+c*x-s*z,y,p.z+s*x+c*z,w,h,d,color,p.yaw+angle);
    part(0,.64,0,1.76,.62,4.05,'#ce7952');
    part(0,.99,-.3,1.7,.23,3.5,'#e49a72');
    part(0,1.34,.25,1.48,.65,1.95,'#273f4e');
    part(0,1.69,.3,1.51,.13,1.75,'#dc9067');
    part(0,1.35,-.76,1.35,.45,.05,'#8cbbcd');
    part(0,1.32,1.25,1.35,.4,.06,'#567f92');
    for(const x of [-.89,.89]) {
      part(x,.38,-1.25,.25,.67,.65,'#26343e',p.steer);
      part(x,.38,1.25,.25,.67,.65,'#26343e');
      part(x*1.025,.38,-1.25,.025,.31,.31,'#bcc8c7',p.steer);
      part(x*1.025,.38,1.25,.025,.31,.31,'#bcc8c7');
      part(x*.98,1.25,-.45,.25,.15,.27,'#dc9067');
    }
    for(const x of [-.57,.57]) {
      part(x,.8,-2.04,.48,.16,.04,'#f4efce');
      part(x,.8,2.04,.46,.17,.04,p.braking?'#ff5844':'#ad453b');
    }
    part(0,.47,-2.05,1.1,.16,.05,'#2b424c');
    part(0,.59,2.06,.45,.16,.04,'#dae5d8');
  }
}
;
