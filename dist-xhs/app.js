(function(){function h0(it){return it=Math.trunc(it)||0,it<0&&(it+=this.length),it<0||it>=this.length?void 0:this[it]}var It=[Array.prototype,String.prototype];["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"].forEach(function(it){typeof self[it]=="function"&&It.push(self[it].prototype)}),It.forEach(function(it){it.at||Object.defineProperty(it,"at",{value:h0,writable:!0,configurable:!0})}),Array.prototype.flat||Object.defineProperty(Array.prototype,"flat",{configurable:!0,writable:!0,value:function(mt){mt=mt===void 0?1:Math.trunc(mt)||0;var Re=[];return function ge(fs,G0){for(var Pt=0;Pt<fs.length;Pt++)Pt in fs&&(Array.isArray(fs[Pt])&&G0>0?ge(fs[Pt],G0-1):Re.push(fs[Pt]))}(this,mt),Re}}),Array.prototype.flatMap||Object.defineProperty(Array.prototype,"flatMap",{configurable:!0,writable:!0,value:function(mt,Re){return Array.prototype.map.call(this,mt,Re).flat(1)}}),Object.fromEntries||(Object.fromEntries=function(it){var mt={};return Array.from(it).forEach(function(Re){mt[Re[0]]=Re[1]}),mt}),typeof globalThis>"u"&&(self.globalThis=self)})(),self.COLD_SMOKE={noTilt:!0,maxDpr:1.5,maxPx:2e6},(()=>{"use strict";const h0=Math.PI,It=Math.PI*2,it=(e,s,w)=>e<s?s:e>w?w:e,mt=e=>e<0?0:e>1?1:e,Re=(e,s,w)=>e+(s-e)*w,ge=(e,s,w)=>{const x=mt((w-e)/(s-e));return x*x*(3-2*x)},fs=(e,s,w)=>{const x=mt((w-e)/(s-e));return x*x*x*(x*(x*6-15)+10)},G0=e=>e-Math.floor(e),Pt=(e,s,w,x)=>s+(e-s)*Math.exp(-w*x),R0=e=>e<0?-1:e>0?1:0;function ps(e){return e=e>>>0,e^=e>>>16,e=Math.imul(e,2146121005)>>>0,e^=e>>>15,e=Math.imul(e,2221713035)>>>0,e^=e>>>16,e>>>0}function ta(e,s){return ps((e|0)+Math.imul(ps(s|0),2654435761)|0)}function Ta(e,s,w){return ps((e|0)+Math.imul(ta(s,w),2654435761)|0)}const Is=1/4294967296,Ts=e=>ps(e)*Is,ms=(e,s)=>ta(e,s)*Is,Ss=(e,s,w)=>Ta(e,s,w)*Is;function D0(e){let s=e>>>0;return()=>{s=s+1831565813>>>0;let w=s;return w=Math.imul(w^w>>>15,w|1),w^=w+Math.imul(w^w>>>7,w|61),((w^w>>>14)>>>0)/4294967296}}function P0(e,s=0){const w=Math.floor(e),x=e-w,F=x*x*x*(x*(x*6-15)+10);return Re(ms(w,s),ms(w+1,s),F)*2-1}function da(e,s,w=0){const x=Math.floor(e),F=Math.floor(s),we=e-x,Y=s-F,E=we*we*we*(we*(we*6-15)+10),D=Y*Y*Y*(Y*(Y*6-15)+10),be=Ss(x,F,w),ht=Ss(x+1,F,w),qe=Ss(x,F+1,w),se=Ss(x+1,F+1,w);return Re(Re(be,ht,E),Re(qe,se,E),D)*2-1}function es(e,s,w,x=0){const F=Math.floor(e),we=Math.floor(s),Y=Math.floor(w),E=e-F,D=s-we,be=w-Y,ht=E*E*(3-2*E),qe=D*D*(3-2*D),se=be*be*(3-2*be),_=x*7919,b=(X,ke,C)=>Ss(X,ke,C+_),re=Re(b(F,we,Y),b(F+1,we,Y),ht),m=Re(b(F,we+1,Y),b(F+1,we+1,Y),ht),J=Re(b(F,we,Y+1),b(F+1,we,Y+1),ht),ae=Re(b(F,we+1,Y+1),b(F+1,we+1,Y+1),ht);return Re(Re(re,m,qe),Re(J,ae,qe),se)*2-1}function gn(e,s,w,x=0,F=2,we=.5){let Y=.5,E=0,D=0;for(let be=0;be<w;be++)E+=Y*da(e,s,x+be*131),D+=Y,e*=F,s*=F,Y*=we;return E/D}function xn(e,s,w,x,F=0){let we=.5,Y=0,E=0;for(let D=0;D<x;D++)Y+=we*es(e,s,w,F+D*17),E+=we,e*=2.03,s*=2.03,w*=2.03,we*=.5;return Y/E}const f={add:(e,s)=>[e[0]+s[0],e[1]+s[1],e[2]+s[2]],sub:(e,s)=>[e[0]-s[0],e[1]-s[1],e[2]-s[2]],mul:(e,s)=>[e[0]*s,e[1]*s,e[2]*s],dot:(e,s)=>e[0]*s[0]+e[1]*s[1]+e[2]*s[2],cross:(e,s)=>[e[1]*s[2]-e[2]*s[1],e[2]*s[0]-e[0]*s[2],e[0]*s[1]-e[1]*s[0]],len:e=>Math.hypot(e[0],e[1],e[2]),norm:e=>{const s=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/s,e[1]/s,e[2]/s]},lerp:(e,s,w)=>[e[0]+(s[0]-e[0])*w,e[1]+(s[1]-e[1])*w,e[2]+(s[2]-e[2])*w],mad:(e,s,w)=>[e[0]+s[0]*w,e[1]+s[1]*w,e[2]+s[2]*w]},Wt={ident:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],mul(e,s){const w=new Array(16);for(let x=0;x<4;x++)for(let F=0;F<4;F++)w[x*4+F]=e[F]*s[x*4]+e[4+F]*s[x*4+1]+e[8+F]*s[x*4+2]+e[12+F]*s[x*4+3];return w},perspective(e,s,w,x){const F=1/Math.tan(e/2),we=1/(w-x);return[F/s,0,0,0,0,F,0,0,0,0,x*we,-1,0,0,x*w*we,0]},ortho(e,s,w,x,F,we){return[2/(s-e),0,0,0,0,2/(x-w),0,0,0,0,1/(F-we),0,(e+s)/(e-s),(x+w)/(w-x),F/(F-we),1]},lookAt(e,s,w){const x=f.norm(f.sub(e,s)),F=f.norm(f.cross(w,x)),we=f.cross(x,F);return[F[0],we[0],x[0],0,F[1],we[1],x[1],0,F[2],we[2],x[2],0,-f.dot(F,e),-f.dot(we,e),-f.dot(x,e),1]},fromBasis(e,s,w,x){return[e[0],e[1],e[2],0,s[0],s[1],s[2],0,w[0],w[1],w[2],0,x[0],x[1],x[2],1]},translate(e){return[1,0,0,0,0,1,0,0,0,0,1,0,e[0],e[1],e[2],1]},scale(e){return[e[0],0,0,0,0,e[1],0,0,0,0,e[2],0,0,0,0,1]},rotX(e){const s=Math.cos(e),w=Math.sin(e);return[1,0,0,0,0,s,w,0,0,-w,s,0,0,0,0,1]},rotY(e){const s=Math.cos(e),w=Math.sin(e);return[s,0,-w,0,0,1,0,0,w,0,s,0,0,0,0,1]},rotZ(e){const s=Math.cos(e),w=Math.sin(e);return[s,w,0,0,-w,s,0,0,0,0,1,0,0,0,0,1]},rotAxis(e,s){const[w,x,F]=f.norm(e),we=Math.cos(s),Y=Math.sin(s),E=1-we;return[E*w*w+we,E*w*x+Y*F,E*w*F-Y*x,0,E*w*x-Y*F,E*x*x+we,E*x*F+Y*w,0,E*w*F+Y*x,E*x*F-Y*w,E*F*F+we,0,0,0,0,1]},invert(e){const s=e[0],w=e[1],x=e[2],F=e[3],we=e[4],Y=e[5],E=e[6],D=e[7],be=e[8],ht=e[9],qe=e[10],se=e[11],_=e[12],b=e[13],re=e[14],m=e[15],J=s*Y-w*we,ae=s*E-x*we,X=s*D-F*we,ke=w*E-x*Y,C=w*D-F*Y,ne=x*D-F*E,Be=be*b-ht*_,Ee=be*re-qe*_,je=be*m-se*_,$e=ht*re-qe*b,nt=ht*m-se*b,Ke=qe*m-se*re;let Fe=J*Ke-ae*nt+X*$e+ke*je-C*Ee+ne*Be;return Fe=1/Fe,[(Y*Ke-E*nt+D*$e)*Fe,(x*nt-w*Ke-F*$e)*Fe,(b*ne-re*C+m*ke)*Fe,(qe*C-ht*ne-se*ke)*Fe,(E*je-we*Ke-D*Ee)*Fe,(s*Ke-x*je+F*Ee)*Fe,(re*X-_*ne-m*ae)*Fe,(be*ne-qe*X+se*ae)*Fe,(we*nt-Y*je+D*Be)*Fe,(w*je-s*nt-F*Be)*Fe,(_*C-b*X+m*J)*Fe,(ht*X-be*C-se*J)*Fe,(Y*Ee-we*$e-E*Be)*Fe,(s*$e-w*Ee+x*Be)*Fe,(b*ae-_*ke-re*J)*Fe,(be*ke-ht*ae+qe*J)*Fe]},tp(e,s){const w=e[3]*s[0]+e[7]*s[1]+e[11]*s[2]+e[15];return[(e[0]*s[0]+e[4]*s[1]+e[8]*s[2]+e[12])/w,(e[1]*s[0]+e[5]*s[1]+e[9]*s[2]+e[13])/w,(e[2]*s[0]+e[6]*s[1]+e[10]*s[2]+e[14])/w]},td(e,s){return[e[0]*s[0]+e[4]*s[1]+e[8]*s[2],e[1]*s[0]+e[5]*s[1]+e[9]*s[2],e[2]*s[0]+e[6]*s[1]+e[10]*s[2]]}},Aa=new Float32Array(1),Za=new Uint32Array(Aa.buffer);function As(e){Aa[0]=e;const s=Za[0],w=s>>>16&32768;let x=s>>>12&2047;const F=s>>>23&255;return F<103?w:F>142?w|31744|((F===255?0:1)&&0):F<113?(x|=2048,w|(x>>114-F)+(x>>113-F&1)):(w|F-112<<10|x>>1)+(x&1)}const V0=(()=>{const e={rot:0,w:0,h:0,forced:!1,flip:!1,wide:!0,short:!1},s=()=>!!(window.matchMedia&&matchMedia("(pointer: coarse) and (hover: none)").matches);return e.measure=function(){const w=innerWidth,x=innerHeight;return e.forced=e.force!=null?e.force:s()&&x>w*1.04,e.rot=e.forced?e.flip?-90:90:0,e.w=e.forced?x:w,e.h=e.forced?w:x,e.wide=e.w>=e.h*1.12,e.short=e.h<520,e},e.x=w=>e.rot===90?w.clientY:e.rot===-90?innerHeight-w.clientY:w.clientX,e.y=w=>e.rot===90?innerWidth-w.clientX:e.rot===-90?w.clientX:w.clientY,e.angle=()=>(((screen.orientation&&screen.orientation.angle||window.orientation||0)+(e.rot===90?90:e.rot===-90?270:0))%360+360)%360,e.gravity=function(w){if(!e.forced)return!1;const x=w>.5?!0:w<-.5?!1:e.flip;return x===e.flip?!1:(e.flip=x,!0)},e})(),Fs=(()=>{const e={"一个人，一座山，一直往下":"One skier, one mountain, all the way down",出发:"Start",场景:"Scene",视角:"Views",操作:"Controls",回车:"Enter",静音:"Mute",全屏:"Full screen",退出全屏:"Exit full screen","画面和声音全部由代码实时生成，没有一张贴图、一段录音。戴上耳机更好。":"Every picture and every sound is made live by code: not one texture, not one recording. Best with headphones.","画面和声音全部由代码实时生成，戴上耳机更好。":"Every picture and every sound is made live by code. Best with headphones.","← → 或 A D 转弯 · 空格 跳 · ↓ 或 S 加速":"← → or A D to turn · Space to jump · ↓ or S to tuck","按住屏幕左右拖动转弯 · 右下角 跳 / 加速":"Hold and drag left or right to turn · Jump and Tuck at bottom right","倾斜手机或按住屏幕左右拖动转弯 · 右下角 跳 / 加速":"Tilt the phone, or hold and drag, to turn · Jump and Tuck at bottom right","倾斜手机转弯，或按住屏幕左右拖动":"Tilt the phone to turn, or hold and drag",醒来:"waking",磨雪:"grinding snow",远山与城市:"far ranges and the city",立起天空:"raising the sky",林子里有鹿:"deer in the woods",种树:"planting trees",点亮星云:"lighting the nebula",调音:"tuning",调光:"setting the light",铺雪:"laying the snow",第一缕光:"first light","这台设备的浏览器不支持 WebGL2，画面无法启动。":"This browser does not support WebGL2, so the picture cannot start.","落差 M":"DROP M",落差:"DROP","距离 M":"DISTANCE M","距离 KM":"DISTANCE KM","极速 KM/H":"TOP KM/H","飞行 M":"AIR M","飞行 ":"AIR ",日出:"Sunrise",日落:"Sunset",加速:"Tuck",跳:"Jump",换视角:"Change view",菜单:"Menu",声音开关:"Sound on or off",暂停:"Paused",像握方向盘一样倾斜手机:"Tilt the phone like a steering wheel","按住屏幕，左右拖动":"Hold the screen, drag left or right","连着转弯，把雪扬起来":"Link your turns, throw up the snow","按住「跳」蓄力，松开起跳":"Hold Jump to load up, let go to fly","空格 跳（按住蓄力） · ↓ 加速":"Space to jump (hold to load up) · ↓ to tuck","← →  或  A D  转弯":"← →  or  A D  to turn",画面断开了:"THE PICTURE WAS LOST",点一下重新上山:"Tap to ski again",开阔大坡:"Open Bowl",陡坡:"The Steeps",树林:"Glade",起伏:"Rollers",雪槽:"Gully",跳台:"Kickers",深粉雪:"Deep Powder",山脊:"Ridge",蘑菇:"Moguls",自动:"Auto",白天:"Day",傍晚:"Golden hour",黄昏:"Dusk",夜晚:"Night",黎明:"Dawn",小雪:"Light snow",中雪:"Snow",大雪:"Heavy snow",雷暴雪:"Thundersnow",追尾:"Chase",第一人称:"First person",雪板尖:"Ski tips",贴雪:"Low",俯瞰:"Overhead",左侧:"Left side",右侧:"Right side",正面:"Front",远摄:"Telephoto",鹿:"Deer",雪兔:"Snow hare",狐狸:"Fox",北山羊:"Ibex",金雕:"Golden eagle",动物:"Animal",航班:"Airliner",时间:"Time",天气:"Weather",路段:"Runs",山:"Mountain",偶遇:"Encounters","say:时间":"TIME","say:天气":"WEATHER","say:路段":"RUN","say:山":"MOUNTAIN","say:偶遇":"ENCOUNTER","say:视角":"VIEW","航班 · 还在天上":"Airliner · still up there","航班 · 看左上方":"Airliner · look up to the left","航班 · 看右上方":"Airliner · look up to the right","PAUSED · 暂停":"PAUSED","MENU · 菜单":"MENU",继续滑:"Ski on",天色与天气:"Time & weather",换一座山:"New mountain",操作说明:"Controls",设置:"Settings",回到山顶:"Back to the top",版本对比:"Versions","TIME · 天色":"TIME","WEATHER · 天气":"WEATHER","VIEW · 视角":"VIEW","RUN · 路段":"RUN","ENCOUNTER · 偶遇":"ENCOUNTER","MOUNTAIN · 山":"MOUNTAIN","CONTROLS · 操作说明":"CONTROLS","SETTINGS · 设置":"SETTINGS","VERSIONS · 版本对比":"VERSIONS","选中立刻生效，后面的画面会跟着变。「自动」让一天自己走下去，琥珀色小点是现在走到的时刻。":"A pick shows at once in the picture behind. Auto lets the day go on by itself; the amber dot marks the hour it has reached.","滑的时候按 V 依次切换，Shift+V 往回；右键拖动或 I J K L 环顾四周。":"While skiing, V steps through them and Shift+V steps back; right-drag or I J K L to look around.","滑的时候点「跳」上方的机位按钮依次切换；两指拖动环顾四周。":"While skiing, tap the camera button above Jump to step through them; drag with two fingers to look around.","选一种地形，会跳到前方最近的那一段；亮着的是你现在所在的路段。":"Pick a kind of terrain to go to the nearest stretch of it ahead; the lit one is where you are now.","选了就回到滑雪：动物会出现在前方不远处，航班从天上飞过。":"A pick takes you back to skiing: the animal turns up a little way ahead, the airliner passes overhead.","每座山由一个编号生成。地址栏里的 #seed-编号 发给别人，就是同一座山。":"Every mountain grows from a number. Send someone the #seed-number in the address bar and they get the same mountain.","转弯（按久了会切雪）":"Turn (hold longer to carve)",空格:"Space","跳，按住蓄力":"Jump, hold to load up","压低加速，慢的时候撑杖":"Tuck for speed, pole when slow","右键拖　I J K L":"Right-drag　I J K L",环顾四周:"Look around","换时间 · 换天气":"Time · weather",下一种路段:"Next run","叫出动物 · 航班":"Animal · airliner","静音 · 全屏":"Mute · full screen","菜单 · 这一页 · 版本对比":"Menu · this page · versions",按住拖动:"Hold & drag","左右拖动转弯，拖过刻度就切雪":"Drag left or right to turn, past the mark to carve","按住蓄力，松开起跳":"Hold to load up, let go to fly","按住压低，慢的时候自动撑杖":"Hold to tuck; poles by itself when slow",机位:"Camera",两指拖动:"Two-finger drag","Shift + 字母 往回切换。":"Shift + the letter steps back.","声音 开":"Sound on","声音 关":"Sound off",语言:"Language","给验收用，不是游戏的一部分 · 小圆点是推荐的版本":"For review, not part of the game · the dot marks the recommended version",恢复推荐:"Reset to recommended",推荐:"Recommended",镜头:"Camera",人物与动作:"Skier & motion",画面:"Picture",雪:"Snow",场景与天气:"Scene & weather",手感:"Feel",新加的:"New",追身镜头:"Chase camera",林间镜头:"Camera in trees",分段机位:"Camera per run",雪板尖机位:"Ski-tips camera",俯冲手位:"Hands in a tuck",四角模糊:"Corner blur",雪面颤动:"Snow chatter",风压抖动:"Wind buffet",人物模型:"Skier model",衣服:"Clothing",持杖:"Pole carry",人物动作:"Skier motion",逆光光斑:"Lens ghosts",高光:"Highlights",夜间雪雾:"Spray at night",夜空颜色:"Night sky colour",小云:"Small clouds",雪幕高度:"Spray height",闪光:"Sparkle",雪团:"Snow clumps",镜头上的雪:"Snow on the lens",粉雪深度:"Powder depth",风吹雪:"Blowing snow",岩壁:"Rock walls",夜里的月亮:"Moon at night",大雪样式:"Heavy snow style",山脊树:"Ridge trees",跳台旗:"Jump flags",入雪深浅:"Ski sink",风声:"Wind sound",键盘转弯:"Keyboard turns",现在的:"Current",原来:"Original",原样:"As was",新的:"New",低机位:"Low",折中:"Middle",贴近:"Closer",原位淡树:"Fade trees",不变:"Fixed",按路段大变:"Big",轻微变化:"Subtle",贴板:"On the ski",大腿:"Thigh",头盔:"Helmet",压低:"Low",面前:"In front",无:"None",轻:"Light",明显:"Strong",关:"Off",开:"On",有:"On",更强:"Stronger",没有:"None",真实:"Realistic",多一些:"More",再多一点:"Even more",没有冰晶群:"No swarms",水珠:"Droplets",白雪被吹走:"Blown off",先白后化:"Melts",平整:"Smooth",自然:"Natural",厚实:"Thick",手在前:"Hands forward",更舒展:"Looser",渐白:"Roll to white",暗蓝头灯:"Headlamp blue",月光亮些:"Moonlit",收:"Toned",更收:"More toned",碎云:"Broken",去掉小云:"None",处处都高:"Tall",按雪况:"By the snow",浮在面上:"On top",没过靴子:"Boot deep",没过膝盖:"Knee deep",斑块:"Patches",岩带:"Bands",多岩:"Rocky",月牙:"Crescent",盈凸:"Gibbous",阵雪:"Showers",暴风雪:"Blizzard",风旗云杉:"Flag spruce",宽旗:"Wide flags",羽毛旗:"Feather flags",浅:"Shallow",适中:"Medium",深:"Deep",大一点:"Louder",更大:"Loudest",按半秒就搓:"Skid after ½ s",按两秒才搓:"Skid after 2 s",横过来才搓:"Side-on only"},s="coldsmoke.lang",w={EN:e,lang:"zh",subs:[]},x=Y=>Y==="zh"||Y==="en"?Y:null;function F(){try{const Y=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""];return/^zh\b/i.test(String(Y[0]||""))?"zh":"en"}catch(Y){return"zh"}}{let Y=null,E=null;try{Y=x(new URLSearchParams(location.search).get("lang"))}catch(D){}try{E=x(localStorage.getItem(s))}catch(D){}w.lang=Y||E||F()}w.en=()=>w.lang==="en",w.t=Y=>{if(w.lang!=="en"||Y==null)return Y;const E=String(Y),D=e[E];if(D!=null)return D;const be=E.trim();return e[be]!=null?E.replace(be,e[be]):E};let we=null;return w.capture=function(Y){we=[];const E=document.createTreeWalker(Y,NodeFilter.SHOW_TEXT);let D;for(;D=E.nextNode();){const be=D.nodeValue.trim();be&&e[be]!=null&&we.push({n:D,zh:D.nodeValue})}for(const be of Y.querySelectorAll("[aria-label],[title]"))for(const ht of["aria-label","title"]){const qe=be.getAttribute(ht);qe&&e[qe]!=null&&we.push({e:be,a:ht,zh:qe})}w.apply()},w.apply=function(){const Y=document.documentElement;Y.lang=w.lang==="en"?"en":"zh-CN";const E=document.getElementById("app");E&&E.classList.toggle("en",w.lang==="en");for(const D of we||[])D.n?D.n.nodeValue=w.t(D.zh):D.e.setAttribute(D.a,w.t(D.zh))},w.set=function(Y){if(Y=x(Y),!(!Y||Y===w.lang)){w.lang=Y;try{localStorage.setItem(s,Y)}catch(E){}w.apply();for(const E of w.subs)try{E(Y)}catch(D){console.warn(D)}}},w.on=Y=>w.subs.push(Y),w})(),Dt=(()=>{const e={defs:[],val:{},subs:[]},s=x=>"cs.v."+x,w=x=>{try{const F=new RegExp("[?&]v-"+x+"=([a-z0-9]+)").exec(location.search);return F?F[1]:null}catch(F){return null}};return e.def=function(x,F,we,Y){const E=se=>we.some(_=>_[0]===se);E(Y)||(Y=we[0][0]);const D=e.defs.findIndex(se=>se.name===x),be={name:x,label:F,opts:we,def:Y};D>=0?e.defs[D]=be:e.defs.push(be);let ht=Y;try{const se=localStorage.getItem(s(x));se&&E(se)&&(ht=se)}catch(se){}const qe=w(x);qe&&E(qe)&&(ht=qe),e.val[x]=ht;for(const se of e.subs)try{se(x,ht,!0)}catch(_){}return ht},e.set=function(x,F){const we=e.defs.find(Y=>Y.name===x);if(!(!we||!we.opts.some(Y=>Y[0]===F)||e.val[x]===F)){e.val[x]=F;try{localStorage.setItem(s(x),F)}catch(Y){}for(const Y of e.subs)try{Y(x,F,!1)}catch(E){}}},e.reset=function(){for(const x of e.defs){e.set(x.name,x.def);try{localStorage.removeItem(s(x.name))}catch(F){}}},e.on=x=>{e.subs.push(x)},e})(),Rs={f32:"float",i32:"int",u32:"uint",vec2f:"vec2",vec3f:"vec3",vec4f:"vec4",vec2i:"ivec2",vec3i:"ivec3",vec4i:"ivec4",vec2u:"uvec2",vec3u:"uvec3",vec4u:"uvec4",mat2x2f:"mat2",mat3x3f:"mat3",mat4x4f:"mat4"},Os={f32:1,vec2f:2,vec3f:3,vec4f:4,mat4x4f:16};function sa(e){let s=e.replace(/\/\/[^\n]*/g,"");s=s.replace(/struct\s+(\w+)\s*\{([^}]*)\}/g,(x,F,we)=>{const Y=we.split(",").map(E=>E.trim()).filter(Boolean).map(E=>{const D=E.indexOf(":");return"  "+E.slice(D+1).trim()+" "+E.slice(0,D).trim()+";"});return"struct "+F+` {
`+Y.join(`
`)+`
};`}),s=s.replace(/\bfn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*(\w+))?\s*\{/g,(x,F,we,Y)=>{const E=we.split(",").map(D=>D.trim()).filter(Boolean).map(D=>{const be=D.indexOf(":");return D.slice(be+1).trim()+" "+D.slice(0,be).trim()});return(Y||"void")+" "+F+"("+E.join(", ")+") {"}),s=s.replace(/\bconst\s+(\w+)\s*:\s*(\w+)\s*=/g,"const $2 $1 ="),s=s.replace(/\b(?:let|var)\s+(\w+)\s*:\s*(\w+)\s*(=|;)/g,"$2 $1 $3"),s=s.replace(/\b(f32|i32|u32|vec[234][fiu]|mat[234]x[234]f)\b/g,x=>Rs[x]||x);const w=s.match(/\b(let|var)\s+\w+[^\n]*/);if(w)throw new Error("SSL: untyped declaration: "+w[0]);return s}function Ja(e){return e.replace(/\btexLod\(\s*(\w+)\s*,/g,"textureSampleLevel($1, $1_s,").replace(/\btexFetchD\(\s*(\w+)\s*,/g,"textureLoad($1,").replace(/\btexFetch\(\s*(\w+)\s*,/g,"textureLoad($1,").replace(/\btexShadow\(\s*(\w+)\s*,/g,"textureSampleCompareLevel($1, $1_s,").replace(/\btexSize\(\s*(\w+)\s*\)/g,"vec2f(textureDimensions($1))").replace(/\btex\(\s*(\w+)\s*,/g,"textureSample($1, $1_s,")}const Qa=`#version 300 es
precision highp float; precision highp int; precision highp sampler2D; precision highp sampler2DShadow;
#define dpdx dFdx
#define dpdy dFdy
#define atan2(y, x) atan(y, x)
#define inverseSqrt inversesqrt
#define tex(t, uv) texture(t, uv)
#define texLod(t, uv, l) textureLod(t, uv, l)
#define texFetch(t, p, l) texelFetch(t, p, l)
#define texFetchD(t, p, l) texelFetch(t, p, l).r
#define texShadow(t, uv, r) texture(t, vec3(uv, r))
#define texSize(t) vec2(textureSize(t, 0))
float saturate(float x) { return clamp(x, 0.0, 1.0); }
vec2 saturate(vec2 x) { return clamp(x, 0.0, 1.0); }
vec3 saturate(vec3 x) { return clamp(x, 0.0, 1.0); }
vec4 saturate(vec4 x) { return clamp(x, 0.0, 1.0); }
float select(float a, float b, bool c) { return c ? b : a; }
vec2 select(vec2 a, vec2 b, bool c) { return c ? b : a; }
vec3 select(vec3 a, vec3 b, bool c) { return c ? b : a; }
vec4 select(vec4 a, vec4 b, bool c) { return c ? b : a; }
int select(int a, int b, bool c) { return c ? b : a; }
`,aa=[];let Ps=0;const u0={};function eo(e){aa.length=0,Ps=0;for(const[s,w]of e)aa.push([s,w]),u0[s]=Ps,Ps+=Os[w]}function pa(e){return e.split(`
`).map((s,w)=>String(w+1).padStart(4)+" "+s).join(`
`)}function Fa(e,s){const w=[];(e.buffers||[]).forEach(_=>_.attrs.forEach(b=>w.push(b)));const x=Object.entries(e.varyings||{}),F=Object.entries(e.uniforms||{}),we=Object.entries(e.textures||{}),Y=(e.lib||[]).join(`
`),E=`struct Globals {
`+aa.map(([_,b])=>"  "+_+": "+b+",").join(`
`)+`
}
`,D=F.length?`struct MatU {
`+F.map(([_,b])=>"  "+_+": "+b+",").join(`
`)+`
}
`:"";if(s==="wgsl"){let _=`diagnostic(off, derivative_uniformity);
`+E+`@group(0) @binding(0) var<uniform> U: Globals;
`;F.length&&(_+=D+`@group(1) @binding(0) var<uniform> M: MatU;
`);let b=0;for(const[J,ae]of we)ae==="2d"?_+=`@group(2) @binding(${b++}) var ${J}: texture_2d<f32>;
@group(2) @binding(${b++}) var ${J}_s: sampler;
`:ae==="fetch"?_+=`@group(2) @binding(${b++}) var ${J}: texture_2d<f32>;
`:ae==="depth"?_+=`@group(2) @binding(${b++}) var ${J}: texture_depth_2d;
`:ae==="shadow"&&(_+=`@group(2) @binding(${b++}) var ${J}: texture_depth_2d;
@group(2) @binding(${b++}) var ${J}_s: sampler_comparison;
`);_+=`struct VIn {
`+w.map((J,ae)=>`  @location(${ae}) ${J[0]}: ${J[1]},`).join(`
`)+`
  @builtin(vertex_index) vid: u32,
  @builtin(instance_index) iid: u32,
}
`,_+=`struct VOut {
  @builtin(position) clip: vec4f,
`+x.map(([J,ae],X)=>`  @location(${X}) ${J}: ${ae},`).join(`
`)+`
}
`,_+=`struct FOut {
  @location(0) color: vec4f,
}
`;const re=Ja(Y+`
`+e.vs+`
`+(e.fs||""));let m=`@vertex fn vs_main(a: VIn) -> VOut { return vert(a); }
`;return e.fs&&(m+=`@fragment fn fs_main(v: VOut) -> FOut { return frag(v); }
`),{code:_+re+`
`+m}}const be=Qa+`layout(std140) uniform GlobalsBlock {
`+aa.map(([_,b])=>"  "+Rs[b]+" "+_+";").join(`
`)+`
} U;
`+(F.length?sa(D)+`
uniform MatU M;
`:"")+we.map(([_,b])=>"uniform "+(b==="shadow"?"sampler2DShadow ":"sampler2D ")+_+";").join(`
`)+`
struct VIn {
`+w.map(_=>"  "+Rs[_[1]]+" "+_[0]+";").join(`
`)+`
  uint vid;
  uint iid;
};
struct VOut {
  vec4 clip;
`+x.map(([_,b])=>"  "+Rs[b]+" "+_+";").join(`
`)+`
};
struct FOut {
  vec4 color;
};
`,ht=sa(Y),qe=be+w.map((_,b)=>`layout(location=${b}) in ${Rs[_[1]]} a_${_[0]};`).join(`
`)+`
`+x.map(([_,b])=>`out ${Rs[b]} v_${_};`).join(`
`)+`
uniform float u_ysign;
`+ht+`
`+sa(e.vs)+`
void main() {
  VIn a;
`+w.map(_=>`  a.${_[0]} = a_${_[0]};`).join(`
`)+`
  a.vid = uint(gl_VertexID); a.iid = uint(gl_InstanceID);
  VOut v = vert(a);
`+x.map(([_])=>`  v_${_} = v.${_};`).join(`
`)+`
  gl_Position = vec4(v.clip.x, v.clip.y * u_ysign, v.clip.z * 2.0 - v.clip.w, v.clip.w);
}
`,se=be+x.map(([_,b])=>`in ${Rs[b]} v_${_};`).join(`
`)+`
layout(location=0) out vec4 o_color;
uniform float u_ysign;
uniform float u_fbh;
`+(e.fs?ht+`
`+sa(e.fs)+`
void main() {
  VOut v;
  v.clip = gl_FragCoord;
  if (u_ysign > 0.0) { v.clip.y = u_fbh - v.clip.y; }
`+x.map(([_])=>`  v.${_} = v_${_};`).join(`
`)+`
  FOut o = frag(v);
  o_color = o.color;
}
`:`void main() { o_color = vec4(0.0); }
`);return{vs:qe,fs:se}}function Ua(e){const s=[];let w=0;for(const[x,F]of Object.entries(e.uniforms||{}))s.push({name:x,type:F,off:w,size:Os[F]}),w+=Os[F];return{fields:s,size:w}}function qa(e,s,w){for(const x of e.fields){const F=s[x.name];if(F!==void 0)if(typeof F=="number")w[x.off]=F,w[x.off+1]=0,w[x.off+2]=0,w[x.off+3]=0;else for(let we=0;we<x.size;we++)w[x.off+we]=F[we]||0}}let Us=1;function to(e){const s=e.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!s)return null;const w=s.getExtension("EXT_color_buffer_float"),x=s.getExtension("EXT_color_buffer_half_float");s.getExtension("OES_texture_float_linear");const F={backend:"webgl2",hdr:!!(w||x),r32fTarget:!!w,maxTex:s.getParameter(s.MAX_TEXTURE_SIZE),name:"WebGL2"},we=s.getExtension("WEBGL_debug_renderer_info");F.renderer=we?s.getParameter(we.UNMASKED_RENDERER_WEBGL):"webgl2";const Y={rgba8:[s.RGBA8,s.RGBA,s.UNSIGNED_BYTE],rgba16f:[s.RGBA16F,s.RGBA,s.HALF_FLOAT],r32f:[s.R32F,s.RED,s.FLOAT],rgba32f:[s.RGBA32F,s.RGBA,s.FLOAT],r8:[s.R8,s.RED,s.UNSIGNED_BYTE],depth:[s.DEPTH_COMPONENT24,s.DEPTH_COMPONENT,s.UNSIGNED_INT]},E=s.createBuffer();s.bindBuffer(s.UNIFORM_BUFFER,E),s.bufferData(s.UNIFORM_BUFFER,Ps*4,s.DYNAMIC_DRAW),s.bindBufferBase(s.UNIFORM_BUFFER,0,E);let D=null,be,ht=1,qe={};const se=new Map,_={caps:F,gl:s,texture(b){const re={id:Us++,w:b.w,h:b.h,format:b.format,filter:b.filter||"linear",wrap:b.wrap||"clamp",mips:!!b.mips,compare:!!b.compare,levels:b.mips?Math.floor(Math.log2(Math.max(b.w,b.h)))+1:1},m=Y[b.format];re.gl=s.createTexture(),s.bindTexture(s.TEXTURE_2D,re.gl),s.texStorage2D(s.TEXTURE_2D,re.levels,m[0],b.w,b.h);const J=re.filter==="linear";s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,re.mips?J?s.LINEAR_MIPMAP_LINEAR:s.NEAREST_MIPMAP_NEAREST:J?s.LINEAR:s.NEAREST),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,J?s.LINEAR:s.NEAREST);const ae=re.wrap==="repeat"?s.REPEAT:re.wrap==="mirror"?s.MIRRORED_REPEAT:s.CLAMP_TO_EDGE,X=b.wrapY?b.wrapY==="repeat"?s.REPEAT:s.CLAMP_TO_EDGE:ae;return s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,ae),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,X),re.compare&&(s.texParameteri(s.TEXTURE_2D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_COMPARE_FUNC,s.LEQUAL)),b.data&&_.updateTexture(re,0,0,b.w,b.h,b.data),re},updateTexture(b,re,m,J,ae,X){const ke=Y[b.format];s.bindTexture(s.TEXTURE_2D,b.gl),s.pixelStorei(s.UNPACK_ALIGNMENT,1),s.texSubImage2D(s.TEXTURE_2D,0,re,m,J,ae,ke[1],ke[2],X)},genMips(b){s.bindTexture(s.TEXTURE_2D,b.gl),s.generateMipmap(s.TEXTURE_2D)},destroyTexture(b){b&&b.gl&&(s.deleteTexture(b.gl),b.gl=null)},target(b){const re={id:Us++,color:b.color||null,depth:b.depth||null,w:(b.color||b.depth).w,h:(b.color||b.depth).h,level:b.level||0};re.fb=s.createFramebuffer(),s.bindFramebuffer(s.FRAMEBUFFER,re.fb),re.color&&s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,re.color.gl,re.level),re.depth&&s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,re.depth.gl,0),re.color||(s.drawBuffers([s.NONE]),s.readBuffer(s.NONE)),re.level&&(re.w=Math.max(1,re.w>>re.level),re.h=Math.max(1,re.h>>re.level));const m=s.checkFramebufferStatus(s.FRAMEBUFFER);if(m!==s.FRAMEBUFFER_COMPLETE)throw new Error("framebuffer incomplete 0x"+m.toString(16)+" fmt "+(re.color&&re.color.format));return s.bindFramebuffer(s.FRAMEBUFFER,null),be=void 0,re},destroyTarget(b){b&&b.fb&&(s.deleteFramebuffer(b.fb),b.fb=null)},buffer(b,re,m){const J={id:Us++,kind:re,size:b.byteLength};J.gl=s.createBuffer();const ae=re==="index"?s.ELEMENT_ARRAY_BUFFER:s.ARRAY_BUFFER;return s.bindVertexArray(null),s.bindBuffer(ae,J.gl),s.bufferData(ae,b,m?s.DYNAMIC_DRAW:s.STATIC_DRAW),J},updateBuffer(b,re,m){const J=b.kind==="index"?s.ELEMENT_ARRAY_BUFFER:s.ARRAY_BUFFER;s.bindVertexArray(null),s.bindBuffer(J,b.gl),s.bufferSubData(J,re,m)},destroyBuffer(b){b&&b.gl&&(s.deleteBuffer(b.gl),b.gl=null)},pipeline(b){const re=Fa(b,"glsl"),m=(C,ne)=>{const Be=s.createShader(C);return s.shaderSource(Be,ne),s.compileShader(Be),Be},J=m(s.VERTEX_SHADER,re.vs),ae=m(s.FRAGMENT_SHADER,re.fs),X=s.createProgram();s.attachShader(X,J),s.attachShader(X,ae),s.linkProgram(X);const ke={id:Us++,desc:b,prog:X,vs:J,fs:ae,src:re,layout:Ua(b),ready:!1,name:b.name};return ke.ubuf=new Float32Array(Math.max(4,ke.layout.size)),ke},finishPipeline(b){if(b.ready)return;const re=b.prog;if(!s.getProgramParameter(re,s.LINK_STATUS)){const J=s.getShaderInfoLog(b.vs),ae=s.getShaderInfoLog(b.fs),X=s.getProgramInfoLog(re),ke=new Error("GLSL ["+b.name+`]
VS: `+J+`
FS: `+ae+`
LINK: `+X);throw ke.vs=pa(b.src.vs),ke.fs=pa(b.src.fs),ke}s.useProgram(re),D=null;const m=s.getUniformBlockIndex(re,"GlobalsBlock");m!==s.INVALID_INDEX&&s.uniformBlockBinding(re,m,0),b.uy=s.getUniformLocation(re,"u_ysign"),b.ufbh=s.getUniformLocation(re,"u_fbh"),b.ulocs=b.layout.fields.map(J=>s.getUniformLocation(re,"M."+J.name)),b.texNames=Object.keys(b.desc.textures||{}),b.texNames.forEach((J,ae)=>{const X=s.getUniformLocation(re,J);X&&s.uniform1i(X,ae)}),b.ready=!0},setGlobals(b){s.bindBuffer(s.UNIFORM_BUFFER,E),s.bufferSubData(s.UNIFORM_BUFFER,0,b)},beginFrame(){},beginPass(b,re={}){s.bindFramebuffer(s.FRAMEBUFFER,b?b.fb:null),be=b,ht=b?-1:1;const m=b?b.w:e.width,J=b?b.h:e.height;s.viewport(0,0,m,J),_.passW=m,_.passH=J,s.frontFace(b?s.CW:s.CCW);let ae=0;re.color&&(s.colorMask(!0,!0,!0,!0),qe.cm=!0,s.clearColor(re.color[0],re.color[1],re.color[2],re.color[3]),ae|=s.COLOR_BUFFER_BIT),re.depth!=null&&(s.depthMask(!0),qe.dw=!0,s.clearDepth(re.depth),ae|=s.DEPTH_BUFFER_BIT),ae&&s.clear(ae),D=null},endPass(){},draw(b,re){b.ready||_.finishPipeline(b);const m=b.desc;D!==b&&(s.useProgram(b.prog),D=b,s.uniform1f(b.uy,ht),b.ufbh&&s.uniform1f(b.ufbh,_.passH));const J=m.blend||"none";qe.blend!==J&&(qe.blend=J,J==="none"?s.disable(s.BLEND):(s.enable(s.BLEND),s.blendEquation(s.FUNC_ADD),J==="alpha"?s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA):J==="premul"?s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE):J==="add"?s.blendFuncSeparate(s.ONE,s.ONE,s.ZERO,s.ONE):J==="mul"?s.blendFuncSeparate(s.DST_COLOR,s.ZERO,s.ZERO,s.ONE):J==="add4"?s.blendFuncSeparate(s.ONE,s.ONE,s.ONE,s.ONE):J==="trans"&&s.blendFuncSeparate(s.ONE,s.SRC_ALPHA,s.ZERO,s.ONE)));const ae=m.depthTest!==!1&&!!(be&&be.depth),X=ae&&m.depthWrite!==!1,ke=m.depthFunc||"less";qe.dt!==ae&&(qe.dt=ae,ae?s.enable(s.DEPTH_TEST):s.disable(s.DEPTH_TEST)),qe.dw!==X&&(qe.dw=X,s.depthMask(X)),qe.df!==ke&&(qe.df=ke,s.depthFunc(ke==="lequal"?s.LEQUAL:ke==="always"?s.ALWAYS:ke==="equal"?s.EQUAL:s.LESS));const C=m.cull||"back";qe.cull!==C&&(qe.cull=C,C==="none"?s.disable(s.CULL_FACE):(s.enable(s.CULL_FACE),s.cullFace(C==="front"?s.FRONT:s.BACK)));const ne=m.depthBias||0;qe.bias!==ne&&(qe.bias=ne,ne?(s.enable(s.POLYGON_OFFSET_FILL),s.polygonOffset(m.depthBiasSlope||2,ne)):s.disable(s.POLYGON_OFFSET_FILL));const Be=m.colorMask!==!1;if(qe.cm!==Be&&(qe.cm=Be,s.colorMask(Be,Be,Be,Be)),re.u){qa(b.layout,re.u,b.ubuf);for(let Fe=0;Fe<b.layout.fields.length;Fe++){const Ge=b.layout.fields[Fe],Je=b.ulocs[Fe];Je&&(Ge.size===16?s.uniformMatrix4fv(Je,!1,b.ubuf,Ge.off,16):s.uniform4fv(Je,b.ubuf,Ge.off,4))}}for(let Fe=0;Fe<b.texNames.length;Fe++){const Ge=re.tex&&re.tex[b.texNames[Fe]];if(!Ge)throw new Error("missing texture "+b.texNames[Fe]+" for "+b.name);s.activeTexture(s.TEXTURE0+Fe),s.bindTexture(s.TEXTURE_2D,Ge.gl)}const Ee=re.vb||[],je=b.id+":"+Ee.map(Fe=>Fe.id).join(",")+":"+(re.ib?re.ib.id:0);let $e=se.get(je);if($e)s.bindVertexArray($e);else{$e=s.createVertexArray(),s.bindVertexArray($e);let Fe=0;(m.buffers||[]).forEach((Ge,Je)=>{s.bindBuffer(s.ARRAY_BUFFER,Ee[Je].gl);const le=Ge.attrs.reduce((pe,c)=>pe+Os[c[1]],0)*4;let Pe=0;for(const pe of Ge.attrs){const c=Os[pe[1]];s.enableVertexAttribArray(Fe),s.vertexAttribPointer(Fe,c,s.FLOAT,!1,le,Pe),Ge.instanced&&s.vertexAttribDivisor(Fe,1),Pe+=c*4,Fe++}}),re.ib&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,re.ib.gl),se.set(je,$e)}const nt=m.topology==="strip"?s.TRIANGLE_STRIP:m.topology==="lines"?s.LINES:s.TRIANGLES,Ke=re.instances==null?1:re.instances;Ke<=0||re.count<=0||(re.ib?s.drawElementsInstanced(nt,re.count,s.UNSIGNED_INT,(re.first||0)*4,Ke):s.drawArraysInstanced(nt,re.first||0,re.count,Ke))},endFrame(){},resize(){},async capture(){const b=e.width,re=e.height,m=new Uint8Array(b*re*4),J=new Uint8ClampedArray(b*re*4);s.bindFramebuffer(s.FRAMEBUFFER,null),s.readPixels(0,0,b,re,s.RGBA,s.UNSIGNED_BYTE,m);for(let ae=0;ae<re;ae++)J.set(m.subarray((re-1-ae)*b*4,(re-ae)*b*4),ae*b*4);return{w:b,h:re,data:J}},lost:!1};return e.addEventListener("webglcontextlost",b=>{b.preventDefault(),_.lost=!0}),_}async function so(e,s={}){if(!navigator.gpu)return null;let w=null;try{w=await navigator.gpu.requestAdapter({powerPreference:"high-performance"})}catch(le){}if(!w)return null;const x=await w.requestDevice(),F=!!s.offscreen;let we=null,Y=null;const E=F?"rgba8unorm":navigator.gpu.getPreferredCanvasFormat();if(!F){if(we=e.getContext("webgpu"),!we)return null;we.configure({device:x,format:E,alphaMode:"opaque"})}const D={backend:"webgpu",hdr:!0,r32fTarget:!0,maxTex:x.limits.maxTextureDimension2D,name:"WebGPU",renderer:w.info&&(w.info.description||w.info.vendor+" "+w.info.architecture)||"webgpu"},be={rgba8:"rgba8unorm",rgba16f:"rgba16float",r32f:"r32float",rgba32f:"rgba32float",r8:"r8unorm",depth:"depth24plus",canvas:E},ht={rgba8:4,rgba16f:8,r32f:4,rgba32f:16,r8:1},qe=x.limits.minUniformBufferOffsetAlignment||256,se=1<<20,_=x.createBuffer({size:se,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),b=new Float32Array(se/4);let re=0;const m=x.createBuffer({size:Math.ceil(Ps*4/16)*16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),J=x.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]}),ae=x.createBindGroup({layout:J,entries:[{binding:0,resource:{buffer:m}}]}),X=x.createBindGroupLayout({entries:[]}),ke=x.createBindGroup({layout:X,entries:[]}),C=new Map,ne=(le,Pe,pe,c,Ie)=>{const he=le+Pe+pe+c+Ie;let H=C.get(he);if(!H){const z=I=>I==="repeat"?"repeat":I==="mirror"?"mirror-repeat":"clamp-to-edge",V={magFilter:le,minFilter:le,mipmapFilter:Ie&&le==="linear"?"linear":"nearest",addressModeU:z(Pe),addressModeV:z(pe||Pe)};c&&(V.compare="less-equal"),H=x.createSampler(V),C.set(he,H)}return H};let Be=null,Ee=null,je=null,$e=null,nt=[];const Ke=[],Fe=new Map,Ge=new Map,Je={caps:D,device:x,texture(le){const Pe={id:Us++,w:le.w,h:le.h,format:le.format,filter:le.filter||"linear",wrap:le.wrap||"clamp",wrapY:le.wrapY,mips:!!le.mips,compare:!!le.compare,levels:le.mips?Math.floor(Math.log2(Math.max(le.w,le.h)))+1:1};return Pe.gpu=x.createTexture({size:[le.w,le.h],format:be[le.format],mipLevelCount:Pe.levels,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|(le.format==="depth"?0:GPUTextureUsage.COPY_DST)}),Pe.view=Pe.gpu.createView(),Pe.sampler=ne(Pe.filter==="linear"?"linear":"nearest",Pe.wrap,Pe.wrapY||Pe.wrap,Pe.compare,Pe.mips),le.data&&Je.updateTexture(Pe,0,0,le.w,le.h,le.data),Pe},updateTexture(le,Pe,pe,c,Ie,he){x.queue.writeTexture({texture:le.gpu,origin:[Pe,pe]},he,{bytesPerRow:c*ht[le.format],rowsPerImage:Ie},[c,Ie])},genMips(le){let Pe=Ge.get(le.format);if(!Pe){const he=x.createShaderModule({code:`@group(0) @binding(0) var t: texture_2d<f32>; @group(0) @binding(1) var s: sampler;
          struct VO { @builtin(position) p: vec4f, @location(0) uv: vec2f }
          @vertex fn vs(@builtin(vertex_index) i: u32) -> VO { let uv = vec2f(f32((i << 1u) & 2u), f32(i & 2u)); var o: VO; o.p = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0); o.uv = uv; return o; }
          @fragment fn fs(v: VO) -> @location(0) vec4f { return textureSampleLevel(t, s, v.uv, 0.0); }`});Pe=x.createRenderPipeline({layout:"auto",vertex:{module:he,entryPoint:"vs"},fragment:{module:he,entryPoint:"fs",targets:[{format:be[le.format]}]}}),Ge.set(le.format,Pe)}const pe=!Be,c=Be||x.createCommandEncoder(),Ie=ne("linear","clamp","clamp",!1,!1);for(let he=1;he<le.levels;he++){const H=x.createBindGroup({layout:Pe.getBindGroupLayout(0),entries:[{binding:0,resource:le.gpu.createView({baseMipLevel:he-1,mipLevelCount:1})},{binding:1,resource:Ie}]}),z=c.beginRenderPass({colorAttachments:[{view:le.gpu.createView({baseMipLevel:he,mipLevelCount:1}),loadOp:"clear",storeOp:"store"}]});z.setPipeline(Pe),z.setBindGroup(0,H),z.draw(3),z.end()}pe&&x.queue.submit([c.finish()])},destroyTexture(le){le&&le.gpu&&(Be?Ke.push(le.gpu):le.gpu.destroy(),le.gpu=null,Fe.clear())},target(le){const Pe={id:Us++,color:le.color||null,depth:le.depth||null,w:(le.color||le.depth).w,h:(le.color||le.depth).h,level:le.level||0};return Pe.color&&(Pe.cview=Pe.level?Pe.color.gpu.createView({baseMipLevel:Pe.level,mipLevelCount:1}):Pe.color.gpu.createView({baseMipLevel:0,mipLevelCount:1})),Pe.depth&&(Pe.dview=Pe.depth.gpu.createView()),Pe.level&&(Pe.w=Math.max(1,Pe.w>>Pe.level),Pe.h=Math.max(1,Pe.h>>Pe.level)),Pe},destroyTarget(){},buffer(le,Pe,pe){const c=Math.ceil(le.byteLength/4)*4,Ie={id:Us++,kind:Pe,size:c};return Ie.gpu=x.createBuffer({size:Math.max(4,c),usage:(Pe==="index"?GPUBufferUsage.INDEX:GPUBufferUsage.VERTEX)|GPUBufferUsage.COPY_DST}),x.queue.writeBuffer(Ie.gpu,0,le.buffer,le.byteOffset,le.byteLength),Ie},updateBuffer(le,Pe,pe){x.queue.writeBuffer(le.gpu,Pe,pe.buffer,pe.byteOffset,pe.byteLength)},destroyBuffer(le){le&&le.gpu&&(le.gpu.destroy(),le.gpu=null)},pipeline(le){const Pe=Fa(le,"wgsl"),pe={id:Us++,desc:le,src:Pe,layout:Ua(le),ready:!1,name:le.name};pe.ubuf=new Float32Array(Math.max(4,pe.layout.size)),x.pushErrorScope("validation");const c=x.createShaderModule({code:Pe.code});pe.mod=c;const Ie=pe.layout.size>0;pe.uLayout=Ie?x.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!0,minBindingSize:pe.layout.size*4}}]}):X,pe.uGroup=Ie?x.createBindGroup({layout:pe.uLayout,entries:[{binding:0,resource:{buffer:_,size:pe.layout.size*4}}]}):ke;const he=[];let H=0;pe.texNames=Object.keys(le.textures||{}),pe.texKinds=Object.values(le.textures||{});const z=GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT;for(const Ce of pe.texKinds)Ce==="2d"?(he.push({binding:H++,visibility:z,texture:{sampleType:"float"}}),he.push({binding:H++,visibility:z,sampler:{type:"filtering"}})):Ce==="fetch"?he.push({binding:H++,visibility:z,texture:{sampleType:"unfilterable-float"}}):Ce==="depth"?he.push({binding:H++,visibility:z,texture:{sampleType:"depth"}}):Ce==="shadow"&&(he.push({binding:H++,visibility:z,texture:{sampleType:"depth"}}),he.push({binding:H++,visibility:z,sampler:{type:"comparison"}}));pe.tLayout=x.createBindGroupLayout({entries:he});const V=x.createPipelineLayout({bindGroupLayouts:[J,pe.uLayout,pe.tLayout]});let I=0;const Q=(le.buffers||[]).map(Ce=>{let Ye=0;const T=Ce.attrs.map(Se=>{const me=Os[Se[1]],B={shaderLocation:I++,offset:Ye,format:me===1?"float32":"float32x"+me};return Ye+=me*4,B});return{arrayStride:Ye,stepMode:Ce.instanced?"instance":"vertex",attributes:T}}),L=le.blend||"none";let ye;L==="alpha"?ye={color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha"}}:L==="premul"?ye={color:{srcFactor:"one",dstFactor:"one-minus-src-alpha"},alpha:{srcFactor:"zero",dstFactor:"one"}}:L==="add"?ye={color:{srcFactor:"one",dstFactor:"one"},alpha:{srcFactor:"zero",dstFactor:"one"}}:L==="mul"?ye={color:{srcFactor:"dst",dstFactor:"zero"},alpha:{srcFactor:"zero",dstFactor:"one"}}:L==="add4"?ye={color:{srcFactor:"one",dstFactor:"one"},alpha:{srcFactor:"one",dstFactor:"one"}}:L==="trans"&&(ye={color:{srcFactor:"one",dstFactor:"src-alpha"},alpha:{srcFactor:"zero",dstFactor:"one"}});const Ve={layout:V,vertex:{module:c,entryPoint:"vs_main",buffers:Q},primitive:{topology:le.topology==="strip"?"triangle-strip":le.topology==="lines"?"line-list":"triangle-list",cullMode:le.cull||"back",frontFace:"ccw"}},Ne=le.colorFormat===void 0?"rgba16f":le.colorFormat;if(Ne){const Ce={format:be[Ne]};ye&&(Ce.blend=ye),le.colorMask===!1&&(Ce.writeMask=0),Ve.fragment={module:c,entryPoint:"fs_main",targets:[Ce]}}else le.fs&&(Ve.fragment={module:c,entryPoint:"fs_main",targets:[]});if(le.depth!==!1&&le.depthTarget!==!1){const Ce=le.depthTest!==!1;Ve.depthStencil={format:"depth24plus",depthWriteEnabled:Ce&&le.depthWrite!==!1,depthCompare:Ce?le.depthFunc==="lequal"?"less-equal":le.depthFunc==="always"?"always":le.depthFunc==="equal"?"equal":"less":"always"},le.depthBias&&(Ve.depthStencil.depthBias=Math.round(le.depthBias),Ve.depthStencil.depthBiasSlopeScale=le.depthBiasSlope||2)}return pe.pd=Ve,pe.promise=x.createRenderPipelineAsync(Ve).then(Ce=>{pe.gpu=Ce},Ce=>{pe.err=Ce}),pe.scope=x.popErrorScope(),pe},async finishPipelineAsync(le){if(le.ready)return;const pe=(await le.mod.getCompilationInfo()).messages.filter(Ie=>Ie.type==="error");await le.promise;const c=await le.scope;if(pe.length||le.err||c){const Ie=new Error("WGSL ["+le.name+`]
`+pe.map(he=>he.lineNum+":"+he.linePos+" "+he.message).join(`
`)+(le.err?`
`+le.err.message:"")+(c?`
`+c.message:""));throw Ie.vs=pa(le.src.code),Ie}le.ready=!0},finishPipeline(le){if(!le.gpu)throw new Error("pipeline not ready: "+le.name);le.ready=!0},setGlobals(le){x.queue.writeBuffer(m,0,le.buffer,le.byteOffset,Ps*4)},beginFrame(){Be=x.createCommandEncoder(),re=0,Je.canvasView=null},beginPass(le,Pe={}){const pe={colorAttachments:[]};le?(le.color&&pe.colorAttachments.push({view:le.cview,loadOp:Pe.color?"clear":"load",storeOp:"store",clearValue:Pe.color||[0,0,0,0]}),le.depth&&(pe.depthStencilAttachment={view:le.dview,depthLoadOp:Pe.depth!=null?"clear":"load",depthStoreOp:"store",depthClearValue:Pe.depth!=null?Pe.depth:1}),Je.passW=le.w,Je.passH=le.h):(Je.canvasView||(F?((!Y||Y.width!==e.width||Y.height!==e.height)&&(Y&&Y.destroy(),Y=x.createTexture({size:[e.width,e.height],format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC})),Je.canvasView=Y.createView()):Je.canvasView=we.getCurrentTexture().createView()),pe.colorAttachments.push({view:Je.canvasView,loadOp:Pe.color?"clear":"load",storeOp:"store",clearValue:Pe.color||[0,0,0,1]}),Je.passW=e.width,Je.passH=e.height),Ee=Be.beginRenderPass(pe),je=le,$e=null,Ee.setBindGroup(0,ae)},endPass(){Ee.end(),Ee=null},draw(le,Pe){if(!le.gpu){if(le.err)throw le.err;return}const pe=Pe.instances==null?1:Pe.instances;if(pe<=0||Pe.count<=0)return;if($e!==le&&(Ee.setPipeline(le.gpu),$e=le),le.layout.size){Pe.u&&qa(le.layout,Pe.u,le.ubuf);const H=le.layout.size;if((re+H)*4>se)throw new Error("uniform arena overflow");b.set(le.ubuf.subarray(0,H),re),Ee.setBindGroup(1,le.uGroup,[re*4]),re=Math.ceil((re+H)*4/qe)*qe/4}else Ee.setBindGroup(1,ke);let c=le.id+"";for(const H of le.texNames){const z=Pe.tex&&Pe.tex[H];if(!z)throw new Error("missing texture "+H+" for "+le.name);c+=":"+z.id}let Ie=Fe.get(c);if(!Ie){const H=[];let z=0;le.texNames.forEach((V,I)=>{const Q=Pe.tex[V],L=le.texKinds[I];H.push({binding:z++,resource:Q.view}),(L==="2d"||L==="shadow")&&H.push({binding:z++,resource:Q.sampler})}),Ie=x.createBindGroup({layout:le.tLayout,entries:H}),Fe.set(c,Ie),Fe.size>4e3&&Fe.clear()}Ee.setBindGroup(2,Ie);const he=Pe.vb||[];for(let H=0;H<he.length;H++)Ee.setVertexBuffer(H,he[H].gpu);Pe.ib?(Ee.setIndexBuffer(Pe.ib.gpu,"uint32"),Ee.drawIndexed(Pe.count,pe,Pe.first||0,0,0)):Ee.draw(Pe.count,pe,Pe.first||0,0)},endFrame(){x.queue.writeBuffer(_,0,b.buffer,0,Math.min(se,Math.ceil(re*4/4)*4+256)),x.queue.submit([Be.finish()]),Be=null;for(const le of Ke)le.destroy();Ke.length=0},resize(){Fe.clear()},async capture(){if(!Y)return null;const le=Y.width,Pe=Y.height,pe=Math.ceil(le*4/256)*256,c=x.createBuffer({size:pe*Pe,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),Ie=x.createCommandEncoder();Ie.copyTextureToBuffer({texture:Y},{buffer:c,bytesPerRow:pe},[le,Pe]),x.queue.submit([Ie.finish()]),await c.mapAsync(GPUMapMode.READ);const he=new Uint8Array(c.getMappedRange()),H=new Uint8ClampedArray(le*Pe*4);for(let z=0;z<Pe;z++)H.set(he.subarray(z*pe,z*pe+le*4),z*le*4);return c.unmap(),c.destroy(),{w:le,h:Pe,data:H}},lost:!1};return x.lost.then(()=>{Je.lost=!0}),x.addEventListener&&x.addEventListener("uncapturederror",le=>{nt.length<8&&(nt.push(le.error.message),console.error("[gpu]",le.error.message)),Je.lastError=le.error.message}),Je}const as=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let uv: vec2f = vec2f(f32((a.vid << 1u) & 2u), f32(a.vid & 2u));
  v.clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0);
  v.uv = uv;
  return v;
}`;eo([["viewProj","mat4x4f"],["invViewProj","mat4x4f"],["prevViewProj","mat4x4f"],["shadowVP","mat4x4f"],["camPos","vec4f"],["camRight","vec4f"],["camUp","vec4f"],["camFwd","vec4f"],["sunDir","vec4f"],["sunCol","vec4f"],["ambSky","vec4f"],["ambGnd","vec4f"],["fogA","vec4f"],["res","vec4f"],["origin","vec4f"],["misc","vec4f"],["wind","vec4f"],["player","vec4f"],["sunScr","vec4f"],["fx","vec4f"],["skyP","vec4f"],["dof","vec4f"],["cloudP","vec4f"],["sprayT","vec4f"],["twi","vec4f"],["lamp","vec4f"],["lampDir","vec4f"]]);const St={};St.hash=`
fn pcg(v: u32) -> u32 { let x: u32 = v * 747796405u + 2891336453u; let w: u32 = ((x >> ((x >> 28u) + 4u)) ^ x) * 277803737u; return (w >> 22u) ^ w; }
fn u2f(h: u32) -> f32 { return f32(h >> 8u) * (1.0 / 16777216.0); }
fn hash11(x: f32) -> f32 { return u2f(pcg(u32(i32(floor(x))))); }
fn hash21(p: vec2f) -> f32 { let q: vec2i = vec2i(floor(p)); return u2f(pcg(u32(q.x) + pcg(u32(q.y)))); }
fn hash31(p: vec3f) -> f32 { let q: vec3i = vec3i(floor(p)); return u2f(pcg(u32(q.x) + pcg(u32(q.y) + pcg(u32(q.z))))); }
fn hash22(p: vec2f) -> vec2f { let q: vec2i = vec2i(floor(p)); let h: u32 = pcg(u32(q.x) + pcg(u32(q.y))); return vec2f(u2f(h), u2f(pcg(h))); }
fn hash33(p: vec3f) -> vec3f { let q: vec3i = vec3i(floor(p)); let h: u32 = pcg(u32(q.x) + pcg(u32(q.y) + pcg(u32(q.z)))); let h2: u32 = pcg(h); return vec3f(u2f(h), u2f(h2), u2f(pcg(h2))); }
fn hashu(n: u32) -> f32 { return u2f(pcg(n)); }
fn hashu3(n: u32) -> vec3f { let a: u32 = pcg(n); let b: u32 = pcg(a); return vec3f(u2f(a), u2f(b), u2f(pcg(b))); }
`,St.noise=`
fn vnoise2(p: vec2f) -> f32 {
  let i: vec2f = floor(p); let f: vec2f = p - i; let u: vec2f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), u.x), mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), u.x), u.y);
}
fn vnoise3(p: vec3f) -> f32 {
  let i: vec3f = floor(p); let f: vec3f = p - i; let u: vec3f = f * f * (3.0 - 2.0 * f);
  let a: f32 = mix(mix(hash31(i), hash31(i + vec3f(1.0, 0.0, 0.0)), u.x), mix(hash31(i + vec3f(0.0, 1.0, 0.0)), hash31(i + vec3f(1.0, 1.0, 0.0)), u.x), u.y);
  let b: f32 = mix(mix(hash31(i + vec3f(0.0, 0.0, 1.0)), hash31(i + vec3f(1.0, 0.0, 1.0)), u.x), mix(hash31(i + vec3f(0.0, 1.0, 1.0)), hash31(i + vec3f(1.0, 1.0, 1.0)), u.x), u.y);
  return mix(a, b, u.z);
}
fn fbm2(p: vec2f) -> f32 { var q: vec2f = p; var a: f32 = 0.5; var s: f32 = 0.0; for (var i: i32 = 0; i < 5; i++) { s += a * vnoise2(q); q = q * 2.03 + vec2f(17.1, 9.2); a *= 0.5; } return s / 0.96875; }
fn fbm3(p: vec3f) -> f32 { var q: vec3f = p; var a: f32 = 0.5; var s: f32 = 0.0; for (var i: i32 = 0; i < 5; i++) { s += a * vnoise3(q); q = q * 2.03 + vec3f(17.1, 9.2, 5.4); a *= 0.5; } return s / 0.96875; }
fn fbm3n(p: vec3f, n: i32) -> f32 { var q: vec3f = p; var a: f32 = 0.5; var s: f32 = 0.0; var w: f32 = 0.0; for (var i: i32 = 0; i < n; i++) { s += a * vnoise3(q); w += a; q = q * 2.03 + vec3f(17.1, 9.2, 5.4); a *= 0.5; } return s / w; }
`,St.tnoise=`
fn tnoise3(p: vec3f) -> f32 {
  let i: vec3f = floor(p); var f: vec3f = p - i; f = f * f * (3.0 - 2.0 * f);
  let uv: vec2f = (i.xy + vec2f(37.0, 17.0) * i.z) + f.xy;
  let rg: vec2f = texLod(tNoise, (uv + 0.5) / 256.0, 0.0).rg;
  return mix(rg.x, rg.y, f.z);
}
fn tfbm3(p: vec3f) -> f32 { return 0.5333 * tnoise3(p) + 0.2667 * tnoise3(p * 2.02 + vec3f(5.1, 1.7, 9.3)) + 0.1333 * tnoise3(p * 4.03 + vec3f(2.3, 7.7, 4.1)) + 0.0667 * tnoise3(p * 8.01); }
`,St.common=`
const PI: f32 = 3.14159265;
fn sq(x: f32) -> f32 { return x * x; }
fn luma(c: vec3f) -> f32 { return dot(c, vec3f(0.2126, 0.7152, 0.0722)); }
fn remap(x: f32, a: f32, b: f32) -> f32 { return saturate((x - a) / (b - a)); }
// the sky is not evenly bright: low on the sun's bearing lies a band many times brighter than the rest, and at dusk it is the main light.
// Whatever faces that way takes its colour.
fn twiLight(N: vec3f) -> vec3f { let h: vec2f = normalize(U.sunDir.xz + vec2f(1e-5, 0.0)); let g: f32 = saturate(dot(N, vec3f(h.x * 0.97, 0.24, h.y * 0.97)) * 0.5 + 0.5); return U.twi.rgb * (g * g * g); }
// the skier's headlamp: a warm spot inside a wide faint flood. What arrives at a point (to be multiplied by how the surface there answers it).
// The fall-off is that of a broad reflector, not a bare point: the snow at the ski tips is not burnt out, and the pool lies a few lengths
// ahead, where the skier is looking. It throws no shadows of its own: nothing stands between it and what it looks at.
// (the spot has no rim: it thins away over a wide angle, so that on a bank close ahead it is a glow and not a disc with an edge)
fn lampCone(c: f32) -> f32 { let s: f32 = smoothstep(0.80, 0.998, c); return 0.06 * smoothstep(0.30, 0.85, c) + s * s + 0.9 * pow(smoothstep(0.955, 0.999, c), 3.0); }   // (an LED's hot centre over its flood)
fn lampLight(wp: vec3f) -> vec3f {
  if (U.lamp.w <= 0.0) { return vec3f(0.0); }
  let d: vec3f = wp - U.lamp.xyz; let r2: f32 = dot(d, d);
  let c: f32 = dot(d, U.lampDir.xyz) / sqrt(max(r2, 1e-4));
  return vec3f(1.0, 0.85, 0.64) * (U.lamp.w * lampCone(c) / (r2 + 30.0));
}
fn hg(c: f32, g: f32) -> f32 { let g2: f32 = g * g; return (1.0 - g2) / (12.566 * pow(max(1.0 + g2 - 2.0 * g * c, 1e-4), 1.5)); }
// sky-view LUT: u = azimuth from the sun (0..PI mirrored), v = elevation with extra resolution at the horizon
fn skyUV(d: vec3f, sun: vec3f) -> vec2f {
  let el: f32 = asin(clamp(d.y, -1.0, 1.0));
  let sh: vec2f = normalize(sun.xz + vec2f(1e-5, 0.0)); let dh: vec2f = normalize(d.xz + vec2f(1e-5, 0.0));
  let az: f32 = acos(clamp(dot(sh, dh), -1.0, 1.0));
  let vv: f32 = 0.5 + 0.5 * sign(el) * sqrt(abs(el) / (PI * 0.5));
  return vec2f(az / PI * (127.0 / 128.0) + 0.5 / 128.0, 1.0 - (vv * (63.0 / 64.0) + 0.5 / 64.0));
}
`,St.fog=`
fn skyLut0(d: vec3f) -> vec3f { return texLod(tSky, skyUV(d, U.sunDir.xyz), 0.0).rgb * U.skyP.x; }
// (under heavy snow's overcast, U.twi.w, the air and what is mirrored take the overcast's grey, not the clear sky's blue: 05b_weather.js)
fn skyLut(d: vec3f) -> vec3f { return mix(skyLut0(d), U.ambSky.rgb * 2.4, U.twi.w * 0.85); }
fn fogAmount(wp: vec3f) -> f32 {
  let v: vec3f = wp - U.camPos.xyz; let dist: f32 = length(v);
  // exponential height fog, analytic integral along the ray
  let k: f32 = U.fogA.y; let h0: f32 = U.camPos.y - U.fogA.z; let dy: f32 = v.y;
  var t: f32 = k * dy; if (abs(t) < 1e-3) { t = 1e-3; }
  let od: f32 = U.fogA.x * dist * exp(-k * h0) * (1.0 - exp(-t)) / t;
  return 1.0 - exp(-od);
}
fn applyFog(col: vec3f, wp: vec3f) -> vec3f {
  let v: vec3f = wp - U.camPos.xyz; let dist: f32 = length(v); let d: vec3f = v / max(dist, 1e-3);
  let f: f32 = fogAmount(wp);
  // haze takes the colour of the sky behind it, flattened toward the horizon band so far terrain melts into the cloud sea
  let hd: vec3f = normalize(vec3f(d.x, max(d.y, -0.02) * 0.4 + 0.03, d.z));
  var fc: vec3f = skyLut(hd);
  let mu: f32 = dot(d, U.sunDir.xyz);
  fc += U.sunCol.rgb * (hg(mu, 0.72) * 0.55 + hg(mu, 0.2) * 0.15) * 0.25;
  return mix(col, fc, f);
}
`;const ua=.25,Ns=14e3;St.depth=`
fn linDepth(d: f32) -> f32 { return ${(ua*Ns).toFixed(1)} / (${Ns.toFixed(1)} - d * ${(Ns-ua).toFixed(2)}); }
`,St.depth=`
fn linDepth(d: f32) -> f32 { let n: f32 = U.camFwd.w; return n * ${Ns.toFixed(1)} / (${Ns.toFixed(1)} - d * (${Ns.toFixed(1)} - n)); }
`,St.shadow=`
// shadows of the clouds overhead, drifting with the wind: two octaves of lattice noise that repeat every 1024 m, so the pattern
// survives the floating origin. The clouds part round the skier (a sunlit clearing travels with them): the light show stays on.
fn cloudLat(i: vec2f, per: f32) -> f32 { let w: vec2f = i - per * floor(i / per); return fract(sin(dot(w, vec2f(127.1, 311.7)) + 1.3) * 43758.5453); }
fn cloudVN(p: vec2f, per: f32) -> f32 {
  let i: vec2f = floor(p); let f: vec2f = p - i; let u: vec2f = f * f * (3.0 - 2.0 * f);
  return mix(mix(cloudLat(i, per), cloudLat(i + vec2f(1.0, 0.0), per), u.x), mix(cloudLat(i + vec2f(0.0, 1.0), per), cloudLat(i + vec2f(1.0, 1.0), per), u.x), u.y);
}
fn cloudShade(wp: vec3f) -> f32 {
  let q: vec2f = wp.xz + U.origin.xz + U.cloudP.xy;
  let n: f32 = cloudVN(q / 256.0, 4.0) * 0.62 + cloudVN(q / 128.0 + vec2f(3.7, 1.9), 8.0) * 0.38;
  let open: f32 = smoothstep(110.0, 300.0, length(wp.xz - U.player.xz));
  return 1.0 - U.cloudP.z * open * smoothstep(U.cloudP.w, U.cloudP.w + 0.09, n);
}
fn shadowAt(wp: vec3f, bias: f32) -> f32 {
  let sp: vec4f = U.shadowVP * vec4f(wp, 1.0);
  let uv: vec2f = vec2f(sp.x * 0.5 + 0.5, 0.5 - sp.y * 0.5);
  let e: vec2f = abs(sp.xy);
  let fade: f32 = smoothstep(0.86, 0.98, max(e.x, e.y));
  if (fade >= 1.0 || sp.z > 1.0 || sp.z < 0.0) { return cloudShade(wp); }
  let ts: f32 = 1.0 / texSize(tShadow).x; let z: f32 = sp.z - bias;
  var s: f32 = texShadow(tShadow, uv + vec2f(-0.75, -0.25) * ts, z) + texShadow(tShadow, uv + vec2f(0.25, -0.75) * ts, z)
             + texShadow(tShadow, uv + vec2f(0.75, 0.25) * ts, z) + texShadow(tShadow, uv + vec2f(-0.25, 0.75) * ts, z);
  return mix(s * 0.25, 1.0, fade) * cloudShade(wp);
}
// 1 where the shadow map can answer for this point, 0 beyond its edges
fn shadowCover(wp: vec3f) -> f32 {
  let sp: vec4f = U.shadowVP * vec4f(wp, 1.0);
  if (sp.z > 1.0 || sp.z < 0.0) { return 0.0; }
  let e: vec2f = abs(sp.xy);
  return 1.0 - smoothstep(0.86, 0.98, max(e.x, e.y));
}
fn shadowFast(wp: vec3f, bias: f32) -> f32 {
  let sp: vec4f = U.shadowVP * vec4f(wp, 1.0);
  let uv: vec2f = vec2f(sp.x * 0.5 + 0.5, 0.5 - sp.y * 0.5);
  let e: vec2f = abs(sp.xy);
  if (max(e.x, e.y) > 0.97 || sp.z > 1.0 || sp.z < 0.0) { return 1.0; }
  return texShadow(tShadow, uv, sp.z - bias);
}
// the snow's own lookup. The sun is half a degree wide, so an edge blurs with the distance to what casts it: a boot's is sharp, a spruce
// tip's twenty metres off is soft. And a low sun stretches each 6 cm texel along its light into metre-long steps that only a wider
// kernel hides. So: four taps ask whether the caster stands more than 3 m up the ray; where it does, eight taps on a disc turned
// per point (5 texels across at sunset, 1 at noon) soften the edge; where it does not, the old tight kernel keeps the foot sharp
fn shadowSoft(wp: vec3f, bias: f32) -> f32 {
  let sp: vec4f = U.shadowVP * vec4f(wp, 1.0);
  let uv: vec2f = vec2f(sp.x * 0.5 + 0.5, 0.5 - sp.y * 0.5);
  let e: vec2f = abs(sp.xy);
  let fade: f32 = smoothstep(0.86, 0.98, max(e.x, e.y));
  if (fade >= 1.0 || sp.z > 1.0 || sp.z < 0.0) { return cloudShade(wp); }
  let ts: f32 = 1.0 / texSize(tShadow).x; let z: f32 = sp.z - bias;
  let rm: f32 = clamp(0.25 / max(U.sunDir.y, 0.04), 1.0, 5.0) * ts; let zf: f32 = z - 0.0025;
  let far: f32 = 1.0 - 0.25 * (texShadow(tShadow, uv + vec2f(-0.7, -0.7) * rm, zf) + texShadow(tShadow, uv + vec2f(0.7, -0.7) * rm, zf)
             + texShadow(tShadow, uv + vec2f(0.7, 0.7) * rm, zf) + texShadow(tShadow, uv + vec2f(-0.7, 0.7) * rm, zf));
  var s: f32 = 0.0;
  if (far <= 0.0) {
    s = 0.25 * (texShadow(tShadow, uv + vec2f(-0.75, -0.25) * ts, z) + texShadow(tShadow, uv + vec2f(0.25, -0.75) * ts, z)
             + texShadow(tShadow, uv + vec2f(0.75, 0.25) * ts, z) + texShadow(tShadow, uv + vec2f(-0.25, 0.75) * ts, z));
  } else {
    let r: f32 = mix(0.75 * ts, rm, far);
    let a: f32 = 6.2832 * fract(52.9829 * fract(dot(wp.xz * 97.0, vec2f(0.06711056, 0.00583715))));
    let c: f32 = cos(a) * r; let sn: f32 = sin(a) * r;
    let m: mat2x2f = mat2x2f(vec2f(c, sn), vec2f(-sn, c));
    s = 0.125 * (texShadow(tShadow, uv + m * vec2f(-0.326, -0.406), z) + texShadow(tShadow, uv + m * vec2f(-0.840, -0.074), z)
             + texShadow(tShadow, uv + m * vec2f(-0.696, 0.457), z) + texShadow(tShadow, uv + m * vec2f(-0.203, 0.621), z)
             + texShadow(tShadow, uv + m * vec2f(0.962, -0.195), z) + texShadow(tShadow, uv + m * vec2f(0.473, -0.480), z)
             + texShadow(tShadow, uv + m * vec2f(0.519, 0.767), z) + texShadow(tShadow, uv + m * vec2f(0.185, -0.893), z));
  }
  return mix(s, 1.0, fade) * cloudShade(wp);
}
`,St.sprayTau=`
fn sprayTau(wp: vec3f, lift: f32) -> f32 {
  let sp: vec4f = U.shadowVP * vec4f(wp, 1.0);
  let q: vec2f = sp.xy * U.sprayT.x - U.sprayT.yz;
  if (max(abs(q.x), abs(q.y)) >= 0.97) { return 0.0; }
  let m: vec4f = texLod(tSunTau, vec2f(q.x * 0.5 + 0.5, 0.5 - q.y * 0.5), 0.0);
  if (m.x < 0.002) { return 0.0; }
  let zr: f32 = (sp.z - U.sprayT.w) * 1199.0 - lift;
  let mu: f32 = m.y / m.x; let sg: f32 = sqrt(max(m.z / m.x - mu * mu, 0.0)) + 0.07;
  return m.x * smoothstep(-1.7, 1.7, (zr - mu) / sg);
}
`,St.atmo=`
const ATM_RE: f32 = 6360e3; const ATM_RA: f32 = 6460e3;
fn raySphere(o: vec3f, d: vec3f, r: f32) -> vec2f { let b: f32 = dot(o, d); let c: f32 = dot(o, o) - r * r; let h: f32 = b * b - c; if (h < 0.0) { return vec2f(-1.0, -1.0); } let s: f32 = sqrt(h); return vec2f(-b - s, -b + s); }
fn atmoDensity(h: f32) -> vec3f { return vec3f(exp(-h / 8000.0), exp(-h / 1200.0), max(0.0, 1.0 - abs(h - 25000.0) / 15000.0)); }
fn atmoScatter(o: vec3f, d: vec3f, sun: vec3f, alt: f32) -> vec3f {
  let bR: vec3f = vec3f(5.802e-6, 13.558e-6, 33.1e-6); let bM: f32 = 3.996e-6 * 1.6; let bMe: f32 = 4.44e-6 * 1.6; let bO: vec3f = vec3f(0.650e-6, 1.881e-6, 0.085e-6);
  let ro: vec3f = vec3f(0.0, ATM_RE + alt, 0.0);
  let ta: vec2f = raySphere(ro, d, ATM_RA); let tg: vec2f = raySphere(ro, d, ATM_RE - 2500.0);
  var tmax: f32 = ta.y; if (tg.x > 0.0) { tmax = min(tmax, tg.x); }
  if (tmax <= 0.0) { return vec3f(0.0); }
  let mu: f32 = dot(d, sun); let pR: f32 = 3.0 / (16.0 * PI) * (1.0 + mu * mu); let pM: f32 = hg(mu, 0.78) * 0.85 + hg(mu, 0.35) * 0.15;
  var od: vec3f = vec3f(0.0); var sumR: vec3f = vec3f(0.0); var sumM: vec3f = vec3f(0.0); var sumMS: vec3f = vec3f(0.0);
  let N: i32 = 24; var tPrev: f32 = 0.0;
  for (var i: i32 = 0; i < N; i++) {
    let fr: f32 = (f32(i) + 0.5) / f32(N); let t: f32 = tmax * fr * fr; let tn: f32 = tmax * sq((f32(i) + 1.0) / f32(N)); let dt: f32 = tn - tPrev; tPrev = tn;
    let p: vec3f = ro + d * t; let h: f32 = length(p) - ATM_RE; let dn: vec3f = atmoDensity(h) * dt; od += dn;
    let tl: vec2f = raySphere(p, sun, ATM_RA); let tgl: vec2f = raySphere(p, sun, ATM_RE - 2500.0);
    var odl: vec3f = vec3f(0.0); let M: i32 = 6; let dl: f32 = tl.y / f32(M);
    for (var j: i32 = 0; j < M; j++) { let pl: vec3f = p + sun * (f32(j) + 0.5) * dl; odl += atmoDensity(length(pl) - ATM_RE) * dl; }
    let tau: vec3f = bR * (od.x + odl.x) + vec3f(bMe) * (od.y + odl.y) + bO * (od.z + odl.z);
    var att: vec3f = exp(-tau);
    if (tgl.x > 0.0) { att *= smoothstep(-0.02, 0.0, -tgl.x / ATM_RE - 0.01); }   // planet shadow
    sumR += att * dn.x; sumM += att * dn.y;
    // cheap multiple scattering: isotropic second bounce lit by an already-attenuated sun
    let tau2: vec3f = bR * (od.x + odl.x * 0.35) + vec3f(bMe) * (od.y + odl.y * 0.35) + bO * (od.z + odl.z);
    sumMS += exp(-tau2) * (dn.x * bR + dn.y * vec3f(bM)) ;
  }
  let sunUp: f32 = smoothstep(-0.12, 0.05, sun.y);
  return sumR * bR * pR + sumM * bM * pM + sumMS * 0.045 * (0.5 + 0.5 * sunUp);
}
fn atmoTransmit(alt: f32, d: vec3f) -> vec3f {
  let bR: vec3f = vec3f(5.802e-6, 13.558e-6, 33.1e-6); let bMe: f32 = 4.44e-6 * 1.6; let bO: vec3f = vec3f(0.650e-6, 1.881e-6, 0.085e-6);
  let ro: vec3f = vec3f(0.0, ATM_RE + alt, 0.0); let ta: vec2f = raySphere(ro, d, ATM_RA);
  var od: vec3f = vec3f(0.0); let M: i32 = 16; let dl: f32 = ta.y / f32(M);
  for (var j: i32 = 0; j < M; j++) { let pl: vec3f = ro + d * (f32(j) + 0.5) * dl; od += atmoDensity(length(pl) - ATM_RE) * dl; }
  return exp(-(bR * od.x + vec3f(bMe) * od.y + bO * od.z));
}
`;const ks=(()=>{const w=[5802e-9,13558e-9,331e-7],x=3996e-9*1.6,F=444e-8*1.6,we=[65e-8,1881e-9,85e-9],Y=(se,_,b)=>{const re=f.dot(se,_),m=f.dot(se,se)-b*b,J=re*re-m;if(J<0)return[-1,-1];const ae=Math.sqrt(J);return[-re-ae,-re+ae]},E=se=>[Math.exp(-se/8e3),Math.exp(-se/1200),Math.max(0,1-Math.abs(se-25e3)/15e3)],D=(se,_)=>(1-_*_)/(12.566*Math.pow(Math.max(1+_*_-2*_*se,1e-4),1.5));function be(se,_){const b=[0,636e4+se,0],re=Y(b,_,646e4);if(Y(b,_,6357500)[0]>0)return[0,0,0];const J=24,ae=re[1]/J;let X=[0,0,0];for(let ke=0;ke<J;ke++){const C=f.mad(b,_,(ke+.5)*ae),ne=E(f.len(C)-636e4);X[0]+=ne[0]*ae,X[1]+=ne[1]*ae,X[2]+=ne[2]*ae}return[0,1,2].map(ke=>Math.exp(-(w[ke]*X[0]+F*X[1]+we[ke]*X[2])))}function ht(se,_,b){const re=[0,636e4+b,0],m=Y(re,se,646e4),J=Y(re,se,6357500);let ae=m[1];if(J[0]>0&&(ae=Math.min(ae,J[0])),ae<=0)return[0,0,0];const X=f.dot(se,_),ke=3/(16*h0)*(1+X*X),C=D(X,.78)*.85+D(X,.35)*.15,ne=[0,0,0],Be=[0,0,0],Ee=[0,0,0],je=[0,0,0],$e=16;let nt=0;for(let Fe=0;Fe<$e;Fe++){const Ge=(Fe+.5)/$e,Je=ae*Ge*Ge,le=ae*((Fe+1)/$e)**2,Pe=le-nt;nt=le;const pe=f.mad(re,se,Je),c=E(f.len(pe)-636e4);ne[0]+=c[0]*Pe,ne[1]+=c[1]*Pe,ne[2]+=c[2]*Pe;const Ie=Y(pe,_,646e4),he=Y(pe,_,6357500),H=5,z=Ie[1]/H,V=[0,0,0];for(let Q=0;Q<H;Q++){const L=f.mad(pe,_,(Q+.5)*z),ye=E(f.len(L)-636e4);V[0]+=ye[0]*z,V[1]+=ye[1]*z,V[2]+=ye[2]*z}const I=he[0]>0?0:1;for(let Q=0;Q<3;Q++){const L=Math.exp(-(w[Q]*(ne[0]+V[0])+F*(ne[1]+V[1])+we[Q]*(ne[2]+V[2])))*I;Be[Q]+=L*c[0]*Pe,Ee[Q]+=L*c[1]*Pe,je[Q]+=Math.exp(-(w[Q]*(ne[0]+V[0]*.35)+F*(ne[1]+V[1]*.35)+we[Q]*(ne[2]+V[2])))*(c[0]*Pe*w[Q]+c[1]*Pe*x)}}const Ke=ge(-.12,.05,_[1]);return[0,1,2].map(Fe=>Be[Fe]*w[Fe]*ke+Ee[Fe]*x*C+je[Fe]*.045*(.5+.5*Ke))}function qe(se,_){const b=[0,0,0];let re=0;const m=24;for(let J=0;J<m;J++){const ae=(J+.5)/m,X=J*2.399963,ke=Math.sqrt(1-ae),C=Math.sqrt(ae),ne=[C*Math.cos(X),ke,C*Math.sin(X)],Be=ht(ne,se,_);b[0]+=Be[0],b[1]+=Be[1],b[2]+=Be[2],re++}return b.map(J=>J/re*h0)}return{transmit:be,scatter:ht,irradiance:qe}})();St.tonemap=`
fn agxContrast(x: vec3f) -> vec3f { let x2: vec3f = x * x; let x4: vec3f = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
fn agx(c: vec3f) -> vec3f {
  let inM: mat3x3f = mat3x3f(vec3f(0.842479062253094, 0.0423282422610123, 0.0423756549057051), vec3f(0.0784335999999992, 0.878468636469772, 0.0784336), vec3f(0.0792237451477643, 0.0791661274605434, 0.879142973793104));
  let outM: mat3x3f = mat3x3f(vec3f(1.19687900512017, -0.0528968517574562, -0.0529716355144438), vec3f(-0.0980208811401368, 1.15190312990417, -0.0980434501171241), vec3f(-0.0990297440797205, -0.0989611768448433, 1.15107367264116));
  var v: vec3f = inM * c;
  v = clamp((log2(max(v, vec3f(1e-10))) + 12.47393) / 16.5, vec3f(0.0), vec3f(1.0));
  v = agxContrast(v);
  v = outM * v;
  return pow(max(v, vec3f(0.0)), vec3f(2.2));
}
// photographic curve (after H. Uchimura): a toe, a long straight section so lit snow keeps its form, and a short shoulder
fn filmCurve1(x: f32) -> f32 {
  let P: f32 = 1.0; let a: f32 = 1.0; let m: f32 = 0.22; let l: f32 = 0.42; let c: f32 = 1.38;
  let l0: f32 = (P - m) * l / a; let S0: f32 = m + l0; let S1: f32 = m + a * l0; let C2: f32 = a * P / (P - S1);
  let t: f32 = saturate(x / m); let w0: f32 = 1.0 - t * t * (3.0 - 2.0 * t); let w2: f32 = step(S0, x); let w1: f32 = 1.0 - w0 - w2;
  return m * pow(max(x, 0.0) / m, c) * w0 + (m + a * (x - m)) * w1 + (P - (P - S1) * exp(-C2 / P * (x - S0))) * w2;
}
fn filmCurve(c: vec3f) -> vec3f { return vec3f(filmCurve1(c.x), filmCurve1(c.y), filmCurve1(c.z)); }
fn acesFit(x: vec3f) -> vec3f { let a: vec3f = x * (x * 2.51 + 0.03); let b: vec3f = x * (x * 2.43 + 0.59) + 0.14; return saturate(a / b); }
fn toSRGB(c: vec3f) -> vec3f { let lo: vec3f = c * 12.92; let hi: vec3f = 1.055 * pow(max(c, vec3f(0.0)), vec3f(1.0 / 2.4)) - 0.055; return vec3f(select(hi.x, lo.x, c.x < 0.0031308), select(hi.y, lo.y, c.y < 0.0031308), select(hi.z, lo.z, c.z < 0.0031308)); }
fn ign(p: vec2f) -> f32 { return fract(52.9829189 * fract(dot(p, vec2f(0.06711056, 0.00583715)))); }
// the same pattern, moved every frame: at 60 fps a dither that changes each frame reads as a true blend
fn ignT(p: vec2f) -> f32 { return ign(p + 5.588238 * (U.origin.w - 64.0 * floor(U.origin.w / 64.0))); }
`;const js={bowl:{slope:.36,hw:30,dish:1.6,shoulder:.34,gul:0,gw:14,gAmp:0,rollA:0,rollL:40,mog:0,forest:.85,glade:0,powder:.25,ridge:0,mean:1,kick:0},steeps:{slope:.6,hw:17,dish:2.6,shoulder:.55,gul:0,gw:14,gAmp:0,rollA:0,rollL:40,mog:0,forest:.8,glade:0,powder:.15,ridge:0,mean:.55,kick:0},glade:{slope:.33,hw:44,dish:.8,shoulder:.26,gul:0,gw:14,gAmp:0,rollA:.25,rollL:34,mog:0,forest:1,glade:1,powder:.6,ridge:0,mean:.8,kick:0},rollers:{slope:.31,hw:26,dish:1.2,shoulder:.32,gul:0,gw:14,gAmp:0,rollA:1.5,rollL:30,mog:0,forest:.7,glade:0,powder:.2,ridge:0,mean:.7,kick:0},gully:{slope:.36,hw:24,dish:.6,shoulder:.42,gul:5.5,gw:9.5,gAmp:13,rollA:0,rollL:40,mog:0,forest:.8,glade:0,powder:.3,ridge:0,mean:.5,kick:0},kickers:{slope:.35,hw:28,dish:1,shoulder:.34,gul:0,gw:14,gAmp:0,rollA:0,rollL:40,mog:0,forest:.75,glade:0,powder:.3,ridge:0,mean:.5,kick:1},powder:{slope:.42,hw:46,dish:2.2,shoulder:.3,gul:0,gw:14,gAmp:0,rollA:.5,rollL:60,mog:0,forest:.45,glade:.12,powder:1,ridge:0,mean:.9,kick:0},ridge:{slope:.3,hw:14,dish:-.8,shoulder:.3,gul:0,gw:14,gAmp:0,rollA:.5,rollL:46,mog:0,forest:.15,glade:0,powder:.2,ridge:1,mean:.45,kick:0},moguls:{slope:.4,hw:22,dish:1.4,shoulder:.38,gul:0,gw:14,gAmp:0,rollA:0,rollL:40,mog:1,forest:.8,glade:0,powder:.1,ridge:0,mean:.6,kick:0}},va=["slope","hw","dish","shoulder","gul","gw","gAmp","rollA","rollL","mog","forest","glade","powder","ridge","mean","kick"],_s={bowl:"开阔大坡",steeps:"陡坡",glade:"树林",rollers:"起伏",gully:"雪槽",kickers:"跳台",powder:"深粉雪",ridge:"山脊",moguls:"蘑菇"},ao={bowl:19.6,steeps:29.3,glade:13.2,rollers:14.3,gully:15.4,kickers:17.8,powder:14.5,ridge:21.7,moguls:16},bs=.36,Es=4.5,vt=((e,s,w)=>{const x={seed:261111,segs:[],feats:new Map,mogK:1},F=2048,we=16,Y={baseY:0,cx:1,hw:2,dish:3,shoulder:4,gul:5,gw:6,goff:7,roll:8,mog:9,forest:10,glade:11,powder:12,ridge:13,wall:14,rtail:15},E=new Map;let D=D0(x.seed),be=0,ht=[],qe=[],se=[];const _=new Map,b=261111,re=20261111;let m=0,J=0;const ae=(B,U)=>e(B,(U<x.seed?U:U-x.seed+re)^m),X=(B,U,A)=>s(B,U,A^m),ke=(B,U)=>w(B+m,U+J);x.setSeed=function(B){return B=Math.floor(+B),B>=1&&(x.seed=(B-1)%999999+1),m=ps(x.seed)^ps(b),J=Math.imul(m,2654435761),x.segs=[],x.feats.clear(),E.clear(),_.clear(),D=D0(re^m),be=0,ht=[],qe=[],se=[],je=[],$e=[],nt=D0(m+Ee),Fe(4e3),x.seed},x.reset=x.setSeed;const C="steeps,glade,kickers,moguls,gully,rollers,steeps,bowl,powder,kickers,ridge".split(","),ne={glade:1,moguls:1,rollers:1,powder:1},Be={steeps:1,kickers:1},Ee=57;let je=[],$e=[],nt=D;function Ke(){if(!$e.length)je=["bowl"];else if(!je.length){const U=$e.length===1,A=U?4:5,a=$e.slice(-12).join(">"),oe=U&&nt()<.5?0:1;for(let fe=0;;fe++){const O=C.filter(He=>He!=="bowl"||!U),ie=$e.slice(-5);if(je=[],fe>600){je=O;break}for(let He=O.length-1;He>0;He--){const We=Math.floor(nt()*(He+1)),Qe=O[He];O[He]=O[We],O[We]=Qe}const ce=He=>{const We=je.length,Qe=ie[ie.length-1];return!(ne[He]&&ne[Qe])&&!ie.slice(Be[He]?-3:-5).includes(He)&&!(Be[He]&&We<A===je.includes(He))&&!(U&&We<2&&We===oe!=(He==="steeps"))&&!(fe<60&&a.includes(Qe+">"+He))};for(let He;(He=O.findIndex(ce))>=0;){const We=O.splice(He,1)[0];je.push(We),ie.push(We)}if(!O.length)break}}const B=je.shift();return $e.push(B),B}function Fe(B){for(;be<B;){let U;if(x.segs.length===0)U="bowl";else{if(!qe.length){qe=Object.keys(js);for(let He=qe.length-1;He>0;He--){const We=Math.floor(D()*(He+1)),Qe=qe[He];qe[He]=qe[We],qe[We]=Qe}x.segs.length===1&&qe.splice(qe.indexOf("bowl"),1)}const ie=ht[ht.length-1];let ce=-1;for(let He=qe.length-1;He>=0;He--)if(!ht.includes(qe[He])&&(ce<0&&(ce=He),!se.includes(ie+">"+qe[He]))){ce=He;break}ce<0&&(ce=qe.length-1),U=qe.splice(ce,1)[0],se.push(ie+">"+U),se.length>18&&se.shift()}x.classic||(U=Ke()),x.forceType&&(U=x.forceType),ht.push(U),ht.length>5&&ht.shift();const A=js[U],a={},oe=()=>.85+D()*.3;for(const ie of va)a[ie]=A[ie];a.slope*=.93+D()*.14,a.hw*=oe(),a.rollL*=oe(),a.rollA*=oe(),a.gAmp*=oe(),a.gul*=oe(),a.mean*=oe();const fe=x.segs.length===0?590:ao[U]*(27+D()*6),O={type:U,s0:be,len:fe,p:a,idx:x.segs.length,seed:D()*1e9|0};if(x.segs.push(O),a.kick>0){const ie=Math.floor((fe-160)/105);for(let ce=0;ce<ie;ce++)Ge({s:O.s0+90+ce*105+D()*20,u:(D()-.5)*14,len:17+D()*4,wid:11.5+D()*3,h:2+D()*.7,kind:"kicker",mark:!0})}if(U==="rollers"||U==="powder"||U==="bowl"&&x.segs.length>1){const ie=1+Math.floor(D()*2);for(let ce=0;ce<ie;ce++)Ge({s:O.s0+120+D()*(fe-240),u:(D()-.5)*30,len:12,wid:10,h:1.1+D()*.6,kind:"kicker"})}be+=fe}}function Ge(B){const U=Math.floor((B.s-4)/32),A=Math.floor((B.s+B.len+30)/32);for(let a=U;a<=A;a++){let oe=x.feats.get(a);oe||x.feats.set(a,oe=[]),oe.push(B)}}function Je(B){if(B<0)return x.segs[0];B>=be&&Fe(B+3e3);let U=0,A=x.segs.length-1;for(;U<A;){const a=U+A+1>>1;x.segs[a].s0<=B?U=a:A=a-1}return x.segs[U]}x.segAt=Je;const le=90,Pe={};function pe(B,U){const A=Je(B),a=A.p;let oe=null,fe=0;const O=B-A.s0,ie=A.s0+A.len-B;if(O<le/2&&A.idx>0?(oe=x.segs[A.idx-1].p,fe=.5-.5*fs(0,le/2,O)):ie<le/2&&(A.idx+1>=x.segs.length&&Fe(B+3e3),oe=x.segs[A.idx+1].p,fe=.5-.5*fs(0,le/2,ie)),oe)for(const ce of va)U[ce]=a[ce]+(oe[ce]-a[ce])*fe;else for(const ce of va)U[ce]=a[ce];return U}x.paramsAt=pe;function c(B){let U=0,A=0;for(let a=-4;a<=4;a++){const oe=5-Math.abs(a);U+=oe*pe(B+a*112.5,Ie).ridge,A+=oe}return 1-.72*U/A}const Ie={};function he(B){let U=0;for(let A=0;A<=36;A++)U=Math.max(U,pe(B-A*25,Ie).ridge*(1-ge(0,900,A*25)));return U}function H(B){let U=E.get(B);if(U)return U;let A;B===0?A={baseY:0,rollPh:0,gPh:0}:B<0?A=null:(_.has(B)||H(B-1),A=_.get(B)),U=new Float32Array((F+1)*we);const a=new Float64Array(F+1);if(B<0){const oe=pe(0,Pe);for(let fe=0;fe<=F;fe++){const O=B*F+fe,ie=fe*we;a[fe]=-oe.slope*O,U[ie+Y.cx]=I(0,oe.mean),U[ie+Y.hw]=oe.hw,U[ie+Y.dish]=oe.dish,U[ie+Y.shoulder]=oe.shoulder,U[ie+Y.gw]=oe.gw,U[ie+Y.forest]=oe.forest,U[ie+Y.powder]=oe.powder,U[ie+Y.wall]=c(Math.max(0,O)),U[ie+Y.rtail]=0}}else{let oe=A.baseY,fe=A.rollPh,O=A.gPh;const ie=new Float32Array(F/32+1);for(let He=0;He<=F/32;He++)ie[He]=c(B*F+He*32);for(let He=0;He<=F;He++){const We=Math.min(F/32-1,He>>5),Qe=(He-We*32)/32;U[He*we+Y.wall]=ie[We]+(ie[We+1]-ie[We])*Qe}const ce=new Float32Array(F/32+1);for(let He=0;He<=F/32;He++)ce[He]=he(B*F+He*32);for(let He=0;He<=F;He++){const We=Math.min(F/32-1,He>>5),Qe=(He-We*32)/32;U[He*we+Y.rtail]=ce[We]+(ce[We+1]-ce[We])*Qe}for(let He=0;He<=F;He++){const We=B*F+He,Qe=He*we,st=pe(We,Pe);if(a[He]=oe,U[Qe+Y.cx]=I(We,st.mean),U[Qe+Y.hw]=st.hw,U[Qe+Y.dish]=st.dish,U[Qe+Y.shoulder]=st.shoulder,U[Qe+Y.gul]=st.gul,U[Qe+Y.gw]=st.gw,U[Qe+Y.goff]=st.gAmp*Math.sin(O),U[Qe+Y.roll]=st.rollA*Math.sin(fe),U[Qe+Y.mog]=st.mog,U[Qe+Y.forest]=st.forest,U[Qe+Y.glade]=st.glade,U[Qe+Y.powder]=st.powder,U[Qe+Y.ridge]=st.ridge,He<F){const Le=pe(We+.5,Pe);oe-=Le.slope,fe+=It/Le.rollL,O+=It/78}}_.set(B+1,{baseY:oe,rollPh:fe,gPh:O})}if(U.base64=a,E.set(B,U),E.size>12){const oe=E.keys().next().value;oe!==B&&E.delete(oe)}return U}const z=B=>260*ae(B/1300+3.7,x.seed),V=B=>60*ae(B/370+11.3,x.seed+5);function I(B,U){return(z(B)-z(0)+U*(V(B)-V(0)))*ge(0,400,B)}const Q={};x.yawAt=function(B){const U=ye(B-5,Q).cx;return Math.atan2(ye(B+35,Q).cx-U,40)};const L={baseY:0,cx:0,hw:40,dish:0,shoulder:.3,gul:0,gw:10,goff:0,roll:0,mog:0,forest:0,glade:0,powder:0,ridge:0,wall:1,rtail:0,s:0};function ye(B,U){U=U||L;const A=Math.floor(B/F),a=H(A),oe=B-A*F,fe=Math.min(F-1,Math.floor(oe)),O=oe-fe,ie=fe*we,ce=ie+we;return U.baseY=a.base64[fe]+(a.base64[fe+1]-a.base64[fe])*O,U.cx=a[ie+1]+(a[ce+1]-a[ie+1])*O,U.hw=a[ie+2]+(a[ce+2]-a[ie+2])*O,U.dish=a[ie+3]+(a[ce+3]-a[ie+3])*O,U.shoulder=a[ie+4]+(a[ce+4]-a[ie+4])*O,U.gul=a[ie+5]+(a[ce+5]-a[ie+5])*O,U.gw=a[ie+6]+(a[ce+6]-a[ie+6])*O,U.goff=a[ie+7]+(a[ce+7]-a[ie+7])*O,U.roll=a[ie+8]+(a[ce+8]-a[ie+8])*O,U.mog=a[ie+9]+(a[ce+9]-a[ie+9])*O,U.forest=a[ie+10]+(a[ce+10]-a[ie+10])*O,U.glade=a[ie+11]+(a[ce+11]-a[ie+11])*O,U.powder=a[ie+12]+(a[ce+12]-a[ie+12])*O,U.ridge=a[ie+13]+(a[ce+13]-a[ie+13])*O,U.wall=a[ie+14]+(a[ce+14]-a[ie+14])*O,U.rtail=a[ie+15]+(a[ce+15]-a[ie+15])*O,U.s=B,U}x.at=ye;function Ve(B,U,A,a){const oe=ge(30,900,A),fe=B/1400,O=U/1400,ie=1-Math.abs(X(fe,O,71)),ce=1-Math.abs(X(fe*2.3+5.1,O*2.3,72)),He=1-Math.abs(X(fe*5.1,O*5.1+2.2,73));return oe*oe*(ie*ie*520+ce*ce*170+(a<40?He*He*60:30))*(.35+.65*ge(0,1500,A+400*X(O*.7,fe*.7,74)))}const Ne=[0,0,0];function Ce(B,U,A,a,oe){const fe=Math.floor(B),O=Math.floor(U),ie=B-fe-.5,ce=U-O-.5;let He=0,We=0,Qe=0,st=0;for(let Le=-1;Le<=1;Le++)for(let r=-1;r<=1;r++){let q=Math.imul(fe+r,374761393)^Math.imul(O+Le,668265263)^oe^m;q=Math.imul(q^q>>>13,1274126177),q^=q>>>16;const k=ie-r-((q&65535)/65536-.5)*.5,ee=ce-Le-((q>>>16)/65536-.5)*.5,Z=1-(k*k+ee*ee)/1.5625;if(Z<=0)continue;const K=Z*Z*Z,ue=(k*A+ee*a)*It,G=Math.sin(ue);He+=Math.cos(ue)*K,We-=G*A*K,Qe-=G*a*K,st+=K}st=1/st,Ne[0]=He*st,Ne[1]=We*st,Ne[2]=Qe*st}x.height=function(B,U,A){const a=-U,oe=ye(a),fe=B-oe.cx,O=Math.abs(fe),ie=oe.hw;let ce=oe.baseY;const He=O-ie;ce+=oe.dish*Math.min(1.6,fe*fe/(ie*ie));const We=He>15?oe.ridge+(oe.rtail-oe.ridge)*ge(15,60,He):oe.ridge;if(He>0){const st=He/55,Le=55*(st*st/(1+st)),r=150*(1-Math.exp(-Le/150)),q=a/240%1,k=q<.8?.5+.5*Math.cos(h0*q/.8):.5-.5*Math.cos(h0*(q-.8)/.2),ee=Math.max(oe.ridge,mt((oe.rtail-.74)/.26))*k,Z=Math.max(0,He-170),K=Z/55,ue=55*(K*K/(1+K));ce+=r*oe.shoulder*(1-We)-ee*(20*(1-Math.exp(-He*He/1300))-9*ge(100,170,He))-We*(.62*Math.exp(-Z/260)*ue+11*(1-Math.exp(-Z*Z/400)))+.36*oe.wall*(Le-r)}if(He>30){const st=ge(30,900,He);let Le=Ve(B,U,He,A);const r=ge(70,420,He);if(r>.01){const q=fe>0?1:-1,k=24,ee=(Ve(B+k,U,He+q*k,A)-Le)/k+q*Re(oe.shoulder*(1-We),.36*oe.wall,ge(60,300,He)),Z=(Ve(B,U+k,He,A)-Le)/k+.36,K=Math.hypot(ee,Z),ue=1.7*Math.min(1,1.4/(K+1e-6)),G=Z*ue,Ae=-ee*ue;Ce(B/700+3.9,U/700+8.2,G,Ae,1213);let _e=52*st*(1.27-2*Math.sqrt(Math.max(0,.5-.5*Ne[0]))),at=Ne[1]*.5,ot=Ne[2]*.5;A<=40&&(Ce(B/260,U/260,G+ot*1.4,Ae-at*1.4,911),_e+=22*(1.27-2*Math.sqrt(Math.max(0,.5-.5*Ne[0]))),at+=Ne[1],ot+=Ne[2]),A<=16&&(Ce(B/124+17.3,U/124-5.1,G+ot*1.4,Ae-at*1.4,577),_e+=10*(1.27-2*Math.sqrt(Math.max(0,.5-.5*Ne[0]))),at+=Ne[1]*1.05,ot+=Ne[2]*1.05),A<=4&&(Ce(B/59-8.7,U/59+31.9,G+ot*1.4,Ae-at*1.4,353),_e+=4.2*(1.27-2*Math.sqrt(Math.max(0,.5-.5*Ne[0])))),Le+=r*ge(.2,.7,K)*(.35+.65*st)*_e}if(A<12&&st>.05&&(Le+=st*14*X(B/90,U/90,75)+(A<4?st*4*X(B/23,U/23,76):0)),r>.01&&A<=20){const q=x.strata(B,ce+Le,U),k=Math.floor(q),ee=q-k,Z=r*(.1+.74*ge(-.3,.3,X((B+U)/260+k*3.31,(B-U)/700+k*1.73,79)));Le+=(ge(.22,.78,ee)-ee)*64*Z}ce+=Le}if(oe.gul>.01){const st=fe-oe.goff;ce-=oe.gul*Math.exp(-(st*st)/(oe.gw*oe.gw))}if(oe.ridge>.01){const st=(O-ie-1.5)/4.2;st>-3&&st<3&&(ce+=oe.ridge*1.5*Math.exp(-st*st)*(.75+.25*ae(a/37,41)))}if(oe.roll!==0&&(ce+=oe.roll*ge(ie*1.5,ie*.7,O)),oe.mog>.01&&A<=1){const st=a/5.2,Le=Math.floor(st),r=(Le&1)*.5+.13*ae(Le*1.7,9),q=fe/4.2+r,k=Math.cos(q*It),ee=st-Le,Z=ee<.62?ge(0,.62,ee):1-ge(.62,1,ee),K=.58+.84*(ke(Math.floor(q+.5)+4096,Le+4096)&65535)/65536;ce+=x.mogK*oe.mog*.92*K*(.5+.5*k)*Z*Ye(fe,a,ie)-oe.mog*.2}ce+=1.7*X(B/61,U/61,3),A<=12&&(ce+=.75*X(B/27,U/27,4)),A<=5&&(ce+=.32*X(B/11.3,U/11.3,5)),A<=1.2&&(ce+=.09*X(B/3.1,U/6.3,6)*(.4+oe.powder));const Qe=x.feats.get(Math.floor(a/32));if(Qe)for(let st=0;st<Qe.length;st++){const Le=Qe[st],r=(a-Le.s)/Le.len;if(r<-.2||r>2.6)continue;const q=Le.mark?ge(Le.wid*.5+3.3,Le.wid*.5-.3,Math.abs(fe-Le.u)):ge(Le.wid,Le.wid*.45,Math.abs(fe-Le.u));if(q<=0)continue;let k;if(r<1)k=r<=0?0:Le.mark?Math.pow(r,1.9):r*r*(3-2*r)*(.55+.45*r);else{const ee=(r-1)*Le.len,Z=Le.mark?3.4:1.4;k=ee<Z?1-ge(0,Z,ee)*1.25:-.25*(1-ge(Z,20,ee))}ce+=Le.h*k*q}return ce};function Ye(B,U,A){return ge(A*1.1,A*.8,Math.abs(B))*ge(2.4,6.5,Math.abs(B-.5*A*ae(U/105+7.3,x.seed+31)))}x.bumps=function(B,U){const A=ye(-U,Q);return A.mog>.01?A.mog*Ye(B-A.cx,-U,A.hw):0},x.strata=function(B,U,A){const a=It/1024,oe=U/64+.84*Math.sin(a*(B+A)+1.1*Math.sin(a*(B-A)+.7))+.32*Math.sin(2*a*B+1.7*Math.sin(a*A))+.2*Math.sin(3*a*A+1.3*Math.sin(a*B)+1.1)+.09*Math.sin(4*a*(B-A)+2*Math.sin(a*(B+A))),fe=2.1*Math.sin(a*(B-A)+.4)+1.3*Math.sin(2*a*A+1.1*Math.sin(a*B));return oe+.22*Math.sin(1.9634954*oe+1.7+fe)+.035*Math.sin(5.1050881*oe+.6-.8*fe)},x.mountain=function(B,U){const A=ye(-U),a=Math.abs(B-A.cx)-A.hw;return ge(30,900,a)};const T=[0,0,0];x.normal=function(B,U,A=.3){const a=x.height(B+A,U,.5)-x.height(B-A,U,.5),oe=x.height(B,U+A,.5)-x.height(B,U-A,.5),fe=-a/(2*A),O=-oe/(2*A),ie=Math.hypot(fe,1,O);return T[0]=fe/ie,T[1]=1/ie,T[2]=O/ie,T};const Se={x:0,z:0,h:0,r:0,variant:0,rot:0,ok:!1};let me=0;return x.treeDensity=function(B,U){const A=-U;if(A<-400)return 0;const a=ye(A),oe=B-a.cx,fe=Math.abs(oe),O=fe-a.hw;let ie=0;if(O>3){const ce=.55+.45*X(B/70,U/70,21);ie=a.forest*ge(3,26,O)*ge(-.25,.25,ce-.42),ie*=1-ge(260,620,O+120*X(B/300,U/300,22)),ie*=1-a.ridge*ge(0,30,O)}if(a.glade>.01){const ce=X(B/19,U/46,23),He=X(B/55,U/55,24),We=a.glade*ge(.02,.36,ce)*ge(-.5,.1,He)*ge(a.hw+6,a.hw-8,fe);ie=Math.max(ie,We*.46)}if(fe<a.hw&&A>150){const ce=.42*a.hw*ae(A/150+2.3,x.seed+9),He=X(B/30+7.1,U/46,26),We=a.forest*ge(.5,.66,He)*ge(6,11,Math.abs(oe-ce))*ge(150,230,A)*(1-a.ridge);ie=Math.max(ie,We*.7)}if(me=a.ridge,a.ridge>.01){const ce=a.ridge*ge(a.hw-4.5,a.hw-1.5,fe)*ge(a.hw+8,a.hw+3,fe)*ge(-.2,.4,X(B/21,U/34,27));ie=Math.max(ie,ce*.55)}return A<60&&(ie*=ge(8,60,A+fe)),ie},x.treeInCell=function(B,U,A){A=A||Se,A.ok=!1;const a=ke(B,U),oe=(B+.15+.7*(a&65535)/65536)*Es,fe=(U+.15+.7*(a>>>16)/65536)*Es,O=x.treeDensity(oe,fe);if(O<=.01)return A;const ie=ps(a+5369127);if((ie&65535)/65536>O*.9)return A;const ce=(ie>>>16&255)/255,He=(ie>>>24)/255;return A.ok=!0,A.x=oe,A.z=fe,A.h=(6.5+9.5*ce*ce+2.5*He)*(1-.6*me),A.r=A.h*.17,A.variant=(a>>>5)%5,A.rot=He*It,A.seed=ie,A},x.nearTree=function(B,U,A){const a=Math.floor(B/Es),oe=Math.floor(U/Es);let fe=1e9;A.ok=!1;for(let O=-1;O<=1;O++)for(let ie=-1;ie<=1;ie++){const ce=x.treeInCell(a+O,oe+ie);if(!ce.ok)continue;const He=Math.hypot(ce.x-B,ce.z-U);He<fe&&(fe=He,A.ok=!0,A.x=ce.x,A.z=ce.z,A.h=ce.h,A.r=ce.r,A.d=He,A.soft=!1)}return typeof gs<"u"&&gs.enabled||x.markers(-U-8,-U+8,(O,ie,ce)=>{const He=Math.hypot(O-B,ie-U);He<fe&&(fe=He,A.ok=!0,A.x=O,A.z=ie,A.h=ce,A.r=ce*.17,A.d=He,A.soft=!0)}),A},x.markers=function(B,U,A){U>=be&&Fe(U+3e3);for(let a=Math.floor(B/32);a<=Math.floor((U+24)/32);a++){const oe=x.feats.get(a);if(oe)for(let fe=0;fe<oe.length;fe++){const O=oe[fe];if(!O.mark)continue;const ie=O.s+O.len*.94;Math.floor(ie/32)===a&&(O.mx===void 0&&(O.mx=ye(ie,Q).cx+O.u,O.mx0=ye(O.s+1,Q).cx+O.u,O.mo=O.wid*.5+3.4,O.mh=3.5+.7*(O.s*.37%1)),A(O.mx-O.mo,-ie,O.mh,O.s*1.3),A(O.mx+O.mo,-ie+.6,O.mh*.9,O.s*2.9),A(O.mx0-O.mo,-O.s-1,O.mh*.82,O.s*4.1),A(O.mx0+O.mo,-O.s-1.5,O.mh*.95,O.s*5.3))}}},x.reset(x.seed),x})(P0,da,ta),c0={};function oo(e){{const w=new Uint8Array(262144),x=new Uint8Array(256*256),F=new Uint8Array(256*256);for(let we=0;we<256*256;we++)x[we]=ps(we*2+1)>>>24,F[we]=ps(we*2+10368889)>>>24;for(let we=0;we<256;we++)for(let Y=0;Y<256;Y++){const E=we*256+Y,D=(we+17&255)*256+(Y+37&255);w[E*4]=x[E],w[E*4+1]=x[D],w[E*4+2]=F[E],w[E*4+3]=F[D]}c0.noise=e.texture({w:256,h:256,format:"rgba8",wrap:"repeat",filter:"linear",data:w})}c0.black=e.texture({w:1,h:1,format:"rgba8",wrap:"clamp",filter:"linear",data:new Uint8Array([0,0,0,0])});{const w=new Float32Array(262144),x=new Uint8Array(512*512*4),F=[[6,1],[12,.5],[24,.27],[48,.15],[96,.085],[192,.05]];for(let we=0;we<F.length;we++){const Y=F[we][0],E=F[we][1],D=new Float32Array(Y*Y);for(let be=0;be<Y*Y;be++)D[be]=ms(be,977+we)*2-1;for(let be=0;be<512;be++){const ht=be*Y/512,qe=Math.floor(ht),se=ht-qe,_=se*se*se*(se*(se*6-15)+10),b=qe%Y*Y,re=(qe+1)%Y*Y;for(let m=0;m<512;m++){const J=m*Y/512,ae=Math.floor(J),X=J-ae,ke=X*X*X*(X*(X*6-15)+10),C=ae%Y,ne=(ae+1)%Y;w[be*512+m]+=E*Re(Re(D[b+C],D[b+ne],ke),Re(D[re+C],D[re+ne],ke),_)}}}for(let we=0;we<512;we++)for(let Y=0;Y<512;Y++){const E=we*512+Y,D=(w[we*512+(Y+1&511)]-w[we*512+(Y+511&511)])*.5*512/48,be=(w[(we+1&511)*512+Y]-w[(we+511&511)*512+Y])*.5*512/48;x[E*4]=it(128+D*127,0,255),x[E*4+1]=it(128+be*127,0,255),x[E*4+2]=it(128+w[E]*110,0,255),x[E*4+3]=ps(E+31337)>>>24}c0.detail=e.texture({w:512,h:512,format:"rgba8",wrap:"repeat",filter:"linear",mips:!0,data:x}),e.genMips(c0.detail)}}function no(e,s){const x=(se,_)=>{const b=new Float32Array(se*se);for(let re=0;re<se*se;re++)b[re]=ms(re,_)*2-1;return b},F=(se,_,b,re)=>{const m=b*_,J=re*_,ae=Math.floor(m),X=Math.floor(J),ke=m-ae,C=J-X,ne=ke*ke*ke*(ke*(ke*6-15)+10),Be=C*C*C*(C*(C*6-15)+10),Ee=(ae%_+_)%_,je=(Ee+1)%_,$e=(X%_+_)%_*_,nt=((X+1)%_+_)%_*_;return Re(Re(se[$e+Ee],se[$e+je],ne),Re(se[nt+Ee],se[nt+je],ne),Be)},we=(se,_)=>se.map(([b,re],m)=>({P:b,amp:re,a:x(b,_+m)})),Y=(se,_,b)=>{let re=0;for(const m of se)re+=m.amp*F(m.a,m.P,_,b);return re},E=Math.sin(s),D=-Math.cos(s),be=[1,2,3,4,5,7,9,12,16,21,27,34,42,52],ht=se=>{const _=it(se/48,-1,1);return it(127.5+127.5*Math.sign(_)*Math.sqrt(Math.abs(_)),0,255)},qe=(se,_)=>{const b=new Float32Array(262144),re=new Uint8Array(512*512*4),m=we([[3,1],[6,.5],[12,.25],[24,.12]],_),J=we([[3,1],[6,.5],[12,.25]],_+100),ae=we([[4,1],[8,.5]],_+200),X=we([[4,1],[8,.5]],_+300),ke=we([[64,1],[128,.6],[256,.35]],_+400),C=we([[10,1],[20,.5]],_+500),ne=we([[9,1],[18,.6]],_+600);for(let $e=0;$e<512;$e++)for(let nt=0;nt<512;nt++){const Ke=nt/512,Fe=$e/512,Ge=Y(m,Ke,Fe*2)/1.87,Je=Ge*1.7+Fe*4+8,le=Math.floor(Je),Pe=Je-le;let c=.25*((le-8+ge(0,.35,Pe)-Fe*4)/1.7)+.3*Ge+.045*Y(ke,Ke,Fe)/1.95;if(se){const Ie=Y(J,Ke,Fe),he=Y(ae,Ke,Fe),H=Y(C,Ke,Fe),z=Fe*19+Ke*4+Ie*2.2+H*.55,V=z-Math.floor(z),I=V<.72?V/.72:1-(V-.72)/.28,Q=ge(-.25,.35,Y(X,Ke+he*.03,Fe)/1.5)*(.45+.55*ge(-.5,.4,Y(ne,Ke,Fe)/1.6));c+=.17*(I*I*(3-2*I)-.5)*Q}b[$e*512+nt]=c}const Be=($e,nt)=>b[(nt&511)*512+($e&511)],Ee=($e,nt)=>{const Ke=Math.floor($e),Fe=Math.floor(nt),Ge=$e-Ke,Je=nt-Fe;return Re(Re(Be(Ke,Fe),Be(Ke+1,Fe),Ge),Re(Be(Ke,Fe+1),Be(Ke+1,Fe+1),Ge),Je)};for(let $e=0;$e<512;$e++)for(let nt=0;nt<512;nt++){const Ke=$e*512+nt,Fe=b[Ke];let Ge=0;for(const Je of be){const le=(Ee(nt+E*Je,$e+D*Je)-Fe)/Je*512;le>Ge&&(Ge=le)}re[Ke*4]=ht((Be(nt+1,$e)-Be(nt-1,$e))*.5*512),re[Ke*4+1]=ht((Be(nt,$e+1)-Be(nt,$e-1))*.5*512),re[Ke*4+2]=it(127.5+Fe*110,0,255),re[Ke*4+3]=it(Ge/48*255,0,255)}const je=e.texture({w:512,h:512,format:"rgba8",wrap:"repeat",filter:"linear",mips:!0,data:re});return e.genMips(je),je};c0.snow=qe(!1,2100),c0.snowFine=qe(!0,2100)}const Bs={m:6,sub:20},ts=(()=>{const e={LEVELS:8,N:256,G:128,BIAS:24,levels:[],ready:!1,sheen:.55},s=e.N,w=e.G;let x,F,we,Y={},E,D,be,ht,qe,se,_;const b=new Float32Array(s*s),re=new Uint16Array(s*s*4),m=new Uint16Array(s*s*4);let J=0,ae=-1;e.setSun=function(pe){J=Math.sin(pe),ae=-Math.cos(pe)};const X=[0,0];function ke(pe,c,Ie,he){let H=-1,z=0,V=pe.cell*1.5;for(let I=0;I<44&&V<9e3;I++,V*=1.3){const Q=c+J*V,L=Ie+ae*V;let ye=Math.max(pe.l,Math.min(e.LEVELS-1,Math.floor(Math.log2(V/3))));for(;ye<e.LEVELS;ye++){const Ve=e.levels[ye];if(!Ve.valid)continue;const Ne=Math.round(Q/Ve.cell),Ce=Math.round(L/Ve.cell);if(Ne<Ve.cx-128||Ne>Ve.cx+127||Ce<Ve.cz-128||Ce>Ve.cz+127)continue;const Ye=(Ve.H[Be(Ne,Ce)]+bs*Ce*Ve.cell-he)/V;Ye>H&&(H=Ye,z=1/V);break}if(ye>=e.LEVELS)break}X[0]=H,X[1]=z}function C(pe,c,Ie){const he=c/pe.cell,H=Ie/pe.cell,z=Math.floor(he),V=Math.floor(H),I=he-z,Q=H-V,L=pe.H,ye=it(z,pe.cx-128,pe.cx+127),Ve=it(z+1,pe.cx-128,pe.cx+127),Ne=it(V,pe.cz-128,pe.cz+127),Ce=it(V+1,pe.cz-128,pe.cz+127);return Re(Re(L[Be(ye,Ne)],L[Be(Ve,Ne)],I),Re(L[Be(ye,Ce)],L[Be(Ve,Ce)],I),Q)}const ne={ok:!1,x:0,z:0,h:0,r:0,d:0};e.init=function(pe){x=pe;for(let I=0;I<e.LEVELS;I++)e.levels.push({l:I,cell:.5*(1<<I),H:new Float32Array(s*s),cx:0,cz:0,valid:!1,hTex:x.texture({w:s,h:s,format:"r32f",filter:"nearest",wrap:"repeat"}),nTex:x.texture({w:s,h:s,format:"rgba16f",filter:"linear",wrap:"repeat"}),sTex:x.texture({w:s,h:s,format:"rgba16f",filter:"linear",wrap:"repeat"})});const c=new Float32Array((w+1)*(w+1)*2);let Ie=0;for(let I=0;I<=w;I++)for(let Q=0;Q<=w;Q++)c[Ie++]=Q,c[Ie++]=I;F=x.buffer(c,"vertex");const he=(I,Q,L,ye)=>{const Ve=[];for(let Ne=0;Ne<w;Ne++)for(let Ce=0;Ce<w;Ce++){if(Ce>=I&&Ce<Q&&Ne>=L&&Ne<ye)continue;const Ye=Ne*(w+1)+Ce;Ve.push(Ye,Ye+w+1,Ye+1,Ye+1,Ye+w+1,Ye+w+2)}return{ib:x.buffer(new Uint32Array(Ve),"index"),n:Ve.length}},H=he(0,0,0,0);we=H.ib,be=H.n;for(let I=0;I<2;I++)for(let Q=0;Q<2;Q++){const L=he(32+I,96+I,44+Q,108+Q);Y[I+","+Q]=L}{const I=Bs.m*2*Bs.sub,Q=I+1,L=new Float32Array(Q*Q*2),ye=new Uint32Array(I*I*6);let Ve=0;for(let Ne=0;Ne<Q;Ne++)for(let Ce=0;Ce<Q;Ce++)L[Ve++]=Ce,L[Ve++]=Ne;Ve=0;for(let Ne=0;Ne<I;Ne++)for(let Ce=0;Ce<I;Ce++){const Ye=Ne*Q+Ce;ye[Ve++]=Ye,ye[Ve++]=Ye+Q,ye[Ve++]=Ye+1,ye[Ve++]=Ye+1,ye[Ve++]=Ye+Q,ye[Ve++]=Ye+Q+1}qe=x.buffer(L,"vertex"),se=x.buffer(ye,"index"),_=ye.length}const V={name:"terrain",lib:[St.common,St.hash,St.fog,St.shadow,St.sprayTau,Ra],buffers:[{attrs:[["ij","vec2f"]]}],varyings:{wp:"vec3f",uvn:"vec4f",misc:"vec4f"},uniforms:{lv:"vec4f",tc:"vec4f",p:"vec4f",pt:"vec4f",pk:"vec4f",tk:"vec4f",tb:"vec4f",sa0:"vec4f",sa1:"vec4f",sa2:"vec4f",sb0:"vec4f",sb1:"vec4f",sb2:"vec4f",la0:"vec4f",la1:"vec4f",lb0:"vec4f",lb1:"vec4f"},textures:{tH:"fetch",tHc:"fetch",tN:"2d",tNc:"2d",tS:"2d",tSc:"2d",tSnow:"2d",tSnowF:"2d",tNoise:"2d",tDetail:"2d",tShadow:"shadow",tSky:"2d",tSunTau:"2d",tTrk:"2d",tTrkL:"2d",tTrkF:"2d"},vs:ro+"fn vert(a: VIn) -> VOut { var v: VOut; var t: TerrV; if (M.p.y < -0.5) { t = patchVertex(a.ij); } else { t = terrainVertex(a.ij); } v.wp = t.wp; v.uvn = t.uvn; v.misc = vec4f(t.al, t.dy, 0.0, 0.0); v.clip = U.viewProj * vec4f(t.wp, 1.0); return v; }",fs:lo.replace(/SUNK/g,(Math.round(9*J/(ae||-1))/9).toFixed(6))};E=x.pipeline(V),D=x.pipeline({name:"terrainShadow",lib:[St.common,Ra],buffers:[{attrs:[["ij","vec2f"]]}],varyings:{},uniforms:{lv:"vec4f",tc:"vec4f",p:"vec4f",pt:"vec4f",pk:"vec4f",tb:"vec4f"},textures:{tH:"fetch",tHc:"fetch"},colorFormat:null,cull:"none",depthBias:2,depthBiasSlope:4,vs:"fn vert(a: VIn) -> VOut { var v: VOut; let t: TerrV = terrainVertex(a.ij); v.clip = U.shadowVP * vec4f(t.wp - U.sunDir.xyz * 0.10, 1.0); return v; }",fs:null}),e.pipes=[E,D]};function Be(pe,c){return(c&255)*s+(pe&255)}function Ee(pe,c,Ie,he,H){const z=pe.cell,V=pe.H;for(let I=he;I<=H;I++){const Q=I*z,L=(I&255)*s,ye=bs*Q;for(let Ve=c;Ve<=Ie;Ve++)V[L+(Ve&255)]=vt.height(Ve*z,Q,z)-ye}}function je(pe,c,Ie,he,H){const z=pe.cell,V=pe.H,I=pe.cx-128,Q=pe.cx+127,L=pe.cz-128,ye=pe.cz+127;if(c=Math.max(c,I),Ie=Math.min(Ie,Q),he=Math.max(he,L),H=Math.min(H,ye),Ie<c||H<he)return;const Ve=[],Ne=[];{let Se=c;for(;Se<=Ie;){const me=Math.min(Ie,Se|255);Ve.push([Se,me]),Se=me+1}}{let Se=he;for(;Se<=H;){const me=Math.min(H,Se|255);Ne.push([Se,me]),Se=me+1}}const Ce=pe.l<=2,Ye=e.levels[6],T=e.levels[7];for(const[Se,me]of Ne)for(const[B,U]of Ve){const A=U-B+1,a=me-Se+1;let oe=0;for(let fe=Se;fe<=me;fe++)for(let O=B;O<=U;O++){const ie=Be(O,fe),ce=V[ie];b[oe]=ce;const He=O>I?V[Be(O-1,fe)]:ce,We=O<Q?V[Be(O+1,fe)]:ce,Qe=fe>L?V[Be(O,fe-1)]:ce,st=fe<ye?V[Be(O,fe+1)]:ce,Le=(We-He)/(((O>I)+(O<Q))*z||z),r=(st-Qe)/(((fe>L)+(fe<ye))*z||z)+bs,q=O*z,k=fe*z;let ee=1;const Z=vt.treeDensity(q,k);Ce&&Z>.02&&(vt.nearTree(q,k,ne),ne.ok&&(ee=1-.6*ge(ne.r*2.6,ne.r*.5,ne.d)));const K=vt.mountain(q,k);if(K>.002){let ue;pe.l===7?ue=.6*(He+We+Qe+st-4*ce)/4096:pe.l===6?ue=((O-2>=I?V[Be(O-2,fe)]:ce)+(O+2<=Q?V[Be(O+2,fe)]:ce)+(fe-2>=L?V[Be(O,fe-2)]:ce)+(fe+2<=ye?V[Be(O,fe+2)]:ce)-4*ce)/4096:ue=(C(Ye,q-64,k)+C(Ye,q+64,k)+C(Ye,q,k-64)+C(Ye,q,k+64)-4*C(Ye,q,k))/4096;const G=pe.l===7?0:(C(T,q-192,k)+C(T,q+192,k)+C(T,q,k-192)+C(T,q,k+192)-4*C(T,q,k))/36864;ee-=.5*it((ue-.75*G)*22,-.5,.6)*Math.min(1,K*4)}re[oe*4]=As(Le),re[oe*4+1]=As(r),re[oe*4+2]=As(ee),re[oe*4+3]=As(Z),ke(pe,q,k,ce+bs*k),m[oe*4]=As(it(X[0],-1,6)),m[oe*4+1]=As(X[1]),m[oe*4+2]=As(ce),m[oe*4+3]=As(K),oe++}x.updateTexture(pe.hTex,B&255,Se&255,A,a,b.subarray(0,A*a)),x.updateTexture(pe.nTex,B&255,Se&255,A,a,re.subarray(0,A*a*4)),x.updateTexture(pe.sTex,B&255,Se&255,A,a,m.subarray(0,A*a*4))}}function $e(pe,c,Ie,he){const H=pe.cell,z=Math.floor(c/(2*H))*2,V=Math.floor((Ie/H-e.BIAS)/2)*2;if(!pe.valid||he||Math.abs(z-pe.cx)>=200||Math.abs(V-pe.cz)>=200)return pe.cx=z,pe.cz=V,pe.valid=!0,Ee(pe,z-128,z+127,V-128,V+127),je(pe,z-128,z+127,V-128,V+127),s*s;const I=z-pe.cx,Q=V-pe.cz;if(!I&&!Q)return 0;pe.cx=z,pe.cz=V;let L=0;const ye=[];I>0?ye.push([z+128-I,z+127,V-128,V+127]):I<0&&ye.push([z-128,z-129-I,V-128,V+127]),Q>0?ye.push([z-128,z+127,V+128-Q,V+127]):Q<0&&ye.push([z-128,z+127,V-128,V-129-Q]);for(const Ne of ye)Ee(pe,Ne[0],Ne[1],Ne[2],Ne[3]),L+=(Ne[1]-Ne[0]+1)*(Ne[3]-Ne[2]+1);const Ve=pe.l===6?2:1;for(const Ne of ye)je(pe,Ne[0]-Ve,Ne[1]+Ve,Ne[2]-Ve,Ne[3]+Ve);return L}e.update=function(pe,c,Ie){let he=0;for(let H=e.LEVELS-1;H>=0;H--)he+=$e(e.levels[H],pe,c,Ie);return e.lastGen=he,he},e.updateOne=function(pe,c,Ie){return $e(e.levels[pe],c,Ie,!0)};const nt={a:[0,0],b:[1,0],c:[1,.06]};typeof Dt<"u"&&Dt.def("rock","岩壁",[["a","斑块"],["b","岩带"],["c","多岩"]],"b");const Ke={lv:[0,0,0,0],tc:[0,0,0,0],p:[0,0,0,0],pt:[0,0,0,0],pk:[0,0,0,0]},Fe={lv:Ke.lv,tc:Ke.tc,p:Ke.p,pt:[0,0,0,0],pk:[0,0,0,0],tb:[0,0,0,0]},Ge=()=>nt[typeof Dt<"u"&&Dt.val.rock]||nt.a;e.rockNow=()=>{const pe=Ge();Ke.pt[0]=pe[0],Ke.pt[1]=pe[1]},e.rockNow();function Je(pe,c){const Ie=pe.cell,he=e.levels[Math.min(e.LEVELS-1,pe.l+1)],H=pe.l===e.LEVELS-1;return Ke.lv[0]=Ie,Ke.lv[1]=pe.cx-c[0]/Ie,Ke.lv[2]=pe.cz-c[2]/Ie,Ke.lv[3]=H?0:1,Ke.tc[0]=pe.cx&255,Ke.tc[1]=pe.cz&255,Ke.tc[2]=H?pe.cx&255:pe.cx/2&255,Ke.tc[3]=H?pe.cz&255:pe.cz/2&255,Ke.p[0]=bs*c[2]-c[1],Ke.p[1]=pe.l,Ke.p[2]=H?1:.5,Ke.p[3]=e.sheen,he}function le(pe){if(pe.l===0)return{ib:we,n:be};const c=e.levels[pe.l-1],Ie=c.cx/2-pe.cx,he=c.cz/2-pe.cz-12;return Y[it(Ie,0,1)+","+it(he,0,1)]}e.draw=function(pe,c,Ie,he){const H=F0.frame(),z=e.levels[0],V=Bs.m*2;let I=0,Q=0,L=0;H.on&&z.valid&&(Q=Math.round(H.pc[0]/.5)-V/2,L=Math.round(H.pc[1]/.5)-V/2,I=ge(43,37,Math.max(Math.abs(Q-z.cx),Math.abs(Q+V-z.cx),Math.abs(L-z.cz),Math.abs(L+V-z.cz))));const ye=Ge();Ke.pt[0]+=it(ye[0]-Ke.pt[0],-.08,.08),Ke.pt[1]+=it(ye[1]-Ke.pt[1],-.01,.01),Ke.pt[2]=Q*.5-pe[0],Ke.pt[3]=L*.5-pe[2],Ke.pk[0]=H.pc[0]-pe[0],Ke.pk[1]=H.pc[1]-pe[2],Ke.pk[2]=H.D,Ke.pk[3]=I,Ke.tk=H.tk,Ke.tb=H.tb,Ke.sa0=H.sa0,Ke.sa1=H.sa1,Ke.sa2=H.sa2,Ke.sb0=H.sb0,Ke.sb1=H.sb1,Ke.sb2=H.sb2,Ke.la0=H.la0,Ke.la1=H.la1,Ke.lb0=H.lb0,Ke.lb1=H.lb1;const Ve=(Ne,Ce)=>({tH:Ne.hTex,tHc:Ce.hTex,tN:Ne.nTex,tNc:Ce.nTex,tS:Ne.sTex,tSc:Ce.sTex,tSnow:c0.snow,tSnowF:c0.snowFine,tNoise:c0.noise,tDetail:c0.detail,tShadow:c,tSky:Ie,tSunTau:he||c0.black,tTrk:F0.near,tTrkL:F0.light,tTrkF:F0.far});if(I>0){const Ne=Je(z,pe);Ke.p[1]=-1,Ke.tc[0]=Q&255,Ke.tc[1]=L&255,Ke.tc[2]=(Q/2%256+256)%256,Ke.tc[3]=(L/2%256+256)%256,x.draw(E,{u:Ke,tex:Ve(z,Ne),vb:[qe],ib:se,count:_})}for(const Ne of e.levels){const Ce=Je(Ne,pe),Ye=le(Ne);x.draw(E,{u:Ke,tex:Ve(Ne,Ce),vb:[F],ib:Ye.ib,count:Ye.n})}},e.drawShadow=function(pe,c){for(const Ie of e.levels){if(Ie.l>c)break;const he=Je(Ie,pe),H=le(Ie);x.draw(D,{u:Fe,tex:{tH:Ie.hTex,tHc:he.hTex},vb:[F],ib:H.ib,count:H.n})}},e.sunBinding=function(pe,c=3){const Ie=e.levels[c],he=Ie.cell;return{tex:Ie.sTex,xf:[1/(he*256),(pe[0]/he+.5)/256,(pe[2]/he+.5)/256,bs*pe[2]-pe[1]]}},e.heightBinding=function(pe,c=1){const Ie=e.levels[c],he=Ie.cell;return{tex:Ie.hTex,xf:[1/he,pe[0]/he,pe[2]/he,bs*pe[2]-pe[1]]}};let Pe=null;e.rebuild=function(pe,c){for(const Ie of e.levels)Ie.valid=!1;Pe={x:pe,z:c,l:e.LEVELS-1,row:-1}},e.rebuilding=()=>!!Pe,e.rebuildStep=function(pe=1e9){const c=performance.now(),Ie=16;for(;Pe;){const he=e.levels[Pe.l],H=he.cell;Pe.row<0&&(he.cx=Math.floor(Pe.x/(2*H))*2,he.cz=Math.floor((Pe.z/H-e.BIAS)/2)*2,he.valid=!0,Pe.row=0);const z=he.cx-128,V=he.cz-128+Pe.row%s,I=V+Ie-1;if(Pe.row<s?Ee(he,z,z+s-1,V,I):je(he,z,z+s-1,V,I),Pe.row+=Ie,Pe.row>=2*s&&(Pe.row=-1,--Pe.l<0&&(Pe=null)),performance.now()-c>=pe)break}return!Pe};{const pe=e.update;e.update=function(c,Ie,he){if(Pe){if(!he)return 0;Pe=null}return pe(c,Ie,he)}}return e})(),Ra=`
struct TerrV { wp: vec3f, uvn: vec4f, al: f32, dy: f32, }
// the snow round the skier raised by the depth the skis ride at (M.pk.z; M.pk.w: the patch is in use), so that they lie in it and not on it.
// On firm snow a centimetre or so, within a couple of metres. Riding IN deep powder (M.tb.w, Tracks.deep) it is the snow's own surface
// over the boots, and it is let down so gently, over several metres, that it reads as the lie of the slope, not as a mound. The coarse
// cells and the fine patch take the same lift at the same spot, so the seam between them stays closed. (Not in the sun's map: what the
// snow shadows, it shadows at the height the physics knows)
fn snowLift(xz: vec2f) -> f32 {
  let k: f32 = M.tb.w;
  return M.pk.z * M.pk.w * smoothstep(mix(2.15, 7.5, k), mix(1.0, 3.0, k), length(xz - U.player.xz));
}
fn terrainVertex(ij: vec2f) -> TerrV {
  var t: TerrV;
  let c: f32 = M.lv.x; let rel: vec2f = ij - vec2f(64.0, 64.0);
  let tcf: vec2f = M.tc.xy + rel;
  let ti: vec2i = vec2i(tcf) & vec2i(255, 255);
  let hf: f32 = texFetch(tH, ti, 0).x;
  let tcc: vec2f = M.tc.zw + rel * M.p.z;
  let c0: vec2f = floor(tcc); let fr: vec2f = tcc - c0;
  let i0: vec2i = vec2i(c0) & vec2i(255, 255); let i1: vec2i = (vec2i(c0) + vec2i(1, 1)) & vec2i(255, 255);
  let h00: f32 = texFetch(tHc, i0, 0).x; let h10: f32 = texFetch(tHc, vec2i(i1.x, i0.y), 0).x;
  let h01: f32 = texFetch(tHc, vec2i(i0.x, i1.y), 0).x; let h11: f32 = texFetch(tHc, i1, 0).x;
  let hc: f32 = mix(mix(h00, h10, fr.x), mix(h01, h11, fr.x), fr.y);
  let d: f32 = max(abs(rel.x), abs(rel.y));
  let al: f32 = smoothstep(44.0, 62.0, d) * M.lv.w;
  let xz: vec2f = (M.lv.yz + rel) * c;
  // (where the fine patch round the skier is drawn in its place, the finest level is dropped out of sight; the cells on the rim keep their outer edge)
  let pq: vec2f = xz - M.pt.zw;
  let pit: f32 = select(0.0, 1.5, M.pk.w > 0.0 && M.p.y < 0.5 && min(pq.x, pq.y) > 0.1 && max(pq.x, pq.y) < ${(Bs.m-.1).toFixed(1)});
  t.wp = vec3f(xz.x, mix(hf, hc, al) + ${bs.toFixed(4)} * xz.y + M.p.x - pit + snowLift(xz), xz.y);
  t.uvn = vec4f((tcf + 0.5) / 256.0, (tcc + 0.5) / 256.0);
  t.al = al; t.dy = 0.0;
  return t;
}
`,ro=`
// the snow cannot stand higher than half way up the side of a ski that is in it. C: the point under the boot, A: the ski's axis toward its tip (w:
// length of the tail), B: its axis across (w: length to the tip, 0 = no ski). The base turns up at shovel and tail, and the ski is waisted and
// thicker in the middle, as its mesh is.
// (Half way up its side, not its base: a ski presses itself into the snow, and the snow stands against its sides. Held down to the base,
// and a little way out from the ski so that the mesh could follow, the snow left the whole ski lying on top of a shallow dish: on the
// snow, not in it. Now the surface meets the side of the ski itself, a clean line whatever the mesh, and never reaches its top)
fn skiPress(wp: vec3f, C: vec4f, A: vec4f, B: vec4f) -> f32 {
  if (B.w <= 0.0) { return wp.y; }
  let Nn: vec3f = cross(B.xyz, A.xyz); let ny: f32 = max(Nn.y, 0.25);
  let yp: f32 = C.y - (Nn.x * (wp.x - C.x) + Nn.z * (wp.z - C.z)) / ny;                 // the plane of the base over (or under) this spot
  let r: vec3f = vec3f(wp.x, yp, wp.z) - C.xyz; let a: f32 = dot(r, A.xyz); let b: f32 = dot(r, B.xyz);
  let rise: f32 = 0.125 * pow(smoothstep(0.62, 0.96, a), 1.7) + 0.015 * sq(smoothstep(0.66, 0.80, -a)) + 0.5 * mix(0.008, 0.020, smoothstep(0.80, 0.25, abs(a - 0.05)));
  let wd: f32 = 0.049 + 0.009 * smoothstep(0.15, 0.78, -a) + 0.015 * smoothstep(0.15, 0.78, a);
  // (M.tb.z: how far ahead of the boot the snow is open over the ski. One riding deep runs under the snow from there to its shovel)
  // (it gives way over two quads' width beside the ski: any sharper, and the line of the snow along the ski's side comes out in steps)
  let m: f32 = smoothstep(-0.045, 0.0, wd - abs(b)) * smoothstep(-0.02, 0.02, a + A.w) * smoothstep(-0.02, 0.02, min(B.w, M.tb.z) - a);
  // (riding deep in powder (M.tb.w) nothing is pressed open round the skis at all: they run under the snow, and the snow that closed
  // back over them behind the boots is the furrow's floor. Pressed open, the tails lay bare in the trench; owner 2026-11-12)
  return mix(wp.y, min(wp.y, yp + rise / ny - 0.001), m * (1.0 - smoothstep(0.4, 0.8, M.tb.w)));
}
fn patchVertex(ij: vec2f) -> TerrV {
  var t: TerrV;
  let g: vec2f = ij * ${(1/Bs.sub).toFixed(6)};                                     // in cells of the finest level, from the patch's corner (M.tc: that corner's texel)
  let c0: vec2f = min(floor(g), vec2f(${(Bs.m*2-1).toFixed(1)})); let f: vec2f = g - c0;
  let i0: vec2i = (vec2i(c0) + vec2i(M.tc.xy)) & vec2i(255, 255); let i1: vec2i = (i0 + vec2i(1, 1)) & vec2i(255, 255);
  let h00: f32 = texFetch(tH, i0, 0).x; let h10: f32 = texFetch(tH, vec2i(i1.x, i0.y), 0).x;
  let h01: f32 = texFetch(tH, vec2i(i0.x, i1.y), 0).x; let h11: f32 = texFetch(tH, i1, 0).x;
  // the same two triangles to a cell as the mesh this takes the place of: along the rim the two surfaces are one
  var hb: f32 = h00 + f.x * (h10 - h00) + f.y * (h01 - h00);
  if (f.x + f.y > 1.0) { hb = h11 + (1.0 - f.x) * (h01 - h11) + (1.0 - f.y) * (h10 - h11); }
  let xz: vec2f = M.pt.zw + g * 0.5;
  // relief: the tracks (fading out toward the rim), and round the skier the whole surface raised by the depth the skis are riding at, so
  // that they lie on the floor of their trench with its walls beside them, not on top of the snow
  // (a deep trench is read two levels down, the mean of the snow two quads' width round each vertex: a wall the mesh cannot hold comes
  // out as a row of teeth and its face in ribs. The mesh gives the trench its depth; the wall's true line is the light's. A shallow
  // groove in firm snow is read one level down, at the size of the quads themselves: its walls have no height to make teeth of, and read
  // any wider the groove was a dish with the ski lying in the middle of it)
  // (riding in deep powder the patch lies further behind the skier, and the furrow is held in it right out toward its rim)
  let R: f32 = texLod(tTrk, (xz + U.origin.xz) / 12.8, 1.0 + smoothstep(0.02, 0.05, M.pk.z)).x * smoothstep(mix(2.75, 2.95, M.tb.w), mix(2.25, 2.5, M.tb.w), length(xz - M.pk.xy)) * M.pk.w;
  let y0: f32 = hb + ${bs.toFixed(4)} * xz.y + M.p.x + snowLift(xz);
  var y: f32 = y0 + R;
  y = skiPress(vec3f(xz.x, y, xz.y), M.sa0, M.sa1, M.sa2); y = skiPress(vec3f(xz.x, y, xz.y), M.sb0, M.sb1, M.sb2);
  t.wp = vec3f(xz.x, y, xz.y);
  t.uvn = vec4f((M.tc.xy + g + 0.5) / 256.0, (M.tc.zw + g * 0.5 + 0.5) / 256.0);
  // (dy: how far tracks and skis moved this vertex, for the contact shadows: they are worked out on the snow as the map has it. On the
  // mesh as the skis press it, the dusk along a ski's side came out in dashes, one for every vertex the ski's edge passed)
  t.al = 0.0; t.dy = y - y0;
  return t;
}
`,lo=`
// one glint per cell: a mirror facet with its own tilt. The dot is round on SCREEN (the cell is stretched by perspective, the glint is not):
// ja/jb = world metres per pixel along screen x / y, idet = 1 / det of that Jacobian.
fn sparkLayer(wxz: vec2f, cell: vec2f, N: vec3f, Hh: vec3f, ja: vec2f, jb: vec2f, idet: f32) -> vec4f {
  let g: vec2f = wxz / cell; let id: vec2f = floor(g);
  let r: vec4f = texLod(tNoise, (id + 0.5) / 256.0, 0.0);
  let tilt: vec2f = (r.xz - 0.5) * (0.30 + 2.3 * r.y * r.y);
  let n: vec3f = normalize(N + vec3f(tilt.x, 0.0, tilt.y));
  let d: f32 = max(dot(n, Hh), 0.0);
  let w: vec2f = (g - id - 0.5 - (r.yw - 0.5) * 0.4) * cell;
  let px: vec2f = vec2f(w.x * jb.y - w.y * jb.x, w.y * ja.x - w.x * ja.y) * idet;
  let shape: f32 = saturate(1.0 - dot(px, px) / (1.2 + 1.6 * r.w));
  // ice is a prism: most glints are white, some lean toward a spectral colour
  let tint: vec3f = mix(vec3f(1.0), 0.55 + 0.75 * cos(6.2832 * (r.z + vec3f(0.0, 0.33, 0.67))), 0.45 * r.x);
  return vec4f(tint, 1.0) * (pow(d, 380.0) * shape * shape);
}
fn snowSlope(t: vec4f) -> vec2f { let q: vec2f = t.xy * 2.0 - 1.0; return q * abs(q); }
// the lie of the rock: Course.strata term for term (p = world xz, y = world height, each known modulo 1024 m): uneven beds that swell and pinch
fn strataAt(p: vec2f, y: f32) -> f32 {
  let k: f32 = 0.0061359232;
  let u: f32 = y / 64.0 + 0.84 * sin(k * (p.x + p.y) + 1.1 * sin(k * (p.x - p.y) + 0.7)) + 0.32 * sin(2.0 * k * p.x + 1.7 * sin(k * p.y)) + 0.20 * sin(3.0 * k * p.y + 1.3 * sin(k * p.x) + 1.1) + 0.09 * sin(4.0 * k * (p.x - p.y) + 2.0 * sin(k * (p.x + p.y)));
  let ph: f32 = 2.1 * sin(k * (p.x - p.y) + 0.4) + 1.3 * sin(2.0 * k * p.y + 1.1 * sin(k * p.x));
  return u + 0.22 * sin(1.9634954 * u + 1.7 + ph) + 0.035 * sin(5.1050881 * u + 0.6 - 0.8 * ph);
}
// how much blowing snow stands over a point of the slope (p = world xz, known modulo 1024 m): long streams that wander as they run
fn driftRho(p: vec2f, tm: f32, lod: f32) -> f32 {
  let za: f32 = p.y + tm * 9.0;
  let xm: f32 = p.x + 0.55 * sin(za * 0.39270) + 1.4 * sin(za * 0.14726 + 0.9);
  // where the streams run, and the strands each one is combed into
  let a: f32 = texLod(tDetail, vec2f(xm * (152.0 / 1024.0), za * (25.0 / 1024.0)), lod).z;
  let b: f32 = texLod(tDetail, vec2f(xm * (456.0 / 1024.0) + 0.37, (p.y + tm * 12.5) * (19.0 / 1024.0) + 0.61), lod).z;
  return smoothstep(0.50, 0.74, a) * smoothstep(0.44, 0.70, b) * 1.5;
}
// mip level for a 512-texel map, given the texels a pixel steps along screen x and y (leaning toward the short side of the footprint)
fn footLod(a: vec2f, b: vec2f) -> f32 { let la: f32 = length(a); let lb: f32 = length(b); return max(log2(max(pow(min(la, lb), 0.65) * pow(max(la, lb), 0.35), 1e-6)), 0.0); }
fn ggxD(nh: f32, a2: f32) -> f32 { let d: f32 = nh * nh * (a2 - 1.0) + 1.0; return a2 / (PI * d * d); }
// --- where ski, boot and leg meet the snow. The shadow map cannot see this close to the ground (its texels are wider than a ski, and whatever
// stands within a stride of a spot is inside its bias), so the first metre of the skier's own shadow is worked out from the shapes
// themselves: each ski a thin plate with the boot on it, each shin and thigh a rod. Past that metre the shadow map has taken over.
// What a rod from a to b, r thick, leaves of the light that comes along rd to ro (soft at the edge, softer the further the rod is away):
fn rodShade(ro: vec3f, rd: vec3f, a: vec3f, b: vec3f, r: f32) -> f32 {
  let ba: vec3f = b - a; let oa: vec3f = ro - a; let dba: f32 = dot(rd, ba);
  let pc: vec3f = a + ba * saturate((dot(oa, ba) - dot(oa, rd) * dba) / max(dot(ba, ba) - dba * dba, 1e-5));      // the point of the rod the ray passes closest to
  let t: f32 = max(dot(pc - ro, rd), 1e-4);
  return 1.0 - (1.0 - smoothstep(-1.0, 1.0, (length(pc - ro - rd * t) - r) / (0.004 + 0.045 * t))) * (1.0 - smoothstep(1.15, 1.5, t));
}
// a ski (C: the point of its base under the boot + half width, A: axis toward the tip + length of the tail, B: axis across + length to the tip,
// 0 = no ski). x: what it and its boot leave of the sun, y: of the sky (the dark line where base meets snow, the dusk round the boot)
fn skiShade(wp: vec3f, L: vec3f, C: vec4f, A: vec4f, B: vec4f) -> vec2f {
  if (B.w <= 0.0) { return vec2f(1.0); }
  let Nn: vec3f = cross(B.xyz, A.xyz); let r: vec3f = wp - C.xyz;
  let hgt: f32 = -dot(r, Nn);                                    // how far under the plane of the base this bit of snow lies
  let dn: f32 = dot(L, Nn); let t: f32 = (hgt + 0.012) / max(dn, 0.02);      // along the light to the top of the ski
  var sh: f32 = 1.0;
  if (dn > 0.02 && t > 0.0) {
    let hp: vec3f = r + L * t; let e: f32 = 0.003 + 0.04 * t; let ha: f32 = dot(hp, A.xyz);
    sh = 1.0 - smoothstep(-e, e, C.w - abs(dot(hp, B.xyz))) * smoothstep(-e, e, ha + A.w) * smoothstep(-e, e, B.w - ha) * (1.0 - smoothstep(1.15, 1.5, t));
  }
  sh *= rodShade(wp, L, C.xyz + Nn * 0.085 - A.xyz * 0.12, C.xyz + Nn * 0.085 + A.xyz * 0.13, 0.058);
  let a0: f32 = dot(r, A.xyz); let b0: f32 = abs(dot(r, B.xyz));
  let od: f32 = max(max(b0 - C.w, -a0 - A.w), a0 - B.w);         // outside the ski's outline by this much, seen square on
  let occ: f32 = (1.0 - smoothstep(-0.015, 0.035, od)) * (1.0 - smoothstep(0.0, 0.07, hgt)) * (1.0 - smoothstep(0.0, 0.02, -hgt));
  let bd: f32 = length(vec3f(max(abs(a0 - 0.01) - 0.13, 0.0), max(b0 - 0.05, 0.0), max(max(0.02 + hgt, -hgt - 0.16), 0.0)));     // to the boot
  return vec2f(sh, (1.0 - 0.75 * occ) * (1.0 - 0.45 * sq(saturate(1.0 - bd / 0.14))));
}
// the near track maps (17_tracks.js) seen from so close that their texels show: read through a cubic B-spline (four taps, each the mean of
// four texels) and not straight. A wall two or three texels wide, read straight, is a row of beads. (lit: 1 = the baked light, 0 = the heights)
fn trackSmooth(uv: vec2f, lit: f32) -> vec4f {
  let st: vec2f = uv * 1024.0 - 0.5; let i: vec2f = floor(st); let f: vec2f = st - i; let f2: vec2f = f * f; let f3: vec2f = f2 * f; let g: vec2f = 1.0 - f;
  let w0: vec2f = g * g * g / 6.0; let w1: vec2f = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0; let w3: vec2f = f3 / 6.0;
  let g0: vec2f = w0 + w1; let g1: vec2f = 1.0 - g0;
  let p0: vec2f = (i - 0.5 + w1 / g0) / 1024.0; let p1: vec2f = (i + 1.5 + w3 / g1) / 1024.0;
  if (lit < 0.5) { return (texLod(tTrk, p0, 0.0) * g0.x + texLod(tTrk, vec2f(p1.x, p0.y), 0.0) * g1.x) * g0.y + (texLod(tTrk, vec2f(p0.x, p1.y), 0.0) * g0.x + texLod(tTrk, p1, 0.0) * g1.x) * g1.y; }
  return (texLod(tTrkL, p0, 0.0) * g0.x + texLod(tTrkL, vec2f(p1.x, p0.y), 0.0) * g1.x) * g0.y + (texLod(tTrkL, vec2f(p0.x, p1.y), 0.0) * g0.x + texLod(tTrkL, p1, 0.0) * g1.x) * g1.y;
}
fn contactShade(wp: vec3f, L: vec3f) -> vec2f {
  var s: vec2f = skiShade(wp, L, M.sa0, M.sa1, M.sa2) * skiShade(wp, L, M.sb0, M.sb1, M.sb2);
  // (shin: from the boot's cuff to the knee; thigh: knee to hip)
  if (M.la0.w > 0.0) { s.x *= rodShade(wp, L, M.sa0.xyz + cross(M.sa2.xyz, M.sa1.xyz) * 0.15, M.la0.xyz, M.la0.w) * rodShade(wp, L, M.la0.xyz, M.la1.xyz, M.la1.w); }
  if (M.lb0.w > 0.0) { s.x *= rodShade(wp, L, M.sb0.xyz + cross(M.sb2.xyz, M.sb1.xyz) * 0.15, M.lb0.xyz, M.lb0.w) * rodShade(wp, L, M.lb0.xyz, M.lb1.xyz, M.lb1.w); }
  return s;
}
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let al: f32 = v.misc.x;
  let s0: vec4f = tex(tN, v.uvn.xy); let s1: vec4f = tex(tNc, v.uvn.zw);
  let sm: vec4f = mix(s0, s1, al);
  let wp: vec3f = v.wp; let toCam: vec3f = U.camPos.xyz - wp; let dist: f32 = length(toCam); let V: vec3f = toCam / dist;
  let L: vec3f = U.sunDir.xyz;
  let wxz: vec2f = wp.xz + U.origin.xz;
  // wind-worked snow at three sizes: drifts, slabs and ripples, grain
  let d1: vec4f = tex(tSnow, wxz / 12.8);
  let d2: vec4f = tex(tSnowF, wxz / 2.56 + vec2f(0.37, 0.11));
  let d3: vec4f = tex(tSnow, wxz / 40.96 + vec2f(0.71, 0.23));
  let f1: f32 = smoothstep(420.0, 40.0, dist); let f2: f32 = smoothstep(46.0, 5.0, dist); let f3: f32 = smoothstep(420.0, 60.0, dist);
  let Nm: vec3f = normalize(vec3f(-sm.x, 1.0, -sm.y));
  // the mountain's own long shadow comes with a measure of how far up the walls this is
  let hz4: vec4f = mix(tex(tS, v.uvn.xy), tex(tSc, v.uvn.zw), al);
  let mnt: f32 = saturate(hz4.w);
  // crags on the walls, finer than the mesh can carry: two sizes of sharp-crested relief
  let e1: vec4f = tex(tDetail, wxz / 341.33333 + vec2f(0.13, 0.71)); let e2: vec4f = tex(tDetail, wxz / 1024.0 + vec2f(0.57, 0.29));
  let q1: f32 = e1.z * 2.0 - 1.0; let q2: f32 = e2.z * 2.0 - 1.0;
  let cw: f32 = mnt * smoothstep(50.0, 170.0, dist);
  let cs: vec2f = ((q1 / sqrt(q1 * q1 + 0.012)) * (e1.xy - 0.5) * 1.5 + (q2 / sqrt(q2 * q2 + 0.012)) * (e2.xy - 0.5) * 1.9) * (-cw);
  let Nc: vec3f = normalize(vec3f(-(sm.x + cs.x * 0.4), 1.0, -(sm.y + cs.y * 0.4)));
  // what holds snow on a wall: the ledge at the top of each bed of rock, a gully, and relief too small for the mesh to carry
  // (lenses along the beds, runnels down the face)
  var tau: f32 = 0.0; var bench: f32 = 0.0; var hold: f32 = 0.0; var sa: vec4f = vec4f(0.5);
  var lb: f32 = 0.5; var e3: vec4f = vec4f(0.5);
  let conc: f32 = (1.0 - sm.z) * 2.0;
  if (mnt > 0.001) {
    tau = strataAt(wxz, wp.y + U.origin.y);
    // how good a ledge a bed makes changes along its length; some beds hardly make one at all
    lb = texLod(tDetail, vec2f((wxz.x + wxz.y) / 1024.0, (floor(tau + 0.5) + 0.5) / 16.0), 1.0).z;
    bench = smoothstep(0.30, 0.44, abs(fract(tau) - 0.5) + (lb - 0.5) * 0.5);
    sa = tex(tDetail, vec2f((wxz.x + wxz.y) / 1024.0, tau));
    // (and the edge of a patch of bare rock is ragged at the size of a boulder, not drawn with a compass)
    e3 = tex(tDetail, wxz / 73.0 + vec2f(0.41, 0.07));
    // (the small relief can bare a face that is nearly steep enough anyway; it cannot open a hole in a gentle snowfield)
    hold = bench * 0.16 + conc * 0.40 + max((sa.z - 0.5) * 0.10 + (e1.z - 0.5) * 0.22 + (e2.z - 0.5) * 0.12 + (e3.z - 0.5) * 0.28, -0.20);
  }
  // rock shows through where the mountain is too steep to hold snow (it is deep winter: only the steepest faces are bare)
  // bare rock belongs to the walls above the forest. Toward the run, under the trees and close to the lens the snow closes over it:
  // the bar a face has to clear rises, so a patch shrinks to its steepest core and is gone, instead of fading like a stain
  let rgate: f32 = saturate((mnt - 0.07) * 9.0) * (1.0 - smoothstep(0.04, 0.25, sm.w));
  let shut: f32 = 0.30 * smoothstep(120.0, 45.0, dist) + 0.5 * (1.0 - rgate);
  var rock: f32 = smoothstep(0.612, 0.548, Nc.y + (d1.z - 0.5) * 0.16 + hold + shut) * step(0.001, rgate);
  // (Variants 'rock' b/c, M.pt.x the blend toward them, M.pt.y how much rock: the rock comes out in BANDS, the riser of each bed of the
  // strata, the same beds the mesh cuts its benches along. Seen from afar a wall is then a stack of long dark lines with snow on every
  // bench between them, broken where a couloir runs down or a bed makes no cliff, not a scatter of spots. How tall the cliff of a bed is
  // grows with the steepness of the face: past about 45 degrees snow cannot hold and only the benches stay white)
  var rk: vec3f = vec3f(0.0, 0.5, 0.0);       // (x: top of the band in the bed, y: its height, z: in the band)
  if (M.pt.x > 0.001 && mnt > 0.001) {
    let fr: f32 = fract(tau); let bed: f32 = floor(tau); let bm: f32 = bed - 16.0 * floor(bed / 16.0);      // (bm: the bed, as the shader knows it, mod 1024 m of height)
    // (whether a bed makes a cliff at all, and how tall, changes slowly along it: many beds hardly break the snow, a few stand out for a
    // kilometre; a strong bed next to a strong bed makes one great face)
    let bn: f32 = texLod(tDetail, vec2f((wxz.x + wxz.y) / 2900.0 + bm * 0.37, (wxz.x - wxz.y) / 4100.0 + bm * 0.213), 0.0).z;
    let cl: f32 = saturate((0.86 + M.pt.y - Nc.y - shut) * 3.4 + (bn - 0.5) * 4.0 + (lb - 0.5) * 0.8 - conc * 1.1 - smoothstep(0.04, 0.25, sm.w) * 2.0);
    let hw: f32 = cl * (0.42 + 0.5 * M.pt.y);
    // the top of a band is the lip of the bench above: a hard, nearly level line. Its foot is ragged: snow runs up into the rock in
    // fingers down every runnel (noise in xz, on a steep face, is drawn out down the fall line)
    let ctr: f32 = 0.47 + (sa.x - 0.5) * 0.08;
    let top: f32 = ctr + hw + (sa.x - 0.5) * 0.05 + (e1.z - 0.5) * 0.03;
    let bot: f32 = ctr - hw + (e3.z - 0.5) * 0.40 * hw + (e2.z - 0.5) * 0.30 * hw + max(conc - 0.15, 0.0) * 0.8;
    let ew: f32 = 0.02 + dist * 0.00003;
    var rb: f32 = saturate((top - fr) / ew) * saturate((fr - bot) / (ew * 2.5)) * smoothstep(0.05, 0.12, hw);
    // (on the steepest faces only a good bench (lb: the ledge this bed makes, here) still holds a line of snow; a poor one is rock too, and
    // the bands either side of it run together into one great face)
    rb = max(rb, saturate(cl * 2.0 - 0.95) * smoothstep(0.56, 0.44, lb + (sa.x - 0.5) * 0.3)) * step(0.001, rgate);
    // joints: the beds are cut by vertical fractures, and snow fills them, so a band is a row of blocks with white chutes between, not one
    // unbroken stripe. A fracture is a vertical plane that holds the fall line of the face, so of four families (x, z and the diagonals,
    // whole periods per 1024 m) the face takes the one whose plane lies nearest its fall line. Each bed shifts them a little (they step
    // from bed to bed), and the snow in them is ragged at the edge. A wide set ~90 m apart and a narrow set a third of that.
    let fd: vec2f = normalize(sm.xy + vec2f(1e-5, 0.0));
    let jw: vec4f = pow(abs(vec4f(fd.x, fd.y, (fd.x + fd.y) * 0.70711, (fd.x - fd.y) * 0.70711)), vec4f(10.0));
    let jo: f32 = fract(sin(bm * 12.9898 + 4.1) * 43758.547) * 0.22 + (e1.z - 0.5) * 0.30 + (e3.z - 0.5) * 0.16;
    let jc: vec4f = vec4f(wxz.y * (11.0 / 1024.0), wxz.x * (11.0 / 1024.0), (wxz.x - wxz.y) * (8.0 / 1024.0), (wxz.x + wxz.y) * (8.0 / 1024.0)) + jo;
    let jA: vec4f = smoothstep(vec4f(0.035), vec4f(0.075), abs(fract(jc) - 0.5));
    let jB: vec4f = smoothstep(vec4f(0.04), vec4f(0.10), abs(fract(jc * 3.0 + vec4f(0.31, 0.57, 0.13, 0.79) + (sa.y - 0.5) * 0.8) - 0.5) + (sa.z - 0.5) * 0.25);
    let jm: f32 = dot(jw, jA * mix(vec4f(1.0), jB, 0.6)) / (jw.x + jw.y + jw.z + jw.w);
    rb *= mix(1.0, jm, smoothstep(0.02, 0.10, hw));
    rk = vec3f(top, max(top - bot, 0.05), rb);
    rock = mix(rock, rb, M.pt.x);
  }
  let sdir0: vec2f = normalize(L.xz + vec2f(1e-4, 0.0)); let tanE0: f32 = L.y / max(length(L.xz), 1e-3);
  let g1: vec2f = snowSlope(d1) * (0.81 * f1); let g2: vec2f = snowSlope(d2) * (0.81 * f2); let g3: vec2f = snowSlope(d3) * (0.5 * f3);
  var slope: vec2f = sm.xy + cs + g1 + g2 + g3;
  slope += snowSlope(d1) * rock * 1.2;
  // --- the middle distance (15..250 m): relief a few metres across that the mesh is too coarse for and the snow maps too fine. Broad
  // wind pillows, and in patches soft sastrugi: sharp-crested ridges drawn out along the wind (down the fall line), a couple of metres
  // apart. Light and shade only (the slopes of a height field, and the shadow its crests throw toward a low sun): the ground the skis
  // run on is not touched. Close to the lens the snow maps carry the detail as before, so this fades in from 15 m.
  let fM: f32 = smoothstep(12.0, 32.0, dist) * smoothstep(300.0, 170.0, dist) * (1.0 - rock) * (1.0 - 0.6 * smoothstep(0.04, 0.25, sm.w));
  let KP: f32 = 1.8; let KS: f32 = 0.42;      // (metres of relief: pillows, sastrugi)
  var gM: vec2f = vec2f(0.0); var mshM: f32 = 1.0;
  // (seen this flat, a pixel's footprint is metres long down the view and centimetres across it: a mip level chosen by the long side
  // would blur every ridge away, so the level leans toward the short side, as for the tracks)
  let jaM: vec2f = dpdx(wxz); let jbM: vec2f = dpdy(wxz);
  if (fM > 0.002) {
    // (where the wind has worked the slope into pillows, where into sastrugi, and where it left it smooth: blobs ~80 m across)
    let pz: vec4f = tex(tDetail, wxz / 512.0 + vec2f(0.23, 0.67));
    let wS: f32 = smoothstep(0.42, 0.62, pz.z); let wP: f32 = 0.55 + 0.45 * smoothstep(0.62, 0.40, pz.z);
    let lP: f32 = footLod(jaM * 4.0, jbM * 4.0); let sk: vec2f = vec2f(16.0, 2.0); let lS: f32 = footLod(jaM * sk, jbM * sk);
    let pil: vec4f = texLod(tDetail, wxz / 128.0 + vec2f(0.61, 0.17), lP);
    let sas: vec4f = texLod(tDetail, vec2f(wxz.x / 32.0, wxz.y / 256.0) + vec2f(0.29, 0.83), lS);
    let qs: f32 = sas.z * 2.0 - 1.0; let rs: f32 = qs / sqrt(qs * qs + 0.015);
    // (tDetail's slopes are per tile / 48: x metres of height over a T m tile is x * 96 / T per unit of (rg - 0.5))
    gM = (pil.xy - 0.5) * (KP * 96.0 / 128.0) * wP - rs * (sas.xy - 0.5) * vec2f(KS * 96.0 / 32.0, KS * 96.0 / 256.0) * wS;
    // the crests' shadows: is the relief 3 m toward the sun higher than the sun stands above this spot?
    let hp: f32 = (pil.z - 0.5) * 2.32 * KP * wP - sqrt(qs * qs + 0.015) * KS * wS;
    let sp: vec2f = wxz + sdir0 * 3.0; let qs2: f32 = texLod(tDetail, vec2f(sp.x / 32.0, sp.y / 256.0) + vec2f(0.29, 0.83), lS).z * 2.0 - 1.0;
    let hs: f32 = (texLod(tDetail, sp / 128.0 + vec2f(0.61, 0.17), lP).z - 0.5) * 2.32 * KP * wP - sqrt(qs2 * qs2 + 0.015) * KS * wS;
    let tM: f32 = max(tanE0 - dot(sm.xy, sdir0), 0.03);
    mshM = 1.0 - fM * smoothstep(tM * 0.8, tM * 1.3 + 0.02, (hs - hp) / 3.0);
    gM *= fM;
  }
  slope += gM;
  // a ledge is flatter than the face it sits on
  // (bands, b/c: the snow lying on the bench just above each band is a ledge too, turned up to the sun and the sky)
  let cap: f32 = smoothstep(rk.x, rk.x + 0.015, fract(tau)) * (1.0 - smoothstep(rk.x + 0.07, rk.x + 0.14, fract(tau))) * step(0.001, rk.y - 0.051) * M.pt.x;
  slope *= 1.0 - 0.45 * max(bench, cap) * (1.0 - rock) * smoothstep(0.80, 0.62, Nc.y) * saturate(mnt * 5.0);
  let sdir: vec2f = normalize(L.xz + vec2f(1e-4, 0.0)); let tanE: f32 = L.y / max(length(L.xz), 1e-3);
  // the sun's height above the lie of the slope here (a slope that falls away toward a low sun sees it a good deal higher than level ground does)
  let t3: f32 = max(tanE - dot(sm.xy, sdir), 0.03);
  // the skier's own tracks, from the two maps of 17_tracks.js: the height of the snow against untouched snow (trH, m), its slopes (trS), the
  // shadow the walls of the tracks throw (trSh) and the sky those walls hide (trAo). Near the skier slopes, shadow and sky come baked in a
  // map of their own; further up the hill they are felt out of the heights. Snow outside the box the trail lies in is not asked.
  var trH: f32 = 0.0; var trS: vec2f = vec2f(0.0); var trSh: f32 = 1.0; var trAo: f32 = 1.0; var trC: f32 = 0.0; var trG: f32 = 0.0;       // (trC: the height the skis' own shadows fall on)
  let ja: vec2f = dpdx(wxz); let jb: vec2f = dpdy(wxz);
  let pr: vec2f = wp.xz - U.player.xz; let pd: f32 = length(pr);
  let ta: f32 = dot(pr, M.tk.xy); let tb: f32 = dot(pr, vec2f(-M.tk.y, M.tk.x));
  if (pd < 21.0 && ta > M.tk.z && ta < M.tk.w && tb > M.tb.x && tb < M.tb.y) {
    // far from the lens a groove is thinner than a pixel: read a blurred level of the map (chosen nearer the short side of the pixel's
    // footprint than the long one, since the tracks mostly run away from the camera)
    let la: f32 = length(ja); let lb2: f32 = length(jb); let fp: f32 = pow(min(la, lb2), 0.6) * pow(max(la, lb2), 0.4);
    let wN: f32 = smoothstep(4.8, 4.2, pd);
    if (wN > 0.0) {
      let tl: f32 = clamp(log2(fp * 80.0), 0.0, 6.0); let tu: vec2f = wxz / 12.8;
      // (the baked light: shadow, sky and slopes in one. Where the lens is so close that a texel is wider than a pixel it is read smooth)
      let wb: f32 = saturate(1.0 - tl * 2.0);
      var lt: vec4f = vec4f(0.0);
      if (wb < 1.0) { lt = texLod(tTrkL, tu, tl) * (1.0 - wb); }
      if (wb > 0.0) { lt += trackSmooth(tu, 1.0) * wb; }
      let tq: vec4f = texLod(tTrk, tu, tl); trH = tq.x * wN; trG = tq.y * wN; trC = trH;
      // (the shadow a ski's tail throws back along its own trench ends on the trench's wall, along a line of equal height: on heights read
      // straight that line is a staircase, a step for every texel the wall crosses, and stood behind each tail as the rungs of a ladder)
      if (wb > 0.0 && pd < 2.4) { trC = mix(trH, trackSmooth(tu, 0.0).x, wb); }
      trS = lt.zw * wN;
      trSh = 1.0 - wN * smoothstep(0.47, 0.53, lt.x); trAo = mix(1.0, lt.y, wN);      // (lt.x: how far under the edge of a wall's shadow, 0.5 = on it)
    }
    if (wN < 1.0) {
      let wF: f32 = (1.0 - wN) * smoothstep(21.0, 17.5, pd);
      let tl: f32 = max(log2(fp * 20.0), 0.0); let te: f32 = exp2(floor(tl)) / 1024.0; let tu: vec2f = wxz / 51.2;
      let fq: vec4f = texLod(tTrkF, tu, tl); let h0: f32 = fq.x;      // (this map holds 0.6 + 1.25 x metres; G: how loose)
      trH += (h0 - 0.6) * 0.8 * wF; trG += fq.y * wF;
      trS += vec2f(texLod(tTrkF, tu + vec2f(te, 0.0), tl).x - texLod(tTrkF, tu - vec2f(te, 0.0), tl).x, texLod(tTrkF, tu + vec2f(0.0, te), tl).x - texLod(tTrkF, tu - vec2f(0.0, te), tl).x) * (0.8 * wF / (te * 102.4));
      var hz: f32 = (texLod(tTrkF, tu + sdir * (0.07 / 51.2), tl).x - h0) / 0.07;
      hz = max(hz, (texLod(tTrkF, tu + sdir * (0.16 / 51.2), tl).x - h0) / 0.16);
      hz = max(hz, (texLod(tTrkF, tu + sdir * (0.36 / 51.2), tl).x - h0) / 0.36);
      trSh *= 1.0 - wF * smoothstep(t3 * 0.7, t3 * 1.3, hz * 0.8);
      trAo *= 1.0 - wF * 0.18 * saturate((0.6 - h0) * 19.2);
    }
  }
  // what a ski leaves is not the snow it found: where it pressed, the wind's ripples are ironed flat and the grains packed to a dull gloss
  // (pol); what it pushed aside lies loose and bright (loose)
  // (both level off where the height crosses the surface: that is the top of a wall, where the map is at its coarsest)
  // (pressed is pressed: a groove a centimetre deep in firm snow is as ironed as a trench in powder)
  // (and what the tracks' G channel says is loose: the churned snow of a powder furrow and its lips, a skid's berm, and what thrown snow
  // left where it came down, 17_tracks.js T.deposit: fans of crumbs, the pile of a stop, pits, the line of a rolled snowball. Loose snow
  // is crumbs and clumps: its surface breaks up into grains a few centimetres across, and it is never polished)
  let lg: f32 = saturate(trG);
  let pol: f32 = smoothstep(0.001, 0.009, -trH) * (1.0 - lg); let loose: f32 = max(smoothstep(0.0, 0.03, trH), lg);
  slope += trS - g2 * (0.9 * pol);
  if (lg > 0.02) { let fpl: f32 = max(length(ja), length(jb)); let gq: vec4f = texLod(tDetail, wxz / 0.6 + vec2f(0.43, 0.19), max(log2(fpl * 512.0 / 0.6) + 0.5, 0.0)); slope += (gq.xy - 0.5) * (0.9 * lg * smoothstep(0.08, 0.02, fpl)); }
  // skis, boots and legs on the snow: x the sun they take, y the sky
  var skS: vec2f = vec2f(1.0);
  // (worked out for the snow where the map has it, not where the mesh has it: the mesh draws a wall in facets)
  // (not for skis riding IN deep powder (M.tb.w): they are under the snow there, and their outline worked out on the snow above them came
  // out as a dark square box beside each tip. What sticks out of the snow, the tips, the shadow map has; owner 2026-11-12)
  if (pd < 2.4 && M.tb.w < 0.98) { skS = mix(contactShade(wp + vec3f(0.0, trC - v.misc.y, 0.0), L), vec2f(1.0), smoothstep(0.1, 0.6, M.tb.w)); }
  let N: vec3f = normalize(vec3f(-slope.x, 1.0, -slope.y));
  let ndl: f32 = dot(N, L);
  let nv: f32 = max(dot(N, V), 0.0);
  // every slab edge and ripple shadows the snow behind it: compare the baked horizon (toward the sun) with the sun's height above each layer's own base
  let t1: f32 = max(t3 - dot(g3, sdir), 0.03); let t2: f32 = max(t1 - dot(g1, sdir), 0.03);
  let msh: f32 = (1.0 - smoothstep(t3 * 0.8, t3 * 1.25 + 0.03, d3.w * 0.5 * f3)) * (1.0 - smoothstep(t1 * 0.8, t1 * 1.25 + 0.03, d1.w * 0.81 * f1)) * (1.0 - smoothstep(t2 * 0.8, t2 * 1.25 + 0.03, d2.w * 0.81 * f2 * (1.0 - pol)));
  // the mountain's own long shadow: is the sun above the crest that stands between it and this spot?
  let far: f32 = smoothstep(-0.010, 0.022, tanE - hz4.x);
  // --- spindrift: loose snow the wind carries down the open slope in streams a hand high, like smoke. The snow behind each stream lies
  // in its shadow, and its crystals flash as they pass; they come in gusts that run down the mountain, so on a clear day the air just
  // above the snow is never still. (One sheet, looked up where the view ray pierces it and again where the ray to the sun does; the
  // lattice repeats every 1024 m. The cold air drains down the fall line, so the streams lie along the direction of travel.)
  let drift: f32 = U.ambGnd.w * smoothstep(260.0, 50.0, dist) * (1.0 - rock) * (1.0 - smoothstep(0.08, 0.35, sm.w));
  var dView: f32 = 0.0; var dSun: f32 = 0.0;
  let dpar: vec2f = wxz + (V.xz - N.xz * nv) / max(nv, 0.07) * 0.16;
  if (drift > 0.003) {
    let tm: f32 = U.camPos.w;
    let lod: f32 = 2.0 + max(log2(dist / 14.0), 0.0);
    let zg: f32 = wxz.y + tm * 10.0;
    let gust: f32 = drift * smoothstep(0.40, 0.60, texLod(tDetail, vec2f(3.0 * wxz.x + zg, 3.0 * zg - wxz.x) / 1024.0, 2.0).z);
    if (gust > 0.003) { dView = gust * driftRho(dpar, tm, lod); dSun = gust * driftRho(wxz + sdir * (0.16 / tanE), tm, lod); }
  }
  // (the line after the next is the shadow map's, word for word as master has it. The shadow of the tracks' own walls is held back from
  // it (trW), so that the sun but for those walls is known as well (sh0): the loose snow of a berm lets some of it through)
  let trW: f32 = trSh; trSh = 1.0;
  var sh: f32 = shadowSoft(wp, 0.00001) * mix(1.0, msh * mshM, U.fx.w) * far * exp(-0.9 * sprayTau(wp, 0.0)) * trSh * (1.0 - 0.30 * (1.0 - exp(-dSun * 2.4)));
  // (skis, boots and legs: the darker of their own shadow, worked out from their shapes, and the shadow map's. Never one on top of the
  // other: where the shadow map reaches the boots too, the two are the same shadow)
  sh = min(sh, skS.x); let sh0: f32 = sh; sh *= trW;
  // beyond the reach of the shadow map the forest shades its own floor. With the sun this low a tree throws a shadow four times its
  // height, so the snow between the trunks sees the sun only in streaks: how many depends on how much forest stands toward the sun.
  let cover: f32 = shadowCover(wp);
  if (cover < 0.999) {
    let so: vec2f = sdir / (M.lv.x * 256.0);
    let den: f32 = (mix(tex(tN, v.uvn.xy + so * 7.0).w, tex(tNc, v.uvn.zw + so * (7.0 * M.p.z)).w, al)
                  + mix(tex(tN, v.uvn.xy + so * 21.0).w, tex(tNc, v.uvn.zw + so * (21.0 * M.p.z)).w, al)
                  + mix(tex(tN, v.uvn.xy + so * 38.0).w, tex(tNc, v.uvn.zw + so * (38.0 * M.p.z)).w, al)) * 0.3333;
    let lit: f32 = exp(-8.5 * den);
    // streaks lying along the sun's bearing (sheared rather than turned, so the pattern survives the 1024 m origin steps)
    let sq: vec2f = vec2f(wxz.x - SUNK * wxz.y, wxz.y);
    let sn: f32 = tex(tSnow, sq * vec2f(9.0 / 1024.0, 1.0 / 1024.0)).z * 0.6 + tex(tSnow, sq * vec2f(27.0 / 1024.0, 4.0 / 1024.0) + vec2f(0.31, 0.57)).z * 0.4;
    let thr: f32 = (1.0 - lit) * 1.2;
    let pat: f32 = mix(smoothstep(thr - 0.2, thr, saturate((sn - 0.5) * 2.2 + 0.5)), lit, smoothstep(220.0, 560.0, dist));
    sh *= mix(pat, 1.0, cover);
  }
  let ao: f32 = sm.z * trAo * skS.y;
  // --- snow
  let wrap: f32 = saturate((ndl + 0.12) / 1.12);
  let Hh: vec3f = normalize(V + L);
  let fres: f32 = pow(1.0 - nv, 5.0);
  var albedo: vec3f = vec3f(0.93, 0.955, 0.985);
  // looking toward a low sun you see the backs of things: of every ripple, crumb and grain the face turned to the lens is the one turned
  // from the light. Snow toward the sun is a field of small blue shadows with light on their rims, not a white sheet; the white is kept
  // for what the sun comes THROUGH (thrown snow) and what mirrors it (the crust, single crystals)
  let back: f32 = saturate(dot(normalize(-V.xz + vec2f(1e-5, 0.0)), sdir));
  // (pressed snow has no crumbs to turn their backs to the light)
  let mic: f32 = mix(1.0 - 0.75 * back * back * saturate(1.0 - tanE * 1.2), 1.0, 0.15 * pol);
  var direct: vec3f = U.sunCol.rgb * wrap * sh * mic;
  // light scattered forward through the top grains when looking into the sun
  let mu: f32 = dot(-V, L);
  let fwd: f32 = pow(saturate(mu * 0.5 + 0.5), 6.0) * (0.25 + 0.75 * fres) * saturate(ndl * 4.0 + 0.6);
  // (the loose snow of a berm or a lip is all top grains: against the sun its crest glows, a little even where the wall beside it shades it)
  direct += U.sunCol.rgb * fwd * 0.22 * (sh * (1.0 + 2.5 * loose) + (sh0 - sh) * 0.8 * loose);
  // sky from above (shadows on snow are sky-blue), plus light bounced between slopes on the faces that look sideways
  // (a face in the mountain's own shadow still looks at sunlit snow across the valley: that fill keeps a whole shaded slope from going solid blue)
  let fill: vec3f = U.sunCol.rgb * (0.04 * (1.0 - far));
  let amb: vec3f = U.ambSky.rgb * (1.3 + 0.8 * N.y) + U.ambGnd.rgb * (0.50 - 0.45 * N.y) + fill + twiLight(N);
  var col: vec3f = albedo * (direct + amb * ao);
  // terminator: light bleeding under the surface warms the shadow edge
  col += albedo * U.sunCol.rgb * vec3f(0.55, 0.32, 0.22) * (sh * (1.0 - sh)) * 0.6;
  // sheen of the crust: a rough ice surface seen at a grazing angle against the light (this is the bright path toward the sun)
  let nh: f32 = saturate(dot(N, Hh)); let vh: f32 = saturate(dot(V, Hh));
  let F: f32 = 0.02 + 0.98 * pow(1.0 - vh, 5.0);
  // (the floor of a track is packed smoother than the crust: a tighter, brighter gleam)
  let spec: f32 = (0.75 * ggxD(nh, mix(0.16, 0.08, pol)) + 0.25 * ggxD(nh, 0.02)) * F * saturate(ndl) / (4.0 * vh * vh + 0.05) * (1.0 + 0.35 * pol);
  // glitter: single crystals flashing
  let det: f32 = ja.x * jb.y - ja.y * jb.x; let idet: f32 = det / (det * det + 1e-12);
  // (the cells are as long across the snow as a pixel's footprint is, each way: some six pixels on screen both ways. Sized by the longer
  // side of the footprint alone, as they were, far down the slope a cell was six pixels high and sixty wide: few glints, all standing in
  // rows across the picture, and at speed the shutter drew each row into a line. The cells are laid along the world's x and z (so they
  // stand still as the lens turns) and the longer side is a whole power of two times the shorter)
  let fxz: vec2f = max(abs(ja), abs(jb)); let fsh: f32 = min(fxz.x, fxz.y);
  let lvl: f32 = log2(max(fsh, 0.0004) * 6.0 / 0.004);
  let l0: f32 = floor(lvl); let lf: f32 = lvl - l0;
  let gcs: f32 = 0.004 * exp2(l0); let gcl: f32 = gcs * exp2(clamp(round(log2(max(fxz.x, fxz.y) / max(fsh, 1e-6))), 0.0, 5.0));
  let c0: vec2f = select(vec2f(gcl, gcs), vec2f(gcs, gcl), fxz.x < fxz.y);
  var sp: vec4f = mix(sparkLayer(wxz, c0, N, Hh, ja, jb, idet), sparkLayer(wxz + vec2f(3.7, 9.1), c0 * 2.0, N, Hh, ja, jb, idet), lf);
  // (loose snow, thrown or turned over, is all fresh faces: many more of its crystals flash, and smaller ones)
  if (loose > 0.05) { sp += sparkLayer(wxz + vec2f(7.3, 1.9), c0 * 0.5, N, Hh, ja, jb, idet) * (1.6 * loose); }
  let spFade: f32 = smoothstep(300.0, 20.0, dist);
  col += U.sunCol.rgb * sh * (vec3f(spec) + sp.rgb * (30.0 * U.fx.y * spFade * (1.0 - 0.7 * pol) * (1.0 + 1.5 * loose))) * (1.0 - rock);
  // the crust mirrors the sky it faces as well, the more so the lower the eye: far down the slope the snow takes the colour of the horizon
  // (at dusk, of the afterglow)
  let Rv: vec3f = reflect(-V, N);
  col += skyLut(normalize(vec3f(Rv.x, abs(Rv.y) * 0.5 + 0.03, Rv.z))) * (pow(1.0 - nv, 4.0) * M.p.w * ao * (1.0 - rock) * (1.0 + 0.8 * pol));
  // --- rock
  if (rock > 0.001) {
    // layers along the beds: thin ones a few metres thick inside formations of twenty or thirty. They follow the dip, so they run
    // across a face whatever its steepness (anything mapped from above would smear down it like a curtain)
    let sb: vec4f = tex(tDetail, vec2f((wxz.x - wxz.y) / 1024.0 + 0.37, tau * 0.25 + 0.61));
    let lay: f32 = saturate(0.5 + ((sb.z - 0.5) * 1.7 + (sa.z - 0.5) * 0.9) * mix(1.0, 0.55, smoothstep(500.0, 1600.0, dist)));
    var ra: vec3f = mix(vec3f(0.125, 0.120, 0.128), vec3f(0.31, 0.29, 0.265), lay);
    ra = mix(ra, vec3f(0.29, 0.21, 0.15), smoothstep(0.55, 0.75, sb.z) * 0.35);
    ra = mix(ra, vec3f(0.085, 0.082, 0.09), smoothstep(0.36, 0.22, sb.z) * 0.6) * (0.80 + 0.40 * e1.z);
    // every bed is its own rock: warm grey limestone, dark slate, a rusty iron-stained bed, a pale one. (bed mod 16: what the shader can
    // tell apart; the tone also drifts slowly along each bed)
    let bq: f32 = floor(tau); let bh: f32 = fract(sin((bq - 16.0 * floor(bq / 16.0)) * 78.233 + 1.3) * 43758.547);
    let bt: f32 = saturate(bh + (sa.w - 0.5) * 0.25 + (sb.x - 0.5) * 0.3);
    var tone: vec3f = mix(vec3f(0.60, 0.65, 0.75), vec3f(1.06, 1.00, 0.91), smoothstep(0.18, 0.34, bt));
    tone = mix(tone, vec3f(1.30, 0.97, 0.73), smoothstep(0.58, 0.70, bt));
    tone = mix(tone, vec3f(1.42, 1.37, 1.27), smoothstep(0.86, 0.95, bt));
    ra *= mix(vec3f(1.0), tone, M.pt.x);
    // each bed weathers back a little further than its neighbour: steps across the face that catch the low sun
    let tdir: vec3f = vec3f(0.0, 1.0, 0.0) - N * N.y;
    // (bands, b/c: every thin bed in a band is a step, its top weathered round and turned up to the sky and the sun, its foot cut back
    // into shade: a sawtooth across the band in place of the random tilt; and right under the bench above, where the snow and the
    // top bed hang out over the face, an overhang that neither sun nor sky reaches into)
    // (seven thin beds to a bed, uneven: one thrice the next, and their lie wanders along the face)
    let fr: f32 = fract(tau); let fs: f32 = fract(tau * 7.0 + 0.75 * sin(tau * 6.2831853 + sa.x * 3.0) + (sa.x - 0.5) * 0.9);
    let saw: f32 = (smoothstep(0.0, 0.85, fs) - smoothstep(0.85, 1.0, fs)) * 2.0 - 1.0;
    let ov: f32 = smoothstep(rk.x - 0.10 * rk.y - 0.045, rk.x - 0.015, fr) * (1.0 - smoothstep(rk.x - 0.012, rk.x + 0.01, fr)) * M.pt.x;
    let Nr: vec3f = normalize(N - tdir * mix((sa.y - 0.5) * 1.6 + (sb.y - 0.5) * 1.2, -0.9 * saw + (sa.y - 0.5) * 0.6 - 1.4 * ov, M.pt.x));
    // a face is not one dark stain: snow lies along the lip of every thin bed (white lines across it, broken where the bed is poor), the
    // rock under each lip is in its shadow, and cracks run down through the beds
    let near: f32 = smoothstep(1100.0, 420.0, dist);
    let fb: f32 = fs;
    let lip: f32 = smoothstep(0.80, 0.90, fb) * smoothstep(0.38, 0.56, sb.x + (e1.z - 0.5) * 0.45) * near;
    let under: f32 = smoothstep(0.52, 0.72, fb) * (1.0 - smoothstep(0.80, 0.86, fb)) * near;
    let ck: f32 = tex(tDetail, vec2f((wxz.x + wxz.y) / 43.0, tau * 0.55 + 0.19)).z;
    ra *= (1.0 - 0.42 * under) * (1.0 - 0.45 * smoothstep(0.36, 0.27, ck) * near);
    ra *= (1.0 + 0.25 * M.pt.x) * (1.0 - 0.6 * ov);
    let rc: vec3f = ra * (U.sunCol.rgb * saturate(dot(Nr, L)) * sh * (1.0 - 0.85 * ov) + (U.ambSky.rgb * (1.3 + 0.8 * Nr.y) + U.ambGnd.rgb * (0.50 - 0.45 * Nr.y) + fill * 1.5 + twiLight(Nr)) * ao * (1.0 - 0.6 * ov));
    col = mix(col, rc, rock * (1.0 - 0.9 * lip));
  }
  // distant forest reads as a dark speckled carpet with long shadows
  let carpet: f32 = sm.w * smoothstep(390.0, 470.0, dist);
  if (carpet > 0.001) {
    let sp2: f32 = tex(tNoise, wxz / 61.0).z * 0.5 + d1.z * 0.5;
    let k: f32 = smoothstep(0.30, 0.62, sp2 * (0.55 + sm.w));
    let fc: vec3f = mix(vec3f(0.035, 0.07, 0.06), vec3f(0.25, 0.30, 0.36), 0.35) * (U.sunCol.rgb * 0.35 + amb);
    col = mix(col, fc, k * carpet * 0.85);
  }
  // the blowing snow itself: the same snow as the slope, in the air, lit by the same sun and sky, a little brighter toward the sun where
  // the light comes through it; and its crystals, carried along with it, each one a flash that travels down the slope
  if (dView > 0.002) {
    let trV: f32 = exp(-dView * min(1.0 / max(nv, 0.05), 4.5) * 0.42);
    let lit: vec3f = albedo * (U.sunCol.rgb * ((0.50 + 2.6 * hg(mu, 0.72)) * sh) + amb);
    let fp: vec2f = dpar + vec2f(0.0, U.camPos.w * 9.0);
    let fs: vec4f = mix(sparkLayer(fp, c0, N, Hh, ja, jb, idet), sparkLayer(fp + vec2f(5.3, 2.9), c0 * 2.0, N, Hh, ja, jb, idet), lf);
    col = col * trV + lit * (1.0 - trV) + U.sunCol.rgb * fs.rgb * (sh * 70.0 * U.fx.y * spFade * min(dView * 1.6, 1.0));
  }
  // after dark, the pool of the skier's headlamp: it rakes the snow at a low angle (every ripple shows), and the crystals that happen to
  // face back along the beam flash in it
  if (U.lamp.w > 0.0) {
    let ll: vec3f = lampLight(wp);
    if (ll.x > 0.00002) {
      let Ld: vec3f = normalize(U.lamp.xyz - wp);
      let nl: f32 = saturate((dot(N, Ld) + 0.10) / 1.10);
      let sl: vec4f = sparkLayer(wxz + vec2f(1.3, 7.7), c0, N, normalize(V + Ld), ja, jb, idet);
      // (snow that faces the lamp from close by, the wall of a gully, takes many times what the open slope takes at a grazing angle: the eye
      // and the film both give way there, so it is a bright bank with its relief still in it and not a white disc)
      let lk: f32 = 1.25 / (1.0 + ll.x * nl / 0.45);
      col += ll * (mix(albedo, vec3f(0.16, 0.15, 0.14), rock) * (nl * trW * lk) + sl.rgb * (26.0 * U.fx.y * spFade * (1.0 - rock)));
    }
  }
  col = applyFog(col, wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`,Nt=(()=>{const e={alt:3200,E:22,az:-.2,sunElev:.2,elev:.2,moonElev:.27,moonK:.034,skyline:.027,lutSun:-99,lutMoon:-99,clock:0,cycle:600,night:0,lights:0,stars:0,moonVis:0,milk:1,isMoon:!1,exposure:.145,hiAlt:8600,lampK:0};let s,w,x,F,we;const Y=.2,E=[[0,Y],[70,Y],[185,.075],[240,.034],[258,.012],[320,-.22],[430,-.22],[463,-.03],[483,.06],[525,Y],[600,Y]];e.elevAt=function(b){b=(b%e.cycle+e.cycle)%e.cycle;for(let re=1;re<E.length;re++)if(b<=E[re][0]){const m=E[re-1],J=E[re];let ae=(b-m[0])/(J[0]-m[0]);return re>1&&E[re-2][1]===m[1]&&m[1]!==J[1]?ae=ae*ae*(2-ae):re<E.length-1&&E[re+1][1]===J[1]&&m[1]!==J[1]&&(ae=1-(1-ae)*(1-ae)*(1+ae)),Re(m[1],J[1],ae)}return E[0][1]},e.times={day:0,golden:168,sunset:236,dusk:274,night:345,dawn:454,sunrise:475},e.setClock=function(b){e.clock=b,e.sunElev=e.elevAt(b)},e.init=function(b){s=b,w=s.texture({w:128,h:64,format:"rgba16f",filter:"linear",wrap:"clamp"}),x=s.target({color:w}),e.lut=w,F=s.pipeline({name:"skyLut",lib:[St.common,St.atmo],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",q:"vec4f"},textures:{},depth:!1,depthTest:!1,cull:"none",vs:as,fs:`fn frag(v: VOut) -> FOut { var o: FOut;
        let az: f32 = saturate((v.uv.x - 0.5 / 128.0) * (128.0 / 127.0)) * PI;
        let vv: f32 = saturate(((1.0 - v.uv.y) - 0.5 / 64.0) * (64.0 / 63.0)) * 2.0 - 1.0;
        let el: f32 = sign(vv) * vv * vv * PI * 0.5;
        let se: f32 = M.p.x;
        let sun: vec3f = vec3f(cos(se), sin(se), 0.0);
        let d: vec3f = vec3f(cos(el) * cos(az), sin(el), cos(el) * sin(az));
        var c: vec3f = atmoScatter(vec3f(0.0), d, sun, M.p.y);
        // the same air lit by the moon, which hangs on the sun's bearing
        if (M.q.w > 0.0) { c += atmoScatter(vec3f(0.0), d, vec3f(cos(M.p.z), sin(M.p.z), 0.0), M.p.y) * M.q.rgb; }
        o.color = vec4f(c, 1.0); return o; }`}),we=s.pipeline({name:"sky",lib:[St.common,St.hash,St.fog,Do,on(),co,ho,io,fo,po,uo()],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",nr:"vec4f",nu:"vec4f",nf:"vec4f",sd:"vec4f",mo:"vec4f",hi:"vec4f",fr:"vec4f",pa:"vec4f",pb:"vec4f",pc:"vec4f",cs:"vec4f",ab:"vec4f",ns:"vec4f",wa:"vec4f",wb:"vec4f",wc:"vec4f",wd:"vec4f",we:"vec4f",wf:"vec4f",wg:"vec4f"},textures:{tSky:"2d",tNebA:"2d",tNebB:"2d",tDetail:"2d",tFarA:"2d",tFarB:"2d",tCityA:"2d",tCityB:"2d",tCitySh:"2d",tSeaA:"2d",tSeaB:"2d"},depthFunc:"lequal",depthWrite:!1,cull:"none",vs:"fn vert(a: VIn) -> VOut { var v: VOut; let uv: vec2f = vec2f(f32((a.vid << 1u) & 2u), f32(a.vid & 2u)); v.clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 1.0, 1.0); v.uv = uv; return v; }",fs:`fn frag(v: VOut) -> FOut { var o: FOut;
        let ndc: vec2f = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
        let d: vec3f = normalize(U.camFwd.xyz + U.camRight.xyz * (ndc.x * U.camRight.w * U.camUp.w) + U.camUp.xyz * (ndc.y * U.camRight.w));
        var col: vec3f = skyLut0(vec3f(d.x, max(d.y, 0.0), d.z));
        let mu: f32 = dot(d, U.sunDir.xyz);
        // the haze band at the horizon: milky and bright by day rather than yellow (at sunset it keeps all its colour)
        let hz: f32 = smoothstep(0.16, 0.0, d.y);
        col = mix(col, vec3f(luma(col)) * vec3f(1.03, 1.0, 1.0), 0.55 * hz * U.sunDir.w);
        col = antiSolar(d, col);
        let ang: f32 = acos(clamp(mu, -1.0, 1.0));
        // polariser on the lens: sky light scattered at right angles to the sun is strongly polarised, so the blue deepens away from the sun
        col *= 1.0 - M.p.z * (1.0 - mu * mu) * smoothstep(-0.02, 0.32, d.y);
        let skyL: f32 = luma(col);
        // stars come out as the sky lets them
        // the nebula: by day a pale ghost riding on the blue (scaled with the sky behind it), lost in the haze toward the horizon and in the sun's glare
        let nb: vec4f = nebula(d, U.camPos.w);
        let nbc: vec3f = mix(vec3f(luma(nb.rgb)), nb.rgb, M.p.w);
        // stars come out as the sky lets them; where the nebula glows they sink into it
        if (U.skyP.w > 0.003) { col += stars(d) * (U.skyP.w * smoothstep(-0.01, 0.10, d.y) / (1.0 + 2.5 * luma(nb.rgb) * M.nu.w)); }
        col += nbc * (M.p.x * skyL + M.p.y) * smoothstep(-0.01, 0.15, d.y) * smoothstep(0.04, mix(0.12, 0.26, U.sunDir.w), ang) * U.fx.z * M.nu.w;
        col += moonDisc(d);
        col += meteor(d);
        // high thin cloud in front of all that, and whatever is flying up there
        let ci: vec4f = cirrus(d, mu);
        col = col * (1.0 - ci.a) + ci.rgb;
        let ct: vec4f = contrail(d, mu);
        col = col * (1.0 - ct.a) + ct.rgb;
        // sun disc with limb darkening, and its glare: the air spreads the light well out from the disc, so the sky pales and whitens toward
        // the sun over a good twenty degrees (round the moon there is far less of it)
        let disc: f32 = smoothstep(0.0062, 0.0048, ang) * M.sd.w * smoothstep(-0.002, 0.003, d.y);
        col += M.sd.rgb * U.sunCol.w * disc * (0.55 + 0.45 * sqrt(saturate(1.0 - sq(ang / 0.0062))));
        col += U.sunCol.rgb * (0.9 * exp(-ang * 55.0) + 0.12 * exp(-ang * 9.0) + (0.20 * exp(-ang * 15.0) + M.pc.y * exp(-ang * 4.4)) * (0.2 + 0.8 * M.sd.w));
        // in heavy snow the overcast is drawn over all of that, the sun coming and going through its breaks (05b_weather.js)
        col = overcast(d, mu, col);
        // beyond the mountain, nearest last: ranges on the horizon, the cloud deck, the city standing in it
        col = farRanges(d, col);
        col = mix(col, cloudSea(d, mu, col), smoothstep(0.0, -0.006, d.y));
        { let cb: vec3f = col; col = mix(cityLayer(d, col), cb, M.wf.w); }      // (behind heavy snow only a shape of it: 05b_weather.js)
        // ...and nearer than all of it, a bolt of lightning
        col += bolt(d);
        o.color = vec4f(col, 0.0); return o; }`}),e.pipes=[F,we]};const D=b=>{const re=Math.cos(b);return[Math.sin(e.az)*re,Math.sin(b),-Math.cos(e.az)*re]};e.sunDir=function(){return D(e.elev)},e.trueSun=function(){return D(e.sunElev)},e.moonDir=function(){return D(e.moonElev)};const be=e.moonWay={lo:.105,hi:.42,v:.001,k:.985,at:.27,drift:0,t:null,clock:0,lut:-9};e.moonRate=1,e.moonStep=function(){const b=.5*(be.hi-be.lo),re=Math.asin(be.k),m=qt.time,J=be.t===null?0:e.clock-be.clock,ae=be.t===null?0:m-be.t;be.t=m,be.clock=e.clock,e.sunElev>.115?be.drift=0:Math.abs(J)>3*Math.abs(ae)?be.drift*=Math.exp(-Math.abs(J)/30):J===0&&(be.drift+=ae*e.moonRate);const X=h0-Math.asin(Math.sin(re*(be.at-be.lo-b)/b)/be.k),ke=(e.clock%e.cycle+e.cycle)%e.cycle;e.moonElev=be.lo+b+b*Math.asin(be.k*Math.sin(X+(ke-e.times.night+be.drift)*be.v*re/(b*be.k)))/re,e.isMoon&&(e.elev=e.moonElev),e.sunElev<.06&&Math.abs(e.moonElev-e.lightMoon)>4e-4&&(e.lightElev=void 0),e.moonSky>1e-5&&Math.abs(e.moonElev-be.lut)>.002&&(be.lut=e.moonElev,e.lutSun=-99)};const ht=b=>.2126*b[0]+.7152*b[1]+.0722*b[2],qe=[.635,.795,1.128],se=[.0041,.0052,.0087];e.computeLight=function(){const b=e.sunElev,re=D(b),m=e.E/h0,J=ks.transmit(e.alt,re),ae=ks.irradiance(re,e.alt);if(!e.moonT){const $e=e.moonDir();e.moonT=ks.transmit(e.alt,$e),e.moonIrr=ks.irradiance($e,e.alt)}e.night=ge(0,-.17,b),e.lights=ge(.035,-.09,b),e.stars=ge(-.03,-.16,b),e.moonVis=ge(.11,-.03,b),e.milk=ge(.03,.22,b),e.nebNightK=ge(.02,-.17,b),e.lampK=ge(-.015,-.085,b);const X=ge(e.skyline-.0075,e.skyline+.0075,b);e.isMoon=b<-.05,e.elev=e.isMoon?e.moonElev:b,e.moonSky=e.moonK*ge(.05,-.12,b);const ke=e.moonK*ge(-.05,-.15,b),C=e.moonT.map(($e,nt)=>$e*m*ke*qe[nt]);e.disc=J.map($e=>$e*m),e.sunCol=e.isMoon?C:J.map($e=>$e*m*X);const ne=ge(-.05,-.022,b);e.sunFar=e.isMoon?C:ks.transmit(e.alt+900,re).map($e=>$e*m*ne),e.sunHi=e.isMoon?C:ks.transmit(e.alt+e.hiAlt,re).map($e=>$e*m*ne),e.ambSky=ae.map(($e,nt)=>$e*m+e.moonIrr[nt]*m*e.moonSky*qe[nt]+se[nt]*e.night);{const $e=ht(e.ambSky),nt=e.nightGrey*e.night;e.ambSky=e.ambSky.map(Ke=>Ke+($e-Ke)*nt)}const Be=Math.max(0,Math.sin(e.elev));e.ambGnd=[0,1,2].map($e=>.5*(e.sunCol[$e]*(Be*.9+.2*ge(-.05,.15,Math.sin(e.elev)))+e.ambSky[$e]*.8));{const $e=ks.scatter(D(.02),re,e.alt),nt=ks.scatter(D(.06),re,e.alt);e.twi=[0,1,2].map(Ke=>($e[Ke]+nt[Ke])*.5*e.E*e.twiK)}{const $e=Math.cos(.14),nt=[-Math.sin(e.az)*$e,Math.sin(.14),Math.cos(e.az)*$e];e.anti=[-2.2*b-.02,ge(.115,.035,b)*ge(-.14,-.045,b),ge(.02,-.025,b)*ge(-.22,-.11,b),ht(ks.scatter(nt,re,e.alt))+.004]}const Ee=$e=>.2126*$e[0]+.7152*$e[1]+.0722*$e[2],je=Ee(e.sunCol)*.33+Ee(e.ambSky)*1.9+Ee(e.twi)*.5;e.sceneL=je,e.exposure=it(e.expDay*Math.pow(e.keyL/je,e.expGamma),e.expDay,2.6),e.exposure*=1-e.sunsetStop*ge(.1,.05,b)*ge(-.07,-.02,b),e.exposure*=1-e.nightStop*e.night,e.nd=Math.pow(e.expDay/e.exposure,e.ndGamma)},e.sunsetStop=.3,e.nightStop=.2,e.nightGrey=.36,e.twiK=.5,e.expDay=.145,e.keyL=2.46,e.expGamma=.65,e.ndGamma=.42,e.update=function(){e.moonStep(),(e.lightElev===void 0||Math.abs(e.lightElev-e.sunElev)>4e-4||e.lightAz!==e.az)&&(e.lightElev=e.sunElev,e.lightAz=e.az,e.moonT=e.lightMoon===e.moonElev?e.moonT:null,e.lightMoon=e.moonElev,e.computeLight())},e.bakeLut=function(){return Math.abs(e.lutSun-e.sunElev)<.002&&Math.abs(e.lutMoon-e.moonSky)<6e-4?!1:(e.lutSun=e.sunElev,e.lutMoon=e.moonSky,s.beginPass(x,{color:[0,0,0,1]}),s.draw(F,{u:{p:[e.sunElev,e.alt,e.moonElev,0],q:[qe[0]*e.moonSky,qe[1]*e.moonSky,qe[2]*e.moonSky,e.moonSky>1e-5?1:0]},count:3}),s.endPass(),!0)};const _=e.plane={on:!1,next:55,x:0,z:0,hx:1,hz:0,v:250,t0:0,n:0,len:0,wet:90,cut:0};return e.updatePlane=function(b,re,m,J){if(!_.on){if(b<_.next||e.planes===!1)return;const X=D0(7001+_.n*131),ke=_.n%2?1:-1,C=3e4+16e3*X(),ne=Math.atan2(J[0],-J[2])*.5+(X()-.5)*.3,Be=(X()-.5)*.7,Ee=m[0]+C*Math.sin(ne),je=m[2]-C*Math.cos(ne);_.hx=-ke*Math.cos(Be),_.hz=Math.sin(Be),_.v=330+50*X(),_.wet=26+12*X();const $e=9e3+C*.32;_.x=Ee-_.hx*$e,_.z=je-_.hz*$e,_.t0=b,_.len=60,_.cut=0,_.on=!0,_.n++}const ae=b-_.t0;_.x+=_.hx*_.v*re,_.z+=_.hz*_.v*re,_.len=Math.min(_.len+_.v*re,6e4),ae>_.wet&&(_.cut+=_.v*re),ae>_.wet+62&&(_.on=!1,_.next=b+240+160*ps(_.n*977)*Is)},e.nebDay=.55,e.nebNight=.33,e.nebSat=.45,e.polar=.34,e.glare=.075,Dt.def("moon","夜里的月亮",[["a","月牙"],["b","盈凸"]],"b"),e.draw=function(){L0.updateShadow();const b=Ls.basis(),re=e.moonDir(),m=qt.cam.pos,J=qt.time*.9%1,ae=J<.045||J>.13&&J<.175?1:0,X=Math.pow(Math.max(0,Math.sin(qt.time*4.2)),8),ke=typeof M0<"u"?M0.sky:null,C=ke&&M0.sunK!=null?M0.sunK:1;s.draw(we,{u:{p:[e.nebDay,e.nebNight*e.nebNightK,e.polar*Re(.5,1,e.milk),Re(1,e.nebSat,e.milk)],nr:b.nr,nu:b.nu,nf:b.nf,sd:[e.disc[0],e.disc[1],e.disc[2],e.isMoon?0:1],mo:[re[0],re[1],re[2],e.moonVis],hi:[e.sunHi[0],e.sunHi[1],e.sunHi[2],e.night],fr:[e.sunFar[0]*C,e.sunFar[1]*C,e.sunFar[2]*C,ae+.5*X],pa:_.on?[_.x-m[0],_.z-m[2],e.hiAlt,1]:[0,0,e.hiAlt,0],pb:[_.hx,_.hz,_.len,_.v],pc:[_.cut,e.glare,(Dt.val.moon==="b"?1:0)*e.night,0],cs:[hs.sea.f,hs.sea.oA,hs.sea.oB,0],ab:e.anti,ns:[na.step(qt.time)[0],na.v[1],0,0],wa:ke?ke.wa:[0,0,0,0],wb:ke?ke.wb:[0,0,0,0],wc:ke?ke.wc:[0,0,0,0],wd:ke?ke.wd:[0,0,0,0],we:ke?ke.we:[0,0,0,0],wf:ke?ke.wf:[0,0,0,0],wg:ke?ke.wg:[0,0,0,0]},tex:{tSky:w,tNebA:Ls.texA,tNebB:Ls.texB,tDetail:c0.detail,tFarA:L0.farA,tFarB:L0.farB,tCityA:L0.cityA,tCityB:L0.cityB,tCitySh:L0.shTex,tSeaA:hs.sea.A,tSeaB:hs.sea.B},count:3})},e})(),io=`
// one star's own row of random numbers, read off at its own pace and smoothed from each to the next: an irregular flutter, never a sine
fn starFlick(t: f32, id: f32) -> f32 { let i: f32 = floor(t); let f: f32 = t - i; return mix(hash21(vec2f(i, id)), hash21(vec2f(i + 1.0, id)), f * f * (3.0 - 2.0 * f)); }
fn stars(dw: vec3f) -> vec3f {
  // the whole field turns about the heart of the nebula, which so keeps its place: anticlockwise as you face it (the way the northern sky
  // turns about its pole), once round in just under an hour. What stands to the left of it is going down, at the moon's pace where the moon hangs
  let ax: vec3f = M.nf.xyz; let ra: f32 = U.camPos.w * 0.00181; let rc: f32 = cos(ra); let rs: f32 = sin(ra);
  let d: vec3f = dw * rc + cross(ax, dw) * rs + ax * (dot(ax, dw) * (1.0 - rc));
  let p: vec3f = d * 150.0; let i: vec3f = floor(p); let h: vec3f = hash33(i + vec3f(31.0, 57.0, 11.0));
  // one star in a cell at most, kept clear of its walls (a star is drawn only by its own cell, and the walls would cut its glow square) and
  // close to the sphere the cells are cut from; most cells have none worth drawing
  let cr: vec3f = i + 0.30 + 0.40 * h; let rr: f32 = length(cr);
  if (abs(rr - 150.0) > 0.22) { return vec3f(0.0); }
  let c: vec3f = cr / rr;
  let h2: vec3f = hash33(i + vec3f(7.0, 3.0, 91.0));
  let mag: f32 = h2.x * h2.x; let b: f32 = mag * mag * mag * mag;         // a few bright ones, a great many faint
  if (b < 0.42) { return vec3f(0.0); }
  let s: f32 = (b - 0.42) / 0.58;
  let planet: f32 = step(0.9965, s);                                       // the very brightest few are planets
  let px: f32 = 2.0 * U.camRight.w * U.res.w;                              // one pixel, in radians
  // (never much smaller than a pixel: the field moves now, and a finer point would flash as it crossed from one pixel to the next)
  let sz: f32 = px * (0.68 + 0.44 * s * s + 0.2 * planet);
  let a: vec3f = d - c; let g: f32 = exp(-dot(a, a) / (sz * sz));
  if (g < 0.004) { return vec3f(0.0); }
  // ---- they twinkle because of the air in between. Overhead the light crosses one thickness of it and arrives nearly calm; toward the
  // horizon it crosses many (am), and each star flutters at its own pace: a quick irregular flicker of several hertz riding on slower swells,
  // steeper the lower it stands. The air bends blue more than red, so for a bright star low down the colours arrive a moment apart and it
  // flashes faintly red and blue. A planet is a disc, not a point: its flutter averages out and it shines steadily.
  let am: f32 = 1.0 / (max(dw.y, 0.0) + 0.025);
  let tq: f32 = 1.0 - exp((1.0 - am) * 0.25);
  let tt: f32 = U.camPos.w - 512.0 * floor(U.camPos.w / 512.0); let id: f32 = floor(h2.z * 4096.0);
  let t1: f32 = tt * (7.5 + 6.0 * h.y) + h.x * 97.0;
  let dl: f32 = 0.07 * tq * tq * smoothstep(0.25, 0.70, s) * (1.0 - planet);
  let slow: f32 = starFlick(tt * (1.3 + 1.6 * h2.y) + h.z * 53.0, id + 4096.0) - 0.5;
  let fl: vec3f = vec3f(starFlick(t1 - dl, id), starFlick(t1, id), starFlick(t1 + dl, id)) - 0.5;
  let amp: f32 = mix(0.06, 2.0, tq) * (0.6 + 0.4 * smoothstep(0.0, 0.3, s)) * mix(1.0, 0.12, planet);
  // (log-normal, as the real thing is: brief flashes well above the mean, longer spells below it; the last term keeps the mean where it was)
  let tw: vec3f = min(exp((fl * 1.5 + slow) * amp - 0.09 * amp * amp), vec3f(4.0));
  let tint: vec3f = mix(mix(vec3f(1.0, 0.80, 0.62), vec3f(0.70, 0.84, 1.0), smoothstep(0.15, 0.75, h2.y)), vec3f(1.0, 0.93, 0.80), planet);
  return tint * tw * (g * (0.018 + 0.08 * s + 1.3 * s * s * s * s) * (1.0 + 0.7 * planet));
}
// ---- a shooting star now and then. The night is cut into spans of eight seconds, and in one span out of seven a grain of dust comes in over
// the valley ahead: a head that kindles, brightens as it falls and flares just before it goes out, and the trail it leaves, which cools from
// white to ember and outlives it by a second. All of it follows from the number of the span, so nothing is remembered between frames.
fn meteorLight(u: f32) -> f32 { return smoothstep(0.0, 0.15, u) * (0.45 + 0.55 * smoothstep(0.2, 0.8, u) + 0.9 * exp(-sq((u - 0.88) / 0.06))) * smoothstep(1.0, 0.96, u); }
fn meteor(d: vec3f) -> vec3f {
  let tm: f32 = U.camPos.w; let sl: f32 = floor(tm / 8.0); let n: u32 = u32(i32(sl)) * 3u;
  let h: vec3f = hashu3(n + 77u);
  if (U.skyP.w < 0.25 || h.x > 0.14) { return vec3f(0.0); }
  let g: vec3f = hashu3(n + 78u); let k: vec3f = hashu3(n + 79u);
  let dur: f32 = 0.5 + 0.6 * g.x; let age: f32 = tm - sl * 8.0 - 5.3 * g.y;
  if (age < 0.0 || age > dur + 1.2) { return vec3f(0.0); }
  // E: where it goes out. hd: which way it was heading there (downward, on a slant to one side or the other)
  let az: f32 = (h.y * 2.0 - 1.0) * 0.8; let el: f32 = 0.10 + 0.16 * h.z; let ce: f32 = cos(el);
  let E: vec3f = vec3f(sin(az) * ce, sin(el), -cos(az) * ce); let rt: vec3f = vec3f(cos(az), 0.0, sin(az)); let th: f32 = (g.z * 2.0 - 1.0) * 1.05;
  let hd: vec3f = rt * sin(th) - cross(rt, E) * cos(th);
  let w: f32 = 0.26 + 0.16 * k.x; let L: f32 = w * dur;                     // its speed across the sky (rad/s), and so the length of its path
  let x: f32 = atan2(dot(d, hd), dot(d, E)); let y: f32 = dot(d, cross(E, hd));   // along the path (0 where it goes out), and off to the side of it
  let xh: f32 = min(age, dur) * w - L;                                      // where the head is
  if (x > xh + 0.012 || x < -L - 0.012 || abs(y) > 0.012) { return vec3f(0.0); }
  let px: f32 = 2.0 * U.camRight.w * U.res.w; let wd: f32 = max(0.8 * px, 0.0007);
  let since: f32 = max(age - (x + L) / w, 0.0);                             // how long since the head went by this place
  let tr: f32 = meteorLight(saturate((x + L) / L)) * (0.8 * exp(-since / 0.14) + 0.2 * exp(-since / 0.5)) * exp(-sq(y / wd)) * smoothstep(xh + 0.6 * wd, xh - 0.6 * wd, x);
  let hb: f32 = meteorLight(min(age / dur, 1.0)) * exp(-(sq(x - xh) + y * y) / sq(1.7 * wd));
  let col: vec3f = vec3f(0.85, 1.0, 0.95) * (hb * 4.0) + mix(vec3f(0.70, 0.95, 1.0), vec3f(1.0, 0.62, 0.36), saturate(since / 0.45)) * (tr * 1.6);
  return col * ((0.7 + 0.6 * k.y) * U.skyP.w * smoothstep(0.04, 0.10, d.y));
}
fn moonDisc(d: vec3f) -> vec3f {
  let md: vec3f = M.mo.xyz; let RM: f32 = 0.019;
  let c: f32 = dot(d, md);
  if (M.mo.w <= 0.001 || c < 0.9854) { return vec3f(0.0); }
  let mr: vec3f = normalize(cross(md, vec3f(0.0, 1.0, 0.0))); let mup: vec3f = cross(mr, md);
  let q: vec2f = vec2f(dot(d, mr), dot(d, mup)) / RM; let r2: f32 = dot(q, q); let r: f32 = sqrt(r2);
  let px: f32 = 2.0 * U.camRight.w * U.res.w / RM;
  let edge: f32 = smoothstep(1.0 + px, 1.0 - px, r);
  // ---- its halo. Thin haze drifts across it on two winds (a layer of wisps, a broader one behind: both read from the shared noise where
  // the line of sight meets them, so the moon also travels through them); the haze scatters a soft aureole close round the disc and, further
  // out, one faint ring, bluish within and rusty at its rim. Both swell and fade as the haze thickens and thins: the halo breathes.
  let tm: f32 = U.camPos.w; let hp: vec2f = d.xz / (d.y + 0.30);
  let hv: f32 = 0.45 * texLod(tDetail, hp * 1.3 + tm * vec2f(0.0052, 0.0019), 3.0).z + 0.55 * texLod(tDetail, hp * 0.45 + vec2f(0.37, 0.81) + tm * vec2f(-0.0041, 0.0046), 4.0).z;
  let hz: f32 = clamp(1.0 + 2.6 * (hv - 0.47), 0.35, 1.8);                  // how much haze, against the usual
  let ro: f32 = max(r - 1.0, 0.0);
  var col: vec3f = vec3f(0.62, 0.77, 1.0) * (hz * (0.10 * exp(-ro / (0.5 + 0.45 * hz)) + 0.028 * exp(-ro / (2.0 + hz))));
  col += mix(vec3f(0.60, 0.80, 1.0), vec3f(1.0, 0.66, 0.42), smoothstep(3.8, 5.1, r)) * (0.006 * hz * exp(-sq((r - 4.4) / 0.7)));
  col *= smoothstep(9.0, 6.0, r);
  if (edge > 0.0) {
    let z: f32 = sqrt(max(1.0 - r2, 0.0)); let n: vec3f = vec3f(q.x, q.y, z);
    // the sun is below and beyond it: only the lower limb is lit
    // (by night the moon has swung round, away from the sun far below: it is gibbous and lights the snow as such; at sunset still a crescent)
    let lit: f32 = smoothstep(-0.02, 0.10, dot(n, normalize(mix(vec3f(0.10, -0.80, -0.59), vec3f(0.18, -0.62, 0.76), M.pc.z))));
    let seas: f32 = texLod(tDetail, q * 0.11 + vec2f(0.31, 0.72), 0.0).z; let fine: f32 = texLod(tDetail, q * 0.45 + vec2f(0.6, 0.1), 0.0).w;
    let alb: f32 = (0.55 + 0.45 * smoothstep(0.35, 0.60, seas)) * (0.85 + 0.3 * fine);
    col += (vec3f(1.0, 0.96, 0.88) * (lit * 11.0 * (0.55 + 0.45 * z)) + vec3f(0.50, 0.62, 0.90) * 0.085) * (alb * edge * (1.06 - 0.06 * hz));
  }
  return col * M.mo.w;
}
`,fo=`
fn contrail(d: vec3f, mu: f32) -> vec4f {
  if (M.pa.w <= 0.0 || d.y < 0.012) { return vec4f(0.0); }
  // the trail is a round tube of ice, not a ribbon lying flat: what counts is how near the line of sight passes to its axis
  let u: vec3f = vec3f(M.pb.x, 0.0, M.pb.y); let P0: vec3f = vec3f(M.pa.x, M.pa.z, M.pa.y);
  let bq: f32 = dot(d, u); let den: f32 = max(1.0 - bq * bq, 1e-4);
  let dq: f32 = -dot(d, P0); let eq: f32 = -dot(u, P0);
  let rng: f32 = max((bq * eq - dq) / den, 1.0);                           // how far along the line of sight
  let along: f32 = -(eq - bq * dq) / den;                                  // how far behind the aircraft (m)
  var across: f32 = -dot(P0, normalize(cross(d, u)));
  let px: f32 = rng * 2.0 * U.camRight.w * U.res.w;                        // what one pixel spans up there (m)
  let light: vec3f = M.hi.rgb * (0.55 + 3.0 * hg(mu, 0.72) + 0.5 * hg(mu, 0.2)) + U.ambSky.rgb * 0.6;
  var a: f32 = 0.0;
  if (along > 40.0 + M.pc.x && along < M.pb.z && abs(across) < 2500.0) {
    let age: f32 = along / M.pb.w;                                          // seconds since the aircraft was here
    // the wake rolls the trail into slow waves, and wind aloft shears it out of true
    let wob: vec4f = texLod(tDetail, vec2f(along / 9000.0, 0.37), 0.0);
    across += (wob.x - 0.5) * 2.6 * age + 12.0 * sin(along / 75.0 + wob.z * 6.0) * smoothstep(15.0, 80.0, age);
    // two engines' trails that spread and run together within seconds
    let sep: f32 = 15.0 * exp(-age / 9.0);
    // it spreads as it ages, in long uneven stretches (the air it was laid in is not the same everywhere)
    let n: vec4f = texLod(tDetail, vec2f(along / 26000.0, 0.81), 0.0);
    let w: f32 = (9.0 + 1.5 * age) * (0.7 + 0.6 * n.x);
    let we: f32 = max(w, 0.9 * px);
    let g: f32 = 0.5 * (exp(-sq((across - sep) / we)) + exp(-sq((across + sep) / we))) * (w / we) * mix(1.0, 2.0, exp(-age / 9.0));
    // the edges curl into the wake's slow lobes, and whole stretches thin away where the air is dry
    let lobe: f32 = texLod(tDetail, vec2f(along / 3400.0, across / max(we, 1.0) * 0.11 + 0.5), log2(max(px / 6.6, 1.0))).z;
    let brk: f32 = mix(1.0, (0.25 + 1.25 * smoothstep(0.25, 0.70, n.z)) * (0.6 + 0.8 * lobe), smoothstep(20.0, 140.0, age));
    // looked at along its length there is more of it in the way
    a = (1.0 - exp(-1.5 * g * brk * exp(-age / 27.0) * smoothstep(40.0, 320.0, along - M.pc.x) * smoothstep(M.pb.z, M.pb.z * 0.72, along) / max(sqrt(den), 0.3)));
  }
  a *= smoothstep(0.012, 0.06, d.y);
  var c: vec3f = light * a;
  // the aircraft itself: a fleck of sunlit metal by day, its strobes after dark
  let rh: f32 = M.pa.z / d.y; let pxh: f32 = rh * 2.0 * U.camRight.w * U.res.w;
  let dr: f32 = length(d * rh - P0) / max(pxh * 0.9, 22.0);
  if (dr < 3.0) {
    let k: f32 = exp(-dr * dr) * min(1.0, 22.0 / (pxh * 0.9)) * smoothstep(0.012, 0.05, d.y);
    c += (M.hi.rgb * 2.6 + vec3f(1.0, 0.96, 0.9) * (M.fr.w * 30.0 * M.hi.w) + U.ambSky.rgb) * k;
  }
  return vec4f(c, a);
}
`,b0={deck:950,top:376,k:.75,ta:.4,tb:.9,wind:[28,9],K:1.5,air:26e3},$0=e=>Number.isInteger(e)?e.toFixed(1):String(+e.toFixed(6)),Pa=`
// where in the panorama a point lies: p = its horizontal offset from the eye, drop = how far below the eye (any unit, the same for both)
fn seaUV(p: vec2f, drop: f32) -> vec2f {
  let az: f32 = atan2(p.x, -p.y); let th: f32 = atan2(drop, length(p));
  var v: f32 = min(th / ${$0(b0.ta)}, 1.0);
  for (var i: i32 = 0; i < 4; i++) { let c: f32 = v * v * v; v -= (${$0(b0.ta)} * v + ${$0(b0.tb)} * c * v - th) / (${$0(b0.ta)} + ${$0(4*b0.tb)} * c); }
  return vec2f(0.5 + (az + ${$0(b0.k)} * sin(az)) * 0.15915494, saturate(v));
}
// how far off (m) the cloud seen along d lies: for whatever else must lie on the deck or stand in it (the city's lights, its towers' feet).
// Needs this string in the pipeline's lib and the texture tSeaB bound to Clouds.sea.B
fn seaRange(d: vec3f) -> f32 { return texLod(tSeaB, seaUV(d.xz, max(-d.y, 1e-4)), 0.0).a * 1000.0; }
`,co=Pa+`
fn cloudSea(d: vec3f, mu: f32, haze: vec3f) -> vec3f {
  let dy: f32 = max(-d.y, 1e-4); let f: f32 = M.cs.x; let w: vec2f = vec2f(${$0(b0.wind[0]*b0.K)}, ${$0(b0.wind[1]*b0.K)});
  // how far off the cloud seen this way lies, and so where it stands on the map
  let r0: f32 = seaRange(d);
  let p0: vec2f = d.xz * r0; let dr: f32 = dy * r0;
  // the last key and the next one, each moved to where the wind has carried it by now (or will have: the next one lies a little ahead in time)
  let a: vec4f = texLod(tSeaA, seaUV(p0 - w * M.cs.y, dr), 0.0);
  let b: vec4f = texLod(tSeaB, seaUV(p0 - w * M.cs.z, dr), 0.0);
  let k: vec4f = mix(a, b, f);
  let t: f32 = k.a * 1000.0; let pg: vec2f = d.xz * t;
  // the frame's own light on it; the city's towers lay their shadows across it
  var c: vec3f = (U.sunCol.rgb + U.twi.rgb * 0.8) * (k.r * (1.0 - 0.6 * cityShadow(pg))) + U.ambSky.rgb * k.g + U.ambGnd.rgb * k.b;
  // after dark the city lights the cloud it stands in (the one place where the deck takes light from a spot pg on the map, metres from the eye)
  c += vec3f(1.0, 0.60, 0.28) * (cityGlow(pg) * U.skyP.z * (0.30 + 0.70 * saturate(k.g * 0.45)));
  return mix(haze, c, exp(-t / ${$0(b0.air)}));
}
`,ho=`
fn cirrus(d: vec3f, mu: f32) -> vec4f {
  // a sheet far overhead, bent with the earth so it meets the horizon instead of running off to infinity
  let t: f32 = 1.0 / (max(d.y, 0.0) + 0.10);
  let p: vec2f = d.xz * t + vec2f(-U.skyP.y * 1.1, -U.skyP.y * 0.3);   // (minus: the sheet drifts with the wind below, toward +x)
  let ax: vec2f = vec2f(0.86, 0.50);
  let q: vec2f = vec2f(dot(p, ax), dot(p, vec2f(-ax.y, ax.x)));
  let wv: vec2f = tex(tDetail, q * vec2f(0.045, 0.09) + vec2f(0.21, 0.63)).xy - 0.5;
  let n1: f32 = tex(tDetail, vec2f(q.x * 0.022, q.y * 0.26) + wv * 0.055).z;
  let n2: f32 = tex(tDetail, vec2f(q.x * 0.075, q.y * 0.80) + wv * 0.10 + vec2f(0.37, 0.11)).z;
  let sw: f32 = smoothstep(-0.55, 0.75, mu);
  let cv: f32 = tex(tDetail, q * vec2f(0.012, 0.030) + vec2f(0.55, 0.20)).z;
  let cov: f32 = smoothstep(mix(0.36, 0.40, sw), mix(0.78, 0.60, sw), cv);
  // toward the sun it glows as a veil; away from it the same ice is only seen where it is thickest, so there it is drawn as fibres (combed
  // threads, sharper and sparser), never as a lid over the blue
  let fib: f32 = n1 * 0.62 + n2 * 0.38 + 0.10 * cov;
  let n3: f32 = tex(tDetail, vec2f(q.x * 0.16, q.y * 2.1) + wv * 0.16 + vec2f(0.71, 0.43)).z;
  // (away from the sun every edge is soft at every scale: the fine streaks only modulate the veil, the veil fades in and out over a wide range)
  let thr: f32 = mix(mix(0.25, 1.0, smoothstep(0.30, 0.85, n3)), 1.0, sw);
  let a: f32 = cov * sq(smoothstep(mix(0.34, 0.36, sw), mix(0.86, 0.72, sw), fib)) * thr * smoothstep(0.015, 0.14, d.y) * U.cloudP.z * mix(0.30, 0.62, sw);
  // ice scatters the sunlight it is in toward the eye even opposite the sun (a weak back lobe): high up it keeps the sun after the land has
  // lost it, so at sundown the threads glow gold over the sun and pink over the band opposite. Little sky light, so it never reads grey
  let lit: vec3f = M.hi.rgb * (0.55 + 3.2 * hg(mu, 0.75) + 0.6 * hg(mu, 0.25) + (1.0 + 2.2 * M.ab.y) * hg(-mu, 0.35)) + U.ambSky.rgb * 0.45;
  // thin ice hides little of the sky behind it: it adds its own light and takes away only a part of what is behind (the alpha returned is
  // that part)
  return vec4f(lit * a, a * 0.45);
}
`,po=`
fn antiSolar(d: vec3f, c0: vec3f) -> vec3f {
  var col: vec3f = c0;
  let dh: vec2f = normalize(d.xz + vec2f(1e-5, 0.0)); let sh: vec2f = normalize(U.sunDir.xz + vec2f(1e-5, 0.0));
  let ca: f32 = dot(dh, sh);
  let w: f32 = smoothstep(0.35, -0.85, ca);                     // how far round from the sun (1 opposite it)
  let el: f32 = asin(clamp(d.y, -1.0, 1.0));
  // the pale horizon, carried up
  let hzc: vec3f = skyLut0(vec3f(d.x, 0.035, d.z));
  // (toward a pale clean blue of the horizon's brightness: the table's own horizon is a greenish white, which mixed into the blue reads teal)
  let hzb: vec3f = vec3f(0.80, 0.92, 1.12) * luma(hzc);
  col = mix(col, max(hzb, col), pow(smoothstep(1.2, 0.0, el), 1.4) * mix(0.22, 0.66, w));
  let L: f32 = M.ab.w * U.skyP.x;
  // the earth's shadow: slate blue below its soft edge
  let r: f32 = el - M.ab.x;
  let shd: f32 = smoothstep(0.035, -0.012, r) * M.ab.z * w;
  col = mix(col, vec3f(0.56, 0.68, 1.06) * (L * 0.62), shd);
  // the Belt of Venus over it, densest a few degrees above the edge, melting into the blue by 20 degrees
  let bel: f32 = smoothstep(-0.015, 0.07, r) * exp(-max(r - 0.08, 0.0) / 0.45) * M.ab.y * 0.8 * w;
  col = mix(col, vec3f(1.34, 0.78, 0.92) * (L * 2.4), bel);
  return col;
}
`,M0=(()=>{const e={levels:[["light","小雪"],["heavy","大雪"]],level:"light",k:0,kc:0,ks:0,v:1,hold:null,wind:1,hush:0,gust:0,ramp:7,off:[0,0,0],cloud:[0,0],windNow:[1.2,0,.4],F:0,fl:null,flashes:0,flashAt:-1,ex:null,hole:[.6,0,0,0],cityK:1,cityOut:0},s={a:{sig:.0021,D:900,sky:1.75,hid:[12,34],out:[7,22],thin:.3,flash:[18,44],wind:4.8,gust:.38,flakes:1,seed:77031},b:{sig:.0034,D:760,sky:2.3,hid:[24,58],out:[5,11],thin:.55,flash:[11,30],wind:7.5,gust:.5,flakes:1.35,seed:51137}},w=()=>typeof Dt<"u"&&s[Dt.val.snow]?Dt.val.snow:"a";typeof Dt<"u"&&Dt.def("snow","大雪样式",[["a","阵雪"],["b","暴风雪"]],"a"),e.kind=w,e.KIND=s;const x=["sig","D","sky","wind","gust","flakes"];e.P=Object.assign({},s[w()]);const F=.07,we={};for(const m in s){const J=s[m],ae=D0(J.seed),X=[];let ke=3;for(let C=0;C<160;C++){const ne=Re(J.hid[0],J.hid[1],ae()),Be=Re(J.out[0],J.out[1],ae()),Ee=3.2+2.6*ae(),je=ae()<J.thin?.45+.3*ae():1;X.push({a:ke+ne,out:Be,tr:Ee,deep:je,y:(ae()-.5)*.05}),ke+=ne+Be+2*Ee}we[m]={L:X,T:ke}}function Y(m){if(e.hold!==null)return e.hold<.5?[0,0,.24,1]:[.6,0,.24,0];const J=we[w()],ae=(m%J.T+J.T)%J.T;for(const X of J.L){const ke=X.a+X.out+2*X.tr;if(ae<X.a-9)break;if(ae>ke+9)continue;const C=2*F/X.tr,ne=F+C*X.out/2,Be=X.a+X.tr+X.out/2;return[(ae-Be)*C,X.y,ne,X.deep*ge(X.a-9,X.a-5,ae)*ge(ke+9,ke+5,ae)]}return[.6,0,0,0]}const E=3,D=m=>1-m[3]*ge(m[2]+F,m[2]-F,Math.hypot(m[0],m[1]*E));e.auto=!0,e.next=150,e.rampAuto=30;const be=D0(40961);e.setAuto=function(m){return e.auto=m!==!1,e.auto&&(e.next=(typeof At<"u"?At.t:0)+(e.level==="heavy"?60+60*be():90+120*be())),e.auto};function ht(m){e.next-m>400&&(e.next=m+150),!(!e.auto||m<e.next)&&(e.level=e.level==="heavy"?"light":"heavy",e.next=m+(e.level==="heavy"?60+90*be():150+150*be()))}e.set=function(m,J){return e.levels.some(ae=>ae[0]===m)&&(e.level=m,e.auto=!1,J&&(e.k=m==="heavy"?1:0,e.ex=null,e.mix())),e.level},e.sun=function(m){e.hold=m==null?null:+m,e.hole=Y(At.t),e.v=D(e.hole),e.ex=null},e.mix=function(){e.kc=fs(0,.75,e.k),e.ks=fs(.2,1,e.k)};{const m=typeof location<"u"?location.search:"",J=/[?&]wx=(\w+)/.exec(m);J&&e.set(J[1],!0),/[?&]manual\b/.test(m)&&(e.auto=!1)}const qe=[.7,.82,1];function se(m={}){const J=D0(9001+7919*e.flashes++),ae=qt.cam.fwd,X=Math.atan2(ae[0],-ae[2]),ke={t0:At.t,az:m.az!=null?m.az:X+(J()-.5)*2,el:m.el!=null?m.el:.12+.28*J(),dist:m.dist||900+3600*J()*J(),bolt:m.bolt!=null?!!m.bolt:J()<.42,seed:1+Math.floor(J()*997),st:[]};ke.top=Math.atan2(1300,ke.dist)*(.8+.25*J());const C=m.strokes||2+(J()<.55?1:0);let ne=0;for(let Ee=0;Ee<C;Ee++)ke.st.push([ne,Ee===0?.8+.2*J():.45+.55*J()]),ne+=.05+.09*J();e.fl=ke;const Be=typeof v0<"u"&&v0.rig;return Be&&Be.thunder&&Be.thunder(v0.now()+ke.dist/343,ke.dist,it(Math.sin(ke.az-X)*.8,-.8,.8),ke.bolt),ke}e.flash=function(m){return se(m)};function _(m){const J=e.fl;if(!J)return 0;const ae=m-J.t0;let X=0;for(const[ke,C]of J.st){const ne=ae-ke;ne>=0&&(X+=C*(Math.exp(-ne/.034)+.16*Math.exp(-ne/.18)))}return(ae>2||ae<0)&&(e.fl=null),X}e.update=function(m){const J=At.t,ae=e.P,X=s[w()],ke=1-Math.exp(-m/1.5);for(const Ke of x)ae[Ke]+=(X[Ke]-ae[Ke])*ke;ht(J);const C=e.level==="heavy"?1:0,ne=e.auto?e.rampAuto:e.ramp;e.k!==C&&(e.k=C>e.k?Math.min(C,e.k+m/ne):Math.max(C,e.k-m/ne)),e.mix();const Be=Y(J),Ee=1-Math.exp(-m/.6);for(let Ke=0;Ke<4;Ke++)e.hole[Ke]+=(Be[Ke]-e.hole[Ke])*Ee;e.v=D(e.hole);const je=P0(J*.21,3)*.65+P0(J*.57,4)*.35,$e=Re(1,ae.wind/1.265*(1+ae.gust*je),e.ks),nt=.3218+.16*e.ks*P0(J*.13,5);e.gust=je,e.windNow=[1.265*$e*Math.cos(nt),0,1.265*$e*Math.sin(nt)],typeof At<"u"&&(At.state.wind=e.windNow);for(let Ke=0;Ke<3;Ke++)e.off[Ke]+=e.windNow[Ke]*m;if(e.cloud[0]=(e.cloud[0]+e.windNow[0]*m*4)%6e4,e.cloud[1]=(e.cloud[1]+e.windNow[2]*m*4)%6e4,e.wind=1+.45*e.ks,e.hush=.65*e.ks,e.cityOut=e.kc*Re(.45,.9,typeof Nt<"u"&&Nt.night||0),typeof L0<"u"&&L0.drawLights&&!L0.drawLights.wx){const Ke=L0.drawLights,Fe=function(Ge){const Je=1-e.cityOut,le=L0.lit;if(Je<.995&&le){const Pe={};for(const pe in le)typeof le[pe]=="number"&&(Pe[pe]=le[pe],le[pe]*=Je);try{Ke(Ge)}finally{Object.assign(le,Pe)}}else Ke(Ge)};Fe.wx=!0,L0.drawLights=Fe}if(typeof ns<"u"){e.lampAir0==null&&(e.lampAir0=ns.lampAir,e.shOn0=ns.enabled,e.shGain0=ns.gain),ns.lampAir=e.lampAir0*(1+3*e.ks);const Ke=e.ks*(1-e.v)*(1-(typeof Nt<"u"&&Nt.night||0));e.shOn0?ns.gain=e.shGain0*(1+2*Ke):(ns.enabled=Ke>.01,ns.gain=Ke>.01?e.shGain0*1.1*Ke:e.shGain0)}e.ks>.6?e.flashAt<0?e.flashAt=J+5+7*Ts(e.flashes*31+7):J>=e.flashAt&&!e.fl&&(se(),e.flashAt=J+Re(X.flash[0],X.flash[1],Ts(e.flashes*131+3))):e.flashAt=-1,e.F=_(J)};const b=m=>.2126*m[0]+.7152*m[1]+.0722*m[2],re=[0,0,0,0];return e.sky={wa:re,wb:re,wc:re,wd:re,we:re,wf:re,wg:re},e.veilU=null,e.globals=function(m){const J=e.kc,ae=e.ks,X=e.v,ke=e.P;if(J<1e-4&&e.F<1e-4){e.ex=null,e.sky={wa:re,wb:re,wc:re,wd:re,we:re,wf:re,wg:re},e.veilU=null,e.sunK=1;return}const C=Nt.sunCol,ne=Nt.ambSky,Be=Nt.twi,Ee=Nt.elev,je=Nt.sunFar,$e=Re(1,Re(.85,.07,X),J);e.sunK=$e;const nt=C.map(me=>me*$e),Ke=Math.max(Math.sin(Ee),.03),Fe=[0,1,2].map(me=>je[me]*Ke*.9+ne[me]*1.1),Ge=b(Fe),Je=Fe.map((me,B)=>.56*Re(me,Ge,.75)*[.95,1,1.07][B]);{const me=Nt.night||0,B=b(Je);for(let U=0;U<3;U++)Je[U]=Re(Je[U],B*[.8,.92,1.14][U],.7*me)}const le=Nt.lights*e.cityK;Je[0]+=.0014*le,Je[1]+=.0011*le,Je[2]+=9e-4*le;const Pe=ne.map((me,B)=>Re(me,Je[B]*.5,J)),pe=Be.map(me=>me*(1-.85*J)),c=Math.max(0,Math.sin(Ee)),Ie=[0,1,2].map(me=>.5*(nt[me]*(c*.9+.2*ge(-.05,.15,Math.sin(Ee)))+Pe[me]*.8)),he=b(C)*.33+b(ne)*1.9+b(Be)*.5,H=b(nt)*.33+b(Pe)*1.9+b(pe)*.5,z=Math.pow(he/Math.max(H,1e-6),Re(.78,.35,Nt.night));e.ex=e.ex==null?z:Pt(e.ex,z,.85,qt.dt||1/60);const V=o0.exposure*e.ex;o0.exposure=V;const I=e.F*Re(.13,.2,Nt.night)/V;{const me=(1-.4*J)*(1-J*ge(0,.6,X));o0.flare*=me,o0.burst*=me,o0.ghosts*=me}for(let me=0;me<3;me++)Pe[me]+=qe[me]*I*.5,Ie[me]+=qe[me]*I*.22;m.set([nt[0],nt[1],nt[2],260],u0.sunCol),m.set([Pe[0],Pe[1],Pe[2],V],u0.ambSky),m.set([Ie[0],Ie[1],Ie[2]],u0.ambGnd),m.set([pe[0],pe[1],pe[2],J],u0.twi),m[u0.cloudP+3]=Re(qt.cloudCover,.46,J);const Q=Nt.sunDir(),L=Math.atan2(Q[0],-Q[2]),ye=Math.asin(it(Q[1],-1,1)),Ve=e.hole,Ne=e.fl,Ce=Ne?[Math.sin(Ne.az)*Math.cos(Ne.el),Math.sin(Ne.el),-Math.cos(Ne.az)*Math.cos(Ne.el)]:[0,1,0],Ye=Ne&&Ne.bolt?e.F*7/V:0,T=Re(.72,1,X),Se=Re(1.9,1,fs(.2,.95,J));e.sky={wa:[Je[0]*Se,Je[1]*Se,Je[2]*Se,J],wb:[L+Ve[0]/Math.max(Math.cos(ye),.2),ye+Ve[1],Ve[2],Ve[3]],wc:[C[0],C[1],C[2],F],wd:[Ce[0],Ce[1],Ce[2],I],we:Ne?[Ne.az,Ne.top,Ne.seed,Ye]:re,wf:[.05*le*J,.036*le*J,.024*le*J,e.cityOut],wg:[e.cloud[0]/1500,e.cloud[1]/1500,1.3*ae,0]},e.veilU=ae<.002?null:{a:[ke.sig*ae*T,ke.D,ke.sky*ae*T,ae],b:[Je[0]*1.12+Ie[0]*.08,Je[1]*1.12+Ie[1]*.08,Je[2]*1.12+Ie[2]*.08,0],c:[.03*le*ae,.021*le*ae,.014*le*ae,0],d:[Ce[0],Ce[1],Ce[2],I*ae],e:[(e.off[0]%1024+1024)%1024,0,(e.off[2]%1024+1024)%1024,At.t%1024]},e.share=ae*(ke.flakes/1.35)*Re(.8,1,X)},e.build=function(m,J,ae,X){const{gain:ke,biq:C,chain:ne,H:Be,set:Ee}=X,je=m.sampleRate,$e={},nt=(Ve,Ne,Ce)=>{const Ye=m.createBufferSource();return Ye.buffer=Ve,Ye.loop=!0,Ye.playbackRate.value=Ne,Ye.start(0,Ce),Ye},Ke=()=>m.createStereoPanner?m.createStereoPanner():ke(1),Fe=nt(ae.pink,.91,2.3),Ge=C("highpass",50,.7),Je=C("bandpass",360,.42),le=C("lowpass",1300,.6),Pe=ke(0),pe=nt(ae.lfo,8/je,.031),c=ke(0),Ie=ke(0);ne(Fe,Ge,Je,le,Pe,J),ne(pe,c),c.connect(Pe.gain),pe.connect(Ie),Ie.connect(Je.frequency);const he=nt(ae.white,.97,1.7),H=C("bandpass",480,6),z=C("lowpass",900,.7),V=ke(0),I=ke(0),Q=ke(0);ne(he,H,z,V,J),pe.connect(I),I.connect(V.gain),pe.connect(Q),Q.connect(H.frequency);const L={g:Be(Pe.gain),gd:Be(c.gain),gf:Be(Ie.gain),lp:Be(le.frequency),mg:Be(V.gain),md:Be(I.gain),mf:Be(Q.gain)};$e.update=function(Ve,Ne){const Ce=e.ks,Ye=Ve.run?Ve.speed:0,T=1-.35*ge(10,30,Ye);Ee(L.g,.3*Ce*T,Ne,.6),Ee(L.gd,.17*Ce*T,Ne,.6),Ee(L.gf,110*Ce,Ne,.5),Ee(L.lp,Re(1500,950,e.hush),Ne,.5),Ee(L.mg,.05*Ce*T,Ne,.8),Ee(L.md,.045*Ce*T,Ne,.8),Ee(L.mf,70*Ce,Ne,.8)};const ye=[];for(let Ve=0;Ve<3;Ve++){const Ne=Math.round(je*7.5),Ce=m.createBuffer(2,Ne,je),Ye=D0(3301+Ve*17),T=()=>(Ye()+Ye()+Ye()+Ye()-2)*1.7320508,Se=new Float32Array(Ne),me=10+Math.floor(Ye()*6);for(let oe=0;oe<me;oe++){const fe=(Ve===0?.03:.12)+4.6*Math.pow(Ye(),1.5),O=(.35+.65*Ye())*Math.exp(-fe/2.4),ie=.06+.3*Ye(),ce=.3+1.2*Ye();for(let He=Math.round(fe*je);He<Ne;He++){const We=He/je-fe,Qe=O*(1-Math.exp(-We/ie))*Math.exp(-We/ce);if(We>ce*7)break;Se[He]+=Qe}}const B=1-Math.exp(-It*160/je),U=1-Math.exp(-It*1800/je),A=Math.exp(-It*350/je);for(let oe=0;oe<2;oe++){const fe=Ce.getChannelData(oe);let O=0,ie=0,ce=0,He=0,We=0,Qe=0,st=0;for(let Le=0;Le<Ne;Le++){const r=T();O=O*.996+r*.08,ie+=(O-ie)*B,ce+=(ie-ce)*B;let q=ce*Se[Le]*6;if(Ve===0&&Le<je*.7){Ye()<60/je&&(st+=.6+Ye()),st*=Math.exp(-1/(je*.012)),He+=(r-He)*U;const k=A*(We+He-Qe);We=k,Qe=He,q+=k*st*.5*Math.exp(-Le/(je*.25))}fe[Le]=q}}let a=0;for(let oe=0;oe<2;oe++){const fe=Ce.getChannelData(oe);for(let O=0;O<Ne;O++)a=Math.max(a,Math.abs(fe[O]))}for(let oe=0;oe<2;oe++){const fe=Ce.getChannelData(oe),O=.9/(a||1),ie=Math.round(je*.3);for(let ce=0;ce<Ne;ce++)fe[ce]*=O*(ce>Ne-ie?(Ne-ce)/ie:1)}ye.push(Ce)}return $e.thunder=function(Ve,Ne,Ce,Ye){$e.claps=($e.claps||0)+1;const T=Ne<1600,Se=m.createBufferSource(),me=C("lowpass",Re(1100,260,ge(800,4500,Ne))*(1-.35*e.hush),.6),B=C("lowshelf",120,.7,4),U=ke(it(1500/Ne,.28,1)*(Ye?.95:.75)),A=Ke();Se.buffer=ye[T?0:1+$e.claps%2],Se.playbackRate.value=.86+.2*Ts($e.claps*11+1),A.pan&&(A.pan.value=Ce),ne(Se,me,B,U,A,J),Se.start(Ve)},$e},e})();function uo(){const e=w=>(+w).toFixed(5),s=typeof L0<"u"?L0.cityAz:.14;return`
fn wxAng(a: vec3f, b: vec3f) -> f32 { return acos(clamp(dot(a, b), -1.0, 1.0)); }
fn overcast(d: vec3f, mu: f32, colIn: vec3f) -> vec3f {
  if (M.wa.w < 0.002) { return colIn; }
  // its underside, as a plane over the eye: what lies farther off is seen flatter and its detail packs closer
  let hy: f32 = max(d.y, 0.0) + 0.07;
  let p: vec2f = d.xz / hy;
  let px: f32 = 2.0 * U.camRight.w * U.res.w / (hy * hy);
  let q: vec2f = p * 0.30 - M.wg.xy;
  let l1: f32 = clamp(log2(px * 0.30 * 0.09 * 512.0), 0.0, 7.0);
  let n1: f32 = texLod(tDetail, q * 0.09 + vec2f(0.13, 0.57), l1).z;
  let n2: f32 = texLod(tDetail, q * 0.31 + vec2f(0.71, 0.23) + M.wg.yx * 0.11, l1 + 1.78).z;
  let n3: f32 = texLod(tDetail, q * 1.05 + vec2f(0.37, 0.91), l1 + 3.54).z;
  // (low toward the horizon the deck is seen edge-on and its fine detail packs into thin horizontal strips: there it is softened, so the far
  // cloud reads as a deep soft bank and not as flat panes stacked one over another)
  let soft: f32 = smoothstep(0.0, 0.2, d.y);
  let n: f32 = saturate(0.5 + (n1 - 0.5) * 1.5 + ((n2 - 0.5) * 0.8 + (n3 - 0.5) * 0.35) * mix(0.35, 1.0, soft));
  // the clouds come in from their thickest parts (the switch from a clear sky), and the break drifts past the sun with a ragged edge
  // (kept true right at the sun, so the disc goes in and out with the light on the snow)
  let kc: f32 = M.wa.w;
  // (the edge is wide while the cloud is coming in, so the first of it arrives as soft torn stratus, never a slab with a hard rim)
  let cov: f32 = smoothstep(1.05 - 1.35 * kc, 1.05 - 1.35 * kc + mix(0.75, 0.25, kc) * mix(2.2, 1.0, soft), n + 0.35 * kc);
  let toSun: f32 = acos(clamp(mu, -1.0, 1.0));
  // (a tear, not a porthole: three times longer along the drift than across it, its edge torn at the scale of the cloud's own lumps)
  let el: f32 = asin(clamp(d.y, -1.0, 1.0));
  var dz: f32 = atan2(d.x, -d.z) - M.wb.x; dz = atan2(sin(dz), cos(dz));
  let lc: vec2f = vec2f(dz * cos(el), (el - M.wb.y) * 3.0);
  // (the edge is torn by noise read in angle round the break, the same both ways: a deck's own noise is stretched flat near the horizon and
  // tore the edge into horizontal slats)
  let ra: f32 = texLod(tDetail, vec2f(dz, el) * 1.9 + vec2f(0.29, 0.61) + M.wg.xy * 0.02, 0.0).z;
  let rb: f32 = texLod(tDetail, vec2f(dz, el) * 6.1 + vec2f(0.83, 0.17), 0.0).z;
  let rag: f32 = ((ra - 0.5) * 1.3 + (rb - 0.5) * 0.6 + (n - 0.5) * 0.4) * M.wb.z * smoothstep(0.03, 0.15, toSun);
  let hole: f32 = M.wb.w * smoothstep(M.wb.z + M.wc.w, M.wb.z - M.wc.w, length(lc) + rag);
  // (thickest in front of the sun itself unless a break is there: where the light on the snow says the sun is in, no disc shows through)
  // (and while snow falls there is snow in the break too: what shows through it is a hazed blue, never the deep clear sky)
  let tau: f32 = max(cov * (5.5 + 8.0 * n + 7.0 * smoothstep(0.15, 0.03, toSun)) * (1.0 - hole), M.wg.z);
  // (thick cloud lets nothing of the sky above through, however bright: no stars, nebula or moon show through the overcast at night; only
  // where it thins toward a break does the sky come through, hazed)
  let T: f32 = exp(-tau - 2.0 * kc * max(tau - 2.0, 0.0));
  // its light: the overcast's, darker where it is thicker; the sun soaking through the thin parts round it (brightest just at the edge of a break,
  // the silver lining) and a pale glow round it however thick the cloud; the city's glow underneath at night; a flash lighting it from inside
  var c: vec3f = M.wa.rgb * (1.42 - 0.5 * n) * (0.88 + 0.12 * smoothstep(0.0, 0.4, d.y));
  // (thin cloud is bright, lit through: it only greys as it thickens. While it comes in, before the light below has followed it, it takes the
  // sky's own light, so a new patch is pale and never darker than the sky it crosses)
  c *= mix(1.6, 1.0, saturate(tau / 4.0));
  c = mix(max(c, luma(colIn) * vec3f(0.97, 0.99, 1.03) * 0.92), c, smoothstep(0.35, 0.85, kc));
  // (the sun's light through thin cloud is whitened by it, and in the break itself the glow stays a soft halo: the disc shows through the
  // snow there small, not as a blown ball the size of the break)
  var sg: vec3f = mix(M.wc.rgb, vec3f(luma(M.wc.rgb)), 0.35) * (hg(mu, 0.75) * (0.02 + 0.17 * (1.0 - smoothstep(0.0, 7.0, tau)) * (1.0 - 0.75 * hole)) + 0.008);
  c += sg * min(1.0, 2.0 * luma(M.wa.rgb) / max(luma(sg), 1e-6));
  let az: f32 = atan2(d.x, -d.z) - ${e(s)};
  c += M.wf.rgb * ((0.06 + exp(-abs(atan2(sin(az), cos(az))) / 0.45)) * (0.15 + smoothstep(0.35, 0.0, d.y)));
  c += vec3f(0.78, 0.86, 1.0) * (M.wd.w * (0.7 + 2.6 * exp(-sq(wxAng(d, M.wd.xyz)) / 0.10)) * (0.6 + 0.8 * n));
  // (what shows through a break: the disc itself, but the sky's wide glare round it held to a few times the overcast, as the snow in the
  // break scatters it away; while the cloud is still coming in the clear sky's glare is left as it is)
  let cin: vec3f = mix(colIn, mix(min(colIn, vec3f(luma(M.wa.rgb) * 4.0)), colIn, smoothstep(0.03, 0.008, toSun)), smoothstep(0.3, 0.8, kc));
  return cin * T + c * (1.0 - T);
}
fn boltWalk(x: f32, s: f32) -> f32 { let i: f32 = floor(x); let fr: f32 = x - i; return mix(hash21(vec2f(i, s)), hash21(vec2f(i + 1.0, s)), fr) * 2.0 - 1.0; }
fn boltLine(w: f32, px: f32) -> f32 { return exp(-sq(w / (0.75 * px))) + 0.07 * exp(-abs(w) / (5.0 * px)); }
fn bolt(d: vec3f) -> vec3f {
  if (M.we.w <= 0.0) { return vec3f(0.0); }
  let el: f32 = asin(clamp(d.y, -1.0, 1.0)); let top: f32 = M.we.y; let bot: f32 = -0.035;
  if (el > top + 0.01 || el < bot) { return vec3f(0.0); }
  // the channel, down from the cloud base: kinked every half degree or so, and kinked again on a finer scale (a function of height, so it
  // never doubles back), with a branch forking off it part of the way down
  let s: f32 = M.we.z; let u: f32 = (top - el) / (top - bot);
  let x: f32 = boltWalk(u * 13.0, s) * 0.026 + boltWalk(u * 41.0, s + 7.0) * 0.009 + boltWalk(u * 130.0, s + 3.0) * 0.0028;
  var da: f32 = atan2(d.x, -d.z) - M.we.x - x; da = atan2(sin(da), cos(da));
  let px: f32 = 2.0 * U.camRight.w * U.res.w;
  var b: f32 = boltLine(da * cos(el), px);
  let u0: f32 = 0.22 + 0.25 * hash21(vec2f(s, 5.0));
  if (u > u0 && u < u0 + 0.35) {
    let bx: f32 = (u - u0) * (0.10 * sign(hash21(vec2f(s, 9.0)) - 0.5)) + boltWalk(u * 47.0, s + 11.0) * 0.008 * (u - u0) * 4.0;
    b += 0.45 * boltLine((da - bx) * cos(el), px) * smoothstep(u0 + 0.35, u0 + 0.1, u);
  }
  return vec3f(0.80, 0.88, 1.0) * (b * M.we.w * smoothstep(top + 0.01, top - 0.01, el));
}
`}const N0={smin(e,s,w){const x=Math.max(w-Math.abs(e-s),0)/w;return Math.min(e,s)-x*x*w*.25},smax(e,s,w){const x=Math.max(w-Math.abs(e-s),0)/w;return Math.max(e,s)+x*x*w*.25},sphere(e,s,w,x,F,we,Y){return Math.hypot(e-x,s-F,w-we)-Y},ellipsoid(e,s,w,x,F,we,Y,E,D){const be=(e-x)/Y,ht=(s-F)/E,qe=(w-we)/D,se=Math.hypot(be,ht,qe),_=Math.hypot(be/Y,ht/E,qe/D);return _>1e-9?se*(se-1)/_:-Math.min(Y,E,D)},capsule(e,s,w,x,F,we,Y,E,D,be,ht){const qe=e-x,se=s-F,_=w-we,b=Y-x,re=E-F,m=D-we,J=Math.max(0,Math.min(1,(qe*b+se*re+_*m)/(b*b+re*re+m*m)));return Math.hypot(qe-b*J,se-re*J,_-m*J)-(be+(ht-be)*J)},rbox(e,s,w,x,F,we,Y,E,D,be){const ht=Math.abs(e-x)-Y+be,qe=Math.abs(s-F)-E+be,se=Math.abs(w-we)-D+be;return Math.hypot(Math.max(ht,0),Math.max(qe,0),Math.max(se,0))+Math.min(Math.max(ht,qe,se),0)-be},torusY(e,s,w,x,F,we,Y,E){const D=Math.hypot(e-x,w-we)-Y;return Math.hypot(D,s-F)-E}};function qs(e,s,w,x,F={}){const we=F.stride||4,Y=F.band||0,E=H=>Math.ceil((w[H]-s[H])/x/we)*we+1,D=E(0),be=E(1),ht=E(2),qe=D*be,se=qe*ht,_=new Float32Array(se).fill(NaN),b=H=>s[0]+H*x,re=H=>s[1]+H*x,m=H=>s[2]+H*x;for(let H=0;H<ht;H+=we)for(let z=0;z<be;z+=we)for(let V=0;V<D;V+=we)_[V+z*D+H*qe]=e(b(V),re(z),m(H));const J=we*x*1.75+Y;for(let H=0;H<ht-1;H+=we)for(let z=0;z<be-1;z+=we)for(let V=0;V<D-1;V+=we){let I=1e9,Q=!1,L=!1;for(let ye=0;ye<8;ye++){const Ve=_[V+(ye&1)*we+(z+(ye>>1&1)*we)*D+(H+(ye>>2)*we)*qe];Math.abs(Ve)<I&&(I=Math.abs(Ve)),Ve<0?Q=!0:L=!0}if(!(I>J&&!(Q&&L)))for(let ye=H;ye<=H+we;ye++)for(let Ve=z;Ve<=z+we;Ve++){let Ne=V+Ve*D+ye*qe;for(let Ce=V;Ce<=V+we;Ce++,Ne++)_[Ne]!==_[Ne]&&(_[Ne]=e(b(Ce),re(Ve),m(ye)))}}const ae=new Int32Array(se).fill(-1);let X=new Float32Array(65536),ke=0;const C=new Float32Array(8),ne=[0,1,2,3,4,5,6,7,0,1,2,3],Be=[1,3,3,2,5,7,7,6,4,5,6,7],Ee=[[0,1],[1,3],[2,3],[0,2],[4,5],[5,7],[6,7],[4,6],[0,4],[1,5],[2,6],[3,7]];for(let H=0;H<ht-1;H++)for(let z=0;z<be-1;z++)for(let V=0;V<D-1;V++){const I=V+z*D+H*qe;let Q=0,L=!0;for(let Ye=0;Ye<8;Ye++){const T=_[I+(Ye&1)+(Ye>>1&1)*D+(Ye>>2)*qe];if(T!==T){L=!1;break}C[Ye]=T,T<0&&(Q|=1<<Ye)}if(!L||Q===0||Q===255)continue;let ye=0,Ve=0,Ne=0,Ce=0;for(let Ye=0;Ye<12;Ye++){const T=Ee[Ye][0],Se=Ee[Ye][1],me=C[T],B=C[Se];if(me<0==B<0)continue;const U=me/(me-B);ye+=(T&1)+((Se&1)-(T&1))*U,Ve+=(T>>1&1)+((Se>>1&1)-(T>>1&1))*U,Ne+=(T>>2)+((Se>>2)-(T>>2))*U,Ce++}if(ke*10+10>X.length){const Ye=new Float32Array(X.length*2);Ye.set(X),X=Ye}X[ke*10]=b(V+ye/Ce),X[ke*10+1]=re(z+Ve/Ce),X[ke*10+2]=m(H+Ne/Ce),ae[I]=ke++}const je=x*.5,$e=[0,0,0,0],nt=new Float32Array(ke);for(let H=0;H<ke;H++){const z=X[H*10],V=X[H*10+1],I=X[H*10+2],Q=e(z+je,V-je,I-je),L=e(z-je,V-je,I+je),ye=e(z-je,V+je,I-je),Ve=e(z+je,V+je,I+je);let Ne=Q-L-ye+Ve,Ce=-Q-L+ye+Ve,Ye=-Q+L-ye+Ve;const T=Math.hypot(Ne,Ce,Ye)||1;Ne/=T,Ce/=T,Ye/=T,X[H*10+3]=Ne,X[H*10+4]=Ce,X[H*10+5]=Ye;const Se=nt[H]=Math.min(1,Math.max(0,(T/(4*je)-.45)/.35)),me=Math.max(-je,Math.min(je,(Q+L+ye+Ve)*.25))*.8*Se;X[H*10]-=Ne*me,X[H*10+1]-=Ce*me,X[H*10+2]-=Ye*me}let Ke=new Uint32Array(1<<17),Fe=0;const Ge=(H,z,V,I,Q)=>{if(!(H<0||z<0||V<0||I<0)){if(Fe+6>Ke.length){const L=new Uint32Array(Ke.length*2);L.set(Ke),Ke=L}if(pe(H,z,V,H,V,I)<pe(z,V,I,z,I,H)){const L=H;H=z,z=V,V=I,I=L}Q?(Ke[Fe++]=H,Ke[Fe++]=V,Ke[Fe++]=z,Ke[Fe++]=H,Ke[Fe++]=I,Ke[Fe++]=V):(Ke[Fe++]=H,Ke[Fe++]=z,Ke[Fe++]=V,Ke[Fe++]=H,Ke[Fe++]=V,Ke[Fe++]=I)}},Je=(H,z,V,I)=>{H*=10,z*=10,V*=10;const Q=X[z]-X[H],L=X[z+1]-X[H+1],ye=X[z+2]-X[H+2],Ve=X[V]-X[H],Ne=X[V+1]-X[H+1],Ce=X[V+2]-X[H+2];I[0]=L*Ce-ye*Ne,I[1]=ye*Ve-Q*Ce,I[2]=Q*Ne-L*Ve;const Ye=Math.hypot(I[0],I[1],I[2])||1;I[0]/=Ye,I[1]/=Ye,I[2]/=Ye},le=[0,0,0],Pe=[0,0,0],pe=(H,z,V,I,Q,L)=>(Je(H,z,V,le),Je(I,Q,L,Pe),le[0]*Pe[0]+le[1]*Pe[1]+le[2]*Pe[2]);for(let H=1;H<ht-1;H++)for(let z=1;z<be-1;z++)for(let V=1;V<D-1;V++){const I=V+z*D+H*qe,Q=_[I];if(Q!==Q)continue;const L=Q<0;let ye=_[I+1];ye===ye&&ye<0!==L&&Ge(ae[I-D-qe],ae[I-qe],ae[I],ae[I-D],!L),ye=_[I+D],ye===ye&&ye<0!==L&&Ge(ae[I-1-qe],ae[I-1],ae[I],ae[I-qe],!L),ye=_[I+qe],ye===ye&&ye<0!==L&&Ge(ae[I-1-D],ae[I-D],ae[I],ae[I-1],!L)}const c=new Float32Array(ke*3),Ie=new Uint8Array(ke),he=()=>{c.fill(0);for(let H=0;H<Fe;H+=3){const z=Ke[H]*10,V=Ke[H+1]*10,I=Ke[H+2]*10,Q=X[V]-X[z],L=X[V+1]-X[z+1],ye=X[V+2]-X[z+2],Ve=X[I]-X[z],Ne=X[I+1]-X[z+1],Ce=X[I+2]-X[z+2],Ye=L*Ce-ye*Ne,T=ye*Ve-Q*Ce,Se=Q*Ne-L*Ve;for(const me of[z,V,I]){const B=me/10*3;c[B]+=Ye,c[B+1]+=T,c[B+2]+=Se}}};he();for(let H=0;H<ke;H++){const z=c[H*3],V=c[H*3+1],I=c[H*3+2],Q=Math.hypot(z,V,I);(nt[H]<.5||Q<1e-12||(X[H*10+3]*z+X[H*10+4]*V+X[H*10+5]*I)/Q<.45)&&(Ie[H]=1)}if(F.repair){const H=new Float32Array(ke*4);for(let z=0;z<2;z++){H.fill(0);for(let V=0;V<Fe;V+=3)for(let I=0;I<3;I++){const Q=Ke[V+I];if(Ie[Q])for(let L=1;L<3;L++){const ye=Ke[V+(I+L)%3]*10;H[Q*4]+=X[ye],H[Q*4+1]+=X[ye+1],H[Q*4+2]+=X[ye+2],H[Q*4+3]++}}for(let V=0;V<ke;V++)if(Ie[V]&&H[V*4+3]>0){const I=1/H[V*4+3];X[V*10]=H[V*4]*I,X[V*10+1]=H[V*4+1]*I,X[V*10+2]=H[V*4+2]*I}}he()}for(let H=0;H<ke;H++){let z=c[H*3],V=c[H*3+1],I=c[H*3+2];const Q=Math.hypot(z,V,I);let L=X[H*10+3],ye=X[H*10+4],Ve=X[H*10+5];if(Q>1e-12){z/=Q,V/=Q,I/=Q;const Ne=L*z+ye*V+Ve*I,Ce=Ie[H]?0:nt[H]*Math.min(1,Math.max(0,(Ne-.2)/.5));L=z+(L-z)*Ce,ye=V+(ye-V)*Ce,Ve=I+(Ve-I)*Ce;const Ye=Math.hypot(L,ye,Ve)||1;X[H*10+3]=L/=Ye,X[H*10+4]=ye/=Ye,X[H*10+5]=Ve/=Ye}F.attr&&($e[0]=$e[1]=$e[2]=$e[3]=0,F.attr(X[H*10],X[H*10+1],X[H*10+2],L,ye,Ve,$e),X[H*10+6]=$e[0],X[H*10+7]=$e[1],X[H*10+8]=$e[2],X[H*10+9]=$e[3])}if(F.attr&&F.repair){const H=new Float32Array(ke*5);for(let z=0;z<Fe;z+=3)for(let V=0;V<3;V++){const I=Ke[z+V];if(Ie[I])for(let Q=1;Q<3;Q++){const L=Ke[z+(V+Q)%3];Ie[L]||(H[I*5]+=X[L*10+6],H[I*5+1]+=X[L*10+7],H[I*5+2]+=X[L*10+8],H[I*5+3]+=X[L*10+9],H[I*5+4]++)}}for(let z=0;z<ke;z++)if(Ie[z]&&H[z*5+4]>0){const V=1/H[z*5+4];for(let I=0;I<4;I++)X[z*10+6+I]=H[z*5+I]*V}}return{verts:X.subarray(0,ke*10),idx:Ke.subarray(0,Fe),nv:ke,ni:Fe}}function ma(){const e=[],s=[],w={v:e,idx:s,vert(x,F,we){return e.push(x[0],x[1],x[2],F[0],F[1],F[2],we[0],we[1],we[2],we[3]),e.length/10-1},quad(x,F,we,Y){s.push(x,F,we,x,we,Y)},tri(x,F,we){s.push(x,F,we)},sweep(x,F,we,Y){const E=x[0].length,D=e.length/10;for(const ht of x)for(const qe of ht)w.vert(qe[0],qe[1],F);for(let ht=0;ht<x.length-1;ht++)for(let qe=0;qe<E;qe++){const se=D+ht*E+qe,_=D+ht*E+(qe+1)%E,b=D+(ht+1)*E+(qe+1)%E,re=D+(ht+1)*E+qe;w.quad(se,re,b,_)}const be=(ht,qe,se)=>{const _=[0,0,0];for(const m of x[ht])_[0]+=m[0][0]/E,_[1]+=m[0][1]/E,_[2]+=m[0][2]/E;const b=w.vert(_,se,F),re=e.length/10;for(const m of x[ht])w.vert(m[0],se,F);for(let m=0;m<E;m++){const J=re+m,ae=re+(m+1)%E;qe?w.tri(b,ae,J):w.tri(b,J,ae)}};we&&be(0,!1,we),Y&&be(x.length-1,!0,Y)},merge(x){const F=e.length/10;for(let we=0;we<x.verts.length;we++)e.push(x.verts[we]);for(let we=0;we<x.idx.length;we++)s.push(x.idx[we]+F)},done(){return{verts:new Float32Array(e),idx:new Uint32Array(s),nv:e.length/10,ni:s.length}}};return w}const y0=(()=>{Dt.def("keys","键盘转弯",[["a","按半秒就搓"],["b","按两秒才搓"],["c","横过来才搓"]],"b");const F={u:0,btn:{jump:!1,tuck:!1},jump:!1,tuck:!1,mode:"touch",tiltOK:!1,tiltSeen:-1e9,gx:0,zero:0,keys:{},drag:null,kb:0,kHeld:0,kWas:0,script:null,used:!1};return F.init=function(we){addEventListener("keydown",E=>{E.code!==F.mute&&(F.keys[E.code]=!0)}),addEventListener("keyup",E=>{F.keys[E.code]=!1,E.code===F.mute&&(F.mute=null)}),we.addEventListener("pointerdown",E=>{const D=V0.x(E);F.drag={id:E.pointerId,x0:D,x:D};try{we.setPointerCapture(E.pointerId)}catch(be){}}),we.addEventListener("pointermove",E=>{F.drag&&E.pointerId===F.drag.id&&(F.drag.x=V0.x(E))});const Y=E=>{F.drag&&E.pointerId===F.drag.id&&(F.drag=null)};we.addEventListener("pointerup",Y),we.addEventListener("pointercancel",Y),addEventListener("blur",()=>{F.keys={},F.drag=null})},F.onOrient=function(we){if(we.beta==null||we.gamma==null)return;const Y=we.beta*h0/180,E=we.gamma*h0/180,D=Math.cos(Y)*Math.sin(E),be=-Math.sin(Y);V0.gravity(D)&&F.onFlip&&F.onFlip();const ht=V0.angle();F.gx=ht===90?-be:ht===270?be:ht===180?-D:D,F.zeroPending&&(F.zero=it(F.gx,-.3,.3),F.zeroPending=!1),F.tiltSeen=performance.now(),F.tiltOK=!0},F.requestTilt=async function(){return!1},F.tiltLive=()=>F.tiltOK&&performance.now()-F.tiltSeen<600,F.update=function(we){const Y=(F.keys.ArrowRight||F.keys.KeyD?1:0)-(F.keys.ArrowLeft||F.keys.KeyA?1:0);F.kHeld=Y&&Y===F.kWas?F.kHeld+we:0,F.kWas=Y;const E=Dt.val.keys,D=Y*(zt.s.hdOff||0),be=E==="a"?F.kHeld>.6?ge(1.04,.8,D):0:Math.max(ge(.7,1.05,D),E==="c"?0:ge(1.8,2.6,F.kHeld));F.kb=Pt(F.kb,Y*(.66+.34*be),Y?E==="a"&&be?2.5:6:10,we);let ht=0;if(F.drag)ht=it((F.drag.x-F.drag.x0)/(Math.min(V0.w||innerWidth,(V0.h||innerHeight)*1.4,900)*.2),-1,1),F.mode="touch";else if(F.tiltLive()){const se=F.gx-F.zero;ht=it(R0(se)*Math.max(0,Math.abs(se)-.025)/.4,-1,1),F.mode="tilt"}ht=it(ht+F.kb,-1,1),F.script!=null&&(ht=F.script),Math.abs(ht)>.25&&(F.used=!0),F.u=ht;const qe=F.keys;F.jump=!!(qe.Space||qe.KeyW||qe.ArrowUp||F.btn.jump),F.tuck=!!(qe.ArrowDown||qe.KeyS||F.btn.tuck)},F})(),zt=(()=>{const e={mode:"title",t:0,runT:0,timeScale:1,shake:0,fovKick:0,events:[],onStep:null,dist:0,drop:0,topSpeed:0},s=9.81,w=95,x=420,F=16,we=40,Y=.22,E=-.3,D=7*s,be=14*s,ht=2*s*120,qe=.45,se=.12,_=.3,b=3,re=4,m=.18,J=4,ae=15,X=1/120,ke=.65,C=.27,ne=1.5,Be=3.3,Ee=.14,je=.07,$e=n=>{const d=mt(n/ke);return 1-(1-d)*(1-d)},nt=.95,Ke=.22,Fe=.62,Ge=1.6,Je=9.5,le=6.5,Pe=3.3,pe=4.6,c=e.s={p:[0,0,0],v:[0,0,0],n:[0,1,0],t:[0,0,-1],r:[1,0,0],h:0,e:0,air:!1,airT:0,speed:0,lean:0,leanV:0,beta:0,load:s,aReac:0,aSkid:0,aCarve:0,tuck:0,tuckT:0,powder:.25,landV:0,crash:0,brush:0,u:0,contact:!0,hdot:0,charge:0,tuckIn:0,airK:0,dp:0,leg:0},Ie=()=>{c.charge=c.tuckIn=c.airK=c.dp=c.leg=0,c.betaV=0,c.bite=s,c.jOn=!1,c.jT=0,c.jLock=!0,c.popT=-1,c.popV=0,c.lift=!1,c.dpGo=0,c.owe=0,c.load=s,c.airT=0,c.landV=0,c.off=0,c.hdOff=0};Ie(),e.camL={k:.52,kf:.74,f0:.98,f1:1.18,d0:4.3,d1:3.8,h0:1.35,h1:1.1,wd:1.3,wh:.25,wf:.06};const he={a:[0,0,0,0,0,0,0],b:[.03,.07,.07,.04,.05,.12,.1],c:[.06,.12,.1,.08,.09,.16,.12]},H=.16,z=.14;typeof Dt<"u"&&Dt.def("poles","持杖",[["a","原样"],["b","手在前"],["c","更舒展"]],"b"),typeof Dt<"u"&&Dt.def("motion","人物动作",[["a","原来"],["b","新的"]],"b"),typeof Dt<"u"&&Dt.def("wood","林间镜头",[["a","现在的"],["b","贴近"],["c","原位淡树"]],"b");const V={steeps:[-.2,-.08,0,.06],ridge:[-.35,.03,.12,.32],gully:[-.3,.05,.03,0],glade:[0,0,0,0],bowl:[.15,-.05,0,.34],powder:[.3,-.02,.05,.24],rollers:[-.2,.03,.08,.2],moguls:[.25,-.03,-.02,.14],kickers:[0,0,0,.12]},I=[0,0,0,0],Q={};for(const n in V){const d=V[n];Q[n]=[d[0]*.35,d[1]*.5,d[2]*.5,0]}typeof Dt<"u"&&Dt.def("shots","分段机位",[["a","不变"],["b","按路段大变"],["c","轻微变化"]],"c"),e.titleYaw=-.05;const L=e.cam={pos:[0,3,8],yaw:0,roll:0,fov:1.3,anchor:[0,0,0],pitch:-.2,side:0,gy:0,init:!1,fwd:[0,0,-1]},ye={},Ve={ok:!1},Ne={ok:!1};let Ce=0;e.reset=function(n=14){const d=vt.at(n,ye),M=d.cx,g=-n,R=vt.height(M,g,.5);c.p=[M,R,g],c.v=[0,0,0],c.lean=c.leanV=c.beta=0,c.air=!1,c.speed=0,c.tuck=0,c.crash=0,c.h=R,c.e=0;const Ue=vt.normal(M,g,.35);c.n=[Ue[0],Ue[1],Ue[2]],c.t=[0,0,-1],c.r=[1,0,0],L.init=!1,e.runT=0,e.dist=0,e.drop=0,e.topSpeed=0,e.y0=R,Ce=0,T.init=!1,Ie()};function Ye(n,d){const M=c.p,g=c.v,R=c.n;vt.mogK=qe;const Ue=vt.height(M[0],M[2],.5),$=vt.normal(M[0],M[2],.35);R[0]=$[0],R[1]=$[1],R[2]=$[2],vt.mogK=1;const ve=vt.at(-M[2],ye);c.powder=ve.powder,c.h=Ue,c.u=d;let xe=M[1]-Ue,De=g[0]*R[0]+g[1]*R[1]+g[2]*R[2];xe<E&&(De<0&&(c.owe+=.25*-De,g[0]-=R[0]*De,g[1]-=R[1]*De,g[2]-=R[2]*De,De=0),M[1]=Ue+E,xe=E),c.hdot=-(R[0]*g[0]+R[2]*g[2])/R[1],c.e=xe;const Te=c.air||c.lift?xe<c.leg:xe<Math.min(Y,c.leg+re*n);c.lift=!1,Te?c.leg=xe:(c.leg>m||g[1]<c.hdot&&xe-c.leg>.25)&&(c.leg+=it((m-c.leg)*6,-2,2)*n),c.air&&Te?(c.air=!1,c.landV=Math.max(0,-De),c.owe+=_*Math.pow(Math.max(0,c.landV-b),1.15)*(.85+.5*c.powder),e.events.push({type:"land",v:c.landV,airT:c.airT})):!c.air&&!Te&&(c.air=!0,c.airT=0,e.events.push({type:"takeoff"})),c.air&&(c.airT+=n),c.contact=Te,c.airK=Pt(c.airK,c.air?Re(.55,1,ge(0,.4,xe-c.leg))*ge(.02,.2,c.airT):0,c.air?14:16,n);let Me=g[0]-R[0]*De,rt=g[1]-R[1]*De,wt=g[2]-R[2]*De;const Ze=Math.hypot(Me,rt,wt);let ct=R[0]*R[1],Mt=R[1]*R[1]-1,ft=R[2]*R[1];const dt=Math.hypot(ct,Mt,ft)||1;ct/=dt,Mt/=dt,ft/=dt,Ze<.3?(Me=ct,rt=Mt,wt=ft):(Me/=Ze,rt/=Ze,wt/=Ze);const gt=rt*R[2]-wt*R[1],bt=wt*R[0]-Me*R[2],Xe=Me*R[1]-rt*R[0];c.t[0]=Me,c.t[1]=rt,c.t[2]=wt,c.r[0]=gt,c.r[1]=bt,c.r[2]=Xe,c.speed=Ze;const et=Te&&c.crash<=0,tt=Math.abs(c.lean)<.3&&Math.abs(d)<.6;y0.jump||(c.jLock=!1);let Oe=c.jOn&&!(y0.jump&&!c.jLock);if(y0.jump&&!c.jLock&&(c.jOn=!0,et&&(c.jT+=n),et&&c.jT>.1&&Ze>4)){const Ct=Ze*(Ee+.02);vt.mogK=qe,Oe=Ue-(R[0]*Me+R[2]*wt)/R[1]*Ct-vt.height(M[0]+Me*Ct,M[2]+wt*Ct,.5)>.5,vt.mogK=1,Oe&&(c.jLock=!0)}Oe&&(et&&c.jT>0&&(c.popV=Re(ne,Be,$e(c.jT))*(1+.3*mt((c.load/s-1.1)/.6)),c.popT=0),c.jOn=!1,c.jT=0),c.charge=c.jOn?$e(c.jT):Math.max(0,c.charge-n/.07);let ze=0;if(c.popT>=0){const Ct=c.popT/Ee,Zt=Math.sin(h0*Ct);Ct>=1||!Te?(c.popT=-1,c.lift=Te):(ze=c.popV*2/Ee*Zt*Zt,c.popT+=n)}c.dpGo>0&&Ze>=le&&(c.dpGo=0),c.autoP=et&&Math.abs(c.lean)<.16&&Math.abs(c.beta)<.25&&!c.jOn&&Ze<(c.autoP?pe:Pe);const pt=et&&(tt&&(c.dpGo>0||y0.tuck&&Ze<Je-1)||c.autoP);if(c.dp>0){const Ct=c.dp;Ct<Ke&&!(et&&(tt||c.autoP))?c.dp=Math.max(0,Ct-2*n/nt):(c.dp=Ct+n/nt,Ct<Ke&&c.dp>=Ke&&e.events.push({type:"pole"}),c.dp>=1&&(c.dp=pt?c.dp-1+1e-4:0,pt&&c.dpGo>0&&c.dpGo--))}else pt&&(c.dp=1e-4,c.dpGo>0&&c.dpGo--);let ut=0;if(c.dp>Ke&&c.dp<Fe&&Te){const Ct=Math.sin(h0*(c.dp-Ke)/(Fe-Ke));ut=Ge*Math.max(0,1-Math.pow(Ze/Je,1.5))*2*Ct*Ct/((Fe-Ke)*nt)}c.tuckIn=Pt(c.tuckIn,y0.tuck&&c.dp===0&&c.crash<=0?1:0,5,n);const xt=(-(C*c.charge+je*c.tuckIn)-xe)*R[1];let lt=0;if(Te){if(lt=it(s*R[1]+(xt>0?w*xt+x*xt*xt*xt:w*xt)-(De<0?F:we)*De,0,D),De<0){const Ct=De*De/(2*Math.max(.02,(xe-E-.03)*R[1]));lt=Math.max(lt,Math.min(be,(s*R[1]+Ct)*ge(1.5*s,3*s,Ct)))}ze>0&&(lt=Math.max(lt,s*R[1])+ze)}c.load=it(lt,c.load-.35*ht*n,c.load+ht*n),c.bite=Pt(c.bite,Te?Math.min(lt,2*s):0,Te?J:30,n);const Tt=Math.abs(M[0]-ve.cx)-ve.hw;c.off=Tt;let Et=d,Ut=0;{const Ct=vt.height(M[0]-15,M[2],2)-vt.height(M[0]+15,M[2],2),Zt=vt.height(M[0],M[2]-15,2)-vt.height(M[0],M[2]+15,2),n0=Math.hypot(Ct,Zt),i0=ge(.06,.15,n0/30);Ze>1.5&&i0>0&&(Ut=Math.atan2(g[0],-g[2])-Math.atan2(Ct,-Zt),Ut-=It*Math.round(Ut/It),Ut*=i0,d*Ut>0&&(Et=d*ge(1.3,.8,Math.abs(Ut))))}c.hdOff=Ut;const Xt=s*R[1],_t=Math.min(.96,Math.atan(Math.max(Ze,2.5)**2/(10.5*Xt)))*(1-.3*c.tuckIn),m0=it(Et/.72,-1,1),r0=R0(m0)*Math.pow(Math.abs(m0),1.2)*_t*(c.air&&c.airT>.14?.3:1)*(1-.28*ge(.72,1,Math.abs(d))),Ft=c.air?5:9.5,Lt=.92;c.leanV+=(Ft*Ft*(r0-c.lean)-2*Lt*Ft*c.leanV)*n,c.lean+=c.leanV*n;const yt=R0(d)*ge(.72,1,Math.abs(d))*(1-.8*c.tuckIn)*ge(2.5,6,Ze);{const Ct=Te?ae:9,Zt=yt*Ut>0?Math.max(0,h0/2-Math.abs(Ut)):9,n0=Te?it(yt*.62,-Zt,Zt):0;c.betaV+=(Ct*Ct*(n0-c.beta)-2*Ct*c.betaV)*n,c.beta+=c.betaV*n}let Rt=0,Vt=ut;if(c.aReac=0,c.aSkid=0,c.aCarve=0,Te){const Ct=Re(1,.8,c.powder),Zt=Math.sin(c.beta),n0=Math.cos(c.beta),i0=c.bite*Math.tan(c.lean)*Ct,w0=(.95+.25*c.powder)*c.bite*mt(Math.abs(Zt)/.34)*ge(.5,3,Ze),kt=1.95*c.bite,Ht=it(i0+w0*n0*R0(Zt)*(Zt*Ut>0?ge(1.3,.8,Math.abs(Ut)):1),-kt,kt),Qt=Re(.028,.06,c.powder)+(ve.mog>.01?se*vt.bumps(M[0],M[2]):0),e0=mt(Ze/.6);if(Rt=Ht,Vt-=(w0*Math.abs(Zt)+.05*Math.abs(i0)+Qt*lt)*e0,c.aReac=Ht,c.aSkid=w0,c.aCarve=i0,c.crash>0&&(Vt-=2.5*e0),Tt>0&&(Vt-=(.3+.0022*Ze*Ze)*mt(Tt/16)*(1-.5*Math.max(ve.ridge,mt((ve.rtail-.74)/.26)))*mt(Ze/6)),c.owe>0){const t0=Math.min(c.owe,16*n,Ze);Vt-=t0/n,c.owe-=t0}}const Kt=Math.hypot(g[0],g[1],g[2]),jt=Re(.0036,.0021,Math.max(.55*c.tuck,c.tuckIn))*Kt;let Ot=R[0]*lt+gt*Rt+Me*Vt-jt*g[0],$t=-s+R[1]*lt+bt*Rt+rt*Vt-jt*g[1],Bt=R[2]*lt+Xe*Rt+wt*Vt-jt*g[2];if(Te&&Ze<2.5){const Ct=1.6*(1-Ze/2.5);Ot+=ct*Ct,$t+=Mt*Ct,Bt+=ft*Ct}if(g[0]+=Ot*n,g[1]+=$t*n,g[2]+=Bt*n,M[0]+=g[0]*n,M[1]+=g[1]*n,M[2]+=g[2]*n,c.brush=Math.max(0,c.brush-n*3),c.crash=Math.max(0,c.crash-n),vt.nearTree(M[0],M[2],Ve),Ve.ok&&xe<2.5){const Ct=.14+Ve.h*.012,Zt=Ve.d;if(Zt<Ct+.3&&!Ve.soft){let n0=M[0]-Ve.x,i0=M[2]-Ve.z;const w0=Math.hypot(n0,i0)||1;n0/=w0,i0/=w0;const kt=g[0]*n0+g[2]*i0;kt<0&&(g[0]-=1.5*kt*n0,g[2]-=1.5*kt*i0);const Ht=Math.max(0,-kt);if(g[0]*=.45,g[2]*=.45,M[0]=Ve.x+n0*(Ct+.31),M[2]=Ve.z+i0*(Ct+.31),Math.hypot(g[0],g[2])<3){let Qt=-i0,e0=n0;Qt*ct+e0*ft<0&&(Qt=-Qt,e0=-e0),g[0]+=Qt*1.5,g[2]+=e0*1.5}c.crash<=.2&&e.events.push({type:"crash",v:Ht,x:Ve.x,z:Ve.z,h:Ve.h,r:Ve.r}),c.crash=.9,c.leanV+=(gt*n0+Xe*i0)*4}else if(Zt<Ve.h*.2&&Ze>3){c.brush<=0&&e.events.push({type:"brush",x:Ve.x,z:Ve.z,h:Ve.h,r:Ve.r}),c.brush=1;const n0=1-.28*n;g[0]*=n0,g[2]*=n0;const i0=Ve.h*.115;if(Zt<i0){let w0=M[0]-Ve.x,kt=M[2]-Ve.z;const Ht=Math.hypot(w0,kt)||1;w0/=Ht,kt/=Ht;const Qt=(i0-Zt)*Math.min(1,16*n);M[0]+=w0*Qt,M[2]+=kt*Qt;const e0=g[0]*w0+g[2]*kt;if(e0<0){const t0=Math.min(1,12*n),g0=Math.hypot(g[0],g[2]);let p0=-kt,O0=w0;g[0]*p0+g[2]*O0<0&&(p0=-p0,O0=-O0),g[0]-=e0*(w0+.75*p0)*t0,g[2]-=e0*(kt+.75*O0)*t0;const T0=Math.hypot(g[0],g[2]);T0>g0&&(g[0]*=g0/T0,g[2]*=g0/T0)}}}}}const T=e.pose={init:!1,lean:0,bal:0,edge:0,crouch:.2,tuck:0,air:0,sep:0,headYaw:0,lead:0,stance:.31,fore:0,armL:[0,0,0],armR:[0,0,0],swing:0,liftL:0,liftR:0,pitchL:0,pitchR:0,plantL:0,plantR:0,grabL:0,grabR:0,dp:0,tilt:0,rollL:0,rollR:0},Se=e.root={pos:[0,0,0],fwd:[0,0,-1],nrm:[0,1,0]};e.slowMo=1,e.forceTrick=null;const me=typeof qe<"u"?qe:.34,B=Math.min(typeof re<"u"?re:4,3.4),U=typeof m<"u"?m:Y,A=()=>c.leg!==void 0?c.leg:c.contact?Math.min(c.e,Y):Y,a=e.flight={P:[0,0,0],a:[0,-s,0],q:{},lip:[0,0],last:"",last2:""};function oe(n,d,M,g,R){const Ue=d+"V",$=(n[d]||0)-M,ve=n[Ue]||0,xe=Math.exp(-g*R),De=(ve+g*$)*R;return n[d]=M+($+De)*xe,n[Ue]=(ve-g*De)*xe,n[d]}const fe=(n,d,M,g,R)=>ge(n,d,R)*(1-ge(M,g,R)),O=(n,d,M)=>.5*(n+d+Math.sqrt((n-d)*(n-d)+M*M)),ie=(n,d,M)=>.5*(n+d-Math.sqrt((n-d)*(n-d)+M*M)),ce=(n,d,M)=>{const g=Math.max(M-Math.abs(n-d),0);return Math.max(n,d)+g*g/(4*M)},He=(n,d=.14,M=.24)=>{const g=1/(1-d/2-M/2);return n<=0?0:n>=1?1:n<d?g*n*n/(2*d):n<1-M?g*(n-d/2):1-g*(1-n)*(1-n)/(2*M)};function We(n,d,M,g,R,Ue,$=6){const ve=d+"V",xe=d+"P",De=it((M-n[xe])/Ue,-40,40),Te=n[d]-M,Me=ge(1,.1,Te)*ge(-.3,.3,De-n[ve]);n[xe]=M,n[ve]+=Re(-R*R*Te+2*R*(it(De,g-$,g+$)-n[ve]),-144*Te+24*(De-n[ve]),Me)*Ue,n[d]+=n[ve]*Ue,n[d]<=M&&(n[d]=M,n[ve]=Math.max(n[ve],De))}function Qe(n,d,M,g,R,Ue,$,ve,xe){const De=.03333333333333333;vt.mogK=me;let Te=vt.height(n,M,.5),Me=d-Te-xe,rt=Me>.02,wt=0,Ze=ve;for(;wt<ve;){n+=(g+.5*$[0]*De)*De,d+=(R+.5*$[1]*De)*De,M+=(Ue+.5*$[2]*De)*De,g+=$[0]*De,R+=$[1]*De,Ue+=$[2]*De,wt+=De;const ct=vt.height(n,M,.5);(xe>U||R*De<ct-Te&&d-ct-xe>.25)&&(xe+=it((U-xe)*6,-2,2)*De);const Mt=d-ct-xe;if(Mt>.02)rt=!0;else if(rt&&Mt<=0){Ze=wt-De+De*mt(Me/(Me-Mt));break}else if(!rt&&wt>.3){Ze=0;break}Me=Mt,Te=ct}return vt.mogK=1,Ze}function st(n,d,M){const g=d[0]/M,R=d[2]/M,Ue=M*.05,$=ft=>vt.height(n[0]+g*ft,n[2]+R*ft,.5);vt.mogK=me;let ve=$(0),xe=$(Ue),De=1,Te=!1;for(;De<=9;De++){const ft=$(Ue*(De+1));if(ft-2*xe+ve<-1.15*s*.0025){Te=!0;break}ve=xe,xe=ft}if(!Te){vt.mogK=1;return}let Me=Ue*De,rt=Me+Ue;const wt=(xe-ve)/Ue;for(let ft=0;ft<4;ft++){const dt=.5*(Me+rt);xe+wt*(dt-Ue*De)-$(dt)>.03?rt=dt:Me=dt}vt.mogK=1;const Ze=.5*(Me+rt),ct=n[0]+g*Ze,Mt=n[2]+R*Ze;if(a.lipAge>.3||Math.hypot(ct-a.lip[0],Mt-a.lip[1])>2.5){a.lip[0]=ct,a.lip[1]=Mt;const ft=.0036*M;a.lipAir=Qe(ct,xe+wt*(Ze-Ue*De)+it(c.e,-.1,.1),Mt,d[0],wt*M,d[2],[-ft*d[0],-s,-ft*d[2]],4,c.leg!==void 0?it(c.e,-.1,.1):Y)}a.lipT=((a.lip[0]-n[0])*g+(a.lip[1]-n[2])*R)/M,a.lipAge=0}function Le(n){return n.own=n.c=n.tuck=n.sep=n.head=n.st=n.lead=n.lL=n.lR=n.pL=n.pR=n.gL=n.gR=n.rL=n.rR=n.air=n.fore=n.yaw=n.flip=n.dip=n.ax=n.ay=n.az=n.bx=n.by=n.bz=0,n}const r=(n,d,M,g,R)=>{n.ax-=d*R,n.ay+=M*R,n.az+=g*R,n.bx+=d*R,n.by+=M*R,n.bz+=g*R},q=(n,d,M,g,R,Ue)=>{d<0?(n.ax-=M*Ue,n.ay+=g*Ue,n.az+=R*Ue):(n.bx+=M*Ue,n.by+=g*Ue,n.bz+=R*Ue)};function k(n,d,M,g,R){const Ue=fe(g,g+.16,R-.18,R,d),$=fe(g-.14,g+.08,R-.06,R+.12,d);M<0?(n.gL=Ue,n.lL=.12*$,n.pL=.3*$,n.pR=-.12*$):(n.gR=Ue,n.lR=.12*$,n.pR=.3*$,n.pL=-.12*$),n.c=Math.max(n.c,.93),n.own=Math.max(n.own,$),n.tuck+=.3*$,n.st-=.05*$,q(n,-M,.2,.2,.06,$)}function ee(n,d,M,g,R,Ue){const $=(R+g*He(d))*h0,ve=fe(.02,.2,.7,.95,d);n.yaw=M*$,n.c=Ue,n.own=ve,n.tuck=.12*ve,n.sep=M*.38*fe(0,.18,.28,.55,d),n.head=M*Math.min(Math.ceil((R+g)/2)*It-$,1.15)*(R?1:ge(0,.12,d))}const Z={shifty(n,d,M,g){const R=fe(.03,.36,.54,.94,d);n.yaw=M*g.amp*R,n.sep=-.92*n.yaw,n.c=.5,n.own=fe(0,.2,.72,1,d),n.air=.5*R},twist(n,d,M,g){const R=fe(0,.14,.86,1,d);n.yaw=M*g.amp*.9*Math.sin(It*d)*R,n.sep=-.92*n.yaw,n.c=.45,n.own=fe(0,.15,.8,1,d),n.air=.45*R},tuck(n,d){const M=fe(.04,.34,.58,.93,d);n.c=.97,n.own=M,n.tuck=.3*M,n.st=-.06*M,r(n,-.05,-.16,-.03,M)},spread(n,d){const M=fe(.05,.3,.6,.93,d);n.c=.03,n.own=M,n.st=.7*M,n.air=M,n.fore=.25*M,r(n,.1,.26,.04,M)},eagle(n,d){const M=fe(.06,.32,.56,.8,d);n.c=.02,n.own=fe(0,.22,.78,.97,d),n.st=1.05*M,n.lL=n.lR=.06*M,n.rL=-.62*M,n.rR=.62*M,n.pL=n.pR=.14*M,n.air=M,n.fore=-.15*M,r(n,.24,.3,.1,M)},daffy(n,d,M){const g=fe(.05,.3,.6,.93,d);n.lead=M*.4*g,n.c=.12,n.own=g,n.air=.3*g,M>0?(n.pR=.55*g,n.pL=-.7*g,n.lL=.07*g):(n.pL=.55*g,n.pR=-.7*g,n.lR=.07*g),q(n,-M,0,.04,-.18,g),q(n,M,.04,0,.2,g)},scratch(n,d){const M=fe(.06,.32,.58,.92,d);n.pL=n.pR=-.8*M,n.c=.55,n.own=M,n.fore=.6*M,n.air=.65*M,r(n,.06,.2,.12,M)},grab(n,d,M){k(n,d,M,.2,.8)},180(n,d,M,g){ee(n,d,M,1,g.base||0,.5)},360(n,d,M){ee(n,d,M,2,0,.68)},540(n,d,M){ee(n,d,M,3,0,.8)},720(n,d,M){ee(n,d,M,4,0,.82)},"360grab"(n,d,M){ee(n,d,M,2,0,.7),k(n,d,M,.26,.74)},flip(n,d){const M=fe(.06,.28,.66,.93,d);n.flip=It*He(d,.18,.2),n.c=.92,n.own=fe(.02,.22,.7,.95,d),n.tuck=.3*M,r(n,-.04,-.14,-.03,M)},flipgrab(n,d,M){Z.flip(n,d),n.ax=n.ay=n.az=n.bx=n.by=n.bz=0,k(n,d,M,.24,.76)},pivot(n,d,M){ee(n,d,M,1,1,.3),n.dip=.22*fe(0,.3,.35,.8,d)}},K={180:[.5,1.6,.25],360:[.62,4,.4],540:[1.05,1.4,.8],720:[1.25,2.8,1],shifty:[.34,3,.2],tuck:[.34,2,.2],spread:[.42,2.2,.22],daffy:[.5,2.2,.22],scratch:[.5,1.2,.22],twist:[.66,1.5,.25],grab:[.6,3,.3],"360grab":[.9,3,.8],flip:[.9,2.4,.7],flipgrab:[1.15,2.2,1],eagle:[.75,2.4,.45]},ue=["shifty","tuck","spread","daffy","scratch","grab"];e.tricks=Object.keys(K);let G=D0(Math.random()*4294967296>>>0);e.trickSeed=n=>{G=D0(n>>>0),a.last=a.last2=""};function Ae(n,d,M){if(Le(M),!n)return M;if(n.seq){const g=d<.5?0:1;Z[n.seq[g]](M,d*2-g,g?-n.dir:n.dir,n)}else Z[n.id](M,d,n.dir,n);if(n.k<1){const g=M.c;for(const R in M)M[R]*=n.k;M.c=g}return M}const _e={grab:1,scratch:1,spread:1,tuck:1,daffy:1},at=6,ot={},t={scratch:1,tuck:1,daffy:1},S=()=>e.view==="fp"||e.view==="tips",l=n=>!S()||String(n).split("+").every(d=>t[d]),u=()=>{const n=-a.P[2];for(let d=Math.floor((n-40)/32),M=Math.floor((n+16)/32);d<=M;d++)for(const g of vt.feats.get(d)||[]){if(!g.mark||g.kind!=="kicker")continue;const R=n-g.s;if(!(R<-14||R>g.len+8)&&Math.abs(a.P[0]-vt.at(g.s+g.len,ot).cx-g.u)<g.wid*.5+2.5)return!0}return!1},v=n=>u()?2:n>=.8?1:0,P=n=>/^(180|540)/.test(n);function N(n,d){if(n<.34||d<2&&!e.forceTrick&&a.hopT!=null&&e.t>=a.hopT&&e.t-a.hopT<at)return null;const M=$=>{const ve=parseInt($)/180||0;return{id:$,n:ve,spin:ve>0,base:0,dir:ve&&Math.abs(c.lean)>.12?R0(c.lean):G()<.5?-1:1,amp:.72+.33*G(),min:K[$]?K[$][0]:0}};if(e.forceTrick){const $=String(e.forceTrick).split("+").filter(ve=>Z[ve]);if($.length===2){const ve=M($[0]);return ve.id=$.join("+"),ve.seq=$,ve.spin=!1,ve.n=0,ve.min=0,ve}if($.length){const ve=M($[0]);return ve.min=0,ve}}if(d&&n>=1.1&&G()<.35){const $=ue.filter(Te=>K[Te][0]*.9<=n/2&&l(Te)),ve=$[Math.floor(G()*$.length)],xe=$.filter(Te=>Te!==ve),De=xe[Math.floor(G()*xe.length)];if(ve&&De&&ve+"+"+De!==a.last){const Te=M(ve);return Te.id=ve+"+"+De,Te.seq=[ve,De],Te.min=1,Te}}let g=0;const R=[];for(const $ in K){const ve=K[$][0];if(ve>n||!d&&!_e[$]||d<2&&P($)||!l($))continue;const xe=K[$][1]*mt((n-ve)/.15+.35)*Math.exp(-Math.max(0,n-ve-.15)/K[$][2])*($===a.last?.04:$===a.last2?.4:1);R.push($,xe),g+=xe}let Ue=G()*g;for(let $=0;$<R.length;$+=2)if(Ue-=R[$+1],Ue<=0)return M(R[$]);return R.length?M(R[R.length-2]):null}const de=(n,d,M)=>{const g=v(M);if(d&&d.min<=n&&n-d.U<.25&&(g===2||g&&!P(d.id)||_e[d.id]||e.forceTrick)&&(l(d.id)||e.forceTrick)&&(!e.forceTrick||d.id===String(e.forceTrick)))return d;const R=N(n,g);return R&&(R.U=n,R.big=g,R.k=/\d|flip|grab/.test(R.id)?1:it((R.seq?n/2:n)/.62,.5,1),d&&d.spin&&R.spin&&(R.dir=d.dir)),R};function te(n){a.tr=n,a.ph=0,a.swT=0,n.id!=="pivot"&&!n.base&&(a.last2=a.last,a.last=n.id,e.events.push({type:"trick",id:n.id,dir:n.dir}))}function o(){Object.assign(a,{air:!1,on:!1,t:0,rem:0,pred:0,big:0,w:0,wV:0,wu:0,wuV:0,plL:0,plLV:0,plR:0,plRV:0,kc:0,kcV:0,lipT:9,lipAir:0,lipAge:9,prepL:0,prepLV:0,prep:0,aK:0,mL:0,reach:0,reachV:0,soak:0,soakV:0,hit:0,ph:1,tr:null,plan:null,took:!1,swT:0,tOut:.2,ts:1,tsV:0,since:9,fresh:1,dep:0,trick:"",sw:0,dpK:0,vp:null,tk:0,tkV:0,lean:0,sepB:0,hy:0,hd:0,hdV:0,balG:0,gk:1,rl:0,hold:0,loadP:0,stP:0,pump:0,crashK:0,fy:0,fr:0,Xs:0,sink:0}),e.timeScale=1,Le(a.q)}o();function p(n,d){const M=a.P,g=c.p,R=c.v,Ue=a.q;T.init||o(),M[0]=g[0]+R[0]*Ce,M[1]=g[1]+R[1]*Ce,M[2]=g[2]+R[2]*Ce;const $=Math.hypot(R[0],R[2]),ve=Math.hypot($,R[1]);if(c.air&&!a.air){const Ze=Re(.0036,.0025,c.tuck)*ve;a.a[0]=-Ze*R[0],a.a[1]=-s-Ze*R[1],a.a[2]=-Ze*R[2],a.on=!0,a.took=!1,a.vp=null,a.fresh=.45+.55*ge(1,5,a.since)}else if(!c.air&&a.air){a.on=!1,a.rem=0,a.plan=null,a.mL=1,a.dep>.15&&(a.since=0);const Ze=mt((c.landV-1.5)/9)*(.3+.7*a.big);a.hit=Math.max(a.hit,Ze),e.shake=Math.max(e.shake,.03*Ze),e.fovKick=Math.max(e.fovKick,.08*Ze)}if(a.air=c.air,a.on){if(d&&a.vp){const Ze=d*(e.hs||X),ct=1-Math.exp(-8*Ze);for(let Mt=0;Mt<3;Mt++)a.a[Mt]+=((R[Mt]-a.vp[Mt])/Ze-a.a[Mt])*ct}if(d&&(a.vp=[R[0],R[1],R[2]]),a.t=c.airT+Ce,a.rem=Qe(M[0],M[1],M[2],R[0],R[1],R[2],a.a,4,A()),a.pred=a.t+a.rem,a.big=ge(.25,.45,a.pred),!a.took&&a.t<.25){a.tOut=it(.2*a.pred,.2,.36);const Ze=a.pred-.05-a.tOut,ct=a.tr;if(ct&&ct.id==="pivot")a.took=!0;else if(ct)Ze>=.3&&ct.spin&&ct.base+ct.n&1&&te({id:"180",dir:ct.dir,spin:!0,n:1,base:1,amp:1,min:0,big:2}),a.took=!0;else{const Mt=de(Ze,a.plan,a.pred);Mt&&(te(Mt),a.took=!0,Mt.big<2&&(a.hopT=e.t))}}}a.lipAge+=n,!c.air&&$>5&&e.mode==="run"&&st(M,R,$),a.lipAge>.12&&(a.lipT=9);const xe=!c.air&&a.lipT<.45&&a.lipAir>=.42;xe&&!a.tr&&(a.plan=de(a.lipAir-.05-it(.2*a.lipAir,.2,.36),a.plan,a.lipAir)),!xe&&!c.air&&a.lipAge>.6&&(a.plan=null);const De=a.tr;De&&(De.id==="pivot"?a.ph=Math.min(1,a.ph+n/.5):a.on?a.t>.05&&(a.ph=Math.min(1,a.ph+n*Math.min((1-a.ph)/Math.max(a.rem-a.tOut,.02),6))):a.ph=Math.min(1,a.ph+n*6),Ae(De,a.ph,Ue),a.ph>=1&&!a.on&&(De.spin&&De.base+De.n&1?(a.swT+=n,a.swT>.6&&c.contact&&c.crash<=0&&te({id:"pivot",dir:De.dir,spin:!0,n:1,base:1,amp:1,min:0})):(a.tr=null,Le(Ue)))),a.trick=a.tr?a.tr.id:"",a.sw=a.tr&&a.tr.spin&&a.ph>=1&&a.tr.base+a.tr.n&1?a.tr.dir:0,a.w=mt(oe(a,"w",a.on?a.big*ge(0,.22,a.t)*ge(.02,.3,a.rem):0,30,n)),a.aK=c.airK!==void 0?c.airK:Pt(a.aK,c.air?ge(.02,.2,c.airT):0,c.air?14:16,n),a.mL=Pt(a.mL,0,12,n);{const Ze=xe&&a.lipT>.085?.8*ge(.42,.75,a.lipAir):0;oe(a,"prepL",Ze,Ze>a.prepL?10:24,n),a.prep=1-(1-mt(a.prepL))*(1-(c.charge||0))}oe(a,"reach",a.on?a.big*ge(.4,.12,a.rem):0,a.on?14:22,n),a.hit=Pt(a.hit,0,5,n),oe(a,"soak",a.hit,15,n);{const Ze=a.on?ge(.4,.62,a.pred):xe?ge(.4,.62,a.lipAir)*ge(.4,.12,a.lipT):0;oe(a,"kc",Ze,Ze>0?11:5.5,n)}let Te=0;if(a.on){const Ze=vt.height(M[0],M[2],.5),ct=(vt.height(M[0]+.5,M[2],.5)-Ze)/.5,Mt=(vt.height(M[0],M[2]+.5,.5)-Ze)/.5;if(Te=R[1]-ct*R[0]-Mt*R[2],Te>-.5){let ft=0;const dt=Math.min(a.rem||0,3);for(let gt=0;gt<=dt;gt+=.1)ft=Math.max(ft,M[1]+R[1]*gt-4.905*gt*gt-vt.height(M[0]+R[0]*gt,M[2]+R[2]*gt,.5));a.Hpk=Math.max(a.Hpk||0,ft)}}else a.Hpk=0;const Me=a.on?e.slowMo*.72*Math.pow(ge(1.4,5.5,a.Hpk||0),1.2)*ge(.8,1,a.pred)*a.fresh:0;a.on?a.dep=Me:a.since+=n;const rt=Math.exp(-((Te/3.2)**2)),wt=a.on&&c.crash<=0?1-Me*rt*ge(0,.15,a.t)*ge(.1,.35,a.rem):1;e.timeScale=it(oe(a,"ts",wt,20,n/e.timeScale),.15,1)}function i(n,d,M){n.tcL=n.tcL||0,n.tcR=n.tcR||0;const g=typeof a0<"u"&&a0.world,R=qt.origin;if(!g||!g.seg||!R||M<=0)return;const Ue=Math.max(Math.cos(d.edge||0),.35);for(let $=0;$<2;$++){const ve=g.seg[$][1],xe=(wt,Ze)=>vt.height(wt,Ze,.5)+(typeof F0<"u"&&F0.lift?F0.lift(wt,Ze):0);let De=-1;for(const wt of[0,.04,.08]){const Ze=ve[0]+R[0]+c.v[0]*wt,ct=ve[2]+R[2]+c.v[2]*wt;De=Math.max(De,xe(Ze,ct)-(ve[1]+R[1]+c.v[1]*wt))}De+=.02+.06*(typeof F0<"u"&&F0.deep||0);const Te=$?"tcR":"tcL",Me=n[Te],rt=it(Me+De/(.94*Ue),0,.5);n[Te]=rt>Me?Me+(rt-Me)*(1-Math.exp(-M/.03)):Me+(rt-Me)*(1-Math.exp(-M/.25))}}function y(n){const d=!T.init,M=d?1e6:1,g=n*M;T.init=!0;const R=a.P,Ue=c.v,$=Math.hypot(Ue[0],Ue[2]),ve=Math.hypot($,Ue[1]),xe=a.q,De=a.w,Te=Math.cos(xe.yaw),Me=vt.height(R[0],R[2],.5);let rt=Me;ye.mog>.01&&(vt.mogK=me,rt=vt.height(R[0],R[2],.5),vt.mogK=1),c.hv=Me;const wt=R[1]-Me;a.eV=wt,d||n<=0?(a.sg=rt,a.sgV=0,a.sgP=rt):We(a,"sg",rt,a.sgV,4.5,n);const Ze=a.dpK=Pt(a.dpK,c.dp>0?1:0,14,g);T.dp=c.dp||0,a.crashK=Pt(a.crashK,c.crash,c.crash>a.crashK?25:60,g);const ct=a.crashK,Mt=ge(24,31,ve),ft=!c.air&&ve>15&&Math.abs(c.u)<Re(.12,.55,Mt)&&Math.abs(c.lean)<Re(.14,.4,Mt)&&c.crash<=0&&!(c.dp>0)?1:0;c.tuckT=ft?c.tuckT+n:0,c.tuck=Pt(c.tuck,c.tuckT>.45?1:0,ft?2.5:6,n),T.tuckHi=Pt(T.tuckHi||0,.62*Mt*(1-.5*mt((Math.abs(c.lean)-.4)/.45))*(1-De)*(1-mt(c.crash*5)),3,n),T.tuck=mt(oe(a,"tk",Math.max(Math.max(c.tuck,T.tuckHi)*(1-De),(c.tuckIn||0)*(1-xe.own))*(1-Ze)+xe.tuck+.45*a.soak,11,g)),T.air=.42*De*(1-xe.own)+xe.air;{const Yt=e.stepT||0;Yt!==a.stP&&(a.hold=d?0:ge(200,500,(a.loadP-c.load)/Math.max(Yt-a.stP,X)),a.loadP=c.load,a.stP=Yt)}a.rl=c.load>1.5?(a.rl+n)*(1-a.hold):0,c.load>1.5&&(a.balG=Pt(a.balG,Math.atan2(c.aReac,c.load),Re(12,120,ge(0,.15,a.rl))*(1-a.hold),g)),a.gk=Pt(a.gk,c.load>1.5?1:0,c.load>1.5?10:a.on&&a.t>.14?9:0,g),T.bal=Re(c.lean*.5,a.balG,a.gk);const dt=Re(c.lean,it(T.bal||0,-.92,.92),.8*ge(3,9,ve));a.lean=Pt(a.lean,dt,15,g);const gt=Re(8,30,Math.max(De,mt(ct*5),xe.own)),bt=oe(a,"lnC",a.lean-c.lean,gt,g);a.lb=c.lean+bt,a.lbV=(c.leanV||0)+(a.lnCV||0);{const Yt=a.lbR=d||n<=0?Math.abs(a.lbV):Pt(a.lbR||0,Math.abs(a.lbV),8,n),f0=.8+3.5*Yt+30*Math.max(De,mt(ct*5),xe.own);a.lbF=d||n<=0||a.lbF==null?a.lb:a.lbF+(a.lb-a.lbF)*(1-Math.exp(-It*f0*n)),a.lb=a.lbF}const Xe=a.lb*Te*(1-.7*xe.own*De),et=Math.sin(Xe);T.lean=Xe,T.edge=it(Xe*1.12+c.beta*.25*Te,-1.3,1.3),a.pump=Pt(a.pump,it(c.load/s-1,-1,2),9,g);const tt=oe(a,"pmH",a.pump,10,g);let Oe=it(Math.abs(Xe)*.1+T.tuck*.22+.16*ge(17,30,ve)+.25*ge(0,.25,ct)+.3*a.prepL+(.12+2.7*(U-.08))*a.reach+xe.dip+.09*tt,-.1,.8);const ze=ce(wt-.38*Oe,-.32,.25);if(Oe=a.Xs=(wt-ze)/.38,d)a.l=ze,a.lV=0,a.L=wt,a.LV=0;else if(n>0){const Yt=a.l,f0=a.lV,k0=a.L;let E0=c.air?oe(a,"L",Re(A(),Math.max(.08-.38*(Re(.38,xe.c,xe.own)-Oe),E),De),24,n)-.38*Oe:Math.min(Yt+(f0<0?Math.min(f0+120*n,60*n):Math.min(f0+60*n,B))*n,Y+.03-.38*Oe);E0>=ze&&(E0=ze+Math.max(Yt-a.eH0,0)*Math.exp(-20*n));let q0=Yt+it((E0-Yt)/n,Math.max(f0-120*n,-B),Math.min(f0+120*n,B))*n;q0>ze+.45&&(q0=ze+.45),a.lV=(q0-Yt)/n,a.l=q0,a.L=q0+.38*Oe,a.LV=(a.L-k0)/n}a.eH0=ze,a.sink=Math.max(a.l-ze,0),T.crouch=it(ie(O((.08-a.l)/.38,.03,.1),1,.15),0,1),a.sepB=Pt(a.sepB,-c.beta*.8-a.lean*.22,8,g),a.hy=Pt(a.hy,a.lean*.3+c.beta*.3,6,g);const pt=a.mo=d?Dt.val.motion==="a"?0:1:Pt(a.mo,Dt.val.motion==="a"?0:1,4,n),ut=a.gnd=(1-De)*(1-Ze)*(1-mt(c.crash*5))*ge(3,8,ve)*ge(.3,.8,Te)*(1-.6*ge(.3,1,T.tuck))*(1-mt(Math.abs(xe.yaw)*3)),xt=Yt=>Math.atan2(Math.sin(Yt),Math.cos(Yt)),lt=vt.yawAt(-R[2]),Tt=Math.atan2(Se.fwd[0],-Se.fwd[2]),Et=xt(Tt-lt),Ut=$>1?xt(Math.atan2(Ue[0],-Ue[2])-lt):Et,Xt=oe(a,"sepM",it(-Re(.3,.8,ge(-.04,.04,Et*a.lean*Te))*Et,-.85,.85)*ut,6,g),_t=oe(a,"hdM",it((.35*Ut-.34*Et)*ut-.15*Et*ut,-.7,.7),9,g);T.sep=Re(a.sepB*Te,Xt,pt)+xe.sep-oe(a,"wu",a.plan&&a.plan.spin?a.plan.dir*.3*a.prep:0,20,g),T.headYaw=it(oe(a,"hd",Re(a.hy*Te,_t,pt)+xe.head,16,g),-1.3,1.3),T.lead=.19*et*Math.abs(et)+xe.lead,T.stance=.31+.16*Math.abs(et)+.04*De+xe.st,T.fore=Pt(T.fore,it(-.25*De*(1-xe.own)+xe.fore-.5*a.soak,-1,1),8,g),T.liftL=xe.lL,T.liftR=xe.lR,a.tipUp=Pt(a.tipUp||0,c.contact&&typeof F0<"u"?(F0.deep||0)*Re(.22,.14,ge(5,18,ve))*(1-De):0,5,n),i(a,T,n),T.pitchL=xe.pL,T.pitchR=xe.pR,T.tipL=a.tipUp+a.tcL,T.tipR=a.tipUp+a.tcR,T.rollL=xe.rL,T.rollR=xe.rR,T.grabL=xe.gL,T.grabR=xe.gR;const m0=(Dt.val.poles==="a"?1-mt(T.tuck*3):1-mt((T.tuck-.25)*2.5))*ge(3,7,ve)*(1-a.aK)*(1-mt(c.crash*5))*(1-Ze)*(1-mt(Math.abs(xe.yaw)*3));if(n>0){const Yt=a.lnV=Pt(a.lnV||0,(a.lean-(a.lnP==null?a.lean:a.lnP))/n,25,n);a.lnP=a.lean,a.plT=(a.plT||0)+n;const f0=Math.sign(a.lean);a.plSg||(a.plSg=f0),f0===a.plSg&&(a.plPk=Math.max(a.plPk||0,Math.abs(a.lean)));const k0=a.plSg,E0=f0===k0?a.lean*Yt<0?Math.abs(a.lean/Yt):9:Math.abs(a.lean)<.25?0:9;if(k0&&E0<H){const q0=a.plPk||0;a.plSg=-k0,a.plPk=0,q0>.14&&(a.plS=-k0,a.plT=0,a.plDur=E0+z,a.plK=Re(.62,1,ge(.14,.32,q0)))}}const r0=Yt=>Dt.val.poles==="a"?m0*mt(Yt*c.leanV*.75-.15)*ge(.62,.2,-Yt*c.lean)*ge(.2,.03,Yt*c.lean):a.plS===Yt&&a.plT<(a.plDur||0)?m0*a.plK:0,Ft=(1-ge(.2,.8,T.tuck))*(1-Ze)*(1-a.aK)*(1-mt(c.crash*5))*ge(2,6,ve),Lt=Math.sin(a.lean*Te);{const Yt=he[Dt.val.poles]||he.b;a.ha||(a.ha=Yt.slice());for(let f0=0;f0<7;f0++)a.ha[f0]=Pt(a.ha[f0],Yt[f0],5,g)}const yt=1-Ze,Rt=(-.05*a.prep+.05*a.reach+.04*a.soak)*yt,Vt=(.08*a.prep-.12*a.reach-.16*a.soak)*yt,Kt=(.05*a.reach+.04*a.soak)*yt,jt=typeof a0<"u"&&a0.P0&&"grabL"in a0.P0;for(const Yt of[-1,1]){const f0=Yt<0?"plantL":"plantR",k0=r0(Yt);T[f0]=mt(oe(a,Yt<0?"plL":"plR",k0,k0>(T[f0]||0)?26:18,n*M));const E0=Yt<0?T.armL:T.armR,q0=T[f0],j0=jt?0:Yt<0?xe.gL:xe.gR,Y0=mt(-Yt*Lt*1.6),ls=mt(Yt*Lt*1.6),ss=Ft*(1-j0),is=a.ha;E0[0]=Yt*(.03*q0+Kt-.13*j0+is[0]*ss)+(Yt<0?xe.ax:xe.bx)*yt,E0[1]=.03*q0+Rt-.6*j0+(is[1]+is[3]*Y0+is[5]*ls)*ss+(Yt<0?xe.ay:xe.by)*yt,E0[2]=-.1*q0+Vt+.32*j0-(is[2]+is[4]*Y0+is[6]*ls)*ss+(Yt<0?xe.az:xe.bz)*yt}T.swing=Re(Math.sin(e.t*2.3)*.25+c.leanV*.12,c.leanV*.12+.16*it(a.pump,-1,1)+6*(a.chat||0),pt)*yt,T.tilt=oe(a,"tlt",-.17*a.lean*Te*ge(.08,.6,Math.abs(a.lean))*ut,9,g)*pt;{const Yt=a.lbV||0,f0=Math.abs(a.lb),k0=mt(-a.lb*Yt/1.2)*ge(.04,.3,f0),E0=mt(a.lb*Yt/1.2)*ge(.55,.12,f0),q0=oe(a,"xo",(.13*k0-.17*E0)*ut,11,g);if(n>0){a.wasAir&&!c.air&&(a.ldV=(a.ldV||0)+Math.min(c.landV||0,9)*.2);const Y0=a.ld||0,ls=a.ldV||0,ss=7,is=.3,xs=-ss*ss*Y0-2*is*ss*ls;a.ldV=ls+xs*n,a.ld=Y0+a.ldV*n}a.wasAir=c.air,n>0&&(a.dist=((a.dist||0)+ve*n)%4096);const j0=a.chat=.011*ge(10,30,ve)*(1-De)*(1-.6*(c.powder||0))*(P0(a.dist*.42,31)*.7+P0(a.dist*1.1,37)*.3);T.crouch=it(T.crouch+pt*(q0+(a.ld||0)*(1-De)),0,1);for(const Y0 of[T.armL,T.armR])Y0[1]+=pt*(1.6*j0-.25*(a.ld||0))*yt,Y0[2]-=pt*.4*(a.ld||0)*yt}if(ct>.001){const Yt=Math.sin(ct*22)*ct;T.armL[1]+=.18*ct+.05*Yt,T.armR[1]+=.18*ct-.05*Yt,T.sep+=Yt*.25}const Ot=a.fy=R[1]-a.L;let $t,Bt;if($>1)$t=Ue[0]/$,Bt=Ue[2]/$;else{const Yt=Math.hypot(c.t[0],c.t[2])||1;$t=c.t[0]/Yt,Bt=c.t[2]/Yt}const Ct=a.on?a.rem*ge(.5,.34,a.rem)*ge(0,.12,a.t):0,Zt=R[0]+Ue[0]*Ct,n0=R[2]+Ue[2]*Ct,i0=-Bt,w0=$t,kt=.8,Ht=.45;vt.mogK=me;const Qt=Ct>0?vt.height(Zt,n0,.5):rt,e0=vt.height(Zt-$t*kt,n0-Bt*kt,.5),t0=vt.height(Zt+$t*kt,n0+Bt*kt,.5),g0=vt.height(Zt-i0*Ht,n0-w0*Ht,.5),p0=vt.height(Zt+i0*Ht,n0+w0*Ht,.5);vt.mogK=1;const O0=(Qt-e0)/kt,T0=(t0-Qt)/kt,Z0=.5*(O0+T0),Gt=it($>1?Ue[1]/$:Z0,Math.min(T0,Z0),Math.max(O0,Z0)),us=(p0-g0)/(2*Ht);let B0=-Gt*$t-us*i0,s0=1,A0=-Gt*Bt-us*w0;{const Yt=Math.hypot(B0,s0,A0);B0/=Yt,s0/=Yt,A0/=Yt}let C0=$t,I0=Gt,S0=Bt;{const Yt=Math.hypot(C0,I0,S0);C0/=Yt,I0/=Yt,S0/=Yt}{const Yt=1/(ve||1);let f0=Ue[0]*Yt,k0=Ue[1]*Yt+.1*De,E0=Ue[2]*Yt;const q0=Math.hypot(f0,k0,E0)||1;f0/=q0,k0/=q0,E0/=q0;let j0=-f0*k0,Y0=1-k0*k0,ls=-E0*k0;const ss=Math.hypot(j0,Y0,ls)||1;j0/=ss,Y0/=ss,ls/=ss;const is=a.on?ge(.34,.04,a.rem):a.mL,xs=ve>1?(1-(1-De)*(1-ge(.03,.15,Ot-Me)))*(1-is):0;C0+=(f0-C0)*xs,I0+=(k0-I0)*xs,S0+=(E0-S0)*xs,B0+=(j0-B0)*xs,s0+=(Y0-s0)*xs,A0+=(ls-A0)*xs}oe(a,"fX",C0,30,g),oe(a,"fY",I0,30,g),oe(a,"fZ",S0,30,g),oe(a,"nX",B0,30,g),oe(a,"nY",s0,30,g),oe(a,"nZ",A0,30,g);{const Yt=Math.hypot(a.nX,a.nY,a.nZ)||1;B0=a.nX/Yt,s0=a.nY/Yt,A0=a.nZ/Yt;const f0=a.fX*B0+a.fY*s0+a.fZ*A0;C0=a.fX-B0*f0,I0=a.fY-s0*f0,S0=a.fZ-A0*f0;const k0=Math.hypot(C0,I0,S0)||1;C0/=k0,I0/=k0,S0/=k0}let J0=0,W0=0,rs=0;{const Yt=c.beta+xe.yaw,f0=Math.cos(Yt),k0=Math.sin(Yt),E0=I0*A0-S0*s0,q0=S0*B0-C0*A0,j0=C0*s0-I0*B0;C0=C0*f0+E0*k0,I0=I0*f0+q0*k0,S0=S0*f0+j0*k0}if(xe.flip){const Yt=Math.cos(xe.flip),f0=Math.sin(xe.flip),k0=.98-.38*T.crouch,E0=C0*Yt+B0*f0,q0=I0*Yt+s0*f0,j0=S0*Yt+A0*f0,Y0=B0*Yt-C0*f0,ls=s0*Yt-I0*f0,ss=A0*Yt-S0*f0;J0=(B0-Y0)*k0,W0=(s0-ls)*k0,rs=(A0-ss)*k0,C0=E0,I0=q0,S0=j0,B0=Y0,s0=ls,A0=ss}Se.pos[0]=R[0]+J0,Se.pos[1]=Ot+W0,Se.pos[2]=R[2]+rs,Se.fwd[0]=C0,Se.fwd[1]=I0,Se.fwd[2]=S0,Se.nrm[0]=B0,Se.nrm[1]=s0,Se.nrm[2]=A0,a.fr=Re(Ot,R[1]+.03-.38*Oe,a.kc),!c.contact&&a.sg>a.fr&&a.sg>rt&&(a.sg=Math.max(a.fr,rt),a.sgV=Math.min(a.sgV,Ue[1]))}const j={},W={};function h(n){const d=a.P,M=c.v,g=qt.W/Math.max(1,qt.H),R=g<1,Ue=!L.init;L.init=!0;const $=Ue?1e6:1;Ue&&(L.sp=Math.hypot(M[0],M[1],M[2]),L.spV=0);const ve=oe(L,"sp",Math.hypot(M[0],M[1],M[2]),16,n),xe=ge(6,30,ve),De=a.kc,Te=vt.yawAt(-d[2]),Me=Re(Te,Math.atan2(M[0],-M[2]),ge(.8,2.5,Math.hypot(M[0],M[2])));{const kt=-d[2],Ht=vt.at(kt,j),Qt=Math.abs(d[0]-Ht.cx)-Ht.hw,e0=e.mode==="run"?ge(3,16,Qt)*Re(.2,1,ge(8,3.5,ve)):0;if(oe(L,"lost",Ue?0:e0,e0>(L.lost||0)?1.6:1,n*$),L.lost>.001){const t0=vt.at(kt+30,W),g0=Math.atan2(t0.cx-d[0],30);L.ryaw=0*it(g0-Te,-.3,.3)}}const rt=L.lost||0,wt=Te+rt*(L.ryaw||0);L.cyaw=Pt(L.cyaw==null||Ue?wt:L.cyaw,wt,1.3,n*$),L.yaw=Pt(L.yaw,L.cyaw+it((Me-L.cyaw)*.55*(1-.3*rt),-.7,.7),2.4,n*$),L.side=Pt(L.side,c.lean*.55+c.beta*.5,2.2,n*$),L.roll=Pt(L.roll,-c.lean*.2,5,n*$),L.low=Pt(L.low||0,mt(Math.abs(c.lean)/.8)*(1-De),3,n*$);const Ze=e.camL;{const kt=-d[2],Ht=(vt.at(kt-14,j).baseY-vt.at(kt+14,W).baseY)/28;L.steep=Pt(L.steep||0,ge(.44,.58,Ht),1.2,n*$)}{const kt=-d[2],Ht=vt.at(kt,j),Qt=Math.abs(d[0]-Ht.cx)-Ht.hw,e0=typeof Dt<"u"&&Dt.val.wood!=="b"?0:Math.max(ge(.15,.75,Math.max(Ht.glade,vt.at(kt+ve,W).glade)),ge(4,16,Qt)*ge(.3,.7,Ht.forest));oe(L,"wood",e0,e0>(L.wood||0)?2:.9,n*$),!e0&&L.wood<1e-4&&(L.wood=L.woodV=0)}{const kt=vt.segAt(-d[2]),Ht=!R&&e.mode!=="title"&&typeof Dt<"u"&&(Dt.val.shots==="b"?V[kt.type]:Dt.val.shots==="c"?Q[kt.type]:null)||I,Qt=kt.idx&1?-1:1,e0=1.3;oe(L,"shH",Ht[0],e0,n*$),oe(L,"shF",Ht[1],e0,n*$),oe(L,"shK",Ht[2],e0,n*$),oe(L,"shO",Ht[3]*Qt,e0*.8,n*$),oe(L,"shG",Ht===I||Dt.val.shots!=="b"||kt.type!=="gully"?0:1,e0,n*$)}{let kt=0;const Ht=-d[2];if(!R&&ve>11)for(let p0=Math.floor(Ht/32),O0=Math.floor((Ht+84)/32);p0<=O0;p0++)for(const T0 of vt.feats.get(p0)||[]){if(!T0.mark)continue;const Z0=T0.s+T0.len-Ht,Gt=Math.abs(d[0]-vt.at(T0.s+T0.len,j).cx-T0.u);kt=Math.max(kt,ge(105,70,Z0)*ge(-1,3,Z0)*ge(T0.wid*.5+5,T0.wid*.5+1,Gt)*ge(12,16,ve))}const Qt=a.pred||0,e0=vt.segAt(Ht).type==="kickers",t0=a.on&&!c.contact?Math.max(ge(.85,1.05,Qt),e0?.5*ge(.55,.75,Qt):0):0,g0=t0>0&&t0<.55;if(kt=Math.max(kt,t0),(L.jw||0)<.01&&kt>0){const p0=vt.at(Ht,W);L.jSide=d[0]>p0.cx?-1:1}oe(L,"jw",kt,kt>(L.jw||0)?g0?3.6:1.8:1.4,n*$),oe(L,"ja",t0,t0>(L.ja||0)?g0?6:4:1.6,n*$),L.jw=0,L.ja=0}const ct=L.idle==null?1:L.idle;{let kt=L.yaw+e.titleYaw;if(typeof Nt<"u"&&Nt.sunDir){const Qt=Nt.sunDir(),e0=Math.asin(it(Qt[1],-1,1));let t0=Math.atan2(Qt[0],-Qt[2])-kt;t0=Math.atan2(Math.sin(t0),Math.cos(t0)),kt+=t0*ge(-.03,.03,e0)*ge(1.1,.7,Math.abs(t0))}const Ht=kt+Math.atan(g*Math.tan(L.fov/2)/3);L.tLook=Ue?kt:Pt(L.tLook,kt,2,n),L.tPsi=Ue?Ht:Pt(L.tPsi,Ht,2,n)}const Mt=L.shO+(L.jSide||1)*(.27+.1*(L.ja||0))*L.jw+(R?0:ct*(L.tPsi-L.yaw)),ft=oe(L,"drv",c.dp>0?fe(.22,.36,.5,.7,c.dp):L.launch||0,9,n*$);L.launch=Pt(L.launch||0,0,3.5,n),oe(L,"hA",Ue?0:Math.max(0,a.fr-a.sg),5,n*$);const dt=(R?Re(1.3,1.5,xe):Re(Ze.f0,Ze.f1,xe)+.1*ge(29,41,ve))+.05*De+.035*ft+Ze.wf*L.wood,gt=dt+L.shF;let bt=(R?Re(5.6,5,xe):Re(Ze.d0,Ze.d1,xe))-.75*Math.min(ve,46)/16-.45*L.steep+.3*De+ie(.3*L.hA,1.4,.7)+.12*ft-Ze.wd*L.wood+.7*rt;if(R||(bt+=1*(L.idle==null?1:L.idle)-.8*(L.ja||0)),!R){const kt=ve/16,Ht=(1-Math.tan(Ze.f0/2)/Math.tan(dt/2))*ge(22,32,ve);bt=(bt+kt)*(1-Ht-.08*ge(25,33,ve))*Math.tan(dt/2)/Math.tan(gt/2)-kt}const Xe=(R?Re(1.6,1.3,xe):Re(Ze.h0,Ze.h1,xe))-.3*L.low+.6*L.steep-Ze.wh*L.wood+L.shH-.95*(L.idle==null?1:L.idle)+.6*L.jw*(1-(L.ja||0))+.55*rt,et=L.yaw+Mt,tt=Math.sin(et),Oe=-Math.cos(et),ze=Math.cos(et),pt=Math.sin(et),ut=L.anchor;ut[0]=Pt(ut[0],d[0],16,n*$),ut[2]=Pt(ut[2],d[2],16,n*$),ut[1]=Pt(ut[1],a.fr,9,n*$),L.idle=Pt(L.idle==null?1:L.idle,e.mode==="title"?1:0,1.2,n);const xt=L.idle*1.3*Math.sin(e.t*.12);let lt=ut[0]-tt*bt+ze*(L.side+xt),Tt=ut[2]-Oe*bt+pt*(L.side+xt);{let kt=0;for(let Ht=0;Ht<3;Ht++){const Qt=Ht*1.6,e0=lt+tt*Qt,t0=Tt+Oe*Qt;if(vt.nearTree(e0,t0,Ne),Ne.ok){const g0=Ne.h*.24+.8;if(Ne.d<g0){const p0=((e0-Ne.x)*ze+(t0-Ne.z)*pt>=0?1:-1)*(g0-Ne.d)*(1-Ht*.22);Math.abs(p0)>Math.abs(kt)&&(kt=p0)}}}L.dodge=0,kt=0,lt+=ze*L.dodge,Tt+=pt*L.dodge}const Et=vt.height(lt,Tt,2),Ut=vt.bumps(lt,Tt),Xt=oe(L,"mF",.8*Ut*ge(0,.5,De),5,n*$);if(Ue&&(L.dip=0,L.dipV=0,L.fk=0,L.fkV=0,L.shk=0),Ue||n<=0)L.gy=Et,L.gv=0,L.tPrev=Et,L.hOff=Xe,L.ys=d[1],L.yv=M[1],L.oS=Et+Xe-d[1],L.fl=L.flP=Et+.7+Xt,L.flV=0,L.hA=0,L.hAV=0;else{const kt=Et+.7+Xt;We(L,"fl",kt,L.flV,4.5,n,3);const Ht=Et+ge(0,.3,De)*(L.fl-kt),Qt=7.5,e0=it((Ht-L.tPrev)/n,-40,40);L.tPrev=Ht,L.gv+=(Qt*Qt*(Ht-L.gy)+2*Qt*(e0-L.gv))*n,L.gy+=L.gv*n;const t0=3.6;L.yv+=(t0*t0*(d[1]-L.ys)+2*t0*(M[1]-L.yv))*n,L.ys+=L.yv*n}const _t=it(.45*(Math.max(vt.height(lt+ze*7,Tt+pt*7,2),vt.height(lt-ze*7,Tt-pt*7,2))-Et-.5),0,2.4);L.bank=Pt(L.bank||0,_t*(1-.7*(L.shG||0)),2.2,n*$),L.hOff=Pt(L.hOff,Xe+L.bank+.25*Ut,2.5,n*$),L.oS=Pt(L.oS,Re(L.gy+L.hOff-L.ys,Re(1.25,.05-.55*(L.ja||0),ge(.5,2,a.fr-a.sg)),ge(.05,.6,De)),5,n*$),oe(L,"dip",a.soak,12,n*$);const m0=O(L.ys+L.oS,L.gy+.7+Xt,1.2+.2*L.hA);L.pos[0]=lt,L.pos[2]=Tt,L.pos[1]=ce(Re(L.gy+L.hOff,m0,De)-.3*L.dip,L.fl,.4);{const kt=a.fr+.55-4*De*De,Ht=L.pos[1];L.pos[1]=.5*(Ht+kt+Math.sqrt((Ht-kt)*(Ht-kt)+.09))}oe(L,"fk",e.fovKick,14,n),L.fovB=Pt(Ue?gt:L.fovB,gt,3,n*$),L.fov=L.fovB+L.fk;const r0=Math.hypot(d[0]-L.pos[0],d[2]-L.pos[2])||1,Ft=Math.tan(L.fov/2),Lt=Math.atan2(a.fr-.1-L.pos[1],r0),yt=Math.atan2(a.fr+1.85-L.pos[1],r0),Rt=R?Math.atan2(a.fr+.95-L.pos[1],bt)+Math.atan(.27*Ft):Math.atan2(a.sg-.1-L.pos[1],r0)+Math.atan((Ze.kf+L.shK-.05*L.idle)*Ft);let Vt=Rt;if(L.idle>.001&&!R&&typeof Nt<"u"&&Nt.sunDir){const kt=Nt.sunDir(),Ht=Math.asin(it(kt[1],-1,1)),Qt=Math.atan2(kt[0],-kt[2]),e0=Math.atan(g*Ft);let t0=Qt-L.tLook;t0=Math.atan2(Math.sin(t0),Math.cos(t0)),Vt=Re(Rt,Ht-Math.atan(.47*Ft*Math.cos(t0)),L.idle*ge(-.03,.03,Ht)*ge(e0+.15,e0-.1,Math.abs(t0)))}if(L.pitch=Pt(L.pitch,Vt,4.5,n*$),!R){const kt=-Math.atan(.62*Ft);L.pitch=Re(L.pitch,O(L.pitch,kt,.03),1-ct)}{const kt=Lt+Math.atan((.9-.2*L.idle)*Ft),Ht=yt-Math.atan(.74*Ft);L.pitch=ie(O(L.pitch,Math.min(Ht,kt),.03),kt,.03)}e.fovKick=Pt(e.fovKick,0,3,n),e.shake=Pt(e.shake,0,5,n),L.shk=Pt(L.shk,e.shake,30,n);const Kt=L.shk,jt=e.t,Ot=P0(jt*17,1)*Kt,$t=P0(jt*19,2)*Kt;L.pull=0;const Bt=Math.max(bt,.5),Ct=et-(L.jSide||1)*.27*L.jw*.6*(1-(L.ja||0))+Math.atan2(-L.dodge,Math.max(Re(Bt,r0,L.wood),.5))*.9+Math.atan2(-xt,Bt)*.85+(R?0:(L.tLook-L.tPsi)*L.idle)+L.pull,Zt=Math.cos(L.pitch),n0=[Math.sin(Ct)*Zt,Math.sin(L.pitch),-Math.cos(Ct)*Zt];L.fwd=n0;const i0=typeof ws<"u"?ws:null,w0=[L.pos[0]+ze*Ot,L.pos[1]+$t-(i0&&i0.dip||0),L.pos[2]+pt*Ot];e.viewCam&&e.viewCam(n,L,w0,n0)||qt.setCamera(w0,f.add(w0,n0),[0,1,0],L.fov,L.roll+P0(jt*13,3)*Kt*.5+(i0&&i0.roll||0))}return e.start=function(){e.mode="run",e.runT=0;const n=c.n;let d=n[0]*n[1],M=n[1]*n[1]-1,g=n[2]*n[1];const R=Math.hypot(d,M,g)||1;c.speed<6&&(c.speed<1.2&&(c.v[0]=d/R*1.2,c.v[1]=M/R*1.2,c.v[2]=g/R*1.2),c.dpGo=3),c.dp===void 0&&(L.launch=2.2),e.events.push({type:"push"})},e.update=function(n){e.t+=n;let d=0;if(e.mode==="run"){e.runT+=n,Ce+=n;const M=Math.min(Math.max(Math.ceil(Ce/X-1e-6),1),10),g=Ce/M;if(e.hs=g,Ce>1e-7)for(let R=0;R<M;R++)Ye(g,y0.u),Ce-=g,d++,e.stepT=e.t-Math.max(Ce,0),e.onStep&&e.onStep(c,g);Ce=0,d===10&&(Ce=0),e.dist=-c.p[2],e.drop=e.y0-c.p[1],c.speed>e.topSpeed&&(e.topSpeed=c.speed)}e.nSteps=d,p(n,d),y(n),h(n)},e.step=Ye,e})();(()=>{const e=zt,s=e.s,w=e.root,x=e.viewDefs={low:{az:.82,d:2,h:.27,tf:3.2,th:.8,fov:1.22,rk:.12,buzz:.006,mg:.2,al:.7},high:{az:0,d:8.6,h:5.6,tf:8.5,th:.5,fov:.98,rk:.05,buzz:0,mg:.5,al:.2},left:{az:-1.36,d:6.2,h:1.05,tf:1.6,th:.95,fov:.92,rk:0,buzz:.002,mg:.4,al:.3},right:{az:1.36,d:6.2,h:1.05,tf:1.6,th:.95,fov:.92,rk:0,buzz:.002,mg:.4,al:.3},front:{az:h0,d:6.6,h:.9,tf:-.4,th:1,fov:.92,rk:-.08,buzz:.002,mg:.4,al:.3},far:{az:2.6,d:25,h:1.8,tf:-.6,th:1,fov:.235,rk:0,buzz:0,mg:.8,al:.2},fp:{fov:1.52,fovK:.1,tilt:-.16,tips:.9,sky:.76,rollK:.34,follow:.8,up:.03,near:.1,arm:[.14,.14],armT:[-.14,-.03],turn:.15},tips:{}},F=e.tipVersions={a:{fov:1.64,fovK:.1,tilt:0,tips:.56,sky:.8,rollK:.31,follow:.9,at0:.44,at1:.42,pk:1,side:0,centre:.8,edge:1.6,slideY:-.5,slideMax:.3,close:.04,gather:1,flat:.55,lens:.06,blur:.04,sink:.02},b:{fov:1.62,fovK:.1,tilt:-.1,tips:.66,sky:.78,rollK:.32,follow:.9,at0:.68,at1:.36,pk:1,side:0,centre:.8,edge:1.4,slideY:-.58,slideMax:.34,close:.03,gather:.8,flat:.45,lens:.1,blur:.06,sink:.02},c:{fov:1.6,fovK:.1,tilt:-.16,tips:.86,sky:.76,rollK:.34,follow:.8,at0:1.45,at1:.2,pk:0,side:0,centre:0,edge:1.25,slideY:-.64,slideMax:.46,close:.02,gather:.5,flat:.25,lens:.5,blur:.4,sink:.02}},we=e.tuckVersions={a:[-.14,-.03],b:[-.09,.01]},Y=typeof Dt<"u";Y&&(Dt.def("tips","雪板尖机位",[["a","贴板"],["b","大腿"],["c","头盔"]],"a"),Dt.def("fptuck","俯冲手位",[["a","压低"],["b","面前"]],"a"));const E=()=>F[Y&&Dt.val.tips]||F.a,D=()=>we[Y&&Dt.val.fptuck]||we.a;Object.assign(x.tips,E()),x.fp.armT=D().slice(),e.views=[{id:"chase",name:"追尾"},{id:"fp",name:"第一人称"},{id:"tips",name:"雪板尖"},{id:"low",name:"贴雪"},{id:"high",name:"俯瞰"},{id:"left",name:"左侧"},{id:"right",name:"右侧"},{id:"front",name:"正面"},{id:"far",name:"远摄"}],e.view="chase";const be=r=>r-It*Math.round(r/It),ht=12.5,qe=["az","ld","h","tf","ts","th","fov","rk","ra","buzz","mg","al"],se={},_={},b={},re={};for(const r of qe)se[r]=_[r]=b[r]=re[r]=0;const m={init:!1,px:0,pz:0,yaw:0,cyaw:0,lean:0,kick:0,gy:0,gv:0,gPrev:0,gInit:!0,pit:0,pInit:!0,res:[0,0,0],focus:7.5,near0:0,shk:0,ak:0,eA:0,fl:0,flV:0,flOK:!1},J=e.look={yaw:0,pit:0,ty:0,tp:0,idle:9,hold:!1,keys:{},drag:null,touch:new Map,two:!1,on:!1};let ae=null,X=!1,ke="chase",C=!1,ne=9,Be=0,Ee=!1,je=0,$e=!1;const nt=()=>({p:[0,0,0],f:[0,0,-1],fov:1,roll:0}),Ke=nt(),Fe=nt(),Ge=nt(),Je=nt(),le=nt(),Pe=nt();let pe=!1;e.setView=function(r,q){return e.views.some(k=>k.id===r)?(q&&(X=!0),r!==e.view&&(e.view=r,ae=r),r):e.view},e.nextView=function(r){const q=e.views.length,k=e.views.findIndex(ee=>ee.id===e.view);return e.setView(e.views[((k+(r<0?-1:1))%q+q)%q].id)},addEventListener("keydown",r=>{if(r.metaKey||r.ctrlKey||r.altKey||r.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(r.target.tagName||""))return;const q=r.code;if(q==="KeyI"||q==="KeyJ"||q==="KeyK"||q==="KeyL"){J.keys[q]=!0;return}if(!r.repeat)if(q==="KeyV")e.nextView(r.shiftKey?-1:1);else{const k=/^(?:Digit|Numpad)([1-9])$/.exec(q);k&&e.views[k[1]-1]&&e.setView(e.views[k[1]-1].id)}}),addEventListener("keyup",r=>{J.keys[r.code]=!1}),addEventListener("blur",()=>{J.keys={},J.drag=null,J.touch.clear(),J.two=!1});const c=(r,q)=>{const k=3.6/Math.max(V0.w||innerWidth,320);J.ty-=r*k,J.tp+=q*k,J.idle=0},Ie=()=>{typeof y0<"u"&&(y0.drag=null)},he=()=>{let r=0;for(const q of J.touch.values())q[2]||r++;return r};addEventListener("pointerdown",r=>{const q=document.getElementById("view");if(!(!q||r.target!==q)){if(r.pointerType==="touch"){r.isPrimary&&J.touch.clear();let k=null;for(const ee of J.touch.values())ee[2]&&(k=ee);J.touch.set(r.pointerId,[V0.x(r),V0.y(r),!k,r.timeStamp,0]),k&&(r.stopPropagation(),J.touch.size===2&&r.timeStamp-k[3]<250&&k[4]<14&&(k[2]=!1,Ie())),J.two=he()>0}else if(r.button===2){J.drag={id:r.pointerId,x:V0.x(r),y:V0.y(r)};try{q.setPointerCapture(r.pointerId)}catch(k){}r.stopPropagation()}}},!0),addEventListener("pointermove",r=>{const q=J.drag,k=J.touch.get(r.pointerId);if(q&&r.pointerId===q.id){const ee=V0.x(r),Z=V0.y(r);c(ee-q.x,Z-q.y),q.x=ee,q.y=Z}else if(k){const ee=V0.x(r),Z=V0.y(r),K=he();k[4]+=Math.abs(ee-k[0])+Math.abs(Z-k[1]),!k[2]&&K&&c((ee-k[0])/K,(Z-k[1])/K),k[0]=ee,k[1]=Z}},!0);const H=r=>{J.drag&&r.pointerId===J.drag.id&&(J.drag=null),J.touch.delete(r.pointerId)&&(J.two=he()>0)};addEventListener("pointerup",H,!0),addEventListener("pointercancel",H,!0);function z(r,q){const k=J,ee=(k.keys.KeyL?1:0)-(k.keys.KeyJ?1:0),Z=(k.keys.KeyI?1:0)-(k.keys.KeyK?1:0);(ee||Z)&&(k.ty+=ee*1.9*r,k.tp+=Z*1.3*r),ee||Z||k.drag||k.two||k.hold?k.idle=0:k.idle+=r;const K=q?.95:2.9,ue=q?.7:.95,G=q?.7*Math.sqrt(Math.max(1-k.ty*k.ty/.92,.02)):1.15;if(k.ty=it(k.ty,-K,K),k.tp=it(k.tp,-G,ue),k.idle>.8){const Ae=5.5*ge(.8,1.15,k.idle);k.ty=Pt(k.ty,0,Ae,r),k.tp=Pt(k.tp,0,Ae,r)}k.yaw=Pt(k.yaw,k.ty,16,r),k.pit=Pt(k.pit,k.tp,16,r),k.idle>.8&&Math.abs(k.ty)+Math.abs(k.tp)+Math.abs(k.yaw)+Math.abs(k.pit)<4e-4&&(k.ty=k.tp=k.yaw=k.pit=0),k.on=k.yaw!==0||k.pit!==0}function V(r,q){return Math.max(vt.height(r,q,.5),vt.height(r+.6,q,.5),vt.height(r-.6,q,.5),vt.height(r,q+.6,.5),vt.height(r,q-.6,.5))}const I=(r,q)=>Math.max(vt.height(r,q,2),V(r,q)),Q=(r,q,k)=>{const ee=r-q;return ee>=k?r:ee<=-k?q:q+(ee+k)*(ee+k)/(4*k)},L=(r,q,k)=>{const ee=Math.cos(k);r.f[0]=Math.sin(q)*ee,r.f[1]=Math.sin(k),r.f[2]=-Math.cos(q)*ee},ye=(r,q)=>{r.p[0]=q.p[0],r.p[1]=q.p[1],r.p[2]=q.p[2],r.f[0]=q.f[0],r.f[1]=q.f[1],r.f[2]=q.f[2],r.fov=q.fov,r.roll=q.roll};function Ve(r,q,k,ee){for(let Ae=0;Ae<3;Ae++)r.p[Ae]=q.p[Ae]+(k.p[Ae]-q.p[Ae])*ee;const Z=Math.atan2(q.f[0],-q.f[2]),K=Math.asin(it(q.f[1],-1,1)),ue=Math.atan2(k.f[0],-k.f[2]),G=Math.asin(it(k.f[1],-1,1));L(r,Z+be(ue-Z)*ee,K+(G-K)*ee),r.fov=q.fov+(k.fov-q.fov)*ee,r.roll=q.roll+(k.roll-q.roll)*ee}function Ne(r,q){const k=Math.sin(m.yaw),ee=Math.cos(m.yaw),Z=w.pos,K=r.p[0]-Z[0],ue=r.p[2]-Z[2],G=Math.hypot(K,ue);q.az=Math.atan2(K*ee+ue*k,-K*k+ue*ee),q.ld=Math.log(Math.max(G,.3)),q.h=r.p[1]-I(r.p[0],r.p[2]);const Ae=G+3,_e=r.p[0]+r.f[0]*Ae-Z[0],at=r.p[2]+r.f[2]*Ae-Z[2];q.tf=_e*k-at*ee,q.ts=_e*ee+at*k,q.th=r.p[1]+r.f[1]*Ae-Z[1],q.fov=r.fov-m.kick,q.rk=0,q.ra=r.roll,q.buzz=0,q.mg=0,q.al=0}function Ce(r){const q=Math.sin(m.yaw),k=Math.cos(m.yaw),ee=Math.exp(se.ld)*(1+.55*se.al*m.ak),Z=Math.cos(se.az),K=Math.sin(se.az);r[0]=w.pos[0]+(-q*Z+k*K)*ee,r[2]=w.pos[2]+(k*Z+q*K)*ee}function Ye(r){Ce(r.p);const q=r.p[0],k=r.p[2],ee=Math.sin(m.yaw),Z=Math.cos(m.yaw),K=w.pos,ue=1.5*(1-Math.exp(-Math.exp(se.ld)*Math.hypot(_.az,_.ld)/30));r.p[1]=Q(m.gy+se.h+ue+se.al*m.eA,(m.flOK?m.fl:V(q,k))+se.mg,.15);const G=K[0]+ee*se.tf+Z*se.ts-q,Ae=K[2]-Z*se.tf+ee*se.ts-k,_e=K[1]+se.th-r.p[1];r.yawRaw=Math.atan2(G,-Ae),r.pitRaw=Math.atan2(_e,Math.hypot(G,Ae)||.001),r.fov=se.fov+m.kick,r.roll=se.ra-m.lean*se.rk*(1-m.ak)}function T(r){Ne(r,se);for(const q of qe)_[q]=0,re[q]=se[q];m.flOK=!1,m.gy=I(r.p[0],r.p[2]),m.gv=0,m.gPrev=m.gy,m.gInit=!1,m.pit=Math.asin(it(r.f[1],-1,1)),m.pInit=!1,Ye(Fe);for(let q=0;q<3;q++)m.res[q]=r.p[q]-Fe.p[q]}function Se(r){const q=x[ke];r.az=q.az,r.ld=Math.log(q.d),r.h=q.h,r.tf=q.tf,r.ts=0,r.th=q.th,r.fov=q.fov,r.rk=q.rk,r.ra=0,r.buzz=q.buzz,r.mg=q.mg,r.al=q.al||0}const me=[0,0,0];function B(r,q,k){ke==="chase"?Ne(le,b):Se(b);{const ue=e.flight||{},G=s.airK||0;m.ak=r>0?Pt(m.ak,G,G>m.ak?5:2.2,r):G;const Ae=Math.max(0,(ue.fr||0)-(ue.sg||0))*mt(2*G);m.eA=r>0?Pt(m.eA,Ae,9,r):Ae}const ee=Math.exp(-ht*q),Z=Math.exp(-26*q);for(const ue of qe){let G=re[ue]-b[ue];ue==="az"&&(G=be(G));const Ae=re[ue]=b[ue]+G*Z;let _e=se[ue]-Ae;ue==="az"&&(_e=be(_e));const at=_[ue]+ht*_e;se[ue]=Ae+(_e+at*q)*ee,_[ue]=(_[ue]-ht*at*q)*ee}se.az=be(se.az),Ce(me);const K=I(me[0],me[2]);if(m.gInit||r<=0)m.gy=K,m.gv=0,m.vT=null,m.gInit=!1;else{const ue=it((K-m.gPrev)/r,-40,40),G=7.5;m.vT=m.vT==null?ue:m.vT+it(ue-m.vT,-40*r,40*r);const Ae=m.vT;m.gv+=(G*G*(K-m.gy)+2*G*(Ae-m.gv))*r,m.gy+=m.gv*r}m.gPrev=K;{const ue=V(me[0],me[2]);if(!m.flOK||r<=0)m.fl=ue,m.flV=0,m.flOK=!0;else{const G=m.fl+(m.flV-20*r)*r;G<=ue?(m.flV=it((ue-m.fl)/r,-40,40),m.fl=ue):(m.flV-=20*r,m.fl=G)}}Ye(k);{const ue=Math.exp(-9*q);for(let G=0;G<3;G++)m.res[G]*=ue,k.p[G]+=m.res[G]}if(m.pInit?(m.pit=k.pitRaw,m.pInit=!1):m.pit=Pt(m.pit,k.pitRaw,5,r),Math.max(m.ak,s.airK||0)>.001){const ue=e.flight||{},G=w.pos,Ae=ue.fr!=null?ue.fr:G[1],_e=Math.hypot(G[0]-k.p[0],G[2]-k.p[2])||1,at=Math.tan(k.fov/2),ot=Math.atan(.72*at),t=(N,de,te)=>.5*(N+de+Math.sqrt((N-de)*(N-de)+te*te)),S=(N,de,te)=>.5*(N+de-Math.sqrt((N-de)*(N-de)+te*te)),l=Math.atan2(Ae-.15-k.p[1],_e)+ot,u=Math.atan2(Ae+1.75-k.p[1],_e)-ot,v=t(S(m.pit,Math.atan(.72*at),.04),Math.min(u,l),.03),P=S(v,l,.03);m.pit+=(P-m.pit)*ge(0,.25,Math.max(m.ak,s.airK||0))}L(k,k.yawRaw,m.pit)}function U(){Se(b);for(const r of qe)se[r]=re[r]=b[r],_[r]=0;se.az=be(se.az),m.gInit=!0,m.pInit=!0,m.flOK=!1,m.res[0]=m.res[1]=m.res[2]=0}const A={init:!0,yaw:0,pit:0,roll:0,hy:0,hv:0,hPrev:0},a={},oe=[0,1.45,-.2],fe={},O=["fov","fovK","tilt","tips","sky","rollK","follow"];function ie(r,q,k,ee,Z,K){const ue=fe,G=w.pos;for(const dt of O)ue[dt]=Re(x.fp[dt],x.tips[dt],K);let Ae=null,_e=null;try{Ae=a0.solve(Object.assign(a,a0.P0,e.pose)),_e=Ae.J.head}catch(dt){Ae=null}if(!_e){let dt=null;try{dt=a0.world}catch(gt){}_e=dt&&dt.J&&dt.J.head||oe,Ae=null}const at=f.norm(w.nrm),ot=f.norm(f.cross(at,f.mul(w.fwd,-1))),t=f.cross(ot,at),S=x.tips,l=K*S.pk,u=S.side*it(e.pose.lean||0,-1.2,1.2),v=Re(_e[0],u,l),P=Re(_e[1]+x.fp.up,S.at0,l),N=Re(_e[2],-S.at1,l),de=G[0]+ot[0]*v+at[0]*P+t[0]*N,te=G[1]+ot[1]*v+at[1]*P+t[1]*N,o=G[2]+ot[2]*v+at[2]*P+t[2]*N,p=m.cyaw+it((ee-m.cyaw)*ue.follow,-1,1),i=10+.3*s.speed,y=A.init?p:A.yaw,j=vt.height(de+Math.sin(y)*i,o-Math.cos(y)*i,2);let W=0,h=0;const n=ue.fov+ue.fovK*Z+m.kick,d=Math.tan(n/2),M=Math.sin(y),g=Math.cos(y),R=A.init||r<=0,Ue=[0,0,0];for(let dt=0;dt<2;dt++){const gt=Ae&&Ae.F&&a0.B&&Ae.F[dt?a0.B.footR:a0.B.footL];if(!gt){W+=.52;continue}const bt=gt[12]+gt[4]*.125-gt[8]*.96,Xe=gt[13]+gt[5]*.125-gt[9]*.96,et=gt[14]+gt[6]*.125-gt[10]*.96,tt=G[0]+ot[0]*bt+at[0]*Xe+t[0]*et-de,Oe=G[1]+ot[1]*bt+at[1]*Xe+t[1]*et-te,ze=G[2]+ot[2]*bt+at[2]*Xe+t[2]*et-o;W+=.5*Math.atan2(-Oe,Math.max(tt*M-ze*g,.05));const pt=gt[4]*.125,ut=gt[5]*.125,xt=gt[6]*.125;Ue[0]+=.5*(tt-ot[0]*pt-at[0]*ut-t[0]*xt),Ue[1]+=.5*(Oe-ot[1]*pt-at[1]*ut-t[1]*xt),Ue[2]+=.5*(ze-ot[2]*pt-at[2]*ut-t[2]*xt),h++}const $=it(Math.max(Math.min(Math.atan2(j+.3-te,i)+ue.tilt,Math.atan(ue.tips*d)-W),-Math.atan(ue.sky*d)),-1,.3);if(A.init||r<=0)A.yaw=p,A.pit=$,A.roll=-e.pose.lean*ue.rollK,A.hy=te,A.hv=0,A.init=!1;else{A.yaw=Pt(A.yaw,p,4.5,r),A.pit=Pt(A.pit,$,3.2,r),A.roll=Pt(A.roll,-e.pose.lean*ue.rollK,6,r);const dt=it((te-A.hPrev)/r,-40,40),gt=9;A.hv+=(gt*gt*(te-A.hy)+2*gt*(dt-A.hv))*r,A.hy=it(A.hy+A.hv*r,te-.05,te+.05)}A.hPrev=te;const ve=.28*m.shk,xe=e.t,De=it(J.yaw,-.95,.95),Te=Math.abs(De),Me=e.pose.dp||0,rt=Me>0?Math.sin(Math.PI*mt((Me-.2)/.5))*(1-mt(e.pose.tuck||0))*(1-ge(.14,.5,Math.abs(e.pose.lean||0))):0,wt=A.yaw+De+P0(xe*15,6)*ve,Ze=it(A.pit*(1-.5*ge(.2,.95,Te))+J.pit+P0(xe*17,7)*ve-.045*rt*(1-K),-1.3,1);L(q,wt,Ze);const ct=x.fp.turn*(1-l)*Math.max(ge(.3,.85,Math.asin(it(w.fwd[1],-1,1))-Ze),ge(.05,.5,Te)),Mt=Math.hypot(w.fwd[0],w.fwd[2])||1;q.p[0]=de+w.fwd[0]/Mt*ct,q.p[1]=A.hy,q.p[2]=o+w.fwd[2]/Mt*ct,q.fov=n,q.roll=A.roll*(1-.6*ge(.3,.95,Te))+P0(xe*13,8)*ve*.6;let ft=0;if(l>0&&h===2&&S.centre>0){const dt=q.f,gt=Math.hypot(dt[0],dt[2])||1,bt=[-dt[2]/gt,0,dt[0]/gt],Xe=f.cross(bt,dt),et=Math.cos(q.roll),tt=Math.sin(q.roll),Oe=[bt[0]*et+Xe[0]*tt,bt[1]*et+Xe[1]*tt,bt[2]*et+Xe[2]*tt],ze=f.dot(ot,Oe);Math.abs(ze)>.3&&(ft=it((Ue[0]*Oe[0]+(Ue[1]+te-A.hy)*Oe[1]+Ue[2]*Oe[2])/ze,-.5,.5)*S.centre*l)}A.cx=R?ft:Pt(A.cx||0,ft,10,r),q.p[0]+=ot[0]*A.cx,q.p[1]+=ot[1]*A.cx,q.p[2]+=ot[2]*A.cx}const ce=[[0,0,0,0,0,0],[0,0,0,0,0,0]];let He=!1;function We(r,q){const k=e.pose,ee=x.fp,Z=mt(k.tuck||0),K=(ee.arm[0]+ee.armT[0]*Z)*r,ue=-(ee.arm[1]+ee.armT[1]*Z)*r,G=mt(Math.max((k.air||0)/.5,e.flight&&e.flight.w||0))*r;for(let Ae=0;Ae<2;Ae++){const _e=Ae?k.armR:k.armL,at=ce[Ae];if(!_e||!(_e.length>=3))continue;_e[0]===at[4]&&_e[1]===at[2]&&_e[2]===at[3]&&(_e[0]=at[5],_e[1]=at[0],_e[2]=at[1]);const ot=G*(1-mt((Ae?k.grabR:k.grabL)||0)),t=Ae?1:-1,S=mt(-t*Math.sin(k.lean||0)*1.4)*(1-Z)*(1-G)*r,l=Qe[Ae];if(q>0){const P=st(Ae?"gripR":"gripL"),N=st(Ae?"elbowR":"elbowL"),de=P&&r>.5&&!G,te=de?Math.max(0,P[1]+.42)*2.2+Math.max(0,.52-t*P[0])*1.6:0,o=de&&N&&t*N[0]<1.4&&N[1]>-1.3?(.34-N[2])*14:-1;l.v=it(l.v+((te>0?te*5:de&&(t*P[0]>.86||P[1]<-.92)?-1.4-Math.max(0,t*P[0]-.86)*12:-.3)-(de?0:1.5))*q,0,1),l.n=it(l.n+(o>0?o*5:-.6)*q,0,1)}const u=ge(0,1,l.v)*(1-G)*r,v=ge(0,1,l.n)*(1-G)*r;at[5]=_e[0],at[0]=_e[1],at[1]=_e[2],_e[0]+=t*(.4*S+.2*u-.34*ot),_e[1]+=K+.02*ot-.15*S-.26*u,_e[2]+=ue-.14*ot+.12*S+.1*u-.22*v,at[4]=_e[0],at[2]=_e[1],at[3]=_e[2]}He=r>0}const Qe=[{v:0,n:0},{v:0,n:0}];function st(r){const q=a0.world&&a0.world.J,k=qt.cam;if(!q||!q[r]||!k||!k.fwd||!(k.fovY>0))return null;const ee=a0.toWorld(q[r]),Z=qt.origin||[0,0,0],K=[ee[0]+Z[0]-k.pos[0],ee[1]+Z[1]-k.pos[1],ee[2]+Z[2]-k.pos[2]],ue=K[0]*k.fwd[0]+K[1]*k.fwd[1]+K[2]*k.fwd[2];if(!(ue>.05))return null;const G=Math.tan(k.fovY/2),Ae=qt.W/Math.max(1,qt.H);return[(K[0]*k.right[0]+K[1]*k.right[1]+K[2]*k.right[2])/ue/G/Ae,(K[0]*k.up[0]+K[1]*k.up[1]+K[2]*k.up[2])/ue/G,ue]}function Le(){m.init=!0,m.cyaw=m.yaw=vt.yawAt(-s.p[2]),m.lean=s.lean,m.kick=e.fovKick,m.gInit=!0,m.pInit=!0,m.flOK=!1,m.res[0]=m.res[1]=m.res[2]=0,A.init=!0,pe=!1,C&&ke!=="chase"?U():(C=!1,ne=9)}e.viewCam=function(r,q,k,ee){const Z=w.pos,K=s.speed,ue=ge(6,30,K),G=Math.min(r/(e.timeScale>.02?e.timeScale:1),.1);(!m.init||Math.hypot(Z[0]-m.px,Z[2]-m.pz)>15)&&Le(),m.px=Z[0],m.pz=Z[2];const Ae=vt.yawAt(-s.p[2]),_e=K>1.5?Math.atan2(s.v[0],-s.v[2]):Ae;m.cyaw=Pt(m.cyaw,Ae,1.3,r),m.yaw=Pt(m.yaw,m.cyaw+it((_e-m.cyaw)*.55,-.7,.7),2.4,r),m.lean=Pt(m.lean,s.lean,5,r),m.kick=Pt(m.kick,e.fovKick,3,r),m.shk=Pt(m.shk,e.shake,30,r),z(G,Ee);const at=e.shake;if(le.p[0]=k[0],le.p[1]=k[1],le.p[2]=k[2],le.f[0]=ee[0],le.f[1]=ee[1],le.f[2]=ee[2],le.fov=q.fov>0?q.fov:1,le.roll=(q.roll||0)+P0(e.t*13,3)*at*.5,X&&(ae=e.view,Be=ae==="fp"||ae==="tips"?1:0,je=ae==="tips"?1:0,A.init=!0),ae){if(ae==="fp"||ae==="tips")Be<=0&&(A.init=!0),Ee=!0,$e=ae==="tips";else if(Ee=!1,$e=!1,Be>=.999||X)ke=ae,C=ae!=="chase",ne=9,C&&U();else if(ae==="chase")C&&ke!=="chase"&&(ne=0),ke="chase";else{if(!C)T(le);else if(ke==="chase"&&ne>.2&&pe){for(let l=0;l<3;l++)Pe.p[l]+=Z[l];T(Pe)}ke=ae,C=!0}ae=null}X=!1,je=it(je+($e&&Be>.6?G:-G)/.36,0,1),Be=it(Be+(Ee||je>.35?G:-G)/.42,0,1);const ot=ge(0,1,je);{const l=E(),u=x.tips,v=1-Math.exp(-7*G);for(const de in l)u[de]+=(l[de]-u[de])*v;const P=D(),N=x.fp.armT;N[0]+=(P[0]-N[0])*v,N[1]+=(P[1]-N[1])*v}e.viewEdge=1+(x.tips.edge-1)*ot*ge(.7,1,Be);const t=qt.cam;m.near0||(m.near0=t.near||.25),(He||Be>0)&&We(ge(0,1,Be),G);{const l=e.flight&&e.flight.q,u=l?Math.abs(Math.atan2(Math.sin(l.yaw||0),Math.cos(l.yaw||0))):0,v=l?Math.abs(Math.atan2(Math.sin(l.flip||0),Math.cos(l.flip||0))):0,P=e.flight&&e.flight.sw?1:0,N=Math.max(u/.6,v/.35,P);e.fpIn=Be>0&&(e.fpIn?N>.65:N>1)}if(typeof wa<"u"&&wa.tick(r,Be,ot),!C&&Be<=0&&!J.on)return typeof At<"u"&&(At.state.focus=0),m.focus=7.5,pe=!1,t.near=m.near0,!1;if(!C)ye(Ke,le);else{B(r,G,Fe);const l=m.shk,u=e.t,v=Math.cos(Fe.yawRaw),P=Math.sin(Fe.yawRaw),N=P0(u*17,4)*l,de=P0(u*19,5)*l;Fe.p[0]+=v*N,Fe.p[1]+=de,Fe.p[2]+=P*N,Fe.roll+=P0(u*13,9)*l*.5,ke==="chase"?(ne+=G,Ve(Ke,Fe,le,ge(.28,.6,ne)),ne>=.6&&(C=!1)):ye(Ke,Fe)}for(let l=0;l<3;l++)Pe.p[l]=Ke.p[l]-Z[l];if(Pe.f[0]=Ke.f[0],Pe.f[1]=Ke.f[1],Pe.f[2]=Ke.f[2],Pe.fov=Ke.fov,Pe.roll=Ke.roll,pe=!0,J.on&&Be<1){const l=Z[0],u=Z[1]+.9,v=Z[2],P=J.yaw,N=Math.cos(P),de=Math.sin(P);let te=Ke.p[0]-l,o=Ke.p[1]-u,p=Ke.p[2]-v,i=Ke.f[0],y=Ke.f[1],j=Ke.f[2],W;W=te*N-p*de,p=te*de+p*N,te=W,W=i*N-j*de,j=i*de+j*N,i=W;const h=Math.asin(it(y,-1,1)),n=it(h+J.pit,-1.35,1.2)-h,d=Math.cos(n),M=Math.sin(n),g=Math.hypot(i,j)||1,R=-j/g,Ue=i/g,$=(ve,xe,De,Te)=>{const Me=(R*ve+Ue*De)*(1-d);Te[0]=ve*d+-Ue*xe*M+R*Me,Te[1]=xe*d+(Ue*ve-R*De)*M,Te[2]=De*d+R*xe*M+Ue*Me};$(te,o,p,Ke.p),Ke.p[0]+=l,Ke.p[1]+=u,Ke.p[2]+=v,$(i,y,j,Ke.f)}{const l=C?1:Math.min(1,6*(Math.abs(J.yaw)+Math.abs(J.pit))),u=C?se.mg:.35;if(l>0){const v=Q(Ke.p[1],(C&&m.flOK?m.fl:V(Ke.p[0],Ke.p[2]))+u,.15),P=Ke.p[0]-Z[0],N=Ke.p[2]-Z[2],de=Math.hypot(P,N)||.001,te=Q(de,1*ge(2.6,2,Ke.p[1]-Z[1]),.2);te>de&&(Ke.p[0]=Z[0]+P/de*(de+(te-de)*l),Ke.p[2]=Z[2]+N/de*(de+(te-de)*l))}if(J.on){const v=Z[0]-Ke.p[0],P=Z[1]+.9-Ke.p[1],N=Z[2]-Ke.p[2],de=Math.atan2(P,Math.hypot(v,N)),te=Math.atan(.78*Math.tan(Ke.fov/2)),o=Math.asin(it(Ke.f[1],-1,1));(o>de+te||o<de-te)&&L(Ke,Math.atan2(Ke.f[0],-Ke.f[2]),it(o,de-te,de+te))}}let S=Ke;if(Be>0)if(ie(r,Ge,Ae,_e,ue,ot),Be>=1)S=Ge;else{const l=ge(0,.75,Be),u=ge(.5,1,Be),v=ge(.15,.85,Be),P=.42;Ve(Je,Ke,Ge,v);for(let N=0;N<3;N++){const de=Ge.p[N]+(N===1?P:0),te=Ke.p[N]+(de-Ke.p[N])*l;Je.p[N]=te+(Ge.p[N]-te)*u}S=Je}{const l=Math.hypot(Ke.p[0]-Z[0],Ke.p[1]-Z[1]-.9,Ke.p[2]-Z[2]);m.focus=Pt(m.focus,C&&ke!=="chase"&&!Ee?Math.max(l+3.5,5):7.5,7,G),typeof At<"u"&&(At.state.focus=m.focus)}return t.near=m.near0+(x.fp.near-m.near0)*ge(.7,1,Be),qt.setCamera(S.p,[S.p[0]+S.f[0],S.p[1]+S.f[1],S.p[2]+S.f[2]],[0,1,0],S.fov,S.roll+(typeof ws<"u"&&ws.roll||0)),!0}})();const ws=(()=>{const e={speed:0,slow:0,timeK:1,air:[1,1,1],base:[1,1,16e-5],wrote:[],goal:0,pend:null,since:99,runT:0,px:0,pz:0,init:!1};e.v0=22,e.v1=40,e.shake=0,e.dry=1.5,e.shut=[1/90,1/50],e.blur=[.045,.11],e.rad=[19,35],e.radV={a:[0,.6],b:[.045,.6],c:[.085,.45]},e.radK=0,e.radC=[.5,.5],typeof Dt<"u"&&Dt.def("edge","四角模糊",[["a","无"],["b","轻"],["c","明显"]],"b"),e.radL=(e.radV[typeof Dt<"u"&&Dt.val.edge]||e.radV.b).slice(),e.AIR={ridge:[5,1,1],glade:[1,2.5,1],powder:[1,2.5,1],gully:[1,1,4]};const s=[1,1,1],w=["drift","dust","fogDensity"],x=[1,1,16e-5];e.chatter=0,e.chatPx=1.4,e.chatRot=0,typeof Dt<"u"&&Dt.def("chatter","雪面颤动",[["a","关"],["b","开"]],"a"),e.GRAIN={packed:[15,.3,50,1],powder:[9,.5,30,.75],rough:[12,.3,9,1.15]};const F=e.chat={lv:0,con:0,rough:0,acc:0,n:0,q:[0,0,0,0,0,0]},we=qe=>qe/Math.sqrt(Math.sqrt(1+qe*qe*qe*qe));e.roll=0,e.dip=0,e.nearGap=1.2,e.nearV=12.5,e.nearEvery=1.5,e.nearLead=.1,e.flinch=[.007,.02,.1];const Y=e.nm={tn:{},x:NaN,z:NaN,d:0,com:!1,t:9,q:[0,0,0,0,0,0]};e.pass=function(qe){const se=zt.s,_=e.nearLead,b=se.p[0]+se.v[0]*_,re=se.p[2]+se.v[2]*_,m=vt.nearTree(b,re,Y.tn),J=m.ok&&m.x===Y.x&&m.z===Y.z;if(Y.t+=qe,J&&Y.com&&m.d>Y.d){const ae=Y.d-.2*m.h,X=Math.hypot(se.v[0],se.v[2]);zt.mode==="run"&&!m.soft&&ae>.1&&ae<e.nearGap&&X>e.nearV&&se.e<2.5&&!(se.brush>0)&&!(se.crash>0)&&Y.t>e.nearEvery&&(Y.t=0,zt.events.push({type:"near",x:m.x,z:m.z,h:m.h,r:m.r,side:R0((m.z-re)*se.v[0]-(m.x-b)*se.v[2])||1,ux:(b-m.x)/m.d,uz:(re-m.z)/m.d,vx:se.v[0],vz:se.v[2],lead:_,d:Y.d,k:(1-ae/e.nearGap)*ge(e.nearV,1.6*e.nearV,X)}))}Y.com=J&&m.d<Y.d,Y.x=m.ok?m.x:NaN,Y.z=m.z,Y.d=m.d},e.wind={v:0,g:0,b:0,k:0,ph:0,amp:0,on:0,pc:{}},e.gust=[3,5,2.5],e.buf=[.0019,.0015,9e-4],e.bufC=1.9,e.buffet=[0,0,0];const E=e.wind,D=[1.2,0,.4],be=(qe,se)=>1.75*(P0(E.ph+qe,se)+.5*P0(2.13*E.ph+qe,se+1));typeof Dt<"u"&&Dt.def("buffet","风压抖动",[["a","原样"],["b","轻"],["c","明显"]],"b"),e.lensV={a:[0,.3,1.5,1.5],b:[1,14,9,2.6],c:[1,1.8,7,2.4]},typeof Dt<"u"&&Dt.def("lens","镜头上的雪",[["a","水珠"],["b","白雪被吹走"],["c","先白后化"]],"b");const ht=()=>e.lensV[typeof Dt<"u"&&Dt.val.lens]||e.lensV.b;return e.splash=function(qe,se,_){e.goal>(o0.wetLook?.03:.02)||(o0.wetSeed=(o0.wetSeed+1)%61,o0.wetAge=0,o0.wetBlow=0,o0.wetBias[0]=se||0,o0.wetBias[1]=_||0),e.goal=Math.max(e.goal,mt(qe)),o0.wetNew=1},e.update=function(qe){const se=zt.s,_=At.state,b=zt.mode==="run",re=it(zt.timeScale||1,.05,1),m=re*it(At.resumeK||1,.05,1),J=qe/m,ae=!e.init||zt.runT<e.runT||Math.hypot(se.p[0]-e.px,se.p[2]-e.pz)>15;e.init=!0,e.runT=zt.runT,e.px=se.p[0],e.pz=se.p[2];const X=b?ge(e.v0,e.v1,Math.hypot(se.v[0],se.v[1],se.v[2])*re):0;e.speed=ae?X:Pt(e.speed,X,X>e.speed?2.5:5,qe),o0.speed=e.speed,b&&(zt.shake=Math.max(zt.shake,e.shake*e.speed*(1-E.on))),e.slow=ae?ge(1,.4,re):Pt(e.slow,ge(1,.4,re),14,J),e.timeK=ae?m:Pt(e.timeK,m,14,J),o0.slow=e.slow,o0.shutter=Re(e.shut[0],e.shut[1],e.speed)*e.timeK,o0.blurMax=Re(e.blur[0],e.blur[1],e.speed),e.viewShut=Pt(e.viewShut||1,{front:1,left:1,right:1,low:1}[zt.view]?.5:1,6,J),o0.shutter*=e.viewShut,o0.blurMax*=e.viewShut;{const Ee=qt.cam,je=se.v,$e=Math.hypot(je[0],je[1],je[2]),nt=b?ge(e.rad[0],e.rad[1],$e):0;e.radK=ae?nt:Pt(e.radK,nt,nt>e.radK?2.5:5,qe);let Ke=.5,Fe=.5,Ge=0;if($e>1){const Pe=(je[0]*Ee.fwd[0]+je[1]*Ee.fwd[1]+je[2]*Ee.fwd[2])/$e,pe=Math.tan(Ee.fovY/2),c=qt.W/Math.max(qt.H,1);Ge=Math.abs(Pe),Ge>.05&&(Ke=.5+.5*(je[0]*Ee.right[0]+je[1]*Ee.right[1]+je[2]*Ee.right[2])/$e/(Pe*pe*c),Fe=.5-.5*(je[0]*Ee.up[0]+je[1]*Ee.up[1]+je[2]*Ee.up[2])/$e/(Pe*pe))}Ke=it(Ke,.32,.68),Fe=it(Fe,.34,.66),e.radC[0]=ae?Ke:Pt(e.radC[0],Ke,6,qe),e.radC[1]=ae?Fe:Pt(e.radC[1],Fe,6,qe);const Je=e.radV[typeof Dt<"u"&&Dt.val.edge]||e.radV.b;e.radL[0]=Pt(e.radL[0],Je[0],8,J),e.radL[1]=Pt(e.radL[1],Je[1],8,J);const le=Math.max(1,typeof zt<"u"&&zt.viewEdge||1);o0.radial=e.radL[0]*le*e.radK*e.timeK*ge(.5,.85,Ge)*ge(.35,.8,Ee.fovY),o0.radIn=e.radL[1]-.25*(le-1),o0.radC[0]=e.radC[0],o0.radC[1]=e.radC[1]}const ke=e.AIR[vt.segAt(-se.p[2]+se.speed).type]||s;for(let Ee=0;Ee<3;Ee++){const je=w[Ee],$e=_[je];$e==null?e.base[Ee]=x[Ee]:$e!==e.wrote[Ee]&&(e.base[Ee]=$e),e.air[Ee]=ae?ke[Ee]:Pt(e.air[Ee],ke[Ee],.7,qe),_[je]=e.wrote[Ee]=e.base[Ee]*e.air[Ee]}ae&&(e.goal=0,e.pend=null,e.since=99,o0.wet=0,o0.wetNew=0);for(const Ee of zt.events){let je=0,$e=0,nt=0;if(Ee.type==="land"&&Ee.v>5)je=Re(.5,1,mt((Ee.v-5)/9)),nt=1;else if(Ee.type==="brush"||Ee.type==="crash"){const Fe=qt.cam.right;$e=R0((Ee.x-se.p[0])*Fe[0]+(Ee.z-se.p[2])*Fe[2]),je=Ee.type==="crash"?1:.55,nt=.25}const Ke=qt.cam.pos;je*=ge(16,9,Math.hypot(Ke[0]-se.p[0],Ke[1]-se.p[1],Ke[2]-se.p[2])),je>0&&(!e.pend||je>=e.pend.w)&&(e.pend={t:it(Math.hypot(Ke[0]-se.p[0],Ke[2]-se.p[2])/Math.max(se.speed,3),.03,.3),w:je,x:$e,y:nt})}if(e.since+=J,e.pend&&(e.pend.t-=qe)<=0){const Ee=e.pend.w;e.splash(Ee*Re(Re(.45,1,ge(1.5,7,e.since)),1,ge(.75,1,Ee)),e.pend.x,e.pend.y),e.since=0,e.pend=null}const C=ht();o0.wetLook=C[0];const ne=ge(2,25,E.v||0),Be=C[0]?Re(C[2],C[3],ne):e.dry;e.goal=Math.max(0,e.goal-qe/Be),o0.wet=o0.wet<e.goal?Math.min(e.goal,o0.wet+qe/.07):e.goal,o0.wet>0&&(o0.wetAge+=qe),o0.wetNew=Math.max(0,o0.wetNew-qe/C[1]),o0.wet>0?o0.wetBlow+=qe*(.05+1.25*ne*ne):o0.wetBlow=0,o0.wetC[0]=Re(.5,o0.radC[0],.6),o0.wetC[1]=Re(.5,o0.radC[1],.6);{const je=Math.hypot(se.v[0],se.v[1],se.v[2]),$e=b&&se.contact!==!1&&!se.air,nt=mt(((se.powder||0)-.3)/.7),Ke=vt.segAt(-se.p[2]).type==="rollers"?1:vt.bumps?vt.bumps(se.p[0],se.p[2]):0,Fe=(se.aSkid||0)*Math.abs(Math.sin(se.beta||0))/9.81,Ge=Math.abs(se.aCarve||0)/9.81,Je=Math.min((se.load||0)/9.81,1.5),le=$e?mt(ge(1,15,je)*(1.6*Fe+.45*Ge)+.06*ge(5,30,je)*Je*(1-.7*nt)*(1+1.5*F.rough)):0;ae&&(F.lv=F.con=F.acc=F.n=0,F.q.fill(0)),F.rough=ae?Ke:Pt(F.rough,Ke,3,qe),F.lv=Pt(F.lv,le,le>F.lv?25:6.7,qe),F.con=Pt(F.con,$e?1:0,$e?40:28,qe),e.chatter=F.lv*F.con>.001?F.lv*F.con:0;const Pe=e.GRAIN,pe=T=>Re(Re(Pe.packed[T],Pe.powder[T],nt),Pe.rough[T],F.rough),c=F.q,Ie=1/240,he=pe(1),H=It*pe(0)*Ie,z=1/Math.sqrt(1-he*he),V=Math.exp(-he*H),I=V*Math.cos(H/z),Q=V*Math.sin(H/z),L=Math.min(1,pe(2)*Ie),ye=.873*Math.sqrt(4*he*H/L);F.acc+=qe;let Ve=Math.min(12,Math.floor(F.acc/Ie));for(F.acc-=Ve*Ie,F.acc>Ie&&(F.acc=0);Ve>0;Ve--)for(let T=0;T<6;T+=2){const Se=c[T],me=c[T+1],B=Ts(F.n++);c[T]=(I+he*z*Q)*Se+z*Q*me,c[T+1]=-z*Q*Se+(I-he*z*Q)*me,B<L&&(c[T+1]+=ye*(B<.5*L?-1:1)*(.5+Ts(F.n++)))}const Ne=(typeof Dt<"u"&&Dt.val.chatter!=="b"?0:e.chatPx)*e.chatter*pe(3),Ce=Ne*Math.max(qt.W,1280)/1280/2.8,Ye=.5*Math.pow(mt(Ce/.3),.6);for(let T=0;T<2;T++){const Se=Ce*2.8*we(c[2*T+1]/2.8);o0.chat[T]=R0(Se)*Math.floor(Math.abs(Se)+1-Ye)}o0.chat[2]=e.chatRot*Ne/640*we(c[5]/2.8)}{const Ee=Y.q,je=2/e.flinch[2]*qe,$e=Math.exp(-je);ae&&Ee.fill(0);for(const nt of zt.events)if(nt.type==="near"){const Ke=.5*Math.E*Math.E*(.6+.4*nt.k);Ee[0]+=Ke*nt.side,Ee[3]+=Ke}for(let nt=0;nt<6;nt+=3)Ee[nt+2]=(Ee[nt+2]+je*Ee[nt+1]+.5*je*je*Ee[nt])*$e,Ee[nt+1]=(Ee[nt+1]+je*Ee[nt])*$e,Ee[nt]*=$e;e.roll=e.flinch[0]*Ee[2],e.dip=e.flinch[1]*Ee[5]}{const Ee=_.wind||D,je=Math.hypot(Ee[0],Ee[2])||1,$e=vt.at(-se.p[2],E.pc),nt=$e.ridge||0,Ke=$e.glade||0,Fe=Math.max(typeof M0<"u"&&M0.wind||1,.2),Ge=b?Math.hypot(se.v[0],se.v[1],se.v[2]):0;E.g=P0(At.t*.31-(se.p[0]*Ee[0]+se.p[2]*Ee[2])/je*.06,7),E.v=Math.abs(Math.hypot(Ge,6*Math.max(Fe-1,0))+Math.max(e.gust[0]*(.6+Ge/40)+e.gust[1]*nt-e.gust[2]*Ke,.3)*it(je/1.26,.5,2.5)*Fe*E.g);const Je=E.v*E.v/1111;E.k=1.25*Je/(1+.25*Je)*Math.min((1+.6*nt-.4*Ke)*(.75+.25*Fe),2)*(1-.35*Math.max(se.tuck||0,se.tuckIn||0)),E.ph+=qe*(5+.09*E.v),E.b=be(0,21),E.lp=(E.lp||0)+qe*(.5+.006*E.v);const le=(T,Se)=>1.6*P0(E.lp+T,Se),Pe=typeof Dt<"u"?Dt.val.buffet:"b",pe=Pe==="a"?0:Pe==="c"?e.bufC:1;E.amp=ae?pe:Pt(E.amp,pe,5,qe),E.on=Math.min(E.amp,1);const c=e.buffet,Ie=E.amp*E.k;c[0]=e.buf[0]*Ie*le(0,21),c[1]=e.buf[1]*Ie*le(31.7,23),c[2]=e.buf[2]*Ie*le(77.1,25);const he=qt.cam;he.fwd!==E.f&&(E.c0=[he.fwd,he.right,he.up]);const H=E.c0[0],z=E.c0[1],V=E.c0[2],I=2*Math.tan(he.fovY/2),Q=c[0]*I,L=c[1]*I,ye=Math.cos(c[2]),Ve=Math.sin(c[2]),Ne=f.norm([H[0]+z[0]*Q+V[0]*L,H[1]+z[1]*Q+V[1]*L,H[2]+z[2]*Q+V[2]*L]),Ce=f.norm(f.sub(z,f.mul(Ne,f.dot(z,Ne)))),Ye=f.cross(Ce,Ne);he.fwd=E.f=Ne,he.right=f.add(f.mul(Ce,ye),f.mul(Ye,Ve)),he.up=f.sub(f.mul(Ye,ye),f.mul(Ce,Ve))}},e})();zt.feel=ws;const wa=(()=>{const e={on:!1,ready:!1,dead:!1,stats:{},swap:.55,arms:!0,tk:0},s=18,w=10,x={uarm:0,farm:1,hand:2,pole:3,ski:4},F=.3,we=.26,Y=F+we,E=[.02,-.03,.082],D=.94,be=.342,ht=Math.acos(be),qe=[0,be,-D],se=[0,D,be],_=[1,0,0,0,0,D,be,0,0,-be,D,0,E[0],E[1]-be*Y,E[2]+D*Y,1],b=(o,p,i,y)=>{const j=i+Y;return y[0]=o+E[0],y[1]=E[1]+D*p-be*j,y[2]=E[2]+be*p+D*j,y},re=o=>{const p=o[1]-E[1],i=o[2]-E[2];return[o[0]-E[0],D*p+be*i,-be*p+D*i-Y]},m=(o,p,i)=>(p-E[1])*qe[1]+(i-E[2])*qe[2],J=(o,p,i)=>(p-E[1])*se[1]+(i-E[2])*se[2],ae={len:1.14,basket:1.045,r:.0165,piv:.03},X=[.0334,-.0134],ke=[0,.28,.63,1];function C(){const o=[];return{v:o,ix:[],n:()=>o.length/s,vert(i,y,j,W,h){return o.push(i[0],i[1],i[2],y[0],y[1],y[2],j[0],j[1],j[2],j[3],W[0],W[1],W[2],W[3],h[0],h[1],h[2],h[3]),o.length/s-1}}}function ne(o,p,i,y,j,W,h){const n=new Array(p*i);for(let R=0;R<p;R++)for(let Ue=0;Ue<i;Ue++)n[R*i+Ue]=y(R,Ue);const d=(R,Ue)=>n[it(R,0,p-1)*i+(W?(Ue+i)%i:it(Ue,0,i-1))],M=o.n();for(let R=0;R<p;R++)for(let Ue=0;Ue<i;Ue++){let $=f.norm(f.cross(f.sub(d(R+1,Ue),d(R-1,Ue)),f.sub(d(R,Ue+1),d(R,Ue-1))));h&&($=f.mul($,-1));const ve=n[R*i+Ue],xe=j(R,Ue,ve,$);o.vert(ve,xe[3]||$,xe[0],xe[1],xe[2])}const g=W?i:i-1;for(let R=0;R<p-1;R++)for(let Ue=0;Ue<g;Ue++){const $=M+R*i+Ue,ve=M+R*i+(Ue+1)%i,xe=M+(R+1)*i+(Ue+1)%i,De=M+(R+1)*i+Ue;h?o.ix.push($,ve,xe,$,xe,De):o.ix.push($,xe,ve,$,De,xe)}}const Be=[.0315,.01,-.0115,-.032],Ee=[1,1.04,.98,.87],je=[-.12,0,.04,.16],$e=[-.003,0,.002,.006],nt=[[.036,.38],[.0335,1.88],[.0325,2.79],[.0315,3.54]],Ke=[.014,.013,.0121,.0113],Fe=[],Ge=[];for(let o=0;o<4;o++){Fe.push([]);for(let p=0;p<4;p++){const i=nt[p][1]+je[o]*p/1.5,y=nt[p][0]*(.86+.14*Ee[o]);Fe[o].push([y*Math.cos(i),Be[o]*(p?1:1.03),-y*Math.sin(i)+(p?0:$e[o]),Ke[p]*Ee[o]])}}for(let o=0;o<4;o++){const p=[.0215,.0075,-.0065,-.0195][o];Ge.push([E[0]+.005,E[1]+qe[1]*.016+se[1]*p,E[2]+qe[2]*.016+se[2]*p,.018])}const Je=[[.013,.004,.066,.0185],[.008,.031,.045,.0172],[-.0185,.049,.027,.0148],[-.033,.054,-.003,.0132],[-.0205,.0555,-.024,.012]],le=[E[0],E[1]+qe[1]*.022,E[2]+qe[2]*.022],Pe=[E[0],E[1]-qe[1]*.075,E[2]-qe[2]*.075];function pe(o,p,i,y){const j=N0.capsule;let W=1e9;for(let g=0;g<4;g++){const R=Ge[g],Ue=Fe[g][0];W=N0.smin(W,j(o,p,i,R[0],R[1],R[2],Ue[0],Ue[1],Ue[2],R[3],Ue[3]*1.1),.007)}W=N0.smin(W,N0.ellipsoid(o,p,i,.014,-.034,.044,.019,.021,.029),.01),W=N0.smin(W,N0.ellipsoid(o,p,i,-.0075,.01,.0385,.019,.03,.019),.008),W=N0.smin(W,N0.ellipsoid(o,p,i,-.006,-.03,.037,.018,.02,.018),.008);let h=1e9,n=0,d=1e9;if(i<.055)for(let g=0;g<4;g++){const R=Fe[g];let Ue=j(o,p,i,R[0][0],R[0][1],R[0][2],R[1][0],R[1][1],R[1][2],R[0][3],R[1][3]);Ue=N0.smin(Ue,j(o,p,i,R[1][0],R[1][1],R[1][2],R[2][0],R[2][1],R[2][2],R[1][3],R[2][3]),.004),Ue=N0.smin(Ue,j(o,p,i,R[2][0],R[2][1],R[2][2],R[3][0],R[3][1],R[3][2],R[2][3],R[3][3]),.004),Ue<d&&(d=Ue,n=g),h=N0.smin(h,Ue,.0032)}let M=1e9;for(let g=0;g<4;g++)M=N0.smin(M,j(o,p,i,Je[g][0],Je[g][1],Je[g][2],Je[g+1][0],Je[g+1][1],Je[g+1][2],Je[g][3],Je[g+1][3]),.005);if(W=N0.smin(W,M,.007),i<.04)for(let g=0;g<4;g++)W=N0.smin(W,N0.ellipsoid(o,p,i,.045,Fe[g][0][1],Fe[g][0][2]+.005,.0068,.0092,.012),.004);{const g=m(o,p,i),R=J(o,p,i);W=N0.smin(W,N0.rbox(o,R,g,.044,.002,.056,.004,.027,.015,.0035),.004)}return W=N0.smin(W,j(o,p,i,le[0],le[1],le[2],Pe[0],Pe[1],Pe[2],.0335,.035),.014),y&&(y[0]=d,y[1]=n,y[2]=W),N0.smin(W,h,.009)}const c=(o,p,i)=>Math.max(Math.hypot(o,i)-(p>.058?.0222:ae.r),p-.09);function Ie(o){const p=Date.now(),i=[0,0,0],y=[1e9,1e9,1e9],j=[-1e9,-1e9,-1e9],W=[0,0,0];for(let Ue=0;Ue<8;Ue++){const $=re([Ue&1?.066:-.054,Ue&2?.078:-.1,Ue&4?.17:-.056]);for(let ve=0;ve<3;ve++)y[ve]=Math.min(y[ve],$[ve]),j[ve]=Math.max(j[ve],$[ve])}const h=(Ue,$,ve)=>(b(Ue,$,ve,i),pe(i[0],i[1],i[2])),n=(Ue,$,ve,xe,De,Te,Me)=>Math.min(pe(Ue+xe*Me,$+De*Me,ve+Te*Me),c(Ue+xe*Me,$+De*Me,ve+Te*Me))/Me,d=qs(h,y,j,e.cell||.003,{stride:4,repair:!0}),M=o.n(),g=[0,0,0],R=(Ue,$,ve)=>{g[0]=Ue,g[1]=D*$-be*ve,g[2]=be*$+D*ve};for(let Ue=0;Ue<d.nv;Ue++){const $=Ue*10,ve=d.verts[$],xe=d.verts[$+1],De=d.verts[$+2];b(ve,xe,De,i),R(d.verts[$+3],d.verts[$+4],d.verts[$+5]);const Te=it(.15+.85*n(i[0],i[1],i[2],g[0],g[1],g[2],.009),.12,1),Me=ge(-.015,.04,De+Y);pe(i[0],i[1],i[2],W);let rt=Math.atan2(-i[2],i[0]);rt<-1.2&&(rt+=It);const wt=W[0]<W[2]+.0015?ke[W[1]]*ge(.55,1.25,rt)*ge(.0015,-.003,W[0]-W[2]):0;o.vert([ve,xe,De],[d.verts[$+3],d.verts[$+4],d.verts[$+5]],[2,Te,wt,g[0]],[x.farm,x.hand,Me,1],[i[0],i[1],i[2],W[0]<W[2]?1+W[1]:0])}for(let Ue=0;Ue<d.ni;Ue++)o.ix.push(M+d.idx[Ue]);e.stats.gloveMs=Date.now()-p,e.stats.gloveV=d.nv}function he(o){const p=[[.002,.079,.012],[.006,.07,.024],[.013,.058,.038]],i=64,y=[],j=[],W=.0015;for(let g=75;g>=-292;g-=26){const R=g*h0/180,Ue=.036+.012*Math.cos(R-1.25),$=.05;p.push([E[0]+$*Math.cos(R),E[1]+qe[1]*Ue+se[1]*$*Math.sin(R),E[2]+qe[2]*Ue+se[2]*$*Math.sin(R)])}const h=g=>f.norm([pe(g[0]+W,g[1],g[2])-pe(g[0]-W,g[1],g[2]),pe(g[0],g[1]+W,g[2])-pe(g[0],g[1]-W,g[2]),pe(g[0],g[1],g[2]+W)-pe(g[0],g[1],g[2]-W)]);for(let g=0;g<=i;g++){const R=g/i*(p.length-1),Ue=Math.min(Math.floor(R),p.length-2),$=R-Ue,ve=p[Math.max(Ue-1,0)],xe=p[Ue],De=p[Ue+1],Te=p[Math.min(Ue+2,p.length-1)];let Me=[0,1,2].map(Ze=>.5*(2*xe[Ze]+(De[Ze]-ve[Ze])*$+(2*ve[Ze]-5*xe[Ze]+4*De[Ze]-Te[Ze])*$*$+(3*xe[Ze]-3*De[Ze]+Te[Ze]-ve[Ze])*$*$*$));const rt=ge(.8,2.6,R);let wt=h(Me);for(let Ze=0;Ze<4;Ze++){const ct=pe(Me[0],Me[1],Me[2])-.0024;Me=f.mad(Me,wt,-ct*rt),wt=h(Me)}y.push(Me),j.push(wt)}const n=[[-1,.5],[-.6,1],[.6,1],[1,.5],[1,-.5],[.6,-1],[-.6,-1],[-1,-.5]],d=.009,M=.0014;ne(o,i+1,8,(g,R)=>{const Ue=y[g],$=f.norm(f.sub(y[Math.min(g+1,i)],y[Math.max(g-1,0)])),ve=j[g],xe=f.norm(f.cross($,ve)),De=f.cross(xe,$);return re(f.add(f.mad(Ue,xe,n[R][0]*d),f.mul(De,n[R][1]*M)))},(g,R,Ue)=>[[4,g<4?.6:.9,0,0],[x.pole,x.hand,1-ge(0,9,g),0],[g/i*.62,n[R][0],n[R][1],0]],!0,!0)}const H=.072,z=Y-.022,V=Y+.007,I=[Y-.048,1.95];function Q(o){if(o<=0)return H*Math.sqrt(Math.max(1-o/H*(o/H),0));const p=o<F?Re(H,.0645,o/F):Re(.0645,.0525,ge(F,Y-.06,o)*.55+.45*mt((o-F)/(Y-.06-F)));return Re(p,.0462,.85*ge(Y-.085,Y-.032,o))+.0025*Math.exp(-Math.pow((o-F)/.045,2))}function L(o){const i=[];for(let h=0;h<=7;h++)i.push(-H*Math.cos(h/7*h0/2)+1e-5*(h===0?1:0));for(let h=.0055;h<z-.006;h+=h>F-.1&&h<F+.11||h>Y-.16?.0048:.0075)i.push(h);i.push(z-.0057,z-.0033,z-.0013,z);const y=h=>h<F-.05?[x.uarm,x.uarm,1,0]:h<Y-.045?[x.farm,x.uarm,ge(F-.05,F+.05,h),ge(F-.02,Y-.03,h)]:[x.farm,x.hand,ge(-.015,.04,Y-h),1],j=(h,n)=>{let d=n-I[1];return d-=It*Math.round(d/It),ge(.5,.42,Math.abs(d))*ge(.0135,.0105,Math.abs(h-I[0]))},W=h=>h>z-.0065?[2e-4,.0011,9e-4,-8e-4][Math.min(3,Math.round((h-z+.0057)/.0019))]:0;ne(o,i.length,44,(h,n)=>{const d=i[h],M=n/44*It,g=Math.max(Q(d)+.0021*j(d,M)+W(d),1e-4);return[g*Math.cos(M),g*Math.sin(M),-d]},(h,n)=>{const d=i[h],M=n/44*It;return[[1,Re(1,.8,ge(z-.0105,z,d)),0,j(d,M)],y(Math.max(d,0)),[d,M,Q(d),0]]},!0,!1);{const h=[Q(z)-8e-4,.0452,.0428,.0406],n=[0,.0011,.0013,4e-4];ne(o,4,44,(d,M)=>{const g=M/44*It;return[h[d]*Math.cos(g),h[d]*Math.sin(g),-z-n[d]]},(d,M)=>[[1,Re(.75,.35,d/3),1,0],y(z),[z,M/44*It,h[d],1]],!0,!1)}{const h=[];for(let M=z+8e-4;M<V-.003;M+=.0045)h.push(M);h.push(V-.0026,V-8e-4,V);const n=M=>Re(.0404,.038,mt((M-z)/(V-z)))+(M>V-.003?M>V-4e-4?-6e-4:7e-4:0);ne(o,h.length,44,(M,g)=>{const R=g/44*It,Ue=n(h[M]);return[Ue*Math.cos(R),Ue*Math.sin(R),-h[M]]},(M,g)=>[[1,Re(.55,1,ge(z,z+.012,h[M])),2,0],y(h[M]),[h[M],g/44*It,n(h[M]),2]],!0,!1);const d=[n(V),.0362,.034];ne(o,3,44,(M,g)=>{const R=g/44*It;return[d[M]*Math.cos(R),d[M]*Math.sin(R),-V-3e-4*M]},(M,g)=>[[1,Re(.7,.3,M/2),2,0],y(V),[V,g/44*It,d[M],3]],!0,!1)}}function ye(o){const i=[],y=ae.basket,j=(d,M,g)=>i.push([d,M,g]);j(.0868,6e-4,0),j(.0864,.009,0),j(.085,.0152,0),j(.0822,.019,0),j(.078,.0206,0),j(.0725,.0204,0),j(.067,.019,0),j(.0615,.0176,0),j(.057,.0168,0);for(let d=.0525;d>-.052;d-=.0035)j(d,ae.r,0);j(-.056,.0172,0),j(-.062,.0192,0),j(-.068,.0196,0),j(-.073,.017,0),j(-.079,.012,0),j(-.085,.0092,1);for(let d=-.11;d>-y+.04;d-=.045)j(d,Re(.009,.0062,mt((-d-.085)/.93)),1);j(-y+.022,.0062,1),j(-y+.016,.01,3),j(-y+.006,.0118,3),j(-y-.006,.0118,3),j(-y-.012,.008,3),j(-y-.035,.0056,3),j(-ae.len+.03,.004,3),j(-ae.len,.0012,3);const W=(d,M)=>{const g=i[d][0],R=i[d][1];if(i[d][2]!==0)return[R,R];if(g>.056)return[R,R*Re(1.14,1.22,ge(.058,.075,g))];const Ue=ge(.1,-.7,Math.sin(M)),$=g<.05&&g>-.05?.0019*(.5-.5*Math.cos((g+.0535)/.0215*It))*Ue:0;return[R,R*1.14+$]};ne(o,i.length,20,(d,M)=>{const g=M/20*It,R=W(d,g);return re([R[0]*Math.cos(g),i[d][0],R[1]*Math.sin(g)])},(d,M)=>[[5,1,i[d][2],0],[x.pole,x.pole,1,0],[i[d][0],M/20*It,i[d][1],i[d][2]]],!0,!0);const h=[[.0118,.003],[.02,.0018],[.032,2e-4],[.042,-.0016],[.0462,-.0012],[.0475,6e-4],[.0462,.0026],[.042,.003],[.032,.004],[.02,.0052],[.0118,.006]],n=36;ne(o,h.length,n,(d,M)=>{const g=M/n*It;return re([h[d][0]*Math.cos(g),-y-h[d][1],h[d][0]*Math.sin(g)])},(d,M)=>[[5,d>5?.7:1,2,0],[x.pole,x.pole,1,0],[-y,M/n*It,h[d][0],2]],!0,!0)}const Ve={tail:.8,tip:-.965};function Ne(o){let p=Re(.049,.058,ge(.15,.78,o));p=Re(p,.064,ge(-.15,-.78,o)),o<-.8&&(p*=Math.sqrt(Math.max(1e-4,1-Math.pow((-o-.8)/.1655,2)))),o>.76&&(p*=Math.sqrt(Math.max(.05,1-Math.pow((o-.76)/.045,2))));const i=.125*Math.pow(ge(-.62,-.96,o),1.7)+.03*Math.pow(ge(.66,.8,o),2),y=Re(.008,.02,ge(.8,.25,Math.abs(o+.05)))*Re(.6,1,ge(-.965,-.9,o));return[p,i,y]}function Ce(o){const p=[];for(let d=Ve.tail;d>Ve.tip+5e-4;d-=d>.74?.006:d>.55?.02:d>-.5?.04:d>-.9?.012:d>-.955?.005:.0018)p.push(d);p.push(Ve.tip+4e-4);const i=p.map(Ne),y=p.length,j=[x.ski,x.ski,1,0],W=d=>Math.min(.0045,i[d][0]*.5,i[d][2]*.4),h=(d,M,g)=>ne(o,y,d.length,(R,Ue)=>{const $=d[Ue](R);return[$[0],$[1],p[R]]},(R,Ue,$)=>[[8,g,M,0],j,[$[0],p[R],$[1]-i[R][1],i[R][0]]],!1,!1),n=d=>M=>[-(i[M][0]-W(M))*d,i[M][1]+i[M][2]+.0011*(1-d*d)*mt(i[M][0]/.03)];h([n(-1),n(-.5),n(0),n(.5),n(1)],3,1);for(const d of[1,-1]){const M=Ue=>[d*(i[Ue][0]-W(Ue)),i[Ue][1]+i[Ue][2]],g=Ue=>[d*i[Ue][0],i[Ue][1]+i[Ue][2]-W(Ue)],R=Ue=>[d*i[Ue][0],i[Ue][1]];d>0?(h([g,M],2,1),h([R,g],1,.9)):(h([M,g],2,1),h([g,R],1,.9))}h([d=>[-i[d][0],i[d][1]],d=>[i[d][0],i[d][1]]],0,.6)}e.build=function(){const o=Date.now(),p=C(),i={};let y=0;const j=d=>{i[d]=p.n()-y,y=p.n()};L(p),j("sleeve"),Ie(p),j("glove"),he(p),j("leash"),ye(p),j("pole"),Ce(p),j("ski");const W=p.n(),h=new Float32Array(W*2*s),n=new Uint32Array(p.ix.length*2);h.set(p.v),n.set(p.ix);for(let d=0;d<W;d++){const M=d*s,g=(W+d)*s;for(let R=0;R<s;R++)h[g+R]=p.v[M+R];h[g]=-h[g],h[g+3]=-h[g+3],h[g+10]+=5,h[g+11]+=5}for(let d=0;d<p.ix.length;d+=3){const M=p.ix.length+d;n[M]=p.ix[d]+W,n[M+1]=p.ix[d+2]+W,n[M+2]=p.ix[d+1]+W}return e.mesh={V:h,I:n,nv:W*2,ni:n.length},e.stats.verts=W*2,e.stats.tris=n.length/3,e.stats.parts=i,e.stats.buildMs=Date.now()-o,e.mesh};const Ye={tw0:.2,twLo:-1.2,twHi:1.45,wU:.63,wR:.4,pBack:.2,pFwd:.8,skew:.14},T=o=>o-It*Math.round(o/It);function Se(o,p,i,y,j,W,h,n){let d=f.mul(y,-1),M=j,g=f.norm(f.sub(i,M)),R=f.mad(i,g,-.087),Ue,$,ve,xe,De,Te,Me=o.tau,rt=0,wt=0,Ze=0,ct=i;for(let tt=0;tt<4;tt++){const Oe=f.lerp(p,R,.5),ze=f.norm(f.sub(R,p));let pt=f.sub(j,Oe);pt=f.sub(pt,f.mul(ze,f.dot(pt,ze))),f.len(pt)<1e-4&&(pt=[0,-1,.3]),pt=f.norm(pt);const ut=f.len(f.sub(R,p)),xt=it(ut,Math.abs(F-we)+.001,F+we-2e-4),lt=(F*F-we*we+xt*xt)/(2*xt),Tt=Math.sqrt(Math.max(0,F*F-lt*lt));if(tt===3){const Kt=f.sub(f.mad(p,ze,xt),R);R=f.add(R,Kt),i=f.add(i,Kt),ct=f.add(ct,Kt)}if(M=f.add(f.mad(p,ze,lt),f.mul(pt,Tt)),g=f.norm(f.sub(R,M)),De=f.norm(f.cross(pt,ze)),De=f.norm(f.sub(De,f.mul(g,f.dot(De,g)))),Te=f.cross(De,g),tt===3)break;if(W>0&&h&&(d=f.norm(f.lerp(d,f.norm(f.sub(ct,h)),W))),tt===0){const Kt=f.dot(d,De),jt=f.dot(d,Te),Ot=T(Math.atan2(-Kt,jt)-Ye.tw0),$t=Ye.twHi-Ye.tw0,Bt=Ye.twLo-Ye.tw0,Ct=(Ot>0?$t*Math.tanh(Ot/$t):Bt*Math.tanh(Ot/Bt))*ge(h0,2.2,Math.abs(Ot)),Zt=Ye.tw0+ge(.1,.4,Math.hypot(Kt,jt))*Ct;Me=o.init||!(n>0)?o.init?Zt:o.tau:Pt(o.tau,Zt,16,n)}const Et=Math.cos(Me),Ut=Math.sin(Me),Xt=f.add(f.mul(Te,Et),f.mul(De,-Ut));Ue=f.add(f.mul(De,Et),f.mul(Te,Ut));let _t=Math.atan2(f.dot(d,Xt),f.dot(d,g));_t<-h0/2&&(_t+=It);const m0=Math.asin(it(f.dot(d,Ue),-1,1)),r0=_t-ht;rt=r0<0?Math.max(r0*.72,-Ye.wU):Math.min(r0*.35,Ye.wR),wt=it(r0-rt,-Ye.pBack,Ye.pFwd);const Ft=r0-rt-wt;rt=it(rt+Ft*Re(.15,1,W),-.78-1.2*W,.6+1.15*W),Ze=it(m0,-Ye.skew,Ye.skew),Ze+=(m0-Ze)*W;const Lt=Math.cos(ht+rt),yt=Math.sin(ht+rt);$=f.add(f.mul(g,Lt),f.mul(Xt,yt)),ve=f.cross(Ue,$);const Rt=ht+rt+wt,Vt=Math.cos(Ze);xe=f.norm(f.add(f.add(f.mul(g,Math.cos(Rt)*Vt),f.mul(Xt,Math.sin(Rt)*Vt)),f.mul(Ue,Math.sin(Ze)))),ct=f.mad(i,$,ae.piv),R=f.add(i,f.add(f.add(f.mul(Ue,E[0]),f.mul($,E[1])),f.mul(ve,E[2])))}o.tau=Me,o.twist=Math.atan2(f.dot(Ue,Te),f.dot(Ue,De)),o.dW=rt,o.dP=wt,o.bS=Ze,o.open=ge(.1,.75,wt)*1.5,o.bend=Math.acos(it(f.dot(f.norm(f.sub(M,p)),g),-1,1)),o.S=p,o.E=M,o.W=R,o.G=i,o.hx=Ue,o.hy=$,o.hz=ve,o.ap=xe,o.f=g,o.Xf=De,o.Yf=Te;const Mt=f.norm(f.sub(p,M)),ft=f.norm(f.sub(De,f.mul(Mt,f.dot(De,Mt)))),dt=f.mul(g,-1);o.m[0]=Wt.fromBasis(ft,f.cross(Mt,ft),Mt,p),o.m[1]=Wt.fromBasis(De,Te,dt,f.mad(M,dt,F));const gt=f.add(f.mul($,D),f.mul(ve,be)),bt=f.add(f.mul($,-be),f.mul(ve,D));o.m[2]=Wt.fromBasis(Ue,gt,bt,f.mad(R,bt,Y));const Xe=f.norm(f.sub(ve,f.mul(xe,f.dot(ve,xe)))),et=f.mad(ct,xe,-ae.piv);return o.m[3]=Wt.mul(Wt.fromBasis(f.cross(xe,Xe),xe,Xe,et),_),o.tip=f.mad(et,xe,-ae.len),o.O=et,o}e.solveArm=Se,e.LIM=Ye;const me=o=>({sg:o,init:!0,init0:!0,tau:Ye.tw0,dW:0,dP:0,bS:0,open:0,bend:0,o:[0,0,0],ov:[0,0,0],pd:[0,0],pdv:[0,0],m:[null,null,null,null,null],ski:null}),B=[me(1),me(-1)],U=(o,p)=>p>0?o:[-o[0],o[1],o[2]],A=o=>{const p=o.slice();return p[1]=-p[1],p[2]=-p[2],p[4]=-p[4],p[8]=-p[8],p[12]=-p[12],p},a={v:null,a:[0,0,0],dt:0,own:1,snow:.22,slide:0};e.sides=B,e.phys=a,e.pose=function(o,p,i){const y=o.J,j=typeof a0<"u"?a0:null,W=typeof zt<"u"?zt:null,h=W&&W.s,n=W&&W.pose||{};if(h&&i>0){const Te=f.norm(p.nrm),Me=f.norm(f.cross(Te,f.mul(p.fwd,-1))),rt=f.cross(Me,Te),wt=h.v;if(a.v){const Ze=1/i,ct=it((wt[0]-a.v[0])*Ze,-60,60),Mt=it((wt[1]-a.v[1])*Ze,-60,60),ft=it((wt[2]-a.v[2])*Ze,-60,60),dt=1-Math.exp(-i*30),gt=[Me[0]*ct+Me[1]*Mt+Me[2]*ft,Te[0]*ct+Te[1]*Mt+Te[2]*ft,rt[0]*ct+rt[1]*Mt+rt[2]*ft];for(let bt=0;bt<3;bt++)a.a[bt]+=(gt[bt]-a.a[bt])*dt}a.v=[wt[0],wt[1],wt[2]]}else h||(a.a[0]=a.a[1]=a.a[2]=0);const d=mt(n.tuck||0),M=a.own,g=n.dp||0,R=ge(0,.7,e.tk||0),Ue=g>0?(1-d)*(1-mt(n.air||0))*(1-ge(.14,.5,Math.abs(n.lean||0))):0,$=Ue>0?ge(0,.12,g)*ge(.5,.24,g)*Ue:0,ve=Ue>0?ge(.22,.46,g)*ge(.62,.5,g)*Ue:0;for(let Te=0;Te<2;Te++){const Me=B[Te],rt=Me.sg,wt=rt>0?"R":"L",Ze=mt(y["planted"+wt]||0),ct=U(y["sh"+wt],rt),Mt=U(y["elbow"+wt],rt),ft=U(y["grip"+wt],rt),dt=U(y["poleD"+wt],rt),gt=U(y["tip"+wt],rt),bt=U(a.a,rt);if(Me.init||!(i>0))Me.o[0]=Me.o[1]=Me.o[2]=0,Me.ov[0]=Me.ov[1]=Me.ov[2]=0,Me.pd[0]=Me.pd[1]=0,Me.pdv[0]=Me.pdv[1]=0;else{const ze=(1-.7*Ze)*(1-.6*d),pt=[.003,.0042,.0026];for(let Tt=0;Tt<3;Tt++){const Et=it(-bt[Tt]*pt[Tt],-.07,.07)*ze;Me.ov[Tt]=(Me.ov[Tt]+15*15*(Et-Me.o[Tt])*i)/(1+2*.5*15*i+15*15*i*i),Me.o[Tt]=it(Me.o[Tt]+Me.ov[Tt]*i,-.09,.09)}const ut=11,xt=.32,lt=(1-Ze)*(1-d);for(let Tt=0;Tt<2;Tt++){const Et=it(-(Tt?bt[2]:bt[0])*.011-Me.ov[Tt?2:0]*.35,-.16,.16)*lt;Me.pdv[Tt]=(Me.pdv[Tt]+ut*ut*(Et-Me.pd[Tt])*i)/(1+2*xt*ut*i+ut*ut*i*i),Me.pd[Tt]=it(Me.pd[Tt]+Me.pdv[Tt]*i,-.22,.22)*(Ze>=1?0:1)}}let Xe=f.mad(ft,Me.o,M),et=f.norm([dt[0]+Me.pd[0]*M,dt[1],dt[2]+Me.pd[1]*M]);if(R>0&&(Xe[0]+=.1*R,Xe[1]-=.45*R,Xe[2]+=.32*R),Ze>0){const tt=f.sub(Xe,gt),Oe=f.len(tt)||1,ze=f.len(f.sub(ft,gt));Xe=f.lerp(Xe,f.mad(gt,tt,ze/Oe),Ze)}($>0||ve>0)&&(Xe[0]+=(.15*$+.16*ve)*M,Xe[1]+=.21*$*M,Xe[2]-=(.16*$+.22*ve)*M),Se(Me,ct,Xe,et,Mt,Ze,gt,i),Me.init=!1,Me.hold=Ze,Me.M=Me.M||[];for(let tt=0;tt<4;tt++)Me.M[tt]=rt>0?Me.m[tt]:A(Me.m[tt]);Me.foot=o.F[j?j.B["foot"+wt]:rt>0?15:12],Me.tipW=U(Me.tip,rt)}{const Te=h?(O().sink||0)*ge(.3,.6,mt(h.powder||0))*(e.tk||0)*(h.air?0:1):0;a.sink=i>0&&!B[0].init0?Pt(a.sink||0,Te,9,i):Te}ie(i);const xe=O(),De=e.tk||0;for(let Te=0;Te<2;Te++){const Me=B[Te].foot.slice(),rt=a.slide,wt=B[Te].sg;if(De>0){const Ze=(xe.gather||0)*De,ct=Math.atan2(Me[4],Me[5]),Mt=ct*(xe.flat||0)*De,ft=Math.cos(Mt),dt=Math.sin(Mt);for(let gt=0;gt<3;gt++){const bt=Me[gt],Xe=Me[4+gt];Me[gt]=bt*ft+Xe*dt,Me[4+gt]=Xe*ft-bt*dt}Me[12]-=wt*xe.close*De+Ze*(Me[12]-wt*.16),Me[13]-=.049*(Math.sin(Math.abs(ct))-Math.sin(Math.abs(ct-Mt))),Me[14]*=1-.6*Ze}Me[12]-=Me[8]*rt,Me[13]-=Me[9]*rt+a.sink,Me[14]-=Me[10]*rt,B[Te].M[4]=Me}e.posed=!0};const oe={y:-.7,max:.46,out:2.2,back:7},fe={slideY:-.5,slideMax:.3,close:.04,lens:.06,blur:.04,sink:.02,gather:1,flat:.55},O=()=>typeof zt<"u"&&zt.viewDefs&&zt.viewDefs.tips&&zt.viewDefs.tips.lens!=null?zt.viewDefs.tips:fe;function ie(o){let p=0;const i=e.tk||0,y=Re(oe.max,O().slideMax,i);try{const j=qt.cam,W=a0.world.root,h=qt.origin||[0,0,0],n=B[0].foot,d=B[1].foot;if(j&&j.up&&W&&n&&d){const M=Wt.tp(W,[(n[12]+d[12])*.5+(n[4]+d[4])*.0685-(n[8]+d[8])*.4775,(n[13]+d[13])*.5+(n[5]+d[5])*.0685-(n[9]+d[9])*.4775,(n[14]+d[14])*.5+(n[6]+d[6])*.0685-(n[10]+d[10])*.4775]),g=[-(n[8]+d[8])*.5,-(n[9]+d[9])*.5,-(n[10]+d[10])*.5],R=[W[0]*g[0]+W[4]*g[1]+W[8]*g[2],W[1]*g[0]+W[5]*g[1]+W[9]*g[2],W[2]*g[0]+W[6]*g[1]+W[10]*g[2]],Ue=[M[0]-j.pos[0]+h[0],M[1]-j.pos[1]+h[1],M[2]-j.pos[2]+h[2]],$=Re(oe.y,O().slideY,i)*Math.tan(j.fovY/2),ve=f.dot(Ue,j.up),xe=f.dot(R,j.up),De=f.dot(Ue,j.fwd),Te=f.dot(R,j.fwd),Me=xe-$*Te,rt=De>.15&&Me>.05?($*De-ve)/Me:ve<0?y:0;p=N0.smin(-N0.smin(-rt,0,.06),y,.1)}}catch(j){p=0}a.slide=B[0].init0||!(o>0)?B[0].init0?p:a.slide:Pt(a.slide,p,p<a.slide?oe.back:oe.out,o),B[0].init0=!1,a.slideWant=p}e.SLIDE=oe;const ce=re([X[0],0,X[1]]),He=[0,D,-be];function We(o,p,i,y,j,W){const h=Math.exp(-Math.pow((o-F)/.062,2)),n=Math.max(Math.sin(p),0),d=mt(i/1.9);let M=.0065*d*h*Math.pow(n,1.5)*Math.cos((o-F)*It/.031+1.3*Math.sin(p*2))-.0035*d*h*Math.max(-Math.sin(p),0);const g=ge(F-.02,F+.06,o)*ge(Y-.035,Y-.075,o),R=ge(.03,.1,o)*ge(F+.01,F-.07,o);return M+=.003*g*it(y,-1.2,1.2)*Math.sin(p*2+(o-F)*26*(y<0?-1:1)),M+=.0032*(g+R)*(Math.sin(p*3+o*31)*Math.sin(o*47+1.7)+.6*Math.sin(p*2-o*23+.8)),M+=.004*ge(Y-.13,Y-.07,o)*ge(z,z-.012,o)*Math.sin(p*5+9*o+2*Math.sin(o*140)),M+=.003*j*(g+R)*Math.sin(p*3+o*38-W*31)*Math.sin(p-W*13+o*9),M*ge(-.02,.05,o)}e.fold=We,e.cpuVertex=function(o,p,i,y){const j=e.mesh.V,W=o*s;let h=j[W],n=j[W+1],d=j[W+2],M=j[W+3],g=j[W+4],R=j[W+5];const Ue=j[W+6],$=j[W+10],ve=j[W+11],xe=j[W+12],De=j[W+13],Te=$>=5?1:0,Me=Te?-1:1;if(Ue===2&&j[W+8]>0){const gt=-p.open[Te]*j[W+8]*Me,bt=Math.cos(gt),Xe=Math.sin(gt),et=0,tt=He[1],Oe=He[2],ze=h-ce[0]*Me,pt=n-ce[1],ut=d-ce[2],xt=(Et,Ut,Xt)=>{const _t=(tt*Ut+Oe*Xt)*(1-bt);return[Et*bt+(tt*Xt-Oe*Ut)*Xe+et*_t,Ut*bt+Oe*Et*Xe+tt*_t,Xt*bt+-tt*Et*Xe+Oe*_t]},lt=xt(ze,pt,ut),Tt=xt(M,g,R);h=lt[0]+ce[0]*Me,n=lt[1]+ce[1],d=lt[2]+ce[2],M=Tt[0],g=Tt[1],R=Tt[2]}if(Ue===1&&j[W+8]<.5){const gt=j[W+14],bt=j[W+15],Xe=Math.max(j[W+16],.01),et=.004,tt=We(gt,bt,p.bend[Te],p.tw[Te]*Me,p.fl,p.t),Oe=(We(gt+et,bt,p.bend[Te],p.tw[Te]*Me,p.fl,p.t)-tt)/et,ze=(We(gt,bt+.06,p.bend[Te],p.tw[Te]*Me,p.fl,p.t)-tt)/(.06*Xe);h+=M*tt,n+=g*tt,d+=R*tt;const pt=-Math.sin(bt)*Me,ut=Math.cos(bt);let xt=M-ze*pt,lt=g-ze*ut,Tt=R+Oe;const Et=Math.hypot(xt,lt,Tt)||1;M=xt/Et,g=lt/Et,R=Tt/Et}let rt=h,wt=n,Ze=M,ct=g;if(De>0){const gt=p.tw[Te]*De,bt=Math.cos(gt),Xe=Math.sin(gt);rt=h*bt-n*Xe,wt=h*Xe+n*bt,Ze=M*bt-g*Xe,ct=M*Xe+g*bt}const Mt=i[$],ft=i[ve],dt=1-xe;return y[0]=(Mt[0]*rt+Mt[4]*wt+Mt[8]*d+Mt[12])*xe+(ft[0]*h+ft[4]*n+ft[8]*d+ft[12])*dt,y[1]=(Mt[1]*rt+Mt[5]*wt+Mt[9]*d+Mt[13])*xe+(ft[1]*h+ft[5]*n+ft[9]*d+ft[13])*dt,y[2]=(Mt[2]*rt+Mt[6]*wt+Mt[10]*d+Mt[14])*xe+(ft[2]*h+ft[6]*n+ft[10]*d+ft[14])*dt,y[3]=(Mt[0]*Ze+Mt[4]*ct+Mt[8]*R)*xe+(ft[0]*M+ft[4]*g+ft[8]*R)*dt,y[4]=(Mt[1]*Ze+Mt[5]*ct+Mt[9]*R)*xe+(ft[1]*M+ft[5]*g+ft[9]*R)*dt,y[5]=(Mt[2]*Ze+Mt[6]*ct+Mt[10]*R)*xe+(ft[2]*M+ft[6]*g+ft[10]*R)*dt,y},e.uniforms=function(o){return{tw:[B[0].twist,-B[1].twist],open:[B[0].open,B[1].open],bend:[B[0].bend,B[1].bend],fl:a.fl||0,t:o||0}},e.bones=function(){const o=[];for(let p=0;p<2;p++)for(let i=0;i<5;i++)o[p*5+i]=B[p].M[i];return o};let Qe=null,st=null,Le=null,r=null,q=null,k=null,ee=null,Z=null,K=null,ue=0,G=null,Ae=null,_e=0;const at=[[0,0,0,0],[0,0,0,0]],ot=new Float32Array(4*16*4),t=new Float32Array(4*32*4),S={tw:[0,0,0,0],bend:[0,0,0,0],ski:[0,0,0,0],fx:[0,0,0,0]},l=o=>{if(!e.dead){e.dead=!0,e.vis=!1,e.err=o;try{console.error("fpv: first person falls back to the figure's own arms",o)}catch(p){}}};e.figIdx=function(){const o=a0.mesh,p=[];for(let i=0;i<o.ni;i+=3){const y=o.V[o.I[i]*10+6];y!==9&&y!==10&&y!==2&&p.push(o.I[i],o.I[i+1],o.I[i+2])}return new Uint32Array(p)};function u(){const o=typeof a0<"u"&&a0.LOOK||{},p=(h,n)=>"vec3f("+(o[h]&&o[h].alb||n).map(M=>(+M).toFixed(4)).join(", ")+")",i=h=>(+h).toFixed(5),y=`
const ORANGE: vec3f = ${p("jacket",[.95,.255,.026])}; const NAVY: vec3f = ${p("sleeveFore",[.018,.03,.055])}; const PALE: vec3f = ${p("sleeveBand",[.86,.87,.85])};
const SKI_Y: vec3f = ${p("ski",[.93,.78,.035])}; const SKI_L: vec3f = ${p("skiTip",[.42,.8,.04])}; const SKI_K: vec3f = ${p("skiMark",[.018,.02,.026])};
const GLOVE: vec3f = ${p("glove",[.018,.018,.02])}; const SHAFT: vec3f = ${p("pole",[.015,.015,.015])}; const GRIP: vec3f = ${p("poleGrip",[.95,.255,.026])}; const BASKET: vec3f = ${p("poleBasket",[.05,.055,.065])};
fn fpvBone(i: f32) -> mat4x4f { let r: i32 = i32(i + 0.5); return mat4x4f(texFetch(tBones, vec2i(0, r), 0), texFetch(tBones, vec2i(1, r), 0), texFetch(tBones, vec2i(2, r), 0), texFetch(tBones, vec2i(3, r), 0)); }
// the shell's folds, metres out along the normal. s: metres from the shoulder; th: angle round the arm (the inside of the elbow at a quarter turn)
fn fpvFold(s: f32, th: f32, bend: f32, tw: f32, fl: f32, t: f32) -> f32 {
  let q: f32 = (s - ${i(F)}) / 0.062; let el: f32 = exp(-q * q); let ins: f32 = max(sin(th), 0.0); let b: f32 = saturate(bend / 1.9);
  var h: f32 = 0.0065 * b * el * pow(ins, 1.5) * cos((s - ${i(F)}) * 202.683 + 1.3 * sin(th * 2.0)) - 0.0035 * b * el * max(-sin(th), 0.0);
  let fa: f32 = smoothstep(${i(F-.02)}, ${i(F+.06)}, s) * smoothstep(${i(Y-.035)}, ${i(Y-.075)}, s); let ua: f32 = smoothstep(0.03, 0.10, s) * smoothstep(${i(F+.01)}, ${i(F-.07)}, s);
  h += 0.0030 * fa * clamp(tw, -1.2, 1.2) * sin(th * 2.0 + (s - ${i(F)}) * 26.0 * sign(tw));
  h += 0.0032 * (fa + ua) * (sin(th * 3.0 + s * 31.0) * sin(s * 47.0 + 1.7) + 0.6 * sin(th * 2.0 - s * 23.0 + 0.8));
  h += 0.0040 * smoothstep(${i(Y-.13)}, ${i(Y-.07)}, s) * smoothstep(${i(z)}, ${i(z-.012)}, s) * sin(th * 5.0 + 9.0 * s + 2.0 * sin(s * 140.0));
  h += 0.0030 * fl * (fa + ua) * sin(th * 3.0 + s * 38.0 - t * 31.0) * sin(th - t * 13.0 + s * 9.0);
  return h * smoothstep(-0.02, 0.05, s);
}`,j=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  var p: vec3f = a.pos; var nn: vec3f = a.nrm;
  let id: f32 = floor(a.mat.x + 0.5); let left: f32 = step(4.5, a.bw.x); let sg: f32 = 1.0 - 2.0 * left;
  let tw: f32 = mix(M.tw.x, M.tw.y, left); let opn: f32 = mix(M.tw.z, M.tw.w, left); let bend: f32 = mix(M.bend.x, M.bend.y, left);
  if (id > 1.5 && id < 2.5 && a.mat.z > 0.0) {
    // the lower fingers letting the pole swing: a turn about the knuckles' line
    let ang: f32 = -opn * a.mat.z * sg; let c: f32 = cos(ang); let s: f32 = sin(ang);
    let k: vec3f = vec3f(0.0, ${i(He[1])}, ${i(He[2])}); let o: vec3f = vec3f(${i(ce[0])} * sg, ${i(ce[1])}, ${i(ce[2])}); let q: vec3f = p - o;
    p = o + q * c + cross(k, q) * s + k * (dot(k, q) * (1.0 - c)); nn = nn * c + cross(k, nn) * s + k * (dot(k, nn) * (1.0 - c));
  }
  if (id > 0.5 && id < 1.5 && a.mat.z < 0.5) {
    // the shell's folds: pushed out along the normal, the normal leaned to match
    let s: f32 = a.uv.x; let th: f32 = a.uv.y; let r: f32 = max(a.uv.z, 0.01); let twr: f32 = tw * sg;
    let h0: f32 = fpvFold(s, th, bend, twr, M.bend.z, M.bend.w);
    let hs: f32 = (fpvFold(s + 0.004, th, bend, twr, M.bend.z, M.bend.w) - h0) / 0.004; let ht: f32 = (fpvFold(s, th + 0.06, bend, twr, M.bend.z, M.bend.w) - h0) / (0.06 * r);
    p += nn * h0; nn = normalize(vec3f(nn.x + ht * sin(th) * sg, nn.y - ht * cos(th), nn.z + hs));
  }
  if (id > 7.5) {
    // a ski's tip is never still: it flutters with the snow going under it
    let g: f32 = smoothstep(-0.30, -0.96, p.z); let amp: f32 = mix(M.ski.x, M.ski.y, left);
    p.y += amp * g * g; nn = normalize(vec3f(nn.x, nn.y, nn.z + nn.y * amp * 5.5 * g * (1.0 - g)));
  }
  // (branch a takes the forearm's twist: a turn about the arm's own line)
  var pa: vec3f = p; var na: vec3f = nn;
  if (a.bw.w > 0.0) { let ang: f32 = tw * a.bw.w; let c: f32 = cos(ang); let s: f32 = sin(ang); pa = vec3f(p.x * c - p.y * s, p.x * s + p.y * c, p.z); na = vec3f(nn.x * c - nn.y * s, nn.x * s + nn.y * c, nn.z); }
  let m0: mat4x4f = fpvBone(a.bw.x); let m1: mat4x4f = fpvBone(a.bw.y);
  let w0: vec4f = m0 * vec4f(pa, 1.0); let w1: vec4f = m1 * vec4f(p, 1.0); let n0: vec4f = m0 * vec4f(na, 0.0); let n1: vec4f = m1 * vec4f(nn, 0.0);
  v.wp = mix(w1.xyz, w0.xyz, a.bw.z); v.nrm = normalize(mix(n1.xyz, n0.xyz, a.bw.z));
  // (the left arm is the right one in a mirror: what is scattered over it is looked up somewhere else, or the two would wear the same snow)
  v.bp = a.pos + vec3f(0.0, 0.41, 0.23) * left; v.bn = a.nrm; v.mat = a.mat; v.uv = a.uv; v.clip = U.viewProj * vec4f(v.wp, 1.0);
  return v;
}`,W=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let id: f32 = floor(v.mat.x + 0.5);
  var N: vec3f = normalize(v.nrm);
  let V: vec3f = normalize(U.camPos.xyz - v.wp);
  let L: vec3f = U.sunDir.xyz;
  let px: f32 = (length(dpdx(v.wp)) + length(dpdy(v.wp))) * 0.5 + 0.00002;      // metres to a pixel here: what the fine drawing below is softened by
  let fine: f32 = saturate(1.7 - px / 0.0012);
  let bp: vec3f = v.bp; let uv: vec4f = v.uv;
  let weave: vec4f = tex(tDetail, bp.xy * 3.1 + bp.zz * vec2f(2.3, 1.7));
  let grain: vec4f = tex(tDetail, bp.xy * 19.0 + bp.zz * vec2f(13.0, 11.0));
  // (the same lumpy field seen from three sides and joined by which way the surface faces: what lies on it must not be drawn out along it)
  let b3: vec3f = pow(abs(normalize(v.bn)), vec3f(3.0));
  let lump: f32 = (tex(tDetail, bp.yz * 8.5 + vec2f(0.37, 0.11)).z * b3.x + tex(tDetail, bp.zx * 8.5 + vec2f(0.71, 0.43)).z * b3.y + tex(tDetail, bp.xy * 8.5).z * b3.z) / (b3.x + b3.y + b3.z + 1e-4);
  let lumpF: f32 = (tex(tDetail, bp.yz * 23.0 + vec2f(0.13, 0.57)).z * b3.x + tex(tDetail, bp.zx * 23.0 + vec2f(0.29, 0.83)).z * b3.y + tex(tDetail, bp.xy * 23.0 + vec2f(0.61, 0.19)).z * b3.z) / (b3.x + b3.y + b3.z + 1e-4);
  let flw: f32 = tex(tDetail, vec2f(uv.x * 6.0 + 0.3, (uv.y - M.fx.w) * 2.6)).z;       // (the skis': the snow that streams back over them)
  var bury: f32 = 0.0;       // how deep under that snow this bit of a ski is
  var flu: f32 = 0.0;        // fluorescent ink: how much of it
  var alb: vec3f = vec3f(0.5); var specP: f32 = 20.0; var specS: f32 = 0.03; var sheen: f32 = 0.0; var gloss: f32 = 0.0; var cloth: f32 = 0.0;
  var envS: f32 = 0.0;       // how much of the sky and of the bright snow all round it throws back, blurred (leather, rubber, a coated shell)
  let dmw: f32 = length(vec2f(dpdx(v.mat.w), dpdy(v.mat.w))) + 1e-5;
  var hgt: f32 = 0.0;        // small relief, metres: seams, stitches, ribs (turned into a lean of the normal further down)
  var gr: f32 = 0.0;         // how much the fine grain leans the normal
  var snowy: f32 = 0.0;      // how readily snow stays on it
  var dk: f32 = 0.5;         // how white the dusting of it gets (cloth holds it; a waxed ski hardly does)
  var ao: f32 = v.mat.y;
  if (id < 1.5) {
    let s: f32 = uv.x; let th: f32 = uv.y; let r: f32 = max(uv.z, 0.02); let zone: f32 = v.mat.z;
    if (zone < 0.5) {
      // the shell: the figure's jacket (orange, navy forearms, the pale band round the upper arm)
      let fore: f32 = smoothstep(${i(F+.035)}, ${i(F+.065)}, s) * (1.0 - M.ski.w);      // (the new body, Variants 'body' b: orange to the cuff, the navy storm cuff over the glove is all that is left of it)
      alb = mix(ORANGE * (1.0 - 0.2 * M.ski.w), NAVY, fore); alb = mix(alb, PALE, smoothstep(0.016, 0.011, abs(s - 0.150)) * (1.0 - fore));
      // ripstop: a heavier thread every few millimetres, both ways
      let g: vec2f = abs(fract(vec2f(s, th * r) / 0.0042) - 0.5); let rip: f32 = smoothstep(0.38, 0.47, max(g.x, g.y)) * fine * mix(1.0, smoothstep(0.0014, 0.0007, px), M.ski.w);
      alb *= 1.0 - mix(0.14, 0.04, M.ski.w) * rip; hgt += mix(0.00012, 0.00005, M.ski.w) * rip;     // (new body: a faint grid, gone before it is under three pixels)
      // the seam along the top of the arm, piped in the band's pale cloth so that it catches the light, a row of stitches either side
      let sa: f32 = abs(fract((th - 1.25) / 6.28319 + 0.5) - 0.5) * 6.28319 * r; let along: f32 = smoothstep(0.02, 0.05, s) * smoothstep(${i(z-.004)}, ${i(z-.012)}, s);
      let pipg: f32 = smoothstep(0.0020 + px, 0.0020 - px, sa) * along;
      alb = mix(alb, PALE * 0.92, pipg); hgt += 0.0008 * pipg * saturate(1.0 - sa * sa / 0.000004);
      let stt: f32 = smoothstep(0.0008 + px, 0.0008 - px, abs(sa - 0.0054)) * step(0.42, fract(s / 0.0034)) * along * fine;
      alb = mix(alb, alb * 0.45 + 0.02, stt); hgt -= 0.00010 * stt;
      // the cuff: a row of stitches round the hem, and the tab that draws it in (rubber, a pale pull at its end)
      let hst: f32 = smoothstep(0.0008 + px, 0.0008 - px, abs(s - ${i(z-.0075)})) * step(0.42, fract(th * r / 0.0034)) * fine;
      alb = mix(alb, alb * 0.45 + 0.02, hst);
      let tab: f32 = smoothstep(0.25, 0.60, v.mat.w); let ta: f32 = fract((th - ${i(I[1])}) / 6.28319 + 0.5) - 0.5;
      alb = mix(alb, mix(ORANGE * 0.80, PALE * 0.9, smoothstep(0.045, 0.052, ta)), tab);
      hgt *= 1.0 - tab; sheen = mix(0.5, 0.12, tab); cloth = 1.0 - tab; specS = mix(0.05, 0.30, tab); specP = mix(28.0, 45.0, tab); gr = 0.0; snowy = 0.55; envS = mix(0.22, 0.35, tab);
    } else if (zone < 1.5) { alb = NAVY * 0.5; cloth = 1.0; }
    else {
      // the storm cuff that runs on from under the hem over the glove's own cuff: stretch knit, ribbed along the arm, its end bound in the pale cloth
      // (the ribs are dropped before they are finer than the picture can hold)
      let ribw: f32 = 6.28319 * r / 46.0; let rib: f32 = 0.5 + 0.5 * cos(th * 46.0); let rk: f32 = saturate(2.2 - px / (ribw * 0.25));
      alb = (NAVY * 1.7 + vec3f(0.008, 0.009, 0.011)) * (1.0 - 0.40 * (1.0 - rib) * rk); hgt += 0.00030 * rib * rk;
      alb = mix(alb, PALE * 0.8, smoothstep(${i(V-.0052)}, ${i(V-.0038)}, s));
      sheen = 0.35; cloth = 1.0; specS = 0.03; snowy = 0.8; envS = 0.06;
    }
  } else if (id < 2.5) {
    let q: vec3f = uv.xyz; let back: f32 = smoothstep(-0.10, 0.45, v.mat.w); let fing: f32 = smoothstep(0.3, 0.8, uv.w);
    let hu: f32 = (q.y - ${i(E[1])}) * ${i(qe[1])} + (q.z - ${i(E[2])}) * ${i(qe[2])}; let hv: f32 = (q.y - ${i(E[1])}) * ${i(se[1])} + (q.z - ${i(E[2])}) * ${i(se[2])};
    // (round the grip: 0 at the knuckles, on round the front of it to the fingertips; and how far out from it)
    let a0: f32 = atan2(-q.z, q.x); let ang: f32 = a0 + step(a0, -1.2) * 6.28319; let rad: f32 = length(q.xz);
    // black leather round the palm, the thumb, the fingers' fronts and their tips; a woven charcoal shell over the back of the hand and of the fingers
    let tipk: f32 = fing * smoothstep(2.30, 2.62, ang);
    let shell: f32 = mix(back, smoothstep(0.0362, 0.0398, rad), fing) * (1.0 - tipk);
    alb = mix(vec3f(0.020, 0.020, 0.022), vec3f(0.046, 0.049, 0.057), shell) * (0.80 + 0.40 * grain.z);
    specS = mix(0.38, 0.06, shell); specP = mix(38.0, 24.0, shell); sheen = mix(0.10, 0.45, shell); cloth = shell * 0.8; gr = mix(0.55, 0.25, shell); snowy = mix(0.30, 0.75, shell); envS = mix(0.60, 0.12, shell);
    // the seam where the two meet, piped in the pale cloth: round the hand, and down both sides of every finger
    let sd0: f32 = mix(abs(v.mat.w - 0.17) * px / dmw, abs(rad - 0.0380), fing);
    let pipe: f32 = smoothstep(0.0009 + px, 0.0009 - px, sd0) * (1.0 - tipk) * mix(smoothstep(-0.014, 0.002, hu), 1.0, fing);
    // the backs of the fingers are quilted across: padded rolls between rows of stitching
    let qk: f32 = fing * shell; let roll: f32 = 0.5 + 0.5 * cos(ang * 14.0 - 0.6);
    hgt += 0.0008 * qk * roll; alb *= 1.0 - 0.30 * qk * smoothstep(0.30, 0.0, roll);
    // the leather creases across each finger where its joints fold
    let crs: f32 = fing * (1.0 - shell) * (smoothstep(0.075, 0.0, abs(ang - 1.90)) + smoothstep(0.075, 0.0, abs(ang - 2.80)));
    hgt -= 0.0006 * crs; alb *= 1.0 - 0.35 * crs;
    // a patch of tougher hide where the strap and the grip wear: over the ball of the thumb, stitched all round
    let rp: f32 = length(vec3f(q.x + 0.010, (q.y - 0.014) * 0.72, q.z - 0.034)); let lth: f32 = (1.0 - shell) * (1.0 - fing);
    let tough: f32 = smoothstep(0.0272, 0.0252, rp) * lth;
    alb = mix(alb, vec3f(0.056, 0.053, 0.050) * (0.72 + 0.56 * grain.z), tough); specS = mix(specS, 0.20, tough); envS = mix(envS, 0.30, tough); hgt += 0.00035 * tough;
    let pst: f32 = smoothstep(0.0008 + px, 0.0008 - px, abs(rp - 0.0234)) * step(0.42, fract(atan2(q.y - 0.014, q.z - 0.034) * 7.0)) * lth * fine;
    alb = mix(alb, vec3f(0.21, 0.21, 0.22), pst * 0.9); hgt -= 0.00010 * pst;
    // the soft patch along the top of the thumb (to wipe the goggles with)
    let wipe: f32 = smoothstep(0.0580, 0.0608, q.y) * smoothstep(0.056, 0.048, q.z) * (1.0 - fing);
    alb = mix(alb, vec3f(0.088, 0.089, 0.094) * (0.85 + 0.3 * weave.z), wipe); specS = mix(specS, 0.02, wipe); envS *= 1.0 - wipe; sheen = mix(sheen, 0.65, wipe); cloth = max(cloth, wipe); gr *= 1.0 - wipe;
    // the moulded guard across the knuckles
    let kg: f32 = smoothstep(0.0405, 0.0425, q.x) * smoothstep(0.0165, 0.0135, abs(q.z + 0.0085)) * smoothstep(0.050, 0.046, abs(q.y - 0.0005));
    alb = mix(alb, vec3f(0.066, 0.068, 0.074), kg); specS = mix(specS, 0.55, kg); specP = mix(specP, 60.0, kg); sheen *= 1.0 - kg; cloth *= 1.0 - kg; gr *= 1.0 - 0.7 * kg; envS = mix(envS, 0.85, kg);
    // the padded panel on the back of the hand: piped round its edge in the pale cloth, the maker's two peaks printed on it in white
    let pd: vec2f = abs(vec2f(hv - 0.002, hu - 0.056)) - vec2f(0.027, 0.015); let pe: f32 = length(max(pd, vec2f(0.0))) + min(max(pd.x, pd.y), 0.0);
    let onb: f32 = smoothstep(0.036, 0.040, q.x);
    let pipg: f32 = smoothstep(0.0012 + px, 0.0012 - px, abs(pe - 0.0028)) * onb;
    hgt += 0.0005 * pipg;
    let lu: f32 = hu - 0.056; let lv: f32 = hv - 0.002;
    let m1: f32 = max(abs(lu - 0.0062 + 1.3 * abs(lv + 0.0040)) * 0.61, abs(lv + 0.0040) - 0.0088); let m2: f32 = max(abs(lu - 0.0022 + 1.3 * abs(lv - 0.0062)) * 0.61, abs(lv - 0.0062) - 0.0060);
    let logo: f32 = smoothstep(0.0011 + px, 0.0011 - px, min(m1, m2)) * step(-0.0056, lu) * onb;
    alb = mix(alb, PALE * 0.85, max(pipg * 0.9, pipe * 0.85)); alb = mix(alb, vec3f(0.80, 0.81, 0.80), logo); specS = mix(specS, 0.25, logo); cloth *= 1.0 - logo;
    hgt += 0.0004 * pipe;
    // the fingers' panels: a row of pale stitches either side of each groove between them
    let d0: f32 = min(min(abs(q.y - 0.0208), abs(q.y + 0.0008)), abs(q.y + 0.0218));
    let stt: f32 = smoothstep(0.0007 + px, 0.0007 - px, abs(d0 - 0.0044)) * fing * (1.0 - shell) * step(0.42, fract(ang * 9.0)) * fine;
    alb = mix(alb, vec3f(0.17, 0.17, 0.18), stt * 0.85); hgt += 0.00012 * stt;
  } else if (id < 4.5) {
    // the leash: webbing, a herringbone weave with a stripe of the jacket's colour down its middle
    let hb: f32 = 0.5 + 0.5 * sin((uv.x * 520.0 + abs(uv.y) * 2.4) * 6.28319);
    alb = vec3f(0.050, 0.051, 0.056) * (0.70 + 0.55 * hb * fine); hgt += 0.00010 * hb * fine;
    alb = mix(alb, ORANGE * 0.85, smoothstep(0.20, 0.14, abs(uv.y)) * step(0.0, uv.z));
    specS = 0.10; specP = 22.0; sheen = 0.25; cloth = 1.0; snowy = 0.8; envS = 0.10;
  } else if (id < 5.5) {
    let part: f32 = v.mat.z; let y: f32 = uv.x; let th: f32 = uv.y; let yy: f32 = -y;
    if (part < 0.5) {
      // the grip: moulded rubber in the jacket's colour under a dark cap
      alb = GRIP * (0.78 + 0.30 * grain.z); specS = 0.14; specP = 18.0; gr = 0.4; envS = 0.30;
      let cap: f32 = smoothstep(0.0735, 0.0755, y); alb = mix(alb, vec3f(0.028, 0.029, 0.033), cap); specS = mix(specS, 0.55, cap); specP = mix(specP, 55.0, cap); gr *= 1.0 - cap;
      let low: f32 = smoothstep(-0.0535, -0.0555, y); alb = mix(alb, vec3f(0.028, 0.029, 0.033), low); specS = mix(specS, 0.45, low);
    } else if (part < 1.5) {
      // the shaft: black and glossy, with a printed band below the grip (pale, the jacket's colour through it, hatched) and a few fine rings
      alb = SHAFT; specS = 0.6; specP = 80.0; gloss = 0.08;
      let bd: f32 = smoothstep(0.150 - px, 0.150 + px, yy) * smoothstep(0.340 + px, 0.340 - px, yy);
      var bc: vec3f = mix(PALE, ORANGE, smoothstep(0.214 - px, 0.214 + px, yy) * smoothstep(0.268 + px, 0.268 - px, yy));
      bc = mix(bc, SHAFT, step(0.62, fract(yy * 85.0 + th * 0.31831)) * smoothstep(0.285, 0.300, yy) * fine);
      alb = mix(alb, bc, bd);
      let rg: f32 = smoothstep(0.0012 + px, 0.0012 - px, abs(fract(yy / 0.012) - 0.5) * 0.012) * smoothstep(0.352, 0.356, yy) * smoothstep(0.392, 0.388, yy);
      alb = mix(alb, PALE, rg * 0.9);
      let rg2: f32 = smoothstep(0.004 + px, 0.004 - px, abs(yy - 0.93));
      alb = mix(alb, ORANGE, rg2);
    } else if (part < 2.5) {
      // the basket: dark plastic, six holes (snow goes through it)
      alb = BASKET; specS = 0.25; specP = 40.0;
      if (uv.z > 0.0185 && uv.z < 0.0395 && cos(th * 6.0) > 0.28) { discard; }
    } else { alb = vec3f(0.55, 0.56, 0.58); specS = 1.2; specP = 90.0; gloss = 0.25; }
    snowy = 0.3;
  } else {
    let zone: f32 = v.mat.z; let x: f32 = uv.x; let z: f32 = uv.y; let hw: f32 = max(uv.w, 0.004);
    if (zone > 2.5) {
      // the topsheet: bright, to be read at a glance against snow. Fluorescent lemon running to lime over the shovel, and nothing dark ahead of the
      // binding but the maker's two peaks, a thin double chevron behind them and a pinstripe inside each edge; one black band with a carbon weave in
      // it further back; all of it printed under a clear coat
      let fz: f32 = fract(z * 3.2 + 0.87); let e: f32 = px * 3.2; let rear: f32 = smoothstep(-0.20, -0.25, z) * smoothstep(-0.46, -0.44, z);
      let bd: f32 = saturate(smoothstep(0.5 - e, 0.5 + e, fz) * (1.0 - smoothstep(1.0 - e, 1.0, fz)) + (1.0 - smoothstep(0.0, e, fz))) * rear;
      var topc: vec3f = mix(SKI_Y, SKI_L, smoothstep(-0.64, -0.93, z)) * (0.92 + 0.10 * (1.0 - abs(x) / hw));
      let cw: vec2f = step(vec2f(0.5), fract(vec2f(x + z, x - z) / 0.0056)); let wv: f32 = abs(cw.x - cw.y);
      topc = mix(topc, SKI_K * (0.75 + 0.5 * wv * fine), bd);
      topc = mix(topc, vec3f(0.85, 0.87, 0.86), smoothstep(0.03 + e, 0.02 - e, abs(fz - 0.5)) * rear);
      topc = mix(topc, ORANGE, smoothstep(0.55, 0.60, z));
      // (the two peaks, pointing the way the ski goes, and the chevron behind them)
      let lu: f32 = (-0.800 - z) / 3.0; let lv: f32 = x / 3.0; let lp: f32 = px / 3.0;
      let m1: f32 = max(abs(lu - 0.0062 + 1.3 * abs(lv + 0.0040)) * 0.61, abs(lv + 0.0040) - 0.0088); let m2: f32 = max(abs(lu - 0.0022 + 1.3 * abs(lv - 0.0062)) * 0.61, abs(lv - 0.0062) - 0.0060);
      let cz: f32 = z + 0.600 + 0.42 * (hw - abs(x));
      let logo: f32 = max(smoothstep(0.0009 + lp, 0.0009 - lp, min(m1, m2)) * step(-0.0056, lu), max(smoothstep(0.0042 + px, 0.0042 - px, abs(cz)), smoothstep(0.0020 + px, 0.0020 - px, abs(cz - 0.0150))));
      topc = mix(topc, SKI_K, logo);
      topc = mix(topc, SKI_K, smoothstep(0.0011 + px, 0.0011 - px, abs(hw - abs(x) - 0.0080)) * smoothstep(0.020, 0.030, hw) * smoothstep(0.50, 0.40, z) * (1.0 - bd));
      // (snow slides off a waxed topsheet: the shovel comes up out of the snow clean, a little lies further back and along the edges)
      flu = (1.0 - bd) * (1.0 - logo) * (1.0 - smoothstep(0.50, 0.60, z));
      alb = topc; specS = 0.5; specP = 90.0; gloss = 0.10; envS = 0.30; dk = 0.12; snowy = 0.08 + 0.30 * smoothstep(-0.50, -0.15, z) + 0.45 * smoothstep(0.72, 0.98, abs(x) / hw);
    } else if (zone > 1.5) { alb = vec3f(0.42, 0.43, 0.45); specS = 1.6; specP = 110.0; gloss = 0.35; snowy = 0.45; dk = 0.12; }       // the bevel round the top: bright metal, the line that catches the sun
    else if (zone > 0.5) {
      // the sidewall, and along its foot the steel edge
      let steel: f32 = smoothstep(0.0026 + px, 0.0026 - px, uv.z);
      alb = mix(vec3f(0.035, 0.037, 0.042), vec3f(0.62, 0.63, 0.65), steel); specS = mix(1.2, 2.4, steel); specP = mix(90.0, 140.0, steel); gloss = mix(0.25, 0.55, steel);
    } else {
      // the base: black sintered, the topsheet's lemon in two thin bars by the tip and a block by the tail (as on the figure seen from outside)
      let bz: f32 = min(min(abs(z + 0.700), abs(z + 0.672)), abs(z - 0.400) * 0.35);
      alb = mix(vec3f(0.030, 0.032, 0.036), SKI_Y * 0.75, smoothstep(0.0075 + px, 0.0055 - px, bz)); specS = 0.7; specP = 90.0; gloss = 0.14;
    }
    // (in deep snow, and seen from down among them, the skis run under what their shovels push up: only the tips ride clear of it. Where
    // it ends is ragged, and streams back along the ski)
    let zb: f32 = mix(-0.20, -0.70, M.fx.z) + (flw - 0.5) * 0.14 - 0.04 * (x / hw) * (x / hw);
    bury = smoothstep(zb - 0.015, zb + 0.05, z) * saturate(M.fx.z * 3.0); hgt += 0.006 * bury * flw;
  }
  // ---- snow that has stuck: clumps on what faces up, single crystals that flash as they turn through the sun
  // (how much of a surface it covers: little on what stands upright, most of what lies flat; the lumpy field is cut where that much of it is above the cut)
  let upf: f32 = smoothstep(0.10, 0.75, N.y); let sn: f32 = saturate(M.fx.x * snowy * (0.30 + 0.70 * upf)); let thr: f32 = 0.750 - 0.30 * sn;
  // (two things: a dusting worked into the cloth, soft-edged and never quite white, and here and there a small lump that has stuck, with an
  // edge and a thickness of its own. Snow lying deep on a ski is all of it)
  let facing: f32 = smoothstep(-0.05, 0.25, N.y) * step(0.001, sn);
  // (powder, not paint: the dusting is soft-edged and thin, the lumps few and small, and both fade at their edges)
  let dust: f32 = 0.50 * smoothstep(thr - 0.08, thr + 0.22, lump * 0.52 + lumpF * 0.48) * facing;
  let lumps: f32 = 0.60 * smoothstep(thr + 0.085, thr + 0.150, lumpF * 0.80 + lump * 0.20) * facing;
  let clump: f32 = max(max(dust * dk, lumps), bury);
  alb = mix(alb, vec3f(0.90, 0.93, 0.98), clump); specS = mix(specS, 0.10, clump); specP = mix(specP, 24.0, clump); gloss *= 1.0 - clump; sheen = mix(sheen, 0.25, clump); cloth = mix(cloth, 1.0, clump); hgt += 0.0016 * lumps; ao = mix(ao, 1.0, clump * 0.7);
  // (the relief leans the normal: seams stand up, stitches sink, snow lies proud)
  let dpx: vec3f = dpdx(v.wp); let dpy: vec3f = dpdy(v.wp); let dhx: f32 = clamp(dpdx(hgt), -0.0006, 0.0006); let dhy: f32 = clamp(dpdy(hgt), -0.0006, 0.0006);
  let r1: vec3f = cross(dpy, N); let r2: vec3f = cross(N, dpx); let det: f32 = dot(dpx, r1);
  N = normalize(N * abs(det) - (r1 * dhx + r2 * dhy) * sign(det) + N * 1e-9);
  N = normalize(N + (vec3f(weave.x, weave.y, weave.z) - 0.5) * 0.22 * cloth + (vec3f(grain.x, grain.y, 0.5) - 0.5) * 0.5 * gr);
  let cs: vec3f = bp * 620.0; let ch: vec3f = hash33(cs + vec3f(31.0, 57.0, 11.0));
  let cry: f32 = step(1.0 - 0.05 * M.fx.x * snowy - 0.5 * clump, ch.x) * smoothstep(-0.2, 0.4, N.y);
  let Ng: vec3f = normalize(N + (hash33(cs + vec3f(5.0, 9.0, 73.0)) - 0.5) * 1.6);
  // ---- light: the figure's own (sun through the shadow map, sky and snow light, sheen and rim of cloth, a gloss that sees the sky), then the lamp
  let ndl: f32 = dot(N, L); let ndv: f32 = saturate(dot(N, V));
  let sh: f32 = shadowAt(v.wp + N * 0.035, 0.0016);
  // (new body: by moonlight the eye sees little colour and the sleeves are no lamp of their own: what the moon and the sky light is seen greyer and
  // darker, as on the figure seen from outside; the headlamp, below, keeps the colour where its cone falls)
  let nkF: f32 = (1.0 - M.ski.z) * M.ski.w; let albL: vec3f = alb;
  alb = mix(alb, vec3f(dot(alb, vec3f(0.30, 0.55, 0.15))), 0.45 * nkF) * (1.0 - 0.35 * nkF);
  let wrapD: f32 = saturate((ndl + 0.25 * cloth) / (1.0 + 0.25 * cloth));
  let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
  var col: vec3f = alb * (U.sunCol.rgb * wrapD * sh + amb * ao);
  // (snow is lit all through: it has no dark side to speak of, and under an open sky it is as bright as the slope it came from)
  // (...by day. Under the moon the slope itself is dark toward the light, and what lies on a sleeve is no brighter than the slope)
  let day: f32 = M.ski.z;
  col = mix(col, vec3f(0.90, 0.93, 0.98) * (U.sunCol.rgb * ((0.25 + 0.75 * saturate((ndl + 0.55) / 1.55)) * (0.35 + 0.65 * sh) * mix(0.30, 1.0, day)) + amb * mix(1.0, 1.25, day)), clump);
  // (fluorescent ink gives the sky's blue and what the eye cannot see back as its own colour: it is as bright as the snow it lies on, in the
  // shade brighter than any paint, which is why it is worn there. So it is lit the way the snow is, from all round: as long as there is
  // daylight to do it with. By night it is paint like any other)
  col = mix(col, alb * (U.sunCol.rgb * ((0.25 + 0.75 * saturate((ndl + 0.55) / 1.55)) * (0.35 + 0.65 * sh) * 1.05) + amb * 1.35), flu * (1.0 - clump) * day * mix(1.0, 0.35, M.ski.w));     // (new body: only a little of it: the sleeves keep a lit side and a shaded side like everything else)
  // (a crust of snow is thin: with the sun behind it, the sun comes through)
  col += vec3f(0.90, 0.93, 0.98) * U.sunCol.rgb * (clump * 0.25 * saturate(0.55 - 0.45 * ndl) * (0.3 + 0.7 * sh));
  let fr: f32 = pow(1.0 - ndv, 3.0); let back: f32 = saturate(dot(-V, L) * 0.5 + 0.5);
  col += (alb * 0.6 + 0.08) * U.sunCol.rgb * sheen * fr * (0.25 + 1.6 * back * back) * sh * saturate(ndl * 2.0 + 0.9);
  let rim: f32 = pow(1.0 - ndv, 1.45) * back * back * saturate(ndl * 1.6 + 0.8) * sh;
  col += (alb * 0.5 + 0.24) * U.sunCol.rgb * (rim * (0.75 + 1.1 * sheen));
  col += alb * U.ambSky.rgb * sheen * fr * 0.6 * ao;
  col += alb * U.sunCol.rgb * (0.24 * cloth * back * back * saturate(0.6 - ndl) * (0.35 + 0.65 * sh));
  let Hh: vec3f = normalize(V + L);
  col += U.sunCol.rgb * sh * specS * pow(max(dot(N, Hh), 0.0), specP) * saturate(ndl * 4.0);
  col += U.sunCol.rgb * sh * cry * 26.0 * pow(saturate(dot(reflect(-V, Ng), L)), 70.0);
  if (gloss > 0.0) {
    let R: vec3f = reflect(-V, N);
    var env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
    env = mix(env, vec3f(0.75, 0.80, 0.90) * (U.ambSky.rgb + U.sunCol.rgb * 0.35), smoothstep(0.05, -0.25, R.y));
    let f0: f32 = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    col += env * gloss * f0 * (0.4 + 0.6 * ao);
  }
  {
    // leather, rubber and a coated shell throw back a soft picture of what is round them: sky from above, the lit snow from below
    let R2: vec3f = reflect(-V, N); let er: vec3f = U.ambSky.rgb * (0.5 + 0.5 * R2.y) + U.ambGnd.rgb * (0.5 - 0.5 * R2.y) * 1.25;
    col += er * (envS * (1.0 - clump) * (0.045 + 0.7 * fr) * (0.35 + 0.65 * ao));
  }
  if (U.lamp.w > 0.0) {
    // the headlamp: its spot (aimed far ahead) and the wide spill under it that hands held up in front of the chest stand in (it does not reach the skis:
    // they have what the snow round them has)
    let dl: vec3f = v.wp - U.lamp.xyz; let r2l: f32 = dot(dl, dl); let Ld: vec3f = -dl / sqrt(max(r2l, 1e-4));
    let ll: vec3f = lampLight(v.wp) + vec3f(1.0, 0.85, 0.64) * (U.lamp.w * M.fx.y * smoothstep(-0.35, 0.45, dot(-Ld, U.lampDir.xyz)) * smoothstep(1.7, 0.6, r2l) / (r2l + 30.0));
    let nl2: f32 = saturate((dot(N, Ld) + 0.35) / 1.35);
    // (new body: the lamp is a cone: the hands and forearms out in front are in its edge, the arm falls off into the dark toward the elbow, and the
    // upper arm beside the head is outside it altogether)
    let coneA: f32 = mix(1.0, 0.5 * smoothstep(0.35, 0.85, dot(-Ld, U.lampDir.xyz)), M.ski.w);
    col += ll * coneA * (albL * nl2 * (0.6 + 0.4 * ao) + (specS * 1.5 + 0.2 * sheen * fr) * pow(max(dot(N, normalize(V + Ld)), 0.0), specP) + cry * 8.0 * pow(saturate(dot(reflect(-V, Ng), Ld)), 50.0));
  }
  // (the upper arm close under the lens is in its own shade and half lost to the eye: darker and greyer, so it does not read as a flat orange card)
  let nearL: f32 = smoothstep(0.36, 0.14, length(U.camPos.xyz - v.wp));
  col = mix(col, vec3f(dot(col, vec3f(0.30, 0.55, 0.15))) * 0.5 + col * 0.12, nearL * 0.8);
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}`;return{lib:y,vs:j,fs:W}}e.init=function(){if(!(e.ready||e.dead||e.starting)){e.starting=!0;try{Qe=At.gfx;const o=performance.now();e.mesh||e.build(),st=Qe.buffer(e.mesh.V,"vertex"),Le=Qe.buffer(e.mesh.I,"index"),r=Qe.texture({w:4,h:16,format:"rgba32f",filter:"nearest"}),Z=Qe.texture({w:4,h:32,format:"rgba32f",filter:"nearest"});const p=e.figIdx();K=Qe.buffer(p,"index"),ue=p.length,G=a0.mesh;{const W=e.mesh,h=[];for(let n=0;n<W.ni;n+=3)W.V[W.I[n]*s+6]===8&&h.push(W.I[n],W.I[n+1],W.I[n+2]);Ae=Qe.buffer(new Uint32Array(h),"index"),_e=h.length}const i=u();q=Qe.pipeline({name:"fpv",lib:[St.common,St.hash,St.fog,St.shadow,i.lib],buffers:[{attrs:[["pos","vec3f"],["nrm","vec3f"],["mat","vec4f"],["bw","vec4f"],["uv","vec4f"]]}],varyings:{wp:"vec3f",nrm:"vec3f",bp:"vec3f",bn:"vec3f",mat:"vec4f",uv:"vec4f"},uniforms:{tw:"vec4f",bend:"vec4f",ski:"vec4f",fx:"vec4f"},textures:{tBones:"fetch",tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:i.vs,fs:i.fs}),e.pipes=[q],e.stats.initMs=performance.now()-o,e.pipesReady=(async()=>{Qe.finishPipelineAsync?await Qe.finishPipelineAsync(q):Qe.finishPipeline(q),e.ready=!0})().catch(l);const y=a0.update,j=a0.draw;a0.update=function(W){const h=Qe.updateTexture;let n;Qe.updateTexture=function(d,M,g,R,Ue,$){return R===4&&Ue===32&&$&&$.length===512&&(k=d,ee=$),h.apply(this,arguments)};try{n=y.apply(this,arguments)}finally{Qe.updateTexture=h}if(!e.dead&&e.k>0)try{if(n&&n.J&&n.F){const d=a.dt;e.pose(n,W,d),a.dt=0,te(d)}}catch(d){l(d)}return n},a0.draw=function(){if(!(e.vis&&e.posed&&k))return j.apply(this,arguments);if(e.hideFig)return;const W=Qe.draw;let h=0;if(a0.want&&a0.want(),G!==a0.mesh){const n=e.figIdx();K=Qe.buffer(n,"index"),ue=n.length,G=a0.mesh}Qe.draw=function(n,d){if(d&&d.tex&&d.tex.tBones===k&&d.count===a0.mesh.ni){h++;const M=Object.assign({},d);return M.tex=Object.assign({},d.tex,{tBones:Z}),M.ib=K,M.count=ue,W.call(this,n,M)}return W.apply(this,arguments)};try{return j.apply(this,arguments)}finally{Qe.draw=W,h||l(new Error("the figure is no longer drawn the way this expects"))}},qt.passes.opaque.push(W=>e.draw(W)),e.hooked=!0}catch(o){l(o)}}};const v=["uarmL","farmL","handL","uarmR","farmR","handR","poleL","poleR","elbowL","elbowR","head"];let P=7;const N=()=>(P=P*16807%2147483647)/2147483647,de=e.BOW={rate:300,dens:11,mist:6,life:.4,brake:5,z:[-.46,-.76],base:.3};function te(o){const p=a0.world.root;for(let xe=0;xe<2;xe++)for(let De=0;De<5;De++)ot.set(Wt.mul(p,B[xe].M[De]),(xe*5+De)*16);if(Qe.updateTexture(r,0,0,4,16,ot),ee){t.set(ee);for(const xe of v){const De=a0.B[xe];if(De==null)continue;const Te=Wt.tp(p,a0.world.J[xe==="head"?"skull":xe.slice(-1)==="L"?"shL":"shR"]),Me=De*16,rt=.002;t.fill(0,Me,Me+16),t[Me]=rt,t[Me+5]=rt,t[Me+10]=rt,t[Me+12]=Te[0],t[Me+13]=Te[1],t[Me+14]=Te[2],t[Me+15]=1}Qe.updateTexture(Z,0,0,4,32,t)}const i=zt.s,y=zt.pose||{},j=(typeof At<"u"?At.t:0)%512,W=zt.feel&&zt.feel.chatter||0,h=i.speed||0,n=i.air?0:1;S.tw[0]=B[0].twist,S.tw[1]=-B[1].twist,S.tw[2]=B[0].open,S.tw[3]=B[1].open,S.bend[0]=B[0].bend,S.bend[1]=B[1].bend,S.bend[2]=ge(7,28,h)*(1-.5*mt(y.tuck||0)),S.bend[3]=j;const d=(.0025*ge(4,20,h)+.011*W)*n;S.ski[0]=d*Math.sin(j*61+.7)*(.6+.4*Math.sin(j*13.7)),S.ski[1]=d*Math.sin(j*57+2.9)*(.6+.4*Math.sin(j*11.3+1)),S.ski[2]=1-mt(typeof Nt<"u"&&Nt.night||0),S.ski[3]=a0.mesh&&a0.mesh.v==="a"?0:1;const M=mt(i.powder||0);a.flow=((a.flow||0)+o*h*.35)%96,S.fx[0]=a.snow,S.fx[1]=.45,S.fx[2]=n*ge(3,12,h)*Re(.6*M,ge(.2,.6,M),e.tk),S.fx[3]=a.flow;const g=ot,R=(xe,De)=>[g[xe+12]+g[xe+4]*.09+g[xe+8]*De,g[xe+13]+g[xe+5]*.09+g[xe+9]*De,g[xe+14]+g[xe+6]*.09+g[xe+10]*De],Ue=R(64,-.66),$=R(144,-.66);if(o>0&&e.vis&&n&&typeof Jt<"u"&&Jt.grain){const xe=mt(i.powder||0),De=qt.origin,Te=i.v,Me=zt.root.fwd,rt=zt.root.nrm,wt=Me[1]*rt[2]-Me[2]*rt[1],Ze=Me[2]*rt[0]-Me[0]*rt[2],ct=Me[0]*rt[1]-Me[1]*rt[0];for(a.tipN=Math.min((a.tipN||0)+o*ge(5,18,h)*(5+55*xe*xe),6);a.tipN>=1;){a.tipN-=1;const Mt=N()<.5?64:144,ft=R(Mt,-.955+.16*N()),dt=(N()-.5)*2,gt=dt*.05,bt=.45+.35*N(),Xe=.5+1.3*N()+1.2*xe*N(),et=dt*(.5+.9*N());Jt.grain(At.t,ft[0]+De[0]+wt*gt,ft[1]+De[1]+Ze*gt+.012,ft[2]+De[2]+ct*gt,Te[0]*bt+wt*et+rt[0]*Xe,Te[1]*bt+Ze*et+rt[1]*Xe,Te[2]*bt+ct*et+rt[2]*Xe,.45+.55*N(),.35+.8*N()*(.6+xe),.55,.6),xe>.45&&N()<.22*xe&&Jt.puff(At.t,ft[0]+De[0],ft[1]+De[1]+.02,ft[2]+De[2],Te[0]*.6+wt*et*.6,Te[1]*.6+.5+N(),Te[2]*.6+ct*et*.6,.8+.2*N(),Re(.03,.06,N()),1.4*xe,1,.35,.5)}for(a.bowN=Math.min((a.bowN||0)+o*de.rate*e.tk*ge(3,14,h)*(de.base+(1-de.base)*xe),10);a.bowN>=1;){a.bowN-=1;const Mt=N()<.5?64:144,ft=N()<.5?-1:1,dt=N()<.35,gt=R(Mt,Re(dt?-.58:de.z[0],de.z[1],N())),bt=ft*(.05+.035*N()),Xe=(dt?.8:.86)+.14*N(),et=(dt?.3:.7)+1.9*N()*N()+.6*xe*N(),tt=ft*(.3+1.7*N());Jt.puff(At.t-o*N(),gt[0]+De[0]+wt*bt,gt[1]+De[1]+Ze*bt-.07+a.sink,gt[2]+De[2]+ct*bt,Te[0]*Xe+wt*tt+rt[0]*et,Te[1]*Xe+Ze*tt+rt[1]*et,Te[2]*Xe+ct*tt+rt[2]*et,dt?.82+.14*N():.25+.3*N(),dt?Re(.03,.05,N()):Re(.012,.03,N()),(dt?de.mist:de.dens)*(.6+.8*N())*(.55+.45*xe),1,de.life,de.brake)}typeof ws<"u"&&ws.splash&&(a.wetT=(a.wetT==null?2:a.wetT)-o*ge(7,20,h)*(.15+.85*xe)*(.4+.6*e.tk),a.wetT<=0&&(a.wetT=2.2+3.2*N(),ws.splash(.2+.25*xe+.1*e.tk,(N()-.5)*1.2,1)))}at[0][0]=(Ue[0]+$[0])*.5,at[0][1]=(Ue[1]+$[1])*.5,at[0][2]=(Ue[2]+$[2])*.5,at[0][3]=.29;let ve=.9;at[1][3]=0;for(let xe=0;xe<2;xe++){const De=B[xe],Te=Wt.tp(p,[De.G[0]*De.sg,De.G[1],De.G[2]]),Me=Math.hypot(Te[0]-p[12],Te[1]-p[13]-.85,Te[2]-p[14]);Me>ve&&(ve=Me,at[1][0]=Te[0],at[1][1]=Te[1],at[1][2]=Te[2],at[1][3]=.15*ge(.9,1,Me))}}return e.tick=function(o,p,i){if(e.k=p,e.tk=i||0,a.dt+=o,!e.starting&&!e.dead&&typeof At<"u"&&At.gfx&&typeof a0<"u"&&a0.ready&&e.init(),p<=0&&(e.posed&&(B[0].init=B[1].init=B[0].init0=!0,a.v=null,e.posed=!1),a.dt=0),e.vis=e.ready&&!e.dead&&p>=e.swap,a.own=ge(e.swap,1,p),e.arms=e.tk<.7&&!zt.fpIn,e.hideFig=e.vis&&(e.tk>.25||!!zt.fpIn),typeof Jt<"u"&&Jt.lens!=null&&Jt.nearBlur!=null){const W=e.vis?e.tk:0;W>0?(a.sp0||(a.sp0=[Jt.lens,Jt.nearBlur]),Jt.lens=Re(a.sp0[0],O().lens,W),Jt.nearBlur=Re(a.sp0[1],O().blur,W)):a.sp0&&(Jt.lens=a.sp0[0],Jt.nearBlur=a.sp0[1],a.sp0=null)}const y=zt.s,j=.22+.36*mt(y.powder||0);for(const W of zt.events||[])W.type==="crash"?a.snow=1.25:W.type==="land"&&(a.snow=Math.max(a.snow,.3+.5*mt(y.powder||0)+.02*(W.v||0)));return a.snow=a.snow>j?Math.max(j,a.snow-o*.07):Math.min(j,a.snow+o*.12),e.vis},e.draw=function(o){if(e.vis&&e.posed){if(typeof o0<"u"&&o0.riders){for(const p of at)if(p[3]>0){for(const i of o0.riders)if(i[3]===0){i[0]=p[0],i[1]=p[1],i[2]=p[2],i[3]=p[3];break}}}Qe.draw(q,{u:S,tex:{tBones:r,tDetail:c0.detail,tShadow:o.shadowTex,tSky:Nt.lut},vb:[st],ib:e.arms?Le:Ae,count:e.arms?e.mesh.ni:_e})}},e.VSZ=s,e.HW=E,e.gloveSD=pe,e.POLE=ae,e.toHand=b,e.fromHand=re,e.L=[F,we],e})();zt.fpv=wa;const Na={jacket:{alb:[.95,.255,.026],sheen:.5,cloth:1,specS:.05,specP:28,gloss:0},sleeveFore:{alb:[.018,.03,.055]},sleeveBand:{alb:[.86,.87,.85]},glove:{alb:[.018,.018,.02],sheen:.2,cloth:0,specS:.08,specP:30,gloss:0},pole:{alb:[.015,.015,.015],sheen:0,cloth:0,specS:.6,specP:80,gloss:.08},poleGrip:{alb:[.95,.255,.026]},poleBasket:{alb:[.05,.055,.065]},ski:{alb:[.93,.78,.035]},skiTip:{alb:[.42,.8,.04]},skiMark:{alb:[.018,.02,.026]}},a0=(()=>{const e={ready:!1,NB:28,LOOK:Na},s={pelvis:0,spine:1,chest:2,head:3,uarmL:4,farmL:5,handL:6,uarmR:7,farmR:8,handR:9,thighL:10,shinL:11,footL:12,thighR:13,shinR:14,footR:15,poleL:16,poleR:17,kneeL:18,kneeR:19,elbowL:20,elbowR:21,seatL:22,seatR:23,shL:24,shR:25,neck:26,tail:27},w={thigh:.43,shin:.43,uarm:.3,farm:.26,grip:.075,hipW:.09,hipD:.05,shW:.185,shD:.05,ankle:.16,spine:.25,chest:.25,neck:.085,head:.065,pole:1.14,basket:1.05};let x,F,we,Y,E=0,D,be,ht;const qe=new Float32Array(4*32*4);let se=null,_=[];function b(r,q,k){const ee=Math.cos(q),Z=Math.sin(q),K=Math.cos(k),ue=Math.sin(k),G=Math.cos(r),Ae=Math.sin(r),_e=at=>{let ot=at[0],t=at[1]*ee+at[2]*Z,S=-at[1]*Z+at[2]*ee;const l=ot*K+t*ue,u=-ot*ue+t*K;return[l*G-S*Ae,u,l*Ae+S*G]};return{X:_e([1,0,0]),Y:_e([0,1,0]),Z:_e([0,0,1])}}function re(r,q,k,ee,Z){const K=f.sub(q,r),ue=f.len(K)||1e-6,G=it(ue,Math.abs(k-ee)+1e-4,k+ee-1e-4),Ae=f.mul(K,1/ue),_e=(k*k-ee*ee+G*G)/(2*G),at=Math.sqrt(Math.max(0,k*k-_e*_e)),ot=f.norm(f.sub(Z,f.mul(Ae,f.dot(Z,Ae))));return f.add(f.mad(r,Ae,_e),f.mul(ot,at))}function m(r,q,k){const ee=f.norm(q);let Z=f.sub(k,f.mul(ee,f.dot(k,ee)));return f.len(Z)<1e-5&&(Z=f.cross(ee,[0,0,1])),Z=f.norm(Z),Wt.fromBasis(Z,ee,f.cross(Z,ee),r)}const J=(r,q,k,ee)=>[r.X[0]*q+r.Y[0]*k+r.Z[0]*ee,r.X[1]*q+r.Y[1]*k+r.Z[1]*ee,r.X[2]*q+r.Y[2]*k+r.Z[2]*ee],ae=(r,q,k)=>{const ee=Math.max(k-Math.abs(r-q),0)/k;return Math.min(r,q)-ee*ee*k*.25},X=(r,q,k)=>f.norm(f.lerp(r,q,k));function ke(r,q,k){const ee=r.length-1;let Z=0;for(;Z<ee-1&&q>r[Z+1][0];)Z++;const K=r[Z],ue=r[Z+1],G=ue[0]-K[0],Ae=mt((q-K[0])/G),_e=Ae*Ae,at=_e*Ae,ot=(S,l)=>{const u=v=>l==null?r[v][1]:r[v][1][l];return S>0&&S<ee?(u(S+1)-u(S-1))/(r[S+1][0]-r[S-1][0]):k?(u(1)-u(ee-1))/(r[1][0]-r[0][0]+r[ee][0]-r[ee-1][0]):0},t=S=>{const l=S==null?K[1]:K[1][S],u=S==null?ue[1]:ue[1][S];return(2*at-3*_e+1)*l+(at-2*_e+Ae)*G*ot(Z,S)+(-2*at+3*_e)*u+(at-_e)*G*ot(Z+1,S)};return typeof K[1]=="number"?t(null):[t(0),t(1),t(2)]}function C(r,q,k,ee){const Z=f.sub(q,r),K=f.sub(ee,k),ue=f.sub(r,k),G=f.dot(Z,Z),Ae=f.dot(Z,K),_e=f.dot(K,K),at=f.dot(Z,ue),ot=f.dot(K,ue),t=G*_e-Ae*Ae;let S=t>1e-9?it((Ae*ot-_e*at)/t,0,1):0,l=_e>1e-9?it((Ae*S+ot)/_e,0,1):0;return S=G>1e-9?it((Ae*l-at)/G,0,1):0,[f.mad(r,Z,S),f.mad(k,K,l),S,l]}const ne={lean:0,edge:0,crouch:.21,tuck:0,air:0,sep:0,headYaw:0,lead:0,stance:.31,fore:0,armL:[0,0,0],armR:[0,0,0],swing:0,liftL:0,liftR:0,pitchL:0,pitchR:0,plantL:0,plantR:0,dp:0,grabL:0,grabR:0},Be={ct:0,cf:0,roll:0,yaw:0,hand:[0,0,0],head:0,drop:0,dp:null,pl:null,idle:null},Ee={PLANT:.22,REL:.62,T:.95,V:3.5,TIPY:-.04},je=[0,.1,.22,.42,.62,.72,.86,1],$e=r=>je.map((q,k)=>[q,r[k]]),nt=$e([0,-.1,-.03,.14,.25,.2,.07,0]),Ke=$e([0,-.07,.1,.42,.6,.54,.18,0]),Fe=$e([0,-.02,.03,.18,.24,.18,.05,0]),Ge=$e([0,-.02,-.03,.02,.06,.05,.015,0]),Je=[[0,[.255,1.055,-.56]],[.3,[.28,.905,-.4]],[.58,[.3,.735,-.18]],[.82,[.295,.645,.02]],[1,[.285,.615,.16]]],le=(r,q,k,ee)=>{const Z=Math.cos(ee),K=Math.sin(ee);return[r*Z+q*K,-r*K+q*Z,k]},Pe=(r,q,k,ee)=>{const Z=ke(Je,r);return le(Z[0]*q,Z[1]+ee,Z[2],k)};function pe(r,q,k,ee,Z){const K=Ae=>f.len(f.sub(Pe(Ae,q,k,ee),r))-Z;if(K(0)<=0)return 0;if(K(1)>=0)return 1+Math.min(1,K(1)/.3);let ue=0,G=1;for(let Ae=0;Ae<18;Ae++){const _e=(ue+G)/2;K(_e)>0?ue=_e:G=_e}return(ue+G)/2}e.DP=Ee;function c(r,q){q=q||Be;const k=r.lean||0,ee=Math.sin(k),Z=Math.abs(ee),K=r.edge||0,ue=mt(r.tuck||0),G=mt(r.air||0),Ae=r.stance==null?.31:r.stance,_e=r.lead||0,at=r.liftL||0,ot=r.liftR||0,t=r.armL||ne.armL,S=r.armR||ne.armR,l=ge(0,1,r.grabL||0),u=ge(0,1,r.grabR||0),v=Math.max(l,u),P=u-l,N=it(r.dp||0,0,1),de=N>0?(1-ge(0,.7,ue))*(1-G)*(1-v)*(1-ge(.14,.5,Math.abs(k))):0,te=w.pole,o={},p=new Array(e.NB),i=q.idle||null,y=i?i.sh:0,j=i?i.br:0,W=b(0,0,K),h=.05*Math.abs(Math.sin(K)),n=r.pitchL||r.rollL?b(0,-(r.pitchL||0),K+(r.rollL||0)):W,d=r.pitchR||r.rollR?b(0,-(r.pitchR||0),K+(r.rollR||0)):W;o.footL=[-Ae/2,h+at,_e],o.footR=[Ae/2,h+ot,-_e],o.ankleL=f.mad(o.footL,n.Y,w.ankle),o.ankleR=f.mad(o.footR,d.Y,w.ankle);const M=mt(r.crouch==null?ne.crouch:r.crouch),g=de>0?ke(nt,N):0,R=kt=>{let Ht=mt(kt);return ue>0&&(Ht=-ae(-Ht,-.36*ue,.3*ue+1e-6)),de>0?mt(Re(Ht,Math.min(Ht,.45),de)+de*g):Ht},Ue=kt=>Re(R(kt),1,v*.9),$=Ue(M),ve=de>0?.8*.38*(mt(ne.crouch+g)-R(M)):0,xe=q.ct?Ue(M+q.ct):$,De=q.cf?Ue(M+q.cf):$;let Te=1.085-.38*$-.06*ge(.7,1,$)-.11*ue-.05*v;const Me=.36+.46*xe+.7*ue-.14*G*(1-v)+.42*v*(1-ue)+(de>0?de*ke(Ke,N):0)+(i?i.up:0),rt=h0/2+Math.asin(it((1.085-.38*De-.06*ge(.7,1,De)-.11*ue-.05*v-.58)/w.thigh,-1,1))-.66+.45*v,wt=ae(Math.min(Me,1.42),rt,.12),Ze=(de>0?de*ke(Fe,N):0)+.22*v,ct=b((r.sep||0)*.35,wt*.5,k*.62+P*.1-.075*y);let Mt,ft,dt,gt=0;for(let kt=0;kt<6;kt++){const Ht=Math.min(Te-w.hipD-w.ankle,.8385),Qt=ae(Math.acos(it(Ht/(w.thigh+w.shin),-1,1)),.54,.15),e0=Ht-w.shin*Math.cos(Qt);gt=-w.shin*Math.sin(Qt)+Math.sqrt(Math.max(0,w.thigh*w.thigh-e0*e0))-.012-(r.fore||0)*.06+(de>0?de*ke(Ge,N):0),Mt=[Te*Math.sin(k)+.07*ee+.045*y,Te*Math.cos(k)+(at+ot)*.5,gt],ft=f.add(f.mad(Mt,ct.X,-w.hipW),f.mul(ct.Y,-w.hipD)),dt=f.add(f.mad(Mt,ct.X,w.hipW),f.mul(ct.Y,-w.hipD));const t0=Math.max(f.len(f.sub(ft,o.ankleL)),f.len(f.sub(dt,o.ankleR)))-(w.thigh+w.shin)*.975;if(t0<=-.03)break;Te-=(t0>=.03?t0:(t0+.03)*(t0+.03)/.12)*1.1}o.pelvis=Mt,o.hipL=ft,o.hipR=dt;const bt=(kt,Ht,Qt,e0)=>{const t0=f.sub(kt,Ht),g0=f.len(t0)||1e-6,p0=w.shin,O0=w.thigh,T0=it(g0,.02,p0+O0-1e-4),Z0=f.mul(t0,1/g0),Gt=(p0*p0-O0*O0+T0*T0)/(2*T0),us=Math.sqrt(Math.max(0,p0*p0-Gt*Gt)),B0=f.mul(Qt.Z,-1);let s0=f.sub(B0,f.mul(Z0,f.dot(B0,Z0)));f.len(s0)<1e-4&&(s0=f.sub(Qt.Y,f.mul(Z0,f.dot(Qt.Y,Z0)))),s0=f.norm(s0);const A0=f.cross(Z0,s0),C0=Gt*f.dot(Z0,Qt.X)-p0*Math.sin(it(k*.1,-.09,.09)),I0=f.dot(s0,Qt.X),S0=f.dot(A0,Qt.X),J0=Math.hypot(I0,S0);let W0=0,rs=0;if(us>1e-5&&J0>1e-5){const f0=Math.atan2(S0,I0),k0=Math.acos(it(-C0/(us*J0),-1,1)),E0=Y0=>Math.atan2(Math.sin(Y0),Math.cos(Y0)),q0=E0(f0+k0),j0=E0(f0-k0);W0=Math.abs(q0)<Math.abs(j0)?q0:j0,rs=W0,W0*=1-ge(.5,1.5,Math.abs(C0)/(us*J0))}const Yt=f0=>f.add(f.mad(Ht,Z0,Gt),f.add(f.mul(s0,us*Math.cos(f0)),f.mul(A0,us*Math.sin(f0))));return o["kneeRaw"+(e0<0?"L":"R")]=Yt(rs+(W0-rs)*.15),Yt(W0)};o.kneeL=bt(ft,o.ankleL,n,-1),o.kneeR=bt(dt,o.ankleR,d,1);const Xe=(kt,Ht,Qt,e0)=>{if(e0<=0)return kt;const t0=f.norm(f.sub(Ht,Qt)),g0=Math.atan2(-f.dot(t0,kt.Z),f.dot(t0,kt.Y)),p0=(g0-it(g0,.1,.58))*e0;if(Math.abs(p0)<1e-5)return kt;const O0=Math.cos(p0),T0=Math.sin(p0);return{X:kt.X,Y:f.sub(f.mul(kt.Y,O0),f.mul(kt.Z,T0)),Z:f.add(f.mul(kt.Z,O0),f.mul(kt.Y,T0))}};let et=Xe(n,o.kneeRawL,o.ankleL,Math.max(mt(at/.06),G,mt(Math.abs(r.pitchL||0)/.08))),tt=Xe(d,o.kneeRawR,o.ankleR,Math.max(mt(ot/.06),G,mt(Math.abs(r.pitchR||0)/.08)));const Oe=(kt,Ht)=>{if(!Ht)return kt;const Qt=Math.cos(-Ht),e0=Math.sin(-Ht);return{X:kt.X,Y:f.sub(f.mul(kt.Y,Qt),f.mul(kt.Z,e0)),Z:f.add(f.mul(kt.Z,Qt),f.mul(kt.Y,e0))}};et=Oe(et,r.tipL||0),tt=Oe(tt,r.tipR||0),o.footL=f.mad(o.ankleL,et.Y,-w.ankle),o.footR=f.mad(o.ankleR,tt.Y,-w.ankle);const ze=k*Re(.74,.4,ge(.25,.72,Math.abs(k)))+q.roll+P*.26+(i?.03*y+i.sx:0)+(r.tilt||0),pt=(r.sep||0)+q.yaw+(i?i.ty:0),ut=Math.min(wt*1.15+.06+Ze-.035*j,1.74),xt=b(pt*.7,wt,ze),lt=b(pt,ut,ze*.82);o.chest=f.mad(Mt,xt.Y,w.spine+.004*j),o.neck=f.mad(o.chest,lt.Y,w.chest);const Tt=.035*ue+.02*v;o.shL=f.add(f.add(f.mad(o.neck,lt.X,-w.shW+Tt*.5),f.mul(lt.Y,-w.shD)),f.mul(lt.Z,-Tt)),o.shR=f.add(f.add(f.mad(o.neck,lt.X,w.shW-Tt*.5),f.mul(lt.Y,-w.shD)),f.mul(lt.Z,-Tt)),j&&(o.shL=f.add(o.shL,J(lt,-.003*j,.012*j,.004*j)),o.shR=f.add(o.shR,J(lt,.003*j,.012*j,.004*j)));const Et=Math.max(.05+.1*xe+.02*ue+q.head+(i?i.hp:0),ut-1),Ut=b((r.sep||0)+(r.headYaw||0)+(i?i.hy:0),Et,k*.1),Xt=f.norm(f.add(lt.Y,Ut.Y));o.skull=f.mad(o.neck,Xt,w.neck),o.head=f.add(f.mad(o.skull,Ut.Y,w.head),f.mul(Ut.Z,-.015));const _t=[[ft,o.kneeL,.115,.095],[dt,o.kneeR,.115,.095],[o.kneeL,o.ankleL,.09,.085],[o.kneeR,o.ankleR,.09,.085],[f.add(f.mad(ft,ct.Z,.03),f.mul(ct.X,.035)),f.add(f.mad(dt,ct.Z,.03),f.mul(ct.X,-.035)),.15,.15],[Mt,o.chest,.155,.165],[o.chest,f.mad(o.neck,lt.Y,-.07),.165,.15],[f.add(f.mad(o.chest,lt.Z,.19),f.mul(lt.Y,-.16)),f.add(f.mad(o.chest,lt.Z,.18),f.mul(lt.Y,.12)),.115,.1],[o.head,o.head,.135,.135]],m0=(kt,Ht,Qt,e0)=>{for(let t0=0;t0<(e0||_t.length);t0++){const g0=_t[t0],p0=g0[0],O0=g0[1],T0=f.sub(O0,p0),Z0=f.dot(T0,T0),Gt=Z0>1e-9?mt(f.dot(f.sub(kt,p0),T0)/Z0):0,us=f.mad(p0,T0,Gt),B0=Re(g0[2],g0[3],Gt)+Ht;let s0=f.sub(kt,us),A0=f.len(s0);A0>=B0||(A0<1e-4&&(s0=[Qt,0,0],A0=1),kt=f.mad(us,s0,B0/A0))}return kt},r0=b(pt,wt*.4,ze*.85),Ft=b(pt,0,ze*.6),Lt=(w.uarm+w.farm+w.grip)*.975,yt=q.dp||null,Rt=Math.max(0,Ae-.36)*.35,Vt=b((r.sep||0)*.35,0,k*.62+P*.1);let Kt=yt?yt.rel:Ee.REL,jt=!1;if(de>0&&yt&&yt.T&&yt.g&&N>=Ee.PLANT&&N<Kt)for(let kt=0;kt<2;kt++)pe([yt.T[kt*2],Ee.TIPY,yt.T[kt*2+1]],kt?1:-1,k,ve,te)>1&&(Kt=yt.gf,jt=!0);const Ot=(kt,Ht)=>{let Qt=1e9;const e0=f.mad(kt,Ht,.15),t0=f.mad(kt,Ht,te);for(let g0=0;g0<_t.length;g0++){const p0=_t[g0],O0=C(e0,t0,p0[0],p0[1]);Qt=Math.min(Qt,f.len(f.sub(O0[0],O0[1]))-Re(p0[2],p0[3],O0[3])-.028)}return Qt},$t=kt=>{const Ht=mt(kt*ee*1.6),Qt=mt(-kt*ee*1.6),e0=kt<0?o.shL:o.shR,t0=kt<0?l:u,g0=kt<0?ft:dt,p0=kt<0?o.ankleL:o.ankleR,O0=f.sub(g0,p0),T0=f.norm([kt*O0[1],-kt*O0[0],0]),Z0=l0=>f.dot(f.sub(l0,p0),T0);let Gt=f.add(o.chest,J(r0,kt*(.275+.03*$+Rt),-.075-.02*$,-.375));Gt=f.add(Gt,[kt*.05*Ht-kt*.02*Qt,-.06*Ht*Z+.06*Qt,-.05*Qt-.04*Ht]),Gt=f.add(Gt,[q.hand[0],q.hand[1]+kt*q.drop,q.hand[2]]);{const l0=Z0(Gt);Gt=f.mad(Gt,T0,-ae(-l0,-.2,.06)-l0)}if(ue>0){const l0=f.add(o.head,J(Ft,kt*.095,-.23,-.17));Gt=f.lerp(Gt,l0,ge(0,1,ue))}if(G>0){const l0=f.add(o.chest,J(lt,kt*.54,.06,-.22));Gt=f.lerp(Gt,l0,G*.8*(1-t0))}Gt=f.add(Gt,kt<0?t:S);const us=.1+.05*$+.22*G,B0=it((Gt[1]-us)/te,-.2,.97);let s0=f.norm([kt*.07,-B0,Math.sqrt(Math.max(.02,1-B0*B0-.0049))]);{const l0=f.mad(Gt,s0,te),x0=Z0(l0);s0=f.norm(f.sub(f.mad(l0,T0,-ae(-x0,-.2,.06)-x0),Gt))}if(G>0&&(s0=X(s0,f.norm([kt*.34,-.22,.92]),G*.8)),ue>0){const l0=f.add(Mt,J(Vt,kt*.54,.16,.36)),x0=ge(0,1,ue);s0=X(s0,f.norm(f.sub(l0,Gt)),x0)}s0[1]+=.1*Math.sin((r.swing||0)*kt)*(1-ue)*(1-de),s0=f.norm(s0);const A0=mt((kt<0?r.plantL:r.plantR)||0),C0=A0*A0*(3-2*A0),I0=ge(.6,1,C0),S0=q.pl&&de<=0?q.pl[kt<0?0:1]:null;let J0=0,W0=null,rs=0,Yt=0,f0=0,k0=0,E0=null,q0=null;const j0=i&&i.T?i.rest*(1-ue)*(1-G)*(1-t0)*(1-mt(A0*4))*(1-ge(0,.16,N)):0;if(j0>0){const l0=kt<0?0:1,x0=i.T[l0],d0=[x0[0],Re(Ee.TIPY,.05,i.u[l0]),x0[1]],_0=f.sub(Gt,d0),X0=f.len(_0)||1;Gt=f.mad(Gt,_0,it(te-X0,-.06,.06)/X0*j0),W0=d0,J0=j0,rs=j0,s0=X(s0,f.norm(f.sub(d0,Gt)),j0)}if(A0>0){const l0=kt<0?o.footL:o.footR,x0=Math.sin(h0*Math.pow(C0,1.45)),d0=ae(-ae(-kt*(l0[0]+kt*.1-Gt[0]),0,.04),.12,.06),_0=Math.sqrt(Math.max(te*te-Math.pow(Gt[1]+.015,2),0)+.02);Gt=f.add(Gt,[kt*d0*C0,.06*x0,0]);const X0=kt*Math.max(kt*Gt[0]+.08,kt*l0[0]+.17),K0=X0-Gt[0],Q0=Re(.02,Ee.TIPY,I0);Gt[1]-=ge(.62,1,C0)*it(Gt[1]-Q0-Math.sqrt(Math.max(te*te-K0*K0-.09,.25)),0,.1);const ds=Math.max(Gt[1]-Q0,.2),ys=Math.sqrt(Math.max(te*te-ds*ds-K0*K0,.04)),Vs=f.norm(f.add(X(s0,f.norm([K0,-ds,-ys]),C0),[kt*.85*_0/te*x0,0,0]));if(S0&&!S0.d){W0=[S0.T[0],Ee.TIPY,S0.T[1]];const vs=f.sub(Gt,W0),Js=f.len(vs);q0=f.mul(vs,Math.max(te-.04-Js,0)/Js),Gt=f.add(Gt,q0),s0=f.norm(f.sub(W0,Gt)),J0=1,rs=1,Yt=1}else S0?(S0.h&&(Gt=f.mad(Gt,S0.h,1-S0.w)),s0=X(S0.d,X(s0,Vs,S0.g),S0.w),rs=Re(1-S0.w,I0,S0.g),Yt=1-S0.w):(s0=Vs,rs=I0)}if(de>0){const l0=Gt,x0=s0,d0=kt<0?0:1,_0=Pe(0,kt,k,ve),X0=kt*Math.max(kt*_0[0]+.05,Ae/2+.24),K0=[X0,Ee.TIPY,_0[2]+Math.sqrt(Math.max(.01,te*te-Math.pow(_0[1]-Ee.TIPY,2)-Math.pow(X0-_0[0],2)))];let Q0,ds;if(N<Ee.PLANT){Q0=ke([[0,l0],[.11,le(kt*.25,1.33+ve,-.49,k)],[Ee.PLANT,_0],[.34,Pe(.3,kt,k,ve)]],N);const ys=ge(0,Ee.PLANT,N),Vs=f.mad(l0,x0,te),vs=f.lerp(Vs,K0,ys);vs[1]+=.1*Math.sin(h0*ys)*(1-ys*.3),ds=f.norm(f.sub(vs,Q0)),N>Ee.PLANT-.03&&(J0=ge(Ee.PLANT-.03,Ee.PLANT,N),W0=K0)}else{const ys=Kt,Vs=N<ys,vs=yt&&yt.T?[yt.T[d0*2],Ee.TIPY,yt.T[d0*2+1]]:[K0[0],K0[1],K0[2]+Ee.V*Ee.T*(Math.min(N,ys)-Ee.PLANT)],Js=pe(vs,kt,k,ve,te),Qs=yt&&!Vs?yt.u[d0]:Math.min(Js,1),ha=Pe(Qs,kt,k,ve),Ga=f.norm(f.sub(vs,ha));if(E0=vs,f0=Qs,k0=Js,Vs)Q0=ha,ds=Ga,J0=1,W0=vs;else{const ea=(N-ys)/(1-ys),za=ge(.35,.85,Qs),Sa=yt&&yt.g?[yt.g[d0*3],yt.g[d0*3+1],yt.g[d0*3+2]]:ha;rs=1-ge(0,.16,ea);const Wa=f.lerp(Sa,le(kt*.27,.77+ve,.21,k),(.3+.7*Qs)*za),mn=f.lerp(f.lerp(Sa,l0,.45),le(kt*.295,.8+ve,-.06,k),(.4+.6*Qs)*za);let La;if(yt&&yt.v)La=[yt.v[d0*3],yt.v[d0*3+1],yt.v[d0*3+2]];else{const wn=[vs[0],vs[1],vs[2]-Ee.V*Ee.T*.02];La=f.mul(f.sub(ha,Pe(Math.min(pe(wn,kt,k,ve,te),1),kt,k,ve)),1/.02)}Q0=ke([[-.3,f.mad(Wa,La,-(1-ys)*.54)],[0,Sa],[.24,Wa],[.62,mn],[1,l0]],ea);const Ya=yt&&yt.d?[yt.d[d0*3],yt.d[d0*3+1],yt.d[d0*3+2]]:Ga,Xa=X(X(Ya,x0,.3),f.norm(le(kt*.06,-.26,.96,k)),za);ds=ea<.3?X(Ya,Xa,ge(0,.3,ea)):X(Xa,x0,ge(.3,1,ea))}}Gt=f.lerp(l0,Q0,de),s0=X(x0,ds,de),J0*=de,rs=Math.max(rs*de,J0)}if(t0>0){const l0=kt<0?o.footL:o.footR,x0=kt<0?et:tt,d0=f.add(l0,J(x0,kt*.092,.036,-.335));Gt=f.lerp(Gt,d0,t0),s0=X(s0,f.norm(J(x0,kt*.3,.2,.93)),t0)}const Y0=l0=>{const x0=f.sub(l0,e0),d0=f.len(x0);return d0>Lt?f.mad(e0,x0,Lt/d0):d0<.21?f.mad(e0,f.norm(f.add(x0,f.mul(J(Ft,kt*.02,-.02,-.03),mt((.21-d0)/.05)))),.21):l0};if(Gt[1]<.09&&(Gt[1]=.09+(Gt[1]-.09)*.2),Gt=Y0(Gt),t0<1){const l0=m0(m0(Gt,.062,kt),.062,kt);Gt=Y0(t0>0?f.lerp(l0,Gt,t0):l0)}let ls=0;if(J0>=1&&W0){const l0=f.sub(Gt,W0),x0=f.len(l0),d0=1-ge(.02,.03,Math.abs(x0-te));Gt=f.lerp(Gt,f.mad(W0,l0,te/x0),d0);const _0=f.sub(Gt,e0),X0=f.len(_0);X0>Lt&&(Gt=f.mad(e0,_0,Lt/X0)),ls=Math.abs(f.len(f.sub(Gt,W0))-te)}const ss=f.norm(f.sub(Gt,e0)),is=(l0,x0)=>{const d0=f.sub(l0,f.mul(ss,f.dot(l0,ss)));return f.mul(d0,x0*f.dot(d0,d0))},xs=de>0?de*ge(0,.45,f.dot(ss,Ft.Z)):0,vn=f.add(f.add(is(xs>0?J(Ft,kt*Re(.25,.08,xs),Re(-1,1,xs),.25):J(Ft,kt*.25,-1,.25),1),is(J(Ft,0,0,1),.35)),is(J(Ft,kt,0,.2),Re(.15,.1,ue)));let ca=re(e0,Gt,w.uarm,w.farm+w.grip,vn);{const l0=m0(ca,.055,kt,7);l0!==ca&&(ca=re(e0,Gt,w.uarm,w.farm+w.grip,f.sub(l0,f.lerp(e0,Gt,.5))))}if(J0>0&&W0&&(s0=X(s0,f.norm(f.sub(W0,Gt)),J0)),A0>0&&J0<1){const l0=ge(0,.15,A0);for(let x0=0;x0<3;x0++)for(let d0=kt<0?0:1;d0<4;d0+=2){const _0=_t[d0],X0=C(f.mad(Gt,s0,.15),f.mad(Gt,s0,te),_0[0],_0[1]),K0=f.sub(X0[0],X0[1]),Q0=f.len(K0),ds=Re(_0[2],_0[3],X0[3])+.031;Q0<ds&&Q0>.001&&(s0=f.norm(f.sub(f.mad(X0[0],K0,(ds-Q0)/Q0*l0),Gt)))}}if(J0<1&&Ot(Gt,s0)<0){let l0=f.norm(f.sub(f.add(Mt,J(ct,kt*.75,.25,.55)),Gt)),x0=Ot(Gt,l0);const d0=8;let _0=1,X0=1;if(x0<0)for(const K0 of[J(Ft,kt*.4,.25,.88),J(Ft,kt*.3,.6,.74),[0,.86,.5]]){const Q0=f.norm(K0),ds=Ot(Gt,Q0);if(ds>x0&&(l0=Q0,x0=ds),x0>=0)break}for(let K0=1;K0<=d0;K0++)if(Ot(Gt,X(s0,l0,K0/d0))>=0){X0=K0/d0,_0=(K0-1)/d0;break}for(let K0=0;K0<7&&X0>_0;K0++){const Q0=(_0+X0)/2;Ot(Gt,X(s0,l0,Q0))>=0?X0=Q0:_0=Q0}s0=X(s0,l0,X0*(1-J0))}{const l0=it((Re(.035,Ee.TIPY,rs)-.045*Yt-Gt[1])/te,-1,1);if(s0[1]<l0){const x0=Math.hypot(s0[0],s0[2]),d0=Math.sqrt(1-l0*l0)/(x0||1);s0=x0>1e-6?[s0[0]*d0,l0,s0[2]*d0]:[0,l0,Math.sqrt(1-l0*l0)]}}return{w:Gt,e:ca,d:s0,planted:J0,T:E0,u:f0,ur:k0,slip:ls,hp:q0}};let Bt=$t(-1),Ct=$t(1);yt&&yt.g&&N<Kt&&Math.max(Bt.slip,Ct.slip)>1e-4&&(Kt=yt.gf,jt=!0,Bt=$t(-1),Ct=$t(1)),o.gripL=Bt.w,o.elbowL=Bt.e,o.gripR=Ct.w,o.elbowR=Ct.e,o.poleDL=Bt.d,o.poleDR=Ct.d,o.wristL=f.mad(o.elbowL,f.norm(f.sub(o.gripL,o.elbowL)),w.farm),o.wristR=f.mad(o.elbowR,f.norm(f.sub(o.gripR,o.elbowR)),w.farm),o.tipL=f.mad(o.gripL,Bt.d,te),o.tipR=f.mad(o.gripR,Ct.d,te),o.plantedL=Bt.planted,o.plantedR=Ct.planted,p[s.pelvis]=Wt.fromBasis(ct.X,ct.Y,ct.Z,Mt),p[s.spine]=m(Mt,f.sub(o.chest,Mt),f.add(ct.X,xt.X)),p[s.chest]=m(o.chest,f.sub(o.neck,o.chest),lt.X),p[s.neck]=m(o.neck,Xt,f.add(lt.X,Ut.X)),p[s.head]=Wt.fromBasis(Ut.X,Ut.Y,Ut.Z,o.skull);const Zt=(kt,Ht,Qt,e0,t0)=>{const g0=f.cross(f.sub(Qt,Ht),f.sub(e0,Qt)),p0=f.len(g0)>1e-4?f.norm(g0):t0;return p[kt]=m(Ht,f.sub(Qt,Ht),p0),p[kt+1]=m(Qt,f.sub(e0,Qt),p0),p0},n0=Zt(s.uarmL,o.shL,o.elbowL,o.gripL,[1,0,0]);p[s.handL]=m(o.wristL,f.sub(o.gripL,o.elbowL),f.cross(f.sub(o.gripL,o.elbowL),Bt.d));const i0=Zt(s.uarmR,o.shR,o.elbowR,o.gripR,[1,0,0]);p[s.handR]=m(o.wristR,f.sub(o.gripR,o.elbowR),f.cross(f.sub(o.gripR,o.elbowR),Ct.d)),Zt(s.thighL,ft,o.kneeL,o.ankleL,[-1,0,0]),Zt(s.thighR,dt,o.kneeR,o.ankleR,[-1,0,0]),p[s.footL]=Wt.fromBasis(et.X,et.Y,et.Z,o.footL),p[s.footR]=Wt.fromBasis(tt.X,tt.Y,tt.Z,o.footR),p[s.poleL]=m(o.gripL,f.mul(o.poleDL,-1),[1,0,0]),p[s.poleR]=m(o.gripR,f.mul(o.poleDR,-1),[1,0,0]);const w0=de>0&&Bt.T?{T:[Bt.T,Ct.T],u:[Bt.u,Ct.u],out:jt||Math.max(Bt.ur,Ct.ur)>1}:null;return{J:o,F:p,hb:Ut,t1:xt,t2:lt,pb:ct,fbL:et,fbR:tt,caps:_t,c:$,hinge:wt,up2:ut,dp:w0,hp:[Bt.hp,Ct.hp],br:j}}e.debugCaps=function(r){const q=c(Object.assign({},ne,r)),k=q.J,ee=[],Z=(K,ue,G,Ae,_e)=>ee.push({a:K,b:ue,ra:G,rb:Ae==null?G:Ae,col:_e});for(const K of q.caps)Z(K[0],K[1],K[2],K[3],[.85,.45,.2]);for(const K of["L","R"]){Z(k["sh"+K],k["elbow"+K],.06,.052,[.9,.5,.25]),Z(k["elbow"+K],k["wrist"+K],.052,.045,[.9,.55,.3]),Z(k["grip"+K],k["grip"+K],.055,.055,[.1,.1,.1]),Z(k["grip"+K],k["tip"+K],.012,.008,[.2,.2,.25]);const ue=k["foot"+K],G=K==="L"?q.fbL:q.fbR;Z(f.add(ue,J(G,0,.01,.78)),f.add(ue,J(G,0,.01,-.9)),.03,.03,[.1,.5,.5]),Z(f.add(ue,J(G,0,.09,.08)),f.add(ue,J(G,0,.09,-.15)),.055,.055,[.7,.7,.72])}return Z(k.shL,k.shR,.075,.075,[.85,.45,.2]),Z(k.neck,k.skull,.06,.06,[.2,.2,.3]),ee},e.solve=c,e.P0=ne,e.B=s,e.LEN=w,e.fixMesh=r=>Se(r);function Ie(r){const q=r[0],k=r[1],ee=r[2],Z=r[4],K=r[5],ue=r[6],G=r[8],Ae=r[9],_e=r[10],at=q+K+_e;if(at>0){const t=Math.sqrt(at+1)*2;return[(ue-Ae)/t,(G-ee)/t,(k-Z)/t,t/4]}if(q>K&&q>_e){const t=Math.sqrt(1+q-K-_e)*2;return[t/4,(Z+k)/t,(G+ee)/t,(ue-Ae)/t]}if(K>_e){const t=Math.sqrt(1+K-q-_e)*2;return[(Z+k)/t,t/4,(Ae+ue)/t,(G-ee)/t]}const ot=Math.sqrt(1+_e-q-K)*2;return[(G+ee)/ot,(Ae+ue)/ot,ot/4,(k-Z)/ot]}function he(r,q,k,ee,Z,K,ue){const G=Ie(r[k]),Ae=Ie(r[ee]),_e=G[0]*Ae[0]+G[1]*Ae[1]+G[2]*Ae[2]+G[3]*Ae[3]<0?-1:1,at=ue==null?1:1-ue,ot=_e*(ue==null?1:ue);let t=at*G[0]+ot*Ae[0],S=at*G[1]+ot*Ae[1],l=at*G[2]+ot*Ae[2],u=at*G[3]+ot*Ae[3];const v=Math.hypot(t,S,l,u)||1;t/=v,S/=v,l/=v,u/=v;const P=[1-2*(S*S+l*l),2*(t*S+u*l),2*(t*l-u*S),0,2*(t*S-u*l),1-2*(t*t+l*l),2*(S*l+u*t),0,2*(t*l+u*S),2*(S*l-u*t),1-2*(t*t+S*S),0,0,0,0,1];P[12]=K[0]-(P[0]*Z[0]+P[4]*Z[1]+P[8]*Z[2]),P[13]=K[1]-(P[1]*Z[0]+P[5]*Z[1]+P[9]*Z[2]),P[14]=K[2]-(P[2]*Z[0]+P[6]*Z[1]+P[10]*Z[2]),r[q]=P}function H(r){const q=new Array(e.NB),k=r.F,ee=se.J,Z=r.J;for(let K=0;K<18;K++)q[K]=Wt.mul(k[K],_[K]);if(q[s.neck]=Wt.mul(k[s.neck],_[s.neck]),he(q,s.kneeL,s.thighL,s.shinL,ee.kneeL,Z.kneeL),he(q,s.kneeR,s.thighR,s.shinR,ee.kneeR,Z.kneeR),he(q,s.elbowL,s.uarmL,s.farmL,ee.elbowL,Z.elbowL),he(q,s.elbowR,s.uarmR,s.farmR,ee.elbowR,Z.elbowR),he(q,s.seatL,s.pelvis,s.thighL,ee.hipL,Z.hipL),he(q,s.seatR,s.pelvis,s.thighR,ee.hipR,Z.hipR),he(q,s.shL,s.chest,s.uarmL,ee.shL,Z.shL),he(q,s.shR,s.chest,s.uarmR,ee.shR,Z.shR),he(q,s.tail,s.pelvis,s.spine,se.seatC,Wt.tp(k[s.pelvis],z),1.4),r.hem&&(r.hem[0]||r.hem[1])){const K=-r.hem[0],ue=r.hem[1],G=Math.cos(K),Ae=Math.sin(K),_e=Math.cos(ue),at=Math.sin(ue),ot=ce,t=Wt.mul([1,0,0,0,0,G,Ae,0,0,-Ae,G,0,0,0,0,1],[_e,at,0,0,-at,_e,0,0,0,0,1,0,0,0,0,1]);t[12]=ot[0]-(t[0]*ot[0]+t[4]*ot[1]+t[8]*ot[2]),t[13]=ot[1]-(t[1]*ot[0]+t[5]*ot[1]+t[9]*ot[2]),t[14]=ot[2]-(t[2]*ot[0]+t[6]*ot[1]+t[10]*ot[2]),q[s.tail]=Wt.mul(q[s.tail],Wt.mul(se.F[s.pelvis],Wt.mul(t,_[s.pelvis])))}return r.br&&(q[s.chest]=Wt.mul(Wt.mul(k[s.chest],[1+.018*r.br,0,0,0,0,1,0,0,0,0,1+.035*r.br,0,0,0,0,1]),_[s.chest])),q}e.skin=function(r,q){const k=c(Object.assign({},ne,r),q);return{M:H(k),J:k.J,s:k}};const z=[0,-.085,.052],V=e.HEAD={shell:[0,.004,.014,.106,.105,.133],ear:[.088,-.05,.02,.028,.05,.054],brim:[0,.032,-.1,.08,.009,.03],cut:[0,-.078,-.125,.074,.08,.085,.024],gy:-.02,gz:-.015,gr:.114,gt:.006,gh:.042,ga:1.2,sh:.0145,rim:-.072,face:[0,-.028,-.004,.078,.088,.096],chin:[0,-.075,-.04],chinR:.064},I=(r,q,k,ee)=>{const Z=(r-ee[0])/ee[3],K=(q-ee[1])/ee[4],ue=(k-ee[2])/ee[5],G=Math.sqrt(Z*Z+K*K+ue*ue),Ae=Z/ee[3],_e=K/ee[4],at=ue/ee[5],ot=Math.sqrt(Ae*Ae+_e*_e+at*at);return ot>1e-9?G*(G-1)/ot:-Math.min(ee[3],ee[4],ee[5])},Q=(r,q,k)=>{const ee=Math.max(k-Math.abs(r-q),0)/k;return Math.min(r,q)-ee*ee*k*.25},L=(r,q,k)=>-Q(-r,-q,k);function ye(r,q,k){const ee=V;let Z=I(r,q,k,ee.shell);Z=Q(Z,I(Math.abs(r),q,k,ee.ear),.02),Z=Q(Z,I(r,q,k,ee.brim),.012),Z=Q(Z,L(L(I(r,q,k,[ee.shell[0],ee.shell[1],ee.shell[2],ee.shell[3]+.005,ee.shell[4]+.005,ee.shell[5]+.005]),Math.abs(r)-.013,.006),.045-q,.01),.006);const K=ee.cut,ue=Math.abs(r-K[0])-K[3]+K[6],G=Math.abs(q-K[1])-K[4]+K[6],Ae=Math.abs(k-K[2])-K[5]+K[6];Z=L(Z,-(Math.hypot(Math.max(ue,0),Math.max(G,0),Math.max(Ae,0))+Math.min(Math.max(ue,G,Ae),0)-K[6]),.008),Z=L(Z,ee.rim+.25*Math.max(k,0)-q,.014);const _e=ee.shell;return Math.min(Z,L(I(r,q,k,[_e[0],_e[1],_e[2],_e[3]+.003,_e[4]+.003,_e[5]+.003]),Math.abs(q-ee.gy)-ee.sh,.003))}function Ve(r,q,k){const ee=V,Z=k-ee.gz,K=Math.hypot(r,Z),ue=Math.atan2(Math.abs(r),-Z),G=Math.abs(K-ee.gr)-ee.gt,Ae=Math.abs(q-ee.gy)-ee.gh,_e=(ue-ee.ga)*K;return Math.hypot(Math.max(G,0),Math.max(Ae,0),Math.max(_e,0))+Math.min(Math.max(G,Ae,_e),0)-.004}const Ne=e.PACK={box:[0,-.055,.18,.122,.195,.062,.055],lid:[0,.125,.17,.112,.07,.068],pocket:[0,-.12,.25,.08,.085,.018,.018],k:[.035,.02]};function Ce(r,q){const k=r.J,ee=r.F,Z=Math.sqrt,K=N0.smin,ue=N0.smax,G=(Ft,Lt)=>{const yt=Lt[0]-Ft[0],Rt=Lt[1]-Ft[1],Vt=Lt[2]-Ft[2];return[Ft[0],Ft[1],Ft[2],yt,Rt,Vt,1/(yt*yt+Rt*Rt+Vt*Vt)]},Ae=(Ft,Lt,yt,Rt,Vt,Kt)=>{const jt=Ft-Rt[0],Ot=Lt-Rt[1],$t=yt-Rt[2];let Bt=(jt*Rt[3]+Ot*Rt[4]+$t*Rt[5])*Rt[6];Bt=Bt<0?0:Bt>1?1:Bt;const Ct=jt-Rt[3]*Bt,Zt=Ot-Rt[4]*Bt,n0=$t-Rt[5]*Bt;return Z(Ct*Ct+Zt*Zt+n0*n0)-(Vt+(Kt-Vt)*Bt)},_e=(Ft,Lt,yt,Rt,Vt)=>{const Kt=Ft-Rt[0],jt=Lt-Rt[1],Ot=yt-Rt[2];return Z(Kt*Kt+jt*jt+Ot*Ot)-Vt},at=(Ft,Lt,yt,Rt,Vt,Kt,jt,Ot,$t)=>{const Bt=(Ft-Rt)/jt,Ct=(Lt-Vt)/Ot,Zt=(yt-Kt)/$t,n0=Z(Bt*Bt+Ct*Ct+Zt*Zt),i0=Bt/jt,w0=Ct/Ot,kt=Zt/$t,Ht=Z(i0*i0+w0*w0+kt*kt);return Ht>1e-9?n0*(n0-1)/Ht:-Math.min(jt,Ot,$t)},ot=(Ft,Lt,yt,Rt,Vt,Kt,jt,Ot,$t,Bt)=>{const Ct=Math.abs(Ft-Rt)-jt+Bt,Zt=Math.abs(Lt-Vt)-Ot+Bt,n0=Math.abs(yt-Kt)-$t+Bt,i0=Ct>0?Ct:0,w0=Zt>0?Zt:0,kt=n0>0?n0:0,Ht=Ct>Zt?Ct>n0?Ct:n0:Zt>n0?Zt:n0;return Z(i0*i0+w0*w0+kt*kt)+(Ht<0?Ht:0)-Bt},t=(Ft,Lt,yt,Rt)=>Wt.tp(ee[Ft],[Lt,yt,Rt]),S=[0,0,0],l=(Ft,Lt,yt,Rt)=>{const Vt=Lt-Ft[12],Kt=yt-Ft[13],jt=Rt-Ft[14];S[0]=Vt*Ft[0]+Kt*Ft[1]+jt*Ft[2],S[1]=Vt*Ft[4]+Kt*Ft[5]+jt*Ft[6],S[2]=Vt*Ft[8]+Kt*Ft[9]+jt*Ft[10]},u=(Ft,Lt,yt,Rt,Vt,Kt,jt,Ot,$t)=>{let Bt=(Lt-Rt)/(Vt-Rt);Bt=Bt<0?0:Bt>1?1:Bt;const Ct=Kt+(Ot-Kt)*Bt,Zt=jt+($t-jt)*Bt,n0=Lt-(Rt+(Vt-Rt)*Bt),i0=Ft/Ct,w0=n0/Zt,kt=yt/Zt,Ht=Z(i0*i0+w0*w0+kt*kt),Qt=i0/Ct,e0=w0/Zt,t0=kt/Zt,g0=Z(Qt*Qt+e0*e0+t0*t0);return g0>1e-9?Ht*(Ht-1)/g0:-Math.min(Ct,Zt)},v=(Ft,Lt,yt,Rt,Vt,Kt,jt,Ot,$t)=>{let Bt=(Lt-Rt)/(Vt-Rt);Bt=Bt<0?0:Bt>1?1:Bt;const Ct=Kt+(Ot-Kt)*Bt,Zt=jt+($t-jt)*Bt,n0=Math.abs(Ft)/Ct,i0=(Lt-(Rt+(Vt-Rt)*Bt))/Zt,w0=Math.abs(yt)/Zt,kt=Math.cbrt(n0*n0*n0+w0*w0*w0);return(Z(kt*kt+i0*i0)-1)*(Ct<Zt?Ct:Zt)},P=ee[s.pelvis],N=ee[s.spine],de=ee[s.chest],te=ee[s.head],o=G(t(s.chest,0,.2,.004),t(s.chest,-.155,.188,.004)),p=G(t(s.chest,0,.2,.004),t(s.chest,.155,.188,.004)),i=G(t(s.chest,0,.21,.006),t(s.chest,0,.235,.006)),y=G(t(s.chest,-.165,.2,0),t(s.chest,.165,.2,0)),j=G(t(s.chest,0,.21,.004),t(s.chest,0,.262,-.002)),W=G(k.neck,f.mad(k.head,r.hb.Y,-.05)),h=[0,1].map(Ft=>{const Lt=Ft?"R":"L",yt=k["sh"+Lt],Rt=k["elbow"+Lt],Vt=k["wrist"+Lt],Kt=k["grip"+Lt],jt=f.norm(f.sub(Kt,Rt));return{up:G(yt,Rt),upB:G(f.lerp(yt,Rt,.1),Rt),fo:G(Rt,f.mad(Vt,jt,-.03)),gaB:G(f.mad(Vt,jt,-.085),f.mad(Vt,jt,.005)),ga:G(f.mad(Vt,jt,-.05),Vt),hu:G(Rt,Kt),mH:ee[Ft?s.handR:s.handL]}}),n=[0,1].map(Ft=>{const Lt=Ft?s.thighR:s.thighL,yt=Lt+1,Rt=Lt+2,Vt=Ft?"R":"L";return{ta:G(t(Lt,0,.03,0),t(Lt,0,.21,-.016)),tb:G(t(Lt,0,.21,-.016),t(Lt,0,.425,-.004)),kc:t(yt,0,0,-.03),sa:G(t(yt,0,.02,0),t(yt,0,.15,.012)),sb:G(t(yt,0,.15,.012),t(yt,0,.365,.004)),cu:G(t(yt,0,.25,.01),t(yt,0,.425,.006)),mS:ee[yt],mF:ee[Rt],h0:G(k["hip"+Vt],k["knee"+Vt]),h1:G(k["knee"+Vt],k["ankle"+Vt]),h2:G(t(Rt,0,.09,.25),t(Rt,0,.09,-.27))}}),d={jacket:0,armSide:0,pants:0,glove:0,boot:0,bind:0,helmet:0,gog:0,buff:0,pack:0,q:[0,0,0]};let M=0,g=0,R=0,Ue=0,$=0,ve=0,xe=0,De=0,Te=0,Me=0;function rt(Ft,Lt,yt){l(P,Ft,Lt,yt);const Rt=S[1],Vt=S[2];let Kt=v(S[0],S[1],S[2]-.012,-.14,.02,.192,.15,.186,.142);l(N,Ft,Lt,yt),Kt=K(Kt,u(S[0],S[1],S[2]-.008,.02,.25,.184,.138,.18,.13),.05),l(de,Ft,Lt,yt);const jt=S[0],Ot=S[1],$t=S[2];return Kt=K(Kt,u(jt,Ot,$t-.005,0,.17,.182,.132,.17,.115),.06),q?(Kt=K(Kt,Math.min(Ae(Ft,Lt,yt,o,.084,.058),Ae(Ft,Lt,yt,p,.084,.058)),.06),Kt=K(Kt,at(jt,Ot,$t,0,.222,.016,.145,.062,.085),.05),Kt=K(Kt,at(jt,Ot,$t,0,.09,-.035,.15,.1,.11),.06)):(Kt=K(Kt,Ae(Ft,Lt,yt,y,.082,.082),.05),Kt=K(Kt,at(jt,Ot,$t,0,.235,.012,.1,.055,.075),.04)),Kt=ue(Kt,-(Rt+.082+.026*mt((Vt+.02)/.14)),.014),M=Kt,Kt=K(Kt,q?Ae(Ft,Lt,yt,i,.088,.08):Ae(Ft,Lt,yt,j,.076,.07),q?.045:.03),q?K(Kt,at(jt,Ot,$t,0,.19,.078,.1,.045,.04),.05):K(Kt,at(jt,Ot,$t,0,.2,.095,.115,.07,.055),.03)}const wt=Ne.box,Ze=Ne.lid,ct=Ne.pocket;function Mt(Ft,Lt,yt){l(de,Ft,Lt,yt);const Rt=K(ot(S[0],S[1],S[2],wt[0],wt[1],wt[2],wt[3],wt[4],wt[5],wt[6]),at(S[0],S[1],S[2],Ze[0],Ze[1],Ze[2],Ze[3],Ze[4],Ze[5]),Ne.k[0]);return K(Rt,ot(S[0],S[1],S[2],ct[0],ct[1],ct[2],ct[3],ct[4],ct[5],ct[6]),Ne.k[1])}function ft(Ft,Lt,yt,Rt){const Vt=h[Ft];if(q){const Ot=K(Ae(Lt,yt,Rt,Vt.upB,.057,.049),Ae(Lt,yt,Rt,Vt.fo,.047,.044),.04);l(Vt.mH,Lt,yt,Rt);const $t=S[0],Bt=S[1],Ct=S[2];let Zt=K(Ae(Lt,yt,Rt,Vt.gaB,.057,.049),ot($t,Bt,Ct,0,.066,.004,.04,.05,.045,.03),.018);return Zt=K(Zt,at($t,Bt,Ct,0,.052,-.04,.022,.034,.019),.012),g=Ot,R=Zt,K(Ot,Zt,.012)}const Kt=K(Ae(Lt,yt,Rt,Vt.up,.068,.058),Ae(Lt,yt,Rt,Vt.fo,.058,.047),.02);l(Vt.mH,Lt,yt,Rt);const jt=K(Ae(Lt,yt,Rt,Vt.ga,.056,.052),at(S[0],S[1],S[2],0,.068,0,.044,.054,.05),.02);return g=Kt,R=jt,K(Kt,jt,.012)}function dt(Ft,Lt,yt){return l(P,Ft,Lt,yt),q?K(K(at(S[0],S[1],S[2],0,-.035,.005,.176,.13,.12),at(Math.abs(S[0]),S[1],S[2],.07,-.085,.036,.094,.1,.074),.08),at(S[0],S[1],S[2],0,-.088,.046,.155,.092,.074),.06):K(at(S[0],S[1],S[2],0,-.035,.005,.172,.13,.118),at(Math.abs(S[0]),S[1],S[2],.082,-.085,.052,.092,.098,.092),.045)}function gt(Ft,Lt,yt,Rt){const Vt=n[Ft];if(q){let $t=K(Ae(Lt,yt,Rt,Vt.ta,.112,.1),Ae(Lt,yt,Rt,Vt.tb,.1,.086),.04);$t=K($t,_e(Lt,yt,Rt,Vt.kc,.054),.05);let Bt=K(Ae(Lt,yt,Rt,Vt.sa,.084,.086),Ae(Lt,yt,Rt,Vt.sb,.086,.104),.04);l(Vt.mS,Lt,yt,Rt),Bt=ue(Bt,S[1]-.368,.01),$t=K($t,Bt,.04);const Ct=Ae(Lt,yt,Rt,Vt.cu,.072,.068);return Ue=$t,$=Ct,K($t,Ct,.012)}let Kt=K(Ae(Lt,yt,Rt,Vt.ta,.108,.096),Ae(Lt,yt,Rt,Vt.tb,.096,.077),.03);Kt=K(Kt,_e(Lt,yt,Rt,Vt.kc,.064),.04);let jt=K(Ae(Lt,yt,Rt,Vt.sa,.077,.082),Ae(Lt,yt,Rt,Vt.sb,.082,.096),.03);l(Vt.mS,Lt,yt,Rt),jt=ue(jt,S[1]-.355,.01),Kt=K(Kt,jt,.03);const Ot=Ae(Lt,yt,Rt,Vt.cu,.072,.068);return Ue=Kt,$=Ot,K(Kt,Ot,.012)}function bt(Ft,Lt,yt,Rt){l(n[Ft].mF,Lt,yt,Rt);const Vt=S[0],Kt=S[1],jt=S[2];let Ot=ot(Vt,Kt,jt,0,.088,-.02,.052,.04,.152,.032);Ot=ue(Ot,(Kt-.15-.33*(jt+.02))*.95,.02),Ot=K(Ot,at(Vt,Kt,jt,0,.135,.02,.05,.06,.085),.025);let $t=ot(Vt,Kt,jt,0,.034,-.03,.034,.014,.25,.006);return $t=K($t,ot(Vt,Kt,jt,0,.066,-.218,.036,.03,.042,.014),.008),$t=K($t,ot(Vt,Kt,jt,0,.075,.185,.037,.04,.052,.014),.008),$t=K($t,at(Vt,Kt,jt,0,.105,.235,.026,.022,.04),.008),ve=Ot,xe=$t,K(Ot,$t,.006)}const Xe=[0,.006,.008],et=[0,-.07,-.045];function tt(Ft,Lt,yt){l(te,Ft,Lt,yt);const Rt=S[0],Vt=S[1]-w.head,Kt=S[2]+.015;if(d.q[0]=Rt,d.q[1]=Vt,d.q[2]=Kt,q){const Bt=V,Ct=ye(Rt,Vt,Kt),Zt=Ve(Rt,Vt,Kt),n0=K(K(at(Rt,Vt,Kt,Bt.face[0],Bt.face[1],Bt.face[2],Bt.face[3],Bt.face[4],Bt.face[5]),_e(Rt,Vt,Kt,Bt.chin,Bt.chinR),.03),Ae(Ft,Lt,yt,W,.06,.058),.03);return De=Ct,Te=Zt,Me=n0,K(K(Ct,Zt,.005),n0,.012)}let jt=at(Rt,Vt,Kt,0,.006,.008,.114,.119,.13);jt=K(jt,at(Math.abs(Rt),Vt,Kt,.096,-.048,.014,.03,.052,.056),.02);const Ot=ot(Rt,Vt,Kt,0,0,-.104,.082,.038,.03,.026),$t=K(_e(Rt,Vt,Kt,et,.072),Ae(Ft,Lt,yt,W,.062,.06),.03);return De=jt,Te=Ot,Me=$t,K(K(jt,Ot,.012),$t,.02)}const Oe=(Ft,Lt,yt,Rt)=>Ft===0?rt(Lt,yt,Rt):Ft===1?ft(0,Lt,yt,Rt):Ft===2?ft(1,Lt,yt,Rt):Ft===3?dt(Lt,yt,Rt):Ft===4?gt(0,Lt,yt,Rt):Ft===5?gt(1,Lt,yt,Rt):Ft===6?tt(Lt,yt,Rt):Ft===9?Mt(Lt,yt,Rt):bt(Ft-7,Lt,yt,Rt),ze=q?.055:.035,pt=Ft=>{let Lt=K(K(K(Ft[0],Ft[9],.014),Ft[1],ze),Ft[2],ze);return Lt=K(Lt,K(K(Ft[3],Ft[4],.05),Ft[5],.05),.014),Lt=K(Lt,Ft[6],.02),K(K(Lt,Ft[7],.02),Ft[8],.02)},ut=G(t(s.pelvis,0,-.1,.02),f.mad(k.neck,r.t2.Y,.02)),xt=G(t(s.chest,-.17,.2,.01),t(s.chest,.17,.2,.01)),lt=G(k.neck,f.mad(k.head,r.hb.Y,.02)),Tt=t(s.pelvis,0,-.06,.02),Et=G(t(s.chest,0,-.17,.185),t(s.chest,0,.1,.18)),Ut=new Float64Array(10),Xt=new Float64Array(10);function _t(Ft,Lt,yt){Ut[0]=Math.min(Ae(Ft,Lt,yt,ut,.205,.205),Ae(Ft,Lt,yt,xt,.095,.095)),Ut[3]=_e(Ft,Lt,yt,Tt,.2),Ut[6]=Ae(Ft,Lt,yt,lt,.165,.165),Ut[9]=Ae(Ft,Lt,yt,Et,.165,.165);for(let Ot=0;Ot<2;Ot++){const $t=h[Ot],Bt=n[Ot];Ut[1+Ot]=Math.min(Ae(Ft,Lt,yt,$t.up,.085,.085),Ae(Ft,Lt,yt,$t.hu,.075,.075)),Ut[4+Ot]=Math.min(Ae(Ft,Lt,yt,Bt.h0,.13,.13),Ae(Ft,Lt,yt,Bt.h1,.12,.12)),Ut[7+Ot]=Ae(Ft,Lt,yt,Bt.h2,.115,.115)}let Rt=Ut[0],Vt=0;for(let Ot=1;Ot<10;Ot++)Ut[Ot]<Rt&&(Rt=Ut[Ot],Vt=Ot);if(Rt>.16)return Rt;const Kt=Oe(Vt,Ft,Lt,yt),jt=Kt+.055;for(let Ot=0;Ot<10;Ot++)Xt[Ot]=Ot===Vt?Kt:Ut[Ot]<jt?Oe(Ot,Ft,Lt,yt):1e9;return pt(Xt)}function m0(Ft,Lt,yt){const Rt=rt(Ft,Lt,yt),Vt=M;d.pack=Mt(Ft,Lt,yt),ft(0,Ft,Lt,yt);const Kt=g,jt=R;ft(1,Ft,Lt,yt);const Ot=Math.min(Kt,g);d.jacket=K(Rt,Ot,ze),d.armSide=Ot-Vt,d.glove=Math.min(jt,R);const $t=dt(Ft,Lt,yt);gt(0,Ft,Lt,yt);const Bt=Ue,Ct=$;gt(1,Ft,Lt,yt),d.pants=K(K($t,Bt,.05),Ue,.05),bt(0,Ft,Lt,yt);const Zt=ve,n0=xe;return bt(1,Ft,Lt,yt),d.boot=Math.min(Ct,$,Zt,ve),d.bind=Math.min(n0,xe),tt(Ft,Lt,yt),d.helmet=De,d.gog=Te,d.buff=Me,d}function r0(Ft,Lt,yt,Rt,Vt,Kt,jt){const Ot=m0(Ft,Lt,yt);let $t=0,Bt=Ot.jacket;Ot.pants<Bt&&(Bt=Ot.pants,$t=1),Ot.glove<Bt&&(Bt=Ot.glove,$t=2),Ot.boot<Bt&&(Bt=Ot.boot,$t=3),Ot.bind<Bt&&(Bt=Ot.bind,$t=11),Ot.buff<Bt&&(Bt=Ot.buff,$t=7),Ot.pack<Bt&&(Bt=Ot.pack,$t=8),Ot.helmet<Bt&&(Bt=Ot.helmet,$t=4),Ot.gog-.002<Bt&&(Bt=Ot.gog,$t=5),jt[2]=0,jt[3]=0,$t<=1?(jt[2]=it(Ot.pants-Ot.jacket,-.05,.05),jt[3]=it(Ot.armSide,-.05,.05)):$t>=4&&$t<=7?(jt[2]=Ot.q[1],jt[3]=Ot.q[2]):$t===8&&(jt[3]=.05);const Ct=mt(.25+.75*(.6*mt(_t(Ft+Rt*.05,Lt+Vt*.05,yt+Kt*.05)/.05)+.4*mt(_t(Ft+Rt*.14,Lt+Vt*.14,yt+Kt*.14)/.14)));jt[0]=$t,jt[1]=Ct}return{f:_t,attr:r0,parts:m0}}function Ye(r,q,k,ee){const Z=q.J,K=q.F,ue=r.nv,G=new Float32Array(ue*4),Ae=N0.capsule,_e=ee?.044:.03,at=(d,M,g,R,Ue)=>Ae(d,M,g,R[0][0],R[0][1],R[0][2],R[1][0],R[1][1],R[1][2],Ue,Ue),ot=(d,M,g,R,Ue)=>Math.hypot(d-R[0],M-R[1],g-R[2])-Ue,t=q.t2.Y,S=f.norm(f.sub(Z.chest,Z.pelvis)),l=[Z.hipL,Z.hipR],u=[f.mad(Z.pelvis,S,.07),f.mad(Z.chest,S,-.04)],v=[f.mad(Z.chest,t,.04),f.mad(Z.neck,t,-.1)],P=[f.lerp(Z.shL,Z.shR,.1),f.lerp(Z.shL,Z.shR,.9)],N=f.mad(Z.neck,t,.04),de=f.mad(Z.neck,t,-.05),te=K[s.pelvis],o=[f.mad(Z.pelvis,S,-.12),u[1]],p=[0,1].map(d=>{const M=d?"R":"L",g=Z["hip"+M],R=Z["knee"+M],Ue=Z["ankle"+M],$=Z["sh"+M],ve=Z["elbow"+M],xe=Z["wrist"+M],De=f.norm(f.sub(R,g)),Te=f.norm(f.sub(Ue,R)),Me=f.norm(f.sub(ve,$)),rt=f.norm(f.sub(xe,ve));return{hip:g,kn:R,sh:$,el:ve,td:De,ud:Me,th:[f.mad(g,De,.12),f.mad(R,De,-.11)],sn:[f.mad(R,Te,.11),Ue],ua:[f.mad($,Me,.1),f.mad(ve,Me,-.09)],fa:[f.mad(ve,rt,.09),xe],seat:d?s.seatR:s.seatL,thigh:d?s.thighR:s.thighL,knee:d?s.kneeR:s.kneeL,shin:d?s.shinR:s.shinL,foot:d?s.footR:s.footL,shd:d?s.shR:s.shL,uarm:d?s.uarmR:s.uarmL,elbow:d?s.elbowR:s.elbowL,farm:d?s.farmR:s.farmL,hand:d?s.handR:s.handL,mS:K[d?s.shinR:s.shinL],mH:K[d?s.handR:s.handL]}}),i=[0,0,0,0,0,0,0,0,0,0],y=[0,0,0,0,0,0,0,0,0,0];let j=0,W=_e;const h=(d,M,g)=>{const R=g*Math.exp(-Math.max(M,0)/W);if(!(R<1e-4)){for(let Ue=0;Ue<j;Ue++)if(i[Ue]===d){R>y[Ue]&&(y[Ue]=R);return}i[j]=d,y[j]=R,j++}},n=(d,M,g,R)=>(M-d[12])*d[4]+(g-d[13])*d[5]+(R-d[14])*d[6];for(let d=0;d<ue;d++){const M=r.verts[d*10],g=r.verts[d*10+1],R=r.verts[d*10+2],Ue=Math.round(r.verts[d*10+6]),$=p[M<0?0:1],ve=d*4;j=0;const xe=(M-te[12])*te[0]+(g-te[13])*te[1]+(R-te[14])*te[2],De=(M-$.hip[0])*$.td[0]+(g-$.hip[1])*$.td[1]+(R-$.hip[2])*$.td[2],Te=Re(ge(0,.05,Math.abs(xe)),1,ge(.06,.15,De)),Me=p[M<0?1:0],rt=ge(0,.11,Math.abs(xe)),wt=ge(.04,.22,De),Ze=(M-te[12])*te[8]+(g-te[13])*te[9]+(R-te[14])*te[10],ct=ge(-.03,.05,Ze),Mt=Re(Re(ge(0,.11,Math.abs(xe)),.5+.5*rt,Re(.5,1,ct)),1,wt),ft=.5*(1-rt)*(1-wt)*Re(.5,1,ct),dt=Re(Re(ge(0,.15,Math.abs(xe)),ge(.06,.15,Math.abs(xe)),ct),1,wt);if(Ue===0||Ue===8){const ze=k.parts(M,g,R),pt=ze.armSide,ut=(M-$.sh[0])*$.ud[0]+(g-$.sh[1])*$.ud[1]+(R-$.sh[2])*$.ud[2],xt=Ue===8,lt=pt<0&&!xt?(1-ge(.004,.05,-pt))*(1-ge(.05,.15,ut)):1,Tt=(pt>=0?1-ge(.004,.045,pt):1)*(xt?1-ge(0,.03,ze.jacket):1),Et=(M-te[12])*te[4]+(g-te[13])*te[5]+(R-te[14])*te[6],Ut=(M-te[12])*te[8]+(g-te[13])*te[9]+(R-te[14])*te[10],Xt=xt?1:ge(-.02,.07,Ut),_t=xt?0:Xt*(1-ge(.02,.13,Et+.082+.026*mt((Ut+.02)/.14)));h(s.pelvis,at(M,g,R,l,.14),lt*(1-.8*Xt)),h(s.spine,at(M,g,R,u,.15),lt),Xt>0&&h(s.spine,at(M,g,R,o,.15),lt*Xt*(1-.8*_t)),_t>0&&h(s.tail,0,lt*_t),h(s.chest,Math.min(at(M,g,R,v,.15),at(M,g,R,P,.085)),lt),h(s.neck,ot(M,g,R,N,.07),lt),ee&&(W=.032),h($.shd,ot(M,g,R,$.sh,.078),Tt),h($.uarm,at(M,g,R,$.ua,.062),Tt),h($.elbow,ot(M,g,R,$.el,.06),Tt),h($.farm,at(M,g,R,$.fa,.052),Tt),W=_e,ee?(h($.seat,ot(M,g,R,$.hip,.12),Mt*lt*(1-Xt)),ft>0&&h(Me.seat,ot(M,g,R,Me.hip,.12),ft*lt*(1-Xt)),h($.thigh,at(M,g,R,$.th,.1),dt*lt*(1-Xt))):(h($.seat,ot(M,g,R,$.hip,.12),Te*lt*(1-Xt)),h($.thigh,at(M,g,R,$.th,.1),Te*lt*(1-Xt)))}else if(Ue===1)h(s.pelvis,at(M,g,R,l,.125),1),ee?(h($.seat,ot(M,g,R,$.hip,.14),Mt),ft>0&&h(Me.seat,ot(M,g,R,Me.hip,.14),ft),h($.thigh,at(M,g,R,$.th,.085),dt)):(h($.seat,ot(M,g,R,$.hip,.105),Te),h($.thigh,at(M,g,R,$.th,.085),Te)),h($.knee,ot(M,g,R,$.kn,.072),Te),h($.shin,at(M,g,R,$.sn,.08),Te);else if(Ue===2)h($.hand,0,ge(-.075,-.015,n($.mH,M,g,R))),h($.farm,0,1-ge(-.075,-.015,n($.mH,M,g,R)));else if(Ue===3){const ze=ge(.33,.41,n($.mS,M,g,R));h($.foot,0,ze),h($.shin,0,1-ze)}else Ue===11?h($.foot,0,1):Ue===7?(h(s.head,ot(M,g,R,Z.head,.11),1),h(s.neck,ot(M,g,R,N,.06),1),h(s.chest,ot(M,g,R,de,.09),1)):h(s.head,0,1);j||(i[0]=s.pelvis,y[0]=1,j=1);let gt=0;for(let ze=1;ze<j;ze++)y[ze]>y[gt]&&(gt=ze);let bt=-1;for(let ze=0;ze<j;ze++)ze!==gt&&(bt<0||y[ze]>y[bt])&&(bt=ze);let Xe=-1;for(let ze=0;ze<j;ze++)ze!==gt&&ze!==bt&&(Xe<0||y[ze]>y[Xe])&&(Xe=ze);const et=y[gt],tt=bt<0?0:y[bt],Oe=Xe<0?0:y[Xe];G[ve]=i[gt],G[ve+1]=bt<0?i[gt]:i[bt],G[ve+2]=et/(et+tt),G[ve+3]=Oe>0?i[Xe]+Math.min(Oe/(et+tt+Oe),.99):0}return G}function T(r,q){const k=Array.from(r.verts),ee=Array.from(q),Z=r.idx,K=new Map;for(let ue=0;ue<Z.length;ue+=3){const G=Math.round(k[Z[ue]*10+6]),Ae=Math.round(k[Z[ue+1]*10+6]),_e=Math.round(k[Z[ue+2]*10+6]);if(G===Ae&&Ae===_e)continue;const at=Ae===_e?Ae:G;for(let ot=0;ot<3;ot++){const t=Z[ue+ot];if(Math.round(k[t*10+6])===at)continue;const S=t*16+at;let l=K.get(S);if(l===void 0){l=k.length/10;for(let u=0;u<10;u++)k.push(k[t*10+u]);k[l*10+6]=at;for(let u=0;u<4;u++)ee.push(ee[t*4+u]);K.set(S,l)}Z[ue+ot]=l}}return{verts:new Float32Array(k),bw:new Float32Array(ee),nv:k.length/10}}function Se(r){let q=0;const k=r.verts,ee=r.idx;for(let Z=0;Z<ee.length;Z+=3){const K=ee[Z]*10,ue=ee[Z+1]*10,G=ee[Z+2]*10;q+=k[K]*(k[ue+1]*k[G+2]-k[ue+2]*k[G+1])-k[K+1]*(k[ue]*k[G+2]-k[ue+2]*k[G])+k[K+2]*(k[ue]*k[G+1]-k[ue+1]*k[G])}if(q<0)for(let Z=0;Z<ee.length;Z+=3){const K=ee[Z+1];ee[Z+1]=ee[Z+2],ee[Z+2]=K}for(let Z=0;Z<r.nv;Z++)k[Z*10+3]=k[Z*10+4]=k[Z*10+5]=0;for(let Z=0;Z<ee.length;Z+=3){const K=ee[Z]*10,ue=ee[Z+1]*10,G=ee[Z+2]*10,Ae=k[ue]-k[K],_e=k[ue+1]-k[K+1],at=k[ue+2]-k[K+2],ot=k[G]-k[K],t=k[G+1]-k[K+1],S=k[G+2]-k[K+2],l=_e*S-at*t,u=at*ot-Ae*S,v=Ae*t-_e*ot;for(const P of[K,ue,G])k[P+3]+=l,k[P+4]+=u,k[P+5]+=v}for(let Z=0;Z<r.nv;Z++){const K=Math.hypot(k[Z*10+3],k[Z*10+4],k[Z*10+5])||1;k[Z*10+3]/=K,k[Z*10+4]/=K,k[Z*10+5]/=K}return r}function me(r){const q=ma(),k=[],ee=44,Z=.8,K=-.96;for(let ue=0;ue<=ee;ue++){const G=ue/ee,Ae=Re(Z,K,G);let _e=Re(.049,.058,ge(.15,.78,Ae));_e=Re(_e,.064,ge(-.15,-.78,Ae)),Ae<-.8&&(_e*=Math.sqrt(Math.max(.02,1-((-Ae-.8)/.165)**2))),Ae>.76&&(_e*=Math.sqrt(Math.max(.05,1-((Ae-.76)/.045)**2)));const at=.125*Math.pow(ge(-.62,-.96,Ae),1.7)+.015*Math.pow(ge(.66,.8,Ae),2),ot=Re(.008,.02,ge(.8,.25,Math.abs(Ae+.05))),t=[[-_e,at],[_e,at],[_e,at+ot*.55],[_e*.82,at+ot],[-_e*.82,at+ot],[-_e,at+ot*.55]],S=[];for(let l=0;l<t.length;l++)S.push([[r+t[l][0],t[l][1],Ae],[0,1,0]]);k.push(S)}return q.sweep(k,[9,1,0,0],[0,0,1],[0,0,-1]),Se(q.done())}function B(){const r=ma(),q=[],k=[[.075,.004],[.07,.015],[0,.017],[-.1,.015],[-.105,.0085],[-.6,.0075],[-1.03,.006],[-1.04,.034],[-1.048,.034],[-1.056,.006],[-1.14,.003]];for(const[ee,Z]of k){const K=[];for(let ue=0;ue<7;ue++){const G=ue/7*It;K.push([[Math.cos(G)*Z,ee,Math.sin(G)*Z],[0,1,0]])}q.push(K)}return r.sweep(q,[10,1,0,0],[0,1,0],[0,-1,0]),Se(r.done())}e.meshes={},e.build=function(r){if(r=r==="a"||r==="b"?r:Dt.val.body==="a"?"a":"b",e.meshes[r])return e.mesh=e.meshes[r];se||(se=c(ne),_=se.F.map(v=>v?Wt.invert(v):null),e.bind=se,se.seatC=Wt.tp(se.F[s.pelvis],z));const q=r==="b",k=Ce(se,q),ee=performance.now(),Z=qs(k.f,[-.44,0,-.66],[.44,1.8,.38],.0135,{stride:4,attr:k.attr});e.meshMs=performance.now()-ee;const K=Ye(Z,se,k,q),ue=T(Z,K),G=ue.bw;Z.verts=ue.verts,Z.nv=ue.nv;const Ae=[[me(0),s.footL],[me(0),s.footR],[B(),s.poleL],[B(),s.poleR]];let _e=Z.nv,at=Z.ni;for(const[v]of Ae)_e+=v.nv,at+=v.ni;const ot=new Float32Array(_e*10),t=new Float32Array(_e*4),S=new Uint32Array(at);ot.set(Z.verts),t.set(G),S.set(Z.idx);let l=Z.nv,u=Z.ni;for(const[v,P]of Ae){const N=se.F[P];for(let de=0;de<v.nv;de++){const te=Wt.tp(N,[v.verts[de*10],v.verts[de*10+1],v.verts[de*10+2]]),o=Wt.td(N,[v.verts[de*10+3],v.verts[de*10+4],v.verts[de*10+5]]),p=(l+de)*10;ot[p]=te[0],ot[p+1]=te[1],ot[p+2]=te[2],ot[p+3]=o[0],ot[p+4]=o[1],ot[p+5]=o[2],ot[p+6]=v.verts[de*10+6],ot[p+7]=1,ot[p+8]=P>=s.poleL?v.verts[de*10+1]:v.verts[de*10+2],ot[p+9]=v.verts[de*10+4],t[(l+de)*4]=P,t[(l+de)*4+1]=P,t[(l+de)*4+2]=1}for(let de=0;de<v.ni;de++)S[u+de]=v.idx[de]+l;l+=v.nv,u+=v.ni}return e.mesh=e.meshes[r]={V:ot,W:t,I:S,nv:_e,ni:at,v:r},e.mesh},e.init=function(r){x=r,st(e.mesh&&e.mesh.v===Dt.val.body?e.mesh:e.build()),ht=x.texture({w:4,h:32,format:"rgba32f",filter:"nearest"});const q=[{attrs:[["pos","vec3f"],["nrm","vec3f"],["mat","vec4f"]]},{attrs:[["bw","vec4f"]]}],k=y=>"vec3f("+y.map(j=>j.toFixed(5)).join(", ")+")",ee=se.J,Z=ee.chest,K=se.t2,ue=se.F[s.pelvis],G={O:[ue[12],ue[13],ue[14]],X:[ue[0],ue[1],ue[2]],Y:[ue[4],ue[5],ue[6]],Z:[ue[8],ue[9],ue[10]]},Ae=se.F[s.head],_e=[Ae[12],Ae[13],Ae[14]],at=[Ae[0],Ae[1],Ae[2]],ot=[Ae[4],Ae[5],Ae[6]],t=[Ae[8],Ae[9],Ae[10]],S=(y,j)=>k(f.norm(f.sub(j,y))),l=(y,j,W)=>k(y.slice(j,j+W)),u=y=>y.toFixed(4),v=`let tl: vec3f = vec3f(dot(bp - ${k(Z)}, ${k(K.X)}), dot(bp - ${k(Z)}, ${k(K.Y)}), dot(bp - ${k(Z)}, ${k(K.Z)}));
  let pl: vec3f = vec3f(dot(bp - ${k(G.O)}, ${k(G.X)}), dot(bp - ${k(G.O)}, ${k(G.Y)}), dot(bp - ${k(G.O)}, ${k(G.Z)}));
  let bm: vec3f = vec3f(abs(bp.x), bp.y, bp.z); let armU: f32 = dot(bm - ${k(ee.shR)}, ${S(ee.shR,ee.elbowR)}); let armF: f32 = dot(bm - ${k(ee.elbowR)}, ${S(ee.elbowR,ee.gripR)});
  let hemV: f32 = pl.y + 0.082 + 0.026 * saturate((pl.z + 0.02) / 0.14);
  let thU: f32 = dot(bm - ${k(ee.hipR)}, ${S(ee.hipR,ee.kneeR)}); let legS: f32 = dot(bm - ${k(ee.kneeR)}, ${S(ee.kneeR,ee.ankleR)});
  let pkD: f32 = skMin(skMin(skBox(tl, ${l(Ne.box,0,3)}, ${l(Ne.box,3,3)}, ${u(Ne.box[6])}), skEll(tl, ${l(Ne.lid,0,3)}, ${l(Ne.lid,3,3)}), ${u(Ne.k[0])}), skBox(tl, ${l(Ne.pocket,0,3)}, ${l(Ne.pocket,3,3)}, ${u(Ne.pocket[6])}), ${u(Ne.k[1])});
  let eq: vec3f = bm - ${k(ee.elbowR)}; let kq: vec3f = bm - ${k(ee.kneeR)}; let hq: vec3f = bm - ${k(ee.hipR)};
  let armAx: vec3f = ${k(f.norm(f.add(f.norm(f.sub(ee.elbowR,ee.shR)),f.norm(f.sub(ee.gripR,ee.elbowR)))))}; let thD: vec3f = ${S(ee.hipR,ee.kneeR)}; let shD: vec3f = ${S(ee.kneeR,ee.ankleR)};
  let legAx: vec3f = normalize(thD + shD); let legB: vec3f = normalize(cross(legAx, vec3f(1.0, 0.0, 0.0)));
  let hd3: vec3f = vec3f(dot(bp - ${k(_e)}, ${k(at)}), dot(bp - ${k(_e)}, ${k(ot)}) - ${u(w.head)}, dot(bp - ${k(_e)}, ${k(t)}) + 0.015);
  let colD: f32 = skMin(skMin(skCap(tl, vec3f(0.0, 0.21, 0.006), vec3f(0.0, 0.235, 0.006), 0.088, 0.080), skEll(tl, vec3f(0.0, 0.190, 0.078), vec3f(0.100, 0.045, 0.040)), 0.05), skEll(tl, vec3f(0.0, 0.222, 0.016), vec3f(0.145, 0.062, 0.085)), 0.05);      // (collar, hood and the slope of the shoulders: the jacket round the head)`,P=V,N=Wt.invert(Ae),de=Wt.tp(N,ee.neck),te=Wt.tp(N,f.mad(ee.head,se.hb.Y,-.05)),o=y=>[y[0],y[1]-w.head,y[2]+.015],p=(y,j)=>k(y.slice(j,j+3)),i=`
fn skCap(p: vec3f, a: vec3f, b: vec3f, ra: f32, rb: f32) -> f32 { let pa: vec3f = p - a; let ba: vec3f = b - a; let h: f32 = saturate(dot(pa, ba) / dot(ba, ba)); return length(pa - ba * h) - mix(ra, rb, h); }
fn skMax(a: f32, b: f32, k: f32) -> f32 { return -skMin(-a, -b, k); }
fn hdHelm(p: vec3f) -> f32 {
  var h: f32 = skEll(p, ${p(P.shell,0)}, ${p(P.shell,3)});
  h = skMin(h, skEll(vec3f(abs(p.x), p.y, p.z), ${p(P.ear,0)}, ${p(P.ear,3)}), 0.02);
  h = skMin(h, skEll(p, ${p(P.brim,0)}, ${p(P.brim,3)}), 0.012);
  let big: f32 = skEll(p, ${p(P.shell,0)}, ${p(P.shell,3)} + vec3f(0.005));
  h = skMin(h, skMax(skMax(big, abs(p.x) - 0.013, 0.006), 0.045 - p.y, 0.01), 0.006);
  h = skMax(h, -skBox(p, ${p(P.cut,0)}, ${p(P.cut,3)}, ${u(P.cut[6])}), 0.008);
  h = skMax(h, ${u(P.rim)} + 0.25 * max(p.z, 0.0) - p.y, 0.014);
  return min(h, skMax(skEll(p, ${p(P.shell,0)}, ${p(P.shell,3)} + vec3f(0.003)), abs(p.y - ${u(P.gy)}) - ${u(P.sh)}, 0.003));
}
fn hdGogA(p: vec3f) -> vec3f { let qz: f32 = p.z - ${u(P.gz)}; let r: f32 = length(vec2f(p.x, qz)); return vec3f(r, atan2(abs(p.x), -qz), p.y - ${u(P.gy)}); }
fn hdGog(p: vec3f) -> f32 {
  let c: vec3f = hdGogA(p); let dx: f32 = abs(c.x - ${u(P.gr)}) - ${u(P.gt)}; let dy: f32 = abs(c.z) - ${u(P.gh)}; let dz: f32 = (c.y - ${u(P.ga)}) * c.x;
  return length(max(vec3f(dx, dy, dz), vec3f(0.0))) + min(max(dx, max(dy, dz)), 0.0) - 0.004;
}
fn hdBuff(p: vec3f) -> f32 { return skMin(skMin(skEll(p, ${p(P.face,0)}, ${p(P.face,3)}), length(p - ${k(P.chin)}) - ${u(P.chinR)}, 0.03), skCap(p, ${k(o(de))}, ${k(o(te))}, 0.060, 0.058), 0.03); }
`;D=x.pipeline({name:"skier",lib:[St.common,St.hash,St.fog,St.shadow,Cs,vo,i],buffers:q,varyings:{wp:"vec3f",nrm:"vec3f",bp:"vec3f",bn:"vec3f",mat:"vec4f"},uniforms:{p:"vec4f",q:"vec4f",r:"vec4f"},textures:{tBones:"fetch",tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:"fn vert(a: VIn) -> VOut { var v: VOut; let s: SkinV = skinVertex(a.pos, a.nrm, a.bw); v.wp = s.wp; v.nrm = s.n; v.bp = a.pos; v.bn = a.nrm; v.mat = a.mat; v.clip = U.viewProj * vec4f(s.wp, 1.0); return v; }",fs:mo.replace("/*MARKS*/",v)}),be=x.pipeline({name:"skierShadow",lib:[St.common,Cs],buffers:q,varyings:{},uniforms:{p:"vec4f"},textures:{tBones:"fetch"},colorFormat:null,cull:"none",depthBias:0,depthBiasSlope:0,vs:"fn vert(a: VIn) -> VOut { var v: VOut; let s: SkinV = skinVertex(a.pos, a.nrm, a.bw); v.clip = U.shadowVP * vec4f(s.wp + s.n * 0.03, 1.0); return v; }",fs:null}),e.pipes=[D,be],e.ready=!0};const U=(r,q,k,ee,Z)=>(r[1]=(r[1]+k*k*(q-r[0])*Z)/(1+2*ee*k*Z+k*k*Z*Z),r[0]+=r[1]*Z,r[0]),A={t:0,pose:null,root:null,pos:[0,0,0],lean:[0,0],cf:[0,0],crouch:[0,0],f0:0,dp:null,pp:[null,null],pq:[0,0],hm:{p:[0,0],r:[0,0],v:null,o:[0,0]},sec:{ct:0,cf:0,roll:0,yaw:0,hand:[0,0,0],head:0,drop:0,dp:null,pl:[null,null],idle:null}},a=Object.assign({},ne);e.pose=a,e.world={J:null,root:null};const oe=e.idle={w:[0,0],t:0,W:null,base:[[0,0],[0,0]],breath:1.2,vapour:1,ph:.3,per:3.7,fl:0,puff:0,sh:[0,0],shT:0,shN:6,hy:[0,0],hp:[0,0],ty:[0,0],gy:0,gp:0,gN:2.4,gH:0,gS:1,n:0,u:[0,0],rk:-1,rq:0,rN:10,rS:0,rA:null,rB:null,rnd:D0(4127),sec:{rest:0,T:[[0,0],[0,0]],u:[0,0],up:0,br:0,sh:0,hy:0,hp:0,ty:0,sx:0}};function fe(r,q,k,ee,Z,K,ue){const G=oe,Ae=G.sec,_e=G.rnd,at=typeof zt<"u"&&r===zt.root&&q===zt.pose&&zt.mode==="title",ot=()=>{G.W=null,G.rk=-1,G.u[0]=G.u[1]=0,G.rN<8&&(G.rN=8)};k?(G.w[0]=at?1:0,G.w[1]=0,ot(),G.sh[1]=G.hy[1]=G.hp[1]=G.ty[1]=0):ee>0&&U(G.w,at?1:0,7,1,ee);const t=G.w[0]>.9995?1:G.w[0]<5e-4?0:G.w[0];if(!(t>0))return ot(),G.fl=0,null;if(ee>0){if(at){if(G.t+=ee,G.ph+=ee/G.per,G.ph>=1&&(G.ph-=1,G.per=3.4+.7*_e()),(G.shN-=ee)<=0&&(G.shN=7+8*_e(),G.shT=G.shT?_e()<.4?0:-R0(G.shT)*(.7+.3*_e()):(_e()<.5?-1:1)*(.7+.3*_e())),G.gH>0)(G.gH-=ee)<=0&&(G.gy=G.gp=0,G.gN=5+6*_e());else if((G.gN-=ee)<=0){const o=G.n++?_e():0,p=(typeof L0<"u"&&L0.cityAz!=null?L0.cityAz:.14)-Math.atan2(r.fwd[0],-r.fwd[2]);o<.45?(G.gy=it(Math.atan2(Math.sin(p),Math.cos(p))+.22*(_e()-.2),-.9,.9),G.gp=-.16):o<.86?(G.gS=-G.gS,G.gy=G.gS*(.45+.3*_e()),G.gp=-.13):(G.gy=.12*(_e()-.5),G.gp=.22),G.gH=(o<.86?1.8:1.2)+1.6*_e()}if(G.rk<0){if((G.rN-=ee)<=0&&G.W){const o=G.rk=G.sh[0]>.2?0:G.sh[0]<-.2?1:G.rS=1-G.rS,p=G.base[o];G.rq=0,G.rA=G.W[o],G.rB=ue([p[0]+.06*(_e()-.5),Ee.TIPY,p[1]+.08*(_e()-.5)])}}else{const o=G.rk,p=Math.min(G.rq+=ee/1.15,1),i=Math.sin(h0*p);G.u[o]=i*i,G.W[o]=f.lerp(G.rA,G.rB,ge(.12,.88,p)),p>=1&&(G.rk=-1,G.rN=13+12*_e())}}else G.shT=G.gy=G.gp=0;U(G.sh,G.shT,2.3,1,ee),U(G.hy,G.gy,5.2,1,ee),U(G.hp,G.gp,4.6,1,ee),U(G.ty,G.gy*.17,3.1,1,ee)}const S=G.ph,l=S<.42?fs(0,.4,S):1-fs(.44,.92,S),u=a.crouch,v=a.swing,P=a.armL,N=a.armR;G.fl=at?ge(.44,.49,S)*(1-ge(.52,.72,S)):0;const de=(o,p)=>{a.crouch=Re(u,.13,o),a.swing=v*(1-o),a.armL=[P[0]-.02*o,P[1]+(.03*p*G.u[0]-.05)*o,P[2]+.16*o],a.armR=[N[0]+.02*o,N[1]+(.03*p*G.u[1]-.05)*o,N[2]+.16*o],Ae.up=(-.12+p*.006*P0(G.t*.19,12))*o,Ae.sx=p*.006*P0(G.t*.23,11)*o,Ae.br=p*G.breath*l*o,Ae.sh=p*G.sh[0]*o,Ae.hy=p*G.hy[0]*o,Ae.hp=(.13+p*G.hp[0])*o,Ae.ty=p*G.ty[0]*o,Ae.u[0]=p*G.u[0],Ae.u[1]=p*G.u[1]};if(G.W&&at)for(let o=0;o<2;o++){const p=f.sub(G.W[o],r.pos);if(Math.hypot(f.dot(p,Z)-G.base[o][0],f.dot(p,K)-G.base[o][1])>.08){ot();break}}if(!G.W){de(1,0),Ae.rest=0;const o=c(a,Object.assign({},Be,{idle:Ae}));G.W=[0,1].map(p=>{const i=p?o.J.gripR:o.J.gripL,y=Math.sqrt(Math.max(w.pole*w.pole-Math.pow(i[1]-Ee.TIPY,2),.02)),j=G.base[p]=[i[0]+(p?.55:-.55)*y,i[2]+.835*y];return ue([j[0],Ee.TIPY,j[1]])})}const te=t*(1-mt(a.tuck*3))*(1-mt(a.air*3))*(1-ge(.04,.2,Math.abs(a.lean)))*(1-mt((a.grabL||0)+(a.grabR||0)));de(te,1),Ae.rest=te,G.fl*=te;for(let o=0;o<2;o++){const p=f.sub(G.W[o],r.pos);Ae.T[o][0]=f.dot(p,Z),Ae.T[o][1]=f.dot(p,K)}return Ae}const O={a:[0,0,0],b:[1,1,1],c:[1.7,1,.7]},ie={p:[0,0,0,0],q:[0,0,1,1],h:1,t:-1},ce=[0,.08,.05];Dt.def("body","人物模型",[["a","原来"],["b","新的"]],"b"),Dt.def("cloth","衣服",[["a","平整"],["b","自然"],["c","厚实"]],"b");function He(r){const q=(Z,K,ue)=>mt(.8*(1-f.dot(f.norm(f.sub(K,Z)),f.norm(f.sub(ue,K))))),k=f.norm(f.sub(r.chest,r.pelvis)),ee=(Z,K)=>mt(.5+.5*f.dot(k,f.norm(f.sub(K,Z))));ie.p=[q(r.shL,r.elbowL,r.gripL),q(r.shR,r.elbowR,r.gripR),q(r.hipL,r.kneeL,r.ankleL),q(r.hipR,r.kneeR,r.ankleR)],ie.q[0]=ee(r.hipL,r.kneeL),ie.q[1]=ee(r.hipR,r.kneeR)}e.update=function(r,q,k){for(const o in ne)a[o]=ne[o];Object.assign(a,q);const ee=typeof At<"u"&&At.t===At.t?At.t:0,Z=A.sec,K=it(a.dp||0,0,1);let ue=ee-A.t;const G=A.pose!==q||A.root!==r||!(ue>=0)||ue>.25||f.len(f.sub(r.pos,A.pos))>6,Ae=f.norm(r.nrm),_e=f.mul(r.fwd,-1),at=f.norm(f.cross(Ae,_e)),ot=f.cross(at,Ae),t=o=>[r.pos[0]+at[0]*o[0]+Ae[0]*o[1]+ot[0]*o[2],r.pos[1]+at[1]*o[0]+Ae[1]*o[1]+ot[1]*o[2],r.pos[2]+at[2]*o[0]+Ae[2]*o[1]+ot[2]*o[2]];Z.idle=fe(r,q,G,G?0:ue,at,ot,t),G&&(A.lean=[a.lean,0],A.cf=[a.crouch,0],A.crouch=[a.crouch,0],A.dp=null,A.pp[0]=A.pp[1]=null,A.f0=K,ue=0);{const o=A.hm,p=ie.h,i=!G&&ue>0?f.mul(f.sub(r.pos,A.pos),1/ue):[0,0,0];if(G||!o.v)o.v=i,o.p[0]=o.p[1]=o.r[0]=o.r[1]=0;else if(ue>0){const W=f.add(o.v,f.mul(f.sub(i,o.v),1-Math.exp(-ue*18))),h=f.mul(f.sub(W,o.v),1/ue),n=it(f.dot(h,at),-14,14),d=it(-f.dot(h,ot),-14,14),M=mt((-f.dot(W,ot)-4)/22);o.v=W,U(o.p,p*(.11*M*M*(3-2*M)+it(d*.008,-.02,.06)),14,.32,ue),U(o.r,p*it(-n*.007,-.09,.09),12,.3,ue)}const y=mt((-f.dot(o.v,ot)-6)/20),j=p*y*(.022*Math.sin(ee*47)+.014*Math.sin(ee*29+1.3)+.01*Math.sin(ee*71+.4));o.o[0]=it(o.p[0]+j,-.02,.2),o.o[1]=it(o.r[0]+.6*j*Math.sin(ee*13),-.12,.12)}A.t=ee,A.pose=q,A.root=r,A.pos[0]=r.pos[0],A.pos[1]=r.pos[1],A.pos[2]=r.pos[2],ue>0&&(U(A.lean,a.lean,11,.8,ue),U(A.crouch,a.crouch,7,1,ue),U(A.cf,a.crouch,40,1,ue));const S=A.lean[0]-a.lean,l=a.crouch-A.crouch[0],u=1-mt(a.tuck*1.5);if(Z.roll=it(S*.45,-.14,.14),Z.ct=it(-l,-.6,.6),Z.cf=it(A.cf[0]-a.crouch,-.6,.6),Z.drop=it(S*.1,-.04,.04)*u,Z.hand[1]=it(l*.16,-.05,.07)*u,Z.hand[2]=it(-l*.06,-.03,.03)*u,(!(K>0)||K<A.f0-1e-6)&&(A.dp=null),A.dp)for(let o=0;o<2;o++){const p=A.dp.W[o],i=[p[0]-r.pos[0],p[1]-r.pos[1],p[2]-r.pos[2]];A.dp.T[o*2]=f.dot(i,at),A.dp.T[o*2+1]=f.dot(i,ot)}A.dp&&K>=A.dp.rel&&!A.dp.gone&&(A.dp.gone=!0,A.dp.g&&(A.dp.rel=A.dp.gf)),Z.dp=A.dp;const v=[mt(a.plantL||0),mt(a.plantR||0)];for(let o=0;o<2;o++){const p=A.pp[o];if(Z.pl[o]=p,!!p)if(p.d)p.w=ge(0,.18,ee-p.rel),p.g=ge(.18,.45,ee-p.rel);else{const i=p.W,y=[i[0]-r.pos[0],i[1]-r.pos[1],i[2]-r.pos[2]];p.T=[f.dot(y,at),f.dot(y,ot)]}}const P=c(a,Z);for(let o=0;o<2;o++){const p=A.pp[o],i=o?"R":"L",y=P.J["tip"+i],j=P.J["grip"+i];p?p.d?p.g>=1&&(A.pp[o]=null):(p.h=P.hp[o],(v[o]<.3||p.h&&f.len(p.h)>.06||f.len(f.sub([p.T[0],Ee.TIPY,p.T[1]],j))>w.pole+.03||a.air>.3||a.tuck>.6||K>0)&&(p.d=P.J["poleD"+i].slice(),p.rel=ee,p.w=0)):!G&&ue>0&&!(K>0)&&v[o]>A.pq[o]&&v[o]>.5&&y[1]<=0&&(A.pp[o]={W:t(y),T:[y[0],y[2]],d:null,h:null,w:0,g:0,rel:0})}if(A.pq=v,P.dp&&!G){if(!A.dp)A.f0<Ee.PLANT&&K>=Ee.PLANT&&(A.dp={W:[t(P.dp.T[0]),t(P.dp.T[1])],T:[0,0,0,0],rel:Ee.REL,u:P.dp.u,d:null,v:null,g:null,gf:K});else if(K<A.dp.rel){const o=A.dp,p=[P.J.gripL[0],P.J.gripL[1],P.J.gripL[2],P.J.gripR[0],P.J.gripR[1],P.J.gripR[2]];P.dp.out&&o.g?(o.rel=o.gf,o.gone=!0):(o.g&&K>o.gf+1e-5&&(o.v=p.map((i,y)=>(i-o.g[y])/(K-o.gf))),o.g=p,o.gf=K,o.u=P.dp.u,o.d=[P.J.poleDL[0],P.J.poleDL[1],P.J.poleDL[2],P.J.poleDR[0],P.J.poleDR[1],P.J.poleDR[2]],P.dp.out&&(o.rel=K))}}if(A.f0=K,Z.idle&&oe.fl>.02&&ue>0&&typeof Jt<"u"&&Jt.breath&&(oe.puff-=ue)<=0){const o=P.hb,p=oe.rnd,i=f.add(P.J.head,J(o,0,-.07,-.13)),y=t(i),j=t(f.add(i,J(o,.3*(p()-.5),-.15+.2*(p()-.5),-1))),W=.5+.3*p();oe.puff=.07+.03*p(),Jt.breath(ee,y,[(j[0]-y[0])*W,(j[1]-y[1])*W,(j[2]-y[2])*W],2.4*oe.fl*oe.vapour)}He(P.J),P.hem=A.hm.o;const N=Wt.fromBasis(at,Ae,ot,[r.pos[0]-k[0],r.pos[1]-k[1],r.pos[2]-k[2]]),de=H(P);for(let o=0;o<e.NB;o++)qe.set(Wt.mul(N,de[o]),o*16);x&&x.updateTexture(ht,0,0,4,32,qe);const te=e.world;te.root=N,te.J=P.J,te.X=at,te.Y=Ae,te.Z=ot,te.hb=P.hb;{const o=(p,i,y)=>{const j=Wt.mul(N,P.F[p]);return[Wt.tp(j,i),Wt.tp(j,y)]};te.seg=[o(s.footL,[0,.02,.78],[0,.09,-.94]),o(s.footR,[0,.02,.78],[0,.09,-.94]),o(s.poleL,[0,.06,0],[0,-1.12,0]),o(s.poleR,[0,.06,0],[0,-1.12,0])]}return te.tipL=t(P.J.tipL),te.tipR=t(P.J.tipR),te.planted=Math.min(P.J.plantedL,P.J.plantedR),P},e.toWorld=function(r){return Wt.tp(e.world.root,r)},e.sec=A.sec;const We=[0,0,0,0],Qe=()=>Dt.val.body==="a"?"a":"b";function st(r){r.gpu||(r.gpu={vb:x.buffer(r.V,"vertex"),vb2:x.buffer(r.W,"vertex"),ib:x.buffer(r.I,"index")}),e.mesh=r,F=r.gpu.vb,we=r.gpu.vb2,Y=r.gpu.ib,E=r.ni,We[1]=r.v==="b"?1:0}const Le=()=>{e.mesh.v!==Qe()&&st(e.build(Qe()))};return e.want=Le,e.draw=function(r,q){Le();const k=O[Dt.val.cloth]||O.b,ee=performance.now()/1e3,Z=ee-ie.t,K=ie.t<0||Z>.1?1:1-Math.exp(-Math.max(Z,0)*6);ie.t=ee,ie.q[2]+=(k[1]-ie.q[2])*K,ie.q[3]+=(k[0]-ie.q[3])*K,ie.h+=(k[2]-ie.h)*K,We[0]=typeof Nt<"u"&&Nt.night===Nt.night?ge(.35,1,Nt.night):0,x.draw(D,{u:{p:ie.p,q:ie.q,r:We},tex:{tBones:ht,tDetail:c0.detail,tShadow:r,tSky:q},vb:[F,we],ib:Y,count:E})},e.drawShadow=function(){Le(),x.draw(be,{u:{p:[0,0,0,0]},tex:{tBones:ht},vb:[F,we],ib:Y,count:E})},e})(),Cs=`
fn boneM(i: f32) -> mat4x4f { let r: i32 = i32(i + 0.5); return mat4x4f(texFetch(tBones, vec2i(0, r), 0), texFetch(tBones, vec2i(1, r), 0), texFetch(tBones, vec2i(2, r), 0), texFetch(tBones, vec2i(3, r), 0)); }
struct SkinV { wp: vec3f, n: vec3f, }
fn skinVertex(pos: vec3f, nrm: vec3f, bw: vec4f) -> SkinV {
  var s: SkinV;
  let b2: f32 = floor(bw.w); let w2: f32 = bw.w - b2;
  let m0: mat4x4f = boneM(bw.x); let m1: mat4x4f = boneM(bw.y); let m2: mat4x4f = boneM(b2);
  let p0: vec4f = m0 * vec4f(pos, 1.0); let p1: vec4f = m1 * vec4f(pos, 1.0); let p2: vec4f = m2 * vec4f(pos, 1.0);
  s.wp = mix(mix(p1.xyz, p0.xyz, bw.z), p2.xyz, w2);
  let n0: vec4f = m0 * vec4f(nrm, 0.0); let n1: vec4f = m1 * vec4f(nrm, 0.0); let n2: vec4f = m2 * vec4f(nrm, 0.0);
  s.n = normalize(mix(mix(n1.xyz, n0.xyz, bw.z), n2.xyz, w2));
  return s;
}
`,vo=`
fn skBox(p: vec3f, c: vec3f, h: vec3f, r: f32) -> f32 { let q: vec3f = abs(p - c) - h + vec3f(r); return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
fn skEll(p: vec3f, c: vec3f, r: vec3f) -> f32 { let q: vec3f = (p - c) / r; let k0: f32 = length(q); return k0 * (k0 - 1.0) / max(length(q / r), 1e-6); }
fn skMin(a: f32, b: f32, k: f32) -> f32 { let h: f32 = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
fn skN(p: vec2f) -> f32 {
  let i: vec2f = floor(p); let f: vec2f = p - i; let u: vec2f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), u.x), mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), u.x), u.y) - 0.5;
}
fn skFold(q: vec3f, ax: vec3f, sv: f32, px: f32) -> f32 {
  let t: f32 = dot(q, ax); let r: vec3f = q - ax * t; let rn: vec3f = r / max(length(r), 1e-4); let w: f32 = px * sv;
  let uv: vec2f = vec2f(0.66 * rn.x + 0.42 * rn.y + 0.30 * rn.z, t * sv + 0.90 * rn.z - 0.60 * rn.x + 0.48 * rn.y);
  return skN(uv) * saturate(1.6 - w * 4.0) + 0.5 * skN(uv * 2.03 + vec2f(17.1, 9.2)) * saturate(1.6 - w * 8.0);
}
fn skLine(d: f32, px: f32) -> f32 { let w: f32 = 0.0011 + px * 0.5; return smoothstep(w, w * 0.4, d) * saturate(0.004 / (px + 0.0008)); }
`,mo=(e=>{const s=x=>"vec3f("+x.map(F=>F.toFixed(3)).join(", ")+")",w=x=>x.toFixed(3);return`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  var id: f32 = floor(v.mat.x + 0.5);
  let qy: f32 = v.mat.z; let qz: f32 = v.mat.w;
  if (id > 3.5 && id < 4.5 && abs(qy - 0.004) < 0.020 && qz > -0.09) { id = 6.0; }
  if (id > 4.5 && id < 5.5 && (qz > -0.1265 || abs(qy) > 0.031 || abs(v.bp.x) > 0.074)) { id = 6.0; }
  var N: vec3f = normalize(v.nrm);
  let V: vec3f = normalize(U.camPos.xyz - v.wp);
  let L: vec3f = U.sunDir.xyz;
  let bp: vec3f = v.bp; let bn: vec3f = normalize(v.bn);
  let weave: vec4f = tex(tDetail, bp.xy * 3.1 + bp.zz * vec2f(2.3, 1.7));
  // (px: how much of the body one pixel covers, m; fold: the height of the cloth's folds over the body, m; sd: how far the nearest seam is, m; shell: how
  // much of a shell cloth's sheen; dark: what lies close over it takes the light away; kz: how much of all that shows, in the version the owner picked)
  let px: f32 = length(dpdx(bp)) + length(dpdy(bp)); let sideR: f32 = step(0.0, bp.x); let kz: f32 = M.q.z;
  let big: f32 = skN(bp.xy * 5.0 + bp.zz * vec2f(3.7, 2.8)) * saturate(1.6 - px * 20.0);      // (the padding is not even)
  let lay: f32 = saturate(0.55 + skN(bp.yz * 2.7 + bp.xx * vec2f(1.9, 1.4)) * 4.0);            // (the long folds lie in patches)
  var fold: f32 = 0.0; var sd: f32 = 1.0; var shell: f32 = 0.0; var dark: f32 = 0.0;
  var alb: vec3f = vec3f(0.5); var specP: f32 = 20.0; var specS: f32 = 0.03; var sheen: f32 = 0.0; var gloss: f32 = 0.0; var glossTint: vec3f = vec3f(1.0); var cloth: f32 = 0.0; var lensK: f32 = 0.0; var lensV: f32 = 0.0;
  let orange: vec3f = ${s(e.jacket.alb)}; let navy: vec3f = ${s(e.sleeveFore.alb)};
  /*MARKS*/
  // where one garment ends on another the edge is drawn here, pixel by pixel, from the garment's own line, a few millimetres inside the lip the mesh
  // makes of it: a mesh cannot keep such an edge straight (it came out as a ragged fringe that read as fur), a line can.
  // jacket or trousers: by the line of the hem (well above it: by which of the two is nearer)
  if (id < 1.5) { id = 1.0; if (hemV > 0.006 && (hemV < 0.05 || v.mat.z > -0.012)) { id = 0.0; } }
  // trousers or boot: by the line of the trouser hem, down the shin
  // (nb: the new body (Variants 'body' b), whose trousers hang lower over the boot and whose sleeve runs into the shoulder without an armhole seam)
  let nb: f32 = M.r.y; let hemS: f32 = mix(0.349, 0.362, nb);
  // (new body: where the helmet meets the collar and the gaiter its rim is drawn from the helmet's own shape, not from the mesh's triangles, which left a
  // ragged white fringe; the strap round it is found the same way)
  // ...and the goggles, their strap and the gaiter: every pixel of the head and of the collar under it takes the material whose shape it lies on
  var strapK: f32 = 0.0; var colK: f32 = 0.0;
  if (nb > 0.5 && (id < 1.5 || (id > 3.5 && id < 7.5)) && length(hd3) < 0.34) {      // (id 1 too: the jacket-or-trousers rule above takes a few collar triangles for trousers)
    let dH: f32 = hdHelm(hd3); let dG: f32 = hdGog(hd3); let dB: f32 = hdBuff(hd3);
    let dm: f32 = min(dH, min(dG - 0.002, dB));
    if (min(dm, colD) < 0.016) {
      var best: f32 = colD; var nid: f32 = 0.0;
      if (dB + 0.003 * nb < best) { best = dB; nid = 7.0; } if (dH < best) { best = dH; nid = 4.0; } if (dG - 0.002 < best) { best = dG; nid = 6.0; }
      id = nid; colK = select(0.0, 1.0, nid < 0.5);     // (a pixel given to the collar is torso, whatever the triangle under it was skinned as: the sleeve's navy cuff left dark teeth along the gaiter)
      let gc: vec3f = hdGogA(hd3);
      if (id > 5.5 && id < 6.5 && gc.x > ${a0.HEAD.gr.toFixed(4)} && abs(gc.z) < ${(a0.HEAD.gh-.007).toFixed(4)} && gc.y < ${(a0.HEAD.ga-.11).toFixed(4)}) { id = 5.0; }     // the lens: the outer face inside the frame
      if (id > 3.5 && id < 4.5 && abs(hd3.y - ${a0.HEAD.gy.toFixed(4)}) < ${a0.HEAD.sh.toFixed(4)}) { id = 6.0; strapK = 1.0; }                                  // the strap round the shell
    }
  }
  if (legS > 0.25 && ((id > 0.5 && id < 1.5) || (id > 2.5 && id < 3.5))) { id = select(3.0, 1.0, legS < hemS); }
  // jacket or pack: by the pack's own outline
  if (id < 0.5 || (id > 7.5 && id < 8.5)) { id = select(0.0, 8.0, pkD < 0.006); }
  if (id < 0.5) {            // jacket: orange shell, dark forearms, a pale band round the upper sleeves, pack straps over the shoulders
    let onTorso: f32 = max(smoothstep(-0.004, 0.004, v.mat.w), colK);
    let fore: f32 = mix(smoothstep(0.035, 0.065, armF), smoothstep(0.140, 0.152, armF), nb) * (1.0 - onTorso);     // (new body: only a navy storm cuff, under the gauntlet's edge)
    alb = mix(orange, navy, fore);
    let chev: f32 = smoothstep(0.016, 0.011, abs(armU - 0.150)) * (1.0 - onTorso) * (1.0 - fore);
    alb = mix(alb, ${s(e.sleeveBand.alb)}, chev);
    sheen = ${w(e.jacket.sheen)}; cloth = ${w(e.jacket.cloth)}; specS = ${w(e.jacket.specS)}; specP = ${w(e.jacket.specP)};
    let sx: f32 = abs(abs(tl.x) - 0.096);
    var bkK: f32 = 0.0;
    var strap: f32 = max(smoothstep(0.021, 0.017, sx) * smoothstep(-0.17, -0.15, tl.y), smoothstep(0.022, 0.018, abs(tl.y + 0.19))) * onTorso;
    var strapEdge: f32 = max(smoothstep(0.030, 0.021, sx) * smoothstep(-0.18, -0.15, tl.y), smoothstep(0.031, 0.022, abs(tl.y + 0.19))) * onTorso;
    if (nb > 0.5) {
      // (new body: a pack harness, not a safety vest: on the front the shoulder straps are narrow and curve out over the chest to pass under the arms,
      // joined by a small sternum strap; at the waist a slim hip belt with a buckle; behind, they run straight down into the pack as before)
      let frK: f32 = smoothstep(0.03, -0.05, tl.z);
      let xc: f32 = mix(0.096, 0.080 + 0.090 * smoothstep(0.20, -0.14, tl.y), frK);
      let sxN: f32 = abs(abs(tl.x) - xc); let hw: f32 = mix(0.016, 0.0105, frK);
      let topK: f32 = smoothstep(-0.17, -0.15, tl.y) * mix(1.0, smoothstep(-0.13, -0.09, tl.y), frK);
      let stern: f32 = smoothstep(0.0065, 0.0045, abs(tl.y - 0.085)) * step(abs(tl.x), xc) * frK;
      let belt: f32 = smoothstep(0.0115, 0.0085, abs(tl.y + 0.19));
      strap = max(max(smoothstep(hw + 0.0015, hw - 0.0015, sxN) * topK, stern), belt) * onTorso;
      strapEdge = max(max(smoothstep(hw + 0.008, hw + 0.002, sxN) * topK, smoothstep(0.012, 0.007, abs(tl.y - 0.085)) * step(abs(tl.x), xc) * frK), smoothstep(0.018, 0.012, abs(tl.y + 0.19))) * onTorso;
      // buckles: the sternum strap's and the hip belt's, in the middle
      bkK = (smoothstep(0.012, 0.009, abs(tl.x)) * stern + smoothstep(0.020, 0.016, abs(tl.x)) * belt * frK) * onTorso;
      // the front: a storm flap over the zip, a chest pocket zip on the left, a small pale patch on the right
      let zipC: f32 = smoothstep(0.0028, 0.0012, abs(tl.x - 0.016)) * frK * step(-0.17, tl.y) * onTorso;
      let pkZ: f32 = smoothstep(0.0024, 0.0010, abs(tl.x + 0.052 + 0.25 * (tl.y - 0.13))) * smoothstep(0.004, 0.0, abs(tl.y - 0.115) - 0.040) * frK * onTorso;
      let pch: f32 = smoothstep(0.002, 0.0, max(abs(tl.x - 0.050) - 0.016, abs(tl.y - 0.140) - 0.007)) * frK * onTorso * (1.0 - strap);
      alb = mix(alb, vec3f(0.035, 0.040, 0.050), max(zipC, pkZ) * 0.85);
      alb = mix(alb, vec3f(0.75, 0.76, 0.74), pch);
    }
    alb *= 1.0 - 0.45 * (strapEdge - strap);
    alb = mix(alb, vec3f(0.040, 0.048, 0.062), strap); sheen = mix(sheen, 0.2, strap); cloth = mix(cloth, 0.5, strap);
    alb = mix(alb, vec3f(0.30, 0.31, 0.33), bkK);
    // its cloth: gathered in rings where the elbow bends (the more it is bent the deeper), in long soft folds down the sleeve and round the body, bunched
    // above the hem; it is padded, so it swells between its seams, and the straps and the pack press into it
    let slv: f32 = 1.0 - onTorso; let de: f32 = length(eq); let elb: f32 = mix(M.p.x, M.p.y, sideR); let tf: f32 = 0.5 * (M.q.x + M.q.y);
    let fe: f32 = skFold(eq, armAx, 28.0, px); let fs: f32 = skFold(eq, normalize(armAx + vec3f(0.35, 0.0, 0.45)), 14.0, px);
    let fw: f32 = skFold(pl, vec3f(0.0, 1.0, 0.0), 15.5, px); let ft: f32 = skFold(tl, vec3f(0.45, 0.88, 0.13), 9.0, px);
    // (above the hem: with the trunk folded forward the back is drawn taut and the front is crowded)
    let waist: f32 = smoothstep(0.010, 0.05, hemV) * smoothstep(0.34, 0.14, hemV) * mix(1.0 + 0.6 * tf, 1.0 - 0.55 * tf, smoothstep(-0.03, 0.05, pl.z));
    fold = slv * (exp(-de * de / mix(0.014, 0.022, nb)) * (0.004 + 0.013 * elb) * mix(1.0, 0.45, nb) * (abs(fe) * 2.0 - 0.2) + (0.030 + 0.012 * nb) * lay * fs) + onTorso * (waist * 0.030 * fw + (0.024 + 0.012 * nb) * lay * ft) + 0.010 * big;
    // seams: round the armhole, down the flank, the band of the hem, the flap over the front zip; the two pocket zips
    let flank: f32 = mix(pl.z - 0.005, tl.z - 0.012, smoothstep(0.10, 0.25, hemV));
    sd = min(abs(v.mat.w) * 0.6 + nb, abs(hemV - 0.034) + slv);
    sd = min(sd, abs(flank) + slv + step(abs(bp.x), 0.10));
    sd = min(sd, abs(tl.x - 0.016) + slv + step(-0.03, tl.z));
    let pz: vec2f = vec2f(abs(tl.x) - 0.078, tl.y + 0.075); let pd: vec2f = vec2f(0.050, -0.090);
    let zipD: f32 = length(pz - pd * saturate(dot(pz, pd) / dot(pd, pd))) + slv + step(-0.03, tl.z);
    fold -= 0.0035 * exp(-min(sd, zipD) * 80.0);
    fold = mix(fold, -0.003, strap) + 0.001 * (strapEdge - strap);
    alb *= 1.0 - kz * (0.10 * smoothstep(0.036, 0.032, hemV) * onTorso + 0.85 * smoothstep(0.0034, 0.0020, zipD));
    dark = 0.42 * smoothstep(0.040, 0.008, pkD); shell = 1.0 - 0.6 * strap;
  } else if (id < 1.5) {     // trousers: slate shell (not black: the seat and the legs have to show their form), a dusting of snow at the hems
    alb = vec3f(0.066, 0.082, 0.108);
    // their cloth: creased behind the knee and across the lap (the more the leg is folded the deeper), stacked in rings above the boot, long soft folds between
    let kne: f32 = mix(M.p.z, M.p.w, sideR); let hpf: f32 = mix(M.q.x, M.q.y, sideR); let inL: f32 = smoothstep(0.0, 0.03, bm.x);
    let dk: f32 = length(kq - legB * 0.04); let dh: f32 = length(hq + legB * 0.05 - thD * 0.03);
    let fk: f32 = skFold(kq, legAx, 29.0, px); let fh: f32 = skFold(hq, thD, 26.0, px); let fl: f32 = skFold(hq, normalize(legAx + legB * 0.55 + vec3f(0.25, 0.0, 0.0)), 12.0, px); let fc: f32 = skFold(kq, shD, 27.0, px);
    let stack: f32 = smoothstep(0.10, 0.26, legS) * smoothstep(hemS, hemS - 0.024, legS);
    fold = inL * (exp(-dk * dk / 0.016) * (0.004 + 0.013 * kne) * (abs(fk) * 2.0 - 0.2) + exp(-dh * dh / 0.018) * (0.003 + 0.012 * hpf) * (abs(fh) * 2.0 - 0.2) + stack * (0.022 + 0.014 * nb * (0.5 + kne)) * fc + (0.022 + 0.014 * nb) * lay * fl) + (0.008 + 0.006 * nb) * big;
    // (new body: the bent knee gathers the cloth behind it into a fan of compression folds, and the leg crumples onto the boot cuff)
    let fkb: f32 = skFold(kq, normalize(legAx + legB * 0.45), 21.0, px); let bkK: f32 = exp(-dot(kq - legB * 0.06, kq - legB * 0.06) / 0.006);
    let cufK: f32 = smoothstep(hemS - 0.075, hemS - 0.030, legS) * smoothstep(hemS + 0.004, hemS - 0.012, legS);
    fold += nb * inL * (bkK * (0.006 + 0.026 * kne) * (abs(fkb) * 2.0 - 0.3) + cufK * (0.010 + 0.016 * kne) * (abs(fc) * 2.0 - 0.3));
    // seams: down the outside of the leg, up the seat, a panel over the knee, the band of the cuff
    let rl: vec3f = mix(hq - thD * thU, kq - shD * legS, smoothstep(-0.03, 0.03, legS));
    sd = min(abs(rl.z) + step(rl.x, 0.0), abs(bp.x) + step(pl.z, 0.03));
    sd = min(sd, abs(length(kq + legB * 0.03) - 0.105) + step(0.0, dot(kq, legB)));
    sd = min(sd, abs(legS - hemS + 0.040));
    fold -= 0.003 * exp(-sd * 80.0);
    alb *= 1.0 - kz * mix(0.12, 0.0, nb) * smoothstep(hemS - 0.042, hemS - 0.038, legS);     // (new body: no dark band at the cuff, only its panel line)
    // (new body: the cloth is shaded into the bends: the hollow behind the knee and the crease across the lap darken as far as they are folded)
    dark = nb * (0.38 * kne * exp(-dot(kq - legB * 0.05, kq - legB * 0.05) / 0.005) + 0.30 * hpf * exp(-dh * dh / 0.006) + 0.22 * cufK * saturate(-fold * 90.0)) * inL;
    // (the jacket's hem lies close over them, except at the back, where it rides up and down the seat)
    dark = max(dark, 0.5 * smoothstep(-0.030, -0.002, hemV) * (1.0 - smoothstep(-0.02, 0.07, pl.z)));
    let fine: vec4f = texLod(tDetail, bp.xy * 11.0 + bp.zz * vec2f(7.0, 5.0), log2(max(px * 5600.0, 1.0)));
    let snowy: f32 = mix(smoothstep(0.31, 0.235, bp.y), smoothstep(0.30, 0.17, bp.y), nb) * smoothstep(0.55, 0.85, fine.w * 0.6 + weave.z * 0.5 + smoothstep(0.28, 0.235, bp.y) * 0.2 + kz * 0.25 * saturate(-fold * 120.0));
    alb = mix(alb, vec3f(0.78, 0.83, 0.90), snowy * mix(0.5, 0.22, nb));     // (new body: a fainter, patchier dusting with no edge to it)
    sheen = mix(0.35, 0.28, nb); cloth = 1.0; specS = mix(0.04, 0.035, nb); shell = mix(0.45, 0.42, nb);     // (new body: a soft sheen on the waterproof face)
  } else if (id < 2.5) {     // gloves
    alb = ${s(e.glove.alb)}; sheen = ${w(e.glove.sheen)}; specS = ${w(e.glove.specS)}; specP = ${w(e.glove.specP)};
  } else if (id < 3.5) {     // boots: graphite shell (pale ones are lost against the snow and the legs seem to end at the hem), orange buckles
    alb = vec3f(0.055, 0.058, 0.066);
    let bk: f32 = smoothstep(0.012, 0.006, abs(fract(bp.y * 14.0) - 0.5) * 0.07) * step(0.14, bp.y) * step(bp.z, 0.02);
    alb = mix(alb, orange, bk * 0.9);
    let sole: f32 = step(bp.y, 0.060); alb = mix(alb, vec3f(0.02), sole);
    specS = 0.35; specP = 60.0; gloss = 0.06;
  } else if (id < 4.5) {     // helmet: matte white with an orange centre stripe
    alb = vec3f(0.80, 0.80, 0.77);
    alb = mix(alb, orange, smoothstep(0.016, 0.011, abs(bp.x)) * 0.95);
    specS = 0.18; specP = 40.0; gloss = 0.03;
    if (nb > 0.5) {      // (new body: vent slots either side of the ridge, the brim's underside in shade, a satin clear coat)
      let vs: f32 = smoothstep(0.0075, 0.0045, abs(abs(hd3.x) - 0.036)) * max(smoothstep(0.024, 0.018, abs(hd3.z + 0.035)), smoothstep(0.024, 0.018, abs(hd3.z - 0.050))) * step(0.055, hd3.y);
      alb = mix(alb, vec3f(0.03, 0.03, 0.035), vs); fold = -0.002 * vs;
      alb *= 1.0 - 0.35 * smoothstep(0.02, 0.0, hd3.y - 0.012) * smoothstep(-0.07, -0.10, hd3.z) * step(0.02, hd3.y);
      specS = 0.30; specP = 60.0; gloss = 0.05;
    }
  } else if (id < 5.5) {     // goggle lens: mirrored, iridescent
    alb = vec3f(0.01, 0.01, 0.015); gloss = 0.85; specS = 2.0; specP = 600.0;
    let fr: f32 = 1.0 - saturate(dot(N, V));
    glossTint = mix(vec3f(1.0, 0.62, 0.20), vec3f(0.95, 0.25, 0.55), fr);
    // (new body: a mirrored lens that runs from gold at the top to violet-blue at the bottom)
    // (new body: a tall mirrored lens that reflects the sky above and the bright snow below it, as a curved mirror does, in a gold-to-blue coating; the sun a hard glint)
    lensV = (hd3.y - ${a0.HEAD.gy.toFixed(4)}) / ${a0.HEAD.gh.toFixed(4)}; lensK = nb;
    glossTint = mix(glossTint, mix(vec3f(1.0, 0.78, 0.42), vec3f(0.55, 0.62, 1.0), smoothstep(0.5, -0.6, lensV)) * (1.05 + 0.3 * fr), nb);
  } else if (id < 6.5) {     // goggle frame + strap
    alb = mix(vec3f(0.02), orange, step(-0.095, qz));
    sheen = 0.2; specS = 0.06;
    if (nb > 0.5) {      // (new body: a thick satin black frame; the strap black webbing with an orange stripe woven along it)
      alb = mix(vec3f(0.025, 0.026, 0.03), mix(vec3f(0.02), orange, smoothstep(0.0040, 0.0025, abs(abs(hd3.y - ${a0.HEAD.gy.toFixed(4)}) - 0.0075))), strapK);
      specS = mix(0.25, 0.04, strapK); specP = 40.0; cloth = 0.6 * strapK; sheen = 0.25;
    }
  } else if (id < 7.5) {     // neck gaiter
    alb = vec3f(0.022, 0.030, 0.045); sheen = 0.4; cloth = 1.0;
    if (nb > 0.5) {      // (new body: a charcoal knit, not a black hole: fine ribs round the neck, fading out when they are too small to see, and a soft fuzz)
      let rb: f32 = 0.5 + 0.5 * sin(hd3.y * 1047.0 + 0.35 * sin(hd3.x * 160.0));
      alb = vec3f(0.115, 0.118, 0.126) * (1.0 - 0.12 * rb * smoothstep(0.0040, 0.0016, px)); sheen = 0.7; fold = 0.0012 * (rb - 0.5) * smoothstep(0.0040, 0.0016, px);
    }
  } else if (id < 8.5) {     // backpack: slate body, orange lid, reflective tab
    alb = vec3f(0.045, 0.055, 0.070);
    let lid: f32 = smoothstep(0.082, 0.092, tl.y - (tl.z - 0.18) * 0.35);
    // (new body: the lid is the pack's own slate with an orange piping along its seam: an orange lid read as a hump of the jacket on the shoulders)
    let lidC: vec3f = mix(orange * 0.9, mix(vec3f(0.055, 0.065, 0.082), orange * 0.9, smoothstep(0.010, 0.004, abs(tl.y - (tl.z - 0.18) * 0.35 - 0.090))), nb);
    alb = mix(alb, lidC, lid);
    let zip: f32 = smoothstep(0.005, 0.002, abs(tl.x)) * (1.0 - lid);
    alb = mix(alb, vec3f(0.01), zip);
    let tab: f32 = smoothstep(0.03, 0.026, abs(tl.x)) * smoothstep(0.012, 0.009, abs(tl.y + 0.205));
    alb = mix(alb, vec3f(0.9), tab);
    sheen = 0.25; specS = 0.08; specP = 26.0; cloth = 0.6;
    // (its cloth: soft dents, a seam where the lid closes over the body, its sides turning away into the shade)
    fold = 0.012 * big; sd = abs(tl.y - (tl.z - 0.18) * 0.35 - 0.087); dark = 0.25 * smoothstep(-0.012, 0.006, pkD); shell = 0.5;
  } else if (id < 9.5) {     // skis: graphic topsheet, bright base, steel edges
    let top: f32 = smoothstep(0.55, 0.8, v.mat.w); let base: f32 = smoothstep(-0.55, -0.8, v.mat.w); let z: f32 = v.mat.z;
    // (the same pair as the first-person view's: lemon going lime toward the tip, a black band with a pale pinstripe further back, an orange tail)
    let fz: f32 = fract(z * 3.2 + 0.87); let rear: f32 = smoothstep(-0.20, -0.25, z) * smoothstep(-0.46, -0.44, z);
    var topc: vec3f = mix(${s(e.ski.alb)}, ${s(e.skiTip.alb)}, smoothstep(-0.64, -0.93, z));
    topc = mix(topc, ${s(e.skiMark.alb)}, step(0.5, fz) * rear);
    topc = mix(topc, vec3f(0.85, 0.87, 0.86), smoothstep(0.03, 0.02, abs(fz - 0.5)) * rear);
    topc = mix(topc, orange, smoothstep(0.55, 0.60, z));
    // the sides: a black sidewall, with the steel edge a thin bright line along its foot and a narrower one where it turns into the topsheet;
    // the base: black sintered (a saturated base turned the pair teal whenever it was edged toward the lens), with the topsheet's lemon in two
    // thin bars by the tip and the maker's block by the tail, so the pair reads as one in every view
    let wv: f32 = v.mat.w;
    let steel: f32 = smoothstep(-0.70, -0.60, wv) * smoothstep(-0.38, -0.50, wv); let bev: f32 = smoothstep(0.38, 0.46, wv) * smoothstep(0.62, 0.52, wv);
    var sideC: vec3f = mix(vec3f(0.035, 0.037, 0.042), vec3f(0.62, 0.63, 0.65), steel); sideC = mix(sideC, vec3f(0.42, 0.43, 0.45), bev);
    let bz: f32 = min(min(abs(z + 0.700), abs(z + 0.672)), abs(z - 0.400) * 0.35);
    let baseC: vec3f = mix(vec3f(0.030, 0.032, 0.036), ${s(e.ski.alb)} * 0.75, smoothstep(0.0075, 0.0055, bz));
    alb = mix(sideC, topc, top); alb = mix(alb, baseC, base);
    specS = mix(mix(1.0, 2.4, max(steel, bev)), 0.5, top); specS = mix(specS, 0.7, base); specP = mix(90.0, 140.0, steel);
    gloss = mix(mix(0.18, 0.55, max(steel, bev)), 0.10, top); gloss = mix(gloss, 0.14, base);
  } else if (id < 10.5) {    // poles
    alb = mix(${s(e.pole.alb)}, ${s(e.poleGrip.alb)}, step(-0.105, v.mat.z));
    alb = mix(alb, ${s(e.poleBasket.alb)}, step(v.mat.z, -1.025) * step(-1.06, v.mat.z));   // baskets: dark (in a tuck they point straight back at the lens, and pale ones read as a pair of eyes)
    specS = ${w(e.pole.specS)}; specP = ${w(e.pole.specP)}; gloss = ${w(e.pole.gloss)};
  } else {                   // bindings: black housings on a grey plate, the heel lever in the jacket's orange
    alb = mix(vec3f(0.035, 0.037, 0.042), vec3f(0.30, 0.32, 0.34), step(bp.y, 0.047));
    alb = mix(alb, orange, step(0.212, bp.z) * step(0.086, bp.y));
    specS = 0.45; specP = 70.0; gloss = 0.05;
  }
  // the cloth, for the light: the folds are a height over the body: their slopes turn the surface, their hollows are darker; a seam is a thin dark line;
  // M.q.w and kz are how much of this shows in the version of the cloth the owner has picked (none of it: the flat cloth of before)
  fold *= M.q.w;
  let edge: f32 = step(0.5, abs(dpdx(id)) + abs(dpdy(id)));
  alb *= (1.0 - 0.30 * saturate(-fold * 95.0)) * (1.0 - kz * 0.34 * skLine(sd, px)) * (1.0 - kz * dark);
  let dpx: vec3f = dpdx(v.wp); let dpy: vec3f = dpdy(v.wp); let r1: vec3f = cross(dpy, N); let r2: vec3f = cross(N, dpx); let det: f32 = dot(dpx, r1);
  var grd: vec3f = (dpdx(fold) * r1 + dpdy(fold) * r2) * (sign(det) / max(abs(det), 1e-10));
  grd *= min(1.0, 1.1 / max(length(grd), 1e-5)) * saturate(dot(N, V) * 5.0) * (1.0 - edge);
  N = normalize(N - grd);
  // fabric micro-relief
  N = normalize(N + (vec3f(weave.x, weave.y, weave.z) - 0.5) * 0.22 * cloth);
  let ndl: f32 = dot(N, L); let ndv: f32 = saturate(dot(N, V));
  let sh: f32 = shadowAt(v.wp + N * 0.035, 0.0016);
  let ao: f32 = select(v.mat.y, max(v.mat.y, 0.7), nb > 0.5 && id > 6.5 && id < 7.5);     // (new body: the gaiter is soft and grey: the crease where it meets the collar keeps no dark triangles)
  let wrapD: f32 = saturate((ndl + 0.25 * cloth) / (1.0 + 0.25 * cloth));
  // at night the moon is the key, and by moonlight the eye sees little colour: what the moon and the sky light is seen half grey (the snow, white,
  // loses nothing by it), and the lifts that make the figure stand out by day (rim, fuzz, the glow through the shell, the pale floor of the rim)
  // fall away with the key: they made a bright orange cut-out against blue snow. The lamp's own spill (below) keeps the colour where it falls
  let nk: f32 = M.r.x; let albL: vec3f = alb;
  alb = mix(alb, vec3f(dot(alb, vec3f(0.30, 0.55, 0.15))), 0.4 * nk); let lift: f32 = 1.0 - 0.7 * nk;
  let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
  var col: vec3f = alb * (U.sunCol.rgb * wrapD * sh + amb * ao);
  // sun through the fuzz at grazing angles, strongest when backlit
  let fr: f32 = pow(1.0 - ndv, 3.0);
  let back: f32 = saturate(dot(-V, L) * 0.5 + 0.5);
  col += (alb * 0.6 + 0.08) * U.sunCol.rgb * sheen * fr * (0.25 + 1.6 * back * back) * sh * saturate(ndl * 2.0 + 0.9) * lift;
  // against the light every edge that still sees the sun burns: the outline that lifts the figure off the snow
  let rim: f32 = pow(1.0 - ndv, 1.45) * back * back * saturate(ndl * 1.6 + 0.8) * sh;
  col += (alb * 0.5 + 0.24 * lift) * U.sunCol.rgb * (rim * (0.75 + 1.1 * sheen) * lift);
  col += alb * U.ambSky.rgb * sheen * fr * 0.6 * ao;
  // a thin shell with the sun behind it is lit from inside: the shaded side of the jacket glows in its own colour instead of going brown
  col += alb * U.sunCol.rgb * (0.24 * cloth * back * back * saturate(0.6 - ndl) * (0.35 + 0.65 * sh)) * lift;
  let Hh: vec3f = normalize(V + L);
  col += U.sunCol.rgb * sh * specS * pow(max(dot(N, Hh), 0.0), specP) * saturate(ndl * 4.0);
  // a shell cloth has a soft sheen of its own: a broad, weak mirror of the sun on the slopes turned to it, and of the sky where it is seen at a slant
  let Rv: vec3f = reflect(-V, N);
  col += shell * kz * (U.sunCol.rgb * sh * (0.07 * pow(max(dot(N, Hh), 0.0), 9.0) * saturate(ndl * 3.0)) + U.ambSky.rgb * ((0.4 + 0.6 * saturate(Rv.y * 1.5 + 0.4)) * (0.025 + 0.20 * pow(1.0 - ndv, 2.5)) * ao));
  if (gloss > 0.0) {
    var R: vec3f = reflect(-V, N);
    R = normalize(vec3f(R.x, mix(R.y, 0.12 + 0.55 * lensV, lensK), R.z));      // (the lens: its curve folds the sky into its top half and the snow into its bottom)
    var env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
    env = mix(env, vec3f(0.75, 0.80, 0.90) * (U.ambSky.rgb + U.sunCol.rgb * 0.35), smoothstep(0.05, -0.25, R.y));    // snow below the horizon
    let f0: f32 = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    col += env * glossTint * gloss * mix(f0, 1.0, step(0.5, gloss));
    col += U.sunCol.rgb * sh * lensK * (0.25 * smoothstep(0.55, 0.0, abs(lensV - 0.15)) * pow(saturate(dot(R, L)), 6.0) + 1.5 * pow(saturate(dot(R, L)), 300.0));
  }
  // the headlamp's spill: the hands, the poles' grips and the fronts of the skis are just in front of and below it, at the edge of its flood (the
  // head and the back are behind it and take none); it lights them in their own colours
  if (U.lamp.w > 0.0 && nk > 0.0) {
    let dl: vec3f = U.lamp.xyz - v.wp;
    col += albL * lampLight(v.wp) * (saturate(dot(N, normalize(dl)) + 0.1) * smoothstep(0.18, 0.40, length(dl)) * 2.2 * nk);
  }
  // (new body: the headlamp itself, a small hot lens on the front of the helmet: its glow belongs round it, not over the whole figure)
  if (U.lamp.w > 0.0 && nb > 0.5 && id > 3.5 && id < 6.5) {
    let lq: f32 = length(v.wp - U.lamp.xyz);
    col += vec3f(1.0, 0.90, 0.74) * (min(U.lamp.w * 0.12, 8.0) * smoothstep(0.030, 0.012, lq) * saturate(dot(N, U.lampDir.xyz) * 1.5 + 0.2));
  }
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`})(Na),z0=(()=>{const e={ready:!1,NB:25,herd:[],next:36,count:0,enabled:!0,gap:[75,125]},s={hips:0,spine:1,chest:2,neck1:3,neck2:4,head:5,earL:6,earR:7,tail:8,fUpL:9,fMidL:10,fCanL:11,fHoofL:12,fUpR:13,fMidR:14,fCanR:15,fHoofR:16,hUpL:17,hMidL:18,hCanL:19,hHoofL:20,hUpR:21,hMidR:22,hCanR:23,hHoofR:24};let w,x,F,we,Y=0,E,D,be;const ht=64,qe=new Float32Array(4*ht*4);let se=null,_=[];const b=[0,1.05,.02],re=.42,m=[.125,1,-.42],J=[.125,.78,-.32],ae=[.115,.42,-.38],X=[.115,.105,-.37],ke=[.115,1.04,.46],C=[.125,.76,.34],ne=[.115,.47,.56],Be=[.115,.105,.5],Ee=[0,-.105,-.055];function je(T,Se,me,B){const U=(st,Le)=>Math.atan2(Le[1]-st[1],Le[2]-st[2]),A=(st,Le)=>Math.hypot(Le[1]-st[1],Le[2]-st[2]),a=A(T,Se),oe=A(Se,me),fe=A(me,B),O=U(T,Se);let ce=U(me,B)-O;ce=Math.atan2(Math.sin(ce),Math.cos(ce));const He=Math.sqrt(a*a+fe*fe+2*a*fe*Math.cos(ce)),We=Math.atan2(fe*Math.sin(ce),a+fe*Math.cos(ce));let Qe=O+We-U(T,B);return Qe=Math.atan2(Math.sin(Qe),Math.cos(Qe)),{l1:a,l2:oe,l3:fe,del:ce,A:He,al:We,bend:Qe>=0?1:-1}}const $e=je(m,J,ae,X),nt=je(ke,C,ne,Be);function Ke(T,Se,me,B){const U=Se[2]-T[2],A=Se[1]-T[1],a=Math.hypot(U,A),oe=it(a,Math.abs(me.A-me.l2)+.03,me.A+me.l2-.004),fe=Math.atan2(A,U),O=Math.acos(it((me.A*me.A+oe*oe-me.l2*me.l2)/(2*me.A*oe),-1,1)),ie=fe+me.bend*O,ce=ie-me.al,He=ce+me.del,We=[Re(T[0],Se[0],.3),T[1]+me.l1*Math.sin(ce),T[2]+me.l1*Math.cos(ce)],Qe=[Re(T[0],Se[0],.7),We[1]+oe*Math.sin(fe)-me.A*Math.sin(ie),We[2]+oe*Math.cos(fe)-me.A*Math.cos(ie)],st=[Se[0],Qe[1]+me.l3*Math.sin(He),Qe[2]+me.l3*Math.cos(He)];return B.k1=We,B.k2=Qe,B.k3=st,B}const Fe=(T,Se,me)=>{const B=f.norm(Se);let U=f.sub(me,f.mul(B,f.dot(me,B)));return f.len(U)<1e-5&&(U=f.cross(B,[0,0,1])),U=f.norm(U),Wt.fromBasis(U,B,f.cross(U,B),T)},Ge=T=>[0,Math.sin(T),-Math.cos(T)],Je=T=>[0,Math.cos(T),Math.sin(T)],le=(T,Se,me)=>ge(T,Se,me),Pe=T=>Math.sin(h0*mt(T)),pe={hL:0,hR:.05,fL:.52,fR:.57};function c(T,Se,me,B,U){if(T<Se)return U.f=me*(.5-T/Se)+(B?.06:.2),U.u=0,U.c=0,U;const A=(T-Se)/(1-Se),a=-me*.5+(B?.06:.2),oe=me*.5+(B?.06:.2);return B?(U.f=Re(a,oe+.14,le(.4,.9,A))-.14*le(.9,1,A)-.16*Pe(A/.36),U.u=.5*le(0,.24,A)*(1-le(.58,1,A))+.05*Pe(A),U.c=le(0,.14,A)*(1-le(.72,.98,A))):(U.f=Re(a-.22*Pe(A/.42),oe,le(.36,.97,A)),U.u=.36*Math.pow(Pe(A*.92+.04),1.15)+.1*Pe(A/.4),U.c=le(0,.18,A)*(1-le(.74,.99,A))),U}const Ie={f:0,u:0,c:0},he={},H={ph:0,run:0,speed:0,freq:2,yaw:0,lean:0,ear:0};function z(T){const Se={},me=new Array(e.NB),B=T.run,U=It*T.ph,A=B*Math.min(.92,T.speed/Math.max(T.freq,.5)*.2),a=B>.01?it(A/Math.max(T.speed/Math.max(T.freq,.5),.001),.06,.3):1,oe=B*(.04*Math.sin(U-.72)+.06*Math.cos(2*(U-2.29))-.05),fe=B*(.135*Math.sin(U+.19)+.02),O=B*.21*Math.cos(U-5.84),ie=fe-.42*O,ce=fe+.7*O,He=[0,b[1]+oe+.05*Math.abs(O)*B,b[2]],We=Ge(ie),Qe=Je(ie),st=Ge(ce),Le=Je(ce),r=f.mad(He,We,re),q=f.mad(He,st,-re);Se.M=He,Se.Oc=r,Se.Oh=q;const k=(N,de,te)=>[r[0]+N,r[1]+Qe[1]*de-We[1]*te,r[2]+Qe[2]*de-We[2]*te],ee=(N,de,te)=>[q[0]+N,q[1]+Le[1]*de-st[1]*te,q[2]+Le[2]*de-st[2]*te];me[s.chest]=Wt.fromBasis([1,0,0],Qe,f.mul(We,-1),r),me[s.hips]=Wt.fromBasis([1,0,0],Le,f.mul(st,-1),q);{const N=(ie+ce)/2;me[s.spine]=Wt.fromBasis([1,0,0],Je(N),f.mul(Ge(N),-1),He)}const Z=[["f",-1,pe.fL,s.fUpL],["f",1,pe.fR,s.fUpR],["h",-1,pe.hL,s.hUpL],["h",1,pe.hR,s.hUpR]];Se.feet=[];for(const[N,de,te,o]of Z){const p=N==="f",i=((T.ph-te)%1+1)%1,y=B>.01?c(i,a,A,p,Ie):(Ie.f=0,Ie.u=0,Ie.c=0,Ie),j=p?X:Be,W=p?m:ke,h=p?k(de*W[0],W[1]-b[1]+0,W[2]-(b[2]-re)-.07*y.f*B):ee(de*W[0],W[1]-b[1],W[2]-(b[2]+re)),n=[de*j[0]*(1-.25*y.u),j[1]+y.u*B,j[2]-y.f*B],d=Ke(h,n,p?$e:nt,he),M=[1,0,0];me[o]=Fe(h,f.sub(d.k1,h),M),me[o+1]=Fe(d.k1,f.sub(d.k2,d.k1),M),me[o+2]=Fe(d.k2,f.sub(d.k3,d.k2),M);const g=Math.atan2(Ee[1],Ee[2])+y.c*B*1.05,R=[d.k3[0],d.k3[1]+.119*Math.sin(g),d.k3[2]+.119*Math.cos(g)];me[o+3]=Fe(d.k3,f.sub(R,d.k3),M),Se[N+(de<0?"L":"R")]=[h,d.k1.slice(),d.k2.slice(),d.k3.slice(),R],Se.feet.push({tip:R,down:B>.01?i<a:!0,p:i,fore:p,sx:de})}const K=.91-.11*B+B*.08*Math.sin(U-1.9)-ie*.35,ue=K+.14-.02*B,G=k(0,.1,-.14),Ae=f.mad(G,Ge(K),.3),_e=f.mad(Ae,Ge(ue),.28);Se.NB=G,Se.NM=Ae,Se.HB=_e,me[s.neck1]=Fe(G,f.sub(Ae,G),[1,0,0]),me[s.neck2]=Fe(Ae,f.sub(_e,Ae),[1,0,0]);const at=-.31+.07*B+B*.04*Math.sin(U-.6),ot=Math.cos(T.yaw),t=Math.sin(T.yaw),S=Ge(at),l=Je(at),u=[t,S[1]*ot,S[2]*ot],v={X:[ot,-S[1]*t,-S[2]*t],Y:l,Z:f.mul(u,-1)};Se.hb=v,me[s.head]=Wt.fromBasis(v.X,v.Y,v.Z,_e);const P=(N,de,te)=>[_e[0]+v.X[0]*N+v.Y[0]*de+v.Z[0]*te,_e[1]+v.X[1]*N+v.Y[1]*de+v.Z[1]*te,_e[2]+v.X[2]*N+v.Y[2]*de+v.Z[2]*te];Se.inHd=P;for(const N of[-1,1]){const de=P(N*.055,.062,-.045),te=.95*B+T.ear,o=.62-.2*B,p=[N*Math.sin(o),Math.cos(o)*Math.cos(te),Math.cos(o)*Math.sin(te)],i=[v.X[0]*p[0]+v.Y[0]*p[1]+v.Z[0]*p[2],v.X[1]*p[0]+v.Y[1]*p[1]+v.Z[1]*p[2],v.X[2]*p[0]+v.Y[2]*p[1]+v.Z[2]*p[2]];Se[N<0?"earL":"earR"]=[de,i],me[N<0?s.earL:s.earR]=Fe(de,i,v.X)}{const N=ee(0,.115,.215),de=-.75+.55*B+B*.2*Math.sin(2*U),te=[0,Le[1]*Math.sin(de)-st[1]*Math.cos(de),Le[2]*Math.sin(de)-st[2]*Math.cos(de)];Se.tail=[N,f.mad(N,te,.15)],me[s.tail]=Fe(N,te,[1,0,0])}return Se.aC=ie,Se.aH=ce,{J:Se,F:me,inC:k,inH:ee}}e.solve=z,e.B=s;function V(T){const Se={smin(We,Qe,st){const Le=Math.max(st-Math.abs(We-Qe),0)/st;return Math.min(We,Qe)-Le*Le*st*.25},sphere(We,Qe,st,Le,r,q,k){return We-=Le,Qe-=r,st-=q,Math.sqrt(We*We+Qe*Qe+st*st)-k},ellipsoid(We,Qe,st,Le,r,q,k,ee,Z){const K=(We-Le)/k,ue=(Qe-r)/ee,G=(st-q)/Z,Ae=Math.sqrt(K*K+ue*ue+G*G),_e=K/k,at=ue/ee,ot=G/Z,t=Math.sqrt(_e*_e+at*at+ot*ot);return t>1e-9?Ae*(Ae-1)/t:-Math.min(k,ee,Z)},capsule(We,Qe,st,Le,r,q,k,ee,Z,K,ue){const G=We-Le,Ae=Qe-r,_e=st-q,at=k-Le,ot=ee-r,t=Z-q,S=Math.max(0,Math.min(1,(G*at+Ae*ot+_e*t)/(at*at+ot*ot+t*t))),l=G-at*S,u=Ae-ot*S,v=_e-t*S;return Math.sqrt(l*l+u*u+v*v)-(K+(ue-K)*S)}},me=T.J,B=Se.capsule,U=(We,Qe,st,Le,r,q,k)=>B(We,Qe,st,Le[0],Le[1],Le[2],r[0],r[1],r[2],q,k),A=me.hb,a=me.HB,oe=(We,Qe,st,Le,r,q,k)=>{const ee=We-Le[0],Z=Qe-Le[1],K=st-Le[2];return[ee*r[0]+Z*r[1]+K*r[2],ee*q[0]+Z*q[1]+K*q[2],ee*k[0]+Z*k[1]+K*k[2]]},fe=[me.earL,me.earR].map(([We,Qe])=>{const st=Fe(We,Qe,A.X);return{o:We,X:[st[0],st[1],st[2]],Y:[st[4],st[5],st[6]],Z:[st[8],st[9],st[10]]}}),O=[me.fL,me.fR],ie=[me.hL,me.hR];function ce(We,Qe,st){const Le=Math.abs(We);let r=Se.ellipsoid(We,Qe,st,0,.985,-.33,.17,.262,.35);r=Se.smin(r,B(We,Qe,st,0,1.035,-.18,0,1.075,.34,.2,.168),.1),r=Se.smin(r,Se.ellipsoid(We,Qe,st,0,1.075,.46,.168,.205,.235),.1),r=Se.smin(r,B(We,Qe,st,0,1.205,-.4,0,1.215,.42,.07,.062),.1),r=Se.smin(r,Se.ellipsoid(Le,Qe,st,.112,.975,-.41,.078,.205,.135),.07),r=Se.smin(r,Se.ellipsoid(Le,Qe,st,.104,.945,.44,.098,.225,.178),.07),r=Se.smin(r,U(We,Qe,st,me.NB,me.NM,.15,.1),.1),r=Se.smin(r,U(We,Qe,st,me.NM,me.HB,.1,.08),.05),r=Se.smin(r,B(We,Qe,st,0,.99,-.6,0,1.3,-.795,.105,.062),.09);const q=oe(We,Qe,st,a,A.X,A.Y,A.Z),k=Math.abs(q[0]);let ee=Se.ellipsoid(q[0],q[1],q[2],0,.022,-.105,.078,.088,.12);ee=Se.smin(ee,B(q[0],q[1],q[2],0,.01,-.17,0,-.03,-.375,.063,.041),.045),ee=Se.smin(ee,Se.ellipsoid(q[0],q[1],q[2],0,-.058,-.17,.048,.044,.125),.03),ee=Se.smin(ee,Se.ellipsoid(k,q[1],q[2],.06,.048,-.14,.024,.026,.03),.014),r=Se.smin(r,ee,.04);for(const K of fe){const ue=oe(We,Qe,st,K.o,K.X,K.Y,K.Z);r=Se.smin(r,Se.ellipsoid(ue[0],ue[1],ue[2],0,.088,0,.044,.1,.021),.014)}r=Se.smin(r,U(We,Qe,st,me.tail[0],me.tail[1],.046,.028),.035);let Z=1e9;for(const K of O){let ue=U(We,Qe,st,K[0],K[1],.08,.06);ue=Se.smin(ue,U(We,Qe,st,K[1],K[2],.053,.0305),.03),ue=Se.smin(ue,Se.sphere(We,Qe,st,K[2][0],K[2][1],K[2][2],.036),.02),ue=Se.smin(ue,U(We,Qe,st,K[2],K[3],.0275,.025),.015),ue=Se.smin(ue,Se.sphere(We,Qe,st,K[3][0],K[3][1],K[3][2],.031),.015),ue=Se.smin(ue,U(We,Qe,st,K[3],f.lerp(K[3],K[4],.72),.028,.034),.012),Z=Math.min(Z,ue)}for(const K of ie){let ue=U(We,Qe,st,K[0],K[1],.108,.08);ue=Se.smin(ue,U(We,Qe,st,K[1],K[2],.072,.0335),.035),ue=Se.smin(ue,Se.sphere(We,Qe,st,K[2][0],K[2][1]+.01,K[2][2]+.008,.038),.02),ue=Se.smin(ue,U(We,Qe,st,K[2],K[3],.0295,.025),.015),ue=Se.smin(ue,Se.sphere(We,Qe,st,K[3][0],K[3][1],K[3][2],.031),.015),ue=Se.smin(ue,U(We,Qe,st,K[3],f.lerp(K[3],K[4],.72),.028,.034),.012),Z=Math.min(Z,ue)}return Z=Math.max(Z,-(Qe-.004)),Se.smin(r,Z,.05)}function He(We,Qe,st,Le,r,q,k){const ee=mt(.3+.7*(.55*mt(ce(We+Le*.06,Qe+r*.06,st+q*.06)/.06)+.45*mt(ce(We+Le*.2,Qe+r*.2,st+q*.2)/.2)));k[0]=0,k[1]=ee,k[2]=0,k[3]=0}return{f:ce,attr:He}}function I(T,Se){const me=Se.J,B=T.nv,U=new Float32Array(B*4),A=N0.capsule,a=[],oe=(ie,ce,He,We,Qe=0)=>a.push({i:ie,a:ce,b:He,r:We,side:Qe});oe(s.hips,[0,1.07,.3],[0,1.08,.6],.2),oe(s.spine,[0,1.05,-.14],[0,1.06,.2],.21),oe(s.chest,[0,1,-.5],[0,1.02,-.24],.23),oe(s.chest,[0,.99,-.6],[0,1.12,-.66],.1),oe(s.neck1,me.NB,me.NM,.125),oe(s.neck2,me.NM,me.HB,.09),oe(s.head,me.HB,me.inHd(0,-.02,-.38),.075),oe(s.tail,me.tail[0],me.tail[1],.04);for(const[ie,ce,He,We]of[[me.fL,s.fUpL,-1,1],[me.fR,s.fUpR,1,1],[me.hL,s.hUpL,-1,0],[me.hR,s.hUpR,1,0]])oe(ce,ie[0],ie[1],We?.075:.1,He),oe(ce+1,ie[1],ie[2],.045,He),oe(ce+2,ie[2],ie[3],.028,He),oe(ce+3,ie[3],ie[4],.03,He);const fe=me.earL,O=me.earR;for(let ie=0;ie<B;ie++){const ce=T.verts[ie*10],He=T.verts[ie*10+1],We=T.verts[ie*10+2];let Qe=-1,st=-1,Le=1e9,r=1e9,q=1;const k=K=>{const ue=ce-K[0][0],G=He-K[0][1],Ae=We-K[0][2],_e=ue*K[1][0]+G*K[1][1]+Ae*K[1][2];return _e>.012&&Math.hypot(ue-K[1][0]*_e,G-K[1][1]*_e,Ae-K[1][2]*_e)<.06&&_e<.24?_e:-1},ee=ce<0?k(fe):-1,Z=ce>0?k(O):-1;if(ee>0||Z>0)Qe=ee>0?s.earL:s.earR,st=s.head,q=ge(.012,.05,Math.max(ee,Z));else{for(const K of a){if(K.side&&K.side*ce<-.004)continue;const ue=A(ce,He,We,K.a[0],K.a[1],K.a[2],K.b[0],K.b[1],K.b[2],K.r,K.r);if(K.i===Qe){ue<Le&&(Le=ue);continue}if(K.i===st){if(ue<r&&(r=ue,r<Le)){const G=Le;Le=r,r=G;const Ae=Qe;Qe=st,st=Ae}continue}ue<Le?(r=Le,st=Qe,Le=ue,Qe=K.i):ue<r&&(r=ue,st=K.i)}st<0&&(st=Qe,r=Le),q=1/(1+Math.exp(-(r-Le)/.034))}U[ie*4]=Qe,U[ie*4+1]=st,U[ie*4+2]=q}return U}function Q(){const T=ma(),Se=.84,me=(U,A)=>{const a=[];for(let oe=0;oe<U.length-1;oe++){const fe=U[Math.max(oe-1,0)],O=U[oe],ie=U[oe+1],ce=U[Math.min(oe+2,U.length-1)];for(let He=0;He<A;He++){const We=He/A,Qe=We*We,st=Qe*We;a.push([0,1,2].map(Le=>.5*(2*O[Le]+(ie[Le]-fe[Le])*We+(2*fe[Le]-5*O[Le]+4*ie[Le]-ce[Le])*Qe+(3*O[Le]-fe[Le]-3*ie[Le]+ce[Le])*st)))}}return a.push(U[U.length-1]),a},B=(U,A,a,oe=5,fe=6)=>{const O=me(U,oe),ie=[];let ce=null;for(let Qe=0;Qe<O.length;Qe++){const st=O[Qe],Le=f.norm(f.sub(O[Math.min(Qe+1,O.length-1)],O[Math.max(Qe-1,0)]));let r=ce?f.sub(ce,f.mul(Le,f.dot(ce,Le))):f.cross(Le,Math.abs(Le[1])<.9?[0,1,0]:[1,0,0]);r=f.norm(r),ce=r;const q=f.cross(Le,r),k=Re(A,a,Math.pow(Qe/(O.length-1),1.25)),ee=[];for(let Z=0;Z<fe;Z++){const K=Z/fe*It,ue=Math.cos(K),G=Math.sin(K),Ae=[r[0]*ue+q[0]*G,r[1]*ue+q[1]*G,r[2]*ue+q[2]*G];ee.push([[st[0]+Ae[0]*k,st[1]+Ae[1]*k,st[2]+Ae[2]*k],Ae])}ie.push(ee)}const He=f.norm(f.sub(O[1],O[0])),We=f.norm(f.sub(O[O.length-1],O[O.length-2]));T.sweep(ie,[2,1,0,0],f.mul(He,-1),We)};for(const U of[-1,1]){const A=a=>a.map(oe=>[U*oe[0]*Se,oe[1]*Se+.02,oe[2]*Se]);B(A([[.05,.09,-.075],[.105,.24,.02],[.205,.44,.12],[.295,.66,.145],[.315,.86,.07],[.265,1.01,-.06]]),.029,.011,6),B(A([[.06,.135,-.05],[.082,.2,-.2],[.105,.32,-.285]]),.02,.008,5),B(A([[.205,.44,.12],[.255,.5,-.04],[.29,.62,-.145]]),.019,.008,5),B(A([[.295,.66,.145],[.365,.75,.225],[.385,.86,.25]]),.017,.008,4),B(A([[.315,.86,.07],[.385,.965,.14],[.405,1.09,.155]]),.017,.008,4)}return a0.fixMesh(T.done())}e.build=function(){se=z(H),_=se.F.map(ce=>Wt.invert(ce)),e.bind=se;const T=V(se),Se=performance.now(),me=qs(T.f,[-.36,-.01,-1.42],[.36,1.98,.82],.0135,{stride:2,attr:T.attr});e.meshMs=performance.now()-Se;const B=I(me,se),U=Q(),A=se.F[s.head],a=me.nv+U.nv,oe=me.ni+U.ni,fe=new Float32Array(a*10),O=new Float32Array(a*4),ie=new Uint32Array(oe);fe.set(me.verts.subarray(0,me.nv*10)),O.set(B),ie.set(me.idx.subarray(0,me.ni));for(let ce=0;ce<U.nv;ce++){const He=Wt.tp(A,[U.verts[ce*10],U.verts[ce*10+1],U.verts[ce*10+2]]),We=Wt.td(A,[U.verts[ce*10+3],U.verts[ce*10+4],U.verts[ce*10+5]]),Qe=(me.nv+ce)*10;fe[Qe]=He[0],fe[Qe+1]=He[1],fe[Qe+2]=He[2],fe[Qe+3]=We[0],fe[Qe+4]=We[1],fe[Qe+5]=We[2],fe[Qe+6]=2,fe[Qe+7]=1,fe[Qe+8]=U.verts[ce*10+1],O[(me.nv+ce)*4]=s.head,O[(me.nv+ce)*4+1]=s.head,O[(me.nv+ce)*4+2]=1}for(let ce=0;ce<U.ni;ce++)ie[me.ni+ce]=U.idx[ce]+me.nv;return e.mesh={V:fe,W:O,I:ie,nv:a,ni:oe},e.mesh},e.init=function(T){w=T;const Se=e.mesh||e.build();x=w.buffer(Se.V,"vertex"),F=w.buffer(Se.W,"vertex"),we=w.buffer(Se.I,"index"),Y=Se.ni,be=w.texture({w:4,h:ht,format:"rgba32f",filter:"nearest"});const me=[{attrs:[["pos","vec3f"],["nrm","vec3f"],["mat","vec4f"]]},{attrs:[["bw","vec4f"]]}],B=se.J,U=oe=>"vec3f("+oe.map(fe=>fe.toFixed(5)).join(", ")+")",A=`let hq: vec3f = vec3f(dot(bp - ${U(B.HB)}, ${U(B.hb.X)}), dot(bp - ${U(B.HB)}, ${U(B.hb.Y)}), dot(bp - ${U(B.HB)}, ${U(B.hb.Z)}));`,a=oe=>`fn vert(a: VIn) -> VOut { var v: VOut;
      var pos: vec3f = a.pos;
      if (a.mat.x > 1.5 && M.p.y < 0.5) { pos = ${U(B.inHd(0,.06,-.06))}; }             // a hind carries no antlers: they are folded away into the skull
      let s: SkinV = skinVertex(pos, a.nrm, vec4f(a.bw.x + M.p.x, a.bw.y + M.p.x, a.bw.z, 0.0));
      ${oe?"v.clip = U.shadowVP * vec4f(s.wp, 1.0);":"v.wp = s.wp; v.nrm = s.n; v.bp = a.pos; v.bn = a.nrm; v.mat = a.mat; v.clip = U.viewProj * vec4f(s.wp, 1.0);"}
      return v; }`;E=w.pipeline({name:"deer",lib:[St.common,St.hash,St.fog,St.shadow,Cs],buffers:me,varyings:{wp:"vec3f",nrm:"vec3f",bp:"vec3f",bn:"vec3f",mat:"vec4f"},uniforms:{p:"vec4f"},textures:{tBones:"fetch",tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:a(!1),fs:wo.replace("/*HEAD*/",A)}),D=w.pipeline({name:"deerShadow",lib:[St.common,Cs],buffers:me,varyings:{},uniforms:{p:"vec4f"},textures:{tBones:"fetch"},colorFormat:null,cull:"none",depthBias:2,depthBiasSlope:2,vs:a(!0),fs:null}),e.pipes=[E,D],e.ready=!0,e.fauna=typeof cs<"u"?cs:null,e.fauna&&(cs.init(T),e.pipes=e.pipes.concat(cs.pipes))};const L={},ye={},Ve=D0(90210),Ne=T=>{const Se=vt.at(T,L);return Se.hw>13&&(Se.glade||0)<.25&&(Se.gul||0)<.3&&(Se.ridge||0)<.5};e.vMax=17,e.spawn=function(T={}){const Se=zt.s,me=-Se.p[2],B=vt.at(me,L),U=Se.p[0]-B.cx,A=Math.max(-Se.v[2],4),a=T.side||(Math.abs(U)>2?-R0(U):Ve()<.5?-1:1),oe=it(A-4.2,9.5,e.vMax),fe=oe-A,O=T.ds!=null?T.ds:it(-fe*8.5,30,72),ie=T.n||(Ve()<.55?2:1);e.herd.length=0,e.side=a,e.pk=U*a,e.stage=0,e.tSide=0,e.sideFor=4.4+2*Ve(),e.crowd=0;for(let ce=0;ce<ie;ce++)e.herd.push({i:ce,row:ce*32,antlers:ce?0:1,scale:ce?1:1.2,side:a,s:me+O+ce*e.lead,v:oe,vf:oe,ph:Ve(),t:0,gapT:6.4+ce*.9,off:a*(vt.at(me+O,L).hw+4),yaw:0,look:0,lean:0,pos:[0,0,0],fwd:[0,0,-1],nrm:[0,1,0],init:!1,gone:!1,freq:2,dodge:0,snow:.5+.5*Ve()});return e.count++,e.t0=At.t,e.herd},e.lead=6;function Ce(T,Se){const me={ph:T.ph,run:T.run!=null?T.run:1,speed:T.v,freq:T.freq,yaw:T.look,lean:T.lean,ear:0},B=z(me),U=f.norm(T.nrm),A=f.mul(T.fwd,-1),a=f.norm(f.cross(U,A)),oe=f.cross(a,U),fe=T.scale,O=Math.cos(T.lean),ie=Math.sin(T.lean),ce=[a[0]*O+U[0]*ie,a[1]*O+U[1]*ie,a[2]*O+U[2]*ie],He=[U[0]*O-a[0]*ie,U[1]*O-a[1]*ie,U[2]*O-a[2]*ie],We=Wt.fromBasis(f.mul(ce,fe),f.mul(He,fe),f.mul(oe,fe),[T.pos[0]-Se[0],T.pos[1]-Se[1]-.045*fe,T.pos[2]-Se[2]]);for(let Qe=0;Qe<e.NB;Qe++)qe.set(Wt.mul(We,Wt.mul(B.F[Qe],_[Qe])),(T.row+Qe)*16);return T.R=We,T.J=B.J,B}e.room=T=>Ne(T)&&Ne(T+60)&&Ne(T+140),e.leave=function(){e.herd.length&&e.stage<2&&(e.stage=2,e.tGo=0)},e.update=function(T,Se){o0.riders[0][3]=0,o0.riders[1][3]=0,e.pull=0,e.ready&&(Ye(T,Se),e.fauna&&cs.update(T,Se))};function Ye(T,Se){const me=zt.s,B=-me.p[2];if(!e.herd.length){!e.fauna&&e.enabled&&zt.mode==="run"&&zt.runT>e.next&&me.speed>6&&e.room(B)&&(e.spawn(),e.next=zt.runT+Re(e.gap[0],e.gap[1],Ve()));return}e.enabled||e.leave();const U=vt.at(B,L),A=me.p[0]-U.cx,a=Math.max(-me.v[2],4),oe=e.herd[0];let fe=!1;e.pk=Math.max(A*e.side,e.pk-(e.stage===1?6:3)*T);{const O=oe.s-B;e.stage===0&&(O<11||oe.t>14)&&(e.stage=1),e.stage===1?(e.tSide+=T,(e.tSide>e.sideFor||O<-7||O>30||e.crowd>.5)&&(e.stage=2,e.tGo=0)):e.stage===2&&(e.tGo+=T),e.pull=e.side*.15*(e.stage===0?ge(24,11,O):e.stage===1?1:ge(4.5,2.5,e.tGo))*ge(-8,-3,O)}for(const O of e.herd){if(O.frozen){Ce(O,qt.origin),fe=!0;continue}O.t+=T;const ie=vt.at(O.s,L),ce=O.s-B,He=e.stage===2;let We=e.stage===0?a-4.2:e.stage===1?a+it((Re(9,2.5,mt(e.tSide/e.sideFor))-ce)*.6,-2.5,1.5):a+5;O.i&&(We=oe.vf+.9*(oe.s+e.lead-O.s));const Qe=e.vMax+(He?4:0);O.vf=Pt(O.vf,it(We,9,Qe),He?2.4:1.6,T);const st=e.pk+O.gapT,Le=ie.hw+1.5+O.i*.8;!O.i&&!He&&(e.crowd=st>Le+.5?e.crowd+T:Math.max(0,e.crowd-T));const r=O.side*Math.min(st,Le),q=O.init&&!He&&O.offT!=null&&T>0?(r-O.offT)/T:0;O.offT=r,O.tV=Pt(O.tV||0,it(q,-12,12),8,T);const k=O.init?He?O.side*.5*O.v*ge(.6,1.7,e.tGo+.25*O.i):it((r-O.off)*Re(.7,1.4,mt(O.t/4))+O.tV,-.56*O.vf,.56*O.vf):0;O.latV=Pt(O.latV||0,k,He?3.5:6,T),O.init?O.off+=O.latV*T:O.off=O.side*(ie.hw+4);const ee=Math.min(O.vf,Math.sqrt(Math.max(Qe*Qe-O.latV*O.latV,1)));O.v=Math.hypot(ee,O.latV);{const de=(O.off-A)*O.side;Math.abs(ce)<14&&de<5.2&&(O.off+=O.side*Math.min(5.2-de,7*T)),O.gap=(O.off-A)*O.side}let Z=ie.cx+O.off+O.dodge;const K=-O.s;vt.nearTree(Z,K,ye);const ue=ye.ok&&ye.d<2.6?(Z>=ye.x?1:-1)*(2.6-ye.d)*1.3:0;O.dodge=Pt(O.dodge,ue,ue?7:1.5,T),Z=ie.cx+O.off+O.dodge;const G=vt.height(Z,K,.5),Ae=O.pos[0],_e=O.pos[2];if(O.pos[0]=Z,O.pos[1]=O.init?Pt(O.pos[1],G,30,T):G,O.pos[2]=K,!O.init)O.yaw=0,O.init=!0;else if(T>0){const de=(Z-Ae)/T,te=(K-_e)/T,o=Math.hypot(de,te)||1,p=de/o,i=te/o,y=Math.atan2(p,-i),j=Math.atan2(Math.sin(y-O.yaw),Math.cos(y-O.yaw));O.lean=Pt(O.lean,it(-j*2.2,-.3,.3),5,T),O.yaw+=j*(1-Math.exp(-9*T))}const at=vt.normal(Z,K,1.1),ot=Math.sin(O.yaw),t=-Math.cos(O.yaw);O.nrm=f.norm([at[0]*.5,at[1],at[2]*.85]);const S=[ot,0,t],l=f.norm(f.sub(S,f.mul(O.nrm,f.dot(S,O.nrm))));O.fwd=l,O.freq=Re(1.75,2.6,mt((O.v-9)/19));const u=O.ph;O.ph=(O.ph+O.freq*T)%1,O.s+=ee*T;const v=!He&&Math.abs(ce)<24?it(Math.atan2((me.p[0]-Z)*Math.cos(O.yaw)+(me.p[2]-K)*Math.sin(O.yaw),5+Math.abs(ce))*1.6,-.85,.85)*ge(24,9,Math.abs(ce)):0;O.look=Pt(O.look,v,2.5,T),Ce(O,qt.origin);const P=de=>u<de&&O.ph>=de||u>O.ph&&(de>u||de<=O.ph);for(const[de,te]of[[.03,0],[.55,1]])if(P(de)){const o=Wt.tp(O.R,[0,.02,te?-.4:.36]),p=[o[0]+qt.origin[0],o[1]+qt.origin[1],o[2]+qt.origin[2]],i=[l[0]*O.v*(te?.5:-.25),.6,l[2]*O.v*(te?.5:-.25)],y=Math.hypot(p[0]-me.p[0],p[2]-me.p[2]);y<90&&Jt.kick(Se,p,i,(te?.8:1.1)*O.scale*(.7+.8*(ie.powder||.3))),y<34&&v0.event({type:"hoof",d:y,side:R0((p[0]-me.p[0])*me.r[0]+(p[2]-me.p[2])*me.r[2])||1,k:te?.75:1})}const N=Math.abs(O.off)-ie.hw;if(O.gone=ce<-36||ce>170||He&&N>16&&(ce<-5||N>26),!O.gone){fe=!0;const de=o0.riders[O.i];de[0]=O.pos[0]-qt.origin[0],de[1]=O.pos[1]-qt.origin[1]+1*O.scale,de[2]=O.pos[2]-qt.origin[2],de[3]=O.scale}}fe?w.updateTexture(be,0,0,4,ht,qe):e.herd.length=0}return e.draw=function(T,Se){if(e.ready){e.fauna&&cs.draw(T,Se);for(const me of e.herd)!me.gone&&me.R&&w.draw(E,{u:{p:[me.row,me.antlers,me.snow,0]},tex:{tBones:be,tDetail:c0.detail,tShadow:T,tSky:Se},vb:[x,F],ib:we,count:Y})}},e.drawShadow=function(){if(e.ready){e.fauna&&cs.drawShadow();for(const T of e.herd)!T.gone&&T.R&&w.draw(D,{u:{p:[T.row,T.antlers,0,0]},tex:{tBones:be},vb:[x,F],ib:we,count:Y})}},e.pose=function(T,Se){for(;e.herd.length<=T;)e.herd.push({i:e.herd.length,row:e.herd.length*32,antlers:e.herd.length?0:1,scale:e.herd.length?.87:1,side:1,s:0,v:14,vf:14,ph:0,t:0,off:0,yaw:0,look:0,lean:0,pos:[0,0,0],fwd:[0,0,-1],nrm:[0,1,0],init:!0,freq:2,dodge:0,snow:.7,frozen:!0});const me=e.herd[T];Object.assign(me,Se),me.frozen=!0;const B=Se.yaw||0,U=vt.normal(me.pos[0],me.pos[2],1.1);me.nrm=Se.flat?[0,1,0]:f.norm([U[0]*.5,U[1],U[2]*.85]);const A=[Math.sin(B),0,-Math.cos(B)];return me.fwd=f.norm(f.sub(A,f.mul(me.nrm,f.dot(A,me.nrm)))),Se.ground!==!1&&(me.pos[1]=vt.height(me.pos[0],me.pos[2],.5)),Ce(me,qt.origin),w.updateTexture(be,0,0,4,ht,qe),me},e})(),wo=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  var N: vec3f = normalize(v.nrm);
  let V: vec3f = normalize(U.camPos.xyz - v.wp);
  let L: vec3f = U.sunDir.xyz;
  let bp: vec3f = v.bp; let bn: vec3f = normalize(v.bn); let ax: f32 = abs(bp.x);
  /*HEAD*/
  // hair lies along the body: streaks drawn out from nose to tail
  let hair: vec4f = tex(tDetail, vec2f(bp.z * 1.2 + bp.y * 0.4, bp.y * 6.5 + bp.x * 5.0));
  let fine: vec4f = tex(tDetail, bp.zy * 12.0 + bp.xx * vec2f(7.0, 5.0));
  var alb: vec3f = vec3f(0.5); var sheen: f32 = 0.9; var specS: f32 = 0.025; var specP: f32 = 16.0; var gloss: f32 = 0.0; var fur: f32 = 1.0;
  if (v.mat.x > 1.5) {
    // antler: dark and grooved at the burr, worn pale toward the points
    let tip: f32 = smoothstep(0.10, 0.80, v.mat.z);
    alb = mix(vec3f(0.085, 0.056, 0.034), vec3f(0.50, 0.44, 0.34), tip * tip) * (0.75 + 0.5 * hair.z);
    sheen = 0.12; specS = 0.16; specP = 34.0; fur = 0.0;
  } else {
    // winter coat: grey-brown, darker along the spine and on the neck, pale underneath, a cream patch round the tail
    var coat: vec3f = vec3f(0.118, 0.080, 0.052);
    coat = mix(coat, vec3f(0.058, 0.040, 0.028), 0.65 * smoothstep(0.13, 0.02, ax) * smoothstep(0.55, 0.95, bn.y) * step(-0.75, bp.z));
    let neck: f32 = smoothstep(-0.50, -0.64, bp.z) * smoothstep(-0.06, 0.02, hq.z + 0.02);
    coat = mix(coat, vec3f(0.070, 0.048, 0.033), 0.75 * neck);
    let under: f32 = smoothstep(-0.15, -0.70, bn.y) * smoothstep(0.50, 0.74, bp.y) * smoothstep(-0.62, -0.50, bp.z);
    coat = mix(coat, vec3f(0.30, 0.255, 0.20), 0.8 * under);
    let rump: f32 = smoothstep(0.585, 0.665, bp.z - 0.55 * abs(bp.y - 1.02) - 0.25 * ax) * smoothstep(0.80, 0.90, bp.y);
    coat = mix(coat, vec3f(0.44, 0.375, 0.27), rump);
    coat = mix(coat, vec3f(0.050, 0.035, 0.025), smoothstep(0.045, 0.02, ax) * smoothstep(0.66, 0.70, bp.z) * smoothstep(1.02, 1.08, bp.y));      // the tail, dark down its back
    // legs: dark shanks, paler down the inside
    let legK: f32 = smoothstep(0.66, 0.50, bp.y);
    coat = mix(coat, vec3f(0.055, 0.039, 0.028), 0.7 * legK);
    coat = mix(coat, vec3f(0.24, 0.205, 0.16), 0.5 * legK * smoothstep(0.02, -0.5, bn.x * sign(bp.x)));
    // face: darker bridge, pale ring behind a black nose, pale chin and throat, the insides of the ears
    let face: f32 = smoothstep(0.02, -0.03, hq.z + 0.02) * smoothstep(1.45, 1.52, bp.y);
    coat = mix(coat, vec3f(0.095, 0.066, 0.045), face * 0.6);
    coat = mix(coat, vec3f(0.34, 0.295, 0.23), face * smoothstep(0.035, 0.0, abs(hq.z + 0.325)) * 0.85);
    coat = mix(coat, vec3f(0.36, 0.31, 0.245), face * smoothstep(-0.02, -0.07, hq.y) * smoothstep(-0.03, -0.12, hq.z) * 0.8);
    let earIn: f32 = smoothstep(0.10, 0.13, hq.y) * smoothstep(0.03, -0.01, dot(bn, vec3f(0.0, 0.3, 1.0)));
    alb = coat * (0.84 + 0.32 * hair.z) * (0.92 + 0.16 * fine.x);
    alb = mix(alb, vec3f(0.28, 0.23, 0.19), 0.5 * earIn * step(1.6, bp.y));
    // nose, eyes, hooves
    let nose: f32 = face * smoothstep(-0.365, -0.385, hq.z) * smoothstep(-0.075, -0.045, hq.y);
    alb = mix(alb, vec3f(0.012, 0.011, 0.012), nose); gloss = 0.5 * nose; fur = 1.0 - nose;
    let eye: f32 = smoothstep(0.021, 0.015, length(vec3f(abs(hq.x), hq.y, hq.z) - vec3f(0.071, 0.050, -0.142)));
    alb = mix(alb, vec3f(0.010, 0.008, 0.007), eye); gloss = max(gloss, 0.9 * eye); fur *= 1.0 - eye;
    let hoof: f32 = smoothstep(0.082, 0.070, bp.y);
    alb = mix(alb, vec3f(0.022, 0.019, 0.018), hoof); specS = mix(specS, 0.35, hoof); specP = mix(specP, 50.0, hoof); fur *= 1.0 - hoof;
    sheen = mix(0.25, 0.95, fur);
    // snow: sifted along the back and into the mane, caked on the shanks
    let dust: f32 = smoothstep(0.50, 0.92, bn.y) * smoothstep(0.50, 0.80, fine.w * 0.55 + hair.x * 0.5 + 0.12 * M.p.z) * fur * M.p.z;
    let cake: f32 = smoothstep(0.38, 0.13, bp.y) * smoothstep(0.38, 0.66, fine.z) * (1.0 - hoof);
    alb = mix(alb, vec3f(0.80, 0.84, 0.90), max(dust * 0.42, cake * 0.7));
  }
  // the lie of the hair roughens the surface
  N = normalize(N + (vec3f(hair.x, hair.y, hair.z) - 0.5) * 0.30 * fur);
  let ndl: f32 = dot(N, L); let ndv: f32 = saturate(dot(N, V));
  let sh: f32 = shadowAt(v.wp + N * 0.04, 0.0016);
  let ao: f32 = v.mat.y;
  let wrapD: f32 = saturate((ndl + 0.3 * fur) / (1.0 + 0.3 * fur));
  let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
  var col: vec3f = alb * (U.sunCol.rgb * wrapD * sh + amb * ao);
  // against the light the coat is edged with fire: every hair that stands clear of the body carries the sun through it
  let fr: f32 = pow(1.0 - ndv, 3.0);
  let back: f32 = saturate(dot(-V, L) * 0.5 + 0.5);
  col += (alb * 0.8 + 0.035) * U.sunCol.rgb * sheen * fr * (0.2 + 1.5 * back * back) * sh * saturate(ndl * 2.0 + 0.9);
  let rim: f32 = pow(1.0 - ndv, 2.6) * back * back * saturate(ndl * 1.2 + 1.0) * sh;
  col += (alb * 0.8 + 0.085) * U.sunCol.rgb * (rim * (0.5 + 1.6 * sheen));
  col += alb * U.ambSky.rgb * sheen * fr * 0.6 * ao;
  let Hh: vec3f = normalize(V + L);
  col += U.sunCol.rgb * sh * specS * pow(max(dot(N, Hh), 0.0), specP) * saturate(ndl * 4.0);
  if (gloss > 0.0) {
    let R: vec3f = reflect(-V, normalize(v.nrm));
    var env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
    env = mix(env, vec3f(0.75, 0.80, 0.90) * (U.ambSky.rgb + U.sunCol.rgb * 0.35), smoothstep(0.05, -0.25, R.y));
    col += env * gloss * (0.06 + 0.94 * pow(1.0 - ndv, 5.0)) + U.sunCol.rgb * sh * gloss * 1.5 * pow(max(dot(normalize(v.nrm), Hh), 0.0), 300.0);
  }
  // after dark an animal that crosses the beam of the headlamp is lit by it (and its eye throws the light straight back)
  if (U.lamp.w > 0.0) {
    let ll: vec3f = lampLight(v.wp);
    if (ll.x > 0.00002) {
      let Ld: vec3f = normalize(U.lamp.xyz - v.wp);
      col += ll * (alb * saturate((dot(N, Ld) + 0.35) / 1.35) * (0.6 + 0.4 * ao) + gloss * 6.0 * pow(max(dot(normalize(v.nrm), normalize(V + Ld)), 0.0), 40.0));
    }
  }
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`,cs=(()=>{const e={ready:!1,enabled:!0,kinds:[{id:"deer",name:"鹿"},{id:"hare",name:"雪兔"},{id:"fox",name:"狐狸"},{id:"ibex",name:"北山羊"},{id:"eagle",name:"金雕"}],sp:{},live:[],stats:{}},s=32,w=8,x=s*w,F=new Float32Array(4*x*4);let we,Y,E,D;const be=(t,S,l)=>{const u=Math.max(l-Math.abs(t-S),0)/l;return Math.min(t,S)-u*u*l*.25},ht=(t,S,l)=>{const u=Math.max(l-Math.abs(t-S),0)/l;return Math.max(t,S)+u*u*l*.25},qe=(t,S,l,u,v)=>{const P=t-u[0],N=S-u[1],de=l-u[2];return Math.sqrt(P*P+N*N+de*de)-v},se=(t,S,l,u,v,P,N,de,te)=>{const o=(t-u)/N,p=(S-v)/de,i=(l-P)/te,y=Math.sqrt(o*o+p*p+i*i),j=o/N,W=p/de,h=i/te,n=Math.sqrt(j*j+W*W+h*h);return n>1e-9?y*(y-1)/n:-Math.min(N,de,te)},_=(t,S,l,u,v,P,N)=>{const de=t-u[0],te=S-u[1],o=l-u[2],p=v[0]-u[0],i=v[1]-u[1],y=v[2]-u[2],j=Math.max(0,Math.min(1,(de*p+te*i+o*y)/(p*p+i*i+y*y))),W=de-p*j,h=te-i*j,n=o-y*j;return Math.sqrt(W*W+h*h+n*n)-(P+(N-P)*j)},b=(t,S,l)=>(l=mt(l),[t[0]+(S[0]-t[0])*l,t[1]+(S[1]-t[1])*l,t[2]+(S[2]-t[2])*l]),re=(t,S,l,u,v,P,N)=>{const de=t-u[0],te=S-u[1],o=l-u[2];return[de*v[0]+te*v[1]+o*v[2],de*P[0]+te*P[1]+o*P[2],de*N[0]+te*N[1]+o*N[2]]},m=(t,S,l)=>{const u=f.norm(S);let v=f.sub(l,f.mul(u,f.dot(l,u)));return f.len(v)<1e-5&&(v=f.cross(u,[0,0,1])),v=f.norm(v),Wt.fromBasis(v,u,f.cross(v,u),t)},J=t=>[0,Math.sin(t),-Math.cos(t)],ae=t=>[0,Math.cos(t),Math.sin(t)],X=(t,S)=>{const l=Math.cos(S),u=Math.sin(S);return[t[0]*l-t[2]*u,t[1],t[2]*l+t[0]*u]},ke=t=>Math.sin(h0*mt(t)),C=(t,S,l)=>ge(t,S,l),ne=t=>({o:[t[12],t[13],t[14]],X:[t[0],t[1],t[2]],Y:[t[4],t[5],t[6]],Z:[t[8],t[9],t[10]]}),Be={hips:0,spine:1,chest:2,neck1:3,neck2:4,head:5,earL:6,earR:7,tail:8,leg:11},Ee=27;function je(t,S,l,u){const v=(h,n)=>Math.atan2(n[1]-h[1],n[2]-h[2]),P=(h,n)=>Math.hypot(n[1]-h[1],n[2]-h[2]),N=P(t,S),de=P(S,l),te=P(l,u),o=v(t,S);let i=v(l,u)-o;i=Math.atan2(Math.sin(i),Math.cos(i));const y=Math.sqrt(N*N+te*te+2*N*te*Math.cos(i)),j=Math.atan2(te*Math.sin(i),N+te*Math.cos(i));let W=o+j-v(t,u);return W=Math.atan2(Math.sin(W),Math.cos(W)),{l1:N,l2:de,l3:te,del:i,bend:W>=0?1:-1,L:N+de+te}}function $e(t,S,l,u,v){const P=l.del+u,N=Math.sqrt(l.l1*l.l1+l.l3*l.l3+2*l.l1*l.l3*Math.cos(P)),de=Math.atan2(l.l3*Math.sin(P),l.l1+l.l3*Math.cos(P)),te=S[2]-t[2],o=S[1]-t[1],p=Math.hypot(te,o),i=it(p,Math.abs(N-l.l2)+.03*l.L,N+l.l2-.004*l.L),y=Math.atan2(o,te),j=Math.acos(it((N*N+i*i-l.l2*l.l2)/(2*N*i),-1,1)),W=y+l.bend*j,h=W-de,n=h+P,d=[Re(t[0],S[0],.3),t[1]+l.l1*Math.sin(h),t[2]+l.l1*Math.cos(h)],M=[Re(t[0],S[0],.7),d[1]+i*Math.sin(y)-N*Math.sin(W),d[2]+i*Math.cos(y)-N*Math.cos(W)];return v.k1=d,v.k2=M,v.k3=[S[0],M[1]+l.l3*Math.sin(n),M[2]+l.l3*Math.cos(n)],v}const nt=["my","mz","aC","aH","nA","nB","hA","hY","hR","eB","eO","eL","eR","t0","t1","t2","y0","y1","y2","nY"],Ke=()=>{const t={lg:new Float64Array(20)};for(const S of nt)t[S]=0;return t},Fe=t=>{for(const S of nt)t[S]=0;return t.lg.fill(0),t},Ge=(t,S,l,u)=>{for(const v of nt)t[v]=S[v]+(l[v]-S[v])*u;for(let v=0;v<20;v++)t.lg[v]=S.lg[v]+(l.lg[v]-S.lg[v])*u;return t},Je={};function le(t){const S={S:t,NB:Ee,LF:je(t.SH,t.EL,t.CA,t.FF),LH:je(t.HP,t.ST,t.HK,t.HF)},l=Math.hypot(t.TOEF[1],t.TOEF[2]),u=Math.hypot(t.TOEH[1],t.TOEH[2]),v=Math.atan2(t.TOEF[1],t.TOEF[2]),P=Math.atan2(t.TOEH[1],t.TOEH[2]),N=te=>{const o=[0,t.MID[1]+te.my,t.MID[2]+te.mz],p=J(te.aC),i=ae(te.aC),y=J(te.aH),j=ae(te.aH),W=f.mad(o,p,t.HALF),h=f.mad(o,y,-t.HALF);return{M:o,fc:p,uc:i,fh:y,uh:j,Oc:W,Oh:h,inC:(n,d,M)=>[W[0]+n,W[1]+i[1]*d-p[1]*M,W[2]+i[2]*d-p[2]*M],inH:(n,d,M)=>[h[0]+n,h[1]+j[1]*d-y[1]*M,h[2]+j[2]*d-y[2]*M]}},de=(te,o,p)=>{const i=p<2,y=p&1?1:-1,j=o.lg[p*5],W=i?t.FF:t.HF,h=i?t.SH:t.HP;return[i?te.inC(y*h[0],h[1]-t.MID[1],h[2]-(t.MID[2]-t.HALF)-t.blade*j):te.inH(y*h[0],h[1]-t.MID[1],h[2]-(t.MID[2]+t.HALF)),[y*(W[0]+o.lg[p*5+2]),W[1]+o.lg[p*5+1],W[2]-j]]};return S.plant=function(te,o,p){const i=de(N(te),te,o),y=o<2?S.LF:S.LH,j=M=>$e(i[0],i[1],y,M,Je).k2[1]-p;let W=-.9,h=1.5,n=j(W),d=j(h);if(n*d>0)return Math.abs(n)<Math.abs(d)?W:h;for(let M=0;M<14;M++){const g=(W+h)/2,R=j(g);R*n>0?(W=g,n=R):h=g}return(W+h)/2},S.foot=function(te,o,p,i,y){const j=N(te),W=de(j,te,o),h=o<2,n=h?j.fc:j.fh,d=h?j.uc:j.uh,M=h?t.FF:t.HF,g=o*5,R=W[0][1]+n[1]*p-d[1]*i,Ue=W[0][2]+n[2]*p-d[2]*i;te.lg[g]+=(M[2]-Ue-te.lg[g])*y,te.lg[g+1]+=(R-M[1]-te.lg[g+1])*y},S.solve=function(te){const o={},p=new Array(Ee),i=N(te),y=i.M,j=i.fc,W=i.uc,h=i.fh,n=i.uh,d=i.Oc,M=i.Oh,g=i.inC,R=i.inH;o.M=y,o.Oc=d,o.Oh=M,p[Be.chest]=Wt.fromBasis([1,0,0],W,f.mul(j,-1),d),p[Be.hips]=Wt.fromBasis([1,0,0],n,f.mul(h,-1),M);{const tt=(te.aC+te.aH)/2;p[Be.spine]=Wt.fromBasis([1,0,0],ae(tt),f.mul(J(tt),-1),y)}o.legs=[];for(let tt=0;tt<4;tt++){const Oe=tt<2,ze=te.lg[tt*5+3],pt=te.lg[tt*5+4],ut=Be.leg+tt*4,xt=de(i,te,tt),lt=xt[0],Tt=xt[1],Et=$e(lt,Tt,Oe?S.LF:S.LH,pt,Je),Ut=[1,0,0];p[ut]=m(lt,f.sub(Et.k1,lt),Ut),p[ut+1]=m(Et.k1,f.sub(Et.k2,Et.k1),Ut),p[ut+2]=m(Et.k2,f.sub(Et.k3,Et.k2),Ut);const Xt=(Oe?v:P)+ze*1.05,_t=Oe?l:u,m0=[Et.k3[0],Et.k3[1]+_t*Math.sin(Xt),Et.k3[2]+_t*Math.cos(Xt)];p[ut+3]=m(Et.k3,f.sub(m0,Et.k3),Ut),o.legs.push([lt,Et.k1.slice(),Et.k2.slice(),Et.k3.slice(),m0])}const Ue=t.neck,$=Ue.a1+te.nA-te.aC*Ue.steady,ve=Ue.a2+te.nB-te.aC*Ue.steady,xe=te.hY+te.nY,De=g(Ue.base[0],Ue.base[1],Ue.base[2]),Te=f.mad(De,X(J($+te.aC),xe*.2),Ue.l1),Me=f.mad(Te,X(J(ve+te.aC),xe*.5),Ue.l2);o.NB=De,o.NM=Te,o.HB=Me,p[Be.neck1]=m(De,f.sub(Te,De),[1,0,0]),p[Be.neck2]=m(Te,f.sub(Me,Te),[1,0,0]);const rt=t.headA+te.hA,wt=J(rt),Ze=ae(rt),ct=Math.cos(xe),Mt=Math.sin(xe),ft=Math.cos(te.hR),dt=Math.sin(te.hR),gt=[Mt,wt[1]*ct,wt[2]*ct],bt=[ct,-wt[1]*Mt,-wt[2]*Mt],Xe={X:[bt[0]*ft+Ze[0]*dt,bt[1]*ft+Ze[1]*dt,bt[2]*ft+Ze[2]*dt],Y:[Ze[0]*ft-bt[0]*dt,Ze[1]*ft-bt[1]*dt,Ze[2]*ft-bt[2]*dt],Z:f.mul(gt,-1)};o.hb=Xe,p[Be.head]=Wt.fromBasis(Xe.X,Xe.Y,Xe.Z,Me);const et=(tt,Oe,ze)=>[Me[0]+Xe.X[0]*tt+Xe.Y[0]*Oe+Xe.Z[0]*ze,Me[1]+Xe.X[1]*tt+Xe.Y[1]*Oe+Xe.Z[1]*ze,Me[2]+Xe.X[2]*tt+Xe.Y[2]*Oe+Xe.Z[2]*ze];o.inHd=et;for(const tt of[-1,1]){const Oe=t.ear,ze=et(tt*Oe.base[0],Oe.base[1],Oe.base[2]),pt=Oe.back+te.eB+(tt<0?te.eL:te.eR),ut=Oe.out+te.eO,xt=[tt*Math.sin(ut),Math.cos(ut)*Math.cos(pt),Math.cos(ut)*Math.sin(pt)],lt=[Xe.X[0]*xt[0]+Xe.Y[0]*xt[1]+Xe.Z[0]*xt[2],Xe.X[1]*xt[0]+Xe.Y[1]*xt[1]+Xe.Z[1]*xt[2],Xe.X[2]*xt[0]+Xe.Y[2]*xt[1]+Xe.Z[2]*xt[2]],Tt=Oe.twist||0,Et=Math.cos(Tt),Ut=tt*Math.sin(Tt);o[tt<0?"earL":"earR"]=[ze,lt],p[tt<0?Be.earL:Be.earR]=m(ze,lt,[Xe.X[0]*Et+Xe.Z[0]*Ut,Xe.X[1]*Et+Xe.Z[1]*Ut,Xe.X[2]*Et+Xe.Z[2]*Ut])}{const tt=t.tail;let Oe=R(tt.base[0],tt.base[1],tt.base[2]);o.tail=[Oe];for(let ze=0;ze<3;ze++){const pt=tt.a[ze]+te["t"+ze]-te.aH*tt.follow,ut=te["y"+ze],xt=[Math.sin(ut)*Math.cos(pt),Math.sin(pt),Math.cos(pt)*Math.cos(ut)];p[Be.tail+ze]=m(Oe,xt,[1,0,0]),Oe=f.mad(Oe,xt,tt.l[ze]),o.tail.push(Oe)}}return{J:o,F:p,inC:g,inH:R}},S}function Pe(t,S,l,u,v,P,N,de){const te=((t-S)%1+1)%1,o=Math.min(l,v/Math.max(P*N,.001));return te<o?(de.f=u-P*N*te,de.u=0,de.s=-1,de):(de.s=(te-o)/(1-o),de.f0=u-P*N*o,de)}const pe={f:0,u:0,s:0,f0:0};function c(t,S,l,u,v,P){Fe(P);const N=It*S,de=It*(S-t.gather),te=Math.cos(de+.4*Math.sin(de)),o=v*t.flex*(te*.5+.5*t.flexBias+.5*te*(1-t.flexBias)),p=v*(t.pit*Math.sin(It*(S-t.pitAt))+t.pit0);P.aC=p-t.flexC*o,P.aH=p+t.flexH*o,P.my=v*(-t.bob*Math.sin(N+t.bobAt)+t.arch*Math.max(te,0)+t.my0),P.mz=v*t.surge*Math.sin(N+1);for(let i=0;i<4;i++){const y=i<2,j=i&1?.5:-.5,W=i*5;if(y){const h=Pe(S,t.fOn+j*t.sF,t.fDur,t.fLand,t.fSweep,l,u,pe);if(h.s<0){P.lg[W]=h.f*v;continue}const n=h.s,d=t.fLand+t.fOver;P.lg[W]=v*(Re(h.f0,d,C(.38,.9,n))-t.fOver*C(.88,1,n)-t.fBack*ke(n/.34)),P.lg[W+1]=v*(t.fLift*C(0,.22,n)*(1-C(.62,1,n))+.12*t.fLift*ke(n)),P.lg[W+3]=v*C(0,.14,n)*(1-C(.74,.98,n))}else{const h=Pe(S,t.hOn+j*t.sH,t.hDur,t.hLand,t.hSweep,l,u,pe);if(h.s<0){P.lg[W]=h.f*v,P.lg[W+2]=v*t.splay;continue}const n=h.s;P.lg[W]=v*Re(h.f0-t.hBack*ke(n/.45),t.hLand,C(.42,.97,n)),P.lg[W+1]=v*(t.hTrail*Math.pow(ke(n*.9+.02),1.2)*(1-.45*C(.5,.95,n))+t.hLift*ke((n-.45)/.55)),P.lg[W+2]=v*t.splay*C(.35,.9,n),P.lg[W+3]=v*C(0,.16,n)*(1-C(.72,.98,n))}}return P.nA=v*(t.neck+t.neckSw*Math.sin(N-1.9)),P.nB=P.nA*.6,P.hA=v*(t.head+.04*Math.sin(N-.6))-P.aC*t.headLevel,P.eB=v*(t.ear+t.earSw*Math.sin(N-2.4)),P.eO=v*t.earOut,P.t0=v*(t.tail+t.tailSw*Math.sin(N-2)),P.t1=v*(t.tail1+t.tailSw*1.3*Math.sin(N-2.7)),P.t2=v*(t.tail1+t.tailSw*1.6*Math.sin(N-3.4)),P}function Ie(t,S,l,u,v,P){Fe(P);const N=It*S;for(let de=0;de<4;de++){const te=de<2,o=((S-(te?0:.5+t.lag)-(de&1?.5:0))%1+1)%1,p=de*5,i=Math.min(l*u*t.duty,te?t.fMax:t.hMax),y=te?t.fMid:t.hMid;if(o<t.duty)P.lg[p]=v*(y+i*(.5-o/t.duty));else{const j=(o-t.duty)/(1-t.duty),W=j*j*(3-2*j),h=Math.sin(h0*j);P.lg[p]=v*(y+i*(W-.5)),P.lg[p+1]=v*(te?t.fLift:t.hLift)*h*(.55+.45*h),P.lg[p+3]=v*.8*Math.sin(h0*Math.min(1,j*1.35))}}return P.my=v*(t.my0-t.bob*Math.cos(2*N+t.bobAt)),P.aC=v*(t.pit0+t.pit*Math.sin(2*N)),P.aH=v*(t.pit0-t.pit*Math.sin(2*N)),P.nA=v*(t.neck+t.nod*Math.sin(2*N-.8)),P.nB=P.nA*.7,P.hA=v*t.head-P.nA*.5,P.t0=v*(t.tail+.04*Math.sin(2*N-1)),P.t1=v*(t.tail1+.06*Math.sin(2*N-1.8)),P.t2=v*(t.tail2+.08*Math.sin(2*N-2.6)),P.y0=v*t.wag*Math.sin(N-.5),P.y1=v*t.wag*1.7*Math.sin(N-1.2),P.y2=v*t.wag*2.4*Math.sin(N-1.9),P.eB=v*t.ear,P}function he(t,S,l,u){const v=t.nv,P=new Float32Array(v*4),N=[0,0,1];for(let de=0;de<v;de++){const te=t.verts[de*10],o=t.verts[de*10+1],p=t.verts[de*10+2];let i=-1,y=-1,j=1e9,W=1e9,h=1,n=1,d=1;if(u&&u(te,o,p,N))i=N[0],y=N[1],h=N[2];else{for(const M of S){if(M.side&&M.side*te<-M.r*.15)continue;const g=_(te,o,p,M.a,M.b,M.r,M.r2==null?M.r:M.r2);if(M.i===i){g<j&&(j=g);continue}if(M.i===y){if(g<W&&(W=g,W<j)){let R=j;j=W,W=R,R=i,i=y,y=R,R=n,n=d,d=R}continue}g<j?(W=j,y=i,d=n,j=g,i=M.i,n=M.k||1):g<W&&(W=g,y=M.i,d=M.k||1)}y<0&&(y=i,W=j),h=1/(1+Math.exp(-(W-j)/(l*Math.max(n,d))))}P[de*4]=i,P[de*4+1]=y,P[de*4+2]=h}return P}const H=(t,S,l,u,v)=>(P,N,de,te)=>{const o=P<0?t[0]:t[1],p=re(P,N,de,o.o,o.X,o.Y,o.Z);return p[1]<v*.25||p[1]>S*1.25||Math.abs(p[0])>l||Math.abs(p[2])>u?!1:(te[0]=P<0?Be.earL:Be.earR,te[1]=Be.head,te[2]=ge(v*.25,v*1.4,p[1]),!0)},z=(t,S,l)=>(u,v,P,N,de,te,o)=>{o[0]=0,o[1]=mt(.3+.7*(.55*mt(t(u+N*S,v+de*S,P+te*S)/S)+.45*mt(t(u+N*l,v+de*l,P+te*l)/l))),o[2]=0,o[3]=0};function V(t){let S=0,l=0;for(const o of t)S+=o.nv,l+=o.ni;const u=new Float32Array(S*10),v=new Float32Array(S*4),P=new Float32Array(S*4),N=new Uint32Array(l);let de=0,te=0;for(const o of t){u.set(o.verts.subarray(0,o.nv*10),de*10),v.set(o.bw,de*4),P.set(o.col,de*4);for(let p=0;p<o.ni;p++)N[te+p]=o.idx[p]+de;de+=o.nv,te+=o.ni}return{V:u,W:v,C:P,I:N,nv:S,ni:l}}function I(t,S,l,u,v,P){const N=new Float32Array(t*S*3),de=[0,0,0],te=new Float32Array(t*S*10),o=[];for(let i=0;i<t;i++)for(let y=0;y<S;y++)l(i/(t-1),u?y/S:y/(S-1),de),N.set(de,(i*S+y)*3);const p=(i,y)=>(it(i,0,t-1)*S+(u?(y+S)%S:it(y,0,S-1)))*3;for(let i=0;i<t;i++)for(let y=0;y<S;y++){const j=p(i+1,y),W=p(i-1,y),h=p(i,y+1),n=p(i,y-1),d=(i*S+y)*10,M=(i*S+y)*3;let g=f.cross([N[j]-N[W],N[j+1]-N[W+1],N[j+2]-N[W+2]],[N[h]-N[n],N[h+1]-N[n+1],N[h+2]-N[n+2]]);g=f.len(g)>1e-12?f.norm(g):[0,1,0],v&&(g=f.mul(g,-1)),te[d]=N[M],te[d+1]=N[M+1],te[d+2]=N[M+2],te[d+3]=g[0],te[d+4]=g[1],te[d+5]=g[2],te[d+6]=P,te[d+7]=1,te[d+8]=i/(t-1),te[d+9]=u?y/S:y/(S-1)}for(let i=0;i<t-1;i++)for(let y=0;y<(u?S:S-1);y++){const j=i*S+y,W=i*S+(y+1)%S,h=(i+1)*S+(y+1)%S,n=(i+1)*S+y;v?o.push(j,W,h,j,h,n):o.push(j,n,h,j,h,W)}return{verts:te,idx:new Uint32Array(o),nv:t*S,ni:o.length}}const Q=(t,S)=>{const l=new Float32Array(t.nv*4);for(let u=0;u<t.nv;u++)l[u*4]=S,l[u*4+1]=S,l[u*4+2]=1;return l},L=(t,S)=>{const l=new Float32Array(t.nv*4),u=[0,0,0,1];for(let v=0;v<t.nv;v++){const P=v*10;u[3]=1,S(t.verts[P],t.verts[P+1],t.verts[P+2],t.verts[P+3],t.verts[P+4],t.verts[P+5],u,t.verts,P),l[v*4]=u[0],l[v*4+1]=u[1],l[v*4+2]=u[2],l[v*4+3]=u[3]}return l},ye=(()=>{const t={MID:[0,.222,.012],HALF:.128,blade:.1,SH:[.04,.196,-.128],EL:[.043,.128,-.088],CA:[.039,.042,-.118],FF:[.039,.013,-.128],TOEF:[0,-.006,-.034],HP:[.05,.212,.142],ST:[.064,.132,.078],HK:[.058,.06,.186],HF:[.058,.013,.128],TOEH:[0,-.005,-.06],neck:{base:[0,.02,-.028],l1:.036,l2:.036,a1:.5,a2:.36,steady:.5},headA:-.24,ear:{base:[.0165,.041,-.01],back:.5,out:.22,len:.106,twist:.85},tail:{base:[0,-.012,.078],a:[-.3,-.3,-.3],l:[.036,.01,.01],follow:1}},S=le(t),l={id:"hare",Q:S,NB:Ee,scale:1.45,tex:[5,.5,.22,-9],eyeL:[.0258,.017,-.05,.0112],eyeCol:[.07,.035,.02],pupil:[.72,.72],nose:[0,-.008,-.1165,.0085],soft:.013};return l.build=function(){const u=Ke(),v=S.solve(u),P=v.J,N=P.hb,de=P.HB;l.bind=v,l.inv=v.F.map(Te=>Wt.invert(Te));{const Te=P.inHd(l.eyeL[0],l.eyeL[1],l.eyeL[2]);l.eye=[Te[0],Te[1],Te[2],l.eyeL[3]]}const te=[Be.earL,Be.earR].map(Te=>ne(v.F[Te])),o=f.mad(de,N.Z,-.05),p=P.legs,i=p.map((Te,Me)=>f.lerp(Te[3],Te[4],Me<2?.8:.85)),y=f.mad(de,N.Z,-.012),j=[0,.203,-.06],W=[0,.218,.1];function h(Te,Me,rt){const wt=Math.abs(Te);let Ze=se(Te,Me,rt,0,.19,-.09,.047,.06,.098);if(Ze=be(Ze,_(Te,Me,rt,j,W,.058,.066),.05),Ze=be(Ze,se(Te,Me,rt,0,.216,.13,.062,.078,.094),.05),Ze=be(Ze,se(wt,Me,rt,.042,.18,.118,.036,.066,.072),.035),Ze=be(Ze,se(wt,Me,rt,.032,.172,-.118,.026,.048,.042),.03),Ze=be(Ze,_(Te,Me,rt,P.NB,y,.046,.036),.04),Ze=be(Ze,_(Te,Me,rt,P.tail[0],P.tail[1],.022,.026),.022),qe(Te,Me,rt,o,.16)<Ze+.03){const Mt=re(Te,Me,rt,de,N.X,N.Y,N.Z),ft=Math.abs(Mt[0]);let dt=se(Mt[0],Mt[1],Mt[2],0,.01,-.043,.0315,.0335,.045);dt=be(dt,_(Mt[0],Mt[1],Mt[2],[0,0,-.06],[0,-.01,-.09],.0275,.0225),.03),dt=be(dt,se(ft,Mt[1],Mt[2],.016,-.01,-.052,.019,.022,.032),.018),dt=be(dt,se(ft,Mt[1],Mt[2],.0235,.017,-.05,.0095,.011,.012),.004),dt=be(dt,se(ft,Mt[1],Mt[2],.008,-.015,-.101,.011,.011,.012),.008),Ze=be(Ze,dt,.022);for(const gt of te){const bt=re(Te,Me,rt,gt.o,gt.X,gt.Y,gt.Z);let Xe=se(bt[0],bt[1],bt[2],0,.052,0,.0185,.056,.009);Xe=ht(Xe,-se(bt[0],bt[1],bt[2],0,.058,-.013,.013,.044,.0095),.006),Ze=be(Ze,Xe,.01)}}let ct=1e9;for(let Mt=0;Mt<4;Mt++){const ft=p[Mt];if(Mt<2){if(_(Te,Me,rt,ft[0],ft[4],.075,.075)>Ze+.03)continue;let dt=_(Te,Me,rt,ft[0],ft[1],.028,.022);dt=be(dt,_(Te,Me,rt,ft[1],ft[2],.021,.014),.012),dt=be(dt,_(Te,Me,rt,ft[2],ft[3],.014,.014),.006),dt=be(dt,_(Te,Me,rt,ft[3],i[Mt],.0145,.013),.006),ct=Math.min(ct,dt)}else{if(_(Te,Me,rt,ft[0],ft[4],.135,.135)>Ze+.03)continue;let dt=_(Te,Me,rt,ft[0],ft[1],.04,.031);dt=be(dt,_(Te,Me,rt,ft[1],ft[2],.03,.0145),.016),dt=be(dt,_(Te,Me,rt,ft[2],ft[3],.016,.017),.008),dt=be(dt,_(Te,Me,rt,ft[3],i[Mt],.018,.015),.008),ct=Math.min(ct,dt)}}return ct=Math.max(ct,-(Me-.0015)),be(Ze,ct,.022)}const n=performance.now(),d=qs(h,[-.125,-.006,-.4],[.125,.46,.3],.0074,{stride:2,attr:z(h,.014,.05)});l.meshMs=performance.now()-n;const M=[],g=(Te,Me,rt,wt,Ze=0,ct=1)=>M.push({i:Te,a:Me,b:rt,r:wt,side:Ze,k:ct});g(Be.hips,[0,.21,.07],[0,.215,.18],.075),g(Be.spine,[0,.2,-.04],[0,.205,.05],.068),g(Be.chest,[0,.19,-.15],[0,.195,-.07],.065),g(Be.neck1,P.NB,P.NM,.045),g(Be.neck2,P.NM,P.HB,.04),g(Be.head,P.HB,P.inHd(0,-.01,-.12),.034),g(Be.tail,P.tail[0],P.tail[1],.022);for(let Te=0;Te<4;Te++){const Me=p[Te],rt=Be.leg+Te*4,wt=Te&1?1:-1;Te<2?g(rt,f.lerp(Me[0],Me[1],.55),Me[1],.012,wt,1.8):g(rt,Me[0],Me[1],.036,wt,1.5),g(rt+1,Me[1],Me[2],Te<2?.016:.022,wt),g(rt+2,Me[2],Me[3],.013,wt),g(rt+3,Me[3],Me[4],.013,wt)}d.bw=he(d,M,l.soft,H(te,t.ear.len,.024,.016,.016));const R=[.8,.79,.765],Ue=[.55,.57,.6],$=[.66,.57,.44],ve=[.022,.02,.019],xe=[.15,.11,.075],De=[.26,.23,.2];return d.col=L(d,(Te,Me,rt,wt,Ze,ct,Mt)=>{const ft=Math.abs(Te),dt=re(Te,Me,rt,de,N.X,N.Y,N.Z);let gt=b(R,Ue,.38*C(.5,.95,Ze)*C(.05,0,ft-.03)*C(-.16,-.06,rt)*(.6+.4*es(Te*60,Me*60,rt*30,7)));gt=b(gt,Ue,.14*(.5+.5*es(Te*38,Me*38,rt*22,3))),gt=b(gt,$,.3*C(.045,0,Me)+.34*C(-.055,-.1,dt[2])*C(-.004,.02,dt[1])*C(.022,.008,Math.abs(dt[0])));{const tt=es(Te*60,Me*60,rt*36,13),Oe=es(Te*24,Me*24,rt*15,5);gt=b(gt,b(xe,De,Oe),.94*C(-.18,.34,Ze+.5*(tt-.5))*C(.112,.172,Me+.035*tt))}const bt=Te<0?te[0]:te[1],Xe=re(Te,Me,rt,bt.o,bt.X,bt.Y,bt.Z);Xe[1]>.012&&Math.hypot(Xe[0],Xe[2])<.03&&(gt=b(gt,[.5,.4,.36],.55*C(.002,-.004,Xe[2])*C(.012,.004,Math.abs(Xe[0]))*C(.01,.03,Xe[1])),gt=b(gt,b(xe,De,.4),.85*C(-.001,.004,Xe[2])*C(.004,.02,Xe[1])),gt=b(gt,ve,C(.08,.092,Xe[1]+.006*es(Te*90,Me*90,rt*90,5))));const et=C(.0105,.0075,Math.hypot(dt[0],dt[1]+.006,dt[2]+.109));gt=b(gt,[.16,.085,.075],et),Mt[0]=gt[0],Mt[1]=gt[1],Mt[2]=gt[2],Mt[3]=1-.7*et}),l.mesh=V([d]),l.mesh},l.sit=function(u,v){Fe(v),v.aH=Re(.3,.52,u),v.aC=Re(.04,1,u),v.my=Re(-.08,-.05,u),v.mz=Re(.02,.05,u);for(let P=0;P<2;P++)v.lg[P*5]=Re(.02,-.075,u),v.lg[P*5+1]=Re(0,.118,u),v.lg[P*5+3]=Re(0,.75,u),v.lg[P*5+2]=-.006*u;for(let P=2;P<4;P++)v.lg[P*5]=Re(.085,.1,u),v.lg[P*5+2]=.016;return v.lg[14]=v.lg[19]=S.plant(v,2,.017),v.nA=Re(-.42,.2,u),v.nB=Re(-.3,.25,u),v.hA=Re(.1,.06,u),v.eB=Re(1,-.3,u),v.eO=Re(-.12,.1,u),v.t0=.3,v},l.gait={gather:.22,flex:.52,flexBias:.9,flexC:.3,flexH:1,pit:.11,pitAt:.3,pit0:.02,bob:.03,bobAt:0,arch:.03,my0:-.004,surge:0,fOn:0,fDur:.17,sF:.05,fLand:.105,fSweep:.15,fOver:.03,fBack:.035,fLift:.075,hOn:.27,hDur:.22,sH:.016,hLand:.205,hSweep:.345,hBack:.05,hTrail:.15,hLift:.045,splay:.024,neck:-.3,neckSw:.05,head:.18,headLevel:.75,ear:1.05,earSw:.1,earOut:-.1,tail:.35,tail1:0,tailSw:.12},l})();e.sp.hare=ye;const Ve=(()=>{const t={MID:[0,.375,0],HALF:.17,blade:.1,SH:[.045,.335,-.175],EL:[.05,.225,-.13],CA:[.046,.085,-.16],FF:[.046,.022,-.172],TOEF:[0,-.008,-.042],HP:[.05,.345,.175],ST:[.058,.235,.12],HK:[.052,.12,.215],HF:[.052,.022,.185],TOEH:[0,-.008,-.045],neck:{base:[0,.02,-.045],l1:.075,l2:.075,a1:.75,a2:.6,steady:.5},headA:-.12,ear:{base:[.033,.042,-.014],back:.1,out:.3,len:.1,twist:.65},tail:{base:[0,-.015,.06],a:[-.62,-.4,-.14],l:[.14,.15,.14],follow:.6}},S=le(t),l={id:"fox",Q:S,NB:Ee,scale:1.25,tex:[3.4,.85,.34,-.37],eyeL:[.0318,.023,-.079,.0096],eyeCol:[.5,.24,.035],pupil:[.34,1.25],soft:.016};return l.build=function(){const u=Ke(),v=S.solve(u),P=v.J,N=P.hb,de=P.HB,te=P.legs,o=P.tail;l.bind=v,l.inv=v.F.map(ft=>Wt.invert(ft));{const ft=P.inHd(l.eyeL[0],l.eyeL[1],l.eyeL[2]);l.eye=[ft[0],ft[1],ft[2],l.eyeL[3]]}const p=[Be.earL,Be.earR].map(ft=>ne(v.F[ft])),i=f.mad(de,N.Z,-.07),y=f.lerp(o[0],o[3],.5),j=f.mad(de,N.Z,-.015),W=(ft,dt,gt)=>Math.min(_(ft,dt,gt,o[0],o[1],.036,.072),_(ft,dt,gt,o[1],o[2],.072,.08),_(ft,dt,gt,o[2],o[3],.08,.026)),h=te.map(ft=>f.lerp(ft[3],ft[4],.8)),n=[0,.348,-.08],d=[0,.352,.12],M=[0,-.002,-.078],g=[0,-.016,-.156],R=[0,-.0125,-.164];function Ue(ft,dt,gt){const bt=Math.abs(ft);let Xe=se(ft,dt,gt,0,.328,-.14,.06,.086,.13);if(Xe=be(Xe,_(ft,dt,gt,n,d,.066,.058),.06),Xe=be(Xe,se(ft,dt,gt,0,.338,.165,.064,.078,.098),.05),Xe=be(Xe,se(bt,dt,gt,.05,.285,.15,.034,.085,.074),.035),Xe=be(Xe,se(bt,dt,gt,.044,.3,-.165,.03,.072,.056),.03),Xe=be(Xe,_(ft,dt,gt,P.NB,j,.074,.058),.05),qe(ft,dt,gt,y,.33)<Xe+.03){let tt=W(ft,dt,gt);tt<.03&&(tt-=.006*es(ft*42,dt*42,gt*26,11)),Xe=be(Xe,tt,.035)}if(qe(ft,dt,gt,i,.21)<Xe+.03){const tt=re(ft,dt,gt,de,N.X,N.Y,N.Z),Oe=Math.abs(tt[0]);let ze=se(tt[0],tt[1],tt[2],0,.014,-.048,.049,.044,.058);ze=be(ze,_(tt[0],tt[1],tt[2],M,g,.029,.014),.03),ze=be(ze,se(Oe,tt[1],tt[2],.04,-.014,-.03,.03,.03,.038),.022),ze=be(ze,se(Oe,tt[1],tt[2],.0296,.023,-.078,.009,.009,.0108),.004),ze=be(ze,qe(tt[0],tt[1],tt[2],R,.0115),.006),Xe=be(Xe,ze,.03);for(const pt of p){const ut=re(ft,dt,gt,pt.o,pt.X,pt.Y,pt.Z),xt=.033*(1-.84*mt(ut[1]/.102));Xe=be(Xe,Math.max(Math.abs(ut[2]+.006*(1-Math.abs(ut[0])/.033))-.0042,Math.abs(ut[0])-xt,-ut[1]-.012,ut[1]-.102)-.0036,.012)}}let et=1e9;for(let tt=0;tt<4;tt++){const Oe=te[tt];if(_(ft,dt,gt,Oe[0],Oe[4],tt<2?.1:.16,tt<2?.1:.16)>Xe+.04)continue;let ze;tt<2?(ze=_(ft,dt,gt,Oe[0],Oe[1],.038,.029),ze=be(ze,_(ft,dt,gt,Oe[1],Oe[2],.027,.0175),.014),ze=be(ze,_(ft,dt,gt,Oe[2],Oe[3],.0175,.0165),.008),ze=be(ze,_(ft,dt,gt,Oe[3],h[tt],.019,.016),.008)):(ze=_(ft,dt,gt,Oe[0],Oe[1],.052,.037),ze=be(ze,_(ft,dt,gt,Oe[1],Oe[2],.035,.0185),.018),ze=be(ze,_(ft,dt,gt,Oe[2],Oe[3],.0185,.0165),.008),ze=be(ze,_(ft,dt,gt,Oe[3],h[tt],.019,.016),.008)),et=Math.min(et,ze)}return et=Math.max(et,-(dt-.002)),be(Xe,et,.028)}const $=performance.now(),ve=qs(Ue,[-.15,-.006,-.52],[.15,.66,.74],.0096,{stride:2,attr:z(Ue,.02,.07)});l.meshMs=performance.now()-$;const xe=[],De=(ft,dt,gt,bt,Xe=0,et=1)=>xe.push({i:ft,a:dt,b:gt,r:bt,side:Xe,k:et});De(Be.hips,[0,.34,.1],[0,.34,.22],.072),De(Be.spine,[0,.345,-.05],[0,.348,.06],.066),De(Be.chest,[0,.33,-.21],[0,.335,-.09],.07),De(Be.neck1,P.NB,P.NM,.058),De(Be.neck2,P.NM,P.HB,.05),De(Be.head,P.HB,P.inHd(0,-.012,-.16),.046);for(let ft=0;ft<3;ft++)De(Be.tail+ft,o[ft],o[ft+1],[.05,.068,.05][ft],0,1.6);for(let ft=0;ft<4;ft++){const dt=te[ft],gt=Be.leg+ft*4,bt=ft&1?1:-1;ft<2?De(gt,f.lerp(dt[0],dt[1],.45),dt[1],.018,bt,1.8):De(gt,f.lerp(dt[0],dt[1],.25),dt[1],.036,bt,1.6),De(gt+1,dt[1],dt[2],ft<2?.022:.026,bt),De(gt+2,dt[2],dt[3],.017,bt),De(gt+3,dt[3],dt[4],.017,bt)}ve.bw=he(ve,xe,l.soft,H(p,t.ear.len,.037,.016,.018));const Te=[.56,.205,.045],Me=[.3,.075,.018],rt=[.62,.33,.12],wt=[.8,.78,.74],Ze=[.6,.57,.52],ct=[.028,.022,.02],Mt=f.len(f.sub(o[3],o[0]));return ve.col=L(ve,(ft,dt,gt,bt,Xe,et,tt)=>{const Oe=Math.abs(ft),ze=re(ft,dt,gt,de,N.X,N.Y,N.Z),pt=Math.abs(ze[0]),ut=es(ft*36,dt*36,gt*22,3),xt=es(ft*80,dt*80,gt*50,9);let lt=b(Te,rt,C(.34,.24,dt)*.7+.25*ut),Tt=1;if(lt=b(lt,Me,mt(C(.25,.9,Xe)*C(.062,.018,Oe)*C(-.36,-.22,gt)*.85+.1*xt)),lt=b(lt,Ze,C(-.1,-.65,Xe)*C(.2,.25,dt)*C(.31,.27,dt)),lt=b(lt,wt,C(-.105,-.165,gt+.02*ut)*C(.5,.44,dt)*C(.05,.55,-et*.55-Xe*.85)*C(.19,.23,dt)),lt=b(lt,ct,C(.215,.15,dt+.025*ut+(gt>0?.025:0))*C(.245,.235,dt)),W(ft,dt,gt)<.02&&gt>o[0][2]-.02){const Ut=mt(f.dot(f.sub([ft,dt,gt],o[0]),f.norm(f.sub(o[3],o[0])))/Mt);lt=b(b(Te,Me,.35+.3*ut),ct,.42*C(.25,.8,Ut)*(.5+.5*xt)+.25*C(.2,.9,Xe)),lt=b(lt,wt,C(.8,.87,Ut+.035*ut))}if(qe(ft,dt,gt,i,.16)<0){lt=b(lt,wt,C(0,-.012,ze[1]+.006*xt)*C(-.012,-.045,ze[2])*(1-C(.05,.075,dt-de[1]+.2))),lt=b(lt,wt,.9*C(-.004,-.014,ze[1])*C(-.055,-.085,ze[2])),lt=b(lt,Me,.6*C(.012,.005,Math.hypot(pt-.021,ze[1]-.008))*C(-.082,-.098,ze[2])*C(-.15,-.125,ze[2]));const Ut=C(.0135,.0105,Math.hypot(ze[0],ze[1]+.0125,ze[2]+.164));lt=b(lt,[.012,.01,.01],Ut),Tt=1-.85*Ut;const Xt=ft<0?p[0]:p[1],_t=re(ft,dt,gt,Xt.o,Xt.X,Xt.Y,Xt.Z);_t[1]>.004&&Math.abs(_t[0])<.039&&Math.abs(_t[2])<.018&&(lt=b(lt,ct,C(.018,.04,_t[1]+.008*ut)*C(-.002,.003,_t[2])),lt=b(lt,[.7,.62,.52],C(.001,-.003,_t[2])*C(.006,.02,_t[1])*.9))}tt[0]=lt[0],tt[1]=lt[1],tt[2]=lt[2],tt[3]=Tt}),l.mesh=V([ve]),l.mesh},l.walk={duty:.63,lag:.25,fMax:.32,hMax:.32,fMid:.008,hMid:0,fLift:.04,hLift:.034,my0:-.004,bob:.004,bobAt:.6,pit0:0,pit:.008,neck:-.24,nod:.035,head:-.1,tail:-.22,tail1:-.08,tail2:.08,wag:.05,ear:0,v:1.1,f:1.8},l.jog={duty:.48,lag:0,fMax:.33,hMax:.33,fMid:.005,hMid:0,fLift:.055,hLift:.045,my0:-.006,bob:.007,bobAt:.6,pit0:0,pit:.012,neck:-.2,nod:.03,head:-.12,tail:.18,tail1:.1,tail2:.04,wag:.035,ear:0,v:2.8,f:3.2},l.gait={gather:.2,flex:.4,flexBias:.75,flexC:.35,flexH:.9,pit:.07,pitAt:.28,pit0:0,bob:.035,bobAt:0,arch:.03,my0:-.015,surge:0,fOn:0,fDur:.24,sF:.11,fLand:.21,fSweep:.34,fOver:.04,fBack:.05,fLift:.11,hOn:.36,hDur:.26,sH:.09,hLand:.2,hSweep:.38,hBack:.06,hTrail:.13,hLift:.05,splay:.012,neck:-.26,neckSw:.05,head:.05,headLevel:.6,ear:.55,earSw:.06,earOut:0,tail:.62,tail1:.4,tailSw:.1},l.look=function(u,v,P,N){if(Fe(N),N.nA=Re(-.1,.22,v),N.nB=Re(-.06,.2,v),N.hA=Re(-.05,.1,v),N.hY=u,N.eB=-.08-.1*v,N.eO=-.06*v,N.my=.004*v,N.aC=.03*v,N.t0=Re(-.16,.08,v),N.t1=-.06*(1-v),N.t2=.06*(1-v),N.lg[0]=.02,N.lg[5]=-.03,N.lg[10]=-.02,N.lg[15]=.03,P){const de=P>0?5:0,te=Math.abs(P);N.lg[de]+=.04*te,N.lg[de+1]=.1*te,N.lg[de+3]=.8*te}return N},l.anim=function(u,v){return v.anim==="stand"?Fe(u):v.anim==="walk"?Ie(l.walk,v.ph||0,l.walk.v/l.scale,1/l.walk.f,1,u):v.anim==="trot"?Ie(l.jog,v.ph||0,l.jog.v/l.scale,1/l.jog.f,1,u):v.anim==="look"?l.look(v.look==null?.7:v.look,v.up||0,v.paw||0,u):v.anim==="alert"?l.look(v.look==null?.9:v.look,1,v.paw||0,u):c(l.gait,v.ph||0,v.v==null?9:v.v,1/(v.freq||2.9),1,u)},l})();e.sp.fox=Ve;const Ne=(()=>{const t={MID:[0,.86,.02],HALF:.34,blade:.12,SH:[.105,.74,-.36],EL:[.11,.52,-.29],CA:[.105,.25,-.32],FF:[.105,.045,-.335],TOEF:[0,-.02,-.06],HP:[.105,.78,.36],ST:[.12,.55,.25],HK:[.11,.31,.43],HF:[.11,.045,.37],TOEH:[0,-.02,-.06],neck:{base:[0,.06,-.07],l1:.17,l2:.16,a1:.95,a2:.8,steady:.5},headA:-.38,ear:{base:[.072,.058,.03],back:1.05,out:1,len:.145,twist:.2},tail:{base:[0,.03,.1],a:[.25,.05,0],l:[.07,.04,.03],follow:.5}},S=le(t),l={id:"ibex",Q:S,NB:Ee,scale:1,tex:[1.5,1,.36,-9],eyeL:[.059,.024,-.105,.0135],eyeCol:[.55,.4,.12],pupil:[1.7,.42],soft:.035,hs:1.2};return l.build=function(){const u=Ke(),v=S.solve(u),P=v.J,N=P.hb,de=P.HB,te=P.legs,o=P.tail,p=l.hs;l.bind=v,l.inv=v.F.map(Xe=>Wt.invert(Xe));{const Xe=P.inHd(l.eyeL[0]*p,l.eyeL[1]*p,l.eyeL[2]*p);l.eye=[Xe[0],Xe[1],Xe[2],l.eyeL[3]*p]}const i=[Be.earL,Be.earR].map(Xe=>ne(v.F[Xe])),y=P.inHd(0,-.07,-.14),j=f.mad(de,N.Z,-.03),W=te.map(Xe=>f.lerp(Xe[3],Xe[4],.7)),h=[0,.772,-.1],n=[0,.772,.22],d=[0,.66,-.5],M=f.mad(de,[0,-1,.3],.1),g=[0,-.022,-.13],R=[0,-.06,-.245],Ue=[0,-.098,-.196],$=[0,-.205,-.174];function ve(Xe,et,tt){const Oe=Math.abs(Xe);let ze=se(Xe,et,tt,0,.722,-.22,.186,.252,.3);if(ze=be(ze,_(Xe,et,tt,h,n,.208,.188),.1),ze=be(ze,se(Xe,et,tt,0,.752,.33,.176,.218,.215),.08),ze=be(ze,se(Xe,et,tt,0,.935,-.25,.06,.065,.17),.08),ze=be(ze,se(Oe,et,tt,.108,.63,.325,.076,.2,.15),.06),ze=be(ze,se(Oe,et,tt,.108,.68,-.335,.07,.18,.12),.05),ze=be(ze,_(Xe,et,tt,P.NB,j,.16,.112),.09),ze=be(ze,_(Xe,et,tt,d,M,.088,.06),.06),ze=be(ze,_(Xe,et,tt,o[0],o[2],.036,.022),.03),qe(Xe,et,tt,y,.37)<ze+.05){const ut=re(Xe,et,tt,de,N.X,N.Y,N.Z);ut[0]/=p,ut[1]/=p,ut[2]/=p;const xt=Math.abs(ut[0]);let lt=se(ut[0],ut[1],ut[2],0,0,-.07,.066,.078,.1);lt=be(lt,_(ut[0],ut[1],ut[2],g,R,.054,.037),.05),lt=be(lt,se(ut[0],ut[1],ut[2],0,.058,-.06,.05,.035,.06),.03),lt=be(lt,se(xt,ut[1],ut[2],.055,.024,-.104,.0125,.0125,.015),.006),lt=be(lt,_(ut[0],ut[1],ut[2],Ue,$,.033,.019),.025),ze=be(ze,lt*p,.05);for(const Tt of i){const Et=re(Xe,et,tt,Tt.o,Tt.X,Tt.Y,Tt.Z);ze=be(ze,se(Et[0],Et[1],Et[2],0,.07,0,.034,.078,.018),.02)}}let pt=1e9;for(let ut=0;ut<4;ut++){const xt=te[ut];if(_(Xe,et,tt,xt[0],xt[4],ut<2?.17:.24,ut<2?.17:.24)>ze+.06)continue;let lt;ut<2?(lt=_(Xe,et,tt,xt[0],xt[1],.09,.064),lt=be(lt,_(Xe,et,tt,xt[1],xt[2],.058,.038),.03),lt=be(lt,qe(Xe,et,tt,xt[2],.043),.02),lt=be(lt,_(Xe,et,tt,xt[2],xt[3],.035,.033),.015)):(lt=_(Xe,et,tt,xt[0],xt[1],.115,.078),lt=be(lt,_(Xe,et,tt,xt[1],xt[2],.072,.04),.04),lt=be(lt,qe(Xe,et,tt,xt[2],.045),.02),lt=be(lt,_(Xe,et,tt,xt[2],xt[3],.036,.033),.015)),lt=be(lt,_(Xe,et,tt,xt[3],W[ut],.043,.038),.015),pt=Math.min(pt,lt)}return pt=Math.max(pt,-(et-.004)),be(ze,pt,.05)}const xe=performance.now(),De=qs(ve,[-.33,-.012,-.98],[.33,1.34,.72],.0205,{stride:2,attr:z(ve,.04,.14)});l.meshMs=performance.now()-xe;const Te=[],Me=(Xe,et,tt,Oe,ze=0,pt=1)=>Te.push({i:Xe,a:et,b:tt,r:Oe,side:ze,k:pt});Me(Be.hips,[0,.78,.22],[0,.78,.46],.19),Me(Be.spine,[0,.79,-.1],[0,.79,.12],.19),Me(Be.chest,[0,.75,-.44],[0,.76,-.2],.2),Me(Be.neck1,P.NB,P.NM,.13),Me(Be.neck2,P.NM,P.HB,.1),Me(Be.head,P.HB,P.inHd(0,-.07,-.31),.085),Me(Be.tail,o[0],o[2],.03);for(let Xe=0;Xe<4;Xe++){const et=te[Xe],tt=Be.leg+Xe*4,Oe=Xe&1?1:-1;Xe<2?Me(tt,f.lerp(et[0],et[1],.5),et[1],.04,Oe,1.6):Me(tt,f.lerp(et[0],et[1],.3),et[1],.075,Oe,1.4),Me(tt+1,et[1],et[2],.05,Oe),Me(tt+2,et[2],et[3],.035,Oe),Me(tt+3,et[3],et[4],.04,Oe)}const rt=H(i,t.ear.len,.042,.026,.03),wt=(Xe,et,tt,Oe)=>{const ze=re(Xe,et,tt,de,N.X,N.Y,N.Z);return ze[0]/=p,ze[1]/=p,ze[2]/=p,ze[1]<-.082&&_(ze[0],ze[1],ze[2],Ue,$,.033,.019)<.014?(Oe[0]=Be.head,Oe[1]=Be.head,Oe[2]=1,!0):rt(Xe,et,tt,Oe)};De.bw=he(De,Te,l.soft,wt);const Ze=[.128,.09,.06],ct=[.36,.31,.235],Mt=[.034,.025,.019],ft=[.33,.29,.23],dt=[.02,.017,.015],gt=[.03,.026,.024];De.col=L(De,(Xe,et,tt,Oe,ze,pt,ut)=>{const xt=Math.abs(Xe),lt=re(Xe,et,tt,de,N.X,N.Y,N.Z),Tt=es(Xe*14,et*14,tt*9,3),Et=es(Xe*40,et*40,tt*26,9);lt[0]/=p,lt[1]/=p,lt[2]/=p;let Ut=b(Ze,ct,.04+.16*Tt),Xt=1;if(Ut=b(Ut,ct,.85*C(.76,.93,et+.04*Tt)*C(-.18,-.03,tt)*C(.32,.12,tt)*C(.015,.06,xt)),Ut=b(Ut,Mt,.85*C(.4,.95,ze)*C(.06,.012,xt+.012*Et)*C(-.72,-.5,tt)),Ut=b(Ut,Mt,.8*C(.8,.58,et+.05*Tt)*C(-.14,-.3,tt)*C(.5,.58,et)),Ut=b(Ut,Mt,.7*C(.07,.02,_(Xe,et,tt,d,M,.088,.06))*C(-.4,-.5,tt)),Ut=b(Ut,Mt,.7*C(.66,.56,et+.04*Tt)*C(-.1,.02,tt)*C(.24,.1,tt)*C(.1,.16,xt)*C(.5,.56,et)),Ut=b(Ut,ft,C(-.2,-.7,ze)*C(.5,.58,et)*C(.66,.6,et)*C(-.32,-.2,tt)),et<.52){const _t=tt<0?C(.1,-.5,pt):C(.3,-.4,pt);Ut=b(b(ft,Ze,.5),Mt,.4+.6*_t),Ut=b(Ut,gt,C(.085,.065,et)),et<.075&&(Xt=.35)}if(Ut=b(Ut,ft,.8*C(.3,.44,tt)*C(.66,.74,et)*C(.92,.84,et)*C(.3,.8,pt)),qe(Xe,et,tt,y,.36)<0){Ut=b(Ut,ct,.5*C(.02,.05,Math.abs(lt[0]))*C(-.04,-.1,lt[2])*C(-.1,-.05,lt[1])),Ut=b(Ut,Mt,.75*C(.035,.012,Math.abs(lt[0])+.01*Et)*C(-.07,-.11,lt[2])*C(-.2,.4,-lt[1]*6+ze)),Ut=b(Ut,ft,.55*C(-.2,-.235,lt[2])*C(-.02,-.05,lt[1])),Ut=b(Ut,dt,C(-.088,-.112,lt[1])*C(-.11,-.15,lt[2])*C(-.25,-.215,lt[2])*C(.05,.03,Math.abs(lt[0])));const _t=C(.036,.026,Math.hypot(lt[0]*.8,lt[1]+.045,lt[2]+.275));Ut=b(Ut,[.03,.025,.025],_t),Xt*=1-.8*_t}Ut=b(Ut,dt,C(.05,.02,Math.min(_(Xe,et,tt,o[0],o[2],.036,.022),1))*C(.38,.44,tt)),ut[0]=Ut[0],ut[1]=Ut[1],ut[2]=Ut[2],ut[3]=Xt});const bt=[-1,1].map(Xe=>{const ze=[Xe*.034*p,.066*p,-.052*p],pt=I(72,10,(ut,xt,lt)=>{const Tt=-.12+2.25*ut,Et=Math.cos(Tt),Ut=Math.sin(Tt),Xt=It*xt,_t=Re(.041,.006,Math.pow(ut,.85))*(ut<.03?.6+ut*13.3:1),m0=Math.pow(.5+.5*Math.cos(It*20*ut),3)*C(.02,.08,ut)*C(.98,.8,ut),r0=Math.cos(Xt),Ft=Math.sin(Xt),Lt=_t*1.28*(1+.22*m0*Math.max(0,r0)),yt=_t*.86*(1+.1*m0*Math.max(0,r0)),Rt=ze[0]+Xe*.19*Math.pow(ut,1.4)+Ft*yt,Vt=ze[1]+.42*(Ut-Math.sin(-.12))+Lt*r0*Ut,Kt=ze[2]+.42*(Math.cos(-.12)-Et)-Lt*r0*Et,jt=P.inHd(Rt,Vt,Kt);lt[0]=jt[0],lt[1]=jt[1],lt[2]=jt[2]},!0,Xe<0,1);pt.bw=Q(pt,Be.head),pt.col=new Float32Array(pt.nv*4);for(let ut=0;ut<pt.nv;ut++){const xt=pt.verts[ut*10+8],lt=Math.pow(.5+.5*Math.cos(It*20*xt),3),Tt=.6+.4*es(xt*30,pt.verts[ut*10+9]*5,Xe,5);pt.col.set([Re(.075,.17,lt)*Tt,Re(.06,.14,lt)*Tt,Re(.045,.105,lt)*Tt,0],ut*4)}return pt});return l.mesh=V([De,bt[0],bt[1]]),l.mesh},l.walk={duty:.62,lag:.22,fMax:.5,hMax:.5,fMid:0,hMid:0,fLift:.09,hLift:.07,my0:-.004,bob:.008,bobAt:.6,pit0:0,pit:.01,neck:-.1,nod:.05,head:0,tail:0,tail1:0,tail2:0,wag:0,ear:0},l.gait={gather:.16,flex:.2,flexBias:.6,flexC:.45,flexH:.8,pit:.1,pitAt:.3,pit0:.03,bob:.085,bobAt:-.5,arch:.02,my0:.01,surge:0,fOn:0,fDur:.26,sF:.05,fLand:.3,fSweep:.52,fOver:.06,fBack:.06,fLift:.16,hOn:.2,hDur:.3,sH:.04,hLand:.24,hSweep:.56,hBack:.05,hTrail:.14,hLift:.05,splay:.01,neck:-.12,neckSw:.06,head:.1,headLevel:.5,ear:.2,earSw:.08,earOut:0,tail:.9,tail1:.3,tailSw:.1},l.stand=function(u,v,P,N){Fe(N);const de=Math.sin(P*1.7);return N.my=.004*de,N.aC=.012*de+.03*v,N.nA=.1+.16*v,N.nB=.08+.14*v,N.hA=.1+.1*v,N.hY=u*.85,N.nY=u*.15,N.eB=-.35*v+.25*Math.max(0,Math.sin(P*.9+1))**8,N.eL=.5*Math.max(0,Math.sin(P*1.3))**12,N.t0=.5*Math.max(0,Math.sin(P*2.1+2))**6,N.lg[0]=.03,N.lg[5]=-.04,N.lg[10]=-.05,N.lg[15]=.04,N},l.anim=function(u,v){return v.anim==="stand"?Fe(u):v.anim==="watch"?l.stand(v.look==null?1.1:v.look,v.alert==null?1:v.alert,v.t||0,u):v.anim==="walk"?Ie(l.walk,v.ph||0,v.v==null?1.3:v.v,1/(v.freq||1.1),1,u):c(l.gait,v.ph||0,v.v==null?8:v.v,1/(v.freq||2.2),1,u)},l})();e.sp.ibex=Ne;for(const t in e.sp){const S=e.sp[t];S.solve=S.Q.solve,S.mid=S.Q.S.MID}const Ce=(()=>{const t={body:0,head:1,tail:2,wing:3},S=11,l=[.085,.035,-.105],u=[.285,.04,-.085],v=[.555,.04,-.15],P=[.735,.036,-.112],N=[0,.028,-.165],de=[0,.004,.205],te={id:"eagle",NB:S,scale:1,mid:[0,0,0],tex:[3,.7,.2,-9],eye:[.03,.05,-.264,.0088],eyeCol:[.34,.2,.05],pupil:[.62,.62],soft:.022},o=(i,y,j,W)=>{const h=Math.cos(W),n=Math.sin(W),d=-i*j,M=Math.cos(d),g=Math.sin(d),R=i*y,Ue=Math.cos(R),$=Math.sin(R),ve=(xe,De,Te)=>{const Me=xe*M+Te*g,rt=-xe*g+Te*M;return[Me*Ue-De*$,Me*$+De*Ue,rt]};return[ve(1,0,0),ve(0,h,n),ve(0,-n,h)]},p=(i,y)=>[i[0][0]*y[0]+i[1][0]*y[1]+i[2][0]*y[2],i[0][1]*y[0]+i[1][1]*y[1]+i[2][1]*y[2],i[0][2]*y[0]+i[1][2]*y[1]+i[2][2]*y[2]];return te.solve=function(i){const y=n=>i[n]||0,j=new Array(S),W={w:[]},h=[0,y("by"),0];j[t.body]=Wt.fromBasis([1,0,0],[0,1,0],[0,0,1],h);{const n=X(J(y("hA")),y("hY")),d=X([1,0,0],y("hY")),M=f.mul(n,-1);j[t.head]=Wt.fromBasis(d,f.cross(M,d),M,f.add(N,h))}{const n=y("tP"),d=y("tR"),M=[0,Math.cos(n),-Math.sin(n)],g=Math.cos(d),R=Math.sin(d);j[t.tail]=Wt.fromBasis([g,R*M[1],R*M[2]],[-R,g*M[1],g*M[2]],[0,Math.sin(n),Math.cos(n)],f.add(de,h))}for(const n of[-1,1]){const d=t.wing+(n>0?4:0),M=Me=>[n*Me[0],Me[1],Me[2]],g=o(n,y("a1"),y("s1"),y("w1")),R=o(n,y("a2"),y("s2"),y("w2")),Ue=o(n,y("a3"),y("s3"),y("w3")),$=o(n,y("a3")+y("a4"),y("s3"),y("w3")),ve=f.add(M(l),h),xe=f.add(ve,p(g,M(f.sub(u,l)))),De=f.add(xe,p(R,M(f.sub(v,u)))),Te=f.add(De,p(Ue,M(f.sub(P,v))));j[d]=Wt.fromBasis(g[0],g[1],g[2],ve),j[d+1]=Wt.fromBasis(R[0],R[1],R[2],xe),j[d+2]=Wt.fromBasis(Ue[0],Ue[1],Ue[2],De),j[d+3]=Wt.fromBasis($[0],$[1],$[2],Te),W.w.push([ve,xe,De,Te])}return{J:W,F:j}},te.fly=function(i,y,j,W,h){h=h||{};const n=It*y,d=n+.25*Math.sin(n),M=Math.pow(Math.max(0,-Math.sin(d-.35)),1.2)*j,g=1-j,R=W||0;return i.a1=.07+.05*j+j*.5*Math.cos(d)+.12*R,i.a2=.1+.05*j+j*.66*Math.cos(d-.45)-.14*R,i.a3=.15*g+.05*j+j*.84*Math.cos(d-.95)-.34*R,i.a4=.2*g+j*(.1+.42*Math.sin(d-.75))-.12*R,i.s1=.34*M+.42*R,i.s2=-.3*M-.38*R,i.s3=.8*M+.85*R,i.w1=-.06*j*Math.sin(d),i.w2=-.14*j*Math.sin(d)+.1*M,i.w3=-.3*j*Math.sin(d-.3)+.22*M,i.by=-.035*j*Math.cos(d-.5),i.tP=.05*j*Math.cos(d-.3)+(h.tP||0),i.tR=h.tR||0,i.hY=h.hY||0,i.hA=h.hA||0,i},te.anim=(i,y)=>y.anim==="glide"||y.anim==="stand"?te.fly(i,0,0,0,y):y.anim==="tuck"?te.fly(i,0,0,y.k==null?1:y.k,y):te.fly(i,y.ph||0,y.amp==null?1:y.amp,0,y),te.build=function(){const i=te.solve({});te.bind=i,te.inv=i.F.map(bt=>Wt.invert(bt));const y=[0,.018,-.145],j=[0,.04,-.225],W=[0,.041,-.284],h=[0,.032,-.322],n=[0,.012,-.332],d=[0,.022,-.285],M=[0,.019,-.316];function g(bt,Xe,et){const tt=Math.abs(bt);let Oe=se(bt,Xe,et,0,0,0,.092,.084,.215);if(Oe=be(Oe,se(bt,Xe,et,0,-.006,-.085,.084,.086,.12),.05),Oe=be(Oe,se(bt,Xe,et,0,.002,.185,.062,.042,.105),.05),Oe=be(Oe,_(bt,Xe,et,y,j,.06,.046),.05),et<-.15){let ze=se(bt,Xe,et,0,.046,-.248,.039,.036,.05);ze=be(ze,se(tt,Xe,et,.023,.062,-.262,.018,.0065,.023),.008),ze=be(ze,se(tt,Xe,et,.0285,.05,-.264,.009,.009,.0105),.004),ze=be(ze,_(bt,Xe,et,W,h,.0185,.0115),.012),ze=be(ze,_(bt,Xe,et,h,n,.0105,.006),.006),ze=be(ze,_(bt,Xe,et,d,M,.012,.007),.006),Oe=be(Oe,ze,.03)}if(Xe<.03&&et>-.08){let ze=se(tt,Xe,et,.045,-.06,.085,.036,.04,.085);ze=be(ze,se(tt,Xe,et,.04,-.066,.2,.019,.015,.04),.02),Oe=be(Oe,ze,.035)}if(tt>.03&&et<.03){let ze=_(tt,Xe,et,l,u,.04,.031);ze=be(ze,_(tt,Xe,et,u,v,.031,.022),.03),ze=be(ze,_(tt,Xe,et,v,P,.022,.012),.02),Oe=be(Oe,ze,.04)}return Oe}const R=performance.now(),Ue=qs(g,[-.78,-.125,-.36],[.78,.125,.32],.0095,{stride:2,attr:z(g,.02,.06)});te.meshMs=performance.now()-R;const $=[],ve=(bt,Xe,et,tt,Oe=0,ze=1)=>$.push({i:bt,a:Xe,b:et,r:tt,side:Oe,k:ze});ve(t.body,[0,0,-.12],[0,0,.22],.085),ve(t.head,[0,.036,-.2],[0,.03,-.33],.04);for(const bt of[-1,1]){const Xe=t.wing+(bt>0?4:0),et=tt=>[bt*tt[0],tt[1],tt[2]];ve(Xe,et(f.lerp(l,u,.35)),et(u),.03,bt,1.3),ve(Xe+1,et(u),et(v),.026,bt,1.3),ve(Xe+2,et(v),et(P),.017,bt)}Ue.bw=he(Ue,$,te.soft);const xe=[.058,.038,.026],De=[.028,.021,.018],Te=[.21,.135,.068],Me=[.33,.21,.085],rt=[.78,.76,.72],wt=[.68,.48,.05];Ue.col=L(Ue,(bt,Xe,et,tt,Oe,ze,pt)=>{const ut=Math.abs(bt),xt=es(bt*34,Xe*34,et*22,3),lt=es(bt*90,Xe*90,et*60,9);let Tt=b(xe,De,.2+.5*xt),Et=1;Tt=b(Tt,Te,.5*C(0,-.9,Oe)*C(-.02,.1,et)*(.5+.5*lt)),Tt=b(Tt,Te,(.25+.55*lt)*C(.11,.16,ut)*C(-.3,.5,Oe)),Tt=b(Tt,b(Te,xe,.5),.6*C(.11,.16,ut)*C(.2,-.5,Oe)),Tt=b(Tt,rt,.85*C(.215,.26,et+.02*xt)*C(-.02,.01,Xe)),Tt=b(Tt,Me,mt(C(.028,.06,Xe+.012*lt)*C(-.288,-.262,et)*C(-.1,-.165,et)*(.75+.5*xt))),Tt=b(Tt,De,.6*C(-.262,-.28,et)*C(.06,.03,Xe)*C(-.3,-.283,et)),et<-.287&&Xe<.068&&ut<.024&&(Tt=b(b(wt,[.5,.36,.06],.3),b([.13,.13,.15],[.012,.012,.015],C(-.304,-.326,et)),C(-.296,-.306,et)),Et=.3),et>.165&&Xe<-.045&&(Tt=b(Tt,wt,C(.17,.185,et)),Et=.35),pt[0]=Tt[0],pt[1]=Tt[1],pt[2]=Tt[2],pt[3]=Et});const Ze=[Ue],ct=13,Mt=bt=>1-Math.pow(Math.abs(2*(bt%1)-1),2.6),ft=bt=>Math.pow(Math.abs(2*(bt%1)-1),7),dt=(bt,Xe)=>{bt.col=new Float32Array(bt.nv*4);const et=[0,0,0,.5];for(let tt=0;tt<bt.nv;tt++)et[3]=.5,Xe(bt.verts[tt*10+8],bt.verts[tt*10+9],et,bt.verts,tt*10),bt.col.set(et,tt*4)},gt=(bt,Xe,et)=>{bt[0]=Xe[0]*et,bt[1]=Xe[1]*et,bt[2]=Xe[2]*et};for(const bt of[-1,1])for(const Xe of[0,1]){const et=t.wing+(bt>0?4:0),tt=bt>0!=!!Xe,Oe=I(ct*4+1,12,(ze,pt,ut)=>{const xt=Math.pow(pt,1.5),lt=Re(-.118,-.17,ze)-.014*Math.sin(h0*ze),Tt=.112+.066*Math.sin(h0*mt(.1+.84*ze))+.025*ze-.017*(1-Mt(ze*ct+.5))*(ze<.999?1:0),Et=Re(.044,.024,ze)+.004,Ut=xt<.16?Math.sqrt(xt/.16):Xe?Math.pow(Math.max(0,1-(xt-.16)/.5),1.5):Math.pow(1-(xt-.16)/.84,1.6);ut[0]=bt*Re(.05,.59,ze),ut[2]=Re(lt,Tt,xt),ut[1]=.04-.036*xt*xt+(Xe?-Et*Ut-.0015:Et*Ut)},!1,tt,2);Oe.bw=new Float32Array(Oe.nv*4);for(let ze=0;ze<Oe.nv;ze++){const pt=Oe.verts[ze*10+8],ut=ze*4;pt<.72?(Oe.bw[ut]=et,Oe.bw[ut+1]=et+1,Oe.bw[ut+2]=1-C(.3,.56,pt)):(Oe.bw[ut]=et+1,Oe.bw[ut+1]=et+2,Oe.bw[ut+2]=1-C(.84,1.1,pt))}dt(Oe,(ze,pt,ut)=>{const xt=Math.pow(pt,1.5),lt=es(ze*40,xt*9,bt+Xe*3,5),Tt=C(.4,.46,xt),Et=ft(ze*ct+.5)*Tt;let Ut=Xe?b(b(xe,Te,.35+.4*lt),[.06,.05,.045],Tt):b(b(xe,Te,(.25+.6*lt)*C(.1,.18,xt)*C(.42,.34,xt)*C(.04,.16,ze)),De,Tt);Ut=b(Ut,rt,(Xe?.92:.8)*C(Xe?.5:.7,Xe?.66:.86,ze+.05*lt)*Tt*C(Xe?.86:.76,Xe?.74:.66,xt)),gt(ut,Ut,(1-.45*Et)*(.85+.3*lt))}),Ze.push(Oe);for(let ze=0;ze<10;ze++){const pt=ze/9,ut=Re(1.5,.1,Math.pow(pt,.85)),xt=Math.cos(ut),lt=Math.sin(ut),Tt=Re(.3,.44,C(0,.62,pt))-.06*C(.72,1,pt),Et=C(3,5,ze),Ut=f.lerp(v,P,pt),Xt=I(9,3,(_t,m0,r0)=>{const Ft=2*m0-1,Lt=.036*Re(1,.5,C(.36,.56,_t)*Et)*Math.sqrt(mt((1.025-_t)/.1))*(.5+.5*C(0,.12,_t)),yt=_t*Tt-.025,Rt=Ft*Lt+.04*_t*_t*Et;r0[0]=bt*(Ut[0]+xt*yt-lt*Rt),r0[2]=Ut[2]+.014+lt*yt+xt*Rt,r0[1]=.034-.0012*ze-.004*Ft*Ft-(Xe?.0012:0)},!1,tt,2);Xt.bw=new Float32Array(Xt.nv*4);for(let _t=0;_t<Xt.nv;_t++)Xt.bw[_t*4]=et+2,Xt.bw[_t*4+1]=et+3,Xt.bw[_t*4+2]=1-.92*C(.12,1,Xt.verts[_t*10+8])*C(.2,.6,pt);dt(Xt,(_t,m0,r0)=>{const Ft=1-Math.abs(2*m0-1),Lt=b(Xe?[.055,.047,.043]:De,rt,(Xe?.92:.8)*C(Xe?.52:.44,Xe?.36:.28,_t)*C(Xe?7:6,Xe?5:4,ze));gt(r0,Lt,.78+.5*Ft)}),Ze.push(Xt)}}for(const bt of[0,1]){const Xe=I(10,37,(et,tt,Oe)=>{const ze=2*tt-1,pt=ze*.46,ut=.335-.03*ze*ze-.013*(1-Mt(tt*12))*Math.pow(et,4),xt=.07+et*ut;Oe[0]=Math.sin(pt)*xt,Oe[2]=.15+Math.cos(pt)*xt,Oe[1]=.006-.014*ze*ze-(bt?.004*Math.sin(h0*Math.min(1,et*1.3))+.001:0)},!1,!!bt,2);Xe.bw=new Float32Array(Xe.nv*4);for(let et=0;et<Xe.nv;et++)Xe.bw[et*4]=t.tail,Xe.bw[et*4+1]=t.body,Xe.bw[et*4+2]=C(0,.3,Xe.verts[et*10+8]);dt(Xe,(et,tt,Oe)=>{const ze=es(tt*30,et*6,bt,7);let pt=b(b(xe,Te,.4),rt,C(.06,.2,et));pt=b(pt,De,C(.56,.68,et+.03*ze)),pt=b(pt,[.3,.27,.22],C(.955,1,et)),gt(Oe,pt,1-.35*ft(tt*12)*C(.15,.4,et))}),Ze.push(Xe)}return te.mesh=V(Ze),te.mesh},te})();e.sp.eagle=Ce,e.init=function(t){we=t;const S=performance.now();for(const v in e.sp){const P=e.sp[v],N=P.mesh||P.build();P.vb=we.buffer(N.V,"vertex"),P.vb2=we.buffer(N.W,"vertex"),P.vb3=we.buffer(N.C,"vertex"),P.ib=we.buffer(N.I,"index"),P.count=N.ni,e.stats[v]={ms:Math.round(P.meshMs),verts:N.nv,tris:N.ni/3}}e.stats.ms=Math.round(performance.now()-S),D=we.texture({w:4,h:x,format:"rgba32f",filter:"nearest"});const l=[{attrs:[["pos","vec3f"],["nrm","vec3f"],["mat","vec4f"]]},{attrs:[["bw","vec4f"]]},{attrs:[["col","vec4f"]]}],u=v=>`fn vert(a: VIn) -> VOut { var v: VOut;
      let s: SkinV = skinVertex(a.pos, a.nrm, vec4f(a.bw.x + M.p.x, a.bw.y + M.p.x, a.bw.z, 0.0));
      ${v?"v.clip = U.shadowVP * vec4f(s.wp + s.n * 0.03, 1.0);":"v.wp = s.wp; v.nrm = s.n; v.bp = a.pos; v.bn = a.nrm; v.mat = a.mat; v.col = a.col; v.clip = U.viewProj * vec4f(s.wp, 1.0);"}
      return v; }`;Y=we.pipeline({name:"fauna",lib:[St.common,St.hash,St.fog,St.shadow,Cs],buffers:l,varyings:{wp:"vec3f",nrm:"vec3f",bp:"vec3f",bn:"vec3f",mat:"vec4f",col:"vec4f"},uniforms:{p:"vec4f",q:"vec4f",e0:"vec4f",e1:"vec4f",e2:"vec4f"},textures:{tBones:"fetch",tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:u(!1),fs:go}),E=we.pipeline({name:"faunaShadow",lib:[St.common,Cs],buffers:l,varyings:{},uniforms:{p:"vec4f"},textures:{tBones:"fetch"},colorFormat:null,cull:"none",depthBias:2,depthBiasSlope:2,vs:u(!0),fs:null}),e.pipes=[Y,E],e.ready=!0};const Ye=new Array(w).fill(null);function T(t,S){let l=Ye.indexOf(null);if(l<0)return null;const u=Object.assign({K:t,slot:l,pos:[0,0,0],yaw:0,lean:0,pitch:0,lift:0,scale:t.scale,tilt:.85,pose:Ke(),fade:0,fadeT:1,snow:.6,nrm:[0,1,0],init:!1,gone:!1,t:0,ph:0,v:0,off:0,s:0,dodge:0,shadow:!0},S);return Ye[l]=u,e.live.push(u),u}function Se(t){const S=e.live.indexOf(t);S>=0&&e.live.splice(S,1),Ye[t.slot]===t&&(Ye[t.slot]=null),t.gone=!0}e.clear=function(){for(const t of e.live.slice())Se(t);e.ev=null};function me(t,S){const l=t.K.solve(t.pose),u=t.scale,v=t.nrm,P=[Math.sin(t.yaw),0,-Math.cos(t.yaw)],N=f.norm(v),de=f.norm(f.sub(P,f.mul(N,f.dot(P,N)))),te=f.mul(de,-1),o=f.norm(f.cross(N,te)),p=f.cross(o,N),i=Math.cos(t.lean),y=Math.sin(t.lean),j=[o[0]*i+N[0]*y,o[1]*i+N[1]*y,o[2]*i+N[2]*y],W=[N[0]*i-o[0]*y,N[1]*i-o[1]*y,N[2]*i-o[2]*y],h=Math.cos(t.pitch),n=Math.sin(t.pitch),d=[W[0]*h+p[0]*n,W[1]*h+p[1]*n,W[2]*h+p[2]*n],M=[p[0]*h-W[0]*n,p[1]*h-W[1]*n,p[2]*h-W[2]*n],g=t.K.mid[1]*u,R=[g*(W[0]-d[0]),g*(W[1]-d[1]),g*(W[2]-d[2])],Ue=Wt.fromBasis(f.mul(j,u),f.mul(d,u),f.mul(M,u),[t.pos[0]-S[0]+R[0],t.pos[1]+t.lift-S[1]-(t.K.sink||0)*u+R[1],t.pos[2]-S[2]+R[2]]),$=t.K.inv,ve=t.K.NB,xe=t.slot*s;for(let De=0;De<ve;De++)F.set(Wt.mul(Ue,Wt.mul(l.F[De],$[De])),(xe+De)*16);return t.R=Ue,t.J=l.J,t.fwd=de,l}e.place=me;let B=!1;e.upload=function(){D&&we.updateTexture(D,0,0,4,x,F),B=!1},e.draw=function(t,S){if(!(!e.ready||!e.live.length)){for(const l of e.live)if(l.R&&l.fade>.004){const u=l.K;we.draw(Y,{u:{p:[l.slot*s,l.fade,l.snow,l.powder||0],q:u.tex,e0:u.eye,e1:[u.eyeCol[0],u.eyeCol[1],u.eyeCol[2],0],e2:[u.pupil[0],u.pupil[1],0,0]},tex:{tBones:D,tDetail:c0.detail,tShadow:t,tSky:S},vb:[u.vb,u.vb2,u.vb3],ib:u.ib,count:u.count})}}},e.drawShadow=function(){if(!(!e.ready||!e.live.length)){for(const t of e.live)if(t.R&&t.shadow&&t.fade>.5){const S=t.K;we.draw(E,{u:{p:[t.slot*s,1,0,0]},tex:{tBones:D},vb:[S.vb,S.vb2,S.vb3],ib:S.ib,count:S.count})}}};let U=D0(4177);const A={},a={},oe={},fe={},O=Ke(),ie=Ke(),ce=Ke();e.seed=t=>{U=D0(t)},e.gap=[60,105],e.first=[26,38],e.count={};const He=(t,S)=>S(vt.at(t+40,a))&&S(vt.at(t+90,a))&&S(vt.at(t+150,a)),We=t=>{for(let S=t.length-1;S>0;S--){const l=Math.floor(U()*(S+1)),u=t[S];t[S]=t[l],t[l]=u}return t};e.reset=function(t){for(const S of e.live.slice())t&&S.frozen||Se(S);typeof z0<"u"&&z0.herd&&(z0.herd=z0.herd.filter(S=>t&&S.frozen)),e.ev=null,e.want=null,e.deck=[],e.tryT=0,e.next=zt.runT+Re(e.first[0],e.first[1],U()),e._segs=vt.segs,e._runT=zt.runT};function Qe(t){const S=fe[t];if(!S)return!1;const l={id:t,t:0,leave:!1,actors:[]};return S.begin(l)===!1?!1:(e.ev=l,e.last=t,e.count[t]=(e.count[t]||0)+1,!0)}e.spawn=function(t){if(!e.ready||!e.enabled||typeof z0<"u"&&!z0.enabled)return!1;if(!t||!fe[t]){const S=Object.keys(fe);t=S[Math.min(S.length-1,Math.floor(U()*S.length))]}return e.want=t,e.ev&&(e.ev.leave=!0),!0},e.update=function(t,S){if(!e.ready)return;vt.segs!==e._segs?e.reset():zt.runT<e._runT-1e-6&&e.reset(!0),e._runT=zt.runT;const l=zt.s,u=-l.p[2],v=e.enabled&&z0.enabled,P=e.ev;if(P){if(P.t+=t,v||(P.leave=!0),P.leave&&e.want&&(P.goT=(P.goT||0)+t)>1.2)for(const N of P.actors)N.fadeT=0;P.id==="deer"?(P.leave&&z0.leave(),z0.herd.some(N=>!N.frozen)||(e.ev=null)):P.actors.some(N=>!N.gone)||(e.ev=null)}!e.ev&&z0.herd&&z0.herd.some(N=>!N.frozen)&&(e.ev={id:"deer",t:0,leave:!1,actors:[]},e.last="deer",e.count.deer=(e.count.deer||0)+1,e.next=Math.max(e.next,zt.runT+e.gap[0]));for(const N of e.live.slice()){if(N.frozen){me(N,qt.origin);continue}N.t+=t,N.step(N,t,S,N.ev),N.fade=N.fadeT>N.fade?Math.min(N.fadeT,N.fade+t/.55):Math.max(N.fadeT,N.fade-t/.55),N.fadeT<=0&&N.fade<=0?(N.gone=!0,Se(N)):me(N,qt.origin)}if(!e.ev){if(e.want){const N=e.want;e.want=null,Qe(N)}else if(v&&zt.mode==="run"&&zt.runT>e.next&&l.speed>6&&(e.tryT-=t)<=0){e.tryT=.4,e.deck.length||(e.deck=We(Object.keys(fe)));for(let N=0;N<e.deck.length;N++){const de=e.deck[N];if(fe[de].ok(u)){e.deck.splice(N,1),Qe(de)&&(e.next=zt.runT+Re(e.gap[0],e.gap[1],U()));break}}if(!e.ev&&zt.runT>e.next+25){const N=We(Object.keys(fe).filter(de=>e.deck.indexOf(de)<0&&de!==e.last));N.length&&(e.deck=e.deck.concat(N)),e.next=zt.runT-24}}}e.live.length&&e.upload()},fe.deer={ok:t=>z0.room(t),begin:()=>(z0.spawn(),z0.herd.length>0)};function st(t,S,l,u,v,P){let N=l.cx+t.off+t.dodge;const de=-t.s;if(t.trees){vt.nearTree(N,de,oe);const n=oe.ok&&oe.d<t.trees?(N>=oe.x?1:-1)*(t.trees-oe.d)*1.3:0;t.dodge=Pt(t.dodge,n,n?8:1.5,S),N=l.cx+t.off+t.dodge}const te=vt.height(N,de,.5),o=t.pos[0],p=t.pos[2];if(t.pos[0]=N,t.pos[1]=te,t.pos[2]=de,t.init&&S>0){const n=(N-o)/S,d=(de-p)/S;if(Math.hypot(n,d)>.6){const g=Math.atan2(n,-d),R=Math.atan2(Math.sin(g-t.yaw),Math.cos(g-t.yaw));t.lean=Pt(t.lean,it(-R*v,-P,P),5,S),t.yaw+=R*(1-Math.exp(-u*S))}else t.lean=Pt(t.lean,0,5,S)}t.init=!0;const i=vt.normal(N,de,.8),y=Math.sin(t.yaw),j=-Math.cos(t.yaw),W=(i[0]*y+i[2]*j)*t.tilt,h=(-i[0]*j+i[2]*y)*t.tilt*.35;t.nrm=f.norm([y*W-j*h,i[1],j*W+y*h])}const Le=(t,S,l,u)=>Ge(t.pose,t.pose,S,1-Math.exp(-(u||Re(11,80,ge(0,.4,t.ts)))*l)),r=(t,S)=>{const l=Wt.tp(t.R,S);return l[0]+=qt.origin[0],l[1]+=qt.origin[1],l[2]+=qt.origin[2],l},q=(t,S,l)=>t<l&&S>=l||t>S&&(l>t||l<=S),k=(t,S)=>{const l=S.p[0]-t.pos[0],u=S.p[2]-t.pos[2],v=Math.cos(t.yaw),P=Math.sin(t.yaw);return Math.atan2(l*v+u*P,l*P-u*v)},ee=(t,S,l)=>{for(const u of o0.riders)if(u[3]===0){u[0]=t.pos[0]-qt.origin[0],u[1]=t.pos[1]-qt.origin[1]+S,u[2]=t.pos[2]-qt.origin[2],u[3]=l;return}};fe.hare={ok:t=>He(t,S=>S.forest>=.6&&S.hw<=34&&(S.glade||0)<.25&&(S.ridge||0)<.3),begin(t){const S=zt.s,l=-S.p[2],u=Math.max(-S.v[2],0),v=u<4,P=l+(v?17:it(u*5,80,125)),N=vt.at(P,A),de=S.p[0]-vt.at(l,a).cx,te=Math.abs(de)>2?-R0(de):U()<.5?-1:1,o=N.hw-.5,p=T(ye,{ev:t,step:Z,s:P,off:it(de+te*(v?6:7+3*U()),-o,o),side:te,st:0,ts:0,up:0,look:0,runK:0,vf:0,latV:0,dodge:0,trees:1.5,tilt:.7,yaw:Math.atan2(-te*.8,.6),d1:2.7+.3*U(),d2:1.55+.2*U(),w1:v?.9:9,w2:v?1.3:2,lead:3+1*U(),gap:2.4+.5*U(),runFor:5.5+1.5*U(),vMax:22.5,jk:te,jt:.6,ph:.3,fadeT:1});if(!p)return!1;t.actors.push(p)}};function Z(t,S,l,u){const v=zt.s,P=-v.p[2],N=Math.max(-v.v[2],0),de=N<4,te=vt.at(t.s,A),o=t.s-P,p=v.p[0]-vt.at(P,a).cx,i=t.K;t.ts+=S;const y=de?9:o/Math.max(N,4);if(t.st===0&&(y<t.d1||t.ts>t.w1||u.leave)?(t.st=1,t.ts=0):t.st===1&&(y<t.d2||t.ts>t.w2||u.leave&&t.ts>.3)?(t.st=2,t.ts=0,Math.abs(t.off-p)>.8&&(t.side=R0(t.off-p))):t.st===2&&(t.ts>t.runFor||o<4.6&&t.ts>.8||de&&t.ts>2.4||u.leave&&t.ts>1.2||te.forest<.3&&t.ts>1.5)&&(t.st=3,t.ts=0),t.st<2)t.up=Pt(t.up,t.st,t.st?9:4,S),t.look=Pt(t.look,t.st?it(k(t,v),-1.25,1.25):0,7,S),st(t,S,te,9,0,0);else{(t.off-p)*t.side<0&&(t.side=-t.side);const j=t.st===3?Math.max(Math.min(N+1,t.vMax),12):de?11:it(N+it((t.lead-o)*.9,-7,3),8,t.vMax);t.vf+=it((j-t.vf)*4,-22,15)*S,t.jt-=S,t.jt<=0&&(t.jt=.5+.7*U(),t.jk=(t.jk>0?-1:1)*(.7+1.5*U()));const W=te.hw-1.5,h=t.st===3?t.side*(te.hw+18):it(p+t.side*t.gap+t.jk,-W,W),n=it((h-t.off)*(t.st===3?1.1:2.8),-.62*t.vf,.62*t.vf);t.latV=Pt(t.latV,n,t.st===3?3:6.5,S),t.off+=t.latV*S;{const g=(t.off-p)*t.side;Math.abs(o)<12&&g<2.2&&(t.off+=t.side*Math.min(2.2-g,9*S))}const d=Math.min(t.vf,Math.sqrt(Math.max(t.vMax*t.vMax-t.latV*t.latV,1)));t.v=Math.hypot(d,t.latV),t.s+=d*S,st(t,S,te,11,2.4,.4),t.runK=Math.min(1,t.runK+S/.3),t.up=Pt(t.up,.55,6,S),t.look=Pt(t.look,0,8,S),Math.abs(o)<45&&ee(t,.22,.55);const M=Math.abs(t.off)-te.hw;(t.st===3&&(M>6||t.ts>5)||o<-14||o>150)&&(t.fadeT=0)}if(i.sit(t.up,O),O.hY=t.look,t.runK>0){t.freq=Re(3,4.3,mt((t.v-5)/12));const j=t.ph;if(t.ph=(t.ph+t.freq*S)%1,c(i.gait,t.ph,t.v/t.scale,1/t.freq,1,ie),Ge(t.pose,O,ie,ge(0,1,t.runK)),t.R){for(const[W,h]of[[i.gait.fOn,1],[i.gait.hOn+.04,0]])if(q(j,t.ph,W)){const n=r(t,[0,.01,h?-.12:.1]),d=Math.hypot(n[0]-v.p[0],n[2]-v.p[2]),M=t.fwd;d<70&&Jt.kick(l,n,[M[0]*t.v*(h?.35:-.2),.5,M[2]*t.v*(h?.35:-.2)],(h?.4:.7)*(.7+.8*(te.powder||.3))),d<22&&v0.event({type:"hoof",d:d*1.5,side:R0((n[0]-v.p[0])*v.r[0]+(n[2]-v.p[2])*v.r[2])||1,k:h?.2:.3})}}}else Ge(t.pose,O,O,0)}const K=t=>Math.atan2(Math.sin(t),Math.cos(t));fe.fox={ok:t=>He(t,S=>S.forest>=.4&&S.hw>=20&&(S.glade||0)<.2&&(S.gul||0)<.3&&(S.ridge||0)<.3&&(S.mog||0)<.4),begin(t){const S=zt.s,l=-S.p[2],u=Math.max(-S.v[2],0),v=u<4,P=l+(v?16:it(u*5.4,80,135)),N=vt.at(P,A),de=S.p[0]-vt.at(l,a).cx;let te=Math.abs(de)>2?R0(de):U()<.5?-1:1,o=N.hw-3-te*de;o<6.5&&(te=-te,o=N.hw-3-te*de);const p=de+te*(v?6.5:it(o-1.5*U(),6.5,8.5+3*U())),i=-te*(1.5+.35*U()),y=T(Ve,{ev:t,step:G,s:P-2.6*Math.cos(i),off:p-2.6*Math.sin(i),h0:p,s0:P,tx:p,tz:P,legT:5,side:te,st:0,ts:0,v:Ve.walk.v,dir:i,yaw:i,trees:.9,tilt:.85,look:0,lookT:0,lookN:0,up:0,paw:0,pawS:1,ph:U(),d1:2.3+.4*U(),stay:9+4*U(),fadeT:1});if(!y)return!1;t.actors.push(y)}};function ue(t){for(let S=0;S<5&&(t.tx=t.h0+(U()*2-1)*2.5,t.tz=t.s0+(U()*2-1)*2.4,!(!(Math.hypot(t.tx-t.off,t.tz-t.s)<1.6)&&(vt.nearTree(vt.at(t.tz,a).cx+t.tx,-t.tz,oe),!(oe.ok&&oe.d<1.7))));S++);t.legT=2.4+2.2*U()}function G(t,S,l,u){const v=zt.s,P=-v.p[2],N=Math.max(-v.v[2],0),de=N<4,te=vt.at(t.s,A),o=t.s-P,p=v.p[0]-vt.at(P,a).cx,i=t.K,y=i.walk,j=i.jog,W=de?9:o/Math.max(N-1,4),h=t.off-p,n=Math.hypot(o,h);t.ts+=S,t.ud=Pt(t.ud||0,S>0&&t.uP!=null?(p-t.uP)/S:0,5,S),t.uP=p;const d=h-t.ud*it(W,0,1.5),M=h*d<=0?0:Math.min(Math.abs(h),Math.abs(d));t.st===4?h*t.side<0&&(t.side=-t.side):Math.abs(h)>.8&&(t.side=R0(h));const g=!de&&W>-.3&&o>-2,R=ge(3,6.5,M);t.st<4&&(g&&M<16&&(W<Re(1.7,.9,R)||o<Re(22,12,R))||n<8.5&&o>-3)?(t.st=4,t.ts=0,t.ph=.3,t.trees=2):t.st<3&&(g&&M>=16&&W<1.4||u.leave&&t.t>.5||de&&t.t>t.stay)?(t.st=3,t.ts=0):t.st<2&&g&&(W<t.d1||n<26)?(t.st=2,t.ts=0,t.pawS=R0(k(t,v))||1):t.st===2&&(de||!g)&&t.ts>2.2?(t.st=0,t.ts=0,ue(t)):t.st===0&&(t.ts>t.legT||Math.hypot(t.tx-t.off,t.tz-t.s)<.45)?(t.st=1,t.ts=0,t.legT=1.2+1.6*U(),t.lookN=0):t.st===1&&t.ts>t.legT&&(t.st=0,t.ts=0,ue(t));const Ue=t.st===0?y.v:t.st===3?j.v:t.st===4?de?8:it(N*.42,7.5,10.5):0;t.v+=it((Ue-t.v)*(t.st===4?4:5),t.st===4?-14:-3.5,t.st===4?13:2.5)*S;let $=0;if(t.st===0)$=it(K(Math.atan2(t.tx-t.off,t.tz-t.s)-t.dir)*2.4,-1.9,1.9)*mt(t.v/.5);else if(t.st===3)$=it(K(t.side*1.3-t.dir)*2.4,-1.9,1.9)*mt(t.v/.5);else if(t.st===4)$=it(K(t.side*Re(.95,1.3,ge(.8,2,t.ts))-t.dir)*5,-8.5,8.5);else if(t.st===2&&t.v<.3){const xe=k(t,v);$=R0(xe)*it((Math.abs(xe)-.95)*2.2,0,1.5)*ge(.3,.1,t.v)}if(t.dir+=$*S,t.off+=t.v*Math.sin(t.dir)*S,t.s+=t.v*Math.cos(t.dir)*S,t.st===4){const xe=(t.off-p)*t.side;o>-4&&o<14&&xe<3.2&&(t.off+=t.side*Math.min(3.2-xe,8*S))}t.st===4?st(t,S,te,8,1.3,.22):(t.yaw=Math.atan2(Math.sin(t.dir)+(vt.at(t.s+1,a).cx-te.cx)*Math.cos(t.dir),Math.cos(t.dir)),st(t,S,te,0,0,0)),t.st===1&&(t.lookN-=S,t.lookN<=0&&(t.atS=!t.atS&&de&&n<40,t.lookN=(t.atS?1:.7)+.8*U(),t.lookT=(t.lookT>0?-1:1)*(.35+.65*U())));const ve=t.st===2||t.st===1&&t.atS;if(t.look=Pt(t.look,ve?it(k(t,v),-1.35,1.35):t.st===1?t.lookT:0,ve?4.5:3,S),t.up=Pt(t.up,t.st===2?1:ve?.7:t.st===1?.3:0,6,S),t.paw=Pt(t.paw,t.st===2&&t.v<.25&&Math.abs($)<.05?t.pawS:0,5,S),t.st===4){t.freq=Re(2.3,3.2,mt((t.v-4)/9));const xe=t.ph;if(t.ph=(t.ph+t.freq*S)%1,c(i.gait,t.ph,Math.max(t.v,3)/t.scale,1/t.freq,1,O),O.hY=t.look,t.R){for(const[De,Te]of[[i.gait.fOn,1],[i.gait.hOn+.05,0]])if(q(xe,t.ph,De)){const Me=r(t,[0,.01,Te?-.2:.18]),rt=Math.hypot(Me[0]-v.p[0],Me[2]-v.p[2]),wt=t.fwd;rt<80&&Jt.kick(l,Me,[wt[0]*t.v*(Te?.35:-.2),.5,wt[2]*t.v*(Te?.35:-.2)],(Te?.3:.45)*(.7+.8*(te.powder||.3))),rt<22&&v0.event({type:"hoof",d:rt*1.4,side:R0((Me[0]-v.p[0])*v.r[0]+(Me[2]-v.p[2])*v.r[2])||1,k:Te?.18:.28})}}(Math.abs(t.off)-te.hw>4.5||o<-14||t.ts>7)&&(t.fadeT=0)}else{const xe=ge(1.4,2.3,t.v),De=t.st===2?mt(Math.abs($)/.9):0;if(t.ph=(t.ph+(Re(y.f/y.v,j.f/j.v,xe)*t.v+1.5*De)*S)%1,i.look(t.look,t.up,t.paw,O),t.v>.02&&(Ie(y,t.ph,y.v/t.scale,1/y.f,1,ie),xe>0&&(Ie(j,t.ph,j.v/t.scale,1/j.f,1,ce),Ge(ie,ie,ce,xe)),ie.hY=t.look*.6,Ge(O,O,ie,ge(.03,.55,t.v))),De>0){Ie(y,t.ph,.3/t.scale,1/y.f,1,ie);for(let Te=0;Te<20;Te++)O.lg[Te]+=(ie.lg[Te]-O.lg[Te])*.6*De}(t.st===3&&(Math.abs(t.off)-te.hw>3||o<-16||t.ts>12)||o<-22)&&(t.fadeT=0)}Le(t,O,S),o<60&&o>-12&&ee(t,.4,.95),W<3&&W>-.4&&(z0.pull+=R0(h)*.13*ge(3,1.6,W)*ge(-.4,.2,W))}const Ae=[0,0,0,0];function _e(t,S){if(!t.R)return;const l=t.K.Q.S;let u=0;for(let v=0;v<4;v++){const P=v<2?l.FF:l.HF,N=r(t,[(v&1?1:-1)*P[0],0,P[2]-S.lg[v*5]]);Ae[v]=it((vt.height(N[0],N[2],.5)-N[1])/t.scale,-.16,.24),u=Math.min(u,Ae[v])}S.my+=u;for(let v=0;v<4;v++)S.lg[v*5+1]+=Ae[v]}fe.ibex={ok:t=>He(t,S=>(S.glade||0)<.3&&(S.hw<=27||(S.ridge||0)>=.5||(S.gul||0)>=2))&&[40,150].every(S=>{const l=vt.segAt(t+S).type;return l==="ridge"||l==="steeps"||l==="gully"}),edge(t,S){const l=S*(t.hw+1.5+1.2*(1-(t.ridge||0)));if((t.gul||0)>=2){const u=(t.goff||0)+S*t.gw*1.5;if(Math.abs(u)<Math.abs(l))return u}return l},begin(t){const S=zt.s,l=-S.p[2],u=Math.max(-S.v[2],0),v=u<4,P=S.p[0]-vt.at(l,a).cx,N=Math.abs(P)>3?R0(P):U()<.5?-1:1;let de=l+(v?21:it(u*8,130,190)),te=0;for(let p=0;p<6;p++){const i=vt.at(de,A);if(te=v?P+N*8:it(fe.ibex.edge(i,N),P-14,P+14),vt.nearTree(i.cx+te,-de,oe),!oe.ok||oe.d>2.6)break;de+=7}const o=T(Ne,{ev:t,step:at,s:de,off:te,side:N,st:0,ts:0,v:0,yaw:-N*(1.15+.5*U()),tilt:.5,look:.4*N,alert:0,runK:0,latV:0,ph:.9,d1:3+.5*U(),w1:v?3.2:30,snow:.7,fadeT:1});if(!o)return!1;t.actors.push(o)}};function at(t,S,l,u){const v=zt.s,P=-v.p[2],N=Math.max(-v.v[2],0),de=N<4,te=vt.at(t.s,A),o=t.s-P,p=v.p[0]-vt.at(P,a).cx,i=t.K,y=de?9:o/Math.max(N,4);if(t.ts+=S,t.st===0&&(y<t.d1||t.ts>t.w1||u.leave&&t.ts>.4)?(t.st=1,t.ts=0,t.trees=2.4,Math.abs(t.off-p)>3&&(t.side=R0(t.off-p))):t.st===1&&t.ts>.34?(t.st=2,t.ts=0):t.st===2&&(o<8||t.ts>8||de&&t.ts>2.2||u.leave&&t.ts>1)&&(t.st=3,t.ts=0),t.st===0)t.alert=Pt(t.alert,ge(8,4.5,y),3,S),t.look=Pt(t.look,t.alert>.3?it(k(t,v),-1.7,1.7):.35*t.side,3.5,S),st(t,S,te,6,0,0);else{(t.off-p)*t.side<0&&(t.side=-t.side);const j=t.st===1?2.5:de?9:it(N*.66,9.5,15);t.v+=it((j-t.v)*5,-12,22)*S;const W=fe.ibex.edge(te,t.side),h=t.st===3?t.side*(te.hw+40):t.side>0?Math.min(W+1,p+8):Math.max(W-1,p-8),n=it((h-t.off)*(t.st===3?1.2:1.6),-.75*t.v,.75*t.v);t.latV=Pt(t.latV,t.st===1?-t.side*.6:n,4,S),t.off+=t.latV*S,t.s+=Math.sqrt(Math.max(t.v*t.v-t.latV*t.latV,.01))*S;{const M=(t.off-p)*t.side;Math.abs(o)<16&&M<5&&(t.off+=t.side*Math.min(5-M,7*S))}st(t,S,te,t.st===1?7:6,1.2,.2),t.runK=Math.min(1,t.runK+S/.32),t.alert=Pt(t.alert,.3,4,S),t.look=Pt(t.look,0,6,S),t.tilt=Pt(t.tilt,.8,3,S);const d=Math.abs(t.off)-te.hw;(t.st===3&&(d>9||t.ts>4)||o<-14||o>220)&&(t.fadeT=0),o<60&&ee(t,.8,1.9),o>4&&o<70&&(z0.pull+=R0(t.off-p)*.1*ge(70,45,o)*ge(4,14,o))}if(i.stand(t.look,t.alert,t.t,O),_e(t,O),t.st===1){const j=ke(t.ts/.34);O.my-=.07*j,O.aH+=.1*j,O.aC+=.16*j}if(t.runK>0){t.freq=Re(1.9,2.5,mt((t.v-4)/9));const j=t.ph;if(t.ph=(t.ph+t.freq*S)%1,c(i.gait,t.ph,Math.max(t.v,3)/t.scale,1/t.freq,1,ie),Ge(O,O,ie,ge(0,1,t.runK)),t.R){for(const[W,h]of[[i.gait.fOn,1],[i.gait.hOn+.03,0]])if(q(j,t.ph,W)){const n=r(t,[0,.02,h?-.33:.37]),d=Math.hypot(n[0]-v.p[0],n[2]-v.p[2]),M=t.fwd;d<110&&Jt.kick(l,n,[M[0]*t.v*(h?.3:-.15),.7,M[2]*t.v*(h?.3:-.15)],(h?.5:.65)*(.7+.8*(te.powder||.3))),d<34&&v0.event({type:"hoof",d,side:R0((n[0]-v.p[0])*v.r[0]+(n[2]-v.p[2])*v.r[2])||1,k:h?.6:.8})}}}Le(t,O,S,t.runK>0?40:12)}fe.eagle={ok:t=>He(t,S=>(S.glade||0)<.3&&(S.hw>=20||(S.ridge||0)>=.5))&&vt.segAt(t+30).type!=="kickers"&&vt.segAt(t+330).type!=="kickers"&&!(typeof Nt<"u"&&Nt.sunElev<-.03),begin(t){const S=zt.s,l=-S.p[2],u=Math.max(-S.v[2],0),v=S.p[0]-vt.at(l,a).cx,P=Math.abs(v)>3?-R0(v):U()<.5?-1:1,N=T(Ce,{ev:t,step:ot,s:l-26,off:v+P*3,alt:5.6,uS:v,side:P,st:0,ts:0,vf:Math.max(u,9)+11,latV:0,vy:0,amp:.3,tuck:.6,look:0,lead:5+1.5*U(),glideFor:4.4+1.2*U(),ph:0,tilt:0,snow:0,fadeT:1});if(!N)return!1;t.actors.push(N)}};function ot(t,S,l,u){const v=zt.s,P=-v.p[2],N=Math.max(-v.v[2],0),de=t.s-P,te=vt.at(t.s,A),o=v.p[0]-vt.at(P,a).cx,p=t.K,i=Math.max(N,9);t.ts+=S,t.st===0&&(de>t.lead-2||u.leave&&t.ts>1.5)?(t.st=u.leave?2:1,t.ts=0):t.st===1&&(t.ts>t.glideFor||u.leave&&t.ts>.5||(te.glade||0)>.5)&&(t.st=2,t.ts=0);let y,j,W,h,n,d=9,M=0;const g=Math.max(te.hw-6,4);t.uS=Pt(t.uS,o,1.3,S),t.st===0?(y=i+Re(11,3.4,ge(-18,-9,de)),j=Re(5.6,4.8,ge(-26,-6,de))-1.3*ge(-1,6,de),W=it(t.uS+t.side*Re(3,2.2,ge(-20,2,de)),-g,g),h=.2,n=.6*ge(-5,-14,de)):t.st===1?(y=i+it((t.lead+.6*t.ts-de)*.8,-4,5),j=3.4+.3*Math.sin(t.t*.8),W=it(t.uS+t.side*(2.2+.5*Math.sin(t.t*.55)),-g,g),n=0,h=t.ts>2.4&&t.ts<3.6?.9:0,t.ts>.7&&t.ts<2.1&&(M=it(k(t,v),-2.3,2.3))):(y=i+9,j=4+26*ge(0,4.5,t.ts),d=2+11*ge(6,16,t.alt),W=t.off+t.side*30,h=1,n=0),t.vf+=it((y-t.vf)*1.6,-8,9)*S,t.s+=t.vf*S;const R=t.latV;t.latV=Pt(t.latV,it((W-t.off)*.9,-d,d),2.2,S),t.off+=t.latV*S,Math.abs(de)<10&&t.alt<3.3&&(t.alt=Math.min(3.3,t.alt+4*S)),t.vy=Pt(t.vy,it((j-t.alt)*1.2,-5,6),2.5,S),t.alt+=t.vy*S;const Ue=te.cx+t.off,$=-t.s,ve=vt.height(Ue,$,.5),xe=t.pos,De=xe[0],Te=xe[1],Me=xe[2];if(xe[0]=Ue,xe[1]=Math.max(.5*ve+.25*(vt.height(Ue,$+9,.5)+vt.height(Ue,$-9,.5))+t.alt,ve+1.8),xe[2]=$,t.init&&S>0){const rt=(Ue-De)/S,wt=($-Me)/S,Ze=Math.hypot(rt,wt),ct=Math.atan2(rt,-wt),Mt=Math.atan2(Math.sin(ct-t.yaw),Math.cos(ct-t.yaw));t.yaw+=Mt*(1-Math.exp(-6*S)),t.v=Ze,t.pitch=Pt(t.pitch,it(Math.atan2((xe[1]-Te)/S,Ze),-.5,.6)*.8,4,S),t.lean=Pt(t.lean,it(-Math.atan2((t.latV-R)/S,9.81)*1.5,-.95,.95)+.04*Math.sin(t.t*1.3),3.5,S)}else t.yaw=0;t.init=!0,t.amp=Pt(t.amp,h,5,S),t.tuck=Pt(t.tuck,n,2.5,S),t.look=Pt(t.look,M,5,S),t.ph=(t.ph+2.7*S)%1,p.fly(t.pose,t.ph,t.amp,t.tuck,{hY:t.look,hA:-t.pitch*.8,tR:-t.lean*.6+.05*Math.sin(t.t*2.1),tP:.1*mt((t.vf-y)/4)-t.pitch*.3}),Math.abs(de)<70&&ee(t,0,1.6),t.st===1&&(z0.pull+=R0(t.off-o)*.04*ge(0,.8,t.ts)*ge(t.glideFor,t.glideFor-.8,t.ts)),(t.st===2&&(t.ts>5.5||t.alt>27||Math.abs(t.off)>te.hw+25)||de<-45||de>200)&&(t.fadeT=0)}return e.pose=function(t,S,l={}){const u=e.sp[S];let v=e.live.find(P=>P.test===t);if(v&&v.K!==u&&(Se(v),v=null),v||(v=T(u,{test:t,frozen:!0,fade:1})),Object.assign(v,l),v.frozen=!0,l.pos&&l.ground!==!1&&typeof vt<"u"&&(v.pos[1]=vt.height(v.pos[0],v.pos[2],.5)),!l.flat&&typeof vt<"u"){const P=vt.normal(v.pos[0],v.pos[2],.6);v.nrm=f.norm([P[0]*v.tilt,P[1],P[2]*v.tilt])}else v.nrm=[0,1,0];return u.anim(v.pose,l),me(v,qt.origin),we&&e.upload(),v},ye.anim=function(t,S){if(S.anim==="stand")return Fe(t);if(S.anim==="sit")return ye.sit(S.up==null?1:S.up,t),t.hY=S.look||0,t;const l=S.v==null?9:S.v,u=1/(S.freq||3.4);return c(ye.gait,S.ph||0,l,u,S.run==null?1:S.run,t)},e.leap=c,e.newPose=Ke,e.mixPose=Ge,e.QB=Be,e})(),go=`
fn fDith(p: vec2f) -> f32 { let f: f32 = U.origin.w - 64.0 * floor(U.origin.w / 64.0); return fract(52.9829189 * fract(dot(p + 5.588238 * f, vec2f(0.06711056, 0.00583715)))); }
fn frag(v: VOut) -> FOut {
  var o: FOut;
  // coming and going: thinned out through a dither that moves every frame, never switched
  if (M.p.y < 0.999) { if (fDith(v.clip.xy) >= M.p.y) { discard; } }
  var N: vec3f = normalize(v.nrm);
  let V: vec3f = normalize(U.camPos.xyz - v.wp);
  let L: vec3f = U.sunDir.xyz;
  let bp: vec3f = v.bp; let bn: vec3f = normalize(v.bn);
  // hair lies along the body: streaks drawn out from nose to tail (finer on a small animal)
  let hair: vec4f = tex(tDetail, vec2f(bp.z * 1.2 + bp.y * 0.4, bp.y * 6.5 + bp.x * 5.0) * M.q.x);
  let fine: vec4f = tex(tDetail, (bp.zy * 12.0 + bp.xx * vec2f(7.0, 5.0)) * M.q.x);
  var alb: vec3f = v.col.rgb; var fur: f32 = saturate(v.col.a);
  // what it is made of: a coat (how furry is painted in with the colour: bare skin shines, and the wet of a nose), horn, or the vane of a feather
  let horn: f32 = step(0.5, v.mat.x) * step(v.mat.x, 1.5); let vane: f32 = step(1.5, v.mat.x);
  var sheen: f32 = 0.9; var specS: f32 = 0.025 + 0.10 * horn + 0.05 * vane; var specP: f32 = 16.0 + 14.0 * horn; var gloss: f32 = (1.0 - smoothstep(0.0, 0.5, fur)) * (1.0 - horn) * (1.0 - vane);
  // (and in locks, which is what is seen of a coat from farther than its hairs can be)
  let lock: vec4f = tex(tDetail, vec2f(bp.z * 0.42 + bp.y * 0.15, bp.y * 1.9 + bp.x * 1.5) * M.q.x);
  alb *= mix(1.0, (0.84 + 0.32 * hair.z) * (0.92 + 0.16 * fine.x) * (0.80 + 0.40 * lock.z), fur * M.q.y);
  // the eye: a dark wet ball with its own colour round the pupil
  let eq: vec3f = vec3f(abs(bp.x), bp.y, bp.z) - M.e0.xyz; let ed: f32 = length(eq) / M.e0.w;
  let eye: f32 = smoothstep(1.0, 0.86, ed);
  if (eye > 0.0) {
    let iris: f32 = smoothstep(0.80, 0.70, ed) * smoothstep(0.30, 0.42, length(vec2f(eq.z / M.e2.x, eq.y / M.e2.y)) / M.e0.w);
    alb = mix(alb, mix(vec3f(0.006, 0.005, 0.005), M.e1.rgb, iris), eye); gloss = max(gloss, 0.95 * eye); fur *= 1.0 - eye;
  }
  sheen = mix(0.25, 0.95, fur);
  // snow sifted along the back
  let dust: f32 = smoothstep(0.50, 0.92, bn.y) * smoothstep(0.50, 0.80, fine.w * 0.55 + hair.x * 0.5 + 0.12 * M.p.z) * fur * M.p.z;
  alb = mix(alb, vec3f(0.80, 0.84, 0.90), dust * 0.42);
  // and a face that has just been pushed into it comes out white
  let face: f32 = M.p.w * smoothstep(M.q.w + 0.02, M.q.w - 0.07, bp.z) * smoothstep(0.75, 0.30, fine.w * 0.6 + hair.x * 0.5 + 0.55 * (1.0 - M.p.w));
  alb = mix(alb, vec3f(0.82, 0.85, 0.90), face * 0.9);
  // the lie of the hair roughens the surface
  N = normalize(N + ((vec3f(hair.x, hair.y, hair.z) - 0.5) + (vec3f(lock.x, lock.y, lock.z) - 0.5) * 0.7) * M.q.z * fur);
  let ndl: f32 = dot(N, L); let ndv: f32 = saturate(dot(N, V));
  let sh: f32 = shadowAt(v.wp + N * 0.04, 0.00031);
  let ao: f32 = v.mat.y;
  let wrapD: f32 = saturate((ndl + 0.3 * fur) / (1.0 + 0.3 * fur));
  let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
  var col: vec3f = alb * (U.sunCol.rgb * wrapD * sh + amb * ao);
  // against the light the coat is edged with fire: every hair that stands clear of the body carries the sun through it
  let fr: f32 = pow(1.0 - ndv, 3.0);
  let back: f32 = saturate(dot(-V, L) * 0.5 + 0.5);
  col += (alb * 0.8 + 0.035) * U.sunCol.rgb * sheen * fr * (0.2 + 1.5 * back * back) * sh * saturate(ndl * 2.0 + 0.9);
  let rim: f32 = pow(1.0 - ndv, 2.6) * back * back * saturate(ndl * 1.2 + 1.0) * sh;
  col += (alb * 0.8 + 0.085) * U.sunCol.rgb * (rim * (0.5 + 1.6 * sheen));
  col += alb * U.ambSky.rgb * sheen * fr * 0.6 * ao;
  // a feather lets the sun through it
  col += alb * U.sunCol.rgb * (vane * 0.55 * saturate(-ndl) * sh);
  let Hh: vec3f = normalize(V + L);
  col += U.sunCol.rgb * sh * specS * pow(max(dot(N, Hh), 0.0), specP) * saturate(ndl * 4.0);
  if (gloss > 0.0) {
    let R: vec3f = reflect(-V, normalize(v.nrm));
    var env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
    env = mix(env, vec3f(0.75, 0.80, 0.90) * (U.ambSky.rgb + U.sunCol.rgb * 0.35), smoothstep(0.05, -0.25, R.y));
    col += env * gloss * (0.06 + 0.94 * pow(1.0 - ndv, 5.0)) + U.sunCol.rgb * sh * gloss * 1.5 * pow(max(dot(normalize(v.nrm), Hh), 0.0), 300.0);
  }
  // after dark an animal that crosses the beam of the headlamp is lit by it (and its eye throws the light straight back)
  if (U.lamp.w > 0.0) {
    let ll: vec3f = lampLight(v.wp);
    if (ll.x > 0.00002) {
      let Ld: vec3f = normalize(U.lamp.xyz - v.wp);
      col += ll * (alb * saturate((dot(N, Ld) + 0.35) / 1.35) * (0.6 + 0.4 * ao) + gloss * 6.0 * pow(max(dot(normalize(v.nrm), normalize(V + Ld)), 0.0), 40.0));
    }
  }
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`,o0=(()=>{const e={bloomLevels:6,mips:[],shutter:.011111111111111112,blurMax:.045,blurFar:.3,exposure:.145,satPre:1.22,satPost:1.1,flare:1,burst:1,ghosts:1,riders:[[0,0,0,0],[0,0,0,0]],rays:1,rayCore:.07,rayBase:.04,rayOcc:.85,rayFall:6};Object.assign(e,{speed:0,fringe:.005,slow:0,wet:0,wetAge:0,wetSeed:0,wetBias:[0,0],wetNew:0,chat:[0,0,0]}),Object.assign(e,{wetLook:0,wetBlow:0,wetC:[.5,.5]}),Object.assign(e,{radial:0,radC:[.5,.5],radIn:.6}),e.ghostV={a:[1,0],b:[0,.75],c:[0,1.3]};const s=()=>e.ghostV[typeof Dt<"u"&&Dt.val.ghost]||e.ghostV.c;typeof Dt<"u"&&Dt.def("ghost","逆光光斑",[["a","现在的"],["b","轻"],["c","明显"]],"c"),e.gOld=s()[0],e.gNew=s()[1];const w=()=>typeof Dt<"u"&&Dt.val.hi==="a"?0:1;typeof Dt<"u"&&Dt.def("hi","高光",[["a","原来"],["b","渐白"]],"b"),e.white=w();let x,F,we,Y,E,D,be,ht,qe,se,_,b=!1,re=0,m=0,J,ae,X,ke;return e.init=function(C){x=C;const ne=(Ee,je,$e={})=>x.pipeline(Object.assign({name:Ee,lib:[St.common,St.tonemap].concat($e.lib||[]),buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",q:"vec4f"},textures:{tA:"2d"},depth:!1,depthTest:!1,cull:"none",vs:as,fs:je},$e));F=ne("bloomDown0",`
fn kw(c: vec3f) -> f32 { return 1.0 / (1.0 + luma(c) * 0.25); }
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = M.p.xy; let uv: vec2f = v.uv;
  let a: vec3f = texLod(tA, uv + t * vec2f(-2.0, -2.0), 0.0).rgb; let b: vec3f = texLod(tA, uv + t * vec2f(0.0, -2.0), 0.0).rgb; let c: vec3f = texLod(tA, uv + t * vec2f(2.0, -2.0), 0.0).rgb;
  let d: vec3f = texLod(tA, uv + t * vec2f(-2.0, 0.0), 0.0).rgb; let e: vec3f = texLod(tA, uv, 0.0).rgb; let f: vec3f = texLod(tA, uv + t * vec2f(2.0, 0.0), 0.0).rgb;
  let g: vec3f = texLod(tA, uv + t * vec2f(-2.0, 2.0), 0.0).rgb; let h: vec3f = texLod(tA, uv + t * vec2f(0.0, 2.0), 0.0).rgb; let i: vec3f = texLod(tA, uv + t * vec2f(2.0, 2.0), 0.0).rgb;
  let j: vec3f = texLod(tA, uv + t * vec2f(-1.0, -1.0), 0.0).rgb; let k: vec3f = texLod(tA, uv + t * vec2f(1.0, -1.0), 0.0).rgb; let l: vec3f = texLod(tA, uv + t * vec2f(-1.0, 1.0), 0.0).rgb; let m: vec3f = texLod(tA, uv + t * vec2f(1.0, 1.0), 0.0).rgb;
  let g0: vec3f = (j + k + l + m) * 0.25; let g1: vec3f = (a + b + d + e) * 0.25; let g2: vec3f = (b + c + e + f) * 0.25; let g3: vec3f = (d + e + g + h) * 0.25; let g4: vec3f = (e + f + h + i) * 0.25;
  let w0: f32 = kw(g0) * 0.5; let w1: f32 = kw(g1) * 0.125; let w2: f32 = kw(g2) * 0.125; let w3: f32 = kw(g3) * 0.125; let w4: f32 = kw(g4) * 0.125;
  let s: vec3f = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
  o.color = vec4f(min(s, vec3f(64.0)), 1.0); return o; }`),we=ne("bloomDown",`
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = M.p.xy; let uv: vec2f = v.uv;
  var s: vec3f = texLod(tA, uv, 0.0).rgb * 4.0;
  s += texLod(tA, uv + t * vec2f(-1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(-1.0, 1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, 1.0), 0.0).rgb;
  o.color = vec4f(s * 0.125, 1.0); return o; }`),Y=ne("bloomUp",`
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = M.p.xy; let uv: vec2f = v.uv;
  var s: vec3f = texLod(tA, uv + t * vec2f(-1.0, 0.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, 0.0), 0.0).rgb + texLod(tA, uv + t * vec2f(0.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(0.0, 1.0), 0.0).rgb;
  s = s * 2.0 + texLod(tA, uv + t * vec2f(-1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(-1.0, 1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, 1.0), 0.0).rgb;
  o.color = vec4f(s * (1.0 / 12.0) * M.p.z, 1.0); return o; }`,{blend:"add"}),se=x.texture({w:1,h:1,format:"rgba16f",filter:"nearest"}),_=x.target({color:se}),D=x.pipeline({name:"sunVis",lib:[St.common],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f"},textures:{tDepth:"depth",tOcc:"2d",tCl:"2d"},depth:!1,depthTest:!1,cull:"none",blend:"alpha",vs:as,fs:`
fn frag(v: VOut) -> FOut { var o: FOut;
  let c: vec2f = U.sunScr.xy; var s: f32 = 0.0;
  for (var i: i32 = 0; i < 16; i++) {
    let a: f32 = f32(i) * 2.39996; let r: f32 = sqrt((f32(i) + 0.5) / 16.0) * 0.007;
    let q: vec2f = c + vec2f(cos(a) / U.camUp.w, sin(a)) * r;
    // (a sun outside the frame is judged by the edge of the frame nearest it: a ridge or a tree standing there hides it, open sky does not)
    if (texFetchD(tDepth, clamp(vec2i(q * U.res.xy), vec2i(0, 0), vec2i(U.res.xy) - vec2i(1, 1)), 0) >= 0.9999999) { s += 1.0; }
  }
  var vis: f32 = s / 16.0 * U.sunScr.z;
  let e: f32 = min(min(c.x, 1.0 - c.x), min(c.y, 1.0 - c.y));
  vis *= smoothstep(-0.22, 0.03, e);                      // a sun just outside the frame still flares a little
  vis *= exp(-texLod(tOcc, clamp(c, vec2f(0.0), vec2f(1.0)), 0.0).x * 0.9);
  vis *= texLod(tCl, vec2f(0.5), 0.0).x;                  // a cumulus in front of the sun (13_clouds.js Clouds.sunTex)
  // the same question asked of the sky all round the disc: how much stands in front of the glare (this is what makes beams)
  var w: f32 = 0.0;
  for (var i: i32 = 0; i < 24; i++) {
    let a: f32 = f32(i) * 2.39996; let r: f32 = sqrt((f32(i) + 0.5) / 24.0) * 0.075;
    let q: vec2f = c + vec2f(cos(a) / U.camUp.w, sin(a)) * r;
    if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) { if (texFetchD(tDepth, vec2i(q * U.res.xy), 0) >= 0.9999999) { w += 1.0; } } else { w += 1.0; }
  }
  o.color = vec4f(vis, w / 24.0, 0.0, M.p.x); return o; }`});const Be={buffers:[],varyings:{uv:"vec2f"},depth:!1,depthTest:!1,cull:"none",vs:as,colorFormat:"rgba16f"};be=x.pipeline(Object.assign({name:"rayMask",lib:[St.common],uniforms:{p:"vec4f"},textures:{tDepth:"depth",tOcc:"2d"},fs:`
fn skyAt(q: vec2f) -> f32 { return step(0.9999999, texFetchD(tDepth, clamp(vec2i(q * U.res.xy), vec2i(0, 0), vec2i(U.res.xy) - vec2i(1, 1)), 0)); }
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = U.res.zw;
  var m: f32 = 0.25 * (skyAt(v.uv + t * vec2f(-1.0, -1.0)) + skyAt(v.uv + t * vec2f(1.0, -1.0)) + skyAt(v.uv + t * vec2f(-1.0, 1.0)) + skyAt(v.uv + t * vec2f(1.0, 1.0)));
  m *= exp(-texLod(tOcc, v.uv, 0.0).x * 0.9);
  o.color = vec4f(m, 1.0, 0.0, 1.0); return o; }`},Be)),ht=x.pipeline(Object.assign({name:"raySweep",lib:[St.common],uniforms:{p:"vec4f"},textures:{tA:"2d"},fs:`
fn frag(v: VOut) -> FOut { var o: FOut;
  let s: vec2f = U.sunScr.xy; let dir: vec2f = s - v.uv; let asp: vec2f = vec2f(U.camUp.w, 1.0);
  var acc: vec2f = vec2f(0.0);
  for (var i: i32 = 0; i < 12; i++) {
    let f: f32 = (f32(i) + 0.5) / 12.0 * M.p.x;
    let q: vec2f = v.uv + dir * f;
    let m: vec2f = texLod(tA, clamp(q, vec2f(0.0), vec2f(1.0)), 0.0).xy;
    // first sweep: weigh each tap by how close to the sun it lies (the glare is brightest there, so that is where a shadow counts)
    let g: f32 = mix(1.0, exp(-length((q - s) * asp) / M.p.y), M.p.z);
    acc += vec2f(m.x * g, m.y * g);
  }
  o.color = vec4f(acc / 12.0, 0.0, 1.0); return o; }`},Be)),E=x.pipeline({name:"composite",lib:[St.common,St.hash,St.noise,St.tonemap],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",q:"vec4f",r:"vec4f",w:"vec4f",wb:"vec4f",sh:"vec4f",ws:"vec4f"},textures:{tScene:"2d",tBloom:"2d",tDepth:"depth",tVis:"2d",tRay:"2d"},colorFormat:"canvas",depth:!1,depthTest:!1,cull:"none",vs:as,fs:xo}),qe=x.pipeline({name:"motionBlur",lib:[St.common,St.depth,St.tonemap],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",d0:"vec4f",d1:"vec4f",rd:"vec4f",k0:"vec4f",k1:"vec4f",k2:"vec4f",k3:"vec4f",k4:"vec4f",k5:"vec4f",k6:"vec4f",k7:"vec4f"},textures:{tA:"2d",tDepth:"depth"},depth:!1,depthTest:!1,cull:"none",vs:as,fs:`
fn relAt(uv: vec2f, z: f32) -> vec3f {
  let ty: f32 = U.camRight.w; let tx: f32 = ty * U.camUp.w;
  return (U.camFwd.xyz + U.camRight.xyz * ((uv.x * 2.0 - 1.0) * tx) + U.camUp.xyz * ((1.0 - uv.y * 2.0) * ty)) * z;
}
// anything else that keeps pace with the lens (a deer running alongside): 0 on it, 1 away from it
fn rider(wp: vec3f, c: vec4f) -> f32 { if (c.w <= 0.0) { return 1.0; } return smoothstep(1.35 * c.w, 2.0 * c.w, length((wp - c.xyz) * vec3f(1.0, 0.8, 1.0))); }
// along a ski or a pole (a.xyz to b.xyz, a.w how thick a band stays sharp; 0: none): 0 on it, 1 as far again out. (The body's ball leaves the
// tips of the skis out: they reach 1.3 m from its middle, further in the air, and were smeared as if they were the snow going by)
fn limb(wp: vec3f, a: vec4f, b: vec4f) -> f32 { if (a.w <= 0.0) { return 1.0; } let ab: vec3f = b.xyz - a.xyz; let h: f32 = clamp(dot(wp - a.xyz, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0); return smoothstep(a.w, 2.0 * a.w, length(wp - a.xyz - ab * h)); }
fn kit(wp: vec3f, k0: vec4f, k1: vec4f, k2: vec4f, k3: vec4f, k4: vec4f, k5: vec4f, k6: vec4f, k7: vec4f) -> f32 { return limb(wp, k0, k1) * limb(wp, k2, k3) * limb(wp, k4, k5) * limb(wp, k6, k7); }
// a tap held to cap (exposed luminance) and greyed above it, by k (0: as it is)
fn tame(s: vec3f, ex: f32, k: f32, cap: f32) -> vec3f {
  let le: f32 = luma(s) * ex; if (le <= cap || k <= 0.0) { return s; }
  let g: vec3f = mix(s, vec3f(luma(s)), k * smoothstep(cap, 3.0 * cap, le));
  return g * mix(1.0, cap / le, k);
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let c0: vec3f = texLod(tA, v.uv, 0.0).rgb;
  let z: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let wp: vec3f = U.camPos.xyz + relAt(v.uv, z);
  let pc: vec4f = U.prevViewProj * vec4f(wp, 1.0);
  let sc: vec3f = U.player.xyz + vec3f(0.0, 0.85, 0.0);
  let keep: f32 = smoothstep(1.05, 1.6, length(wp - sc)) * rider(wp, M.d0) * rider(wp, M.d1) * kit(wp, M.k0, M.k1, M.k2, M.k3, M.k4, M.k5, M.k6, M.k7);
  var vel: vec2f = (v.uv - vec2f(pc.x / pc.w * 0.5 + 0.5, 0.5 - pc.y / pc.w * 0.5)) * M.p.x;
  vel *= keep * mix(1.0, M.p.z, smoothstep(150.0, 700.0, z)) * step(0.01, pc.w);
  let asp: vec2f = vec2f(U.camUp.w, 1.0);
  // (the corners: e is 0 over the middle of the frame and grows from rd.w out: with 0.6, a third of the way at the middle of each side)
  if (M.rd.z > 0.0) {
    let rc: vec2f = (v.uv - M.rd.xy) * asp; let e: f32 = smoothstep(M.rd.w, 1.414, length((v.uv - vec2f(0.5)) * 2.0));
    let lr: f32 = M.rd.z * e * sqrt(e) * keep; let lv: f32 = length(vel * asp);
    if (lr > lv) { vel += rc / (max(length(rc), 1e-4) * asp) * (lr - lv); }
  }
  let len: f32 = length(vel * asp);
  if (len > M.p.y) { vel *= M.p.y / len; }
  let lp: f32 = min(len, M.p.y) * U.res.y;
  if (lp < 0.8) { o.color = vec4f(c0, 1.0); return o; }
  // (white noise, not the interleaved-gradient pattern: that one repeats every third row, and beats with the ripples of the snow)
  let fr: f32 = U.origin.w - 64.0 * floor(U.origin.w / 64.0);
  let n: f32 = fract(sin(dot(v.clip.xy + vec2f(fr * 7.31, fr * 3.17), vec2f(12.9898, 78.233))) * 43758.5453);
  // (cap: a little over sunlit white snow (sun plus sky: a glint is some 30 times the sun), or over this pixel's own level where that is
  // brighter (the sky): nothing that the snow itself would smear is held back, dark edges do not grow dark streaks)
  let ex: f32 = U.ambSky.w; let kk: f32 = smoothstep(5.0, 16.0, lp); let cap: f32 = max(1.15 * luma(c0), 1.2 * luma(U.sunCol.rgb + U.ambSky.rgb)) * ex;
  var acc: vec3f = tame(c0, ex, kk, cap) * 0.25; var ws: f32 = 0.25;
  // (one look every three pixels or so along the streak, 9 to 16 of them: a long streak in a corner stays a line, not a row of beads)
  let nt: i32 = i32(clamp(ceil(lp / 3.0), 9.0, 16.0)); let nf: f32 = f32(nt);
  for (var i: i32 = 0; i < nt; i++) {
    let q: vec2f = clamp(v.uv + vel * ((f32(i) + n) / nf - 0.5), vec2f(0.0), vec2f(1.0));
    // what rides with the lens (the skier) leaves no streak on the ground behind it
    let zq: f32 = linDepth(texFetchD(tDepth, vec2i(q * U.res.xy), 0));
    let wq: vec3f = U.camPos.xyz + relAt(q, zq);
    let w: f32 = smoothstep(1.05, 1.6, length(wq - sc)) * rider(wq, M.d0) * rider(wq, M.d1) * kit(wq, M.k0, M.k1, M.k2, M.k3, M.k4, M.k5, M.k6, M.k7);
    // a glint is a point of ice 20 to 50 times the snow: averaged in as it is, one of them still burns a white (or prism-coloured) dash
    // through every pixel of its path, like rain on the glass. Once the streak is a few pixels long (kk) a tap is held to a little over the
    // level of sunlit snow (cap) and loses its prism colour: the sparkle trails off as a faint soft streak. A still frame is not touched
    let s: vec3f = tame(texLod(tA, q, 0.0).rgb, ex, kk, cap);
    acc += s * w; ws += w;
  }
  o.color = vec4f(acc / ws, 1.0); return o; }`}),e.pipes=[F,we,Y,E,D,be,ht,qe]},e.resize=function(C,ne){for(const je of e.mips)x.destroyTarget(je.t),x.destroyTexture(je.tex);J&&(x.destroyTarget(ae),x.destroyTexture(J),x.destroyTarget(ke),x.destroyTexture(X));{const je=Math.max(2,Math.ceil(C/4)),$e=Math.max(2,Math.ceil(ne/4));J=x.texture({w:je,h:$e,format:"rgba16f",filter:"linear",wrap:"clamp"}),ae=x.target({color:J}),X=x.texture({w:je,h:$e,format:"rgba16f",filter:"linear",wrap:"clamp"}),ke=x.target({color:X})}e.mips=[],re=C,m=ne;let Be=C,Ee=ne;for(let je=0;je<e.bloomLevels;je++){Be=Math.max(2,Be>>1),Ee=Math.max(2,Ee>>1);const $e=x.texture({w:Be,h:Ee,format:"rgba16f",filter:"linear"});e.mips.push({tex:$e,t:x.target({color:$e}),w:Be,h:Ee})}},e.visCut=function(){b=!1},e.motionBlur=function(C,ne,Be){const Ee=typeof a0<"u"&&a0.world&&a0.world.seg,je=[];for(let $e=0;$e<4;$e++){const nt=Ee&&Ee[$e];nt?je.push([nt[0][0],nt[0][1],nt[0][2],$e<2?.13:.06],[nt[1][0],nt[1][1],nt[1][2],0]):je.push([0,0,0,0],[0,0,0,0])}x.draw(qe,{u:{p:[e.shutter/Math.max(Be,1e-4),e.blurMax,e.blurFar,0],d0:e.riders[0],d1:e.riders[1],rd:[e.radC[0],e.radC[1],e.radial,e.radIn],k0:je[0],k1:je[1],k2:je[2],k3:je[3],k4:je[4],k5:je[5],k6:je[6],k7:je[7]},tex:{tA:C,tDepth:ne},count:3})},e.run=function(C,ne){const Be=e.mips;x.beginPass(_,b?{}:{color:[0,0,0,1]}),x.draw(D,{u:{p:[b?.3:1,0,0,0]},tex:{tDepth:ne,tOcc:e.occTex||c0.black,tCl:hs.sunTex},count:3}),x.endPass(),b=!0,x.beginPass(ae,{color:[0,0,0,1]}),x.draw(be,{u:{p:[0,0,0,0]},tex:{tDepth:ne,tOcc:e.occTex||c0.black},count:3}),x.endPass(),x.beginPass(ke,{color:[0,0,0,1]}),x.draw(ht,{u:{p:[1,e.rayCore,1,0]},tex:{tA:J},count:3}),x.endPass(),x.beginPass(ae,{color:[0,0,0,1]}),x.draw(ht,{u:{p:[1/12,e.rayCore,0,0]},tex:{tA:X},count:3}),x.endPass(),x.beginPass(Be[0].t,{color:[0,0,0,1]}),x.draw(F,{u:{p:[1/re,1/m,0,0]},tex:{tA:C},count:3}),x.endPass();for(let Ee=1;Ee<Be.length;Ee++)x.beginPass(Be[Ee].t,{color:[0,0,0,1]}),x.draw(we,{u:{p:[1/Be[Ee-1].w,1/Be[Ee-1].h,0,0]},tex:{tA:Be[Ee-1].tex},count:3}),x.endPass();for(let Ee=Be.length-2;Ee>=0;Ee--)x.beginPass(Be[Ee].t,{}),x.draw(Y,{u:{p:[1/Be[Ee+1].w,1/Be[Ee+1].h,1,0]},tex:{tA:Be[Ee+1].tex},count:3}),x.endPass();{const Ee=s(),je=1-Math.exp(-8*it(qt.dt||0,0,.1));e.gOld+=(Ee[0]-e.gOld)*je,e.gNew+=(Ee[1]-e.gNew)*je,e.white+=(w()-e.white)*je}x.beginPass(null,{color:[0,0,0,1]}),x.draw(E,{u:{p:[e.exposure,1/Be.length,e.rayBase*e.rays,e.rayOcc*e.rays],q:[e.satPre,e.satPost,e.flare,e.rayFall],r:[e.burst,e.ghosts*e.gOld,e.slow,e.speed],w:[e.wet,e.wetAge,e.wetSeed,e.fringe],wb:[e.wetBias[0],e.wetBias[1],e.wetNew,e.ghosts*e.gNew],sh:[e.chat[0]/re,e.chat[1]/m,e.chat[2],e.white],ws:[e.wetBlow,e.wetLook,e.wetC[0],e.wetC[1]]},tex:{tScene:C,tBloom:Be[0].tex,tDepth:ne,tVis:se,tRay:J},count:3}),x.endPass()},e})(),xo=`
// a ghost: light the lens throws back and forth between its own surfaces, the sun's image so far out of focus that it fills the round of the
// open iris. It lies on the line from the sun through the middle of the frame, at middle + k (sun - middle): a ghost past the middle
// swings the other way as the sun moves. The glass does not bend every colour alike, so red lies a little toward the sun and blue away from it
// (dk, in parts of that line): each ghost is fringed like a rainbow, and the more so the further the sun is from the middle. Away from the
// axis the barrel clips it into a cat's eye, narrow along the line (cat). p: this pixel, a: the sun, both from the middle in picture heights;
// r: radius (picture heights); soft: 0 a hard rim .. 1 falling off all the way in
fn ghostDisc(p: vec2f, a: vec2f, k: f32, u: vec2f, r: f32, soft: f32, squ: f32) -> f32 {
  let q: vec2f = p - a * k; let x: f32 = length(vec2f(dot(q, u) * squ, q.x * u.y - q.y * u.x)) / r;
  return 1.0 - smoothstep(1.0 - soft, 1.0, x);
}
fn ghost(p: vec2f, a: vec2f, k: f32, r: f32, dk: f32, soft: f32, cat: f32) -> vec3f {
  let la: f32 = max(length(a), 1e-4); let u: vec2f = a / la; let squ: f32 = 1.0 + cat * abs(k) * la;
  // (nothing to do away from it: most of the frame, for most of them)
  let q: vec2f = p - a * k; let rb: f32 = r + dk * la;
  if (dot(q, q) >= rb * rb) { return vec3f(0.0); }
  return vec3f(ghostDisc(p, a, k + dk, u, r, soft, squ), ghostDisc(p, a, k, u, r, soft, squ), ghostDisc(p, a, k - dk, u, r, soft, squ));
}
// the ghosts as a long lens strings them (after the reference from Steep): a small bright one near the middle, split red | green; a big faint
// lilac disc past it; a cat's eye of red, green and blue near the far edge; a wide pale wash beyond, mostly out of the frame; and, as a real
// lens has them too, a small green one between the sun and the middle and a big faint magenta disc beyond the sun (with the sun high in the
// chase view, those two stand in the sky). In the sun's own light, as a share of what a sunlit white shows (sunCol x exposure)
fn lensGhosts(uv: vec2f) -> vec3f {
  let asp: f32 = U.camUp.w; let p: vec2f = (uv - vec2f(0.5)) * vec2f(asp, 1.0); let a: vec2f = (U.sunScr.xy - vec2f(0.5)) * vec2f(asp, 1.0);
  var g: vec3f = vec3f(1.0, 0.86, 0.38) * ghost(p, a, 0.12, 0.04, 0.06, 0.7, 0.3) * 0.15;
  g += vec3f(0.95, 0.62, 1.0) * ghost(p, a, -0.34, 0.1, 0.02, 0.5, 0.3) * 0.08;
  g += vec3f(1.0, 0.95, 0.8) * ghost(p, a, -0.95, 0.04, 0.055, 0.8, 1.2) * 0.15;
  g += vec3f(1.0, 0.7, 0.95) * ghost(p, a, -1.3, 0.22, 0.03, 0.9, 0.4) * 0.03;
  g += vec3f(0.55, 1.0, 0.75) * ghost(p, a, 0.55, 0.022, 0.035, 0.7, 0.2) * 0.07;
  g += vec3f(1.0, 0.55, 0.95) * ghost(p, a, 1.55, 0.11, 0.025, 0.45, 0.25) * 0.06;
  return U.sunCol.rgb * g;
}
// what the sun does inside the lens: a veil of glare, a starburst from the iris, and a few faint reflections strung across the frame
fn lensFlare(uv: vec2f, vv: vec2f) -> vec3f {
  let vis: f32 = vv.x;
  let asp: f32 = U.camUp.w; let s: vec2f = U.sunScr.xy;
  let d: vec2f = (uv - s) * vec2f(asp, 1.0); let r: f32 = length(d);
  var f: vec3f = U.sunCol.rgb * (1.7 * exp(-r * 30.0) + 0.11 * exp(-r * 6.5) + 0.030 * exp(-r * 2.4));
  // starburst: thin rays, each with its own length
  let NR: f32 = 14.0;
  let a: f32 = atan2(d.y, d.x) / 6.2832 * NR + 0.31;
  var k: f32 = floor(a + 0.5); let da: f32 = (a - k) * 6.2832 / NR; k = k - NR * floor(k / NR);
  let h: f32 = fract(sin(k * 91.7 + 3.1) * 43758.5);
  let len: f32 = 0.018 + 0.055 * h * h + 0.008 * sin(U.camPos.w * (0.7 + h) + k);
  let ray: f32 = exp(-sq(r * sin(da) / (0.0014 + 0.013 * r))) * exp(-r / max(len, 0.01));
  f += U.sunCol.rgb * ray * (1.15 * M.r.x);
  // the ghosts as delivered (P.ghostV.a; M.r.y is 0 for the other versions): four faint discs of one colour each
  if (M.r.y > 0.0005) {
    let ax: vec2f = (vec2f(0.5) - s) * vec2f(asp, 1.0);
    let g1: f32 = length(d - ax * 1.45); let g2: f32 = length(d - ax * 1.85); let g3: f32 = length(d - ax * 0.55); let g4: f32 = length(d - ax * 2.5);
    var go: vec3f = vec3f(0.35, 1.0, 0.75) * smoothstep(0.050, 0.043, g1) * (0.35 + 0.65 * smoothstep(0.02, 0.05, g1)) * 0.016;
    go += vec3f(1.0, 0.55, 0.25) * smoothstep(0.022, 0.018, g2) * 0.03;
    go += vec3f(0.55, 0.45, 1.0) * smoothstep(0.085, 0.07, g3) * (0.2 + 0.8 * smoothstep(0.04, 0.085, g3)) * 0.008;
    go += vec3f(0.4, 0.8, 1.0) * smoothstep(0.13, 0.11, g4) * (0.15 + 0.85 * smoothstep(0.08, 0.13, g4)) * 0.006;
    f += U.sunCol.rgb * go * M.r.y;
  }
  f *= vis;
  // slow motion is shot through an anamorphic: for as long as time is held back a thin blue streak lies across the sun
  f += U.sunCol.rgb * vec3f(0.40, 0.66, 1.0) * ((exp(-abs(d.y) * 150.0) + 0.3 * exp(-abs(d.y) * 36.0)) * exp(-abs(d.x) * 3.2) * 0.2 * M.r.z * vis);
  // beams: the glare the air throws back, cut into streaks by whatever stands in front of the sun. They show most when the disc itself is
  // half hidden (less glare in the lens, and the eye opens up)
  let rb: vec2f = texLod(tRay, uv, 0.0).xy; let beam: f32 = rb.x / max(rb.y, 1e-5);
  f += U.sunCol.rgb * vec3f(1.0, 0.94, 0.84) * (beam * exp(-r * M.q.w) * (M.p.z + M.p.w * smoothstep(0.0, 0.45, 1.0 - vv.y)) * U.sunScr.z);
  return f;
}
// ---- snow on the glass. A hard landing, a bough or a fall throws snow at the lens. It lands white, melts within a few frames into beads
// that sit there and a few heavy enough to run, and in a second and a half the wind has dried it all. Water on the front of a lens is a
// small strong lens of its own, far out of focus: a bead gathers the light of everything in front of the camera (so it shows a soft,
// upside-down blur of the scene, and glows when the sun is in the picture), the rim away from the sun holds a crescent of its light and
// the sun itself stands in the bead as a point. Nothing is looked up here: a bead only moves where the picture behind it is read from.
// d: that displacement, for the sharp picture (uv); f: for the wide soft one, which stands on its head in every bead whatever its size (so a
// bead low on the snow holds a little of the sky); m: how much water stands on this pixel; e: the crescent (+) and the dark rim opposite (-);
// gl: the sun in it
struct Wet { d: vec2f, f: vec2f, m: f32, e: f32, gl: f32, }
fn wetNone() -> Wet { var w: Wet; w.d = vec2f(0.0); w.f = vec2f(0.0); w.m = 0.0; w.e = 0.0; w.gl = 0.0; return w; }
// how thickly the snow landed on each part of the glass (pc: in picture heights): more on the side it came from, little straight in front of the skier
fn wetDens(pc: vec2f) -> f32 {
  let u: vec2f = pc / vec2f(U.camUp.w, 1.0) * 2.0 - 1.0; let k: vec2f = pc - vec2f(0.5 * U.camUp.w, 0.64);
  return max(1.0 + 0.85 * M.wb.x * u.x + 0.4 * M.wb.y * u.y, 0.15) * (1.0 - 0.8 * exp(-dot(k, k) * 9.0));
}
// one bead, from where this pixel stands in it. nn: -1..1 across it; r: its radius (picture heights); s: how much of it is left; sd: toward the sun
fn wetLens(nn: vec2f, r: f32, s: f32, sd: vec2f) -> Wet {
  var w: Wet = wetNone(); let l: f32 = length(nn);
  if (l >= 1.0) { return w; }
  w.m = smoothstep(1.0, 0.5, l) * s; w.d = nn * (-2.4 * r * w.m); w.f = nn * -0.42;
  // (the meniscus: a thin bright line just inside the edge, brightest on the side away from the sun. Never a dark rim: on the night
  // snow that read as a stain, a grey decal with an outline)
  w.e = (0.35 + 0.65 * max(-dot(nn, sd), 0.0)) * smoothstep(0.55, 0.85, l) * smoothstep(1.0, 0.86, l) * s;
  let gp: vec2f = nn + sd * 0.45; w.gl = exp(-dot(gp, gp) * 24.0) * s;
  return w;
}
// a grid of beads, at most one to a cell and wholly inside it (so no cell need ask its neighbours). n: cells to the picture's height;
// dens: the share of cells that hold one; life: the wetness at which the longest- and the shortest-lived of them are gone
fn wetBeads(p: vec2f, n: f32, seed: f32, dens: f32, life: vec2f, sd: vec2f) -> Wet {
  let g: vec2f = p * n; let id: vec2f = floor(g); let f: vec2f = g - id;
  let h: vec3f = hash33(vec3f(id, seed)); let k: vec3f = hash33(vec3f(id, seed + 31.0));
  // each bead has its own moment to go, and shrinks as it dries
  let s: f32 = smoothstep(0.0, 0.28, M.w.x - mix(life.x, life.y, k.x));
  if (s <= 0.0 || h.z > dens * wetDens((id + 0.5) / n)) { return wetNone(); }
  // (smaller by night: under the dark sky a big bead is a hole in the picture, not a drop of water)
  let r0: f32 = mix(0.07, 0.19, k.y * k.y) * mix(1.0, 0.6, U.skyP.w);
  let q: vec2f = f - (vec2f(1.5 * r0) + h.xy * (1.0 - 3.0 * r0));
  // (not round: melt keeps the outline of the crumb of snow it was)
  let th: f32 = atan2(q.y, q.x + 1e-6);
  let r: f32 = r0 * (0.4 + 0.6 * s) * (1.0 + 0.08 * sin(2.0 * th + k.z * 6.28) + 0.07 * sin(3.0 * th + h.x * 6.28) + 0.04 * sin(5.0 * th + h.y * 6.28));
  return wetLens(q / r, r / n, s, sd);
}
// the beads heavy enough to run: each slides down the glass, a little outward as the wind over the lens pushes it, and leaves a thinning
// film behind it. Tall cells, their rows staggered from one column to the next so that the starts do not line up
fn wetRun(p: vec2f, seed: f32, dens: f32, sd: vec2f) -> Wet {
  let cx: f32 = floor(p.x * 9.0); let gy: f32 = p.y * 2.2 + hash21(vec2f(cx, seed + 53.0)); let cy: f32 = floor(gy);
  let f: vec2f = vec2f(p.x - cx / 9.0, (gy - cy) / 2.2);
  let h: vec3f = hash33(vec3f(cx, cy, seed + 71.0)); let k: vec3f = hash33(vec3f(cx, cy, seed + 97.0));
  let pc: vec2f = vec2f((cx + 0.5) / 9.0, p.y - f.y + 0.2);
  let s: f32 = smoothstep(0.0, 0.3, M.w.x - mix(0.30, 0.70, k.x));
  if (s <= 0.0 || h.z > dens * wetDens(pc)) { return wetNone(); }
  let rh: f32 = mix(0.010, 0.018, k.y) * (0.5 + 0.5 * s);
  let run: f32 = mix(0.07, 0.24, k.z) * (1.0 - exp(-M.w.y * mix(1.5, 3.2, h.x)));
  let a: vec2f = vec2f(mix(0.040, 0.071, h.x), mix(0.03, 0.15, h.y));
  let t: f32 = saturate((f.y - a.y) / max(run, 1e-4));
  let px: f32 = a.x + (pc.x / U.camUp.w - 0.5) * 0.24 * run * t + 0.0035 * sin(f.y * 80.0 + h.y * 31.0) * t;
  let rr: f32 = rh * mix(0.28, 1.0, t * t * t);
  var w: Wet = wetLens((f - vec2f(px, a.y + run * t)) / rr, rr, mix(0.4, 1.0, t * t) * s, sd);
  // (the film it leaves is a soft wet streak: little refraction and no meniscus along it, only the bead at its foot has an edge)
  w.gl *= t * t * t; w.e *= t * t; w.m *= mix(0.45, 1.0, t); w.d *= t * t;
  return w;
}
fn lensWet(uv: vec2f) -> Wet {
  let asp: f32 = U.camUp.w; let p: vec2f = uv * vec2f(asp, 1.0);
  let sd: vec2f = normalize((U.sunScr.xy - uv) * vec2f(asp, 1.0) + vec2f(1e-4, 0.0));
  // (where the snow stays snow, the water is only what is left of it as it goes: a few small beads, no runs)
  let k: f32 = mix(1.0, 0.3, M.ws.y);
  let a: Wet = wetBeads(p, 4.5, M.w.z, 0.22 * k, vec2f(0.02, 0.60), sd);                            // the beads
  let b: Wet = wetBeads(p + vec2f(0.37, 0.19), 12.0, M.w.z + 7.0, 0.16 * k, vec2f(0.30, 0.80), sd); // a mist of fine ones, first to dry
  let c: Wet = wetRun(p, M.w.z, 0.10 * (1.0 - M.ws.y), sd);
  var w: Wet; w.d = (a.d + b.d + c.d) / vec2f(asp, 1.0); w.f = (a.f + b.f + c.f) / vec2f(asp, 1.0); w.m = min(a.m + b.m + c.m, 1.0); w.e = a.e + b.e + c.e; w.gl = a.gl + 0.6 * b.gl + c.gl;
  return w;
}
// ---- snow that stays snow (Variants 'lens' b and c). Below freezing what hits the glass is white and dry: crumbs of a few lumps each, with
// frayed, grainy edges where single crystals stand out, and here and there a crystal that catches the sun. It does not melt in a moment:
// the air going by pushes it across the glass, out from the point the lens is heading for (faster the faster the skier goes, 07c_feel.js),
// so the middle of the frame clears first and the crumbs leave over the edges; and it shrinks as it is torn away. It is so close to the
// lens that it is far out of focus: soft, but not clear. m: how much it covers this pixel (0..1); g: a crystal glinting there; t: the grain
// of it, to vary its light. p: where this pixel's snow was when it landed (picture heights; the spreading is undone by the caller)
struct Sno { m: f32, g: f32, t: f32, }
fn snoCrumbs(p: vec2f, n: f32, seed: f32, dens: f32, life: vec2f, px: f32) -> Sno {
  var o: Sno; o.m = 0.0; o.g = 0.0; o.t = 0.0;
  let g: vec2f = p * n; let id: vec2f = floor(g); let f: vec2f = g - id;
  let h: vec3f = hash33(vec3f(id, seed + 3.0)); let k: vec3f = hash33(vec3f(id, seed + 41.0));
  // each crumb is torn away at its own moment as the snow goes, and shrinks toward it
  let s: f32 = smoothstep(0.0, 0.22, M.w.x - mix(life.x, life.y, k.x));
  if (s <= 0.0 || h.z > dens * wetDens((id + 0.5) / n)) { return o; }
  let r0: f32 = mix(0.12, 0.20, k.y * k.y); let q: vec2f = f - (vec2f(2.2 * r0) + h.xy * (1.0 - 4.4 * r0));
  // a clot of snow, not a disc: a core and four lumps of their own sizes thrown out round it, so the outline is lobed and uneven
  var e: f32 = length(q * vec2f(1.0, mix(0.8, 1.25, h.x))) / r0;
  for (var i: i32 = 0; i < 4; i++) {
    let j: vec3f = hash33(vec3f(id, seed + 59.0 + f32(i) * 13.0));
    let rl: f32 = r0 * mix(0.35, 0.80, j.z * j.z); e = min(e, length(q - (j.xy - 0.5) * r0 * 2.2) / rl);
  }
  e /= mix(0.35, 1.0, s);
  // the edge frays into grains (a noise a crumb across, then single crystals). How sharp it is: as soft as the lens is out of focus,
  // but never softer than a pixel or two
  let fq: vec2f = (p * n) * 7.0 + h.xy * 50.0;
  let fr: f32 = 0.55 * vnoise2(fq) + 0.30 * vnoise2(fq * 2.7 + 3.1) + 0.15 * vnoise2(fq * 7.3 + 1.7) - 0.5;
  let grain: f32 = hash21(floor(p * 900.0 + h.xy * 97.0));
  let ee: f32 = e + fr * 0.75 + (grain - 0.5) * 0.30 * smoothstep(0.6, 1.0, e);
  let soft: f32 = max(0.08, px * n / r0 * 2.5);
  // (dense in the middle, thinning toward the frayed rim, where the light comes through between the crystals)
  o.m = smoothstep(1.0 + soft, 1.0 - soft * 1.6, ee) * mix(0.55, 1.0, smoothstep(1.0, 0.35, ee)) * mix(0.80, 0.97, k.z) * min(s * 1.6, 1.0);
  // single crystals out in the fraying edge, and stood proud on the crumb: some catch the sun
  let gc: vec2f = floor(p * 220.0 + h.xy * 13.0); let gh: vec3f = hash33(vec3f(gc, seed + 5.0));
  let gd: vec2f = fract(p * 220.0 + h.xy * 13.0) - (0.25 + 0.5 * gh.xy);
  let spec: f32 = smoothstep(0.30, 0.0, length(gd)) * step(0.82, gh.z) * smoothstep(1.45, 0.75, ee) * s;
  o.m = max(o.m, spec * 0.7);
  o.g = spec * step(0.93, gh.z);
  o.t = fr + 0.6 * (grain - 0.5) * smoothstep(0.9, 0.4, ee);
  return o;
}
fn lensSnow(uv: vec2f) -> Sno {
  let asp: f32 = U.camUp.w; let c: vec2f = M.ws.zw * vec2f(asp, 1.0);
  // undo the spreading: where this pixel's snow lay when it landed. (Torn and pushed, the far ones go faster than an even stretch would take them)
  let p1: vec2f = uv * vec2f(asp, 1.0); let dv: vec2f = p1 - c; let rr: f32 = length(dv);
  let p: vec2f = c + dv * exp(-M.ws.x * (0.75 + 0.5 * rr));
  let px: f32 = 1.0 / max(U.res.y, 1.0);
  let a: Sno = snoCrumbs(p, 2.6, M.w.z, 0.75, vec2f(0.03, 0.55), px);                // the crumbs
  let b: Sno = snoCrumbs(p + vec2f(0.29, 0.53), 7.0, M.w.z + 17.0, 0.45, vec2f(0.15, 0.75), px);   // and a spatter of small ones
  var o: Sno; o.m = 1.0 - (1.0 - a.m) * (1.0 - b.m); o.g = max(a.g, b.g); o.t = select(b.t, a.t, a.m > b.m);
  // nothing in the very middle of the frame for long: the air there pushes hardest on what stands in its way (wetDens already keeps
  // most of it off the skier)
  return o;
}
fn frag(v: VOut) -> FOut { var o: FOut;
  // (the sun's visibility is eased over a few frames; once the sun is behind the lens its projected point is a mirror image in the frame,
  // so what is left of that easing must not light a starburst and ghosts there: after a cut to a view facing away, a star lay on the snow)
  let vv: vec2f = texLod(tVis, vec2f(0.5), 0.0).xy * vec2f(U.sunScr.z, 1.0);
  let c: vec2f = v.uv - 0.5; let asp: f32 = U.camUp.w;
  // the skis rubbing on the snow shake the camera, not the glass: the scene is read a whole pixel or so aside (07c_feel.js; never a part
  // of one, which would soften it) and turned by a hair about the middle of the frame. Beads, flare and the dark corners stay where they are
  let sk: vec2f = M.sh.xy + M.sh.z * vec2f(-c.y / asp, c.x * asp);
  // (the sharp picture is read a little way off inside a bead, the glow from well beyond it: a bead takes in a wide field)
  var uv: vec2f = v.uv + sk; var uvb: vec2f = uv; var wt: Wet = wetNone(); var sn: Sno; sn.m = 0.0; sn.g = 0.0; sn.t = 0.0;
  if (M.w.x > 0.004) {
    wt = lensWet(v.uv);
    // (snow that has not melted is not water: no beads bend the picture where it still lies, only those of what has melted)
    if (M.ws.y > 0.0) { sn = lensSnow(v.uv); let wk: f32 = 1.0 - M.wb.z; wt.d *= wk; wt.f *= wk; wt.m *= wk; wt.e *= wk; wt.gl *= wk; }
    uv += wt.d; uvb = clamp(uvb + wt.f, vec2f(0.0), vec2f(1.0));
  }
  var col: vec3f = texLod(tScene, uv, 0.0).rgb;
  // at speed the glass shows its faults: toward the sides of the frame red and blue part company. (Two more looks at the scene, and only
  // then; the middle of the picture and the skier are not touched)
  if (M.r.w > 0.004) {
    let cp: vec2f = c * vec2f(asp, 1.0); let off: vec2f = c * (dot(cp, cp) / (0.25 * (asp * asp + 1.0)) * M.w.w * M.r.w);
    col = vec3f(texLod(tScene, uv - off, 0.0).r, col.g, texLod(tScene, uv + off, 0.0).b);
  }
  let bloom: vec3f = texLod(tBloom, uvb, 0.0).rgb * M.p.y;
  // (slow motion blooms a touch more; water on the glass is far out of focus, and what it shows is mostly glow)
  // (a bead shows nothing sharp: the scene here is already streaked by the shutter, and a hard tree edge refracted through it read as a
  // speckled dark shard. Its whole inside is the glow, only its rim reads the picture behind it)
  col = mix(col, bloom, min(0.06 + 0.04 * M.r.z + 4.0 * wt.m, 1.0));
  if (wt.m > 0.0) {
    // snow that has only just landed is still white (lit through from in front when the lens looks at the sun); melted, it holds the sun's
    // light. (It only ever adds light: against anything brighter than itself, the nebula say, a crumb does not show)
    let rs: f32 = length((U.sunScr.xy - v.uv) * vec2f(asp, 1.0));
    col = mix(col, max(col, U.ambSky.rgb * 1.2 + U.sunCol.rgb * (0.35 * vv.x)), M.wb.z * wt.m);
    // (water gathers light, it does not stand in front of it: a bead is never darker than the picture it sits on)
    let lo: f32 = luma(texLod(tScene, v.uv + sk, 0.0).rgb); col *= mix(1.0, max(1.0, lo / max(luma(col), 1e-5)), wt.m);
    col = col * (1.0 + 0.45 * wt.e * (1.0 - M.wb.z) * (0.4 + 0.6 * vv.x)) + U.sunCol.rgb * (vv.x * M.q.z * (0.6 * wt.gl + wt.m * (0.015 + 0.14 * exp(-rs * 2.4))));
  }
  if (sn.m > 0.0) {
    // the snow on the glass is lit by all that is in front of the lens: the scene's own glow behind it (so it is a dim grey in the shade
    // and at night, never a white that shines on its own), the sky, and the sun from in front, which it scatters forward and glows with
    // when the lens looks toward it. Its grain varies that a little; a crystal that catches the sun is a point of its light
    let rs: f32 = length((U.sunScr.xy - v.uv) * vec2f(asp, 1.0));
    // (snow scatters every colour alike: what it takes from the glow behind it comes out whiter than it went in)
    let bl: f32 = luma(bloom);
    let sc: vec3f = max(mix(bloom, vec3f(bl), 0.6) * 1.35, U.ambSky.rgb * 1.3 + U.sunCol.rgb * (vv.x * (0.18 + 0.6 * exp(-rs * 1.6))));
    col = mix(col, sc * (1.0 + 0.55 * sn.t), sn.m * M.wb.z) + U.sunCol.rgb * (sn.g * M.wb.z * vv.x * M.q.z * 1.2);
  }
  col += lensFlare(v.uv, vv) * M.q.z;
  // white balance toward the low sun (sunlit snow a warm white, sky-lit shadows properly blue), exposure, then the film curve.
  // chroma is pushed a little before the curve (deep sky, rich shadows) and again after it.
  col *= vec3f(0.93, 1.0, 1.10) * M.p.x;
  // path to white: film and the eye lose colour as light nears their top, so backlit spray, a sunlit cloud edge or the glare round the sun
  // go gold at their rims and white where they are densest, never a saturated yellow "fire" (the curve works per channel, and red and green
  // reach its shoulder together long before blue does). Graded on brightness, so the warm snow of the low sun keeps its colour and the deep
  // blue and violet lights of the night (bright but dim to the eye) are hardly touched. M.sh.w: how strongly (Post.white, Variants 'hi'; 0 = as before)
  let l0: f32 = luma(col); let wk: f32 = M.sh.w * smoothstep(0.35, 1.5, l0);
  col = max(vec3f(l0) + (col - vec3f(l0)) * mix(M.q.x, 1.0, wk), vec3f(0.0));
  col = mix(col, vec3f(l0), 0.75 * wk);
  col = filmCurve(col);
  let l: f32 = luma(col);
  col = max(mix(vec3f(l), col, mix(M.q.y, 1.0, wk)), vec3f(0.0));
  // the ghosts lie over the finished picture as a faint veil of colour, whatever is behind them: through the film curve they would glare on
  // the dark trees and the skier and be lost on the snow, which is most of the frame. Only while the sun's disc is in sight, so a ridge, a
  // tree or the skier put them out (and much less of them from the moon)
  if (vv.x * M.wb.w > 0.0005) { col += lensGhosts(v.uv) * vec3f(0.93, 1.0, 1.10) * (M.p.x * M.q.z * M.wb.w * vv.x); }
  // the lens falls off toward its corners (a wide one loses a good deal more than this). At speed, and while time is held back, the far
  // sides of the frame close in as well: blinkers, not a tunnel, so the sky over the skier and the snow under the skis keep their light
  let e2: f32 = 3.0 * c.x * c.x + c.y * c.y;
  col *= 1.0 - 0.34 * smoothstep(0.20, 0.95, dot(c, c) * 2.0) - (0.15 * M.r.w + 0.12 * M.r.z) * smoothstep(0.35, 1.0, e2);
  col = toSRGB(saturate(col));
  col += (ign(v.clip.xy) - 0.5) / 255.0;
  o.color = vec4f(col, 1.0); return o; }
`,$s=`
fn groundH(p: vec3f) -> f32 {
  let g: vec2f = p.xz * M.hx.x + M.hx.yz; let c0: vec2f = floor(g); let f: vec2f = g - c0;
  let i0: vec2i = vec2i(c0) & vec2i(255, 255); let i1: vec2i = (vec2i(c0) + vec2i(1, 1)) & vec2i(255, 255);
  let h00: f32 = texFetch(tH, i0, 0).x; let h10: f32 = texFetch(tH, vec2i(i1.x, i0.y), 0).x;
  let h01: f32 = texFetch(tH, vec2i(i0.x, i1.y), 0).x; let h11: f32 = texFetch(tH, i1, 0).x;
  return mix(mix(h00, h10, f.x), mix(h01, h11, f.x), f.y) + ${bs.toFixed(4)} * p.z + M.hx.w;
}
`,Gs=`
struct GlintV { clip: vec4f, uv: vec2f, shp: vec4f, col: vec4f, }
fn glintCull() -> GlintV { var g: GlintV; g.clip = vec4f(0.0, 0.0, -2.0, 1.0); g.uv = vec2f(0.0); g.shp = vec4f(0.0); g.col = vec4f(0.0); return g; }
// corner: quad corner (-1..1). pos/vel: render-space position and velocity. seed: 0..1. power: light of the crystal. vis: sun visibility.
fn glintQuad(corner: vec2f, pos: vec3f, vel: vec3f, seed: f32, power: f32, vis: f32, rmin0: f32, shutK: f32) -> GlintV {
  var g: GlintV = glintCull();
  let rel: vec3f = pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz);
  if (zv < 0.12 || power <= 0.0) { return g; }
  let cp: vec4f = U.viewProj * vec4f(pos, 1.0); let ndc: vec2f = cp.xy / cp.w;
  if (abs(ndc.x) > 1.25 || abs(ndc.y) > 1.25) { return g; }
  // hidden behind the scene? (one depth fetch per crystal, in the vertex stage)
  let pix: vec2f = clamp((vec2f(ndc.x, -ndc.y) * 0.5 + 0.5) * U.res.xy, vec2f(0.0), U.res.xy - 1.0);
  let sz: f32 = linDepth(texFetchD(tDepth, vec2i(pix), 0));
  if (zv > sz + 0.03) { return g; }
  // where it was one shutter ago -> streak
  let pp: vec4f = U.prevViewProj * vec4f(pos - vel * U.misc.z, 1.0);
  var mv: vec2f = vec2f(0.0);
  if (pp.w > 0.05) { mv = (ndc - pp.xy / pp.w) * vec2f(0.5, -0.5) * U.res.xy * (U.dof.w * shutK / max(U.misc.z, 0.004)); }
  var ml: f32 = length(mv); var ax: vec2f = vec2f(1.0, 0.0);
  if (ml > 0.25) { ax = mv / ml; }
  // circle of confusion (px): sharp at the skier, soft discs close to the lens
  let sc: f32 = U.res.y / 1170.0;
  let coc: f32 = min(U.dof.y * abs(1.0 / U.dof.x - 1.0 / zv), U.dof.z) * sc;
  let rmin: f32 = max(0.62 * sc, rmin0);
  let rad: f32 = sqrt(coc * coc + rmin * rmin);
  // a sharp crystal streaks with the shutter; one blurred into a lens disc is already smeared, so it stays (almost) round
  // (a crumb of snow going past the lens is another matter: that is a streak however soft it is)
  ml = min(ml, 0.16 * U.res.y) * mix(min(1.0, 2.2 * sc / rad), 1.0, saturate(shutK - 1.0));
  let hl: f32 = ml * 0.5;
  let ext: vec2f = vec2f(hl + rad + 1.0, rad + 1.0);
  let lp: vec2f = corner * ext;                                        // local px: x along the streak
  let opx: vec2f = ax * lp.x + vec2f(-ax.y, ax.x) * lp.y;
  g.clip = vec4f((ndc + opx * vec2f(2.0, -2.0) * U.res.zw) * cp.w, cp.z, cp.w);
  g.uv = lp; g.shp = vec4f(hl, rad, coc / max(rad, 0.01), zv);
  // --- light. A crystal is a tumbling plate: most of the time a faint forward-scattered spark, now and then a mirror flash of the sun.
  let V: vec3f = -rel / max(length(rel), 1e-3); let L: vec3f = U.sunDir.xyz;
  let Hh: vec3f = normalize(V + L);
  let tm: f32 = U.camPos.w;
  let a1: f32 = seed * 311.7 + tm * (2.2 + 5.0 * fract(seed * 17.31)); let a2: f32 = seed * 127.1 + tm * (1.7 + 4.0 * fract(seed * 43.77));
  let nrm: vec3f = vec3f(sin(a1) * cos(a2), cos(a1), sin(a1) * sin(a2));
  let fl: f32 = pow(abs(dot(nrm, Hh)), 90.0);
  let ci: f32 = saturate(dot(Hh, L)); let fres: f32 = 0.04 + 0.96 * pow(1.0 - ci, 5.0);
  let mu: f32 = dot(-V, L);
  let fwd: f32 = 0.5 * hg(mu, 0.84) + 0.5 * hg(mu, 0.3);
  let e: f32 = power * vis * (fwd * 1.5 + fl * (0.5 + 13.0 * fres));
  // spread the same light over the blurred / streaked footprint; big lens discs keep a floor so they still read as discs
  let area: f32 = 3.14159 * rad * rad + 4.0 * rad * hl;
  let k: f32 = (3.14159 * 0.85 * 0.85 * sc * sc) / pow(area, 0.78);
  // faint prismatic tint on the flashes
  let hue: vec3f = mix(vec3f(1.0, 0.84, 0.56), vec3f(0.56, 0.84, 1.0), fract(seed * 7.0));
  let tint: vec3f = mix(vec3f(1.0), hue, 0.26 * saturate(fl * 4.0));
  var gc: vec3f = U.sunCol.rgb * vec3f(0.90, 1.0, 1.12) * tint * e;
  // in the beam of the headlamp the same crystal flashes back at the lamp (and at the lens behind it)
  if (U.lamp.w > 0.0) {
    let ll: vec3f = lampLight(pos);
    if (ll.x > 0.00002) { let Ld: vec3f = normalize(U.lamp.xyz - pos); let f2: f32 = pow(abs(dot(nrm, normalize(V + Ld))), 60.0); gc += ll * tint * (power * (0.22 + 7.0 * f2)); }
  }
  g.col = vec4f(gc * k, fl);
  return g;
}
fn glintShade(uv: vec2f, shp: vec4f, col: vec4f) -> vec4f {
  let d: f32 = length(vec2f(max(abs(uv.x) - shp.x, 0.0), uv.y));
  let r: f32 = shp.y;
  let bk: f32 = smoothstep(2.5, 7.0, r) * shp.z;
  let aa: f32 = max(1.0, r * (0.12 + 0.16 * bk));
  var a: f32 = smoothstep(r, r - aa, d);
  // lens discs: soft edge, a slightly brighter rim and a hollow-ish centre (spherical aberration), only once they are clearly out of focus
  a *= mix(1.0, 0.70 + 0.5 * smoothstep(0.5 * r, 0.9 * r, d), bk);
  return vec4f(col.rgb * a, 0.0);
}
`,oa=`
struct Fly { pos: vec3f, vel: vec3f, run: vec3f, }
fn snowFly(p0: vec3f, v0: vec3f, t: f32, L: f32, tb: f32, vs: f32, wk: f32) -> Fly {
  var f: Fly;
  let s0: f32 = length(v0); let dir: vec3f = v0 / max(s0, 1e-4);
  let eb: f32 = exp(-t / tb); let q: f32 = s0 * tb / L * (1.0 - eb);
  let ts: f32 = max(vs / 9.81, 0.03); let es: f32 = exp(-t / ts);
  let vT: vec3f = U.wind.xyz * wk + vec3f(0.0, -vs, 0.0);
  f.run = dir * (L * log(1.0 + q));                                     // the path of the throw so far
  f.pos = p0 + f.run + vT * (t - ts * (1.0 - es));
  f.vel = dir * (s0 * eb / (1.0 + q)) + vT * (1.0 - es);
  return f;
}
`,Jt=(()=>{const e={NP:12288,NG:16384,PF:16,GF:12,gain:1,reach:1,clots:.22,lens:1.3,bump:1,tear:1,speck:1,keyhole:1,nearBlur:.75,shutter:!0,streakMax:.06,crumb:1,grainShutter:4,face:0,grainy:!0,shadows:!0,enabled:!0,moonMix:0,night:null,nt:0,stats:{puffs:0,grains:0}};typeof Dt<"u"&&Dt.def("nspray","夜间雪雾",[["a","暗蓝头灯"],["b","月光亮些"]],"a"),typeof Dt<"u"&&Dt.def("curtain","雪幕高度",[["a","处处都高"],["b","按雪况"],["c","折中"]],"c"),typeof Dt<"u"&&Dt.def("spray","扬雪",[["a","雪雾（旧）"],["b","颗粒（真实）"],["c","折中"]],"a"),e.oldK=()=>{const he=typeof Dt<"u"?Dt.val.spray:"b";return he==="a"?1:he==="c"?.5:0},e.curtainK=function(he){const H=typeof Dt<"u"?Dt.val.curtain:"c",z=ge(.25,.9,he);return H==="a"?[1,1]:H==="b"?[Re(.32,1.2,z),Re(.45,1.6,z)]:[Re(.62,1.12,z),Re(.62,1.4,z)]};let s,w,x,F,we,Y,E,D,be,ht,qe,se,_,b=0,re=0,m=0,J=0;const ae=[],X=[];let ke=0,C=0;const ne=D0(977);e.onEmit=[],e.fogMul=1,e.plume=1,e.shadowK=2;const Be=[0,0,0,0],Ee=[0,0,0,0],je=()=>{if(typeof F0>"u"||!F0.liftU)return Be;const he=F0.liftU(),H=typeof qt<"u"&&qt.origin||Be;return Ee[0]=he[0]-H[0],Ee[1]=he[1]-H[2],Ee[2]=he[2],Ee[3]=he[3],Ee};function $e(he,H,z,V,I,Q,L,ye,Ve){if(!e.onEmit.length)return;const Ne={kind:he,t:H,p:z,v:V,spread:I,rate:Q,powder:L,r:ye,f:Ve};for(const Ce of e.onEmit)try{Ce(Ne)}catch(Ye){typeof console<"u"&&console.warn("Spray.onEmit",Ye)}}e.init=function(he){s=he,F=new Float32Array(e.NP*e.PF),we=new Float32Array(e.NG*e.GF),w=s.buffer(F,"vertex",!0),x=s.buffer(we,"vertex",!0),Y=s.pipeline({name:"sprayPuff",lib:[St.common,St.depth,St.shadow,St.sprayTau,$s,oa,Ea],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"add4",buffers:[{instanced:!0,attrs:[["a0","vec4f"],["a1","vec4f"],["a2","vec4f"],["a3","vec4f"]]}],varyings:{uv:"vec2f",d0:"vec4f",d1:"vec4f",d2:"vec4f"},uniforms:{hx:"vec4f",hx2:"vec4f",fc:"vec4f",lf:"vec4f"},textures:{tH:"fetch",tDepth:"depth",tDetail:"2d",tShadow:"shadow",tSunTau:"2d"},vs:bo,fs:yo}),se=s.texture({w:qt.sprayRes,h:qt.sprayRes,format:"rgba16f",filter:"linear",wrap:"clamp"}),_=s.target({color:se}),e.sunTex=se,E=s.pipeline({name:"spraySun",lib:[St.common,$s,oa,Ea],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"add4",colorFormat:"rgba16f",buffers:[{instanced:!0,attrs:[["a0","vec4f"],["a1","vec4f"],["a2","vec4f"],["a3","vec4f"]]}],varyings:{uv:"vec2f",d0:"vec4f"},uniforms:{hx:"vec4f",sn:"vec4f",lf:"vec4f"},textures:{tH:"fetch"},vs:ko,fs:Mo}),D=s.pipeline({name:"sprayComposite",lib:[St.common,St.depth,St.tnoise],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",q:"vec4f",r:"vec4f",c:"vec4f"},textures:{tSpray:"2d",tDepth:"depth",tNoise:"2d"},depth:!1,depthTest:!1,cull:"none",blend:"trans",vs:as,fs:zo}),be=s.pipeline({name:"sprayGrain",lib:[St.common,St.depth,St.shadow,St.sprayTau,$s,oa,Gs],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"trans",buffers:[{instanced:!0,attrs:[["a0","vec4f"],["a1","vec4f"],["a2","vec4f"]]}],varyings:{uv:"vec2f",shp:"vec4f",col:"vec4f",cc:"vec4f"},uniforms:{hx:"vec4f",gp:"vec4f"},textures:{tH:"fetch",tDepth:"depth",tShadow:"shadow",tSunTau:"2d"},vs:So,fs:`fn frag(v: VOut) -> FOut { var o: FOut;
  let g: vec4f = glintShade(v.uv, v.shp, v.col);
  // the crumb itself: a small white body over whatever is behind it (its flash is light, and is added)
  let d: f32 = length(vec2f(max(abs(v.uv.x) - v.shp.x, 0.0), v.uv.y)); let r: f32 = v.shp.y;
  // out of focus a body is its own outline spread over the lens disc: a soft core that thins to nothing, not the hard-edged disc
  // a point of light makes. rho = how much of the radius is still solid.
  let cz: f32 = v.shp.z; let rt: f32 = sqrt(max(1.0 - cz * cz, 0.0)); let rho: f32 = max(rt - cz, 0.0) / max(rt + cz, 1e-3);
  let a: f32 = smoothstep(r, min(r * rho, r - max(1.0, r * 0.3)), d) * min(1.0, v.cc.a / (0.3 + 0.7 * rho * rho));
  // (by night a crumb is light, not pepper: it takes little of what is behind it, so a dim one is nothing on lit snow, never a dark blue fleck)
  o.color = vec4f(g.rgb + v.cc.rgb * a, 1.0 - a * mix(1.0, 0.15, M.gp.z)); return o; }`}),e.pipes=[Y,E,D,be]},e.resize=function(he,H){qe&&(s.destroyTarget(qe),s.destroyTexture(ht)),b=Math.max(2,he>>1),re=Math.max(2,H>>1),ht=s.texture({w:b,h:re,format:"rgba16f",filter:"linear"}),qe=s.target({color:ht}),o0.occTex=ht};function nt(he,H){const z=he[he.length-1];z&&z[0]+z[1]===H?z[1]++:he.push([H,1])}e.puff=function(he,H,z,V,I,Q,L,ye,Ve,Ne,Ce,Ye,T,Se,me,B){const U=qt.origin,A=m*e.PF,a=F,oe=ne();a[A]=H-U[0],a[A+1]=z-U[1],a[A+2]=V-U[2],a[A+3]=he,a[A+4]=I,a[A+5]=Q,a[A+6]=L,a[A+7]=oe,a[A+8]=me||Re(T||1,6,Math.pow(1-ye,2.5)),a[A+9]=Se||.28+6.9*Math.pow(1-ye,2.6),a[A+10]=Re(.8,3.3,ye)*(.75+.5*ne())*(Ye||1),a[A+11]=Ve,a[A+12]=Re(.07,.3,ye)*(.7+.6*ne())*(B||1),a[A+13]=Ne,a[A+14]=ye,a[A+15]=Ce,nt(ae,m),m=(m+1)%e.NP,e.stats.puffs++},e.breath=function(he,H,z,V){const I=qt.origin,Q=m*e.PF,L=F;L[Q]=H[0]-I[0],L[Q+1]=H[1]-I[1],L[Q+2]=H[2]-I[2],L[Q+3]=he,L[Q+4]=z[0],L[Q+5]=z[1],L[Q+6]=z[2],L[Q+7]=ne(),L[Q+8]=.3,L[Q+9]=-.25,L[Q+10]=.8+.3*ne(),L[Q+11]=.06,L[Q+12]=.16+.04*ne(),L[Q+13]=V,L[Q+14]=.6,L[Q+15]=1,nt(ae,m),m=(m+1)%e.NP,e.stats.puffs++},e.grain=function(he,H,z,V,I,Q,L,ye,Ve,Ne,Ce){const Ye=qt.origin,T=J*e.GF,Se=we;Se[T]=H-Ye[0],Se[T+1]=z-Ye[1],Se[T+2]=V-Ye[2],Se[T+3]=he,Se[T+4]=I,Se[T+5]=Q,Se[T+6]=L,Se[T+7]=ne(),Se[T+8]=Re(Ce||1.2,8,(1-ye)*(1-ye)),Se[T+9]=.45+8.5*Math.pow(1-ye,2.2),Se[T+10]=Re(.9,4.2,ye)*(.7+.6*ne())*(Ne||1),Se[T+11]=Ve,nt(X,J),J=(J+1)%e.NG,e.stats.grains++};function Ke(he,H,z,V){for(const[I,Q]of z)s.updateBuffer(he,I*V*4,H.subarray(I*V,(I+Q)*V));z.length=0}e.shiftOrigin=function(he){for(let H=0;H<e.NP;H++){const z=H*e.PF;F[z]-=he[0],F[z+1]-=he[1],F[z+2]-=he[2]}for(let H=0;H<e.NG;H++){const z=H*e.GF;we[z]-=he[0],we[z+1]-=he[1],we[z+2]-=he[2]}ae.length=0,X.length=0,ae.push([0,e.NP]),X.push([0,e.NG])},e.clear=function(){F.fill(0),we.fill(0),ae.length=0,X.length=0,ae.push([0,e.NP]),X.push([0,e.NG])},e.intensity=0;const Fe=[0,0,0];let Ge=-9;e.onStep=function(he,H,z){const V=he.speed;for(let j=0;j<3;j++)Fe[j]=Pt(Fe[j],he.v[j],12,H);if(he.air&&(Ge=z),!he.contact||V<1.2){e.intensity=Pt(e.intensity,0,12,H),e.face=c(z);return}const I=9.81,Q=he.load/I,L=Math.abs(he.aReac)/I,ye=Math.abs(Math.sin(he.beta)),Ve=.6+.6*he.powder,Ne=(j,W)=>j*(.05*Ve+.78*Math.pow(W,1.3)+1.25*ye*(.15+.85*mt(W)))*ge(1.5,13,V)*Ve,Ce=Ne(Q,L);e.intensity=Pt(e.intensity,Ce,30,H);const Ye=he.aReac>=0?1:-1,T=he.n,Se=he.t,me=he.r,B=Math.cos(he.beta),U=Math.sin(he.beta),A=Se[0]*B+me[0]*U,a=Se[1]*B+me[1]*U,oe=Se[2]*B+me[2]*U,fe=-Ye*(me[0]*B-Se[0]*U),O=-Ye*(me[1]*B-Se[1]*U),ie=-Ye*(me[2]*B-Se[2]*U),ce=zt.pose.stance*.5,He=-Ye*(zt.pose.lead||0),We=he.v,Qe=Math.min(Q,2.8),st=L*Qe/Math.max(Q,.001),Le=e.oldK(),r=ge(.25,.9,he.powder||0),q=it(V*(.08+Re(Re(.22,.42,Le),.42,r)*mt(st/1.5)+.85*ye),1.2,15),k=mt(1-st/.22)*mt(1-ye/.1),ee=ge(.2,.8,k),Z=Ne(Qe,st)*ge(.12,.5,z-Ge),K=mt(Z*2.2),ue=Math.min(Z,3.2),G=.12+.5*K+.55*mt(Z),Ae=ge(.25,.9,he.powder||0),_e=1/(1+1.6*Ae),at=1+.6*Ae,ot=P0(z*3.1,71)*.5+.5,t=1.25*(.32+1.3*ot*ot);ke=Math.min(ke+(70+160*ge(8,22,V)*(1-r)+1700*Math.pow(ue,.9)*t*_e+13*V*ee*ge(5,12,V))*H*e.gain,60),C=Math.min(C+(90+4600*Math.pow(ue,.85)*(.4+.6*t))*H*e.gain,160);const S=e.curtainK(he.powder||0),l=S[0],u=S[1],v=e.fogMul*Re(1,Re(.3,.5,Le),ge(10,25,Math.hypot(he.v[0],he.v[1],he.v[2]))*(1-ge(.25,.9,he.powder||0))),P=(1-r)*(1-Le),N=e.reach*(.75+1.95*Math.pow(mt(ue/2.6),.7))*l,de=he.h,te=Re(.42,Re(.62,.92,mt(ye/.5)),K)*Re(.62,1,mt(l)),o=Re(.42,.88,mt(ye/.3)),p=(j,W)=>{const h=j*5+W*6,n=.5+.5*Math.sin(W*1.31+1.7*Math.sin(W*.53+.8));return it(.5+(.3*Math.sin(h+1.7*Math.sin(W*2.3+j*2))+.2*Math.sin(h*2.7+W*9))*(.5+.7*n)+.15*Math.sin(j*21+W*47+2.2*Math.sin(W*6.1+j*3))*(1.2-n),0,1)};if(e.onEmit.length&&ue>.004){const j=te,W=Math.cos(j),h=Math.sin(j),n=.15,d=.2,M=A*d+fe*ce,g=oe*d+ie*ce;$e(he.powder>.5?"powder":ye>.25?"skid":"carve",z,[he.p[0]+M,de-(T[0]*M+T[2]*g)/T[1]+.04,he.p[2]+g],[We[0]*n+(fe*W+T[0]*h)*q,We[1]*n+(O*W+T[1]*h)*q,We[2]*n+(ie*W+T[2]*h)*q],.35+.5*ye,Math.min(ue,2),he.powder||0,[me[0],me[2]],[A,oe])}for(;ke>=1;){ke-=1;const j=ne(),W=ne(),h=ne(),n=ne(),d=ne()*H,M=ne()<ee,g=M?ne()<.5?1:-1:ne()<.74?1:-1,R=M?-.78-.14*j:Re(-.86,o,j*j*.4+j*.6)+g*He,Ue=g*ce+(M?(h-.5)*.09:.05),$=A*R+fe*Ue-We[0]*d,ve=oe*R+ie*Ue-We[2]*d,xe=he.p[0]+$,De=he.p[2]+ve,Te=de-(T[0]*$+T[2]*ve)/T[1]+.04;if(M){const Et=(.5+.085*V)*(.45+n),Ut=.08+.2*ne(),Xt=(W-.5)*.9;e.puff(z-d,xe,Te,De,We[0]*Ut+T[0]*Et+fe*Xt,We[1]*Ut+T[1]*Et+O*Xt,We[2]*Ut+T[2]*Et+ie*Xt,.7+.3*ne(),Re(.05,.09,ne()),(.3+.6*ge(8,26,V)+2*G)*Math.max(v,.6),1,1,.8);continue}const Me=p(R,z-d),rt=q*(.55+.6*Me)*1.1,wt=te+.34*(Me-.5);let Ze,ct,Mt,ft,dt,gt,bt,Xe=1,et=N,tt=0,Oe=0,ze=1;W<.13?(Ze=.8+.2*ne(),ct=Re(.3,1.3,h),Mt=rt*(.15+.4*n),dt=.1+.25*ne(),ft=1.5*G*v*(1-.4*P),gt=Re(.07,.12,ne()),bt=1.2,et=N*.6):W<.13+e.clots*Re(1,1.8,Le)*K?(Ze=.4*Math.pow(ne(),.9),ct=wt+(h-.5)*.16,Mt=rt*(.5+.5*Math.pow(n,.45)),dt=.07+.18*Me*ne()+.2*ye*ne(),ft=Re(7.6,4.6,Ze/.4)*G*Re(.2+.4*v,.4+.6*v,Le),gt=Re(Re(.035,.04,Le),Re(.065,.075,Le),ne())*(.75+.55*mt(Z)),bt=.35,Xe=Re(.38,.7,Le)):(Ze=Math.max(.62+.38*ne(),1-K),ct=wt+(h-.5)*.3,Mt=rt*(.42+.58*Math.pow(n,.6)),dt=.07+.18*Me*ne()+.2*ye*ne(),ft=Re(4.2,2.6,mt((Ze-.62)/.38))*G*v,gt=Re(.05,.09,ne())*(.75+.55*mt(Z)),bt=.5,et=N*(.75+.5*ne()),ne()<P*.85&&(Ze=.36+.06*ne(),tt=.9+1.1*ne(),Oe=.25+.35*ne(),Xe=.42,gt*=.7,ze=.3,bt=.6,ft=Re(4.2,2.6,mt((Ze-.62)/.38))*Math.max(G,.7)*.4));const pt=Math.cos(ct),ut=Math.sin(ct),xt=We[0]*dt+(fe*pt+T[0]*ut)*Mt+(ne()-.5)*bt,lt=We[1]*dt+(O*pt+T[1]*ut)*Mt+ne()*.4*bt,Tt=We[2]*dt+(ie*pt+T[2]*ut)*Mt+(ne()-.5)*bt;e.puff(z-d,xe,Te,De,xt,lt,Tt,Ze,gt*at,ft,1,Xe*(Ze>.5?u*(.4+.6*v)*(1+.4*Ae):1),et,tt,Oe,ze)}const i=r*ge(.35,1.3,Z)*e.plume;for(Je=Math.min(Je+320*i*H*e.gain,12),e.stats.plume=(e.stats.plume||0)+320*i*H;Je>=1;){Je-=1;const j=ne()*H,W=Re(-.75,.45,ne()),h=ce+.08+.1*ne(),n=A*W+fe*h-We[0]*j,d=oe*W+ie*h-We[2]*j,M=he.p[0]+n,g=he.p[2]+d,R=de-(T[0]*n+T[2]*d)/T[1]+.1,Ue=p(W,z-j),$=Re(.5,1.25,ne())-.15*(1-Ue),ve=Math.cos($),xe=Math.sin($),De=q*(.7+.5*Ue)*(.6+.6*ne()),Te=.04+.1*ne(),Me=We[0]*Te+(fe*ve+T[0]*xe)*De+(ne()-.5)*.8,rt=We[1]*Te+(O*ve+T[1]*xe)*De,wt=We[2]*Te+(ie*ve+T[2]*xe)*De+(ne()-.5)*.8;e.puff(z-j,M,R,g,Me,rt,wt,.9+.1*ne(),Re(.2,.36,ne()),(2.4+1.8*Ue)*Math.min(G,1.2),1,1.25,N*(1.2+.6*ne()),0,0,.6)}for(;C>=1;){C-=1;const j=ne(),W=ne(),h=ne(),n=ne()*H,d=ne()<ee,M=d?ne()<.5?1:-1:ne()<.74?1:-1,g=d?-.78-.14*j:Re(-.86,o+.08,j)+M*He,R=M*ce+(d?(W-.5)*.09:.05),Ue=A*g+fe*R-We[0]*n,$=oe*g+ie*R-We[2]*n,ve=he.p[0]+Ue,xe=he.p[2]+$,De=de-(T[0]*Ue+T[2]*$)/T[1]+.03;if(d){const bt=(.6+.1*V)*(.3+1.2*h),Xe=.08+.3*ne(),et=(ne()-.5)*1.6;e.grain(z-n,ve,De,xe,We[0]*Xe+T[0]*bt+fe*et,We[1]*Xe+T[1]*bt+O*et,We[2]*Xe+T[2]*bt+ie*et,ne(),1.2+3*ne()*ne(),1,.9);continue}const Te=ne(),Me=p(g,z-n),rt=te+.34*(Me-.5)+(W-.5)*.7,wt=Math.cos(rt),Ze=Math.sin(rt),ct=q*(.55+.6*Me)*1.1*(.45+.75*Math.pow(h,1.3)),Mt=.1+.4*ne()*ne()+.2*ye*ne(),ft=We[0]*Mt+(fe*wt+T[0]*Ze)*ct+(ne()-.5)*1.2,dt=We[1]*Mt+(O*wt+T[1]*Ze)*ct+ne()*.8,gt=We[2]*Mt+(ie*wt+T[2]*Ze)*ct+(ne()-.5)*1.2;e.grain(z-n,ve,De,xe,ft,dt,gt,Te,1.2+3*ne()*ne(),1,N*(.8+.5*ne()))}const y=ge(.45,.9,he.powder||0);if(y>0&&V>2.5){const j=typeof F0<"u"&&F0.D!=null?F0.D:.3*y,W=de+.7*j;for(le=Math.min(le+(30+70*mt(V/14)+160*mt(Z))*y*H*e.gain,20);le>=1;){le-=1;const n=ne()<.5?1:-1,d=Re(-.35,1,Math.sqrt(ne())),M=n*ce+(ne()-.5)*.32,g=ne()*H,R=A*d+fe*M-We[0]*g,Ue=oe*d+ie*M-We[2]*g,$=he.p[0]+R,ve=he.p[2]+Ue,xe=W-(T[0]*R+T[2]*Ue)/T[1]+.03+.12*ne(),De=.55+.3*ne(),Te=.5+1.2*ne()+.8*mt(Z),Me=(ne()-.5)*1.2+.6*mt(Z)*(n>0?1:.3);e.puff(z-g,$,xe,ve,We[0]*De+T[0]*Te+fe*Me,We[1]*De+T[1]*Te+O*Me,We[2]*De+T[2]*Te+ie*Me,.72+.25*ne(),Re(.05,.1,ne()),(1.6+1.6*mt(Z))*y,1,.32+.25*ne(),.45)}const h=typeof zt<"u"&&(zt.view==="fp"||zt.view==="tips");if(h&&y>.5&&V>6&&Z>.7&&z-Pe>1.6&&ne()<H*5*mt((Z-.7)/.8)&&(Pe=z,pe=Math.round(60+40*mt(Z-.7)*y)),h&&pe>0&&typeof qt<"u"&&qt.cam){const n=qt.cam,d=n.fwd,M=n.right,g=n.up,R=Math.min(pe,Math.ceil(pe*H/.18)+1);for(let Ue=0;Ue<R;Ue++,pe--){const $=.5+1.4*ne(),ve=(ne()-.5)*1.5*$,xe=(ne()-.6)*1*$,De=n.pos[0]+d[0]*$+M[0]*ve+g[0]*xe,Te=n.pos[1]+d[1]*$+M[1]*ve+g[1]*xe,Me=n.pos[2]+d[2]*$+M[2]*ve+g[2]*xe,rt=.86+.1*ne(),wt=.4+1*ne();e.puff(z,De,Te,Me,We[0]*rt-d[0]*1.2,We[1]*rt+wt,We[2]*rt-d[2]*1.2,.9+.1*ne(),Re(.12,.26,ne()),3+3*ne(),.4,.5+.4*ne(),.4)}}}e.face=c(z)};let Je=0,le=0,Pe=-9,pe=0;function c(he){const H=he-Pe;return H<0?0:ge(0,.1,H)*(1-ge(.4,.95,H))}e.slap=function(he,H,z,V,I){const Q=z[0]*V[0]+z[1]*V[1]+z[2]*V[2],L=z[0]-V[0]*Q,ye=z[1]-V[1]*Q,Ve=z[2]-V[2]*Q,Ne=Math.hypot(L,ye,Ve),Ce=Ne>.3?L/Ne:0,Ye=Ne>.3?ye/Ne:0,T=Ne>.3?Ve/Ne:-1;let Se=Ye*V[2]-T*V[1],me=T*V[0]-Ce*V[2],B=Ce*V[1]-Ye*V[0];const U=Math.hypot(Se,me,B)||1;Se/=U,me/=U,B/=U;const A=zt.pose.stance*.5,a=vt.height(H[0],H[2],.5),oe=.08+.04*I,fe=I*I,O=zt.s&&zt.s.powder||0,ie=ge(.25,.9,O),ce=e.curtainK(O),He=Math.round(Math.min(40+85*fe,520)),We=Math.round(Math.min(80+150*fe,900)),Qe=3+3.6*I,st=(.9+.75*I)*Re(.75,1.1,ie),Le=Re(.25,.6,ie),r=zt.s.lean||0,q=.5-.3*Math.sign(r)*mt(Math.abs(r)/.5);$e(e.slapKind||"land",he,[H[0],a,H[2]],[L*.3+V[0]*Qe*.3,ye*.3+V[1]*Qe*.3,Ve*.3+V[2]*Qe*.3],1.4,Math.min(I,2),O,[Se,B],[Ce,T]);for(let k=0;k<He+We;k++){const ee=k<He,Z=oe*Math.pow(ne(),1.6);if(ne()<Le){const W=ne()*It,h=Math.cos(W),n=Math.sin(W),d=A+.15+.25*ne(),M=(4+4*ne())*Math.sqrt(Math.min(fe,5))*.62,g=(1+2*ne())*Re(.35,1,ie)*Math.sqrt(I),R=Se*h+Ce*n,Ue=B*h+T*n,$=me*h+Ye*n,ve=R*d+L*Z,xe=Ue*d+Ve*Z,De=H[0]+ve,Te=H[2]+xe,Me=a-(V[0]*ve+V[2]*xe)/V[1]+.05,rt=.25+.2*ne(),wt=L*rt+R*M+V[0]*g,Ze=ye*rt+$*M+V[1]*g,ct=Ve*rt+Ue*M+V[2]*g;if(ee){const Mt=.5+.45*ne();e.puff(he+Z,De,Me,Te,wt,Ze,ct,Mt,Re(.07,.13,ne())*(.8+.2*I),3.4*(.6+.4*Math.min(I,1.5))*Re(.8,1.2,ie),1,(Mt>.6?ce[1]:.8)*Re(.9,1.3,ie),st*(.5+.5*ne())*Re(.6,1,ce[0]))}else e.grain(he+Z,De,Me,Te,wt*1.1,Ze*1.2+.3,ct*1.1,ne(),.6+1.6*ne()*ne(),1,st*(.8+.6*ne()));continue}const K=ne()<.15,ue=ne()<q?1:-1,G=ne(),Ae=Re(-.8,.95,ne()),_e=K?(ne()-.5)*A*1.6:ue*(A+.05+.04*ne()),at=K?1.57-ne()*.4:Re(.15,1,ne()),ot=K?Re(.3,.8,G):Re(.12,.62,G*(.5+.5*G)),t=Qe*(K?.6:1)*(ee?.45+.55*Math.sqrt(ne()):.4+.9*ne()),S=(K?.35:.2)+.25*ne(),l=Math.cos(ot),u=Math.sin(ot),v=Math.cos(at)*ue*l,P=Math.sin(at)*l,N=Ce*Ae+Se*_e+L*Z,de=T*Ae+B*_e+Ve*Z,te=H[0]+N,o=H[2]+de,p=a-(V[0]*N+V[2]*de)/V[1]+.04,i=L*S+(Se*v+Ce*P+V[0]*u)*t,y=ye*S+(me*v+Ye*P+V[1]*u)*t,j=Ve*S+(B*v+T*P+V[2]*u)*t;if(ee){const W=ne()<.35,h=W?.4*ne():.6+.4*ne();e.puff(he+Z,te,p,o,i,y,j,h,Re(.06,.11,ne())*(.8+.2*I),(W?5.5:3.2)*(.55+.45*Math.min(I,1.5)),1,W?.7:.9*ce[1],st*(.7+.6*ne()))}else e.grain(he+Z,te,p,o,i*1.15,y*1.3+.3,j*1.15,ne(),.6+1.6*ne()*ne(),1,st*(.9+.6*ne()))}},e.burst=e.slap,e.fall=function(he,H,z,V){e.slapKind="fall";try{e.slap(he,H,[Fe[0]*.6,Fe[1]*.6,Fe[2]*.6],z,V)}finally{e.slapKind=null}},e.poles=function(he,H,z){const V=H.fwd,I=H.nrm,Q=V[1]*I[2]-V[2]*I[1],L=V[0]*I[1]-V[1]*I[0],ye=(z||.3)*.5+.24;for(const Ve of[-1,1]){const Ne=H.pos[0]+V[0]*.25+Q*Ve*ye,Ce=H.pos[2]+V[2]*.25+L*Ve*ye,Ye=vt.height(Ne,Ce,.5)+.03;$e("pole",he,[Ne,Ye,Ce],[-V[0]*.5+Q*Ve*.3,.9,-V[2]*.5+L*Ve*.3],1.2,.1,typeof zt<"u"&&zt.s&&zt.s.powder||0,[Q,L],[V[0],V[2]]);for(let T=0;T<20;T++){const Se=ne()*It,me=.25+.5*ne(),B=.5+1.1*ne(),U=-V[0]*.5+Q*Ve*.3+Math.cos(Se)*me,A=-V[2]*.5+L*Ve*.3+Math.sin(Se)*me;T<5?e.puff(he,Ne,Ye,Ce,U,B,A,.6+.4*ne(),Re(.035,.06,ne()),2.4,1,.4,.35):e.grain(he,Ne,Ye,Ce,U*1.6,B*1.6,A*1.6,ne(),.5+1.2*ne(),.6,.5)}}},e.kick=function(he,H,z,V){const I=Math.round(4*V),Q=Math.round(46*V);for(let L=0;L<I+Q;L++){const ye=ne()*It,Ve=Re(.35,1.15,ne()),Ne=Re(.7,3,ne()),Ce=Math.cos(Ve),Ye=Math.cos(ye)*Ce,T=Math.sin(ye)*Ce,Se=Math.sin(Ve),me=H[0]+Ye*.12,B=H[2]+T*.12,U=H[1]+.04;L<I?e.puff(he,me,U,B,z[0]+Ye*Ne,z[1]+Se*Ne,z[2]+T*Ne,Math.pow(ne(),.6),Re(.05,.1,ne()),.85,.6,.55):e.grain(he,me,U,B,z[0]*1.2+Ye*Ne*1.4,z[1]+Se*Ne*1.8,z[2]*1.2+T*Ne*1.4,ne(),.5+1.2*ne(),.8)}},e.sift=function(he,H,z,V){const I=Math.round(9*V),Q=Math.round(220*V);$e("sift",he,[H[0],H[1],H[2]],[z[0]*.25,-.9,z[2]*.25],3.14,Math.min(V,2),1,[1,0],[0,-1]);for(let L=0;L<I+Q;L++){const ye=ne()*It,Ve=Math.sqrt(ne())*.9,Ne=H[0]+Math.cos(ye)*Ve,Ce=H[2]+Math.sin(ye)*Ve,Ye=H[1]+(ne()-.3)*1.4,T=z[0]*(.15+.25*ne())+(ne()-.5)*1.2,Se=z[2]*(.15+.25*ne())+(ne()-.5)*1.2,me=-.3-ne()*1.2;L<I?e.puff(he,Ne,Ye,Ce,T,me,Se,.8+.2*ne(),Re(.16,.3,ne()),.45,.6,1.3):e.grain(he,Ne,Ye,Ce,T*1.4,me*1.6+.6,Se*1.4,.35+.65*ne(),.5+1.6*ne()*ne(),1.2)}},e.pre=function(he){Ke(w,F,ae,e.PF),Ke(x,we,X,e.GF);const H=ts.heightBinding(he.origin,1);e.hb=H,s.beginPass(_,{color:[0,0,0,0]}),e.nt=e.night!=null?e.night:ge(-.07,-.16,Nt.sunElev),e.enabled&&e.shadows&&s.draw(E,{u:{hx:H.xf,sn:[(1-.6*e.nt)*e.shadowK,0,0,0],lf:je()},tex:{tH:H.tex},vb:[w],count:4,instances:e.NP}),s.endPass()};const Ie=typeof navigator<"u"&&navigator.maxTouchPoints>0&&typeof screen<"u"&&Math.min(screen.width,screen.height)<600;return e.offscreen=function(he){e.grainy=!Ie&&!(qt.scale<.75),s.beginPass(qe,{color:[0,0,0,0]}),e.enabled&&s.draw(Y,{u:{hx:e.hb.xf,hx2:[e.nearBlur,e.shutter&&he.motionBlur!==!1&&he.dt>0?o0.shutter/Math.max(he.dt,1/240):0,e.streakMax,e.lens],fc:[e.face,e.grainy?1:0,0,0],lf:je()},tex:{tH:e.hb.tex,tDepth:he.depth,tDetail:c0.detail,tShadow:he.shadowTex,tSunTau:se},vb:[w],count:4,instances:e.NP}),s.endPass()},e.fx=function(he){if(!e.enabled)return;const H=he.origin,z=(Q,L)=>(Q*L%256+256)%256,V=e.nt||0,I=typeof L0<"u"&&L0.cityAz!=null?L0.cityAz:0;{const Q=typeof Dt<"u"&&Dt.val.nspray==="b"?1:0;e.moonMix=he.dt>0?Pt(e.moonMix,Q,6,he.dt):Q}s.draw(D,{u:{p:[b,re,e.bump,e.tear],q:[z(H[0],3.1),z(H[1],3.1),z(H[2],3.1),e.speck],r:[e.keyhole,V,e.moonMix,0],c:[Math.sin(I),-Math.cos(I),0,0]},tex:{tSpray:ht,tDepth:he.depth,tNoise:c0.noise},count:3}),s.draw(be,{u:{hx:e.hb.xf,gp:[e.crumb,e.grainShutter,V,e.moonMix]},tex:{tH:e.hb.tex,tDepth:he.depth,tShadow:he.shadowTex,tSunTau:se},vb:[x],count:4,instances:e.NG})},e})(),Ea=`
// the snow surface as drawn: near the skier the terrain raises the powder by the depth the skis ride at (Tracks.lift, the same numbers)
fn groundS(p: vec3f) -> f32 {
  let d: f32 = length(p.xz - M.lf.xy);
  return groundH(p) + M.lf.z * (1.0 - smoothstep(mix(1.0, 3.0, M.lf.w), mix(2.15, 7.5, M.lf.w), d));
}
struct PuffS { pos: vec3f, vel: vec3f, sm: vec3f, r: f32, dens: f32, lf: f32, t: f32, }
// one puff now: thrown, braked, then hanging and sifting down (snowFly). dens = optical depth at its centre (0 = dead).
// a2 = (how far the air lets its throw carry, the speed it falls at in the end, life, radius at launch), a3 = (growth, optical depth, fineness, stretch)
fn puffState(a0: vec4f, a1: vec4f, a2: vec4f, a3: vec4f) -> PuffS {
  var s: PuffS; s.pos = vec3f(0.0); s.vel = vec3f(0.0); s.sm = vec3f(0.0); s.r = 0.0; s.dens = 0.0; s.lf = 0.0; s.t = 0.0;
  let t: f32 = U.camPos.w - a0.w; let life: f32 = a2.z;
  if (t <= 0.0 || t >= life) { return s; }
  let seed: f32 = a1.w; let fine: f32 = a3.z;
  // (the fine dust is carried by the air entirely: whatever the wind does, it does; a clot hardly notices)
  let fy: Fly = snowFly(a0.xyz, a1.xyz, t, a2.x, mix(2.2, 0.45, fine), a2.y, mix(0.3, 1.0, smoothstep(0.45, 0.85, fine)));
  var pos: vec3f = fy.pos; s.vel = fy.vel;
  // Billows. The sheet drags the air along and the shear between them rolls it up: each lump of the fine part is carried round in an
  // eddy of its own (radius 0.1-0.5 m, grown within half a second, turning slower and slower as the eddy dies), rolling back over the
  // top of the throw and up. Every puff has its own phase and rate: in step, the whole curtain would swim like a liquid.
  let fr: f32 = smoothstep(0.35, 0.8, fine);
  let hd0: vec2f = a1.xz; let hl: f32 = length(hd0);
  var hd: vec3f = vec3f(0.7071, 0.0, 0.7071);
  if (hl > 0.05) { hd = vec3f(hd0.x / hl, 0.0, hd0.y / hl); }
  let A: f32 = (0.10 + 0.32 * fract(seed * 3.71)) * fr * (1.0 - exp(-t / 0.4));
  let tr: f32 = 1.6; let om: f32 = 0.8 + 1.6 * fract(seed * 11.3);
  let ang: f32 = seed * 6.2832 + om * tr * (1.0 - exp(-t / tr));
  let sd: vec3f = vec3f(-hd.z, 0.0, hd.x);
  pos += A * (hd * (cos(ang) - 0.6) + vec3f(0.0, 1.0, 0.0) * (sin(ang) + 0.35) + sd * (0.6 * sin(ang * 1.37 + seed * 17.0)));
  // the top of a thrown sheet (it left the edge steep and fast) keeps rolling up and back for a second: the crest of the curtain climbs
  pos.y += fr * 0.32 * saturate(a1.y / 4.0) * (1.0 - exp(-t / 0.9));
  var r: f32 = a2.w + a3.x * pow(t, 0.72);
  // Thrown snow is drawn out along its way only while it is still flying fast (the quick part of a lump outruns the slow part, and the
  // shutter adds its share in the vertex stage); once the air has it, it is a lump again. (Kept drawn out, the hanging curtain read as
  // combs from the side, a paint splash from the front and flames along its top.) What hangs on is combed a little the way the wind blows.
  s.sm = s.vel * (0.07 * a3.w * (1.0 - smoothstep(0.06, 0.22, t))) + U.wind.xyz * (0.06 * fr * smoothstep(0.6, 2.5, t));
  // Back on the snow. A clot is snow again: it fades where it lands. The fine part is heavier than the air it hangs in: what reaches the
  // ground does not stop there but runs out along it, a flat flow spreading as the square root of time and sliding downhill at the
  // better part of a metre a second, slowing within a second or two, thinning as it goes.
  let g0: f32 = groundS(pos); let gy: f32 = g0 + r * 0.28;
  let pen: f32 = max(gy - pos.y, 0.0);
  let tg: f32 = pen / max(a2.y, 0.15);                                  // about how long ago it reached the snow
  let onG: f32 = saturate(pen / max(r * 0.4, 0.04)) * fr;
  if (onG > 0.0) {
    let gx: f32 = groundS(pos + vec3f(0.6, 0.0, 0.0)) - g0; let gz: f32 = groundS(pos + vec3f(0.0, 0.0, 0.6)) - g0;
    let gl: f32 = length(vec2f(gx, gz));
    var dn: vec2f = vec2f(0.0);
    if (gl > 1e-4) { dn = -vec2f(gx, gz) / gl; }
    let run: f32 = 0.85 * 1.1 * (1.0 - exp(-tg / 1.1)) * smoothstep(0.0, 0.12, gl / 0.6) * onG;
    pos.x += dn.x * run; pos.z += dn.y * run;
    r *= 1.0 + 0.75 * sqrt(tg) * onG;
    // (and it lies flat: wider than it is tall)
    let cr: vec3f = U.camRight.xyz; let ch: vec2f = vec2f(cr.x, cr.z); let chl: f32 = max(length(ch), 1e-3);
    s.sm += vec3f(ch.x / chl, 0.0, ch.y / chl) * (r * 1.3 * onG * saturate(tg * 2.0));
    pos.y = g0 + (gx * dn.x + gz * dn.y) / 0.6 * run + r * 0.28;
  }
  let landed: f32 = mix(saturate(1.0 - pen / 0.35), 1.0, fr);
  // ...and the coarse snow on its way back down thins before it touches: no pale lid lying on the slope
  let settle: f32 = mix(1.0, smoothstep(0.30, 1.10, (pos.y - g0) / r), saturate(-s.vel.y * 2.5) * smoothstep(0.25, 0.8, t) * (1.0 - fr));
  if (onG <= 0.0) { pos.y = max(pos.y, gy); }
  let lf: f32 = t / life;
  s.pos = pos; s.r = r; s.lf = lf; s.t = t;
  // the mass spreads as the puff grows (optical depth ~ 1/r^2); fades in fast, out slowly
  s.dens = a3.y * pow(a2.w / r, 1.9) * smoothstep(0.0, 0.03, t) * pow(1.0 - lf, 1.3) * landed * settle;
  return s;
}
`,bo=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.d0 = vec4f(0.0); v.d1 = vec4f(0.0); v.d2 = vec4f(0.0);
  let s: PuffS = puffState(a.a0, a.a1, a.a2, a.a3);
  if (s.dens <= 0.0) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let seed: f32 = a.a1.w; let pos: vec3f = s.pos; let r: f32 = s.r;
  let rel: vec3f = pos - U.camPos.xyz; let zc: f32 = dot(rel, U.camFwd.xyz);
  if (zc < 0.35) { return v; }
  // it dissolves before it reaches the lens: the curtain is something to look at, not to be blinded by
  let lens: f32 = mix(M.hx2.w, 0.32, M.fc.x);
  var dens: f32 = s.dens * smoothstep(lens, lens * 3.0 + 0.7, zc);
  if (dens < 0.002) { return v; }
  let sv: vec2f = vec2f(dot(s.sm, U.camRight.xyz), dot(s.sm, U.camUp.xyz)); let sl: f32 = length(sv);
  var ax: vec2f = vec2f(1.0, 0.0);
  if (sl > 1e-3) { ax = sv / sl; }
  let st0: f32 = 1.0 + min(sl / r, 3.2);
  // the shutter: snow hanging in the air goes by the lens like everything else does. A lump two strides from the camera is not a ball
  // standing in the picture: it is a streak along the way it went past (half that path, in metres at its own depth)
  let c0: vec4f = U.viewProj * vec4f(pos, 1.0); let c1: vec4f = U.prevViewProj * vec4f(pos - s.vel * U.misc.z, 1.0);
  var mb: vec2f = vec2f(0.0);
  if (c0.w > 0.05 && c1.w > 0.05) { mb = (c0.xy / c0.w - c1.xy / c1.w) * vec2f(U.camUp.w, 1.0) * (0.5 * M.hx2.y); }
  let ml: f32 = length(mb);
  if (ml > M.hx2.z) { mb *= M.hx2.z / ml; }
  let mw: vec2f = mb * (zc * U.camRight.w);
  var sa: vec2f = ax * (r * (st0 - 1.0));
  if (dot(sa, mw) < 0.0) { sa = -sa; }
  let sc: vec2f = sa + mw; let cl: f32 = length(sc);
  if (cl > 1e-4) { ax = sc / cl; }
  let rl: f32 = r + cl;
  // ...and it is far out of focus there: the same snow spread over a wider, softer disc, so that a handful of lumps close by run
  // together into a veil
  let bw: f32 = M.hx2.x * pow(max(1.0 - zc / 4.0, 0.0), 1.2);
  let rc: f32 = 0.42 * zc * U.camRight.w;
  let rb: f32 = min(sqrt(r * r + bw * bw), max(rc, r)); let ra: f32 = min(sqrt(rl * rl + bw * bw), max(rc * 1.5, r * st0));
  let st: f32 = ra / rb; let blur: f32 = max(1.0 - (r * r) / (rb * rb), 1.0 - smoothstep(1.4, 2.8, zc));
  dens *= (r * r * st0) / (ra * rb);
  if (dens < 0.0012) { return v; }
  let off: vec2f = ax * (corner.x * ra) + vec2f(-ax.y, ax.x) * (corner.y * rb);
  v.clip = U.viewProj * vec4f(pos + U.camRight.xyz * off.x + U.camUp.xyz * off.y, 1.0);
  v.uv = corner;
  // sun reaching this puff: through terrain, trees and the skier (shadow map)...
  let lx: vec3f = normalize(cross(vec3f(0.0, 1.0, 0.0), U.sunDir.xyz)); let ly: vec3f = cross(U.sunDir.xyz, lx);
  let sp: vec3f = pos + U.sunDir.xyz * (0.12 + r * 0.6); let rr: f32 = r * 0.6 + 0.05;
  var vis: f32 = 0.25 * (shadowFast(sp + lx * rr, 0.0015) + shadowFast(sp - lx * rr, 0.0015) + shadowFast(sp + ly * rr, 0.0015) + shadowFast(sp - ly * rr, 0.0015));
  // ...and through the rest of the curtain, taken at this corner of the lump so the shading runs smoothly across it
  let wc: vec3f = pos + U.camRight.xyz * (off.x * 0.7) + U.camUp.xyz * (off.y * 0.7);
  // (snow scatters almost without loss, and mostly forward: what the direct beam loses on the way in arrives a little later, sideways)
  let ts: f32 = sprayTau(wc, r * 0.5);
  vis *= 0.58 * exp(-0.85 * ts) + 0.42 * exp(-0.16 * ts);
  v.d0 = vec4f(dens / sqrt(st0), vis, zc, rb);
  v.d1 = vec4f(fract(seed * 13.7), fract(seed * 29.3), seed * 6.2832 + s.t * (fract(seed * 5.3) - 0.5) * 0.9, pow(s.lf, 0.7));
  // a lump's outline is noise, but the card it is drawn on is round: feather the last of the card so no lump ever ends on a perfect arc,
  // and more the nearer it is (a lone lump a few strides off is a soft tuft, never a disc with a rim)
  v.d2 = vec4f(a.a3.z, st, blur, mix(0.14, 1.0, 1.0 - smoothstep(3.0, 5.5, zc)));
  return v;
}`,yo=`
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0);
  let q: vec2f = v.uv; let dd: f32 = dot(q, q);
  if (dd >= 1.0) { return o; }
  let k: f32 = 1.0 - dd;
  let e: f32 = v.d1.w;
  // A lump of thrown snow, built the way a cloud is: a soft round body, its outline pushed in and out by billows, then eaten away
  // where it is thin. The billows are counted on the lump (a handful round its rim, so they grow with it: a few centimetres as it
  // leaves the edge, a few decimetres once it hangs); the grain is counted in metres (a crumb every five or six centimetres), so a lump close by is
  // grainy at the scale real snow is. Thin snow breaks up into grains; the thick heart of a lump, and of a cloud where many overlap,
  // stays whole and smooth.
  let ang: f32 = v.d1.z;
  let cs: f32 = cos(ang); let sn: f32 = sin(ang);
  let qr: vec2f = vec2f(q.x * cs - q.y * sn, q.x * sn + q.y * cs);
  let n1: f32 = tex(tDetail, qr * 0.30 + v.d1.xy).z;
  let bill: f32 = 1.0 - abs(n1 - 0.5) * 2.6;                          // ridged: round tops, creased between (cauliflower)
  let lm: vec2f = vec2f(q.x * v.d2.y, q.y) * v.d0.w;                  // metres across the card
  let n2: f32 = tex(tDetail, lm * 0.85 + v.d1.yx * 3.0).z;
  var F: f32 = k + (bill - 0.45) * (0.34 + 0.40 * e) + (n2 - 0.5) * 0.7;
  let dsh: f32 = smoothstep(0.02, 0.30 + 0.35 * e, F);
  // erosion (as clouds are eroded): it bites only where the density is low, so the rim crumbles and the core is untouched
  var gn: f32 = 0.5;
  if (M.fc.y > 0.5) { gn = tex(tDetail, lm * 0.034 + v.d1.xy * 7.0).w; }
  let ek: f32 = (0.8 + 0.5 * e) * (1.0 - v.d2.z) * mix(0.6, 1.0, v.d2.x);
  let ee: f32 = saturate((gn * 0.9 + n2 * 0.5) * (1.0 - dsh * dsh) * ek);
  let de: f32 = saturate((dsh - ee) / max(1.0 - ee, 0.05));
  let m: f32 = mix(de * mix(0.55 + 0.45 * k, 0.40 + 0.60 * k, smoothstep(0.1, 0.5, e)) * smoothstep(0.0, v.d2.w, k), 1.5 * k * k, v.d2.z);
  let sz: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy) * 2, 0));
  let hh: f32 = v.d0.w * sqrt(k) + 0.02;
  let front: f32 = saturate((sz - (v.d0.z - hh)) / (2.0 * hh));
  // (no per-pixel shimmer here: in a half-resolution buffer it was a 2x2 checkerboard crawling over every veil)
  let tau: f32 = v.d0.x * m * front;
  // depth of this lump's near face (bulging, roughened by the same noise), weighted so the nearest lumps decide the cloud's visible surface
  // (the weight is bounded: a thick cloud close to the lens must not overflow the half-float buffer the lumps add up in)
  // (a fall or a hard landing piles a great deal of snow into one place: with a wider range than this the sums ran past what a half float
  // holds, and the picture had a black hole in it)
  let zf: f32 = clamp(v.d0.z - hh * (0.8 + 0.4 * bill) - U.dof.x, -4.5, 8.0);
  let w: f32 = exp(-max(zf, -1.5) * 1.4);
  o.color = vec4f(tau, tau * w * v.d0.y, tau * w * zf, tau * w);
  return o;
}`,ko=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.d0 = vec4f(0.0);
  let s: PuffS = puffState(a.a0, a.a1, a.a2, a.a3);
  if (s.dens < 0.004) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let c: vec4f = U.shadowVP * vec4f(s.pos, 1.0);
  v.clip = vec4f((c.xy + corner * (s.r * 1.15 / U.misc.w)) * U.sprayT.x - U.sprayT.yz, 0.5, 1.0);
  // (M.sn.x: by night the moon's shadow of the cloud is as thin as the cloud is shown: a veil that can hardly be seen does not lay black blotches on the snow)
  v.uv = corner; v.d0 = vec4f(s.dens * M.sn.x, (c.z - U.sprayT.w) * 1199.0, 0.0, 0.0);
  return v;
}`,Mo=`
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0);
  let k: f32 = 1.0 - dot(v.uv, v.uv);
  if (k <= 0.0) { return o; }
  let t: f32 = v.d0.x * k * k * 0.75; let z: f32 = v.d0.y;
  o.color = vec4f(t, t * z, t * z * z, t);
  return o;
}`,zo=`
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0, 0.0, 0.0, 1.0);
  var a: vec4f = texLod(tSpray, v.uv, 0.0);
  if (a.x < 0.0006) { return o; }
  // depth-aware upsample from half res so the cloud doesn't halo around the skier
  let zf: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let hp: vec2f = v.clip.xy * 0.5 - 0.5; let h0: vec2f = floor(hp); let hf: vec2f = hp - h0;
  let mx: vec2i = vec2i(M.p.xy) - vec2i(1, 1);
  var acc: vec4f = vec4f(0.0); var wsum: f32 = 0.0;
  for (var j: i32 = 0; j < 4; j++) {
    let dx: i32 = j & 1; let dy: i32 = j >> 1;
    let tc: vec2i = clamp(vec2i(h0) + vec2i(dx, dy), vec2i(0, 0), mx);
    let zj: f32 = linDepth(texFetchD(tDepth, tc * 2, 0));
    let wb: f32 = mix(1.0 - hf.x, hf.x, f32(dx)) * mix(1.0 - hf.y, hf.y, f32(dy));
    let wz: f32 = 1.0 / (1.0 + sq((zj - zf) / (0.03 * zf + 0.03)));
    let w: f32 = (wb + 0.02) * wz;
    acc += texFetch(tSpray, tc, 0) * w; wsum += w;
  }
  a = clamp(acc / max(wsum, 1e-4), vec4f(-30000.0), vec4f(30000.0));
  if (a.x < 0.0005) { return o; }
  // (a soft knee, not a threshold: seen against the sun the faintest veil is bright, and a cut-off there draws the outline of a single lump)
  a.x = a.x * a.x / (a.x + 0.01);
  let vis: f32 = saturate(a.y / max(a.w, 1e-7));           // sun reaching the near face of the cloud (through terrain, skier and the cloud itself)
  let zr: f32 = a.z / max(a.w, 1e-7); let zm: f32 = zr + U.dof.x;
  let ndc: vec2f = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
  let tn: vec2f = vec2f(ndc.x * U.camRight.w * U.camUp.w, ndc.y * U.camRight.w);
  let d: vec3f = normalize(U.camFwd.xyz + U.camRight.xyz * tn.x + U.camUp.xyz * tn.y);
  let L: vec3f = U.sunDir.xyz; let mu: f32 = dot(d, L);
  // --- powder is not smoke. Hanging in the air it tears into veils and strands (a noise field anchored in the world, sinking with the snow,
  // read on the cloud's near face so it holds still while the camera moves), and where it is thin it breaks up into single winking specks.
  let tm: f32 = U.camPos.w;
  // (one noise at one frequency, read at a depth that steps from lump to lump, drew level contour lines over a curtain that had hung a
  // couple of seconds, like ripples on water: the field is warped by a coarser one of its own and the strands are a gentle modulation)
  let wq0: vec3f = (U.camPos.xyz + d * (zm / max(dot(d, U.camFwd.xyz), 0.2))) * 2.3 + M.q.xyz + vec3f(-U.wind.x, 0.9, -U.wind.z) * (tm * 0.9 - 256.0 * floor(tm * 0.9 / 256.0));
  let wwp: vec3f = vec3f(tnoise3(wq0 * 0.37 + vec3f(3.1, 0.0, 1.7)), tnoise3(wq0 * 0.37 + vec3f(8.3, 5.2, 0.4)), tnoise3(wq0 * 0.37 + vec3f(1.9, 9.6, 6.1))) - 0.5;
  let wq: vec3f = wq0 + wwp * 2.4;
  let w1: f32 = tnoise3(wq); let w2: f32 = tnoise3(wq * 2.9 + vec3f(7.3, 1.9, 4.4)); let w3: f32 = tnoise3(wq * vec3f(7.1, 2.3, 7.1) + vec3f(2.1, 8.4, 5.7));
  let wn: f32 = w1 * 0.50 + w2 * 0.30 + w3 * 0.20;
  let thin: f32 = 1.0 - smoothstep(0.25, 2.6, a.x);
  // (what hangs within a few strides of the lens is far out of focus: no strands and no specks there, only a soft bright veil)
  let sharp: f32 = smoothstep(1.8, 3.4, zm);
  var tau: f32 = a.x * mix(1.0, (0.35 + 1.3 * smoothstep(0.25, 0.75, wn)), (0.12 + 0.45 * thin) * M.p.w * sharp);
  let gs: f32 = 1170.0 / U.res.y;
  let gp: vec2f = v.clip.xy * (gs / 1.35);
  let s1: f32 = texLod(tNoise, (gp + vec2f(tm * 11.0, -tm * 37.0)) / 256.0, 0.0).x;
  let s2: f32 = texLod(tNoise, (gp * 0.57 + vec2f(-tm * 6.0, -tm * 17.0)) / 256.0 + vec2f(0.37, 0.61), 0.0).z;
  let spk: f32 = s1 * s2 * 4.0;
  // (by day the grain of the veil is the lumps' own eroded rims and the crystals that fly in it: screen-space pepper here only made
  // a sheet of white noise. The night keeps it: there it is the lamp catching crystals)
  tau *= mix(1.0, spk, 0.34 * (1.0 - smoothstep(0.08, 1.3, tau)) * M.q.w * sharp * M.r.y);
  // however much snow hangs between the lens and the skier, the figure is never lost in it: round the skier the cloud in front is only
  // ever so thick (thin veils are untouched; it is the solid wall that is held back)
  { let pc: vec4f = U.viewProj * vec4f(U.player.xyz + vec3f(0.0, 0.9, 0.0), 1.0);
    let dp: vec2f = (ndc - pc.xy / max(pc.w, 0.1)) * vec2f(U.camUp.w, 0.8);
    let hole: f32 = (1.0 - smoothstep(0.20, 0.62, length(dp))) * step(0.1, pc.w) * smoothstep(0.3, -0.5, zr) * M.r.x;
    // (by night the figure is a dark shape with a lamp on it, and takes less veiling than the bright figure of the day does)
    let cap: f32 = mix(40.0, mix(1.05, 0.6, M.r.y), hole);
    tau = cap * (1.0 - exp(-tau / cap)); }
  // by night a thick cloud close to the lens had nothing left in it: no strands (out of focus), no specks (too thick), and the cap round
  // the figure flattened what was left to one even tint, so it stood beside the skier as a pane of blue glass, its outline the crisp sum
  // of the lumps. By night it is grains in a beam, not a sheet: the edge is eaten away from outside in by a lumpy mask (how much of the
  // ring round this pixel is cloud, pushed about by the world noise), and inside it is torn into tufts and peppered with crystals at
  // any distance (a dark veil out of focus still shows its grain against the lamp; it is the bright day veil that goes smooth)
  if (M.r.y > 0.0) {
    // (two rings: a near one for the grain of the edge, a wide one, centred a little above, so the whole outline is eaten in and the top of
    // a curtain thins away into the dark instead of ending on a cut-out line; the wide ring is a share of the picture, not of texels, so
    // a curtain that fills half the frame from close by is eroded as much as a far one)
    let ra: f32 = w1 * 6.2832; var cs: f32 = 0.0; var cw: f32 = 0.0; let ax: f32 = M.p.y / M.p.x;
    let rs: f32 = (6.0 + 5.0 * w2) / M.p.y; let rw: f32 = 0.035 + 0.035 * w3;
    for (var j: i32 = 0; j < 8; j++) {
      let an: f32 = ra + f32(j) * 0.7854; let dv: vec2f = vec2f(cos(an) * ax, sin(an));
      cs += 1.0 - exp(-1.5 * texLod(tSpray, v.uv + dv * (rs * (1.0 + 0.6 * f32(j & 1))), 0.0).x);
      cw += 1.0 - exp(-1.2 * texLod(tSpray, v.uv + vec2f(0.0, -0.7 * rw) + dv * rw, 0.0).x);
    }
    // (a pixel on the very rim sees about half its ring in cloud: the mask must already be at nothing there, or the rim is a step)
    let cov: f32 = min(cs / 8.0, 0.25 + cw / 8.0);
    let em: f32 = smoothstep(0.50, 1.0, cov + (wn - 0.5) * 0.6);
    let tuft: f32 = mix(0.25, 1.6, smoothstep(0.30, 0.66, wn)) * mix(0.55, 1.35, smoothstep(0.35, 0.75, w3));
    let grit: f32 = mix(1.0, spk, 0.45);
    // (and however thick it is, the eroded band stays see-through: a thick cloud times a thin mask is still a wall with a sharp rim)
    let tq: f32 = min(tau * em * tuft * grit, 0.05 + 4.0 * em * em);
    tau = mix(tau, tq, M.r.y);
  }
  if (tau < 0.00002) { return o; }
  let T: f32 = exp(-tau);
  // --- a little relief: the slope of the cloud's near face gives a normal, so billows read as billows (kept gentle: this is powder, not cotton)
  let e: vec2f = 2.5 / M.p.xy;
  let lim: vec4f = vec4f(30000.0);
  let x0: vec4f = clamp(texLod(tSpray, v.uv - vec2f(e.x, 0.0), 0.0), -lim, lim); let x1: vec4f = clamp(texLod(tSpray, v.uv + vec2f(e.x, 0.0), 0.0), -lim, lim);
  let y0: vec4f = clamp(texLod(tSpray, v.uv - vec2f(0.0, e.y), 0.0), -lim, lim); let y1: vec4f = clamp(texLod(tSpray, v.uv + vec2f(0.0, e.y), 0.0), -lim, lim);
  let zx0: f32 = mix(zr, x0.z / max(x0.w, 1e-7), saturate(x0.x * 3.0)); let zx1: f32 = mix(zr, x1.z / max(x1.w, 1e-7), saturate(x1.x * 3.0));
  let zy0: f32 = mix(zr, y0.z / max(y0.w, 1e-7), saturate(y0.x * 3.0)); let zy1: f32 = mix(zr, y1.z / max(y1.w, 1e-7), saturate(y1.x * 3.0));
  let mpu: vec2f = vec2f(2.0 * zm * U.camRight.w * U.camUp.w, 2.0 * zm * U.camRight.w);          // metres per unit uv at that depth
  var gr: vec2f = vec2f(zx1 - zx0, zy1 - zy0) / (2.0 * e * mpu) * M.p.z;
  // the strands have relief too
  gr = (gr + vec2f(w2 - 0.5, w1 - 0.5) * 0.9) * sharp;
  // (the relief is for the thick body of a cloud seen from some way off. Close by and where it is thin, a normal from the depth of the
  // near face lit the curtain like the sunny side of a dune: a solid thing. There the light comes from how much snow it passes through)
  let body: f32 = smoothstep(0.25, 1.8, tau);
  gr *= mix(body * smoothstep(5.0, 14.0, zm) + 0.15, 1.0, M.r.y);
  let gl: f32 = length(gr); gr = gr * (min(gl, 3.0) / max(gl, 1e-4));
  let nv: vec3f = normalize(vec3f(gr.x, -gr.y, 1.0));
  let Nw: vec3f = U.camRight.xyz * nv.x + U.camUp.xyz * nv.y - U.camFwd.xyz * nv.z;
  let ndl: f32 = dot(Nw, L);
  let sun: vec3f = U.sunCol.rgb * vis;
  // (1) the veil: light scattered once on its way through. Thin and against the sun = blazing
  let wbk: f32 = sq(saturate(mu)); let wfr: f32 = sq(saturate(-mu)); let wsd: f32 = 1.0 - wbk - wfr;
  let S1: f32 = wbk * tau * T + (wsd * (1.0 - T) + wfr * 0.5 * (1.0 - T * T)) * 0.5;
  let ph: f32 = (0.50 * hg(mu, 0.86) + 0.38 * hg(mu, 0.40) + 0.12 * hg(mu, -0.30)) * 12.566;
  var col: vec3f = sun * ph * S1 * 1.1;
  // (2) the body: where it is thick it is a white solid with a lit side and a shaded side. How lit is the sun that reaches this part of
  // its near face through the rest of the cloud (vis: from the cloud as the sun sees it), not a fixed share: under a side light the
  // half toward the sun is white-hot and the far half is in the cloud's own shadow
  let wrapD: f32 = mix(0.92, pow(saturate((ndl + 0.45) / 1.45), 1.25), body * smoothstep(5.0, 14.0, zm));
  // (white in the end: the light that comes back out of a thick cloud has been round many crystals and has lost some of the sun's tint)
  let sunN: vec3f = mix(sun, vec3f(luma(sun)), 0.3);
  col += sunN * (1.0 - T) * 0.95 * wrapD * mix(0.70, 1.0, body);
  // (3) light that got in on the sunny side and was scattered again (two more orders, each weaker, less forward and reaching deeper:
  // Wrenninge's octaves; vis^a is the sun's transmittance through a times the snow). It is what keeps a backlit core a soft grey and
  // not black, and what is left on the shaded side; by then it has lost the sun's warmth to the blue of the sky
  let ph2: f32 = (0.5 * hg(mu, 0.43) + 0.5 * hg(mu, 0.20)) * 12.566; let ph3: f32 = (0.5 * hg(mu, 0.21) + 0.5 * hg(mu, 0.10)) * 12.566;
  let skyT: vec3f = U.ambSky.rgb / max(luma(U.ambSky.rgb), 1e-5);
  let msC: vec3f = mix(U.sunCol.rgb, vec3f(luma(U.sunCol.rgb)), 0.3) * mix(vec3f(1.0), mix(vec3f(1.0), skyT, 0.6), 1.0 - vis);
  col += msC * ((1.0 - T) * (0.50 * mix(ph2, 1.2, body) * pow(vis, 0.5) + 0.30 * mix(ph3, 1.2, body) * pow(vis, 0.25)));
  // (4) the sky: from above blue, from below the white of the snow under it (weaker), less of either deep inside a thick cloud
  let up: f32 = Nw.y * 0.5 + 0.5;
  let occ: f32 = mix(1.0, 0.72, body);
  let amb: vec3f = (U.ambSky.rgb * (1.9 + 1.3 * up) + (U.ambGnd.rgb * 0.8 + U.sunCol.rgb * 0.035) * (1.0 - 0.6 * up)) * occ;
  col += amb * (1.0 - T);
  // (the night below keeps the shading it had)
  let deep: f32 = pow(vis, 0.35);
  let wrapN: f32 = pow(saturate((ndl + 0.45) / 1.45), 1.25);
  // (and whatever of it hangs in the beam of the headlamp)
  if (U.lamp.w > 0.0) { col += lampLight(U.camPos.xyz + d * (zm / max(dot(d, U.camFwd.xyz), 0.2))) * ((1.0 - T) * 0.55); }
  var To: f32 = T;
  // ---- by night none of the above will do. Those are the sun's formulas, and with the moon's light put through them (it is as grey as the
  // sun's is, and it hangs over the valley ahead, so the lens looks against it all night) the cloud was a bright grey fog on dark blue snow,
  // with the figure a ghost behind it and every shaded part of it a dark blotch. By night snow in the air shows where something lights it: in
  // the cone of the headlamp it glows and sparkles; the moon gives it a cold, faint edge; the town far off, a trace. The rest of it is all but
  // unseen: what a veil that swallows no light takes out of the dark behind it, it gives back from the dark around it. So there it is thin,
  // and as blue as the night is. (M.r.y: 0 by day, at golden hour and at dusk, which keep every digit of the above; 1 in the night proper)
  if (M.r.y > 0.0) {
    let tn: f32 = tau * mix(0.55, 0.75, M.r.z); let Tn: f32 = exp(-tn);
    let moon: vec3f = U.sunCol.rgb * vec3f(0.56, 0.78, 1.16) * (vis * mix(1.0, 2.1, M.r.z));
    // (against the moon the veil has a silver edge: it does not blaze as it does against the sun)
    let S1n: f32 = wbk * tn * Tn + (wsd * (1.0 - Tn) + wfr * 0.5 * (1.0 - Tn * Tn)) * 0.5;
    // (snow in the air by night is seen only where a light finds it. Outside the lamp's cone that is the moon alone, and the moon picks out
    // wisps, not a sheet: what it lights is torn by the same world noise as the edge, and the rest of the cloud is all but nothing.
    // With a constant ambient fill and the moon lighting all of it evenly, the curtain behind the skier read as a grey poster)
    let wisp: f32 = smoothstep(0.42, 0.78, wn) * smoothstep(0.30, 0.70, w3);
    var cn: vec3f = moon * ((min(ph, 1.4) * S1n * 0.8 + (1.0 - Tn) * mix(0.16, 0.55 * wrapN, smoothstep(0.25, 1.8, tn))) * (0.30 + 1.40 * wisp));
    // the dark around it: the sky, and the moonlit slope it hangs over, which is the largest light there is by night (a veil over that
    // snow has that snow's brightness, give or take: shaded with the sky alone it stood on the slope as a wall of dark smoke)
    // (but it is only what the cloud takes out of the snow behind it, given back: the cloud itself takes out little (see To below), so
    // this is a faint grey haze over the dark, and over lit snow next to nothing: it neither darkens that snow nor paints it blue)
    let ambN: vec3f = U.ambSky.rgb * (1.1 + 0.6 * up) + U.ambGnd.rgb * 0.95;
    cn += (mix(ambN, vec3f(luma(ambN)), 0.6) * 0.18 + moon * (0.05 * deep)) * ((1.0 - Tn) * (0.25 + 0.75 * wisp));
    // the town: a trace of its warmth in whatever hangs toward it
    cn += vec3f(1.0, 0.50, 0.42) * (0.0045 * U.skyP.z * (0.35 + 0.65 * sq(saturate(dot(d.xz, M.c.xy)))) * (1.0 - Tn));
    // the headlamp. It is the one light close enough to show how much snow there is, so it sees all of it (not the thinned veil).
    // Thin snow passes the beam on, most of it straight ahead: looked at against the lamp it blazes, from behind the lamp it glows.
    // Thick snow is a white face turned to the lamp. And it is crystals: here and there one of them throws the lamp straight back.
    if (U.lamp.w > 0.0) {
      let P1: vec3f = U.camPos.xyz + d * (zm / max(dot(d, U.camFwd.xyz), 0.2));
      // (the cone, and round the skier what the lamp spills sideways and what its pool on the snow throws back up: the turn's own snow is
      // beside and behind the lamp, never in its cone, and without this the skier's light did not touch the snow the skier throws)
      let dl: vec3f = P1 - U.lamp.xyz; let r2: f32 = dot(dl, dl); let cl: f32 = dot(dl, U.lampDir.xyz) / sqrt(max(r2, 1e-4));
      // (the spill is a glow, not a flood: at full strength it lit the whole near curtain behind the skier to one flat grey slab)
      let E: vec3f = lampLight(P1) + vec3f(1.0, 0.85, 0.64) * (U.lamp.w * 0.004 * smoothstep(-0.6, 0.3, cl) / (r2 + 6.0));
      let ml: f32 = dot(d, -dl) / sqrt(max(r2, 1e-4));
      // (the peak is held down: unheld, the whole cloud burnt out to one white shape against the lamp, thick and thin alike. Held, the thick
      // of it stands dark in a bright rim, as snow against a light does. And it is in thin snow that single crystals show)
      let phl: f32 = min((0.50 * hg(ml, 0.86) + 0.38 * hg(ml, 0.40) + 0.12 * hg(ml, -0.30)) * 12.566, 3.5);
      let glit: f32 = smoothstep(0.70, 1.0, s1) * smoothstep(0.40, 1.0, s2) * 14.0 * max(sharp, 0.6) * (1.0 - 0.6 * smoothstep(0.6, 2.5, tau));
      // (lit snow in the air is crystals and tufts, lit unevenly: the same world noise the edge is torn by, so it is never one even face)
      let tl: f32 = mix(0.15, 1.6, smoothstep(0.30, 0.70, wn));
      cn += E * ((phl * tau * T + (1.0 - T) * mix(0.30, 0.60, saturate(0.5 - 0.5 * ml))) * (tl + glit));
    }
    // the night cloud is light added, not a dye: it takes at most a tenth of what is behind it (real crystals off the lamp are all but
    // clear; it was its absorption, at full strength, that laid a dark blue smear over the lit kicker)
    col = mix(col, cn, M.r.y); To = mix(T, 1.0 - 0.10 * (1.0 - Tn), M.r.y);
  }
  o.color = vec4f(col, To);
  return o;
}`,So=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let t: f32 = U.camPos.w - a.a0.w; let life: f32 = a.a2.z;
  var g: GlintV = glintCull(); var cc: vec4f = vec4f(0.0);
  if (t > 0.0 && t < life) {
    let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
    // (a2 = how far the air lets its throw carry, the speed it falls at in the end, life, light: a crumb flies an arc, a flake rides the sheet's air)
    let seed: f32 = a.a1.w; let vs: f32 = a.a2.y; let wk: f32 = saturate(1.2 - vs * 0.25);
    let fy: Fly = snowFly(a.a0.xyz, a.a1.xyz, t, a.a2.x, 0.65 + 0.2 * vs, vs, wk);
    var pos: vec3f = fy.pos; let vel: vec3f = fy.vel;
    // flutter of the light flakes
    let fl: f32 = wk * smoothstep(0.2, 1.5, t) * 0.10;
    pos += fl * vec3f(sin(seed * 191.7 + t * 3.1), 0.5 * sin(seed * 77.3 + t * 2.3), cos(seed * 131.1 + t * 2.7));
    if (pos.y > groundH(pos) + 0.015) {
      let lf: f32 = t / life;
      // (right at the lens they would be discs and bars across the picture: they thin out before that)
      let zv: f32 = max(dot(pos - U.camPos.xyz, U.camFwd.xyz), 0.3);
      let fade: f32 = smoothstep(0.0, 0.02, t) * (1.0 - lf * lf * lf) * smoothstep(0.7, 2.6, zv);
      let power: f32 = a.a2.w * fade;
      let ts: f32 = sprayTau(pos, 0.1);
      let visC: f32 = 0.58 * exp(-0.85 * ts) + 0.42 * exp(-0.16 * ts);
      let vis: f32 = shadowFast(pos, 0.0015) * visC;
      // every one of them is a crumb of snow with a size of its own (most a few millimetres, a few the size of a hazelnut)
      let rc: f32 = (0.0032 + 0.011 * pow(fract(seed * 7.77), 3.0)) * (0.5 * U.res.y / U.camRight.w) / zv;
      // (by night, M.gp.z: the moon's sparks are fewer and fainter, the lamp's flashes carry it. glintQuad's moon light goes with power * vis,
      // its lamp light with power alone)
      let nt: f32 = M.gp.z; let pm: f32 = mix(1.0, 2.2, nt);
      g = glintQuad(corner, pos, vel, seed, power * pm, vis * mix(1.0, mix(0.40, 0.80, M.gp.w) / 2.2, nt), min(rc, 0.006 * U.res.y), M.gp.y);
      let foot: f32 = 3.14159 * g.shp.y * g.shp.y + 4.0 * g.shp.y * g.shp.x;
      // (one that is down in the shade of the cloud is lost in it: it is the ones flung clear, in the sun, that show. And the ones that go
      // past within a few strides of the lens are a blur of a blur: left in, they are bars across the sky, like rain on the glass)
      cc = vec4f(U.sunCol.rgb * (0.08 + 0.66 * vis) + U.ambSky.rgb * 1.5, min(1.0, 3.14159 * rc * rc / max(foot, 1e-3)) * 0.92 * fade * smoothstep(0.30, 0.85, vis) * smoothstep(2.4, 5.2, zv) * M.gp.x);
      // (by night a crumb is as cold and faint as the veil it flies in, unless the lamp has it: left as by day, they were dark pepper on a bright fog)
      if (nt > 0.0) {
        let ll: vec3f = lampLight(pos);
        let cn: vec3f = U.sunCol.rgb * vec3f(0.56, 0.78, 1.16) * ((0.05 + 0.36 * vis) * mix(1.0, 2.1, M.gp.w)) + (U.ambSky.rgb * 1.3 + U.ambGnd.rgb * 0.6) * 0.3 + ll * 1.2;
        let an: f32 = min(1.0, 3.14159 * rc * rc / max(foot, 1e-3)) * 0.92 * fade * max(smoothstep(0.30, 0.85, vis), saturate(ll.x * 6.0)) * smoothstep(2.4, 5.2, zv) * M.gp.x;
        cc = mix(cc, vec4f(cn, an), nt);
      }
    }
  }
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp; v.col = g.col; v.cc = cc;
  return v;
}`,Lo=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  var g: GlintV = glintCull();
  let t: f32 = U.camPos.w - a.a0.w; let life: f32 = a.a2.z;
  if (t > 0.0 && t < life) {
    let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
    // (a2 = how far the air lets its throw carry, the speed it settles at, life, how much light it has)
    let seed: f32 = a.a1.w; let vs: f32 = a.a2.y;
    let fy: Fly = snowFly(a.a0.xyz, a.a1.xyz, t, a.a2.x, 0.55, vs, 0.95);
    var pos: vec3f = fy.pos; var vel: vec3f = fy.vel;
    // a plate does not settle straight down: once its throw is spent it rocks and glides to and fro, a few centimetres, a turn or two a second
    let fq: f32 = 5.0 + 6.0 * fract(seed * 23.17); let fa: f32 = (0.02 + 0.05 * fract(seed * 5.71)) * smoothstep(0.15, 0.9, t);
    let ph: f32 = seed * 61.3 + t * fq;
    pos += vec3f(cos(ph), 0.0, sin(ph * 0.77)) * fa;
    vel += vec3f(-sin(ph), 0.0, 0.77 * cos(ph * 0.77)) * (fa * fq);
    if (pos.y > groundH(pos) + 0.01) {
      let rel: vec3f = pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz);
      let lf: f32 = t / life;
      let fade: f32 = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.6, 1.0, lf)) * smoothstep(0.3, 0.9, zv) * a.a2.w;
      if (fade > 0.002) {
        // (never smaller than about a pixel: a point of light much smaller than the pixels it falls between would only flicker as it moves)
        g = glintQuad(corner, pos, vel, seed, 1.0, 1.0, M.cr.z, M.cp.w);
        if (g.shp.y > 0.0) {
          let V: vec3f = -rel / max(length(rel), 1e-3); let L: vec3f = U.sunDir.xyz; let mu: f32 = dot(-V, L);
          // seen through the cloud: how much of the thrown cloud lies in front of it (its optical depth, and the depth of its near face).
          // Inside the thick heart of a curtain no crystal shows, as in the real thing; in the thin veil round it they all do
          let cp: vec4f = U.viewProj * vec4f(pos, 1.0); let ndc: vec2f = cp.xy / cp.w;
          let hp: vec2i = clamp(vec2i((vec2f(ndc.x, -ndc.y) * 0.5 + 0.5) * U.res.xy * 0.5), vec2i(0, 0), vec2i(M.cq.xy));
          let oc: vec4f = clamp(texFetch(tOcc, hp, 0), vec4f(-30000.0), vec4f(30000.0));
          var Tv: f32 = 1.0;
          if (oc.x > 0.001 && oc.w > 1e-7) { let zn: f32 = oc.z / oc.w + U.dof.x; Tv = exp(-M.cr.x * oc.x * smoothstep(zn - 0.4, zn + 1.2, zv)); }
          // the sun reaching it: through the terrain, the trees, the skier, and the cloud on the sun's side
          let ts: f32 = sprayTau(pos, 0.1);
          let vis: f32 = shadowFast(pos, 0.0015) * (0.58 * exp(-0.85 * ts) + 0.42 * exp(-0.16 * ts));
          // The flash. Turning a few times a second, a face lines up with the sun now and then: a chance event, drawn afresh in every slice
          // of time a crystal takes to turn through a few degrees (a slice spans two or three frames, so a flash is never a one-frame speck
          // of noise). There are more of them toward the sun, where light bent through the plate joins what its faces reflect.
          let tm: f32 = U.camPos.w;
          let sr: f32 = 14.0 + 22.0 * fract(seed * 7.31);
          let sl: f32 = tm * sr + seed * 917.0; let k: f32 = floor(sl); let fr: f32 = sl - k;
          let hs: u32 = pcg(u32(seed * 16777215.0) ^ pcg(u32(k)));
          let h1: f32 = u2f(hs); let h2: f32 = u2f(pcg(hs + 7u)); let h3: f32 = u2f(pcg(hs + 13u));
          let back: f32 = smoothstep(-0.1, 0.92, mu);
          let pf: f32 = M.cp.x * (0.33 + 0.67 * back);
          let env: f32 = sin(3.14159 * fr);
          let Hh: vec3f = normalize(V + L + vec3f(0.0, 1e-4, 0.0));
          let fres: f32 = 0.04 + 0.96 * pow(1.0 - saturate(dot(Hh, L)), 5.0);
          // (most flashes are a glint; a few blaze)
          let str: f32 = 0.3 + 0.7 * h2 * h2;
          var e: f32 = 0.0; var fl: f32 = 0.0;
          if (h1 < pf) { fl = str * env; e = M.cp.y * fl * (0.25 + 1.2 * fres + 1.5 * back); }
          // between flashes: what a crystal scatters forward. Against the sun every one of them is a point of light; away from it, nothing
          e += M.cq.z * min(hg(mu, 0.8) * 12.566, 12.0) * (0.3 + 0.7 * fract(seed * 3.37));
          // and what any grain does in sunlight whichever way it is seen: a speck of white, lit on the side toward the sun. So thrown snow
          // reads as grit and not only as smoke, front-lit and side-lit too (the owner: '主动摩擦起来的雪' has to show its particles)
          e += M.cr.y * (0.4 + 1.2 * fract(seed * 5.13)) * (0.45 + 0.55 * saturate(-mu * 0.5 + 0.5));
          var gc: vec3f = U.sunCol.rgb * (e * vis * M.cp.z);
          // the headlamp: crystals in its beam flash back at it, and the lens is just behind it
          if (U.lamp.w > 0.0) {
            let ll: vec3f = lampLight(pos);
            if (ll.x > 0.00002) { var el: f32 = 0.10; if (h3 < M.cp.x * 0.9) { el += M.cq.w * str * env; fl = max(fl, str * env); } gc += ll * el; }
          }
          // the same light spread over the footprint it is drawn on (a crystal blurred into a lens disc is dimmer per pixel, not brighter)
          let sc: f32 = max(U.res.y / 1170.0, 0.75);
          let area: f32 = 3.14159 * g.shp.y * g.shp.y + 4.0 * g.shp.y * g.shp.x;
          let kA: f32 = (3.14159 * 0.85 * 0.85 * sc * sc) / pow(area, 0.78);
          let hue: vec3f = mix(vec3f(1.0, 0.86, 0.62), vec3f(0.62, 0.86, 1.0), fract(seed * 11.0));
          gc *= mix(vec3f(1.0), hue, 0.22 * saturate(fl * 3.0)) * (kA * Tv * fade);
          if (max(gc.r, max(gc.g, gc.b)) < 2e-5) { g = glintCull(); } else { g.col = vec4f(gc, fl); }
        }
      }
    }
  }
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp; v.col = g.col;
  return v;
}`,To=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.k0 = vec4f(0.0); v.k1 = vec4f(0.0); v.k2 = vec4f(0.0); v.k3 = vec4f(0.0); v.k4 = vec4f(0.0);
  let t: f32 = U.camPos.w - a.a0.w;
  if (t <= 0.0 || t >= a.a2.z) { return v; }
  let tau: f32 = a.a2.x; let size: f32 = a.a2.w;
  // the flight with a linear drag whose terminal speed is the clump's: it starts off falling at g, and a lump of snow is nowhere near its
  // terminal speed (8-12 m/s) before it lands, so this is a true arc. The same formula runs on the CPU to find where it lands
  let vT: vec3f = vec3f(a.a3.x, -a.a2.y, a.a3.y);
  let ex: f32 = exp(-t / tau);
  let pos: vec3f = a.a0.xyz + (a.a1.xyz - vT) * (tau * (1.0 - ex)) + vT * t;
  let vel: vec3f = (a.a1.xyz - vT) * ex + vT;
  let rel: vec3f = pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz);
  if (zv < 0.45) { return v; }
  let cp: vec4f = U.viewProj * vec4f(pos, 1.0); let ndc: vec2f = cp.xy / cp.w;
  if (abs(ndc.x) > 1.2 || abs(ndc.y) > 1.2) { return v; }
  let sc: f32 = U.res.y / 1170.0;
  let rp: f32 = 0.5 * size * U.res.y / (2.0 * U.camRight.w * zv);
  let coc: f32 = min(U.dof.y * abs(1.0 / U.dof.x - 1.0 / zv), U.dof.z) * sc;
  let R: f32 = sqrt(rp * rp + coc * coc + 0.3 * sc * sc);
  // where it was a shutter ago: a streak (a little longer than the real shutter, as the spray's grains are)
  let pp: vec4f = U.prevViewProj * vec4f(pos - vel * U.misc.z, 1.0);
  var mv: vec2f = vec2f(0.0);
  if (pp.w > 0.05) { mv = (ndc - pp.xy / pp.w) * vec2f(0.5, -0.5) * U.res.xy * (U.dof.w * M.kp.x / max(U.misc.z, 0.004)); }
  var ml: f32 = length(mv); var ax: vec2f = vec2f(1.0, 0.0);
  if (ml > 0.3) { ax = mv / ml; } else { ml = 0.0; }
  ml = min(ml, 0.1 * U.res.y);
  let hl: f32 = ml * 0.5;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let lp: vec2f = corner * vec2f(hl + R * 1.15 + 1.5, R * 1.15 + 1.5);
  let opx: vec2f = ax * lp.x + vec2f(-ax.y, ax.x) * lp.y;
  v.clip = vec4f((ndc + opx * vec2f(2.0, -2.0) * U.res.zw) * cp.w, cp.z, cp.w);
  v.uv = lp;
  // behind the thick of the cloud it is lost; in the thin of it, veiled
  let hp: vec2i = clamp(vec2i((vec2f(ndc.x, -ndc.y) * 0.5 + 0.5) * U.res.xy * 0.5), vec2i(0, 0), vec2i(M.kq.xy));
  let oc: vec4f = clamp(texFetch(tOcc, hp, 0), vec4f(-30000.0), vec4f(30000.0));
  var Tv: f32 = 1.0;
  // (a lump is solid: in the photos the ones in the near face of a powder cloud show as specks on it, only those deep inside are lost)
  if (oc.x > 0.001 && oc.w > 1e-7) { let zn: f32 = oc.z / oc.w + U.dof.x; Tv = exp(-0.45 * oc.x * smoothstep(zn - 0.1, zn + 1.2, zv)); }
  let ts: f32 = sprayTau(pos, 0.05);
  let vis: f32 = shadowFast(pos, 0.002) * (0.58 * exp(-0.85 * ts) + 0.42 * exp(-0.16 * ts));
  // a smeared or blurred lump covers less of each pixel it is spread over
  let cov: f32 = min(1.0, (rp * rp + 0.3 * sc * sc) / (R * R)) / (1.0 + 0.9 * hl / R);
  // (one within a stride or two of the lens is a blur crossing the picture in a frame: left in, a near one is a flat chip as big as a hand)
  let fade: f32 = smoothstep(0.0, 0.025, t) * smoothstep(0.9, 2.4, zv) * M.kp.z;
  v.k0 = vec4f(hl, R, rp, zv);
  v.k1 = vec4f(ax, a.a1.w * 6.2832 + t * a.a3.z, cov * fade * Tv);
  v.k2 = vec4f(vis, a.a1.w, dot(normalize(rel), U.sunDir.xyz), size);
  var ll: vec3f = vec3f(0.0); var Ld: vec3f = vec3f(0.0, 1.0, 0.0);
  if (U.lamp.w > 0.0) { ll = lampLight(pos); Ld = normalize(U.lamp.xyz - pos); }
  v.k3 = vec4f(ll, 0.0); v.k4 = vec4f(Ld, 0.0);
  return v;
}`,Ao=`
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0);
  let hl: f32 = v.k0.x; let R: f32 = v.k0.y; let rp: f32 = v.k0.z;
  // the nearest point of the streak, in units of the drawn radius
  let q: vec2f = vec2f(v.uv.x - clamp(v.uv.x, -hl, hl), v.uv.y) / R;
  let r: f32 = length(q);
  if (r > 1.2) { return o; }
  // the scene in front of it hides it
  let sz: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  if (v.k0.w > sz + 0.04) { return o; }
  // back to the axes of the screen (x right, y down)
  let ax: vec2f = v.k1.xy; let s: vec2f = vec2f(ax.x * q.x - ax.y * q.y, ax.y * q.x + ax.x * q.y);
  // a lump, not a ball: its outline goes in and out, and turns as it tumbles (blurred, the detail goes)
  let sd: f32 = v.k2.y * 40.0; let ph: f32 = v.k1.z; let th: f32 = atan2(s.y, s.x);
  let sharp: f32 = rp / R;
  let rim0: f32 = 0.80 + 0.11 * sin(2.0 * th + ph + sd) + 0.08 * sin(3.0 * th - 1.3 * ph + sd * 1.7) + 0.05 * sin(5.0 * th + 2.1 * ph + sd * 2.3);
  let rim: f32 = mix(0.92, rim0, sharp);
  let w: f32 = max(1.4 / R, 1.0 - sharp);
  var al: f32 = smoothstep(rim + 0.5 * w, rim - 0.5 * w, r);
  if (al < 0.003) { return o; }
  // its normal: a ball's, bent by a few knobs that turn with it
  var nxy: vec2f = vec2f(s.x, -s.y) / rim;
  nxy += 0.22 * vec2f(sin(s.x * 5.0 + ph * 1.3 + sd), cos(s.y * 4.0 - ph + sd * 0.7)) * sharp;
  let l2: f32 = dot(nxy, nxy);
  if (l2 > 0.97) { nxy *= sqrt(0.97 / l2); }
  let nz: f32 = sqrt(max(1.0 - dot(nxy, nxy), 0.0));
  let N: vec3f = normalize(U.camRight.xyz * nxy.x + U.camUp.xyz * nxy.y - U.camFwd.xyz * nz);
  // lit as the snow it came from: the sun on the side that faces it (a little wrapped: snow is translucent), the blue sky on the rest,
  // the bright slope from below, and the lamp after dark
  let L: vec3f = U.sunDir.xyz;
  let wrap: f32 = saturate((dot(N, L) + 0.2) / 1.2);
  let amb: vec3f = U.ambSky.rgb * (1.3 + 0.8 * N.y) + U.ambGnd.rgb * (0.50 - 0.45 * N.y) + twiLight(N);
  var col: vec3f = 0.9 * (U.sunCol.rgb * (wrap * v.k2.x) + amb);
  col += v.k3.rgb * (0.9 * saturate(dot(N, v.k4.xyz)) + 0.1);
  // a lump of snow is not a stone: light gets into it and out again. Seen against the sun its edge glows, and even its shaded side is lit
  // a little from inside (with the sun behind it, a pure diffuse ball read as a grey pebble lying on the bright snow)
  let mu: f32 = v.k2.z;
  col += U.sunCol.rgb * (v.k2.x * (0.18 + 0.55 * saturate(mu) * pow(1.0 - nz, 2.0) + 0.25 * hg(mu, 0.5) * 12.566 * 0.12));
  // (and a crumb a centimetre across is thin enough that the sun comes through it whole: against the sun the small ones glow, they are not
  // grey chips. The bigger the lump, the more of it is its own shade)
  let thin: f32 = 1.0 - 0.7 * smoothstep(0.012, 0.07, v.k2.w);
  col += U.sunCol.rgb * (v.k2.x * thin * 2.6 * pow(saturate(mu), 2.0));
  // (no two alike: some catch more of the light than others)
  col *= 0.7 + 0.6 * fract(v.k2.y * 23.7);
  // (by night a clump is as faint as the veil it flies in unless the lamp has it: a dark fleck on the moonlit snow reads as dirt)
  al *= v.k1.w * mix(1.0, saturate(0.25 + luma(v.k3.rgb) * 8.0), M.kp.w);
  o.color = vec4f(col * al, al);
  return o;
}`,Ms=(()=>{const e={NC:49152,CF:12,NK:8192,KF:16,enabled:!0,flashP:.16,flashK:70,glowK:.05,lampK:9,shutK:.5,clumpShut:1.5,occK:.6,rmin:.75,gritK:.25,stats:{crystals:0,clumps:0,impacts:0,deposits:0,ms:0}};typeof Dt<"u"&&(Dt.def("sparkle","闪光",[["a","没有冰晶群"],["b","真实"],["c","再多一点"]],"b"),Dt.def("clumps","雪团",[["a","没有"],["b","真实"],["c","多一些"]],"b"));const s={a:0,b:1,c:1.6},w={a:0,b:1,c:1.7},x={a:0,b:1,c:2.2},F={a:0,b:1,c:1.8},we=()=>{var z;return typeof Dt<"u"&&(z=F[Dt.val.sparkle])!=null?z:1},Y=()=>{var z;return typeof Dt<"u"&&(z=w[Dt.val.sparkle])!=null?z:1},E=()=>{var z;return typeof Dt<"u"&&(z=x[Dt.val.clumps])!=null?z:1};let D,be,ht,qe,se,_,b,re=0,m=0,J=1;const ae=[],X=[],ke=[0,0,0],C=D0(4211),ne=[];e.init=function(z){D=z;const V=!!(window.matchMedia&&matchMedia("(pointer: coarse) and (hover: none)").matches),I=+new URLSearchParams(location.search).get("crystals");e.NC=I>0?Math.round(I):V||(navigator.deviceMemory||8)<4?20480:49152,J=e.NC/49152,qe=new Float32Array(e.NC*e.CF),se=new Float32Array(e.NK*e.KF),be=D.buffer(qe,"vertex",!0),ht=D.buffer(se,"vertex",!0),_=D.pipeline({name:"grainCrystal",lib:[St.common,St.hash,St.depth,St.shadow,St.sprayTau,$s,oa,Gs],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"add",buffers:[{instanced:!0,attrs:[["a0","vec4f"],["a1","vec4f"],["a2","vec4f"]]}],varyings:{uv:"vec2f",shp:"vec4f",col:"vec4f"},uniforms:{hx:"vec4f",cp:"vec4f",cq:"vec4f",cr:"vec4f"},textures:{tH:"fetch",tDepth:"depth",tShadow:"shadow",tSunTau:"2d",tOcc:"2d"},vs:Lo,fs:"fn frag(v: VOut) -> FOut { var o: FOut; o.color = glintShade(v.uv, v.shp, v.col); return o; }"}),b=D.pipeline({name:"grainClump",lib:[St.common,St.depth,St.shadow,St.sprayTau],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"premul",buffers:[{instanced:!0,attrs:[["a0","vec4f"],["a1","vec4f"],["a2","vec4f"],["a3","vec4f"]]}],varyings:{uv:"vec2f",k0:"vec4f",k1:"vec4f",k2:"vec4f",k3:"vec4f",k4:"vec4f"},uniforms:{kp:"vec4f",kq:"vec4f"},textures:{tDepth:"depth",tShadow:"shadow",tSunTau:"2d",tOcc:"2d"},vs:To,fs:Ao}),e.pipes=[_,b],ke[0]=qt.origin[0],ke[1]=qt.origin[1],ke[2]=qt.origin[2],typeof Jt<"u"&&(Jt.onEmit?Jt.onEmit.push(e.onEmit):H()),typeof At<"u"&&At.onTick&&At.onTick.push(e.step)};function Be(){const z=qt.origin,V=z[0]-ke[0],I=z[1]-ke[1],Q=z[2]-ke[2];if(!(!V&&!I&&!Q)){for(let L=0;L<e.NC;L++){const ye=L*e.CF;qe[ye]-=V,qe[ye+1]-=I,qe[ye+2]-=Q}for(let L=0;L<e.NK;L++){const ye=L*e.KF;se[ye]-=V,se[ye+1]-=I,se[ye+2]-=Q}ae.length=0,X.length=0,ae.push([0,e.NC]),X.push([0,e.NK]),ke[0]=z[0],ke[1]=z[1],ke[2]=z[2]}}function Ee(z,V){const I=z[z.length-1];I&&I[0]+I[1]===V?I[1]++:z.push([V,1])}function je(z,V,I,Q){for(const[L,ye]of I)D.updateBuffer(z,L*Q*4,V.subarray(L*Q,(L+ye)*Q));I.length=0}e.clear=function(){qe&&(qe.fill(0),se.fill(0),ne.length=0,ae.length=0,X.length=0,ae.push([0,e.NC]),X.push([0,e.NK]))};function $e(z,V,I,Q,L,ye,Ve,Ne,Ce,Ye,T){const Se=re*e.CF,me=qe;me[Se]=V-ke[0],me[Se+1]=I-ke[1],me[Se+2]=Q-ke[2],me[Se+3]=z,me[Se+4]=L,me[Se+5]=ye,me[Se+6]=Ve,me[Se+7]=C(),me[Se+8]=Ne,me[Se+9]=Ce,me[Se+10]=Ye,me[Se+11]=T,Ee(ae,re),re=(re+1)%e.NC,e.stats.crystals++}e.crystals=function(z,V,I,Q,L){if(!qe||!e.enabled)return 0;Be();const ye=L||{},Ve=ye.spread!=null?ye.spread:.6,Ne=ye.r!=null?ye.r:.1,Ce=ye.life||3,Ye=ye.brake||1.6,T=ye.vs||[.3,1],Se=ye.power||1;let me=Q*Y()*J;const B=Math.floor(me);me=B+(C()<me-B?1:0);for(let U=0;U<me;U++){const A=C()*It,a=C()*2-1,oe=Math.sqrt(1-a*a),fe=Ne*Math.cbrt(C()),O=.65+.7*C(),ie=Math.cos(A)*oe,ce=a,He=Math.sin(A)*oe,We=Ve*Math.sqrt(C());$e(z+(ye.dt||0)*C(),V[0]+ie*fe,V[1]+ce*fe,V[2]+He*fe,I[0]*O+ie*We,I[1]*O+ce*We,I[2]*O+He*We,Ye*(.6+.8*C()),Re(T[0],T[1],Math.pow(C(),1.5)),Ce*(.6+.8*C()),Se*(.5+C())/Math.sqrt(J))}return me};const nt=9.81;function Ke(z,V,I,Q,L,ye){const Ve=Math.exp(-ye/L),Ne=L*(1-Ve);return z[0]=V[0]+(I[0]-Q[0])*Ne+Q[0]*ye,z[1]=V[1]+(I[1]-Q[1])*Ne+Q[1]*ye,z[2]=V[2]+(I[2]-Q[2])*Ne+Q[2]*ye,z}const Fe=[0,0,0],Ge=[0,0,0];function Je(z,V,I,Q,L,ye){let Ve=0,Ne=0;L=L||.03;for(let Ce=L;Ce<3.5;Ce+=L){if(Ke(Fe,z,V,I,Q,Ce),Fe[1]<=vt.height(Fe[0],Fe[2],.5)){Ne=Ce;break}Ve=Ce}if(!Ne)return 3.5;for(let Ce=0;Ce<(ye||6);Ce++){const Ye=.5*(Ve+Ne);Ke(Ge,z,V,I,Q,Ye),Ge[1]<=vt.height(Ge[0],Ge[2],.5)?Ne=Ye:Ve=Ye}return Ne}function le(){const z=At.state&&At.state.wind;return z?[z[0],z[2]]:[1.2,.4]}function Pe(z,V,I,Q,L){Be();const ye=7+5*Math.sqrt(Math.min(Q/.08,1))*(.8+.4*C()),Ve=ye/nt,Ne=le(),Ce=.12,Ye=[Ne[0]*Ce,-ye,Ne[1]*Ce],T=L.nodep?Je(V,I,Ye,Ve,.08,4):Je(V,I,Ye,Ve),Se=m*e.KF,me=se;me[Se]=V[0]-ke[0],me[Se+1]=V[1]-ke[1],me[Se+2]=V[2]-ke[2],me[Se+3]=z,me[Se+4]=I[0],me[Se+5]=I[1],me[Se+6]=I[2],me[Se+7]=C(),me[Se+8]=Ve,me[Se+9]=ye,me[Se+10]=T,me[Se+11]=Q,me[Se+12]=Ye[0],me[Se+13]=Ye[2],me[Se+14]=(C()<.5?-1:1)*(3+12*C()),me[Se+15]=0,Ee(X,m),m=(m+1)%e.NK,e.stats.clumps++;const B=Ke([0,0,0],V,I,Ye,Ve,T),U=Math.exp(-T/Ve),A=[(I[0]-Ye[0])*U+Ye[0],(I[1]-Ye[1])*U+Ye[1],(I[2]-Ye[2])*U+Ye[2]],a=L.powder||0,oe=typeof Jt<"u"&&Jt.puff?Jt:null;if(oe&&L.trail!==!1&&Q>.02){const fe=Q>.045?2:1;for(let O=1;O<=fe;O++){const ie=T*(O/(fe+1))*(.7+.3*C()),ce=Ke([0,0,0],V,I,Ye,Ve,ie),He=Math.exp(-ie/Ve);oe.puff(z+ie,ce[0],ce[1],ce[2],((I[0]-Ye[0])*He+Ye[0])*.12,((I[1]-Ye[1])*He+Ye[1])*.12,((I[2]-Ye[2])*He+Ye[2])*.12,.88,.02+.35*Q,.25+9*Q,1.4,.45,.3)}e.crystals(z+T*.5*C(),Ke([0,0,0],V,I,Ye,Ve,T*.4),[A[0]*.1,.2,A[2]*.1],2+40*Q,{spread:.3,r:.05,life:2})}if(oe&&L.burst!==0){const fe=L.burst||1,O=Re(.35,1.1,a)*(.7+.6*C()),ie=.25+.15*a;oe.puff(z+T,B[0],B[1]+.03,B[2],A[0]*ie,O,A[2]*ie,.55+.3*C(),.03+.9*Q,Math.min(1.4+38*Q,4.5)*fe*(.8+.5*a),1,.6+.4*a,.5),e.crystals(z+T,[B[0],B[1]+.03,B[2]],[A[0]*.15,.6+.6*a,A[2]*.15],(5+160*Q)*fe,{spread:.9,r:.04,life:1.8,brake:.6})}if(L.split!==!1&&Q>.045&&a<.5&&C()<.7){const fe=2+(C()<.4?1:0);for(let O=0;O<fe;O++){const ie=(C()-.5)*1.2,ce=Math.cos(ie),He=Math.sin(ie),We=.3+.25*C(),Qe=(A[0]*ce-A[2]*He)*We,st=(A[0]*He+A[2]*ce)*We,Le=Math.abs(A[1])*(.15+.2*C())+.4;Pe(z+T,[B[0],B[1]+.03,B[2]],[Qe,Le,st],Q*(.35+.25*C()),{trail:!1,burst:.5,split:!1,powder:a})}}return L.nodep||ne.push({t:z+T,p:B,d:[A[0],A[2]],s:Q,pow:a}),T}e.clumps=function(z,V,I,Q,L,ye){if(!se||!e.enabled)return 0;const Ve=ye||{},Ne=Ve.spread!=null?Ve.spread:1,Ce=Ve.r!=null?Ve.r:.15;let Ye=Q*E();const T=Math.floor(Ye);Ye=T+(C()<Ye-T?1:0);for(let Se=0;Se<Ye;Se++){const me=C()*It,B=C()*2-1,U=Math.sqrt(1-B*B),A=.75+.55*C(),a=Ne*Math.sqrt(C()),oe=Math.cos(me)*U,fe=B,O=Math.sin(me)*U,ie=Ce*Math.sqrt(C()),ce=Math.min(L*Math.exp(.5*(C()+C()+C()-1.5)),.08);Pe(z+(Ve.dt||0)*C(),[V[0]+oe*ie,V[1]+Math.abs(fe)*ie*.3,V[2]+O*ie],[I[0]*A+oe*a,I[1]*A+fe*a*.6,I[2]*A+O*a],ce,Ve)}return Ye},e.step=function(){if(!ne.length)return;const z=At.t,V=typeof F0<"u"&&typeof F0.deposit=="function";for(let I=ne.length-1;I>=0;I--){const Q=ne[I];if(!(Q.t>z)&&(ne.splice(I,1),e.stats.impacts++,V&&z-Q.t<1)){const L=Math.hypot(Q.d[0],Q.d[1])||1;F0.deposit("pock",Q.p,[Q.d[0]/L,Q.d[1]/L],Q.s),e.stats.deposits++}}};let pe=-9,c=0,Ie=0,he=0;e.onEmit=function(z){if(!e.enabled||!z||!z.p)return;const V=performance.now(),I=z.kind,Q=Math.max(0,Math.min(z.rate||0,2.5)),L=z.powder||0,ye=z.v||[0,0,0],Ve=Math.hypot(ye[0],ye[1],ye[2]),Ne=z.f||[0,-1],Ce=z.r||[1,0];if(I==="carve"||I==="skid"||I==="powder"){let Ye=z.t-pe;pe=z.t,Ye=Ye>0&&Ye<.1?Ye:1/120,c+=Math.pow(Q,.9)*12e3*(.7+.6*L)*Ye;const T=I==="skid"?1:0,Se=Math.max(0,Q-.35);if(Ie+=Math.pow(Se,1.3)*26*(.9+2.6*L*L+.5*T)*Ye,he+=220*ge(3,6,Ve)*(1-ge(.25,.9,L))*we()*Ye,he+=Math.pow(Q,1.1)*1800*(.6+.6*L+.6*(1-ge(.25,.9,L)))*ge(2,8,Ve)*we()*Ye,he>=1){const me=Math.min(Math.floor(he),320);he-=Math.floor(he);for(let B=0;B<me;B++){const U=Re(-.8,.5,C()),A=.7+.7*Math.pow(C(),.8),a=(C()-.25)*(z.spread||.5),oe=.004+.018*Math.pow(C(),3);Pe(z.t-C()/120,[z.p[0]+Ne[0]*U,z.p[1]+.03,z.p[2]+Ne[1]*U],[ye[0]*A+(C()-.5)*1.6,ye[1]*A+a*Ve*.7+.6*C(),ye[2]*A+(C()-.5)*1.6],oe,{trail:!1,burst:0,split:!1,nodep:!0,powder:L})}}if(c>=1){const me=Math.floor(c);c-=me;for(let B=0;B<me;B++){const U=Re(-.85,.55,C()),A=.85+.95*Math.pow(C(),.7),a=(C()-.4)*(z.spread||.5),oe=ye[0]*A+(C()-.5)*.8,fe=ye[1]*A+a*Ve*.6+.25*C(),O=ye[2]*A+(C()-.5)*.8;e.crystals(z.t-C()/120,[z.p[0]+Ne[0]*U,z.p[1]+.02,z.p[2]+Ne[1]*U],[oe,fe,O],1,{spread:.35+.3*Ve*.1,r:.06,life:Re(1.8,4.5,L),brake:Re(1.6,3.4,Math.min(Q,1.5)/1.5)})}}if(Ie>=1){const me=Math.floor(Ie);Ie-=me;for(let B=0;B<me;B++){const U=Re(-.7,.4,C()),A=.85+.5*C();e.clumps(z.t,[z.p[0]+Ne[0]*U,z.p[1]+.03,z.p[2]+Ne[1]*U],[ye[0]*A,ye[1]*A+.5*C(),ye[2]*A],1,Re(.025,.04,L)*(1+.4*T),{spread:.9+.1*Ve,powder:L,r:.1})}}}else if(I==="land"||I==="fall"){const Ye=2.2+2*Q,T=Ve*.3,Se=Math.hypot(Ne[0],Ne[1])||1,me=Ne[0]/Se,B=Ne[1]/Se;for(const U of[-1,1]){const A=[Ce[0]*U*Ye*.8+me*T,.9+.8*Q,Ce[1]*U*Ye*.8+B*T];e.crystals(z.t,[z.p[0],z.p[1]+.04,z.p[2]],A,260*Q*(.7+.6*L),{spread:1.6,r:.5,life:Re(1.8,4.5,L),brake:1.4}),e.clumps(z.t,[z.p[0]+Ce[0]*U*.2,z.p[1]+.04,z.p[2]+Ce[1]*U*.2],[A[0],.7+1.4*Q*(.6+.6*L),A[2]],Q*(4+9*L),Re(.03,.045,L),{spread:1.4,powder:L,r:.5,dt:.1})}}else I==="sift"?(e.crystals(z.t,z.p,ye,220*Q,{spread:.7,r:.8,life:4,brake:.6,vs:[.3,.8]}),e.clumps(z.t,z.p,ye,2.5*Q,.035,{spread:.6,r:.7,powder:1})):I==="pole"&&e.crystals(z.t,z.p,ye,25*Math.max(Q,.5),{spread:.6,r:.05,life:1.6,brake:.4});e.stats.ms+=performance.now()-V};function H(){const z=Jt,V=z.onStep,I=z.slap,Q=z.sift,L=z.poles;z.onStep=function(ye,Ve,Ne){if(V.call(z,ye,Ve,Ne),!ye.contact||ye.speed<1.2)return;const Ce=ye.aReac>=0?1:-1,Ye=ye.n,T=ye.t,Se=ye.r,me=Math.cos(ye.beta),B=Math.sin(ye.beta),U=Math.abs(B),A=Math.abs(ye.aReac)/9.81,a=-Ce*(Se[0]*me-T[0]*B),oe=-Ce*(Se[1]*me-T[1]*B),fe=-Ce*(Se[2]*me-T[2]*B),O=T[0]*me+Se[0]*B,ie=T[2]*me+Se[2]*B,ce=it(ye.speed*(.08+.42*mt(A/1.5)+.85*U),1.2,15),He=Re(.5,.85,mt(U/.4)),We=Math.cos(He),Qe=Math.sin(He),st=zt.pose.stance*.5+.05;e.onEmit({kind:U>.3?"skid":ye.powder>.6?"powder":"carve",t:Ne,p:[ye.p[0]+a*st,ye.h+.03,ye.p[2]+fe*st],v:[ye.v[0]*.15+(a*We+Ye[0]*Qe)*ce*.8,ye.v[1]*.15+(oe*We+Ye[1]*Qe)*ce*.8,ye.v[2]*.15+(fe*We+Ye[2]*Qe)*ce*.8],spread:.5,rate:Math.min(z.intensity,2),powder:ye.powder,r:[Se[0],Se[2]],f:[O,ie]})},z.slap=function(ye,Ve,Ne,Ce,Ye){I.call(z,ye,Ve,Ne,Ce,Ye);const T=Math.hypot(Ne[0],Ne[2])||1,Se=Ne[0]/T,me=Ne[2]/T;e.onEmit({kind:"land",t:ye,p:[Ve[0],vt.height(Ve[0],Ve[2],.5),Ve[2]],v:[Ne[0]*.3,1,Ne[2]*.3],spread:1.2,rate:Ye,powder:zt.s.powder,r:[-me,Se],f:[Se,me]})},z.sift=function(ye,Ve,Ne,Ce){Q.call(z,ye,Ve,Ne,Ce),e.onEmit({kind:"sift",t:ye,p:Ve,v:[Ne[0]*.25,-.6,Ne[2]*.25],spread:1,rate:Ce,powder:1,r:[1,0],f:[0,-1]})},z.poles=function(ye,Ve,Ne){L.call(z,ye,Ve,Ne);const Ce=Ve.fwd;e.onEmit({kind:"pole",t:ye,p:[Ve.pos[0]+Ce[0]*.25,Ve.pos[1],Ve.pos[2]+Ce[2]*.25],v:[-Ce[0]*.6,1.2,-Ce[2]*.6],spread:.8,rate:1,powder:zt.s.powder,r:[1,0],f:[Ce[0],Ce[2]]})},e.tapped=!0}return e.fx=function(z){var Ce;if(!e.enabled||!_)return;Be(),je(be,qe,ae,e.CF),je(ht,se,X,e.KF);const V=o0.occTex;if(!V)return;const I=Jt.hb||ts.heightBinding(z.origin,1),Q=Math.max(1,qt.W>>1)-1,L=Math.max(1,qt.H>>1)-1,ye=Jt.nt||0,Ve=typeof M0<"u"&&M0.k||0,Ne=(1-.97*ye)*(1-.6*Ve);Y()>0&&D.draw(_,{u:{hx:I.xf,cp:[e.flashP,e.flashK,Ne,e.shutK],cq:[Q,L,e.glowK,e.lampK],cr:[e.occK,e.gritK*((Ce=s[typeof Dt<"u"?Dt.val.sparkle:"b"])!=null?Ce:1),e.rmin*Math.max(1,qt.H/1170),0]},tex:{tH:I.tex,tDepth:z.depth,tShadow:z.shadowTex,tSunTau:Jt.sunTex,tOcc:V},vb:[be],count:4,instances:e.NC}),D.draw(b,{u:{kp:[e.clumpShut,0,1,ye],kq:[Q,L,0,0]},tex:{tDepth:z.depth,tShadow:z.shadowTex,tSunTau:Jt.sunTex,tOcc:V},vb:[ht],count:4,instances:e.NK})},e})(),Ks=(()=>{const e={enabled:!0,layers:[{W:32,n:4600,power:1.3,fall:.38},{W:8,n:1700,power:1,fall:.3},{W:2,n:64,power:1.5,fall:.22}],heavy:[{W:32,n:14e3,size:.015,fall:1.15,op:.7,shut:3.5},{W:16,n:14e3,size:.018,fall:1.05,op:1,shut:3.5},{W:4,n:160,size:.021,fall:.9,op:.6,shut:1.6}]};let s,w,x,F;e.init=function(Y){s=Y,w=s.pipeline({name:"dust",lib:[St.common,St.hash,St.depth,St.shadow,Gs],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"add",buffers:[],varyings:{uv:"vec2f",shp:"vec4f",col:"vec4f"},uniforms:{p:"vec4f",o:"vec4f",w:"vec4f"},textures:{tDepth:"depth",tShadow:"shadow"},vs:`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let W: f32 = M.p.x; let id: u32 = a.iid + u32(M.p.w);
  let h: vec3f = hashu3(id * 3u + 7u); let h2: vec3f = hashu3(id * 3u + 1013u);
  let tm: f32 = U.camPos.w;
  // drift: wind + settling, each crystal a little different, with a slow sideways flutter
  let wm: f32 = 0.55 + 0.5 * h2.x; let fall: f32 = M.p.z * (0.6 + 0.8 * h2.y);
  let vel: vec3f = U.wind.xyz * wm + vec3f(0.0, -fall, 0.0);
  let fl: vec3f = vec3f(sin(tm * (0.7 + h2.z) + h.x * 40.0), 0.0, cos(tm * (0.6 + h2.x) + h.z * 40.0)) * 0.12;
  let q: vec3f = h * W + M.o.xyz * wm + vec3f(0.0, -fall * tm, 0.0) + fl;
  // wrap into a box centred a little ahead of the camera
  let ctr: vec3f = U.camPos.xyz + U.camFwd.xyz * (0.36 * W);
  let rel: vec3f = (fract((q - ctr - U.origin.xyz) / W + 0.5) - 0.5) * W;
  let pos: vec3f = ctr + rel;
  let edge: f32 = max(abs(rel.x), max(abs(rel.y), abs(rel.z))) / W;
  let fade: f32 = smoothstep(0.5, 0.40, edge);
  // the dust is not spread evenly: it hangs in sheets a few metres thick that drift with the wind (three plane waves riding on the air,
  // each repeating every 1024 m), so the sparkle comes toward you in veils and thins out again behind them
  let pa: vec3f = pos + U.origin.xyz - M.w.xyz;
  let kk: f32 = 0.0061359232;
  let sv: f32 = sin(kk * dot(pa, vec3f(31.0, 9.0, 17.0))) + sin(kk * dot(pa, vec3f(-13.0, 47.0, 41.0)) + 1.3) + 0.6 * sin(kk * dot(pa, vec3f(57.0, -19.0, -71.0)) + 2.1);
  let veil: f32 = smoothstep(-0.5, 1.5, sv);
  let pw: f32 = M.p.y * U.fx.x * fade * (0.12 + 1.9 * h2.z * h2.z * h2.z) * (0.22 + 2.9 * veil * veil);
  let vis: f32 = shadowFast(pos, 0.0015);
  let g: GlintV = glintQuad(corner, pos, vel, h.y + h2.x * 0.37, pw, vis, 0.0, 1.0);
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp; v.col = g.col;
  return v;
}`,fs:"fn frag(v: VOut) -> FOut { var o: FOut; o.color = glintShade(v.uv, v.shp, v.col); return o; }"}),x=s.pipeline({name:"flake",lib:[St.common,St.hash,St.depth,St.shadow,Gs],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"premul",buffers:[],varyings:{uv:"vec2f",shp:"vec4f",col:"vec4f"},uniforms:{p:"vec4f",q:"vec4f",o:"vec4f"},textures:{tDepth:"depth",tShadow:"shadow"},vs:Fo,fs:Uo}),F=s.pipeline({name:"snowVeil",lib:[St.common,St.depth,St.tnoise],buffers:[],varyings:{uv:"vec2f"},uniforms:{a:"vec4f",b:"vec4f",c:"vec4f",d:"vec4f",e:"vec4f"},textures:{tDepth:"depth",tNoise:"2d"},depth:!1,depthTest:!1,cull:"none",blend:"trans",vs:as,fs:qo()}),e.pipes=[w,x,F]};const we=Y=>typeof M0<"u"?M0.off:[1.2*Y.time,0,.4*Y.time];return e.veil=function(Y){const E=typeof M0<"u"?M0.veilU:null;!e.enabled||!E||s.draw(F,{u:E,tex:{tDepth:Y.depth,tNoise:c0.noise},count:3})},e.fx=function(Y){if(!e.enabled)return;const E=we(Y),D=[(E[0]%1024+1024)%1024,(E[1]%1024+1024)%1024,(E[2]%1024+1024)%1024,0],be=typeof M0<"u"&&M0.ks>.001&&M0.share||0,ht=typeof Nt<"u"?1-ge(.2,.8,Nt.night||0):1;if(be>.001){let se=0;for(const _ of e.heavy){const b=Math.min(_.n,Math.ceil(_.n*(be+.04)));s.draw(x,{u:{p:[_.W,_.size,_.fall,se],q:[be,_.shut,_.op,_.n],o:[E[0],E[1],E[2],ht]},tex:{tDepth:Y.depth,tShadow:Y.shadowTex},count:4,instances:b}),se+=_.n}}let qe=0;for(const se of e.layers)s.draw(w,{u:{p:[se.W,se.power,se.fall,qe],o:[E[0],E[1],E[2],0],w:D},tex:{tDepth:Y.depth,tShadow:Y.shadowTex},count:4,instances:se.n}),qe+=se.n},e})(),Fo=`
// a flake on screen: drawn at its own size (rp, px) blurred by the lens, a streak along its motion over the shutter; a big soft one near the
// lens streaks no longer than twice its disc (it is smeared already, and a long soft streak reads as a capsule, not as snow)
fn flakeQuad(corner: vec2f, pos: vec3f, vel: vec3f, rphys: f32, shutK: f32, rnd: vec2f) -> GlintV {
  var g: GlintV = glintCull();
  let rel: vec3f = pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz);
  if (zv < 0.12) { return g; }
  let cp: vec4f = U.viewProj * vec4f(pos, 1.0); let ndc: vec2f = cp.xy / cp.w;
  if (abs(ndc.x) > 1.3 || abs(ndc.y) > 1.3) { return g; }
  let pix: vec2f = clamp((vec2f(ndc.x, -ndc.y) * 0.5 + 0.5) * U.res.xy, vec2f(0.0), U.res.xy - 1.0);
  if (zv > linDepth(texFetchD(tDepth, vec2i(pix), 0)) + 0.03) { return g; }
  let pp: vec4f = U.prevViewProj * vec4f(pos - vel * U.misc.z, 1.0);
  var mv: vec2f = vec2f(0.0);
  if (pp.w > 0.05) { mv = (ndc - pp.xy / pp.w) * vec2f(0.5, -0.5) * U.res.xy * (U.dof.w * shutK / max(U.misc.z, 0.004)); }
  // (each flake its own streak: tumbling and caught by eddies, it is not where the wind alone would put it, so the streaks differ in length
  // and lean a little this way and that, never an even grid of the same dash)
  mv = vec2f(mv.x * cos(rnd.y) - mv.y * sin(rnd.y), mv.x * sin(rnd.y) + mv.y * cos(rnd.y)) * rnd.x;
  var ml: f32 = length(mv); var ax: vec2f = vec2f(1.0, 0.0);
  if (ml > 0.25) { ax = mv / ml; }
  let sc: f32 = U.res.y / 1170.0;
  let coc: f32 = min(U.dof.y * abs(1.0 / U.dof.x - 1.0 / zv), U.dof.z) * sc;
  let rp: f32 = rphys * U.res.y / (2.0 * U.camRight.w * zv);
  let rad: f32 = sqrt(coc * coc + rp * rp + sq(0.62 * sc) + sq(0.8 * sc * smoothstep(10.0, 28.0, zv)));      // (far flakes soft specks, seen through the falling snow)
  ml = min(ml, 0.16 * U.res.y);
  ml = mix(min(ml, 5.0 * rad), min(ml, 2.0 * rad), smoothstep(2.5 * sc, 7.0 * sc, rad));       // (short soft streaks: never pills or confetti)
  let hl: f32 = ml * 0.5;
  let ext: vec2f = vec2f(hl + rad + 1.0, rad + 1.0);
  let lp: vec2f = corner * ext;
  let opx: vec2f = ax * lp.x + vec2f(-ax.y, ax.x) * lp.y;
  g.clip = vec4f((ndc + opx * vec2f(2.0, -2.0) * U.res.zw) * cp.w, cp.z, cp.w);
  g.uv = lp; g.shp = vec4f(hl, rad, rp, zv);
  return g;
}
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let W: f32 = M.p.x; let id: u32 = a.iid + u32(M.p.w);
  let h: vec3f = hashu3(id * 3u + 77u); let h2: vec3f = hashu3(id * 3u + 4099u);
  let tm: f32 = U.camPos.w;
  let wm: f32 = 0.82 + 0.22 * h2.x; let fall: f32 = M.p.z * (0.7 + 0.6 * h2.y);
  let sw: f32 = 0.9 + 0.8 * h2.z; let sa: f32 = 0.10 + 0.14 * h2.y;
  let a1: f32 = tm * sw + h.x * 40.0; let a2: f32 = tm * sw * 0.83 + h.z * 40.0;
  let fl: vec3f = vec3f(sin(a1), 0.0, cos(a2)) * sa;
  let vel: vec3f = U.wind.xyz * wm + vec3f(cos(a1) * sw * sa, -fall, -sin(a2) * sw * 0.83 * sa);
  let q: vec3f = h * W + M.o.xyz * wm + vec3f(0.0, -fall * tm, 0.0) + fl;
  let ctr: vec3f = U.camPos.xyz + U.camFwd.xyz * (0.36 * W);
  let rel: vec3f = (fract((q - ctr - U.origin.xyz) / W + 0.5) - 0.5) * W;
  let pos: vec3f = ctr + rel;
  let edge: f32 = max(abs(rel.x), max(abs(rel.y), abs(rel.z))) / W;
  // (as the snowfall comes on it thickens flake by flake, each fading in, none popping)
  let fade: f32 = smoothstep(0.5, 0.40, edge) * smoothstep(0.0, 0.04, M.q.x - f32(a.iid) / M.q.w);
  let vis: f32 = shadowFast(pos, 0.0015);
  let h3: vec3f = hashu3(id * 3u + 9001u);
  let rnd: vec2f = vec2f(0.4 + 0.8 * h3.x, (h3.y - 0.5) * 0.52 + 0.16 * sin(tm * (0.8 + h3.z) + h3.x * 40.0));
  let g: GlintV = flakeQuad(corner, pos, vel, M.p.y * (0.5 + 1.4 * h3.z * h3.z), M.q.y, rnd);
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp;
  // how much of what is drawn the flake really covers: its own area on screen against the soft disc (or streak) it is drawn as (the soft
  // profile below holds a third of a full disc's area, and 1.07 r per pixel of streak)
  let rp: f32 = g.shp.z; let r: f32 = max(g.shp.y, 0.7);
  let cov: f32 = min(0.65, rp * rp / (0.333 * r * r + 0.68 * r * g.shp.x)) * fade * M.q.z;      // (a tuft is lacy: never quite opaque)
  let V: vec3f = normalize(U.camPos.xyz - pos); let mu: f32 = dot(-V, U.sunDir.xyz);
  // (a touch brighter than the snow on the ground, so a snowfall reads against the slope; brighter still close to the lens, where a flake is a soft
  // light rather than a smudge on the glass)
  // (ice scatters grey: the sun's colour is taken 40% toward white, and its forward lobe is soft. A low sun no longer turns the flakes to orange
  // embers; a flake is lit from every side, so half the sun reaches it whichever way it faces, and the snow's own light from below)
  let sc: vec3f = mix(U.sunCol.rgb, vec3f(luma(U.sunCol.rgb)), 0.4);
  var lit: vec3f = U.ambSky.rgb * 1.9 + U.ambGnd.rgb * 1.5 + sc * (vis * (0.45 + 1.0 * hg(mu, 0.55)));
  // (the lamp: flakes in its cone sparkle, but those right at the lens take less of it, or the beam is a white wall in front of the eyes)
  if (U.lamp.w > 0.0) { lit += lampLight(pos) * (1.2 * mix(0.35, 1.0, smoothstep(0.6, 3.5, length(pos - U.lamp.xyz)))); }
  lit *= 1.0 + 0.6 * smoothstep(3.0, 0.5, g.shp.w);
  // by day a flake must never read darker than what lies behind it (dark specks on bright snow read as dirt): it covers less than it adds,
  // so in front of the snow or the overcast it all but vanishes, as real flakes do, and in front of trees it is a white speck
  v.col = vec4f(lit * (0.88 * cov), cov * mix(1.0, 0.55, M.o.w));
  return v;
}`,Uo=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let d: f32 = length(vec2f(max(abs(v.uv.x) - v.shp.x, 0.0), v.uv.y));
  let x: f32 = d / (max(v.shp.y, 0.7) + 0.6);
  let a: f32 = saturate(1.0 - x * x);
  o.color = v.col * (a * a);
  return o;
}`;function qo(){return`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let zf: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let ndc: vec2f = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
  let dv: vec3f = U.camFwd.xyz + U.camRight.xyz * (ndc.x * U.camRight.w * U.camUp.w) + U.camUp.xyz * (ndc.y * U.camRight.w);
  let len: f32 = length(dv); let d: vec3f = dv / len; let r: f32 = zf * len;
  let sky: f32 = smoothstep(9000.0, 13000.0, zf);
  // it builds with distance and levels off (a snowfall is so many kilometres across, and the cloud it falls from is near overhead: looking up
  // there is less of it in the way)
  var tau: f32 = M.a.x * M.a.y * (1.0 - exp(-r / M.a.y));
  // (thinner in the first fifteen metres: the near trees and the skier keep their darks, and the snow stands in layers in front of the far ones)
  tau -= 0.3 * M.a.x * min(r, 15.0);
  tau = mix(tau, M.a.z * (1.0 - 0.45 * smoothstep(0.0, 0.5, d.y) + 0.5 * smoothstep(0.22, 0.0, d.y)), sky);     // (the low sky lies behind the most snow)
  // it does not fall evenly: denser sheets drift across on the wind, settling with the snow (read where the line of sight crosses two shells
  // round the eye, 14 and 34 m out, so they pass with the right parallax as you go)
  let w: vec3f = U.origin.xyz - M.e.xyz + vec3f(0.0, M.e.w, 0.0);
  let s1: f32 = tnoise3((U.camPos.xyz + d * 14.0 + w) * 0.25);
  let s2: f32 = tnoise3((U.camPos.xyz + d * 34.0 + w) * 0.25 + vec3f(91.0, 17.0, 53.0));
  let s3: f32 = tnoise3((U.camPos.xyz + d * 75.0 + w) * 0.12 + vec3f(37.0, 71.0, 13.0));
  tau *= 1.0 + 0.8 * (s1 - 0.5) * smoothstep(12.0, 18.0, r) + 0.7 * (s2 - 0.5) * smoothstep(30.0, 40.0, r) + 0.6 * (s3 - 0.5) * smoothstep(65.0, 90.0, r) * (1.0 - sky);
  let T: f32 = exp(-tau);
  let mu: f32 = dot(d, U.sunDir.xyz);
  // (the sun's light thrown forward by the snow: a soft glow and a small bright core round the disc, held to a few times the overcast's own
  // light, so the sun in a break is a sun seen through snow and not a blown ball)
  var sf: vec3f = mix(U.sunCol.rgb, vec3f(luma(U.sunCol.rgb)), 0.3) * (0.05 + 0.11 * hg(mu, 0.6) + 0.04 * hg(mu, 0.93));
  sf *= min(1.0, 2.5 * luma(M.b.rgb) / max(luma(sf), 1e-6));
  var c: vec3f = M.b.rgb + sf;
  var az: f32 = atan2(d.x, -d.z) - ${(+(typeof L0<"u"?L0.cityAz:.14)).toFixed(5)}; az = atan2(sin(az), cos(az));
  c += M.c.rgb * ((0.08 + 1.6 * exp(-abs(az) / 0.35)) * smoothstep(0.3, -0.05, d.y));
  c += vec3f(0.78, 0.86, 1.0) * (M.d.w * (0.9 + 2.0 * exp(-sq(acos(clamp(dot(d, M.d.xyz), -1.0, 1.0))) / 0.15)));
  o.color = vec4f(c * (1.0 - T), T);
  return o;
}`}const ga=(()=>{const e={enabled:!0,NS:32,PS:40,PC:64,NG:2e3,BOX:64,tries:4,far:2600,stats:{plumes:0,found:0,tried:0,ground:0,ms:0}};typeof Dt<"u"&&Dt.def("drift","风吹雪",[["a","无"],["b","有"],["c","更强"]],"b");const s={a:0,b:1,c:1.8};let w,x,F,we,Y,E,D=D0(4517),be=1,ht=32,qe=!1;const se=[],_=[0,0],b=.3218,re=[Math.cos(b),Math.sin(b)];e.init=function(X){w=X,m()?(e.NG=1e3,ht=16,e.tries=2):ht=e.NS;for(let ne=0;ne<e.NS;ne++)se.push({on:!1});E=new Float32Array(16*e.NS),Y=w.texture({w:4,h:e.NS,format:"rgba32f",filter:"nearest"}),w.updateTexture(Y,0,0,4,e.NS,E);const C=[St.common,St.hash,St.depth,St.shadow,St.fog,xa,Da];x=w.pipeline({name:"windSmoke",lib:C,topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"premul",buffers:[],varyings:{uv:"vec4f",c:"vec4f",z:"vec4f"},uniforms:{p:"vec4f"},textures:{tS:"fetch",tDepth:"depth",tShadow:"shadow",tSky:"2d",tDetail:"2d"},vs:Ro,fs:Va}),F=w.pipeline({name:"windGlint",lib:[St.common,St.hash,St.depth,St.shadow,Gs,xa,Da],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"add",buffers:[],varyings:{uv:"vec2f",shp:"vec4f",col:"vec4f"},uniforms:{p:"vec4f"},textures:{tS:"fetch",tDepth:"depth",tShadow:"shadow"},vs:Po,fs:"fn frag(v: VOut) -> FOut { var o: FOut; o.color = glintShade(v.uv, v.shp, v.col); return o; }"}),we=w.pipeline({name:"windGround",lib:[St.common,St.hash,St.depth,St.shadow,St.fog,$s,xa],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"premul",buffers:[],varyings:{uv:"vec4f",c:"vec4f",z:"vec4f"},uniforms:{hx:"vec4f",g:"vec4f",d:"vec4f",o:"vec4f"},textures:{tH:"fetch",tDepth:"depth",tShadow:"shadow",tSky:"2d",tDetail:"2d"},vs:No,fs:Va}),e.pipes=[x,F,we],typeof At<"u"&&At.onTick&&At.onTick.push(ne=>e.update(ne))};function m(){try{return!!(window.matchMedia&&matchMedia("(pointer: coarse) and (hover: none)").matches)}catch(X){return!1}}e.reset=function(){for(const X of se)X.on=!1};const J=(X,ke,C)=>vt.height(X,ke,C);function ae(X,ke,C){e.stats.tried++;let ne,Be,Ee;const je=-X.pos[2];if((vt.at(je+60).ridge||0)>.25&&D()<.5){const pe=je+15+220*D(),c=vt.at(pe);if((c.ridge||0)<.25)return;const Ie=D()<.75?Math.sign(ke)||1:-(Math.sign(ke)||1);ne=c.cx+Ie*(c.hw+1.5+2*(D()-.5)),Be=-pe,Ee=6}else{const pe=45*Math.pow(e.far/45,D()),c=Math.hypot(X.fwd[0],X.fwd[2])||1,Ie=Math.atan2(X.fwd[0]/c,X.fwd[2]/c),he=Math.atan(Math.tan(X.fovY/2)*Math.max(qt.W/Math.max(qt.H,1),1))*1.1,H=Ie+(D()*2-1)*he;ne=X.pos[0]+Math.sin(H)*pe,Be=X.pos[2]+Math.cos(H)*pe,Ee=it(pe*.035,6,75)}const nt=it(Ee/4,.5,40);let Ke=J(ne,Be,nt);const Fe=J(ne-ke*Ee,Be-C*Ee,nt),Ge=J(ne+ke*Ee,Be+C*Ee,nt);if(Ke-Ge<.26*Ee||Ke-Fe<.06*Ee)return;for(const pe of[.5,.25]){const c=J(ne+ke*Ee*pe,Be+C*Ee*pe,nt),Ie=J(ne-ke*Ee*pe,Be-C*Ee*pe,nt);c>Ke&&c>=Ie?(ne+=ke*Ee*pe,Be+=C*Ee*pe,Ke=c):Ie>Ke&&(ne-=ke*Ee*pe,Be-=C*Ee*pe,Ke=Ie)}const Je=(2*Ke-Fe-Ge)/Ee;for(const pe of se)if(pe.on&&Math.hypot(pe.x-ne,pe.z-Be)<Math.max(Ee,pe.D)*1.3)return;let le=null;for(let pe=0;pe<ht;pe++)if(!se[pe].on){le=se[pe];break}if(!le)return;e.stats.found++;const Pe=it(Ee*4.5,22,340)*(.75+.5*D());Object.assign(le,{on:!0,x:ne,y:Ke+.2,z:Be,D:Ee,L:Pe,H:Pe*(.16+.12*D()),Wc:Ee*(.9+.6*D()),seed:Math.floor(D()*1e6)+1,age:0,life:10+22*D(),k:it(.45+Je*.9,.5,1.25),U:0,fade:0})}return e.update=function(X){if(X=X>0&&X<.25?X:0,!e.enabled||!w)return 0;const ke=performance.now(),C=qt.cam,ne=qt.origin;vt.seed!==e.seed&&(e.seed=vt.seed,e.reset()),be=s[typeof Dt<"u"?Dt.val.drift:"b"],be==null&&(be=1);const Be=At.state,Ee=Be.wind||[1.2,0,.4],je=Math.hypot(Ee[0],Ee[2])||1,$e=Ee[0]/je,nt=Ee[2]/je,Ke=typeof M0<"u"&&M0.ks||0;e.wx=$e,e.wz=nt,e.ws=je,e.plume=be*(.8+.7*ge(2.5,9,je)+.35*Ke);const Fe=vt.at(-C.pos[2]+20),Ge=1-.85*(Fe.glade||0);e.ground=be*Ge*(.32*(1+1.6*(Fe.ridge||0))+1.1*ge(2.5,8.5,je)+.25*Ke),e.ud=1.6+1.1*je,_[0]=(_[0]+$e*e.ud*X)%65536,_[1]=(_[1]+nt*e.ud*X)%65536;const Je=C.fwd[0],le=C.fwd[2],Pe=Math.hypot(Je,le)||1;let pe=0;for(let c=0;c<e.NS;c++){const Ie=se[c],he=c*16;if(Ie.on){Ie.age+=X;const H=Ie.x-C.pos[0],z=Ie.z-C.pos[2],V=Math.hypot(H,z);((H*Je+z*le)/Pe<-Math.max(40,Ie.L)||V>e.far*1.15||c>=ht)&&(Ie.life=Math.min(Ie.life,Ie.age+1.5)),(Ie.age>=Ie.life||be===0)&&(Ie.on=!1)}if(!Ie.on){E[he+3]=0;continue}pe++,Ie.U=(3.5+1.3*je)*(Ie.L>120?1.5:1),Ie.fade=ge(0,2.5,Ie.age)*ge(Ie.life,Ie.life-3,Ie.age),E[he]=Ie.x-ne[0],E[he+1]=Ie.y-ne[1],E[he+2]=Ie.z-ne[2],E[he+3]=Ie.fade*Ie.k*e.plume,E[he+4]=$e,E[he+5]=nt,E[he+6]=Ie.U,E[he+7]=Ie.L,E[he+8]=(Ie.x*$e+Ie.z*nt)*.06,E[he+9]=Ie.seed,E[he+10]=Ie.L/Ie.U,E[he+11]=Ie.H,E[he+12]=Ie.Wc,E[he+13]=e.plume*ge(.2,1,Ie.k),E[he+14]=0,E[he+15]=0}if(be>0&&X)for(let c=0;c<e.tries;c++)ae(C,$e,nt);return e.stats.plumes=pe,qe=!0,e.stats.ms=e.stats.ms*.95+(performance.now()-ke)*.05,pe},e.fx=function(X){if(!e.enabled||!w)return;const ke=e.stats.plumes;if(qe&&(w.updateTexture(Y,0,0,4,e.NS,E),qe=!1),be===0)return;const C=typeof Nt<"u"?Nt.lut:null;ke&&(w.draw(x,{u:{p:[e.PS,0,0,0]},tex:{tS:Y,tDepth:X.depth,tShadow:X.shadowTex,tSky:C,tDetail:c0.detail},count:4,instances:e.NS*e.PS}),w.draw(F,{u:{p:[e.PC,0,0,0]},tex:{tS:Y,tDepth:X.depth,tShadow:X.shadowTex},count:4,instances:e.NS*e.PC}));const ne=typeof Jt<"u"?Jt.hb:null;if(ne&&e.ground>.01){const Be=X.origin,Ee=[(Be[0]%65536+65536)%65536,(Be[2]%65536+65536)%65536];w.draw(we,{u:{hx:ne.xf,g:[e.BOX,_[0],_[1],e.ground],d:[e.wx,e.wz,e.ud,(Be[0]*e.wx+Be[2]*e.wz)*.06],o:[Ee[0],Ee[1],re[0],re[1]]},tex:{tH:ne.tex,tDepth:X.depth,tShadow:X.shadowTex,tSky:C,tDetail:c0.detail},count:4,instances:e.NG}),e.stats.ground=e.NG}else e.stats.ground=0},e.slots=se,typeof window<"u"&&(window.Wind=e),e})(),xa=`
// the gust fronts that cross the hill: vnoise1(x, 7) of 00_util.js, the same integers (hashU, and 1887086086 = imul(hashU(7), 0x9e3779b1))
fn wHash(x: u32) -> u32 { var v: u32 = x; v = v ^ (v >> 16u); v = v * 2146121005u; v = v ^ (v >> 15u); v = v * 2221713035u; v = v ^ (v >> 16u); return v; }
fn gustN(x: f32) -> f32 {
  let i: f32 = floor(x); let f: f32 = x - i; let u: f32 = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  let a: f32 = f32(wHash(u32(i32(i)) + 1887086086u)) * 2.3283064e-10; let b: f32 = f32(wHash(u32(i32(i) + 1) + 1887086086u)) * 2.3283064e-10;
  return mix(a, b, u) * 2.0 - 1.0;
}
// 0..1, as the flags have it (0.5 + 0.5 vnoise1): t game time, key = (world x, z) . wind direction * 0.06
fn gustAt(t: f32, key: f32) -> f32 { return 0.5 + 0.5 * gustN(t * 0.31 - key); }
// wind-blown snow is fine dust: it lets the sun through and throws it on forward, so it glows against the light, is a soft white side-lit
// and goes grey-blue in shade (lit by the sky and the snow below)
// (fw: how much of it is the forward glow. Drift along the ground is seen against snow as bright as itself, so it is the glow toward the sun
// and the haze it lays over the snow's own grain that show it, as in the photographs; the smoke up on a crest is seen against the sky)
fn windLight(pos: vec3f, V: vec3f, fw: f32) -> vec3f {
  let mu: f32 = dot(-V, U.sunDir.xyz);
  let vis: f32 = shadowFast(pos, 0.002) * cloudShade(pos);
  return U.sunCol.rgb * (vis * (0.50 + fw * (2.4 * hg(mu, 0.75) + 0.6 * hg(mu, 0.25)))) + U.ambSky.rgb * 0.9 + U.ambGnd.rgb * 0.35 + lampLight(pos) * 1.6;
}
`,Da=`
// one particle of a streamer: row j of the texture, number i of the PS it has. Its own launch: the crest point it left, how long ago
// (each leaves again once it has gone the length of the plume, each time somewhere else along the crest)
struct Plume { pos: vec3f, dir: vec3f, s: f32, em: f32, str: f32, L: f32, seed: f32, ok: f32, cr: f32, }
fn plumeAt(j: u32, i: u32, salt: u32) -> Plume {
  var P: Plume; P.ok = 0.0; P.pos = vec3f(0.0); P.dir = vec3f(1.0, 0.0, 0.0); P.s = 0.0; P.em = 0.0; P.str = 0.0; P.L = 1.0; P.seed = 0.0; P.cr = 0.0;
  let A0: vec4f = texFetch(tS, vec2i(0, i32(j)), 0);
  if (A0.w <= 0.001) { return P; }
  let A1: vec4f = texFetch(tS, vec2i(1, i32(j)), 0); let A2: vec4f = texFetch(tS, vec2i(2, i32(j)), 0); let A3: vec4f = texFetch(tS, vec2i(3, i32(j)), 0);
  let tm: f32 = U.camPos.w; let T: f32 = max(A2.z, 0.5); let sd: u32 = u32(A2.y);
  let ph: f32 = hashu(sd * 7919u + i * 13u + salt);
  let cy: f32 = tm / T + ph; let n: f32 = floor(cy); let s: f32 = cy - n;
  let h: vec3f = hashu3(sd * 104729u + i * 31u + u32(n) * 7u + salt); let h2: vec3f = hashu3(sd * 15485863u + i * 17u + u32(n) * 3u + salt * 5u);
  let tb: f32 = tm - s * T;
  // how much snow the crest gave up at birth: as the gust was at that moment (so a gust goes down the plume as a thicker puff)
  P.em = 0.18 + 0.82 * smoothstep(0.30, 0.82, gustAt(tb, A2.x));
  let d3: vec3f = vec3f(A1.x, 0.0, A1.y); let tg: vec3f = vec3f(-A1.y, 0.0, A1.x);
  let L: f32 = A1.w; let Hh: f32 = A2.w; let Wc: f32 = A3.x;
  // out along the wind (each at its own speed), up as it goes (the air over a crest lifts, and a little of it is thrown much higher than the
  // rest), spreading out, and stirred by eddies that grow with it
  let sp: f32 = 0.7 + 0.6 * h.x;
  let al: f32 = L * s * sp;
  let up: f32 = Hh * pow(s, 0.6) * (0.15 + 1.4 * h.y * h.y);
  let lat: f32 = Wc * (h.z - 0.5) + L * 0.16 * s * (h2.z - 0.5);
  let ew: f32 = L * 0.05 * s;
  let e1: f32 = sin(tb * 1.7 + h2.x * 30.0 + s * 9.0); let e2: f32 = sin(tb * 1.3 + h2.y * 30.0 + s * 7.0);
  P.pos = A0.xyz + d3 * al + tg * (lat + ew * e1) + vec3f(0.0, up + ew * 0.8 * e2, 0.0);
  P.dir = normalize(d3 * (A1.z * sp) + vec3f(0.0, Hh / max(T, 0.5) * 0.6 * (0.15 + 1.4 * h.y * h.y) / max(pow(s, 0.4), 0.3), 0.0));
  P.s = s; P.str = A0.w; P.L = L; P.seed = h2.x; P.cr = A3.y; P.ok = 1.0;
  return P;
}
`,Ro=`
fn vert(a: VIn) -> VOut {
  var v: VOut; v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec4f(0.0); v.c = vec4f(0.0); v.z = vec4f(0.0);
  let PS: u32 = u32(M.p.x); let j: u32 = a.iid / PS; let i: u32 = a.iid - j * PS;
  let P: Plume = plumeAt(j, i, 1u);
  if (P.ok < 0.5) { return v; }
  let s: f32 = P.s;
  let rel: vec3f = P.pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz); let dist: f32 = length(rel);
  if (zv < 0.5) { return v; }
  // thin: what makes it read is the many wisps over each other, each one hardly there
  let dens: f32 = P.str * P.em * smoothstep(0.0, 0.07, s) * pow(1.0 - s, 1.4) * 3.6 * (0.55 + 0.9 * P.seed) * smoothstep(2.0, 6.0, zv);
  if (dens < 0.002) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let V: vec3f = rel / dist;
  var ax: vec3f = P.dir - V * dot(P.dir, V); let axl: f32 = length(ax);
  if (axl < 0.05) { ax = normalize(cross(vec3f(0.0, 1.0, 0.0), V)); } else { ax = ax / axl; }
  let ay: vec3f = normalize(cross(V, ax));
  // (never smaller than about a pixel and a half across: a wisp too far off to be seen is a little of the pixel it is in)
  let px: f32 = zv * U.camRight.w * 2.0 * U.res.w;
  let r0: f32 = P.L * (0.009 + 0.036 * s) * (0.6 + 0.8 * fract(P.seed * 7.3));
  let r: f32 = max(r0, px * 1.5); let st: f32 = 3.0 + 4.0 * s;
  let wp: vec3f = P.pos + ax * (corner.x * r * st) + ay * (corner.y * r);
  v.clip = U.viewProj * vec4f(wp, 1.0);
  v.uv = vec4f(corner, fract(P.seed * 13.1), fract(P.seed * 29.7));
  var col: vec3f = windLight(P.pos, V, 1.0);
  col = applyFog(col, P.pos);
  v.c = vec4f(col, min(dens, 0.55) * min(1.0, sq(r0 / r)) * mix(1.0, 0.75, fogAmount(P.pos)));
  v.z = vec4f(zv, r * 0.9, st, 0.0);
  return v;
}`,Po=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let PS: u32 = u32(M.p.x); let j: u32 = a.iid / PS; let i: u32 = a.iid - j * PS;
  let P: Plume = plumeAt(j, i, 977u);
  let g0: GlintV = glintCull(); v.clip = g0.clip; v.uv = g0.uv; v.shp = g0.shp; v.col = g0.col;
  if (P.ok < 0.5) { return v; }
  let rel: vec3f = P.pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz);
  let pw: f32 = P.cr * P.em * smoothstep(0.0, 0.05, P.s) * (1.0 - P.s) * smoothstep(320.0, 70.0, zv) * (0.25 + 1.6 * P.seed * P.seed * P.seed);
  if (pw < 0.01 || zv < 0.5) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let vis: f32 = shadowFast(P.pos, 0.0015);
  let g: GlintV = glintQuad(corner, P.pos, P.dir * 6.0, fract(P.seed * 17.0 + f32(i) * 0.013), pw, vis, 0.0, 1.0);
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp; v.col = g.col;
  return v;
}`,No=`
fn vert(a: VIn) -> VOut {
  var v: VOut; v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec4f(0.0); v.c = vec4f(0.0); v.z = vec4f(0.0);
  let Wb: f32 = M.g.x; let id: u32 = a.iid;
  let h: vec3f = hashu3(id * 3u + 51u); let h2: vec3f = hashu3(id * 3u + 2087u);
  let wk: f32 = 0.8 + 0.4 * h2.x;
  let ctr: vec3f = U.camPos.xyz + U.camFwd.xyz * (0.32 * Wb);
  let q: vec2f = h.xy * Wb + M.g.yz * wk;
  let rel: vec2f = (fract((q - ctr.xz - M.o.xy) / Wb + 0.5) - 0.5) * Wb;
  let pxz: vec2f = ctr.xz + rel;
  let edge: f32 = max(abs(rel.x), abs(rel.y)) / Wb;
  // the streams: ribbons across the mean wind a couple of metres apart that wander and wriggle as the air carries them, broken into lengths
  let pa: vec2f = pxz + M.o.xy - M.g.yz * wk;
  let al: f32 = dot(pa, M.o.zw); let ac: f32 = M.o.z * pa.y - M.o.w * pa.x;
  let tm: f32 = U.camPos.w;
  let sn: f32 = sin(ac * 2.6 + 2.4 * sin(al * 0.09 + tm * 0.23) + 1.2 * sin(al * 0.23 - tm * 0.41 + ac * 0.3));
  let brk: f32 = smoothstep(-0.2, 0.6, sin(al * 0.045 + ac * 0.11 + 1.7) + 0.6 * sin(al * 0.13 - ac * 0.05 - tm * 0.15));
  let strm: f32 = smoothstep(0.35, 0.92, sn) * brk;
  let gu: f32 = gustAt(tm, M.d.w + dot(pxz, M.d.xy) * 0.06);
  var dens: f32 = M.g.w * strm * (0.12 + 0.88 * smoothstep(0.35, 0.78, gu)) * smoothstep(0.5, 0.38, edge) * (0.4 + 0.6 * h2.z) * 2.6;
  let gy: f32 = groundH(vec3f(pxz.x, 0.0, pxz.y));
  let hh: f32 = 0.03 + 0.20 * h.z * h.z;
  let pos: vec3f = vec3f(pxz.x, gy + hh, pxz.y);
  let rp: vec3f = pos - U.camPos.xyz; let zv: f32 = dot(rp, U.camFwd.xyz); let dist: f32 = length(rp);
  dens *= smoothstep(1.5, 5.0, zv);
  if (dens < 0.002 || zv < 0.5) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let V: vec3f = rp / dist; let dw: vec3f = vec3f(M.d.x, 0.0, M.d.y);
  var ax: vec3f = dw - V * dot(dw, V); let axl: f32 = length(ax);
  if (axl < 0.08) { ax = normalize(cross(vec3f(0.0, 1.0, 0.0), V)); } else { ax = ax / axl; }
  let ay: vec3f = normalize(cross(V, ax));
  // long and low: one to three metres along the wind, a hand or two high; the higher ones longer and thinner
  let ry: f32 = 0.05 + 0.10 * h2.y + hh * 0.4; let rx: f32 = 0.8 + 1.8 * h.z + 0.6 * h2.y;
  let px: f32 = zv * U.camRight.w * 2.0 * U.res.w; let ryp: f32 = max(ry, px * 1.5);
  let wp: vec3f = pos + ax * (corner.x * rx) + ay * (corner.y * ryp);
  v.clip = U.viewProj * vec4f(wp, 1.0);
  v.uv = vec4f(corner, fract(h2.x * 13.1), fract(h.x * 29.7));
  var col: vec3f = windLight(pos, V, 2.2);
  col = applyFog(col, pos);
  v.c = vec4f(col, min(dens, 0.5) * min(1.0, ry / ryp));
  v.z = vec4f(zv, 0.18, rx / max(ryp, 0.01), 1.0);
  return v;
}`,Va=`
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0);
  let q: vec2f = v.uv.xy; let r2: f32 = dot(q, q);
  if (r2 >= 1.0) { return o; }
  let ln: f32 = max(v.z.z, 1.0);
  let n1: f32 = tex(tDetail, vec2f(q.x * 0.05 * ln + v.uv.z, q.y * 0.42 + v.uv.w)).z;
  let n2: f32 = tex(tDetail, vec2f(q.x * 0.11 * ln + v.uv.w, q.y * 0.95 + v.uv.z) + vec2f(0.37, 0.61)).z;
  let fib: f32 = saturate((n1 * 0.6 + n2 * 0.4 - 0.22) * 2.0);
  let prof: f32 = (1.0 - r2) * (1.0 - 0.5 * r2);
  let sz: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let soft: f32 = saturate((sz - v.z.x) / max(v.z.y, 0.05));
  let a: f32 = v.c.w * prof * fib * soft;
  o.color = vec4f(v.c.rgb * a, a);
  return o;
}`,na=(()=>{const e={a:[0,1,1,1,1],b:[.62,.85,.62,0,1],c:[.8,.7,.42,0,.7]},s=typeof Dt<"u"?Dt:{val:{},def(){}};s.def("nsky","夜空颜色",[["a","原来"],["b","收"],["c","更收"]],"b");const w={v:(e[s.val.nsky]||e.b).slice(),t:null};return w.step=function(x){const F=e[s.val.nsky]||e.b,we=w.t===null?1:1-Math.exp(-Math.max(0,Math.abs(x-w.t))*3);w.t=x;for(let Y=0;Y<5;Y++)w.v[Y]+=(F[Y]-w.v[Y])*we;return w.v},w})(),ba=512,Ls=(()=>{const e={res:768,az:.17,el:.31,half:.5,roll:-.2,gain:1,stars:.45};e.nsky=na;let s,w,x,F,we,Y,E;return e.init=function(D,be){s=D,be&&(e.res=be),w=s.texture({w:e.res,h:e.res,format:"rgba8",filter:"linear",wrap:"clamp",mips:!0}),F=s.target({color:w}),x=s.texture({w:ba*2,h:ba,format:"rgba8",filter:"linear",wrap:"clamp"}),we=s.target({color:x}),e.texA=w,e.texB=x;const ht=(qe,se)=>s.pipeline({name:qe,lib:[St.common,St.hash,St.noise,St.tnoise,Eo],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f"},textures:{tNoise:"2d"},colorFormat:"rgba8",depth:!1,depthTest:!1,cull:"none",vs:as,fs:se});Y=ht("nebBakeA","fn frag(v: VOut) -> FOut { var o: FOut; o.color = nebStructure(vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0)); return o; }"),E=ht("nebBakeB",`fn frag(v: VOut) -> FOut { var o: FOut; let p: vec2f = vec2f(fract(v.uv.x * 2.0) * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
      if (v.uv.x < 0.5) { o.color = nebFlow(p); } else { o.color = nebExtra(p); } return o; }`),e.pipes=[Y,E]},e.bake=function(){s.beginPass(F,{color:[0,0,0,0]}),s.draw(Y,{u:{p:[0,0,0,0]},tex:{tNoise:c0.noise},count:3}),s.endPass(),s.genMips(w),s.beginPass(we,{color:[0,0,0,0]}),s.draw(E,{u:{p:[0,0,0,0]},tex:{tNoise:c0.noise},count:3}),s.endPass(),e.baked=!0},e.wide={az:.4,el:.215,half:.47,roll:.55},e.tall={az:.17,el:.31,half:.5,roll:-.2},e.basis=function(){Object.assign(e,qt.W>=qt.H?e.wide:e.tall);const D=Math.cos(e.el),be=[Math.sin(e.az)*D,Math.sin(e.el),-Math.cos(e.az)*D];let ht=f.norm(f.cross(be,[0,1,0])),qe=f.cross(ht,be);const se=Math.cos(e.roll),_=Math.sin(e.roll),b=f.add(f.mul(ht,se),f.mul(qe,_)),re=f.sub(f.mul(qe,se),f.mul(ht,_));return{nr:[...b,1/e.half],nu:[...re,e.gain],nf:[...be,e.stars]}},e})(),Eo=`
fn nfb(p: vec2f, z: f32) -> f32 {
  var q: vec3f = vec3f(p, z); var s: f32 = 0.5 * vnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.25 * vnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.125 * tnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.0625 * tnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.03125 * tnoise3(q);
  return s / 0.96875;
}
const NEB_CORE: vec2f = vec2f(0.02, -0.04);
fn nebThin(n: f32, pw: f32) -> f32 { return pow(1.0 - abs(2.0 * n - 1.0), pw); }
fn nebRot(v: vec2f, a: f32) -> vec2f { let c: f32 = cos(a); let s: f32 = sin(a); return vec2f(v.x * c - v.y * s, v.x * s + v.y * c); }
fn nebPotl(p: vec2f, z: f32) -> f32 { return vnoise3(vec3f(p, z)) + 0.5 * vnoise3(vec3f(p * 2.1 + vec2f(5.0, 3.0), z + 2.0)); }
fn nebCurl(p: vec2f, z: f32) -> vec2f {
  let e: f32 = 0.05;
  return vec2f(nebPotl(p + vec2f(0.0, e), z) - nebPotl(p - vec2f(0.0, e), z), nebPotl(p - vec2f(e, 0.0), z) - nebPotl(p + vec2f(e, 0.0), z)) / (2.0 * e);
}
fn nebFold(p: vec2f) -> vec2f {
  let k: f32 = 0.42 + 0.58 * smoothstep(0.04, 0.55, length(p - NEB_CORE));          // orderly near the stars, stirred further out
  var q: vec2f = p;
  q += nebCurl(q * 0.75 + vec2f(6.2, 3.3), 13.5) * (0.085 * k);
  q += nebCurl(q * 1.4 + vec2f(1.7, 9.2), 1.5) * (NEB_FOLD.x * k);
  q += nebCurl(q * 3.1 + vec2f(8.3, 2.8), 5.5) * (NEB_FOLD.y * k);
  q += nebCurl(q * 6.7 + vec2f(4.1, 6.6), 9.5) * (NEB_FOLD.z * k);
  return q;
}
// how far the gas reaches in a given direction: one long wing, a shorter one opposite, a halo all round
fn nebReach(dir: vec2f) -> f32 {
  let a: f32 = pow(saturate(dot(dir, vec2f(-0.75, 0.66)) * 0.5 + 0.5), 3.4);
  let b: f32 = pow(saturate(dot(dir, vec2f(0.62, -0.78)) * 0.5 + 0.5), 4.0);
  return 0.20 + 0.86 * a + 0.52 * b;
}
// a front where starlight meets the gas: knife-sharp on the outside, glowing away inward
fn nebFront(d: f32, w: f32) -> f32 { return select(exp(d / (w * 5.0)), exp(-d * d / (w * w)), d > 0.0); }
fn nebSpike(p: vec2f, c: vec2f, r: f32) -> f32 { let d: vec2f = (p - c) / r; return exp(-dot(d, d) * 6.0) + 0.5 * exp(-abs(d.x) * 2.2 - abs(d.y) * 22.0) + 0.5 * exp(-abs(d.y) * 2.2 - abs(d.x) * 22.0); }
fn nebStructure(p: vec2f) -> vec4f {
  let q: vec2f = nebFold(p);
  let rd: vec2f = q - NEB_CORE; let r: f32 = length(rd); let dir: vec2f = rd / max(r, 1e-4);
  let x: f32 = r / nebReach(dir);                                         // 0 at the stars, 1 where the gas gives out
  let tw: vec2f = nebRot(dir, 1.0 * r);                                   // the arms trail round as they go out
  // ---- glowing gas: fibres combed outward along the arms, over broad billows
  let g1: f32 = nfb(tw * 2.3 + vec2f(2.0, 7.0), r * 1.8 + 30.5); let g2: f32 = nfb(q * 2.6 + vec2f(6.0, 1.0), 34.5);
  let gf: f32 = g1 * 0.6 + g2 * 0.4 + 0.33 * (1.0 - x);
  var gas: f32 = smoothstep(0.42, 0.80, gf) * smoothstep(1.08, 0.30, x);
  // ---- dark dust: a bay cutting in from one side toward the core, and lanes folded through the wings
  let bay: f32 = pow(saturate(dot(dir, vec2f(0.80, 0.60)) * 0.5 + 0.5), 5.0) * smoothstep(0.03, 0.14, r) * smoothstep(0.75, 0.2, r);
  let d1: f32 = nfb(q * 2.4 + vec2f(5.0, 5.0), 90.5) * 0.65 + nfb(tw * 3.0 + vec2f(1.0, 8.0), r * 2.5 + 94.5) * 0.35 + 0.34 * bay;
  let dust: f32 = smoothstep(0.545, 0.60, d1) * smoothstep(0.04, 0.16, r);
  // ---- threads: knife-thin, some combed along the arms, some loose and folded, gathered into braids
  let n1: f32 = vnoise3(vec3f(tw * 6.5 + vec2f(1.0, 3.0), r * 2.4 + 60.5));
  let n2: f32 = vnoise3(vec3f(tw * 14.0 + vec2f(7.0, 2.0), r * 4.5 + 70.5));
  let n3: f32 = tnoise3(vec3f(q * 8.5 + vec2f(3.0, 9.0), 75.5));
  let n4: f32 = tnoise3(vec3f(q * 19.0 + vec2f(13.0, 4.0), 78.5));
  let r1: f32 = nebThin(n1, 10.0); let r2: f32 = nebThin(n2, 8.0); let r3: f32 = nebThin(n3, 9.0); let r4: f32 = nebThin(n4, 7.0);
  let braid: f32 = smoothstep(0.36, 0.62, nfb(q * 1.9 + vec2f(4.0, 9.0), 55.5));
  var fil: f32 = (r1 + 0.7 * r2 * (0.4 + 0.8 * r1 + 0.5 * braid) + 0.75 * r3 * braid + 0.35 * r4 * (0.3 + r3)) * (0.25 + 0.75 * braid);
  // ---- shells: three broken arcs at different distances, and the lit rims of the dust
  let wob: f32 = nfb(q * 2.0 + vec2f(11.0, 3.0), 40.5) - 0.5;
  let am: f32 = nfb(tw * 1.6 + vec2f(3.0, 5.0), 44.5); let am2: f32 = nfb(tw * 1.6 + vec2f(9.0, 2.0), 47.5);
  var front: f32 = nebFront(x + 0.30 * wob - 0.26, 0.016) * smoothstep(0.40, 0.56, am)
                 + nebFront(x + 0.42 * wob - 0.52, 0.018) * smoothstep(0.62, 0.46, am) * 0.8
                 + nebFront(x + 0.55 * wob - 0.84, 0.022) * smoothstep(0.38, 0.55, am2) * 0.6;
  front += exp(-sq((d1 - 0.535) / 0.012)) * smoothstep(0.04, 0.16, r) * 0.8;
  gas *= 1.0 - 0.90 * dust; fil *= 1.0 - 0.95 * dust; front *= 1.0 - 0.6 * dust * (1.0 - exp(-sq((d1 - 0.535) / 0.012)));
  // which gas: 0 = hydrogen rose by the stars, 1 = oxygen teal out on the rim
  let hue: f32 = saturate(1.15 * x - 0.22 + (nfb(q * 1.7 + vec2f(9.0, 1.0), 80.5) - 0.5) * 1.3);
  // ---- the hot young stars that light it all (diffraction spikes and all); they are not folded
  var str: f32 = nebSpike(p, NEB_CORE + vec2f(0.004, 0.006), 0.030) + 0.85 * nebSpike(p, NEB_CORE + vec2f(0.040, 0.027), 0.019) + 0.75 * nebSpike(p, NEB_CORE + vec2f(-0.039, -0.014), 0.017) + 0.65 * nebSpike(p, NEB_CORE + vec2f(0.012, -0.047), 0.015);
  str += 0.55 * nebSpike(p, vec2f(-0.33, 0.21), 0.012) + 0.5 * nebSpike(p, vec2f(-0.52, 0.52), 0.011) + 0.45 * nebSpike(p, vec2f(0.30, -0.36), 0.011) + 0.4 * nebSpike(p, vec2f(-0.20, -0.20), 0.010) + 0.4 * nebSpike(p, vec2f(0.22, 0.30), 0.010);
  let edge: f32 = smoothstep(1.0, 0.86, max(abs(p.x), abs(p.y)));
  let near: f32 = 0.22 + 0.78 * exp(-x * 2.4);                            // brightest by the stars
  let reach: f32 = smoothstep(1.30, 0.55, x) * (0.30 + 0.70 * exp(-x * 1.4));   // threads run on past where the glow gives out
  return vec4f(saturate(gas * near * 1.1) * edge, saturate((fil * 0.75 + front * 0.8) * reach) * edge, hue, saturate(str * edge));
}
fn nebFlow(p: vec2f) -> vec4f {
  let q: vec2f = nebFold(p);
  let rd: vec2f = q - NEB_CORE; let r: f32 = length(rd); let dir: vec2f = rd / max(r, 1e-4);
  let x: f32 = r / nebReach(dir);
  // the gas streams outward along the trailing arms, with a slow swirl on top
  let fl: vec2f = nebRot(dir, 0.55) * (0.25 + 0.75 * smoothstep(0.0, 0.3, r)) * 0.7 + nebCurl(p * 1.6 + vec2f(3.0, 8.0), 100.5) * 0.16;
  // phase of the travelling light: distance out from the stars, roughened so the bands are not rings
  let ph: f32 = saturate(0.08 + 0.62 * x + 0.16 * (nfb(q * 2.2 + vec2f(2.0, 6.0), 110.5) - 0.5));
  let dc: f32 = length(p - NEB_CORE);
  let core: f32 = 0.85 * exp(-sq(dc / 0.045)) + 0.30 * exp(-sq(dc / 0.16));
  return vec4f(saturate(fl * 0.5 + 0.5), ph, saturate(core * (0.55 + 0.9 * nfb(p * 6.0, 120.5))));
}
// what rides on the gas and is not the gas (second tile): R a field whose upper half is dark dust in lanes, G a looser system of threads that
// reaches further out (the veil), BA the cosine and sine of a phase that winds round the stars in three trailing arms (the pair can be
// turned at runtime, which makes a wave travel along the arms without a seam anywhere)
fn nebExtra(p: vec2f) -> vec4f {
  let q: vec2f = nebFold(p);
  let rd: vec2f = q - NEB_CORE; let r: f32 = length(rd); let dir: vec2f = rd / max(r, 1e-4);
  let x: f32 = r / nebReach(dir);
  let tw: vec2f = nebRot(dir, 1.0 * r);
  let l1: f32 = nfb(q * 2.1 + vec2f(15.0, 3.0), 140.5) * 0.6 + nfb(tw * 2.7 + vec2f(4.0, 12.0), r * 2.3 + 144.5) * 0.4;
  let v1: f32 = nebThin(vnoise3(vec3f(tw * 4.3 + vec2f(21.0, 5.0), r * 1.9 + 160.5)), 7.0);
  let v2: f32 = nebThin(tnoise3(vec3f(q * 6.1 + vec2f(2.0, 17.0), 165.5)), 8.0);
  let vb: f32 = smoothstep(0.40, 0.66, nfb(q * 1.5 + vec2f(12.0, 6.0), 170.5));
  let edge: f32 = smoothstep(1.0, 0.86, max(abs(p.x), abs(p.y)));
  let veil: f32 = saturate((v1 * (0.5 + 0.5 * vb) + 0.8 * v2 * vb) * smoothstep(1.45, 0.45, x) * smoothstep(0.18, 0.50, x) * (0.35 + 0.65 * exp(-x * 1.1))) * edge;
  let ph: f32 = 3.0 * atan2(rd.y, rd.x) + 7.0 * r + 5.0 * (nfb(q * 1.4 + vec2f(8.0, 2.0), 150.5) - 0.5);
  let amp: f32 = smoothstep(0.03, 0.14, r);                               // (round the stars themselves the arms have not parted yet)
  return vec4f(saturate((l1 - 0.30) * 2.5) * smoothstep(0.05, 0.24, r), veil, 0.5 + 0.5 * amp * cos(ph), 0.5 + 0.5 * amp * sin(ph));
}
`.replace(/NEB_FOLD/g,"vec3f(0.10, 0.045, 0.020)"),Do=`
// one field of eddies: xy = which way it carries the gas (the curl of a height field, so nothing piles up), z = the height itself, a slow noise
fn nebEddy(uv: vec2f, lod: f32) -> vec3f { let e: vec4f = texLod(tDetail, uv, lod); return vec3f(e.y - 0.5, 0.5 - e.x, e.z); }
fn nebB(uv: vec2f) -> vec4f { return texLod(tNebB, vec2f(clamp(uv.x, NEB_H, 1.0 - NEB_H) * 0.5, uv.y), 0.0); }
fn nebC(uv: vec2f) -> vec4f { return texLod(tNebB, vec2f(clamp(uv.x, NEB_H, 1.0 - NEB_H) * 0.5 + 0.5, uv.y), 0.0); }
// a front of light on the move: steep on its leading side, glowing away behind
fn nebWave(f: f32) -> f32 { return exp((f - 1.0) * 5.0) * smoothstep(1.0, 0.93, f); }
// returns emitted colour (rgb) of the nebula in direction d
fn nebula(d: vec3f, tm: f32) -> vec4f {
  let z: f32 = dot(d, M.nf.xyz);
  if (z < 0.3) { return vec4f(0.0); }
  let p: vec2f = vec2f(dot(d, M.nr.xyz), dot(d, M.nu.xyz)) / z * M.nr.w;
  if (abs(p.x) >= 1.0 || abs(p.y) >= 1.0) { return vec4f(0.0); }
  // how many texels of the big texture one pixel covers
  let lod: f32 = max(log2(U.camRight.w * U.res.w * M.nr.w * texSize(tNebA).x) - 0.85, 0.0);
  // ---- the sheet is folded on, slowly, by two fields of eddies drifting across each other; near its stars the gas holds its place
  let k: f32 = 0.12 + 0.88 * smoothstep(0.03, 0.45, length(p - vec2f(0.02, -0.04)));
  let e1: vec3f = nebEddy(p * 0.105 + vec2f(0.31, 0.17) + tm * vec2f(0.0029, 0.0017), 4.0);
  let q1: vec2f = p + e1.xy * (NEB_A1 * k);
  let e2: vec3f = nebEddy(q1 * 0.26 + vec2f(0.71, 0.43) + tm * vec2f(-0.0063, 0.0047), 4.0);
  let q: vec2f = q1 + e2.xy * (NEB_A2 * k);
  let uv: vec2f = vec2f(q.x, -q.y) * 0.5 + 0.5;
  // ---- it streams along the flow. What streams is the light along each thread, not the thread: the picture itself is fetched once and
  // stays knife-sharp (two copies of it slid along the flow and cross-faded, the usual way, went soft and left ghosts across the threads).
  // The flow carries a pattern of brighter and dimmer stretches instead: two lives of it, half a life apart, each fading in upstream and
  // out downstream, started at different moments in different places so the whole never pulses as one
  let fb: vec4f = nebB(uv);
  let flow: vec2f = (fb.xy - 0.5) * vec2f(1.0, -1.0) * 0.16;
  let ph: f32 = fract(tm * 0.085 + e1.z * 1.7 + fb.z * 0.9); let ph2: f32 = fract(ph + 0.5);
  let a: vec4f = texLod(tNebA, uv, lod);
  let s0: f32 = texLod(tDetail, (uv - flow * (ph - 0.5)) * 2.0 + vec2f(0.13, 0.57), 3.0).x; let s1: f32 = texLod(tDetail, (uv - flow * (ph2 - 0.5)) * 2.0 + vec2f(0.61, 0.29), 3.0).y;
  let strm: f32 = saturate(0.5 + 3.0 * (mix(s0, s1, abs(2.0 * ph - 1.0)) - 0.5));
  // ---- what rides a different current: the lanes of dust, the veil, the phase of the arms
  let qc: vec2f = p - e1.xy * (0.7 * NEB_A1 * k) + e2.xy * (1.5 * NEB_A2 * k);
  let c: vec4f = nebC(vec2f(qc.x, -qc.y) * 0.5 + 0.5);
  // ---- light. Fronts run outward from the stars (their shape wanders, and only arcs of them are lit at any time)...
  let s: f32 = fb.z; let j: f32 = (e1.z - 0.5) * 1.6 + (e2.z - 0.5) * 0.5;
  let w1: f32 = nebWave(fract(s * 4.0 - tm * 0.105 + j)) * smoothstep(0.40, 0.62, e2.z);
  let w2: f32 = nebWave(fract(s * 7.0 - tm * 0.071 - j * 1.3 + 0.4)) * smoothstep(0.60, 0.42, e1.z + 0.25 * e2.z);
  // ...waves run along the arms (turn the baked pair and the wave travels), a broad one and a finer one twice as dense going the other way round...
  let ca: vec2f = c.ba * 2.0 - 1.0; let ta: f32 = tm * 0.16; let tb: f32 = tm * 0.27 + 1.0;
  let arm: f32 = ca.x * cos(ta) + ca.y * sin(ta);
  let arm2: f32 = (ca.x * ca.x - ca.y * ca.y) * cos(tb) - 2.0 * ca.x * ca.y * sin(tb);
  let w3: f32 = pow(saturate(arm * 0.5 + 0.5), 4.0); let w4: f32 = pow(saturate(arm2 * 0.5 + 0.5), 3.0);
  // ...and knots come up and die away where two slow noises agree
  let knot: f32 = smoothstep(0.50, 0.66, e1.z * 0.45 + e2.z * 0.55 + 0.05 * arm);
  let pulse: f32 = min(0.80 + 1.6 * w1 + 1.0 * w2 + 0.45 * w3 + 0.25 * w4 + 0.5 * knot, 2.8);
  // ---- colour: which gas glows where drifts too
  let hue: f32 = saturate(a.z + ((e1.z - 0.5) * 0.40 + 0.08 * arm) * k);
  let rose: vec3f = vec3f(1.00, 0.26, 0.44); let violet: vec3f = vec3f(0.46, 0.32, 1.00); let teal: vec3f = mix(vec3f(0.14, 0.95, 0.84), vec3f(0.56, 0.52, 0.84), M.ns.x); let gold: vec3f = vec3f(1.00, 0.76, 0.46);
  var col: vec3f = mix(rose, violet, smoothstep(0.30, 0.90, hue)) * a.x * (0.7 + 0.3 * pulse) * (0.51 + 0.08 * strm);
  let thr: vec3f = mix(mix(gold, rose, 0.5), teal, smoothstep(0.30, 0.62, hue));
  col += thr * a.y * pulse * (0.62 + 0.86 * strm);
  col += mix(thr, violet, 0.35 * smoothstep(0.35, 0.75, hue + 0.2 * arm2)) * c.g * (0.25 + 0.5 * w3 + 0.6 * w1 + 0.3 * knot) * 0.5;
  // the dust: dark where it lies thick, and its edge lit where it stands against the glow
  let dl: f32 = c.r + (e2.z - 0.5) * 0.12;
  col *= 1.0 - 0.60 * smoothstep(0.56, 0.70, dl);
  col += mix(gold, rose, 0.35) * (exp(-sq((dl - 0.545) / 0.022)) * (a.x * 0.9 + a.y * 0.5) * (0.5 + 0.5 * pulse) * 0.35);
  col += vec3f(1.0, 0.86, 0.80) * fb.w * (1.5 + 0.25 * w3 + 0.2 * knot);
  col = mix(vec3f(luma(col)), col, M.ns.y);
  // the stars are not carried along (sampled without the folding or the flow) and scintillate a little
  let st: f32 = texLod(tNebA, vec2f(p.x, -p.y) * 0.5 + 0.5, lod).w;
  col += vec3f(0.90, 0.95, 1.0) * st * (0.8 + 0.2 * sin(tm * 3.3 + p.x * 57.0 + p.y * 31.0)) * 2.0 * M.nf.w;
  return vec4f(col, 1.0);
}
`.replace(/NEB_H/g,(.5/ba).toFixed(7)).replace(/NEB_A1/g,"0.40").replace(/NEB_A2/g,"0.10"),hs=(()=>{const e={res:384,enabled:!0,K:b0.K,baked:!1,time:0,wind:.022,ksun:1,ksky:1.6,kgnd:1.2,ktwi:1,sigma:42,kd:1.1,silver:1.8,shear:.18,evo:1,life:1.3,rise:.006,seaRate:1,seaSigma:.04,seaKd:1.15,seaSilver:.65,list:[{az:-.62,el:.1,w:.4,asp:.52,seed:1,haze:.34,tur:1},{az:.38,el:.125,w:.3,asp:.66,seed:2,haze:.28,tur:1.15},{az:-.04,el:.175,w:.15,asp:.5,seed:3,haze:.18,tur:.55},{az:.88,el:.17,w:.24,asp:.55,seed:4,haze:.22,tur:.9},{az:-1.1,el:.16,w:.26,asp:.5,seed:5,haze:.22,tur:.75},{az:.1,el:.055,w:.17,asp:.42,seed:6,haze:.5,tur:.45}]},s=3,w=2,x=.8,F=.6,we=.85,Y=1.9,E=2.6,D=typeof Dt<"u"?Dt:{val:{},def(){}};D.def("cu","小云",[["a","现在的"],["b","碎云"],["c","去掉小云"]],"c");const be=he=>ge(.27,.16,he.w);let ht=-1,qe,se,_,b,re,m,J,ae,X,ke;const C={tex:[],tgt:[]},ne={tex:[],tgt:[],w:0,h:0};let Be=0,Ee=0,je=1,$e=0,nt=-1e9,Ke=!1,Fe=null;e.sea={A:null,B:null,f:0,oA:0,oB:0},e.init=function(he,H){qe=he,H&&(e.res=H),se=qe.texture({w:528,h:528,format:"rgba8",filter:"linear",wrap:"clamp"}),_=qe.target({color:se}),c0.vol=se,ne.h=e.res,ne.w=Math.round(e.res*20/12)*4;for(let V=0;V<3;V++)C.tex[V]=qe.texture({w:e.res*s,h:e.res*w,format:"rgba16f",filter:"linear",wrap:"clamp"}),C.tgt[V]=qe.target({color:C.tex[V]}),ne.tex[V]=qe.texture({w:ne.w,h:ne.h,format:"rgba16f",filter:"linear",wrap:"repeat",wrapY:"clamp"}),ne.tgt[V]=qe.target({color:ne.tex[V]});e.atlas=C.tex[0],e.sea.A=e.sea.B=ne.tex[0];const z=V=>{const I={};for(const Q of V.split(" "))I[Q]="vec4f";return I};b=qe.pipeline({name:"cloudVol",lib:[St.common,St.hash],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f"},textures:{},colorFormat:"rgba8",depth:!1,depthTest:!1,cull:"none",vs:as,fs:Vo}),re=qe.pipeline({name:"cloudBake",lib:[St.common,St.hash,St.tonemap,Oa,Oo],topology:"strip",buffers:[],varyings:{uv:"vec2f"},uniforms:z("r t a b l c k o0 o1 o2 o3 l0 l1 l2 l3 l4 l5 l6 m0 m1 m2 m3 m4 m5 m6"),textures:{tVol:"2d"},colorFormat:"rgba16f",depth:!1,depthTest:!1,cull:"none",vs:Ba,fs:Bo}),J=qe.pipeline({name:"seaBake",lib:[St.common,St.hash,St.tonemap,Oa,Io],topology:"strip",buffers:[],varyings:{uv:"vec2f"},uniforms:z("r t p l w"),textures:{tVol:"2d"},colorFormat:"rgba16f",depth:!1,depthTest:!1,cull:"none",vs:Ba,fs:jo}),m=qe.pipeline({name:"cloudDraw",lib:[St.common,St.fog],topology:"strip",buffers:[],varyings:{uv:"vec2f",dir:"vec3f"},uniforms:z("a t k f s g0 g1 g2 n"),textures:{tCloudA:"2d",tCloudB:"2d",tSky:"2d"},depthFunc:"lequal",depthWrite:!1,cull:"none",blend:"premul",vs:Ko,fs:Ho}),e.sunTex=qe.texture({w:1,h:1,format:"rgba8",filter:"linear",wrap:"clamp"}),X=qe.target({color:e.sunTex}),ae=qe.pipeline({name:"cloudSun",lib:[St.common],buffers:[],varyings:{uv:"vec2f"},uniforms:z("a t f s"),textures:{tCloudA:"2d",tCloudB:"2d"},colorFormat:"rgba8",depth:!1,depthTest:!1,cull:"none",blend:"mul",vs:as,fs:Co}),e.pipes=[b,re,J,m,ae];for(const V of e.list){const I=Math.tan(V.w/2),Q=Math.cos(V.el),L=Math.sin(V.el),ye=.93*V.asp;V.tw=I,V.D=1/I,V.yb=(F*L-ye*(1+F*I*Q))/(Q+ye*I*L),V.yt=ye*(V.D-.55)/V.D}ke=e.list.map((V,I)=>I).sort((V,I)=>e.list[V].el-e.list[I].el)};const Ge=(he,H)=>((he.az+e.wind*he.el*H+1.45)%2.9+2.9)%2.9-1.45,Je=he=>{const H=he%s,z=Math.floor(he/s);return[H/s,z/w,(H+1)/s,(z+1)/w]};function le(he,H){const z=he.seed*97,V=he.yt-he.yb,I=H/e.life,Q=[],L=[],ye=he.rag||0,Ve=.72*(1+.05*Math.sin(I*.017+z))*(1-.05*ye),Ne=(.34+.1*he.tur)*V*(1-.25*ye);Q.push([.05*Math.sin(I*.011+z*1.7),he.yb-.02,0,Ve]),L.push([Ne/Ve,0,.22,1]);for(let Ce=1;Ce<5;Ce++){const Ye=75+55*ms(Ce,z),T=I/Ye+ms(Ce+9,z)+Ce*.23,Se=Math.floor(T),me=T-Se,B=Ss(Se,Ce,z),U=Ss(Se,Ce+20,z),A=Ss(Se,Ce+40,z),a=Ss(Se,Ce+60,z),oe=ge(0,.36,me),fe=ge(.4,.92,me),O=oe*ge(1,.76,me),ie=(.24+.15*A)*(.5+.5*oe)*(1-.25*ye),ce=1.1+.25*a,He=it((Ce-2.5)*.29+(B-.5)*.24+.1*fe,-.74+ie,.74-ie),We=he.yb+V*(.5+.42*a*(1-.6*He*He))*(.55+.45*he.tur),Qe=Re(Re(he.yb+.1*V,Math.max(We-ie*ce*1.25,he.yb+.1*V),oe)-.04*V*fe,he.yb+V*(.1+.12*U),.8*ye);Q.push([He*(1-.3*ye),Math.min(Qe,he.yt-ie*ce*1.3-.01),(U-.5)*.5,ie]),L.push([ce*(1-.4*ye),0,Math.max(fe,.6*ye),O*(1-.5*ye)])}for(let Ce=0;Ce<2;Ce++){const Ye=I*(.0031+.0013*Ce)+z*(1.3+Ce),T=.5+.5*Math.sin(Ye*1.7+2.1*Ce),Se=(.25+.06*T)*(1-.35*ye),me=1.05+.15*T,B=(Ce?.26:-.3)+.1*Math.sin(Ye),U=he.yb+V*(.46+.16*T)*(.6+.4*he.tur)*(1-.5*ye);Q.push([B,Math.max(U-Se*me,he.yb+.05*V),.12*Math.cos(Ye*1.3),Se]),L.push([me,0,.35+.25*ye,1-.5*ye])}return L[0][1]=ye,{L:Q,M:L}}function Pe(he){const H=Nt.sunDir(),z=L=>L-Math.floor(L),V=he*e.evo,I=e.rise,Q=Re(2.6,3.4,mt((e.res-160)/224));return{phi:he,L:H,s2:Q,cl:e.list.map(L=>{const ye=Ge(L,he),Ve=Math.cos(ye),Ne=Math.sin(ye),Ce=L.seed;return{lb:le(L,he),Ll:[H[0]*Ve+H[2]*Ne,H[1],H[0]*Ne-H[2]*Ve],o0:[z(Ce*.37),z(Ce*.61-he*I*we),z(Ce*.13+V*.0012),0],o1:[z(Ce*.71+.3),z(Ce*.29-he*I*Y),z(Ce*.53+V*.0035),0],o2:[z(Ce*.17+.6),z(Ce*.83-he*I*Q),z(Ce*.41+V*.006),0],o3:[z(Ce*.23+.1),z(Ce*.47-he*I*Q*E),z(Ce*.67+V*.009),Q*E]}})}}function pe(he,H,z,V,I){const Q=e.list.length,L=Q*e.res,ye=Math.round(z*L),Ve=Math.round(V*L);qe.beginPass(he,I?{color:[0,0,0,0]}:{});for(let Ne=Math.floor(ye/e.res);Ne<Q&&Ne*e.res<Ve;Ne++){const Ce=Math.max(ye-Ne*e.res,0)/e.res,Ye=Math.min(Ve-Ne*e.res,e.res)/e.res;if(Ye<=Ce)continue;const T=e.list[Ne],Se=Je(Ne),me=H.cl[Ne],B={r:[Se[0],Re(Se[1],Se[3],Ce),Se[2],Re(Se[1],Se[3],Ye)],t:[0,Ce,1,Ye],a:[T.seed,T.yb,T.tw,T.el],b:[T.D,x,T.asp,T.yt],l:[me.Ll[0],me.Ll[1],me.Ll[2],e.silver],c:[e.shear,we,Y,H.s2],k:[.6,.7,e.kd,e.sigma*(1-.55*(T.rag||0))],o0:me.o0,o1:me.o1,o2:me.o2,o3:me.o3};for(let U=0;U<7;U++)B["l"+U]=me.lb.L[U],B["m"+U]=me.lb.M[U];qe.draw(re,{u:B,tex:{tVol:se},count:4})}qe.endPass()}function c(he,H,z,V,I){const Q=Math.round(z*ne.h),L=Math.round(V*ne.h);qe.beginPass(he,I?{color:[0,0,0,0]}:{}),L>Q&&qe.draw(J,{u:{r:[0,Q/ne.h,1,L/ne.h],t:[0,Q/ne.h,1,L/ne.h],p:[H.phi,e.seaSigma,e.seaSilver,e.seaRate],l:[H.L[0],H.L[1],H.L[2],e.seaKd],w:[-b0.wind[0]*H.phi,-b0.wind[1]*H.phi,0,0]},tex:{tVol:se},count:4}),qe.endPass()}e.update=function(){const he=qt.time,H=ht<0?1:1-Math.exp(-Math.min(Math.abs(he-ht),.5)/1.2),z=D.val.cu||"a";ht=he;for(const Q of e.list){const L=be(Q);Q.rag=Re(Q.rag||0,z==="b"?L:0,H),Q.keep=Re(Q.keep===void 0?1:Q.keep,z==="c"?1-L:1,H)}if(Ke||(qe.beginPass(_,{color:[0,0,0,0]}),qe.draw(b,{u:{p:[0,0,0,0]},tex:{},count:3}),qe.endPass(),Ke=!0),!e.baked||he<nt||he-nt>e.K*.75){const Q=Pe(he);pe(C.tgt[0],Q,0,1,!0),c(ne.tgt[0],Q,0,1,!0),Be=Ee=0,je=1,Fe=Pe(he+e.K),$e=0,e.baked=!0,nt=he}else{let Q=(he-nt)/e.K;for(nt=he;Q>1e-9;){const L=Math.min(1,$e+Q);if(pe(C.tgt[je],Fe,$e,L,!1),c(ne.tgt[je],Fe,$e,L,!1),Q-=L-$e,$e=L,$e>=1){const ye=Be===Ee?3-Ee-je:Be;Be=Ee,Ee=je,je=ye,Fe=Pe(Fe.phi+e.K),$e=0}}}e.oA=Be===Ee?$e-1:$e,e.oB=$e-1,e.sea.A=ne.tex[Be],e.sea.B=ne.tex[Ee],e.sea.f=$e,e.sea.oA=e.oA,e.sea.oB=e.oB,e.atlas=C.tex[Ee];const V=Nt.sunDir(),I=typeof M0<"u"?1-M0.kc:1;if(qe.beginPass(X,{color:[1,1,1,1]}),e.enabled&&I>.003)for(const Q of ke){const L=e.list[Q],ye=Ge(L,he),Ve=ge(1.45,1.2,Math.abs(ye))*I*(L.keep===void 0?1:L.keep),Ne=Je(Q),Ce=e.rise*e.K/(2*L.asp);Ve<.002||Math.abs(ye-Math.atan2(V[0],-V[2]))>L.w+.05&&Math.abs(ye-Math.atan2(V[0],-V[2]))<6.2-L.w||qe.draw(ae,{u:{a:[ye,L.el,L.tw,L.asp],t:[Ne[0],Ne[1],Ne[2]-Ne[0],Ne[3]-Ne[1]],f:[Ve,$e,Ce*e.oA,Ce*e.oB],s:[V[0],V[1],V[2],0]},tex:{tCloudA:C.tex[Be],tCloudB:C.tex[Ee]},count:3})}qe.endPass()},e.bakeNow=function(he){const H=Pe(qt.time);he!=="sea"&&pe(C.tgt[je],H,0,1,!0),he!=="cu"&&c(ne.tgt[je],H,0,1,!0),$e=0},e.night={glow:.14,moon:1.7,thin:.9};function Ie(he,H){const z=typeof L0<"u"?L0:null,V=Nt.lights||0,I=[[0,0,0,0],[0,0,0,0],[0,0,0,0]];if(z&&z.cores&&z.famc&&V>.001)for(let Q=0;Q<3;Q++){const L=H+(Q-1)*he.w*.4,ye=(L-z.cityAz)*z.cityDist,Ve=Math.exp(-(((ye+200)/5200)**2))*z.lit.town*1.4,Ne=[1*Ve,.54*Ve,.19*Ve];z.cores.forEach((Ce,Ye)=>{const T=Math.exp(-(((ye-Ce[0])/(Ce[2]*2.4))**2))*z.lit.core*(.3+Ce[3]/1e3)*3;for(let Se=0;Se<3;Se++)Ne[Se]+=z.famc[Ye][Se]*T}),I[Q]=Ne.map(Ce=>Ce*V*e.night.glow).concat([0])}return{g0:I[0],g1:I[1],g2:I[2],n:[Nt.night||0,e.night.moon,e.night.thin,0]}}return e.draw=function(he){if(!e.enabled||!e.baked)return;e.time=he.time||0;const H=typeof M0<"u"?1-M0.kc:1;if(!(H<.003))for(const z of ke){const V=e.list[z],I=Ge(V,e.time),Q=Je(z),L=ge(1.45,1.2,Math.abs(I))*H*(V.keep===void 0?1:V.keep),ye=e.rise*e.K/(2*V.asp);L<.002||qe.draw(m,{u:{a:[I,V.el,V.tw,V.asp],t:[Q[0],Q[1],Q[2]-Q[0],Q[3]-Q[1]],k:[e.ksun,e.ksky,e.kgnd,V.haze+(1-V.haze)*(.1+.32*(V.rag||0))],f:[L,$e,ye*e.oA,ye*e.oB],s:[Nt.sunFar[0],Nt.sunFar[1],Nt.sunFar[2],e.ktwi],...Ie(V,I)},tex:{tCloudA:C.tex[Be],tCloudB:C.tex[Ee],tSky:Nt.lut},count:4})}},e})(),Vo=`
fn cvHash(c: vec3f, f: f32, sd: f32) -> vec3f { let w: vec3f = c - f * floor(c / f); return hash33(w + vec3f(sd * 17.0, sd * 31.0 + 5.0, sd * 47.0 + 11.0)); }
fn worleyP(p: vec3f, f: f32, sd: f32) -> f32 {
  let q: vec3f = p * f; let i: vec3f = floor(q); let fr: vec3f = q - i; var d: f32 = 9.0;
  for (var z: i32 = -1; z <= 1; z++) { for (var y: i32 = -1; y <= 1; y++) { for (var x: i32 = -1; x <= 1; x++) {
    let c: vec3f = vec3f(f32(x), f32(y), f32(z));
    let r: vec3f = c + cvHash(i + c, f, sd) - fr; d = min(d, dot(r, r));
  } } }
  return 1.0 - min(d, 1.0);
}
fn cvG(i: vec3f, c: vec3f, fr: vec3f, f: f32, sd: f32) -> f32 { return dot(cvHash(i + c, f, sd) * 2.0 - 1.0, fr - c); }
fn gradP(p: vec3f, f: f32, sd: f32) -> f32 {
  let q: vec3f = p * f; let i: vec3f = floor(q); let fr: vec3f = q - i; let u: vec3f = fr * fr * fr * (fr * (fr * 6.0 - 15.0) + 10.0);
  let a: f32 = mix(mix(cvG(i, vec3f(0.0, 0.0, 0.0), fr, f, sd), cvG(i, vec3f(1.0, 0.0, 0.0), fr, f, sd), u.x), mix(cvG(i, vec3f(0.0, 1.0, 0.0), fr, f, sd), cvG(i, vec3f(1.0, 1.0, 0.0), fr, f, sd), u.x), u.y);
  let b: f32 = mix(mix(cvG(i, vec3f(0.0, 0.0, 1.0), fr, f, sd), cvG(i, vec3f(1.0, 0.0, 1.0), fr, f, sd), u.x), mix(cvG(i, vec3f(0.0, 1.0, 1.0), fr, f, sd), cvG(i, vec3f(1.0, 1.0, 1.0), fr, f, sd), u.x), u.y);
  return mix(a, b, u.z);
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let px: vec2f = v.uv * 528.0; let tile: vec2f = floor(px / 66.0);
  let p: vec3f = vec3f(fract((px - tile * 66.0 - 1.0) / 64.0), (tile.y * 8.0 + tile.x + 0.5) / 64.0);
  let w1: f32 = worleyP(p, 3.0, 1.0); let w2: f32 = worleyP(p, 6.0, 2.0); let w3: f32 = worleyP(p, 12.0, 3.0); let w4: f32 = worleyP(p, 20.0, 7.0);
  let g0: f32 = gradP(p, 2.0, 8.0); let g1: f32 = gradP(p, 4.0, 4.0); let g2: f32 = gradP(p, 8.0, 5.0); let g3: f32 = gradP(p, 16.0, 6.0);
  // (stretched to use the whole range: each ends up about 0..1 with its middle near a half)
  o.color = vec4f((w1 * 0.55 + w2 * 0.30 + w3 * 0.15 - 0.40) / 0.52, 0.5 + 1.7 * (g1 * 0.55 + g2 * 0.30 + g3 * 0.15), (w2 * 0.50 + w3 * 0.30 + w4 * 0.20 - 0.40) / 0.52, 0.5 + 1.5 * (g0 * 0.65 + g1 * 0.35)); return o; }
`,Oa=`
fn volT(z: f32) -> vec2f { let zz: f32 = z - 64.0 * floor(z / 64.0); let ty: f32 = floor(zz / 8.0); return vec2f(zz - ty * 8.0, ty) * 66.0 + 1.0; }
fn vol(p: vec3f) -> vec4f {
  let q: vec3f = fract(p) * 64.0;
  let zf: f32 = q.z - 0.5; let z0: f32 = floor(zf); let fz: f32 = zf - z0;
  return mix(texLod(tVol, (volT(z0) + q.xy) / 528.0, 0.0), texLod(tVol, (volT(z0 + 1.0) + q.xy) / 528.0, 0.0), fz);
}
// droplets throw most of the light on ahead and a little straight back
fn cloudPhase(c: f32, g: f32) -> f32 { return mix(hg(c, -0.3), hg(c, g), 0.8); }
`,Oo=`
// (how far inside the nearest thermal: 1 at its heart, 0 on its skin, negative outside; sums for the age of the air here)
fn cuLobe(p: vec3f, a: vec4f, b: vec4f, acc: vec3f) -> vec3f {
  let q: vec3f = (p - a.xyz) / (a.w * vec3f(1.0, b.x, 0.85));
  let e: f32 = 1.6 * b.w - 0.6 - length(q);
  let h: f32 = max(0.3 - abs(e - acc.x), 0.0);
  let g: f32 = saturate(e + 0.8); let w: f32 = g * g;
  return vec3f(max(e, acc.x) + h * h * 0.8333, acc.y + w * b.z, acc.z + w);
}
fn cuCov(p: vec3f) -> vec2f {
  var a: vec3f = vec3f(-9.0, 0.0, 1e-4);
  a = cuLobe(p, M.l0, M.m0, a); a = cuLobe(p, M.l1, M.m1, a); a = cuLobe(p, M.l2, M.m2, a); a = cuLobe(p, M.l3, M.m3, a); a = cuLobe(p, M.l4, M.m4, a); a = cuLobe(p, M.l5, M.m5, a); a = cuLobe(p, M.l6, M.m6, a);
  return vec2f(a.x, a.y / a.z);
}
// a torn scrap (M.m0.y) is drawn out along the wind: its noise is stretched across, so it tears into streaks, not into round patches
fn cuStr(p: vec3f) -> vec3f { return p * vec3f(1.0 - 0.65 * M.m0.y, 1.0, 1.0 - 0.4 * M.m0.y); }
// the wind is stronger higher up: the tops lean downwind
fn cuLean(p: vec3f) -> vec3f { return vec3f(p.x - M.c.x * (p.y - 0.5 * (M.a.y + M.b.w)), p.y, p.z); }
// the stretch of a line of sight (o + d t, in the leaned space) on which one thermal can have cloud: tr widened to take it in.
// (its skin can be pushed out by the billows and the wisps, and bulge where it meets a neighbour, by 0.51 of its radius at most)
fn cuHit(o: vec3f, d: vec3f, a: vec4f, b: vec4f, tr: vec2f) -> vec2f {
  let E: f32 = 1.6 * b.w - 0.09;
  if (E <= 0.0) { return tr; }
  let R: vec3f = a.w * E * vec3f(1.0, b.x, 0.85);
  let oq: vec3f = (o - a.xyz) / R; let dq: vec3f = d / R;
  let A: f32 = dot(dq, dq); let B: f32 = dot(oq, dq); let D: f32 = B * B - A * (dot(oq, oq) - 1.0);
  if (D <= 0.0) { return tr; }
  let sq: f32 = sqrt(D);
  return vec2f(min(tr.x, (-B - sq) / A), max(tr.y, (-B + sq) / A));
}
// young air has hard edges and is full of water; old air is thin and soft
fn cuSharp(age: f32) -> f32 { return mix(17.0, 2.2, sqrt(age)); }
fn cuMax(age: f32) -> f32 { return mix(1.0, 0.30, age * age); }
// a flat base where the air reaches its dew point (not quite flat: a little ragged)
// (a torn scrap, M.m0.y: no flat base at all, only a frayed underside)
fn cuBase(y: f32, n: f32) -> f32 { let rg: f32 = M.m0.y; return smoothstep(0.0, 0.045 + 0.08 * rg, y - M.a.y - (0.07 + 0.12 * rg) * (n - 0.5) - 0.02 * rg); }
// the cloud without its fine detail: enough for asking how much of it lies in the way of the light
fn cuDensLo(p: vec3f) -> f32 {
  if (p.y < M.a.y - 0.02) { return 0.0; }
  let ps: vec3f = cuLean(p); let cv: vec2f = cuCov(ps);
  if (cv.x < -0.4) { return 0.0; }
  let n: vec4f = vol(cuStr(ps) * M.c.y + M.o0.xyz);
  return saturate((cv.x + (mix(n.r, n.g, 0.35) - 0.56) * 0.75 - 0.07) * cuSharp(cv.y)) * cuMax(cv.y) * cuBase(p.y, n.a);
}
// (density, age). The thermals' skin is pushed out and in by billows a third their size; then the edge is eaten: young air along the
// seams between its bubbles (cauliflower), old air and the air at the base combed into shreds
fn cuDens(p: vec3f) -> vec2f {
  if (p.y < M.a.y - 0.02) { return vec2f(0.0); }
  let ps: vec3f = cuLean(p); let cv: vec2f = cuCov(ps);
  if (cv.x < -0.4) { return vec2f(0.0); }
  let n: vec4f = vol(cuStr(ps) * M.c.y + M.o0.xyz);
  // (a torn scrap: its outline is set by the soft noise more than by its bubbles)
  let rg: f32 = M.m0.y;
  var F: f32 = cv.x + (mix(n.r, n.g, 0.35 + 0.65 * rg) - 0.56) * (0.95 + 0.1 * rg);
  if (F <= -0.16) { return vec2f(0.0, cv.y); }
  let a: vec4f = vol(cuStr(ps) * M.c.z + M.o1.xyz); let b: vec4f = vol(cuStr(ps) * M.c.w + M.o2.xyz);
  let hN: f32 = saturate((p.y - M.a.y) / (M.b.w - M.a.y));
  // where the air is old: thermals past their prime, the skirts near the base, and patches all over where dry air has got in
  // (a torn scrap is old air through and through but for a firmer heart)
  let old: f32 = saturate(cv.y + 0.5 * (1.0 - smoothstep(0.0, 0.2, hN)) + 0.8 * smoothstep(0.50, 0.85, a.a) + M.m0.y * (0.85 - 0.3 * saturate(F * 3.0)));
  let seam: f32 = smoothstep(0.15, 0.85, (1.0 - a.r) * 0.62 + (1.0 - b.r) * 0.38);
  let e: f32 = mix(seam, a.g * 0.6 + b.g * 0.4, old);
  F -= e * mix(M.k.x, M.k.y, old) * (1.0 - 0.75 * (1.0 - 0.2 * rg) * saturate(F * 2.5));
  // the finest scale, on the skin only. Young air: small bulges on the bulges (the third step of the cauliflower), each crisp where the
  // sun finds it. Old air, the underside and the scraps: the same noise drawn out along the wind and flattened, so the edge frays into
  // streaks reaching out past the body (wisps), not into a soft glow
  if (F > -0.16 && F < 0.36 + 0.3 * rg) {
    let q: vec3f = ps * M.o3.w + M.o3.xyz;
    let wo: f32 = saturate(old + 0.7 * (1.0 - smoothstep(0.0, 0.3, hN)) + rg);
    let f4: vec4f = vol(q);
    var w4: f32 = 0.5; if (wo > 0.04) { w4 = vol(vec3f(q.x * 0.10, q.y * 0.55, q.z * 0.17) + vec3f(0.37, 0.0, 0.61)).g; }
    F -= saturate(1.0 - F / 0.36) * (1.0 - f4.b) * 0.18 * (1.0 - wo);
    F += max(1.0 - abs(F) / (0.30 + 0.25 * rg), 0.0) * (w4 - 0.47) * (0.36 + 0.5 * rg) * wo;
  }
  if (F <= 0.0) { return vec2f(0.0, old); }
  return vec2f(saturate(F * cuSharp(old) * (1.0 - 0.45 * rg)) * cuMax(old) * cuBase(p.y, n.a), old);
}
`,Ba=`
fn vert(a: VIn) -> VOut { var v: VOut;
  let c: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u));
  let p: vec2f = mix(M.r.xy, M.r.zw, c);
  v.clip = vec4f(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  v.uv = mix(M.t.xy, M.t.zw, c);
  return v; }`,Bo=`
fn nz(x: f32) -> f32 { return select(x, 1e-5, abs(x) < 1e-5); }
fn frag(v: VOut) -> FOut { var o: FOut;
  let yb: f32 = M.a.y; let tw: f32 = M.a.z; let yt: f32 = M.b.w; let sg: f32 = M.k.w; let Ls: vec3f = M.l.xyz;
  // the line of sight through this texel, turned into the cloud's upright space: the eye is below it and looks up at its base
  let dv: vec3f = normalize(vec3f((v.uv.x * 2.0 - 1.0) * tw, (1.0 - v.uv.y * 2.0) * M.b.z * tw, 1.0));
  let ce: f32 = cos(M.a.w); let se: f32 = sin(M.a.w);
  let rd: vec3f = vec3f(nz(dv.x), nz(dv.y * ce + dv.z * se), nz(dv.z * ce - dv.y * se));
  let ro: vec3f = vec3f(0.0, -M.b.x * se, -M.b.x * ce);
  // through the box the cloud lives in
  let ia: vec3f = (vec3f(-1.25, yb - 0.02, -M.b.y) - ro) / rd; let ib: vec3f = (vec3f(1.25, yt, M.b.y) - ro) / rd;
  // ...and of that only the stretch where a thermal is
  let rl: vec3f = cuLean(ro); let dl2: vec3f = vec3f(rd.x - M.c.x * rd.y, rd.y, rd.z);
  var tr: vec2f = vec2f(1e9, -1e9);
  tr = cuHit(rl, dl2, M.l0, M.m0, tr); tr = cuHit(rl, dl2, M.l1, M.m1, tr); tr = cuHit(rl, dl2, M.l2, M.m2, tr); tr = cuHit(rl, dl2, M.l3, M.m3, tr); tr = cuHit(rl, dl2, M.l4, M.m4, tr); tr = cuHit(rl, dl2, M.l5, M.m5, tr); tr = cuHit(rl, dl2, M.l6, M.m6, tr);
  let t0: f32 = max(max(max(min(ia.x, ib.x), min(ia.y, ib.y)), min(ia.z, ib.z)), tr.x); let t1: f32 = min(min(min(max(ia.x, ib.x), max(ia.y, ib.y)), max(ia.z, ib.z)), tr.y);
  if (t1 <= t0) { o.color = vec4f(0.0); return o; }
  // the angle between the sun and this line of sight (the silver lining is all about that angle)
  let c: f32 = dot(Ls, rd);
  let ph0: f32 = cloudPhase(c, 0.80); let ph1: f32 = cloudPhase(c, 0.40); let ph2: f32 = cloudPhase(c, 0.20);
  let ds: f32 = 0.0185; let jit: f32 = ign(v.clip.xy);
  var T: f32 = 1.0; var S: vec3f = vec3f(0.0);
  for (var i: i32 = 0; i < 100; i++) {
    let tt: f32 = t0 + (f32(i) + jit) * ds;
    if (tt > t1) { break; }
    let p: vec3f = ro + rd * tt;
    let dn: vec2f = cuDens(p);
    if (dn.x > 0.003) {
      // how much cloud lies between here and the sun: five strides that lengthen as they go
      var tl: f32 = 0.0; var st: f32 = 0.028; var pl: vec3f = p;
      for (var j: i32 = 0; j < 5; j++) {
        pl += Ls * (st * 0.5);
        // (the first with all the detail: the small bulges shade the seams between them)
        var dl: f32 = 0.0; if (j < 1) { dl = cuDens(pl).x; } else { dl = cuDensLo(pl); }
        tl += dl * st;
        pl += Ls * (st * 0.5); st *= 1.9;
      }
      let tau: f32 = tl * sg;
      // ...and how much hangs overhead, between here and the open sky
      // (two looks up: just over this spot, and further: a crease between two towers and the core under a turret see little of the sky)
      let tu: f32 = (cuDensLo(p + vec3f(0.0, 0.08, 0.0)) * 0.16 + cuDensLo(p + vec3f(0.0, 0.26, 0.0)) * 0.30) * sg;
      // light that has been scattered many times needs cloud all round to be scattered in: a thin shred has next to none of it, and seen
      // with the sun behind you it is greyer than the heart of the cloud (seen against the sun it blazes: the first term below)
      let pw: f32 = (1.0 - 0.7 * dn.y) * (0.45 + 0.55 * saturate(dn.x * 2.0));
      // the first bounces keep their direction; later ones forget it and reach deeper; what has no direction left still gets through, a
      // good deal of it: the heart of a cloud between the eye and the sun is a soft grey-white, not dark (but the far side of a really
      // thick one is dusky against a low sun: what gets right through falls off faster than what gets a little way in)
      let hN: f32 = saturate((p.y - yb) / (yt - yb));
      // (the far rim of the base, seen from below, is no silver lining: the gleam is kept to the flanks and the top; and thin air between
      // the bulges is greyer than the bulges)
      // Powder: right at a sunlit skin little light has yet been scattered sideways into the eye, so with the sun beside or behind you the
      // outermost skin of each bulge is a touch darker than just inside it: every bulge stands out against the one behind it. Seen against
      // the sun it is the other way round (the silver lining), so it fades out there
      let pdr: f32 = 1.0 - 0.5 * exp(-4.0 * tau) * saturate(0.6 - 0.8 * c);
      let lsun: f32 = M.l.w * mix(0.3, 1.0, smoothstep(0.0, 0.25, hN)) * PI * (ph0 * exp(-tau) * pdr + 0.6 * ph1 * exp(-0.6 * tau) + 0.3 * ph2 * exp(-0.3 * tau))
        + M.k.z * pw / (1.0 + 0.40 * tau + 0.025 * tau * tau);
      // the sky fills in from above and the snowfields and the deck from below (the base stays the darkest part of a big one); a shred is open to all of it (it is never darker than
      // the sky behind it), the body only where it faces them
      let asky: f32 = exp(-0.45 * tu) * mix(1.0, 0.45 + 0.55 * hN, pw);
      let agnd: f32 = mix(1.3, 0.55 * exp(-3.0 * hN) + 0.15, pw);
      let dT: f32 = exp(-dn.x * sg * ds);
      S += (T * (1.0 - dT)) * vec3f(lsun, asky, agnd);
      T *= dT;
      // (what little would still get through is taken as stopped here: else the sun's disc behind the thick of a cloud shines through it)
      if (T < 0.03) { S += T * vec3f(lsun, asky, agnd); T = 0.0; break; }
    }
  }
  o.color = vec4f(S, 1.0 - T); return o; }
`,Co=`
fn frag(v: VOut) -> FOut { var o: FOut;
  let ce: f32 = cos(M.a.y); let f: vec3f = vec3f(sin(M.a.x) * ce, sin(M.a.y), -cos(M.a.x) * ce);
  let r: vec3f = normalize(cross(f, vec3f(0.0, 1.0, 0.0))); let u: vec3f = cross(r, f);
  var a: f32 = 0.0;
  for (var i: i32 = 0; i < 5; i++) {
    let an: f32 = f32(i) * 1.2566; let rr: f32 = select(0.0045, 0.0, i == 0);
    let s: vec3f = normalize(M.s.xyz + (r * cos(an) + u * sin(an)) * rr);
    let k: f32 = dot(s, f);
    if (k > 0.05) {
      let x: f32 = dot(s, r) / (k * M.a.z); let y: f32 = dot(s, u) / (k * M.a.z * M.a.w);
      let uv: vec2f = vec2f(x * 0.5 + 0.5, 0.5 - y * 0.5);
      if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
        let ua: vec2f = M.t.xy + clamp(vec2f(uv.x, uv.y + M.f.z), vec2f(0.004), vec2f(0.996)) * M.t.zw;
        let ub: vec2f = M.t.xy + clamp(vec2f(uv.x, uv.y + M.f.w), vec2f(0.004), vec2f(0.996)) * M.t.zw;
        let e: vec2f = min(uv, 1.0 - uv);
        a += mix(texLod(tCloudA, ua, 0.0).a, texLod(tCloudB, ub, 0.0).a, M.f.y) * smoothstep(0.0, 0.03, min(e.x, e.y));
      }
    }
  }
  let T: f32 = 1.0 - saturate(a / 5.0 * M.f.x);
  o.color = vec4f(T, T, T, 1.0); return o; }
`,Ko=`
fn vert(a: VIn) -> VOut { var v: VOut;
  let c: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u));
  let ce: f32 = cos(M.a.y); let f: vec3f = vec3f(sin(M.a.x) * ce, sin(M.a.y), -cos(M.a.x) * ce);
  let r: vec3f = normalize(cross(f, vec3f(0.0, 1.0, 0.0))); let u: vec3f = cross(r, f);
  let d: vec3f = f + r * ((c.x * 2.0 - 1.0) * M.a.z) + u * ((c.y * 2.0 - 1.0) * M.a.z * M.a.w);
  let cp: vec4f = U.viewProj * vec4f(U.camPos.xyz + d * 2000.0, 1.0);
  v.clip = vec4f(cp.xy, cp.w, cp.w);
  v.uv = vec2f(c.x, 1.0 - c.y); v.dir = d;
  return v; }`,Ho=`
fn frag(v: VOut) -> FOut { var o: FOut;
  let ua: vec2f = M.t.xy + clamp(vec2f(v.uv.x, v.uv.y + M.f.z), vec2f(0.004), vec2f(0.996)) * M.t.zw;
  let ub: vec2f = M.t.xy + clamp(vec2f(v.uv.x, v.uv.y + M.f.w), vec2f(0.004), vec2f(0.996)) * M.t.zw;
  // between the last key and the next
  let t: vec4f = mix(texLod(tCloudA, ua, 0.0), texLod(tCloudB, ub, 0.0), M.f.y);
  if (t.a < 0.003) { discard; }
  // (they hang higher than the mountain and keep the sun a little longer: M.s)
  // (what comes up from below is as much the blue shade of the snowfields and the deck as their sunlit side)
  var col: vec3f = M.s.rgb * (t.x * M.k.x) + U.ambSky.rgb * (t.y * M.k.y + t.z * M.k.z * 0.55) + U.ambGnd.rgb * (t.z * M.k.z * 0.45);
  // after sunset the bright band low on the sun's bearing goes on lighting them, on the flanks turned to it and from underneath
  col += U.twi.rgb * ((t.x * 0.8 + t.z * 0.35) * M.s.w);
  // at night: the moon catches the tops (the key holds the moon's light then: 05_sky.js lights by the moon after dark), and the town's
  // glow comes up under the bases, in the colours of the quarters below them
  col += M.s.rgb * (t.x * M.k.x * M.n.x * (M.n.y - 1.0));
  let gx: f32 = v.uv.x * 2.0;
  col += mix(mix(M.g0.rgb, M.g1.rgb, saturate(gx)), M.g2.rgb, saturate(gx - 1.0)) * ((t.z * 0.9 + t.y * 0.03) * smoothstep(0.35, 0.9, v.uv.y));      // (the base: the lower part of the tile)
  // the air between here and the cloud
  let d: vec3f = normalize(v.dir);
  col = mix(col, skyLut(vec3f(d.x, max(d.y, 0.0), d.z)) * t.a, M.k.w);
  // (nothing may end at the edge of its tile)
  let e: vec2f = min(v.uv, 1.0 - v.uv);
  // at night the thin parts thin further, so the nebula and the stars show through the edges (a lump of smoke has hard ones)
  let ta: f32 = pow(t.a, 1.0 + M.n.z * M.n.x);
  // The sun's disc and its hot core are thousands of times the sky: whatever share of it a thin edge lets through would still blaze.
  // Close to the sun the cloud is taken as much thicker than it is (its transmittance to a high power): the disc is gone wherever there
  // is cloud worth the name, and shows only through the last frayed wisps at the very edge (the moon the same at night)
  let cs: f32 = dot(d, U.sunDir.xyz);
  let kp: f32 = 1.0 + 14.0 * smoothstep(0.9975, 0.99995, cs);
  let ao: f32 = 1.0 - pow(1.0 - ta, kp);
  // (what is taken from the blaze behind a thin edge comes back as that edge's own glow, in the colour of the sky round the sun: no dark seam)
  let fill: vec3f = skyLut(vec3f(d.x, max(d.y, 0.0), d.z)) * ((ao - ta) * 2.0);
  o.color = vec4f(col * (ta / max(t.a, 1e-4)) + fill, ao) * (M.f.x * smoothstep(0.0, 0.03, min(e.x, e.y))); return o; }
`,Io=`
// (across the wind, along it): the deck is drawn out into streets along the wind
fn seaRot(q: vec2f) -> vec2f { return vec2f(q.x * ${$0(b0.wind[1]/Math.hypot(b0.wind[0],b0.wind[1]))} - q.y * ${$0(b0.wind[0]/Math.hypot(b0.wind[0],b0.wind[1]))}, q.x * ${$0(b0.wind[0]/Math.hypot(b0.wind[0],b0.wind[1]))} + q.y * ${$0(b0.wind[1]/Math.hypot(b0.wind[0],b0.wind[1]))}); }
// the lie of the deck without its cells: (mean height of its top, how high the cells stand, how lively this part is 0..1).
// A broad swell, long rolls, and stretches where it lies flat and thin as fog between stretches where it heaps up.
// (Towers pushed up through the top here and there were tried and taken out again: at this distance they read as a tray of cushions)
fn seaBase(q: vec2f) -> vec3f {
  let tt: f32 = M.p.x * M.p.w;
  let sw: vec4f = vol(vec3f(q / 23000.0 + vec2f(0.13, 0.71), tt * 0.0012));
  let qr: vec2f = seaRot(q);
  let ro: vec4f = vol(vec3f(qr.x / 3100.0, qr.y / 12000.0, tt * 0.0025 + 0.4));
  let vig: f32 = smoothstep(0.30, 0.70, sw.g);
  let mean: f32 = 150.0 + 110.0 * (sw.a - 0.5) + 60.0 * (ro.g - 0.5) * (0.4 + 0.6 * vig);
  return vec3f(mean, min(45.0 + 95.0 * vig, (mean - 35.0) * 1.4), vig);
}
// how much of it can no longer be told apart at range t (0 all there .. 1 gone): (the cells, the shreds and small bumps, the lumps)
fn seaLod(t: f32) -> vec3f { return vec3f(smoothstep(16000.0, 38000.0, t), smoothstep(4500.0, 11000.0, t), smoothstep(8000.0, 22000.0, t)); }
// the cells: rounded crowns with creases between them, longer along the wind than across; they turn over as time passes. On the crowns
// sit lumps a third their size, the wool of a real deck: each a small convective top, crisp while it rises.
// (0 crease .. 1 crown, the same for the small bumps, the same for the lumps)
fn seaCells(q: vec2f, lod: vec3f) -> vec3f {
  let tt: f32 = M.p.x * M.p.w; let qr: vec2f = seaRot(q);
  let c1: vec4f = vol(vec3f(qr.x / 3000.0, qr.y / 5200.0, tt * 0.004 + 0.2));
  let c2: vec4f = vol(vec3f((qr.x * 0.9 - qr.y * 0.43) / 1900.0 + 0.5, (qr.x * 0.43 + qr.y * 0.9) / 2900.0 + 0.3, tt * 0.0045 + 0.7));
  var lu: f32 = 0.56;
  if (lod.z < 0.999) { lu = mix(vol(vec3f((qr.x * 0.94 + qr.y * 0.34) / 1150.0 + 0.3, (qr.y * 0.94 - qr.x * 0.34) / 1650.0 + 0.6, tt * 0.004 + 0.1)).r, 0.56, lod.z); }
  return vec3f(mix(c1.r * 0.62 + c2.r * 0.38, 0.59, lod.x), mix(c2.b, 0.58, lod.y), lu);
}
// how high the lumps stand (m) on a cell of crown-ness cx where the cells stand b.y high: most on the crowns, next to nothing in the troughs
fn seaLump(by: f32, cx: f32) -> f32 { return (18.0 + 0.30 * by) * (0.25 + 0.75 * smoothstep(0.35, 0.75, cx)); }
fn seaHeight(b: vec3f, c: vec3f) -> f32 { return b.x + b.y * (c.x - 0.59 + 0.16 * (c.y - 0.58)) + seaLump(b.y, c.x) * (c.z - 0.56); }
// its top as a height field: (height, the mean height hereabouts, liveliness, how open to the sky: 0.4 deep in a crease .. 1 on a crown)
fn seaTop(q: vec2f, lod: vec3f) -> vec4f {
  let b: vec3f = seaBase(q);
  // (where creases can no longer be told apart their share of the sky is the average: 0.925 for the cells, 0.945 for the lumps)
  if (lod.x >= 0.999) { return vec4f(b.x, b.x, b.z, 0.874); }
  let c: vec3f = seaCells(q, lod);
  return vec4f(seaHeight(b, c), b.x, b.z, mix(0.62, 1.0, smoothstep(0.20, 0.60, c.x)) * mix(1.0, 0.925, lod.x) * mix(0.68, 1.0, smoothstep(0.12, 0.60, c.z)) * mix(1.0, 0.945, lod.z));
}
// (density 0..1, clear height above anything that could be cloud here). The top is no surface: over some tens of metres the dry air above
// eats into it and shreds of it lift off, drawn out along the wind, rising and thinning away. lod: see seaLod; t: how far off (m)
fn seaDens(q: vec2f, y: f32, lod: vec3f, t: f32) -> vec2f {
  let b: vec3f = seaBase(q);
  let gap: f32 = y - (b.x + (0.61 * b.y + 8.0) * (1.0 - lod.x) + 46.0);
  if (gap > 0.0) { return vec2f(0.0, gap); }
  var h: f32 = b.x; var soft: f32 = 36.0;
  // (a rising crown has a hard edge, the air sinking between the crowns is full of thinning fog)
  if (lod.x < 0.999) { let c: vec3f = seaCells(q, lod); h = seaHeight(b, c); soft = mix(36.0, mix(46.0, 16.0, smoothstep(0.35, 0.75, c.x) * (0.4 + 0.6 * smoothstep(0.35, 0.75, c.z))), 1.0 - lod.z); }
  let dp: f32 = h - y;
  if (dp < -56.0) { return vec2f(0.0); }
  var n: f32 = 0.5;
  if (t < 22000.0 && dp < 56.0) {
    let tt: f32 = M.p.x * M.p.w; let qr: vec2f = seaRot(q); let p3: vec3f = vec3f(qr.x, y * 1.5, qr.y * 0.55);
    let e1: vec4f = vol(p3 / 640.0 + vec3f(0.0, -tt * 0.004, tt * 0.0022));
    let e2: vec4f = vol(p3 / 205.0 + vec3f(tt * 0.0025, -tt * 0.0036, tt * 0.0025));
    n = mix(mix(e1.r * 0.35 + e1.g * 0.30 + e2.g * 0.35, e1.r * 0.45 + e1.g * 0.38 + 0.085, lod.y), 0.5, smoothstep(9000.0, 22000.0, t));
  }
  return vec2f(saturate(0.5 + dp / soft + (n - 0.5) * 1.4), 0.0);
}
`,jo=`
fn frag(v: VOut) -> FOut { var o: FOut;
  // the line of sight this texel stands for (see seaUV in 05_sky.js: the same layout, the other way round)
  let ma: f32 = (v.uv.x - 0.5) * 6.2831853; var az: f32 = ma;
  for (var i: i32 = 0; i < 6; i++) { az -= (az + ${$0(b0.k)} * sin(az) - ma) / (1.0 + ${$0(b0.k)} * cos(az)); }
  let vv: f32 = v.uv.y; let th: f32 = ${$0(b0.ta)} * vv + ${$0(b0.tb)} * vv * vv * vv * vv;
  let sth: f32 = max(sin(th), 0.004); let cth: f32 = cos(th);
  let dh: vec2f = vec2f(sin(az), -cos(az));
  let mu: f32 = dot(M.l.xyz, vec3f(dh.x * cth, -sth, dh.y * cth));
  let ph0: f32 = cloudPhase(mu, 0.72); let ph1: f32 = cloudPhase(mu, 0.40);
  let sg: f32 = M.p.y; let Lh: vec2f = M.l.xz; let Ly: f32 = M.l.y; let lhl: f32 = max(length(Lh), 1e-3);
  // down through the layer in level slices seven metres apart (long strides while nothing can be there): however flat the line of sight,
  // no crest is stepped over. Between two slices the cloud is taken to thicken evenly, so the slices leave no terraces
  var y: f32 = ${$0(b0.top)}; var T: f32 = 1.0; var dnp: f32 = 0.0; var tp: f32 = ${$0(b0.deck-b0.top)} / sth;
  var ts: f32 = 0.0; var ws: f32 = 0.0; var thn: f32 = 0.0;
  for (var i: i32 = 0; i < 72; i++) {
    let t: f32 = (${$0(b0.deck)} - y) / sth; let q: vec2f = dh * (cth * t) + M.w.xy;
    let d: vec2f = seaDens(q, y, seaLod(t), t);
    if (d.x + dnp > 0.0) {
      let tau: f32 = sg * (t - tp) * 0.5 * (d.x + dnp); let dT: f32 = exp(-tau); let w: f32 = T * (1.0 - dT);
      ts += w * (tp + (t - tp) / (2.0 + 0.6 * tau)); ws += w; thn += w * (1.0 - 0.5 * (d.x + dnp)); T *= dT;
    }
    if (T < 0.015 || y <= 0.0) { break; }
    dnp = d.x; tp = t; y = max(y - max(7.0, 0.6 * d.y), 0.0);
  }
  // where the eye comes to rest: that spot is lit (what is left over is the deck itself, whole under its top)
  let thin: f32 = smoothstep(0.45, 0.92, thn / max(ws, 1e-3));
  let tm: f32 = (ts + T * (${$0(b0.deck)} - y) / sth) / (ws + T);
  let ys: f32 = ${$0(b0.deck)} - sth * tm; let qs: vec2f = dh * (cth * tm) + M.w.xy;
  let lods: vec3f = seaLod(tm);
  let s0: vec4f = seaTop(qs, lods);
  // the sun: is there cloud in its way? What is near soaks the light up and passes it on; what is far simply throws a shadow
  var tn: f32 = 0.0; var tf: f32 = 0.0; var s: f32 = 0.0; var st: f32 = 24.0; var h1: f32 = s0.x;
  for (var j: i32 = 0; j < 7; j++) {
    s += st * 0.5;
    let tq: vec4f = seaTop(qs + Lh * s, vec3f(select(lods.x, 1.0, j > 4), select(lods.y, 1.0, j > 1), select(lods.z, 1.0, j > 3)));
    let dl: f32 = saturate(0.5 + (tq.x - (ys + Ly * s)) / select(36.0, 130.0, j > 4));
    if (j == 0) { h1 = tq.x; }
    if (j < 3) { tn += dl * st; } else { tf += dl * st; }
    s += st * 0.5; st *= 2.1;
  }
  // the lie of the top toward the sun: a flank turned to a low sun is bright, the level top only grazed
  let slope: f32 = (h1 - s0.x) / (12.0 * lhl);
  let lit: f32 = saturate(((Ly - slope * lhl) / sqrt(1.0 + slope * slope) + 0.3) / 1.3);
  let taun: f32 = tn * sg; let vis: f32 = exp(-0.014 * tf);
  // (a shred has no body to scatter in: seen with the sun behind you it is greyer than the deck, against the sun it gleams)
  let pw: f32 = 1.0 - 0.5 * thin;
  let open: f32 = smoothstep(-70.0, 50.0, ys - s0.y);
  // (light that went in on the sunlit side of a crown comes out again all round it: no shadow on cloud is as dark as one on snow)
  let lsun: f32 = vis * M.p.z * PI * (ph0 * exp(-taun) + 0.5 * ph1 * exp(-0.5 * taun)) * (0.5 + 0.5 * thin) + M.l.w * pw * (vis * lit / (1.0 + 0.11 * taun) + (1.0 - vis) * 0.03);
  let asky: f32 = 2.2 * (0.6 + 0.4 * open) * s0.w;
  let abnc: f32 = 0.15 * (1.0 - open) + 0.10 * thin + 0.03;
  o.color = vec4f(lsun, asky, abnc, tm * 0.001); return o; }
`,_o=(()=>{const e={NV:8,FL:14,names:["spruce","broad spruce","fir","giant","young","broken top","snag","flagged"],protoMs:0,buildMs:0},s=[2,1.25,.6],w=[.52,.36,.2],x=[.17,.155,.13],F=J=>Math.sqrt(Math.max(0,5.07*J*(1-J)*(1-.45*J)));function we(J,ae,X){const ke=D0(ae),C=s[J],ne=w[J],Be=x[J],Ee=[],je=[5,4,2][J];for(let Ge=0;Ge<je;Ge++){const Je=(Ge+.62+(ke()-.5)*.25)/(je+.25);Ee.push([Je*C,.03,(ke()-.5)*.08,.64*C/je*(.9+.3*ke()),Be*(.75+.45*ke())*(.65+.35*Math.sin(h0*Je)),.6*ne*F(Je)*(.85+.3*ke())+.05,1,0])}const $e=[3,2,1][J];for(let Ge=-1;Ge<=1;Ge+=2)for(let Je=0;Je<$e;Je++){const le=.28+.56*(Je+.5+(ke()-.5)*.4)/$e,Pe=ne*F(le),pe=Ge*(.6+.3*ke()),c=ke()>=X*.6,Ie=[le*C+.04*C,.02,Ge*Pe*(.62+.2*ke()),(.5+.2*ke())*Pe+.05,Be*(.6+.35*ke()),(.36+.1*ke())*Pe+.04,Math.cos(pe),Math.sin(pe)];c&&Ee.push(Ie)}if(Ee.push([.965*C,.015,0,.07*C+.03,Be*.55,.05*C+.035,1,0]),X>0){for(let Ge=Ee.length-2;Ge>=1;Ge--)ke()<X*.45&&Ee.splice(Ge,1);for(const Ge of Ee)Ge[4]*=1-.25*X,Ge[5]*=1-.18*X}const nt=Ee.map(Ge=>Math.max(Ge[3],Ge[5])+.16),Ke=ae%97;return{f:(Ge,Je,le)=>{let Pe=1e9;for(let pe=0;pe<Ee.length;pe++){const c=Ee[pe],Ie=Ge-c[0],he=le-c[2];if(Ie>nt[pe]||Ie<-nt[pe]||he>nt[pe]||he<-nt[pe])continue;const H=(Ie*c[6]+he*c[7])/c[3],z=(Je-c[1])/c[4],V=(he*c[6]-Ie*c[7])/c[5],I=Math.sqrt(H*H+z*z+V*V),Q=H/c[3],L=z/c[4],ye=V/c[5],Ve=Math.sqrt(Q*Q+L*L+ye*ye);Pe=N0.smin(Pe,Ve>1e-9?I*(I-1)/Ve:-c[4],.09)}return Pe<.2&&(Pe-=.034*es(Ge*2.3,Je*2.3,le*2.3,5+Ke)+.022*es(Ge*4.9,Je*4.9,le*4.9,6+Ke)+.01*es(Ge*10.3,Je*10.3,le*10.3,7)),N0.smax(Pe,-(Je+.02),.045)},L:C,W:ne,TH:Be,bmin:[-.2,-.16,-(ne+.26)],bmax:[C+.22,Be*1.55+.17,ne+.26]}}const Y=(J,ae,X,ke,C,ne,Be,Ee)=>{Ee[0]=mt(.15+.85*(.5*mt(J(ae+C*.07,X+ne*.07,ke+Be*.07)/.07)+.5*mt(J(ae+C*.22,X+ne*.22,ke+Be*.22)/.22))),Ee[1]=mt(.55*mt(J(ae,X+.14,ke)/.14)+.45*mt(J(ae,X+.4,ke)/.4))};function E(J,ae){const X=J.f,ke=qs(X,J.bmin,J.bmax,ae,{attr:($e,nt,Ke,Fe,Ge,Je,le)=>Y(X,$e,nt,Ke,Fe,Ge,Je,le),stride:2,repair:!0}),C=ke.verts,ne=new Int32Array(ke.nv).fill(-1),Be=[];for(let $e=0;$e<ke.ni;$e+=3){const nt=ke.idx[$e],Ke=ke.idx[$e+1],Fe=ke.idx[$e+2];C[nt*10+4]+C[Ke*10+4]+C[Fe*10+4]<-1.65&&Math.max(C[nt*10+1],C[Ke*10+1],C[Fe*10+1])<.012||Be.push(nt,Ke,Fe)}let Ee=0;for(const $e of Be)ne[$e]<0&&(ne[$e]=Ee++);const je=new Float32Array(Ee*8);for(let $e=0;$e<ke.nv;$e++){const nt=ne[$e];if(!(nt<0))for(let Ke=0;Ke<8;Ke++)je[nt*8+Ke]=C[$e*10+Ke]}return{n:Ee,V:je,I:Uint32Array.from(Be,$e=>ne[$e])}}function D(J,ae,X){const ke=J.f,C=-.04,ne=J.L+.1,Be=J.W+.14,Ee=(ae+1)*(X+1),je=new Float32Array(Ee*8),$e=new Uint8Array(Ee),nt=[],Ke=[0,0],Fe=J.bmax[1]-.02;for(let Pe=0;Pe<=X;Pe++)for(let pe=0;pe<=ae;pe++){const c=C+(ne-C)*pe/ae,Ie=-Be+2*Be*Pe/X,he=Pe*(ae+1)+pe,H=he*8;let z=Fe,V=!1;for(;z>-.02;z-=.022)if(ke(c,z,Ie)<0){V=!0;break}let I=0,Q=1,L=0,ye=.7,Ve=.8;if(V){let Ne=z,Ce=z+.022;for(let U=0;U<6;U++){const A=.5*(Ne+Ce);ke(c,A,Ie)<0?Ne=A:Ce=A}z=.5*(Ne+Ce);const Ye=.03,T=ke(c+Ye,z,Ie)-ke(c-Ye,z,Ie),Se=ke(c,z+Ye,Ie)-ke(c,z-Ye,Ie),me=ke(c,z,Ie+Ye)-ke(c,z,Ie-Ye),B=Math.hypot(T,Se,me)||1;if(I=T/B,Q=Se/B,L=me/B,Q<.15){Q=.15;const U=Math.hypot(I,Q,L);I/=U,Q/=U,L/=U}Y(ke,c,z,Ie,I,Q,L,Ke),ye=Ke[0],Ve=Ke[1],$e[he]=1}else z=-.02;je[H]=c,je[H+1]=z,je[H+2]=Ie,je[H+3]=I,je[H+4]=Q,je[H+5]=L,je[H+6]=ye,je[H+7]=Ve}for(let Pe=0;Pe<X;Pe++)for(let pe=0;pe<ae;pe++){const c=Pe*(ae+1)+pe,Ie=c+1,he=c+ae+1,H=he+1;$e[c]|$e[Ie]|$e[he]|$e[H]&&nt.push(c,he,Ie,Ie,he,H)}const Ge=new Int32Array(Ee).fill(-1);let Je=0;for(const Pe of nt)Ge[Pe]<0&&(Ge[Pe]=Je++);const le=new Float32Array(Je*8);for(let Pe=0;Pe<Ee;Pe++){const pe=Ge[Pe];if(pe>=0)for(let c=0;c<8;c++)le[pe*8+c]=je[Pe*8+c]}return{n:Je,V:le,I:Uint32Array.from(nt,Pe=>Ge[Pe])}}const be=5,ht=[.095,.08,.068],qe=[[10,6],[7,5],[4,4]];let se=null;function _(){const J=performance.now();se=[];for(let ae=0;ae<3;ae++){se.push([]);for(let X=0;X<be;X++){const ke=we(ae,211+ae*31+X*7,X<3?0:X===3?.55:1);se[ae].push([E(ke,ht[ae]),D(ke,qe[ae][0],qe[ae][1])])}}e.protoMs=performance.now()-J}const b=[{K:17,y0:.75,y1:9.35,R0:2.15,pw:.84,m0:6.4,m1:3.4,d0:.6,d1:.24,load:1,bare:.03,lean:.25},{K:15,y0:.85,y1:9.3,R0:2.5,pw:.9,m0:6,m1:3.2,d0:.5,d1:.2,load:.72,bare:.1,lean:.35},{K:19,y0:.65,y1:9.45,R0:1.75,pw:.74,m0:5.6,m1:3.3,d0:.72,d1:.34,load:1.08,bare:.02,lean:.2},{K:20,y0:1.75,y1:9.4,R0:2.7,pw:.8,m0:6.6,m1:3.5,d0:.66,d1:.24,load:.9,bare:.08,lean:.3},{K:9,y0:.7,y1:9,R0:2.55,pw:.92,m0:5.4,m1:3.2,d0:.42,d1:.2,load:1,bare:0,lean:.5},{K:14,y0:.85,y1:7.35,R0:2.35,pw:.8,m0:6.2,m1:4.2,d0:.58,d1:.3,load:.85,bare:.12,lean:.3,broken:7.75},{K:9,y0:2.4,y1:7.6,R0:1,pw:.5,m0:2.2,m1:1.6,d0:.25,d1:.1,load:.8,bare:.25,lean:.6,snag:!0,broken:8.3},{K:14,y0:.45,y1:8.7,R0:2.4,pw:.66,m0:9,m1:5.6,d0:.4,d1:.16,load:.95,bare:.05,lean:.12,flag:!0,broken:9.1}];e.KIND=b;function re(J){const ae=b[J],X=D0(9e3+J*131),ke=[],C=X()*It,ne=ae.lean*(.5+.5*X()),Be=Math.cos(C)*ne,Ee=Math.sin(C)*ne,je=C+2+X()*2,$e=Math.cos(je)*ne*.6,nt=Math.sin(je)*ne*.6,Ke=ae.broken||9.95,Fe=ae.flag?Je=>{const le=it(Je,0,10)/10,Pe=ge(6.2,9.4,Je);return[Be*le*le+1.2*Pe*Pe+.08*Math.sin(Je*1.7),Ee*le*le+.1*Math.sin(Je*1.3+1)]}:Je=>{const le=it(Je,0,10)/10,Pe=Math.sin(le*h0);return[Be*le*le+$e*Pe*le,Ee*le*le+nt*Pe*le]},Ge=Je=>ae.R0*Math.pow(Math.max(.02,1-Je/(ae.broken?9.6:10.15)),ae.pw)+.14;for(let Je=0;Je<ae.K;Je++){const le=Je/(ae.K-1),Pe=ae.y0+(ae.y1-ae.y0)*Math.pow(le,.92)+(Je>0&&Je<ae.K-1?(X()-.5)*.16:0),pe=Ge(Pe)*(.92+.16*X()),c=Math.max(2,Math.round(Re(ae.m0,ae.m1,le)+(X()-.5)*.9)),Ie=Je*2.4+X()*.8,he=ae.flag?1-ge(.9,1.6,Pe):0,H=ae.flag?ge(1.2,1.9,Pe)*(1-ge(3.2,4.4,Pe)):0,z=ae.flag?.55+.75*X():1;for(let V=0;V<c;V++){const I=X(),Q=X(),L=X(),ye=X(),Ve=X(),Ne=X(),Ce=X(),Ye=X();if(Ce<ae.bare)continue;let T=Ie+(V+(I-.5)*.6)*It/c,Se=pe*(.6+.5*Q);if(Ye<.08?Se=Math.min(Se*1.22,ae.R0*1.2):Ye>.93&&(Se*=.6),ae.snag&&(Se=.35+.75*Q),ae.flag){const ie=Math.cos(T),ce=Re(ge(-.35,.5,ie),1,he);if(Ce>.05+.95*ce*(1-.65*H))continue;T=Math.atan2(Math.sin(T),ie+(1-he)*1.8*(1+ie)),Se*=z*Re(.2+.95*ge(0,.9,Math.cos(T)),.55+.25*Q,he)}const me=Pe+(L-.5)*.24,B=.12+.16*ye;let U=Re(ae.d0,ae.d1,le)*(.8+.45*Ve);U=Math.min(U,(me+.28)/Se);const A=Math.max(.15,Se*(.26+.08*Ne)),a=Se>=1.5?0:Se>=.82?1:2,oe=X(),fe=ae.load-.35*(ae.y0>1.5&&Je<2?1:0),O=oe<fe-.28?Math.floor(X()*3):oe<fe+.05?3:4;ke.push({id:ke.length,a:T,ca:Math.cos(T),sa:Math.sin(T),L:Se,W:A,y0:me,rise:B,k2:(B+U)/Se,cls:a,pw:O,flip:X()<.5?-1:1,th:(.85+.4*X())*Math.min(ae.load,1.1)*(ae.snag?.7:1),u:le,tier:Je,cur:.5+.5*X()})}}if(!ae.snag)for(let Je=0;Je<(ae.broken?4:3);Je++){const le=ae.flag?(X()-.5)*1.6:X()*It,Pe=ae.flag?.4+.5*X():ae.broken?.75+.4*X():.26+.16*X(),pe=ae.broken?ae.broken-.5-.3*X():9.42+.14*Je;ke.push({id:ke.length,a:le,ca:Math.cos(le),sa:Math.sin(le),L:Pe,W:Math.max(.15,Pe*.34),y0:pe,rise:ae.broken?.55:.2,k2:ae.broken?.25/Pe:.5/Pe,cls:(ae.broken,2),pw:Math.floor(X()*3),flip:1,th:.9,u:1,tier:ae.K,cur:.3})}return{B:ke,axis:Fe,crown:Ge,top:Ke,Q:ae}}function m(J,ae){const X=re(J),ke=X.B,C=X.Q,ne=e.FL;let Be=0,Ee=0;const je=[[7,5,3],[4,3,2]][ae],$e=ae?7:15,nt=ae?5:8,Ke=Math.ceil($e*(X.top/10))+1;for(const c of ke){const Ie=se[c.cls][c.pw][ae];if(Be+=Ie.n,Ee+=Ie.I.length,!C.snag){const he=je[c.cls];Be+=(he+1)*3,Ee+=he*12,(c.cls<2||ae===0)&&(Be+=(he+1)*2,Ee+=he*6),ae===0&&c.cls<2&&(Be+=6*(c.cls===0?2:1),Ee+=12*(c.cls===0?2:1))}}Be+=Ke*(nt+1)+1,Ee+=(Ke-1)*nt*6+nt*3;const Fe=new Float32Array(Be*ne),Ge=new Uint32Array(Ee);let Je=0,le=0;const Pe=(c,Ie,he,H,z,V,I,Q,L,ye,Ve,Ne,Ce,Ye)=>{const T=Je*ne;return Fe[T]=c,Fe[T+1]=Ie,Fe[T+2]=he,Fe[T+3]=H,Fe[T+4]=z,Fe[T+5]=V,Fe[T+6]=I,Fe[T+7]=Q,Fe[T+8]=L,Fe[T+9]=ye,Fe[T+10]=Ve,Fe[T+11]=Ne,Fe[T+12]=Ce,Fe[T+13]=Ye,Je++},pe=(c,Ie)=>ge(.25,.9,c/X.crown(Ie));for(const c of ke){const Ie=se[c.cls][c.pw][ae],he=c.L/s[c.cls],H=c.W/w[c.cls]*c.flip,z=c.th,V=X.axis(c.y0),I=Je,Q=.38/c.W;for(let T=0;T<Ie.n;T++){const Se=T*8,me=Ie.V[Se]*he,B=Ie.V[Se+2]*H,U=Ie.V[Se+1]*z,A=c.rise-2*c.k2*me,a=-2*Q*B,oe=c.y0+c.rise*me-c.k2*me*me-Q*B*B+U;let fe=Ie.V[Se+3]/he,O=Ie.V[Se+4]/z,ie=Ie.V[Se+5]/H;fe-=A*O,ie-=a*O;const ce=1/(Math.sqrt(fe*fe+O*O+ie*ie)||1),He=pe(me,oe);Pe(V[0]+me*c.ca-B*c.sa,oe,V[1]+me*c.sa+B*c.ca,(fe*c.ca-ie*c.sa)*ce,O*ce,(fe*c.sa+ie*c.ca)*ce,0,Ie.V[Se+6]*Re(.5,1,He),Ie.V[Se+7]*Re(.3,1,He),c.id,Math.max(U,0),0,ae,me)}if(c.flip>0)for(let T=0;T<Ie.I.length;T++)Ge[le++]=I+Ie.I[T];else for(let T=0;T<Ie.I.length;T+=3)Ge[le++]=I+Ie.I[T],Ge[le++]=I+Ie.I[T+2],Ge[le++]=I+Ie.I[T+1];if(C.snag)continue;const L=je[c.cls],ye=1.22*c.W,Ve=.02,Ne=1.09,Ce=Je,Ye=T=>{const Se=T*c.L;return[Se,c.y0+c.rise*Se-c.k2*Se*Se-.03,c.rise-2*c.k2*Se]};for(let T=0;T<=L;T++){const Se=Ve+(Ne-Ve)*T/L,me=Ye(Se),B=me[0],U=ye*F(Math.min(Se/1.06,1))*(Se>1?.5:1)+.07,A=pe(B,me[1]);for(let a=-1;a<=1;a++){const oe=a*U,fe=me[1]-Q*oe*oe*(a?1.15:1);let O=-me[2],ie=2*Q*oe*1.15,ce=1/Math.sqrt(O*O+1+ie*ie);Pe(V[0]+B*c.ca-oe*c.sa,fe,V[1]+B*c.sa+oe*c.ca,(O*c.ca-ie*c.sa)*ce,ce,(O*c.sa+ie*c.ca)*ce,1,Re(.35,.8,A),Re(.15,.9,A),c.id,B,oe,Math.abs(a),B)}}for(let T=0;T<L;T++)for(let Se=0;Se<2;Se++){const me=Ce+T*3+Se,B=me+3;Ge[le++]=me,Ge[le++]=me+1,Ge[le++]=B,Ge[le++]=me+1,Ge[le++]=B+1,Ge[le++]=B}if(c.cls<2||ae===0){const T=Je,Se=(.16+.2*c.cur)*Math.sqrt(c.L)*(c.cls===2?.8:1);for(let me=0;me<=L;me++){const B=.1+.92*me/L,U=Ye(B),A=U[0],a=Se*(.35+.65*Math.sin(h0*Math.min(1,B*.9+.08))),oe=pe(A,U[1]);for(let fe=0;fe<2;fe++)Pe(V[0]+A*c.ca,U[1]-fe*a,V[1]+A*c.sa,-c.sa,0,c.ca,2,Re(.3,.7,oe),Re(.1,.5,oe),c.id,A,fe*a,fe,A)}for(let me=0;me<L;me++){const B=T+me*2,U=B+2;Ge[le++]=B,Ge[le++]=B+1,Ge[le++]=U,Ge[le++]=B+1,Ge[le++]=U+1,Ge[le++]=U}}if(ae===0&&c.cls<2)for(let T=0;T<(c.cls===0?2:1);T++){const Se=c.cls===0?T?.86:.52:.72,me=Ye(Se),B=me[0],U=ye*F(Se)*.95,A=(.14+.16*c.cur)*Math.sqrt(c.L),a=pe(B,me[1]),oe=Je;for(let fe=-1;fe<=1;fe++)for(let O=0;O<2;O++){const ie=fe*U,ce=me[1]-Q*ie*ie-O*A*(fe?.7:1);Pe(V[0]+B*c.ca-ie*c.sa,ce,V[1]+B*c.sa+ie*c.ca,c.ca,.3,c.sa,2,Re(.3,.7,a),Re(.1,.5,a),c.id,ie+7*T+c.id,O*A,O,B)}for(let fe=0;fe<2;fe++){const O=oe+fe*2,ie=O+2;Ge[le++]=O,Ge[le++]=O+1,Ge[le++]=ie,Ge[le++]=O+1,Ge[le++]=ie+1,Ge[le++]=ie}}}{const c=Je,Ie=C.snag?.19:.17;for(let V=0;V<Ke;V++){const I=-1.4+(X.top+1.4)*V/(Ke-1),Q=X.axis(I),L=Re(Ie,C.broken?.07:.022,mt(I/X.top))*(I<.6?1+.5*(.6-Math.max(I,-.4)):1),ye=mt(I/10);for(let Ve=0;Ve<=nt;Ve++){const Ne=Ve*It/nt,Ce=Math.cos(Ne),Ye=Math.sin(Ne);Pe(Q[0]+Ce*L,I,Q[1]+Ye*L,Ce,.1,Ye,3,C.snag?.9:Re(.35,.8,ye*ye),C.snag?.8:Re(.1,.7,ye*ye),-1,Ne*L,I,0,0)}}for(let V=0;V<Ke-1;V++)for(let I=0;I<nt;I++){const Q=c+V*(nt+1)+I,L=Q+nt+1;Ge[le++]=Q,Ge[le++]=L,Ge[le++]=Q+1,Ge[le++]=Q+1,Ge[le++]=L,Ge[le++]=L+1}const he=X.axis(X.top),H=Pe(he[0],X.top+(C.broken?.12:.02),he[1],0,1,0,3,.9,1,-1,0,X.top,0,0),z=c+(Ke-1)*(nt+1);for(let V=0;V<nt;V++)Ge[le++]=z+V,Ge[le++]=H,Ge[le++]=z+V+1}if(Je!==Be||le!==Ee)throw new Error("tree mesh count "+Je+"/"+Be+" "+le+"/"+Ee);return{V:Fe,I:Ge,nv:Be,ni:Ee,S:X}}return e.buildAll=function(){se||_();const J=performance.now(),ae=[];for(let X=0;X<e.NV;X++)ae.push([m(X,0),m(X,1)]),e.kinds[X]=ae[X][0].S;return e.buildMs=performance.now()-J,ae},e.kinds=[],e.env=F,e})(),os=(()=>{const e=_o,s={NV:e.NV,NK:12,r0:14,w0:3.5,max0:8,r1:48,w1:8,max1:72,far:460,maxFar:6144,tileW:128,tileH:256,ss:2,pitch:.12,enabled:!0,life:1,stats:{near:0,far:0,tris:0,fading:0,out:0,l0:0,l1:0,drawn:0,shadow:0,parts:0}},w=-.9,x=10.45,F=3.6,we=4,Y=[];let E,D,be,ht,qe,se,_,b,re,m,J,ae,X,ke=!1;const C=[],ne=[];let Be=new Map,Ee=new Map,je,$e,nt=0,Ke=!1;const Fe=()=>s.max0+6,Ge=()=>s.max1+24,Je=8;s.init=function(o){E=o;const p=e.buildAll();for(let ve=0;ve<s.NV;ve++){C.push([]),ne.push([]);for(let xe=0;xe<2;xe++){const De=p[ve][xe];C[ve].push({vb:E.buffer(De.V,"vertex"),ib:E.buffer(De.I,"index"),count:De.ni});const Te=xe?Ge():Fe(),Me=new Float32Array(Te*16),rt=new Float32Array(Je*16);ne[ve].push({cap:Te,cpu:Me,buf:E.buffer(Me,"vertex",!0),n:0,solid:0,gcpu:rt,gbuf:E.buffer(rt,"vertex",!0),gn:0}),s.stats.tris+=De.ni/3}{const xe=p[ve][1],De=xe.V;let Te=0;for(let Me=0;Me<xe.nv;Me++){const rt=Me*e.FL;De[rt+1]>w&&(Te=Math.max(Te,Math.hypot(De[rt],De[rt+2])))}Y.push(Te+.22)}}je=new Float32Array(s.maxFar*12),$e=E.buffer(je,"vertex",!0),ye=new Float32Array(z*8),Ve=E.buffer(ye,"vertex",!0);const i={attrs:[["pos","vec3f"],["nrm","vec3f"],["mat","vec4f"],["tx","vec4f"]]},y={instanced:!0,attrs:[["i0","vec4f"],["i1","vec4f"],["i2","vec4f"],["i3","vec4f"]]},j="let t: TreeV = treeVertex(a.pos, a.nrm, a.mat, a.tx, a.i0, a.i1, a.i2, a.i3, M.p.x);",W=ve=>`fn vert(a: VIn) -> VOut { var v: VOut; ${j} v.wp = t.wp; v.nrm = t.n; v.bp = a.pos; v.mat = a.mat; v.tx = vec4f(t.hh, a.tx.yzw);
        let gq: f32 = floor(a.i3.x * 0.5); v.ex = vec4f(a.i1.z, a.i1.w, a.i3.x - 2.0 * gq, gq / 255.0);
        // (load, size; and for the tree's own shade beyond the sun's map: how far the point stands from the stem toward the sun, how wide the crown is)
        v.iv = vec4f(a.i2.w, a.i0.w, dot(t.wp.xz - a.i0.xz, normalize(U.sunDir.xz + vec2f(1e-5, 0.0))), M.p.y * a.i2.z * a.i0.w);
        v.clip = U.viewProj * vec4f(t.wp, 1.0);${ve?" v.clip.z = v.clip.z - 0.00003 * v.clip.w;":""} return v; }`,h={lib:[St.common,St.hash,St.fog,St.shadow,St.tonemap,ya,Ws,ra],buffers:[i,y],cull:"none",varyings:{wp:"vec3f",nrm:"vec3f",bp:"vec3f",mat:"vec4f",tx:"vec4f",ex:"vec4f",iv:"vec4f"},uniforms:{p:"vec4f"},textures:{tDetail:"2d",tShadow:"shadow",tSky:"2d"}},n=ve=>$o.replace("GHOST_OUT",ve).replace("V0F",w.toFixed(2)).replace("DVF",(x-w).toFixed(2));D=E.pipeline(Object.assign({name:"tree",vs:W(!1),fs:n("o.color = vec4f(col, 1.0);")},h)),re=E.pipeline({name:"treeGhostZ",lib:[St.common,St.hash,ya,Ws,ra],buffers:[i,y],cull:"none",varyings:{wp:"vec3f",nrm:"vec3f",mat:"vec4f",tx:"vec4f",iv:"vec4f"},uniforms:{p:"vec4f"},textures:{},colorMask:!1,vs:`fn vert(a: VIn) -> VOut { var v: VOut; ${j} v.wp = t.wp; v.nrm = t.n; v.mat = a.mat; v.tx = vec4f(t.hh, a.tx.yzw); v.iv = vec4f(a.i2.w, a.i0.w, 0.0, 0.0); v.clip = U.viewProj * vec4f(t.wp, 1.0); return v; }`,fs:`fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0); let V: vec3f = normalize(U.camPos.xyz - v.wp);${ka("v.wp","V")}
        if (treeCut(v.mat, v.tx, fw, snowLine(v.iv.x)) < 0.5) { discard; } return o; }`}),m=E.pipeline(Object.assign({name:"treeGhost",depthFunc:"lequal",depthWrite:!1,blend:"premul",vs:W(!0),fs:n("o.color = vec4f(col * v.ex.w, v.ex.w);")},h)),be=E.pipeline({name:"treeShadow",lib:[St.common,St.hash,ya,Ws,ra],buffers:[i,y],varyings:{mat:"vec4f",tx:"vec4f",iv:"vec4f"},uniforms:{p:"vec4f"},textures:{},colorFormat:null,cull:"none",depthBias:2,depthBiasSlope:2.5,vs:`fn vert(a: VIn) -> VOut { var v: VOut; ${j} v.mat = a.mat; v.tx = vec4f(t.hh, a.tx.yzw); v.iv = vec4f(a.i2.w, a.i0.w, 0.0, 0.0); v.clip = U.shadowVP * vec4f(t.wp, 1.0); return v; }`,fs:"fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0); if (treeCut(v.mat, v.tx, 0.07, snowLine(v.iv.x)) < 0.5) { discard; } return o; }"});const d=s.tileW*s.NK,M=s.tileH*s.NV,g=s.ss;ae=E.texture({w:d,h:M,format:"rgba8",filter:"linear",wrap:"clamp",mips:!0}),X=E.texture({w:d,h:M,format:"rgba8",filter:"linear",wrap:"clamp",mips:!0}),s.atlasA=ae,s.atlasB=X,ht=E.pipeline({name:"treeBake",lib:[St.common,St.hash,Ws,ra],buffers:[i],varyings:{nrm:"vec3f",bp:"vec3f",mat:"vec4f",tx:"vec4f",cl:"vec4f"},uniforms:{a:"vec4f",r:"vec4f",m:"vec4f"},textures:{tDetail:"2d"},colorFormat:"rgba8",cull:"none",vs:`fn vert(a: VIn) -> VOut { var v: VOut;
        let rt: vec3f = vec3f(M.a.x, 0.0, -M.a.y); let c: vec3f = vec3f(M.a.y, 0.0, M.a.x);
        let d: f32 = dot(a.pos, c);
        let u: f32 = dot(a.pos, rt) / M.m.y; let w: f32 = (a.pos.y - d * M.a.w / M.a.z - ${((w+x)/2).toFixed(3)}) / ${((x-w)/2).toFixed(3)};
        v.clip = vec4f(M.r.x + u * M.r.z, M.r.y + w * M.r.w, 0.5 - (d * M.a.z + a.pos.y * M.a.w) * 0.03, 1.0);
        v.nrm = a.nrm; v.bp = a.pos; v.mat = a.mat; v.tx = a.tx; v.cl = vec4f(u, w, d, 0.0); return v; }`,fs:`fn frag(v: VOut) -> FOut { var o: FOut;
        if (max(abs(v.cl.x), abs(v.cl.y)) > 1.0) { discard; }
        let x: vec3f = vec3f(M.a.x, 0.0, -M.a.y); let z: vec3f = vec3f(M.a.y * M.a.z, M.a.w, M.a.x * M.a.z); let y: vec3f = cross(z, x);${ka("v.bp","z")}
        var N: vec3f = N0; if (fc < 0.0) { N = -N0; }
        let n1: vec4f = tex(tDetail, v.bp.xz * 0.23 + v.bp.yy * vec2f(0.17, 0.11) + 0.5);
        let n2: vec4f = tex(tDetail, v.bp.xy * 1.9 + v.bp.zz * vec2f(1.3, 1.7));
        let ln: f32 = snowLine(1.0);
        if (treeCut(v.mat, v.tx, fw, ln + (n1.z - 0.5) * 0.03) < 0.5) { discard; }
        let s: TreeS = treeSurface(v.mat, v.tx, N, n1, n2, ln, 1.0, 0.0, fw);
        if (M.m.x < 0.5) { o.color = vec4f(dot(s.N, x) * 0.5 + 0.5, dot(s.N, y) * 0.5 + 0.5, saturate(0.5 + v.cl.z / ${(2*F).toFixed(2)}), 1.0); }
        else { o.color = vec4f(s.snow, s.ao * (0.3 + 0.7 * s.open), select(1.0, saturate(v.tx.x / 0.16), v.mat.x < 0.5), s.bark); }
        return o; }`}),qe=E.pipeline({name:"treeDown",lib:[St.common],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f"},textures:{tSrc:"fetch",tCov:"fetch"},colorFormat:"rgba8",depth:!1,depthTest:!1,cull:"none",vs:as,fs:`fn frag(v: VOut) -> FOut { var o: FOut;
        let p: vec2i = vec2i(v.clip.xy); let y0: i32 = i32(M.p.x) * ${s.tileH};
        if (p.y < y0 || p.y >= y0 + ${s.tileH}) { discard; }
        let q: vec2i = vec2i(p.x, p.y - y0) * ${g};
        var s: vec4f = vec4f(0.0); var n: f32 = 0.0;
        for (var j: i32 = 0; j < ${g}; j++) { for (var i: i32 = 0; i < ${g}; i++) {
          let c: vec4f = texFetch(tSrc, q + vec2i(i, j), 0); let w: f32 = texFetch(tCov, q + vec2i(i, j), 0).a;
          s += c * w; n += w;
        } }
        o.color = vec4f(0.0);
        if (n < 0.5) { return o; }
        s = s / n;
        // (first atlas: alpha = the share of the texel the tree fills, lifted into the upper half. Below a half is outside: see treeDilate)
        o.color = select(vec4f(s.rgb, 0.5 + 0.5 * n / ${(g*g).toFixed(1)}), s, M.p.y > 0.5);
        return o; }`});const R=ve=>`fn vert(a: VIn) -> VOut { var v: VOut;
        let cx: f32 = f32(a.vid & 1u); let cy: f32 = f32(a.vid >> 1u) * ${(1/we).toFixed(4)};
        let sc: f32 = a.i0.w; let vr: f32 = floor(a.i1.w); let fade: f32 = (a.i1.w - vr) / 0.98;
        ${ve?"let dh: vec2f = normalize(U.sunDir.xz + vec2f(1e-5, 0.0));":"let dh: vec2f = normalize(U.camPos.xz - a.i0.xz);"}
        // which photographs: the direction of the viewer (or the sun) in the tree's own frame
        let dl: vec2f = vec2f(dh.x * a.i1.x - dh.y * a.i1.y, dh.x * a.i1.y + dh.y * a.i1.x);
        let ang: f32 = atan2(dl.x, dl.y) / ${(It/s.NK).toFixed(6)} + ${s.NK}.0;
        let k0: f32 = floor(ang); let fr: f32 = ang - k0;
        let rt: vec3f = vec3f(dh.y, 0.0, -dh.x);
        let uu: f32 = cx * 2.0 - 1.0; let vv: f32 = mix(${w.toFixed(2)}, ${x.toFixed(2)}, cy); let q: f32 = saturate(vv * 0.1);
        // (the card leans as the tree does: it is a strip, bent in ${we} pieces)
        let ln: vec2f = a.i2.xy * (q * q * 10.0 * sc);
        let wp: vec3f = a.i0.xyz + rt * (uu * a.i2.z * sc) + vec3f(ln.x, vv * sc, ln.y);
        v.clip = ${ve?"U.shadowVP":"U.viewProj"} * vec4f(wp, 1.0);
        v.uv = vec2f(cx, 1.0 - cy);
        v.vw = vec4f(k0 - ${s.NK}.0 * floor(k0 / ${s.NK}.0), (k0 + 1.0) - ${s.NK}.0 * floor((k0 + 1.0) / ${s.NK}.0), smoothstep(0.15, 0.85, fr), vr);
        ${ve?"":`v.wp = wp;
        let dist: f32 = length(U.camPos.xyz - a.i0.xyz);
        v.ex = vec4f(a.i1.x, a.i1.y, fade, clamp(log2(${(s.tileH/(x-w)).toFixed(3)} / sc * dist * 2.0 * U.camRight.w / U.res.y), 0.0, 5.0));
        // how much forest stands between this tree and the sun (the terrain keeps the density of the trees on its coarse map)
        let Lh: vec2f = normalize(U.sunDir.xz + vec2f(1e-5, 0.0));
        let den: f32 = (texLod(tDen, (a.i0.xz + Lh * 9.0) * M.t.x + M.t.yz, 0.0).w + texLod(tDen, (a.i0.xz + Lh * 24.0) * M.t.x + M.t.yz, 0.0).w) * 0.5 * M.t.w;
        v.fx = vec4f(sc, a.i2.z * sc, a.i2.w, 8.5 * den);
        // the lie of the ground round the foot (the same map keeps its slope): height = dot(gp.xy, xz) + gp.z
        let gs: vec2f = texLod(tDen, a.i0.xz * M.t.x + M.t.yz, 0.0).xy * M.t.w;
        v.gp = vec4f(gs, a.i0.y + 0.10 * sc - dot(gs, a.i0.xz), 0.0);`}
        return v; }`,Ue={instanced:!0,attrs:[["i0","vec4f"],["i1","vec4f"],["i2","vec4f"]]},$=ve=>ve.replace(/NKF/g,s.NK+".0").replace(/NVF/g,s.NV+".0").replace(/PITCH_C/g,Math.cos(s.pitch).toFixed(5)).replace(/PITCH_S/g,Math.sin(s.pitch).toFixed(5)).replace(/PITCH_T/g,Math.tan(s.pitch).toFixed(5)).replace(/KSTEP/g,(It/s.NK).toFixed(6)).replace(/DR2/g,(2*F).toFixed(2));_=E.pipeline({name:"treeCard",lib:[St.common,St.hash,St.fog,St.shadow,St.tonemap,Ws],buffers:[Ue],topology:"strip",cull:"none",varyings:{wp:"vec3f",uv:"vec2f",vw:"vec4f",ex:"vec4f",fx:"vec4f",gp:"vec4f"},uniforms:{t:"vec4f"},textures:{tA:"2d",tB:"2d",tShadow:"shadow",tSky:"2d",tDen:"2d"},vs:R(!1),fs:$(Go)}),b=E.pipeline({name:"treeCardShadow",lib:[St.common],buffers:[Ue],topology:"strip",cull:"none",varyings:{uv:"vec2f",vw:"vec4f"},uniforms:{p:"vec4f"},textures:{tA:"2d"},colorFormat:null,depthBias:2,depthBiasSlope:2,vs:R(!0),fs:`fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0);
        let k: f32 = select(v.vw.x, v.vw.y, v.vw.z > 0.5);
        if (texLod(tA, vec2f((k + v.uv.x) / ${s.NK}.0, (v.vw.w + v.uv.y) / ${s.NV}.0), 1.0).a < 0.62) { discard; }
        return o; }`}),se=E.pipeline({name:"treeDilate",lib:[St.common],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f"},textures:{tSrc:"fetch",tCov:"fetch"},colorFormat:"rgba8",depth:!1,depthTest:!1,cull:"none",vs:as,fs:`fn frag(v: VOut) -> FOut { var o: FOut;
        let p: vec2i = vec2i(v.clip.xy); let tl: vec2i = vec2i(${s.tileW}, ${s.tileH}); let t0: vec2i = (p / tl) * tl; let t1: vec2i = t0 + tl - vec2i(1, 1);
        let c: vec4f = texFetch(tSrc, p, 0);
        o.color = c;
        if (texFetch(tCov, p, 0).a > 0.0) { return o; }
        var s: vec4f = vec4f(0.0); var n: f32 = 0.0; var am: f32 = 0.0;
        for (var j: i32 = -1; j <= 1; j++) { for (var i: i32 = -1; i <= 1; i++) {
          let q: vec2i = clamp(p + vec2i(i, j), t0, t1);
          let ca: f32 = texFetch(tCov, q, 0).a; let w: f32 = step(0.001, ca);
          s += texFetch(tSrc, q, 0) * w; n += w; am = max(am, ca);
        } }
        if (n < 0.5) { return o; }
        s = s / n;
        o.color = mix(vec4f(s.rgb, max(min(am, 0.5) - 0.07, 0.004)), s, M.p.x);
        return o; }`}),J=E.pipeline({name:"treeDust",lib:[St.common,St.hash,St.fog,St.shadow],buffers:[{instanced:!0,attrs:[["i0","vec4f"],["i1","vec4f"]]}],topology:"strip",cull:"none",blend:"premul",depthWrite:!1,varyings:{uv:"vec4f",c:"vec4f",wp:"vec3f"},uniforms:{p:"vec4f"},textures:{tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:`fn vert(a: VIn) -> VOut { var v: VOut;
        let c: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
        // (never smaller than a pixel: a grain too far off to be seen as a grain is a little of the pixel it is in)
        let px: f32 = length(U.camPos.xyz - a.i0.xyz) * U.camRight.w * 2.0 * U.res.w;
        let r: f32 = max(a.i0.w, px * 0.8); let k: f32 = sq(a.i0.w / r);
        let wp: vec3f = a.i0.xyz + U.camRight.xyz * (c.x * r) + U.camUp.xyz * (c.y * r) + vec3f(0.0, c.y * a.i1.w, 0.0);
        let sort: f32 = floor(a.i1.y);
        v.clip = U.viewProj * vec4f(wp, 1.0); v.uv = vec4f(c, sort, 0.0); v.wp = a.i0.xyz;
        // (under a tree a little of the sun still finds it: a crown is full of holes)
        v.c = vec4f(a.i1.x * k, a.i1.y - sort, a.i1.z * mix(k, 1.0, 0.4), 0.12 + 0.88 * shadowFast(a.i0.xyz, 0.0004));
        return v; }`,fs:`fn frag(v: VOut) -> FOut { var o: FOut;
        let r2: f32 = dot(v.uv.xy, v.uv.xy); if (r2 > 1.0) { discard; }
        let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
        let mu: f32 = dot(-V, U.sunDir.xyz);
        // a grain is a speck with an edge; a clump is solid and ragged; a puff of dust or of the curtain has no edge at all, and is never round
        let nz: f32 = tex(tDetail, v.uv.xy * 0.19 + vec2f(v.c.y * 7.3, v.c.y * 3.1)).z;
        var fo: f32 = smoothstep(1.0, 0.35, r2);
        if (v.uv.z < 0.5 || v.uv.z > 3.5) { fo = sq(1.0 - r2) * saturate(0.25 + 1.5 * nz - 0.5 * r2); }
        if (abs(v.uv.z - 2.0) < 0.5) { fo = smoothstep(1.0, 0.3, r2 + (0.5 - nz) * 0.8); }
        let near: f32 = smoothstep(0.5, 1.8, dist);
        let a: f32 = v.c.x * fo * near;
        // snow in the air is as white as snow on the ground, brighter still where the sun comes through it toward the lens, and the blue
        // of the sky in shade
        let sun: vec3f = U.sunCol.rgb * (v.c.w * cloudShade(v.wp));
        var col: vec3f = vec3f(0.93, 0.955, 0.985) * (sun * (0.80 + 1.3 * hg(mu, 0.6)) + U.ambSky.rgb + U.ambGnd.rgb * 0.4 + lampLight(v.wp) * 2.5);
        col = applyFog(col, v.wp);
        // a crystal here and there turns a face to the sun for an instant
        let tw: f32 = hash11(v.c.y * 4096.0 + floor(U.camPos.w * 13.0 + v.c.y * 37.0) * 7.0);
        let glint: vec3f = (sun + lampLight(v.wp) * 6.0) * (v.c.z * pow(tw, 24.0) * 9.0 * exp(-r2 * 7.0) * near);
        o.color = vec4f(col * a + glint, a);
        return o; }`}),s.pipes=[D,be,ht,qe,se,_,b,re,m,J]},s.bake=function(){const o=performance.now(),p=s.ss,i=s.tileW*s.NK*p,y=s.tileH*p,j=E.texture({w:i,h:y,format:"rgba8",filter:"nearest",wrap:"clamp"}),W=E.texture({w:i,h:y,format:"rgba8",filter:"nearest",wrap:"clamp"}),h=E.texture({w:i,h:y,format:"depth",filter:"nearest"}),n=E.target({color:j,depth:h}),d=E.target({color:W,depth:h}),M=E.target({color:ae}),g=E.target({color:X}),R=Math.cos(s.pitch),Ue=Math.sin(s.pitch);for(let $=0;$<s.NV;$++){const ve=C[$][1];for(let xe=0;xe<2;xe++){E.beginPass(xe?d:n,{color:[0,0,0,0],depth:1});for(let De=0;De<s.NK;De++){const Te=De*It/s.NK;E.draw(ht,{u:{a:[Math.cos(Te),Math.sin(Te),R,Ue],r:[(De+.5)/s.NK*2-1,0,1/s.NK,1],m:[xe,Y[$],0,0]},tex:{tDetail:c0.detail},vb:[ve.vb],ib:ve.ib,count:ve.count})}E.endPass()}E.beginPass(M,$?{}:{color:[0,0,0,0]}),E.draw(qe,{u:{p:[$,0,0,0]},tex:{tSrc:j,tCov:j},count:3}),E.endPass(),E.beginPass(g,$?{}:{color:[0,0,0,0]}),E.draw(qe,{u:{p:[$,1,0,0]},tex:{tSrc:W,tCov:j},count:3}),E.endPass()}E.destroyTarget(n),E.destroyTarget(d),E.destroyTarget(M),E.destroyTarget(g),E.destroyTexture(j),E.destroyTexture(W),E.destroyTexture(h);{const $=E.texture({w:ae.w,h:ae.h,format:"rgba8",filter:"nearest",wrap:"clamp"}),ve=E.texture({w:ae.w,h:ae.h,format:"rgba8",filter:"nearest",wrap:"clamp"});let xe=ae,De=X,Te=$,Me=ve;for(let rt=0;rt<6;rt++){const wt=E.target({color:Te}),Ze=E.target({color:Me});E.beginPass(wt,{color:[0,0,0,0]}),E.draw(se,{u:{p:[0,0,0,0]},tex:{tSrc:xe,tCov:xe},count:3}),E.endPass(),E.beginPass(Ze,{color:[0,0,0,0]}),E.draw(se,{u:{p:[1,0,0,0]},tex:{tSrc:De,tCov:xe},count:3}),E.endPass(),E.destroyTarget(wt),E.destroyTarget(Ze);let ct=xe;xe=Te,Te=ct,ct=De,De=Me,Me=ct}E.destroyTexture($),E.destroyTexture(ve)}E.genMips(ae),E.genMips(X),ke=!0,s.bakeMs=performance.now()-o};const le=8,Pe=le*Es,pe=12,c=new Map,Ie={};Dt.def("rtree","山脊树",[["a","现在的"],["b","风旗云杉"]],"b"),Dt.on(o=>{o==="rtree"&&c.clear()});function he(o,p,i,y,j,W,h,n,d){const M=ta(Math.floor(i*8),Math.floor(y*8))&65535,g=ms(M,71),R=ms(M,72),Ue=ms(M,73),$=ms(M,74),ve=vt.at(-y,Ie),xe=ve.ridge||0,De=Math.abs(i-ve.cx)-ve.hw;let Te=d;if(Te<0&&(Te=h<2?0:h<3?1:2,j<7.6?Te=4:j>15.2&&g<.8?Te=3:R<.04&&De>9?Te=6:R<.1&&(Te=5),xe>.45&&$<ge(.45,.8,xe)*.92&&Dt.val.rtree!=="a")){const wt=ve.cx,Ze=(vt.at(-y+6,Ie).cx-wt)/6,ct=Math.hypot(1,Ze);Te=7,W=Math.atan2(-Ze/ct,1/ct)+.25*(Ue-.5)}const Me=Te===7?.32:Ue*It,rt=.012+.05*$*$+.03*xe;o[p]=i,o[p+1]=vt.height(i,y,.5),o[p+2]=y,o[p+3]=j,o[p+4]=Math.cos(W),o[p+5]=Math.sin(W),o[p+6]=Te,o[p+7]=n,o[p+8]=Math.cos(Me)*rt,o[p+9]=Math.sin(Me)*rt-.012,o[p+10]=.9+.22*g,o[p+11]=it(.84+.17*da(i/70,y/70,31)+.2*(R-.5)+.3*xe,.62,1.15)}function H(o,p){const i=(o+4096)*2097152+(p+1048576);let y=c.get(i);if(y)return y;const j=[];let W=0;for(let h=0;h<le;h++)for(let n=0;n<le;n++){const d=vt.treeInCell(o*le+n,p*le+h);if(!d.ok)continue;const M=d.x,g=d.z,R=d.h,Ue=d.rot,$=d.variant,ve=(d.seed&65535)/65536;he(j,W,M,g,R,Ue,$,ve,-1),W+=pe}if(y=new Float64Array(j),c.set(i,y),c.size>2400){let h=0;for(const n of c.keys())if(c.delete(n),++h>=600)break}return y}s.reset=()=>{c.clear(),Be.clear(),Q.clear(),L.clear(),Ne=0,Ce=2.5,T=D0(7717),S=l=0,ce=NaN},s.extra=[],s.lod=o=>{Ke=!o},s.shedSoon=(o,p)=>{Ce=0,Ye=o===void 0?null:[o,p]};const z=1280,V=12,I=new Float32Array(z*V),Q=new Map,L=new Map;let ye,Ve,Ne=0,Ce=2.5,Ye=null,T=D0(7717),Se=new Float64Array(64*pe),me=0,B=0;const U=[[3,1.4,.13,.4,0],[1.5,9.8,0,1,1],[.75,9.8,0,1,.25],[3,1,0,.3,2.2],[1.2,9.8,.1,.35,0]],A=[.14,.44,.66,.76],a=[.4,.74,.78,.92],oe=[.55,.7,.7,1],fe=[0,0,0,0,0];function O(o,p,i,y,j){const W=e.kinds[o[p+6]],h=W.axis(i.y0),n=o[p+10],d=o[p+3]/10,M=(h[0]+y*i.ca-j*i.sa)*n,g=(h[1]+y*i.sa+j*i.ca)*n,R=i.y0+i.rise*y-i.k2*y*y+.06,Ue=mt(R/10),$=o[p+4],ve=o[p+5];return fe[0]=o[p]+(M*$+g*ve+o[p+8]*Ue*Ue*10)*d,fe[1]=o[p+1]+(R-.1)*d,fe[2]=o[p+2]+(g*$-M*ve+o[p+9]*Ue*Ue*10)*d,fe[3]=i.ca*$+i.sa*ve,fe[4]=i.sa*$-i.ca*ve,fe}const ie=[0,0];let ce=NaN;function He(o,p){const i=o[p],y=o[p+2],j=i*8191+y;return j!==ce&&(ce=j,ie[0]=(vt.height(i+1.5,y,.5)-vt.height(i-1.5,y,.5))/3,ie[1]=(vt.height(i,y+1.5,.5)-vt.height(i,y-1.5,.5))/3),ie}function We(o,p,i,y,j,W){const h=Math.sqrt(o[p+3]/10),n=He(o,p);for(let d=0;d<y;d++){if(Ne>=z)return;const M=.25+.75*T(),g=O(o,p,i,i.L*M,(T()-.5)*i.W*1.1),R=Ne++*V,Ue=T(),$=Ue<j[0]?0:Ue<j[1]?1:Ue<j[2]?2:Ue<j[3]?3:4,ve=.15+.6*T(),xe=$===0||$===3;I[R]=g[0],I[R+1]=g[1],I[R+2]=g[2],I[R+3]=g[3]*ve+(T()-.5)*.6,I[R+4]=xe?.3-1.2*T():-.3-.9*T(),I[R+5]=g[4]*ve+(T()-.5)*.6,I[R+6]=-W*((1-M)*.55+.45*T())-1e-4,I[R+7]=$===0?2.2+2*T():$===3?1.6+2.4*T():1.2+1*T(),I[R+8]=($===0?.14+.12*T():$===1?.012+.016*T():$===2?.025+.035*T():$===3?.011:.09+.09*T())*h,I[R+9]=T(),I[R+10]=$,I[R+11]=o[p+1]+n[0]*(g[0]+I[R+3]*.5-o[p])+n[1]*(g[2]+I[R+5]*.5-o[p+2])}}function Qe(o,p,i,y){const j=e.kinds[o[p+6]].B;let W=null;if(!(L.size>=96)){for(let h=0;h<14&&!W;h++){const n=j[Math.floor(T()*j.length)];n.cls<2&&n.pw<3&&(y?n.u<.45:n.u>.12&&n.u<.85)&&(W=n)}W&&(L.set(i,{id:W.id,t:0,seen:B}),We(o,p,W,W.cls?100:150,A,1),k(o,p,W,y?.8:1))}}const st=[],Le=[0,0,0],r=(o,p)=>{const i=Math.max(p/9.81,.03);let y=Math.sqrt(2*o/9.81);for(let j=0;j<6;j++){const W=Math.exp(-y/i),h=p*(y-i*(1-W))-o,n=p*(1-W);y=Math.max(.01,y-h/Math.max(n,.2))}return y},q=o=>.28+6.9*Math.pow(1-o,2.6);s.bombs=0;function k(o,p,i,y){if(typeof Jt>"u"||!Jt.puff||typeof At>"u")return;const j=qt.cam.pos,W=Math.hypot(o[p]-j[0],o[p+2]-j[2]);if(W>110)return;s.bombs++;const h=At.t,n=o[p+3]/10,d=i.L*(.62+.25*T()),M=O(o,p,i,d,0),g=M[0],R=M[1]+.08*n,Ue=M[2],$=M[3],ve=M[4],xe=o[p+1]+.02,De=He(o,p),Te=xe+De[0]*(g-o[p])+De[1]*(Ue-o[p+2]),Me=y*(W<30?1:Re(1,.45,mt((W-30)/80))),rt=1/Math.sqrt(Math.max(Me/y,.3)),wt=(i.cls===0?1:i.cls===1?.7:.45)*o[p+11];st.length=0;for(const et of e.kinds[o[p+6]].B){if(et.y0>i.y0-.5||et.L<d*.7)continue;let tt=et.a-i.a;tt-=It*Math.round(tt/It),!(Math.abs(tt)>Math.max(.3,Math.atan2(et.W,d)))&&st.push(O(o,p,et,Math.min(d,et.L*.95),0)[1]+.12*n)}st.sort((et,tt)=>tt-et);const Ze=[];for(const et of st)et<R-.8&&et>Te+.5&&(!Ze.length||Ze[Ze.length-1]-et>.9)&&Ze.length<3&&Ze.push(et);const ct=(et,tt,Oe,ze,pt)=>{if(Jt.onEmit&&Jt.onEmit.length){const ut={kind:et,t:tt,p:Oe,v:ze,spread:1.2,rate:pt,powder:1,r:[-ve,$],f:[$,ve]};for(const xt of Jt.onEmit)xt(ut)}},Mt=.12,ft=q(Mt),dt=r(R-Te,ft),gt=Math.round(34*Me*wt+6);for(let et=0;et<gt;et++){const tt=et<gt*.45?.04+.16*T():.2+.32*T(),Oe=.04+.32*Math.pow(T(),1.4),ze=T()*It,pt=Math.sqrt(T())*.35*n*wt,ut=(r(R-Te,q(tt))+.2)*1.5,xt=.25+.5*T();Jt.puff(h+Oe,g+Math.cos(ze)*pt,R-.1*T(),Ue+Math.sin(ze)*pt,$*xt+(T()-.5)*.3,-.3-.6*T(),ve*xt+(T()-.5)*.3,tt,Re(.1,.2,T())*n*rt*(.6+.5*wt),Re(8.5,4.5,tt/.52),1.3,ut/Re(.8,3.3,tt),.5)}typeof Ms<"u"&&Ms.clumps&&Ms.clumps(h+.08,[g,R,Ue],[$*.5,-.5,ve*.5],Math.round(10*Me*wt+2),.07*n,{from:"tree"}),ct("sift",h,[g,R,Ue],[$*.5,-1,ve*.5],1.2*Me);const bt=(et,tt,Oe,ze,pt,ut)=>{const xt=g+$*.1,lt=Ue+ve*.1;for(let Tt=0;Tt<Oe;Tt++){const Et=T()*It,Ut=ze*(.4+.8*T()),Xt=.2+.9*T(),_t=ut+(1-ut)*T(),m0=.25*n*T(),r0=.06*T();Jt.puff(h+tt+r0,xt+Math.cos(Et)*m0,et+.1*T(),lt+Math.sin(Et)*m0,Math.cos(Et)*Ut+$*.6,Xt,Math.sin(Et)*Ut+ve*.6,_t,Re(.1,.22,T())*n*rt,pt*(1.1-.5*_t),1.6,_t>.8?1.25:1,.6+.6*_t)}for(let Tt=0;Tt<Math.round(Oe*3);Tt++){const Et=T()*It,Ut=ze*(.3+1.1*T());Jt.grain(h+tt+.05*T(),xt,et,lt,Math.cos(Et)*Ut,.3+1.4*T(),Math.sin(Et)*Ut,T(),.5+1.5*T()*T(),1.4,.8)}ct("sift",h+tt,[xt,et,lt],[0,.4,0],.8*Me)};for(let et=0;et<Ze.length;et++){const tt=Ze[et],Oe=r(R-tt,ft)+.12;bt(tt,Oe,Math.round(14*Me*wt+3),1.4+.5*et,3.6,.45);for(let ze=0,pt=Math.round(8*Me*wt+2);ze<pt;ze++){const ut=.12+.35*T(),xt=T()*It,lt=.3*n*Math.sqrt(T());Jt.puff(h+Oe+.05*T(),g+Math.cos(xt)*lt,tt-.05,Ue+Math.sin(xt)*lt,$*.4,-.8-T(),ve*.4,ut,Re(.09,.16,T())*n*rt,Re(6.5,4,ut/.47),1.3,(r(tt-Te,q(ut))+.2)*1.5/Re(.8,3.3,ut),.5)}}const Xe=r(R-Te,ft)+.1;{const et=Math.round(18*Me*wt+4),tt=g,Oe=Ue;for(let ze=0;ze<et;ze++){const pt=T()*It,ut=1+2.2*T(),xt=.5+.5*T();Jt.puff(h+Xe+.08*T(),tt+Math.cos(pt)*.3*n,Te+.08,Oe+Math.sin(pt)*.3*n,Math.cos(pt)*ut,.3+.9*T(),Math.sin(pt)*ut,xt,Re(.12,.24,T())*n*rt,3.4*(1.1-.5*xt),1.4,1.2,.9)}ct("land",h+Xe,[tt,Te,Oe],[0,.6,0],.7*Me)}{const et=Math.round(34*Me*wt+6);for(let tt=0;tt<et;tt++){const Oe=Math.pow(T(),1.6),ze=Te+.3+(R-Te)*Oe,pt=r(Math.max(R-ze,.01),ft)+.12+.4*T(),ut=T()*It,xt=(.15+.8*T())*n;Jt.puff(h+pt,g+Math.cos(ut)*xt,ze,Ue+Math.sin(ut)*xt,Math.cos(ut)*.4,.15*T(),Math.sin(ut)*.4,.9+.1*T(),Re(.1,.22,T())*n*rt,Re(.8,1.4,T()),1,Re(1.15,1.75,T()),.5),tt%2===0&&Jt.grain(h+pt+.3*T(),g+Math.cos(ut)*xt,ze,Ue+Math.sin(ut)*xt,Math.cos(ut)*.3,.2*T(),Math.sin(ut)*.3,1,.4+1.6*T()*T(),1.6,.6)}}}s.sift=function(o,p,i,y){if(typeof Jt>"u")return;const j=Math.round(it(7.5*y,6,12)),W=Math.round(220*y);for(let h=0;h<j;h++){const n=T()*It,d=.25+.75*Math.sqrt(T()),M=p[0]+Math.cos(n)*d,g=p[2]+Math.sin(n)*d,R=p[1]+(T()-.2)*1.2,Ue=i[0]*(.15+.25*T())+(T()-.5)*1,$=i[2]*(.15+.25*T())+(T()-.5)*1,ve=-.4-T()*1,xe=.25+.4*T();Jt.puff(o+.06*T(),M,R,g,Ue,ve,$,xe,Re(.05,.1,T()),Re(4.5,2.8,xe),1.8,1.1,.6)}for(let h=0;h<3;h++){const n=T()*It,d=.4*T();Jt.puff(o+.1+.15*T(),p[0]+Math.cos(n)*d,p[1]-.3*T(),p[2]+Math.sin(n)*d,i[0]*.2,-.2,i[2]*.2,.92,Re(.1,.16,T()),.35,1,.7,1)}for(let h=0;h<W;h++){const n=T()*It,d=Math.sqrt(T())*.9,M=p[0]+Math.cos(n)*d,g=p[2]+Math.sin(n)*d,R=p[1]+(T()-.3)*1.4,Ue=i[0]*(.15+.25*T())+(T()-.5)*1.2,$=i[2]*(.15+.25*T())+(T()-.5)*1.2,ve=-.3-T()*1.2;Jt.grain(o,M,R,g,Ue*1.4,ve*1.6+.6,$*1.4,.35+.65*T(),.5+1.6*T()*T(),1.2)}if(typeof Ms<"u"&&Ms.clumps&&Ms.clumps(o,p,[i[0]*.2,-.8,i[2]*.2],Math.round(4*y),.05,{from:"tree"}),Jt.onEmit&&Jt.onEmit.length){const h={kind:"sift",t:o,p:p.slice(),v:[i[0]*.2,-.8,i[2]*.2],spread:1.5,rate:Math.min(2,y),powder:1,r:[1,0],f:[0,-1]};for(const n of Jt.onEmit)n(h)}};function ee(o){B++;for(const[p,i]of Q){const y=i*Math.exp(-o*3);y<.02?Q.delete(p):Q.set(p,y)}for(const p of L.values())p.t+=o;if(L.size>40){for(const[p,i]of L)if(i.seen<B-90&&(L.delete(p),L.size<=24))break}if(!(!s.life||!o)){if(typeof zt<"u"&&zt.events){for(const p of zt.events)if(!(p.type!=="brush"&&p.type!=="crash"&&p.type!=="near"))for(let i=0;i<ot;i++){const y=K[i],j=ue[i];if(Math.abs(y[j]-p.x)>.05||Math.abs(y[j+2]-p.z)>.05)continue;const W=y[j]*8191+y[j+2],h=e.kinds[y[j+6]].B,n=p.type==="crash";if(p.type==="near"){const d=y[j+4],M=y[j+5],g=ve=>(ve.ca*d+ve.sa*M)*p.ux+(ve.sa*d-ve.ca*M)*p.uz,R=Ne*V;let Ue=null,$=0;Q.set(W,Math.max(Q.get(W)||0,.25+.25*p.k));for(let ve=0;ve<120&&$<6;ve++){const xe=h[Math.floor(T()*h.length)];xe.u>.1&&xe.u<.6&&g(xe)>.5&&(We(y,j,xe,10,oe,.1),$++)}for(let ve=R;ve<Ne*V;ve+=V)I[ve+3]+=.3*p.vx,I[ve+5]+=.3*p.vz;for(const ve of h)ve.cls<2&&ve.pw<3&&ve.u>.15&&ve.u<.5&&g(ve)>(Ue?g(Ue):.5)&&(Ue=ve);Ue&&!L.has(W)&&L.size<96&&(L.set(W,{id:Ue.id,t:0,seen:B}),We(y,j,Ue,Ue.cls?100:150,A,.2),k(y,j,Ue,.9));break}Q.set(W,n?1.6:1);for(let d=0,M=0;d<40&&M<(n?16:10);d++){const g=h[Math.floor(T()*h.length)];g.u>(n?.9:.6)||(We(y,j,g,12,a,.2),M++)}L.has(W)||Qe(y,j,W,!0);break}}if(Ce-=o,Ce<=0&&ot){Ce=(2+4*T())*it(24/ot,1,6);for(let p=0;p<8&&!Ye;p++){const i=Math.floor(T()*ot),y=K[i],j=ue[i],W=y[j]*8191+y[j+2];if(!(G[i]<5||y[j+6]===6||L.has(W))){Qe(y,j,W,!1);break}}if(Ye){for(let p=0;p<ot;p++){const i=K[p],y=ue[p];Math.abs(i[y]-Ye[0])<.05&&Math.abs(i[y+2]-Ye[1])<.05&&Qe(i,y,i[y]*8191+i[y+2],!1)}Ye=null}}}}function Z(o,p,i,y){const j=qt.G,W=j[u0.wind],h=j[u0.wind+2];let n=0,d=0;for(let M=0;M<Ne;M++){const g=M*V;let R=I[g+6]+o,Ue=I[g+10];const $=I[g+7];if(R>$)continue;if(I[g+1]<I[g+11]){if(Ue!==4||I[g+9]>.7)continue;Ue=I[g+10]=0,R=1e-4,I[g+7]=1+1.6*I[g+9],I[g+1]=I[g+11]+.1,I[g+11]=-1e9,I[g+3]*=.4,I[g+5]*=.4,I[g+4]=.4+1.2*I[g+9],I[g+8]*=1.3}const ve=U[Ue];if(R>0){const De=Math.exp(-o*ve[0]);I[g+3]=W+(I[g+3]-W)*De,I[g+5]=h+(I[g+5]-h)*De,I[g+4]=I[g+4]*De-ve[1]*o*(.5+.5*De),I[g]+=I[g+3]*o,I[g+1]+=I[g+4]*o,I[g+2]+=I[g+5]*o,I[g+8]+=ve[2]*o}I[g+6]=R;const xe=n*V;if(xe!==g)for(let De=0;De<V;De++)I[xe+De]=I[g+De];if(n++,R>0){const De=R/$,Te=ge(0,.1,De)*(1-ge(Ue===0?.3:.6,1,De)),Me=d++*8;ye[Me]=I[xe]-p,ye[Me+1]=I[xe+1]-i,ye[Me+2]=I[xe+2]-y,ye[Me+3]=I[xe+8],ye[Me+4]=ve[3]*Te,ye[Me+5]=Ue+Math.min(I[xe+9],.999),ye[Me+6]=ve[4]*Te,ye[Me+7]=Ue===1||Ue===2?Math.min(Math.abs(I[xe+4]),12)*.008:0}}Ne=n,s.stats.parts=d,d&&E.updateBuffer(Ve,0,ye.subarray(0,d*8))}const K=[],ue=new Int32Array(640),G=new Float32Array(640),Ae=new Uint16Array(640),_e=new Uint16Array(640),at=new Float32Array(640*3);let ot=0,t=null,S=0,l=0;const u=[0,0],v=[0,0],P=[0,0],N=[0,0];function de(){const o=Math.ceil(s.far/Pe)+1,p=[];for(let i=-o;i<=o;i++)for(let y=-o;y<=o;y++)p.push([y,i,Math.hypot(y,i)]);p.sort((i,y)=>i[2]-y[2]),t=new Int16Array(p.length*2),p.forEach((i,y)=>{t[y*2]=i[0],t[y*2+1]=i[1]}),t.far=s.far}s.update=function(o,p,i,y,j){for(let Oe=0;Oe<s.NV;Oe++)for(let ze=0;ze<2;ze++){const pt=ne[Oe][ze];pt.n=0,pt.solid=0,pt.gn=0}const W=s.stats;if(nt=0,ot=0,W.near=W.far=W.fading=W.out=W.l0=W.l1=W.drawn=W.shadow=0,!s.enabled)return;(!t||t.far!==s.far)&&de(),j=j>0&&j<.1?j:0;const h=o.pos[0],n=o.pos[2],d=Math.hypot(o.fwd[0],o.fwd[2])||1,M=o.fwd[0]/d,g=o.fwd[2]/d,R=s.far,Ue=R*R;if(j){const Oe=h-u[0],ze=n-u[1],pt=y?y[0]-P[0]:0,ut=y?y[2]-P[1]:0,lt=!(typeof Dt<"u"&&Dt.val.wood==="a")&&Math.hypot(Oe,ze)<70*j&&Math.hypot(pt,ut)<70*j?(y?ge(.8,2.2,Math.hypot(y[0]-h,y[2]-n)):1)/j:0;v[0]=Oe*lt,v[1]=ze*lt,N[0]=pt*lt,N[1]=ut*lt}u[0]=h,u[1]=n,y&&(P[0]=y[0],P[1]=y[2]);const $=Math.tan(o.fovY/2)*Math.max(i||.5,.3)*1.15+.06,ve=13,xe=7,De=it(.5463/Math.tan(o.fovY/2),1,6),Te=s.r0*De,Me=s.r1*De,rt=Ke?0:Me,wt=rt*rt,Ze=p[0],ct=p[1],Mt=p[2],ft=(Oe,ze,pt,ut)=>{if(nt>=s.maxFar)return;const xt=nt++*12,lt=Oe[ze+3]/10*ge(R,R-60,ut),Tt=Oe[ze+6];je[xt]=Oe[ze]-Ze,je[xt+1]=Oe[ze+1]-ct-.1*lt,je[xt+2]=Oe[ze+2]-Mt,je[xt+3]=lt,je[xt+4]=Oe[ze+4],je[xt+5]=Oe[ze+5],je[xt+6]=Oe[ze+7],je[xt+7]=Tt+.98*pt,je[xt+8]=Oe[ze+8],je[xt+9]=Oe[ze+9],je[xt+10]=Oe[ze+10]*Y[Tt],je[xt+11]=Oe[ze+11]};let dt=0;const gt=(Oe,ze)=>{const pt=Oe[ze]-h,ut=Oe[ze+2]-n,xt=pt*pt+ut*ut;if(xt>Ue)return;const lt=pt*M+ut*g,Tt=Math.abs(pt*g-ut*M);if(xt<wt&&lt>-xe&&Tt<Math.max(lt,0)*$+xe){dt===0&&ot<640&&(K[ot]=Oe,ue[ot]=ze,G[ot++]=Math.sqrt(xt));return}dt===0||lt<-ve||Tt>lt*$+ve||ft(Oe,ze,1,Math.sqrt(xt))};me=0;const bt=(Oe,ze,pt,ut,xt,lt)=>{me+pe>Se.length||(he(Se,me,Oe,ze,pt,ut,0,lt,xt),me+=pe)};for(const Oe of s.extra)bt(Oe[0],Oe[1],Oe[2],Oe[3]||0,(Oe[4]||0)%s.NV,.5);(typeof gs>"u"||!gs.enabled)&&vt.markers(-n-40,-n+R,(Oe,ze,pt,ut)=>bt(Oe,ze,pt,ut,4,.37));const Xe=Math.floor(h/Pe),et=Math.floor(n/Pe),tt=Pe*.71;for(dt=0;dt<2;dt++){for(let Oe=0;Oe<t.length;Oe+=2){const ze=Xe+t[Oe],pt=et+t[Oe+1],ut=(ze+.5)*Pe-h,xt=(pt+.5)*Pe-n,lt=Math.hypot(ut,xt);if(dt===0){if(lt>rt+tt){if(Math.hypot(t[Oe],t[Oe+1])*Pe>rt+3*Pe)break;continue}}else{if(lt>R+tt)continue;const Et=ut*M+xt*g;if(Et<-ve-tt||Math.abs(ut*g-xt*M)>Math.max(Et,0)*$+ve+tt)continue}const Tt=H(ze,pt);for(let Et=0;Et<Tt.length;Et+=pe)gt(Tt,Et)}for(let Oe=0;Oe<me;Oe+=pe)gt(Se,Oe);if(dt===0){ee(j);for(let lt=0;lt<ot;lt++)Ae[lt]=lt;const Oe=Ae.subarray(0,ot);Oe.sort((lt,Tt)=>G[lt]-G[Tt]);const ze=ot>s.max0?Math.min(Te,G[Oe[s.max0]]):Te,pt=ot>s.max1?Math.min(Me,G[Oe[s.max1]]):Me;S=j&&S?Pt(S,ze,5,j):ze,l=j&&l?Pt(l,pt,5,j):pt;let ut=0;for(let lt=0;lt<ot;lt++){const Tt=Oe[lt],Et=K[Tt],Ut=ue[Tt],Xt=G[Tt],_t=Et[Ut],m0=Et[Ut+2],r0=Et[Ut+3],Ft=ge(S,S-s.w0*De,Xt),Lt=ge(l,l-s.w1*De,Xt);if(Lt>0){const yt=_t-h,Rt=m0-n,Vt=it((yt*v[0]+Rt*v[1])/(v[0]*v[0]+v[1]*v[1]||1),0,.16),Kt=yt-v[0]*Vt,jt=Rt-v[1]*Vt,Ot=(Vt?Math.hypot(Kt,jt):Xt)+.5*Math.max(Kt*M+jt*g-2,0)-.08*r0;let $t=1e9;if(y){const Zt=y[0]+N[0]*.16-h,n0=y[2]+N[1]*.16-n,i0=it((yt*Zt+Rt*n0)/(Zt*Zt+n0*n0||1),.02,1);$t=Math.hypot(yt-Zt*i0,Rt-n0*i0)/r0}const Bt=_t*8191+m0;let Ct=Be.get(Bt);Ct?(Ct[1]=Ct[1]?!($t>.24&&Ot>5.3):$t<.17||Ot<4.5,Ct[0]=j?it(Ct[0]+(Ct[1]?-j/.16:j/.35),0,1):Ct[1]?0:1):(Ct=[1,!1],Ct[1]=$t<.17||Ot<4.5,Ct[0]=Ct[1]?0:1),Ee.set(Bt,Ct),_e[ut]=Tt,at[ut*3]=Ft,at[ut*3+1]=Lt,at[ut*3+2]=Ct[0],ut++,Ct[0]<=.004?W.out++:Ct[0]<.999&&W.fading++}Lt<1&&ft(Et,Ut,1-Lt,Xt)}{const lt=Be;Be=Ee,Ee=lt,Ee.clear()}const xt=(lt,Tt,Et,Ut,Xt,_t,m0)=>{const r0=Tt*16,Ft=Et[Ut+3]/10,Lt=Et[Ut]*8191+Et[Ut+2],yt=L.get(Lt);yt&&(yt.seen=B),lt[r0]=Et[Ut]-Ze,lt[r0+1]=Et[Ut+1]-ct-.1*Ft,lt[r0+2]=Et[Ut+2]-Mt,lt[r0+3]=Ft,lt[r0+4]=Et[Ut+4],lt[r0+5]=Et[Ut+5],lt[r0+6]=Xt,lt[r0+7]=_t,lt[r0+8]=Et[Ut+8],lt[r0+9]=Et[Ut+9],lt[r0+10]=Et[Ut+10],lt[r0+11]=Et[Ut+11],lt[r0+12]=Math.min(Et[Ut+7],.999)+2*Math.round(m0*255),lt[r0+13]=(Q.get(Lt)||0)*s.life,lt[r0+14]=yt?yt.id:0,lt[r0+15]=yt?Math.min(yt.t/1.5,1):0};for(let lt=1;lt>=0;lt--)for(let Tt=0;Tt<ut;Tt++){const Et=at[Tt*3+2];if(Et>=.999!=!!lt)continue;const Ut=_e[Tt],Xt=K[Ut],_t=ue[Ut],m0=Xt[_t+6],r0=at[Tt*3],Ft=at[Tt*3+1];for(let Lt=0;Lt<2;Lt++){if(Lt?r0>=1:r0<=0)continue;const yt=ne[m0][Lt];if(yt.n>=yt.cap)continue;const Rt=Lt?r0:0,Vt=Lt?Ft:r0;xt(yt.cpu,yt.n++,Xt,_t,Rt,Vt,1),lt&&yt.solid++,!lt&&Et>.004&&yt.gn<Je&&xt(yt.gcpu,yt.gn++,Xt,_t,Rt,Vt,Et),Lt?W.l1++:W.l0++}W.near++}}}for(let Oe=0;Oe<s.NV;Oe++)for(let ze=0;ze<2;ze++){const pt=ne[Oe][ze];W.drawn+=pt.solid*C[Oe][ze].count/3,W.shadow+=pt.n*C[Oe][1].count/3,pt.n&&E.updateBuffer(pt.buf,0,pt.cpu.subarray(0,pt.n*16)),pt.gn&&E.updateBuffer(pt.gbuf,0,pt.gcpu.subarray(0,pt.gn*16))}nt&&E.updateBuffer($e,0,je.subarray(0,nt*12)),W.far=nt,W.drawn+=nt*we*2,W.shadow+=nt*we*2,Ne?Z(j,Ze,ct,Mt):W.parts=0};const te=()=>{const o=qt.G,p=qt.origin,i=o[u0.wind],y=o[u0.wind+2],j=Math.max(Math.hypot(i,y),.05);return[(p[0]*i+p[2]*y)/j*.045%It,0,0,0]};return s.draw=function(o){if(!s.enabled||!ke)return;const p={tDetail:c0.detail,tShadow:o.shadowTex,tSky:Nt.lut},i=te()[0];for(let y=0;y<2;y++)for(let j=0;j<s.NV;j++){const W=ne[j][y],h=C[j][y];W.solid&&E.draw(D,{u:{p:[i,Y[j],0,0]},tex:p,vb:[h.vb,W.buf],ib:h.ib,count:h.count,instances:W.solid})}if(nt){const y=ts.levels&&ts.levels[3],j=y?ts.sunBinding(o.origin,3).xf:[0,0,0,0];E.draw(_,{u:{t:[j[0],j[1],j[2],y?1:0]},tex:{tA:ae,tB:X,tShadow:o.shadowTex,tSky:Nt.lut,tDen:y?y.nTex:c0.black},vb:[$e],count:2*we+2,instances:nt})}},s.drawGhost=function(o){if(!s.enabled||!ke)return;const p={tDetail:c0.detail,tShadow:o.shadowTex,tSky:Nt.lut},i={p:te()};for(let y=0;y<2;y++)for(let j=0;j<s.NV;j++){const W=ne[j][y],h=C[j][y];W.gn&&E.draw(re,{u:i,vb:[h.vb,W.gbuf],ib:h.ib,count:h.count,instances:W.gn})}for(let y=0;y<2;y++)for(let j=0;j<s.NV;j++){const W=ne[j][y],h=C[j][y];W.gn&&E.draw(m,{u:{p:[i.p[0],Y[j],0,0]},tex:p,vb:[h.vb,W.gbuf],ib:h.ib,count:h.count,instances:W.gn})}s.stats.parts&&E.draw(J,{u:{p:[0,0,0,0]},tex:{tDetail:c0.detail,tShadow:o.shadowTex,tSky:Nt.lut},vb:[Ve],count:4,instances:s.stats.parts})},s.drawShadow=function(){if(!s.enabled||!ke)return;const o={p:te()};for(let p=0;p<2;p++)for(let i=0;i<s.NV;i++){const y=ne[i][p],j=C[i][1];y.n&&E.draw(be,{u:o,vb:[j.vb,y.buf],ib:j.ib,count:j.count,instances:y.n})}nt&&E.draw(b,{u:{p:[0,0,0,0]},tex:{tA:ae},vb:[$e],count:2*we+2,instances:nt})},s.isBaked=()=>ke,s})(),ya=`
struct TreeV { wp: vec3f, n: vec3f, hh: f32, }
// where a vertex of a tree stands: this tree's size, girth, turn and lean; the wind in its top and under its boughs; the bough that has just
// shed its snow. ph0: the phase of the gusts at the origin of render space. (All of it runs on game time.)
fn treeVertex(pos: vec3f, nrm: vec3f, mat: vec4f, tx: vec4f, i0: vec4f, i1: vec4f, i2: vec4f, i3: vec4f, ph0: f32) -> TreeV {
  var t: TreeV;
  let sc: f32 = i0.w; let gi: f32 = i2.z; let lev: f32 = tx.w; let tm: f32 = U.camPos.w;
  let isSnow: f32 = step(mat.x, 0.5); let curt: f32 = step(1.5, mat.x) * step(mat.x, 2.5);
  var p: vec3f = vec3f(pos.x * gi, pos.y, pos.z * gi);
  var hh: f32 = tx.x;
  // a bough that sheds: its snow sinks and is gone, the bough springs up, swings and settles
  if (i3.w > 0.0005 && abs(mat.w - i3.z) < 0.5) {
    let gone: f32 = smoothstep(0.0, 0.4, i3.w);
    p.y = p.y - isSnow * tx.x * gone * 0.9 + lev * lev * 0.05 * (1.0 - exp(-4.0 * i3.w) * cos(i3.w * 15.0));
    hh = mix(tx.x, mix(tx.x, -0.3, gone), isSnow);
  }
  let ph: f32 = fract(i3.x) * 6.2832;
  let wv: vec2f = U.wind.xz; let wl: f32 = max(length(wv), 0.05); let wd: vec2f = wv / wl;
  // gusts cross the forest as slow waves; between them the trees all but stand still
  let gu: f32 = 0.5 + 0.5 * sin(dot(i0.xz, wd) * 0.045 + ph0 - tm * 0.8);
  let amp: f32 = (0.25 + 0.75 * gu * gu) * clamp(wl / 1.3, 0.3, 2.5);
  let shk: f32 = i3.y;
  let q: f32 = saturate(pos.y * 0.1);
  // boughs ride up and down on their own time, the long ones most; one that has been brushed shudders; hanging branchlets swing
  p.y = p.y + lev * lev * (0.010 * amp * sin(tm * 2.3 + mat.w * 1.7 + ph) + 0.020 * shk * sin(tm * 21.0 + mat.w * 2.3));
  p = p + nrm * (curt * tx.z * (0.03 * amp * sin(tm * 3.1 + tx.x * 5.0 + ph) + 0.03 * shk * sin(tm * 23.0 + tx.x * 9.0)));
  let lp: vec3f = p * sc;
  // the stem bends from the foot, nodding with the gusts and circling a little; and it never grew quite straight
  let bend: vec2f = (wd * (0.55 + 0.45 * sin(tm * 1.13 + ph)) + vec2f(-wd.y, wd.x) * (0.5 * sin(tm * 1.71 + ph * 1.3))) * (0.075 * amp)
                  + vec2f(sin(tm * 17.0 + ph), cos(tm * 15.0 + ph)) * (0.03 * shk) + i2.xy * 10.0;
  let off: vec2f = bend * (q * q * sc);
  t.wp = i0.xyz + vec3f(lp.x * i1.x + lp.z * i1.y + off.x, lp.y, lp.z * i1.x - lp.x * i1.y + off.y);
  let n: vec3f = normalize(vec3f(nrm.x, nrm.y * gi, nrm.z));
  t.n = vec3f(n.x * i1.x + n.z * i1.y, n.y, n.z * i1.x - n.x * i1.y);
  t.hh = hh;
  return t;
}
`,Ws=`
struct TreeS { snow: f32, bark: f32, ao: f32, open: f32, thin: f32, tone: f32, N: vec3f, }
// how deep the snow must lie on a bough to show as snow (m): a tree that carries less shows more of its needles
// the pattern the hand-overs between levels of detail are made with: a fine grain that changes every frame (at 60 fps it reads as a true
// blend, and in a still as grain, not as hatching)
fn treeGrain(p: vec2f) -> f32 { return hash21(p + vec2f(37.0, 17.0) * (U.origin.w - 64.0 * floor(U.origin.w / 64.0))); }
fn snowLine(load: f32) -> f32 { return max(0.010, 0.022 + (1.0 - load) * 0.14); }
fn treeLight(s: TreeS, V: vec3f, sh: f32) -> vec3f {
  let L: vec3f = U.sunDir.xyz; let N: vec3f = s.N;
  let ndl: f32 = dot(N, L);
  let back: f32 = saturate(dot(-V, L)); let rim: f32 = pow(1.0 - saturate(dot(N, V)), 2.5);
  let sky: vec3f = U.ambSky.rgb * (0.30 + 0.70 * s.open);
  // snow on the boughs: sunlit where it faces the light, sky-blue in its own shade, glowing along its edges when the sun is behind it
  let ambS: vec3f = sky * (1.0 + 0.9 * N.y) + U.ambGnd.rgb * (0.34 - 0.28 * N.y) + twiLight(N) * (0.4 + 0.6 * s.open);
  var cs: vec3f = vec3f(0.93, 0.955, 0.985) * (U.sunCol.rgb * saturate((ndl + 0.30) / 1.30) * sh + ambS * s.ao);
  cs += U.sunCol.rgb * vec3f(1.0, 0.93, 0.85) * (back * back * rim * (0.25 + 0.75 * sh) * 0.9 + 0.10 * sh * saturate(-ndl + 0.2) * s.open);
  // needles: nearly black green, bark browner
  var albN: vec3f = mix(vec3f(0.015, 0.030, 0.022), vec3f(0.036, 0.054, 0.027), s.tone);
  albN = mix(albN, vec3f(0.060, 0.047, 0.040), s.bark);
  let ambN: vec3f = sky * (0.9 + 0.7 * N.y) + U.ambGnd.rgb * (0.42 - 0.34 * N.y) + twiLight(N) * (0.4 + 0.6 * s.open);
  var cn: vec3f = albN * (U.sunCol.rgb * saturate((ndl + 0.45) / 1.45) * sh + ambN * s.ao);
  cn += albN * U.sunCol.rgb * back * back * rim * 2.5 * sh * (1.0 - s.bark);
  // a spray of needles lets the sun through: seen against the light, its fringe is a warm green
  cn += vec3f(0.045, 0.060, 0.016) * U.sunCol.rgb * (s.thin * sh * saturate(-ndl) * (0.35 + 0.65 * back));
  return mix(cn, cs, s.snow);
}
// what the skier's headlamp adds when a tree stands in its beam
fn treeLamp(s: TreeS, wp: vec3f) -> vec3f {
  let ll: vec3f = lampLight(wp);
  if (ll.x <= 0.00002) { return vec3f(0.0); }
  let Ld: vec3f = normalize(U.lamp.xyz - wp);
  let albN: vec3f = mix(vec3f(0.020, 0.034, 0.022), vec3f(0.060, 0.047, 0.040), s.bark);
  return ll * mix(albN, vec3f(0.93, 0.955, 0.985), s.snow) * (saturate(dot(s.N, Ld) * 0.6 + 0.4) * s.ao);
}
`,ra=`
// where along a spray a point lies, counted in its branchlets: they leave the spine forward and outward, and none is quite straight
fn sprayAt(tx: vec4f, mat: vec4f) -> f32 {
  return (tx.x + 0.030 * sin(tx.y * 21.0 + mat.w * 5.0) + 0.018 * sin(tx.x * 33.0 + mat.w * 3.0) - abs(tx.y) * 0.9) / 0.115 + mat.w * 0.37;
}
// how much of a pixel a sheet of twigs fills. fw: the width of a pixel on the sheet (m). line: see snowLine.
// (And where a pillow of the coarse level ends: its outline is not in its triangles.)
fn treeCut(mat: vec4f, tx: vec4f, fw: f32, line: f32) -> f32 {
  if (mat.x < 0.5) { return select(1.0, step(line, tx.x), tx.z > 0.5); }
  if (mat.x > 2.5) { return 1.0; }
  if (mat.x < 1.5) {
    // a spray: each branchlet as long and as full as it likes, needles standing along both sides of it; and a second, finer set of them
    // lies across the first, so that the spray is dense toward the stem and ragged at its edge (never a comb with even teeth)
    let ap: f32 = fw / 0.115;
    // from far the gaps close: what is left is the outline, a little inside the longest branchlets
    if (ap > 1.2) { return step(tx.z, 0.80); }
    let s: f32 = sprayAt(tx, mat); let k: f32 = floor(s); let f: f32 = abs(s - k - 0.5);
    let h: f32 = hash11(k + mat.w * 17.0);
    let e: f32 = tx.z / (0.78 + 0.22 * h);
    let comb: f32 = abs(fract(abs(tx.y) * 62.0 + h * 7.0) - 0.5) * 2.0;
    let wid: f32 = mix(0.60, 0.13, smoothstep(0.30, 1.0, e)) * (0.75 + 0.5 * fract(h * 7.3)) * mix(0.70 + 0.60 * comb, 1.0, saturate(fw * 60.0));
    var fine: f32 = saturate((wid - f) / max(ap, 0.001) + 0.5) * step(e, 1.0);
    let s2: f32 = (tx.x - abs(tx.y) * 0.5 + 0.022 * sin(tx.y * 27.0 + mat.w * 9.0)) / 0.083 + mat.w * 0.71; let k2: f32 = floor(s2); let f2: f32 = abs(s2 - k2 - 0.5);
    let e2: f32 = tx.z / (0.50 + 0.38 * hash11(k2 + mat.w * 23.0));
    fine = max(fine, saturate((mix(0.52, 0.10, smoothstep(0.25, 1.0, e2)) - f2) / max(fw / 0.083, 0.001) + 0.5) * step(e2, 1.0));
    return mix(fine, step(tx.z, 0.80), smoothstep(0.45, 1.2, ap));
  }
  // a curtain: strands hang a hand apart and to different lengths, thinning toward their ends, shorter ones between the long
  let ap3: f32 = fw / 0.06;
  if (ap3 > 1.2) { return step(tx.z, 0.62); }
  let c3: f32 = (tx.x + 0.012 * sin(tx.y * 19.0 + mat.w * 7.0)) / 0.06 + mat.w * 0.61; let k3: f32 = floor(c3); let f3: f32 = abs(c3 - k3 - 0.5);
  let e3: f32 = tx.z / (0.35 + 0.65 * hash11(k3 + mat.w * 13.0));
  var fine3: f32 = saturate((0.46 * (1.0 - 0.6 * e3) - f3) / max(ap3, 0.001) + 0.5) * step(e3, 1.0);
  let c4: f32 = (tx.x - 0.010 * sin(tx.y * 23.0 + mat.w * 4.0)) / 0.043 + mat.w * 0.29; let k4: f32 = floor(c4); let f4: f32 = abs(c4 - k4 - 0.5);
  let e4: f32 = tx.z / (0.20 + 0.50 * hash11(k4 + mat.w * 31.0));
  fine3 = max(fine3, saturate((0.42 * (1.0 - 0.6 * e4) - f4) / max(fw / 0.043, 0.001) + 0.5) * step(e4, 1.0));
  return mix(fine3, step(tx.z, 0.62), smoothstep(0.45, 1.2, ap3));
}
// n1: lumps, n2: needles and grain (two reads of the detail texture). plast: how squarely the point faces the wind that plasters the stems.
// fw: as in treeCut.
fn treeSurface(mat: vec4f, tx: vec4f, N: vec3f, n1: vec4f, n2: vec4f, line: f32, load: f32, plast: f32, fw: f32) -> TreeS {
  var s: TreeS;
  s.ao = mat.y; s.open = mat.z;
  let isSnow: f32 = step(mat.x, 0.5); let isBark: f32 = step(2.5, mat.x);
  let nd: f32 = n1.z * 0.6 + n2.z * 0.4;
  // a pillow is snow down to where it thins out over the needles: there the bough shows, a dark ragged line under every lump
  var snow: f32 = isSnow * smoothstep(-0.010, 0.010, tx.x - line + (nd - 0.5) * 0.07);
  // the stem carries what settled on it wherever it looks up at open sky (and its weather side is plastered); twigs keep only flecks of
  // it, along the branchlets of a spray, the needles at their sides stay dark: a bough that has lost its pillow is green
  var dust: f32 = smoothstep(0.30, 0.80, N.y) * smoothstep(0.45, 0.62, nd * 0.75 + 0.25 * s.open + 0.25 * (load - 0.8));
  if (mat.x > 0.5 && mat.x < 2.5) {
    dust = smoothstep(0.30, 0.80, N.y) * smoothstep(0.60, 0.76, n2.z * 0.55 + n1.z * 0.25 + 0.20 * s.open + 0.25 * (load - 0.8));
    if (mat.x < 1.5) { dust = dust * mix(smoothstep(0.40, 0.16, abs(fract(sprayAt(tx, mat)) - 0.5)), 0.6, smoothstep(0.3, 1.0, fw / 0.115)); }
  }
  snow = max(snow, (1.0 - isSnow) * dust * 0.88);
  snow = max(snow, isBark * smoothstep(0.35, 0.75, plast + (nd - 0.5) * 0.6) * 0.9);
  s.snow = snow;
  s.bark = isBark * (1.0 - snow);
  s.thin = (1.0 - isSnow) * (1.0 - isBark);
  s.tone = n1.w * 0.6 + 0.2 * s.open;
  // needles are a thousand small facets, snow a soft crust
  let Nn: vec3f = normalize(N + (vec3f(n2.x, n2.y, n2.w) - 0.5) * 1.1);
  let Ns: vec3f = normalize(N + vec3f(n1.x - 0.5, 0.0, n1.y - 0.5) * 0.5 + (vec3f(n2.x, n2.y, n2.w) - 0.5) * 0.12);
  s.N = normalize(mix(Nn, Ns, snow));
  return s;
}
`,ka=(e,s)=>`
  let N0: vec3f = normalize(v.nrm);
  var Ng: vec3f = normalize(cross(dpdx(${e}), dpdy(${e}))); if (dot(Ng, ${s}) < 0.0) { Ng = -Ng; }
  let fc: f32 = dot(N0, Ng);
  // pillows and the stem are solid, their inner faces are never seen; twigs are seen from both sides
  if (fc < -0.2 && (v.mat.x < 0.5 || v.mat.x > 2.5)) { discard; }
  let d1: vec2f = dpdx(v.tx.xy); let d2: vec2f = dpdy(v.tx.xy); let fw: f32 = sqrt(0.5 * (dot(d1, d1) + dot(d2, d2)));`,$o=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  // the hand-over between levels of detail: each level keeps its share of a pattern that moves every frame, the shares never overlap.
  // And a bough about to brush the lens thins out and is gone. (It is never left as a sprinkle of dark specks over the picture: below a
  // third of its pixels it is dropped altogether.)
  let g: f32 = treeGrain(v.clip.xy);
  let kd: f32 = smoothstep(0.8, 1.7, dist);
  let keep: f32 = min(v.ex.y, kd);
  if (kd < 0.34 || g < v.ex.x || (keep < 0.999 && g >= keep)) { discard; }${ka("v.wp","V")}
  var N: vec3f = N0; if (fc < 0.0) { N = -N0; }
  let n1: vec4f = tex(tDetail, v.bp.xz * 0.23 + v.bp.yy * vec2f(0.17, 0.11) + v.ex.z);                   // lumps
  let ln: f32 = snowLine(v.iv.x);
  if (treeCut(v.mat, v.tx, fw, ln + (n1.z - 0.5) * 0.03) < 0.5) { discard; }
  let n2: vec4f = tex(tDetail, v.bp.xy * 1.9 + v.bp.zz * vec2f(1.3, 1.7));                               // needles, grain
  let s: TreeS = treeSurface(v.mat, v.tx, N, n1, n2, ln, v.iv.x, dot(N, normalize(vec3f(-U.wind.x, 0.3, -U.wind.z) + vec3f(1e-4, 0.0, 0.0))), fw);
  // a sheet of twigs asks for the light on the side of it that faces the sun, whichever side is looked at: the sun comes through
  var Nq: vec3f = N; if (s.thin > 0.5 && dot(N, U.sunDir.xyz) < 0.0) { Nq = -N; }
  // (the depth of the sun's map spans 1200 m: 0.0001 of it is 12 cm. A tree must see the shadow of its own next tier.)
  var sh: f32 = shadowAt(v.wp + Nq * (0.10 + 0.004 * dist), 0.00012);
  // (beyond the sun's map, where only a long lens shows a mesh, the tree still stands in its own shade: worked out as on a card, so the two agree)
  let cover: f32 = shadowCover(v.wp);
  if (cover < 0.999) {
    let hq: f32 = saturate((v.bp.y - V0F) / DVF);
    var ownS: f32 = smoothstep(mix(-0.45, -0.8, hq * hq), 0.25, v.iv.z / (v.iv.w * (1.0 - 0.8 * hq) + 0.3));
    ownS = max(ownS, smoothstep(0.55, 0.95, s.N.y) * (0.25 + 0.45 * hq) * saturate(U.sunDir.y * 4.0 + 0.1));
    ownS = ownS * mix(1.0, smoothstep(0.12, 0.55, s.ao * (0.3 + 0.7 * s.open)), 0.6);
    sh = sh * mix(ownS, 1.0, cover);
  }
  var col: vec3f = treeLight(s, V, sh);
  col += treeLamp(s, v.wp);
  col = applyFog(col, v.wp);
  GHOST_OUT
  return o;
}
`,Go=`
// a normal out of a photograph's frame into the tree's
fn cardN(e: vec2f, ph: f32) -> vec3f {
  let cp: f32 = cos(ph); let sp: f32 = sin(ph);
  let x: vec3f = vec3f(cp, 0.0, -sp); let z: vec3f = vec3f(sp * PITCH_C, PITCH_S, cp * PITCH_C); let y: vec3f = cross(z, x);
  let n: vec2f = e * 2.0 - 1.0;
  return x * n.x + y * n.y + z * sqrt(max(1.0 - dot(n, n), 0.0));
}
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let g: f32 = treeGrain(v.clip.xy);
  // the two photographs nearest the viewer's bearing, blended as the viewer walks round the tree
  let w: f32 = v.vw.z;
  let uv0: vec2f = vec2f((v.vw.x + v.uv.x) / NKF, (v.vw.w + v.uv.y) / NVF); let uv1: vec2f = vec2f((v.vw.y + v.uv.x) / NKF, uv0.y);
  let a0: vec4f = texLod(tA, uv0, v.ex.w); let a1: vec4f = texLod(tA, uv1, v.ex.w);
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let kd: f32 = smoothstep(1.5, 5.0, dist);
  // the outline: the alpha falls away from each photograph's edge like a distance, so between two photographs the outline moves over;
  // and it is taken a little soft (a band of the moving pattern), not as a hard cut
  let al: f32 = mix(a0.a, a1.a, w);
  if (al < 0.63 + 0.08 * g || (v.ex.z < 0.999 && g < 1.0 - v.ex.z) || g > kd || kd < 0.34) { discard; }
  let b: vec4f = mix(texLod(tB, uv0, v.ex.w), texLod(tB, uv1, v.ex.w), w);
  let nl: vec3f = normalize(mix(cardN(a0.xy, v.vw.x * KSTEP), cardN(a1.xy, v.vw.y * KSTEP), w));
  let N: vec3f = vec3f(nl.x * v.ex.x + nl.z * v.ex.y, nl.y, nl.z * v.ex.x - nl.x * v.ex.y);
  // every pixel back where it stood on the tree: so far in front of the card, or behind it
  let dz: f32 = (mix(a0.z, a1.z, w) - 0.5) * DR2 * v.fx.x;
  let Vh: vec3f = normalize(vec3f(V.x, 0.0, V.z) + vec3f(1e-5, 0.0, 0.0));
  let wt: vec3f = v.wp + Vh * dz + vec3f(0.0, dz * PITCH_T, 0.0);
  // (a bough the slope has buried stays buried: the card stands on the stem's line, the ground under the bough may be higher)
  if (wt.y < dot(v.gp.xy, wt.xz) + v.gp.z - 0.12 * v.fx.x) { discard; }
  var s: TreeS;
  // (a tree that carries less snow: its pillows end higher up, where they are thicker)
  let ln: f32 = snowLine(v.fx.z) / 0.16;
  s.snow = b.x * smoothstep(ln - 0.08, ln + 0.08, b.z + 0.08); s.ao = b.y; s.open = 1.0; s.bark = b.w; s.thin = (1.0 - b.x) * (1.0 - b.w); s.tone = 0.4; s.N = N;
  // The tree's own shade is worked out, not looked up (in the sun's map the tree is the flat it is drawn as): the far side of the crown
  // lies in shade, less so toward the top where the crown is thin.
  let hq: f32 = saturate(1.0 - v.uv.y);
  let Lh: vec2f = normalize(U.sunDir.xz + vec2f(1e-5, 0.0));
  let pr: vec2f = vec2f(Vh.z, -Vh.x) * ((v.uv.x * 2.0 - 1.0) * v.fx.y) + Vh.xz * dz;       // where the pixel stands from the stem, on the map
  let rs: f32 = dot(pr, Lh);
  var ownS: f32 = smoothstep(mix(-0.45, -0.8, hq * hq), 0.25, rs / (v.fx.y * (1.0 - 0.8 * hq) + 0.3));
  // (and even there the tops of the pillows catch the low sun between the tiers, the more the higher up the tree)
  ownS = max(ownS, smoothstep(0.55, 0.95, N.y) * (0.25 + 0.45 * hq) * saturate(U.sunDir.y * 4.0 + 0.1));
  // (what lies deep under the tiers sees little of the sky and as little of the sun)
  ownS = ownS * mix(1.0, smoothstep(0.12, 0.55, b.y), 0.6);
  // What else stands toward the sun is asked of the sun's map from where the ray to the sun leaves the crown: the same ray, so the same
  // answer, but clear of the tree's own flat (and of its mesh, while the two hand over). Beyond the map the forest toward the sun shades
  // all but the tops.
  let wq: vec3f = wt + U.sunDir.xyz * (max(0.0, v.fx.y * (1.0 - 0.6 * hq) + 0.4 * v.fx.x - rs) / max(length(U.sunDir.xz), 0.2));
  var sh: f32 = shadowAt(wq + N * 0.25, 0.0003) * ownS;
  let cover: f32 = shadowCover(wq);
  if (cover < 0.999) { sh = sh * mix(exp(-v.fx.w * pow(1.0 - hq, 1.5)), 1.0, cover); }
  var col: vec3f = treeLight(s, V, sh);
  col += treeLamp(s, wt);
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`,Ys={FH:3.2,LS:1.2,LFY:.186,LI:.9},gs=(()=>{const e={enabled:!0,far:520,band:80,back:260,pre:40,vLand:21,lanterns:1,dye:1,wind:[1.2,.4],markers:null,stats:{gates:0,flags:0,tris:0}},s={a:{FH:3.2,YA:2.25,RX:.4,TH1:2.15,Y0:.5,cx:.74,cy:.84,bel:.12,bp:.8,ch:[1.34,.37,.058,.6]},b:{FH:2.55,YA:1.9,RX:.27,TH1:2.2,Y0:.8,cx:.22,cy:1.06,bel:.25,bp:.7,ch:[1.3,.22,.034,.36]}},w=16,x=56;typeof Dt<"u"&&Dt.def("flag","跳台旗",[["a","宽旗"],["b","羽毛旗"]],"b");const F=()=>typeof Dt<"u"&&s[Dt.val.flag]?Dt.val.flag:"b",we=.11,Y=.62,E=.085,D=Ys.LFY,be=12,ht=2e3,qe=10800,se=1800,_=6400,b=11,re=10;let m,J={},ae,X,ke=0,C=0,ne,Be,Ee,je,$e,nt,Ke,Fe,Ge,Je,le,Pe,pe,c,Ie,he,H,z=new Map,V=[],I=[],Q=null,L=0,ye=0,Ve=0,Ne=0;const Ce=(U,A)=>1-ge(-.002,.002,A-.03-(U-.5)*.06);function Ye(U){const{FH:A,YA:a,RX:oe,TH1:fe,Y0:O}=U,ie=A-a,ce=[[0,0,a]];{let K=0,ue=0,G=a;for(let Ae=1;Ae<=48;Ae++){const _e=fe*Ae/48,at=oe*(1-Math.cos(_e)),ot=a+ie*Math.sin(_e);K+=Math.hypot(at-ue,ot-G),ce.push([K,at,ot]),ue=at,G=ot}}const He=ce[48][0],We=a+He,Qe=K=>{if(K<=a)return[0,K,0,1];const ue=Math.min(K-a,He-1e-6);let G=1;for(;ce[G][0]<ue;)G++;const Ae=ce[G-1],_e=ce[G],at=(ue-Ae[0])/(_e[0]-Ae[0]),ot=_e[0]-Ae[0];return[Re(Ae[1],_e[1],at),Re(Ae[2],_e[2],at),(_e[1]-Ae[1])/ot,(_e[2]-Ae[2])/ot]},st=Qe(We),Le=K=>[Re(U.cx,st[0],K)+U.bel*Math.pow(Math.sin(h0*Math.pow(K,U.bp)),.9),Re(U.cy,st[1],K)],r=(K,ue)=>{const G=Qe(Re(O,We,ue)),Ae=Le(ue);return[Re(G[0],Ae[0],K),Re(G[1],Ae[1],K)]},q=[],k=[],ee=(...K)=>{for(const ue of K)q.push(ue)};for(let K=0;K<=x;K++)for(let ue=0;ue<=w;ue++){const G=ue/w,Ae=K/x,_e=.001,at=Math.min(Ae,1-_e),ot=r(G,Ae),t=r(G+_e,Ae),S=r(G,at),l=r(G,at+_e);ee(ot[0],ot[1],0,0,0,1,G,Ae,0,0,(t[0]-ot[0])/_e,(t[1]-ot[1])/_e,(l[0]-S[0])/_e,(l[1]-S[1])/_e)}for(let K=0;K<x;K++)for(let ue=0;ue<w;ue++){const G=K*(w+1)+ue;k.push(G,G+1,G+w+1,G+1,G+w+2,G+w+1)}const Z=(K,ue)=>{const G=q.length/14;for(const[Ae,_e,at,ot,t]of K)for(let S=0;S<ue;S++){const l=S/ue*It,u=Math.cos(l),v=Math.sin(l);ee(Ae,_e,0,u*ot,-u*at,v,0,_e/A,1,t,0,0,0,0)}for(let Ae=0;Ae<K.length-1;Ae++)for(let _e=0;_e<ue;_e++){const at=G+Ae*ue+_e,ot=G+Ae*ue+(_e+1)%ue;k.push(at,ot,at+ue,ot,ot+ue,at+ue)}};{const K=[];for(let ue=0;ue<=30;ue++){const G=-.35+(We+.35)*ue/30,Ae=Qe(Math.max(G,0));K.push([Ae[0],G<0?G:Ae[1],Ae[2],Ae[3],Re(.016,.0055,mt(G/We))])}Z(K,6)}return Z([[0,-.06,0,1,.027],[0,.07,0,1,.027],[0,.1,0,1,.017]],6),{V:new Float32Array(q),I:new Uint32Array(k)}}function T(){const U=[],A=[],a=(...ie)=>{for(const ce of ie)U.push(ce)};{const ce=[.045,.11,.2,.3,.42,.54,.66,.78,.9,1],He=U.length/10,We=st=>.42*(1+.2*Math.sin(st+.7)+.1*Math.sin(2*st+2.1)),Qe=(st,Le)=>{const r=Math.min(st/We(Le),1);return .08*(1+.22*Math.sin(2*Le+1.1)+.14*Math.sin(3*Le+.4))*(1-r*r)*(1-r*r)+.045*Math.exp(-(st*st)/.0035)};for(const st of ce)for(let Le=0;Le<16;Le++){const r=Le/16*It,q=Math.cos(r),k=Math.sin(r),ee=st*We(r),Z=.006,K=Qe(ee,r),ue=(Qe(ee+Z,r)-Qe(ee-Z,r))/(2*Z),G=(Qe(ee,r+Z)-Qe(ee,r-Z))/(2*Z)/ee,Ae=ue*q-G*k,_e=ue*k+G*q,at=Math.hypot(Ae,1,_e);a(ee*q,K,ee*k,-Ae/at,1/at,-_e/at,0,st,.8+.2*ge(.03,.22,ee),0)}for(let st=0;st<ce.length-1;st++)for(let Le=0;Le<16;Le++){const r=He+st*16+Le,q=He+st*16+(Le+1)%16;A.push(r,q,r+16,q,q+16,r+16)}}const oe=A.length,fe=(ie,ce,He)=>{const We=U.length/10,Qe=ie.length;for(let st=0;st<Qe;st++){const Le=ie[Math.max(st-1,0)],r=ie[Math.min(st+1,Qe-1)],q=r[0]-Le[0],k=r[1]-Le[1],ee=Math.hypot(q,k)||1,Z=k/ee,K=-q/ee;for(let ue=0;ue<ce;ue++){const G=ue/ce*It,Ae=Math.cos(G),_e=Math.sin(G);a(ie[st][0]*Ae,ie[st][1],ie[st][0]*_e,Z*Ae,K,Z*_e,He,ie[st][2]||0,1,1)}}for(let st=0;st<Qe-1;st++)for(let Le=0;Le<ce;Le++){const r=We+st*ce+Le,q=We+st*ce+(Le+1)%ce;A.push(r,q,r+ce,q,q+ce,r+ce)}};fe([[.078,-.06],[.078,.076],[.071,.089],[.042,.098],[.031,.1]],12,2),fe([[.031,.1],[.033,.104],[.033,.116],[.027,.12]],10,2),fe([[.029,.118,0],[.039,.131,.15],[.045,.151,.4],[.045,.172,.62],[.039,.192,.85],[.034,.205,1]],12,3),fe([[.036,.203],[.041,.208],[.041,.226],[.051,.231],[.045,.243],[.025,.256],[.01,.262],[0,.263]],10,2);const O=(ie,ce,He)=>{const We=U.length/10;for(let Qe=0;Qe<ie.length;Qe++){const st=ie[Math.max(Qe-1,0)],Le=ie[Math.min(Qe+1,ie.length-1)],r=f.norm(f.sub(Le,st)),q=f.norm(f.cross(r,[0,0,1])),k=f.cross(q,r);for(let ee=0;ee<He;ee++){const Z=ee/He*It,K=Math.cos(Z),ue=Math.sin(Z),G=[q[0]*K+k[0]*ue,q[1]*K+k[1]*ue,q[2]*K+k[2]*ue];a(ie[Qe][0]+G[0]*ce,ie[Qe][1]+G[1]*ce,ie[Qe][2]+G[2]*ce,G[0],G[1],G[2],2,0,1,1)}}for(let Qe=0;Qe<ie.length-1;Qe++)for(let st=0;st<He;st++){const Le=We+Qe*He+st,r=We+Qe*He+(st+1)%He;A.push(Le,r,Le+He,r,r+He,Le+He)}};for(const ie of[-1,1])O([[ie*.072,.082,0],[ie*.084,.108,0],[ie*.088,.15,0],[ie*.087,.192,0],[ie*.078,.219,0],[ie*.06,.234,0],[ie*.044,.238,0]],.0062,5);{const ie=[];for(let ce=0;ce<=12;ce++){const He=h0*ce/12;ie.push([-.089*Math.cos(He),.196+.112*Math.sin(He),-.034*Math.sin(He)])}O(ie,.0035,4)}for(let ie=0;ie<4;ie++){const ce=(ie+.5)*h0/2,He=Math.cos(ce),We=Math.sin(ce);O([[He*.04,.112,We*.04],[He*.053,.135,We*.053],[He*.055,.162,We*.055],[He*.052,.19,We*.052],[He*.042,.208,We*.042]],.0042,4)}for(const[ie,ce]of[[.128,.051],[.162,.056],[.194,.05]]){const He=[];for(let We=0;We<=16;We++){const Qe=It*We/16+.1;He.push([Math.cos(Qe)*ce,ie,Math.sin(Qe)*ce])}O(He,.0034,4)}return{V:new Float32Array(U),I:new Uint32Array(A),nDrift:oe}}e.init=function(U){m=U;const A=T();for(const He in s){const We=Ye(s[He]);J[He]={vb:m.buffer(We.V,"vertex"),ib:m.buffer(We.I,"index"),n:We.I.length,ch:s[He].ch}}const a=J.b.n;ae=m.buffer(A.V,"vertex"),X=m.buffer(A.I,"index"),ke=A.I.length,C=A.nDrift,e.stats.tris=(a+ke)/3;const oe=be*6;je=new Float32Array(oe*16),ne=m.buffer(je,"vertex",!0),$e=new Float32Array(oe*12),Be=m.buffer($e,"vertex",!0),nt=new Float32Array(oe*8),Ee=m.buffer(nt,"vertex",!0),Ke=m.buffer(new Float32Array(be*ht*b),"vertex",!0),Fe=m.buffer(new Uint32Array(be*qe),"index",!0),Ge=m.buffer(new Float32Array(be*se*re),"vertex",!0),Je=m.buffer(new Uint32Array(be*_),"index",!0);const fe={attrs:[["pos","vec3f"],["nrm","vec3f"],["uv","vec4f"],["tg","vec4f"]]},O={instanced:!0,attrs:[["i0","vec4f"],["i1","vec4f"],["i2","vec4f"],["i3","vec4f"]]};le=m.pipeline({name:"gateFlag",lib:[St.common,St.hash,St.fog,St.shadow,St.tonemap,Xs,Ca],buffers:[fe,O],cull:"none",varyings:{wp:"vec3f",nrm:"vec3f",uv:"vec4f",mp:"vec4f",ex:"vec4f",lp:"vec3f"},uniforms:{p:"vec4f"},textures:{tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:`fn vert(a: VIn) -> VOut { var v: VOut;
        let px: f32 = length(U.camPos.xyz - a.i0.xyz) * 2.0 * U.camRight.w * U.res.w;
        let f: FlagV = flagVertex(a.pos, a.nrm, a.uv, a.tg, a.i0, a.i1, a.i2, 0.6 * px, px);
        v.wp = f.wp; v.nrm = f.n; v.uv = a.uv; v.mp = vec4f(a.pos, a.i2.x); v.ex = vec4f(a.i2.z * flameK(a.i2.x), a.i2.w, 0.0, 0.0); v.lp = a.i0.xyz + a.i3.xyz;
        v.clip = U.viewProj * vec4f(f.wp, 1.0); return v; }`,fs:Wo}),Pe=m.pipeline({name:"gateFlagShadow",lib:[St.common,Ca],buffers:[fe,O],varyings:{},uniforms:{p:"vec4f"},textures:{},colorFormat:null,cull:"none",depthBias:2,depthBiasSlope:2.5,vs:"fn vert(a: VIn) -> VOut { var v: VOut; let f: FlagV = flagVertex(a.pos, a.nrm, a.uv, a.tg, a.i0, a.i1, a.i2, 0.03, 0.0); v.clip = U.shadowVP * vec4f(f.wp, 1.0); return v; }",fs:null});const ie=(He,We)=>m.pipeline(Object.assign({name:He,lib:[St.common,St.hash,St.fog,St.shadow,St.tonemap,Xs],cull:"none",buffers:[{attrs:[["pos","vec3f"],["nrm","vec3f"],["pm","vec4f"]]},{instanced:!0,attrs:[["j0","vec4f"],["j1","vec4f"],["j2","vec4f"]]}],varyings:{wp:"vec3f",nrm:"vec3f",pm:"vec4f",ex:"vec4f",lp:"vec3f"},uniforms:{p:"vec4f"},textures:{tDetail:"2d",tShadow:"shadow",tSky:"2d"},vs:Yo,fs:Xo},We));pe=ie("gateProp",{}),c=ie("gateDrift",{blend:"premul",depthWrite:!1,depthFunc:"lequal"});const ce=He=>`fn vert(a: VIn) -> VOut { var v: VOut;
        var wp: vec3f = a.pos + M.off.xyz;
        // (beyond the terrain's finest ring the drawn snow is a coarser copy of itself: the sheet rides a little higher the farther off it is)
        let d: f32 = length(U.camPos.xyz - wp);
        wp.y = wp.y + 0.004 + 0.00002 * d * d;
        v.wp = wp; ${He}
        v.clip = U.viewProj * vec4f(wp, 1.0);
        v.clip.z = v.clip.z - U.camFwd.w * (0.012 / max(v.clip.w, 0.05) + 0.0002 * v.clip.w);
        return v; }`;Ie=m.pipeline({name:"gatePool",lib:[St.common,St.hash,St.fog,Xs],buffers:[{attrs:[["pos","vec3f"],["nrm","vec3f"],["lp","vec4f"]]}],cull:"none",blend:"add",depthWrite:!1,depthFunc:"lequal",varyings:{wp:"vec3f",nrm:"vec3f",lp:"vec4f"},uniforms:{off:"vec4f",p:"vec4f"},textures:{tSnow:"2d",tSnowF:"2d",tNoise:"2d",tSky:"2d"},vs:ce("v.nrm = a.nrm; v.lp = vec4f(a.lp.xyz + M.off.xyz, a.lp.w);"),fs:Zo}),he=m.pipeline({name:"gateDye",lib:[St.common,St.hash,St.fog,Xs],buffers:[{attrs:[["pos","vec3f"],["st","vec4f"],["sd","vec4f"]]}],cull:"none",blend:"mul",depthWrite:!1,depthFunc:"lequal",varyings:{wp:"vec3f",st:"vec4f",sd:"vec4f"},uniforms:{off:"vec4f",p:"vec4f",l0:"vec4f",l1:"vec4f",l2:"vec4f",l3:"vec4f"},textures:{tDetail:"2d",tSky:"2d"},vs:ce("v.st = a.st; v.sd = a.sd;"),fs:Jo}),H=m.pipeline({name:"gateGlare",lib:[St.common,St.hash,St.fog,Xs],buffers:[{instanced:!0,attrs:[["g0","vec4f"],["g1","vec4f"]]}],topology:"strip",cull:"none",blend:"add",depthWrite:!1,depthFunc:"lequal",varyings:{uv:"vec2f",ex:"vec4f",wp:"vec3f"},uniforms:{p:"vec4f"},textures:{tSky:"2d"},vs:Qo,fs:en}),e.pipes=[le,Pe,pe,c,Ie,he,H],typeof At<"u"&&At.onMountain&&At.onMountain.push(()=>e.reset())},e.reset=function(){z.clear(),V=[],I.length=0,Q=typeof vt<"u"?vt.segs:null,ye=Ve=Ne=0};function Se(U,A,a,oe,fe,O,ie,ce,He,We,Qe){const Le=Math.floor(U/.5),r=Math.floor(a/.5),q=Math.ceil(A/.5)-Le+1,k=Math.ceil(oe/.5)-r+1,ee=O.length/ce;if(q<2||k<2||ee+q*k>He)return;const Z=new Float64Array((q+2)*(k+2)),K=(ue,G)=>Z[(G+1)*(q+2)+ue+1];for(let ue=-1;ue<=k;ue++)for(let G=-1;G<=q;G++)Z[(ue+1)*(q+2)+G+1]=vt.height((Le+G)*.5,(r+ue)*.5,.5);for(let ue=0;ue<k;ue++)for(let G=0;G<q;G++){const Ae=(K(G+1,ue)-K(G-1,ue))/1,_e=(K(G,ue+1)-K(G,ue-1))/(2*.5),at=Math.hypot(Ae,1,_e);We((Le+G)*.5,K(G,ue),(r+ue)*.5,-Ae/at,1/at,-_e/at)}for(let ue=0;ue<k-1;ue++)for(let G=0;G<q-1;G++){if(Qe&&!Qe((Le+G+.5)*.5,(r+ue+.5)*.5))continue;const Ae=ee+ue*q+G;ie.push(Ae,Ae+q,Ae+1,Ae+1,Ae+q,Ae+q+1)}}function me(U){const A={},a={},oe=(U[0][0]+U[1][0])/2,fe=-U[0][1],O=(U[1][0]-U[0][0])/2,ie=-U[2][1],ce=oe-vt.at(fe,A).cx,He=i=>vt.at(i,A).cx+ce,We=(i,y)=>vt.height(i,-y,.5),Qe=i=>{const y=He(i);return We(y,i)-.5*(We(y-O,i)+We(y+O,i))},st=i=>Qe(i+.5)+Qe(i-.5)-2*Qe(i);let Le=fe,r=1e9;for(let i=ie+2;i<=fe+6;i+=.5){const y=st(i);y<r&&(r=y,Le=i)}for(let i=Le-.375,y=Le+.4;i<y;i+=.125){const j=st(i);j<r&&(r=j,Le=i)}const q=Le-.87,k=He(q),ee=Qe(q);let Z=O-1.2;for(let i=1;i<O;i+=.1)if(.5*(We(k+i,q)+We(k-i,q))-.5*(We(k-O,q)+We(k+O,q))<.16*ee){Z=i;break}const K=(We(He(Le-.25),Le-.25)-We(He(Le-1.5),Le-1.5))/1.25,ue=e.vLand/Math.hypot(1,K),G=We(He(Le),Le);let Ae=22;for(let i=.15;i<3.5;i+=1/120){const y=Le+ue*i;if(G+K*ue*i-4.905*i*i<=We(He(y),y)){Ae=ue*i;break}}Ae=it(Ae,9,46);const _e={key:"",slot:-1,seen:0,s:Le,x:He(Le),mo:O,flags:[],an:[Math.round(He(Le)),Math.round(We(He(Le),Le)),Math.round(-Le)],dyeN:0,poolN:0,land:Ae,work:[],fade:0,lit:0},at=(i,y,j)=>{const W=vt.height(i,y,.5),h=vt.normal(i,y,.3),n=ms(Math.round(i*16),Math.round(y*16)),d=i+we,M=y+Y;_e.flags.push({x:i,y:W,z:y,row:j,sd:n,gx:-h[0]/h[1],gz:-h[2]/h[1],b:[0,0],bv:[0,0],wash:0,wy:0,lx:d,ly:vt.height(d,M,.5)-E,lz:M})};at(U[0][0],U[0][1],2),at(U[1][0],U[1][1],2),at(U[2][0],U[2][1],1),at(U[3][0],U[3][1],1);for(const i of[-1,1])e:for(const y of[0,-2,-4,2])for(const j of[0,3.5,-3.5,7,-7,10.5,-10.5,14]){const W=ie-1-e.pre+j-(i>0?.5:0),h=vt.at(W,A),n=it(h.cx+ce+i*(O+y),h.cx-h.hw+1.5,h.cx+h.hw-1.5);if(vt.nearTree(n,-W,a),!(a.ok&&!a.soft&&a.d<Math.max(3.2,(a.r||0)+1.3))){at(n,-W,0);break e}}const ot=_e.an,t=[],S=[],l=[],u=[],v=3.4,P=(i,y,j,W,h,n)=>Se(i,y,j,W,ot,t,S,b,ht,(d,M,g)=>{const R=h(d,-g);t.push(d-ot[0],M-ot[1],g-ot[2],R[0],R[1],R[2],R[3],R[4],R[5],R[6],0)},n),N=ms(Math.round(oe*8),Math.round(fe*8)),de=2*(Z+.5),te=Le+Ae,o=He(te),p=2*(O-1.6);_e.work.push(()=>P(k-de/2-.6,k+de/2+.6,-q-1.25,-q+1.6,(i,y)=>[i-k,y-q,de,1.5,N,0,1])),_e.work.push(()=>P(k-de/2-.6,k+de/2+.6,-Le+1.2,-Le+8.2,(i,y)=>[i-k,y-(Le-4.6),de*.94,5.4,N+.63,0,.52])),_e.work.push(()=>P(o-p/2-.6,o+p/2+.6,-te-1.4,-te+1.4,(i,y)=>[i-o,y-te,p,.95,N+.37,0,.92])),_e.work.push(()=>{for(const i of[-1,1]){const y=i*(Z-1.55),j=Math.max(ie+3,Le-9.5),W=Le-1.05,h=(j+W)/2,n=Math.min(He(j),He(W))+y,d=Math.max(He(j),He(W))+y;P(n-1,d+1,-W-.3,-j+.3,(M,g)=>[g-h,(M-He(g)-y)*i,W-j,.32,N+.11+.2*i,1,.9])}});for(let i=0;i<_e.flags.length;i+=2)_e.work.push(()=>{for(const y of _e.flags.slice(i,i+2))Se(y.lx-v,y.lx+v,y.lz-v,y.lz+v,ot,l,u,re,se,(j,W,h,n,d,M)=>l.push(j-ot[0],W-ot[1],h-ot[2],n,d,M,y.lx-ot[0],y.ly+D-ot[1],y.lz-ot[2],y.sd),(j,W)=>Math.hypot(j-y.lx,W-y.lz)<v)});return _e.work.push(()=>{const i=_e.slot,y=new Uint32Array(S.length>qe?S.slice(0,qe):S),j=new Uint32Array(u.length>_?u.slice(0,_):u);for(let W=0;W<y.length;W++)y[W]+=i*ht;for(let W=0;W<j.length;W++)j[W]+=i*se;y.length&&(m.updateBuffer(Ke,i*ht*b*4,new Float32Array(t)),m.updateBuffer(Fe,i*qe*4,y)),j.length&&(m.updateBuffer(Ge,i*se*re*4,new Float32Array(l)),m.updateBuffer(Je,i*_*4,j)),_e.dyeN=y.length,_e.poolN=j.length}),_e}function B(U){const A=U[0][0].toFixed(2)+","+U[0][1].toFixed(2);let a=z.get(A);if(!a){let oe=-1;for(let fe=0;fe<be;fe++)if(!V[fe]){oe=fe;break}if(oe<0)return;a=me(U),a.key=A,a.slot=oe,V[oe]=a,z.set(A,a)}a.seen=L}return e.update=function(U,A,a,oe,fe){if(ye=Ve=Ne=0,I.length=0,!e.enabled||!m)return;vt.segs!==Q&&e.reset();const O=U.pos[0],ie=U.pos[1],ce=U.pos[2],He=-ce,We=A[0],Qe=A[1],st=A[2],Le=Nt.sunElev;L++;let r=[];(e.markers||vt.markers)(He-e.back,He+e.far+e.pre+40,(_e,at)=>{r.push([_e,at]),r.length===4&&(B(r),r=[])});for(const[_e,at]of z)at.seen!==L&&(V[at.slot]=null,z.delete(_e));const q=typeof At<"u"&&At.state.wind?[At.state.wind[0],At.state.wind[2]]:e.wind,k=Math.hypot(q[0],q[1])||1,ee=q[0]/k,Z=q[1]/k,K=Math.atan2(Z,ee),ue=typeof zt<"u"?zt.s.v:[0,0,0],G=Math.hypot(ue[0],ue[2]);let Ae=!1;for(const _e of z.values()){const at=Math.hypot(_e.x-O,-_e.s-ce);if(_e.work.length)if(at<e.far*.8+30){for(const t of _e.work)t();_e.work.length=0}else Ae||(_e.work.shift()(),Ae=!0);const ot=ge(e.back-10,e.back-70,He-_e.s);_e.fade=ge(e.far*.8,e.far*.8-70,at)*ot,_e.lit=0,I.push(_e);for(const t of _e.flags){const S=.5+.5*P0(fe*.31-(t.x*ee+t.z*Z)*.06,7);if(oe>0&&a){const p=t.x-a[0],i=t.z-a[2],y=Math.hypot(p,i),j=a[1]-t.y;if(y<.85&&j<2.4&&j>-1.5&&G>1.5){const W=1-y/.85,h=ue[0]/G*.9+p/(y||1)*.45,n=ue[2]/G*.9+i/(y||1)*.45,d=Math.hypot(h,n)||1,M=Math.min(1.2,(.3+1.2*W)*ge(1.5,9,G)),g=1-Math.exp(-oe*42),R=t.b[0]+(h/d*M-t.b[0])*g,Ue=t.b[1]+(n/d*M-t.b[1])*g;t.b[0]=R,t.b[1]=Ue,t.bv[0]=t.bv[1]=0}else for(let n=0;n<2;n++)t.bv[n]=it(t.bv[n]+(-10.5*10.5*t.b[n]-2*.13*10.5*t.bv[n])*oe,-14,14),t.b[n]+=t.bv[n]*oe;if(y<3.6&&j<3&&G>4){t.wash=Math.min(1.5,t.wash+(1-y/3.6)*G*.3*oe);let W=Math.atan2(ue[2],ue[0])-K;t.wy=W-It*Math.round(W/It)}t.wash*=Math.exp(-oe*.85)}const l=Math.hypot(t.x-O,t.y-ie,t.z-ce),u=ge(e.far,e.far-e.band,l)*ot,v=Ce(t.sd,Le)*e.lanterns,P=K+.3*P0(fe*.23+t.sd*91,8)+.09*P0(fe*1.3+t.sd*17,9)+.5*t.wash*P0(fe*2.9+t.sd*29,10)+t.wy*.85*ge(.03,.8,t.wash),N=.03+.05*S,de=.007*Math.sin(fe*6.3+t.sd*40);let te=ye++*16;je[te]=t.x-We,je[te+1]=t.y-Qe,je[te+2]=t.z-st,je[te+3]=u,je[te+4]=Math.cos(P),je[te+5]=Math.sin(P),je[te+6]=t.b[0]+ee*N-Z*de,je[te+7]=t.b[1]+Z*N+ee*de,je[te+8]=t.sd,je[te+9]=Math.min(2.1,(.72+.56*S)*(1+.8*t.wash)),je[te+10]=v,je[te+11]=t.row,je[te+12]=t.lx-t.x,je[te+13]=t.ly+D-t.y,je[te+14]=t.lz-t.z,je[te+15]=0;const o=ge(170,120,l);o>0&&(te=Ve++*12,$e[te]=t.x-We,$e[te+1]=t.y-Qe,$e[te+2]=t.z-st,$e[te+3]=o,$e[te+4]=t.gx,$e[te+5]=t.gz,$e[te+6]=v,$e[te+7]=t.sd,$e[te+8]=t.lx-t.x,$e[te+9]=t.ly-t.y,$e[te+10]=t.lz-t.z,$e[te+11]=0),v>.002&&(_e.lit=1,te=Ne++*8,nt[te]=t.lx-We,nt[te+1]=t.ly+D-Qe,nt[te+2]=t.lz-st,nt[te+3]=v,nt[te+4]=t.sd,nt[te+5]=u,nt[te+6]=0,nt[te+7]=0)}}ye&&m.updateBuffer(ne,0,je.subarray(0,ye*16)),Ve&&m.updateBuffer(Be,0,$e.subarray(0,Ve*12)),Ne&&m.updateBuffer(Ee,0,nt.subarray(0,Ne*8)),e.stats.gates=I.length,e.stats.flags=ye},e.draw=function(U){const A=J[F()];ye&&m.draw(le,{u:{p:A.ch},tex:{tDetail:c0.detail,tShadow:U.shadowTex,tSky:Nt.lut},vb:[A.vb,ne],ib:A.ib,count:A.n,instances:ye}),Ve&&m.draw(pe,{u:{p:[0,0,0,0]},tex:{tDetail:c0.detail,tShadow:U.shadowTex,tSky:Nt.lut},vb:[ae,Be],ib:X,first:C,count:ke-C,instances:Ve})},e.drawShadow=function(){const U=J[F()];ye&&m.draw(Pe,{u:{p:U.ch},vb:[U.vb,ne],ib:U.ib,count:U.n,instances:ye})},e.drawOver=function(U){if(!I.length)return;const A=U.origin,a=Nt.sunElev;for(const O of I)O.lit&&O.poolN&&O.fade>0&&m.draw(Ie,{u:{off:[O.an[0]-A[0],O.an[1]-A[1],O.an[2]-A[2],O.fade],p:[a,e.lanterns,0,0]},tex:{tSnow:c0.snow,tSnowF:c0.snowFine,tNoise:c0.noise,tSky:Nt.lut},vb:[Ge],ib:Je,count:O.poolN,first:O.slot*_});const oe=ge(0,-.09,a),fe=(O,ie)=>{const ce=O.flags[ie];return ce?[ce.lx-A[0],ce.ly+D-A[1],ce.lz-A[2],Ce(ce.sd,a)*e.lanterns]:[0,-1e4,0,0]};if(e.dye>0)for(const O of I)O.dyeN&&O.fade>0&&m.draw(he,{u:{off:[O.an[0]-A[0],O.an[1]-A[1],O.an[2]-A[2],O.fade*e.dye],p:[oe,0,0,0],l0:fe(O,0),l1:fe(O,1),l2:fe(O,2),l3:fe(O,3)},tex:{tDetail:c0.detail,tSky:Nt.lut},vb:[Ke],ib:Fe,count:O.dyeN,first:O.slot*qe});Ve&&m.draw(c,{u:{p:[0,0,0,0]},tex:{tDetail:c0.detail,tShadow:U.shadowTex,tSky:Nt.lut},vb:[ae,Be],ib:X,first:0,count:C,instances:Ve}),Ne&&m.draw(H,{u:{p:[0,0,0,0]},tex:{tSky:Nt.lut},vb:[Ee],count:4,instances:Ne})},e.lantOn=Ce,e.live=I,e})(),la=Ys.LI.toFixed(2),Xs=`
fn lantCol() -> vec3f { return vec3f(1.0, 0.59, 0.22); }
// a flame is never quite steady
fn flameK(sd: f32) -> f32 { let t: f32 = U.camPos.w; return 1.0 + 0.08 * sin(t * 9.1 + sd * 50.0) * sin(t * 5.3 + sd * 31.0) + 0.035 * sin(t * 23.0 + sd * 17.0); }
fn lantOn(sd: f32, e: f32) -> f32 { return 1.0 - smoothstep(-0.002, 0.002, e - 0.03 - (sd - 0.5) * 0.06); }
fn gateSnow(N: vec3f, V: vec3f, sh: f32, ao: f32) -> vec3f {
  let L: vec3f = U.sunDir.xyz; let ndl: f32 = dot(N, L);
  let sdir: vec2f = normalize(L.xz + vec2f(1e-4, 0.0)); let tanE: f32 = L.y / max(length(L.xz), 1e-3);
  let back: f32 = saturate(dot(normalize(-V.xz + vec2f(1e-5, 0.0)), sdir));
  let mic: f32 = 1.0 - 0.75 * back * back * saturate(1.0 - tanE * 1.2);
  let amb: vec3f = U.ambSky.rgb * (1.3 + 0.8 * N.y) + U.ambGnd.rgb * (0.50 - 0.45 * N.y) + twiLight(N);
  return vec3f(0.93, 0.955, 0.985) * (U.sunCol.rgb * (saturate((ndl + 0.12) / 1.12) * sh * mic) + amb * ao);
}
`,Ca=`
struct FlagV { wp: vec3f, n: vec3f, }
// the wind in the cloth: trains of ripples that run out to the free edge and up the sail, none in step with another, on top of the slow
// swing of the whole sail. a = how far out from the pole (0..1): the sleeve cannot move, the free edge moves most
fn flagWave(a: f32, x: f32, y: f32, t: f32, ph: f32, gain: f32) -> f32 {
  let g: f32 = gain * (0.72 + 0.28 * sin(t * 0.83 + ph) * sin(t * 0.37 + ph * 1.7));
  let e: f32 = a * (0.55 + 0.45 * a);
  let th: f32 = x * 9.5 + y * 2.6 - t * 14.0 + ph;
  // (and the wind fills the sail: it bellies out from the pole to the free edge, deepest across its middle, more as the wind blows)
  return g * (e * (0.078 * sin(th - 0.45 * cos(th)) + 0.030 * sin(x * 15.0 - y * 4.3 - t * 23.0 + ph * 2.3))
            + a * (0.085 * a * sin(x * 4.2 + y * 1.3 - t * 6.4 + ph * 0.7) + 0.075 * sin(y * 1.9 - t * 2.6 + ph * 1.3))
            + 0.11 * sin(3.1416 * a) * (0.8 + 0.2 * sin(t * 1.1 + ph)));
}
fn turnAbout(p: vec3f, k: vec3f, ang: f32) -> vec3f { let c: f32 = cos(ang); return p * c + cross(k, p) * sin(ang) + k * (dot(k, p) * (1.0 - c)); }
// rmin: the least radius the pole is drawn with; px: metres to a pixel where the flag stands (0 = do not care)
fn flagVertex(pos: vec3f, nrm: vec3f, uv: vec4f, tg: vec4f, i0: vec4f, i1: vec4f, i2: vec4f, rmin: f32, px: f32) -> FlagV {
  var o: FlagV; var p: vec3f = pos; var n: vec3f = nrm;
  if (uv.z < 0.5) {
    let t: f32 = U.camPos.w; let ph: f32 = i2.x * 41.0; let e: f32 = 0.03;
    let gn: f32 = i2.y * (1.22 - 0.50 * uv.y);                         // (the foot of the sail is held least: the lower free corner moves most)
    let w0: f32 = flagWave(uv.x, pos.x, pos.y, t, ph, gn);
    let wa: f32 = flagWave(uv.x + e, pos.x + e * tg.x, pos.y + e * tg.y, t, ph, gn);
    let wb: f32 = flagWave(uv.x, pos.x + e * tg.z, pos.y + e * tg.w, t, ph, gn);
    // (cloth does not stretch: what it gains sideways it loses in reach. And a flag too far off to be two pixels wide is drawn that wide:
    // a banner a kilometre down the valley is a fleck of colour, not nothing)
    p = vec3f((pos.x - uv.x * (0.9 * w0 * w0 + 0.025 * i2.y)) * max(1.0, 2.6 * px), pos.y, w0);
    n = normalize(cross(vec3f(tg.x, tg.y, (wa - w0) / e), vec3f(tg.z, tg.w, (wb - w0) / e)));
  } else {
    p = pos + nrm * max(uv.w, rmin);
  }
  // the sail swivels on its pole and lies down the wind
  var q: vec3f = vec3f(p.x * i1.x - p.z * i1.y, p.y, p.x * i1.y + p.z * i1.x);
  var m: vec3f = vec3f(n.x * i1.x - n.z * i1.y, n.y, n.x * i1.y + n.z * i1.x);
  // the pole is whippy: it leans with the gusts, and goes right over when a skier's shoulder takes it. Each height is turned about the
  // foot by its own share of the lean (little near the snow, most at the tip)
  let bl: f32 = length(i1.zw);
  if (bl > 0.0004) {
    let h: f32 = saturate(q.y / ${Ys.FH.toFixed(2)}); let ang: f32 = bl * (1.5 * h - 0.5 * h * h);
    let k: vec3f = vec3f(i1.w, 0.0, -i1.z) / bl;
    q = turnAbout(q, k, ang); m = turnAbout(m, k, ang);
  }
  o.wp = i0.xyz + q * i0.w; o.n = m;
  return o;
}
`,Wo=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let L: vec3f = U.sunDir.xyz;
  var N: vec3f = normalize(v.nrm);
  let px: f32 = dist * 2.0 * U.camRight.w * U.res.w;                       // metres to a pixel out there
  let y: f32 = v.mp.y;
  let wv: vec4f = tex(tDetail, v.mp.xy * 3.3 + v.mp.w);
  let sh: f32 = shadowAt(v.wp, 0.0016);
  // the lantern at its foot, and the skier's headlamp
  let lv: vec3f = v.lp - v.wp; let l2: f32 = dot(lv, lv); let Ll: vec3f = lv * inverseSqrt(max(l2, 1e-4));
  let El: vec3f = lantCol() * (v.ex.x * ${la} / (l2 + 0.03));
  let Eh: vec3f = lampLight(v.wp); let Lh: vec3f = normalize(U.lamp.xyz - v.wp);
  var col: vec3f = vec3f(0.0);
  if (v.uv.z < 0.5) {
    if (dot(N, V) < 0.0) { N = -N; }
    let a: f32 = v.uv.x; let b: f32 = v.uv.y;
    // creases, and the knit of the cloth
    let cr: vec4f = tex(tDetail, v.mp.xy * vec2f(0.55, 0.31) + v.mp.w * 3.0);
    // (a sail pulled on its pole wrinkles in long folds that fan out from the sleeve and slant down toward the free edge; they move as it flaps)
    let fw: f32 = (a * 1.0 - y * 0.55) * 14.0 + 1.6 * cr.z + U.camPos.w * 1.7 + v.mp.w * 13.0;
    let fold: f32 = cos(fw) * (0.30 + 0.70 * a) * (1.0 - a * 0.5) * smoothstep(0.02, 0.15, a);
    N = normalize(N + (vec3f(cr.x, cr.y, 0.5) - 0.5) * 0.30 + (vec3f(wv.x, wv.y, 0.5) - 0.5) * 0.10 + vec3f(0.55, -0.30, 0.0) * (fold * 0.60 * (1.0 - smoothstep(0.8, 2.5, fwidth(fw)))));
    // the banner: an orange field, a dark sleeve round the pole, white chevrons pointing down, a doubled hem
    let ew: f32 = max(0.006, 0.6 * px);
    let sleeve: f32 = 1.0 - smoothstep(0.060 - ew * 1.4, 0.060 + ew * 1.4, a);
    let ac: f32 = abs(a - 0.54);
    var chev: f32 = 0.0;
    // (they count down to the lip: three on the pair up the hill, two where the run-in begins, one at the lip itself)
    let nch: f32 = 3.0 - floor(v.ex.y + 0.5);
    // (where they sit is the cut's: M.p = first, step, half width, how steep the arms)
    for (var i: i32 = 0; i < 3; i++) { let dq: f32 = abs(y - M.p.x - 0.5 * M.p.y * (3.0 - nch) - M.p.y * f32(i) - ac * M.p.w); chev = max(chev, (1.0 - smoothstep(M.p.z - ew, M.p.z + ew, dq)) * step(f32(i) + 0.5, nch)); }
    chev *= (1.0 - smoothstep(0.40, 0.44, ac)) * (1.0 - sleeve);
    // the hem: the cloth turned back on itself and stitched, along the free edge and the foot. Doubled, it lets less light through and
    // reads as a darker line round the sail, as a real one does
    let hw: f32 = max(0.035, 1.2 * ew);
    let hem: f32 = max(smoothstep(1.0 - hw - 0.012, 1.0 - hw, a), 1.0 - smoothstep(0.010, 0.022, b)) * (1.0 - sleeve);
    // (printed polyester, not a safety-vest orange: a red-orange with some grey in it; in the folds' troughs it lies in its own shade)
    let trough: f32 = (1.0 - 0.45 * saturate(-fold) * (1.0 - smoothstep(0.8, 2.5, fwidth(fw)))) * (0.80 + 0.20 * smoothstep(0.05, 0.35, a));
    var alb: vec3f = mix(vec3f(0.58, 0.21, 0.09), vec3f(0.78, 0.77, 0.73), chev) * (1.0 - 0.22 * hem) * trough;
    var thr: vec3f = mix(vec3f(0.56, 0.18, 0.04), vec3f(0.50, 0.47, 0.41), chev) * (1.0 - 0.62 * hem) * (0.86 + 0.28 * wv.w);
    alb = mix(alb, vec3f(0.016, 0.018, 0.022), sleeve); thr *= 1.0 - sleeve;
    // snow blown onto the foot of the sail
    let dusty: f32 = (1.0 - smoothstep(0.52, 1.05, y)) * smoothstep(0.50, 0.68, wv.z * 0.6 + cr.w * 0.4 + 0.22 * (1.0 - smoothstep(0.5, 0.8, y)));
    alb = mix(alb, vec3f(0.90, 0.92, 0.95), dusty * 0.85); thr = mix(thr, vec3f(0.30, 0.31, 0.33), dusty * 0.85);
    let ndl: f32 = dot(N, L);
    let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
    let ambB: vec3f = U.ambSky.rgb * (0.5 - 0.5 * N.y) + U.ambGnd.rgb * (0.5 + 0.5 * N.y) * 1.25 + twiLight(-N);
    // lit from the lens's side it is a matt orange; with the sun behind it the light comes through the cloth and the flag glows, most of
    // all where the line of sight runs on toward the sun
    // (light that meets the cloth on the slant has farther to go through the weave: every fold shows as a darker band. On the lit side
    // the nylon has a soft sheen)
    let fwd: f32 = pow(saturate(dot(-V, L)), 5.0);
    let tk: f32 = saturate(0.06 - ndl * 1.06); let thru: f32 = tk * tk * (0.6 + 0.4 * tk) * (0.30 + 2.4 * fwd);
    let sheen: f32 = 0.20 * pow(saturate(dot(N, normalize(V + L))), 22.0) * saturate(ndl * 3.0) * (1.0 - sleeve);
    col = alb * (U.sunCol.rgb * (saturate((ndl + 0.12) / 1.12) * sh) + amb)
        + thr * (U.sunCol.rgb * (thru * sh) + ambB * 0.9) + U.sunCol.rgb * (sheen * sh);
    // lantern and headlamp: the same cloth, lit from whichever side they stand on
    let nl: f32 = dot(N, Ll); let nh: f32 = dot(N, Lh);
    col += El * (alb * saturate((nl + 0.2) / 1.2) + thr * saturate((0.2 - nl) / 1.2));
    col += Eh * (alb * saturate((nh + 0.2) / 1.2) + thr * saturate((0.2 - nh) / 1.2));
  } else {
    // the pole: black glass fibre, snow plastered on its foot
    let ndv: f32 = saturate(dot(N, V));
    let snowy: f32 = (1.0 - smoothstep(0.10, 0.55, y)) * smoothstep(0.34, 0.58, wv.z + 0.25 * (1.0 - smoothstep(0.0, 0.2, y)));
    let alb: vec3f = mix(vec3f(0.030, 0.032, 0.038), vec3f(0.90, 0.92, 0.95), snowy);
    let ndl: f32 = dot(N, L);
    let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
    col = alb * (U.sunCol.rgb * (saturate(ndl) * sh) + amb) + U.sunCol.rgb * (sh * 0.35 * (1.0 - snowy) * pow(max(dot(N, normalize(V + L)), 0.0), 48.0) * saturate(ndl * 4.0));
    // (against the light a thin dark pole would be lost: the sun finds its edge)
    col += U.sunCol.rgb * (0.10 * pow(1.0 - ndv, 2.0) * saturate(dot(-V, L)) * sh);
    col += alb * (El * saturate(dot(N, Ll) * 0.7 + 0.3) + Eh * saturate(dot(N, Lh) * 0.7 + 0.3));
  }
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`,Yo=`
fn vert(a: VIn) -> VOut { var v: VOut;
  var wp: vec3f = vec3f(0.0); var n: vec3f = a.nrm;
  if (a.pm.w > 0.5) {
    // the lantern: upright, standing any way round
    let an: f32 = a.j1.w * 6.2832; let c: f32 = cos(an); let s: f32 = sin(an);
    wp = a.j0.xyz + a.j2.xyz + vec3f(a.pos.x * c - a.pos.z * s, a.pos.y, a.pos.x * s + a.pos.z * c) * (a.j0.w * ${Ys.LS.toFixed(2)});
    n = vec3f(a.nrm.x * c - a.nrm.z * s, a.nrm.y, a.nrm.x * s + a.nrm.z * c);
  } else {
    // the drift round the foot of the pole lies on the slope
    wp = a.j0.xyz + vec3f(a.pos.x, a.pos.y + dot(a.j1.xy, a.pos.xz), a.pos.z) * a.j0.w;
    n = normalize(vec3f(a.nrm.x - a.j1.x * a.nrm.y, a.nrm.y, a.nrm.z - a.j1.y * a.nrm.y));
  }
  v.wp = wp; v.nrm = n; v.pm = a.pm; v.ex = vec4f(a.j1.z * flameK(a.j1.w), a.j1.w, 0.0, 0.0); v.lp = a.j0.xyz + a.j2.xyz + vec3f(0.0, ${Ys.LFY.toFixed(3)}, 0.0);
  v.clip = U.viewProj * vec4f(wp, 1.0);
  // (the drift is laid over the snow that is already drawn: a few centimetres nearer the lens than it lies, so that snow never cuts through it)
  if (a.pm.w < 0.5) { v.clip.z = v.clip.z - U.camFwd.w * 0.05 / max(v.clip.w, 0.05); }
  return v; }
`,Xo=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let L: vec3f = U.sunDir.xyz;
  var N: vec3f = normalize(v.nrm);
  let part: f32 = floor(v.pm.x + 0.5); let k: f32 = v.ex.x;
  let sh: f32 = shadowAt(v.wp + N * 0.03, 0.0016);
  let lv: vec3f = v.lp - v.wp; let l2: f32 = dot(lv, lv); let Ll: vec3f = lv * inverseSqrt(max(l2, 1e-4));
  let El: vec3f = lantCol() * (k * ${la} / (l2 + 0.02));
  let Eh: vec3f = lampLight(v.wp); let Lh: vec3f = normalize(U.lamp.xyz - v.wp);
  let nz: vec4f = tex(tDetail, (v.wp.xz + U.origin.xz) * 1.75 + v.wp.yy * 0.9);
  var col: vec3f = vec3f(0.0); var al: f32 = 1.0;
  if (part < 0.5) {
    // the drift at the pole
    N = normalize(N + vec3f(nz.x - 0.5, 0.0, nz.y - 0.5) * 0.40);
    col = gateSnow(N, V, sh, v.pm.z);
    col += vec3f(0.93, 0.955, 0.985) * (El * saturate((dot(N, Ll) + 0.3) / 1.3) + Eh * saturate((dot(N, Lh) + 0.1) / 1.1));
    al = 1.0 - smoothstep(0.42, 0.97, v.pm.y + (nz.z - 0.5) * 0.25);
  } else {
    let ndv: f32 = abs(dot(N, V)); if (dot(N, V) < 0.0) { N = -N; }
    let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
    let Hh: vec3f = normalize(V + L);
    if (part > 2.5) {
      // the globe: by day you look through it at the snow beyond (greyed and greened by two walls of old glass, darkest at its edges)
      // and at the burner standing in it; alight, a flame stands there instead, brightest where the eye looks through its middle
      let R: vec3f = reflect(-V, N);
      let env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
      let fr: f32 = 0.04 + 0.96 * pow(1.0 - ndv, 5.0); let vv: f32 = v.pm.y;
      let stub: f32 = (1.0 - smoothstep(0.16, 0.34, vv)) * smoothstep(0.62, 0.86, ndv);
      let thru: vec3f = gateSnow(vec3f(0.0, 1.0, 0.0), V, sh, 0.75) * vec3f(0.60, 0.70, 0.68) * (0.30 + 0.70 * ndv);
      col = mix(thru, vec3f(0.03) * amb, stub) * (1.0 - fr) + env * (fr * 0.45);
      col += U.sunCol.rgb * (sh * (0.9 * pow(max(dot(N, Hh), 0.0), 220.0) + 0.05 * pow(max(dot(N, Hh), 0.0), 12.0)));
      // (on a round globe the normal says where across it the eye is looking: the flame is a tear of light standing on the wick,
      // leaning and shivering; the glass about it glows)
      let band: f32 = smoothstep(0.0, 0.30, vv) * (1.0 - smoothstep(0.50, 1.0, vv));
      let f: f32 = (vv - 0.14) / 0.52; let tt: f32 = U.camPos.w; let sd: f32 = v.ex.y;
      let lat: f32 = dot(N, U.camRight.xyz) - f * (0.10 * sin(tt * 7.3 + sd * 40.0) + 0.05 * sin(tt * 17.0 + sd * 23.0));
      let wd: f32 = 0.72 * sqrt(saturate(f)) * saturate(1.0 - f);
      let fl: f32 = (1.0 - smoothstep(wd * 0.30, wd + 0.03, abs(lat))) * step(0.0, f) * step(f, 1.0);
      col += lantCol() * (k * (0.50 + 1.4 * ndv * band + 5.0 * fl)) + vec3f(1.0, 0.84, 0.56) * (k * 34.0 * fl * fl);
    } else {
      // black enamelled iron, snow lying wherever it can (and warmed by its own flame)
      let snowy: f32 = smoothstep(0.50, 0.80, N.y + (nz.z - 0.5) * 0.7);
      let alb: vec3f = mix(vec3f(0.020, 0.021, 0.024), vec3f(0.90, 0.92, 0.95), snowy);
      let ndl: f32 = dot(N, L);
      col = alb * (U.sunCol.rgb * (saturate(ndl) * sh) + amb) + U.sunCol.rgb * (sh * (1.0 - snowy) * 0.6 * pow(max(dot(N, Hh), 0.0), 48.0) * saturate(ndl * 4.0));
      col += skyLut(normalize(vec3f(N.x, abs(N.y) + 0.05, N.z))) * (0.05 * pow(1.0 - ndv, 3.0) * (1.0 - snowy));
      // (so near the flame the iron would burn out: it stays what it is, a dark frame against the glow, with a warm edge)
      col += alb * (min(El, vec3f(7.0)) * saturate(dot(N, Ll) * 0.5 + 0.5) + Eh * saturate(dot(N, Lh) * 0.7 + 0.3)) + lantCol() * (k * 0.10 * pow(1.0 - ndv, 2.0) * (1.0 - snowy));
    }
  }
  col = applyFog(col, v.wp);
  o.color = vec4f(col * al, al);
  return o;
}
`,Zo=`
fn poolSpark(wxz: vec2f, cell: f32, N: vec3f, Hh: vec3f, ja: vec2f, jb: vec2f, idet: f32) -> vec3f {
  let g: vec2f = wxz / cell; let id: vec2f = floor(g);
  let r: vec4f = texLod(tNoise, (id + 0.5) / 256.0, 0.0);
  let tilt: vec2f = (r.xz - 0.5) * (0.30 + 2.3 * r.y * r.y);
  let n: vec3f = normalize(N + vec3f(tilt.x, 0.0, tilt.y));
  let w: vec2f = (g - id - 0.5 - (r.yw - 0.5) * 0.4) * cell;
  let px: vec2f = vec2f(w.x * jb.y - w.y * jb.x, w.y * ja.x - w.x * ja.y) * idet;
  let shape: f32 = saturate(1.0 - dot(px, px) / (1.2 + 1.6 * r.w));
  return mix(vec3f(1.0), 0.55 + 0.75 * cos(6.2832 * (r.z + vec3f(0.0, 0.33, 0.67))), 0.45 * r.x) * (pow(max(dot(n, Hh), 0.0), 380.0) * shape * shape);
}
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let wp: vec3f = v.wp; let toC: vec3f = U.camPos.xyz - wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let lv: vec3f = v.lp.xyz - wp; let l2: f32 = dot(lv, lv); let Ll: vec3f = lv * inverseSqrt(max(l2, 1e-4));
  let k: f32 = lantOn(v.lp.w, M.p.x) * M.p.y * flameK(v.lp.w) * M.off.w;
  let wxz: vec2f = wp.xz + U.origin.xz;
  let d1: vec4f = tex(tSnow, wxz / 12.8); let d2: vec4f = tex(tSnowF, wxz / 2.56 + vec2f(0.37, 0.11));
  let q1: vec2f = d1.xy * 2.0 - 1.0; let q2: vec2f = d2.xy * 2.0 - 1.0;
  let f1: f32 = smoothstep(420.0, 40.0, dist); let f2: f32 = smoothstep(46.0, 5.0, dist);
  let gm: vec3f = normalize(v.nrm);
  let slope: vec2f = -gm.xz / max(gm.y, 0.2) + q1 * abs(q1) * (0.81 * f1) + q2 * abs(q2) * (0.81 * f2);
  let N: vec3f = normalize(vec3f(-slope.x, 1.0, -slope.y));
  // what arrives: inverse square from the flame, on a surface that scatters it on under its skin (so it does not go black at a grazing angle)
  let nl: f32 = saturate((dot(N, Ll) + 0.30) / 1.30);
  let r: f32 = length(lv.xz);
  var E: f32 = k * ${la} * (nl / (l2 + 0.02) + 0.30 * exp(-r / 0.45));
  E *= 1.0 - smoothstep(2.3, 3.3, r);
  let ja: vec2f = dpdx(wxz); let jb: vec2f = dpdy(wxz);
  let det: f32 = ja.x * jb.y - ja.y * jb.x; let idet: f32 = det / (det * det + 1e-12);
  let lvl: f32 = log2(max(max(length(ja), length(jb)), 0.0004) * 6.0 / 0.004); let l0: f32 = floor(lvl); let c0: f32 = 0.004 * exp2(l0);
  let Hh: vec3f = normalize(V + Ll);
  let sp: vec3f = mix(poolSpark(wxz + vec2f(4.1, 2.3), c0, N, Hh, ja, jb, idet), poolSpark(wxz + vec2f(7.9, 5.6), c0 * 2.0, N, Hh, ja, jb, idet), lvl - l0);
  var col: vec3f = lantCol() * E * (vec3f(0.93, 0.955, 0.985) + sp * (26.0 * U.fx.y * smoothstep(300.0, 20.0, dist)));
  col *= 1.0 - fogAmount(wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`,Jo=`
fn lantE(l: vec4f, wp: vec3f) -> f32 { let d: vec3f = l.xyz - wp; return l.w * ${la} * 0.62 / (dot(d, d) + 0.03); }
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let p: f32 = v.st.x; let q: f32 = v.st.y; let len: f32 = v.st.z; let sd: f32 = v.sd.x;
  // the line wanders, swells and thins as the walker's arm does
  let n0: vec4f = tex(tDetail, vec2f(p * 0.027 + sd * 7.3, sd * 3.1 + 0.2));
  let n1: vec4f = tex(tDetail, vec2f(p * 0.11 + sd * 3.7, sd * 5.3 + 0.6));
  let c: f32 = ((n0.z - 0.5) * 0.85 + (n1.z - 0.5) * 0.16) * mix(1.0, 0.4, v.sd.y);
  // (seen from far up the hill, along the snow, a band a stride wide is thinner than a pixel and would be lost: it is never drawn
  // thinner than a two-hundredth of the picture's height, as far as its sheet reaches. A line stays a line)
  let fp: f32 = abs(dpdx(q)) + abs(dpdy(q));                          // metres across the stroke to a pixel
  // (a band drawn wider than it is, to stay in the picture, is drawn paler by as much: the same dye spread over more pixels. Far off
  // it is a soft tint across the snow, never an even stroke of ink)
  let wt: f32 = v.st.w * (0.74 + 0.52 * n1.x) * mix(1.0, 0.55 + 0.45 * smoothstep(-0.5, 0.5, p / len), v.sd.y);
  let w: f32 = max(wt, fp * max(1.8, 0.0034 * U.res.y));
  let cov: f32 = 0.55 + 0.45 * saturate(wt / w);
  let fine: vec4f = tex(tDetail, vec2f(p, q) * 0.83 + sd);
  let grain: vec4f = tex(tDetail, vec2f(p, q) * 3.9 + sd * 2.0);
  let blot: vec4f = tex(tDetail, vec2f(p * 0.37 + sd * 1.7, q * 0.52 + sd * 4.1));
  let d: f32 = abs(q - c) - 0.5 * w;                                  // > 0: outside the band the nozzle covered
  let edge: f32 = d + (fine.z - 0.5) * 0.34 + (blot.z - 0.5) * 0.30 + (grain.z - 0.5) * 0.08;
  let aw: f32 = max(0.03, 0.5 * fp);
  // (the spray is thickest down the middle of the pass and fades over a forearm's width: a nozzle throws a cone, not a brush; the
  // colour is never even: the walker hurries and lingers, and the passes overlap)
  let mot: vec4f = tex(tDetail, vec2f(p * 0.21 + sd * 9.0, q * 0.35 + sd * 2.0));
  let core: f32 = (1.0 - smoothstep(-0.30 - aw, 0.10 + aw, edge)) * (0.48 + 0.52 * smoothstep(0.26, 0.66, mot.z * 0.5 + fine.z * 0.3 + blot.x * 0.2));
  let soak: f32 = 0.34 * exp(-max(edge, 0.0) / 0.14);                 // it creeps outward through the grains
  let drop: vec4f = tex(tDetail, vec2f(p, q) * 1.9 + sd * 4.0);
  let mist: f32 = 0.55 * exp(-max(d, 0.0) / 0.26) * smoothstep(0.64, 0.76, drop.z);   // and droplets fell wide of it
  var rho: f32 = max(core, max(soak, mist));
  // the snow takes it grain by grain: a crystal here drinks it, the one beside it is still white, and in the hollows between the clods
  // it pools. (Noise fixed to the snow at two and five centimetres; the mip chain evens it out to its mean as it falls under a pixel)
  let gA: f32 = tex(tDetail, v.wp.xz * 0.135 + sd).w;
  let gB: f32 = tex(tDetail, v.wp.xz * 0.052 + sd * 3.0).w;
  let gC: f32 = tex(tDetail, v.wp.xz * 0.019 + sd * 5.0).z;
  let gr: f32 = smoothstep(0.22, 0.78, gA * 0.5 + gB * 0.3 + gC * 0.2);
  rho = saturate(rho * (0.20 + 1.60 * gr) - 0.06 * (1.0 - gr)) * cov;
  // every skier before you has gone over it: where most of them go the colour is worn thin in streaks, and a little of it has been
  // dragged on down the hill. (The streaks are read along a slanting line through the noise, so no stretch of them comes round again;
  // and they come in bunches: here a dozen have taken the same line, there nobody has)
  let str: vec4f = tex(tDetail, vec2f(p * 1.3 + sd * 5.0, q * 0.06 + p * 0.043 + sd * 3.0));
  let bun: vec4f = tex(tDetail, vec2f(p * 0.083 + sd * 2.0, p * 0.011 + sd * 7.0));
  let mid: f32 = exp(-sq(p / (0.26 * len))) * (1.0 - v.sd.y) * smoothstep(0.30, 0.62, bun.z + 0.12);
  rho *= 1.0 - mid * (0.06 + 0.36 * smoothstep(0.40, 0.60, str.z + (bun.x - 0.5) * 0.25));
  rho = max(rho, 0.34 * mid * smoothstep(0.50, 0.68, str.z) * exp(-max(q - 0.3 * v.st.w, 0.0) / 0.55) * step(0.0, q) * (1.0 - smoothstep(0.85, 1.20, q)));
  // it stops where the walker stopped; a line down the hill fades out toward its upper end
  rho *= smoothstep(0.0, 0.7, 0.5 * len - abs(p) + (fine.z - 0.5) * 0.5) * mix(1.0, smoothstep(-0.52, -0.05, p / len), v.sd.y);
  // (the walker sprays the top and the edges; on the steep walls of the kicker the dye only runs a little way down, it does not streak)
  let nw: vec3f = normalize(cross(dpdx(v.wp), dpdy(v.wp)));
  rho *= smoothstep(0.84, 0.95, abs(nw.y));
  // (seen along the snow, the light that comes back from it has mostly been thrown off the tops of the grains, which the dye has
  // hardly reached: at a grazing look the colour fades toward the snow's own)
  let ndv: f32 = abs(dot(nw, normalize(U.camPos.xyz - v.wp)));
  rho *= mix(0.72, 1.0, smoothstep(0.03, 0.30, ndv));
  rho *= v.sd.z * M.off.w * (1.0 - fogAmount(v.wp));
  // (a dye takes its share of the light at every grain it passes: thin, it is a pale cyan; thick, a deep blue. Marking dye on snow is
  // never the blue of the bottle: wet into the grains and lit through them it is greyed toward the snow, and the deepest of it is a
  // dense slate blue, not ink)
  let Td: vec3f = pow(vec3f(0.13, 0.32, 0.74), vec3f(saturate(rho) * 1.05));
  // (by night it is pigment in the dark: a blue dye under a blue moon is a dull navy stain that only just reads, the snow round it
  // already lit in the moon's own colour. Where the headlamp or a lantern falls on it, the light is warm and bright enough to show
  // the colour, and there it is blue again. So: how much of the light here is lamp or lantern, against the moon and the sky)
  var El: f32 = dot(lampLight(v.wp), vec3f(0.3, 0.55, 0.15));
  El += lantE(M.l0, v.wp) + lantE(M.l1, v.wp) + lantE(M.l2, v.wp) + lantE(M.l3, v.wp);
  let Dn: f32 = dot(U.sunCol.rgb, vec3f(0.3, 0.55, 0.15)) * max(U.sunDir.y, 0.0) + dot(U.ambSky.rgb, vec3f(0.3, 0.55, 0.15)) * 1.6;
  let lit: f32 = smoothstep(0.15, 0.75, El / (El + Dn + 1e-5));
  let Tn: vec3f = pow(vec3f(0.30, 0.33, 0.42), vec3f(saturate(rho) * 1.05));
  o.color = vec4f(mix(Td, Tn, M.p.x * (1.0 - lit)), 1.0);
  return o;
}
`,Qo=`
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  var c: vec3f = a.g0.xyz; let d: f32 = length(U.camPos.xyz - c);
  // (the flame stands a hand above the snow: from far off that is less than a pixel, and the snow in front of it, a pixel lower on the
  // screen, would cut its core in half. A far light must not come and go with the ground: from far off it is drawn two pixels above
  // its foot. And it is drawn a little nearer the lens than it stands: a hand's width near to, so its own lantern does not cover it,
  // a twentieth of the way from far off, where the snow is drawn coarser and may stand a little proud of the true ground. Whatever
  // really stands in front of it, a tree or the hill, still hides it)
  c.y = c.y + max(0.0, 4.0 * U.camRight.w * U.res.w * d - 0.10);
  let toC: vec3f = U.camPos.xyz - c;
  let pull: f32 = min(0.20 + 0.05 * max(d - 4.0, 0.0), 0.5 * d);
  let cp: vec4f = U.viewProj * vec4f(c + toC * (pull / max(d, 0.25)), 1.0);
  let rw: f32 = 0.85 / (max(d, 0.1) * U.camRight.w);                   // its true reach on the screen (0.85 m of glow), in half-heights
  let r: f32 = max(rw, 0.072);                                         // (and never less than the aureole, which keeps its size on the screen)
  v.clip = vec4f(cp.x + corner.x * r / U.camUp.w * cp.w, cp.y + corner.y * r * cp.w, cp.z, cp.w);
  v.uv = corner; v.ex = vec4f(a.g0.w * flameK(a.g1.x) * a.g1.y, rw / r, r * 0.5 * U.res.y, a.g1.x); v.wp = c;
  return v; }
`,en=`
fn frag(v: VOut) -> FOut { var o: FOut;
  let d: f32 = length(v.uv); if (d >= 1.0) { discard; }
  let s: f32 = v.ex.y; let rpx: f32 = v.ex.z;                        // s: 1 = drawn at its true size, less = enlarged to stay on the screen
  let F: f32 = sq(s * rpx);                                          // the light that lands on one pixel if all of the flame does (1 = film white)
  // the core: the flame itself (a thumb's width), or a pixel and a bit, whichever is larger
  let cw: f32 = max(0.026 * s, 1.15 / rpx);
  let core: f32 = exp(-sq(d / cw)) * min(14.0, F);
  // frost in the air: a small aureole that keeps its size on the screen however far the lamp, and the wider glow that belongs to the place
  let aur: f32 = min(0.60, 0.22 * sqrt(F)) * exp(-d * rpx / (0.008 * U.res.y));
  let dw: f32 = min(d / s, 1.0); let halo: f32 = exp(-dw * 5.5) * sq(1.0 - dw);
  // a few thin rays from the iris, as the sun has: only for a lamp near enough to be more than a point
  let an: f32 = atan2(v.uv.y, v.uv.x) / 6.2832 * 14.0 + 0.31; let da: f32 = (an - floor(an + 0.5)) * 0.4488;
  let ray: f32 = exp(-sq(dw * sin(da) / (0.004 + 0.02 * dw))) * exp(-dw * 10.0) * (1.0 - dw) * s * s;
  let col: vec3f = (vec3f(1.0, 0.82, 0.55) * core + lantCol() * (aur + halo * 0.34 + ray * 0.8)) * v.ex.x;
  o.color = vec4f(col * (1.0 - fogAmount(v.wp)) * sq(1.0 - d * d), 1.0);
  return o; }
`,ns=(()=>{const e={enabled:!1,lamp:!0,lampAir:.012,div:2,range:170,sigma:.003,H0:9,g:.8,wispScale:.085,wispLo:.28,wispHi:1.55,drift:1.6,gain:1};let s,w,x,F,we,Y,E,D,be=0,ht=0;e.init=function(_){s=_;const b={buffers:[],varyings:{uv:"vec2f"},depth:!1,depthTest:!1,cull:"none",vs:as};w=s.pipeline(Object.assign({name:"shaftMarch",lib:[St.common,St.depth,St.tnoise,St.shadow,St.tonemap],uniforms:{p:"vec4f",q:"vec4f",r:"vec4f",s:"vec4f"},textures:{tDepth:"depth",tShadow:"shadow",tNoise:"2d",tSun:"2d"},colorFormat:"rgba16f",fs:tn},b)),x=s.pipeline(Object.assign({name:"shaftBlur",lib:[St.common],uniforms:{p:"vec4f"},textures:{tShaft:"fetch"},colorFormat:"rgba16f",fs:sn},b)),F=s.pipeline(Object.assign({name:"shaftComposite",lib:[St.common,St.depth],uniforms:{p:"vec4f"},textures:{tShaft:"fetch",tDepth:"depth"},blend:"add",fs:an},b)),e.pipes=[w,x,F]},e.resize=function(_,b){Y&&(s.destroyTarget(Y),s.destroyTexture(we),s.destroyTarget(D),s.destroyTexture(E)),be=Math.max(2,Math.ceil(_/e.div)),ht=Math.max(2,Math.ceil(b/e.div)),we=s.texture({w:be,h:ht,format:"rgba16f",filter:"nearest"}),Y=s.target({color:we}),E=s.texture({w:be,h:ht,format:"rgba16f",filter:"nearest"}),D=s.target({color:E})};const qe=_=>(_%256+256)%256,se=()=>e.lamp&&Nt.lampK>.002;return e.offscreen=function(_){if(e.on=e.enabled||se(),!e.on)return;const b=_.origin,re=e.wispScale,m=_.time*e.drift*re,J=ts.sunBinding(b,3);s.beginPass(Y,{color:[0,0,0,0]}),s.draw(w,{u:{p:[e.range,1/e.H0,e.g,e.sigma*e.gain],q:[qe(b[0]*re-m*1),qe(b[1]*re-m*.25),qe(b[2]*re-m*.45),re],r:[e.wispLo,e.wispHi,se()?e.lampAir:0,e.enabled?1:0],s:J.xf},tex:{tDepth:_.depth,tShadow:_.shadowTex,tNoise:c0.noise,tSun:J.tex},count:3}),s.endPass(),s.beginPass(D,{color:[0,0,0,0]}),s.draw(x,{u:{p:[be,ht,0,0]},tex:{tShaft:we},count:3}),s.endPass()},e.fx=function(_){e.on&&s.draw(F,{u:{p:[be,ht,e.div,0]},tex:{tShaft:E,tDepth:_.depth},count:3})},e})(),tn=`
// what stands under a point and toward the sun from it: (ground height, tangent of the mountain's horizon there, 1 / distance to that crest)
fn station(p: vec3f) -> vec3f { let s: vec4f = texLod(tSun, p.xz * M.s.x + M.s.yz, 0.0); return vec3f(s.z + ${bs.toFixed(4)} * p.z + M.s.w, s.x, s.y); }
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let fp: vec2i = clamp(vec2i(v.uv * U.res.xy), vec2i(0, 0), vec2i(U.res.xy) - vec2i(1, 1));
  let zf: f32 = linDepth(texFetchD(tDepth, fp, 0));
  let ndc: vec2f = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
  let dv: vec3f = U.camFwd.xyz + U.camRight.xyz * (ndc.x * U.camRight.w * U.camUp.w) + U.camUp.xyz * (ndc.y * U.camRight.w);
  let len: f32 = length(dv); let d: vec3f = dv / len;
  var tmax: f32 = min(zf * len, M.p.x);
  let mu: f32 = dot(d, U.sunDir.xyz);
  let tanE: f32 = U.sunDir.y / max(length(U.sunDir.xz), 1e-3);
  let jit: f32 = ign(v.clip.xy + 5.588238 * (U.origin.w - 64.0 * floor(U.origin.w / 64.0)));
  var g0: vec3f = station(U.camPos.xyz);
  // a ray that climbs out of the layer has nothing more to find up there: stop where it leaves, and spend every step inside
  let top: f32 = 4.6 / M.p.y; let h0: f32 = max(U.camPos.y - g0.x, 0.0);
  let hE: f32 = U.camPos.y + d.y * tmax - station(U.camPos.xyz + d * tmax).x;
  if (hE > top) { tmax *= clamp((top - h0) / max(hE - h0, 1e-3), 0.02, 1.0); }
  var acc: f32 = 0.0; var t0: f32 = 0.0;
  // steps crowd toward the camera (t = tmax u^2): beams are finest where they are nearest
  if (M.r.w > 0.5) { for (var k: i32 = 0; k < 6; k++) {
    let t1: f32 = tmax * sq(f32(k + 1) / 6.0);
    let g1: vec3f = station(U.camPos.xyz + d * t1);
    for (var i: i32 = 0; i < 4; i++) {
      let u: f32 = (f32(k) + (f32(i) + jit) * 0.25) / 6.0;
      let t: f32 = tmax * u * u;
      let p: vec3f = U.camPos.xyz + d * t;
      let g: vec3f = mix(g0, g1, (t - t0) / max(t1 - t0, 1e-4));
      let hgt: f32 = max(p.y - g.x, 0.0);
      let mtn: f32 = smoothstep(-0.010, 0.022, tanE - g.y + hgt * g.z);
      let wn: f32 = tnoise3(p * M.q.w + M.q.xyz);
      let dens: f32 = exp(-hgt * M.p.y) * (M.r.x + M.r.y * smoothstep(0.30, 0.78, wn));
      acc += shadowFast(p, 0.0006) * mtn * dens * u;
    }
    g0 = g1; t0 = t1;
  } }
  let ph: f32 = 0.86 * hg(mu, M.p.z) + 0.14 * hg(mu, 0.35);
  var air: vec3f = U.sunCol.rgb * (PI * ph * M.p.w * tmax * (2.0 / 24.0) * acc);
  // after dark the same haze (and the fine snow falling through it) shows the beam of the headlamp. The steps are spaced by the angle they
  // subtend at the lamp, so they crowd where its light is strongest and the rest is integrated exactly
  if (U.lamp.w > 0.0 && M.r.z > 0.0) {
    let rel: vec3f = U.lamp.xyz - U.camPos.xyz; let tc: f32 = dot(rel, d);
    let D: f32 = sqrt(max(dot(rel, rel) - tc * tc, 0.0) + 30.0);
    let nearL: f32 = smoothstep(2.6, 1.0, length(rel)) * saturate(M.r.z / 0.012 - 1.0);      // (heavy snow raises lampAir over 0.012: then, lamp at the lens, its first metres of air are thinned: a cone ahead, not a ball)
    // (a lens in front of the skier, the lamp turned toward it: the beam's first metres lie between the lens and the figure, and drawn there they
    // fogged the whole figure. There the march starts just past the lamp: the beam shows beyond the skier, the figure is seen clear and the lamp is
    // a small bright point on the helmet. With the lens at the lamp, or behind it, nothing changes)
    let tEnd: f32 = min(zf * len, 80.0);
    let facing: f32 = smoothstep(0.05, 0.45, dot(U.lampDir.xyz, -rel) / max(length(rel), 1e-3)) * smoothstep(1.2, 2.2, length(rel));
    let tS: f32 = min(facing * max(tc + 0.6, 0.0), tEnd);
    let th0: f32 = atan2(tS - tc, D); let th1: f32 = atan2(tEnd - tc, D);
    var a: f32 = 0.0;
    for (var i: i32 = 0; i < 6; i++) {
      let t: f32 = tc + D * tan(mix(th0, th1, (f32(i) + jit) / 6.0));
      let p: vec3f = U.camPos.xyz + d * t;
      let dl: vec3f = p - U.lamp.xyz;
      let hgt: f32 = max(p.y - station(p).x, 0.0);
      let wn: f32 = tnoise3(p * (M.q.w * 2.3) + M.q.xyz * 2.3);
      a += lampCone(dot(dl, U.lampDir.xyz) / sqrt(max(dot(dl, dl), 1e-4))) * exp(-hgt * M.p.y) * (0.55 + 0.9 * smoothstep(0.25, 0.80, wn)) * mix(1.0, smoothstep(1.0, 12.0, t), nearL);
    }
    air += vec3f(1.0, 0.85, 0.64) * (U.lamp.w * M.r.z * a * (th1 - th0) / (6.0 * D));
  }
  o.color = vec4f(air, min(zf, 4000.0));
  return o;
}
`,sn=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let p: vec2i = vec2i(v.clip.xy); let mx: vec2i = vec2i(M.p.xy) - vec2i(1, 1);
  let c: vec4f = texFetch(tShaft, p, 0);
  var acc: vec3f = c.rgb * 2.0; var ws: f32 = 2.0;
  for (var j: i32 = -1; j <= 1; j++) { for (var i: i32 = -1; i <= 1; i++) {
    if (i == 0 && j == 0) { continue; }
    let s: vec4f = texFetch(tShaft, clamp(p + vec2i(i, j), vec2i(0, 0), mx), 0);
    let w: f32 = 1.0 / (1.0 + sq((s.a - c.a) / (0.05 * c.a + 0.05)));
    acc += s.rgb * w; ws += w;
  } }
  o.color = vec4f(acc / ws, c.a);
  return o;
}
`,an=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let zf: f32 = min(linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0)), 4000.0);
  let hp: vec2f = v.clip.xy / M.p.z - 0.5; let h0: vec2f = floor(hp); let hf: vec2f = hp - h0;
  let mx: vec2i = vec2i(M.p.xy) - vec2i(1, 1);
  var acc: vec3f = vec3f(0.0); var wsum: f32 = 0.0;
  for (var j: i32 = 0; j < 4; j++) {
    let dx: i32 = j & 1; let dy: i32 = j >> 1;
    let s: vec4f = texFetch(tShaft, clamp(vec2i(h0) + vec2i(dx, dy), vec2i(0, 0), mx), 0);
    let wb: f32 = mix(1.0 - hf.x, hf.x, f32(dx)) * mix(1.0 - hf.y, hf.y, f32(dy));
    let wz: f32 = 1.0 / (1.0 + sq((s.a - zf) / (0.05 * zf + 0.05)));
    let w: f32 = (wb + 0.02) * wz;
    acc += s.rgb * w; wsum += w;
  }
  o.color = vec4f(acc / max(wsum, 1e-4), 0.0);
  return o;
}
`,L0=(()=>{const e={AZ:1.25,EL0:-.034,EL1:.09,farW:2048,farH:256,cityAz:.14,cityHalf:.22,cEL0:-.105,cEL1:.098,cityW:1024,cityH:496,deck:950,cityDist:11500,cityNear:8600,citySpan:6400,cityTop:2060,cityRise:1.35,shU0:-3e3,shU1:4600,shW0:-7200,shW1:2600,shRes:512,glN:256,glU0:-6e3,glU1:6e3,glW0:-6e3,glW1:6e3,ready:!1,stats:{},lit:{on:1,win:.72,screen:.95,strip:2.2,flood:1,sign:1.7,spot:1,glint:16,beam:1,deck:1.25,dome:1,town:.26,core:.2,road:1,dayWin:4.5,dayLed:4.2,dayFlood:3.6,dayGlow:5},lampH:780};let s;const w=[[250,150,950,1060],[-1650,650,760,770],[1750,-350,680,660],[-350,1750,820,540],[900,-1300,520,430]],x=new Float32Array(65536);for(let Fe=0;Fe<65536;Fe++)x[Fe]=ps(Fe*7+99991)*Is;function F(Fe,Ge){const Je=Math.floor(Fe),le=Math.floor(Ge);let Pe=Fe-Je,pe=Ge-le;Pe=Pe*Pe*(3-2*Pe),pe=pe*pe*(3-2*pe);const c=Je&255,Ie=Je+1&255,he=(le&255)<<8,H=(le+1&255)<<8,z=x[he+c],V=x[he+Ie],I=x[H+c],Q=x[H+Ie];return z+(V-z)*Pe+(I-z+(z-V-I+Q)*Pe)*pe}function we(Fe){const Ge=(Fe+.37)/.2,Je=(Fe-.62)/.26,le=(Fe-.14)/.3;return .62+.52*Math.exp(-Ge*Ge)+.36*Math.exp(-Je*Je)-.2*Math.exp(-le*le)}function Y(Fe,Ge,Je){const le=Math.hypot(Fe,Ge),Pe=Fe+9*(F(Fe*.045+3.1,Ge*.045+7.7)-.5),pe=Ge+9*(F(Fe*.045+11.4,Ge*.045+1.9)-.5);let c=1/15,Ie=1,he=0,H=1;for(let V=0;V<Je;V++){let I=1-Math.abs(F(Pe*c+V*17.3,pe*c+V*9.1)*2-1);I*=I*H,H=Math.min(1,I*1.9+.15),he+=I*Ie,c*=2.1,Ie*=.52}const z=.3+.7*ge(.36,.62,F(Fe*.021+40.3,Ge*.021+13.7));return e.farBase+ge(20,32,le)*we(Math.atan2(Fe,-Ge))*z*Math.pow(he,1.3)*e.farAmp-le*le*.0786}e.farBase=-1400,e.farAmp=2700;const E=[.25,.8,2.4,6];function D(Fe,Ge){const Je=new Uint8ClampedArray(Fe*Ge*4),le=new Uint8ClampedArray(Fe*Ge*4),Pe=320,pe=20,c=190,Ie=Math.log(c/pe)/(Pe-1),he=(e.EL1-e.EL0)/Ge,H=new Float32Array(Pe);for(let Ve=0;Ve<Pe;Ve++)H[Ve]=pe*Math.exp(Ve*Ie);const z=new Float32Array(Ge);for(let Ve=0;Ve<Ge;Ve++)z[Ve]=Math.tan(e.EL1-(Ve+.5)*he);const V=new Float32Array(Ge),I=Math.sin(Nt.az),Q=-Math.cos(Nt.az),L=Ve=>(e.EL1-Math.atan(Ve))/he-.5;let ye=0;for(let Ve=0;Ve<Fe;Ve++){const Ne=-e.AZ+(Ve+.5)/Fe*2*e.AZ,Ce=Math.sin(Ne),Ye=-Math.cos(Ne);V.fill(0);let T=Math.tan(e.EL0),Se=T,me=pe,B=Ge;for(let fe=0;fe<Pe;fe++){const O=H[fe],ie=Y(Ce*O,Ye*O,6)/(O*1e3);if(ie>T){const ce=Math.max(0,Math.ceil(L(ie)));for(let He=Math.min(B,Ge)-1;He>=ce;He--){const We=(z[He]-Se)/(ie-Se);V[He]=me+(O-me)*(We<0?0:We>1?1:We)}ce<B&&(B=ce),T=ie}Se=ie,me=O}const U=L(T)+.5,A=Math.floor(U),a=A+1-U;A>=0&&A<Ge-1&&V[A]===0&&V[A+1]>0&&a>.02&&(V[A]=V[A+1]);let oe=-1;for(let fe=0;fe<Ge;fe++){const O=V[fe];if(O<=0)continue;oe<0&&(oe=fe);const ie=Ce*O,ce=Ye*O,He=Math.max(.02,O*7e-4),We=Y(ie,ce,8),Qe=-(Y(ie+He,ce,8)-We)/(He*1e3),st=-(Y(ie,ce+He,8)-We)/(He*1e3),Le=1/Math.hypot(Qe,1,st);let r=-.1;for(let ee=0;ee<4;ee++){const Z=(Y(ie+I*E[ee],ce+Q*E[ee],5)-We)/(E[ee]*1e3);Z>r&&(r=Z)}const q=ge(.9,.72,Le+(F(ie*2.7+5,ce*2.7)-.5)*.26),k=(fe*Fe+Ve)*4;Je[k]=127.5+127.5*Qe*Le,Je[k+1]=127.5+127.5*Le,Je[k+2]=127.5+127.5*st*Le,Je[k+3]=255*(fe===A?a:1),le[k]=255*Math.log(O/20)/Math.LN10,le[k+1]=255*(r+.1)/1.1,le[k+2]=255*q,le[k+3]=255,ye++}if(oe>0){const fe=(oe*Fe+Ve)*4;for(let O=oe-1;O>=0;O--){const ie=(O*Fe+Ve)*4;Je[ie]=Je[fe],Je[ie+1]=Je[fe+1],Je[ie+2]=Je[fe+2],le[ie]=le[fe],le[ie+1]=le[fe+1],le[ie+2]=le[fe+2],le[ie+3]=255}}}return e.stats.farPx=ye,{A:new Uint8Array(Je.buffer),B:new Uint8Array(le.buffer)}}function be(){const Fe=e.cityAz,Ge=e.cityDist;return{C:[Ge*Math.sin(Fe),-Ge*Math.cos(Fe)],U:[Math.cos(Fe),Math.sin(Fe)],W:[Math.sin(Fe),-Math.cos(Fe)]}}function ht(){const Fe=D0(90417),Ge=[],Je=w,le=(z,V)=>{let I=250*Math.max(0,1-(z/2800)**2-(V/2200)**2);for(const Q of Je){const L=((z-Q[0])**2+(V-Q[1])**2)/(Q[2]*Q[2]);I=Math.max(I,Q[3]*Math.exp(-1.15*L))}return I},Pe=[[250,100],[-1762,620],[-1638,620],[1050,350],[-640,-520]],pe=.38,c=Math.cos(pe),Ie=Math.sin(pe),he=108,H=(z,V,I,Q)=>Object.assign({u:z,w:V,h:I,rot:pe,hu:26,hw:26,round:!1,tiers:[[-260,I,1]],style:0,seed:Fe()*1e9|0,tint:Fe(),mechP:96+Fe()*70,crownH:0,crownTone:.5,crownLit:0,spire:0,spireR:2.2},Q);for(let z=-30;z<=30;z++)for(let V=-34;V<=34;V++){const I=Fe(),Q=Fe(),L=Fe(),ye=Fe(),Ve=Fe(),Ne=Fe(),Ce=Fe(),Ye=Fe();if((V%7+7)%7===3||(z%9+9)%9===5)continue;const T=(V+(I-.5)*.24)*he,Se=(z+(Ye-.5)*.24)*he,me=T*c-Se*Ie,B=T*Ie+Se*c,U=le(me,B);if(U<40||Q>.36+.44*Math.min(1,U/600))continue;const A=U*(.42+.8*L*L+.12*ye);if(A<70)continue;let a=!1;for(const ie of Pe)Math.hypot(me-ie[0],B-ie[1])<105&&(a=!0);if(a)continue;const oe=19+15*Ne,fe=H(me,B,A,{hu:oe,hw:oe*(.72+.56*Ce)});Ce>.66&&(fe.rot=Ne>.3?.035+(L-.5)*.05:pe+.62);const O=ge(380,800,A);if(Ve<.24)fe.style=0,fe.tiers=[[-260,A*.56,1],[A*.56,A*.83,.76],[A*.83,A,.52]],ye>.45&&(fe.spire=A*.1);else if(Ve<.4)fe.style=ye>.5?0:2;else if(Ve<.55)fe.style=1,fe.tiers=[[-260,A*.48,1],[A*.48,A*.72,.8],[A*.72,A*.9,.6],[A*.9,A,.38]],fe.spire=A*(.08+.1*ye),fe.crownH=A*.1,fe.crownTone=.72,fe.crownLit=.9;else if(Ve<.66)fe.style=ye>.6?2:0,fe.round=!0,fe.hw=fe.hu;else if(Ve<.66+.12+.14*O){fe.style=ye>.55?3:0;const ie=10;fe.tiers=[];for(let ce=0;ce<ie;ce++)fe.tiers.push([ce?A*ce/ie:-260,A*(ce+1)/ie,1-.58*Math.pow(ce/ie,1.35)]);ye<.5&&(fe.spire=A*.07)}else fe.style=4,fe.hw=fe.hu*2.1,fe.hu*=.78,fe.crownH=14,fe.crownTone=.3;fe.style===0&&!fe.crownH&&ye>.3&&(fe.crownH=10+26*Ne,fe.crownTone=.42+.3*L,fe.crownLit=Q>.3?.7:0),Ge.push(fe)}{const I=H(250,100,1290,{mark:"needle",hu:47,hw:47,round:!0,style:2,spire:190,spireR:3.2,mechP:172,crownH:30,crownTone:.8,crownLit:1});I.tiers=[];for(let Q=0;Q<18;Q++)I.tiers.push([Q?1290*Q/18:-260,1290*(Q+1)/18,1-.8*Math.pow(Q/18,1.5)]);Ge.push(I)}for(const z of[-1,1])Ge.push(H(-1700+z*62,620,800,{mark:"twin",hu:29,hw:29,rot:pe+.785,style:0,spire:64,crownH:22,crownTone:.7,crownLit:.8,tiers:[[-260,800*.62,1],[800*.62,800*.86,.8],[800*.86,800,.55]]}));Ge.push(H(-1700,620,452,{mark:"bridge",hu:40,hw:7,rot:0,style:2,tiers:[[432,452,1]],crownH:0})),Ge.push(H(1050,350,940,{mark:"stone",hu:44,hw:44,style:1,spire:130,spireR:2.6,crownH:70,crownTone:.78,crownLit:1,tiers:[[-260,940*.4,1],[940*.4,940*.62,.82],[940*.62,940*.8,.64],[940*.8,940*.92,.46],[940*.92,940,.28]]}));{const I=H(-640,-520,880,{mark:"blade",hu:17,hw:52,rot:pe+.25,style:3,crownH:0});I.tiers=[];for(let Q=0;Q<8;Q++)I.tiers.push([Q?880*Q/8:-260,880*(Q+1)/8,1-.42*(Q/8)]);Ge.push(I)}for(const z of Ge){const V=e.cityRise;z.h*=V,z.spire*=V,z.crownH*=V;for(const I of z.tiers)I[0]>0&&(I[0]*=V),I[1]*=V}return Ge}const qe={tone:0,glass:0,light:0};function se(Fe,Ge,Je){const le=Fe.style;let Pe,pe;if(le===0){const H=Ge%9<1;Pe=H?.52:.15+.1*Fe.tint,pe=H?.25:1}else if(le===1){const H=Ge%7.2<3.1;Pe=H?.6+.12*Fe.tint:.19,pe=H?0:.6}else if(le===2){const H=Je%12<4.2;Pe=H?.56:.13,pe=H?.05:1}else if(le===3){const H=((Ge+Je*.55)%42+42)%42,z=((Ge-Je*.55)%42+4200)%42,V=Math.min(Math.abs(H-21),Math.abs(z-21))>19;Pe=V?.62:.12,pe=V?.1:1}else if(le===5)Pe=.42,pe=0;else{const H=Ge%5.4>1.6&&(Je%4+4)%4>1.3;Pe=H?.15:.72,pe=H?.8:.05}const c=(Je%Fe.mechP+Fe.mechP)%Fe.mechP<7,Ie=Fe.crownH>0&&Je>Fe.h-Fe.crownH;c&&(Pe=.22,pe=.05);let he=0;if(Ie)Pe=Fe.crownTone,pe=.1,he=Fe.crownLit;else if(pe>.4){const H=Math.floor(Je/4),z=Ta(Math.floor(Ge/3.6),H,Fe.seed),V=(ps(H*31+Fe.seed)&255)>184;(z&65535)<65536*(V?.66:.27)&&(he=.3+.7*(z>>>16&255)/255)}qe.tone=Pe,qe.glass=pe,qe.light=he}function _(Fe,Ge,Je){const Pe=Ge*2,pe=Je*2,c=Pe*pe,Ie=be(),he=new Float32Array(c).fill(1e9),H=new Uint8Array(c),z=new Uint8Array(c),V=new Uint8Array(c),I=new Uint8Array(c),Q=new Uint8Array(c),L=new Uint8Array(c),ye=e.cityAz-e.cityHalf,Ve=2*e.cityHalf/Pe,Ne=(e.cEL1-e.cEL0)/pe,Ce=e.deck,Ye=new Float32Array(pe);for(let oe=0;oe<pe;oe++)Ye[oe]=Math.tan(e.cEL1-(oe+.5)*Ne);const T=new Float64Array(34);function Se(oe,fe,O,ie,ce,He,We,Qe,st){const Le=We?16:4,r=Math.cos(He),q=Math.sin(He);for(let K=0;K<Le;K++){let ue,G;if(We){const at=K/Le*It;ue=ie*Math.cos(at),G=ie*Math.sin(at)}else ue=K===0||K===3?-ie:ie,G=K<2?-ce:ce;const Ae=fe+ue*r-G*q,_e=O+ue*q+G*r;T[K*2]=Ie.C[0]+Ae*Ie.U[0]+_e*Ie.W[0],T[K*2+1]=Ie.C[1]+Ae*Ie.U[1]+_e*Ie.W[1]}const k=Ie.C[0]+fe*Ie.U[0]+O*Ie.W[0],ee=Ie.C[1]+fe*Ie.U[1]+O*Ie.W[1];let Z=0;for(let K=0;K<Le;K++){const ue=(K+1)%Le,G=T[K*2],Ae=T[K*2+1],_e=T[ue*2],at=T[ue*2+1],ot=_e-G,t=at-Ae,S=Math.hypot(ot,t);let l=t/S,u=-ot/S;const v=(G+_e)/2,P=(Ae+at)/2;l*(v-k)+u*(P-ee)<0&&(l=-l,u=-u);const N=Z;if(Z+=S,l*v+u*P>=0)continue;const de=(Math.atan2(G,-Ae)-ye)/Ve,te=(Math.atan2(_e,-at)-ye)/Ve,o=Math.max(0,Math.ceil(Math.min(de,te)-.5)),p=Math.min(Pe-1,Math.floor(Math.max(de,te)-.5));for(let i=o;i<=p;i++){const y=ye+(i+.5)*Ve,j=Math.sin(y),W=-Math.cos(y),h=-ot*W+j*t;if(Math.abs(h)<1e-9)continue;const n=(G*W-j*Ae)/h,d=(-ot*Ae+t*G)/h;if(n<-.002||n>1.002||d<=0)continue;const M=Math.max(0,Math.ceil((e.cEL1-Math.atan((st-Ce)/d))/Ne-.5)),g=Math.min(pe-1,Math.ceil((e.cEL1-Math.atan((Qe-Ce)/d))/Ne-.5)-1);let R=l,Ue=u;if(We){R=j*d-k,Ue=W*d-ee;const De=Math.hypot(R,Ue)||1;R/=De,Ue/=De}const $=127.5+127.5*R,ve=127.5+127.5*Ue,xe=N+n*S;for(let De=M;De<=g;De++){const Te=De*Pe+i;if(d>=he[Te])continue;const Me=Ce+d*Ye[De];se(oe,xe,Me),he[Te]=d,H[Te]=$,z[Te]=ve,V[Te]=255*qe.tone,I[Te]=255*qe.glass,Q[Te]=255*qe.light,L[Te]=Math.max(0,Math.min(255,255*(Me+300)/(e.cityTop+300)))}}}}for(const oe of Fe){for(const fe of oe.tiers)Se(oe,oe.u,oe.w,oe.hu*fe[2],oe.hw*fe[2],oe.rot,oe.round,fe[0],fe[1]);if(oe.spire){const fe=oe.style,O=oe.crownH;oe.style=5,oe.crownH=0,Se(oe,oe.u,oe.w,oe.spireR,oe.spireR,0,!0,oe.h,oe.h+oe.spire),oe.style=fe,oe.crownH=O}}const me=new Uint8ClampedArray(Ge*Je*4),B=new Uint8ClampedArray(Ge*Je*4);let U=0;for(let oe=0;oe<Je;oe++)for(let fe=0;fe<Ge;fe++){let O=0,ie=0,ce=0,He=0,We=0,Qe=0,st=0,Le=0;for(let q=0;q<2;q++)for(let k=0;k<2;k++){const ee=(oe*2+q)*Pe+fe*2+k;he[ee]<1e8&&(O++,ie+=H[ee],ce+=z[ee],He+=V[ee],We+=I[ee],Qe+=Q[ee],st+=L[ee],Le+=he[ee])}if(!O)continue;U++;const r=(oe*Ge+fe)*4;me[r]=ie/O,me[r+1]=ce/O,me[r+2]=He/O,me[r+3]=255*O/(2*2),B[r]=Qe/O,B[r+1]=We/O,B[r+2]=255*(Le/O-e.cityNear)/e.citySpan,B[r+3]=st/O}const A=new Uint8Array(Ge*Je);for(let oe=0;oe<Ge*Je;oe++)A[oe]=me[oe*4+3]>0?1:0;for(let oe=0;oe<4;oe++){const fe=[];for(let O=0;O<Je;O++)for(let ie=0;ie<Ge;ie++){const ce=O*Ge+ie;if(A[ce])continue;const He=ie>0&&A[ce-1]?ce-1:ie<Ge-1&&A[ce+1]?ce+1:O<Je-1&&A[ce+Ge]?ce+Ge:O>0&&A[ce-Ge]?ce-Ge:-1;He>=0&&fe.push(ce,He)}for(let O=0;O<fe.length;O+=2){const ie=fe[O]*4,ce=fe[O+1]*4;me[ie]=me[ce],me[ie+1]=me[ce+1],me[ie+2]=me[ce+2],B[ie]=B[ce],B[ie+1]=B[ce+1],B[ie+2]=B[ce+2],B[ie+3]=B[ce+3]}for(let O=0;O<fe.length;O+=2)A[fe[O]]=1}e.stats.cityPx=U;const a=new Uint8Array(Ge*Je*4);for(let oe=0;oe<Je;oe++)for(let fe=0;fe<Ge;fe++){let O=1e9;for(let He=0;He<2;He++)for(let We=0;We<2;We++){const Qe=he[(oe*2+He)*Pe+fe*2+We];Qe<O&&(O=Qe)}const ie=O>1e8?65535:Math.max(0,Math.min(65534,Math.round((O-e.cityNear)/e.citySpan*65535))),ce=(oe*Ge+fe)*4;a[ce]=ie>>8,a[ce+1]=ie&255,a[ce+3]=255}return{A:new Uint8Array(me.buffer),B:new Uint8Array(B.buffer),Z:a,zb:he,BW:Pe,BH:pe}}function b(Fe,Ge){const Je=be(),le=-Math.sin(Ge),Pe=Math.cos(Ge);return{S:new Uint8Array(e.shRes*e.shRes),i:0,su:le*Je.U[0]+Pe*Je.U[1],sw:le*Je.W[0]+Pe*Je.W[1],k:1/Math.max(Fe,.04)}}function re(Fe,Ge,Je){const le=e.shRes,Pe=Fe.S,pe=Fe.su,c=Fe.sw,Ie=Fe.k,he=(e.shU1-e.shU0)/le,H=(e.shW1-e.shW0)/le,z=performance.now();for(;Fe.i<Ge.length;Fe.i++){if((Fe.i&7)===7&&performance.now()-z>Je)return!1;const V=Ge[Fe.i],I=Math.cos(V.rot),Q=Math.sin(V.rot);for(const L of V.tiers){const ye=Math.max(0,L[0]),Ve=L[1];if(Ve<=ye)continue;const Ne=V.hu*L[2],Ce=(V.round?V.hu:V.hw)*L[2],Ye=Math.abs(Ne*(I*-c+Q*pe))+Math.abs(Ce*(-Q*-c+I*pe)),T=Math.abs(Ne*(I*pe+Q*c))+Math.abs(Ce*(-Q*pe+I*c)),Se=ye*Ie-T,me=Ve*Ie+T,B=10+.0093*me,U=Ye+B,A=V.u+pe*Se,a=V.w+c*Se,oe=V.u+pe*me,fe=V.w+c*me,O=Math.max(1,Math.floor((Math.min(A,oe)-U-e.shU0)/he)),ie=Math.min(le-2,Math.ceil((Math.max(A,oe)+U-e.shU0)/he)),ce=Math.max(1,Math.floor((Math.min(a,fe)-U-e.shW0)/H)),He=Math.min(le-2,Math.ceil((Math.max(a,fe)+U-e.shW0)/H));for(let We=ce;We<=He;We++)for(let Qe=O;Qe<=ie;Qe++){const st=e.shU0+(Qe+.5)*he-V.u,Le=e.shW0+(We+.5)*H-V.w,r=st*pe+Le*c,q=Math.abs(-st*c+Le*pe);if(r<Se||r>me)continue;const k=10+.0093*Math.max(r,0),ee=(Ye-q)/k+.5;if(ee<=0)continue;const Z=Math.min(1,(r-Se)/30)*Math.min(1,(me-r)/(30+k)),K=255*Math.min(1,ee)*Z,ue=We*le+Qe;K>Pe[ue]&&(Pe[ue]=K)}}}return!0}const m={cyan:[.05,.78,1],aqua:[.04,.86,.78],blue:[.1,.33,1],violet:[.48,.2,1],magenta:[1,.1,.68],pink:[1,.24,.42],amber:[1,.5,.12],gold:[1,.72,.28],warm:[1,.82,.6],ice:[.86,.95,1],red:[1,.05,.02],green:[.08,.9,.36],white:[1,.93,.82]},J=[m.red,m.blue,m.green,m.amber,m.red,m.blue,m.gold,m.cyan,m.magenta,m.green],ae=[1,.52,.17],X=[[1,.6,.26],[1,.5,.16],[1,.64,.32],[1,.54,.2],[1,.47,.14]],ke=X.map(Fe=>[Fe,[1,Fe[1]+.07,Fe[2]+.07]]);function C(Fe,Ge,Je,le){const Pe=be(),pe=e.deck,c=e.cityAz-e.cityHalf,Ie=2*e.cityHalf/Je,he=(e.cEL1-e.cEL0)/le,H=(Le,r)=>Pe.C[0]+Le*Pe.U[0]+r*Pe.W[0],z=(Le,r)=>Pe.C[1]+Le*Pe.U[1]+r*Pe.W[1],V=(Le,r,q,k)=>{const ee=Math.hypot(Le,r),Z=Math.floor((Math.atan2(Le,-r)-c)/Ie),K=Math.floor((e.cEL1-Math.atan((q-pe)/ee))/he);return Z>=0&&Z<Je&&K>=0&&K<le&&Ge[K*Je+Z]>=ee-k},I=[],Q=[],L=[],ye=e.glN,Ve=new Float32Array(ye*ye*3),Ne={wall:0,screen:0,strip:0,flood:0,sign:0,lamp:0,strobe:0,glint:0,beam:0},Ce=-30,Ye=(Le,r,q,k,ee,Z,K,ue,G,Ae,_e,at,ot,t,S,l,u)=>{I.push(r[0],r[1],q[0],q[1],k,ee,Le,Z,K,ue,G,Ae,_e[0],_e[1],_e[2],at,ot[0],ot[1],ot[2],t,S,l,u||0,0)},T=(Le,r,q,k,ee,Z,K,ue,G,Ae,_e,at)=>{Q.push(Le,r,q,0,k[0],k[1],k[2],ee,Z,K,ue,G,Ae||1,_e||0,at||1,0)},Se=(e.glU1-e.glU0)/ye,me=(e.glW1-e.glW0)/ye,B=(Le,r,q,k,ee)=>{const Z=Math.max(0,Math.floor((Le-3*q-e.glU0)/Se)),K=Math.min(ye-1,Math.ceil((Le+3*q-e.glU0)/Se)),ue=Math.max(0,Math.floor((r-3*q-e.glW0)/me)),G=Math.min(ye-1,Math.ceil((r+3*q-e.glW0)/me));for(let Ae=ue;Ae<=G;Ae++)for(let _e=Z;_e<=K;_e++){const at=e.glU0+(_e+.5)*Se-Le,ot=e.glW0+(Ae+.5)*me-r,t=ee*Math.exp(-(at*at+ot*ot)/(q*q)),S=(Ae*ye+_e)*3;Ve[S]+=k[0]*t,Ve[S+1]+=k[1]*t,Ve[S+2]+=k[2]*t}};function U(Le,r){const q=r[2],k=Le.hu*q,ee=Le.hw*q,Z=H(Le.u,Le.w),K=z(Le.u,Le.w),ue=[];if(Le.round){const ot=Math.hypot(Z,K),t=-K/ot*k,S=Z/ot*k;return ue.push({a:[Z-t,K-S],b:[Z+t,K+S],pA:0,pB:2*k,len:2*k,face:1,R:k}),ue}const G=Math.cos(Le.rot),Ae=Math.sin(Le.rot),_e=[];let at=0;for(let ot=0;ot<4;ot++){const t=ot===0||ot===3?-k:k,S=ot<2?-ee:ee,l=Le.u+t*G-S*Ae,u=Le.w+t*Ae+S*G;_e.push([H(l,u),z(l,u)])}for(let ot=0;ot<4;ot++){const t=_e[ot],S=_e[(ot+1)%4],l=S[0]-t[0],u=S[1]-t[1],v=Math.hypot(l,u),P=(t[0]+S[0])/2,N=(t[1]+S[1])/2,de=at;at+=v;let te=u/v,o=-l/v;te*(P-Z)+o*(N-K)<0&&(te=-te,o=-o);const p=-(te*P+o*N)/Math.hypot(P,N);p<.03||ue.push(Math.atan2(t[0],-t[1])<Math.atan2(S[0],-S[1])?{a:t,b:S,pA:de,pB:de+v,len:v,face:p,R:0}:{a:S,b:t,pA:de+v,pB:de,len:v,face:p,R:0})}return ue}const A=(Le,r)=>{let q=Le.a[0]+(Le.b[0]-Le.a[0])*r,k=Le.a[1]+(Le.b[1]-Le.a[1])*r;if(Le.R){const ee=Math.hypot(q,k),Z=(ee-Le.R*Math.sqrt(Math.max(0,1-(2*r-1)**2)))/ee;q*=Z,k*=Z}return[q,k]},a=(Le,r,q)=>{let k=0;for(let ee=0;ee<6;ee++)for(let Z=0;Z<4;Z++){const K=A(Le,(Z+.5)/4);V(K[0],K[1],r+(q-r)*(ee+.5)/6,16)&&k++}return k/24},oe=(Le,r)=>{let q=-1,k=1.5;for(let ee=0;ee<w.length;ee++){const Z=w[ee],K=Math.hypot(Le-Z[0],r-Z[1])/Z[2];K<k&&(k=K,q=ee)}return q},fe=new Set;for(const Le of Fe){const r=D0((Le.seed^625341585)>>>0),q=r(),k=oe(Le.u,Le.w),ee=ge(250,900,Le.h),Z=Le.mark||"",K=()=>J[r()*J.length|0],ue=.62+.5*Math.max(...w.map(Te=>(.55+.45*Te[3]/1060)*Math.exp(-((Le.u-Te[0])**2+(Le.w-Te[1])**2)/(Te[2]*Te[2]*1.2)))),G=r(),Ae=Z||(G<.012+.045*ee&&Le.h>330?"media":G<.05+.1*ee&&Le.h>380?"outline":G>.8?"hotel":G>.7?"dark":"office"),_e=K();let at=K();at===_e&&(at=K());const ot=r(),t=r(),S=Ae==="office"?[.22+.36*ot,.16+.56*t,1]:Ae==="hotel"?[.26+.18*ot,.04+.26*t,.95]:Ae==="outline"?[.26+.22*ot,.25+.45*t,.9]:Ae==="dark"?[.06,.4,.7]:Ae==="twin"?[.34,.55,.9]:Ae==="stone"?[.3,.1,.9]:[.32,.5,.9];S[0]*=.75+.25*ue,S[2]*=ue;const l=.03+(r()-.5)*.06,u=Le.h-Le.crownH,v=H(Le.u,Le.w),P=z(Le.u,Le.w),N=Math.hypot(v,P),de=Z||ee>.55&&r()<.5?.3:.12*r(),te=-.02+.1*r(),o=r()<.35?1:0,p=.1+.14*r(),i=r()<.72?r()<.5?m.warm:r()<.5?m.gold:m.ice:_e,y=Z||Le.h>600&&r()<.3?.3:-.03+.1*r(),j=r()*4|0,W=110+110*r(),h=14+18*r(),n=r(),d=r(),M=r(),g=r()<.78?r()<.5?m.white:r()<.5?m.gold:m.ice:_e,R=Ae==="needle"?[Le.h*.8,1e9]:Ae==="blade"?[Le.h*.86,1e9]:Ae!=="media"?null:n<.55?[Le.h*(.76+.12*d),1e9]:[Le.h*(.42+.3*d),Le.h*(.42+.3*d)+50+70*M],Ue=(Te,Me,rt)=>{rt>Me+3&&(Ye(0,Te.a,Te.b,Me,rt,q,Te.pA,Te.pB,l,.13,[1,1,1],S[2],_e,0,S[0],S[1],Te.R),Ne.wall++)};let $=null;const ve=!Z&&Le.style!==1&&Le.style!==4&&Le.h>160,xe=[];for(let Te=0;Te<Le.tiers.length;Te++){const Me=Le.tiers[Te],rt=Math.max(Me[0],Ce),wt=Me[1],Ze=Te===Le.tiers.length-1;if(!(wt<rt+3))for(const ct of U(Le,Me)){if(!a(ct,Math.max(rt,60),wt))continue;const Mt=Math.min(wt,u),ft=[(ct.b[0]-ct.a[0])/ct.len,(ct.b[1]-ct.a[1])/ct.len],dt=R?Math.max(rt,R[0]):0,gt=R?Math.min(Mt,R[1]):0;if(Ae==="bridge"?(Ye(4,ct.a,ct.b,rt,wt,q,0,ct.len,.07,.004,m.warm,.5,m.warm,0,0,0,0),Ne.sign++):R&&gt>dt+3&&(ct.R||ct.face>.55&&ct.len>14)?(Ae==="needle"?Ye(1,ct.a,ct.b,dt,gt,q,ct.pA,ct.pB,.3,.004,m.gold,1,m.white,0,95,30,ct.R):Ae==="blade"?Ye(1,ct.a,ct.b,dt,gt,q,ct.pA,ct.pB,.3,.004,m.blue,1,m.ice,1,W,h,ct.R):Ye(1,ct.a,ct.b,dt,gt,q,ct.pA,ct.pB,de,.004,_e,1,at,j,W,h,ct.R),Ne.screen++,Ue(ct,rt,dt),Ue(ct,gt,Mt)):Ue(ct,rt,Mt),ve&&!ct.R&&Mt>rt+40&&xe.push({f:ct,y0:rt,y1:Mt}),Ae==="outline"||Ae==="twin"){const bt=Ae==="twin"?m.white:g,Xe=Math.max(rt,Le.h*.68);if(!ct.R&&wt>Xe+8)for(let et=0;et<2;et++){const tt=et?ct.b:ct.a,Oe=Math.round(tt[0])+","+Math.round(tt[1])+","+Te;fe.has(Oe)||(fe.add(Oe),Ye(2,et?[tt[0]-ft[0]*2.2,tt[1]-ft[1]*2.2]:tt,et?tt:[tt[0]+ft[0]*2.2,tt[1]+ft[1]*2.2],Xe,wt,q,0,2.2,te,.004,bt,1,bt,o,0,p,0),Ne.strip++)}Ze&&(Ye(2,ct.a,ct.b,wt-3,wt,q,0,ct.len,te,.004,bt,.8,bt,0,0,0,ct.R),Ne.strip++)}if(Ae==="stone"&&Te>0&&(Ye(3,ct.a,ct.b,Me[0],Me[0]+.6*(wt-Me[0]),q,0,ct.len,.06,.004,m.gold,1,m.gold,0,2.4,0,ct.R),Ne.flood++),Ze&&Le.crownH>0&&Le.crownLit>0){const bt=Ae==="needle"?m.ice:Ae==="twin"?m.gold:Ae==="stone"?m.amber:i;Ye(3,ct.a,ct.b,u,Le.h,q,0,ct.len,y,.004,bt,Le.crownLit,Ae==="stone"?m.gold:bt,0,1.1,Ae==="stone"?.25:0,ct.R),Ne.flood++}Ze&&!ct.R&&ct.len*ct.face>($?$.w:9)&&($={f:ct,w:ct.len*ct.face,y1:Mt,y0:rt})}}if($&&!Z&&Ae!=="media"&&(Ae==="hotel"||Le.h>190&&r()<.34)){const Te=Le.h>600,Me=$.f,rt=Math.max(12,Me.len*(Te?.86:.5+.4*r())),wt=Te?20+14*r():9+8*r(),Ze=(Me.len-rt)/2,ct=(Me.b[0]-Me.a[0])/Me.len,Mt=(Me.b[1]-Me.a[1])/Me.len,ft=$.y1-3,dt=[Me.a[0]+ct*Ze,Me.a[1]+Mt*Ze],gt=[dt[0]+ct*rt,dt[1]+Mt*rt],bt=r(),Xe=bt<.5?_e:bt<.68?m.red:bt<.84?m.ice:m.gold,et=r(),tt=r()<(Te?.7:.3)?.3:.02+.17*r(),Oe=.5+.7*r();ft-wt>Math.max($.y0,80)&&V((dt[0]+gt[0])/2,(dt[1]+gt[1])/2,ft-wt/2,16)&&(Ye(4,dt,gt,ft-wt,ft,q,0,rt,tt,.004,Xe,1,at,et<.6?0:et<.85?1:2,0,Oe,0),Ne.sign++)}if(Le.spire&&V(v,P,Le.h+Le.spire*.5,30)){const Te=-P/N*Le.spireR,Me=v/N*Le.spireR,rt=Z||r()<.85?m.ice:_e;Ye(2,[v-Te,P-Me],[v+Te,P+Me],Le.h,Le.h+Le.spire,q,0,2*Le.spireR,Z||Le.h>800?.3:.1*r(),.004,rt,1.3,rt,r()<.45?1:0,0,.16+.2*r(),0),Ne.strip++}const De=Le.h+Le.spire;if((Z||De>e.lampH)&&V(v,P,De-1,40)&&(T(v,De+2,P,m.red,2.2+1*ee,0,2.2+1.2*r(),r(),Z||De>1050?.3:.02+.09*r(),3.6),Ne.lamp++,Le.spire&&Le.h>760&&(T(v,De-6,P,m.ice,5,1,1.5,r(),.3,4.5),Ne.strobe++)),Le.h>1200)for(const Te of[.36,.68]){const Me=Le.tiers.find(wt=>wt[1]>=Le.h*Te),rt=(N-Le.hu*Me[2]-3)/N;V(v*rt,P*rt,Le.h*Te,12)&&(T(v*rt,Le.h*Te,P*rt,m.red,1.6,2,1,r(),.3,3.6),Ne.lamp++)}ve&&!Le.spire&&r()<.35&&V(v,P,Le.h-1,60)&&(T(v,Le.h+1,P,[1,1,1],1,3,1,r(),.3,1,.27*r(),.01+.01*r()),Ne.glint++);for(let Te=0;Te<2;Te++)if(xe.length&&r()<.5){const Me=xe[r()*xe.length|0],rt=A(Me.f,.15+.7*r()),wt=Me.y0+(Me.y1-Me.y0)*r(),Ze=1-2/Math.hypot(rt[0],rt[1]);wt>150&&V(rt[0],rt[1],wt,16)&&(T(rt[0]*Ze,wt,rt[1]*Ze,[1,1,1],1,3,1,r(),.3,1,.27*r(),.01+.01*r()),Ne.glint++)}B(Le.u,Le.w,60+.35*Le.h,k>=0?X[k]:ae,(.006+.028*ee)*(Ae==="dark"?.2:.9)*ue)}{const Le=D0(7717),r=(K,ue,G)=>{const Ae=H(K.u,K.w),_e=z(K.u,K.w);L.push(Ae,K.h+4,_e,3e3,ue[0],ue[1],ue[2],.6,e.cityAz+G*(1.15+.5*Le()),.4+.2*Le(),.45+.4*Le(),.13+.1*Le(),8+7*Le(),Le()*It,-.025-.05*Le(),20),T(Ae,K.h+5,_e,ue,4,2,1,Le(),-.03,1),Ne.beam++},q=K=>{const ue=w[K];return Fe.filter(G=>!G.mark&&!G.spire&&Math.hypot(G.u-ue[0],G.w-ue[1])<ue[2]*.8&&V(H(G.u,G.w),z(G.u,G.w),G.h-1,60)).sort((G,Ae)=>Ae.h-G.h)},k=q(0),ee=q(1),Z=q(2);k.length>2&&(r(k[0],m.ice,-1),r(k[2],m.white,1)),ee.length&&(r(ee[0],m.ice,1),r(ee[0],m.white,-1)),Z.length>1&&(r(Z[0],m.white,-1),r(Z[1],m.ice,1))}const O=.38,ie=Math.cos(O),ce=Math.sin(O),He=108,We=(Le,r,q)=>{const k=((Le/He-q+r/2)%r+r)%r-r/2;return Math.exp(-((k*He/95)**2))};for(let Le=0;Le<ye;Le++)for(let r=0;r<ye;r++){const q=e.glU0+(r+.5)*Se,k=e.glW0+(Le+.5)*me,ee=(Le*ye+r)*3,Z=e.lit.town*Math.exp(-(((q+200)/3600)**2+(k/3e3)**2))*(.6+.8*F(q/800+31.7,k/800+5.3)),K=F(q/1700+3.1,k/1700+77.7),ue=q*ie+k*ce,G=-q*ce+k*ie,Ae=Math.max(We(ue,7,3),We(G,9,5)),_e=Z*(.8+1.1*Ae*e.lit.road);let at=_e,ot=_e*Re(.5,.63,K),t=_e*Re(.15,.31,K);for(let S=0;S<w.length;S++){const l=w[S],u=e.lit.core*(.3+l[3]/1e3)*Math.exp(-((q-l[0])**2+(k-l[1])**2)/(l[2]*l[2]*1.5)),v=X[S];at+=u*v[0],ot+=u*v[1],t+=u*v[2]}Ve[ee]+=at,Ve[ee+1]+=ot,Ve[ee+2]+=t}let Qe=1e-6;for(let Le=0;Le<Ve.length;Le++)Ve[Le]>Qe&&(Qe=Ve[Le]);const st=new Uint8Array(ye*ye*4);for(let Le=0;Le<ye*ye;Le++)st[Le*4]=255*Ve[Le*3]/Qe,st[Le*4+1]=255*Ve[Le*3+1]/Qe,st[Le*4+2]=255*Ve[Le*3+2]/Qe,st[Le*4+3]=255;return e.glowEnc=Qe,e.stats.lights=Ne,{faces:new Float32Array(I),spots:new Float32Array(Q),beams:new Float32Array(L),glow:st}}let ne,Be,Ee,je,$e=!1;function nt(Fe){const Ge=nn(),Je=Pe=>[{instanced:!0,attrs:Array.from({length:Pe},(pe,c)=>["i"+c,"vec4f"])}],le={topology:"strip",cull:"none",depthFunc:"lequal",depthWrite:!1,blend:"add"};e.cityZ=s.texture({w:e.cityW,h:e.cityH,format:"rgba8",filter:"nearest",wrap:"clamp",data:Fe.Z}),e.glowTex=s.texture({w:e.glN,h:e.glN,format:"rgba8",filter:"linear",wrap:"clamp",mips:!0,data:Fe.glow}),s.genMips(e.glowTex),e.faceBuf=s.buffer(Fe.faces,"vertex"),e.nFace=Fe.faces.length/24,e.spotBuf=s.buffer(Fe.spots,"vertex"),e.nSpot=Fe.spots.length/16,e.beamBuf=s.buffer(Fe.beams,"vertex"),e.nBeam=Fe.beams.length/16,ne=s.pipeline(Object.assign({name:"cityFace",lib:[St.common,Ge.air,Ge.lit],buffers:Je(6),varyings:{st:"vec4f",ab:"vec4f",py:"vec4f",ca:"vec4f",cb:"vec4f",mi:"vec4f",ex:"vec4f"},uniforms:{p:"vec4f",q:"vec4f",r:"vec4f",s:"vec4f"},textures:{tDetail:"2d",tCityZ:"2d"},vs:Ge.faceVS,fs:Ge.faceFS},le)),Be=s.pipeline(Object.assign({name:"citySpot",lib:[St.common,Ge.air,Ge.lit],buffers:Je(4),varyings:{uv:"vec2f",col:"vec4f"},uniforms:{p:"vec4f",q:"vec4f"},textures:{tDetail:"2d",tCityZ:"2d"},vs:Ge.spotVS,fs:Ge.spotFS},le)),Ee=s.pipeline(Object.assign({name:"cityBeam",lib:[St.common,Ge.air,Ge.lit],buffers:Je(4),varyings:{ab:"vec4f",pos:"vec4f",col:"vec4f"},uniforms:{p:"vec4f",q:"vec4f"},textures:{tDetail:"2d",tCityZ:"2d"},vs:Ge.beamVS,fs:Ge.beamFS},le)),je=s.pipeline(Object.assign({name:"cityGlow",lib:[St.common,Pa,Ge.air,Ge.lit],buffers:[],varyings:{dir:"vec3f"},uniforms:{p:"vec4f",q:"vec4f",c0:"vec4f",c1:"vec4f",c2:"vec4f",c3:"vec4f",c4:"vec4f"},textures:{tDetail:"2d",tCityZ:"2d",tCityA:"2d",tCityB:"2d",tGlow:"2d",tSeaB:"2d"},vs:Ge.glowVS,fs:Ge.glowFS},le)),e.pipes=[je,Ee,ne,Be],e.pipesReady=(async()=>{for(const Pe of e.pipes)s.finishPipelineAsync?await s.finishPipelineAsync(Pe):s.finishPipeline(Pe);$e=!0})().catch(Pe=>{e.litErr=Pe,console.error("city lights: "+(Pe&&Pe.message?Pe.message:Pe)),Pe&&Pe.vs&&console.log(Pe.vs.slice(0,3e4)),Pe&&Pe.fs&&console.log(Pe.fs.slice(0,3e4))}),e.hooked||(e.hooked=!0,qt.passes.transparent.push(Pe=>e.drawLights(Pe)))}e.drawLights=function(Fe){const Ge=e.lit;if(!$e||!Ge.on)return;const Je=Fe.cam,le=Math.tan(Je.fovY/2),Pe=Math.atan(le*Math.hypot(1,Fe.W/Fe.H));if(Je.fwd[0]*Math.sin(e.cityAz)-Je.fwd[2]*Math.cos(e.cityAz)<Math.cos(Math.min(h0,Pe+.6)))return;const pe=Nt.sunElev,c=mt((1/Nt.exposure-1/1.2)/(1/Nt.expDay-1/1.2)),Ie=Math.min(1,1.2/Nt.exposure),he=Fe.time,H=[pe,c,Ie,Nt.isMoon?1:0],z={tDetail:c0.detail,tCityZ:e.cityZ},V=(.25*ge(.14,.03,pe)+.75*ge(.04,-.085,pe))*(1+(Ge.dayGlow-1)*c)*Ie,I=na.step(Fe.time),Q=Re(1,I[2],Nt.lights),L=ye=>{const Ve=.5+.5*Math.sin(he*(.09+.017*ye)+ye*2.1),Ne=ke[ye][0],Ce=ke[ye][1],Ye=.3*w[ye][3]/1e3;return[Re(Ne[0],Ce[0],Ve)*Ye,Re(Ne[1],Ce[1],Ve)*Ye,Re(Ne[2],Ce[2],Ve)*Ye,0]};V>.001&&s.draw(je,{u:{p:[pe,c,V,he],q:[0,e.glowEnc/1.2*Ge.deck,Ge.dome,0],c0:L(0),c1:L(1),c2:L(2),c3:L(3),c4:L(4)},tex:{tDetail:c0.detail,tCityZ:e.cityZ,tCityA:e.cityA,tCityB:e.cityB,tGlow:e.glowTex,tSeaB:hs.sea.B},count:4}),e.nBeam&&pe<0&&Ge.beam>0&&s.draw(Ee,{u:{p:H,q:[Ge.beam*I[4],Q,I[3],0]},tex:z,vb:[e.beamBuf],count:4,instances:e.nBeam}),s.draw(ne,{u:{p:H,q:[Ge.win,Ge.screen,Ge.strip,Ge.flood],r:[Ge.sign,Ge.dayWin,Ge.dayLed,Ge.dayFlood],s:[Q,0,0,0]},tex:z,vb:[e.faceBuf],count:4,instances:e.nFace}),s.draw(Be,{u:{p:H,q:[Ge.spot,Ge.glint,0,0]},tex:z,vb:[e.spotBuf],count:4,instances:e.nSpot})},e.init=function(Fe,Ge={}){s=Fe;const Je=performance.now();Ge.farW&&(e.farW=Ge.farW),Ge.cityW&&(e.cityW=Ge.cityW,e.cityH=Math.round(Ge.cityW*.484));const le=D(e.farW,e.farH),Pe=performance.now();e.towers=ht();const pe=_(e.towers,e.cityW,e.cityH),c=performance.now(),Ie=C(e.towers,pe.zb,pe.BW,pe.BH),he=performance.now();Ie.Z=pe.Z,pe.zb=null;const H=(z,V,I)=>{const Q=s.texture({w:z,h:V,format:"rgba8",filter:"linear",wrap:"clamp",mips:!0,data:I});return s.genMips(Q),Q};e.farA=H(e.farW,e.farH,le.A),e.farB=H(e.farW,e.farH,le.B),e.cityA=H(e.cityW,e.cityH,pe.A),e.cityB=H(e.cityW,e.cityH,pe.B),e.shTex=s.texture({w:e.shRes,h:e.shRes,format:"r8",filter:"linear",wrap:"clamp"}),e.shadowElev=-9,e.updateShadow(!0),nt(Ie),Ge.keep&&(e.dbg={far:le,city:pe}),e.stats.ms=[Math.round(Pe-Je),Math.round(c-Pe),Math.round(performance.now()-c)],e.stats.lightMs=Math.round(he-c),e.stats.nLight=[e.nFace,e.nSpot,e.nBeam],e.ready=!0};let Ke=null;return e.updateShadow=function(Fe){if(!Ke){if(Math.abs(e.shadowElev-Nt.elev)<.006||!Fe&&Nt.elev<.015)return;e.shadowElev=Nt.elev,Ke=b(Math.tan(Math.max(Nt.elev,.02)),Nt.az)}re(Ke,e.towers,Fe?1e9:1.2)&&(s.updateTexture(e.shTex,0,0,e.shRes,e.shRes,Ke.S),Ke=null)},e.farH_=Y,e.cores=w,e.famc=X,e})();function on(){const e=L0,s=E=>Number.isInteger(E)?E.toFixed(1):String(+E.toFixed(7)),w=e.cityAz,x=e.cityDist,F=[x*Math.sin(w),-x*Math.cos(w)],we=[Math.cos(w),Math.sin(w)],Y=[Math.sin(w),-Math.cos(w)];return Ka()+`
fn vistaHaze(d: vec3f) -> vec3f { let h: vec3f = skyLut(normalize(vec3f(d.x, 0.022, d.z))); return mix(mix(h, vec3f(luma(h)) * vec3f(1.03, 1.0, 1.0), 0.55 * U.sunDir.w), M.wa.rgb * 1.3, M.wa.w); }   // (under heavy snow's overcast the air is its grey: 05b_weather.js)
// mip level for a panorama whose texels subtend 'texel' radians
fn vistaLod(texel: f32) -> f32 { return max(log2(2.0 * U.camRight.w * U.res.w / texel), 0.0); }
fn farRanges(d: vec3f, colIn: vec3f) -> vec3f {
  let az: f32 = atan2(d.x, -d.z); let el: f32 = atan2(d.y, length(d.xz));
  let uv: vec2f = vec2f(az / ${s(2*e.AZ)} + 0.5, (${s(e.EL1)} - el) / ${s(e.EL1-e.EL0)});
  if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) { return colIn; }
  let lod: f32 = vistaLod(${s(2*e.AZ/e.farW)});
  let A: vec4f = texLod(tFarA, uv, lod);
  if (A.a < 0.004) { return colIn; }
  let B: vec4f = texLod(tFarB, uv, lod);
  let N: vec3f = normalize(A.xyz * 2.0 - 1.0);
  let dist: f32 = 20000.0 * exp(B.x * 2.302585);
  let L: vec3f = U.sunDir.xyz; let tanE: f32 = L.y / max(length(L.xz), 1e-3);
  let sh: f32 = smoothstep(-0.03, 0.05, tanE - (B.y * 1.1 - 0.1));
  let ndl: f32 = dot(N, L);
  let amb: vec3f = U.ambSky.rgb * (1.2 + 0.8 * N.y) + U.ambGnd.rgb * (0.45 - 0.35 * N.y);
  // (the summits stand higher than the eye, and keep the sun after it has left the mountain: M.fr)
  let snow: vec3f = vec3f(0.92, 0.95, 0.98) * (M.fr.rgb * saturate((ndl + 0.18) / 1.18) * sh + amb);
  let rock: vec3f = vec3f(0.17, 0.155, 0.15) * (M.fr.rgb * saturate(ndl) * sh + amb);
  var c: vec3f = mix(snow, rock, B.z);
  // air: the further range is the paler one
  c = mix(vistaHaze(d), c, exp(-dist / 65000.0));
  // feet in the cloud deck
  let hc: f32 = dist * tan(el) + ${s(e.deck)};
  let a: f32 = A.a * smoothstep(-120.0, 260.0, hc) * smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x);
  return mix(colIn, c, a);
}
// the light the town throws up at a point pp of the deck (m from the eye, horizontal), in its colours: sodium streets far and wide, and
// every quarter's own cast (scene units at night; without the single towers' pools). It lights the towers' walls from below (cityLayer);
// it is also there for a cloud shader that would rather light the deck itself where its own surface lies. The delivered cloud sea does
// not call it: there the coloured light is laid over the deck by Vista.drawLights (Vista.lit.deck = 0 turns that off)
fn cityGlow3(pp: vec2f) -> vec3f {
  let rel: vec2f = pp - vec2f(${s(F[0])}, ${s(F[1])});
  let u: f32 = dot(rel, vec2f(${s(we[0])}, ${s(we[1])})); let w: f32 = dot(rel, vec2f(${s(Y[0])}, ${s(Y[1])}));
  var c: vec3f = vec3f(1.0, 0.54, 0.19) * (${s(e.lit.town/1.2)} * exp(-sq((u + 200.0) / 3600.0) - sq(w / 3000.0)));
${e.cores.map((E,D)=>`  c += vec3f(${e.famc[D].map(s).join(", ")}) * (${s(e.lit.core/1.2*(.3+E[3]/1e3))} * exp(-(sq(u - ${s(E[0])}) + sq(w - ${s(E[1])})) / ${s(E[2]*E[2]*1.5)}));`).join(`
`)}
  return c;
}
fn cityLayer(d: vec3f, colIn: vec3f) -> vec3f {
  let az: f32 = atan2(d.x, -d.z) - ${s(e.cityAz)}; let el: f32 = atan2(d.y, length(d.xz));
  let uv: vec2f = vec2f(az / ${s(2*e.cityHalf)} + 0.5, (${s(e.cEL1)} - el) / ${s(e.cEL1-e.cEL0)});
  if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) { return colIn; }
  let lod: f32 = vistaLod(${s(2*e.cityHalf/e.cityW)});
  let A: vec4f = texLod(tCityA, uv, lod);
  if (A.a < 0.004) { return colIn; }
  let B: vec4f = texLod(tCityB, uv, lod);
  let n2: vec2f = A.xy * 2.0 - 1.0;
  let N: vec3f = normalize(vec3f(n2.x, 1e-3, n2.y));
  let tone: f32 = A.z; let glass: f32 = B.y; let dist: f32 = ${s(e.cityNear)} + B.z * ${s(e.citySpan)}; let h: f32 = B.w * ${s(e.cityTop+300)} - 300.0;
  let L: vec3f = U.sunDir.xyz;
  let ndl: f32 = saturate(dot(N, L));
  // the bright deck below throws a great deal of light back up the walls
  let amb: vec3f = U.ambSky.rgb * 0.85 + U.ambGnd.rgb * 0.5;
  let alb: vec3f = mix(vec3f(0.030, 0.040, 0.055), vec3f(0.60, 0.57, 0.52), tone);
  var c: vec3f = alb * (U.sunCol.rgb * ndl + amb);
  // glass: a mirror for the sky; where a wall lines up between the sun and the eye its panes flash
  let R: vec3f = reflect(d, N);
  let F: f32 = (0.045 + 0.955 * pow(1.0 - saturate(dot(-d, N)), 5.0)) * glass;
  var env: vec3f = skyLut(vec3f(R.x, abs(R.y) + 0.04, R.z));
  let rsh: f32 = saturate(dot(normalize(R.xz), normalize(L.xz)));
  // (no two panes of a curtain wall lie quite in one plane: the flash is a scatter of them, and it climbs the wall as the light shifts)
  let pane: f32 = smoothstep(0.50, 0.82, texLod(tDetail, uv * vec2f(${s(e.cityW/1792)}, ${s(e.cityH/1792)}) + vec2f(0.37, -U.camPos.w * 0.0011), max(lod - 1.8, 0.0)).a);
  env += U.sunCol.rgb * (pow(rsh, 160.0) * 9.0 * exp(-sq((L.y - R.y) / 0.36)) * mix(1.0, 0.25 + 2.3 * pane, saturate(2.8 - lod)));
  c = c * (1.0 - F) + env * F;
  // after dark: the light of the streets and of the lit cloud coming up the walls, in the colour of the quarter the tower stands in
  // (the lights themselves are drawn over this by Vista.drawLights)
  c += alb * (vec3f(0.30, 0.17, 0.12) + cityGlow3(normalize(d.xz) * dist) * 2.0) * (U.skyP.z * exp(-max(h, 0.0) / 300.0));
  // a great deal of air lies between here and there: the towers stand in it as blue shapes, the farther ones paler
  c = mix(vistaHaze(d) * vec3f(0.80, 0.93, 1.10), c, exp(-dist / 15000.0));
  // the deck swallows the lower floors: its billows stand at different heights, and wisps hang round the floors just above them
  let feet: vec2f = cityFeet(d, dist, h);
  c = mix(c, colIn * 1.04, feet.y);
  let a: f32 = A.a * feet.x * smoothstep(0.0, 0.02, uv.x) * smoothstep(1.0, 0.98, uv.x);
  return mix(colIn, c, a);
}
// the sodium light of the streets coming up through the deck at pp (the cloud sea adds it in one fixed orange; the coloured light of the
// towers is laid over it by Vista.drawLights)
fn cityGlow(pp: vec2f) -> f32 { let r: f32 = length(pp - vec2f(${s(F[0])}, ${s(F[1])})); return 0.26 * exp(-r / 1300.0) + 0.07 * exp(-r / 4200.0); }
// shade of the towers on the deck at a point pp (m from the eye, horizontal)
fn cityShadow(pp: vec2f) -> f32 {
  let rel: vec2f = pp - vec2f(${s(F[0])}, ${s(F[1])});
  let uv: vec2f = vec2f((dot(rel, vec2f(${s(we[0])}, ${s(we[1])})) - ${s(e.shU0)}) / ${s(e.shU1-e.shU0)}, (dot(rel, vec2f(${s(Y[0])}, ${s(Y[1])})) - ${s(e.shW0)}) / ${s(e.shW1-e.shW0)});
  return texLod(tCitySh, uv, 0.0).x;
}
`}function Ka(){return`
// the cloud deck's billows: rounded tops with creases between them (0 in a crease, about 1 on a top)
fn deckA(p: vec2f, lod: f32) -> f32 { let q: f32 = texLod(tDetail, p / 17000.0, lod).z * 2.0 - 1.0; return sqrt(q * q + 0.003) * 1.9; }
// the deck swallows the lower floors: its billows stand at different heights, and wisps hang round the floors just above them. For a point
// h metres above the deck's floor and dist metres off along d: x = how much of it shows, y = how much of what shows the wisps veil
fn cityFeet(d: vec3f, dist: f32, h: f32) -> vec2f {
  let pp: vec2f = normalize(d.xz) * dist + vec2f(U.skyP.y * 9000.0, U.skyP.y * 2500.0);
  let wl: f32 = texLod(tDetail, pp / 900.0 + vec2f(0.11, 0.83) + h * 0.0011, 0.0).z;
  let top: f32 = min(deckA(pp, log2(max(dist * 2.0 * U.camRight.w * U.res.w / sqrt(max(-d.y, 0.02)) / 33.0, 1.0))), 1.0) * 260.0 + 40.0 * (wl - 0.42);
  return vec2f(smoothstep(-10.0, 110.0, h - top), (1.0 - smoothstep(0.0, 130.0, h - top)) * smoothstep(0.40, 0.70, wl) * 0.65);
}
`}function nn(){const e=L0,s=C=>Number.isInteger(C)?C.toFixed(1):String(+C.toFixed(7)),w=e.cityAz,x=e.cityDist,F=[x*Math.sin(w),-x*Math.cos(w)],we=[Math.cos(w),Math.sin(w)],Y=[Math.sin(w),-Math.cos(w)],E=e.deck-190,D=.6,be=-.2,ht=.13,qe=C=>{const ne=L0.cores[C];return`vec2f(${s(F[0]+ne[0]*we[0]+ne[1]*Y[0])}, ${s(F[1]+ne[0]*we[1]+ne[1]*Y[1])}), ${s(ne[2]*.95)}`},se=`
const C_DECK: f32 = ${s(e.deck)};
fn cproj(p: vec3f) -> vec4f { return U.viewProj * vec4f(U.camPos.xyz + p, 1.0); }
// the direction a pixel looks in
fn pixDir(px: vec2f) -> vec3f { let n: vec2f = vec2f(px.x * U.res.z * 2.0 - 1.0, 1.0 - px.y * U.res.w * 2.0); return normalize(U.camFwd.xyz + U.camRight.xyz * (n.x * U.camRight.w * U.camUp.w) + U.camUp.xyz * (n.y * U.camRight.w)); }
// where a direction falls in the city's panorama
fn cityUV(d: vec3f) -> vec2f { return vec2f((atan2(d.x, -d.z) - ${s(e.cityAz)}) / ${s(2*e.cityHalf)} + 0.5, (${s(e.cEL1)} - atan2(d.y, length(d.xz))) / ${s(e.cEL1-e.cEL0)}); }
// how far off the nearest tower stands there (open sky counts as beyond them all)
fn cityZ(uv: vec2f) -> f32 { let z: vec4f = texLod(tCityZ, uv, 0.0); return ${s(e.cityNear)} + (floor(z.x * 255.0 + 0.5) * 256.0 + floor(z.y * 255.0 + 0.5)) * ${s(e.citySpan/65535)}; }
// how much of the pixel round uv is clear of towers nearer than r
fn cityOpen(uv: vec2f, du: vec2f, dv: vec2f, r: f32) -> f32 {
  return 0.25 * (step(r, cityZ(uv + du * 0.125 + dv * 0.375)) + step(r, cityZ(uv - du * 0.375 + dv * 0.125)) + step(r, cityZ(uv + du * 0.375 - dv * 0.125)) + step(r, cityZ(uv - du * 0.125 - dv * 0.375)));
}
// the colour of a room's lamps: sodium and tungsten at one end, daylight tubes at the other
fn winTint(k: f32) -> vec3f { return mix(mix(vec3f(1.0, 0.48, 0.14), vec3f(1.0, 0.64, 0.28), saturate(k * 3.0)), mix(vec3f(1.0, 0.80, 0.50), vec3f(0.88, 0.93, 1.0), saturate(k * 3.0 - 2.0)), saturate(k * 3.0 - 1.0)); }
// the lit windows of a wall, from so far that only blocks of them can be told apart: one number a block (c metres of floors, 2c of bays),
// blended to its neighbours; a block is lit when its number stands above th
fn winCells(q: vec2f, c: f32, sd: f32, th: f32, rw: f32, tm: f32, warm: f32, acc: vec3f) -> vec3f {
  let g: vec2f = q / vec2f(c * 2.0, c) + vec2f(sd * 311.7, sd * 173.3);
  let n: f32 = texLod(tDetail, (g + 0.5) / 512.0, 0.0).a;
  let m: f32 = texLod(tDetail, (g + vec2f(189.5, 97.5)) / 512.0, 0.0).a;
  // whole floors are lit, or dark, from end to end
  let fl: f32 = texLod(tDetail, vec2f(sd * 97.0 + 331.5, g.y + 61.5) / 512.0, 0.0).a;
  // every block has a slow clock of its own that carries it toward the line and back; one in ten goes right over it, on and off, and
  // now and then a whole floor does (lights going on and off somewhere at any moment, never many at once)
  let fr: f32 = fract(fl * 57.31);
  let k: f32 = mix(n, fl, 0.6) + (0.045 + 0.40 * smoothstep(0.86, 0.92, m)) * clamp(2.5 * sin(tm * (0.14 + 0.5 * n) + m * 41.0 + n * 9.0), -1.0, 1.0)
    + 0.16 * smoothstep(0.80, 0.90, fr) * clamp(2.5 * sin(tm * (0.10 + 0.25 * fract(fl * 13.7)) + fl * 50.0), -1.0, 1.0);
  let lt: f32 = smoothstep(th - rw, th + rw, k);
  var c3: vec3f = winTint(saturate(warm + (fl - 0.5) * 0.7 + (m - 0.5) * 0.35));
  c3 = mix(c3, acc * 1.4, smoothstep(0.975, 0.99, m) * 0.6);       // (a coloured room is a rare thing)
  // (and the eleven kilometres of air between make every one of them tremble a little)
  return c3 * (lt * (0.45 + 1.1 * m * m) * (1.0 + 1.3 * smoothstep(0.86, 1.0, n)) * (0.91 + 0.09 * sin(tm * (4.0 + 6.0 * m) + n * 61.0)));
}
`,_=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let cx: f32 = f32(a.vid & 1u); let cy: f32 = f32((a.vid >> 1u) & 1u);
  let A: vec2f = a.i0.xy; let B: vec2f = a.i0.zw; let y0: f32 = a.i1.x - C_DECK; let y1: f32 = a.i1.y - C_DECK;
  let P: vec3f = vec3f(mix(A.x, B.x, cx), mix(y0, y1, cy), mix(A.y, B.y, cx));
  var c: vec4f = cproj(P); var s: f32 = cx; var t: f32 = cy;
  // every edge is pushed out by three quarters of a pixel: the fragment stage then weighs each pixel by how much of it the wall really
  // covers, so a wall a pixel and a half wide neither crawls nor drops out as the camera turns
  let ca: vec4f = cproj(vec3f(A.x, P.y, A.y)); let cb: vec4f = cproj(vec3f(B.x, P.y, B.y));
  let cl: vec4f = cproj(vec3f(P.x, y0, P.z)); let ch: vec4f = cproj(vec3f(P.x, y1, P.z));
  if (min(min(ca.w, cb.w), min(cl.w, ch.w)) > 1.0) {
    let hr: vec2f = U.res.xy * 0.5;
    let ex: vec2f = (cb.xy / cb.w - ca.xy / ca.w) * hr; let ey: vec2f = (ch.xy / ch.w - cl.xy / cl.w) * hr;
    let lx: f32 = max(length(ex), 1e-3); let ly: f32 = max(length(ey), 1e-3);
    let ox: f32 = (cx * 2.0 - 1.0) * 0.75; let oy: f32 = (cy * 2.0 - 1.0) * 0.75;
    c = vec4f(c.xy + (ex * (ox / lx) + ey * (oy / ly)) / hr * c.w, c.zw);
    s = cx + ox / lx; t = cy + oy / ly;
  }
  v.clip = vec4f(c.xy, c.w * 0.999999, c.w);
  v.st = vec4f(s, t, a.i1.z, a.i1.w); v.ab = a.i0; v.py = vec4f(a.i2.x, a.i2.y, a.i1.x, a.i1.y);
  v.ca = a.i3; v.cb = a.i4; v.mi = vec4f(a.i2.z, a.i2.w, a.i5.x, a.i5.y); v.ex = vec4f(a.i5.z, 0.0, 0.0, 0.0);
  return v;
}`,b=`
fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0);
  let s: f32 = v.st.x; let t: f32 = v.st.y; let kind: f32 = v.st.z; let seed: f32 = v.st.w;
  let fs: f32 = abs(dpdx(s)) + abs(dpdy(s)); let ft: f32 = abs(dpdx(t)) + abs(dpdy(t));
  let d: vec3f = pixDir(v.clip.xy); let uv: vec2f = cityUV(d); let du: vec2f = dpdx(uv); let dv: vec2f = dpdy(uv);
  // how much of this pixel the wall covers
  let cov: f32 = saturate((min(s + 0.5 * fs, 1.0) - max(s - 0.5 * fs, 0.0)) / max(fs, 1e-6)) * saturate((min(t + 0.5 * ft, 1.0) - max(t - 0.5 * ft, 0.0)) / max(ft, 1e-6));
  // its own hour: 0 until the sun is low enough for it, then up to 1
  let lvl: f32 = smoothstep(v.mi.x + v.mi.y, v.mi.x - v.mi.y, M.p.x);
  if (cov * lvl < 0.002) { return o; }
  let sc: f32 = saturate(s); let tc: f32 = saturate(t);
  let R: f32 = v.ex.x; let sr: f32 = clamp(sc * 2.0 - 1.0, -0.999, 0.999); let cr: f32 = sqrt(1.0 - sr * sr);
  let ra: f32 = length(v.ab.xy); let rb: f32 = length(v.ab.zw);
  let dist: f32 = length(mix(v.ab.xy, v.ab.zw, sc)) - R * cr;
  let y: f32 = mix(v.py.z, v.py.w, tc);
  let feet: vec2f = cityFeet(d, dist, y);
  // (a wall seen nearly edge on runs away from the eye quickly: allow for that when asking whether something nearer hides it)
  let lw: f32 = length(v.ab.zw - v.ab.xy); let slant: f32 = abs(rb - ra) / max(sqrt(max(lw * lw - sq(rb - ra), 0.0)), 1.0);
  let air: f32 = cov * feet.x * (1.0 - feet.y) * exp(-dist / 15000.0) * cityOpen(uv, du, dv, dist - min(22.0 + 6.0 * slant, 70.0) - R);
  if (air < 0.0015) { return o; }
  // where on the wall: metres round the tower and metres up, and what one pixel spans there
  var p: f32 = mix(v.py.x, v.py.y, sc); var fp: f32 = fs * abs(v.py.y - v.py.x);
  if (R > 0.0) { p = R * asin(sr); fp = fs * 2.0 * R / max(cr, 0.25); }
  let fy: f32 = ft * (v.py.w - v.py.z);
  let tm: f32 = U.camPos.w; let dk: f32 = M.p.y;
  var col: vec3f = vec3f(0.0);
  // a lit wall too narrow to fill its pixels still dazzles: it is shown a little brighter than its share of them
  let nb: f32 = pow(clamp(0.25 / max(fs, 1e-4), 0.25, 1.0), -0.35);
  if (kind < 0.5) {
    // windows. Blocks of them, at the size a pixel can show (two sizes blended, so nothing jumps as the lens zooms); the share that is lit
    // grows as the sun sinks, each block with its own moment
    let f: f32 = max(max(fp, fy), 0.5);
    let L: f32 = max(log2(f * 0.4), 0.0); let l0: f32 = floor(L); let c0: f32 = 4.0 * exp2(l0);
    let sh: f32 = v.mi.z * pow(lvl, 1.3); let th: f32 = 1.0 - sqrt(0.5 * sh);
    let q: vec2f = vec2f(p, y);
    // (the bigger the block, the more windows in it, and the less it is simply lit or dark)
    let rw: f32 = 0.09 + 0.05 * L;
    // (and under the blocks that can be told apart, the even glow of all the windows that cannot)
    col = (mix(winCells(q, c0, seed, th, rw, tm, v.mi.w, v.cb.rgb), winCells(q, c0 * 2.0, seed + 0.37, th, rw, tm, v.mi.w, v.cb.rgb), L - l0) + winTint(v.mi.w) * (0.24 * sh))
      * v.ca.rgb * (v.ca.w * M.q.x * nb * (1.0 + (M.r.y - 1.0) * dk) * smoothstep(0.0, 0.06, lvl));
  } else if (kind < 1.5) {
    // a wall that is a screen: bands of colour climbing it, two colours chasing each other up it, or a bar of light sweeping it
    let lam: f32 = v.mi.z; let spd: f32 = v.mi.w; let pat: f32 = v.cb.w;
    let aa: f32 = saturate(lam / max(fy, 0.01) * 0.5 - 0.7);                 // bands finer than a pixel or two run together
    var b: f32 = 0.5 + 0.5 * sin(6.2832 * ((y - tm * spd) / lam + seed * 7.0)); b = mix(0.5, b * b * (3.0 - 2.0 * b), aa);
    let drift: f32 = 0.5 + 0.5 * sin(tm * 0.19 + seed * 31.0 + y * 0.0035);
    if (pat < 0.5) { col = mix(v.ca.rgb, v.cb.rgb, smoothstep(0.2, 0.8, drift)) * (0.22 + 1.0 * b); }
    else if (pat < 1.5) { col = mix(v.ca.rgb, v.cb.rgb, b) * (0.8 + 0.2 * sin(tm * 0.45 + seed * 11.0)); }
    else if (pat < 2.5) { let sw: f32 = fract(tm * spd / 420.0 + seed * 3.0) * 1.5 - 0.25; col = v.ca.rgb * 0.45 + v.cb.rgb * (1.5 * exp(-sq((tc - sw) / max(0.09, 1.5 * ft)))); }
    else {
      // a picture, too far off to make out: patches of its two colours that drift up the wall and change
      let nz: f32 = texLod(tDetail, vec2f(p * 0.0021 + seed * 3.7, y * 0.0021 - tm * 0.012), 0.0).z;
      col = mix(v.ca.rgb, v.cb.rgb, smoothstep(0.44, 0.56, nz + 0.10 * sin(tm * 0.6 + seed * 9.0))) * (0.55 + 0.75 * smoothstep(0.30, 0.70, fract(nz * 3.0 + tm * 0.05)));
    }
    col *= v.ca.w * M.q.y * nb * (1.0 + (M.r.z - 1.0) * dk) * lvl;
  } else if (kind < 2.5) {
    // a strip of LEDs up a corner, round the top of a tier or up a mast: far thinner than a pixel, so it is shown as bright as its
    // glare makes it (a little more than its share of the pixel). It breathes, or a pulse runs along it
    let upr: bool = (v.py.w - v.py.z) > abs(v.py.y - v.py.x);
    let al: f32 = select(sc, tc, upr); let fa: f32 = select(fs, ft, upr);
    let wpx: f32 = 1.0 / max(select(ft, fs, upr), 1e-4);
    var b: f32 = 0.8 + 0.2 * sin(tm * (0.5 + seed) + seed * 50.0);
    if (v.cb.w > 0.5) { let ph: f32 = fract(tm * v.mi.w + seed * 5.0) * 1.5 - 0.25; b = 0.5 + 2.4 * exp(-sq((al - ph) / max(0.08, 1.5 * fa))); }
    col = v.ca.rgb * (b * pow(min(wpx, 1.0), -0.45) * v.ca.w * M.q.z * (1.0 + (M.r.z - 1.0) * dk) * lvl);
  } else if (kind < 3.5) {
    // a floodlit crown or setback: brightest at its foot, where the lamps stand
    col = mix(v.ca.rgb, v.cb.rgb, 0.5 + 0.5 * sin(tm * v.mi.w + seed * 20.0)) * (exp(-tc * v.mi.z) * v.ca.w * M.q.w * (1.0 + (M.r.w - 1.0) * dk) * lvl);
  } else {
    // a sign: steady, changing between two colours, or blinking
    let wpx: f32 = min(1.0 / max(fs, 1e-4), 1.0) * min(1.0 / max(ft, 1e-4), 1.0);
    var c3: vec3f = v.ca.rgb; let w2: f32 = sin(tm * v.mi.w + seed * 40.0);
    if (v.cb.w > 1.5) { c3 *= 0.2 + 0.8 * smoothstep(-0.3, 0.1, w2); } else if (v.cb.w > 0.5) { c3 = mix(v.ca.rgb, v.cb.rgb, smoothstep(-0.2, 0.2, w2)); }
    col = c3 * (pow(wpx, -0.42) * v.ca.w * M.r.x * (1.0 + (M.r.z - 1.0) * dk) * lvl);
  }
  // (the night's colour setting calms the coloured light: screens, lines and signs. Windows and floodlit stone keep their warmth)
  let sx: f32 = select(M.s.x, mix(1.0, M.s.x, 0.25), kind < 0.5 || (kind > 2.5 && kind < 3.5));
  o.color = vec4f(mix(vec3f(luma(col)), col, sx) * (air * M.p.z), 0.0); return o; }`,re=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let P: vec3f = vec3f(a.i0.x, a.i0.y - C_DECK, a.i0.z);
  let c: vec4f = cproj(P); let d: vec3f = normalize(P); let dist: f32 = length(P.xz);
  let tm: f32 = U.camPos.w; let e: f32 = M.p.x; let kind: f32 = a.i2.x; let cyc: f32 = fract(tm / a.i2.y + a.i2.z);
  var b: f32 = 1.0; var tint: vec3f = a.i1.rgb; var gain: f32 = a.i1.w * (1.0 + (a.i3.x - 1.0) * M.p.y);
  if (kind < 0.5) { b = smoothstep(0.0, 0.12, cyc) * smoothstep(0.62, 0.42, cyc); }                    // an obstruction lamp: it swells and dies like a filament
  else if (kind < 1.5) { b = exp(-sq((cyc - 0.04) / 0.02)) + exp(-sq((cyc - 0.16) / 0.02)); }           // a strobe: two flashes, then nothing
  else if (kind < 2.5) { b = 0.85 + 0.15 * sin(tm * 2.3 + a.i2.z * 40.0); }                            // a lamp that stays on
  else {                                                                                               // the sun in a pane of glass
    b = exp(-sq((e + 0.012 * sin(tm * 0.4 + a.i2.z * 6.2832) - a.i3.y) / a.i3.z)) * (0.55 + 0.45 * sin(tm * (3.0 + 4.0 * a.i2.z) + a.i2.z * 60.0) * sin(tm * 1.7 + a.i2.z * 23.0));
    tint = U.sunCol.rgb * (1.0 - M.p.w); gain = a.i1.w * M.q.y;
  }
  // the air between trembles
  b *= 1.0 + 0.10 * sin(tm * (5.0 + 3.0 * a.i2.z) + a.i2.z * 90.0) * sin(tm * 3.1 + a.i2.z * 33.0);
  let feet: vec2f = cityFeet(d, dist, a.i0.y);
  let amt: f32 = b * gain * smoothstep(a.i2.w + 0.004, a.i2.w - 0.004, e) * feet.x * (1.0 - feet.y) * exp(-dist / 15000.0) * step(dist - 45.0, cityZ(cityUV(d))) * M.q.x * M.p.z;
  // a point of light is as wide as the air and the lens make it: a core a little over a pixel across (never under 0.6 mrad), and a faint halo
  let sg: f32 = max(0.62, 0.0006 / (2.0 * U.camRight.w * U.res.w));
  if (amt < 0.0005 || c.w < 1.0) { v.clip = vec4f(2.0, 2.0, 2.0, 1.0); }
  else { v.clip = vec4f(c.xy + corner * (sg * 6.0 * 2.0) * U.res.zw * c.w, c.w * 0.999999, c.w); }
  v.uv = corner * 6.0; v.col = vec4f(tint * (amt * pow(0.62 / sg, 1.2)), 0.0);
  return v;
}`,m=`
fn frag(v: VOut) -> FOut { var o: FOut; let r2: f32 = dot(v.uv, v.uv); o.color = vec4f(mix(v.col.rgb, vec3f(luma(v.col.rgb)), M.q.z) * (exp(-r2) + 0.06 * exp(-r2 / 9.0)), 0.0); return o; }`,J=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let cx: f32 = f32(a.vid & 1u); let side: f32 = f32((a.vid >> 1u) & 1u) * 2.0 - 1.0;
  // it swings from side to side and nods, slowly
  let tm: f32 = U.camPos.w; let w: f32 = 6.2832 / a.i3.x;
  let az: f32 = a.i2.x + a.i2.z * sin(tm * w + a.i3.y); let tl: f32 = a.i2.y + a.i2.w * sin(tm * w * 0.73 + a.i3.y * 1.7 + 1.0);
  let D: vec3f = vec3f(sin(tl) * sin(az), cos(tl), -sin(tl) * cos(az));
  let O: vec3f = vec3f(a.i0.x, a.i0.y - C_DECK, a.i0.z); let Lb: f32 = a.i0.w;
  let P: vec3f = O + D * (Lb * cx);
  let c: vec4f = cproj(P); let co: vec4f = cproj(O); let ce: vec4f = cproj(O + D * Lb);
  let hr: vec2f = U.res.xy * 0.5;
  var n: vec2f = vec2f(1.0, 0.0);
  if (min(co.w, ce.w) > 1.0) { let dir: vec2f = (ce.xy / ce.w - co.xy / co.w) * hr; n = vec2f(-dir.y, dir.x) / max(length(dir), 1e-3); }
  // it widens as it goes; where it is thinner than a pixel it is drawn a pixel wide and fainter
  let rpx: f32 = (a.i3.w + Lb * cx * 0.016) / (length(P) * 2.0 * U.camRight.w * U.res.w); let sg: f32 = max(rpx, 0.9);
  let hw: f32 = sg * 2.2 + 0.75;
  v.clip = vec4f(c.xy + n * (side * hw) / hr * c.w, c.w * 0.999999, c.w);
  // seen from near its own line a beam is a far longer path of lit air, and the air throws most of its light forward
  let cs: f32 = dot(D, -normalize(O)); let sn: f32 = sqrt(max(1.0 - cs * cs, 0.0));
  let ph: f32 = (0.7 + 1.6 * pow(saturate(cs), 3.0)) / max(sn, 0.35);
  v.ab = vec4f(cx, side * hw / sg, pow(min(rpx / 0.9, 1.0), 0.7), a.i3.w);
  v.pos = vec4f(P, Lb);
  // (the night's colour: the lights less saturated; every other searchlight fades out with M.q.z)
  let keep: f32 = select(M.q.z, 1.0, (a.iid & 1u) == 0u);
  v.col = vec4f(mix(vec3f(luma(a.i1.rgb)), a.i1.rgb, M.q.y) * (keep * a.i1.w * ph * smoothstep(a.i3.z + 0.012, a.i3.z - 0.012, M.p.x) * M.q.x * M.p.z), 0.0);
  return v;
}`,ae=`
fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0);
  let s: f32 = v.ab.x; let x: f32 = v.ab.y; let P: vec3f = v.pos.xyz; let dist: f32 = length(P.xz); let along: f32 = s * v.pos.w; let h: f32 = P.y + C_DECK;
  // the beam thins as it spreads, and is used up by the air it lights (of which there is less the higher it climbs)
  var g: f32 = exp(-x * x) * v.ab.z * (v.ab.w / (v.ab.w + along * 0.016)) * exp(-along / 1500.0) * exp(-max(h, 0.0) / 2400.0) * smoothstep(0.0, 0.02, s) * smoothstep(1.0, 0.7, s);
  if (g * max(v.col.r, max(v.col.g, v.col.b)) < 0.0005) { return o; }
  let d: vec3f = pixDir(v.clip.xy); let uv: vec2f = cityUV(d);
  g *= cityFeet(d, dist, h).x * exp(-dist / 15000.0) * 0.5 * (step(dist - 30.0, cityZ(uv)) + step(dist - 30.0, cityZ(uv + vec2f(0.0007, 0.0005))));
  o.color = vec4f(v.col.rgb * g, 0.0); return o; }`,X=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let az: f32 = ${s(e.cityAz)} + mix(${s(-D)}, ${s(D)}, f32(a.vid & 1u)); let el: f32 = mix(${s(be)}, ${s(ht)}, f32((a.vid >> 1u) & 1u));
  let c: vec4f = cproj(vec3f(sin(az) * cos(el), sin(el), -cos(az) * cos(el)) * 9000.0);
  v.clip = vec4f(c.xy, c.w * 0.999999, c.w); v.dir = vec3f(az, el, 0.0);
  return v;
}`,ke=`
fn erfa(x: f32) -> f32 { return sign(x) * sqrt(1.0 - exp(-1.2732 * x * x)); }
// the lit haze over one quarter of the city: its glow gathered along the line of sight, as far as the deck or the tower that ends it
fn domeBlob(dh: vec2f, sl: f32, c: vec2f, sg: f32, tb: f32, tw: f32, a: f32) -> f32 {
  let t0: f32 = dot(c, dh); let b2: f32 = max(dot(c, c) - t0 * t0, 0.0);
  let h0: f32 = max(t0 * sl + ${s(E)}, 0.0);
  let k: f32 = exp(-b2 / (sg * sg)) * (exp(-h0 / 260.0) + 0.10 * exp(-h0 / 900.0));
  if (k < 0.003 || t0 < 0.0) { return 0.0; }
  return k * 0.5 * (sg / 1000.0) * mix(erfa((tb - t0) / sg) + 1.0, erfa((min(tb, tw) - t0) / sg) + 1.0, a);
}
fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0);
  let d: vec3f = pixDir(v.clip.xy);
  let az: f32 = atan2(d.x, -d.z) - ${s(e.cityAz)}; let el: f32 = atan2(d.y, length(d.xz));
  let edge: f32 = smoothstep(${s(D)}, ${s(D-.06)}, abs(az)) * smoothstep(${s(ht)}, ${s(ht-.05)}, el) * smoothstep(${s(be)}, ${s(be+.02)}, el);
  if (edge <= 0.0) { return o; }
  let pxa: f32 = 2.0 * U.camRight.w * U.res.w;
  // the towers that stand in this direction, and how far off: they hide whatever glows behind them
  let uv: vec2f = cityUV(d); var twA: f32 = 0.0; var twD: f32 = 1e9;
  if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
    let lod: f32 = max(log2(pxa / ${s(2*e.cityHalf/e.cityW)}), 0.0);
    let A: vec4f = texLod(tCityA, uv, lod);
    if (A.a > 0.004) {
      let B: vec4f = texLod(tCityB, uv, lod);
      twD = ${s(e.cityNear)} + B.z * ${s(e.citySpan)};
      twA = A.a * smoothstep(0.0, 0.02, uv.x) * smoothstep(1.0, 0.98, uv.x) * cityFeet(d, twD, B.w * ${s(e.cityTop+300)} - 300.0).x;
    }
  }
  let hl: f32 = max(length(d.xz), 1e-4); let dh: vec2f = d.xz / hl; let sl: f32 = d.y / hl;
  // tb: how far off the line of sight ends in the deck (roughly, to begin with)
  var col: vec3f = vec3f(0.0); var tb: f32 = 1e9; if (sl < -0.003) { tb = ${s(E)} / -sl; }
  if (d.y < -0.034 && d.y > -0.185) {
    // ---- the deck, lit from below and by the walls that stand in it: the light lies where the line of sight meets the cloud that is
    // drawn there (the cloud sea's own panorama of distances, seaRange in 05_sky.js)
    let dy: f32 = -d.y;
    let tt: f32 = seaRange(d); tb = tt * hl;
    let fh: f32 = 1.0 - saturate((C_DECK - dy * tt) / ${s(b0.top)});
    let rel: vec2f = d.xz * tt - vec2f(${s(F[0])}, ${s(F[1])});
    let guv: vec2f = vec2f((dot(rel, vec2f(${s(we[0])}, ${s(we[1])})) - ${s(e.glU0)}) / ${s(e.glU1-e.glU0)}, (dot(rel, vec2f(${s(Y[0])}, ${s(Y[1])})) - ${s(e.glW0)}) / ${s(e.glW1-e.glW0)});
    if (guv.x > 0.0 && guv.x < 1.0 && guv.y > 0.0 && guv.y < 1.0) {
      // (the line of sight lies nearly flat along the deck: one pixel spans hundreds of metres of it, so three samples along that span)
      let fw: f32 = tb * pxa / max(dy, 0.01) * 0.33;
      let gs: vec2f = vec2f(dot(dh, vec2f(${s(we[0])}, ${s(we[1])})) / ${s(e.glU1-e.glU0)}, dot(dh, vec2f(${s(Y[0])}, ${s(Y[1])})) / ${s(e.glW1-e.glW0)}) * fw;
      let lg: f32 = log2(max(fw / ${s((e.glU1-e.glU0)/e.glN)}, 1.0));
      var g3: vec3f = (texLod(tGlow, guv - gs, lg).rgb + texLod(tGlow, guv, lg).rgb + texLod(tGlow, guv + gs, lg).rgb) * (1.0 / 3.0);
      g3 *= smoothstep(0.0, 0.06, guv.x) * smoothstep(1.0, 0.94, guv.x) * smoothstep(0.0, 0.06, guv.y) * smoothstep(1.0, 0.94, guv.y);
      // the light under the cloud is never quite still (traffic, the cloud itself thinning and thickening): it swells and sinks a
      // little from place to place, in brightness only
      let br: f32 = 1.0 + 0.12 * sin(M.p.w * 0.23 + dot(rel, vec2f(0.0011, 0.0007))) * sin(M.p.w * 0.11 + dot(rel, vec2f(-0.0006, 0.0013)));
      // (what comes on first, while it is still day, is the street lamps: sodium)
      g3 = mix(g3, vec3f(1.0, 0.52, 0.17) * (1.3 * max(g3.r, max(g3.g, g3.b))), 0.8 * M.p.y);
      // the billows' tops catch the most of it (1 - fh: how high on the billow the eye's line ends)
      col = g3 * br * ((0.50 + 0.50 * (1.0 - fh)) * exp(-tt / 26000.0) * (1.0 - twA * smoothstep(tb + 250.0, tb - 150.0, twD)) * M.q.y);
    }
  }
  // ---- the air over each quarter, lit by it
  let dm: vec3f = M.c0.rgb * domeBlob(dh, sl, ${qe(0)}, tb, twD, twA) + M.c1.rgb * domeBlob(dh, sl, ${qe(1)}, tb, twD, twA) + M.c2.rgb * domeBlob(dh, sl, ${qe(2)}, tb, twD, twA)
    + M.c3.rgb * domeBlob(dh, sl, ${qe(3)}, tb, twD, twA) + M.c4.rgb * domeBlob(dh, sl, ${qe(4)}, tb, twD, twA);
  o.color = vec4f((col + dm * M.q.z) * (edge * M.p.z), 0.0); return o; }`;return{air:Ka(),lit:se,faceVS:_,faceFS:b,spotVS:re,spotFS:m,beamVS:J,beamFS:ae,glowVS:X,glowFS:ke}}const F0=(()=>{const e={N:1024,enabled:!0,pipes:[],D:.045,ski:{hw:.057,tail:.8,tip:.92}},s=1024,w=20,x=2.4,F={k:0,span:12.8,keep:5,every:.8,clear:[0,0,0,0],enc:[0,1,3,0]},we={k:1,span:51.2,keep:22,every:3,clear:[.6,0,.6,1],enc:[.6,1.25,5,0]},Y=256,E={fan:1,crescent:2,pock:3,roll:4},D=[],be=[];let ht=0,qe=null,se=null,_=0,b=null,re,m,J,ae=0,X=0,ke=0,C=0,ne=0,Be=null,Ee,je=0,$e=-1,nt=!1,Ke=0,Fe=null,Ge=0;const Je=typeof Dt<"u"?Dt:null,le={a:.006,b:.013,c:.022};Je&&Je.def("sink","入雪深浅",[["a","浅"],["b","适中"],["c","深"]],"b");const Pe={a:.1,b:.18,c:.5};Je&&Je.def("pdepth","粉雪深度",[["a","浮在面上"],["b","没过靴子"],["c","没过膝盖"]],"b"),e.deep=0;const pe=[null,null],c=[0,0],Ie=[],he=[[0,0,0,0],[0,0,0,0]],H={p:[0,0,0,0],e:null,w:[0,0,0,0],s:[0,-1,0,0]},z={p:[0,0,0,0],c:null},V=[0,1,0,0],I=()=>[0,0,0,0],Q=e.U={on:!1,D:0,pc:[0,0],tk:[0,-1,1,-1],tb:I(),sa0:I(),sa1:I(),sa2:I(),sb0:I(),sb1:I(),sb2:I(),la0:I(),la1:I(),lb0:I(),lb1:I()};e.init=function(B){re=B,m=new Float32Array(s*w),J=new Float32Array(s*2),qe=new Float32Array(Y*w);const U=oe=>re.texture({w:e.N,h:e.N,format:oe,filter:"linear",wrap:"repeat",mips:!0}),A=[{instanced:!0,attrs:[["a0","vec4f"],["a1","vec4f"],["a2","vec4f"],["a3","vec4f"],["a4","vec4f"]]}],a={p:"vec4f",e:"vec4f",w:"vec4f",s:"vec4f"};for(const oe of[F,we]){const fe=oe.k?"rgba8":"rgba16f";oe.tex=U(fe),oe.tgt=re.target({color:oe.tex}),oe.buf=re.buffer(m,"vertex",!0),oe.sent=0,oe.fresh=!0,oe.wx=oe.wz=0,oe.pipe=re.pipeline({name:oe.k?"trackStampFar":"trackStamp",lib:[St.common,ia],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"alpha",colorFormat:fe,buffers:A,varyings:{q:"vec4f",w:"vec4f",c:"vec4f",d:"vec4f",e:"vec4f"},uniforms:a,textures:{tDetail:"2d"},vs:rn,fs:ln}),oe.wipe=re.pipeline({name:oe.k?"trackWipeFar":"trackWipe",lib:[St.common],buffers:[],varyings:{uv:"vec2f"},uniforms:{p:"vec4f",c:"vec4f"},textures:{},depth:!1,depthTest:!1,cull:"none",blend:"none",colorFormat:fe,vs:as,fs:pn})}for(const oe of[F,we])oe.dbuf=re.buffer(qe,"vertex",!0),oe.dsent=0,oe.dep=re.pipeline({name:oe.k?"trackDepositFar":"trackDeposit",lib:[St.common,ia],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"add",colorFormat:oe.k?"rgba8":"rgba16f",buffers:A,varyings:{q:"vec4f",w:"vec4f",c:"vec4f"},uniforms:a,textures:{tDetail:"2d"},vs:cn,fs:dn});F.lit=U("rgba16f"),F.litT=re.target({color:F.lit}),Ee=re.pipeline({name:"trackBake",lib:[St.common,ia],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"none",colorFormat:"rgba16f",buffers:A,varyings:{w:"vec4f"},uniforms:a,textures:{tT:"2d"},vs:fn,fs:Ha}),e.near=F.tex,e.light=F.lit,e.far=we.tex,se=re.pipeline({name:"trackBakeDeposit",lib:[St.common,ia],topology:"strip",cull:"none",depth:!1,depthTest:!1,blend:"none",colorFormat:"rgba16f",buffers:A,varyings:{w:"vec4f"},uniforms:a,textures:{tT:"2d"},vs:hn,fs:Ha}),e.pipes=[F.pipe,we.pipe,F.wipe,we.wipe,Ee,F.dep,we.dep,se]},e.reset=function(){F.fresh=we.fresh=!0,F.sent=we.sent=0,ae=0,X=0,pe[0]=pe[1]=null,b=null,Ie.length=0,nt=!1,Ke=0,e.deep=0,be.length=0,ht=0},e.step=function(B,U,A){const a=B.pos[0],oe=B.pos[2],fe=Math.hypot(a-ke,oe-C);fe>6&&e.reset(),ke=a,C=oe;{const u=Ie.length;(!u||Math.hypot(a-Ie[u-2],oe-Ie[u-1])>.5)&&(u>=128&&Ie.splice(0,2),Ie.push(a,oe))}const O=Math.hypot(A.v[0],A.v[2]);if(O>1&&fe<6){const u=1-Math.exp(-fe/1.5);je+=(A.v[0]/O-je)*u,$e+=(A.v[2]/O-$e)*u;const v=Math.hypot(je,$e)||1;je/=v,$e/=v}if(!e.enabled||!A.contact||A.air){pe[0]=pe[1]=null;return}const ie=f.norm(B.nrm),ce=f.norm(f.cross(B.fwd,ie)),He=f.cross(ie,ce),We=Math.hypot(He[0],He[2])||1,Qe=-He[2]/We,st=He[0]/We,Le=U.edge||0,r=Math.sin(Le),q=A.powder||0,k=e.ski.hw,ee=ge(.8,3,A.speed||0),Z=Je&&Pe[Je.val.pdepth]||Pe.b,K=Z*q*q,ue=ge(.11,.16,K),G=O>.5?Math.abs(A.v[0]*Qe+A.v[2]*st)/O:0,Ae=(Je?Je.val.sink:"b")+Z,_e=le[Je?Je.val.sink:"b"]||le.b,at=(_e+K*it(.55+.45*(A.load||9.8)/9.8,.7,1.4)*Re(1,.45,ge(6,18,A.speed||0)))*(1+.15*Math.abs(r))*(1-.4*Math.min(1,G/.5));Ae!==Fe&&(Fe!==null&&(Ge=40),Fe=Ae);const ot=nt?Math.max(1-Math.exp(-fe/.6),Ge>0?.12:0):1;e.D+=(at-e.D)*ot,e.deep+=(ue-e.deep)*ot,nt=!0;const t=typeof a0<"u"&&a0.world?a0.world.J:null;for(let u=0;u<2;u++){const v=u?1:-1,P=t&&(u?t.footR:t.footL),N=he[u];N[0]=P?P[0]:v*U.stance*.5,N[1]=P?P[1]:.05*Math.abs(r)+((u?U.liftR:U.liftL)||0),N[2]=P?P[2]:-v*U.lead,N[3]=N[1]-k*Math.abs(r)>e.D-.003?0:1}let S=0;for(let u=0;u<2;u++){const v=he[u][0],P=he[u][1],N=he[u][2],de=he[1-u],te=a+ce[0]*v-He[0]*N,o=oe+ce[2]*v-He[2]*N,p=pe[u];if(!he[u][3]){pe[u]=[te,o,He[0]/We,He[2]/We];continue}let i=0,y=0,j=0;if(p){i=te-p[0],y=o-p[1];const M=i*i+y*y;if(M<9e-6&&!Ge)continue;M>9||M<9e-6?i=y=0:j=it(Math.asin(it(Qe*p[2]+st*p[3],-1,1)),-.3,.3)}pe[u]=[te,o,He[0]/We,He[2]/We];const W=Math.hypot(i,y),h=W>1e-4?(i*Qe+y*st)/W*ee:0;S=Math.max(S,Math.min(1,Math.abs(h)/.45));const n=(Math.max(.022+.07*q,.085)+.17*Math.min(1,Math.abs(h)/.45))*1.05+.13+Math.abs(j)+e.deep*(.9*e.D+.04);ae===s&&(m.copyWithin(0,w*s/2),J.copyWithin(0,s),ae=s/2,X+=s/2);const d=ae*w;J[ae*2]=te,J[ae*2+1]=o,ae++,m[d]=G0(te/F.span),m[d+1]=G0(o/F.span),m[d+2]=G0(te/we.span),m[d+3]=G0(o/we.span),m[d+4]=He[0],m[d+5]=He[2],m[d+6]=i,m[d+7]=y,m[d+8]=r,m[d+9]=de[3]?de[0]-v:99,m[d+10]=e.D,m[d+11]=P,m[d+12]=j,m[d+13]=de[3]?de[1]:99,m[d+14]=(_e+K)*.6,m[d+15]=0,m[d+16]=e.deep,m[d+17]=h,m[d+18]=q,m[d+19]=n}if(e.deep>.25&&(he[0][3]||he[1][3])){const u=.5*(he[0][0]+he[1][0]),v=.5*(he[0][2]+he[1][2]),P=a+ce[0]*u-He[0]*v,N=oe+ce[2]*u-He[2]*v,de=.55*e.D+.03,te=.5*Math.abs(he[0][0]-he[1][0])+k+.6*de+.04,o=.45*e.D+.1;let p=0,i=0;if(b&&(p=P-b[0],i=N-b[1],p*p+i*i>9&&(p=i=0)),!b||p*p+i*i>1e-6||Ge){b=[P,N],ae===s&&(m.copyWithin(0,w*s/2),J.copyWithin(0,s),ae=s/2,X+=s/2);const y=ae*w;J[ae*2]=P,J[ae*2+1]=N,ae++,m.fill(0,y,y+w),m[y]=G0(P/F.span),m[y+1]=G0(N/F.span),m[y+2]=G0(P/we.span),m[y+3]=G0(N/we.span),m[y+4]=He[0],m[y+5]=He[2],m[y+6]=p,m[y+7]=i,m[y+9]=99,m[y+10]=e.D,m[y+11]=te,m[y+13]=99,m[y+15]=2,m[y+16]=e.deep,m[y+18]=q,m[y+19]=te+o+.04-k}}else b=null;const l=typeof a0<"u"&&a0.world;for(let u=0;u<2;u++){const v=l&&l.J&&(u?l.J.plantedR:l.J.plantedL)||0,P=l&&(u?l.tipR:l.tipL);if(v>=.99&&!(c[u]>=.99)&&P&&Math.hypot(P[0]-a,P[2]-oe)<x){ae===s&&(m.copyWithin(0,w*s/2),J.copyWithin(0,s),ae=s/2,X+=s/2);const N=ae*w;J[ae*2]=P[0],J[ae*2+1]=P[2],ae++,m.fill(0,N,N+w),m[N]=G0(P[0]/F.span),m[N+1]=G0(P[2]/F.span),m[N+2]=G0(P[0]/we.span),m[N+3]=G0(P[2]/we.span),m[N+4]=He[0],m[N+5]=He[2],m[N+13]=99,m[N+15]=1,m[N+19]=.04}c[u]=v}Ke+=(S-Ke)*(1-Math.exp(-fe/.25)),Ye(A,a,oe,Qe,st,He[0]/We,He[2]/We,1/60),Ge>0&&Ge--},e.deposit=function(B,U,A,a,oe){const fe=E[B];if(!fe||!U||!e.enabled)return;let O=A?A[0]:0,ie=A?A.length>2?A[2]:A[1]:-1;const ce=Math.hypot(O,ie);ce<1e-6?(O=0,ie=-1):(O/=ce,ie/=ce);const He=Math.max(a||[0,1.5,.8,.07,.06][fe],.01),We={x:U[0],z:U[2],ax:O,az:ie,k:fe,s:He,sd:_=(_+1)%4093,t:At.t+Math.max(oe||0,0)};D.length<512&&D.push(We)};function L(B){const U=B.s,A=B.k,a=A===1?[.62*U,U]:A===2?[.7*U,.7*U]:A===3?[1.7*U,1.7*U]:[1.6*U+.02,13*U];return[a[0]-e.ski.hw,a[1]-.8]}function ye(B,U){qe.fill(0,B,B+w),qe[B]=G0(U.x/F.span),qe[B+1]=G0(U.z/F.span),qe[B+2]=G0(U.x/we.span),qe[B+3]=G0(U.z/we.span),qe[B+4]=U.ax,qe[B+5]=U.az,qe[B+8]=U.k,qe[B+9]=U.s,qe[B+10]=U.sd,qe[B+11]=1;const A=L(U);qe[B+16]=A[0],qe[B+17]=A[1]}function Ve(B,U,A,a){let oe=U?0:Math.max(be.length-(ht-B.dsent),0),fe=0;const O=(B.keep+3)*(B.keep+3);for(let ie=oe;ie<be.length&&fe<Y;ie++){const ce=be[ie];(ce.x-ke)*(ce.x-ke)+(ce.z-C)*(ce.z-C)>O||(ye(fe*w,ce),fe++)}if(A||(B.dsent=ht),!fe)return 0;re.updateBuffer(B.dbuf,0,qe.subarray(0,fe*w)),H.p[0]=1/B.span,H.p[1]=B.span/e.N,H.p[2]=1,H.p[3]=B.k,H.e=B.enc,H.w[2]=3.6/B.span;for(let ie=0;ie<4;ie++)H.w[0]=ie&1,H.w[1]=ie>>1,re.draw(A||B.dep,{u:H,tex:a||{tDetail:c0.detail},vb:[B.dbuf],count:4,instances:fe});return fe}function Ne(){const B=At.t;for(let A=D.length-1;A>=0;A--)D[A].t<=B&&(be.push(D[A]),D.splice(A,1),ht++);const U=(we.keep+4)*(we.keep+4);for(;be.length>Y||be.length&&(be[0].x-ke)*(be[0].x-ke)+(be[0].z-C)*(be[0].z-C)>U;)be.shift()}e.autoDeposit=!0;const Ce={fanD:0,skidMax:0,stopX:0,stopZ:0,pockT:0,run:0};function Ye(B,U,A,a,oe,fe,O,ie){if(!e.autoDeposit)return;const ce=B.speed||0,He=B.powder||0,We=Math.abs(B.aReac||0)/9.81,Qe=B.v[0]*a+B.v[2]*oe,st=Ke*ge(2,6,ce+2);if(Ce.fanD+=Math.hypot(B.v[0],B.v[2])*ie,st>.45&&Ce.fanD>2.2&&ce>3){Ce.fanD=0;const Le=Qe>=0?1:-1,r=a*Le*.8+B.v[0]/Math.max(ce,1)*.6,q=oe*Le*.8+B.v[2]/Math.max(ce,1)*.6;e.deposit("fan",[U+a*Le*.35,0,A+oe*Le*.35],[r,0,q],1.2+1.6*st*ge(4,14,ce))}if(st>.5&&ce>5&&(Ce.skidMax=Math.max(Ce.skidMax,ce),Ce.run=0),Ce.skidMax>0&&(Ce.run+=ie,ce<1.6?(e.deposit("crescent",[U+fe*.55,0,A+O*.55],[B.v[0]||fe,0,B.v[2]||O],.8+.05*Ce.skidMax),Ce.skidMax=0):Ce.run>2.5&&(Ce.skidMax=0)),e.deep>.3&&ce>4)for(Ce.pockT-=ie*e.deep*(.5+2.5*ge(.3,1,We))*6;Ce.pockT<0;){Ce.pockT+=1;const Le=Math.random(),r=(B.aReac||0)>=0?-1:1,q=(Math.random()<.75?r:-r)*(.6+2.2*Le),k=-1.5+3.5*Math.random(),ee=U+a*q+fe*k,Z=A+oe*q+O*k,K=.035+.07*Math.random()*Math.random();e.deposit(Math.random()<.08?"roll":"pock",[ee,0,Z],[fe,0,O],K,.15+.5*Math.random())}}function T(B,U,A,a,oe){H.p[0]=1/U.span,H.p[1]=U.span/e.N,H.p[2]=A,H.p[3]=U.k,H.e=U.enc,H.w[2]=x/U.span;for(let fe=0;fe<4;fe++)H.w[0]=fe&1,H.w[1]=fe>>1,re.draw(B,{u:H,tex:a,vb:[U.buf],count:4,instances:oe})}function Se(B){const U=Math.hypot(ke-B.wx,C-B.wz),A=B.fresh||U>B.span-2*B.keep-.5,a=A||U>B.every;let oe=Math.max(B.sent-X,0);if(A){const ce=(B.keep+1)*(B.keep+1);for(oe=ae;oe>0;){const He=J[oe*2-2]-ke,We=J[oe*2-1]-C;if(He*He+We*We>ce)break;oe--}}const fe=ae-oe;B.sent=X+ae,B.fresh=!1;const O=A?be.length:ht-B.dsent;if(!fe&&!a&&!O)return!1;a&&(B.wx=ke,B.wz=C),z.p[0]=G0(ke/B.span),z.p[1]=G0(C/B.span),z.p[2]=B.span,z.p[3]=B.keep,z.c=B.clear,re.beginPass(B.tgt,A?{color:B.clear}:{}),fe&&(re.updateBuffer(B.buf,0,m.subarray(oe*w,ae*w)),T(B.pipe,B,0,{tDetail:c0.detail},fe),T(B.pipe,B,1,{tDetail:c0.detail},fe));const ie=B.dsent;return O&&Ve(B,A),B.dsent=ht,a&&re.draw(B.wipe,{u:z,count:3}),re.endPass(),re.genMips(B.tex),B.k||(z.c=V,re.beginPass(F.litT,A?{color:V}:{}),fe&&T(Ee,B,0,{tT:B.tex},fe),O&&(B.dsent=ie,Ve(B,A,se,{tT:B.tex}),B.dsent=ht),a&&re.draw(F.wipe,{u:z,count:3}),re.endPass(),re.genMips(F.lit)),!0}e.pre=function(){ne++,Ne(),Be!==Nt.az&&(Be=Nt.az,H.s[0]=Math.sin(Be),H.s[1]=-Math.cos(Be),F.fresh=!0);const B=vt.normal(ke,C);H.s[2]=Math.max(Math.tan(Nt.elev)+(B[0]*H.s[0]+B[2]*H.s[1])/Math.max(B[1],.2),.03),Se(F),(we.fresh||!(ne&3))&&Se(we)},e.lift=function(B,U){if(!e.enabled)return 0;const A=e.deep,a=Math.hypot(B-ke,U-C);return e.D*ge(Re(2.15,7.5,A),Re(1,3,A),a)};const me=[0,0,0,0];return e.liftU=function(){return me[0]=ke,me[1]=C,me[2]=e.enabled?e.D:0,me[3]=e.deep,me},e.frame=function(){Q.on=e.enabled,Q.D=e.D;const B=.6+.6*e.deep;Q.pc[0]=ke-B*je,Q.pc[1]=C-B*$e;let U=Ie.length,A=je,a=$e,oe=0,fe=0,O=0,ie=0;const ce=we.keep*we.keep,He=1.8;for(;U>0;){const q=Ie[U-2]-ke,k=Ie[U-1]-C;if(q*q+k*k>ce)break;U-=2}if(U<Ie.length){const q=ke-Ie[U],k=C-Ie[U+1],ee=Math.hypot(q,k);ee>1&&(A=q/ee,a=k/ee)}for(let q=U;q<Ie.length;q+=2){const k=Ie[q]-ke,ee=Ie[q+1]-C,Z=k*A+ee*a,K=ee*A-k*a;Z<oe&&(oe=Z),Z>fe&&(fe=Z),K<O&&(O=K),K>ie&&(ie=K)}Q.tk[0]=A,Q.tk[1]=a,Q.tk[2]=oe-He,Q.tk[3]=fe+He,Q.tb[0]=O-He,Q.tb[1]=ie+He,Q.tb[2]=Re(Re(e.ski.tip+.03,.31,ge(.055,.09,e.D)*(1-Ke)),-.12,e.deep),Q.tb[3]=e.deep;const We=typeof a0<"u"?a0:null,Qe=We&&We.world,st=Qe&&Qe.root,Le=Qe&&Qe.J,r=We&&We.pose||{};for(let q=0;q<2;q++){const k=q?Q.sb0:Q.sa0,ee=q?Q.sb1:Q.sa1,Z=q?Q.sb2:Q.sa2,K=q?Q.lb0:Q.la0,ue=q?Q.lb1:Q.la1,G=Le&&(q?Le.footR:Le.footL);if(Z[3]=0,K[3]=0,!st||!G)continue;const Ae=r.edge||0,_e=-(((q?r.pitchR:r.pitchL)||0)+((q?r.tipR:r.tipL)||0)),at=Math.cos(Ae),ot=Math.sin(Ae),t=Math.cos(_e),S=Math.sin(_e),l=Wt.tp(st,G),u=Wt.td(st,[-S*ot,-S*at,-t]),v=Wt.td(st,[at,-ot,0]);k[0]=l[0],k[1]=l[1],k[2]=l[2],k[3]=e.ski.hw,ee[0]=u[0],ee[1]=u[1],ee[2]=u[2],ee[3]=e.ski.tail,Z[0]=v[0],Z[1]=v[1],Z[2]=v[2],Z[3]=e.ski.tip+.03;const P=q?Le.kneeR:Le.kneeL,N=q?Le.hipR:Le.hipL;if(P&&N){const de=Wt.tp(st,P),te=Wt.tp(st,N);K[0]=de[0],K[1]=de[1],K[2]=de[2],K[3]=.058,ue[0]=te[0],ue[1]=te[1],ue[2]=te[2],ue[3]=.075}}return Q},e})(),ia=`
const SKI_HW: f32 = 0.057; const SKI_TAIL: f32 = 0.80; const SKI_TIP: f32 = 0.92;
// a ski riding deep runs under the snow ahead of the boot (which is what opens the trench); one riding shallow presses it in from the shovel on
// (dk: and one riding IN the snow (Tracks.deep) has it closed over the boots: the furrow opens behind the heels)
fn skiFront(D: f32, dk: f32) -> f32 { return mix(mix(SKI_TIP, 0.30, smoothstep(0.055, 0.09, D)), -0.12, dk); }
struct TrkV { clip: vec4f, q: vec4f, w: vec4f, }
fn trackQuad(a0: vec4f, a1: vec4f, vid: u32, mU: f32, mV: f32, sunReach: f32) -> TrkV {
  var t: TrkV;
  let sx: f32 = f32(vid & 1u); let sy: f32 = f32((vid >> 1u) & 1u);
  let ax: vec2f = a1.xy; let al: f32 = max(length(ax), 1e-3); let rt: vec2f = vec2f(-ax.y, ax.x) / al;
  let dl: vec2f = vec2f(dot(a1.zw, rt), dot(a1.zw, ax) / (al * al));
  // (the bake also takes in the snow down-sun of the stamp, as far as a shadow reaches)
  let sn: vec2f = vec2f(dot(M.s.xy, rt), dot(M.s.xy, ax) / (al * al)) * sunReach;
  let u0: f32 = -SKI_HW - max(dl.x, 0.0) - mU - max(sn.x, 0.0); let u1: f32 = SKI_HW - min(dl.x, 0.0) + mU - min(sn.x, 0.0);
  let v0: f32 = -SKI_TAIL - max(dl.y, 0.0) - mV - max(sn.y, 0.0); let v1: f32 = SKI_TIP - min(dl.y, 0.0) + mV - min(sn.y, 0.0);
  let p: vec2f = vec2f(mix(u0, u1, sx), mix(v0, v1, sy));
  let f: vec2f = mix(a0.xy, a0.zw, M.p.w); let rc: f32 = M.w.z;
  let nu: f32 = select(select(0.0, -1.0, f.x > 1.0 - rc), 1.0, f.x < rc); let nv: f32 = select(select(0.0, -1.0, f.y > 1.0 - rc), 1.0, f.y < rc);
  let uv: vec2f = f + (rt * p.x + ax * p.y) * M.p.x + vec2f(nu * M.w.x, nv * M.w.y);
  t.clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.5, 1.0);
  if ((M.w.x > 0.5 && nu == 0.0) || (M.w.y > 0.5 && nv == 0.0)) { t.clip = vec4f(2.0, 2.0, 0.5, 1.0); }
  t.q = vec4f(p, dl); t.w = vec4f(uv, uv / M.p.x);
  return t;
}
`,rn=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  var t: TrkV = trackQuad(a.a0, a.a1, a.vid, mix(a.a4.w, 0.03 + abs(a.a3.x), M.p.z), mix(0.14, 0.03, M.p.z) + 0.1 * abs(a.a3.x), 0.0);
  // (a pole's hole: a quad of a hand's breadth round the tip, no more: margins that undo the ski's own length)
  if (a.a3.w > 0.5 && a.a3.w < 1.5) { t = trackQuad(a.a0, a.a1, a.vid, 0.09 - SKI_HW, -0.68, 0.0); }
  // (the furrow: as wide as it and its lips, from just ahead of the boots back over the stretch it came)
  if (a.a3.w > 1.5) { t = trackQuad(a.a0, a.a1, a.vid, a.a4.w, -0.05, 0.0); }
  v.clip = t.clip; v.q = t.q; v.w = t.w; v.c = a.a2; v.d = a.a3; v.e = a.a4;
  return v;
}`,ln=`
// a furrow stamp's outline for its depth: straight sides, a round front, open behind (centre c, half size h)
fn frontU(p: vec2f, c: vec2f, h: vec2f) -> f32 {
  let rr: f32 = h.x; let qx: f32 = abs(p.x - c.x) - (h.x - rr); let qy: f32 = p.y - (c.y + h.y - rr);
  return select(max(qx, qy) - rr, length(vec2f(max(qx, 0.0), qy)) - rr, qy > 0.0);
}
fn sdBox2(p: vec2f, c: vec2f, h: vec2f) -> f32 { let d: vec2f = abs(p - c) - h; return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0); }
// distance to all the ground a box (centre c, half size h) covered while it came the stretch d
fn sweep(p: vec2f, c: vec2f, h: vec2f, d: vec2f) -> f32 {
  var s: f32 = sdBox2(p, c - 0.5 * d, h + 0.5 * abs(d));
  let l: f32 = length(d);
  if (l > 1e-5) { let n: vec2f = vec2f(-d.y, d.x) / l; s = max(s, abs(dot(p - c, n)) - (h.x * abs(n.x) + h.y * abs(n.y))); }
  return s;
}
// for which part of the way (0 = now, 1 = a step ago) the coordinate x, changing by d a step, lay between lo and hi
fn slab(x: f32, d: f32, lo: f32, hi: f32) -> vec2f {
  if (abs(d) < 1e-6) { if (x >= lo && x <= hi) { return vec2f(-1e9, 1e9); } return vec2f(1e9, -1e9); }
  let a: f32 = (lo - x) / d; let b: f32 = (hi - x) / d; return vec2f(min(a, b), max(a, b));
}
// the ski's base over the snow plane it stands on: tilted across by the edge angle, turned up at the shovel and a little at the tail
// (the shovel a shade less than the ski's own: snow rides up it)
// (kt: how far the tail turns up. Not at all, for this purpose, on a ski going sideways: its tail is the last of it to go over the snow, and
// behind the ski that comes second in a skid it left a strip of floor two centimetres proud of the rest, with a tooth for every step)
fn skiBase(q: vec2f, sphi: f32, cphi: f32, lift: f32, kt: f32) -> f32 {
  return lift - q.x / cphi * sphi + 0.10 * pow(smoothstep(0.62, 0.96, q.y), 1.7) + kt * sq(smoothstep(0.82 * SKI_TAIL, SKI_TAIL, -q.y));
}
// a spot of snow, p in the ski's frame now, having come dl a step: where it last lay under the strip c, h of the base that is in the snow
// (xy), and where it first came under it (zw). A spot the ski only went past counts where it came nearest: the corner that drew that edge
// of the track
// (... nearest in the course of THIS step. Reckoned on as if the ski had always gone, and would always go, the way it went this step, a
// spot beside a ski that drifts a hair to one side "came nearest" a hundred steps away: at the tip, or at the tail)
fn under(p: vec2f, dl: vec2f, c: vec2f, h: vec2f) -> vec4f {
  let iu: vec2f = slab(p.x, dl.x, c.x - h.x, c.x + h.x); let iv: vec2f = slab(p.y, dl.y, c.y - h.y, c.y + h.y);
  let sa: f32 = max(iu.x, iv.x); let sb: f32 = min(iu.y, iv.y);
  let q: vec2f = clamp(p + dl * clamp(select(sa, 0.5 * (sa + sb), sa > sb), 0.0, 1.0), c - h, c + h);
  var tu: f32 = 400.0; var tv: f32 = 400.0;
  if (dl.x > 1e-6) { tu = (c.x + h.x - q.x) / dl.x; } else if (dl.x < -1e-6) { tu = (c.x - h.x - q.x) / dl.x; }
  if (dl.y > 1e-6) { tv = (c.y + h.y - q.y) / dl.y; } else if (dl.y < -1e-6) { tv = (c.y - h.y - q.y) / dl.y; }
  return vec4f(q, q + dl * min(min(tu, tv), 400.0));
}
// the lowest the base came over that spot on the way: where it left, where it came in, and between them the point nearest the boot (along
// its length the base is lowest in the middle). A ski going sideways leaves the height of its low edge behind; one running along itself,
// its own cross section
// (xl, sm: of a ski going sideways the whole strip counts as its low edge, which lies at xl)
fn lowest(g: vec4f, sphi: f32, cphi: f32, lift: f32, xl: f32, sm: f32) -> f32 {
  let dy: f32 = g.w - g.y; let qm: vec2f = mix(g.xy, g.zw, saturate(-g.y / select(dy, 1e-6, abs(dy) < 1e-6)));
  let kt: f32 = 0.015 * (1.0 - sm);   // (the tail kick of skiMesh in 08_skier.js)
  return min(min(skiBase(vec2f(mix(g.x, xl, sm), g.y), sphi, cphi, lift, kt), skiBase(vec2f(mix(g.z, xl, sm), g.w), sphi, cphi, lift, kt)), skiBase(vec2f(mix(qm.x, xl, sm), qm.y), sphi, cphi, lift, kt));
}
// the floor is pressed snow, not a planed board: it keeps a little of the lumps it was made of (lz), base and edges draw fine lines in it
// along the way they went, and a ski going sideways combs it outright (wq: how far to the side of the boot's own path the spot lies). All of
// it fades out where the base only grazed the snow: a scraped band ends in a feather edge, not in a row of pits. (And the lumps are never
// more than a third of the depth: the floor of a shallow groove in firm snow is ironed flat)
fn floorAt(R: f32, wq: f32, lz: f32, skid: f32, pw: f32) -> f32 {
  let lines: f32 = (0.0006 * sin(wq * 105.0 + 5.0 * lz) + 0.0004 * sin(wq * 163.0 + 1.7)) * (1.0 - M.p.w) * (1.0 + 2.0 * skid);
  let comb: f32 = skid * 0.014 * (texLod(tDetail, vec2f(wq * 2.6 + 0.37, 0.61), M.e.z + 1.0).z - 0.5);
  return min(R + saturate(-R / 0.012) * ((lz - 0.5) * min(0.010, -0.3 * R) * (0.5 + 2.0 * pw) + lines + comb), 0.0);
}
fn frag(v: VOut) -> FOut {
  var o: FOut;
  // a pole's hole (d.w = 1): the narrow hole of the tip, and round it the dish the basket pressed with a groove at its rim. Written in the cut
  // pass only, over whatever lies there: the plant goes in beside the skis, on snow they have not been over
  if (v.d.w > 0.5 && v.d.w < 1.5) {
    if (M.p.z < 0.5) { discard; }
    let r: f32 = length(v.q.xy); if (r > 0.062) { discard; }
    let R: f32 = -0.07 * sq(1.0 - smoothstep(0.004, 0.016, r)) - 0.009 * (1.0 - smoothstep(0.035, 0.058, r)) - 0.011 * exp(-sq((r - 0.05) / 0.006));
    o.color = vec4f(M.e.x + R * M.e.y, 0.4, M.e.x + R * M.e.y, smoothstep(0.062, 0.05, r));
    return o;
  }
  // the furrow of a skier riding in deep powder (d.w = 2; c.z the depth, c.w its half width at the top, e.x how far in the snow the skier
  // rides). A trough with a flat floor at the depth of the bases, walls that slump at about fifty degrees and come down in lumps (rag), and
  // beyond each wall a lip of the snow the legs pushed aside. Its snow is churned (G): rougher and more glittering than the untouched
  // surface, where a ski's floor is pressed smooth. The cut is written in the cut pass over the skis' own slots (the skis are under the
  // snow here; what shows is the trough); the lips with the piled snow of the walls, abeam this step only, as theirs are
  if (v.d.w > 1.5) {
    let Df: f32 = v.c.z; let W: f32 = 0.55 * Df + 0.03; let lipW: f32 = 0.45 * Df + 0.10;
    let lump: vec4f = texLod(tDetail, v.w.zw / 1.6, M.e.z - 1.0); let lmp2: vec4f = texLod(tDetail, v.w.zw / 0.5 + vec2f(0.31, 0.67), M.e.z);
    let rag: f32 = ((lump.z - 0.5) * 0.9 + (lmp2.z - 0.5) * 0.2) * (0.02 + 0.10 * Df);      // (softer: bigger bites read as a row of pits along the wall in a low sun)
    // (the stamp starts at the boots, so the shins come straight up out of the furrow's front: set further back, its front wall stood
    // between the camera and the shins and the legs looked cut off above it. Owner 2026-11-12)
    let fc: vec2f = vec2f(0.0, -0.10); let fh: vec2f = vec2f(v.c.w, 0.13);
    let dl: vec2f = v.q.zw; let ll: f32 = max(length(dl), 1e-4);
    let sd: f32 = sweep(v.q.xy, fc, fh, dl) + rag; let sdu: f32 = sweep(v.q.xy, fc, fh, dl * (3.0 / ll)) + rag;
    let ak: f32 = smoothstep(0.25, 0.6, v.e.x);
    if (M.p.z > 0.5) {
      if (sd > 0.0) { discard; }
      // (the walls slope in from the sides and from the front, never from the back edge of the stamp: the last stamp over any spot is the
      // one whose back edge just reached it, and its slope there put a step into the floor every stamp, a staircase down the furrow)
      // (and its front is round, the snow parted round the legs, not a square end: a U seen from above and a U in section)
      // (swept over the way the stamp came since the last one, dl, as the box is: the map is pressed every few frames, and a round front
      // taken at one place only left a row of separate dimples)
      var sdLF: f32 = 1e9;
      for (var k: i32 = 0; k < 6; k++) { sdLF = min(sdLF, frontU(v.q.xy + dl * (f32(k) / 5.0), fc, fh)); }
      sdLF += rag;
      if (sdLF > 0.01) { discard; }
      let fs: f32 = saturate(-sdLF / W); let f: f32 = 1.0 - sq(1.0 - fs);
      let R: f32 = -0.6 * Df * f + (lump.z - 0.5) * 0.02 * f;       // (the floor a little above the bases: what the skis parted has partly fallen back in over them)
      o.color = vec4f(M.e.x + R * M.e.y, 0.75, M.e.x + R * M.e.y, ak * smoothstep(0.0, 0.01, -max(sd, sdLF) + 0.01));
      return o;
    }
    if (sd <= 0.0 || sdu <= 0.0) { discard; }
    let so: f32 = sd / lipW;
    let Hl: f32 = (0.10 * Df + 0.012) * smoothstep(0.0, 0.25, so) * sq(saturate(1.0 - so)) * (0.6 + 0.8 * lmp2.z);
    let near: f32 = 1.0 - smoothstep(0.0, 0.012, sd - sdu);
    let a: f32 = (1.0 - smoothstep(0.8, 1.0, so)) * near * ak;
    if (a < 0.004) { discard; }
    o.color = vec4f(M.e.x + Hl * M.e.y, 0.9 * (1.0 - smoothstep(0.6, 1.0, so)), M.e.x + Hl * M.e.y, a);
    return o;
  }
  // (a ski riding IN deep powder cuts no slot of its own that stays open: the snow it parts closes back over it behind the boot, and what
  // the skier leaves is the one furrow above (d.w = 2). An open box round each ski showed its tail on the floor of a square pit, the boots
  // stood in it below legs that went into the snow higher up, and the legs looked cut in two. Owner 2026-11-12)
  if (v.e.x > 0.6) { discard; }
  // where this spot lay in the ski's frame a step ago: the ski came the stretch q.zw and turned by d.x, so each spot has its own way under it
  let p: vec2f = v.q.xy; let pe: vec2f = p + v.q.zw; let cs: vec2f = vec2f(cos(v.d.x), sin(v.d.x));
  let dl: vec2f = vec2f(cs.x * pe.x - cs.y * pe.y, cs.y * pe.x + cs.x * pe.y) - p; let ll: f32 = max(length(dl), 1e-4);
  let sphi: f32 = v.c.x; let cphi: f32 = max(sqrt(max(1.0 - sphi * sphi, 0.0)), 0.2);
  let ldr: f32 = v.e.y; let skid: f32 = min(1.0, abs(ldr) / 0.45); let pw: f32 = v.e.z; let sm: f32 = smoothstep(0.04, 0.16, abs(ldr));
  // two skis going sideways scrape ONE floor: at a depth that hangs on the snow alone (d.z), and at the height of the lower of the two.
  // The ski that comes second goes over what the first has scraped, and whatever it writes there replaces it: riding a little higher (the
  // inside ski of a hard turn), or a little later with less load on it, it laid a shallower floor on the first, and the line where the
  // two met was a saw with a tooth for every step
  let D: f32 = mix(v.c.z, v.d.z, sm); let lift: f32 = mix(v.c.w, min(v.c.w, v.d.y), sm);
  // (packed snow breaks off clean at the edge, powder slumps in; and a wall thinner than two texels or so would come out as a staircase)
  let soft: f32 = max(mix(0.007, 0.07, pw) + 0.01 * skid, mix(2.4, 2.0, M.p.w) * M.p.y);
  // (riding IN deep powder (v.e.x) the snow does not stand in a box round each ski: it parts at the ski and slumps back, so the slot is as
  // narrow as the ski at its floor and opens out toward the surface, front and sides alike: a trough with sloping walls. Owner 2026-11-12)
  let softD: f32 = max(soft, v.e.x * (0.9 * D + 0.04));
  let tip: f32 = mix(skiFront(D, v.e.x), SKI_TIP, skid * (1.0 - v.e.x));          // (a ski going sideways clears the snow off its whole length)
  // the strip of the ski's width that is in the snow: from its low edge up to where the tilted base comes out of the surface. Of a ski going
  // sideways only the low edge counts: whichever way it slides, what it leaves is a floor at the depth of that edge, and the rest of the
  // base rides over snow the edge has yet to reach or has already scraped. So its strip is narrow (as narrow as the map can hold) and
  // flat. (Cut with its whole tilted width, the ski that comes second in a skid laid its base on the floor the first had scraped, and
  // raised it again: the map can only be overwritten, not lowered)
  let hw: f32 = SKI_HW * cphi; let sl: f32 = select(-1.0, 1.0, sphi >= 0.0);
  let tTop: f32 = max(clamp(cphi * (lift - D) / max(abs(sphi), 1e-3), -hw, hw), mix(-hw, hw - 2.5 * M.p.y, sm));
  let c: vec2f = vec2f(sl * 0.5 * (tTop + hw), 0.5 * (tip - SKI_TAIL)); let h: vec2f = vec2f(0.5 * (hw - tTop), 0.5 * (tip + SKI_TAIL));
  // (the line of a cut wanders a little, more in powder and where it was scraped. No more than that: bites out of a wall, seen from behind
  // in a low sun, are a row of dark teeth. And outward only: where it wandered inward, a thin strip going sideways left spots between two
  // of its steps that neither step took for its own, and they stood in the floor as specks. The lumps are read at a level whose texels
  // are the map's own size: one whose texels were twice that put a bead on the lip every two texels. And by the snow alone, the same
  // from every step: wandering more where the ski was sliding more, two steps that slid differently drew two lines for the one edge)
  let lump: vec4f = texLod(tDetail, v.w.zw / 1.6, M.e.z - 1.0);
  let rag: f32 = min(lump.z - 0.5, 0.0) * (0.008 + 0.04 * pw);
  // distance to what the ski covered this step (sd), and to all it has covered lately if it came straight (sdu, three metres back). What
  // lies beside a track is laid by its distance from the TRACK's edge (sdu), the same from every step that reaches it: measured from
  // each step's own outline it came out as a row of bumps, one a step
  let dle: vec2f = dl * (3.0 / ll);
  let sd: f32 = sweep(p, c, h, dl) + rag; let sdu: f32 = sweep(p, c, h, dle) + rag;
  let g: vec4f = under(p, dl, c, h); let q: vec2f = g.xy;
  // the floor of the track where the base itself never was: as low as the base stood where it came nearest (q), and behind the boot
  // flat (the middle of the ski has been there; the turned-up tail does not count). Walls stand on it; and so does the cut itself where
  // its line has wandered outside the strip (rag). (Those spots took the height of the turned-up shovel or tail of a ski long gone by,
  // which is where under() used to put "nearest": the wandering edge of every cut stood proud of the floor on the side the ski was
  // drifting from, a tooth for every lump. Under a low sun, the rungs of a ladder up the wall behind each tail)
  let Rq: f32 = floorAt(skiBase(vec2f(mix(q.x, sl * hw, sm), clamp(q.y, -0.3, tip)), sphi, cphi, lift, 0.0) - D, (q.x * dl.y - q.y * dl.x) / ll, lump.z, skid, pw);
  if (M.p.z > 0.5) {
    // (written whole, also where the base passed above the snow and R is 0: what was piled there before the ski came is gone)
    if (sd > 0.0) { discard; }
    var R: f32 = Rq;
    if (sd <= rag) { R = floorAt(lowest(g, sphi, cphi, lift, sl * hw, sm) - D, (q.x * dl.y - q.y * dl.x) / ll, lump.z, skid, pw); }
    o.color = vec4f(M.e.x + R * M.e.y, 0.6 * v.e.x, M.e.x + R * M.e.y, 1.0);
    return o;
  }
  if (sd <= 0.0 || sdu <= 0.0) { discard; }       // (the cut itself; snow the ski has already been over: it lies behind it)
  // beside the cut: the wall up from the floor, and from its top outward the snow squeezed or pushed out, in lumps, falling away over the
  // width Ws. Written whole right up to the cut: a texel left half done there stands up as a tooth
  // (which side of the ski: the edge of it that came nearest, q. Not the side the spot lies on now: behind the tail of a ski going
  // sideways the snow just outside its track lies on the far side of the ski's own line, and taken for the trailing side it got no wall:
  // the edge of the scraped band came out as a row of pits.) A carving ski squeezes a low lip out on both sides, more on the side its
  // base faces (hi); a skidding one pushes a berm ahead of its leading side (sk) and leaves bare floor behind the other (tr)
  let sg: f32 = select(-1.0, 1.0, q.x > c.x);
  let hi: f32 = max(0.0, -sg * sphi); let sk: f32 = min(1.0, max(0.0, sg * ldr) / 0.45); let tr: f32 = min(1.0, max(0.0, -sg * ldr) / 0.10);
  // (powder is pressed down more than it is squeezed out: a deep trench with a low wide swell beside it, not a roll)
  let Hs: f32 = (D * mix(0.22, 0.10, pw) + D * 0.55 * hi * (1.0 - sk) + sk * (0.045 + 0.035 * pw)) * (1.0 - tr);
  let Ws: f32 = max(mix(0.022 + 0.07 * pw, 0.085, hi) + 0.17 * sk, 2.0 * M.p.y);
  let so: f32 = max(sdu - softD, 0.0);
  let val: f32 = mix(Rq, Hs * sq(saturate(1.0 - so / Ws)) * (0.7 + 0.6 * lump.z), smoothstep(0.0, softD, sdu));
  // nothing is piled round a shovel that rides up over the snow (one running under it has a face of snow before the boot, and that is
  // piled up like any other), nor by a ski that is not in the snow
  // (nor is anything written behind the side of a ski that is going sideways: what lies there is the floor it has just scraped, and, where
  // it is still swinging round, the track it came down. A wall laid there filled that track in, a dash of it every step)
  // (and the ski that slides toward its partner piles nothing on that side: the partner has just scraped there. v.c.y: where the partner's
  // boot is, to the right; far off if it is in the air)
  // Only the snow abeam the stretch come THIS step is written (near): beside the track further back it stays as the steps of that time
  // left it. They knew where the ski was; from here it can only be guessed, and while a skid is building up the guess is wrong: a berm
  // laid by it ran over the edge of the scraped floor and left that floor showing through in a row of holes. (Not half a step further
  // back either. In play every step is pressed in on its own, wall and then cut, and nothing cuts again what a later wall has covered:
  // a wall laid by guess beside the step before stood a few millimetres inside that step's cut, a bump at every lump of its edge)
  let bury: f32 = saturate((SKI_TIP - tip) / (SKI_TIP - 0.30));
  let fol: f32 = select(0.0, min(1.0, max(0.0, sg * ldr) / 0.12), sg * v.c.y > 0.0 && abs(v.c.y) < 2.0);
  let near: f32 = 1.0 - smoothstep(0.0, 0.012, sd - sdu);
  // (for the same reason the side a ski is drifting AWAY from is written abeam its front part only. That edge of its track is drawn by
  // the front of the ski; beside the rest of its length lies floor the front has already been over, and how far that floor reaches can
  // only be guessed here. The other edge is drawn by the tail: whatever is laid on that side further forward, the tail will cut.)
  // (Abeam: by where the spot lies along the ski NOW, p. Where the ski came nearest to it, q, is always its front for a spot on that side)
  let fw: f32 = mix(1.0, smoothstep(tip - 0.75, tip - 0.45, p.y), smoothstep(0.0, 0.03, -sg * ldr));
  let a: f32 = (1.0 - smoothstep(0.85, 1.0, so / Ws)) * max(bury, saturate((tip - 0.12 - p.y) / 0.20)) * smoothstep(0.0, 0.004, h.x) * (1.0 - tr) * (1.0 - fol) * near * fw;
  if (a < 0.004) { discard; }
  // (what is pushed aside is loose: more so of powder, and of a skid's berm)
  o.color = vec4f(M.e.x + val * M.e.y, smoothstep(0.0, soft, sdu) * (0.25 + 0.5 * pw + 0.3 * skid), M.e.x + val * M.e.y, a);
  return o;
}`,fn=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let t: TrkV = trackQuad(a.a0, a.a1, a.vid, a.a4.w + 0.11, 0.25, 0.70);
  v.clip = t.clip; v.w = t.w;
  return v;
}`,Ha=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let uv: vec2f = v.w.xy; let tx: f32 = M.p.x * M.p.y; let hx: f32 = 0.5 * tx; let h0: f32 = texLod(tT, uv, 0.0).x;
  // the snow at this texel taken together with its neighbours (four taps on its corners: weights 1 2 1 each way), and its slopes from the
  // same four. The wall of a track is two or three texels wide and all of this is looked at from close by: slopes and sky taken texel by
  // texel came out as a row of beads along every wall that runs askew to the map
  let ha: f32 = texLod(tT, uv + vec2f(hx, hx), 0.0).x; let hb: f32 = texLod(tT, uv + vec2f(-hx, hx), 0.0).x;
  let hc: f32 = texLod(tT, uv + vec2f(hx, -hx), 0.0).x; let hd: f32 = texLod(tT, uv + vec2f(-hx, -hx), 0.0).x;
  let hs: f32 = 0.25 * (ha + hb + hc + hd);
  let sl: vec2f = vec2f((ha + hc) - (hb + hd), (ha + hb) - (hc + hd)) * (0.5 / M.p.y);
  // toward the sun in growing steps; the far ones read blurred levels (no crest slips between two steps, and a long shadow gets a soft end)
  var sdp: f32 = -1.0; var d: f32 = 0.75; let st: vec2f = M.s.xy * tx; let rise: f32 = M.s.z * M.p.y;
  for (var k: i32 = 0; k < 16; k++) {
    sdp = max(sdp, texLod(tT, uv + st * d, clamp(log2(d) - 2.0, 0.0, 3.0)).x - h0 - rise * d);
    d = d * 1.2 + 0.5;
  }
  // the sky: how far this spot lies under the snow round it, taken as the mean over a hand's width and over a foot's (two blurred levels of
  // the map: the same in every direction. Single taps to four sides came out as ribs along any wall that runs askew to the texels)
  let cav: f32 = max(texLod(tT, uv, 3.0).x - hs, 0.0) + max(texLod(tT, uv, 4.5).x - hs, 0.0);
  // (lightly: snow is so white that a hollow in it is filled with the light of its own walls. Any more and the floor of a track goes grey.
  // And it levels off: the floor of a powder furrow a foot deep is lit by its own white walls, never darker than about half)
  o.color = vec4f(saturate(0.5 + sdp * 25.0), 1.0 / (1.0 + 5.0 * cav / (1.0 + 4.0 * cav)), sl.x, sl.y);
  return o;
}`,cn=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let t: TrkV = trackQuad(a.a0, a.a1, a.vid, a.a4.x, a.a4.y, 0.0);
  v.clip = t.clip; v.q = t.q; v.w = t.w; v.c = a.a2;
  return v;
}`,hn=`
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let t: TrkV = trackQuad(a.a0, a.a1, a.vid, a.a4.x + 0.11, a.a4.y + 0.25, 0.70);
  v.clip = t.clip; v.w = t.w;
  return v;
}`,dn=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let p: vec2f = v.q.xy; let k: f32 = v.c.x; let s: f32 = v.c.y; let so: vec2f = vec2f(fract(v.c.z * 0.137), fract(v.c.z * 0.291));
  let lump: f32 = texLod(tDetail, v.w.zw / 0.9 + so, M.e.z - 1.0).z;
  let grain: f32 = texLod(tDetail, v.w.zw / 0.22 + so.yx, M.e.z).z;
  var dh: f32 = 0.0; var g: f32 = 0.0;
  if (k < 1.5) {
    // a fan: crumbs and small clumps strewn out from the apex, thick near it and thinning toward its ragged end; most of it a dusting
    // that roughens the snow, here and there a clump that stands up
    let r: f32 = p.y / s; let ang: f32 = abs(p.x) / max(p.y, 0.02);
    let ed: f32 = smoothstep(0.80, 0.45, ang + (lump - 0.5) * 0.35) * smoothstep(0.0, 0.10, r) * smoothstep(1.0, 0.55, r + (lump - 0.5) * 0.5);
    let th: f32 = mix(1.0, 0.45, saturate(r));
    g = ed * th * (0.55 + 0.45 * grain);
    dh = ed * th * (0.004 + 0.035 * smoothstep(0.62, 0.86, grain) * (0.5 + lump));
  } else if (k < 2.5) {
    // the pile at the end of a stop: an arc of pushed snow, its back to dir, heaped highest in the middle, lumpy along its crest
    let d: vec2f = p - vec2f(0.0, -0.35 * s); let rr: f32 = length(d); let th: f32 = abs(atan2(d.x, d.y));
    let w: f32 = 0.10 * s + 0.03;
    let prof: f32 = exp(-sq((rr - 0.42 * s) / w)) * smoothstep(1.35, 0.7, th + (lump - 0.5) * 0.4);
    dh = prof * (0.07 * s + 0.02) * (0.75 + 0.5 * lump) * mix(1.0, 0.6, th / 1.35); g = prof * 0.95;
  } else if (k < 3.5) {
    // the pit a clump makes: as deep as half its width, with a rim of the crumbs it threw out
    let r: f32 = length(p) / s * (1.0 + (lump - 0.5) * 0.35);
    dh = -0.55 * s * sq(saturate(1.0 - r * r)) + 0.10 * s * exp(-sq((r - 1.15) / 0.22)) * (0.6 + 0.8 * grain);
    g = smoothstep(1.6, 0.7, r) * 0.85;
  } else {
    // a snowball come to rest, half sunk, and the dotted line it rolled in, fading toward where it started
    let b: f32 = length(p) / s;
    dh = 1.2 * s * sqrt(saturate(1.0 - b * b));
    let tw: f32 = 0.75 * s; let tr: f32 = exp(-sq(p.x / tw)) * step(p.y, 0.0) * smoothstep(-13.0 * s, -6.0 * s, p.y);
    dh += -0.18 * s * tr * (0.6 + 0.4 * sin(p.y / (s * 0.9)));
    g = max(smoothstep(1.4, 0.8, b), tr * 0.6);
  }
  if (abs(dh) < 1e-5 && g < 0.004) { discard; }
  if (M.p.w > 0.5) { dh = max(dh, 0.0); }
  o.color = vec4f(dh * M.e.y, g, dh * M.e.y, 0.0);
  return o;
}`,pn=`
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let d: vec2f = (fract(v.uv - M.p.xy + 0.5) - 0.5) * M.p.z;      // metres from the skier, the short way round the tile
  if (dot(d, d) < M.p.w * M.p.w) { discard; }
  o.color = M.c;
  return o;
}`,v0=(()=>{const e={ctx:null,rig:null,on:!0,level:.62,pc:{},row:1e9,creakFloor:.026};typeof Dt<"u"&&Dt.def("wind","风声",[["a","原样"],["b","大一点"],["c","更大"]],"b");function s(w){const x=w.sampleRate,F=D0(90210),we={},Y=()=>(F()+F()+F()+F()-2)*1.7320508,E=Math.round(x*3);{const se=w.createBuffer(2,E,x);for(let _=0;_<2;_++){const b=se.getChannelData(_);for(let re=0;re<E;re++)b[re]=Y()*.25}we.white=se}{const se=Math.round(x*4),_=Math.round(x*.05),b=w.createBuffer(2,se,x),re=new Float32Array(se+_);for(let m=0;m<2;m++){const J=b.getChannelData(m);let ae=0,X=0,ke=0,C=0,ne=0,Be=0,Ee=0;for(let je=-4e3;je<se+_;je++){const $e=Y();ae=.99886*ae+$e*.0555179,X=.99332*X+$e*.0750759,ke=.969*ke+$e*.153852,C=.8665*C+$e*.3104856,ne=.55*ne+$e*.5329522,Be=-.7616*Be-$e*.016898,je>=0&&(re[je]=(ae+X+ke+C+ne+Be+Ee+$e*.5362)*.055),Ee=$e*.115926}for(let je=0;je<se;je++)if(je<_){const $e=je/_*h0/2;J[je]=re[je]*Math.sin($e)+re[se+je]*Math.cos($e)}else J[je]=re[je]}we.pink=b}{const se=w.createBuffer(2,E,x),_=3*70,b=new Float32Array(_+1);for(let re=0;re<2;re++){for(let ke=0;ke<_;ke++)b[ke]=it(Y(),-2,2);b[_]=b[0];const m=se.getChannelData(re),J=we.pink.getChannelData(re),ae=re?7919:104729;for(let ke=0;ke<E;ke++){const C=ke/E*_,ne=Math.floor(C),Be=C-ne,Ee=Be*Be*(3-2*Be);m[ke]=J[(ke+ae)%J.length]*1.4*Math.exp(.24*Re(b[ne],b[ne+1],Ee))}const X=Math.round(x*.05);for(let ke=0;ke<X;ke++){const C=ke/X*h0/2,ne=(E+ke+ae)%J.length;m[ke]=m[ke]*Math.sin(C)+J[ne]*1.4*Math.exp(.24*b[0])*Math.cos(C)}}we.sand=se}{const se=w.createBuffer(2,E,x),_=Math.exp(-1/(x*.0011)),b=560/x;for(let re=0;re<2;re++){const m=se.getChannelData(re);let J=0;for(let ae=0;ae<E;ae++){if(F()<b){const X=F();J+=X*X*X*1.7}J*=_,m[ae]=Y()*J*.55}}we.patter=se}{const _=w.createBuffer(2,4096,x);for(let b=0;b<2;b++){const re=_.getChannelData(b);let m=1,J=0;for(let X=128;X>=4;X>>=1){const ke=4096/X,C=new Float32Array(ke+1);for(let ne=0;ne<ke;ne++)C[ne]=F()*2-1;C[ke]=C[0];for(let ne=0;ne<4096;ne++){const Be=ne/X,Ee=Math.floor(Be),je=Be-Ee,$e=je*je*(3-2*je);re[ne]+=m*Re(C[Ee],C[Ee+1],$e)}J+=m*m,m*=.8}const ae=1/Math.sqrt(J/3);for(let X=0;X<4096;X++)re[X]*=ae}we.lfo=_}const D=(se,_,b,re,m)=>{const J=re/(h0*b)*x,ae=Math.min(se.length-_,Math.round(J*6)),X=It*b/x,ke=F()*It;for(let C=0;C<ae;C++)se[_+C]+=m*Math.exp(-C/J)*(Math.sin(X*C+ke)+.5*Y())},be=(se,_,b)=>{_<0||_>=se.length-600||(D(se,_,Re(340,700,F()),1.6,b*1.5),D(se,_,Re(900,1700,F()),2.2,b*.7),D(se,_,Re(2400,4e3,F()),2.6,b*.35),D(se,_,Re(5500,8500,F()),3,b*.2))},ht=(se,_,b,re,m,J)=>{const ae=Math.round(b*x),X=Math.round(x*.02),ke=1/4.6;let C=0,ne=0,Be=0,Ee=0,je=0,$e=0,nt=0;const Ke=420/x;for(let Fe=0;Fe<ae+X&&_+Fe<se.length;Fe++){const Ge=Fe/ae,Je=Fe<ae?Math.min(1,Fe/(x*.007))*Math.min(1,(ae-Fe)/(x*.028)):0;nt+=(Y()*.9-nt)*.004;const le=re*Math.pow(m/re,Math.min(1,Ge*Ge*.4+Ge*.6))*(1+nt),Pe=Je*(Y()*.22+(F()<Ke?(F()*2-1)*9:0)),pe=2*Math.sin(h0*le/x),c=2*Math.sin(h0*Math.min(le*1.85,x*.16)/x),Ie=2*Math.sin(h0*le*.52/x);C+=pe*ne,ne+=pe*(Pe-C-ke*ne),Be+=c*Ee,Ee+=c*(Pe-Be-ke*Ee),je+=Ie*$e,$e+=Ie*(Pe-je-.5*$e),se[_+Fe]+=J*(ne+.5*Ee+.7*$e+Pe*.07)}},qe=(se,_)=>{let b=0;for(let m=0;m<se.length;m++)b=Math.max(b,Math.abs(se[m]));const re=_/(b||1);for(let m=0;m<se.length;m++)se[m]*=re};{const se=Math.round(x*6),_=w.createBuffer(1,se,x),b=_.getChannelData(0);let re=.02;for(;re<5.75;){const m=Math.round(re*x),J=F()<.36,ae=.35+.65*F(),X=1+Math.floor(F()*(J?4:3));let ke=re;for(let C=0;C<X;C++){const ne=F();be(b,Math.round(ke*x),ae*(.15+.85*ne*ne)*.55),ke+=.006+.04*F()*F()}if(J){const C=.05+.1*F();ht(b,Math.round(ke*x),C,Re(1300,2100,F()),Re(520,850,F()),ae*.2),ke+=C}re=ke+.03+.2*F()*F()}for(let m=.01;m<5.95;m+=-Math.log(1-F()*.999)/55){const J=F();be(b,Math.round(m*x),.012+.16*J*J*J*J)}{let m=0;for(let Fe=0;Fe<se;Fe++)m=Math.max(m,Math.abs(b[Fe]));const J=Math.exp(-1/(x*.06)),ae=1-Math.exp(-1/(x*.025)),X=Math.exp(-1/(x*7e-4)),ke=1100/x,C=Math.exp(-It*260/x),ne=1-Math.exp(-It*1500/x);let Be=0,Ee=0,je=0,$e=0,nt=0,Ke=0;for(let Fe=0;Fe<se;Fe++){if(Be=Math.max(Math.abs(b[Fe])/m,Be*J),Ee+=(Be-Ee)*ae,F()<ke){const Je=F();je+=Je*Je*1.2}je*=X;const Ge=Y()*je;$e=C*($e+Ge-Ke),Ke=Ge,nt+=ne*($e-nt),b[Fe]+=m*e.creakFloor*(.4+1.4*Math.min(Ee*3,1))*($e*.6+nt*2.2)}}qe(b,1);for(let m=0;m<se;m++)b[m]=Math.tanh(b[m]*3.2)*.8;we.creak=_}we.chirps=[];for(let se=0;se<4;se++){const _=Math.round(x*.5),b=w.createBuffer(1,_,x),re=b.getChannelData(0);let m=.004;const J=2+Math.floor(F()*3);for(let ae=0;ae<J;ae++)be(re,Math.round(m*x),.5+.5*F()),m+=.014+.024*F();ht(re,Math.round(m*x),.11+.05*se,Re(1600,2200,F()),Re(480,700,F()),.34),qe(re,1);for(let ae=0;ae<_;ae++)re[ae]=Math.tanh(re[ae]*2.6)*.8;we.chirps.push(b)}we.poles=[];for(let se=0;se<4;se++){const _=Math.round(x*.1),b=w.createBuffer(1,_,x),re=b.getChannelData(0),m=Math.round(x*.002);be(re,m,.5+.3*F());const J=Math.exp(-1/(x*6e-4)),ae=Math.exp(-It*700/x),X=1-Math.exp(-It*4200/x),ke=1-Math.exp(-It*Re(230,330,F())/x);let C=0,ne=0,Be=0,Ee=0,je=0,$e=0;for(let Ke=m;Ke<_;Ke++){const Fe=(Ke-m)/x;if(F()<(2600*Math.exp(-Fe/.016)+100)/x){const Je=F();C+=Je*Je*1.3}C*=J;const Ge=Y()*C*Math.exp(-Fe/.03);ne=ae*(ne+Ge-Be),Be=Ge,Ee+=X*(ne-Ee),je+=ke*(Y()-je),$e+=ke*(je-$e),re[Ke]+=Ee*1.5+$e*3.6*Math.exp(-Fe/.011)*Math.min(1,Fe/.0015)}qe(re,1);const nt=Math.round(x*.012);for(let Ke=0;Ke<nt;Ke++)re[_-1-Ke]*=Ke/nt;we.poles.push(b)}return we}return e.build=function(w,x={}){const F=s(w),we=w.sampleRate,Y={ctx:w,t:0},E=(Oe=0)=>{const ze=w.createGain();return ze.gain.value=Oe,ze},D=(Oe,ze,pt=.707,ut=0)=>{const xt=w.createBiquadFilter();return xt.type=Oe,xt.frequency.value=ze,xt.Q.value=pt,xt.gain.value=ut,xt},be=(Oe,ze=1,pt=0)=>{const ut=w.createBufferSource();return ut.buffer=Oe,ut.loop=!0,ut.playbackRate.value=ze,ut.start(0,pt),ut},ht=()=>w.createStereoPanner?w.createStereoPanner():E(1),qe=(...Oe)=>{for(let ze=0;ze<Oe.length-1;ze++)Oe[ze].connect(Oe[ze+1]);return Oe[Oe.length-1]},se=Oe=>({p:Oe,v:NaN}),_=(Oe,ze,pt,ut=.045)=>{Oe.p&&(Math.abs(ze-Oe.v)<=.006*Math.max(Math.abs(ze),Math.abs(Oe.v),.02)||(Oe.v=ze,Oe.p.setTargetAtTime(ze,pt,ut)))},b=(Oe,ze,pt,ut,xt,lt)=>{const Tt=Oe.gain;Tt.cancelScheduledValues(ze),Tt.setTargetAtTime(pt,ze,ut),Tt.setTargetAtTime(0,ze+xt,lt)},re=E(0),m=w.createDynamicsCompressor(),J=E(1);m.threshold.value=-15,m.knee.value=10,m.ratio.value=3.5,m.attack.value=.004,m.release.value=.16;const ae=w.createWaveShaper(),X=new Float32Array(1025);for(let Oe=0;Oe<1025;Oe++){const ze=(Oe-512)/512*1.6,pt=Math.abs(ze);X[Oe]=R0(ze)*(pt<.7?pt:.7+.29*Math.tanh((pt-.7)/.29))}ae.curve=X;const ke=E(1/1.6);qe(J,m,re,ke,ae,w.destination);const C=Oe=>{const ze=E(x.solo&&x.solo!==Oe||x.off===Oe?0:1);return ze.connect(J),ze},ne=C("wind"),Be=be(F.pink,1,.2),Ee=be(F.white,1,.4),je=D("highpass",42,.7),$e=D("highshelf",230,.7,-7),nt=D("lowpass",260,.6),Ke=D("lowpass",290,1),Fe=w.createChannelSplitter(2),Ge=w.createChannelMerger(2),Je=[E(1),E(1)],le=be(F.lfo,150/we),Pe=w.createChannelSplitter(2),pe=[E(.3),E(.3)],c=E(0),Ie=ht();qe(Be,je,$e,nt,Ke,Fe);const he=D("highpass",3,.707),H=E(1),z=E(0);le.connect(H),qe(le,he,z),H.connect(Pe),z.connect(Pe);for(let Oe=0;Oe<2;Oe++)Fe.connect(Je[Oe],Oe),Pe.connect(pe[Oe],Oe),pe[Oe].connect(Je[Oe].gain),Je[Oe].connect(Ge,0,Oe);qe(Ge,c,Ie,ne);const V=be(F.lfo,11/we,1500),I=E(.3);qe(V,I),I.connect(c.gain);const Q=D("bandpass",620,.55),L=D("lowpass",2400,.6),ye=E(0),Ve=E(1),Ne=be(F.lfo,7/we,2600),Ce=E(.42);qe(Be,Q,L,Ve,ye,ne),qe(Ne,Ce),Ce.connect(Ve.gain);const Ye=D("bandpass",900,18),T=E(0),Se=be(F.lfo,5/we,700),me=E(60);qe(Ee,Ye,T,ne),qe(Se,me),me.connect(Ye.frequency);const B=C("snow"),U=be(F.sand,1,.1),A=be(F.sand,1.13,1.7),a=be(F.patter,1,.5),oe=D("highpass",1300,.6),fe=D("highshelf",8e3,.7,.5),O=D("lowpass",13e3,.6),ie=E(0);qe(U,oe,fe,O,ie,B);const ce=D("bandpass",1300,.6),He=D("peaking",1250,1.4,3),We=D("highpass",3400,.7),Qe=D("peaking",10500,1.4,4),st=E(.5),Le=D("bandpass",250,1.3),r=E(.5),q=E(1),k=D("lowpass",13e3,.6),ee=E(1),Z=E(0),K=ht();qe(A,ce,He,q),qe(A,We,Qe,st,q),qe(A,Le,r,q),qe(q,k,ee,Z,K,B);const ue=be(F.lfo,520/we,900),G=E(.1);qe(ue,G),G.connect(ee.gain);const Ae=D("highpass",2600,.7),_e=D("peaking",7e3,.9,5),at=E(0),ot=ht();qe(U,Ae,_e,at,ot,B);const t=D("highpass",4200,.7),S=D("lowpass",14e3,.6),l=E(0),u=ht();qe(a,t,S,l,u,B);const v=C("creak"),P=be(F.creak,1,0),N=D("peaking",1100,.8,3),de=D("peaking",520,.8,9),te=D("highshelf",6500,.7,5),o=E(0),p=ht();qe(P,N,de,te,o,p,v);const i=C("fx"),y=w.createOscillator(),j=E(0);y.type="sine",y.frequency.value=60,qe(y,j,i),y.start();const W=D("lowpass",1500,.8),h=E(0);qe(Ee,W,h,i);const n=D("highpass",2800,.7),d=E(0),M=ht();qe(a,n,d,M,i);const g=D("bandpass",2300,.7),R=E(0),Ue=ht();qe(A,g,R,Ue,i);const $=D("lowpass",340,.9),ve=E(0),xe=ht(),De=D("bandpass",1500,.8),Te=E(0);qe(Be,$,ve,xe,i),qe(A,De,Te,xe);const Me=[D("bandpass",900,1.1),D("bandpass",900,1.1)],rt=[E(0),E(0)],wt=[ht(),ht()];for(let Oe=0;Oe<2;Oe++)qe(Be,Me[Oe],rt[Oe],wt[Oe],i),wt[Oe].pan&&(wt[Oe].pan.value=Oe?.8:-.8);const Ze={wL1:se(nt.frequency),wL2:se(Ke.frequency),wG:se(c.gain),wGd:se(I.gain),wSh:se($e.gain),wLa:se(H.gain),wLb:se(z.gain),wD0:se(pe[0].gain),wD1:se(pe[1].gain),wBal:se(Ie.pan),hF:se(Ye.frequency),hG:se(T.gain),mG:se(ye.gain),wRate:se(le.playbackRate),gG:se(ie.gain),gHP:se(oe.frequency),gLP:se(O.frequency),gRate:se(U.playbackRate),eG:se(Z.gain),eBP:se(ce.frequency),ePk:se(He.frequency),eLP:se(k.frequency),eLoG:se(r.gain),eAirG:se(st.gain),ePan:se(K.pan),rD:se(G.gain),aG:se(at.gain),aPan:se(ot.pan),pG:se(l.gain),pPan:se(u.pan),pLP:se(S.frequency),aPk:se(_e.frequency),qG:se(o.gain),qRate:se(P.playbackRate),qPk:se(N.frequency),qPan:se(p.pan),out:se(re.gain)};let ct=0,Mt=0,ft=0,dt=0,gt=1,bt=-1,Xe=0,et=1;const tt=Y.music=typeof Ia<"u"&&x.music!==!1?Ia.build(w,C("music"),x,{gain:E,biq:D,pan:ht,chain:qe,H:se,set:_}):null;Y.fade=(Oe,ze,pt=.25)=>{Ze.out.v=NaN,_(Ze.out,Oe,ze,pt)},Y.chirp=(Oe,ze,pt,ut=1)=>{if(Oe-bt<.3)return;bt=Oe,Y.chirps=(Y.chirps||0)+1;const xt=w.createBufferSource(),lt=E(ze),Tt=ht();xt.buffer=F.chirps[Xe++%F.chirps.length],xt.playbackRate.value=ut*(.92+.16*Ts(Xe*7+3)),Tt.pan&&(Tt.pan.value=pt),qe(xt,lt,Tt,v),xt.start(Oe)},Y.land=(Oe,ze)=>{const pt=mt(Oe/5.5);y.frequency.cancelScheduledValues(ze),y.frequency.setValueAtTime(Re(92,128,pt),ze),y.frequency.exponentialRampToValueAtTime(42,ze+.17),b(j,ze,.12+.3*pt,.003,.022,.075),b(h,ze,1.3*(.3+.7*pt),.002,.03,.055),b(d,ze+.015,.5*pt,.012,.09,.17),Y.chirp(ze+.012,.35+.5*pt,0,.9)},Y.brush=(Oe,ze,pt)=>{Ue.pan&&(Ue.pan.setTargetAtTime(ze*.6,Oe,.01),M.pan.setTargetAtTime(ze*.5,Oe,.01)),b(R,Oe,pt?.6:.25,.012,.07,.11),b(d,Oe+.05,pt?.4:.18,.03,.22,.32),pt&&(y.frequency.cancelScheduledValues(Oe),y.frequency.setValueAtTime(70,Oe),y.frequency.exponentialRampToValueAtTime(38,Oe+.2),b(j,Oe,.4,.004,.03,.09),b(h,Oe,1.4,.002,.04,.08),tt&&tt.crash(Oe))},Y.pole=Oe=>{Y.poles=(Y.poles||0)+1;const ze=Ts(Y.poles*13+5)<.5?-1:1,pt=.006+.01*Ts(Y.poles*29+1);for(let ut=0;ut<2;ut++){const xt=w.createBufferSource(),lt=E(ut?.13:.16),Tt=ht();xt.buffer=F.poles[(Y.poles*2+ut)%F.poles.length],Tt.pan&&(Tt.pan.value=(ut?-ze:ze)*.34),qe(xt,lt,Tt,i),xt.start(Oe+ut*pt)}},Y.takeoff=(Oe,ze,pt)=>{tt&&tt.takeoff(Oe,ze,pt)},Y.down=(Oe,ze,pt)=>{tt&&tt.down(Oe,ze,pt)},Y.hoof=(Oe,ze,pt)=>{xe.pan&&xe.pan.setTargetAtTime(pt,Oe,.02),Y.hoofs=(Y.hoofs||0)+1,b(ve,Oe,1.5*ze,.004,.018,.05),b(Te,Oe+.004,.36*ze,.004,.022,.06)},Y.pass=(Oe,ze,pt,ut)=>{Y.passes=(Y.passes||0)+1;const xt=ze>0?1:0,lt=Me[xt].frequency,Tt=700+38*ut;lt.cancelScheduledValues(Oe),lt.setValueAtTime(Tt*1.5,Oe),lt.exponentialRampToValueAtTime(Tt*.7,Oe+.16),b(rt[xt],Oe,pt,.022,.035,.06)},Y.update=function(Oe,ze){const pt=it(ze-Y.t,0,.1),ut=it(Oe.ts||1,.05,1);Y.t=ze;const xt=Oe.run?Oe.speed:0,lt=mt(xt/34),Tt=Math.abs(Oe.lat),Et=Oe.lat>=0?1:-1,Ut=Oe.powder;ft=Pt(ft,Oe.run&&Oe.contact?1:0,Oe.contact?40:28,pt);const Xt=typeof Dt<"u"?Dt.val.wind:"b",_t=Xt==="a",m0=it(typeof M0<"u"&&M0.wind||1,.2,3),r0=(1+1.4*Oe.ridge-.55*Oe.forest)*m0,Ft=_t||Oe.wind==null?xt:Oe.wind*(Xt==="c"?1.21:1),Lt=_t?lt:Ft/34,yt=Math.min(Lt,1),Rt=_t||Oe.tk==null?Oe.tuck:Oe.tk,Vt=_t?0:Oe.push||0,Kt=(300+830*Math.pow(Lt,1.1))*(1+.12*Rt)*Re(.6,1,ut)*Math.exp(.06*Vt),jt=_t?.12:.04;_(Ze.wL1,Kt,ze,jt),_(Ze.wL2,Kt*1.12,ze,jt),_(Ze.wSh,_t?-7:Re(-7,-1.5,ge(6,28,Ft))+1.5*Vt,ze,.05);const Ot=(.14*r0+(_t?2*Math.pow(Lt,1.9):2.8*(Lt<1?Math.pow(Lt,2.05):1+1.2*(Lt-1))))*(1-.22*Rt)*(Oe.run&&!Oe.contact?1.15:1);_(Ze.wG,Ot*Math.exp((.38-.1*Rt)*Vt),ze,jt),_(Ze.wGd,_t?Ot*.28:0,ze,.2),_(Ze.wLa,_t?1:0,ze,.2),_(Ze.wLb,_t?0:1,ze,.2);const $t=_t?.22+.2*Lt:(.22+.26*yt)*(1-.25*Rt);_(Ze.wD0,$t,ze,.2),_(Ze.wD1,$t,ze,.2),_(Ze.wRate,(_t?150:70+4.6*Ft)/we*Re(.4,1,ut),ze,.1),_(Ze.wBal,it(-Oe.lean*.22,-.3,.3),ze,.15),_(Ze.mG,.55*r0*Re(1,.5,yt),ze,.4),_(Ze.hF,760+950*Lt,ze,.2),_(Ze.hG,1.5*ge(13,30,Ft)*(1-.5*Oe.forest),ze,.3),et=Pt(et,Oe.run&&Oe.contact?Oe.load:0,9,pt);const Bt=Math.tan(Math.min(Math.abs(Oe.lean),1.1)),Ct=mt(Oe.skid/.45),Zt=.6+.6*Ut,n0=1-Ut,i0=ge(1.5,13,xt)*(.62*Math.pow(Bt,1.3)+1.25*Oe.skid*(.4+.6*mt(Bt)))*Re(.35,1.25,mt(et/1.8))*Zt,w0=Math.pow(mt(i0*.85),.8);_(Ze.gG,ft*(.02+.3*Math.pow(lt,1.15))*ge(.3,2.5,xt)*Re(1,.6,Ut)*Re(.55,1.1,mt(et/1.3)),ze,.05),_(Ze.gHP,Re(900,1700,lt)*Re(1,.5,Ut),ze,.1),_(Ze.gLP,Re(13e3,3600,Ut*.9),ze,.2),_(Ze.gRate,.8+.5*lt,ze,.2);const kt=Re(1650,1050,Ct)*(.82+.4*lt)*Re(1,.6,Ut);_(Ze.eG,ft*2.5*w0*Re(1,.8,Ut),ze,.04),_(Ze.eBP,kt,ze,.06),_(Ze.ePk,kt*.96,ze,.06),_(Ze.eLP,Re(13e3,3e3,Ut*.85),ze,.2),_(Ze.eLoG,.08+.2*Ct*n0,ze,.1),_(Ze.eAirG,Re(.52,.12,Ut),ze,.2),_(Ze.rD,.07+.2*Ct*n0,ze,.1);const Ht=-Et*mt(Bt/.35)*mt(i0*3);_(Ze.ePan,Ht*.5,ze,.08),_(Ze.aPan,Ht*.68,ze,.08),_(Ze.pPan,Ht*.6,ze,.2),_(Ze.qPan,Ht*.3,ze,.1),ct=Pt(ct,i0,3,pt),Mt=Math.max(i0,Pt(Mt,0,1.5,pt)),_(Ze.aG,ft*(.34*Math.pow(mt((i0-ct)*2.2),.9)+.1*Math.pow(mt(i0*.8),1.2)*Re(.6,1.3,Ut)),ze,.025),_(Ze.pG,(.3*mt((Mt-i0)*1.6)+.06*mt(i0)*ft)*Re(1,.5,Ut),ze,.05),_(Ze.pLP,Re(14e3,5200,Ut),ze,.2),_(Ze.aPk,Re(7e3,3800,Ut),ze,.2),Y.E=i0;const Qt=mt((Oe.load-1)*.9)*.6+mt(Bt/1.2)*.55+mt((Oe.load-et)*1.2)*.5,e0=ft*mt(Qt)*ge(.4,3,xt)*Re(1,.5,ge(10,30,xt))*(1-.8*Ut);if(_(Ze.qG,3*e0+.16*ft*ge(.4,3,xt)*n0,ze,.03),_(Ze.qRate,.85+.55*lt+.15*mt(Tt),ze,.1),_(Ze.qPk,Re(1700,900,mt(Qt)),ze,.08),ft>.6&&xt>1&&xt<24&&Ut<.7){const t0=(Tt-dt)/Math.max(pt,.001),g0=(Oe.load-gt)/Math.max(pt,.001);(t0>2.2&&Tt>.35||g0>16)&&Y.chirp(ze,(.36+.5*mt(Qt))*Re(1,.5,ge(8,24,xt)),Ht*.35,.95+.4*lt)}dt=Tt,gt=Oe.load,tt&&tt.update(Oe,ze,i0,Ht)};{const Oe=typeof M0<"u"&&M0.build?M0.build(w,C("weather"),F,{gain:E,biq:D,pan:ht,chain:qe,H:se,set:_}):null;if(Oe){const ze=Y.update;Y.update=(pt,ut)=>{ze(pt,ut),Oe.update(pt,ut)},Y.thunder=Oe.thunder}}return Y},e.init=function(){const w=window.AudioContext||window.webkitAudioContext;if(w){try{e.ctx=new w({latencyHint:"interactive"}),e.rig=e.build(e.ctx)}catch(x){console.warn("audio unavailable",x),e.ctx=null,e.rig=null;return}document.addEventListener("visibilitychange",()=>{e.ctx&&(clearTimeout(e.hideT),document.hidden?(e.unlocked&&e.rig.fade(0,e.ctx.currentTime,.03),e.hideT=setTimeout(()=>{document.hidden&&e.ctx.suspend()},160)):e.unlocked&&(e.ctx.resume(),e.rig.fade(e.on?e.level:0,e.ctx.currentTime,.25)))})}},e.unlock=function(){if(e.ctx){e.unlocked=!0;try{navigator.audioSession&&(navigator.audioSession.type="playback")}catch(w){}e.ctx.state!=="running"&&e.ctx.resume(),e.rig.fade(e.on?e.level:0,e.ctx.currentTime,.5)}},e.kick=function(){if(!e.rig||zt.s.dp!==void 0)return;const w=e.now();e.rig.chirp(w+.06,.5,-.25,.9),setTimeout(()=>{e.rig&&e.rig.chirp(e.now(),.42,.25,1)},430)},e.setOn=function(w){e.on=w,e.rig&&e.unlocked&&e.rig.fade(w?e.level:0,e.ctx.currentTime,.12)},e.now=()=>e.ctx.currentTime+.012,e.snapshot=function(){const w=zt.s,x=vt.at(-w.p[2],e.pc),F=vt.segAt(-w.p[2]),we=zt.feel?zt.feel.wind:null;return{run:zt.mode==="run",speed:Math.hypot(w.v[0],w.v[1],w.v[2]),contact:w.contact,lat:w.aReac/9.81,skid:Math.abs(Math.sin(w.beta)),load:w.load/9.81,powder:w.powder,I:Jt.intensity,tuck:w.tuck,lean:w.lean,ridge:x.ridge||0,forest:Math.max(x.forest||0,x.glade||0),wind:we?we.v:null,push:we?we.b:0,tk:Math.max(w.tuck,w.tuckIn||0),air:w.air,airT:w.airT,ts:zt.timeScale||1,kind:F.type,slope:F.p.slope,sun:Nt.sunElev,pred:zt.flight&&zt.flight.on?zt.flight.pred:0,clear:w.air?w.p[1]-vt.height(w.p[0],w.p[2],.5):0}},e.flight=function(){const w=zt.s,x=w.p,F=w.v,we=vt.mogK;let Y=3,E=0;vt.mogK=.34;for(let be=1/30;be<3;be+=1/30){const ht=x[1]+F[1]*be-4.905*be*be-vt.height(x[0]+F[0]*be,x[2]+F[2]*be,.5);if(ht<.22){Y=be;break}E=Math.max(E,ht)}vt.mogK=we;const D=zt.flight;return{T:D&&D.on&&D.pred>0?D.pred:Y+w.airT,H:E}},e.frame=function(){if(!e.rig)return;const w=e.now(),x=zt.s;if(e.rig.update(e.snapshot(),w),zt.mode==="run"&&x.speed>7&&x.v[2]<-3){const F=Math.floor(x.p[2]/Es)-1;if(F!==e.row){e.row=F;const we=Math.floor(x.p[0]/Es),Y=e.tn||(e.tn={});for(let E=-1;E<=1;E+=2){let D=1e9,be=0;for(let qe=-2;qe<=2;qe++){const se=vt.treeInCell(we+qe,F,Y);if(!se.ok)continue;const _=(se.x-x.p[0])*E;_>.2&&_<D&&(D=_,be=se.z)}const ht=(x.p[2]-be)/-x.v[2];D<7.5&&ht>0&&ht<.7&&e.rig.pass(w+ht,E,.5*mt(1-D/7.5)*ge(7,22,x.speed),x.speed)}}}},e.event=function(w){if(!e.rig)return;const x=e.now(),F=zt.s;if(w.type==="land")e.rig.down(x,w.v,w.airT),(w.airT>.14||w.v>1.6)&&e.rig.land(w.v*(w.airT>.14?1:.5),x);else if(w.type==="takeoff"){const we=e.flight();e.rig.takeoff(x,we.T,we.H)}else w.type==="pole"?e.rig.pole(x):w.type==="brush"||w.type==="crash"?e.rig.brush(x,R0((w.x-F.p[0])*F.r[0]+(w.z-F.p[2])*F.r[2])||1,w.type==="crash"):w.type==="hoof"&&e.rig.hoof(x,w.k*Math.pow(mt(1-w.d/34),1.6),w.side*mt(w.d/6)*.75)},e})(),Ia=(()=>{const e={bpm:90,level:.28,sag:.13,look:.2},s={pad:1.15,arp:1.1,bass:.7,shim:1.3,lead:1.25,air:1},w=(m,J,ae,X,ke)=>({b:m,alt:J,pad:ae,arp:X,lead:ke}),x={clear:[w(38,45,[57,64,66,69],[62,64,66,69,74,76],[76,78,81,83,88]),w(38,40,[59,62,64,68],[62,64,68,71,76,80],[76,78,80,83,88]),w(35,42,[57,62,66,71],[59,62,66,69,71,76],[76,78,81,83,86]),w(33,40,[57,61,64,71],[57,61,64,69,71,76],[76,78,81,83,85])],clear2:[w(38,45,[57,61,64,66],[62,66,69,73,76,78],[76,78,81,85,88]),w(42,37,[57,61,64,68],[61,64,66,71,73,76],[76,78,81,83,85]),w(45,40,[57,61,64,71],[57,61,64,69,71,76],[76,78,81,83,85]),w(40,47,[56,59,64,66],[59,64,66,68,71,76],[76,78,80,83,88])],gold:[w(45,40,[57,61,64,71],[57,61,64,69,71,76],[76,78,81,83,85]),w(44,47,[56,59,64,66],[59,64,66,68,71,76],[76,78,80,83,88]),w(42,37,[57,61,64,66],[61,64,66,69,73,76],[76,78,81,83,85]),w(38,45,[54,57,61,64],[62,66,69,73,76,78],[76,78,81,85,88])],ember:[w(42,37,[57,61,64,68],[61,64,68,69,73,76],[76,78,80,81,85]),w(38,45,[57,61,66,69],[62,66,69,73,74,78],[76,78,81,85,86]),w(40,45,[57,61,64,71],[57,61,64,69,73,76],[76,78,81,83,85]),w(37,44,[56,59,64,68],[61,64,68,71,73,76],[76,80,83,85,88])],nebula:[w(35,42,[57,62,66,73],[59,62,66,69,73,78],[78,81,83,85,86]),w(35,40,[56,59,64,66],[59,64,68,71,76,80],[76,78,80,83,88]),w(38,45,[57,61,64,68],[62,66,68,73,76,80],[76,78,80,85,88]),w(42,37,[59,64,66,73],[61,64,66,71,73,76],[76,78,81,83,85])]},F={clear:{ratio:2,idx:.5,ring:.16,b:0},clear2:{ratio:2,idx:.5,ring:.16,b:0},gold:{ratio:1,idx:.8,ring:.2,b:-.2},ember:{ratio:1,idx:.7,ring:.24,b:-.35},nebula:{ratio:3,idx:.5,ring:.3,b:-.6}},we={bowl:{b:0,r:1,o:0,d:1,z:0,a:1},steeps:{b:.3,r:.85,o:0,d:.85,z:1,a:1},glade:{b:-.45,r:.55,o:0,d:.7,z:2,a:.9},rollers:{b:0,r:1,o:0,d:.9,z:3,a:1},gully:{b:-.3,r:1.3,o:0,d:1.1,z:0,a:.95},kickers:{b:.1,r:1,o:0,d:1,z:1,a:1},powder:{b:-.4,r:1.1,o:0,d:1.25,z:2,a:.8},ridge:{b:.35,r:1.2,o:12,d:.9,z:1,a:.7},moguls:{b:0,r:.8,o:0,d:.7,z:3,a:1}},Y=[[0,2,1,3,2,4,3,5,4,2],[0,1,2,3,4,5,3],[0,1,0,2,1],[0,3,1,4,2,5,1,4,0]],E=[1,.35,.55,.8,.4,.5,.85,.4,.9,.35,.55,.75,.45,.5,.8,.5],D=[[[0,0,6],[6,3,10]],[[0,1,4],[4,0,4],[8,2,8]],[[0,3,6],[6,2,4],[10,1,6]],[[0,2,4],[4,3,4],[8,4,8]],[[0,1,8],[8,0,8]],[[0,0,3],[3,1,3],[6,3,10]]],be=[8.5,16,27],ht=[6.5,14,24.5],qe=[.3,.68],se=[.15,.5],_=m=>440*Math.pow(2,(m-69)/12),b=(m,J,ae,X)=>{for(;J<ae.length&&m>ae[J];)J++;for(;J>0&&m<X[J-1];)J--;return J};function re(m,J){const ae=m.sampleRate,X=Math.round(ae*2.2),ke=m.createBuffer(1,X,ae),C=Math.round(ae*.03),ne=Math.round(ae*.08),Be=ke.getChannelData(0);let Ee=0,je=0;for(let $e=C;$e<X;$e++){const nt=($e-C)/ae,Ke=(J()+J()+J()+J()-2)*1.73,Fe=1-Math.exp(-It*(900+6e3*Math.exp(-nt/.5))/ae);Ee+=Fe*(Ke-Ee),je+=Fe*(Ee-je),Be[$e]=je*Math.exp(-nt/.48)*Math.min(1,nt/.012)*Math.min(1,(X-$e)/ne)}return ke}return e.build=function(m,J,ae,X){const{gain:ke,biq:C,pan:ne,chain:Be,H:Ee,set:je}=X,$e=e.bpm/15,nt=D0(4177),Ke={log:[]},Fe=ae.log?($,ve)=>Ke.log.push([+$.toFixed(3),ve]):()=>{},Ge=$=>ke(ae.layer&&ae.layer!==$?0:s[$]),Je=($,ve=220)=>{const xe=m.createOscillator();return xe.type=$,xe.frequency.value=ve,xe.start(),xe},le=$=>{try{$.automationRate="k-rate"}catch(ve){}return $},Pe=[],pe=($,ve=0)=>($.detune.value=ve,Pe.push([le($.detune),ve]),$),c=ke(1),Ie=C("lowpass",9e3,.6),he=ke(1),H=C("peaking",1250,.9,-2),z=ke(0),V=C("highpass",48,.7);Be(c,Ie,he,H,z,V,J),le(Ie.frequency),le(H.gain);const I=ke(1),Q=m.createConvolver(),L=C("lowpass",5200,.5),ye=ke(.5),Ve=m.createChannelMerger(2),Ne=m.createDelay(.1),Ce=ke(.8),Ye=ke(.6),T=ke(-.6);try{Q.channelCount=1,Q.channelCountMode="explicit"}catch($){}Q.buffer=re(m,nt),Ne.delayTime.value=.023,Be(I,Q,L,ye,Ce),Ce.connect(Ve,0,0),Ce.connect(Ve,0,1),Be(ye,Ne,Ye),Ye.connect(Ve,0,0),Be(Ne,T),T.connect(Ve,0,1),Ve.connect(H);const Se=ke(1),me=m.createDelay(1),B=m.createDelay(1),U=ke(.5),A=ke(.42),a=C("lowpass",2400,.5),oe=ne(),fe=ne(),O=ke(.55),ie=ke(.5);me.delayTime.value=B.delayTime.value=3/$e,oe.pan&&(oe.pan.value=-.55,fe.pan.value=.55),Be(Se,me,oe,O,c),Be(me,U,a,B,fe,O),Be(B,A,me),Be(O,ie,I);const ce=($,ve,xe,De)=>{const Te=ke(0),Me=Ge($);return Te.connect(Me),ve&&Be(Me,ke(ve),c),xe&&Be(Me,ke(xe),I),De&&Be(Me,ke(De),Se),Te},He=ce("pad",1,.45,0),We=C("lowpass",600,.5);Be(We,He),le(We.frequency);const Qe=()=>{const $=ke(0),ve=m.createChannelMerger(2),xe=ke(.074),De=ke(.074),Te=ke(.3),Me=ke(.3),rt=[];xe.connect(ve,0,0),De.connect(ve,0,1),Be(xe,Te),Te.connect(ve,0,1),Be(De,Me),Me.connect(ve,0,0),Be(ve,$,We);for(let ct=0;ct<4;ct++){const Mt=pe(Je("sawtooth"),-7-ct),ft=pe(Je("sawtooth"),7+ct);Mt.connect(xe),ft.connect(De),rt.push([le(Mt.frequency),le(ft.frequency)])}const wt=pe(Je("triangle")),Ze=ke(1.6);return Be(wt,Ze,xe),Ze.connect(De),rt.push([le(wt.frequency)]),{g:$.gain,v:rt}},st=[Qe(),Qe()];let Le=0;const r=($,ve,xe,De)=>{const Te=st[Le^=1],Me=st[Le^1];for(let rt=0;rt<4;rt++){const wt=_($.pad[rt]);Te.v[rt][0].setValueAtTime(wt,ve),Te.v[rt][1].setValueAtTime(wt,ve)}Te.v[4][0].setValueAtTime(_($.b+12),ve),Te.g.setTargetAtTime(1,ve,xe),Me.g.setTargetAtTime(0,ve,De)},q=m.createPeriodicWave(new Float32Array([0,0,0]),new Float32Array([0,1,.45])),k=$=>{const ve=pe(Je("sine")),xe=pe(Je("sine")),De=ke(0),Te=ke(0),Me=ne();return xe.setPeriodicWave(q),Me.pan&&le(Me.pan),Be(xe,De,Te),Be(ve,Te,Me,$),{c:le(ve.frequency),m:le(xe.frequency),mg:De.gain,g:Te.gain,p:Me.pan}},ee=($,ve,xe,De,Te,Me,rt,wt,Ze=.003,ct=0)=>{$.c.setValueAtTime(xe,ve-.003),$.m.setValueAtTime(xe*Te,ve-.003),$.mg.setTargetAtTime(Me*.65,ve,.001),$.mg.setTargetAtTime(Me*.05,ve+.006,Math.max(.03,rt*.35)),$.g.setTargetAtTime(De,ve,Ze),$.g.setTargetAtTime(0,ve+Ze*4+ct,rt),$.p&&$.p.setTargetAtTime(wt,ve,.012)},Z=ce("arp",1,.3,.5),K=C("lowpass",2200,.5);Be(K,Z),le(K.frequency);const ue=[0,1,2,3,4].map(()=>k(K)),G=ce("shim",.7,.6,.6),Ae=[0,1,2,3].map(()=>k(G));G.gain.value=1;const _e=ce("lead",1,.5,.45),at=[0,1].map(()=>k(_e));_e.gain.value=1;const ot=ce("bass",1,0,0),t=pe(Je("triangle",73)),S=pe(Je("sine",146)),l=ke(0),u=C("lowpass",260,.7);Be(t,u,l,ot),Be(S,ke(.22),l),le(t.frequency),le(S.frequency);const v=($,ve,xe,De)=>{const Te=_(ve);t.frequency.setTargetAtTime(Te,$,.004),S.frequency.setTargetAtTime(Te*2,$,.004),De?(l.gain.setTargetAtTime(xe,$,.07),l.gain.setTargetAtTime(xe*.55,$+.5,.9)):(l.gain.setTargetAtTime(xe,$,.006),l.gain.setTargetAtTime(xe*.22,$+.03,.085))},P=ce("bass",1,0,0),N=Je("sine",50),de=ke(0);Be(N,de,P);const te=($,ve)=>{const xe=N.frequency;xe.cancelScheduledValues($),xe.setValueAtTime(118,$),xe.exponentialRampToValueAtTime(47,$+.085),de.gain.setTargetAtTime(ve,$,.002),de.gain.setTargetAtTime(0,$+.03,.06)},o=[0,1,2,3].map($=>{const ve=pe(Je("sine",$<2?1319:1976),$&1?3:-3);return le(ve.frequency),ve}),p=ke(0),i=Ge("air"),y=ke(.6),j=[ke(.5),ke(.5)];Be(o[0],p,i),Be(o[1],j[0],p),Be(o[2],y,p),Be(o[3],j[1],y),Be(i,ke(.5),Q),Be(i,ke(.5),H);const W={padLP:Ee(We.frequency),arpLP:Ee(K.frequency),pad:Ee(He.gain),eq:Ee(H.gain),out:Ee(z.gain),duck:Ee(he.gain),lp:Ee(Ie.frequency),rvIn:Ee(I.gain),held:Ee(p.gain),rvG:Ee(ye.gain),dA:Ee(U.gain),arp:Ee(Z.gain),bas:Ee(ot.gain),kik:Ee(P.gain)},h={t:0,on:!1,pos:0,next:0,last:0,abs:0,step:0,bar:0,chord:0,round:0,nBar:0,set:"clear",want:"clear",ch:x.clear[0],tone:F.clear,kind:we.bowl,tierP:0,tierB:0,wantP:0,wantB:0,dwP:0,dwB:0,sag:0,sp:0,carve:0,side:0,night:0,d:0,full:!1,fly:0,H:0,hush:0,bl:0,bloom:0,tail:0,np:0,ns:0,av:0,sv:0,lv:0,ph:null,phS:0,lastPh:-1,rest:0};function n($){h.chord===0&&h.round++,h.set!==h.want&&!(h.want==="clear"&&h.set==="clear2")&&(h.set=h.want),h.chord===0&&(h.set==="clear"||h.set==="clear2")&&(h.set=h.round&1?"clear":"clear2");const ve=h.ch=x[h.set][h.chord],xe=h.bl;if(h.tone=F[h.set],h.bl=0,r(ve,$,xe?.07:1.3,xe?.45:1.6),Fe($,"chord "+h.set+":"+h.chord+(xe?" landed":"")),xe){h.bloom=xe;for(let De=0;De<5;De++)ee(ue[h.av++%5],$+.012+De*.052,_(ve.arp[De+1]),(.22+.25*xe)*(.75+.06*De),h.tone.ratio,h.tone.idx*1.3,h.tone.ring*1.6,(De-2)*.22);ee(Ae[h.sv++&3],$+.28,_(ve.lead[4]+12),.2+.25*xe,2,.3,.5,0),h.wantB===0&&(je(W.bas,.8,$,.02),v($,ve.b,.3+.25*xe,!0),l.gain.setTargetAtTime(0,$+1.6,.5),h.tail=2)}}function d($){h.nBar++,h.dwP++,h.dwB++;const ve=h.wantP<h.tierP&&h.dwP<2?h.tierP:h.wantP,xe=h.wantB<h.tierB&&h.dwB<2?h.tierB:h.wantB;if(ve!==h.tierP&&(h.dwP=0,Fe($,"pulse "+ve)),xe!==h.tierB&&(h.dwB=0,Fe($,"bass "+xe)),xe?h.tail=0:h.tail===2?h.tail=1:(h.tierB||h.tail)&&(l.gain.setTargetAtTime(0,$,.12),h.tail=0),h.tierP=ve,h.tierB=xe,je(W.arp,[0,.85,1,1][ve]*h.kind.a,$,ve?.2:.5),xe&&je(W.bas,[0,.8,1][xe],$,.25),je(W.kik,xe===2?1:0,$,.1),!(h.bar&1))if(nt()<[.2,.36,.32,.24][ve]*(h.rest>1?1.6:h.rest?1:.5)){let De=Math.floor(nt()*D.length);De===h.lastPh&&(De=(De+1)%D.length),De===3&&ve<2&&(De=0),h.lastPh=De,h.ph=D[De],h.phS=0,h.rest=0,Fe($,"lead "+De)}else h.ph=null,h.rest++}function M($){h.last=$,h.step===0&&(h.bar===0&&n($),d($));const ve=h.ch,xe=h.step,De=E[xe],Te=h.tierP,Me=h.tierB,rt=h.tone,wt=h.kind;if(Te&&(Te===1?h.abs%6===0:Te!==2||!(xe&1))){const Ze=Y[wt.z],ct=Ze[h.np++%Ze.length];let Mt=ve.arp[ct]+wt.o,ft=(Te===3&&xe&1?.55:1)*(.5+.5*De);Te===3&&De>.75&&nt()<.5?Mt+=12:Te>1&&nt()<.07&&(ft=0),ft&&ee(ue[h.av++%5],$,_(Mt),ft*.5,rt.ratio,rt.idx*(.6+.6*De),rt.ring*wt.d*(Te===1?1.6:1),(nt()-.5)*.7)}if(Me===1?xe===0&&v($,ve.b,.45,!0):Me===2&&(xe&1||v($,xe===14?ve.b+12:xe===10?ve.alt:ve.b,xe===0?1:xe===6||xe===12?.8:.5,!1),xe===0?te($,1.3):xe===6?te($,.7):xe===12&&te($,1)),h.carve>.1?h.abs%(h.carve>.85?2:h.carve>.5?3:4)===0&&ee(Ae[h.sv++&3],$,_(ve.lead[h.ns++%5]+12),.2+.4*h.carve,2,.3,.32,h.side*.6,.004):h.ns=0,h.night>.3&&nt()<.05*h.night&&ee(Ae[h.sv++&3],$,_(ve.lead[Math.floor(nt()*5)]+(nt()<.4?24:12)),.1+.08*nt(),3.5,.25,.9,nt()*1.6-.8,.004),h.ph){for(const Ze of h.ph)Ze[0]===h.phS&&ee(at[h.lv++&1],$,_(ve.lead[Ze[1]]),.3,1,.3,.38,h.lv&1?.18:-.18,.045,Ze[2]/$e*.7);h.phS++}h.abs++,++h.step===16&&(h.step=0,++h.bar===4&&(h.bar=0,h.chord=h.chord+1&3))}const g=($,ve)=>mt(.5*(ge(.8,1.6,$)+ge(1,5,ve))),R=.8;Ke.takeoff=function($,ve,xe){if(!h.on)return;h.fly=$,h.H=xe||0;const De=g(ve,h.H);De>0&&Fe($,"dip "+De.toFixed(2)),Ue(De,$)};function Ue($,ve){if(!($<=h.d)&&(h.d=$,$>R&&!h.full)){h.full=!0;for(let xe=0;xe<4;xe++)o[xe].frequency.setValueAtTime(_(h.ch.lead[xe<2?0:3]+12),ve);Fe(ve,"drop")}}return Ke.down=function($,ve,xe){const De=h.full;h.fly=0,h.d=0,h.H=0,h.full=!1,!(!h.on||!De)&&(h.bl=Math.max(.25,mt(xe/1.3)*(.55+.45*mt(ve/7))),h.step=0,h.bar=0,h.abs=0,h.chord=h.chord+1&3,h.pos=h.next=Math.ceil(h.pos),h.ph=null,Fe($,"land "+h.bl.toFixed(2)))},Ke.crash=function($){h.on&&(h.hush=$+.8,h.wantP=Math.min(h.wantP,1),h.wantB=0,h.tierP=Math.min(h.tierP,1),h.tierB=0,h.tail=0,je(W.arp,[0,.85][h.tierP]*h.kind.a,$,.1),l.gain.setTargetAtTime(0,$,.08),je(W.kik,0,$,.05),Fe($,"crash"))},Ke.update=function($,ve,xe,De){const Te=it(ve-h.t,0,e.look);h.t=ve;const Me=$.sun==null?.2:$.sun,rt=it($.ts||1,.05,1);if(h.night=ge(0,-.17,Me),h.want=Me<-.1?"nebula":Me<.03?"ember":Me<.12?"gold":"clear",$.run&&!h.on)h.on=!0,h.pos=h.next=h.abs=h.step=h.bar=h.chord=0,h.wantP=h.wantB=h.tierP=h.tierB=h.carve=h.bloom=h.hush=h.fly=h.tail=0,h.ph=null,h.set=h.want,h.sp=$.speed,W.out.v=NaN,Fe(ve,"start");else if(!$.run&&h.on){h.on=!1,h.d=0,h.full=!1,je(W.out,0,ve,.3);for(const et of st)et.g.setTargetAtTime(0,ve,.3);l.gain.setTargetAtTime(0,ve,.1),Fe(ve,"stop")}if(!h.on)return;const wt=h.kind=we[$.kind]||we.bowl;h.sp=Pt(h.sp,$.speed,1.5,Te);const Ze=Math.max(ge(24,32,h.sp),.8*ge(.46,.56,$.slope||0)*ge(12,20,h.sp));h.wantP=b(h.sp,h.wantP,be,ht),h.wantB=ve<h.hush?0:b(Ze,h.wantB,qe,se);const ct=mt(((xe||0)-.33)/.42);h.carve=Pt(h.carve,ct,ct>h.carve?9:1.1,Te),ct>.05&&(h.side=De||0),h.fly&&($.air?(h.H=Math.max(h.H,$.clear||0),Ue(g(Math.max($.airT,$.pred||0),h.H),ve)):ve-h.fly>.3&&Ke.down(ve,0,0));const Mt=Re(1,rt,ge(.15,.6,h.d)),ft=1200*Math.log2(Mt)*e.sag;if(Math.abs(ft-h.sag)>1.5||!ft&&h.sag){h.sag=ft;for(const et of Pe)et[0].setTargetAtTime(et[1]+ft,ve,.04)}const dt=ve<h.hush?.6:0,gt=Math.max(h.d,dt),bt=mt(h.sp/34),Xe=h.tone;if(je(W.duck,Re(1,.17,gt),ve,gt>0?.05:.035),je(W.lp,9e3*Math.pow(.04,gt)*Math.pow(Mt,.7),ve,gt>0?.07:.04),je(W.rvIn,Re(1,.1,h.d),ve,.05),je(W.held,h.full?.07:0,ve,h.full?.3:.12),h.bloom=Pt(h.bloom,0,1.3,Te),je(W.padLP,500*Math.pow(2,1.5*bt+Xe.b+wt.b+1.3*h.bloom+(Math.sin(ve*It/23)+Math.sin(ve*It/37))/6),ve,.3),je(W.arpLP,1900*Math.pow(2,.7*bt+.5*(Xe.b+wt.b)),ve,.3),je(W.pad,1-.08*Math.min(h.tierP,2)-.07*h.tierB+.25*h.bloom,ve,.5),je(W.eq,-2-7*mt((xe||0)*.85),ve,.08),je(W.rvG,.5*wt.r*(1+.3*h.night),ve,.8),je(W.dA,wt.r>1.1?.6:.5,ve,.8),je(W.out,e.level*(1-.15*h.night),ve,.8),!h.full){h.pos+=Te*Mt*$e;const et=h.pos+e.look*Mt*$e;let tt=0;for(;h.next<=et&&tt++<6;)M(Math.max(ve,ve+(h.next-h.pos)/(Mt*$e))),h.next++}},Ke.dbg=()=>[h.nBar,h.set+":"+h.chord,h.tierP,h.tierB,+h.d.toFixed(2),h.full?1:0,+h.carve.toFixed(2),+h.sp.toFixed(1)],Ke},e})(),zs=(()=>{const e={state:"load",segIdx:-1,hintT:0,hintKind:null,acc:0,shown:{spd:-1,drop:-1},tod:"auto",open:!1},s=l=>document.getElementById(l),w=l=>Fs.t(l),x=()=>Fs.en(),F={bowl:"OPEN BOWL",steeps:"THE STEEPS",glade:"GLADE",rollers:"ROLLERS",gully:"GULLY",kickers:"KICKERS",powder:"DEEP POWDER",ridge:"RIDGE",moguls:"MOGULS"},we=[["day","白天"],["golden","傍晚"],["sunset","日落"],["dusk","黄昏"],["night","夜晚"],["dawn","黎明"]],Y=l=>!!(window.matchMedia&&matchMedia(l).matches),E=()=>Y("(pointer: coarse) and (hover: none)")||!Y("(pointer: fine)")&&"ontouchstart"in window;let D=null,be=null,ht=-1e9;e.init=function(){D={app:s("app"),veil:s("veil"),shade:s("shade"),load:s("load"),fill:s("load-fill"),stage:s("load-stage"),title:s("title"),go:s("go"),how:s("how"),hud:s("hud"),seg:s("seg"),segEn:s("seg-en"),segCn:s("seg-cn"),hint:s("hint"),hintT:s("hint-t"),spd:s("spd"),tach:s("tach"),drop:s("drop"),snd:s("snd"),fs:s("fs"),bar:s("bar"),mn:s("mn"),menu:s("menu"),nav:s("menu").querySelector("nav"),pane:s("mpane"),mk:s("m-k"),mGo:s("m-go"),mTop:s("m-top"),oSnd:s("o-snd"),oFs:s("o-fs"),oLang:s("o-lang"),time:s("sw-time"),kinds:s("sw-seg"),ev:s("sw-ev"),view:s("sw-view"),seed:s("sw-seed"),more:s("more"),drop2:s("drop2"),vw:s("vw"),say:s("say"),sayK:s("say-k"),sayV:s("say-v"),cut:s("cut"),jump:s("jump"),tuck:s("tuck"),pause:s("pause"),pauseS:s("pause-s"),pauseT:s("pause-t"),steer:s("steer")},D.moreView=D.more.querySelector('[data-sec="view"]'),Fs.capture(D.app),Fs.on(He),e.layout(),D.go.addEventListener("click",u=>{u.stopPropagation(),e.go()}),D.app.addEventListener("click",u=>{e.state!=="title"||e.open||D.bar.contains(u.target)||D.menu.contains(u.target)||D.more.contains(u.target)||e.go()}),addEventListener("keydown",u=>{if(u.metaKey||u.ctrlKey||u.altKey||((/^Arrow/.test(u.code)||u.code==="Space")&&u.preventDefault(),u.repeat))return;const v=N=>u.target&&u.target.closest&&u.target.closest(N);if(e.gone){(u.code==="Enter"||u.code==="Space")&&(u.preventDefault(),location.reload());return}const P=(u.code==="Enter"||u.code==="Space")&&v("#menu button, #bar button, #more button");if(e.open&&u.code==="Escape"){u.preventDefault(),e.menu(!1);return}if(P){l(u.code);return}if(e.open&&(u.code==="Enter"||u.code==="Space")){u.preventDefault(),l(u.code),D.mGo.click();return}if((u.code==="Enter"||u.code==="Space")&&e.state==="title"&&!e.open)u.preventDefault(),l(u.code),e.go();else if(u.code==="KeyM")e.sound(!v0.on),e.open&&ce();else if(u.code==="KeyF")e.fullscreen();else if(e.state==="title"||e.state==="run"){const N=u.shiftKey?-1:1;u.code==="KeyT"?e.nextTime(N):u.code==="KeyN"?e.nextKind(N):u.code==="KeyG"?e.animal():u.code==="KeyP"?e.plane():u.code==="KeyR"?e.newMountain():u.code==="Escape"?e.menu(!0):u.code==="KeyH"?e.menu("keys"):u.code==="Backquote"&&e.menu("vers")}});function l(u){try{typeof y0<"u"&&y0.keys&&(y0.mute=u,y0.keys[u]=!1)}catch(v){}}D.snd.addEventListener("click",u=>{u.stopPropagation(),e.sound(!v0.on),u.detail&&D.snd.blur()}),D.fs.addEventListener("click",u=>{u.stopPropagation(),e.fullscreen()}),D.app.addEventListener("touchmove",u=>u.preventDefault(),{passive:!1}),document.addEventListener("gesturestart",u=>u.preventDefault()),document.addEventListener("contextmenu",u=>u.preventDefault()),document.addEventListener("visibilitychange",()=>{!document.hidden&&e.state==="run"&&e.keepAwake()}),addEventListener("orientationchange",()=>setTimeout(()=>{e.layout(),At.ready&&At.fit&&At.fit(),At.redraw&&At.redraw()},60)),y0.onFlip=()=>e.layout(),me(),X(),q()},e.layout=function(){if(!D)return;const l=V0.measure(),u=D.app.classList,v=E();u.toggle("rot",l.forced),u.toggle("flip",l.forced&&l.flip),u.toggle("wide",l.wide),u.toggle("short",l.short),u.toggle("desk",!v),u.toggle("hasfs",!v&&qe()),D.app.style.width=l.forced?l.w+"px":"",D.app.style.height=l.forced?l.h+"px":"",D.app.style.setProperty("--cw",l.w+"px"),D.app.style.setProperty("--ch",l.h+"px");let P=!!(self.COLD_SMOKE&&self.COLD_SMOKE.noTilt);try{P=P||window.self!==window.top}catch(N){P=!0}D.how.textContent=w(v?P?"按住屏幕左右拖动转弯 · 右下角 跳 / 加速":"倾斜手机或按住屏幕左右拖动转弯 · 右下角 跳 / 加速":"← → 或 A D 转弯 · 空格 跳 · ↓ 或 S 加速"),e.hh=v},e.stage=function(l,u){D&&(D.fill.style.transform="scaleX("+l.toFixed(3)+")",u&&(D.stage.textContent=w(u)))},e.ready=function(){D&&(e.state="title",D.load.classList.remove("on"),D.veil.classList.add("lift"),D.shade.classList.add("on"),D.title.classList.add("on"),D.snd.classList.add("on"),!e.hh&&qe()&&D.fs.classList.add("on"),D.bar.classList.add("on"),ce())},e.sound=function(l){v0.setOn(l),D.snd.classList.toggle("mute",!l),D.snd.setAttribute("aria-pressed",l?"true":"false"),e.open&&ce()},e.keepAwake=function(){try{navigator.wakeLock&&navigator.wakeLock.request("screen").then(l=>{be=l},()=>{})}catch(l){}};function qe(){return!1}e.fullscreen=function(l){};function se(){zt.start(),v0.kick()}e.go=async function(){if(e.state!=="title")return;e.state="starting",v0.unlock(),e.hh&&e.fullscreen(!0),e.open&&e.menu(!1),D.title.classList.remove("on");let l=!1;try{l=await Promise.race([y0.requestTilt(),new Promise(u=>setTimeout(()=>u(!1),8e3))])}catch(u){}y0.zeroPending=!0,e.keepAwake(),se(),e.state="run",e.t0=performance.now(),e.segIdx=-1,e.hintT=0,e.hintKind=null,e.tiltAsked=l,ke(),D.shade.classList.add("run"),D.hud.classList.add("on"),D.app.classList.add("run")};function _(l){e.hintKind=l,D.hint.className=l+" on",D.hintT.textContent=w(l==="tilt"?"像握方向盘一样倾斜手机":l==="drag"?"按住屏幕，左右拖动":l==="pace"?"连着转弯，把雪扬起来":l==="moves"?e.hh?"按住「跳」蓄力，松开起跳":"空格 跳（按住蓄力） · ↓ 加速":"← →  或  A D  转弯")}e.frame=function(l){if(!D||(e.state!=="load"&&S(l),e.state!=="run"))return;const u=zt.s,v=(performance.now()-e.t0)/1e3;!e.hintKind&&v>.7?_(y0.tiltLive()?"tilt":e.hh?"drag":"keys"):e.hintKind==="gap"||e.hintKind==="gap2"?(e.hintT+=l,e.hintT>1&&(_(e.hintKind==="gap"?"pace":"moves"),e.hintT=0)):e.hintKind==="pace"||e.hintKind==="moves"?(e.hintT+=l,e.hintT>5.5&&(D.hint.classList.remove("on"),e.hintKind=e.hintKind==="pace"?"gap2":"done",e.hintT=0)):e.hintKind&&e.hintKind!=="done"&&(e.hintKind!=="tilt"&&y0.tiltLive()&&!y0.used&&_("tilt"),y0.used&&(e.hintT+=l),y0.used&&e.hintT>1.2&&v>3.5?(D.hint.classList.remove("on"),e.hintKind="gap",e.hintT=0):v>22&&(D.hint.classList.remove("on"),e.hintKind="done"));const P=vt.segAt(-u.p[2]+2.5*Math.max(0,-u.v[2]));if(P.idx<e.segIdx-1&&(e.segIdx=-1),P.idx>e.segIdx&&v>1.6&&!ae()&&(e.segIdx=P.idx,nt(P),ne(D.app.classList.contains("short")&&!D.app.classList.contains("desk")?2.5:3.6)),$e(l),e.acc+=l,e.acc<.1)return;e.acc=0;const N=Math.round(Math.hypot(u.v[0],u.v[1],u.v[2])*3.6),de=Math.max(0,Math.round(zt.drop)),te=typeof zt.flow=="number"?mt(zt.flow):Math.min(1,N/130);N!==e.shown.spd&&(e.shown.spd=N,D.spd.textContent=N),te!==e.shown.bar&&(e.shown.bar=te,D.tach.style.transform="scaleX("+te.toFixed(3)+")"),de!==e.shown.drop&&(e.shown.drop=de,D.drop.textContent=de.toLocaleString("en-US"),D.drop2.textContent="· "+w("落差")+" "+de.toLocaleString("en-US")+" M")};const b=e.sp={cur:null,p:[0,0,0],seed:0,air:!1,to:null,best:{},run:null,res:null,segT:-1,day:null,dayQ:null,days:1,clock:null,nat:0},re=.75,m=()=>({t:0,dist:0,drop:0,v:0,air:0}),J=(l,u)=>u?l.toFixed(u):Math.round(l).toLocaleString("en-US"),ae=()=>!!b.day&&b.day.t<5;function X(){D.split=s("split"),D.day=s("day"),D.dayK=s("day-k"),D.dayT=s("day-t"),D.dayF=s("day-f"),b.run=m(),At.onTick.push(Be)}function ke(){Object.assign(b,{run:m(),cur:null,res:null,segT:-1,day:null,dayQ:null,days:1,clock:null}),D.day.classList.remove("on","held"),D.seg.classList.remove("res"),D.app.classList.remove("res","daycard")}function C(){b.cur=null,b.res=null,D.seg.classList.remove("res"),D.app.classList.remove("res")}function ne(l){b.segT<=0&&(D.seg.classList.remove("res"),D.app.classList.remove("res")),D.seg.classList.add("on"),b.segT=Math.max(b.segT,l)}function Be(l){if(!(l>0)||zt.mode==="hold")return;const u=zt.s,v=u.p,P=zt.mode==="run";{const i=Nt.clock,y=Nt.cycle||600;if(!(P&&Nt.rate!==0&&e.tod==="auto"&&!Je)||b.clock==null||i<b.clock||i-b.clock>2)b.nat=i;else for(const W of[!1,!0]){const h=W?Nt.times.sunrise:Nt.times.sunset,n=h+y*Math.floor((i-h)/y);n>b.clock&&n>=b.nat+1&&(W&&b.days++,b.run.t>=20&&(b.dayQ={rise:W,day:b.days,w:0}))}b.clock=i}if(!P){b.cur=null;return}if(!b.cur||b.seed!==vt.seed||Math.hypot(v[0]-b.p[0],v[1]-b.p[1],v[2]-b.p[2])>6){Ee();return}const N=b.run,de=b.cur,te=Math.hypot(u.v[0],u.v[1],u.v[2]);if(N.t+=l,N.dist+=b.p[2]-v[2],N.drop+=b.p[1]-v[1],te>N.v&&(N.v=te),u.air&&!b.air)b.to=v.slice();else if(!u.air&&b.air&&b.to){const i=Math.hypot(v[0]-b.to[0],v[1]-b.to[1],v[2]-b.to[2]);(u.airT||0)>=re&&(i>de.air&&(de.air=i),i>N.air&&(N.air=i)),b.to=null}b.air=!!u.air,b.p[0]=v[0],b.p[1]=v[1],b.p[2]=v[2];const o=vt.segAt(-v[2]);o.idx>de.idx&&(o.idx===de.idx+1&&de.whole&&de.t>3&&je(de),b.cur={idx:o.idx,type:o.type,whole:o.idx===de.idx+1,t:0,v:0,air:0});const p=b.cur;p.t+=l,te>p.v&&(p.v=te)}function Ee(){const l=zt.s,u=-l.p[2],v=vt.segAt(u);b.cur={idx:v.idx,type:v.type,whole:u-v.s0<80,t:0,v:0,air:0},b.p=l.p.slice(),b.seed=vt.seed,b.air=!!l.air,b.to=null}function je(l){const u=b.best[l.type]||(b.best[l.type]={v:0,air:0}),v=Math.round(l.v*3.6),P=Math.round(l.air);b.res={type:l.type,t:l.t,kv:v,ka:P,upV:u.v>0&&v>Math.round(u.v*3.6),upA:P>0&&u.air>0&&P>Math.round(u.air)},l.v>u.v&&(u.v=l.v),l.air>u.air&&(u.air=l.air)}function $e(l){if(b.res&&!ae()){const u=b.res,v=vt.segAt(-zt.s.p[2]);b.res=null,v.idx>e.segIdx&&(e.segIdx=v.idx,nt(v)),Ke(u),ne(3.2),D.seg.classList.add("res"),D.app.classList.add("res")}if(b.segT>-1){const u=b.segT;b.segT-=l,u>0&&b.segT<=0&&D.seg.classList.remove("on"),b.segT<=-1&&(D.seg.classList.remove("res"),D.app.classList.remove("res"))}b.dayQ&&!b.day&&(b.dayQ.w+=l,(b.segT<=-1||b.dayQ.w>8)&&(Fe(b.dayQ),b.dayQ=null)),b.day&&Ge(l)}function nt(l){const u=(l.idx+1<10?"0":"")+(l.idx+1);D.segCn.textContent=w(_s[l.type]||""),D.segEn.textContent=x()?u:u+" · "+(F[l.type]||"")}function Ke(l){const u=document.createElement("span"),v=(N,de,te)=>{const o=document.createElement(N);return de&&(o.className=de),te&&(o.textContent=te),u.appendChild(o),o},P=(N,de,te)=>{v("i","d","·"),N&&v("em","k",N),u.appendChild(document.createTextNode(de)),te&&v("u",null,te)};v("em","k",w(_s[l.type]||"")),l.t<60?P("",l.t.toFixed(1),"s"):P("",Math.floor(l.t/60)+":"+(l.t%60).toFixed(1).padStart(4,"0"),""),P("",String(l.kv),"km/h"),l.upV&&v("i","up"),l.ka>0&&(P(w("飞行 "),String(l.ka),"m"),l.upA&&v("i","up")),D.split.textContent="",D.split.appendChild(u)}function Fe(l){const u=b.run,v=[[Math.max(0,u.drop),0,"落差 M"],u.dist<1e3?[Math.max(0,u.dist),0,"距离 M"]:[u.dist/1e3,1,"距离 KM"],[u.v*3.6,0,"极速 KM/H"]];u.air>0&&v.push([u.air,0,"飞行 M"]),D.dayK.textContent="DAY "+l.day+(x()?"":" · "+(l.rise?"SUNRISE":"SUNSET")),D.dayT.textContent=w(l.rise?"日出":"日落"),D.dayF.textContent="";const P=b.day={t:0,f:[]};for(const[de,te,o]of v){const p=document.createElement("div"),i=document.createElement("b"),y=document.createElement("span");i.textContent=J(de,te),y.textContent=w(o),p.appendChild(i),p.appendChild(y),D.dayF.appendChild(p),P.f.push({el:i,v:de,dp:te,k:-1})}for(const de of P.f)de.el.style.minWidth=de.el.offsetWidth+"px";for(const de of P.f)de.el.textContent=J(0,de.dp);let N=!1;if(e.hh)try{const de=qt.G,te=u0.sunScr;N=de[te+2]>0&&de[te]<.5}catch(de){}D.day.classList.toggle("r",N),D.day.classList.remove("on","held"),D.day.offsetWidth,D.day.classList.add("on"),D.app.classList.add("daycard")}function Ge(l){const u=b.day;u.t+=l;for(let v=0;v<u.f.length;v++){const P=u.f[v],N=mt((u.t-.95-.12*v)/.85);N!==P.k&&(P.k=N,P.el.textContent=J(P.v*(1-Math.pow(1-N,3)),P.dp))}u.t>=5&&D.day.classList.contains("on")&&(D.day.classList.remove("on"),D.app.classList.remove("daycard")),u.t>=6.4&&(b.day=null)}let Je=null,le=null,Pe=null,pe=0,c=0,Ie=0,he=0,H=null,z=null,V="sky";const I=[],Q={id:null,y:0,on:!1,over:!1,neg:!1},L=()=>e.state==="title"||e.state==="run",ye=()=>{try{return typeof cs<"u"&&cs&&cs.spawn?cs:null}catch(l){return null}},Ve=(l,u,v)=>{const P=document.createElement("button");return P.type="button",P.textContent=l,P.dataset[u]=v,P},Ne={chase:'<circle cx="15" cy="6.5" r="2.4"/><path d="M15 9v6.5M11 19h8"/>',fp:'<path d="M3 11c4-6 20-6 24 0-4 6-20 6-24 0z"/><circle cx="15" cy="11" r="3"/>',tips:'<path d="M9 21l3-17M21 21l-3-17"/>',low:'<path d="M2 18h26"/><circle cx="18" cy="9" r="2"/><path d="M18 11v5M5 16l4-2"/>',high:'<path d="M15 2v6M12 5l3 3 3-3"/><circle cx="15" cy="15" r="2.4"/><path d="M8 20h14"/>',left:'<path d="M3 11h6M6 8l3 3-3 3"/><circle cx="19" cy="7" r="2.2"/><path d="M19 9v7M15 19h8"/>',right:'<path d="M27 11h-6M24 8l-3 3 3 3"/><circle cx="11" cy="7" r="2.2"/><path d="M11 9v7M7 19h8"/>',front:'<circle cx="15" cy="7" r="2.6"/><path d="M15 10v6M10 12l5-2 5 2M11 19h8"/>',far:'<circle cx="15" cy="11" r="7"/><path d="M15 2v4M15 16v4M6 11h4M20 11h4"/>'},Ce='<path d="M23 8.5A8.5 8.5 0 1 0 24.5 14"/><path d="M23.5 3.5V9H18"/>',Ye={auto:Ce+'<circle cx="15" cy="12" r="2.2"/>',day:'<path d="M3 20h24"/><circle cx="15" cy="9" r="3.4"/><path d="M15 2.5v1.6M15 14v1.6M8.5 9h1.6M19.9 9h1.6M10.4 4.4l1.1 1.1M18.5 12.5l1.1 1.1M10.4 13.6l1.1-1.1M18.5 5.5l1.1-1.1"/>',golden:'<path d="M3 20h24"/><circle cx="15" cy="14" r="3.4"/><path d="M8 14h1.6M20.4 14h1.6M10.4 9.4l1.1 1.1M18.5 10.5l1.1-1.1M15 7.5v1.6"/>',sunset:'<path d="M3 20h24"/><path d="M9.5 20a5.5 5.5 0 0 1 11 0"/><path d="M15 10.5v2M8.2 13.2l1.4 1.4M21.8 13.2l-1.4 1.4"/>',dusk:'<path d="M3 16h24"/><path d="M7 20h16" stroke-dasharray="1.5 2.5"/><path d="M21.5 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',night:'<path d="M17.5 3.8a8 8 0 1 0 6.6 12.4A6.6 6.6 0 0 1 17.5 3.8z"/><path d="M6.5 5.5l.5 1.1 1.1.5-1.1.5-.5 1.1-.5-1.1-1.1-.5 1.1-.5z"/>',dawn:'<path d="M3 20h24"/><path d="M10 20a5 5 0 0 1 10 0"/><path d="M15 6v6M12.5 8.5L15 6l2.5 2.5"/>'},T={auto:Ce+'<path d="M15 9v6M12.4 10.5l5.2 3M12.4 13.5l5.2-3"/>',light:'<path d="M9 7v5M6.8 8.2l4.4 2.6M6.8 10.8l4.4-2.6M21 10v5M18.8 11.2l4.4 2.6M18.8 13.8l4.4-2.6M15 16v4M13.3 17l3.4 2M13.3 19l3.4-2"/>',heavy:'<path d="M3 6h9M5 10h6"/><path d="M17 3.5v4M15.3 4.5l3.4 2M15.3 6.5l3.4-2M24 8v4M22.3 9l3.4 2M22.3 11l3.4-2M12 13v4M10.3 14l3.4 2M10.3 16l3.4-2M20 16v4M18.3 17l3.4 2M18.3 19l3.4-2M6 17v3M4.7 17.8l2.6 1.4M4.7 19.2l2.6-1.4"/>'},Se=(l,u,v,P)=>{const N=Ve("",l,u);N.innerHTML='<svg viewBox="0 0 30 22" aria-hidden="true">'+v+"</svg>";const de=document.createElement("span");return de.textContent=P,N.appendChild(de),N};function me(){D.time.appendChild(Se("time","auto",Ye.auto,w("自动")));for(const[l,u]of we)D.time.appendChild(Se("time",l,Ye[l]||Ye.day,w(u)));for(const l of Object.keys(js))D.kinds.appendChild(Ve(w(_s[l]||l),"seg",l));D.mn.addEventListener("click",l=>{l.stopPropagation(),e.menu(),l.detail&&D.mn.blur()}),D.more.addEventListener("click",l=>{l.stopPropagation();const u=l.target.closest("button");u&&e.menu(u.dataset.sec)}),D.menu.addEventListener("click",l=>{l.stopPropagation();const u=l.target.closest("button");if(!u)return;const v=u.dataset;if(u===D.mGo){e.state==="title"?e.go():e.menu(!1);return}if(u===D.mTop){e.toTop();return}if(v.sec&&u.parentNode===D.nav){U(v.sec);return}if(v.time)e.setTime(v.time);else if(v.seg)e.gotoKind(v.seg);else if(v.view)e.setView(v.view);else if(v.new)e.newMountain();else if("animal"in v)e.animal(v.animal),e.menu(!1);else if(v.plane)e.plane(),e.menu(!1);else if(u===D.oSnd)e.sound(!v0.on);else if(u===D.oFs)e.fullscreen();else if(u===D.oLang)Fs.set(x()?"zh":"en");else if(v.vn){const P=r();if(P)try{P.set(v.vn,v.vid)}catch(N){console.warn(N)}ce()}else if(v.vreset){const P=r();if(P&&P.reset)try{P.reset()}catch(N){console.warn(N)}ce()}else v.wx&&e.setWeather(v.wx);l.detail&&u.blur()}),D.pane.addEventListener("touchmove",l=>l.stopPropagation(),{passive:!0}),D.nav.addEventListener("touchmove",l=>l.stopPropagation(),{passive:!0}),s("view").addEventListener("pointerdown",l=>{Q.id=l.pointerId,Q.y=V0.y(l)}),B(D.jump,"jump"),B(D.tuck,"tuck"),D.vw.addEventListener("pointerdown",l=>{l.preventDefault(),l.stopPropagation()}),D.vw.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),e.nextView(1)}),D.pause.addEventListener("click",l=>{l.stopPropagation(),e.gone&&location.reload()}),addEventListener("blur",()=>{_e(),performance.now()-ht>1200&&e.pause()}),document.addEventListener("visibilitychange",()=>{document.hidden?(_e(),e.pause(),z&&(At.paused=!0)):At.paused&&!e.gone&&(At.paused=!1)}),addEventListener("hashchange",()=>{const l=/^#seed-(\d{1,9})$/.exec(location.hash);l&&+l[1]!==vt.seed&&e.newMountain(+l[1])}),At.onMountain&&At.onMountain.push(Ae)}function B(l,u){const v={id:null,seen:!0,drop:!1,set(N){y0.btn[u]=N,l.classList.toggle("down",N)}};l.addEventListener("pointerdown",N=>{if(N.preventDefault(),N.stopPropagation(),v.id==null){v.id=N.pointerId,v.seen=!1,v.drop=!1;try{l.setPointerCapture(N.pointerId)}catch(de){}v.set(!0)}});const P=N=>{N.pointerId===v.id&&(v.id=null,v.seen?v.set(!1):v.drop=!0)};l.addEventListener("pointerup",P),l.addEventListener("pointercancel",P),l.addEventListener("lostpointercapture",P);for(const N of["click","touchstart","touchend"])l.addEventListener(N,de=>{de.cancelable&&de.preventDefault(),de.stopPropagation()},{passive:!1});I.push(v)}function U(l){D.pane.querySelector('section[data-sec="'+l+'"]')||(l="sky"),V=l;for(const u of D.nav.querySelectorAll("button[data-sec]"))u.classList.toggle("on",u.dataset.sec===l);for(const u of D.pane.children)u.classList.toggle("on",u.dataset.sec===l);D.pane.scrollTop=0,ce()}e.menu=function(l){if(!D||e.gone||(typeof l=="string"&&(e.open&&V===l?l=!1:(U(l),l=!0)),l==null&&(l=!e.open),l===e.open)||l&&!L())return;l&&e.state==="run"&&ot(),e.open=l,l&&(D.pane.querySelector("section.on")||U(V),ce(),D.say.classList.remove("on"),c=0);const u=e.state==="run";D.mk.textContent=w(u?"PAUSED · 暂停":"MENU · 菜单"),D.mGo.textContent=w(u?"继续滑":"出发"),D.mTop.hidden=!u,D.menu.classList.toggle("on",l),D.menu.setAttribute("aria-hidden",l?"false":"true"),D.mn.setAttribute("aria-expanded",l?"true":"false"),D.app.classList.toggle("menuopen",l),e.state==="title"&&D.title.classList.toggle("on",!l);try{!l&&D.menu.contains(document.activeElement)&&document.activeElement.blur()}catch(v){}!l&&z&&t()},e.openSwitch=function(l){l===!1||l==null&&e.open?e.menu(!1):e.menu(!0)};function A(l,u){!D||e.open||(D.sayK.textContent=x()?Fs.EN["say:"+l]||w(l):l,D.sayV.textContent=w(u||""),D.say.classList.add("on"),c=2.4)}function a(l){l&&(l.classList.add("hit"),clearTimeout(l._t),l._t=setTimeout(()=>l.classList.remove("hit"),1500))}function oe(){const l=Nt.cycle,u=(Nt.clock%l+l)%l;let v=we[0][0],P=1e9;for(const[N]of we){let de=Math.abs(u-Nt.times[N]);de=Math.min(de,l-de),de<P&&(P=de,v=N)}return v}const fe=()=>zt.views&&zt.views.length&&zt.setView?zt.views:null,O=()=>{const l=fe();if(!l)return"";const u=l.find(v=>v.id===zt.view)||l[0];return u.name||String(u.id)};let ie=null;function ce(){if(!D)return;const l=e.tod==="auto"?oe():null,u=vt.segAt(-zt.s.p[2]).type;for(const y of D.time.children)y.classList.toggle("on",y.dataset.time===e.tod),y.classList.toggle("now",y.dataset.time===l);for(const y of D.kinds.children)y.classList.toggle("on",y.dataset.seg===u);const v=ye(),P=v&&v.kinds&&v.kinds.length?v.kinds:[{id:"",name:"鹿"}],N=P.map(y=>y.id+":"+y.name).join();if(N!==H){H=N,D.ev.textContent="";for(const j of P)D.ev.appendChild(Ve(w(j.name),"animal",j.id));const y=document.createElement("i");y.className="sep",D.ev.appendChild(y),D.ev.appendChild(Ve(w("航班"),"plane","1"))}const de=fe(),te=de?de.map(y=>y.id).join():"";if(te!==ie){ie=te,D.view.textContent="";for(const y of de||[]){const j=Ve("","view",y.id);j.innerHTML='<svg viewBox="0 0 30 22" aria-hidden="true">'+(Ne[y.id]||Ne.chase)+"</svg>";const W=document.createElement("span");W.textContent=w(y.name||y.id),j.appendChild(W),D.view.appendChild(j)}D.vw.hidden=!de,D.nav.querySelector('[data-sec="view"]').hidden=!de,D.moreView.hidden=!de}for(const y of D.view.children)y.classList.toggle("on",y.dataset.view===zt.view);const o=typeof At.newMountain=="function";if(D.nav.querySelector('[data-sec="mt"]').hidden=!o,o){const y="#"+vt.seed;D.seed.textContent!==y&&(D.seed.textContent=y)}D.oSnd.textContent=w(v0.on?"声音 开":"声音 关"),D.oSnd.classList.toggle("on",!!v0.on),D.oSnd.setAttribute("aria-pressed",v0.on?"true":"false");const p=!e.hh&&qe(),i=!!document.fullscreenElement;D.oFs.hidden=!p,D.oFs.classList.toggle("on",i),D.oFs.textContent=w(i?"退出全屏":"全屏"),D.oLang&&(D.oLang.textContent=x()?"中文":"English"),k()}function He(){for(const u of D.time.children)u.lastChild.textContent=w(u.dataset.time==="auto"?"自动":(we.find(v=>v[0]===u.dataset.time)||[,u.dataset.time])[1]);for(const u of D.kinds.children)u.textContent=w(_s[u.dataset.seg]||u.dataset.seg);H=ie=st=Le=null,e.layout();const l=e.state==="run";if(D.mk.textContent=w(l?"PAUSED · 暂停":"MENU · 菜单"),D.mGo.textContent=w(l?"继续滑":"出发"),e.hintKind&&D.hint.classList.contains("on")&&!/gap|done/.test(e.hintKind)&&_(e.hintKind),e.state==="run"&&e.segIdx>=0)try{const u=vt.segs[e.segIdx];u&&nt({idx:e.segIdx,type:u.type})}catch(u){}ce()}e.setTime=function(l){if(l==="auto")e.tod="auto",Je=null,Nt.rate=1;else{const u=Nt.times[l];if(u==null)return;const v=Nt.cycle;let P=((u-Nt.clock)%v+v)%v;P>v/2&&(P-=v),e.tod=l,Nt.rate=0,Je={from:Nt.clock,d:P,t:0,dur:it(.8+Math.abs(P)/140,.9,2.4)}}ce(),A("时间",l==="auto"?"自动":(we.find(u=>u[0]===l)||[])[1])},e.nextTime=function(l){const u=we.findIndex(v=>v[0]===(e.tod==="auto"?oe():e.tod));e.setTime(we[(u+(l||1)+we.length)%we.length][0])};const We=()=>{try{return typeof M0<"u"&&M0&&Array.isArray(M0.levels)&&M0.levels.length&&typeof M0.set=="function"?M0:null}catch(l){return null}};e.setWeather=function(l){const u=We();if(!u||!L())return;if(l==="auto"){u.setAuto&&u.setAuto(!0),ce(),A("天气","自动");return}const v=u.levels.find(P=>P[0]===l);if(v){try{u.set(l)}catch(P){console.warn(P)}ce(),A("天气",v[1])}},e.nextWeather=function(l){const u=We();if(!u)return;const v=u.levels,P=Math.max(0,v.findIndex(N=>N[0]===u.level));e.setWeather(v[(P+(l||1)+v.length)%v.length][0])};const Qe=[["镜头",["cam","wood","shots","tips","fptuck","edge","chatter","buffet"]],["人物与动作",["body","cloth","poles","motion"]],["画面",["ghost","hi","nspray","nsky","cu"]],["雪",["spray","curtain","sparkle","clumps","lens","pdepth","drift"]],["场景与天气",["rock","moon","snow","rtree","flag","sink","wind"]],["手感",["keys"]]];let st=null,Le=null;const r=()=>{try{return typeof Dt<"u"&&Dt&&Array.isArray(Dt.defs)?Dt:null}catch(l){return null}};function q(){D.vrows=s("sw-vrows"),D.vreset=s("sw-vreset"),D.wx=s("sw-wx"),D.wxc=s("sw-wxc");const l=r();l&&l.on&&l.on(()=>{e.open&&ce()}),addEventListener("keydown",u=>{u.code!=="KeyX"||u.repeat||u.metaKey||u.ctrlKey||u.altKey||e.gone||!L()||e.nextWeather(u.shiftKey?-1:1)})}function k(){const l=r(),u=l?l.defs:[],v=u.map(o=>[o.name,o.label,o.def].concat(o.opts.map(p=>p[0]+":"+p[1])).join("|")).join(";");if(v!==st){st=v,D.vrows.textContent="";const o=new Set(Qe.flatMap(i=>i[1])),p=Qe.map(([i,y])=>[i,y.map(j=>u.find(W=>W.name===j)).filter(Boolean)]);p.push(["新加的",u.filter(i=>!o.has(i.name))]);for(const[i,y]of p){if(!y.length)continue;const j=document.createElement("div"),W=document.createElement("i");j.className="vgrp",W.textContent=w(i),j.appendChild(W);for(const h of y){const n=document.createElement("div"),d=document.createElement("span");n.className="vrow",d.textContent=w(h.label),n.appendChild(d);for(const[M,g]of h.opts){const R=Ve(w(g),"vn",h.name);R.dataset.vid=M,M===h.def&&(R.classList.add("rec"),R.title=w("推荐")),n.appendChild(R)}j.appendChild(n)}D.vrows.appendChild(j)}D.nav.querySelector('[data-sec="vers"]').hidden=!u.length}let P=!0;for(const o of D.vrows.querySelectorAll("button")){const p=!!l&&l.val[o.dataset.vn]===o.dataset.vid;o.classList.toggle("on",p),p&&!o.classList.contains("rec")&&(P=!1)}D.vreset.classList.toggle("idle",P);const N=We(),de=N?N.levels:[],te=de.map(o=>o[0]+":"+o[1]).join();if(te!==Le){Le=te,D.wxc.textContent="",N&&N.setAuto&&D.wxc.appendChild(Se("wx","auto",T.auto,w("自动")));for(const[o,p]of de)D.wxc.appendChild(Se("wx",o,T[o]||T.light,w(p)));D.wx.hidden=!N}if(N)for(const o of D.wxc.children)o.classList.toggle("on",N.auto?o.dataset.wx==="auto":o.dataset.wx===N.level)}function ee(l){return le||!D?!1:(le={t:0,stage:0,n:0,fn:l},!0)}function Z(){try{F0.reset&&F0.reset(),Jt.clear&&Jt.clear()}catch(l){}try{const l=ye();l&&l.reset?l.reset():z0.herd&&(z0.herd.length=0)}catch(l){}At.strides=null,At.lookYaw=null,e.segIdx=-1,z&&(z.moved=!0),C()}function K(l){let u=vt.segAt(-zt.s.p[2]).idx+1;for(let v=0;v<48;v++,u++){if(u>=vt.segs.length){const P=vt.segs[vt.segs.length-1];if(vt.segAt(P.s0+P.len+1),u>=vt.segs.length)return null}if(vt.segs[u].type===l)return vt.segs[u]}return null}function ue(l){let u=l.s0+30,v=null;if(l.type==="kickers")try{let P=null;for(let N=Math.floor(l.s0/32);N<=Math.floor((l.s0+l.len)/32);N++)for(const de of vt.feats.get(N)||[])de.mark&&de.s>=l.s0+40&&(!P||de.s<P.s)&&(P=de);P&&(u=Math.max(l.s0+30,P.s-40),v=vt.at(P.s+P.len*.94,{}).cx+P.u)}catch(P){}return{s:u,x:v}}e.gotoKind=function(l){if(!L()||!js[l])return!1;const u=K(l);return!u||!ee(()=>{const v=zt.mode==="run",P=ue(u);if(zt.reset(P.s),P.x!=null){const N=zt.s,de=N.p[2],te=vt.height(P.x,de,.5),o=vt.normal(P.x,de,.35);N.p[0]=P.x,N.p[1]=N.h=zt.y0=te,N.n[0]=o[0],N.n[1]=o[1],N.n[2]=o[2]}Z(),v&&se()})?!1:(e.state==="title"&&A("路段",_s[l]),!0)},e.nextKind=function(l){const u=Object.keys(js),v=u.indexOf(vt.segAt(-zt.s.p[2]).type);return e.gotoKind(u[(v+(l||1)+u.length)%u.length])};function G(l){if(l==null)return;const u="#seed-"+l;try{location.hash!==u&&history.replaceState(null,"",u)}catch(v){try{location.hash=u}catch(P){}}}e.newMountain=function(l){if(!L()||typeof At.newMountain!="function"||le||At.swapping)return!1;try{At.newMountain(l)}catch(u){return console.warn(u),!1}return!0};function Ae(l){Z(),G(l),A("山","#"+l),e.open&&ce()}e.animal=function(l){if(!L())return;let u="鹿",v=null;try{const P=ye();if(P){const N=P.kinds||[];let de=l?N.findIndex(o=>String(o.id)===String(l)):-1;de<0&&N.length&&(de=he%N.length);const te=de>=0?N[de]:null;te&&(he=de+1),P.spawn(te?te.id:void 0),u=te?te.name:"动物",v=te?D.ev.querySelector('[data-animal="'+te.id+'"]'):null}else z0.ready&&z0.enabled!==!1&&!z0.herd.length&&z0.spawn(),v=D.ev.querySelector("[data-animal]")}catch(P){console.warn(P)}a(v),A("偶遇",u)},e.plane=function(){if(!L())return;const l=Nt.plane;if(!l)return;let u="航班 · 还在天上";!l.on&&Nt.planes!==!1&&(u="航班 · 看"+(l.n%2?"右":"左")+"上方",l.next=0),a(D.ev.querySelector("[data-plane]")),A("偶遇",u)},e.setView=function(l){if(!(!L()||!zt.setView)){try{zt.setView(l)}catch(u){console.warn(u)}ce()}},e.nextView=function(l){if(!(!L()||!zt.nextView)){try{zt.nextView(l||1)}catch(u){console.warn(u)}ce(),A("视角",O())}};function _e(){for(const l of I)l.id=null,l.drop=!1,l.seen=!0,l.set(!1)}function at(l,u){try{v0.rig&&v0.unlocked&&v0.ctx&&v0.rig.fade(l,v0.ctx.currentTime,u)}catch(v){}}function ot(){z||e.state!=="run"||(z={moved:!1},e.paused=!0,pe=performance.now(),Pe=null,At.resumeK=1,zt.mode==="run"&&(zt.mode="hold"),_e(),y0.drag=null,y0.keys={},Q.on=!1,D.steer.classList.remove("on"),at(0,.05),D.day.classList.add("held"))}function t(){if(!z)return;const l=z.moved;z=null,e.paused=!1,At.paused=!1,e.t0+=performance.now()-pe,At.swapping?At.swapping.run=!0:l||zt.mode==="title"?se():zt.mode==="hold"&&(zt.mode="run"),At.resumeK=.3,Pe={t:0},y0.zeroPending=!0,y0.drag=null,y0.keys={},D.day.classList.remove("held"),at(v0.on?v0.level:0,.12),e.keepAwake()}e.pause=function(){return!D||e.state!=="run"||e.gone?!1:(e.open||e.menu(!0),!0)},e.resume=function(){return!D||!e.open||e.gone?!1:(e.menu(!1),!0)},e.toTop=function(){return!D||e.state!=="run"||e.gone?!1:(e.state="leaving",z=null,e.paused=!1,e.open=!1,D.menu.classList.remove("on"),D.menu.setAttribute("aria-hidden","true"),D.app.classList.remove("menuopen"),D.mn.setAttribute("aria-expanded","false"),D.cut.classList.add("slow"),D.cut.style.opacity=1,le={t:0,stage:9,n:0,fn:null},setTimeout(()=>{D.cut.classList.remove("slow"),At.swapping&&(At.swapping.run=!1);try{zt.reset(),zt.mode="title"}catch(l){console.warn(l)}Z(),y0.drag=null,y0.keys={},e.state="title",Pe=null,At.resumeK=1,At.paused=!1,D.app.classList.remove("run"),D.hud.classList.remove("on"),D.shade.classList.remove("run"),D.hint.classList.remove("on"),D.seg.classList.remove("on"),D.title.classList.add("on"),e.hintKind=null,D.day.classList.remove("held"),le={t:0,stage:1,n:0,fn:null},at(v0.on?v0.level:0,.4),ce()},300),!0)},e.lost=function(){!D||e.gone||(z=null,e.open&&e.menu(!1),e.gone=!0,e.paused=!1,_e(),at(0,.05),D.pause.classList.add("lost","on"),D.pause.setAttribute("aria-hidden","false"),D.pauseS.textContent=w("画面断开了"),D.pauseT.textContent=w("点一下重新上山"))};function S(l){if(Je&&(Je.t+=l,Nt.setClock(Je.from+Je.d*fs(0,1,Je.t/Je.dur)),Je.t>=Je.dur&&(Je=null)),le)if(le.t+=l,le.stage===0){const u=mt(le.t/.16);if(D.cut.style.opacity=u,u>=1){le.stage=1;try{le.fn()}catch(v){console.warn(v)}ce()}}else if(le.stage===1)++le.n>=2&&(le.stage=2,le.t=0);else{const u=mt(le.t/.45);D.cut.style.opacity=1-ge(0,1,u),u>=1&&(D.cut.style.opacity="",le=null)}if(Pe){Pe.t+=l;const u=mt(Pe.t/.8);At.resumeK=.3+.7*ge(0,1,u),u>=1&&(At.resumeK=1,Pe=null)}c>0&&(c-=l)<=0&&D.say.classList.remove("on");for(const u of I)u.drop?(u.drop=!1,u.set(!1)):u.seen=!0;{const u=e.state==="run"&&!z?y0.drag:null;if(u&&Q.id===u.id){const v=Math.min(V0.w||innerWidth,(V0.h||innerHeight)*1.4,900)*.2,P=v*.72,N=it(u.x-u.x0,-v,v),de=Math.abs(N)>P,te=N<0;Q.on||(Q.on=!0,D.steer.style.transform="translate("+u.x0.toFixed(1)+"px, "+Q.y.toFixed(1)+"px)",D.steer.style.setProperty("--c",P.toFixed(1)+"px"),D.steer.classList.add("on")),D.steer.firstElementChild.style.transform="scaleX("+N.toFixed(1)+")",de!==Q.over&&(Q.over=de,D.steer.classList.toggle("over",de)),te!==Q.neg&&(Q.neg=te,D.steer.classList.toggle("neg",te))}else Q.on&&(Q.on=!1,D.steer.classList.remove("on"))}{const u=y0.btn.jump?mt(zt.s.charge||0):0;u!==(e.shown.k||0)&&(e.shown.k=u,D.jump.style.setProperty("--k",u.toFixed(3)))}Ie+=l,e.open&&Ie>.25&&(Ie=0,ce())}return e})(),qt=(()=>{const e={W:0,H:0,scale:1,origin:[0,0,0],frame:0,time:0,dt:.016666666666666666,shadowRes:2048,shadowRange:62,motionBlur:!0,stats:{}};let s,w,x,F,we,Y,E,D;const be=new Float32Array(Ps);e.G=be,e.cam={pos:[0,2,0],fwd:[0,0,-1],up:[0,1,0],right:[1,0,0],fovY:1,near:ua,far:Ns,roll:0};let ht=null,qe=[0,0,0];e.init=function(_,b){s=_,w=b,e.gfx=_,E=s.texture({w:e.shadowRes,h:e.shadowRes,format:"depth",filter:"linear",compare:!0}),D=s.target({depth:E}),e.shadowTex=E},e.resize=function(_,b){if(!(_===e.W&&b===e.H)){Y&&(s.destroyTarget(Y),s.destroyTarget(e.hdrOnly),s.destroyTarget(e.hdrOnlyB),s.destroyTexture(x),s.destroyTexture(F),s.destroyTexture(we)),e.W=_,e.H=b,w.width=_,w.height=b,x=s.texture({w:_,h:b,format:"rgba16f",filter:"linear"}),we=s.texture({w:_,h:b,format:"depth",filter:"nearest"}),Y=s.target({color:x,depth:we}),e.hdr=x,e.depth=we,e.scene=Y,e.hdrOnly=s.target({color:x}),F=s.texture({w:_,h:b,format:"rgba16f",filter:"linear"}),e.hdrOnlyB=s.target({color:F}),o0.resize(_,b);for(const re of e.onResize)re(_,b);s.resize()}},e.updateOrigin=function(_){const b=e.origin;if(Math.abs(_[0]-b[0])>640||Math.abs(_[2]-b[2])>640||Math.abs(_[1]-b[1])>400){const re=[Math.round(_[0]/1024)*1024,Math.round(_[1]/64)*64,Math.round(_[2]/1024)*1024],m=[re[0]-b[0],re[1]-b[1],re[2]-b[2]];return e.origin=re,e.onOriginShift&&e.onOriginShift(m),!0}return!1},e.setCamera=function(_,b,re,m,J){const ae=e.cam;ae.pos=_.slice(),ae.fovY=m;let X=f.norm(f.sub(b,_)),ke=f.norm(f.cross(X,re)),C=f.cross(ke,X);if(J){const ne=Math.cos(J),Be=Math.sin(J),Ee=f.add(f.mul(ke,ne),f.mul(C,Be));C=f.sub(f.mul(C,ne),f.mul(ke,Be)),ke=Ee}ae.fwd=X,ae.right=ke,ae.up=C};function se(_,b){const re=f.sub(_.pos,b),m=_.right,J=_.up,ae=_.fwd;return[m[0],J[0],-ae[0],0,m[1],J[1],-ae[1],0,m[2],J[2],-ae[2],0,-f.dot(m,re),-f.dot(J,re),f.dot(ae,re),1]}return e.computeGlobals=function(_,b,re){const m=e.cam,J=e.origin,ae=e.W/e.H;e.time=_,e.dt=b;const X=Wt.perspective(m.fovY,ae,m.near,m.far),ke=se(m,J),C=Wt.mul(X,ke);e.vp=C,e.view=ke,e.proj=X;let ne=ht||C;ht&&(qe[0]!==J[0]||qe[1]!==J[1]||qe[2]!==J[2])&&(ne=Wt.mul(ht,Wt.translate([J[0]-qe[0],J[1]-qe[1],J[2]-qe[2]]))),be.set(C,u0.viewProj),be.set(Wt.invert(C),u0.invViewProj),be.set(ne,u0.prevViewProj),ht=C,qe=J.slice();const Be=f.sub(m.pos,J),Ee=Math.tan(m.fovY/2);be.set([Be[0],Be[1],Be[2],_],u0.camPos),be.set([...m.right,Ee],u0.camRight),be.set([...m.up,ae],u0.camUp),be.set([...m.fwd,m.near],u0.camFwd),Nt.update();const je=Nt.sunDir();o0.exposure=Nt.exposure*e.exposureBias,o0.flare=Nt.isMoon?.55:1,o0.burst=Nt.isMoon?0:1,o0.ghosts=Nt.isMoon?.25:1,be.set([...je,Nt.milk],u0.sunDir),be.set([...Nt.sunCol,260],u0.sunCol),be.set([...Nt.ambSky,o0.exposure],u0.ambSky),be.set([...Nt.ambGnd,re.drift!=null?re.drift:1],u0.ambGnd),be.set([re.fogDensity!=null?re.fogDensity:16e-5,1/900,Be[1]-700,9e3],u0.fogA),be.set([e.W,e.H,1/e.W,1/e.H],u0.res),be.set([(J[0]%1024+1024)%1024,(J[1]%1024+1024)%1024,(J[2]%1024+1024)%1024,e.frame],u0.origin),be.set([re.speed||0,re.lean||0,b,e.shadowRange],u0.misc),be.set([re.wind?re.wind[0]:1.2,0,re.wind?re.wind[2]:.4,_*.2],u0.wind);const $e=re.playerPos||m.pos;be.set([$e[0]-J[0],$e[1]-J[1],$e[2]-J[2],re.air?1:0],u0.player);const nt=[je[0]*1e5,je[1]*1e5,je[2]*1e5],Ke=C[3]*nt[0]+C[7]*nt[1]+C[11]*nt[2],Fe=(C[0]*nt[0]+C[4]*nt[1]+C[8]*nt[2])/Ke,Ge=(C[1]*nt[0]+C[5]*nt[1]+C[9]*nt[2])/Ke;be.set([Fe*.5+.5,.5-Ge*.5,Ke>0?1:0,Nt.elev],u0.sunScr),be.set([(re.dust!=null?re.dust:1)*(1-.6*Nt.night),1,1,re.microShadow!=null?re.microShadow:1],u0.fx),be.set([Nt.E*Nt.nd,_*.004,Nt.lights,Nt.stars],u0.skyP),be.set([Nt.twi[0],Nt.twi[1],Nt.twi[2],0],u0.twi),be.set([re.focus||7.5,9,44,(typeof ws<"u"?ws.timeK:1)/800],u0.dof);{const Ce=re.lampPos,Ye=re.lampDir,T=(re.lamp!=null?re.lamp:1)*Nt.lampK*e.lampPower;Ce&&Ye&&T>.001?(be.set([Ce[0]-J[0],Ce[1]-J[1],Ce[2]-J[2],T],u0.lamp),be.set([Ye[0],Ye[1],Ye[2],0],u0.lampDir)):(be.set([0,0,0,0],u0.lamp),be.set([0,-1,0,0],u0.lampDir))}const Je=e.cloudWind;be.set([_*Je[0]%1024,_*Je[1]%1024,e.cloudShade,e.cloudCover],u0.cloudP),typeof M0<"u"&&M0.globals(be);const le=f.norm([m.fwd[0],0,m.fwd[2]]),Pe=f.add(Be,f.mul(le,e.shadowRange*.62)),pe=je,c=f.norm(f.cross([0,1,0],pe)),Ie=f.cross(pe,c),he=e.shadowRange,H=2*he/e.shadowRes;let z=f.dot(Pe,c),V=f.dot(Pe,Ie);const I=f.dot(Pe,pe),Q=f.dot(J,c),L=f.dot(J,Ie);z=Math.round((z+Q)/H)*H-Q,V=Math.round((V+L)/H)*H-L;{const Ce=e.snapP||(e.snapP={lx:c,ly:Ie,x:0,y:0}),Ye=f.add(Pe,J);Ce.x=(Ce.x+f.dot(Ye,f.sub(c,Ce.lx)))%H,Ce.y=(Ce.y+f.dot(Ye,f.sub(Ie,Ce.ly)))%H,Ce.lx=c,Ce.ly=Ie,z=Math.round((f.dot(Pe,c)+Q-Ce.x)/H)*H-Q+Ce.x,V=Math.round((f.dot(Pe,Ie)+L-Ce.y)/H)*H-L+Ce.y}const ye=f.add(f.add(f.mul(c,z),f.mul(Ie,V)),f.mul(pe,I+600)),Ve=[c[0],Ie[0],pe[0],0,c[1],Ie[1],pe[1],0,c[2],Ie[2],pe[2],0,-f.dot(c,ye),-f.dot(Ie,ye),-f.dot(pe,ye),1],Ne=Wt.mul(Wt.ortho(-he,he,-he,he,1,1200),Ve);be.set(Ne,u0.shadowVP),e.shadowVP=Ne;{const Ce=$e[0]-J[0],Ye=$e[1]-J[1],T=$e[2]-J[2],Se=e.shadowRange/e.sprayRange,me=2/e.sprayRes,B=Ne[0]*Ce+Ne[4]*Ye+Ne[8]*T+Ne[12],U=Ne[1]*Ce+Ne[5]*Ye+Ne[9]*T+Ne[13],A=Ne[2]*Ce+Ne[6]*Ye+Ne[10]*T+Ne[14];be.set([Se,Math.round(Se*B/me)*me,Math.round(Se*U/me)*me,A],u0.sprayT)}s.setGlobals(be)},e.passes={shadow:[],pre:[],opaque:[],transparent:[],offscreen:[],fx:[]},e.sprayRange=40,e.sprayRes=512,e.cloudWind=[-5.5,-2.5],e.cloudShade=.86,e.cloudCover=.6,e.exposureBias=1,e.lampPower=37,e.onResize=[],e.render=function(){s.beginFrame(),Nt.bakeLut(),Ls.baked||Ls.bake(),hs.update(),os.isBaked()||os.bake(),s.beginPass(D,{depth:1}),ts.drawShadow(e.origin,2);for(const re of e.passes.shadow)re(e);s.endPass();for(const re of e.passes.pre)re(e);s.beginPass(Y,{color:[0,0,0,0],depth:1});for(const re of e.passes.opaque)re(e);ts.draw(e.origin,E,Nt.lut,Jt.sunTex),Nt.draw();for(const re of e.passes.transparent)re(e);s.endPass();for(const re of e.passes.offscreen)re(e);let _=x,b=e.hdrOnly;if(e.motionBlur&&e.dt>0&&(s.beginPass(e.hdrOnlyB,{color:[0,0,0,0]}),o0.motionBlur(x,we,e.dt),s.endPass(),_=F,b=e.hdrOnlyB),e.passes.fx.length){s.beginPass(b,{});for(const re of e.passes.fx)re(e);s.endPass()}o0.run(_,we),s.endFrame(),e.frame++},e})(),At={state:{speed:0,lean:0},ready:!1,t:0,lookYaw:null,lampTilt:.07},H0=new URLSearchParams(location.search),Hs=H0.has("dev");async function ja(e){const s=H0.has("manual"),w=async(E,D)=>{e&&e(E,D),s||await new Promise(be=>requestAnimationFrame(()=>setTimeout(be,0)))},x=document.getElementById("view");await w(.03,"醒来");let F=null;if(H0.get("backend")!=="webgl2")try{F=await so(x,{offscreen:H0.has("offscreen")})}catch(E){console.warn("WebGPU init failed",E),F=null}if(F||(F=to(x)),!F)throw new Error("这台设备的浏览器不支持 WebGL2，画面无法启动。");if(At.gfx=F,vt.forceType=H0.get("seg")||null,vt.classic=H0.has("classic"),vt.setSeed($a()||Math.floor(+H0.get("seed"))||(Hs?vt.seed:At.randomSeed())),H0.get("tod")){const E=H0.get("tod");Nt.setClock(E in Nt.times?Nt.times[E]:+E||0)}await w(.08,"磨雪"),oo(F),no(F,Nt.az),ts.setSun(Nt.az),await w(.2,"远山与城市");{const E=performance.now();L0.init(F,{farW:+H0.get("vistares")||(F.caps.maxTex>=4096?3072:2048),cityW:+H0.get("cityres")||1024,keep:Hs&&H0.has("vistadbg")}),Hs&&console.log("vista",Math.round(performance.now()-E)+"ms",JSON.stringify(L0.stats))}await w(.36,"立起天空"),qt.init(F,x),Nt.init(F),ts.init(F),o0.init(F),a0.init(F),await w(.4,"林子里有鹿");{const E=performance.now();z0.init(F),Hs&&console.log("deer",Math.round(performance.now()-E)+"ms",z0.mesh.nv+" verts")}await w(.44,"种树");{const E=performance.now();os.init(F),Hs&&console.log("trees",Math.round(performance.now()-E)+"ms",Math.round(os.stats.tris)+" tris")}gs.init(F),await w(.56,"点亮星云"),Jt.init(F),Ms.init(F),Ks.init(F),Ls.init(F,+H0.get("nebres")||(F.caps.maxTex>=4096&&(navigator.deviceMemory||8)>=4?1536:768)),hs.init(F,+H0.get("cloudres")||0),ns.init(F),F0.init(F),ga.init(F),await w(.64,"调音"),v0.init(),qt.onResize.push(Jt.resize),qt.onResize.push(ns.resize),qt.onOriginShift=E=>{Jt.shiftOrigin(E)},qt.passes.offscreen.push(E=>Jt.offscreen(E)),qt.passes.offscreen.push(E=>ns.offscreen(E)),qt.passes.fx.push(E=>Ks.veil(E)),qt.passes.fx.push(E=>ns.fx(E)),qt.passes.fx.push(E=>ga.fx(E)),qt.passes.fx.push(E=>Jt.fx(E)),qt.passes.fx.push(E=>Ms.fx(E)),qt.passes.fx.push(E=>Ks.fx(E)),zt.onStep=(E,D)=>Jt.onStep(E,D,At.t-(zt.t-zt.stepT)),qt.passes.shadow.push(()=>{At.skierRoot&&a0.drawShadow(),z0.drawShadow(),os.drawShadow()}),qt.passes.shadow.push(()=>gs.drawShadow()),qt.passes.pre.push(E=>Jt.pre(E)),qt.passes.pre.push(()=>F0.pre()),qt.passes.opaque.push(E=>{At.skierRoot&&a0.draw(E.shadowTex,Nt.lut),z0.draw(E.shadowTex,Nt.lut),os.draw(E)}),qt.passes.opaque.push(E=>gs.draw(E)),qt.passes.transparent.push(E=>hs.draw(E)),qt.passes.transparent.push(E=>os.drawGhost(E)),qt.passes.transparent.push(E=>gs.drawOver(E)),await w(.7,"调光");const Y=[].concat(Nt.pipes,ts.pipes,o0.pipes,a0.pipes,z0.pipes,os.pipes,Jt.pipes,Ms.pipes,Ks.pipes,Ls.pipes,hs.pipes,ns.pipes,F0.pipes,ga.pipes);Y.push(...gs.pipes);for(let E=0;E<Y.length;E++){const D=Y[E];F.finishPipelineAsync?await F.finishPipelineAsync(D):F.finishPipeline(D),e&&!s&&E%6===5&&await w(.7+.16*(E+1)/Y.length,null)}await w(.87,"铺雪"),Zs(),y0.init(x),zt.reset(),At.skierRoot=zt.root,At.skierPose=zt.pose,Ds(1/60,!1);{const E=performance.now();ts.update(qt.cam.pos[0],qt.cam.pos[2],!0),Hs&&console.log("terrain",Math.round(performance.now()-E)+"ms")}s||(await w(.96,"第一缕光"),Ds(1/60,!0),await w(1,null)),At.ready=!0}function Ds(e,s){const w=At.dtReal=e;e*=zt.timeScale||1,At.t+=e,y0.update(w),zt.update(e);const x=qt.cam.pos,F=zt.s,we=At.state;F0.step(zt.root,zt.pose,F),qt.updateOrigin(x),s!==!1&&ts.update(x[0],x[2]),a0.update(zt.root,zt.pose,qt.origin),os.update(qt.cam,qt.origin,qt.W/qt.H,zt.root.pos,e),gs.update(qt.cam,qt.origin,zt.root.pos,e,At.t),z0.update(e,At.t),we.speed=F.speed,we.lean=F.lean,we.playerPos=zt.root.pos,we.air=F.air;{const Y=a0.world,E=Y.hb;if(E&&Y.J){const be=(J=>[Y.X[0]*J[0]+Y.Y[0]*J[1]+Y.Z[0]*J[2],Y.X[1]*J[0]+Y.Y[1]*J[1]+Y.Z[1]*J[2],Y.X[2]*J[0]+Y.Y[2]*J[1]+Y.Z[2]*J[2]])(f.add(f.mad(Y.J.head,E.Z,-.11),f.mul(E.Y,.04))),ht=zt.root.nrm;we.lampPos=[zt.root.pos[0]+be[0],zt.root.pos[1]+be[1],zt.root.pos[2]+be[2]];const qe=F.speed>1.5?Math.atan2(F.v[0],-F.v[2]):0;At.lookYaw=Pt(At.lookYaw==null?qe:At.lookYaw,qe*.85,4.5,e);const se=[Math.sin(At.lookYaw),0,-Math.cos(At.lookYaw)],_=f.dot(se,ht),b=f.norm([se[0]-ht[0]*_,se[1]-ht[1]*_,se[2]-ht[2]*_]),re=Math.cos(At.lampTilt),m=Math.sin(At.lampTilt);we.lampDir=f.norm([b[0]*re-ht[0]*m,b[1]*re-ht[1]*m,b[2]*re-ht[2]*m])}}zt.mode==="run"&&Nt.rate!==0&&Nt.setClock(Nt.clock+e*(Nt.rate||1)),Nt.updatePlane(At.t,e,x,qt.cam.fwd),M0.update(e),ws.update(e),qt.computeGlobals(At.t,e,we);for(const Y of zt.events)if(v0.event(Y),Y.type==="land")Jt.slap(At.t,zt.root.pos,F.v,F.n,it(Y.v/5,.3,2.2));else if(Y.type==="pole")Jt.poles(At.t,zt.root,zt.pose.stance);else if(Y.type==="brush"||Y.type==="crash"){const E=zt.root.pos,D=Y.x-E[0],be=Y.z-E[2],ht=Math.hypot(D,be)||1,qe=Math.min(1,.9/ht);(os.sift||Jt.sift)(At.t,[E[0]+D*qe,E[1]+1.5,E[2]+be*qe],F.v,Y.type==="crash"?1.6:.8),Y.type==="crash"&&(zt.shake=Math.max(zt.shake,.05),Jt.fall(At.t,E,F.n,it(Y.v/5,.3,2.2)))}zt.events.length=0,ws.pass(e),v0.frame();for(const Y of At.onTick)Y(e,s!==!1);s!==!1&&qt.render()}At.onTick=[],At.resumeK=1;let fa=0;function _a(e){if(requestAnimationFrame(_a),At.gfx&&At.gfx.lost){zs.lost();return}if(!At.ready||At.paused){fa=e;return}const s=(e-fa)/1e3,w=it(s,1/240,1/20);fa=e;try{Ds(w*At.resumeK,!0),zs.frame(w),un(e,s)}catch(x){At.ready=!1,Ma(x)}}function Zs(){const e=self.COLD_SMOKE||{};V0.measure();let s=Math.min(devicePixelRatio||1,e.maxDpr||2)*qt.scale;const w=V0.w*V0.h*s*s,x=+H0.get("maxpx")||e.maxPx||34e5;w>x&&(s*=Math.sqrt(x/w));const F=+H0.get("w")||Math.round(V0.w*s),we=+H0.get("h")||Math.round(V0.h*s);qt.resize(Math.max(64,F),Math.max(64,we))}const U0={on:H0.get("gov")!=="0"&&!H0.get("w"),acc:0,n:0,slow:0,fast:0,last:0,downs:0,t0:0};function un(e,s){if(!U0.on||s>1||(U0.t0||(U0.t0=e),e-U0.t0<3e3)||(U0.acc+=s,U0.n++,U0.acc<1))return;const w=U0.acc/U0.n;U0.acc=0,U0.n=0,w>1/50?(U0.slow++,U0.fast=0):w<1/57?(U0.fast++,U0.slow=0):(U0.slow=0,U0.fast=0),U0.slow>=2&&qt.scale>.6?(qt.scale=Math.max(.6,qt.scale*(w>1/36?.8:.9)),U0.slow=0,U0.downs++,U0.last=e,Zs()):U0.fast>=12&&qt.scale<1&&U0.downs<5&&e-U0.last>2e4&&(qt.scale=Math.min(1,qt.scale*1.08),U0.fast=0,U0.last=e,Zs())}At.gov=U0;function Ma(e){console.error(e&&e.message?e.message:e),e&&e.vs&&console.log(e.vs.slice(0,2e4)),e&&e.fs&&console.log(e.fs.slice(0,2e4));const s=document.getElementById("fatal");s&&(s.hidden=!1,s.textContent=Fs.t(String(e&&e.message?e.message:e)))}const $a=()=>{const e=/(?:^|[#&])seed[-=](\d{1,12})/.exec(location.hash||"");return e?+e[1]:0};At.randomSeed=()=>{let e;do e=1e5+Math.floor(Math.random()*9e5);while(e===vt.seed);return e},At.swap=function(e,s=H0.has("manual")){const w={run:At.swapping?At.swapping.run:zt.mode==="run",lift:0,t0:performance.now()},x=document.getElementById("veil"),F=qt.cam.pos[0],we=qt.cam.pos[2];At.swapping=null,e(),zt.mode="title",zt.events.length=0,At.strides=null,F0.reset(),Jt.clear(),Ds(1/60,!1);{const Y=Nt.plane,E=qt.cam.pos;Y&&Y.on&&(Y.x+=E[0]-F,Y.z+=E[2]-we)}if(ts.rebuild(qt.cam.pos[0],qt.cam.pos[2]),s){ts.rebuildStep(),w.run&&zt.start();return}At.swapping=w,x&&(x.style.transition="opacity .2s ease-in",x.classList.remove("lift"))},At.onTick.push(()=>{const e=At.swapping,s=performance.now();if(e)if(U0.acc=U0.n=U0.slow=0,!e.lift)ts.rebuildStep(24)&&s-e.t0>=230&&(e.lift=1);else if(e.lift===1){e.lift=2,e.t0=s;const w=document.getElementById("veil");w&&(w.style.transition="opacity .65s ease-out",w.classList.add("lift"))}else s-e.t0>260&&(At.swapping=null,e.run&&zt.mode==="title"&&zt.start())});{const e=qt.render;qt.render=function(){const s=At.swapping;(!s||s.lift)&&e()}}At.onMountain=[],At.newMountain=function(e,s){e=Math.floor(+e)>=1?+e:At.randomSeed(),At.swap(()=>{vt.setSeed(e),os.reset&&os.reset(),z0.herd&&(z0.herd.length=0,z0.next=36),typeof cs<"u"&&cs.reset&&cs.reset(),zt.reset()},s);for(const w of At.onMountain)w(vt.seed);return vt.seed},addEventListener("hashchange",()=>{const e=$a();At.ready&&e&&e!==vt.seed&&At.newMountain(e)}),window.__ski={boot:()=>ja().then(()=>"ok "+At.gfx.caps.backend,e=>(Ma(e),"ERR "+(e&&e.message))),view(e,s,w,x){qt.updateOrigin(e),qt.setCamera(e,s,[0,1,0],w||1,x||0),ts.update(e[0],e[2]),At.skierRoot&&a0.update(At.skierRoot,At.skierPose,qt.origin),os.update(qt.cam,qt.origin,qt.W/qt.H),gs.update(qt.cam,qt.origin,null,0,At.t),qt.computeGlobals(At.t,1/60,At.state);for(const F of At.onTick)F(0,!0);qt.render()},skier(e,s,w,x){const F=vt.height(e,s,.5),we=vt.normal(e,s).slice(),Y=[Math.sin(w),0,-Math.cos(w)];return At.skierRoot={pos:[e,F,s],fwd:f.norm(f.sub(Y,f.mul(we,f.dot(Y,we)))),nrm:we},At.skierPose=x||{},At.skierRoot.pos},async shot(){const e=await At.gfx.capture(),s=document.createElement("canvas");return s.width=e.w,s.height=e.h,s.getContext("2d").putImageData(new ImageData(e.data,e.w,e.h),0,0),s.toDataURL("image/png")},height:(e,s)=>vt.height(e,s,.5),set(e,s){const w=e.split(".");let x={Sky:Nt,Render:qt,Post:o0,App:At,Terrain:ts,Course:vt,Spray:Jt,Game:zt,Input:y0,Dust:Ks,Nebula:Ls,Clouds:hs,Trees:os,Shafts:ns,Vista:L0,Tracks:F0,Sound:v0,Deer:z0};for(let F=0;F<w.length-1;F++)x=x[w[F]];x[w[w.length-1]]=s},err:()=>At.gfx&&At.gfx.lastError,sim(e,s,w={}){const x=Math.round(e*60);zt.mode!=="run"&&zt.start();const F=At.gfx.caps.backend==="webgl2";for(let Y=0;Y<x;Y++){y0.script=s?s(zt.runT):0;const E=Y===x-1&&w.draw!==!1;Ds(1/60,E),!E&&F&&Y%6===5&&F0.pre()}const we=zt.s;return{p:we.p.map(Y=>+Y.toFixed(2)),speed:+we.speed.toFixed(2),lean:+we.lean.toFixed(3),beta:+we.beta.toFixed(3),air:we.air,e:+we.e.toFixed(3),seg:vt.segAt(-we.p[2]).type}},frame(e){Ds(e==null?1/60:e,!0)},async audioTest(e,s,w={}){const x=w.sr||44100,F=new OfflineAudioContext(2,Math.round(e*x),x),we=v0.build(F,w),Y=Math.round(e*60),E=[],D={rig:v0.rig,now:v0.now};let be=0;for(v0.rig=we,v0.now=()=>be/60+.012,we.fade(w.level||v0.level,0,.01),!w.title&&zt.mode!=="run"&&zt.start(),be=0;be<Y;be++)if(y0.script=s?s(zt.runT):0,Ds(1/60,!1),be%6===0){const X=v0.snapshot();E.push([+(be/60).toFixed(1),+X.speed.toFixed(1),+X.lat.toFixed(2),+X.I.toFixed(2),+X.load.toFixed(2),X.contact?1:0,+X.powder.toFixed(2),+(we.E||0).toFixed(2),+X.lean.toFixed(2),+X.skid.toFixed(2)])}v0.rig=D.rig,v0.now=D.now;const ht=await F.startRendering(),qe=ht.getChannelData(0),se=ht.getChannelData(1),_=qe.length,b=new Uint8Array(44+_*4),re=new DataView(b.buffer),m=(X,ke)=>{for(let C=0;C<ke.length;C++)b[X+C]=ke.charCodeAt(C)};m(0,"RIFF"),re.setUint32(4,36+_*4,!0),m(8,"WAVEfmt "),re.setUint32(16,16,!0),re.setUint16(20,1,!0),re.setUint16(22,2,!0),re.setUint32(24,x,!0),re.setUint32(28,x*4,!0),re.setUint16(32,4,!0),re.setUint16(34,16,!0),m(36,"data"),re.setUint32(40,_*4,!0);let J=0;for(let X=0;X<_;X++)J=Math.max(J,Math.abs(qe[X]),Math.abs(se[X])),re.setInt16(44+X*4,it(qe[X],-1,1)*32767,!0),re.setInt16(46+X*4,it(se[X],-1,1)*32767,!0);let ae="";for(let X=0;X<b.length;X+=24576)ae+=btoa(String.fromCharCode.apply(null,b.subarray(X,X+24576)));return{wav:ae,log:E,peak:J,chirps:(we.chirps||0)+" passes "+(we.passes||0)+" hoofs "+(we.hoofs||0)}},pilot(e=.45,s=5.2){const w={},x={};return F=>{const we=zt.s,Y=we.p,E=10+Math.max(we.speed,4)*.9,D=vt.at(-Y[2]+E,w);let be=D.cx+e*D.hw*Math.sin(F*It/s);const ht=Y[2]-E;for(let qe=1;qe<=8;qe++){const se=Y[0]+(be-Y[0])*qe/8,_=Y[2]+(ht-Y[2])*qe/8;vt.nearTree(se,_,x),x.ok&&!x.soft&&x.d<3.4&&(be+=(se>=x.x?1:-1)*(4.6-x.d)*(qe<3?2.6:1.1))}return it((Math.atan2(be-Y[0],-(ht-Y[2]))-Math.atan2(we.v[0],-we.v[2]))*2.4,-.85,.85)}},reset(e){zt.reset(e),zt.mode="title"},tod(e){return Nt.setClock(typeof e=="string"?Nt.times[e]:e),Nt.update(),hs.baked=!1,L0.shadowElev=-9,L0.updateShadow(!0),+Nt.sunElev.toFixed(4)},game:()=>zt,input:()=>y0,app:()=>At,ui:()=>zs,i18n:()=>Fs,get m(){return{Sky:Nt,Render:qt,Post:o0,App:At,Terrain:ts,Course:vt,Spray:Jt,Game:zt,Input:y0,Skier:a0,Tex:c0,Dust:Ks,Nebula:Ls,Clouds:hs,Trees:os,Shafts:ns,Vista:L0,Tracks:F0,Sound:v0,Atmo:ks,Deer:z0,View:V0,Variants:Dt,Weather:M0,Grains:Ms}}},At.fit=Zs,window.__ski.gates=gs,addEventListener("resize",()=>{typeof zs<"u"&&zs.layout&&zs.layout(),At.ready&&!H0.get("w")&&Zs()}),At.redraw=()=>{if(!(!At.ready||!At.paused||At.gfx&&At.gfx.lost))try{qt.computeGlobals(At.t,1/60,At.state);for(const e of At.onTick)e(0,!0);qt.render()}catch(e){}},addEventListener("resize",()=>At.redraw()),H0.has("manual")&&!H0.has("ui")?document.getElementById("app").classList.add("bare"):(zs.init(),ja(zs.stage).then(()=>{zs.ready(),fa=performance.now(),requestAnimationFrame(_a),H0.has("autostart")&&zs.go()}).catch(Ma))})();
