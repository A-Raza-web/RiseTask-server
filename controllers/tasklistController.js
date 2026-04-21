import Task from "../models/Tasklist.js";

class TaskController {
  static getUserId(req) {
    return req.body?.userId || req.query?.userId;
  }

  static ensureUserId(req, res) {
    const userId = TaskController.getUserId(req);
    if (!userId) {
      res.status(400).json({ message: "userId is required" });
      return null;
    }
    return userId;
  }

  // Get all tasks for one user
  static async getTasks(req, res) {
    try {
      const userId = TaskController.ensureUserId(req, res);
      if (!userId) return;

      const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      res.status(500).json({ message: "Server error while fetching tasks" });
    }
  }

  // Create a new task for one user
  static async createTask(req, res) {
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
        completed: false,
      });
      await newTask.save();

      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating task:", error.message);
      res.status(500).json({ message: "Server error while creating task" });
    }
  }

  // Update one task owned by the logged-in user
  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const userId = TaskController.ensureUserId(req, res);
      if (!userId) return;

      const updatePayload = { ...req.body };
      delete updatePayload.userId;

      const updatedTask = await Task.findOneAndUpdate(
        { _id: id, userId },
        updatePayload,
        { new: true }
      );

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found or access denied" });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error.message);
      res.status(500).json({ message: "Server error while updating task" });
    }
  }

  // Delete one task owned by the logged-in user
  static async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const userId = TaskController.ensureUserId(req, res);
      if (!userId) return;

      const deletedTask = await Task.findOneAndDelete({ _id: id, userId });

      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found or access denied" });
      }

      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error.message);
      res.status(500).json({ message: "Server error while deleting task" });
    }
  }

  // Toggle task complete/incomplete for one user
  static async toggleTask(req, res) {
    try {
      const { id } = req.params;
      const userId = TaskController.ensureUserId(req, res);
      if (!userId) return;

      const task = await Task.findOne({ _id: id, userId });

      if (!task) {
        return res.status(404).json({ message: "Task not found or access denied" });
      }

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : null;

      await task.save();
      res.status(200).json(task);
    } catch (error) {
      console.error("Error toggling task:", error.message);
      res.status(500).json({ message: "Server error while toggling task" });
    }
  }
}

export default TaskController;
