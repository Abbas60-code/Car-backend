import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Sports', 'Electric', 'Luxury', 'SUV', 'Executive'],
      default: 'Sports',
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL or CSS gradient is required'],
    },
    speed: {
      type: String,
      default: '280 km/h',
    },
    acceleration: {
      type: String,
      default: '3.5s',
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      default: 'Automatic',
    },
    fuel: {
      type: String,
      enum: ['Petrol', 'Electric', 'Hybrid', 'Diesel'],
      default: 'Petrol',
    },
    seats: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Maintenance'],
      default: 'Available',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);

export default Car;
