/**
 * Raw in-page scripts. Passed to page.evaluate as strings so the bundler
 * never transforms them (esbuild's __name helper does not exist in browsers)
 * and so Playwright executes them as self-contained expressions.
 */

export const COLLECT_LINKS_SCRIPT = `(() =>
  Array.from(document.querySelectorAll("a[href]"))
    .map((anchor) => anchor.getAttribute("href") || "")
    .filter(Boolean))()`;

export const COLLECT_PAIRS_SCRIPT = `(() => {
  function parseRgb(value) {
    const m = /rgba?\\(\\s*([\\d.]+)[\\s,]+\\s*([\\d.]+)[\\s,]+\\s*([\\d.]+)(?:[\\s,/]+\\s*([\\d.]+))?\\s*\\)/.exec(value);
    if (!m) return null;
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] === undefined ? 1 : Number(m[4]) };
  }
  function hex(v) { return v.toString(16).padStart(2, "0"); }
  function composite(startEl) {
    let r = 255, g = 255, b = 255;
    let node = startEl;
    while (node) {
      const style = getComputedStyle(node);
      const parsed = parseRgb(style.backgroundColor);
      if (parsed && parsed.a > 0) {
        r = Math.round(parsed.r * parsed.a + r * (1 - parsed.a));
        g = Math.round(parsed.g * parsed.a + g * (1 - parsed.a));
        b = Math.round(parsed.b * parsed.a + b * (1 - parsed.a));
        if (parsed.a >= 1) break;
      }
      node = node.parentElement;
    }
    return "#" + hex(r) + hex(g) + hex(b);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  const results = [];
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    if (seen.has(textNode)) continue;
    seen.add(textNode);
    const content = (textNode.textContent || "").trim();
    if (!content) continue;
    const element = textNode.parentElement;
    if (!element) continue;
    const style = getComputedStyle(element);
    if (
      style.visibility === "hidden" ||
      style.display === "none" ||
      Number(style.opacity) === 0 ||
      element.getClientRects().length === 0
    ) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    results.push({
      text: content.slice(0, 60),
      tag: element.tagName.toLowerCase(),
      color: style.color,
      bg: composite(element),
      fontSize: parseFloat(style.fontSize),
      fontWeight: Number(style.fontWeight),
    });
  }
  return results;
})()`;
