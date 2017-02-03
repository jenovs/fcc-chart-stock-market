import * as d3 from 'd3';

import { getMax } from './helpers';

// console.log(window.innerWidth);
const parseTime = d3.timeParse('%Y-%m-%d');

const svg = d3
  .select('#graph')
  .append('svg')

let w, h, p, l;
function setSizes(data) {
  console.log('setSizes');
  w = window.innerWidth > 960 ? 960 : window.innerWidth;
  h = w * 0.5;
  l = 30;
  p = 50;
  svg
  .attr('width', w)
  .attr('height', h)
  redrawAll(data);
}

let currMax = 0;
let currMin = 0;
let gTimeMinMax = [];
let currColor = 0;

function drawChart(data, xScale, yScale, id, color, resize) {
  console.log('drawChart', color);
  const platform = window.navigator.platform;

  const t = d3.transition().duration(1000);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(3)
    .tickFormat(d3.format('d'))
    .tickSizeInner(-w + p + l)
    .tickSizeOuter(0)
    .tickPadding(10)

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
    .style('transform', 'translate(-20px, 200px)')
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
          // console.log(d3.event.pageX);
          // console.log(d3.event.pageY);
          return d3.event.pageY - 240 + 'px';
        })
        .style('left', d3.event.pageX - 20 + 'px')
    })
    .on('mouseout', d => {
      tooltip
        .transition().duration(200)
        .style('opacity', 0)
    })
    .attr('fill', 'none')
    .attr('data-color', color)
    .attr('stroke', color)
    .attr('stroke-width', 5)

    if (!resize) {
      if (platform !== 'iPhone') {
        chartLayer.selectAll('path')
        .attr('stroke-dasharray', function(d) {return this.getTotalLength()})
        .attr('stroke-dashoffset', function(d) {return this.getTotalLength() * (-1)})
        .transition(t)
        .attr('stroke-dashoffset', 0)
      } else {
        chartLayer.selectAll('path')
        .attr('style', 'opacity: 0')
        .transition(t)
        .attr('style', 'opacity: 1')
      }
    }

    svg
      .append('g')
      .attr('transform', `translate(${p}, ${0})`)
      .attr('class', 'y-axis')
      .call(yAxis)


    // console.log('color', colorScale(currColor));
    currColor = currColor < 20 ? currColor + 1 : 0;
}

/**
* Resizes a graph
* @param {Object} data - Collection of all current lines
*/
function resize(data) {
  console.log('= resize');
  // function drawChart(data, xScale, yScale, id, color, resize) {

  svg.selectAll('path, .y-axis')
    // .transition(t)
    .style('opacity', 0)
    .remove();

  // console.log('setSizes');
  w = window.innerWidth > 960 ? 960 : window.innerWidth;
  h = w * 0.5;
  p = 50;
  svg
  .attr('width', w)
  .attr('height', h)

  for (const d in data) {
    // let max = getMax(data[d].dataset.data);
    // if (max > currMax) currMax = max;
    // console.log(data[d].dataset.data);
    const timeMinMax = d3.extent(data[d].dataset.data, d => parseTime(d[0]))
    const scales = getScales(0, currMax, timeMinMax)
    drawChart(data[d].dataset.data, scales.x, scales.y, d, data[d].graph_color, true)
  }

  // function drawResize(data, xScale, yScale, id, color) {
  //   const t = d3.transition().duration(1000);
  //
  //   const drawLine = d3.line()
  //     .x(d => xScale(parseTime(d[0])))
  //     .y(d => yScale(+d[4]))
  //
  //   const yAxis = d3
  //     .axisLeft(yScale)
  //     .ticks(3)
  //     .tickFormat(d3.format('d'))
  //     .tickSizeInner(-w + p + l)
  //     .tickSizeOuter(0)
  //     .tickPadding(10)
  //
  //   const chartLayer = svg.append('g')
  //
  //   const tooltip = d3
  //     .select('#graph')
  //     .append('div')
  //     .attr('id', 'tooltip')
  //     .attr('class', 'tooltip')
  //     .style('opacity', 0)
  //     .style('position', 'absolute')
  //     .style('transform', 'translateY(200px)')
  //     .style('pointer-events', 'none')
  //
  //   chartLayer.selectAll('.line')
  //     .data([data])
  //     .enter()
  //     .append('path')
  //     .attr('id', id)
  //     .attr('d', drawLine)
  //     .on('mouseover', function() {
  //       tooltip
  //         .transition().duration(100)
  //         .style('opacity', 0.95)
  //
  //       tooltip
  //         .html(this.id)
  //         .style('top', () => {
  //           // console.log(d3.event.pageX);
  //           // console.log(d3.event.pageY);
  //           return d3.event.pageY - 200 + 'px';
  //         })
  //         .style('left', d3.event.pageX + 20 + 'px')
  //     })
  //     .on('mouseout', d => {
  //       tooltip
  //         .transition().duration(200)
  //         .style('opacity', 0)
  //         .remove()
  //     })
  //     .attr('fill', 'none')
  //     .attr('data-color', color)
  //     .attr('stroke', color)
  //     .attr('stroke-width', 5)
  //     // .attr('stroke-dasharray', function(d) {return this.getTotalLength()})
  //     // .attr('stroke-dashoffset', function(d) {return -this.getTotalLength()})
  //     // .transition(t)
  //     // .attr('stroke-dashoffset', 0)
  //
  //   svg
  //     .append('g')
  //     .attr('transform', `translate(${p}, ${0})`)
  //     .attr('class', 'y-axis')
  //     .call(yAxis)
  //
  //
  //     // console.log('color', colorScale(currColor));
  //     currColor = currColor < 20 ? currColor + 1 : 0;
  // }
}

function updateChart(data, fullData) {
  console.log('currMax', currMax);
  // console.log('updateChart, data', data);
  // console.log('updateChart, fullData', fullData);
  const max = getMax(data.dataset.data);
  if (max > currMax) {
    currMax = max;
    return redrawAll(fullData)
  }
  console.log(max);
  const timeMinMax = d3.extent(data.dataset.data, d => parseTime(d[0]));
  const scales = getScales(0, currMax, timeMinMax);
  drawChart(data.dataset.data, scales.x, scales.y, data.dataset.dataset_code, data.graph_color)
}

function updateGraph(data, update) {
  console.log('updateGraph', data);
  console.log('currMax', currMax);
  let max = 0;
  if (update) {
    max = getMax(update.dataset.data)
  } else {
    let tempMax = 0;
    for (let i in data) {
      tempMax = getMax(data[i].dataset.data)
      if (tempMax > max) max = tempMax
    }
  }

  if (!update) currMax = max;
  redrawAll(data);
}

function getScales(min, max, timeMinMax) {
  const scales = {};

  scales.x = d3.scaleTime()
    .range([p, w - l])
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

  svg.selectAll('path, .y-axis')
    .transition(t)
    .style('opacity', 0)
    .remove();

  // currMax = 0;

  // currColor = 0;

  for (const d in data) {
    console.log('redrawAll d', d);
    let max = getMax(data[d].dataset.data);
    if (max > currMax) currMax = max;
    // console.log(data[d].dataset.data);
    const timeMinMax = d3.extent(data[d].dataset.data, d => parseTime(d[0]))
    const scales = getScales(0, currMax, timeMinMax)
    drawChart(data[d].dataset.data, scales.x, scales.y, d, data[d].graph_color)
  }
}

/**
* Deletes a line from graph
* @param {Object} data - Collection of all current lines
* @param {String} name - Line to delete from graph
*/
function deleteLine(data, name) {
  console.log('deleteLine');
  let newMax = 0;

  for (let i in data) {
    const temp = getMax(data[i].dataset.data)
    if (temp > newMax) newMax = temp;
  }

  if (newMax < currMax) {
    currMax = newMax;
    return redrawAll(data);
  } else {
    const t = d3.transition().duration(200);
    svg.select(`#${name}`)
      .transition(t)
      .style('opacity', 0)
      .remove();
  }
}

export { redrawAll, updateChart, deleteLine, updateGraph, setSizes, resize };
