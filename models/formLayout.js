const mongoose = require('mongoose');
const db = require('../db/pool').app();
const FRECUENCY = ['restriccion', 'noRestriccion'];

const inputSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // Setear a true
  },
  idFlow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FLOW',
    required: false, // Setear a true,
  },
  frecuency: {
    type: String,
    enum: FRECUENCY, // TODO: Add frecuency enum
    required: false, // Setear a true,
  },
  asignaciones: [
    {
      tipo: {
        type: String,
        required: false, // Setear a true,
      },
      nombres: {
        type: String,
        required: false, // Setear a true,
      },
      _idGrupo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GROUP',
        required: false,
      },
      _idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: false,
      },
      detalle:{
        type: String,
        required:false, // Setear a true
      }
    },
  ],
  description: {
    type: String,
    required: false,
  },
  limiteInferior: {
    type: String,
    required: false,
  },
  limiteSuperior: {
    type: String,
    required: false,
  },
  estado:{
    type : Boolean,
    required: false
  },
  creadoPor:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: false, // Setear a true
}
});

module.exports = db.model('FORM', inputSchema, 'form');
