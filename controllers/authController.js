import User from "../models/User.js";
import Settings from "../models/settingsModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const serializeSettings = (settingsDoc) => ({
  notifications: settingsDoc.notifications,
  darkMode: settingsDoc.darkMode,
  autoSave: settingsDoc.autoSave,
  language: settingsDoc.language,
  timezone: settingsDoc.timezone,
});

class AuthController {
  constructor() {
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
  }

  // ---------- SIGNUP ----------
  async signup(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      await Settings.create({ user: newUser._id });

      return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }

  // ---------- LOGIN ----------
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check user existence
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Ensure profile data exists in DB after first sign-in
      let shouldSaveProfile = false;
      if (user.role == null) {
        user.role = "Task Manager";
        shouldSaveProfile = true;
      }
      if (user.phone == null) {
        user.phone = "+1 000 000 0000";
        shouldSaveProfile = true;
      }
      if (user.location == null) {
        user.location = "New York, USA";
        shouldSaveProfile = true;
      }
      if (user.bio == null) {
        user.bio = "I use RiseTask daily to organize my goals and improve team productivity.";
        shouldSaveProfile = true;
      }
      if (user.profileImage == null) {
        user.profileImage = "";
        shouldSaveProfile = true;
      }
      if (shouldSaveProfile) {
        await user.save();
      }

      let userSettings = await Settings.findOne({ user: user._id });
      if (!userSettings) {
        userSettings = await Settings.create({ user: user._id });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET, // ✅ Directly use env here
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        token,
        userId: user._id,
        email: user.email,
        profile: {
          fullName: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
          profileImage: user.profileImage || "",
        },
        settings: serializeSettings(userSettings),
        message: "Login successful",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }
}

export default AuthController;
