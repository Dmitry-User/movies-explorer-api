require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const router = require('./routes');
const limiter = require('./middlewares/limiter');
const cors = require('./middlewares/cors');
const handleError = require('./middlewares/handle-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { MONGO_URL_DEV } = require('./utils/config');

const {
  PORT = 3000,
  NODE_ENV,
  MONGO_URL_PROD,
} = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL_PROD : MONGO_URL_DEV);

const app = express();

app.use(limiter);
app.use(cors);
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(requestLogger);
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(handleError);

app.listen(PORT);
