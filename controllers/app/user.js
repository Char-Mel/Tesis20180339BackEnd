const router = require('express').Router();
const { now } = require('mongoose');
const USER = require("../../models/user")
const GROUP = require("../../models/group")
const { authenticateToken } = require('../utils/jwt');

router.route('/list').get(async (req, res) => {
  try {
    const users = await USER.find({estado:true});
    res.status(200).json({ users });
  }
  catch (e) {
    console.error("Error: ", e);
    rest.status(500).json(error);
  }
});


router.route('/listToken').get(authenticateToken,
  async (req, res) => {
  try {

    const userId = req.user._id;

    const users = await USER.find({estado:true, creadoPor: userId});
    res.status(200).json({ users });
  }
  catch (e) {
    console.error("Error: ", e);
    rest.status(500).json(error);
  }
});


router.route('/listnotInGroup').get(async (req, res) => {
  try {
    const { _idGroup } = req.query;
    const personasGroup = await GROUP.findById(_idGroup);
    
    // Filtrar participantes inactivos
    const participants = personasGroup.participants.filter(participant => participant.estado);
    const participants_ids = participants.map(participant => participant._id);
    
    const users = await USER.find({
      estado: true,
      _id: { $nin: participants_ids }
    });
    res.status(200).json({ users });
  }
  catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: e.message });
  }
});



router.route('/find').get(async (req, res) => {
  try {
    const { _id } = req.query

    const user = await USER.findById(_id);
    res.status(200).json({ user });
  }
  catch (e) {
    console.error("Error: ", e);
    rest.status(500).json(error);
  }
});



router.route("/register").post(async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, correo, rol, imagen} =
      req.body;
    const fechaCreacion = now();
    const estado = true;


    if (await USER.findOne({ correo })) {
      return res.status(400).json({ message: "Usuario ya registrado" });
    }

    const user = await USER.create({
      nombre, apellidoPaterno, apellidoMaterno, correo, estado, rol, fechaCreacion, imagen
    });


    const { ...userRegister } = user.toJSON();

    res.status(200).json({ user: userRegister });


  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json(error);
  }
});


router.route("/update").post(async (req, res) => {
  try {
    const { _id, nombre, apellidoPaterno, apellidoMaterno, correo, estado, rol,imagen } =
      req.body;


    await USER.findByIdAndUpdate(_id, {
      nombre, apellidoPaterno, apellidoMaterno, correo, estado, rol,imagen
    })

    const user = await USER.findById(_id)

    const { ...userUpdated } = user.toJSON();

    res.status(200).json({ user: userUpdated });


  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json(error);
  }
});

router.route("/delete").post(async (req, res) => {
  try {
    const { _id } =
      req.body;
    const estado = false;

    await USER.findByIdAndUpdate(_id, {
      estado
    })

    const user = await USER.findById(_id)
    const { ...userDeleted } = user.toJSON();

    res.status(200).json({ user: userDeleted });


  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json(error);
  }
});


module.exports = router;

