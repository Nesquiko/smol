import * as d3 from "d3";
import DownloadIcon from "lucide-solid/icons/download";
import { Accessor, Component, createEffect } from "solid-js";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Dollar, NodeType, NonTerminal, ParseTreeNode, Token } from "~/lib/types";
import { cn, downloadSvg } from "~/lib/ui-utils";

type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const getNodeType = (data: Token | NonTerminal | Dollar | string): NodeType => {
  if (!data) return "unknown";
  if (typeof data === "string") {
    if (data === "$") return "eof";
    if (data === "ε") return "epsilon";
    return "non-terminal";
  }
  if (typeof data === "object" && "value" in data) return "token";
  return "unknown";
};

interface ParseTreeProps {
  tree: Accessor<ParseTreeNode>;
  class?: string;
}

export const ParseTree: Component<ParseTreeProps> = (props: ParseTreeProps) => {
  let svgRef: SVGSVGElement | undefined;

  createEffect(() => {
    if (!svgRef || !props.tree) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef);
    const container: HTMLElement | null = svgRef.parentElement;
    if (!container) return;

    const width: number = container.clientWidth;
    const height: number = container.clientHeight;
    const margin: Margins = { top: 40, right: 40, bottom: 40, left: 40 };

    let g = svg.select<SVGGElement>("g.tree-g");
    if (g.empty()) {
      svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

      const hierarchy = d3.hierarchy<ParseTreeNode>(props.tree());
      const treeLayout = d3
        .tree<ParseTreeNode>()
        .nodeSize([40, Math.max(50, (width / hierarchy.leaves().length) * 0.8)])
        .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));
      const root = treeLayout(hierarchy);

      const xValues = root.descendants().map((d) => d.x);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const treeWidth = maxX - minX;

      const margin: Margins = { top: 40, right: 40, bottom: 40, left: 40 };
      const initialOffsetX = (width - treeWidth) / 2 - minX;
      const initialOffsetY = margin.top;

      const initialTransform: d3.ZoomTransform = d3.zoomIdentity.translate(
        initialOffsetX,
        initialOffsetY,
      );

      g = svg.append("g").attr("transform", initialTransform.toString()).attr("class", "tree-g");

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on("start", () => svg.style("cursor", "grabbing"))
        .on("zoom", (event) => {
          g.attr("transform", event.transform.toString());
        })
        .on("end", () => svg.style("cursor", "grab"));

      if (!svg.property("__zoom_initialized__")) {
        svg.property("__zoom_initialized__", true);
        svg.call(zoom).call(zoom.transform, initialTransform);
      }
    }

    const hierarchy = d3.hierarchy<ParseTreeNode>(props.tree());
    const leavesCount = hierarchy.leaves().length;
    const radius = 16;
    const dx = 40;
    const dy = Math.max(50, (width / leavesCount) * 0.8);

    const treeLayout = d3
      .tree<ParseTreeNode>()
      .nodeSize([dx, dy])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

    const root = treeLayout(hierarchy);
    root.descendants().forEach((d) => {
      d.x += margin.left;
      d.y += margin.top;
    });

    const links = g
      .selectAll<SVGLineElement, d3.HierarchyPointLink<ParseTreeNode>>(".link")
      .data(root.links(), (d) => d.target.data.id);

    links
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "var(--color-neutral-500)")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.source.x)
      .attr("y2", (d) => d.source.y)
      .transition()
      .duration(500)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    links
      .transition()
      .duration(500)
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    links.exit().remove();

    let tooltip = d3.select("body").select<HTMLDivElement>(".tree-tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tree-tooltip")
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("background", "#111")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("opacity", 0)
        .style("z-index", 9999);
    }

    const nodes = g
      .selectAll<SVGGElement, d3.HierarchyPointNode<ParseTreeNode>>(".node")
      .data(root.descendants(), (d) => d.data.id);

    const nodeEnter = nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    const applyTooltip = (
      selection: d3.Selection<
        SVGGElement,
        d3.HierarchyPointNode<ParseTreeNode>,
        SVGGElement,
        unknown
      >,
    ) => {
      selection
        .on("mouseenter", (event, d) => {
          const nodeData = d.data.data;
          if (!nodeData) return;
          if (typeof nodeData === "string") {
            tooltip
              .style("opacity", 1)
              .html(`<div><strong>${nodeData}</strong></div><div>Non-terminal</div>`);
          } else if ("value" in nodeData) {
            tooltip.style("opacity", 1).html(`
              <div><strong>${nodeData.type}</strong></div>
              <div>Value: ${nodeData.value}</div>
              <div>Line: ${nodeData.line}</div>
              <div>Cols: ${nodeData.colStart}-${nodeData.colEnd}</div>
            `);
          }
        })
        .on("mousemove", (event) =>
          tooltip.style("left", `${event.clientX + 10}px`).style("top", `${event.clientY + 10}px`),
        )
        .on("mouseleave", () => tooltip.style("opacity", 0));
    };

    applyTooltip(nodeEnter);
    applyTooltip(nodes);

    nodeEnter
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => {
        const type = getNodeType(d.data.data);
        switch (type) {
          case "non-terminal":
            return "var(--color-neutral-500)";
          case "token":
            return "var(--color-neutral-200)";
          case "epsilon":
            return "var(--color-neutral-300)";
          case "eof":
            return "var(--color-neutral-400)";
          default:
            return "var(--color-neutral-500)";
        }
      })
      .attr("stroke", (d) => (d.depth === 0 ? "var(--color-neutral-100)" : "none"))
      .attr("stroke-width", (d) => (d.depth === 0 ? 3 : 0))
      .transition()
      .duration(500)
      .attr("r", (d) => (d.depth === 0 ? radius + 5 : radius));

    const maxLength = 6;
    nodeEnter
      .append("text")
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text((d) => {
        const data = d.data.data;
        if (!data) return "";
        const text: string = typeof data === "string" ? data : "value" in data ? data.value : "";
        if (d.depth === 0) return text;
        return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
      })
      .style("fill", (d) => {
        const type = getNodeType(d.data.data);
        if (type === "non-terminal") return "var(--color-neutral-50)";
        return "var(--color-neutral-950)";
      })
      .style("font-size", (d) => (getNodeType(d.data.data) === "non-terminal" ? "7px" : "6px"))
      .transition()
      .duration(500)
      .style("opacity", 1);

    nodes
      .transition()
      .duration(500)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodes.exit().remove();

    g.selectAll(".link").lower();
    g.selectAll(".node").raise();
  });

  return (
    <div class="relative h-full w-full">
      <svg
        ref={svgRef}
        class={cn("min-h-full min-w-full", props.class)}
        style={{ display: "block", cursor: "grab" }}
      />

      <Tooltip placement="top" openDelay={0} closeDelay={0}>
        <TooltipTrigger
          as={Button}
          variant="ghost"
          size="icon"
          class="absolute right-2 bottom-2 size-6 cursor-pointer text-muted-foreground"
          onClick={() => {
            if (!svgRef) return;
            downloadSvg(svgRef);
          }}
        >
          <DownloadIcon />
        </TooltipTrigger>

        <TooltipContent class="text-xs">Download as SVG</TooltipContent>
      </Tooltip>
    </div>
  );
};
