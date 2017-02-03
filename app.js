require('./config/config');

console.log('Process:', process.env.NODE_ENV);

const fs = require('fs');
const path = require('path');

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Chart = require('./models/chart')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Stocks');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const {
  API_KEY,
  PORT
} = process.env;

const data = fs.existsSync('data.dat') ?
  JSON.parse(fs.readFileSync('data.dat', 'utf8')) :
  [];

const fetchData = (ind) => {
  console.log('in fetchData', ind);
  const dt = new Date();
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const url = `https://www.quandl.com/api/v3/datasets/WIKI/${ind}.json?start_date=${y-1}-${m}-${d}&end_date=${y}-${m}-${d}&api_key=${API_KEY}`
  return fetch(url)
}

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/graphs', (req, res) => {
  console.log('GET /graphs');
  res.send(data);
});

app.get('/graph/:ind', (req, res) => {
  // const date = new Date();

  Chart.find({ticker: req.params.ind})
    .then(data => {
      let chartData;
      let expired = true;
      if (data.length) {
        chartData = JSON.parse(data[0].data);
        expired = Date.now().toString() - data[0].modified > 12 * 3600 * 1000
      }

      if (data.length && !expired) {
        res.send(chartData)
      } else if (data.length && expired) {
        return Chart.findOneAndRemove({ticker: req.params.ind})
          .then(() => fetchData(req.params.ind))
          .catch(e => e);
      } else {
        return fetchData(req.params.ind)
      }
    })
    .then(data => data.json())
    .then(json => {
      const newChart = new Chart({
        ticker: json.dataset.dataset_code,
        data: JSON.stringify(json),
        modified: Date.now().toString()
      });
      newChart.save()
        .then(d => res.send(JSON.parse(d.data)))
        .catch(e => res.send(json));
      // console.log((new Date() - date)/1000, 's');
    })
    .catch(err => {
      res.status(500).send()
    });
});

app.put('/graphs/:ind', (req, res) => {
  const index = data.indexOf(req.params.ind.toUpperCase())
  data.splice(index, 1);
  fs.writeFileSync('data.dat', JSON.stringify(data));
  io.emit('line deleted', req.params.ind);
  res.send();
});

app.post('/graphs', (req, res) => {
  console.log('in POST /graphs', req.body);
  if (~data.indexOf(req.body.data)) return res.send({error: 'Duplicate item'});
  fetchData(req.body.data)
    .then(res => res.json())
    .then(json => {
      if (json.quandl_error) throw new Error(json.quandl_error);
      if (!~data.indexOf(req.body.data)) {
        data.push(req.body.data);
        fs.writeFileSync('data.dat', JSON.stringify(data));
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

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.emit('test emit')

  socket.on('test emit', (msg) => {
    console.log(msg)
    socket.broadcast.emit('notification')
  });
  // io.emit('all', 'message')
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
