"use strict";module.exports=function(e){const r=new Map(Object.entries(e||{}));return{init:function(e,t){const n=new Map([].concat(e||[...r.keys()]).map((e=>Array.isArray(e)?e:[e,[]])).reduce(((e,[n,c])=>Object.entries(r.get(n)||{[n]:()=>{throw new Error(`plugin ${n} is missing`)}}).map((([e,r])=>r&&[e,r({...c,...t})])).filter((e=>e)).reduce(((e,[r,t])=>(e.set(r,[].concat(e.get(r)||[],t||[])),e)),e)),new Map)),c=(e,r)=>(n.get(e)||[e=>e]).reduce(((e,r)=>r(e)),r);return c.reduce=c.chain=c.series=c,c.map=c.parallel=c.all=(e,r)=>(n.get(e)||[]).map((function(e){return e(r)})),c}}};
//# sourceMappingURL=iplug.cjs.map
