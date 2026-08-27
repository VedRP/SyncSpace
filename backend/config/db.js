const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer = null;

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri || uri === "your_mongodb_connection") {
    console.log("MONGO_URI is missing or placeholder. Starting in-memory MongoDB server...");
    try {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log("In-memory MongoDB server started at:", uri);
    } catch (err) {
      console.error("Failed to start MongoMemoryServer:", err.message);
      throw err;
    }
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    autoIndex: true,
  });

  console.log("MongoDB connected successfully");
}

module.exports = connectDB;

