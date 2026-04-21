import Task from "../models/Task.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const { userId, title, description, priority, dueDate, category, tags, notifications } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const newTask = new Task({
      userId,
      title,
      description,
      priority,
      dueDate,
      category,
      tags,
      notifications,
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (err) {
    res.status(500).json({ message: "Error creating task", error: err.message });
  }
};


