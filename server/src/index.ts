import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Shift from './models/Shift';
import Admin from './models/Admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0'; 
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mproffigh711_db_user:0VgZC4X1ZOyLc7u8@cluster0.041agih.mongodb.net/shift_planner?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ADMIN MIDDLEWARE ---
const verifyAdmin = async (req: any, res: any, next: any) => {
  const { adminPassword } = req.headers;
  const admin = await Admin.findOne();
  if (admin && admin.password === adminPassword) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Invalid Admin Password' });
  }
};

// --- SHIFT ROUTES ---
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shifts' });
  }
});

app.post('/api/shifts', async (req, res) => {
  const { userName, selections } = req.body; 
  if (!userName || !selections) return res.status(400).json({ message: 'Missing data' });
  try {
    await Shift.deleteMany({ userName });
    const shiftsToSave = selections.map((s: any) => ({ userName, date: s.date, shiftSlot: s.slot }));
    await Shift.insertMany(shiftsToSave);
    res.status(201).json({ message: 'Shifts saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving shifts' });
  }
});

// Admin: Delete all shifts
app.delete('/api/admin/shifts', verifyAdmin, async (req, res) => {
  try {
    await Shift.deleteMany({});
    res.json({ message: 'All shifts cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing shifts' });
  }
});

// --- ADMIN MANAGEMENT ROUTES ---
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  const admin = await Admin.findOne();
  if (admin && admin.password === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Wrong password' });
  }
});

app.post('/api/admin/update-password', verifyAdmin, async (req, res) => {
  const { newPassword } = req.body;
  try {
    let admin = await Admin.findOne();
    if (admin) {
      admin.password = newPassword;
      await admin.save();
    } else {
      await Admin.create({ password: newPassword });
    }
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Initialize default admin password if none exists
const initAdmin = async () => {
  const admin = await Admin.findOne();
  if (!admin) {
    await Admin.create({ password: 'admin123' }); // Default password
    console.log('Default admin password created: admin123');
  }
};
initAdmin();

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
