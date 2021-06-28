const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// ROUTE HANDLERS

//---------------TOURS--------------------------
exports.getAllTours = (req, res) => {
  //send the response with a json using JSend format
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
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
exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
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
