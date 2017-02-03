import * as graph from './graphPlotter';
import * as api from './api';
import { assignColor } from './helpers';
import tickerBox from './components/TickerBox';

const socket = io();

const tickers = [];
const gData = {};
// let currColor = -1;

socket.on('graph updated', (json) => {
  console.log('= socket, graph updated');
  const name = json.dataset.dataset_code;
  tickers.push(name);
  gData[name] = json;
  addNewData(json, name)
  graph.updateGraph(gData);
  addDiv(name, gData[name].graph_color);
});

socket.on('line deleted', (ind) => {
  console.log('= socket, line deleted');
  deleteDiv(ind);
});

;(function() {
  console.log('= Initial IIFE');

  // console.log('user agent', window.navigator.platform, window.navigator.vendor);
  // const toastDiv = document.getElementById('toast');
  // toastDiv.innerHTML = `<p>${window.navigator.platform}</p>`
  // setTimeout(() => {
  //   toastDiv.innerHTML = ''
  // }, 3000)

  graph.setSizes(gData);
  window.addEventListener('resize', graph.resize.bind(null, gData))

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
    console.log('= renderData');
    addNewData(json, name)
    graph.updateChart(json, gData);
    const price = json.dataset.data[0][4];
    highlightDiv(name);
  }
})()


function addNewData(json, name) {
  console.log('= addNewData');
  gData[name] = json;
  gData[name].graph_color = assignColor();
}

function highlightDiv(id) {
  console.log('= highlightDiv');

  const color = gData[id].graph_color;
  const name = gData[id].dataset.name;
  const price = gData[id].dataset.data[0][4];

  const x = document.getElementById(`id_${id}`)
  // console.log(typeof x);
    x.innerHTML = tickerBox(id, price, name)
    x.setAttribute('style', `background-color: ${color}`)
    x.querySelector('.ticker-delete')
      .addEventListener('click', emitDelete.bind(null, id))
    // console.log('x', x.querySelector('.ticker-delete'));
}

function addDiv(name, color) {
  console.log('= addDiv', name, color);
  const parentDiv = document.getElementById('symb');
  const childDiv = document.createElement('div');
  childDiv.setAttribute('id', `id_${name}`);
  childDiv.setAttribute('class', 'ticker');
  parentDiv.appendChild(childDiv);
  // const div = document.getElementById('symb');
  // console.log(div[0]);
  // div.innerHTML = `<div id=id_${name} class="ticker"></div>`

  highlightDiv(name)
}

function emitDelete(id) {
  console.log('= emitDelete');
  api.updateDelete(id);
}

function renderTickerDivs(tickers) {
  console.log('= renderTickerDivs');
  tickers.forEach(ticker => {
    // console.log(ticker);
    // console.log(gData);
    const parentDiv = document.getElementById('symb');
    const childDiv = document.createElement('div');

    // childDiv.addEventListener('click', deleteDiv.bind(this, ticker))

    childDiv.innerHTML = tickerBox(ticker);
    parentDiv.appendChild(childDiv);
    childDiv.setAttribute('style', `background-color: #aaa`)
    // childDiv.setAttribute('style', 'border: 5px solid transparent')
    childDiv.setAttribute('id', `id_${ticker}`)
    childDiv.setAttribute('class', 'ticker')
  })
}



const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  console.log('= handleSubmit');
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
  console.log('= showError');
  const toastDiv = document.getElementById('toast');
  toastDiv.innerHTML = `<p>Duplicate item or no data found!</p>`
  setTimeout(() => {
    toastDiv.innerHTML = ''
  }, 3000)
}



function deleteTicker(name) {
  console.log('= deleteTicker');
  tickers.splice(tickers.indexOf(name), 1);
  api.updateDelete(name);
  console.log('deleteDiv tickers', tickers);
}

function deleteDiv(name) {
  console.log('= deleteDiv');
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

  console.log('deleteDiv tickers', tickers);
  // graph.redrawAll(data);
  console.log(gData);
  graph.deleteLine(gData, name)
}
