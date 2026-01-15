import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this product.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  sub: {
    type: String,
    required: [true, 'Please provide a subtitle (e.g. Lyophilized)'],
    maxlength: [60, 'Subtitle cannot be more than 60 characters'],
  },
  category: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please provide a sale price.'],
  },
  costPrice: {
    type: Number,
    default: 0,
    description: 'Cost price for profit calculation',
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    description: 'Alert when stock falls below this number',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Virtual for profit margin
ProductSchema.virtual('profitMargin').get(function() {
  if (this.costPrice > 0) {
    return ((this.price - this.costPrice) / this.price * 100).toFixed(1);
  }
  return 0;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity <= 0) return 'out_of_stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
