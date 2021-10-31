import { useRef, useLayoutEffect, Component } from 'react';
import * as d3 from 'd3';

const DATAPATH = 'unemployment.csv';

const margin = {top: 20, right: 20, bottom: 20, left: 80},
      width = 460 - margin.right - margin.left,
      height = 400 - margin.top  - margin.bottom;

async function loadData(){
  const timeParser = d3.timeParse('%b-%y');
  const data = await d3.csv(DATAPATH, (data) => {
    return {
      county_state: data.County_State,
      period: timeParser(data.Period),
      total: +(data.Labour_Force).trim().replaceAll(',', ''),
      unemployment: +(data.Unemployment_Rate).trim(),
    }
      });
  return data;
}

const makeD3Graph = async(id) => {
  const data = await loadData();
  console.log(data);
  const total = data.length;
  const svg = d3.select(`#${id}`)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleLinear()
              .domain([0, d3.max(data, data => data.unemployment)])
              .range([0, width]);

  const tooltip = d3.select(`#${id}`)
                    .append('div')
                    .style('position', 'absolute')
                    .style('visibility', 'hidden')
                    .style('white-space', 'pre')
                    .style('background-color', 'white');

  svg.append('g')
     .attr('transform', `translate (0, ${height})`)
     .call(d3.axisBottom(x));

  const histogram = d3.histogram()
                      .value(d => d.unemployment)
                      .domain(x.domain())
                      .thresholds(x.ticks(70));

  const bins = histogram(data);
  console.log(bins);

  const y = d3.scaleLinear()
              .domain([0, d3.max(bins, (d) => d.length)])
              .range([height, 0]);

  svg.append('g')
     .call(d3.axisLeft(y));

  const selection = svg.selectAll('rect')
     .data(bins)
     .enter()
     .append('rect')
     .attr('id', 'histobin')
     .attr('x', 0)
     .attr('transform', d => `translate(${x(d.x0)}, ${y(d.length)})`)
     .attr('width', d => x(d.x1) - x(d.x0))
     .attr('height', d => height - y(d.length))
     .style('fill', 'black')
     .on('mouseover', (e, d) => {
        tooltip.style('visibility', 'visible');
     })
     .on('mousemove', (e, d) => {
        // const ev = selection.nodes();
        // const i = ev.indexOf(e.currentTarget);
        const min = d3.min(d, d => d.unemployment);
        const max = d3.max(d, d => d.unemployment);
        tooltip
         .style('left', (e.x + 20) + 'px')
         .style('top', (e.y - 50) + 'px')
         .text('' +
               `${(100 * d.length / total).toPrecision(2)} % of Counties fall in \n` +
               `Unemployment Rate: ${min} - ${max} \n`
               );
     })
     .on('mouseout', (d) => {
       tooltip.style('visibility', 'hidden')
     })
     .on('click', (e, d) => {
       const bin = d3.select(e.currentTarget);
       const newColor = bin.style('fill') === 'red'? 'black': 'red';
       bin.style('fill', newColor);

     });


  // svg.select('rect')
  //   .on('mouseover', () => tooltip.style('visibility', 'visible'))
  //   .on('mouseover', () => tooltip.style('font-size', '40px'))
  //   // .on('mousemove', () => tooltip.style('top', '400px').style('left', '400px'))
  //   .on('mouseout', () => tooltip.style('visibility', 'hidden'))

}


// class Histogram extends Component {
//   componentDidMount() {
//     makeD3Graph('container');
//   }

//   componentDidUpdate() {
//   }
//   render(){
//     console.log('Yo 2');
//     return(
//       <>
//         <h2>Histogram Yo</h2>
//         <div id='container'>
//         </div>
//       </>
//     );
//   }
// }




const Histogram = () => {

  useLayoutEffect(() => {
    makeD3Graph('container');
  }, [])

    return(
        <div id='container'>
        <h2>Histogram Yo</h2>
        </div>
    );
}


export default Histogram;
