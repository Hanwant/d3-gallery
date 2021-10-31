import { useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { event as currentEvent  } from 'd3';

const width = 954
const DATAPATH = './flare.json'

async function loadData() {
    const response = await fetch(DATAPATH);
    const data = response.json();
    return data;
}


function TreeCollapse() {
    const containerRef = useRef(null);

    const margin = {top: 10, right: 120, bottom: 10, left: 40};
    const width = 192 * 6;
    const dx = 10;
    const dy = width / 6;
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    const tree = d3.tree().nodeSize([dx, dy]);

    useLayoutEffect(() => {
        const loadTree = async() => {

            const data = await loadData();
            console.log(data);

            const root = d3.hierarchy(data);
            root.x0 = dy / 2;
            root.y0 = 0;
            root.descendants().forEach((d, i) => {
                d.id = i;
                d._children = d.children;
                if (d.depth && d.data.name.length !== 7) d.children = null;
            });
            const svg = d3.select("#tree")
                          .attr("viewBox", [-margin.left, -margin.top, width, dx])
                          .style('font', '10px sans-serif')
                          .style('user-select', 'none');


            const gLink = svg.append('g')
                             .attr("fill", "none")
                             .attr("stroke", "#555")
                             .attr("stroke-opacity", 0.4)
                             .attr("stroke-width", 1.5);

            const gNode = svg.append("g")
                            .attr("stroke-linejoin", "round")
                            .attr('pointer-events', 'all');

            const update = (source) => {
                const nodes = root.descendants().reverse();
                const links = root.links();

                tree(root);

                let left = root;
                let right = root;
                root.eachBefore(node => {
                    if (node.x < left.x) left = node;
                    if (node.x < right.x) right= node;
                });

                const height = right.x - left.x + margin.top + margin.bottom;

                const transition = svg.transition()
                                      .duration(250)
                                      .attr('viewBox', [-margin.left, left.x - margin.top, width, height])
                                      .tween('resize', window.ResizeObersver ? null: () => () => svg.dispatch('toggle'));
                const node = gNode.selectAll('g')
                                  .data(nodes, d => d.id);

                const nodeEnter = node.enter().append('g')
                                      .attr('transform', d => `translate(${source.y0}, ${source.x0})`)
                                      .attr('fill-opacity', 0)
                                      .attr('stroke-opacity', 0)
                                      .on('click', (event, d) => {
                                          d.children = d.children ? null: d._children;
                                          update(d);
                                      });
                nodeEnter.append('circle')
                         .attr('r', 2.5)
                         .attr('fill', d => d._children ? '#555': '#999')
                         .attr('stroke-width', 10);
                nodeEnter.append('text')
                         .attr('dy', '0.31em')
                         .attr('x', d => d._children ? -6: 6)
                         .attr("text-anchor", d => d._children ? "end" : "start")
                         .text(d => d.data.name)
                        .clone(true).lower()
                         .attr("stroke-linejoin", "round")
                         .attr("stroke-width", 3)
                         .attr("stroke", "white");

                const nodeUpdate = node.merge(nodeEnter).transition(transition).remove()
                                       .attr('transform', d=> `translate({$source.y}, ${source.x})`)
                                       .attr('fill-opacity', 0)
                                       .attr('stroke-opacity', 0);

                const nodeExit = node.exit().transition(transition).remove()
                                     .attr('transform', d=>`translate(${source.y}, ${source.x})`)
                                     .attr('fill-opacity', 0)
                                     .attr('stroke-opacity', 0);

                const link = gLink.selectAll('path')
                                  .data(links, d => d.target.id);

                const linkEnter = link.enter().append('path')
                                      .attr('d', d => {
                                          const o = {x: source.x0, y: source.y0};
                                          return diagonal({source: o, target: o});
                                      });

                link.merge(linkEnter).transition(transition)
                    .attr('d', diagonal);

                link.exit().transition(transition).remove()
                    .attr('d', d => {
                        const o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    });
                root.eachBefore(d => {
                    d.x0 = d.x;
                    d.y0 = d.y;
                })
            }

            update(root);

        }
        // svg.node();
        loadTree();
        console.log('Done');
    })

  return <svg id="tree" width="100%" height="2200" ref={containerRef}>
         </svg>

}

export default TreeCollapse;
