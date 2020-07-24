const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 5000;
const { MONGOURI } = require('./Keys');

//MongoDB Schema
require('./models/user');
require('./models/post');

//require Router file
app.use(express.json());
app.use(require('./routes/auth'));
app.use(require('./routes/post'));

//MongoDb connection
mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.log('error in  connecting', err);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

//clg => console.log snippet
