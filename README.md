# Action Item Tracker System — Google Forms + Google Sheets + Apps Script

This repository contains a complete implementation of the **Action Item Tracker System** based on the specification document [`Action_Item_Tracker_Google_Forms_Specification (1).md`](file:///c:/Users/amben/Desktop/Action%20Item%20Tracker/Action_Item_Tracker_Google_Forms_Specification%20%281%29.md).

---

## 🌟 Solution Overview

The system consists of two integrated components:
1. **Google Workspace Deployment Package (`google_apps_script/`)**:
   - `Setup.gs`: One-click setup function `buildTrackerSystem()` to auto-create and format all 7 Google Sheet tabs (`Action Tracker`, `Form Responses`, `People`, `Teams`, `Dashboard`, `Reminder Log`, `Settings`), set up dropdown validations, conditional formatting, and sample data.
   - `Code.gs`: Full engine for automatic sequential Action ID generation (`ACT-YYYY-###`), responsible/accountable email lookup, Google Form submission triggers, health & days remaining engine, daily email reminders, and 3-day / 7-day multi-tier management escalation.
2. **Interactive Web Application Tracker (`index.html`, `style.css`, `app.js`)**:
   - Modern, responsive web dashboard with KPI metric cards (Total Actions, Completed, In Progress, Not Started, Blocked, Overdue, Due Soon).
   - Real-time Canvas charts for Actions by Status, Priority, and Team.
   - Attention Required alert list for overdue or blocked items.
   - Action Item Master Grid with search, filtering, and status badge styling.
   - Integrated Google Form simulators (New Action Item Form & Update Form).
   - Built-in Apps Script Code Exporter.

---

## 🚀 Quick Setup & Deployment Guide

### Step 1: Prepare Google Drive & Google Sheet
1. Open [Google Drive](https://drive.google.com) and create a folder named `ACTION ITEM TRACKER`.
2. Inside the folder, create a new **Google Sheet** named `Action Item Tracker`.

### Step 2: Add Apps Script Code
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any code in `Code.gs` and copy the code from [`google_apps_script/Code.gs`](file:///c:/Users/amben/Desktop/Action%20Item%20Tracker/google_apps_script/Code.gs).
3. Create a second file named `Setup.gs` and copy the code from [`google_apps_script/Setup.gs`](file:///c:/Users/amben/Desktop/Action%20Item%20Tracker/google_apps_script/Setup.gs).
4. Save the project (click the disk icon 💾).

### Step 3: Run One-Click Initialization
1. In the Apps Script editor, select function `buildTrackerSystem` from the dropdown menu and click **Run**.
2. Grant the necessary permissions when prompted.
3. Switch back to your Google Sheet — all 7 tabs (`Action Tracker`, `Form Responses`, `People`, `Teams`, `Dashboard`, `Reminder Log`, `Settings`) are now initialized with headers, dropdown validations, formatting, and sample rows!

### Step 4: Configure People & Settings
1. Go to the **People** tab and update the sample names and email addresses with your team members.
2. Go to the **Settings** tab and configure your organization name, reminder hour (default: 8 AM), due soon threshold (default: 3 days), and management escalation email.

### Step 5: Create Google Forms
1. **New Action Item Form**:
   - Create a Google Form titled `Action Item Submission Form`.
   - Enable *Collect email addresses*.
   - Add fields: Meeting/Event, Meeting Date, Action Item, Expected Deliverable, Core Team (Dropdown), Priority (Multiple choice), Responsible Person (Dropdown), Accountable Person (Dropdown), Start Date, Due Date, Link to Work.
   - Link the form responses to the `Action Item Tracker` spreadsheet (`Form Responses` tab).
2. **Update Action Item Form**:
   - Create a Google Form titled `Action Item Update Form`.
   - Add fields: Action ID, Status (Dropdown), % Complete, Progress Update, Blocker, New Due Date.

### Step 6: Activate Automated Triggers
1. In Apps Script Editor, select function `installTriggers` and click **Run**.
2. This automatically configures:
   - Form Submit triggers for Google Forms.
   - Daily 08:00 AM timer trigger for `sendDailyReminders()`.

---

## 📊 Specification Rule Summary

| Feature | Specification Rule |
|---|---|
| **Action ID** | `ACT-YYYY-###` (Sequential per year) |
| **Email Lookup** | Automatically retrieved from `People` sheet by name |
| **Default Status** | `Not Started` with `0%` progress |
| **Health Rules** | Completed, Blocked, Overdue (Due < Today), Due Soon (<= Today + 3d), Not Started, On Track |
| **Days Remaining** | `Due Date - Today()` (Displays `—` for Completed/Cancelled) |
| **Daily Reminders** | Start Date reminder, Due Soon (3 days), Due Tomorrow, Due Today, Overdue |
| **Escalation** | Overdue >= 3 days -> Accountable Person; Overdue >= 7 days -> Accountable + Management |
| **Completion Rule** | Setting status to `Completed` sets `% Complete = 100%` and sets `Completion Date` |

---

## 🌐 Running the Web Tracker Locally

You can open `index.html` directly in your browser or serve it using any HTTP server:

```bash
npx serve .
```

Then visit `http://localhost:3000` to interact with the visual dashboard and test item creation!
