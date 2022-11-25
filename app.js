const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Create app
const app = express();

// Improted routes
const userRoutes = require('./routes/userRoutes');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Request information
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use('/api/user', userRoutes);

// Route error handler
app.use((req, res) => {
  res.status(404).json({ error: 'There is no such API route.' });
});

// Connection to db and starting server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Successfully connected to database. Server is listening on port ${process.env.PORT}.`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
