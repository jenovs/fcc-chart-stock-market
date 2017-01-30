require('./config/config');

console.log('Process:', process.env.NODE_ENV);

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
// const passport = require('passport');
// const session = require('express-session');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const {
  PORT,
} = process.env;

// mongoose.Promise = global.Promise;
// mongoose.connect(MONGODB_URI);

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/ticker/:name', (req, res) => {
  const url = `https://www.bing.lv/?q=${req.params.name}+ticker+symbol`
  // const url = `http://www.nasdaq.com/symbol/?Load=true&Search=${req.params.name}`
  fetch(url)
    .then(res => res.text())
    .then(text => {
      // console.log(text);
      const result = {};
      // For bing search
      const data = /([A-Z]+)(?:<\/strong>)?(?: : Summary for )(?:<strong>)?([A-Za-z\d\s]+)/g.exec(text)

      // const re = /(www.nasdaq.com\/symbol\/)(.+)(">)(.+)(<\/a>)/g
      // const reName = new RegExp(req.params.name, 'gi')
      // let data;
      // while (data = re.exec(text)) {
      //
      //   console.log('found', data[2], data[4]);
      //   // re.
      // }

      // const data = /(www.nasdaq.com\/symbol)(\/.+)(<\/a>)/g.exec(text)
      // console.log(data.length);
      // data.forEach(i => console.log(i))

      if (data) {
        // const ticker = data[0].match(/[A-Z]+/)
        // console.log(ticker[0]);
        res.send({
          name: data[2],
          ticker: data[1]
        })
      } else {
        res.send({
          error: 'Nothing found'
        })
      }
    })
    .catch(err => console.log(err))
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
