const mongoose = require('mongoose');
const db = require('../db/pool').app();

const inputSchema = new mongoose.Schema({
  idLayout: {
    type: String,
    ref: 'FORM',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'USER',
    required: true,
  },
  answers: {
    type: [
      {
        _id: false,
        idElement: String,
        typeElement: String,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    required: true,
    default: [],
  },
  revisado:{
    type: Boolean,
    requerid : false
  },
  fechaCreacion:{
    type: Date,
    requerid : false
  },
  fechaRevision:{
    type: Date,
    requerid : false
  },
  revision:{
    type :mongoose.Schema.Types.ObjectId,
    ref : 'FLOWSUMITTED',
    requerid: false
  }
});

module.exports = db.model('FORMSUBMITTED', inputSchema, 'formSubmitted');
