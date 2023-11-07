const router = require('express').Router();
const GROUP = require("../../models/group")
const { now } = require('mongoose');
const USER = require("../../models/user")
const FLOW = require("../../models/flow")
const FLOWSUBMITTED  = require("../../models/flowSubmitted")
const FORM_LAYOUT = require('../../models/formLayout');
const FORM_SUBMITTED = require('../../models/formSubmitted');
const { authenticateToken } = require('../utils/jwt');

router.route('/list').get(async (req, res) => {
try{
    const flows = await FLOW.find({
      estado:true
    });
    res.status(200).json({flows});
}
catch(e){
    console.error("Error: ", e);
    res.status(500).json(error);
}
});

router.route('/listToken').get

(authenticateToken, async (req, res) => {

  try{
    const userId = req.user._id;

      const flows = await FLOW.find({
        estado:true,creadoPor:userId
      });
      res.status(200).json({flows});
  }
  catch(e){
      console.error("Error: ", e);
      res.status(500).json(error);
  }
  });

  

router.route('/find').get(async (req, res) => {
  try{
    const { _id} =    req.query;

      const flow = await FLOW.findById(_id).populate(
        {
          path:'userNivel._id',
          select :'_id nombre apellidoPaterno apellidoMaterno correo'
        }
      );
      res.status(200).json({flow});
  }
  catch(e){
      console.error("Error: ", e);
      res.status(500).json(error);
  }
  });


  router.route('/findSubmitted').get(async (req, res) => {
    try{
      const { _idForm} =    req.query;
  
        const flow = await FLOWSUBMITTED.findOne({idForm:_idForm}).populate({
          path:'iduserEnviado',
          select: 'nombre apellidoPaterno'
        })
        res.status(200).json({flow});
    }
    catch(e){
        console.error("Error: ", e);
        res.status(500).json(error);
    }
    });

    

  

router.route("/register").
post( authenticateToken,
  async (req, res) => {

    try {
      const userId = req.user._id;
      const { nombre,descripcion,tipo,accion,niveles,userNivel,accionAprobacion,accionRechazo} =
        req.body;
      const fechaCreacion = now() ,fechaModificacion = now();
      const estado = true;

      if (await FLOW.findOne({ nombre })) {
        return res.status(400).json({ message: "El nombre del flujo ya existe" });
      }
  
      const flow = await FLOW.create({
        nombre,descripcion,tipo,accion,niveles,userNivel,fechaCreacion,estado,fechaModificacion,accionAprobacion,accionRechazo,creadoPor:userId
      });
  
      
      const { ...flowRegister } = flow.toJSON();
      
      res.status(200).json({ flow: flowRegister });


    } catch (e) {
      console.error("Error: ", e);
      res.status(500).json(error);
    }
  });


  router.route("/delete").post( async (req, res) => {
    try {
      const { _id} =
        req.body;
        const estado = false

        await FLOW.findByIdAndUpdate(_id, {
          estado
        })

      res.status(200).json({ message: 'OK' });


    } catch (e) {
      console.error("Error: ", e);
      res.status(500).json(error);
    }
  });


  router.route("/update").post( async (req, res) => {
    try {
      const { _id, nombre, descripcion} =
        req.body;
        

        await FLOW.findByIdAndUpdate(_id, {
          nombre,descripcion,fechaModificacion:now()
        })

      res.status(200).json({ message: 'OK' });


    } catch (e) {
      console.error("Error: ", e);
      res.status(500).json(error);
    }
  });

  router.route("/listarFormulariosConFlujo").
  get(authenticateToken,
    async (req, res) => {

    try {

      const userId = req.user._id;
      const flujosConUsuario = await FLOW.find({"userNivel._id": userId})
      const idsFlujosConUsuario = flujosConUsuario.map(flow => flow._id);

      const formulariosAsignados = await FORM_LAYOUT.find({ "idFlow": { $in: idsFlujosConUsuario } })
      .select('_id name idFlow')
      .populate({
        path:'idFlow',
        select: '_id nombre'
      }).lean();

      
      const formulariosEnviados = await Promise.all(formulariosAsignados.map(async (form) => {
        const idFormulario = form._id;
        const cantidadEnviados = await FORM_SUBMITTED.find({"idLayout": idFormulario}).count();
        const cantidadPendientes = await FORM_SUBMITTED.find({"idLayout": idFormulario, "revisado": false}).count();
        return {
          ...form,
          formulariosEnviados: cantidadEnviados,
          formulariosPendientes: cantidadPendientes
        };
      }));

      res.status(200).json({ formulariosAsignados: formulariosEnviados });

    } catch (e) {
      console.error("Error: ", e);
      res.status(500).json(error);
    }
  });

  router.route("/listRespuestaFlujo").
  get(async (req, res) => {

    try {
      
      const {_idForm} = req.query

      const FormEnviados = await FORM_SUBMITTED.find({idLayout:_idForm}).populate({
        path: 'userId',
        select: 'nombre apellidoPaterno _id'
      }
      ) 
      .select('_id idLayout revisado fechaCreacion userId')
      res.status(200).json({ FormEnviados });


    } catch (e) {
      console.error("Error: ", e);
      res.status(500).json(error);
    }
  });

  router.route("/enviarRevision").
  post(authenticateToken,
    async (req, res) => {

    try {
      const userId = req.user._id;
      const {idFlow,idForm, firma, comentario, esAprobado, esCompleto, comentariosAdicionales,nivel} = req.body

      const flowSubmitted = await FLOWSUBMITTED.create({
        idFlow, idForm,firma, comentario, esAprobado, esCompleto, comentariosAdicionales,nivel,
        iduserEnviado: userId
      }
      )

      await FORM_SUBMITTED.updateOne({_id: idForm}, {revisado:true, fechaRevision: now()})
      
      const flow_tipo = await FLOW.findOne({idFlow}).select('tipo action aprobador desaprobar').lean()
      
      if(flow_tipo.tipo === 'control'){
        if(flow_tipo.accionAprobacion === 'mensaje' && esAprobado === true){
          //Mandar correo 
        }
        else if(flow_tipo.accionAprobacion === 'noMensaje' && esAprobado === true){
          //No hacer nada
        }
        else if(flow_tipo.accionRechazo === 'reenviar' && esAprobado === false){
          //Enviar mensaje de correo electrónico diciendo que vuelva a realizar el formulario
        }
        else if(flow_tipo.accionRechazo === 'mensaje' && esAprobado === false){
          //Enviar mensaje de correo electrónico mecionando que se ha rechazado la información
        }
        else if(flow_tipo.accionRechazo === 'noMensaje' && esAprobado === false){
          //No hacer nada
        }


      }
      res.status(200).json({flowSubmitted });


    } catch (e) {
      console.error("Error: ", e);
      res.status(500).json(error);
    }
  });

  



module.exports = router;
  
