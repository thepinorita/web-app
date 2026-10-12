import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Shift from './models/Shift';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0'; 

// Simplified URI without appName for better compatibility
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mproffigh711_db_user:0VgZC4X1ZOyLc7u8@cluster0.041agih.mongodb.net/shift_planner?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:');
    console.error(err);
  });

app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching shifts', error: err });
  }
});

app.post('/api/shifts', async (req, res) => {
  const { userName, selections } = req.body; 
  
  if (!userName || !selections) {
    return res.status(400).json({ message: 'Missing userName or selections' });
  }

  try {
    console.log(`Saving shifts for user: ${userName}`);
    await Shift.deleteMany({ userName });

    const shiftsToSave = selections.map((s: any) => ({
      userName,
      date: s.date,
      shiftSlot: s.slot,
    }));

    await Shift.insertMany(shiftsToSave);
    console.log('✅ Shifts saved successfully');
    res.status(201).json({ message: 'Shifts saved successfully' });
  } catch (err) {
    console.error('❌ Save Error:');
    console.error(err);
    res.status(500).json({ message: 'Error saving shifts', error: err });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
