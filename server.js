const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { databaseUrl } = require('./config');

// Initializations
const app = express();
app.use(cors());

// Database
mongoose
  .connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => console.log('DB is connected'))
  .catch((err) => console.error(err));

// Settings

app.use(express.static('public'));

// Middlewares

app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Origin, Accept'
  );
  next();
});

app.use(express.json());

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
require('./routes/manager')(app);

const PORT = process.env.PORT || 4000;

// Server is listening
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
