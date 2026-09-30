const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection currently being established
  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI environment variable is missing."
    );
  }

  console.log("Connecting to MongoDB...");

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((mongooseInstance) => {
      console.log(
        `MongoDB connected: ${mongooseInstance.connection.name} @ ${mongooseInstance.connection.host}`
      );

      return mongooseInstance;
    })
    .catch((error) => {
      // Allow another attempt if this connection failed
      connectionPromise = null;

      console.error(
        "MongoDB connection failed:",
        error.message
      );

      throw error;
    });

  await connectionPromise;

  return mongoose.connection;
};

module.exports = connectDB;