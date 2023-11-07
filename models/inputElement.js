const mongoose = require('mongoose');
const db = require('../db/pool').app();

const TYPES = [
  'number',
  'phone',
  'date',
  'time',
  'datetime',
  'file',
  'text',
  'email',
  'address',
  'checkbox',
  'select',
  'table',
  'money',
  'computed',
  'symbol',
  'decimal'
];

const TYPESALERTA = ['done', 'range']
const inputElementSchema = new mongoose.Schema({
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
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
  },
  decimals: {
    type: Number,
    required: false,
  },
  minValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  maxValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  step: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  options: {
    type: [
      {
        _id: false,
        id: String,
        label: String,
      },
    ],
    required: false,
  },
  columns: {
    type: [
      {
        _id: false,
        id: String,
        headerName: String,
        headerType: String,
        options: {
          type: [
            {
              _id: false,
              id: String,
              label: String,
            },
          ],
          required: false,
        },
      },
    ],
    required: false,
  },
  formula: {
    type: String,
    required: false,
  },
  order: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    required: true,
  },
  alerta: {
    type: Boolean,
    required: false
  },
  mensaje: {
    type: String,
    required: false
  },
  correo: {
    type: String,
    required: false
  },
  // Para enteros y decimales
  tipoAlerta: {
    type: String,
    enum: TYPESALERTA,
    required: false
  },
  // Para enteros
  numDigits: {
    type: Number,
    required: false
  },
  // Para decimales
  numDecimals: {
    type: Number,
    required: false
  },

  // Para telefono
  codPais: {
    type: String,
    required: false
  },
  // Para fecha
  dateFormat: {
    type: String,
    required: false
  },

  // Para hora
  hourFormat: {
    type: String,
    required: false
  }
});

module.exports = db.model('INPUTELEMENT', inputElementSchema, 'inputElement');
