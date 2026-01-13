import { Schema, model } from 'harbor/database';

// Define the User schema
const userSchema = new Schema({
  email: {
    type: 'string',
    required: true,
    unique: true,
  },
  name: {
    type: 'string',
    required: true,
  },
  password: {
    type: 'string',
    required: true,
    select: false, // Don't include in query results by default
  },
  role: {
    type: 'string',
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  isActive: {
    type: 'boolean',
    default: true,
  },
  profile: {
    avatar: { type: 'string' },
    bio: { type: 'string' },
  },
  lastLogin: {
    type: 'date',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users',
});

// Virtual for full display name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Hash password here (use bcrypt in production)
    // this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Static method for finding by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance method for comparing passwords
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  // Compare passwords here (use bcrypt in production)
  // return bcrypt.compare(candidatePassword, this.password);
  return candidatePassword === this.password;
};

// Export the model
export const User = model('User', userSchema);

