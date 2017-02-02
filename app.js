require('./config/config');

console.log('Process:', process.env.NODE_ENV);

const fs = require('fs');
const path = require('path');

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

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
  console.log('in fetchData');
  const url = `https://www.quandl.com/api/v3/datasets/WIKI/${ind}.json?start_date=2016-01-01&end_date=2017-01-31&api_key=${API_KEY}`
  return fetch(url)
}

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/graphs', (req, res) => {
  console.log('GET /graphs');
  res.send(data);
});

app.get('/graph/:ind', (req, res) => {
  const date = new Date();
  console.log(req.params.ind);
  fetchData(req.params.ind)
    .then(data => data.json())
    .then(json => {
      console.log((new Date() - date)/1000, 's');
      res.send(json)
    })
    .catch(err => res.status(500).send());
});

app.put('/graphs/:ind', (req, res) => {
  const index = data.indexOf(req.params.ind.toUpperCase())
  data.splice(index, 1);
  fs.writeFileSync('data.dat', JSON.stringify(data));
  res.send();
});

app.post('/graphs', (req, res) => {
  console.log('in POST /graphs', req.body);
  fetchData(req.body.data)
    .then(res => res.json())
    .then(json => {
      if (json.quandl_error) throw new Error(json.quandl_error);
      if (!~data.indexOf(req.body.data)) {
        data.push(req.body.data);
        fs.writeFileSync('data.dat', JSON.stringify(data));
      }
      io.emit('graph updated', json)
      res.send(json);
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
