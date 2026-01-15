import mongoose from 'mongoose';

const ShippingMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name (e.g. Standard Shipping)'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a shipping cost'],
  },
  deliveryTime: {
    type: String,
    required: [true, 'Please provide estimated delivery time (e.g. 5-7 days)'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ShippingMethod || mongoose.model('ShippingMethod', ShippingMethodSchema);
