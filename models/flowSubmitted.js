const mongoose = require('mongoose');
const db = require('../db/pool').app();

const flowSubmittedSchema = new mongoose.Schema({
    idFlow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FLOW',
        required: true
    },
    iduserEnviado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: true
    },
    idForm: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'FORM_SUBMITTED',
        required: true
    },
    firma:{
        type:String,
        required: false
    },
    comentario:{
        type:String,
        required: false
    },
    esAprobado:{
        type:Boolean,
        required: false
    },
    esCompleto:{
        type:Boolean,
        required: false
    },
    comentariosAdicionales:{
        type:String,
        required: false
    },
    nivel:{
        type:Number,
        required: false
    }
});
  
  module.exports = db.model('FLOWSUBMITTED', flowSubmittedSchema, 'flowSubmitted');
  