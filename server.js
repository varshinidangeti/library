const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const server = 'localhost:27017'; // MongoDB server address
const db = 'signupdb'; // Database name

mongoose.connect(`mongodb://${server}/${db}`)

  .then(() => {
    console.log("Database connection is successful");
  })
  .catch((error) => {
    console.error("Database connection failed: " + error);
  });

// Define a schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const newUser = new User({ username, password });

  try {
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) {
    res.status(500).send(err);
  }
});











app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
