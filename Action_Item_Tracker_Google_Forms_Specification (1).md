# Action Item Tracker — Google Forms + Google Sheets + Apps Script
## Version 1 Implementation Specification

## 1. Objective

Build a professional action-item management system using:

- Google Forms — simple data entry from WhatsApp/mobile
- Google Sheets — master action database and dashboard
- Google Apps Script — IDs, calculations, reminders, escalation and notifications
- Gmail — automated reminders and escalation emails

The workflow is:

Meeting → Action Item → Google Form → Master Tracker → Automated Monitoring → Email Reminder/Escalation → Dashboard

The system must be simple for team members but structured enough for management.

---

# 2. Google Drive structure

Create one Google Drive folder:

`ACTION ITEM TRACKER`

Inside it:

- `Action Item Tracker.xlsx/Google Sheet` — main system
- `Supporting Documents` — optional
- `Archive` — completed/old records if required later

Use a native Google Sheet, not Excel, because Apps Script requires Google Sheets.

---

# 3. Google Sheet tabs

Create these tabs:

1. `Form Responses`
2. `Action Tracker`
3. `People`
4. `Teams`
5. `Dashboard`
6. `Reminder Log`
7. `Settings`

Do not manually edit `Form Responses`. It is the raw submission record.

---

# 4. Action Tracker columns

Create the following columns in exactly this order:

| Col | Field | Type | Entered by |
|---|---|---|---|
| A | Action ID | Text | Automatic |
| B | Date Created | Date/time | Automatic |
| C | Created By | Email | Automatic/Form |
| D | Meeting/Event | Text | Form |
| E | Meeting Date | Date | Form |
| F | Action Item | Long text | Form |
| G | Expected Deliverable | Long text | Form |
| H | Core Team | Dropdown/text | Form |
| I | Priority | Dropdown | Form |
| J | Responsible Person | Dropdown/text | Form |
| K | Responsible Email | Email | Automatic |
| L | Accountable Person | Dropdown/text | Form |
| M | Accountable Email | Email | Automatic |
| N | Supporting Person/Team | Text | Form |
| O | Start Date | Date | Form |
| P | Due Date | Date | Form |
| Q | Status | Dropdown | Automatic/Form |
| R | % Complete | Number | Form/Update Form |
| S | Health | Formula/Automatic |
| T | Days Remaining | Formula/Automatic |
| U | Link to Work | URL | Form |
| V | Latest Update | Long text | Update Form |
| W | Blocker | Long text | Update Form |
| X | Last Updated | Date/time | Automatic |
| Y | Completion Date | Date/time | Automatic |
| Z | Reminder Stage | System |
| AA | Last Reminder Sent | Date/time | System |
| AB | Escalation Level | System |

---

# 5. People tab

Create:

| Person | Email | Team | Active |
|---|---|---|---|
| Arthur | arthur@example.org | Administration | TRUE |
| Martial | martial@example.org | Administration | TRUE |

Replace the sample emails.

The Apps Script will use this table to find the responsible and accountable person's email addresses.

This avoids asking people to type email addresses repeatedly.

---

# 6. Teams tab

Create:

| Team | Active |
|---|---|
| Administration | TRUE |
| Finance | TRUE |
| Programs | TRUE |
| Communications | TRUE |
| Operations | TRUE |
| Monitoring & Evaluation | TRUE |

Add your actual teams.

---

# 7. Settings tab

Create:

| Setting | Value |
|---|---|
| Organization Name | YOUR ORGANIZATION |
| Reminder Hour | 8 |
| Due Soon Days | 3 |
| Escalation After Days | 3 |
| Second Escalation After Days | 7 |
| Reminder Email Sender Name | Action Item Tracker |

Do not change these frequently after deployment.

---

# 8. Google Form 1 — New Action Item

Title:

`Action Item Submission Form`

Description:

> Use this form to record an action item generated during a meeting or work session. Please provide a clear action, responsible person, start date and due date.

Enable:

`Collect email addresses`

## Section A — Meeting Information

### Question 1
`Meeting / Event`

Type: Short answer

Required: YES

Example:

`Weekly Management Meeting`

### Question 2
`Meeting Date`

Type: Date

Required: YES

---

# Section B — Action Item

### Question 3
`Action Item`

Type: Paragraph

Required: YES

Help text:

> Describe the specific action that must be completed. Start with a verb where possible.

Good:
`Prepare and submit the September financial report.`

Poor:
`Financial report.`

### Question 4
`Expected Deliverable`

Type: Paragraph

Required: YES

Example:

`Final September financial report submitted to the Executive Director.`

### Question 5
`Core Team`

Type: Dropdown

Required: YES

Use the Teams list.

### Question 6
`Priority`

Type: Multiple choice

Required: YES

Options:

- Critical
- High
- Medium
- Low

---

# Section C — Responsibility

### Question 7
`Responsible Person`

Type: Dropdown

Required: YES

Use active people from the People sheet.

### Question 8
`Accountable Person`

Type: Dropdown

Required: YES

Use active people from the People sheet.

### Question 9
`Supporting Person / Team`

Type: Short answer

Required: NO

---

# Section D — Timeline

### Question 10
`Start Date`

Type: Date

Required: YES

Help text:

> The date on which the responsible person is expected to begin work.

### Question 11
`Due Date`

Type: Date

Required: YES

Help text:

> The date by which the action should be completed.

---

# Section E — Supporting Information

### Question 12
`Link to Work`

Type: Short answer

Required: NO

Help text:

> Paste a Google Drive, document, spreadsheet or other relevant link.

### Question 13
`Initial Comment`

Type: Paragraph

Required: NO

---

# 9. Google Form 2 — Update Action Item

Title:

`Action Item Update Form`

Description:

> Use this form to update the progress of an existing action item.

Enable `Collect email addresses`.

Questions:

1. Action ID — Short answer — Required
2. Status — Multiple choice
   - Not Started
   - In Progress
   - Blocked
   - Completed
   - On Hold
   - Cancelled
3. % Complete — Number
4. Progress Update — Paragraph
5. Blocker — Paragraph
6. New Due Date — Date — optional
7. Link to Updated Work — Short answer — optional

The script will locate the Action ID and update the correct row.

---

# 10. Default status

Every newly submitted action item should automatically receive:

`Not Started`

Every new action item should receive:

`0%`

unless the implementation later supports initial progress.

---

# 11. Health rules

Health should be calculated automatically.

## Completed

If:

`Status = Completed`

Health:

`Completed`

## Blocked

If:

`Status = Blocked`

Health:

`Blocked`

## Overdue

If:

`Due Date < Today`

and status is not Completed or Cancelled:

`Overdue`

## Due Soon

If due date is within the configured Due Soon Days:

`Due Soon`

## Not Started

If start date has arrived but status remains Not Started:

`Not Started`

## On Track

Otherwise:

`On Track`

---

# 12. Days Remaining

Formula concept:

`Due Date - TODAY()`

Examples:

- 10 = ten days remaining
- 1 = due tomorrow
- 0 = due today
- -2 = two days overdue

Completed and Cancelled tasks can display `—`.

---

# 13. Reminder rules

Run the reminder engine once every morning.

Recommended time:

`08:00`

The system checks only active tasks.

## Rule 1 — Start reminder

If:

- Start Date = today
- Status = Not Started

Send responsible person a reminder.

## Rule 2 — Due soon

If:

- Due Date = today + 3 days
- Status is not Completed/Cancelled

Send reminder.

## Rule 3 — Due tomorrow

Send reminder.

## Rule 4 — Due today

Send urgent reminder.

## Rule 5 — Overdue

If due date has passed:

Send overdue reminder.

Do not send an identical email repeatedly on the same day.

## Rule 6 — Blocked

If status = Blocked:

Notify responsible and accountable people.

## Rule 7 — Escalation

If overdue >= 3 days:

Notify responsible + accountable.

If overdue >= 7 days:

Notify responsible + accountable + designated management email.

---

# 14. Email template — Start reminder

Subject:

`Action Item Starting Today — ACT-2026-001`

Body:

> Hello [Name],
>
> This is a reminder that the following action item is scheduled to start today.
>
> Action ID: ACT-2026-001
>
> Action: [Action]
>
> Expected Deliverable: [Deliverable]
>
> Priority: [Priority]
>
> Start Date: [Start Date]
>
> Due Date: [Due Date]
>
> Current Status: Not Started
>
> Please begin the activity and update the action item when work starts.
>
> Action Item Tracker

---

# 15. Email template — Due soon

Subject:

`Action Item Due Soon — ACT-2026-001`

Body should show:

- Action
- Deliverable
- Priority
- Due date
- Days remaining
- Current status
- Link to update form

---

# 16. Email template — Overdue

Subject:

`OVERDUE ACTION ITEM — ACT-2026-001`

Clearly display:

- Action ID
- Action
- Responsible person
- Accountable person
- Due date
- Days overdue
- Status
- Latest update

Request an update through the Update Form.

---

# 17. Email template — Blocked

Subject:

`BLOCKED ACTION ITEM — ACT-2026-001`

Body:

> This action item is currently blocked.
>
> Blocker:
> [Blocker]
>
> Responsible:
> [Person]
>
> Accountable:
> [Person]
>
> Please review and assist in resolving the blocker.

---

# 18. Dashboard

The Dashboard should contain the following summary cards:

### Top row

- Total Actions
- Completed
- In Progress
- Not Started
- Blocked
- Overdue
- Due This Week

### Second row

Chart: Actions by Status

Chart: Actions by Priority

### Third row

Chart: Actions by Team

Chart: Actions by Responsible Person

### Bottom section

`Attention Required`

Show:

- Overdue
- Due today
- Due within 3 days
- Blocked

---

# 19. Dashboard management questions

The dashboard should answer these questions immediately:

1. How many actions exist?
2. How many are completed?
3. How many are still pending?
4. Which actions are overdue?
5. Which actions are due soon?
6. Who has the most open actions?
7. Which teams have outstanding actions?
8. Which high-priority actions are not completed?
9. Which actions are blocked?
10. Which actions require management attention?

---

# 20. Conditional formatting

Use conditional formatting in the Action Tracker.

Health:

- Completed → green
- On Track → green/light
- Due Soon → orange
- Overdue → red
- Blocked → red
- Not Started → yellow

Priority:

- Critical → red
- High → orange
- Medium → yellow
- Low → green

Avoid excessive colors. The dashboard should remain professional.

---

# 21. Apps Script architecture

Use one Apps Script project attached to the Google Sheet.

Recommended functions:

```text
onNewActionSubmit()
onUpdateSubmit()
generateActionId()
calculateHealth()
calculateDaysRemaining()
sendDailyReminders()
sendStartReminder()
sendDueSoonReminder()
sendDueTodayReminder()
sendOverdueReminder()
sendBlockedNotification()
sendEscalation()
getPersonEmail()
logReminder()
updateCompletedDate()
validateDates()
```

---

# 22. Action ID format

Use:

`ACT-YYYY-###`

Examples:

`ACT-2026-001`
`ACT-2026-002`
`ACT-2026-003`

The number should be sequential.

Do not use the Google Form response timestamp as the Action ID because the Action ID needs to be short and easy to communicate.

---

# 23. Important validation rules

The system should reject or flag:

### Due date before start date

Invalid:

Start Date: 30 September
Due Date: 25 September

### Missing responsible person

Every action must have a responsible person.

### Missing accountable person

Every action must have an accountable person.

### Completed without 100%

When status changes to Completed:

Automatically set:

`% Complete = 100`

and:

`Completion Date = current date/time`

### Reopened action

If a Completed task is changed back to In Progress:

Clear Completion Date.

---

# 24. Security and permissions

Recommended permissions:

### Team members

Can submit forms.

They should NOT need edit access to the master spreadsheet.

### Action Tracker administrator

Can edit the spreadsheet and Apps Script.

### Management

Can receive dashboard/report access.

This prevents accidental changes to formulas and historical records.

---

# 25. WhatsApp deployment

Pin the New Action Item Form in the relevant WhatsApp group.

Suggested message:

> 📋 ACTION ITEM SUBMISSION
>
> Whenever an action item is assigned during a meeting, please record it using the form below.
>
> The form captures the action, responsible person, priority, start date and due date.
>
> 🔗 [Google Form link]
>
> Please submit action items immediately after they are agreed.

The Update Form can be shared separately with responsible persons.

---

# 26. Daily automation

Create a time-driven Apps Script trigger:

`sendDailyReminders()`

Frequency:

`Daily`

Approximate time:

`08:00`

Important:

Do not create multiple daily triggers. Check the Apps Script trigger list before deployment.

---

# 27. Reminder Log

The Reminder Log should contain:

| Date | Action ID | Reminder Type | Recipient | Email | Result |
|---|---|---|---|---|---|
| 20-Sep | ACT-001 | Start | Arthur | ... | Sent |
| 27-Sep | ACT-001 | Due Soon | Arthur | ... | Sent |
| 01-Oct | ACT-001 | Overdue | Arthur | ... | Sent |

This provides an audit trail.

---

# 28. Recommended future improvements

Do NOT build these in Version 1 unless needed:

- WhatsApp API integration
- Custom web application
- Mobile application
- User authentication portal
- Automatic PDF reports
- AI-generated meeting action extraction
- Calendar integration
- Slack/Teams integration
- Advanced workload balancing
- Automatic meeting-minutes generation

First make the basic tracker reliable.

---

# 29. Implementation milestones

## Milestone 1 — Sheet

Build:

- Action Tracker
- People
- Teams
- Settings
- Reminder Log

Test manually.

## Milestone 2 — New Action Form

Connect form to Google Sheet.

Test 5 sample submissions.

## Milestone 3 — Action ID

Deploy automatic IDs.

Test sequential numbering.

## Milestone 4 — Update Form

Test:

- Not Started
- In Progress
- Blocked
- Completed
- Overdue update

## Milestone 5 — Health Engine

Test all date/status combinations.

## Milestone 6 — Email Engine

Use test email addresses first.

Test:

- Start reminder
- Due soon
- Due today
- Overdue
- Blocked
- Escalation

## Milestone 7 — Dashboard

Build management dashboard.

## Milestone 8 — Production

Replace test people/emails.

Install triggers.

Pin forms on WhatsApp.

---

# 30. Acceptance tests

Before going live, verify:

### Test A

Submit an action.

Expected:

- Action appears in Action Tracker
- Unique Action ID created
- Responsible email populated
- Accountable email populated
- Status = Not Started
- % Complete = 0

### Test B

Create action with future Start Date.

Expected:

No start reminder before Start Date.

### Test C

Start Date arrives.

Expected:

Responsible person receives start reminder.

### Test D

Due date is 3 days away.

Expected:

Due-soon reminder.

### Test E

Due date passes.

Expected:

Health becomes Overdue.

### Test F

Status = Completed.

Expected:

- % Complete = 100
- Completion Date populated
- Future reminders stop.

### Test G

Status = Blocked.

Expected:

Responsible and Accountable receive blocker notification.

### Test H

Task is 3 days overdue.

Expected:

Escalation email is sent.

### Test I

Update Form is submitted.

Expected:

Correct Action ID row is updated.

### Test J

Two people submit actions simultaneously.

Expected:

Both receive unique Action IDs and no data is overwritten.

---

# 31. Version 1 design principle

Keep the system simple for the team.

Team member experience:

```text
Open WhatsApp
      ↓
Tap Google Form
      ↓
Describe action
      ↓
Select responsible person
      ↓
Select priority
      ↓
Set start date
      ↓
Set due date
      ↓
Submit
```

Management experience:

```text
Open Dashboard
      ↓
See outstanding actions
      ↓
See overdue actions
      ↓
See blocked actions
      ↓
See team/person responsibility
      ↓
Receive automatic escalation
```

The spreadsheet and Apps Script perform the complexity behind the scenes.

---

# 32. Recommended next build order

Do not begin with the dashboard.

Build in this order:

**1. Data model → 2. People/Teams → 3. New Action Form → 4. Action ID automation → 5. Update Form → 6. Status/Health engine → 7. Email reminders → 8. Escalation → 9. Dashboard → 10. Production testing**

This sequence makes debugging significantly easier.
