import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Province from '../models/Province.js';
import Destination from '../models/Destination.js';

dotenv.config();

const provincesData = [
  {
    name: 'Central Province',
    description: 'The hill country of Sri Lanka, known for tea plantations, mountains, and cultural heritage sites.',
    image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Southern Province',
    description: 'Famous for its sandy beaches, coastal wildlife, historic colonial forts, and surf spots.',
    image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Western Province',
    description: 'The urban heart of the island, featuring the bustling capital city Colombo, coastal resorts, and shopping.',
    image_url: 'https://images.unsplash.com/photo-1565010629739-16f39ee4bf45?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Uva Province',
    description: 'A land of scenic highlands, waterfalls, rich wildlife sanctuaries, and scenic railways.',
    image_url: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80',
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/compass_lk');
    console.log(`Connected to database for seeding: ${conn.connection.host}`);

    // Clear existing data
    await Province.deleteMany({});
    await Destination.deleteMany({});
    console.log('Cleared existing provinces and destinations.');

    // Seed Provinces
    const seededProvinces = await Province.insertMany(provincesData);
    console.log('Seeded provinces successfully!');

    const centralId = seededProvinces.find(p => p.name === 'Central Province')._id;
    const southernId = seededProvinces.find(p => p.name === 'Southern Province')._id;
    const westernId = seededProvinces.find(p => p.name === 'Western Province')._id;
    const uvaId = seededProvinces.find(p => p.name === 'Uva Province')._id;

    // Seed Destinations
    const destinationsData = [
      {
        name: 'Sigiriya Rock Fortress',
        description: 'An ancient rock fortress and palace ruins in the central Matale District of Sri Lanka, surrounded by the remains of a spacious network of gardens, reservoirs and other structures. Famous for its ancient frescoes.',
        province_id: centralId,
        average_rating: 4.8,
        total_reviews: 2450,
        location_lat: 7.9570,
        location_lng: 80.7603,
        opening_hours: '7:00 AM - 5:30 PM',
        category: 'Cultural',
        destination_images: [
          {
            image_url: 'https://images.unsplash.com/photo-1588598126710-bb97a70a8d67?auto=format&fit=crop&w=1200&q=80',
            caption: 'The majestic lion rock rises above the gardens',
            is_primary: true
          },
          {
            image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
            caption: 'Landscape view of Sigiriya fortress',
            is_primary: false
          }
        ]
      },
      {
        name: 'Temple of the Sacred Tooth Relic',
        description: 'Located in the royal palace complex of the former Kingdom of Kandy, this sacred temple houses the relic of the tooth of the Buddha and is a world-renowned pilgrimage site.',
        province_id: centralId,
        average_rating: 4.7,
        total_reviews: 1890,
        location_lat: 7.2936,
        location_lng: 80.6413,
        opening_hours: '5:30 AM - 8:00 PM',
        category: 'Cultural',
        destination_images: [
          {
            image_url: 'https://images.unsplash.com/photo-1608958223610-d8816c70179a?auto=format&fit=crop&w=1200&q=80',
            caption: 'Entrance to the Temple of the Tooth Relic',
            is_primary: true
          }
        ]
      },
      {
        name: 'Galle Dutch Fort',
        description: 'A historical fortress built by the Portuguese in 1588, then extensively fortified by the Dutch in the 17th century. A beautiful coastal city walk containing colonial arches, cafes, and sea views.',
        province_id: southernId,
        average_rating: 4.6,
        total_reviews: 3120,
        location_lat: 6.0264,
        location_lng: 80.2166,
        opening_hours: 'Open 24 Hours',
        category: 'Historical',
        destination_images: [
          {
            image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
            caption: 'The iconic Galle lighthouse at sunset',
            is_primary: true
          }
        ]
      },
      {
        name: 'Mirissa Beach',
        description: 'One of the most scenic coastal beach strips in Sri Lanka, Mirissa is famous for dolphin and blue whale watching excursions, surfing, palm tree hills, and beachside restaurants.',
        province_id: southernId,
        average_rating: 4.5,
        total_reviews: 1540,
        location_lat: 5.9483,
        location_lng: 80.4716,
        opening_hours: 'Open 24 Hours',
        category: 'Beaches',
        destination_images: [
          {
            image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
            caption: 'Golden sand beaches and pristine blue waters',
            is_primary: true
          }
        ]
      },
      {
        name: 'Nine Arch Bridge',
        description: 'Located in Ella, this spectacular 30-meter high railway bridge is built entirely out of brick and stone without any steel structures. Surrounded by lush tea plantations.',
        province_id: uvaId,
        average_rating: 4.8,
        total_reviews: 2800,
        location_lat: 6.8768,
        location_lng: 81.0608,
        opening_hours: 'Open 24 Hours',
        category: 'Scenic',
        destination_images: [
          {
            image_url: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80',
            caption: 'Train passing over the historic Nine Arch Bridge',
            is_primary: true
          }
        ]
      },
      {
        name: 'Colombo Lotus Tower',
        description: 'Rising 350 meters above the Colombo skyline, this symbolic tower is the tallest self-supported structure in South Asia, containing observation decks, revolving restaurants, and shopping centers.',
        province_id: westernId,
        average_rating: 4.4,
        total_reviews: 1200,
        location_lat: 6.9272,
        location_lng: 79.8562,
        opening_hours: '9:00 AM - 10:00 PM',
        category: 'Modern',
        destination_images: [
          {
            image_url: 'https://images.unsplash.com/photo-1565010629739-16f39ee4bf45?auto=format&fit=crop&w=1200&q=80',
            caption: 'Lotus Tower lighting up the evening skyline',
            is_primary: true
          }
        ]
      }
    ];

    await Destination.insertMany(destinationsData);
    console.log('Seeded destinations successfully!');

    mongoose.connection.close();
    console.log('Seeder process finished. Connection closed.');
  } catch (error) {
    console.error(`Seeder encountered an error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
