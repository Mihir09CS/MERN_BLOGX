const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    dbName: "Blog_APP_X",
  });

  isConnected = true;
  console.log("MongoDB Connected:", conn.connection.host);
};

module.exports = connectDB;
