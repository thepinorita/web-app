import mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  password: string;
}

const AdminSchema: Schema = new Schema({
  password: { type: String, required: true },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
