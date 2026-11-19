// Heights of the run and the land either side (2 m grid, 180 m across) plus the lanes and gully/mogul fields, for tools/ring-map.py.
// node tools/ring-map-grid.js <out.json> <s0> <s1>
const path=require('path'),fs=require('fs');const{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({headless:true});const pg=await b.newPage({viewport:{width:320,height:180}});
await pg.goto('file://'+path.resolve('dist/dev.html')+'?dev');
await pg.waitForFunction(()=>window.__ski&&window.__rings&&__ski.ui().state==='title',null,{timeout:240000});
const r=await pg.evaluate(([a,b2])=>{const C=__ski.m.Course,rows=[];for(let s=a;s<=b2;s+=2){const c=C.at(s),h=[];for(let u=-90;u<=90;u+=2)h.push(+C.height(c.cx+u,-s,2).toFixed(1));rows.push({s,cx:+c.cx.toFixed(2),hw:+c.hw.toFixed(1),h,w:(C.waysK?C.waysK(s):[]).map(w=>[w.kind[0],+w.u.toFixed(1),+w.w.toFixed(1)]),gul:+(c.gul||0).toFixed(2),goff:+(c.goff||0).toFixed(1),mog:+(c.mog||0).toFixed(2)});}return rows;},[+process.argv[3],+process.argv[4]]);
fs.writeFileSync(process.argv[2],JSON.stringify(r));await b.close();})();
