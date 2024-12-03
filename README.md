# milestone1

# Smart Habit Tracker with Daily Updates
 Overview
 The Smart Habit Tracker helps users maintain daily habits by providing a platform to log progress
 and receive reminders. It encourages consistency through automated updates and analytics.
 
# Features
 1. Addhabits with a name and daily goal (e.g., "Drink 8 glasses of water").
 2. Markhabits as complete for the day.
 3. Send daily reminders via WebSocket.
 4. Track weekly completion data and visualize progress.

# Requirements
● Endpoints:
 * AddHabit(POST /habits): Create a new habit with its daily goal.
 * UpdateHabit (PUT /habits/:id): Mark a habit as complete for a day.
 * GetHabits (GET /habits): Fetch all active habits and their completion status.
 * WeeklyReport (GET /habits/report): Generate a progress report for the week.
 * DailyNotifications:
 * UseWebSocket / Cron job to send reminders for incomplete habits at a scheduled
 time.

# Solution Design
 * Store habits in an array or database with tracking by date.
 * Implement CRONjobs to trigger daily reminders.
 * Allowoptional logging of weekly reports to a file for historical analysis.
   
# General Notes for All Projects
 1. Development Environment:
 * UseNode.js with Express for API development.
 * Optionally use fs for file-based persistence or SQLite for lightweight data storage.
 2. Error Handling:
 * Ensureproper validation and error messages for invalid inputs.
 * Useconsistent response formats ({ status, data, error })

# Installations:
mkdir habit-tracker <br>
cd habit-tracker <br>
npm init -y
npm install express body-parser cron ws 

# To run:
node index.js

