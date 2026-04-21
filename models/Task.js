import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {   
    type: Date,
    default: null,
  },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  dueDate: { type: Date },
  category: { type: String, default: "General" },
  tags: [String],
  notifications: {
    enabled: { type: Boolean, default: true },
    reminderTime: { type: Number, default: 24 },
  },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
