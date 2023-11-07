const mongoose = require('mongoose');
const db = require('../db/pool').app();

const TYPES = ['header', 'subheader', 'separator'];

const uiElementSchema = new mongoose.Schema({
  idLayout: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: TYPES,
    required: true,
  },
  label: {
    type: String,
    required: false,
  },
  image: {
    type: {
      filename: String,
      originalname: String,
    },
    required: false,
  },
  margin: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  order: {
    type: String,
    required: true,
  },
});

module.exports = db.model('UIELEMENT', uiElementSchema, 'uiElement');
