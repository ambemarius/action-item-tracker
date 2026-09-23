/**
 * ACTION ITEM TRACKER - MAIN APPS SCRIPT LOGIC
 * Specification Version: 1.3 (Integrated Web App JSON API for GitHub Pages)
 * 
 * Features:
 * - REST API Endpoints (doGet / doPost) for GitHub Pages Live Sync
 * - Automatic Sequential Action ID (ACT-YYYY-###)
 * - Automatic Email & Role Lookup from Organizational 'People' Sheet
 * - Form 1 (New Action Item) & Form 2 (Update Action Item) Triggers
 * - Automated Health & Days Remaining calculation engine
 * - Daily Email Reminders (Start Today, Due Soon, Due Today, Overdue, Blocked)
 * - 3-Day & 7-Day Multi-tier Management Escalation
 * - Audit Trail Reminder Logging
 */

// --------------------------------------------------------------------------
// REST API ENDPOINTS FOR GITHUB PAGES / WEB APP INTEGRATION
// --------------------------------------------------------------------------

/**
 * GET Endpoint: Returns live Action Tracker rows & People list as JSON
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const trackerSheet = ss.getSheetByName("Action Tracker");
    const peopleSheet = ss.getSheetByName("People");

    // Fetch Action Items
    const actionsData = trackerSheet.getDataRange().getValues();
    const actions = [];
    if (actionsData.length > 1) {
      for (let i = 1; i < actionsData.length; i++) {
        const row = actionsData[i];
        if (!row[0]) continue;
        actions.push({
          id: row[0],
          createdDate: formatDate(row[1]),
          createdBy: row[2],
          meeting: row[3],
          meetingDate: formatDate(row[4]),
          actionItem: row[5],
          deliverable: row[6],
          team: row[7],
          priority: row[8],
          responsible: row[9],
          respEmail: row[10],
          accountable: row[11],
          accEmail: row[12],
          supporting: row[13],
          startDate: formatDate(row[14]),
          dueDate: formatDate(row[15]),
          status: row[16],
          pctComplete: Math.round((row[17] || 0) * 100),
          health: row[18],
          daysRemaining: row[19],
          link: row[20],
          latestUpdate: row[21],
          blocker: row[22],
          lastUpdated: formatDate(row[23])
        });
      }
    }

    // Fetch People Directory
    const peopleData = peopleSheet ? peopleSheet.getDataRange().getValues() : [];
    const people = [];
    if (peopleData.length > 1) {
      for (let i = 1; i < peopleData.length; i++) {
        const row = peopleData[i];
        if (!row[0]) continue;
        people.push({
          name: row[0],
          role: row[1],
          email: row[2],
          team: row[3]
        });
      }
    }

    const payload = {
      status: "success",
      actions: actions,
      people: people
    };

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST Endpoint: Creates or Updates Action Items from GitHub Pages
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const actionType = postData.actionType; // "create" or "update"

    if (actionType === "create") {
      onNewActionSubmit({ values: postData.values });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Created new Action Item" }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (actionType === "update") {
      onUpdateSubmit({ values: postData.values });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Updated Action Item" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid actionType" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------------------------
// CORE APPS SCRIPT LOGIC
// --------------------------------------------------------------------------

function getSetting(key, defaultValue) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    if (!sheet) return defaultValue;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim().toLowerCase() === key.toLowerCase()) {
        return data[i][1];
      }
    }
  } catch (e) {
    Logger.log("Error reading setting: " + e);
  }
  return defaultValue;
}

function getPersonEmail(personName) {
  if (!personName) return "";
  const cleanName = personName.toString().trim().toLowerCase();
  const isAll = cleanName === "all" || cleanName === "all team members" || cleanName === "everyone" || cleanName === "all teams";

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("People");
    if (!sheet) return "";
    const data = sheet.getDataRange().getValues();

    if (isAll) {
      const emails = [];
      for (let i = 1; i < data.length; i++) {
        const rowName = (data[i][0] || "").toString().trim().toLowerCase();
        const rowEmail = (data[i][2] || data[i][1] || "").toString().trim();
        const active = data[i][4];
        if (!rowEmail || active === false) continue;
        if (rowName === "all" || rowName === "all team members" || rowName === "everyone") continue;
        if (!emails.includes(rowEmail)) {
          emails.push(rowEmail);
        }
      }
      return emails.join(", ");
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim().toLowerCase() === cleanName) {
        return data[i][2] || data[i][1] || "";
      }
    }
  } catch (e) {
    Logger.log("Error finding person email: " + e);
  }
  return "";
}

function generateActionId() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Action Tracker");
  const year = new Date().getFullYear();
  const prefix = "ACT-" + year + "-";
  
  if (sheet.getLastRow() <= 1) {
    return prefix + "001";
  }
  
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  let maxNum = 0;
  
  for (let i = 0; i < ids.length; i++) {
    const idStr = ids[i][0] ? ids[i][0].toString() : "";
    if (idStr.startsWith(prefix)) {
      const numPart = parseInt(idStr.replace(prefix, ""), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  
  const nextNum = maxNum + 1;
  return prefix + ("000" + nextNum).slice(-3);
}

function onNewActionSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const trackerSheet = ss.getSheetByName("Action Tracker");
  
  let formValues = e ? e.values : null;
  if (!formValues && e && e.response) {
    const itemResponses = e.response.getItemResponses();
    formValues = itemResponses.map(r => r.getResponse());
  }

  if (!formValues) return;

  const actionId = generateActionId();
  const createdDate = new Date();
  const createdBy = e.response ? e.response.getRespondentEmail() : (formValues[0] || "");
  
  const meetingEvent = formValues[1] || "";
  const meetingDate = formValues[2] ? new Date(formValues[2]) : createdDate;
  const actionItem = formValues[3] || "";
  const deliverable = formValues[4] || "";
  const coreTeam = formValues[5] || "";
  const priority = formValues[6] || "Medium";
  const responsiblePerson = formValues[7] || "";
  const accountablePerson = formValues[8] || "";
  const supporting = formValues[9] || "";
  const startDate = formValues[10] ? new Date(formValues[10]) : createdDate;
  const dueDate = formValues[11] ? new Date(formValues[11]) : createdDate;
  const linkToWork = formValues[12] || "";
  const initialComment = formValues[13] || "";

  const respEmail = getPersonEmail(responsiblePerson);
  const accEmail = getPersonEmail(accountablePerson);

  const status = "Not Started";
  const pctComplete = 0.0;
  const health = calculateHealth(dueDate, status, startDate);
  const daysRemaining = calculateDaysRemaining(dueDate, status);

  const newRow = [
    actionId,
    createdDate,
    createdBy,
    meetingEvent,
    meetingDate,
    actionItem,
    deliverable,
    coreTeam,
    priority,
    responsiblePerson,
    respEmail,
    accountablePerson,
    accEmail,
    supporting,
    startDate,
    dueDate,
    status,
    pctComplete,
    health,
    daysRemaining,
    linkToWork,
    initialComment,
    "",
    createdDate,
    "",
    "None",
    "",
    "Level 0"
  ];

  trackerSheet.appendRow(newRow);
  Logger.log("Successfully created Action Item: " + actionId);
}

function onUpdateSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const trackerSheet = ss.getSheetByName("Action Tracker");
  
  let formValues = e ? e.values : null;
  if (!formValues && e && e.response) {
    const itemResponses = e.response.getItemResponses();
    formValues = itemResponses.map(r => r.getResponse());
  }

  if (!formValues) return;

  const actionId = (formValues[1] || "").toString().trim();
  const newStatus = formValues[2] || "";
  const newPctStr = formValues[3] || "";
  const progressUpdate = formValues[4] || "";
  const blockerText = formValues[5] || "";
  const newDueDateStr = formValues[6] || "";
  const newLink = formValues[7] || "";

  if (!actionId) return;

  const data = trackerSheet.getDataRange().getValues();
  let targetRowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim().toUpperCase() === actionId.toUpperCase()) {
      targetRowIndex = i + 1;
      break;
    }
  }

  if (targetRowIndex === -1) return;

  const now = new Date();
  
  if (newStatus) trackerSheet.getRange(targetRowIndex, 17).setValue(newStatus);
  
  if (newStatus === "Completed") {
    trackerSheet.getRange(targetRowIndex, 18).setValue(1.0);
    trackerSheet.getRange(targetRowIndex, 25).setValue(now);
  } else {
    if (newPctStr !== "") {
      let pctVal = parseFloat(newPctStr);
      if (pctVal > 1.0) pctVal = pctVal / 100.0;
      trackerSheet.getRange(targetRowIndex, 18).setValue(pctVal);
    }
    trackerSheet.getRange(targetRowIndex, 25).setValue("");
  }

  if (newDueDateStr) trackerSheet.getRange(targetRowIndex, 16).setValue(new Date(newDueDateStr));
  if (progressUpdate) trackerSheet.getRange(targetRowIndex, 22).setValue(progressUpdate);

  if (blockerText || newStatus === "Blocked") {
    trackerSheet.getRange(targetRowIndex, 23).setValue(blockerText);
    if (newStatus === "Blocked") sendBlockedNotification(trackerSheet, targetRowIndex);
  }

  if (newLink) trackerSheet.getRange(targetRowIndex, 21).setValue(newLink);

  trackerSheet.getRange(targetRowIndex, 24).setValue(now);

  const updatedRow = trackerSheet.getRange(targetRowIndex, 1, 1, 28).getValues()[0];
  const currentDueDate = new Date(updatedRow[15]);
  const currentStatus = updatedRow[16];
  const currentStartDate = new Date(updatedRow[14]);

  const freshHealth = calculateHealth(currentDueDate, currentStatus, currentStartDate);
  const freshDaysRemaining = calculateDaysRemaining(currentDueDate, currentStatus);

  trackerSheet.getRange(targetRowIndex, 19).setValue(freshHealth);
  trackerSheet.getRange(targetRowIndex, 20).setValue(freshDaysRemaining);
}

function calculateHealth(dueDate, status, startDate) {
  if (status === "Completed") return "Completed";
  if (status === "Blocked") return "Blocked";
  if (status === "Cancelled") return "Cancelled";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const dueSoonDays = parseInt(getSetting("Due Soon Days", 3), 10);
  const dueSoonThreshold = new Date(today.getTime() + dueSoonDays * 86400000);

  if (due < today) return "Overdue";
  if (due <= dueSoonThreshold) return "Due Soon";
  if (start <= today && status === "Not Started") return "Not Started";

  return "On Track";
}

function calculateDaysRemaining(dueDate, status) {
  if (status === "Completed" || status === "Cancelled") return "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function sendDailyReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Action Tracker");
  if (!sheet || sheet.getLastRow() <= 1) return;

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 28).getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orgName = getSetting("Organization Name", "YOUR ORGANIZATION");
  const dueSoonDays = parseInt(getSetting("Due Soon Days", 3), 10);
  const esc1Days = parseInt(getSetting("Escalation After Days", 3), 10);
  const esc2Days = parseInt(getSetting("Second Escalation After Days", 7), 10);
  const mgmtEmail = getSetting("Management Escalation Email", "");

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowIndex = i + 2;

    const actionId = row[0];
    const actionItem = row[5];
    const deliverable = row[6];
    const priority = row[8];
    const respPerson = row[9];
    const respEmail = row[10] || getPersonEmail(respPerson);
    const accPerson = row[11];
    const accEmail = row[12] || getPersonEmail(accPerson);
    const startDate = new Date(row[14]);
    const dueDate = new Date(row[15]);
    const status = row[16];
    const lastReminderDate = row[26] ? new Date(row[26]) : null;

    if (status === "Completed" || status === "Cancelled") continue;

    startDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysOverdue = -daysRemaining;

    if (lastReminderDate) {
      const lastSentClean = new Date(lastReminderDate);
      lastSentClean.setHours(0, 0, 0, 0);
      if (lastSentClean.getTime() === today.getTime()) continue;
    }

    const isTeamWide = (respPerson && (respPerson.toString().toLowerCase() === "all" || respPerson.toString().toLowerCase() === "all team members" || respPerson.toString().toLowerCase() === "everyone"));
    const greetingName = isTeamWide ? "Team (All Organization Members)" : respPerson;

    if (startDate.getTime() === today.getTime() && status === "Not Started") {
      if (respEmail) {
        const subject = `Action Item Starting Today ${isTeamWide ? '(All Team Members) ' : ''}— ${actionId}`;
        const body = `Hello ${greetingName},\n\nThis is a reminder that the following action item is scheduled to start today.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nExpected Deliverable: ${deliverable}\nPriority: ${priority}\nResponsible: ${respPerson}\nAccountable: ${accPerson}\nStart Date: ${formatDate(startDate)}\nDue Date: ${formatDate(dueDate)}\nCurrent Status: ${status}\n\nPlease begin the activity and update the action item when work starts.\n\n${orgName} Action Item Tracker`;
        sendEmailAndLog(respEmail, subject, body, actionId, "Start Reminder", respPerson, sheet, rowIndex, "Start Reminder");
      }
    } else if (daysRemaining > 0 && daysRemaining <= dueSoonDays) {
      if (respEmail) {
        const urgency = daysRemaining === 1 ? "Due Tomorrow" : `Due in ${daysRemaining} Days`;
        const subject = `Action Item ${urgency} ${isTeamWide ? '(All Team Members) ' : ''}— ${actionId}`;
        const body = `Hello ${greetingName},\n\nThis is a reminder that your action item is ${urgency.toLowerCase()}.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nExpected Deliverable: ${deliverable}\nPriority: ${priority}\nResponsible: ${respPerson}\nAccountable: ${accPerson}\nDue Date: ${formatDate(dueDate)}\nDays Remaining: ${daysRemaining}\nCurrent Status: ${status}\n\nPlease submit updates if there are changes.\n\n${orgName} Action Item Tracker`;
        sendEmailAndLog(respEmail, subject, body, actionId, "Due Soon", respPerson, sheet, rowIndex, "Due Soon");
      }
    } else if (daysRemaining === 0) {
      if (respEmail) {
        const subject = `URGENT: Action Item Due Today ${isTeamWide ? '(All Team Members) ' : ''}— ${actionId}`;
        const body = `Hello ${greetingName},\n\nYOUR ACTION ITEM IS DUE TODAY.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nExpected Deliverable: ${deliverable}\nPriority: ${priority}\nResponsible: ${respPerson}\nAccountable: ${accPerson}\nDue Date: ${formatDate(dueDate)}\n\nPlease finalize and complete this item today.\n\n${orgName} Action Item Tracker`;
        sendEmailAndLog(respEmail, subject, body, actionId, "Due Today", respPerson, sheet, rowIndex, "Due Today");
      }
    } else if (daysRemaining < 0) {
      let recipients = [respEmail];
      let escalationStage = "Overdue Level 1";

      if (daysOverdue >= esc2Days && mgmtEmail) {
        recipients.push(accEmail, mgmtEmail);
        escalationStage = "Level 2 Escalation (Management)";
      } else if (daysOverdue >= esc1Days) {
        recipients.push(accEmail);
        escalationStage = "Level 1 Escalation (Accountable)";
      }

      const recipientStr = recipients.filter(Boolean).join(",");
      if (recipientStr) {
        const subject = `OVERDUE ACTION ITEM (${daysOverdue} Days) ${isTeamWide ? '(All Team Members) ' : ''}— ${actionId}`;
        const body = `ATTENTION REQUIRED\n\nThis action item is OVERDUE by ${daysOverdue} day(s).\n\nAction ID: ${actionId}\nAction: ${actionItem}\nResponsible Person: ${respPerson}\nAccountable Person: ${accPerson}\nDue Date: ${formatDate(dueDate)}\nDays Overdue: ${daysOverdue}\nCurrent Status: ${status}\nEscalation Stage: ${escalationStage}\n\nPlease update the status or resolve immediately.\n\n${orgName} Action Item Tracker`;
        sendEmailAndLog(recipientStr, subject, body, actionId, escalationStage, respPerson, sheet, rowIndex, escalationStage);
      }
    }
  }
}

function sendBlockedNotification(sheet, rowIndex) {
  const row = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  const actionId = row[0];
  const actionItem = row[5];
  const respPerson = row[9];
  const respEmail = row[10] || getPersonEmail(respPerson);
  const accPerson = row[11];
  const accEmail = row[12] || getPersonEmail(accPerson);
  const blockerText = row[22];

  const recipients = [respEmail, accEmail].filter(Boolean).join(",");
  if (!recipients) return;

  const orgName = getSetting("Organization Name", "YOUR ORGANIZATION");
  const subject = `BLOCKED ACTION ITEM — ${actionId}`;
  const body = `This action item has been marked as BLOCKED.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nBlocker Details:\n${blockerText}\n\nResponsible: ${respPerson}\nAccountable: ${accPerson}\n\nPlease review and assist in resolving the blocker immediately.\n\n${orgName} Action Item Tracker`;

  sendEmailAndLog(recipients, subject, body, actionId, "Blocked Notification", respPerson, sheet, rowIndex, "Blocked");
}

function sendEmailAndLog(recipientEmail, subject, body, actionId, reminderType, recipientName, sheet, rowIndex, stageName) {
  try {
    const senderName = getSetting("Reminder Email Sender Name", "Action Item Tracker");
    MailApp.sendEmail({ to: recipientEmail, subject: subject, body: body, name: senderName });
    const now = new Date();
    sheet.getRange(rowIndex, 26).setValue(stageName);
    sheet.getRange(rowIndex, 27).setValue(now);
    logReminder(now, actionId, reminderType, recipientName, recipientEmail, "Sent", "Email delivered successfully");
  } catch (e) {
    Logger.log("Error sending email: " + e);
    logReminder(new Date(), actionId, reminderType, recipientName, recipientEmail, "Failed", e.toString());
  }
}

function logReminder(timestamp, actionId, type, name, email, result, details) {
  try {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reminder Log");
    if (logSheet) logSheet.appendRow([timestamp, actionId, type, name, email, result, details]);
  } catch (e) {
    Logger.log("Error writing to Reminder Log: " + e);
  }
}

function formatDate(d) {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return d;
  return dateObj.toISOString().split('T')[0];
}

function installTriggers() {
  uninstallTriggers();
  const reminderHour = parseInt(getSetting("Reminder Hour", 8), 10);
  ScriptApp.newTrigger("sendDailyReminders")
    .timeBased()
    .everyDays(1)
    .atHour(reminderHour)
    .create();
  Logger.log("✅ Installed Daily Reminder Trigger at " + reminderHour + ":00 AM");
}

function uninstallTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log("Cleaned up existing triggers.");
}
