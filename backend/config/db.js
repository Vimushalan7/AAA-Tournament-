import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/ff_tournament';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do NOT call process.exit(1) — it crashes the entire Vercel serverless function
    throw error;
  }
};

export default connectDB;
