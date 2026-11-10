import{r as o,j as e,L as v}from"./index-CzseyT2S.js";const a={html:`<h1>Pixel Counter</h1>
<button id="btn">Clicks: <span id="count">0</span></button>`,css:`body {
  font-family: monospace;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #0d1117;
  color: #f0f0f0;
}

button {
  font-family: monospace;
  font-size: 1rem;
  padding: 14px 24px;
  border: 1px solid #f0f0f0;
  background: transparent;
  color: #f0f0f0;
  cursor: pointer;
}

button:hover {
  background: #f0f0f0;
  color: #0d1117;
}`,js:`let clicks = 0;
const count = document.getElementById('count');

document.getElementById('btn').addEventListener('click', () => {
  clicks += 1;
  count.textContent = clicks;
});`},r=(t,l,c)=>`<!doctype html>
<html>
  <head><meta charset="utf-8"><style>${l}</style></head>
  <body>${t}<script>${c}<\/script></body>
</html>`,h=[{key:"html",label:"HTML",placeholder:"<h1>Hello</h1>"},{key:"css",label:"CSS",placeholder:"body { color: tomato; }"},{key:"js",label:"JS",placeholder:'console.log("hi")'}];function k(){const[t,l]=o.useState({html:a.html,css:a.css,js:a.js}),[c,i]=o.useState(()=>r(a.html,a.css,a.js)),p=o.useRef(!0);o.useEffect(()=>{if(p.current){p.current=!1;return}const s=window.setTimeout(()=>i(r(t.html,t.css,t.js)),500);return()=>window.clearTimeout(s)},[t]);const m=()=>i(r(t.html,t.css,t.js)),y=()=>{l({html:a.html,css:a.css,js:a.js}),i(r(a.html,a.css,a.js))},b=s=>{if(s.key!=="Tab")return;s.preventDefault();const{key:d,value:n,selectionStart:u,selectionEnd:g}=s.target,j=n.slice(0,u)+"  "+n.slice(g);l(x=>({...x,[d]:j})),requestAnimationFrame(()=>{s.target.selectionStart=s.target.selectionEnd=u+2})};return e.jsxs("section",{id:"playground",className:"playground","aria-label":"Code playground",children:[e.jsxs("div",{className:"playground-header",children:[e.jsx("span",{className:"section-label",children:"Playground"}),e.jsx("h2",{className:"section-title",children:"Code it live."}),e.jsx("p",{className:"section-subtitle",children:"Edit HTML, CSS and JavaScript in your browser and watch the result update as you type."})]}),e.jsxs("div",{className:"playground-editor",children:[e.jsxs("div",{className:"playground-editor-top",children:[e.jsx("div",{className:"playground-tabs","aria-label":"Editor panes",children:h.map(s=>e.jsx("span",{className:"playground-tab",children:s.label},s.key))}),e.jsxs("div",{className:"playground-actions",children:[e.jsx("button",{type:"button",className:"btn btn-ghost playground-btn",onClick:y,children:"Reset"}),e.jsx("button",{type:"button",className:"btn btn-primary playground-btn",onClick:m,children:"Run"})]})]}),e.jsx("div",{className:"playground-editor-grid",children:h.map(s=>e.jsxs("div",{className:"playground-pane",children:[e.jsx("span",{className:"playground-pane-label",children:s.label}),e.jsx("textarea",{className:"playground-pane-input",name:s.key,spellCheck:"false",value:t[s.key],placeholder:s.placeholder,onChange:d=>l(n=>({...n,[s.key]:d.target.value})),onKeyDown:b,"aria-label":`${s.label} editor`})]},s.key))})]}),e.jsxs("div",{className:"playground-preview","aria-label":"Live preview",children:[e.jsxs("div",{className:"playground-preview-bar",children:[e.jsx("span",{className:"playground-preview-label",children:"Preview"}),e.jsx("span",{className:"playground-preview-status",children:"auto-runs on change"})]}),e.jsx("iframe",{className:"playground-preview-frame",title:"Live preview",sandbox:"allow-scripts allow-modals",srcDoc:c})]})]})}function N(){return e.jsxs("div",{className:"projects-page",children:[e.jsx("div",{className:"projects-page-top",children:e.jsxs(v,{to:"/",className:"projects-back","aria-label":"Back to homepage",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),"Back to Home"]})}),e.jsx(k,{})]})}export{N as default};
