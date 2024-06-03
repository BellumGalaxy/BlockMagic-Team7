import mongoose from "mongoose";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

const connect = async () => {
  console.log(MONGODB_URI);
  if (!MONGODB_URI) {
    console.error("MongoDB URI not provided");
    return;
  }
  const connectionState = mongoose.connection.readyState;
  if (connectionState === 1) {
    console.log("Already connected to MongoDB");
    return;
  }
  if (connectionState === 2) {
    console.log("Connecting");
    return;
  }
  try {
    mongoose.connect(MONGODB_URI ?? "", {
      dbName: "chainlinkdbd",
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

export default connect;
