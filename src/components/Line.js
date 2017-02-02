const { dataset } = require('./../../sample_response.json');


// console.log(dataset.column_names);
// console.log(dataset.data); // 4 close
import * as d3 from 'd3';
import React from 'react';

// dataset.data.forEach(i => console.log(i[0], i[4]));
// const parseTime = d3.timeParse('%d-%b-%y');
const parseTime = d3.timeParse('%Y-%m-%d');

const data = dataset.data.map(d => {
  const temp = [];
  temp.push(parseTime(d[0]));
  temp.push(+d[4]);
  return temp;
})

export default (props) => {
  const line = d3.line()
    .x(d => props.xScale(d[0]))
    .y(d => d[4]);
    console.log(line);

  const { path } = props;
  return (<path
    d={line}
    data={[dataset.data]} />)
}
