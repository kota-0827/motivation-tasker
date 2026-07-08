const express = require("express");
const taskService = require("../services/taskService");

const router = express.Router();

/**
 * GET /tasks
 * 24時間以内かつ未完了のタスク一覧を取得する。
 * Query: ?userId=1 (任意)
 */
router.get("/tasks", async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const tasks = await taskService.getAvailableTasks(userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("[GET /tasks] error:", error);
    res.status(500).json({ error: "タスク一覧の取得に失敗しました。" });
  }
});

/**
 * GET /tasks/recommend?level=3
 * 指定した「やる気レベル」以下で、最もヤバ度が高いタスクを1件返す。
 */
router.get("/tasks/recommend", async (req, res) => {
  try {
    const level = Number(req.query.level);
    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    if (!Number.isInteger(level) || level < 1 || level > 5) {
      return res
        .status(400)
        .json({ error: "level は 1〜5 の整数で指定してください。" });
    }

    const task = await taskService.recommendTask(level, userId);

    if (!task) {
      return res
        .status(404)
        .json({ message: "そのやる気レベルに合うタスクは見つかりませんでした。" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("[GET /tasks/recommend] error:", error);
    res.status(500).json({ error: "タスクのレコメンドに失敗しました。" });
  }
});

module.exports = router;
