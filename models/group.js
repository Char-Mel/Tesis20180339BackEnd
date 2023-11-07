const mongoose = require('mongoose');
const db = require('../db/pool').app();


const groupSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion:{
        type: String,
        required: true
    },
    participants: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'USER',
                required: true

            },
            estado: {
                type: Boolean,
                required: true
            },
            fechaCreacion:{
                type:Date,
                required:true
            }
        }
    ]
    ,
    estado:{
        type:Boolean,
        require:true
    },
    fechaCreacion:{
        type:Date,
        required:true
    },
    creadoPor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: true
    }
})
  
  module.exports = db.model('GROUP', groupSchema, 'group');
  