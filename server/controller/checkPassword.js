const UserModel = require("../models/UserModel");
const bcrypt = require('bcrypt');

async function checkPassword(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required.", error: true });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found.", error: true });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({ message: "Password is correct.", success: true });
    } else {
      return res.status(400).json({ message: "Password is incorrect.", error: true });
    }
  } catch (err) {
    console.error("Error checking password:", err);
    return res.status(500).json({ message: "Internal server error.", error: true });
  }
}

module.exports = checkPassword;