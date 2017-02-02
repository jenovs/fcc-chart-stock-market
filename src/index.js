// import * as d3 from 'd3';
// import { drawChart, drawSvg } from './drawGraph'
// import { redrawAll, updateChart, deleteLine } from './graphPlotter'
import * as graph from './graphPlotter';
import * as api from './api';
import { assignColor } from './helpers';

const socket = io();

const tickers = [];
const gData = {};
// const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
let currColor = -1;

socket.on('graph updated', (json) => {
  const name = json.dataset.dataset_code;
  tickers.push(name);
  gData[name] = json;
  addColor(json, name)
  graph.updateGraph(gData);
  addDiv(name, gData[name].graph_color);
  // const name = json.dataset.dataset_code;
  // // console.log('name', name);
  // data[name] = json;
  // graph.updateChart(json, data)
});
;(function() {
  graph.setSizes(gData);
  window.addEventListener('resize', graph.setSizes.bind(null, gData))

  api.fetchList()
    .then(json => tickers.push(...json))
    // .then(() => api.fetchStockData(tickers))
    .then(() => {
      renderTickerDivs(tickers)
      tickers.forEach(ind => {
        api.fetchStock(ind)
          .then(data => renderData(data, ind))
      })
    })

  function renderData(json, name) {
    addColor(json, name)
    graph.updateChart(json, gData);
    const price = json.dataset.data[0][4];
    highlightDiv(name, json.graph_color, json.dataset.name, price);
  }

})()


function addColor(json, name) {
  gData[name] = json;
  gData[name].graph_color = assignColor();
}

function highlightDiv(id, color, name, price) {
  console.log('highlightDiv', id, color, name, price);
  document.getElementById(`id_${id}`)
    .setAttribute('style', `background-color: ${color}`)
}

function renderTickerDivs(tickers) {
  console.log('renderTickerDivs');
  tickers.forEach(ticker => {
    console.log(ticker);
    const parentDiv = document.getElementById('symb');
    const childDiv = document.createElement('div');
    childDiv.addEventListener('click', deleteDiv.bind(this, ticker))
    childDiv.innerHTML = ticker;
    parentDiv.appendChild(childDiv);
    childDiv.setAttribute('style', `background-color: #eee`)
    childDiv.setAttribute('id', `id_${ticker}`)
  })
}

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  console.log(e.target[0].value);
  const ind = e.target[0].value.replace(/[^a-z\d]/gi, '').toUpperCase();
  console.log(ind);
  if (!ind.length) return;
  e.target[0].value = '';
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
  })
}

function showError(data) {
  console.log('showing Error');
  console.log(data);
}

function addDiv(name, color) {
  console.log('addDiv', name, color);
  // const color = json.;
  const parentDiv = document.getElementById('symb');
  const childDiv = document.createElement('div');
  childDiv.addEventListener('click', deleteDiv.bind(this, name))
  childDiv.innerHTML = name;
  parentDiv.appendChild(childDiv);

  childDiv.setAttribute('style', `background-color: ${color}`)
  childDiv.setAttribute('id', `id_${name}`)
  // setTimeout(updateColors, 1000);
}

// function updateColors() {
//   console.log('updateColors, tickers', tickers);
//   tickers.forEach((t, i) => {
//     console.log('colorScale', colorScale(i));
//     const color = document.getElementById(t).dataset.color;
//     console.log('color', color, t);
//     document.getElementById(`id_${t}`)
//       .setAttribute('style', `background-color: ${color}`)
//   })
// }

function deleteDiv(name) {
  console.log('deleteDiv');
  console.log('tickers', tickers);
  console.log('name', name);

  // console.log(data);
  // graph.deleteLine(name, data);
  // TODO

  const parentDiv = document.getElementById('symb');
  const currentDiv = document.getElementById(`id_${name}`);
  parentDiv.removeChild(currentDiv);
  delete gData[name];
  tickers.splice(tickers.indexOf(name), 1);
  api.updateDelete(name);
  console.log('deleteDiv tickers', tickers);
  // graph.redrawAll(data);
  console.log(gData);
  graph.deleteLine(gData, name)
}
