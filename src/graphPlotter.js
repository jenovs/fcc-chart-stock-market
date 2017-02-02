import * as d3 from 'd3';

import { getMax } from './helpers';

const w = 1000;
const h = 500;
const p = 50;

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const parseTime = d3.timeParse('%Y-%m-%d');

const svg = d3
  .select('#graph')
  .append('svg')
  .attr('width', w)
  .attr('height', h)

let currMax = 0;
let currMin = 0;
let timeMinMax = [];
let currColor = 0;

function drawChart(data, xScale, yScale, id) {
  const t = d3.transition().duration(1000);

  const drawLine = d3.line()
    .x(d => xScale(parseTime(d[0])))
    .y(d => yScale(+d[4]))

  const chartLayer = svg.append('g')

  const tooltip = d3
    .select('#graph')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('transform', 'translateY(200px)')
    .style('pointer-events', 'none')

  chartLayer.selectAll('.line')
    .data([data])
    .enter()
    .append('path')
    .attr('id', id)
    .attr('d', drawLine)
    .on('mouseover', function() {
      tooltip
        .transition().duration(100)
        .style('opacity', 0.95)

      tooltip
        .html(this.id)
        .style('top', () => {
          console.log(d3.event.pageX);
          console.log(d3.event.pageY);
          return d3.event.pageY - 200 + 'px';
        })
        .style('left', d3.event.pageX + 20 + 'px')
    })
    .on('mouseout', d => {
      tooltip
        .transition().duration(200)
        .style('opacity', 0)
    })
    .attr('fill', 'none')
    .attr('data-color', colorScale(currColor))
    .attr('stroke', colorScale(currColor))
    .attr('stroke-width', 5)
    .attr('stroke-dasharray', function(d) {return this.getTotalLength()})
    .attr('stroke-dashoffset', function(d) {return -this.getTotalLength()})
    .transition(t)
    .attr('stroke-dashoffset', 0)


    // console.log('color', colorScale(currColor));
    currColor = currColor < 20 ? currColor + 1 : 0;
}

function updateChart(data, fullData) {
  console.log('currMax', currMax);
  const max = getMax(data.dataset.data);
  if (max > currMax) {
    currMax = max;
    return redrawAll(fullData)
  }
  console.log(max);
  const timeMinMax = d3.extent(data.dataset.data, d => parseTime(d[0]));
  const scales = getScales(0, currMax, timeMinMax);
  drawChart(data.dataset.data, scales.x, scales.y, data.dataset.dataset_code)
}

function getScales(min, max, timeMinMax) {
  const scales = {};

  scales.x = d3.scaleTime()
    .range([0, w])
    .domain(timeMinMax);

  scales.y = d3.scaleLinear()
    .range([p, h-p])
    .domain([max, 0]);

  return scales;
}

function redrawAll(data) {
  console.log('redrawAll');
  // console.log(data);
  const t = d3.transition().duration(200);

  svg.selectAll('path')
    .transition(t)
    .style('opacity', 0)
    .remove();

  currColor = 0;

  for (const d in data) {
    console.log(d);
    let max = getMax(data[d].dataset.data);
    if (max > currMax) currMax = max;
    // console.log(data[d].dataset.data);
    const timeMinMax = d3.extent(data[d].dataset.data, d => parseTime(d[0]))
    const scales = getScales(0, currMax, timeMinMax)
    drawChart(data[d].dataset.data, scales.x, scales.y, d)
  }
}

export { redrawAll, updateChart };
