const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../../generated/prisma/client"); // 生成されたクライアントを読み込むぞ

// PostgreSQL に接続するためのコネクションプールとアダプターを用意する
// 環境変数の DATABASE_URL を使って接続するのじゃ
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

class TaskService {
  /**
   * createdAt が24時間以内、かつ isCompleted が false のタスクを取得する。
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
   * 指定したユーザーIDに紐づくタスクをすべて取得する。
   */
  async getTasksByUserId(userId) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  }

  /**
   * 指定された motivationLevel 以下のタスクの中から、
   * urgencyLevel（ヤバ度）が最も高いものを1件取得する。
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

// 最後に使い終わったら pool を閉じる仕組みも本来は必要じゃが、
// まずはこれで本番へ繋げるようにするぞ
module.exports = new TaskService();
module.exports.TaskService = TaskService;
