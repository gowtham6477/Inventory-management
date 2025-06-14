

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


module.exports = mongoose;