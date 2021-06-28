const app = require('./app');

//  START SERVER

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});
