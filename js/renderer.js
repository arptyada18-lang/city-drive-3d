'use strict';
// Small dependency-free perspective renderer. Geometry is genuinely 3D;
// Canvas fills depth-sorted faces. Designed for a small low-poly practice scene.
CD.Renderer=class {
  constructor(canvas) {
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.resize();
  }
  resize() {
    this.w=innerWidth;
    this.h=innerHeight;
    this.dpr=Math.min(devicePixelRatio||1,1.5);
    this.canvas.width=this.w*this.dpr;
    this.canvas.height=this.h*this.dpr;
  }
  camera(position,target) {
    this.eye=position;
    const d=target.map((v,i)=>v-position[i]),length=Math.hypot(...d);
    this.forward=d.map(v=>v/length);
    const [x,,z]=this.forward,n=Math.hypot(x,z);
    this.right=[-z/n,0,x/n];
    const a=this.right,b=this.forward;
    this.up=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    this.focal=Math.min(this.w*1.15,this.h*1.05);
  }
  project(v) {
    const d=v.map((n,i)=>n-this.eye[i]),dot=a=>d.reduce((s,n,i)=>s+n*a[i],0),z=dot(this.forward);
    return  {
      x:this.w/2+dot(this.right)*this.focal/z,y:this.h*.43-dot(this.up)*this.focal/z,z
    }
    ;
  }
  polygon(points,color) {
    // Clip to the camera near plane instead of dropping whole ground tiles.
    const depth=v=>v.reduce((sum,n,i)=>sum+(n-this.eye[i])*this.forward[i],0);
    const clipped=[];
    for(let i=0;
    i<points.length;
    i++) {
      const a=points[i],b=points[(i+1)%points.length],da=depth(a),db=depth(b);
      if(da>=.3)clipped.push(a);
      if((da>=.3)!==(db>=.3)) {
        const t=(.3-da)/(db-da);
        clipped.push(a.map((n,j)=>n+(b[j]-n)*t));
      }
    }
    if(clipped.length<3)return;
    const p=clipped.map(v=>this.project(v));
    this.faces.push( {
      p,color,depth:p.reduce((n,v)=>n+v.z,0)/p.length
    }
    );
  }
  box(x,y,z,w,h,d,color,yaw=0) {
    const co=Math.cos(yaw),si=Math.sin(yaw);
    const verts=[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]].map(([a,b,c])=>[x+co*a*w/2-si*c*d/2,y+b*h/2,z+si*a*w/2+co*c*d/2]);
    const ids=[[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
    for(let i=0;
    i<ids.length;
    i++)this.polygon(ids[i].map(j=>verts[j]),CD.shade(color,[1.12,.86,.72,.8,.96][i]));
  }
  plane(x,z,w,d,color,y=.012) {
    this.polygon([[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2]],color);
  }
  flush() {
    const c=this.ctx;
    this.faces.sort((a,b)=>b.depth-a.depth);
    for(const f of this.faces) {
      c.fillStyle=f.color;
      c.beginPath();
      f.p.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));
      c.closePath();
      c.fill();
    }
    this.faces=[];
  }
  begin() {
    const c=this.ctx;
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
    const sky=c.createLinearGradient(0,0,0,this.h);
    sky.addColorStop(0,'#80b4cf');
    sky.addColorStop(.6,'#dce5db');
    sky.addColorStop(1,'#8caa90');
    c.fillStyle=sky;
    c.fillRect(0,0,this.w,this.h);
    this.faces=[];
  }
}
;
CD.shade=(hex,n)=>'#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*n)).toString(16).padStart(2,'0')).join('');
