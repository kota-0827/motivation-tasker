import "dotenv/config";

export default {
  datasource: {
    // 環境変数 DATABASE_URL からデータベースの場所を読み込む設定じゃ
    url: process.env.DATABASE_URL,
  },
};

