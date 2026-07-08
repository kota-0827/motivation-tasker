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
| GET | `/users/:userId/tasks` | 指定したユーザーIDのタスクを**全件**取得（フィルタなし） |
| GET | `/tasks/mine` | `X-User-Id` ヘッダー等で決まる「今のユーザー」のタスクを取得（下記参照） |

`/tasks` と `/tasks/recommend` は任意で `?userId=1` を付けるとユーザー単位に絞り込めます。

## ログイン無しで「今のユーザー」を切り替える仕組み

ログイン画面がまだ無いため、`src/middleware/currentUser.js` という開発用の擬似認証
ミドルウェアを用意しています。全リクエストに対して、以下の優先順位で
「今どのユーザーとして振る舞うか」を決定し `req.currentUserId` にセットします。

1. リクエストヘッダー `X-User-Id`
2. クエリパラメータ `?asUserId=`
3. 環境変数 `DEV_USER_ID`（`.env` で指定。未設定なら `1`）

### 使い方の例

```bash
# デフォルト（DEV_USER_ID=1）として振る舞う
curl http://localhost:3000/tasks/mine

# ユーザー2として振る舞う（ヘッダー指定）
curl -H "X-User-Id: 2" http://localhost:3000/tasks/mine

# ユーザー3として振る舞う（クエリ指定）
curl "http://localhost:3000/tasks/mine?asUserId=3"
```

本番でログイン機能（JWTやセッション）を実装する際は、この `currentUser.js` の中身を
「トークンを検証して `req.currentUserId` にセットする」処理に差し替えるだけで、
他のルート・サービス側のコードはそのまま使い回せます。

## ロジックのポイント

- **24時間消滅**: `createdAt > (現在時刻 - 24h)` の条件で `WHERE` フィルタするのみで、
  物理削除は行いません（実装メモの方針通り）。
- **やる気レコメンド**: `motivationLevel <= 指定値` で候補を絞り、`urgencyLevel` 降順
  （同率なら `createdAt` 昇順＝より古いものを優先）で1件取得します。

## 次にやるとよいこと

- `POST /tasks`（新規登録）、`PATCH /tasks/:id/complete`（完了処理＋ポイント加算）の実装
- 設計メモにある「講義別進捗率」の集計API
- 認証・ユーザー識別の仕組み（現状は `userId` をクエリで受け取るだけの簡易実装）
