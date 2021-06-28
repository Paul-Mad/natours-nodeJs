const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//  MIDDLEWARES

app.use(morgan('dev'));

//use a middleware to use json body
app.use(express.json());

//create my own middleware
app.use((req, res, next) => {
  console.log('Middleware message');
  next();
});

//add Request time using middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting the routers middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
