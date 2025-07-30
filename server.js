const express = require('express');
const app = express();
const db = require('./db'); // Import the database connection  
config = require('dotenv').config();
const userRoute = require('./routes/userRoute');
const candidateRoute = require('./routes/candidateRoute'); 
// const { jwtMiddleware} = require('./routes/jwt'); // Import JWT middleware 


const bodyParser = require('body-parser');
app.use(bodyParser.json());


app.get('/', function (req, res) {
  res.send('Welcome to the Voting  App');
});

app.use('/user', userRoute); // Use user routes
app.use('/candidate',candidateRoute); // Use candidate routes


const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});