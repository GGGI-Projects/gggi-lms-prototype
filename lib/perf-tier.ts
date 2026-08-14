/**
 * Which version of the page is this machine getting?
 *
 * The hero is the most expensive thing here by a wide margin, and no amount of
 * tuning makes one implementation right for both a desktop workstation and a
 * four-year-old phone. So there are two: `high` runs the page as designed, and
 * `low` keeps the composition and drops the ambience - a still globe, no
 * weather, no light sweep, no cursor halo, no grain, and a year that steps
 * between seasons rather than blending through them.
 *
 * Both tiers are expressed entirely in CSS, under `[data-perf="low"]` in
 * globals.css. No component branches on the tier, which means there is no
 * second render path to keep in step and nothing to go wrong at hydration.
 *
 * The classification is deliberately in two parts, because neither half is
 * sufficient on its own:
 *
 *   GUESS, before first paint (the script below). Static signals only, so it
 *   can run synchronously in the document and there is never a frame of the
 *   expensive page on a machine that cannot afford it.
 *
 *   MEASURE, shortly after (PerfWatchdog). The static signals are proxies and
 *   they are wrong often enough to matter - a current budget phone reports
 *   eight cores and is still slow, a thermally throttled laptop reports
 *   whatever it reported when it was cool. Watching what the machine actually
 *   does with the page catches the ones the guess misses.
 *
 * There is no promotion, only demotion. A page that decides mid-scroll that it
 * can afford more is a page that stutters at the moment it changes its mind.
 */

/** `<html>` carries the tier, so CSS can read it without a wrapper element. */
export const PERF_ATTRIBUTE = "data-perf";

/**
 * Set when a tier was chosen by hand rather than detected. The watchdog leaves
 * a forced tier alone, so `?perf=high` really does mean high.
 */
export const PERF_FORCED_ATTRIBUTE = "data-perf-forced";

/**
 * Runs synchronously, before the body is parsed, so the first paint is already
 * correct. Written as a string of ES5 in an IIFE because it is inlined into the
 * document rather than bundled: nothing here is transpiled or polyfilled, and
 * it must not throw on an old engine.
 *
 * THE GUESS IS DELIBERATELY RELUCTANT. It only demotes on evidence that is hard
 * to misread, because being wrong in this direction is expensive and silent:
 * the visitor simply never sees the globe turn and has no idea there was
 * anything to miss. Anything ambiguous is left to the watchdog, which gets to
 * look at what the machine actually does rather than what it claims to be.
 *
 * Which is why two cores or two gigabytes demotes on its own, but four of
 * either only demotes if the OTHER signal agrees. Plenty of perfectly capable
 * laptops report four.
 *
 * `deviceMemory` and `saveData` are Chromium-only and `hardwareConcurrency` is
 * everywhere; the defaults assume a capable machine, so an engine that reports
 * nothing gets the full page and is judged on its behaviour instead.
 *
 * `?perf=low` or `?perf=high` forces a tier and remembers it for the session -
 * the only way to see the other half of your own work, and useful for a demo on
 * an unfamiliar machine.
 */
export const PERF_TIER_SCRIPT = `(function(){
var root=document.documentElement,forced=null,low=false;
try{
var m=location.search.match(/[?&]perf=(high|low)/);
if(m){forced=m[1];sessionStorage.setItem('perf',forced);}
else{forced=sessionStorage.getItem('perf');}
}catch(e){}
if(forced==='high'||forced==='low'){
root.setAttribute('${PERF_ATTRIBUTE}',forced);
root.setAttribute('${PERF_FORCED_ATTRIBUTE}','');
return;
}
try{
var n=navigator,c=n.connection;
var cores=typeof n.hardwareConcurrency==='number'?n.hardwareConcurrency:8;
var memory=typeof n.deviceMemory==='number'?n.deviceMemory:8;
var save=!!(c&&c.saveData);
var frugal=!!(window.matchMedia&&matchMedia('(prefers-reduced-data: reduce)').matches);
low=save||frugal||cores<=2||memory<=2||(cores<=4&&memory<=4);
}catch(e){}
root.setAttribute('${PERF_ATTRIBUTE}',low?'low':'high');
})();`;
