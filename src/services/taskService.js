const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

class TaskService {
  /**
   * createdAt が24時間以内、かつ isCompleted が false のタスクを取得する。
   * 実装メモ通り、DBから物理削除はせずフィルタリングで「消滅」を表現する。
   * @param {number} [userId] - 指定した場合そのユーザーのタスクに絞り込む
   * @returns {Promise<Array>}
   */
  async getAvailableTasks(userId) {
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

    return prisma.task.findMany({
      where: {
        isCompleted: false,
        createdAt: { gt: cutoff },
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  }

  /**
   * 指定された motivationLevel 以下のタスクの中から、
   * urgencyLevel（ヤバ度）が最も高いものを1件取得する。
   * 同率の場合は締切/作成が古い方（より緊急）を優先する。
   * @param {number} motivationLevel - ユーザーが選択した「今のやる気」(1-5)
   * @param {number} [userId] - 指定した場合そのユーザーのタスクに絞り込む
   * @returns {Promise<Object|null>}
   */
  async recommendTask(motivationLevel, userId) {
    return prisma.task.findFirst({
      where: {
        isCompleted: false,
        motivationLevel: { lte: motivationLevel },
        ...(userId ? { userId } : {}),
      },
      orderBy: [
        { urgencyLevel: "desc" },
        { createdAt: "asc" },
      ],
      include: { category: true },
    });
  }
}

module.exports = new TaskService();
module.exports.TaskService = TaskService;
