const router = require('express').Router();
const { now } = require('mongoose');
const GROUP = require("../../models/group")
const { authenticateToken } = require('../utils/jwt');

router.route('/list').get(async (req, res) => {
  try {
    const groups = await GROUP.find({ estado: true }); // Filtra por estado true
    const groupsWithQuantity = groups.map(group => {
      const activeParticipants = group.participants.filter(participant => participant.estado === true);
      const quantityOfActiveParticipants = activeParticipants.length > 0 ? activeParticipants.length : 0;
      return { ...group._doc, quantityOfActiveParticipants };
    });

    res.status(200).json({ groupsWithQuantity });
  }
  catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: e });
  }
});


router.route('/listToken').get(
  authenticateToken,
  async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await GROUP.find({ estado: true, creadoPor: userId}); // Filtra por estado true
    const groupsWithQuantity = groups.map(group => {
      const activeParticipants = group.participants.filter(participant => participant.estado === true);
      const quantityOfActiveParticipants = activeParticipants.length > 0 ? activeParticipants.length : 0;
      return { ...group._doc, quantityOfActiveParticipants };
    });

    res.status(200).json({ groupsWithQuantity });
  }
  catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: e });
  }
});




router.route("/register").post(authenticateToken,async (req, res) => {
  try {
    const userId = req.user._id;
    const { nombre, descripcion } = req.body;
    const estado = true;
    const fechaCreacion = now();
    if (await GROUP.findOne({ nombre })) {
      return res.status(400).json({ message: "El nombre de grupo ya existe" });
    }

    const group = await GROUP.create({
      nombre, descripcion, estado, fechaCreacion, creadoPor: userId
    });

    const groupRegister = { ...group.toJSON(), quantityOfActiveParticipants: 0 };

    res.status(200).json({ group: groupRegister });

  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json(error);
  }
});




router.route('/find').get(async (req, res) => {
  try {
    const { _id } = req.query
    const group = await GROUP.findById(_id).populate(
      {
        path: 'participants._id',
        select: '_id nombre apellidoPaterno apellidoMaterno correo'
      }
    );

    // Filtrar los participantes con estado true
    
    const participants = group.participants.filter(participant => participant.estado === true);

    // Crear un nuevo objeto de grupo con la lista de participantes filtrados
    const filteredGroup = {
      ...group._doc,
      participants
    };

    res.status(200).json({ group: filteredGroup });
  }
  catch (e) {
    console.error("Error: ", e);
    res.status(500).json(error);
  }
});


router.route("/delete").post(async (req, res) => {
  try {
    const { _id } = req.body;
    const estado = false;

    await GROUP.findByIdAndUpdate(_id, {
      estado
    });

    const group = await GROUP.findById(_id)
    
  
    const cant = group.participants ? group.participants.length : 0;
    const groupDeleted = {...group.toJSON(), quantityOfActiveParticipants: cant }

    res.status(200).json({group:groupDeleted});

  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: e });
  }
});


router.route("/addUser").post(async (req, res) => {
  try {
    const { _idArray, _idGroup } = req.body;

    const group = await GROUP.findById(_idGroup);

    if (!group) {
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    const estado = true;
    const fechaCreacion = now();

    const newParticipants = _idArray.map(_id => {
      return {
        _id,
        estado,
        fechaCreacion
      };
    });

    const updatedParticipants = [...group.participants, ...newParticipants];

    await GROUP.findByIdAndUpdate(_idGroup, {
      participants: updatedParticipants
    });

    
    const groupdatedGroupup = await GROUP.findById(_idGroup).populate(
      {
        path: 'participants._id',
        select: '_id nombre apellidoPaterno apellidoMaterno correo'
      }
    );

    const participants = groupdatedGroupup.participants.filter(participant => participant.estado === true);

    // Crear un nuevo objeto de grupo con la lista de participantes filtrados
    const filteredGroup = {
      ...group._doc,
      participants
    };


    res.status(200).json({ group: filteredGroup });

  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: e });
  }
});


router.route("/deleteUser").post(async (req, res) => {
  try {
    const { _idUserDelete, _idGroup } = req.body;
    
    
    await GROUP.updateOne(
      {
        _id: _idGroup,
        "participants._id": _idUserDelete,
        "participants.estado":true
      },
      {
        $set: { "participants.$.estado": false }
      }
    );



    const group = await GROUP.findById(_idGroup);

    res.status(200).json({ group });

  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: e });
  }
});





module.exports = router;

