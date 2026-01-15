import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name.'],
    unique: true,
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
