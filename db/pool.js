const mongoose = require('mongoose');
const { databaseUrl } = require('../config');
const mainPool = mongoose.createConnection(databaseUrl);
const app = mainPool.useDb('Tesis2BD');

module.exports = {
  app: () => app,
};
