// ---------------------------------------------------------------- background threads for the start-up
// A phone has six cores and the start-up used one. The page is one script: a background thread (a Web Worker) runs that same script
// again, with no page around it (Par.W), and makes the pieces of the start-up it is handed (Par.jobs, filled in by the modules that have
// such pieces). Same code, same numbers, same browser: what comes back is bit for bit what the page would have made itself, only sooner.
// Where a worker cannot be made (no Worker, a blocked blob, a script it cannot run), Par.ok stays false and every module makes its piece
// on the page as it always did. Variants 'par' a turns the threads off. The threads are let go once the start-up is done (Par.stop).
const Par = (() => {
  const P = { jobs: {}, W: !!self.CS_WORKER, ok: false, n: 0 };
  if (P.W) {
    // ---- inside the thread: the world as the page has it (the versions picked, the mountain, the sun), then each job as it comes
    self.onmessage = e => {
      const m = e.data; let res = null, err = null;
      try { if (m.init) P.jobs.__init(m.init); if (m.job) res = P.jobs[m.job](m.a); } catch (x) { err = String((x && x.stack) || x); }
      const tr = []; collect(res, tr, 0); self.postMessage({ id: m.id, res, err }, tr);
    };
    return P;
  }
  let src = null; try { const s = document.currentScript; if (s && !s.src) src = s.textContent; } catch (e) { }
  const pool = [], queue = []; let seq = 0, url = null;
  function collect(o, out, d) {           // the buffers of the typed arrays in a result go across without a copy
    if (!o || typeof o !== 'object' || d > 3) return;
    if (ArrayBuffer.isView(o)) { if (!out.includes(o.buffer)) out.push(o.buffer); return; }
    for (const k in o) collect(o[k], out, d + 1);
  }
  // (what the thread is missing of a page: enough for the script's own top level to run through without one. Nothing in the jobs uses it)
  const PRELUDE = 'self.CS_WORKER=1;self.window=self;self.devicePixelRatio=1;self.innerWidth=844;self.innerHeight=390;self.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});' +
    'self.requestAnimationFrame=f=>setTimeout(f,16);self.localStorage={getItem:()=>null,setItem(){},removeItem(){}};' +
    'self.document=(()=>{const p=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>"":k==="length"?0:k==="then"?undefined:p(),apply:()=>p(),construct:()=>p()});return p();})();\n';
  // start n threads (each parses and runs the whole script once, ~0.1 s, while the page goes on with its own work)
  P.start = function (n, state) {
    if (P.n || !src || typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') return false;
    try { url = URL.createObjectURL(new Blob([PRELUDE, src], { type: 'text/javascript' })); } catch (e) { return false; }
    for (let i = 0; i < n; i++) {
      let w; try { w = new Worker(url); } catch (e) { break; }
      const slot = { w, busy: null, init: state };
      w.onmessage = e => done(slot, e.data);
      w.onerror = e => { e.preventDefault && e.preventDefault(); fail(slot, 'worker error: ' + (e.message || '?')); };
      pool.push(slot);
    }
    P.n = pool.length; P.ok = P.n > 0; return P.ok;
  };
  function pump() {
    for (const s of pool) {
      if (s.busy || !queue.length || s.dead) continue;
      const j = queue.shift(); s.busy = j;
      const m = { id: j.id, job: j.job, a: j.a }; if (s.init) { m.init = s.init; s.init = null; }
      try { s.w.postMessage(m, j.tr || []); } catch (e) { fail(s, e.message); }
    }
  }
  function done(s, m) { const j = s.busy; s.busy = null; if (j) { if (m.err) j.no(new Error(m.err)); else j.go(m.res); } pump(); }
  function fail(s, why) {
    s.dead = true; const j = s.busy; s.busy = null; if (j) j.no(new Error(why));
    if (pool.every(x => x.dead)) { P.ok = false; while (queue.length) queue.shift().no(new Error('no workers')); }
    pump();
  }
  // run(job, args, transfer): a promise of the job's result. (tr: buffers handed over with the arguments; the page no longer has them)
  P.run = function (job, a, tr) {
    if (!P.ok) return Promise.reject(new Error('no workers'));
    return new Promise((go, no) => { queue.push({ id: ++seq, job, a, tr, go, no }); pump(); });
  };
  P.stop = function () { for (const s of pool) try { s.w.terminate(); } catch (e) { } pool.length = 0; P.ok = false; P.n = 0; if (url) { try { URL.revokeObjectURL(url); } catch (e) { } url = null; } };
  P.idle = () => !queue.length && pool.every(s => !s.busy);
  return P;
})();
