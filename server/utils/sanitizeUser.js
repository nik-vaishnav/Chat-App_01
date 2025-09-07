const sanitizeUser = (user) => {
  if (!user) return null;

  const { preferences = {} } = user;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profile_pic: user.profile_pic,
    bio: user.bio || "",
    createdAt: user.createdAt,
    isOnline: user.isOnline ?? false,
    preferences: {
      language: preferences.language || "english",
      theme: preferences.theme || "light"
    }
  };
};

module.exports = sanitizeUser;