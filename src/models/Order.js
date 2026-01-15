import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  quantity: Number,
  price: Number,
});

// Prevent Mongoose recompilation error in development by deleting the model if it exists
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const ShippingAddressSchema = new mongoose.Schema({
  street: String,
  street2: String,
  city: String,
  state: String,
  zip: String,
  country: { type: String, default: 'USA' },
});

const OrderSchema = new mongoose.Schema({
  // Customer Info
  firstName: String,
  lastName: String,
  title: String,
  practiceName: {
    type: String,
    required: [true, 'Practice Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
  },
  phone: String,
  
  // Shipping
  shippingAddress: ShippingAddressSchema,
  shippingOption: {
    type: String,
    default: 'Standard Shipping',
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  
  // Order Details
  items: [OrderItemSchema],
  subtotal: Number,
  total: {
    type: Number,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  
  paymentLink: String,
  
  // Additional
  notes: String,
  referral: String,
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
