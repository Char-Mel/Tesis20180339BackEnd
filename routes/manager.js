module.exports = function (app) {
  /****************************** PORTAL WEB ********************************************/
  app.use('/authentication', require('../controllers/app/authentication'));
  app.use('/form', require('../controllers/app/form'));
  app.use('/file', require('../controllers/app/file'));
  app.use('/user', require('../controllers/app/user'));
  app.use('/group', require('../controllers/app/group'));
  app.use('/flow', require('../controllers/app/flow'));
  
};
