import * as d3 from "d3";
import { Accessor, Component, createEffect } from "solid-js";
import { ParseTreeNode } from "~/components/home";

interface ParseTreeProps {
  tree: Accessor<ParseTreeNode>;
}

export const ParseTree: Component<ParseTreeProps> = (
  props: ParseTreeProps
) => {
  let svgRef: SVGSVGElement | undefined;

  createEffect(() => {
    if (!svgRef || !props.tree) return;

    const width = 1200;
    const height = 800;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const svg = d3.select(svgRef);

    let g = svg.select<SVGGElement>("g.tree-g");
    if (g.empty()) {
      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("class", "tree-g");
    }

    const hierarchy = d3.hierarchy<ParseTreeNode>(props.tree());
    const nodeCount = hierarchy.descendants().length;

    const baseRadius = 20;
    const scaleFactor = Math.max(1, 1 - nodeCount / 50);
    const radius = baseRadius * scaleFactor;
    const fontSize = Math.max(12, 16 * scaleFactor);

    const tree = d3
      .tree<ParseTreeNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .separation((a, b) => (a.parent === b.parent ? 2 : 3));

    const root = tree(hierarchy);

    // Links
    const links = g
      .selectAll(".link")
      .data(root.links(), (d: any) => d.target.data.id);

    links
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.source.x)
      .attr("y2", (d: any) => d.source.y)
      .transition()
      .duration(500)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    links
      .transition()
      .duration(500)
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    links.exit().remove();

    // Nodes
    const nodes = g
      .selectAll(".node")
      .data(root.descendants(), (d: any) => d.data.id);

    // Only animate new nodes
    const nodeEnter = nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

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
      .text((d: any) => d.data.label)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Update existing nodes - just reposition
    nodes
      .transition()
      .duration(500)
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    nodes.exit().remove();
  });

  return (
    <svg
      ref={svgRef}
      class="max-w-full max-h-full"
      style={{
        display: "block",
        "aspect-ratio": "600 / 400"
      }}
    />
  );
};