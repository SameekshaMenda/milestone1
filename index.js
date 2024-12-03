<<<<<<< HEAD
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cron = require('node-cron');
const WebSocket = require('ws');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());


const HABITS_FILE = './habits.json';
let habits = [];
if (fs.existsSync(HABITS_FILE)) {
    habits = JSON.parse(fs.readFileSync(HABITS_FILE, 'utf-8'));
}


const saveHabits = () => {
    fs.writeFileSync(HABITS_FILE, JSON.stringify(habits, null, 2));
};

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => console.log('WebSocket client disconnected'));
});

app.post('/habits', (req, res) => {
    const { name, dailyGoal } = req.body;

    if (!name || !dailyGoal) {
        return res.status(400).json({ status: 'error', error: 'Name and dailyGoal are required' });
    }

    const newHabit = {
        id: habits.length + 1,
        name,
        dailyGoal,
        completedDates: []
    };

    habits.push(newHabit);
    saveHabits();
    res.json({ status: 'success', data: newHabit });
});


app.put('/habits/:id', (req, res) => {
    const { id } = req.params;
    const habit = habits.find((h) => h.id == id);

    if (!habit) {
        return res.status(404).json({ status: 'error', error: 'Habit not found' });
    }

    const today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
    if (!habit.completedDates.includes(today)) {
        habit.completedDates.push(today);
    }

    saveHabits();
    res.json({ status: 'success', data: habit });
});


app.get('/habits', (req, res) => {
    res.json({ status: 'success', data: habits });
});


app.get('/habits/report', (req, res) => {
    const report = habits.map((habit) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const completedThisWeek = habit.completedDates.filter((date) => {
            const dateObj = new Date(date);
            return dateObj >= weekStart;
        }).length;

        return {
            name: habit.name,
            dailyGoal: habit.dailyGoal,
            completedThisWeek
        };
    });

    res.json({ status: 'success', data: report });
});


cron.schedule('* * * * *', () => {
    
    const incompleteHabits = habits.filter((habit) => {
        const today = new Date().toISOString().split('T')[0];
        return !habit.completedDates.includes(today);
    });

    if (incompleteHabits.length > 0) {
        const message = `Reminder: Complete your habits! Incomplete habits: ${incompleteHabits.map((h) => h.name).join(', ')}`;
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        console.log(message);
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
=======
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
>>>>>>> 88a3ae87418d9aefae1a48d966bd42b1fdc6d574
});
