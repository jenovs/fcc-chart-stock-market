const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const ChartSchema = new Schema({
  ticker: {
    type: String,
    unique: true
  },
  data: String,
  modified: String
});

module.exports = mongoose.model('chart', ChartSchema);
