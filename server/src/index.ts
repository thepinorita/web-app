import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Shift from './models/Shift';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // IMPORTANT: Listen on all network interfaces for Render
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mproffigh711_db_user:0VgZC4X1ZOyLc7u8@cluster0.041agih.mongodb.net/shift_planner?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas Cloud'))
  .catch(err => console.error('Could not connect to MongoDB Atlas:', err));

// Get all shifts
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shifts' });
  }
});

// Save shifts for a user
app.post('/api/shifts', async (req, res) => {
  const { userName, selections } = req.body; 
  
  try {
    await Shift.deleteMany({ userName });

    const shiftsToSave = selections.map((s: any) => ({
      userName,
      date: s.date,
      shiftSlot: s.slot,
    }));

    await Shift.insertMany(shiftsToSave);
    res.status(201).json({ message: 'Shifts saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving shifts' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
