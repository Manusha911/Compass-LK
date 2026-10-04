import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  _id: {
    type: String, // String representation of the User ObjectId
    required: true,
  },
  full_name: {
    type: String,
    default: '',
  },
  avatar_url: {
    type: String,
    default: '',
  },
  interests: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
  _id: false // Disable auto _id since we supply the User's ID as _id
});

// Add virtual 'id' mapping to make it JSON compatible with Supabase structure
ProfileSchema.virtual('id').get(function() {
  return this._id;
});

ProfileSchema.set('toJSON', { virtuals: true });
ProfileSchema.set('toObject', { virtuals: true });

const Profile = mongoose.model('Profile', ProfileSchema);
export default Profile;
