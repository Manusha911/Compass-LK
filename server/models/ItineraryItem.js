import mongoose from 'mongoose';

const ItineraryItemSchema = new mongoose.Schema({
  itinerary_day_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ItineraryDay',
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
  start_time: {
    type: String,
    default: null,
  },
  end_time: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    required: true, // e.g. activity, transport, accommodation, food
  },
  cost: {
    type: Number,
    default: null,
  },
  location: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  order_index: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

ItineraryItemSchema.virtual('id').get(function() {
  return this._id.toString();
});

ItineraryItemSchema.set('toJSON', { virtuals: true });
ItineraryItemSchema.set('toObject', { virtuals: true });

const ItineraryItem = mongoose.model('ItineraryItem', ItineraryItemSchema);
export default ItineraryItem;
