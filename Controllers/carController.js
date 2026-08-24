import Car from '../Models/Car.js';
import { cloudinary } from '../Config/cloudinary.js';

// Get all cars
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: cars.length, data: cars });
  } catch (error) {
    console.error('❌ getCars Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cars', error: error.message });
  }
};

// Get single car
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    res.status(200).json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching car', error: error.message });
  }
};

// Create new car (with optional Cloudinary image upload)
export const createCar = async (req, res) => {
  try {
    const { name, brand, type, pricePerDay, speed, acceleration, transmission, fuel, seats, status, description, image: imageUrl } = req.body;

    if (!name || !brand) {
      return res.status(400).json({ success: false, message: 'Car name and brand are required.' });
    }

    let finalImageUrl = imageUrl || 'linear-gradient(135deg, #1e1e24 0%, #a82c35 100%)';

    // Handle file upload if present
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'velocity_cars' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        const mime = req.file.mimetype || 'image/jpeg';
        finalImageUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const car = await Car.create({
      name,
      brand,
      type: type || 'Sports',
      pricePerDay: Number(pricePerDay) || 300,
      image: finalImageUrl,
      speed: speed || '280 km/h',
      acceleration: acceleration || '3.5s',
      transmission: transmission || 'Automatic',
      fuel: fuel || 'Petrol',
      seats: Number(seats) || 4,
      status: status || 'Available',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Car added to fleet successfully!',
      data: car,
    });
  } catch (error) {
    console.error('❌ createCar Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create car', error: error.message });
  }
};

// Update car
export const updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    let updatedData = { ...req.body };

    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'velocity_cars' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        updatedData.image = uploadResult.secure_url;
      } catch (uploadError) {
        const mime = req.file.mimetype || 'image/jpeg';
        updatedData.image = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    car = await Car.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Car updated successfully!',
      data: car,
    });
  } catch (error) {
    console.error('❌ updateCar Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update car', error: error.message });
  }
};

// Delete car
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    await car.deleteOne();
    res.status(200).json({ success: true, message: 'Car removed from fleet successfully' });
  } catch (error) {
    console.error('❌ deleteCar Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete car', error: error.message });
  }
};
