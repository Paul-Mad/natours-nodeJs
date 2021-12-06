const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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
// app.use((req, res, next) => {
//   console.log('Middleware message');
//   next();
// });

//add Request time using middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting the routers middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handle the error message if no route is found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); //if any 'next' function is called with an argument, express will assume it is an error and will avoid all other middlewares in the application
});

// ERROR handling middleware
app.use(globalErrorHandler);

module.exports = app;
