import { useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';

const width = 954
const DATAPATH = './flare.json'

async function loadData() {
    const response = await fetch(DATAPATH);
    const data = response.json();
    return data;
}

function tree (data) {
    const root = d3.hierarchy(data);
    root.dx = 10;
    // root.dy = width / (root.height + 1);
    root.dy = width / (5 + 1);

    return d3.tree().nodeSize([root.dx, root.dy])(root);
}

function TreeCollapse() {
    const containerRef = useRef(null);

    const margin = {top: 10, right: 120, bottom: 10, left: 40};

    useLayoutEffect(() => {
      const loadTree = async() => {

        const data = await loadData();
        console.log(data);

        const root = tree(data);
        let x0 = Infinity;
        let x1 = -x0;
        root.each(d => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
        });


        const svg = d3.select("#tree")
                    .attr("viewBox", [0, 0, width, x1 - x0 + root.dx * 2]);

        const g = svg.append("g")
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', 10)
                    .attr('transform', `translate(${root.dy / 3}, ${root.dx - x0})`);

        const gLink = g.append('g')
                        .attr("fill", "none")
                        .attr("stroke", "#555")
                        .attr("stroke-opacity", 0.4)
                        .attr("stroke-width", 1.5)
                        .selectAll('path')
                        .data(root.links())
                        .join('path')
                        .attr('d', d3.linkHorizontal()
                                    .x(d=>d.y)
                                    .y(d=>d.x));
        const node = g.append("g")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .selectAll("g")
                    .data(root.descendants())
                    .join("g")
                    .attr("transform", d => `translate(${d.y}, ${d.x})`);

        node.append("circle")
            .attr("fill", d => d.children ? "#555": "#999")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -6: 6)
            .attr("text-anchor", d => d.children ? "end": "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stoke", "white");
      }
        // svg.node();
        loadTree();
        console.log('Done');
    })

  return <svg id="tree" width="100%" height="2200" ref={containerRef}>
         </svg>

}

export default TreeCollapse;
