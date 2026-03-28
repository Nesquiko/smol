import * as d3 from "d3";
import { Accessor, Component, createEffect } from "solid-js";

import { ParseTreeNode } from "~/lib/types";

type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

interface ParseTreeProps {
  tree: Accessor<ParseTreeNode>;
}

export const ParseTree: Component<ParseTreeProps> = (props: ParseTreeProps) => {
  let svgRef: SVGSVGElement | undefined;

  createEffect(() => {
    if (!svgRef || !props.tree) return;

    const width: number = 1200;
    const height: number = 800;
    const margin: Margins = { top: 40, right: 40, bottom: 40, left: 40 };

    const svg = d3.select<SVGSVGElement, unknown>(svgRef);

    let g = svg.select<SVGGElement>("g.tree-g");
    if (g.empty()) {
      svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

      g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("class", "tree-g");
    }

    const hierarchy: d3.HierarchyNode<ParseTreeNode> = d3.hierarchy<ParseTreeNode>(props.tree());
    const nodeCount: number = hierarchy.descendants().length;

    const baseRadius: number = 20;
    const scaleFactor: number = Math.max(1, 1 - nodeCount / 50);
    const radius: number = baseRadius * scaleFactor;
    const fontSize: number = Math.max(12, 16 * scaleFactor);

    const tree: d3.TreeLayout<ParseTreeNode> = d3
      .tree<ParseTreeNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .separation(
        (a: d3.HierarchyPointNode<ParseTreeNode>, b: d3.HierarchyPointNode<ParseTreeNode>) =>
          a.parent === b.parent ? 2 : 3,
      );

    const root: d3.HierarchyPointNode<ParseTreeNode> = tree(hierarchy);

    const links = g
      .selectAll<SVGLineElement, d3.HierarchyPointLink<ParseTreeNode>>(".link")
      .data(root.links(), (d) => d.target.data.id);

    links
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
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

    const nodes = g
      .selectAll<SVGGElement, d3.HierarchyPointNode<ParseTreeNode>>(".node")
      .data(root.descendants(), (d) => d.data.id);

    const nodeEnter = nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodeEnter
      .append("circle")
      .attr("r", 0)
      .attr("fill", "#737373")
      .transition()
      .duration(500)
      .attr("r", radius);

    nodeEnter
      .append("text")
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", `${fontSize}px`)
      .style("font-weight", "bold")
      .text((d) => d.data.label)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    nodes
      .transition()
      .duration(500)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodes.exit().remove();
  });

  return (
    <svg
      ref={svgRef}
      class="max-h-full max-w-full"
      style={{
        display: "block",
        "aspect-ratio": "600 / 400",
      }}
    />
  );
};
