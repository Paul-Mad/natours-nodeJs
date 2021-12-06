const mongoose = require('mongoose');
//Set the config.env file to create global variables in the project scope
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// catch Exception errors listener
process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT EXCEPTION - Shutting down...');
  console.log(error.name, error.message);
  process.exit(1);
});

//Get the database connection string from the variables and replace the password in  it
const DB = process.env.DATABASE_LOCAL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Connect to the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection successful!'));

//  START SERVER
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});

// catch unhandled Rejection Promises listener
process.on('unhandledRejection', (error) => {
  console.log('UNHANDLED REJECTION - Shutting down...');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
