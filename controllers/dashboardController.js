import Task from "../models/Task.js";
import Category from "../models/TaskCategory.js";

class TasksController {
  async getTaskStats(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const baseFilter = { userId };

      // Overview counts (user-scoped)
      const totalTasks = await Task.countDocuments(baseFilter);
      const completedTasks = await Task.countDocuments({ ...baseFilter, completed: true });
      const pendingTasks = await Task.countDocuments({ ...baseFilter, completed: false });

      // Optional in-progress status support
      const inProgressTasks = await Task.countDocuments({
        ...baseFilter,
        status: "in-progress",
      }).catch(() => 0);

      // Tasks created today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayTasks = await Task.countDocuments({
        ...baseFilter,
        createdAt: { $gte: startOfToday },
      });

      // Overdue tasks
      const today = new Date();
      const overdueTasks = await Task.countDocuments({
        ...baseFilter,
        dueDate: { $lt: today },
        completed: false,
      });

      // Aggregate tasks by category (user-scoped)
      const tasksByCategoryCounts = await Task.aggregate([
        { $match: { userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      const allCategories = await Category.find({});
      const categoriesWithCounts = allCategories.map((category) => {
        const taskCount = tasksByCategoryCounts.find((item) => item._id === category.name);
        return {
          name: category.name,
          color: category.color,
          icon: category.icon,
          taskCount: taskCount ? taskCount.count : 0,
        };
      });

      // Weekly Progress (last 7 days, user-scoped)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const weeklyProgress = await Task.aggregate([
        {
          $match: {
            userId,
            completed: true,
            completedAt: { $exists: true, $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$completedAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyData = daysOfWeek.map((day, index) => {
        const dayData = weeklyProgress.find((item) => item._id === index + 1);
        return {
          day,
          count: dayData ? dayData.count : 0,
        };
      });

      return res.json({
        success: true,
        data: {
          overview: {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            todayTasks,
            overdueTasks,
          },
          categories: categoriesWithCounts,
          weeklyProgress: weeklyData,
        },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch dashboard statistics." });
    }
  }
}

const tasksController = new TasksController();
export default tasksController;
