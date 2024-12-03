const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cron = require('node-cron');
const WebSocket = require('ws');

// Initialize app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Load habits from file or initialize an empty array
const HABITS_FILE = './habits.json';
let habits = [];

if (fs.existsSync(HABITS_FILE)) {
    habits = JSON.parse(fs.readFileSync(HABITS_FILE, 'utf-8'));
}

// Utility to save habits to file
const saveHabits = () => {
    fs.writeFileSync(HABITS_FILE, JSON.stringify(habits, null, 2));
};

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => console.log('WebSocket client disconnected'));
});

// Endpoints

// Add Habit
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

// Update Habit (Mark Complete)
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

// Get Habits
app.get('/habits', (req, res) => {
    res.json({ status: 'success', data: habits });
});

// Weekly Report
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

// CRON Job for Daily Notifications
cron.schedule('0 9 * * *', () => {
    // At 9:00 AM every day
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
