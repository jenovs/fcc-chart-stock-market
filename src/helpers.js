import * as d3 from 'd3';

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
let currColor = -1;

function getMax(arr) {
  let max = 0;
  arr.forEach(d => {
    if (d[1] > max) max = d[1];
  });
  return max;
}

function assignColor() {
  currColor = currColor > 9 ? 0 : currColor + 1;
  return colorScale(currColor);
}

export { getMax, assignColor }
