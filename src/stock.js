import React, { useState, useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import './App.css'

const DATAPATH = './aapl.csv'

const margin = {top: 20, right: 30, bottom: 30, left: 40}
const height = 250
const width = 700


async function loadData(){
  const timeParse = d3.timeParse('%b %d, %Y');
  const resp = await d3.csv(DATAPATH, row => {
    const ohl = Array(3).fill().map(() => +row.val + Math.random() * +row.val * 0.05);
    ohl.sort();
    return {
      date: timeParse(row.date),
      upper: ohl[0],
      middle: ohl[1],
      lower: ohl[2],
      close: +row.val
    }
    });
    return resp;
}

const renderLine = (svg, data, x, y) => {
    const line = d3.line()
                   .x(d => x(d.date))
                   .y(d => y(d.close));
    svg.selectAll('path')
       .data([data])
       .join(
         enter => enter.append('path')
                       .style('fill', 'none')
                       .style('stroke', 'steelblue')
                       .style('stroke-width', 1.5)
                       .style('stroke-miterlimit', 1),
         update => update,
         exit => exit.remove()
       )
      .attr('d', line(data));
}

const renderArea = (svg, data, x, y) => {
    const area = d3.area()
                   .x(d => x(d.date))
                   .y0(y(0))
                   .y1(d => y(d.close));

    svg.append('path')
      .style('fill', 'steelblue')
      .style('stroke', 'steelblue')
      .style('stroke-width', 1.5)
      .style('stroke-miterlimit', 1)
      .attr('d', area(data));
}

const renderBand = (svg, data, x, y) => {
    const area = d3.area()
                   .x(d => x(d.date))
                   .y0(d => y(d.lower))
                   .y1(d => y(d.upper));

    svg.append('path')
      .style('fill', 'steelblue')
      .style('stroke', 'steelblue')
      .style('stroke-width', 1.5)
      .style('stroke-miterlimit', 1)
      .attr('d', area(data));
}

const Chart = (props) => {
  const containerRef = useRef(null);




  useLayoutEffect(() => {
    // const svg = d3.select('#chart')
    //               .attr('viewBox', [0, 0, width, height]);
    const svg = d3.select(containerRef.current)
                  .attr('viewBox', [0, 0, width, height]);

    const makeChart = async() =>{
      const data = await loadData();
      console.log(data);


      const x = d3.scaleUtc()
                  .domain(d3.extent(data, d => d.date))
                  .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.upper)])
                  .range([height - margin.bottom, margin.top]);

      const xAxis = g => g.attr('transform',  `translate(0, ${height - margin.bottom})`)
                          .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

      const yAxis = g => g.attr('transform', `translate(${margin.left},0)`)
                          .call(d3.axisLeft(y).ticks(height / 40))
                          .call(g => g.select(".domain").remove())

      if (props.chartType === 'line') {
        renderLine(svg, data, x, y);
      } else if(props.chartType === 'area'){
        renderArea(svg, data, x, y);
      } else if(props.chartType === 'band'){
        renderBand(svg, data, x, y);
      }

      if (svg.select('#xAxis').size() === 0){
        svg.append('g').attr('id', 'xAxis').call(xAxis);
      }
      if (svg.select('#yAxis').size() === 0){
        svg.append('g').attr('id', 'yAxis').call(yAxis);
      }
    }

    const removeChart  = () => {
      if (svg.selectAll('path').size() > 1){
        svg.selectAll('path').remove();
      }
    }
    makeChart();

    return removeChart;

  }, [props.chartType])


  return <svg id="chart" width="100%" height="350" ref={containerRef}></svg>
}

const Stock = () => {

  const [chartType, setChartType] = useState('area');

  return (
    <div>
      <div className="styleNav">
        <ul>
          {
            ['Line', 'Area', 'Band'].map((ctype, i) => {
              return <li onClick={() => setChartType(ctype.toLowerCase())}>{ctype}</li>
            })
          }
        </ul>
      </div>
      <Chart chartType={chartType}/>
    </div>
         )
}

export default Stock;
