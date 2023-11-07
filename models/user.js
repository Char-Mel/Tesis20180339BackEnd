const mongoose = require('mongoose');
const db = require('../db/pool').app();
const ROL = ['admin', 'executer','viewonly']
const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidoPaterno:{
        type: String,
        required: true
    },
    apellidoMaterno:{
        type: String,
        required: true
    },
    correo:{
        type: String,
        required: true
    },
    estado:{
        type: Boolean,
        required: true
    },
    rol:{
        type: String,
        enum:ROL,
        required: true
    },
    fechaCreacion:{
        type: Date,
        required: true
    },
    imagen:{
        filename:{
            type: String,
            required: false
        },
        originalname:{
            type: String,
            required: false
        }
    }
});
  
  module.exports = db.model('USER', userSchema, 'user');
  