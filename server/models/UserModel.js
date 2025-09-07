const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters'],
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profile_pic: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxLength: [200, 'Bio cannot exceed 200 characters'],
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  preferences: {
    language: {
      type: String,
      enum: ['english', 'marathi', 'hindi'],
      default: 'english'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// ─── Indexes ───────────────────────────────────────────────────
userSchema.index({ name: 1 });
userSchema.index({ isOnline: 1 });

// ─── Pre-save Hook (with Hash Check) ───────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const isAlreadyHashed = /^\$2[aby]?\$\d{2}\$/.test(this.password);
  if (isAlreadyHashed) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Methods ────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $unset: { lockUntil: 1, loginAttempts: 1 } });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.verificationToken;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

userSchema.statics.findBySearch = function(searchTerm, excludeIds = []) {
  return this.find({
    $and: [
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      },
      { _id: { $nin: excludeIds } }
    ]
  }).select('name email profile_pic isOnline lastSeen');
};

userSchema.statics.getOnlineUsers = function() {
  return this.find({ isOnline: true })
    .select('name profile_pic lastSeen')
    .sort({ lastSeen: -1 });
};

userSchema.methods.updateLastSeen = function() {
  return this.updateOne({ lastSeen: new Date() });
};

// ─── Friend Methods ─────────────────────────────────────────────
userSchema.methods.addFriend = function(friendId) {
  if (!this.friends.includes(friendId)) {
    this.friends.push(friendId);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.removeFriend = function(friendId) {
  this.friends = this.friends.filter(id => !id.equals(friendId));
  return this.save();
};

userSchema.methods.isFriendWith = function(userId) {
  return this.friends.some(friendId => friendId.equals(userId));
};

// ─── Block Methods ──────────────────────────────────────────────
userSchema.methods.blockUser = function(userId) {
  if (!this.blockedUsers.includes(userId)) {
    this.blockedUsers.push(userId);
    this.friends = this.friends.filter(id => !id.equals(userId));
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.unblockUser = function(userId) {
  this.blockedUsers = this.blockedUsers.filter(id => !id.equals(userId));
  return this.save();
};

userSchema.methods.isBlocked = function(userId) {
  return this.blockedUsers.some(blockedId => blockedId.equals(userId));
};

module.exports = mongoose.model('User', userSchema);