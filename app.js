const fs = require('fs');
const express = require('express');

const app = express();

//use a middleware to use json
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//Listen to GET requests on tours endpoint
app.get('/api/v1/tours', (req, res) => {
  //send the response with a json using JSend format
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

//Listen to POST requests on tours endpoint
app.post('/api/v1/tours', (req, res) => {
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
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});
