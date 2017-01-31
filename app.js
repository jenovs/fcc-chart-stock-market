require('./config/config');

console.log('Process:', process.env.NODE_ENV);

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


const {
  API_KEY,
  PORT
} = process.env;

const data = ['GOOG'];

const fetchData = (ind) => {
  const url = `https://www.quandl.com/api/v3/datasets/WIKI/${ind}.json?start_date=2016-01-01&end_date=2017-01-31&api_key=${API_KEY}`
  return fetch(url)
}

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/graphs', (req, res) => {
  console.log('GET /graphs');
  res.send(data);
});

app.post('/graphs', (req, res) => {
  console.log('in POST /graphs', req.body);
  fetchData(req.body.data)
    .then(res => res.json())
    .then(json => {
      if (json.quandl_error) throw new Error(json.quandl_error);
      data.push(req.body.data);
      io.emit('graph updated', (new Date()))
      res.send(json);
    })
    .catch(err => res.send(err))
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  // socket.emit('ping', {hello: 'world'});

  socket.on('test emit', (msg) => {
    console.log(msg)
    socket.broadcast.emit('notification')
  })
  // io.emit('all', 'message')
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
