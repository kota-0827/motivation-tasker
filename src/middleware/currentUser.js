/**
 * currentUser ミドルウェア
 *
 * ログイン画面がまだ無い開発段階で、「今は誰として振る舞うか」を
 * 簡単に切り替えるための仕組みです。本番の認証(JWTやセッション)を
 * 導入したら、このミドルウェアはそのまま置き換えてください。
 *
 * 優先順位:
 *   1. リクエストヘッダー "X-User-Id"      例) curl -H "X-User-Id: 2" ...
 *   2. クエリパラメータ "?asUserId=2"      例) /tasks?asUserId=2
 *   3. 環境変数 DEV_USER_ID（.env で指定。未設定なら 1）
 *
 * 決定した ID は req.currentUserId に入り、以降のルートで
 * 「今のユーザー」として利用できます。
 */
function currentUser(req, res, next) {
  const headerId = req.headers["x-user-id"];
  const queryId = req.query.asUserId;
  const defaultId = process.env.DEV_USER_ID || "1";

  const rawId = headerId || queryId || defaultId;
  const userId = Number(rawId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      error:
        "ユーザーIDが不正です。X-User-Id ヘッダーか ?asUserId= で正の整数を指定してください。",
    });
  }

  req.currentUserId = userId;
  next();
}

module.exports = currentUser;
