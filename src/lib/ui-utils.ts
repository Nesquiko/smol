import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: Array<ClassValue>): string => {
  return twMerge(clsx(inputs));
};

export const formatLineNumber = (lineNum: number, totalLines: number): string => {
  const width: number = totalLines.toString().length;
  return lineNum.toString().padStart(width, " ");
};

export const downloadSvg = (ref: SVGSVGElement) => {
  const clone = ref.cloneNode(true) as SVGSVGElement;

  const bbox: DOMRect = ref.getBBox();
  clone.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
  clone.setAttribute("width", `${bbox.width}`);
  clone.setAttribute("height", `${bbox.height}`);

  const styleSheets: string = Array.from(document.styleSheets)
    .map((sheet: CSSStyleSheet): string => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule: CSSRule): string => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  const style: HTMLStyleElement = document.createElement("style");
  style.innerHTML = styleSheets;
  clone.insertBefore(style, clone.firstChild);

  const serializer = new XMLSerializer();
  const source: string =
    `<?xml version="1.0" standalone="no"?>\r\n` + serializer.serializeToString(clone);

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url: string = URL.createObjectURL(blob);

  const a: HTMLAnchorElement = document.createElement("a");
  a.href = url;
  a.download = "parse-tree.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
