require('./config/config');

console.log('Process:', process.env.NODE_ENV);

const fs = require('fs');
const path = require('path');

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Chart = require('./models/chart')


const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const {
  API_KEY,
  MONGODB_URI,
  PORT
} = process.env;

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);

const tickerList = fs.existsSync('data.dat') ?
  JSON.parse(fs.readFileSync('data.dat', 'utf8')) :
  [];

function fetchQuotes (ind) {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const url = `https://www.quandl.com/api/v3/datasets/WIKI/${ind}.json?start_date=${y-1}-${m}-${d}&end_date=${y}-${m}-${d}&api_key=${API_KEY}`
  return fetch(url)
}

function fetchData (ind) {
  return Chart.find({ticker: ind})
    .then(data => {
      let chartData;
      let expired = true;
      if (data.length) {
        chartData = JSON.parse(data[0].data);
        expired = Date.now().toString() - data[0].modified > 12 * 3600 * 1000
      }

      if (data.length && !expired) {
        throw chartData;
      } else if (data.length && expired) {
        return Chart.findOneAndRemove({ticker: ind})
          .then(() => fetchQuotes(ind))
          .catch(e => e);
      } else {
        return fetchQuotes(ind)
      }
    })
    .then(data => data.json())
    .then(json => {
      const newChart = new Chart({
        ticker: json.dataset.dataset_code,
        data: JSON.stringify(json),
        modified: Date.now().toString()
      });
      return newChart.save()
        .then(d => JSON.parse(d.data))
    })
    .catch(data => data);
}

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/graphs', (req, res) => {
  res.send(tickerList);
});

app.get('/graph/:ind', (req, res) => {
  fetchData(req.params.ind)
    .then(data => res.send(data))
    .catch(e => res.send({error: 'Error'}))
});

app.put('/graphs/:ind', (req, res) => {
  const index = tickerList.indexOf(req.params.ind.toUpperCase())
  tickerList.splice(index, 1);
  fs.writeFileSync('data.dat', JSON.stringify(tickerList));
  io.emit('line deleted', req.params.ind);
  res.send();
});

app.post('/graphs', (req, res) => {
  if (~tickerList.indexOf(req.body.data)) return res.send({error: 'Duplicate item'});

  fetchData(req.body.data)
    .then(json => {
      if (json.quandl_error) throw new Error(json.quandl_error);
      if (!~tickerList.indexOf(req.body.data) && json.dataset.dataset_code && json.dataset.data.length) {
        tickerList.push(req.body.data);
        fs.writeFileSync('data.dat', JSON.stringify(tickerList));
        io.emit('graph updated', json)
        res.send(json);
      } else {
        res.send({error: 'Duplicate item'});
      }
    })
    .catch(err => res.send(err))
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
