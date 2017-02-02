import * as d3 from 'd3';

function fetchList() {
  return fetch('/graphs')
  .then(res => res.json())
}

function fetchStockData(arr) {
  const pInd = arr.map(ind => {
    return fetchStock(ind)
      .then(json => console.log(json))
  })
  return Promise.all(pInd);
}

function fetchStock(ind) {
  return fetch(`/graph/${ind}`)
    .then(res => res.json())
    .then(json => {
      if (!json.dataset) return fetchStock(ind);
      return json
    })
}

function updateDelete(ind) {
  fetch(`/graphs/${ind}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify({data: ind})
  })
}

export { fetchList, fetchStockData, fetchStock, updateDelete }
