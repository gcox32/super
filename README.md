# Super Soldier Regimen Web App  
**Product Design & Mobile-First Architecture Document**  
**Version 1.0**

This document outlines the core structure, user flows, and mobile-first design principles for the Super Soldier training application. The product’s primary purpose is to enable building, executing, logging, and analyzing workouts, with a secondary focus on nutrition to support hypertrophy and bodyweight goals.

---

# 1. Core Product Structure

The mobile-first app is organized around five main sections accessible through a bottom tab bar:

1. **Today** – Daily command center for training and nutrition
2. **Train** – Program, workout builder, and workout library
3. **Eat** – Meal planning, templates, and daily intake
4. **Insights** – Trends, analytics, and progress reporting
5. **Profile** – Personal metrics, settings, preferences

High-level conceptual mapping:

- **Today**: execution
- **Train**: architecture
- **Eat**: fuel
- **Insights**: feedback
- **Profile**: configuration

---

# 2. Today: The Command Center

The Today screen acts as the operational dashboard for the user’s current phase, sessions, and nutrition plan.

## 2.1 Layout

### Hero Section
- Current phase, week, and day.
- Session overview for AM/PM if using 2-a-days.
- Optional readiness indicators (sleep, subjective recovery score).

### Today's Sessions
- Cards for each training session:
  - Workout title
  - Estimated duration
  - Status: Not started, In progress, or Completed
- Large primary action: **Start Session**

### Today’s Nutrition
- Daily calorie and macro status:
  - Target vs planned vs logged
- Meal cards:
  - Breakfast, lunch, dinner, snacks
  - Planned vs completed
- CTA: **Plan Today’s Meals** or **Log Meal**

### Quick Actions
- Log bodyweight
- Log measurement
- Add note (injury, fatigue, insights)

---

# 3. Train: Programs and Workouts

The Train section hosts all program structure, workout editing, and builder tools.

## 3.1 Train Home
- **Current Program**  
  - Program card with progress and CTA to view or edit.
- **Upcoming Phases**
  - Future training blocks ready for scheduling.
- **Workout Library**  
  - Filter by category (lower, upper, conditioning).
- **Build / Edit Tools**
  - Create workout
  - Create program

## 3.2 Workout Detail Screen
- Title, type, estimated duration.
- Sections shown as expandable accordions:
  - Warm-Up
  - Main Lifts
  - Accessory Work
  - Finisher
- Exercises displayed in rows with:
  - Name
  - Sets x reps
  - Optional load/RPE notes
- Editable through bottom sheets for quick interactions.

## 3.3 Program Builder Flow
1. **Program Info**  
   Name, length in weeks, days per week, 1-a-day vs 2-a-days.
2. **Week Layout**  
   Weekly calendar showing assigned sessions.
3. **Review & Activation**  
   Summary view and confirmation button.

---

# 4. Executing a Session

The in-workout experience is central to user engagement.

## 4.1 Pre-Session Overview
- Workout summary  
- Sections listed  
- Big CTA: **Start Session**

## 4.2 Active Session UX

### Current Block View
- Clearly labeled block (ex. A1: Front Squat).

### Set Card
- Large-tap controls:
  - Set number
  - Prescribed reps/load
  - Inputs for actual reps, load, RPE
- Primary action: **Complete Set**
- Auto-start rest timer after completion

### Rest Timer
- Full-width bar
- Pause/skip options
- Shows preview of next set

### Navigation
- Block-level navigation via tabs or arrow buttons
- Progress indicator

### Notes & Feedback
- Add notes  
- Quick pain indicators  
- Visible in logs for contextual analysis

### End Session
- Summary: sets, reps, volume, duration
- Quick rating of difficulty
- Returns user to Today screen

---

# 5. Logging & History

The system keeps a detailed log of all completed workouts.

## 5.1 History List
- Grouped by date
- Each entry shows session title, duration, and completion status

## 5.2 Workout Log Detail
- All exercises with set-by-set data
- Notes taken during the workout
- CTA to reuse as a template

---

# 6. Fuel: Fueling for Hypertrophy

A simplified approach to meal planning that fits the 4,000–4,300 calorie target.

## 6.1 Fuel Home
- Daily target summary:
  - Calories, macros
- Meal plan list:
  - Breakfast, lunch, dinner, snacks
  - Planned vs logged
- Mode toggle:
  - **Plan Day**
  - **Log Intake**

## 6.2 Meal Templates
- Reusable structured meals (e.g., hibachi bowl, gainer shake)
- Portion sliders
- Add-to-day actions
- Save favorites

Mobile-first principles emphasize low typing and predictable controls.

---

# 7. Insights: Super Soldier Analytics

This section provides long-term reinforcement and feedback.

## 7.1 Bodyweight & Composition
- Line chart
- Trend text
- Milestones

## 7.2 Strength & Performance
- Tabs per lift
- Best sets or estimated 1RM
- Volume trend graphs

## 7.3 Muscle Group Volume
- Bar or heat map visualization

## 7.4 Recovery & Consistency
- Training streaks
- Weekly training hours

## 7.5 Nutrition Consistency
- Calendar heat map of meeting calorie targets

All charts presented as separate scrollable cards for mobile usability.

---

# 8. Profile

Settings and constants for the app.

## 8.1 Personal Metrics
- Height, weight, goal weight
- Training maxes
- Optional limb measurements

## 8.2 Preferences
- lb vs kg
- RPE usage
- Rest timer defaults
- Theme mode

## 8.3 Program & Goal Settings
- Current goal (e.g., muscle gain)
- Select active program

## 8.4 Data Export (future)
- CSV export

---

# 9. Key User Flows

## Flow A: Morning Heavy Lower Session
1. Open app → Today screen.
2. Tap **Start Session**.
3. Complete sets using big inputs.
4. Finish → summary screen.
5. Back to Today.

## Flow B: Plan Tomorrow's Meals
1. Go to **Eat**.
2. Toggle to **Plan Day**.
3. Select a meal template day.
4. Adjust portions.
5. Save.

## Flow C: Adjust a Program
1. Go to **Train**.
2. Open active program.
3. Tap Week 4 session.
4. Modify exercise scheme.
5. Save changes.

---

# 10. Mobile-First Design Principles

- Primary actions always within thumb reach.
- Minimize typing: use presets, sliders, and increment buttons.
- Keep navigation shallow: list → detail → bottom sheet.
- Offline-resilient for use in gyms.
- Consistent interaction patterns.

---

# Appendix: Future Considerations

- Advanced analytics (power output, volume load by region)
- Wearable integration
- Macro auto-balancing for planned meals
- Coaching mode for multiple athletes