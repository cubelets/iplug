function e(e,t){const n=new Map(Object.entries(e||{}).map((([e,n])=>[e,"function"==typeof n?n(t):n])));return{init:function(e,t){const r=new Map([].concat(e||[...n.keys()]).map((e=>Array.isArray(e)?e:[e,[]])).reduce(((e,[r,a])=>Object.entries(n.get(r)||{[r]:()=>{throw new Error(`plugin ${r} is missing`)}}).map((([e,n])=>n&&[e,n({...a,...t})])).filter((e=>e)).reduce(((e,[t,n])=>(e.set(t,[].concat(e.get(t)||[],n||[])),e)),e)),new Map)),a=(e,t)=>(r.get(e)||[e=>e]).reduce(((e,t)=>t(e)),t);return a.reduce=a.chain=a.series=a,a.map=a.parallel=a.all=(e,t)=>(r.get(e)||[]).map((function(e){return e(t)})),a}}}export{e as default};
//# sourceMappingURL=iplug.mjs.map
