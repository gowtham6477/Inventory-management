const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const usersRouter = require('./routes/users');

const app = express();





app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', usersRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
