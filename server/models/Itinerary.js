import mongoose from 'mongoose';

const ItinerarySchema = new mongoose.Schema({
  user_id: {
    type: String, // String ID of the User
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  start_date: {
    type: String,
    required: true,
  },
  end_date: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

ItinerarySchema.virtual('id').get(function() {
  return this._id.toString();
});

ItinerarySchema.set('toJSON', { virtuals: true });
ItinerarySchema.set('toObject', { virtuals: true });

const Itinerary = mongoose.model('Itinerary', ItinerarySchema);
export default Itinerary;
