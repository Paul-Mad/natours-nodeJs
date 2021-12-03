const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
console.log(process.env.NODE_ENV);

//  MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
  //request logger
  app.use(morgan('dev'));
}

//use a middleware to use json body
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

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

// Mounting the routers middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
