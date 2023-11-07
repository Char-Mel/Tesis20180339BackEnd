const router = require('express').Router();
const FORM_LAYOUT = require('../../models/formLayout');
const FLOW = require('../../models/flow');
const FORM_SUBMITTED = require('../../models/formSubmitted');
const INPUT_ELEMENT = require('../../models/inputElement');
const UI_ELEMENT = require('../../models/uiElement');
const UI_TYPES = ['header', 'subheader', 'separator'];
const { authenticateToken } = require('../utils/jwt');
const nodemailer = require('nodemailer');
const USER = require("../../models/user");
const { now } = require('mongoose');

router.route('/user').get(async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      // Add validation if the userId has access to the form
      let form = await FORM_LAYOUT.find({ _id: id });
      const inputElements = await INPUT_ELEMENT.find({ idLayout: id });
      const uiElements = await UI_ELEMENT.find({ idLayout: id });

      const elements = [...inputElements, ...uiElements].sort(
        (elementA, elementB) => elementA.order - elementB.order
      );

      form = await form[0].toJSON();

      res.status(200).json({ ...form, idLayout: id, elements });
    } else {
      res.status(400).json({ error: 'Missing idLayout' });
    }
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});

router.route('/admin').get(async (req, res) => {
  try {
    const forms = await FORM_LAYOUT.find().populate({
      path: 'idFlow',
      select: '_id nombre',
    });

    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});

router.route('/find').get(async (req, res) => {
  try {
    const { _id } = req.query

    const form = await FORM_LAYOUT.findById(_id).populate({
      path: 'idFlow',
      select: '_id nombre',
    });

    res.status(200).json({ form });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});

router.route('/delete').post(async (req, res) => {
  try {
    const { _id } = req.body

    const form = await FORM_LAYOUT.findById(_id).update({
      estado: false
    });

    res.status(200).json({ form });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});


router.route('/adminToken').get(authenticateToken,async (req, res) => {
  try {
    const userId = req.user._id;

    const forms = await FORM_LAYOUT.find({estado:true,creadoPor:userId}).populate({
      path: 'idFlow',
      select: '_id nombre',
    });

    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});


router.route('/revisor').get(authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.query;

    const forms = await FORM_LAYOUT.findOne({
      id: id,
    });

    
      const flow = await FLOW.findOne({
        _id: forms.idFlow,
        'userNivel._id': userId,
      });

      const ga = flow ? true : false
      res.status(200).json({ revisor : ga });

  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});



router.route('/accesosFormulario').
get(authenticateToken,
  async (req, res) => {
    
  try {
    const userId = req.user._id;
    const { idLayout } = req.query;

    const forms = await FORM_LAYOUT.find({
      _id: idLayout, 
      'asignaciones._idUsuario':userId    
    })
    
    const acceso = forms.length > 0 ? true: false

    

    res.status(200).json({ acceso });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});


router.route('/layout').post(authenticateToken,async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      idFlow,
      frecuency,
      users,
      elements,
      asignaciones,
      description,
      limiteInferior,
      limiteSuperior
    } = req.body;

    const formLayout = await FORM_LAYOUT.create({
      name,
      idFlow,
      frecuency,
      users,
      asignaciones,
      description,
      limiteInferior,
      limiteSuperior,
      creadoPor:userId,
      estado:true,
      
    });

    const { ...formLayoutCreated } = await formLayout.toJSON();
    const idLayout = formLayoutCreated._id;

    const inputElementsToCreate = [];
    const uiElementsToCreate = [];

    elements.forEach((element) => {
      const { type, id } = element;
      const elementToCreate = {
        idLayout,
        ...element,
        order: id,
      };

      delete elementToCreate.id;

      if (UI_TYPES.includes(type)) {
        uiElementsToCreate.push(elementToCreate);
      } else {
        inputElementsToCreate.push(elementToCreate);
      }
    });

    const elementsToCreatePromises = [];
    elementsToCreatePromises.push(
      INPUT_ELEMENT.insertMany(inputElementsToCreate)
    );

    elementsToCreatePromises.push(UI_ELEMENT.insertMany(uiElementsToCreate));

    await Promise.all(elementsToCreatePromises);

    res.status(200).json({ form: formLayoutCreated });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});

router.route('/submitted').post(
  authenticateToken,
  async (req, res) => {
  try {
    const userId = req.user._id;
    const { idLayout, answers } = req.body;

    const formSubmitted = await FORM_SUBMITTED.create({
      idLayout,
      userId,
      answers,
      fechaCreacion: now(),
      revisado: false
    });

    const { ...formSubmittedCreated } = await formSubmitted.toJSON();
    const idformSubmitted = formSubmittedCreated._id;



    res.status(200).json({ status: 'OK', id: idformSubmitted });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});


router.route('/done').get(
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      const form = await FORM_SUBMITTED.find({userId})
        .select('revisado fechaCreacion fechaRevision idLayout')
        .populate({
          path:'idLayout',
          select: 'name'
        })
        .lean();

      const modifiedForm = form.map(item => {
        const { idLayout, ...rest } = item;
        return {
          ...rest,
          nombreForm: idLayout.name // Reemplaza idLayout con el nombre
        };
      });
  
      res.status(200).json({ form: modifiedForm });
    } catch (error) {
      console.error('Error: ', error);
      res.status(500).json({ error });
    }
  }
);



router.route('/user/submitted').get(async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      // Add validation if the userId has access to the form
      let formSubmitted = await FORM_SUBMITTED.findById(id).populate();

      formSubmitted = await formSubmitted.toJSON();
      const { idLayout, answers } = formSubmitted;

      let form = await FORM_LAYOUT.findById(idLayout).populate({
        path:'idFlow',
        select: '_id tipo accion accionAprobacion accionRechazo'
      });

      form = await form.toJSON();
      const inputElements = await INPUT_ELEMENT.find({ idLayout }).lean();
      const uiElements = await UI_ELEMENT.find({ idLayout }).lean();

      let elements = [...inputElements, ...uiElements].sort(
        (elementA, elementB) => elementA.order - elementB.order
      );

      elements = elements.map((element) => {
        const formAnswer = answers.find(
          (answer) => answer.idElement === element._id.toString()
        );
        return {
          ...element,
          valid: true,
          value: formAnswer.value,
          requiredAlert: false,
        };
      });

      res.status(200).json({ name: form.name, idLayout, elements, flow: form.idFlow, revisado: formSubmitted.revisado });
    } else {
      res.status(400).json({ error: 'Missing idLayout' });
    }
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error });
  }
});

router
  .route('/formulariosHabilitados')
  .get(authenticateToken, async (req, res) => {
    try {
      const userId = req.user._id;

      const forms = await FORM_LAYOUT.find({
        'asignaciones._idUsuario': userId,
        estado:true
      });

      res.status(200).json({ forms });
    } catch (error) {
      console.error('Error: ', error);
      res.status(500).json({ error });
    }
  });


  router.route('/enviarcorreo').post(
    authenticateToken,
    async (req, res) => {
    const userId = req.user._id;
    
    const { correo, nombreCampo, mensaje, minValue, maxValue, value, idLayout } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pruebastesis3@gmail.com',  // Tu dirección de correo
        pass: 'ohgg oicf wbhh rmcw'        // Tu contraseña
      }
    });

    const formInfo = await FORM_LAYOUT.findOne({idLayout:idLayout}).select('name').lean()
    const usuario_recepcion = await USER.findOne({correo:correo}).select('nombre apellidoPaterno').lean()
    const usuario_enviado= await USER.findOne({_id:userId}).select('nombre apellidoPaterno').lean()

    
    const asunto = `Limites excedidos dentro del formulario ${formInfo.name}\n`

    const mensaje_enviar = 
`Estimado Usuario, ${usuario_recepcion.nombre} ${usuario_recepcion.apellidoPaterno}.
 El usuario ${usuario_enviado.nombre} ${usuario_enviado.apellidoPaterno} ha registrado el formulario ${formInfo.name}. 
 Los valores dentro del campo ${nombreCampo} que tienen un rango entre ${minValue} y ${maxValue} ha sido registrado en ${value}.
 Por favor tomar medidas correctivas. 
    
 Adicionalmente al configurar el formulario se dejó el siguiente mensaje: 
 ${mensaje}`

    const mailOptions = {
      from: 'pruebastesis3@gmail.com',
      to: correo,
      subject: asunto,
      text: mensaje_enviar
    };


    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error('Error al enviar el correo:', error);
        res.status(400).json({ error: error });
      } else {
        console.log('Correo enviado:', info.response);
        res.status(200).json({msg: "Alerta enviada"});
      }
    });
    

  });

module.exports = router;
