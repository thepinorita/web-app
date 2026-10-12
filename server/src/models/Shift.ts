import mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  userName: string;
  date: string; // YYYY-MM-DD
  shiftSlot: string; // 'first', 'second', 'third'
}

const ShiftSchema: Schema = new Schema({
  userName: { type: String, required: true },
  date: { type: String, required: true },
  shiftSlot: { type: String, required: true },
});

export default mongoose.model<IShift>('Shift', ShiftSchema);
