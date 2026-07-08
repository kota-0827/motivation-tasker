# Motivation Tasker - Backend 雛形

やる気連動型タスク管理アプリのバックエンド雛形です（Node.js + Express + Prisma / SQLite）。

## セットアップ

```bash
npm install
npx prisma migrate dev --name init   # dev.db を作成し、テーブルを反映
npm start                            # http://localhost:3000 で起動
```

## ファイル構成

```
prisma/schema.prisma        # User, Category, Task のモデル定義
src/services/taskService.js # getAvailableTasks / recommendTask のロジック
src/routes/taskRoutes.js    # 上記を呼び出すAPIエンドポイント
src/server.js                # Expressアプリのエントリーポイント
```

## モデル概要（schema.prisma）

- **User**: id, name, totalPoints（ご褒美ポイント。設計メモのご褒美ロジック用）
- **Category**: id, name, userId（講義・分類。進捗管理用）
- **Task**: id, title, isCompleted, motivationLevel, urgencyLevel, createdAt（依頼要件）
  に加え、設計メモのER図に沿って deadline, status, categoryId, userId も定義しています。

## API

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/tasks` | `createdAt` が24時間以内かつ `isCompleted=false` のタスク一覧を取得 |
| GET | `/tasks/recommend?level=3` | 指定した `motivationLevel` 以下で `urgencyLevel` が最も高いタスクを1件返す |

どちらも任意で `?userId=1` を付けるとユーザー単位に絞り込めます。

## ロジックのポイント

- **24時間消滅**: `createdAt > (現在時刻 - 24h)` の条件で `WHERE` フィルタするのみで、
  物理削除は行いません（実装メモの方針通り）。
- **やる気レコメンド**: `motivationLevel <= 指定値` で候補を絞り、`urgencyLevel` 降順
  （同率なら `createdAt` 昇順＝より古いものを優先）で1件取得します。

## 次にやるとよいこと

- `POST /tasks`（新規登録）、`PATCH /tasks/:id/complete`（完了処理＋ポイント加算）の実装
- 設計メモにある「講義別進捗率」の集計API
- 認証・ユーザー識別の仕組み（現状は `userId` をクエリで受け取るだけの簡易実装）
