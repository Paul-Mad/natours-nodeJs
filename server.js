const mongoose = require('mongoose');
//Set the config.env file to create global variables in the project scope
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

//Get the database connection string from the variables and replace the password in  it
const DB = process.env.DATABASE.replace(
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

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});
