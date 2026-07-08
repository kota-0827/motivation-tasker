const express = require("express");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", taskRoutes);

app.get("/", (req, res) => {
  res.send("Motivation Tasker API is running.");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
