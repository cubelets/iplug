"use strict";module.exports=function(e,t){const n=new Map(Object.entries(e||{}).map((([e,n])=>[e,"function"==typeof n?n(t):n])));return{init:function(e,t){const r=new Map([].concat(e||[...n.keys()]).map((e=>Array.isArray(e)?e:[e,[]])).reduce(((e,[r,c])=>Object.entries(n.get(r)||{[r]:()=>{throw new Error(`plugin ${r} is missing`)}}).map((([e,n])=>n&&[e,n({...c,...t})])).filter((e=>e)).reduce(((e,[t,n])=>(e.set(t,[].concat(e.get(t)||[],n||[])),e)),e)),new Map)),c=(e,t)=>(r.get(e)||[e=>e]).reduce(((e,t)=>t(e)),t);return c.reduce=c.chain=c.series=c,c.map=c.parallel=c.all=(e,t)=>(r.get(e)||[]).map((function(e){return e(t)})),c}}};
//# sourceMappingURL=iplug.cjs.map