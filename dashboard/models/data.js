const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  value: Number,
  category: String,
  metric: String
});

module.exports = mongoose.model('Data', dataSchema);