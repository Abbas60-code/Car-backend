import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = () => {
  // Remove CLOUDINARY_URL if it has placeholder values
  if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.includes('<your_api_key>')) {
    delete process.env.CLOUDINARY_URL;
  }

  cloudinary.config({
    cloud_name: process.env.Cloudname,
    api_key: process.env.Cloudkey,
    api_secret: process.env.Cloudsecret,
  });

  console.log('✅ Cloudinary Configured Successfully!');
};

export { cloudinary, connectCloudinary };
