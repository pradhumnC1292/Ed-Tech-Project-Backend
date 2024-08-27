import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "STUDYNOTIONDB",
    })
    .then(() => {
      console.log("DATABASE CONNECTED SUCCESSFULLY....");
    })
    .catch((error) => {
      console.log("Error while connecting server with Database");
      console.log(error);
      process.exit(1);
    });
};
