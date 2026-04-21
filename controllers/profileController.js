import User from "../models/User.js";
import bcrypt from "bcryptjs";

const formatProfile = (user) => ({
  fullName: user.name,
  email: user.email,
  role: user.role || "Task Manager",
  phone: user.phone || "+1 000 000 0000",
  location: user.location || "New York, USA",
  bio: user.bio || "I use RiseTask daily to organize my goals and improve team productivity.",
  profileImage: user.profileImage || "",
});

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ profile: formatProfile(user) });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { fullName, email, role, phone, location, bio, profileImage } = req.body;

    if (typeof fullName === "string") {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Full name cannot be empty" });
      }
      user.name = trimmedName;
    }

    if (typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      if (normalizedEmail !== user.email) {
        const emailTaken = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });

        if (emailTaken) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }

      user.email = normalizedEmail;
    }

    if (typeof role === "string") user.role = role.trim();
    if (typeof phone === "string") user.phone = phone.trim();
    if (typeof location === "string") user.location = location.trim();
    if (typeof bio === "string") user.bio = bio.trim();
    if (typeof profileImage === "string") user.profileImage = profileImage.trim();

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: formatProfile(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
