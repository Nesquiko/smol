import * as d3 from "d3";
import {Accessor, Component, createEffect} from "solid-js";
import {HierarchyPointNode} from "d3";

type ParseTreeNode = {
  id: string;
  label: string;
  children?: Array<ParseTreeNode>;
};

interface ParseTreeProps {
  tree: Accessor<ParseTreeNode>;
}

export const ParseTree: Component<ParseTreeProps> = (props: ParseTreeProps) => {
  let svgRef: SVGSVGElement | undefined;

  createEffect(() => {
    if (!svgRef || !props.tree()) return;

    const width: number = 1200;
    const height: number = 800;

    const svg = d3.select(svgRef);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transfrom", `translate(${width / 2},40)`);

    const hierarchy = d3.hierarchy(props.tree());
    const tree = d3
      .tree()
      .size([width - 100, height - 100])
      .separation((a, b) => a.parent === b.parent ? 1 : 1.5);

    const root = tree(hierarchy);

    root.each((d) => {
      d.x -= width / 2;
    });

    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    const nodes = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes
      .append("circle")
      .attr("r", 6)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    nodes
      .append("text")
      .attr('dy', -12)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.data.label)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none');
  });

  return (
    <svg ref={svgRef} class="w-full border border-gray-300" />
  );
};