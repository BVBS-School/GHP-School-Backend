const mongoose = require('mongoose');
const uri = "mongodb+srv://bvbpschool:HOxGC0elREqYdmFe@bvbs.wnkho.mongodb.net/?retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");
mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch(err => {
        console.error("FAILURE: Could not connect to MongoDB Atlas.");
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        process.exit(1);
    });
