import{r as x,j as t}from"./index-BLF3I7OA.js";const h=({open:o,images:e=[],index:n=0,onClose:i,onPrev:a,onNext:l})=>{if(x.useEffect(()=>{if(!o)return;const r=s=>{s.key==="Escape"&&i(),s.key==="ArrowLeft"&&a(),s.key==="ArrowRight"&&l()};return window.addEventListener("keydown",r),()=>window.removeEventListener("keydown",r)},[o,i,a,l]),!o)return null;const c=e&&e.length?e[n]:"";return t.jsxs("div",{className:"lightbox-overlay",onClick:i,children:[t.jsxs("div",{className:"lightbox-content",onClick:r=>r.stopPropagation(),children:[t.jsx("button",{className:"lightbox-close",onClick:i,children:"×"}),t.jsxs("div",{className:"lightbox-body",children:[t.jsx("button",{className:"lightbox-prev",onClick:a,"aria-label":"Previous",children:"❮"}),t.jsx("div",{className:"lightbox-image-wrap",children:c?t.jsx("img",{src:c,alt:`image-${n+1}`}):t.jsx("div",{className:"lightbox-empty",children:"No image"})}),t.jsx("button",{className:"lightbox-next",onClick:l,"aria-label":"Next",children:"❯"})]}),t.jsxs("div",{className:"lightbox-footer",children:[n+1," / ",e.length]})]}),t.jsx("style",{children:`
        .lightbox-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1100}
        .lightbox-content{position:relative;max-width:90%;max-height:90%;width:900px;background:transparent}
        .lightbox-body{display:flex;align-items:center;justify-content:space-between}
        .lightbox-image-wrap{flex:1;display:flex;align-items:center;justify-content:center}
        .lightbox-image-wrap img{max-width:100%;max-height:80vh;border-radius:4px}
        .lightbox-prev,.lightbox-next{background:transparent;border:none;color:#fff;font-size:2.4rem;cursor:pointer;padding:0 12px}
        .lightbox-close{position:absolute;right:-8px;top:-28px;background:transparent;border:none;color:#fff;font-size:2.4rem;cursor:pointer}
        .lightbox-footer{color:#fff;text-align:center;margin-top:8px}
      `})]})};export{h as I};
