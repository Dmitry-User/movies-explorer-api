require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const router = require('./routes');
const limiter = require('./middlewares/limiter');
const cors = require('./middlewares/cors');
const handleError = require('./middlewares/handle-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { MONGO_URL, PORT } = require('./utils/config');

mongoose.connect(MONGO_URL);

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
