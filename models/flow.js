const mongoose = require('mongoose');
const db = require('../db/pool').app();
const TYPE = ['control', 'solicitud', 'soporte']
const ACTION = ['firma', 'firmaComentario', 'comentario']
const APROBAR = ['mensaje', 'noMensaje']
const DESAPROBAR = ['reenviar', 'mensaje', 'noMensaje']

const flowSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion:{
        type:String,
        required: true
    },
    tipo:{
        type: String,
        enum:TYPE,
        required: true
    },
    accion:{
        type: String,
        enum:ACTION,
        required: true
    },
    niveles:{
        type: Number,
        required : true
    },
    userNivel:[{
        nivel:{
            type: Number,
            required : true
        },
        _id:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: true
        }
    }],
    accionAprobacion:
    {
        type: String,
        enum: APROBAR,
        required: false
    },
    accionRechazo:
    {
        type: String,
        enum: DESAPROBAR,
        required: false
    },

    fechaCreacion:{
        type: Date,
        required: true
    },
    fechaModificacion:{
        type:Date,
        required:true
    },
    estado:{
        type:Boolean,
        required:true
    },
    creadoPor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: true
    }

});
  
  module.exports = db.model('FLOW', flowSchema, 'flow');
  