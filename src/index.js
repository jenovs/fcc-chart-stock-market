import * as graph from './graphPlotter';
import * as api from './api';
import { assignColor } from './helpers';
import tickerBox from './components/TickerBox';

const socket = io();

const tickers = [];
const gData = {};

socket.on('graph updated', (json) => {
  const name = json.dataset.dataset_code;
  tickers.push(name);
  gData[name] = json;
  addNewData(json, name)
  graph.updateGraph(gData);
  addDiv(name, gData[name].graph_color);
});

socket.on('line deleted', (ind) => {
  deleteDiv(ind);
});

;(function() {
  console.log('Platform:', window.navigator.platform);

  const form = document.querySelector('form');
  form.addEventListener('submit', handleSubmit);

  graph.setSizes(gData);
  window.addEventListener('resize', graph.resize.bind(null, gData))

  api.fetchList()
    .then(json => tickers.push(...json))
    .then(() => {
      renderTickerDivs(tickers)
      tickers.forEach(ind => {
        api.fetchStock(ind)
          .then(data => renderData(data, ind))
      })
    })

  function renderData(json, name) {
    addNewData(json, name)
    graph.updateChart(json, gData);
    const price = json.dataset.data[0][4];
    highlightDiv(name);
  }
})()


function addNewData(json, name) {
  gData[name] = json;
  gData[name].graph_color = assignColor();
}

function highlightDiv(id) {

  const color = gData[id].graph_color;
  const name = gData[id].dataset.name;
  const price = gData[id].dataset.data[0][4];

  const x = document.getElementById(`id_${id}`)
    x.innerHTML = tickerBox(id, price, name)
    x.setAttribute('style', `background-color: ${color}`)
    x.querySelector('.ticker-delete')
      .addEventListener('click', emitDelete.bind(null, id))
}

function addDiv(name, color) {

  const parentDiv = document.getElementById('symb');
  const childDiv = document.createElement('div');

  childDiv.setAttribute('id', `id_${name}`);
  childDiv.setAttribute('class', 'ticker');
  parentDiv.appendChild(childDiv);

  highlightDiv(name)
}

function emitDelete(id) {
  api.updateDelete(id);
}

function renderTickerDivs(tickers) {
  tickers.forEach(ticker => {
    const parentDiv = document.getElementById('symb');
    const childDiv = document.createElement('div');

    childDiv.innerHTML = tickerBox(ticker);
    parentDiv.appendChild(childDiv);
    childDiv.setAttribute('style', `background-color: #aaa`)
    childDiv.setAttribute('id', `id_${ticker}`)
    childDiv.setAttribute('class', 'ticker')
  })
}

function handleSubmit(e) {
  e.preventDefault();
  const ind = e.target[0].value.replace(/[^a-z\d]/gi, '').toUpperCase();
  if (!ind.length) return;
  e.target[0].value = '';
  fetch('/graphs', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({data: ind})
  })
  .then(res => res.json())
  .then(json => {
    if (!json.dataset) return showError(json)
  })
}

function showError(data) {
  const toastDiv = document.getElementById('toast');
  toastDiv.innerHTML = `<p>Duplicate item or no data found!</p>`
  setTimeout(() => {
    toastDiv.innerHTML = ''
  }, 3000)
}

function deleteTicker(name) {
  tickers.splice(tickers.indexOf(name), 1);
  api.updateDelete(name);
}

function deleteDiv(name) {
  const parentDiv = document.getElementById('symb');
  const currentDiv = document.getElementById(`id_${name}`);
  parentDiv.removeChild(currentDiv);
  delete gData[name];
  tickers.splice(tickers.indexOf(name), 1);
  graph.deleteLine(gData, name)
}
