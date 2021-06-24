const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) ROUTE HANDLERS

//---------------TOURS--------------------------
const getAllTours = (req, res) => {
  //send the response with a json using JSend format
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const id = +req.params.id;

  // find the tour by the id sent in the parameter
  const tour = tours.find((item) => item.id === id);

  //check if the id is greater than the array and return 'not found' status
  // if (id > tours.length)
  //if tour is null ou empty, return 'not found' status
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      message: 'Invalid ID',
    });
  }
  //send the response with a json using JSend format
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
};
const createTour = (req, res) => {
  //get the id of the last tour and add 1 to get the new tour id
  const newId = tours[tours.length - 1].id + 1;
  // create a variable using the object from the req.body and the id of the new tour
  const newTour = { ...req.body, id: newId };
  //add newTour to the tours array
  tours.push(newTour);

  //overwrite the tours file with the new array of tours converting JSON to string
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour: newTour },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: '<Updated tour...>' },
  });
};

const deleteTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      message: 'Invalid ID',
    });
  }
  //status 204 = 'no content'
  res.status(204).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null,
  });
};

//----------------USERS -----------

const getAllUsers = (req, res) => {
  res.status(500).json({
    sstatus: 'error',
    message: 'This route is no yet defined',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    sstatus: 'error',
    message: 'This route is no yet defined',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    sstatus: 'error',
    message: 'This route is no yet defined',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    sstatus: 'error',
    message: 'This route is no yet defined',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is no yet defined',
  });
};

// 3) ROUTES

// //Listen to GET requests on tours endpoint
// app.get('/api/v1/tours', getAllTours);
// //GET request using parameter to receive only a tour by ID
// app.get('/api/v1/tours/:id', getTour);
// //Listen to POST requests on tours endpoint
// app.post('/api/v1/tours', createTour);
// //Patch request to update a tour by ID
// app.patch('/api/v1/tours/:id', updateTour)
// //Delete request to update a tour by ID
// app.delete('/api/v1/tours/:id', deleteTour)

const tourRouter = express.Router();
const userRouter = express.Router();

//chaining requests on routes
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// Mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 4) START SERVER

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});
