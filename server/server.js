import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import { protect } from './middleware/auth.js';

// Mongoose Models
import User from './models/User.js';
import Profile from './models/Profile.js';
import Province from './models/Province.js';
import Destination from './models/Destination.js';
import Itinerary from './models/Itinerary.js';
import ItineraryDay from './models/ItineraryDay.js';
import ItineraryItem from './models/ItineraryItem.js';

// Config env
dotenv.config();

// Connect Database
connectDB();

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(cors());

// Token Generator Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'compasslksecretkey', {
    expiresIn: '30d',
  });
};

// ─── AUTHENTICATION ENDPOINTS ───

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ email, password });
    
    // Create linked Profile
    await Profile.create({
      _id: user._id.toString(),
      full_name: full_name || '',
      avatar_url: '',
      interests: []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      session: {
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user._id.toString(),
          email: user.email,
        }
      },
      user: {
        id: user._id.toString(),
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({
        session: {
          access_token: token,
          token_type: 'bearer',
          user: {
            id: user._id.toString(),
            email: user.email,
          }
        },
        user: {
          id: user._id.toString(),
          email: user.email,
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User Profile Info
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
app.put('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.full_name = req.body.full_name !== undefined ? req.body.full_name : profile.full_name;
    profile.avatar_url = req.body.avatar_url !== undefined ? req.body.avatar_url : profile.avatar_url;
    profile.interests = req.body.interests !== undefined ? req.body.interests : profile.interests;

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ─── DATA COLLECTION ENDPOINTS ───

// Provinces List
app.get('/api/provinces', async (req, res) => {
  try {
    const provinces = await Province.find().sort({ name: 1 });
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Destinations List
app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find().populate('province_id').sort({ name: 1 });
    res.json(destinations.map(d => {
      // Re-map populate payload to return nested 'provinces' object key to match Supabase's 'provinces (*)'
      const doc = d.toJSON();
      doc.provinces = doc.province_id;
      return doc;
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Destination Detail
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id).populate('province_id');
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    const doc = dest.toJSON();
    doc.provinces = doc.province_id;
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ─── ITINERARIES ENDPOINTS ───

// List User Itineraries
app.get('/api/itineraries', async (req, res) => {
  const userId = req.query.user_id;
  try {
    const query = userId ? { user_id: userId } : {};
    const itineraries = await Itinerary.find(query).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch Single Nested Itinerary with Days and Items
app.get('/api/itineraries/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const days = await ItineraryDay.find({ itinerary_id: itinerary._id }).sort({ day_number: 1 });
    
    // Map items onto each day
    const mappedDays = await Promise.all(days.map(async (day) => {
      const items = await ItineraryItem.find({ itinerary_day_id: day._id }).sort({ order_index: 1 });
      const dayDoc = day.toJSON();
      dayDoc.itinerary_items = items;
      return dayDoc;
    }));

    const result = itinerary.toJSON();
    result.itinerary_days = mappedDays;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Itinerary
app.post('/api/itineraries', async (req, res) => {
  try {
    const itinerary = await Itinerary.create(req.body);
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Itinerary
app.put('/api/itineraries/:id', async (req, res) => {
  try {
    const itin = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(itin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Itinerary (Cascade manually)
app.delete('/api/itineraries/:id', async (req, res) => {
  try {
    const days = await ItineraryDay.find({ itinerary_id: req.params.id });
    const dayIds = days.map(d => d._id);

    // Delete nested items, days, and itinerary
    await ItineraryItem.deleteMany({ itinerary_day_id: { $in: dayIds } });
    await ItineraryDay.deleteMany({ itinerary_id: req.params.id });
    await Itinerary.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Itinerary deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ─── ITINERARY DAYS ENDPOINTS ───

// Add Itinerary Days (Accepts single day or array of days)
app.post('/api/itinerary-days', async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const days = await ItineraryDay.insertMany(req.body);
      res.status(201).json(days);
    } else {
      const day = await ItineraryDay.create(req.body);
      res.status(201).json(day);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Itinerary Day
app.put('/api/itinerary-days/:id', async (req, res) => {
  try {
    const day = await ItineraryDay.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(day);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ─── ITINERARY ITEMS ENDPOINTS ───

// Add Itinerary Item
app.post('/api/itinerary-items', async (req, res) => {
  try {
    const item = await ItineraryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Itinerary Item
app.put('/api/itinerary-items/:id', async (req, res) => {
  try {
    const item = await ItineraryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Itinerary Item
app.delete('/api/itinerary-items/:id', async (req, res) => {
  try {
    await ItineraryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Itinerary item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
