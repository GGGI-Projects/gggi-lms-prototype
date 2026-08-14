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
 * Runs synchronously, before the body is parsed, so the first paint is already
 * correct. Written as a string of ES5 in an IIFE because it is inlined into the
 * document rather than bundled: nothing here is transpiled or polyfilled, and
 * it must not throw on an old engine.
 *
 * `deviceMemory` and `saveData` are Chromium-only and `hardwareConcurrency` is
 * everywhere; the defaults assume a capable machine, so an engine that reports
 * nothing gets the full page and is then judged on its behaviour instead.
 */
export const PERF_TIER_SCRIPT = `(function(){
var root=document.documentElement,low=false;
try{
var n=navigator,c=n.connection;
var cores=typeof n.hardwareConcurrency==='number'?n.hardwareConcurrency:8;
var memory=typeof n.deviceMemory==='number'?n.deviceMemory:8;
var save=!!(c&&c.saveData);
var frugal=!!(window.matchMedia&&matchMedia('(prefers-reduced-data: reduce)').matches);
low=save||frugal||cores<=4||memory<=4;
}catch(e){}
root.setAttribute('${PERF_ATTRIBUTE}',low?'low':'high');
})();`;
