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

    // Fetch Teams (column A = name, column B = Active Status)
    const teamsSheet = ss.getSheetByName("Teams");
    const teams = [];
    if (teamsSheet && teamsSheet.getLastRow() > 1) {
      teamsSheet.getRange(2, 1, teamsSheet.getLastRow() - 1, 2).getValues().forEach(row => {
        const name = String(row[0] || "").trim();
        if (name && row[1] !== false) teams.push(name);
      });
    }

    const payload = {
      status: "success",
      actions: actions,
      people: people,
      teams: teams
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

    if (actionType === "reassign") {
      reassignActionOwners_(postData.actionId, postData.assignment);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (actionType === "create") {
      onNewActionSubmit({ values: postData.values });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Created new Action Item" }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (actionType === "update") {
      applyWebUpdate_(postData);
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

const TRACKER_PRIORITIES = ["Critical", "High", "Medium", "Low"];
const GROUP_NAMES = ["all", "all team members", "everyone", "all teams"];

function hasKey_(obj, key) {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

// Row number of the one row whose Action ID matches (ignoring case and spaces).
function findSingleActionRow_(sheet, actionId) {
  const id = String(actionId || "").trim().toUpperCase();
  if (!id) throw new Error("Action ID is required.");
  const lastRow = sheet.getLastRow();
  const ids = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues() : [];
  const rows = [];
  ids.forEach((r, i) => { if (String(r[0]).trim().toUpperCase() === id) rows.push(i + 2); });
  if (rows.length === 0) throw new Error("Action " + actionId + " was not found in the sheet.");
  if (rows.length > 1) throw new Error("Action ID " + actionId + " appears " + rows.length + " times in the sheet. Fix the duplicate IDs first.");
  return rows[0];
}

// Writes only the listed cells; every other cell in the row is left untouched.
function writeCells_(sheet, rowNumber, writes) {
  writes.forEach(w => sheet.getRange(rowNumber, w.column, 1, w.values[0].length).setValues(w.values));
}

function normalizeTeam_(team) {
  return String(team || "").trim().replace(/&/g, " and ").replace(/\s+/g, " ").toLowerCase();
}

// Returns the team's spelling from the Teams sheet, or null if it is not listed.
function findTeamName_(team) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Teams");
  const key = normalizeTeam_(team);
  if (!sheet || !key || sheet.getLastRow() < 2) return null;
  const names = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < names.length; i++) {
    if (normalizeTeam_(names[i][0]) === key) return String(names[i][0]).trim();
  }
  return null;
}

// Web app "update": validates every requested change first, then writes only the
// affected cells, then applies the progress update (status, %, notes, due date, link).
function applyWebUpdate_(postData) {
  const values = (postData.values || []).slice();
  const actionId = String(postData.actionId || values[1] || "").trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Action Tracker");
  const rowNumber = findSingleActionRow_(sheet, actionId);

  const assignment = postData.assignment || {};
  const writes = prepareDetailWrites_(postData.details)
    .concat(Object.keys(assignment).length ? prepareAssignmentWrites_(assignment) : []);

  writeCells_(sheet, rowNumber, writes);
  values[1] = actionId;
  onUpdateSubmit({ values: values });
}

// Action Item (F), Expected Deliverable (G), Core Team (H), Priority (I).
function prepareDetailWrites_(details) {
  const writes = [];
  if (!details) return writes;
  if (hasKey_(details, "actionItem")) {
    const text = String(details.actionItem || "").trim();
    if (!text) throw new Error("The action item text cannot be empty.");
    writes.push({ column: 6, values: [[text]] });
  }
  if (hasKey_(details, "deliverable")) {
    writes.push({ column: 7, values: [[String(details.deliverable || "").trim()]] });
  }
  if (hasKey_(details, "team")) {
    const team = findTeamName_(details.team);
    if (!team) throw new Error('Team "' + details.team + '" is not in the Teams sheet. Add it to the Teams tab first.');
    writes.push({ column: 8, values: [[team]] });
  }
  if (hasKey_(details, "priority")) {
    const wanted = String(details.priority || "").trim().toLowerCase();
    const priority = TRACKER_PRIORITIES.find(p => p.toLowerCase() === wanted);
    if (!priority) throw new Error('Priority must be one of: ' + TRACKER_PRIORITIES.join(", ") + ".");
    writes.push({ column: 9, values: [[priority]] });
  }
  return writes;
}

// Responsible Person + Email (J:K) and Accountable Person + Email (L:M).
// Both owners are validated before anything is written.
function prepareAssignmentWrites_(assignment) {
  const peopleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("People");
  if (!peopleSheet) throw new Error('No "People" sheet found.');
  const people = peopleSheet.getDataRange().getValues().slice(1);
  const isActive = p => p[4] !== false && String(p[4]).trim().toUpperCase() !== "FALSE";
  const changes = [];
  ["responsible", "accountable"].forEach(key => {
    if (!hasKey_(assignment, key)) return;
    const name = String(assignment[key] || "").trim();
    const everyone = key === "responsible" && GROUP_NAMES.includes(name.toLowerCase());
    const person = people.find(p => String(p[0]).trim().toLowerCase() === name.toLowerCase() && isActive(p));
    if (!name || (!everyone && !person)) {
      throw new Error('"' + name + '" is not an active person in the Google Sheets People tab.');
    }
    const email = everyone
      ? [...new Set(people.filter(p => isActive(p) && p[2] && !GROUP_NAMES.includes(String(p[0]).trim().toLowerCase())).map(p => String(p[2]).trim()))].join(", ")
      : String(person[2] || "").trim();
    if (!email) throw new Error('"' + name + '" needs an email address in the People tab.');
    const savedName = everyone ? name : String(person[0]).trim();
    changes.push({ column: key === "responsible" ? 10 : 12, values: [[savedName, email]] });
  });
  return changes;
}

// Kept for older versions of the web page that still send "reassign" on its own.
function reassignActionOwners_(actionId, assignment) {
  if (!actionId || !assignment) throw new Error("Action ID and assignment are required.");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Action Tracker");
  const rowNumber = findSingleActionRow_(sheet, actionId);
  const changes = prepareAssignmentWrites_(assignment);
  if (!changes.length) throw new Error("No reassignment supplied.");
  writeCells_(sheet, rowNumber, changes);
}

/**
 * RUN ONCE from the Apps Script editor to add the "Office Operation" team.
 * Safe on live data: it only adds one row to the Teams tab (if it is not
 * already there) and changes nothing else.
 */
function addOfficeOperationTeam() {
  const added = ensureTeam_("Office Operation");
  Logger.log(added ? '✅ Added "Office Operation" to the Teams tab.' : 'ℹ️ "Office Operation" is already in the Teams tab. Nothing changed.');
}

function ensureTeam_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Teams");
  if (!sheet) throw new Error('No "Teams" sheet found.');
  if (findTeamName_(name)) return false;
  // Write after the last filled cell in column A (not getLastRow, which can
  // point far down if column B has checkboxes).
  const colA = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 1).getValues();
  let lastFilled = 1;
  colA.forEach((r, i) => { if (String(r[0]).trim()) lastFilled = i + 1; });
  const row = lastFilled + 1;
  sheet.getRange(row, 1, 1, 2).setValues([[name, true]]);
  if (row > 50) Logger.log("⚠️ Team was added on row " + row + ", but the Action Tracker team dropdown only reads Teams!A2:A50. Extend that range.");
  return true;
}

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

// --------------------------------------------------------------------------
// AUTOMATED EMAILS
// --------------------------------------------------------------------------

const TRACKER_STATUSES = ["Not Started", "In Progress", "Blocked", "Completed", "On Hold", "Cancelled"];
const STATUS_ALIASES = { complete: "Completed", done: "Completed", closed: "Completed", canceled: "Cancelled" };
// Handlers that installTriggers() manages. Other triggers in the project are never touched.
const MANAGED_TRIGGERS = ["sendDailyReminders", "sendPersonalizedEmailDigests"];

// Map a status to its standard spelling, ignoring case and extra spaces.
function canonicalStatus_(status) {
  const key = String(status || "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!key) return "Not Started";
  return STATUS_ALIASES[key] || TRACKER_STATUSES.find(s => s.toLowerCase() === key) || String(status).trim();
}

function isTeamWideName_(name) {
  return GROUP_NAMES.includes(String(name || "").trim().toLowerCase());
}

// A date cell as a midnight Date, or null if empty/invalid.
function toDate_(value) {
  if (value === "" || value === null || value === undefined) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

// Split "a@x, b@y; c@z" into unique, valid addresses. Placeholder addresses
// (example.org / example.com) are returned separately so they are never emailed.
function cleanRecipients_(value) {
  const valid = [];
  const placeholders = [];
  const seen = {};
  String(value || "").split(/[,;]/).forEach(raw => {
    const email = raw.trim();
    const key = email.toLowerCase();
    if (!email || seen[key]) return;
    seen[key] = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (/@example\.(org|com|net)$/i.test(email)) placeholders.push(email);
    else valid.push(email);
  });
  return { valid: valid, placeholders: placeholders };
}

// "All Team Members" always expands to every active person, never the placeholder
// address stored for that row. Otherwise use the email in the row, then the People tab.
function resolveEmail_(personName, storedEmail) {
  if (isTeamWideName_(personName)) return getPersonEmail(personName);
  return storedEmail || getPersonEmail(personName);
}

/** Time-driven trigger entry point. Sends today's reminders. */
function sendDailyReminders() {
  return runDailyReminders_(false);
}

/** Run from the editor: lists the reminders that WOULD be sent today, sends nothing. */
function previewTodaysReminders() {
  return runDailyReminders_(true);
}

function runDailyReminders_(dryRun) {
  const summary = { sent: 0, failed: 0, skipped: 0, preview: 0, noDueDate: 0, quotaStop: false };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Action Tracker");
  if (!sheet || sheet.getLastRow() <= 1) return summary;

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
    if (!actionId) continue;
    const actionItem = row[5];
    const deliverable = row[6];
    const priority = row[8];
    const respPerson = row[9];
    const respEmail = resolveEmail_(respPerson, row[10]);
    const accPerson = row[11];
    const accEmail = resolveEmail_(accPerson, row[12]);
    const status = canonicalStatus_(row[16]);
    const lastReminderDate = toDate_(row[26]);

    if (status === "Completed" || status === "Cancelled") continue;

    const dueDate = toDate_(row[15]);
    const startDate = toDate_(row[14]);
    if (!dueDate) {
      summary.noDueDate++;
      Logger.log("Skipped " + actionId + ": no valid Due Date.");
      continue;
    }

    // At most one reminder per action per day.
    if (lastReminderDate && lastReminderDate.getTime() === today.getTime()) continue;

    const daysRemaining = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
    const daysOverdue = -daysRemaining;

    const isTeamWide = isTeamWideName_(respPerson);
    const greetingName = isTeamWide ? "Team (All Organization Members)" : respPerson;
    const teamTag = isTeamWide ? "(All Team Members) " : "";

    let message = null;

    if (startDate && startDate.getTime() === today.getTime() && status === "Not Started") {
      message = {
        to: respEmail, type: "Start Reminder",
        subject: `Action Item Starting Today ${teamTag}— ${actionId}`,
        body: `Hello ${greetingName},\n\nThis is a reminder that the following action item is scheduled to start today.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nExpected Deliverable: ${deliverable}\nPriority: ${priority}\nResponsible: ${respPerson}\nAccountable: ${accPerson}\nStart Date: ${formatDate(startDate)}\nDue Date: ${formatDate(dueDate)}\nCurrent Status: ${status}\n\nPlease begin the activity and update the action item when work starts.\n\n${orgName} Action Item Tracker`
      };
    } else if (daysRemaining > 0 && daysRemaining <= dueSoonDays) {
      const urgency = daysRemaining === 1 ? "Due Tomorrow" : `Due in ${daysRemaining} Days`;
      message = {
        to: respEmail, type: "Due Soon",
        subject: `Action Item ${urgency} ${teamTag}— ${actionId}`,
        body: `Hello ${greetingName},\n\nThis is a reminder that your action item is ${urgency.toLowerCase()}.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nExpected Deliverable: ${deliverable}\nPriority: ${priority}\nResponsible: ${respPerson}\nAccountable: ${accPerson}\nDue Date: ${formatDate(dueDate)}\nDays Remaining: ${daysRemaining}\nCurrent Status: ${status}\n\nPlease submit updates if there are changes.\n\n${orgName} Action Item Tracker`
      };
    } else if (daysRemaining === 0) {
      message = {
        to: respEmail, type: "Due Today",
        subject: `URGENT: Action Item Due Today ${teamTag}— ${actionId}`,
        body: `Hello ${greetingName},\n\nYOUR ACTION ITEM IS DUE TODAY.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nExpected Deliverable: ${deliverable}\nPriority: ${priority}\nResponsible: ${respPerson}\nAccountable: ${accPerson}\nDue Date: ${formatDate(dueDate)}\n\nPlease finalize and complete this item today.\n\n${orgName} Action Item Tracker`
      };
    } else if (daysRemaining < 0) {
      const recipients = [respEmail];
      let escalationStage = "Overdue Level 1";
      if (daysOverdue >= esc2Days && mgmtEmail) {
        recipients.push(accEmail, mgmtEmail);
        escalationStage = "Level 2 Escalation (Management)";
      } else if (daysOverdue >= esc1Days) {
        recipients.push(accEmail);
        escalationStage = "Level 1 Escalation (Accountable)";
      }
      message = {
        to: recipients.filter(Boolean).join(","), type: escalationStage,
        subject: `OVERDUE ACTION ITEM (${daysOverdue} Days) ${teamTag}— ${actionId}`,
        body: `ATTENTION REQUIRED\n\nThis action item is OVERDUE by ${daysOverdue} day(s).\n\nAction ID: ${actionId}\nAction: ${actionItem}\nResponsible Person: ${respPerson}\nAccountable Person: ${accPerson}\nDue Date: ${formatDate(dueDate)}\nDays Overdue: ${daysOverdue}\nCurrent Status: ${status}\nEscalation Stage: ${escalationStage}\n\nPlease update the status or resolve immediately.\n\n${orgName} Action Item Tracker`
      };
    }

    if (!message) continue;
    const result = sendEmailAndLog(message.to, message.subject, message.body, actionId, message.type, respPerson, sheet, rowIndex, message.type, dryRun);
    summary[result] = (summary[result] || 0) + 1;
    if (result === "quota") {
      summary.quotaStop = true;
      Logger.log("⛔ Daily email quota reached. Stopped at " + actionId + "; remaining reminders will go out on the next run.");
      break;
    }
  }

  Logger.log((dryRun ? "[PREVIEW] " : "") + "Reminder run finished: " + JSON.stringify(summary));
  return summary;
}

function sendBlockedNotification(sheet, rowIndex) {
  const row = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  const actionId = row[0];
  const actionItem = row[5];
  const respPerson = row[9];
  const respEmail = resolveEmail_(respPerson, row[10]);
  const accPerson = row[11];
  const accEmail = resolveEmail_(accPerson, row[12]);
  const blockerText = row[22];

  const recipients = [respEmail, accEmail].filter(Boolean).join(",");
  if (!recipients) return;

  const orgName = getSetting("Organization Name", "YOUR ORGANIZATION");
  const subject = `BLOCKED ACTION ITEM — ${actionId}`;
  const body = `This action item has been marked as BLOCKED.\n\nAction ID: ${actionId}\nAction: ${actionItem}\nBlocker Details:\n${blockerText}\n\nResponsible: ${respPerson}\nAccountable: ${accPerson}\n\nPlease review and assist in resolving the blocker immediately.\n\n${orgName} Action Item Tracker`;

  sendEmailAndLog(recipients, subject, body, actionId, "Blocked Notification", respPerson, sheet, rowIndex, "Blocked");
}

// Sends one email and records the result in the Reminder Log.
// Returns "sent", "failed", "skipped" (no real address), "quota" or "preview".
function sendEmailAndLog(recipientEmail, subject, body, actionId, reminderType, recipientName, sheet, rowIndex, stageName, dryRun) {
  const recipients = cleanRecipients_(recipientEmail);
  if (!recipients.valid.length) {
    const why = recipients.placeholders.length
      ? "Only placeholder addresses (" + recipients.placeholders.join(", ") + "). Put real emails in the People tab."
      : "No email address found. Check the People tab.";
    if (dryRun) Logger.log("[PREVIEW] SKIP " + reminderType + " " + actionId + ": " + why);
    else logReminder(new Date(), actionId, reminderType, recipientName, String(recipientEmail || ""), "Skipped", why);
    return "skipped";
  }
  const to = recipients.valid.join(",");
  if (dryRun) {
    Logger.log("[PREVIEW] " + reminderType + " " + actionId + " → " + to);
    return "preview";
  }
  try {
    const left = MailApp.getRemainingDailyQuota();
    if (left < recipients.valid.length) {
      logReminder(new Date(), actionId, reminderType, recipientName, to, "Failed", "Daily email quota reached (" + left + " left). Will retry on the next run.");
      return "quota";
    }
    const senderName = getSetting("Reminder Email Sender Name", "Action Item Tracker");
    MailApp.sendEmail({ to: to, subject: subject, body: body, name: senderName });
    const now = new Date();
    sheet.getRange(rowIndex, 26).setValue(stageName);
    sheet.getRange(rowIndex, 27).setValue(now);
    logReminder(now, actionId, reminderType, recipientName, to, "Sent", "Email delivered successfully");
    return "sent";
  } catch (e) {
    Logger.log("Error sending email: " + e);
    logReminder(new Date(), actionId, reminderType, recipientName, to, "Failed", e.toString());
    return "failed";
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

/**
 * RUN ONCE from the editor to schedule the automated emails:
 * - sendDailyReminders every day at "Reminder Hour" (Settings tab, default 8)
 * - sendPersonalizedEmailDigests per "Digest Frequency" (Weekly (default) / Daily / Off),
 *   on "Digest Day" (default Monday) when weekly.
 * Safe to re-run: it replaces only these two triggers, never duplicates them,
 * and leaves any other triggers (e.g. form submit) alone.
 */
function installTriggers() {
  uninstallTriggers();
  const reminderHour = parseInt(getSetting("Reminder Hour", 8), 10);

  ScriptApp.newTrigger("sendDailyReminders").timeBased().everyDays(1).atHour(reminderHour).create();
  Logger.log("✅ Daily reminders scheduled around " + reminderHour + ":00.");

  const frequency = String(getSetting("Digest Frequency", "Weekly")).trim().toLowerCase();
  if (typeof sendPersonalizedEmailDigests !== "function") {
    Logger.log("⚠️ Digest not scheduled: add PersonalizedEmailDigest.gs to this Apps Script project first.");
  } else if (frequency === "off") {
    Logger.log("ℹ️ Digest is turned off (Settings → Digest Frequency = Off).");
  } else if (frequency === "daily") {
    ScriptApp.newTrigger("sendPersonalizedEmailDigests").timeBased().everyDays(1).atHour(reminderHour).create();
    Logger.log("✅ Personal digest scheduled daily around " + reminderHour + ":00.");
  } else {
    const dayName = String(getSetting("Digest Day", "Monday")).trim().toUpperCase();
    const weekDay = ScriptApp.WeekDay[dayName] || ScriptApp.WeekDay.MONDAY;
    ScriptApp.newTrigger("sendPersonalizedEmailDigests").timeBased().onWeekDay(weekDay).atHour(reminderHour).create();
    Logger.log("✅ Personal digest scheduled weekly on " + weekDay + " around " + reminderHour + ":00.");
  }
}

// Removes only the email triggers this script manages.
function uninstallTriggers() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(t => {
    if (MANAGED_TRIGGERS.indexOf(t.getHandlerFunction()) !== -1) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log("Removed " + removed + " existing email trigger(s).");
}

/** Run from the editor: sends one test email to you (the script owner). */
function sendTestEmail() {
  const me = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({ to: me, subject: "✅ Action Item Tracker test email",
    body: "If you can read this, the tracker can send email from this account.\n\nRemaining email quota today: " + MailApp.getRemainingDailyQuota(),
    name: getSetting("Reminder Email Sender Name", "Action Item Tracker") });
  Logger.log("✅ Test email sent to " + me);
}

/**
 * Run from the editor when emails are not arriving. Prints a checklist in the
 * execution log. It only reads data; it sends nothing and changes nothing.
 */
function checkEmailSetup() {
  const out = [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Triggers
  const triggers = ScriptApp.getProjectTriggers();
  out.push("TRIGGERS (" + triggers.length + "):");
  triggers.forEach(t => out.push("  • " + t.getHandlerFunction() + " — " + t.getEventType()));
  MANAGED_TRIGGERS.forEach(name => {
    const n = triggers.filter(t => t.getHandlerFunction() === name).length;
    if (n === 0) out.push("  ❌ No trigger for " + name + ". Run installTriggers().");
    if (n > 1) out.push("  ⚠️ " + n + " triggers for " + name + " (duplicates send duplicate emails). Run installTriggers() to reset.");
  });

  // 2. Quota and account
  out.push("ACCOUNT: emails are sent from " + Session.getEffectiveUser().getEmail());
  const quota = MailApp.getRemainingDailyQuota();
  out.push("QUOTA: " + quota + " recipient(s) left today" + (quota < 10 ? "  ⚠️ almost used up; reminders will fail until tomorrow." : ""));

  // 3. Settings
  out.push("SETTINGS: Reminder Hour=" + getSetting("Reminder Hour", 8) + ", Due Soon Days=" + getSetting("Due Soon Days", 3) +
    ", Digest Frequency=" + getSetting("Digest Frequency", "Weekly (default)"));
  const mgmt = cleanRecipients_(getSetting("Management Escalation Email", ""));
  if (!mgmt.valid.length) out.push("  ⚠️ Management Escalation Email is empty or a placeholder: " + getSetting("Management Escalation Email", "(blank)"));

  // 4. People emails
  const people = ss.getSheetByName("People");
  if (!people) out.push("❌ No People tab.");
  else {
    const rows = people.getDataRange().getValues().slice(1).filter(r => r[0] && r[4] !== false && !isTeamWideName_(r[0]));
    const bad = rows.filter(r => !cleanRecipients_(r[2]).valid.length);
    out.push("PEOPLE: " + rows.length + " active, " + bad.length + " without a real email" +
      (bad.length ? ": " + bad.map(r => r[0] + " <" + (r[2] || "blank") + ">").join(", ") : ""));
  }

  // 5. Recent Reminder Log results
  const log = ss.getSheetByName("Reminder Log");
  if (!log) out.push("❌ No Reminder Log tab.");
  else if (log.getLastRow() < 2) out.push("REMINDER LOG: empty (the daily reminder has never sent or tried to send anything).");
  else {
    const start = Math.max(2, log.getLastRow() - 9);
    const recent = log.getRange(start, 1, log.getLastRow() - start + 1, 7).getValues();
    out.push("REMINDER LOG (last " + recent.length + "):");
    recent.forEach(r => out.push("  • " + formatDate(r[0]) + " " + r[1] + " " + r[2] + " → " + r[5] + (r[5] !== "Sent" ? " (" + r[6] + ")" : "")));
  }

  Logger.log(out.join("\n"));

  // 6. What today's run would send
  previewTodaysReminders();
}
