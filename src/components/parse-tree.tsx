import * as d3 from "d3";
import DownloadIcon from "lucide-solid/icons/download";
import EyeIcon from "lucide-solid/icons/eye";
import EyeOffIcon from "lucide-solid/icons/eye-off";
import HouseIcon from "lucide-solid/icons/house";
import TargetIcon from "lucide-solid/icons/target";
import { Accessor, Component, createEffect, createSignal, Setter } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion } from "solid-motionone";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import {
  Dollar,
  Margins,
  NodeType,
  NonTerminal,
  ParseTreeNode,
  Token,
  TokenType,
} from "~/lib/types";
import { cn, downloadSvg } from "~/lib/ui-utils";

const RADIUS: number = 16;
const ROOT_RADIUS: number = 21;
const NODE_DX: number = 40;
const MARGINS = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
} satisfies Margins;
const MAX_LABEL_LENGTH: number = 6;
const TRANSITION_MS: number = 500;
const TOOLTIP_CLASS: string = "tree-tooltip";

const NODE_COLORS: Record<NodeType, string> = {
  "non-terminal": "var(--color-neutral-600)",
  token: "var(--color-neutral-300)",
  epsilon: "var(--color-neutral-400)",
  eof: "var(--color-neutral-500)",
  unknown: "var(--color-neutral-600)",
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

const getNodeLabel = (d: d3.HierarchyPointNode<ParseTreeNode>): string => {
  const data = d.data.data;
  if (!data) return "";
  const text: string = typeof data === "string" ? data : "value" in data ? data.value : "";
  if (d.depth === 0) return text;
  return text.length > MAX_LABEL_LENGTH ? `${text.slice(0, MAX_LABEL_LENGTH)}...` : text;
};

const getNodeRadius = (d: d3.HierarchyPointNode<ParseTreeNode>): number =>
  d.depth === 0 ? ROOT_RADIUS : RADIUS;

const getNodeColor = (node: ParseTreeNode): string => {
  if (!node.visited) return "var(--color-primary-800)";
  return NODE_COLORS[getNodeType(node.data)];
};

const getOrCreateTooltip = (): d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> => {
  const existing = d3.select("body").select<HTMLDivElement>(`.${TOOLTIP_CLASS}`);
  if (!existing.empty()) return existing;

  return d3
    .select("body")
    .append("div")
    .attr("class", TOOLTIP_CLASS)
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("background", "#111")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "6px")
    .style("font-size", "12px")
    .style("opacity", 0)
    .style("z-index", 9999);
};

const applyTooltip = (
  selection: d3.Selection<SVGGElement, d3.HierarchyPointNode<ParseTreeNode>, SVGGElement, unknown>,
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>,
) => {
  selection
    .on("mouseenter", (_event, d) => {
      const nodeData: Token | NonTerminal | TokenType = d.data.data;
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

type LayoutOutput = {
  root: d3.HierarchyPointNode<ParseTreeNode>;
  hierarchy: d3.HierarchyNode<ParseTreeNode>;
  dy: number;
};

const buildLayout = (tree: ParseTreeNode, containerWidth: number): LayoutOutput => {
  const hierarchy: d3.HierarchyNode<ParseTreeNode> = d3.hierarchy<ParseTreeNode>(tree);
  const dy: number = Math.max(50, (containerWidth / hierarchy.leaves().length) * 0.8);

  const layout: d3.TreeLayout<ParseTreeNode> = d3
    .tree<ParseTreeNode>()
    .nodeSize([NODE_DX, dy])
    .separation(
      (a: d3.HierarchyPointNode<ParseTreeNode>, b: d3.HierarchyPointNode<ParseTreeNode>) =>
        a.parent === b.parent ? 1.5 : 2.5,
    );

  const root: d3.HierarchyPointNode<ParseTreeNode> = layout(hierarchy);
  root.descendants().forEach((d: d3.HierarchyPointNode<ParseTreeNode>) => {
    d.x += MARGINS.left;
    d.y += MARGINS.top;
  });

  return {
    root,
    hierarchy,
    dy,
  };
};

type SVGInitialization = {
  graph: d3.Selection<SVGGElement, unknown, null, undefined>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
};

const initSvg = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  tree: ParseTreeNode,
  width: number,
  height: number,
  setCentered: Setter<boolean>,
): SVGInitialization => {
  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRation", "xMidYMid meet");

  const { root } = buildLayout(tree, width);

  const targetX = width / 2;
  const targetY = height / 2;

  const initial = d3.zoomIdentity.translate(targetX - root.x, targetY - root.y).scale(1);

  const g = svg.append("g").attr("class", "tree-g").attr("transform", initial.toString());

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on("start", () => svg.style("cursor", "grabbing"))
    .on("zoom", (event) => {
      g.attr("transform", event.transform.toString());

      const different: boolean =
        Math.abs(event.transform.x - initial.x) > 1 ||
        Math.abs(event.transform.y - initial.y) > 1 ||
        Math.abs(event.transform.k - initial.k) > 0.01;
      setCentered(!different);
    })
    .on("end", () => svg.style("cursor", "grab"));

  svg.call(zoom).call(zoom.transform, initial);

  return { graph: g, zoom };
};

const renderLinks = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyPointNode<ParseTreeNode>,
) => {
  const links: d3.Selection<
    SVGLineElement,
    d3.HierarchyPointLink<ParseTreeNode>,
    SVGGElement,
    unknown
  > = g
    .selectAll<SVGLineElement, d3.HierarchyPointLink<ParseTreeNode>>(".link")
    .data(root.links(), (d: d3.HierarchyPointLink<ParseTreeNode>) => d.target.data.id);

  links
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "var(--color-neutral-500)")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.source.x)
    .attr("y2", (d) => d.source.y)
    .transition()
    .duration(TRANSITION_MS)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  links
    .transition()
    .duration(TRANSITION_MS)
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  links.exit().remove();
};

const renderNodes = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyPointNode<ParseTreeNode>,
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>,
  currentNodeId: Accessor<string | undefined>,
) => {
  const nodes: d3.Selection<
    SVGGElement,
    d3.HierarchyPointNode<ParseTreeNode>,
    SVGGElement,
    unknown
  > = g
    .selectAll<SVGGElement, d3.HierarchyPointNode<ParseTreeNode>>(".node")
    .data(root.descendants(), (d: d3.HierarchyPointNode<ParseTreeNode>): string => d.data.id);

  const nodeEnter: d3.Selection<
    SVGGElement,
    d3.HierarchyPointNode<ParseTreeNode>,
    SVGGElement,
    unknown
  > = nodes
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  applyTooltip(nodeEnter, tooltip);
  applyTooltip(nodes, tooltip);

  nodeEnter
    .append("circle")
    .attr("r", 0)
    .style("fill", (d) => getNodeColor(d.data))
    .style("stroke", (d) =>
      currentNodeId() === d.data.id
        ? "#FFEE8C"
        : d.depth === 0
          ? "var(--color-neutral-100)"
          : "none",
    )
    .style("stroke-width", (d) => (currentNodeId() === d.data.id ? 3 : d.depth === 0 ? 3 : 0))
    .transition()
    .duration(TRANSITION_MS)
    .attr("r", getNodeRadius);

  nodeEnter
    .append("text")
    .attr("dy", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-weight", "bold")
    .style("opacity", 0)
    .text(getNodeLabel)
    .style("fill", (d) =>
      getNodeType(d.data.data) === "non-terminal"
        ? "var(--color-neutral-50)"
        : "var(--color-neutral-950)",
    )
    .style("font-size", (d) => (getNodeType(d.data.data) === "non-terminal" ? "7px" : "6px"))
    .transition()
    .duration(TRANSITION_MS)
    .style("opacity", 1);

  nodes
    .select("text")
    .text(getNodeLabel)
    .style("fill", (d) =>
      getNodeType(d.data.data) === "non-terminal"
        ? "var(--color-neutral-50)"
        : "var(--color-neutral-950)",
    )
    .style("font-size", (d) => (getNodeType(d.data.data) === "non-terminal" ? "7px" : "6px"));

  nodes
    .select("circle")
    .style("fill", (d) => getNodeColor(d.data))
    .style("stroke", (d) =>
      currentNodeId() === d.data.id
        ? "#FFEE8C"
        : d.depth === 0
          ? "var(--color-neutral-100)"
          : "none",
    )
    .style("stroke-width", (d) => (currentNodeId() === d.data.id ? 3 : d.depth === 0 ? 3 : 0));

  nodes
    .transition()
    .duration(TRANSITION_MS)
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  nodes.exit().remove();
};

const adjustZIndex = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
  g.selectAll(".link").lower();
  g.selectAll(".node").raise();
};

interface ParseTreeProps {
  tree: Accessor<ParseTreeNode>;
  active: Accessor<boolean>;
  currentNodeId: Accessor<string | undefined>;
  class?: string;
}

export const ParseTree: Component<ParseTreeProps> = (props: ParseTreeProps) => {
  const [centered, setCentered] = createSignal<boolean>(true);
  const [followNode, setFollowNode] = createSignal<boolean>(true);

  let svgRef: SVGSVGElement | undefined;

  let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | undefined;

  const resetView = () => {
    if (!svgRef || !zoomBehavior || !props.tree) return;

    const svg = d3.select(svgRef);
    const width = svgRef.clientWidth;
    const height = svgRef.clientHeight;

    const { root } = buildLayout(props.tree(), width);

    const targetX = width / 2;
    const targetY = height / 2;

    const transform = d3.zoomIdentity.translate(targetX - root.x, targetY - root.y).scale(1);

    svg.transition().duration(500).call(zoomBehavior.transform, transform);

    setCentered(true);
  };

  const jumpToNode = (nodeId: string | undefined) => {
    if (!svgRef || !zoomBehavior || !nodeId) return;

    const svg: d3.Selection<SVGSVGElement, unknown, null, undefined> = d3.select(svgRef);
    const g: d3.Selection<SVGGElement, unknown, null, undefined> =
      svg.select<SVGGElement>("g.tree-g");
    if (g.empty()) return;

    const nodeSelection: d3.Selection<
      SVGGElement,
      d3.HierarchyPointNode<ParseTreeNode>,
      SVGGElement,
      unknown
    > = g
      .selectAll<SVGGElement, d3.HierarchyPointNode<ParseTreeNode>>(".node")
      .filter((d: d3.HierarchyPointNode<ParseTreeNode>): boolean => d.data.id === nodeId);
    if (nodeSelection.empty()) return;

    const nodeData = nodeSelection.datum() as d3.HierarchyPointNode<ParseTreeNode>;

    const width: number = svgRef.clientWidth;
    const height: number = svgRef.clientHeight;

    const transform: d3.ZoomTransform = d3.zoomIdentity
      .translate(width / 2 - nodeData.x, height / 2 - nodeData.y)
      .scale(1);

    svg.transition().duration(500).call(zoomBehavior.transform, transform);
  };

  createEffect(() => {
    const nodeId: string | undefined = props.currentNodeId();
    if (!followNode() || !nodeId) return;
    jumpToNode(nodeId);
  });

  createEffect(() => {
    if (!svgRef || !props.tree || !props.active()) return;

    const svg: d3.Selection<SVGSVGElement, unknown, null, undefined> = d3.select<
      SVGSVGElement,
      unknown
    >(svgRef);
    const container: HTMLElement | null = svgRef.parentElement;
    if (!container) return;

    const width: number = container.clientWidth;
    const height: number = container.clientHeight;

    let g: d3.Selection<SVGGElement, unknown, null, undefined> =
      svg.select<SVGGElement>("g.tree-g");
    if (g.empty()) {
      const { graph, zoom } = initSvg(svg, props.tree(), width, height, setCentered);
      g = graph;
      zoomBehavior = zoom;
    }

    const { root }: LayoutOutput = buildLayout(props.tree(), width);

    const tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> =
      getOrCreateTooltip();

    renderLinks(g, root);
    renderNodes(g, root, tooltip, props.currentNodeId);

    adjustZIndex(g);
  });

  return (
    <div class="relative h-full w-full">
      <svg
        ref={svgRef}
        class={cn("min-h-full min-w-full", props.class)}
        style={{ display: "block", cursor: "grab" }}
      />

      <Motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        class="absolute right-2 bottom-2"
      >
        <Tooltip placement="top" openDelay={0} closeDelay={0}>
          <TooltipTrigger
            as={Button}
            variant="ghost"
            size="icon"
            class="absolute right-2 bottom-2 size-6 cursor-pointer text-muted-foreground"
            onClick={() => svgRef && downloadSvg(svgRef)}
          >
            <DownloadIcon />
          </TooltipTrigger>

          <TooltipContent class="text-xs">Download as SVG</TooltipContent>
        </Tooltip>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        class="absolute top-2 right-2"
      >
        <Tooltip placement="left" openDelay={0} closeDelay={0}>
          <TooltipTrigger
            as={Button}
            variant="ghost"
            size="icon"
            class="size-6 cursor-pointer text-muted-foreground"
            onClick={resetView}
            disabled={centered()}
          >
            <HouseIcon />
          </TooltipTrigger>

          <TooltipContent>Jump to root node</TooltipContent>
        </Tooltip>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        class="absolute top-9 right-2"
      >
        <Tooltip placement="left" openDelay={0} closeDelay={0}>
          <TooltipTrigger
            as={Button}
            variant="ghost"
            size="icon"
            class="size-6 cursor-pointer text-muted-foreground"
            onClick={() => jumpToNode(props.currentNodeId())}
          >
            <TargetIcon />
          </TooltipTrigger>

          <TooltipContent>Jump to last processed node</TooltipContent>
        </Tooltip>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        class="absolute top-16 right-2"
      >
        <Tooltip placement="left" openDelay={0} closeDelay={0}>
          <TooltipTrigger
            as={Button}
            variant="ghost"
            size="icon"
            class="size-6 cursor-pointer"
            classList={{
              "text-muted-foreground bg-primary-700": followNode(),
              "text-primary-400": !followNode(),
            }}
            onClick={() => setFollowNode((v) => !v)}
          >
            <Dynamic component={followNode() ? EyeIcon : EyeOffIcon} />
          </TooltipTrigger>

          <TooltipContent>
            {followNode()
              ? "Follow last processed node enabled"
              : "Follow last processed node disabled"}
          </TooltipContent>
        </Tooltip>
      </Motion.div>
    </div>
  );
};
