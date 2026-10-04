import mongoose from 'mongoose';

const ItineraryDaySchema = new mongoose.Schema({
  itinerary_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
    required: true,
  },
  day_number: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

ItineraryDaySchema.virtual('id').get(function() {
  return this._id.toString();
});

ItineraryDaySchema.set('toJSON', { virtuals: true });
ItineraryDaySchema.set('toObject', { virtuals: true });

const ItineraryDay = mongoose.model('ItineraryDay', ItineraryDaySchema);
export default ItineraryDay;
