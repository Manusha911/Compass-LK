import mongoose from 'mongoose';

const DestinationImageSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  caption: { type: String, default: '' },
  is_primary: { type: Boolean, default: false }
});

const DestinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
    required: true,
  },
  average_rating: {
    type: Number,
    default: 5.0,
  },
  total_reviews: {
    type: Number,
    default: 0,
  },
  location_lat: {
    type: Number,
    required: true,
  },
  location_lng: {
    type: Number,
    required: true,
  },
  opening_hours: {
    type: String,
    default: 'Open 24 Hours',
  },
  category: {
    type: String,
    default: 'General',
  },
  destination_images: [DestinationImageSchema]
}, {
  timestamps: true,
});

DestinationSchema.virtual('id').get(function() {
  return this._id.toString();
});

DestinationSchema.set('toJSON', { virtuals: true });
DestinationSchema.set('toObject', { virtuals: true });

const Destination = mongoose.model('Destination', DestinationSchema);
export default Destination;
