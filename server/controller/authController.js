const sanitizeUser = require('../utils/sanitizeUser');
const UserModel = require('../models/UserModel');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );
};

// Register (explicitly hash password)
const register = async (req, res) => {
  try {
    const { name = '', email = '', password = '' } = req.body;

    if (!name.trim() || !email.trim() || !password) {
      return sendErrorResponse(res, 400, "All fields are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendErrorResponse(res, 400, "User already exists");
    }

    // Explicitly hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();

    const token = generateToken(newUser);

    sendSuccessResponse(res, 201, "User registered successfully", {
      user: sanitizeUser(newUser),
      token
    });
  } catch (error) {
    console.error("[Register] Error:", error);
    sendErrorResponse(res, 500, "Registration failed");
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;

    if (!email.trim() || !password) {
      return sendErrorResponse(res, 400, "Email and password are required");
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: sanitizedEmail }).select('+password');

    console.log('[Login Attempt]', {
      email: sanitizedEmail,
      userExists: !!user,
      receivedPassword: !!password,
      hasPasswordInDB: !!user?.password
    });

    if (!user || !password || !user.password) {
      console.error('❌ Invalid login: missing fields');
      return sendErrorResponse(res, 401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn('⚠️ Password mismatch');
      return sendErrorResponse(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user);

    await UserModel.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date()
    });

    return sendSuccessResponse(res, 200, "Login successful", {
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("[Login] Error:", error);
    return sendErrorResponse(res, 500, "Login failed");
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, 400, "Both current and new password are required");
    }

    if (newPassword.length < 6) {
      return sendErrorResponse(res, 400, "New password must be at least 6 characters long");
    }

    const user = await UserModel.findById(req.user.id).select('+password');
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendErrorResponse(res, 401, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    sendSuccessResponse(res, 200, "Password updated successfully");
  } catch (error) {
    console.error("[UpdatePassword] Error:", error);
    sendErrorResponse(res, 500, "Failed to update password");
  }
};

// Update email
const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.includes('@')) {
      return sendErrorResponse(res, 400, "Please provide a valid email address");
    }

    const existingUser = await UserModel.findOne({ email: newEmail.toLowerCase().trim() });
    if (existingUser) {
      return sendErrorResponse(res, 400, "This email is already in use");
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    user.email = newEmail.toLowerCase().trim();
    await user.save();

    sendSuccessResponse(res, 200, "Email updated successfully");
  } catch (error) {
    console.error("[UpdateEmail] Error:", error);
    sendErrorResponse(res, 500, "Failed to update email");
  }
};

// Update preferences
const updatePreferences = async (req, res) => {
  try {
    const { language, theme } = req.body;

    const validLanguages = ['english', 'marathi', 'hindi'];
    const validThemes = ['light', 'dark', 'auto'];

    if (
      (language && !validLanguages.includes(language)) ||
      (theme && !validThemes.includes(theme))
    ) {
      return sendErrorResponse(res, 400, "Invalid preference values");
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) return sendErrorResponse(res, 404, "User not found");

    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;

    await user.save();

    sendSuccessResponse(res, 200, "Preferences updated successfully", {
      preferences: user.preferences
    });
  } catch (error) {
    console.error("[UpdatePreferences] Error:", error);
    sendErrorResponse(res, 500, "Failed to update preferences");
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        await UserModel.findByIdAndUpdate(decoded.id, {
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (err) {
        console.warn("[Logout] Token decode failed:", err.message);
      }
    }
    sendSuccessResponse(res, 200, "Logout successful");
  } catch (error) {
    console.error("[Logout] Error:", error);
    sendErrorResponse(res, 500, "Logout failed");
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return sendErrorResponse(res, 401, "Token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return sendErrorResponse(res, 401, "Invalid token");
    }

    const newToken = generateToken(user);

    sendSuccessResponse(res, 200, "Token refreshed", {
      token: newToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("[RefreshToken] Error:", error.message);
    sendErrorResponse(res, 401, "Invalid token");
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email = '' } = req.body;
    if (!email.trim()) {
      return sendErrorResponse(res, 400, "Email is required");
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendSuccessResponse(res, 200, "If email exists, reset link will be sent");
    }

    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    console.log(`[ResetToken for ${email}]:`, resetToken);
    sendSuccessResponse(res, 200, "If email exists, reset link will be sent");
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);
    sendErrorResponse(res, 500, "Failed to process request");
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendErrorResponse(res, 400, "Token and new password are required");
    }

    if (newPassword.length < 6) {
      return sendErrorResponse(res, 400, "Password must be at least 6 characters long");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.purpose !== 'password-reset') {
      return sendErrorResponse(res, 401, "Invalid reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    sendSuccessResponse(res, 200, "Password reset successful");
  } catch (error) {
    console.error("[ResetPassword] Error:", error);
    if (["TokenExpiredError", "JsonWebTokenError"].includes(error.name)) {
      return sendErrorResponse(res, 401, "Invalid or expired reset token");
    }
    sendErrorResponse(res, 500, "Failed to reset password");
  }
};

// Validate token
const validateToken = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    sendSuccessResponse(res, 200, "Token is valid", {
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("[ValidateToken] Error:", error);
    sendErrorResponse(res, 500, "Token validation failed");
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    sendSuccessResponse(res, 200, "Profile fetched successfully", sanitizeUser(user));
  } catch (error) {
    console.error("[GetProfile] Error:", error);
    sendErrorResponse(res, 500, "Failed to fetch profile");
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  validateToken,
  getProfile,
  updatePassword,
  updateEmail,
  updatePreferences
};
