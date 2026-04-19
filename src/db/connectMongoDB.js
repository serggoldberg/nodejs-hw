import mongoose from 'mongoose';
import { Note } from '../models/note.js';

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl); // подключение к MongoDB
    console.log(`✅ MongoDB connection established successfully`);
    await Note.syncIndexes(); // синхронизация индексов схемы Note
    console.log(`✅ Index sync success`);
  } catch (error) {
    console.error(`❌Error connecting to database`, error.message);
    process.exit(1);
  }
};
