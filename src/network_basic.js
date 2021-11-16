import { useLayoutEffect } from 'react';
import { Country, City  } from 'country-state-city';
import  * as d3 from 'd3';

// full figure
const width = 960;
const height = 500;
// node / link specs
const main_node_size = 40;
const child_node_size = 15;
const leaf_node_size = 5;
const main_font_size = 15;
const child_font_size = 10;
const leaf_font_size = 10;
const default_distance = 20;
const main_node_distance = 90;
const leaf_distance = 30;
const many_body_strenght = -20

const nodes = [];
const links = [];

const addMain = (node) => {
    node.size = main_node_size;
    node.font_size = main_font_size;
    nodes.push(node);
    return node;
};

const addChild = (parent, child, size = child_node_size, distance = default_distance,
                 font_size = child_font_size) => {
    child.size = size;
    child.colour = parent.colour;
    child.font_size = font_size;
    nodes.push(child);
    links.push({source: parent, target: child, distance: distance, colour: parent.colour});
    return child;
};


const assembleChild = (parent, id, nNodes=5) => {
    const country = Country.getCountryByCode(id);
    let child = addChild(parent, {"id": country.name});
    const cities = City.getCitiesOfCountry(country.isoCode);
    nNodes = Math.min(nNodes, cities.length);
    for (let i=0; i<nNodes; i++){
      addChild(child, {"id": cities[i].name}, leaf_node_size,
               leaf_distance, leaf_font_size);
    }
}

const makeData = () => {
    const Asia = addMain({"id": "Asia", colour: "#4d88e8"});
    assembleChild(Asia, 'CN');
    assembleChild(Asia, 'UZ');
    assembleChild(Asia, 'SG');

    const SA = addMain({"id": "South America", colour: "#ffa1f1"});
    assembleChild(SA, 'CL', 5);
    assembleChild(SA, 'BR', 5);
    assembleChild(SA, 'CO', 10);
    links.push({source: Asia, target: SA, distance: main_node_distance});

    const Ocean = addMain({"id": "Oceania", colour: "#c1d16f"});
    assembleChild(Ocean, 'FJ', 5);
    assembleChild(Ocean, 'AU', 5);
    assembleChild(Ocean, 'NZ', 10);
    links.push({source: Ocean, target: SA, distance: main_node_distance});
    links.push({source: Ocean, target: Asia, distance: main_node_distance});
}

const NetworkBasic = () => {

  useLayoutEffect(() => {
    makeData();
    const simulation = d3.forceSimulation(nodes)
                        .force("charge", d3.forceManyBody().strength(many_body_strenght))
                        .force("link", d3.forceLink(links).distance((link) => link.distance))
                        .force("center", d3.forceCenter(width / 2, height / 2));
    console.log(nodes);

    const dragInteraction = d3.drag().on('drag', (e, node) => {
      console.log(e.x, e.y);
        node.fx = e.x;
        node.fy = e.y;
      simulation.alpha(1);
        simulation.restart();
    });

    const svg = d3.select('#component').append('svg')
                    .attr('width', width).attr('height', height)
                    .attr('transform',  `translate(30, 30)`);

    const lines = svg.selectAll('line').data(links).enter().append('line')
                     .attr('stroke', d => d.colour);
    const circles = svg.selectAll('circle').data(nodes).enter().append('circle')
                       .attr('r', d => d.size)
                       .attr('fill', d => d.colour)
                       .call(dragInteraction);
    const text = svg.selectAll('text').data(nodes).enter().append('text')
                    .text(d => d.id)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .style('pointer-events', 'none')
                    .attr('font-size', d => d.font_size);


    simulation.on('tick', () => {
        // console.log('tick');
        circles.attr('cx', d => d.x)
               .attr('cy', d => d.y);
        text.attr('x', d => d.x)
            .attr('y', d => d.y);

        lines.attr('x1', link => link.source.x)
             .attr('x2', link => link.target.x)
             .attr('y1', link => link.source.y)
             .attr('y2', link => link.target.y);
    });

  }, [])


  return (
   <>
     <div id="component">
       Yo
     </div>
   </>
  )
}




export default NetworkBasic;
