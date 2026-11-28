/* Drafts that aren't paid for carry a watermark, so a screen recording of the free preview can't be sent to guests
   in place of the real invitation. It covers the whole screen, ignores taps, and puts itself back if a design's own
   script removes it. Used by the editors (client) and the preview route (server), so it must stay plain strings. */

const TILE =
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='210'>" +
  "<g transform='rotate(-24 150 105)' font-family='Georgia,serif' text-anchor='middle'>" +
  "<g fill='#fff' fill-opacity='.55'><text x='151' y='101' font-size='24' letter-spacing='6'>PREVIEW</text><text x='151' y='123' font-size='11' letter-spacing='1.5'>theweddinginviteco.xyz</text></g>" +
  "<g fill='#3a0d12' fill-opacity='.28'><text x='150' y='100' font-size='24' letter-spacing='6'>PREVIEW</text><text x='150' y='122' font-size='11' letter-spacing='1.5'>theweddinginviteco.xyz</text></g>" +
  "</g></svg>";

const CSS =
  `#twic-wm{position:fixed;inset:0;z-index:2147483646;pointer-events:none;background-image:url("data:image/svg+xml,${encodeURIComponent(TILE)}");background-size:300px 210px}` +
  "#twic-wm-tag{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483647;pointer-events:none;" +
  "padding:6px 14px;border-radius:999px;background:rgba(58,13,18,.86);color:#fbefe6;font:500 12px/1.3 system-ui,-apple-system,sans-serif;" +
  "letter-spacing:.02em;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25)}";

const KEEP =
  "(function(){var b=document.body;if(!b)return;var n=['twic-wm-css','twic-wm','twic-wm-tag'].map(function(i){return document.getElementById(i)});" +
  "new MutationObserver(function(){n.forEach(function(e){if(e&&!e.isConnected)b.appendChild(e)})}).observe(b,{childList:true})})()";

const MARK =
  `<style id="twic-wm-css">${CSS}</style><div id="twic-wm" aria-hidden="true"></div>` +
  `<div id="twic-wm-tag" aria-hidden="true">Preview · publish to remove the watermark</div><script>${KEEP}</script>`;

/** The page with the preview watermark added. Leaves an empty page empty. */
export function withWatermark(html: string) {
  if (!html) return html;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => `${MARK}</body>`) : html + MARK;
}
