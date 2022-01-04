const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
console.log(process.env.NODE_ENV);

//  ::: GLOBAL MIDDLEWARES :::

//Set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  //request logger
  app.use(morgan('dev'));
}

//  LIMIT REQUESTS FROM A SINGLE IP ADDRESS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Body parser to json (with size limit)
app.use(express.json({ limit: '10kb' }));

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parametre pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//create my own middleware
// app.use((req, res, next) => {
//   console.log('Middleware message');
//   next();
// });

//add Request time using middleware (TEST MIDDLEWARE)
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
