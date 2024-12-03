const express = require("express");
const cron = require("node-cron");
const WebSocket = require("ws");
const app = express();


app.use(express.json());

let habits = []; 
let progress = []; 

let clients = []; 


const setupWebSocketServer = () => {
  const wss = new WebSocket.Server({ server: app }); 
  wss.on("connection", (ws) => {
    clients.push(ws); 
    ws.on("close", () => {
      clients = clients.filter((client) => client !== ws); 
    });
  });
  console.log("WebSocket server running on ws://localhost:3000");
};


const sendReminder = (habit) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`Reminder: Don't forget to complete "${habit.name}" today!`);
    }
  });
};


const scheduleDailyReminders = () => {
  cron.schedule("43 15 * * *", () => {
    const today = new Date().toISOString().split("T")[0]; 

    habits.forEach((habit) => {
      const completed = progress.some(
        (entry) => entry.habit_id === habit.id && entry.date === today
      );
      
      if (!completed) {
       
        sendReminder(habit);
      }
    });
  });
};


setupWebSocketServer();
scheduleDailyReminders();


app.post("/habits", (req, res) => {
  const { name, daily_goal } = req.body;
  if (!name || !daily_goal) {
    return res.status(400).json({ error: "Please provide a name and daily goal." });
  }
  const habit = { id: habits.length + 1, name, daily_goal };
  habits.push(habit);
  res.json(habit);
});

app.put("/habits/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const habit = habits.find((h) => h.id === id);
  if (!habit) {
    return res.status(404).json({ error: "Habit not found." });
  }
  progress.push({ habit_id: id, date: new Date().toISOString().split("T")[0] });
  res.json({ message: "Habit marked as complete!" });
});

app.get("/habits", (req, res) => {
  res.json(habits);
});

app.get("/habits/report", (req, res) => {
  const today = new Date();
  const last7Days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    last7Days.push(day.toISOString().split("T")[0]);
  }
  const report = progress.filter((p) => last7Days.includes(p.date));
  res.json(report);
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
