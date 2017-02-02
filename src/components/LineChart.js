import { max, min, scaleLinear, scaleTime } from 'd3';
import React from 'react';

import Line from './Line';

const { dataset } = require('./../../sample_response.json');

const x = new Date(dataset.data[0][0]);
const y = new Date(dataset.data[dataset.data.length-1][0])
// console.log(x, y);

const xScale = (props) => (scaleTime()
  .domain([new Date(dataset.data[0][0]), new Date(dataset.data[dataset.data.length-1][0])])
  .range([0, props.width]));

const yScale = (props) => (scaleLinear()
  .domain(200, 1000)
  .range([0, props.height]));

export default (props) => {
  const scales = { xScale: xScale(props), yScale: yScale(props)};
  return (
    <svg height={props.height} width={props.width} style={{backgroundColor: "lightpink"}}>
      <Line {...props} {...scales}/>
    </svg>
  )
};
