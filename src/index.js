import * as d3 from 'd3';
// import { drawChart, drawSvg } from './drawGraph'
import { redrawAll, updateChart } from './graphPlotter'

const socket = io();

const tickers = [];
const data = {};

socket.on('graph updated', (json) => {
  const name = json.dataset.dataset_code;
  // console.log('name', name);
  data[name] = json;
  updateChart(json, data)
});

// redrawAll();

(function() {
  fetch('/graphs')
  .then(res => res.json())
  .then(json => {
    tickers.push(...json)
    console.log(tickers);
    getStockData();
  })
})();

function getStockData() {
  // console.log('getStockData');
  tickers.forEach(ind => {
    fetchData(ind)
      .then(json => {
        // console.log(json);
        const name = json.dataset.dataset_code;

        // console.log('name', name);
        data[name] = json;
        updateChart(json, data)
        // console.log('data', data);
        // console.log(Object.keys(data));
        // redrawAll(data);
      })
  })
}

function fetchData(ind) {
  console.log('fetching data for', ind);
  return fetch(`/graph/${ind}`)
    .then(res => res.json())
    .then(json => {
      if (!json.dataset) {
        console.log(json);
        return fetchData(ind);
      }
      return Promise.resolve(json);
    });
}
const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);
function handleSubmit(e) {
  e.preventDefault();
  console.log(e.target[0].value);
  const ind = e.target[0].value.replace(/[^a-z\d]/gi, '').toUpperCase();
  console.log(ind);
  if (!ind.length) return;
  console.log('adding');
  fetch('/graphs', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({data: ind})
  })
  .then(res => res.json())
  .then(json => {
    console.log(json);
    if (!json.dataset) return showError(json)
    const name = json.dataset.dataset_code;
    data[name] = json;
    updateChart(json, data)
  })
}

function showError(data) {
  console.log('showing Error');
  console.log(data);
}
