/**
 * ACTION ITEM TRACKER - SETUP & INITIALIZATION SCRIPT
 * Specification Version: 1.3 (Fixed Apps Script setWrap method)
 * 
 * Run the buildTrackerSystem() function once from Apps Script Editor
 * to automatically build all 7 tabs, apply formatting, header styles,
 * data validations, formulas, and default settings.
 */

function buildTrackerSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Define Tab Names
  const tabNames = [
    "Action Tracker",
    "Form Responses",
    "People",
    "Teams",
    "Dashboard",
    "Reminder Log",
    "Settings"
  ];
  
  // 1. Ensure all tabs exist
  tabNames.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
  });

  // Setup Individual Tabs
  setupPeopleSheet(ss.getSheetByName("People"));
  setupTeamsSheet(ss.getSheetByName("Teams"));
  setupActionTrackerSheet(ss.getSheetByName("Action Tracker"));
  setupSettingsSheet(ss.getSheetByName("Settings"));
  setupReminderLogSheet(ss.getSheetByName("Reminder Log"));
  setupDashboardSheet(ss.getSheetByName("Dashboard"));
  setupFormResponsesSheet(ss.getSheetByName("Form Responses"));
  
  SpreadsheetApp.getUi().alert("✅ Action Item Tracker with Organizational People Directory initialized successfully!");
}

/**
 * 1. PEOPLE SHEET SETUP (Organizational Members & Roles)
 */
function setupPeopleSheet(sheet) {
  sheet.clear();
  const headers = ["Person Name", "Role / Title", "Email Address", "Team / Department", "Active Status"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  sheet.getRange(1, 1, 1, headers.length)
       .setBackground("#1E293B")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold")
       .setHorizontalAlignment("center");

  const defaultPeople = [
    ["Arthur Pendelton", "Executive Director", "arthur@example.org", "Administration", true],
    ["Martial Kouam", "Operations Director", "martial@example.org", "Administration", true],
    ["Claire Vance", "Finance Manager", "claire@example.org", "Finance", true],
    ["David Nkomo", "Senior Programs Officer", "david@example.org", "Programs", true],
    ["Emma Watson", "Logistics & Operations Lead", "emma@example.org", "Operations", true],
    ["Sarah Jenkins", "Communications Specialist", "sarah@example.org", "Communications", true],
    ["Paul Mbida", "M&E Lead Evaluator", "paul@example.org", "Monitoring & Evaluation", true]
  ];

  sheet.getRange(2, 1, defaultPeople.length, 5).setValues(defaultPeople);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 230);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 120);
  sheet.setFrozenRows(1);
}

/**
 * 2. TEAMS SHEET SETUP
 */
function setupTeamsSheet(sheet) {
  sheet.clear();
  const headers = ["Team Name", "Active Status"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  sheet.getRange(1, 1, 1, headers.length)
       .setBackground("#1E293B")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold");

  const defaultTeams = [
    ["Administration", true],
    ["Finance", true],
    ["Programs", true],
    ["Communications", true],
    ["Operations", true],
    ["Monitoring & Evaluation", true]
  ];

  sheet.getRange(2, 1, defaultTeams.length, 2).setValues(defaultTeams);
  sheet.setColumnWidth(1, 220);
  sheet.setFrozenRows(1);
}

/**
 * 3. ACTION TRACKER SHEET SETUP
 */
function setupActionTrackerSheet(sheet) {
  sheet.clear();
  
  // Column Headers (A to AB)
  const headers = [
    "Action ID",             // A
    "Date Created",          // B
    "Created By",            // C
    "Meeting/Event",         // D
    "Meeting Date",          // E
    "Action Item",           // F
    "Expected Deliverable",  // G
    "Core Team",             // H
    "Priority",              // I
    "Responsible Person",    // J
    "Responsible Email",     // K
    "Accountable Person",    // L
    "Accountable Email",     // M
    "Supporting Person/Team",// N
    "Start Date",            // O
    "Due Date",              // P
    "Status",                // Q
    "% Complete",            // R
    "Health",                // S
    "Days Remaining",        // T
    "Link to Work",          // U
    "Latest Update",         // V
    "Blocker",               // W
    "Last Updated",          // X
    "Completion Date",       // Y
    "Reminder Stage",        // Z
    "Last Reminder Sent",    // AA
    "Escalation Level"       // AB
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatting Header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0F172A")
             .setFontColor("#FFFFFF")
             .setFontWeight("bold")
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle")
             .setWrap(true);
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  // Set default column formats
  sheet.getRange("B2:B").setNumberFormat("YYYY-MM-DD HH:mm:ss");
  sheet.getRange("E2:E").setNumberFormat("YYYY-MM-DD");
  sheet.getRange("O2:O").setNumberFormat("YYYY-MM-DD");
  sheet.getRange("P2:P").setNumberFormat("YYYY-MM-DD");
  sheet.getRange("R2:R").setNumberFormat("0%");
  sheet.getRange("X2:X").setNumberFormat("YYYY-MM-DD HH:mm:ss");
  sheet.getRange("Y2:Y").setNumberFormat("YYYY-MM-DD HH:mm:ss");
  sheet.getRange("AA2:AA").setNumberFormat("YYYY-MM-DD HH:mm:ss");

  // Sample Data Row
  const sampleRow = [
    "ACT-2026-001",
    new Date(),
    "arthur@example.org",
    "Weekly Management Meeting",
    new Date(),
    "Prepare and submit the Q3 financial audit report.",
    "Final signed PDF audit report delivered to ED.",
    "Finance",
    "High",
    "Arthur Pendelton",
    "=IFERROR(VLOOKUP(J2, People!A:C, 3, FALSE), \"arthur@example.org\")",
    "Martial Kouam",
    "=IFERROR(VLOOKUP(L2, People!A:C, 3, FALSE), \"martial@example.org\")",
    "Claire Vance",
    new Date(),
    new Date(Date.now() + 5 * 86400000), // Due in 5 days
    "In Progress",
    0.25,
    "On Track",
    5,
    "https://drive.google.com",
    "Data collection completed, draft pending.",
    "",
    new Date(),
    "",
    "None",
    "",
    "Level 0"
  ];

  sheet.getRange(2, 1, 1, sampleRow.length).setValues([sampleRow]);
  
  // Data Validations for easy non-manual selection
  // Priority Dropdown
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Critical", "High", "Medium", "Low"], true)
    .build();
  sheet.getRange("I2:I1000").setDataValidation(priorityRule);

  // Status Dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not Started", "In Progress", "Blocked", "Completed", "On Hold", "Cancelled"], true)
    .build();
  sheet.getRange("Q2:Q1000").setDataValidation(statusRule);

  // Core Team Dropdown (from Teams tab)
  const teamRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheet.getParent().getSheetByName("Teams").getRange("A2:A50"), true)
    .build();
  sheet.getRange("H2:H1000").setDataValidation(teamRule);

  // People Dropdown (from People tab Column A - Person Name)
  const personRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheet.getParent().getSheetByName("People").getRange("A2:A100"), true)
    .build();
  sheet.getRange("J2:J1000").setDataValidation(personRule);
  sheet.getRange("L2:L1000").setDataValidation(personRule);
}

/**
 * 4. SETTINGS SHEET SETUP
 */
function setupSettingsSheet(sheet) {
  sheet.clear();
  const headers = ["Setting", "Value"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  sheet.getRange(1, 1, 1, headers.length)
       .setBackground("#1E293B")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold");

  const settings = [
    ["Organization Name", "YOUR ORGANIZATION"],
    ["Reminder Hour", 8],
    ["Due Soon Days", 3],
    ["Escalation After Days", 3],
    ["Second Escalation After Days", 7],
    ["Reminder Email Sender Name", "Action Item Tracker"],
    ["Management Escalation Email", "management@example.org"]
  ];

  sheet.getRange(2, 1, settings.length, 2).setValues(settings);
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 250);
  sheet.setFrozenRows(1);
}

/**
 * 5. REMINDER LOG SHEET SETUP
 */
function setupReminderLogSheet(sheet) {
  sheet.clear();
  const headers = ["Timestamp", "Action ID", "Reminder Type", "Recipient Name", "Recipient Email", "Result", "Details"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  sheet.getRange(1, 1, 1, headers.length)
       .setBackground("#1E293B")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * 6. DASHBOARD SHEET SETUP
 */
function setupDashboardSheet(sheet) {
  sheet.clear();
  sheet.getRange("A1").setValue("ACTION ITEM TRACKER DASHBOARD")
       .setFontSize(16)
       .setFontWeight("bold")
       .setFontColor("#0F172A");
  
  // KPI Metrics Table Headers
  const kpis = [
    ["Total Actions", "=COUNTA('Action Tracker'!A2:A)"],
    ["Completed", "=COUNTIF('Action Tracker'!Q2:Q, \"Completed\")"],
    ["In Progress", "=COUNTIF('Action Tracker'!Q2:Q, \"In Progress\")"],
    ["Not Started", "=COUNTIF('Action Tracker'!Q2:Q, \"Not Started\")"],
    ["Blocked", "=COUNTIF('Action Tracker'!Q2:Q, \"Blocked\")"],
    ["Overdue", "=COUNTIF('Action Tracker'!S2:S, \"Overdue\")"],
    ["Due Soon", "=COUNTIF('Action Tracker'!S2:S, \"Due Soon\")"]
  ];
  
  for (let i = 0; i < kpis.length; i++) {
    let col = i + 1;
    sheet.getRange(3, col).setValue(kpis[i][0]).setFontWeight("bold").setBackground("#F1F5F9").setHorizontalAlignment("center");
    sheet.getRange(4, col).setFormula(kpis[i][1]).setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  }
  sheet.setFrozenRows(1);
}

/**
 * 7. FORM RESPONSES SHEET SETUP
 */
function setupFormResponsesSheet(sheet) {
  sheet.setFrozenRows(1);
}
