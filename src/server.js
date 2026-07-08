const express = require("express");
const taskRoutes = require("./routes/taskRoutes");
const currentUser = require("./middleware/currentUser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// ログイン機能ができるまでの暫定措置: X-User-Id ヘッダー等で
// 「今どのユーザーとして振る舞うか」を決定し req.currentUserId にセットする。
app.use(currentUser);
app.use("/", taskRoutes);

app.get("/", (req, res) => {
  res.send("Motivation Tasker API is running.");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
