import mongoose from 'mongoose';

const ProvinceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  image_url: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

ProvinceSchema.virtual('id').get(function() {
  return this._id.toString();
});

ProvinceSchema.set('toJSON', { virtuals: true });
ProvinceSchema.set('toObject', { virtuals: true });

const Province = mongoose.model('Province', ProvinceSchema);
export default Province;
