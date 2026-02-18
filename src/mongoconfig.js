const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
console.log("process.env.DB_URL", process.env.DB_URL)

let isConnected = false;

mongoose.connect(process.env.DB_URL, {
   useNewUrlParser: true,
   serverSelectionTimeoutMS: 5000,
   autoIndex: false,
   maxPoolSize: 10,
   socketTimeoutMS: 45000,
   family: 4
})
   .then(() => {
      isConnected = true;
      console.log('MongoDB connected successfully');
   })
   .catch((err) => {
      console.error('MongoDB CONNECTION ERROR: ', err.message);
      process.exit(1); // Exit on live if DB fails
   });

module.exports = { isConnected };
