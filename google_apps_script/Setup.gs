/**
 * ACTION ITEM TRACKER - SETUP & INITIALIZATION SCRIPT
 * Specification Version: 1.4 (Added THRIVE Action Items Seed Import)
 * 
 * Run seedThriveData() to populate all 36 real THRIVE organizational
 * action items into your Google Sheet!
 */

function buildTrackerSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const tabNames = [
    "Action Tracker",
    "Form Responses",
    "People",
    "Teams",
    "Dashboard",
    "Reminder Log",
    "Settings"
  ];
  
  tabNames.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
  });

  setupPeopleSheet(ss.getSheetByName("People"));
  setupTeamsSheet(ss.getSheetByName("Teams"));
  setupActionTrackerSheet(ss.getSheetByName("Action Tracker"));
  setupSettingsSheet(ss.getSheetByName("Settings"));
  setupReminderLogSheet(ss.getSheetByName("Reminder Log"));
  setupDashboardSheet(ss.getSheetByName("Dashboard"));
  setupFormResponsesSheet(ss.getSheetByName("Form Responses"));
  
  // Seed the 36 real THRIVE action items
  seedThriveData();

  SpreadsheetApp.getUi().alert("✅ Action Item Tracker initialized with all 36 THRIVE action items successfully!");
}

/**
 * 1. PEOPLE SHEET SETUP (Organizational Directory)
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
    ["Arthur", "Executive Director / Public Health Lead", "arthur@example.org", "Public Health", true],
    ["Martial", "Operations & Finance Lead", "martial@example.org", "Admin and Finance", true],
    ["Marius", "Web & Data Management Lead", "marius@example.org", "Data Management", true],
    ["Adrien", "Research & Documentation Lead", "adrien@example.org", "Public Health", true],
    ["Sanjo", "Graphic Designer & Media Specialist", "sanjo@example.org", "Design, Media & Web", true],
    ["Claire", "Finance Officer", "claire@example.org", "Admin and Finance", true],
    ["All", "All Team Members", "team@example.org", "All Teams", true]
  ];

  sheet.getRange(2, 1, defaultPeople.length, 5).setValues(defaultPeople);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 230);
  sheet.setColumnWidth(3, 220);
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
    ["Public health", true],
    ["Admin and Finance", true],
    ["Design, media and web", true],
    ["Data Management", true],
    ["All teams", true]
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

  sheet.getRange("B2:B").setNumberFormat("YYYY-MM-DD HH:mm:ss");
  sheet.getRange("E2:E").setNumberFormat("YYYY-MM-DD");
  sheet.getRange("O2:O").setNumberFormat("YYYY-MM-DD");
  sheet.getRange("P2:P").setNumberFormat("YYYY-MM-DD");
  sheet.getRange("R2:R").setNumberFormat("0%");
  sheet.getRange("X2:X").setNumberFormat("YYYY-MM-DD HH:mm:ss");
  sheet.getRange("Y2:Y").setNumberFormat("YYYY-MM-DD HH:mm:ss");
  sheet.getRange("AA2:AA").setNumberFormat("YYYY-MM-DD HH:mm:ss");

  // Validations
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Critical", "High", "Medium", "Low"], true)
    .build();
  sheet.getRange("I2:I1000").setDataValidation(priorityRule);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not Started", "In Progress", "Blocked", "Completed", "On Hold", "Cancelled"], true)
    .build();
  sheet.getRange("Q2:Q1000").setDataValidation(statusRule);

  const teamRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheet.getParent().getSheetByName("Teams").getRange("A2:A50"), true)
    .build();
  sheet.getRange("H2:H1000").setDataValidation(teamRule);

  const personRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sheet.getParent().getSheetByName("People").getRange("A2:A100"), true)
    .build();
  sheet.getRange("J2:J1000").setDataValidation(personRule);
  sheet.getRange("L2:L1000").setDataValidation(personRule);
}

/**
 * 4. SEED THRIVE 36 ACTION ITEMS INTO SHEET
 */
function seedThriveData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Action Tracker");
  if (!sheet) return;

  // Clear existing rows (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 28).clearContent();
  }

  const thriveItems = [
    [1, "Prepare the THRIVE August 2026-August 2027 logic model that will be used to develop the set-up and institutional build and the pragmatic delivery and field areas of work with core team members", "All teams", "Critical", "Arthur", "", "Need help", "", "Not Started", "2026-09-30", ""],
    [2, "Register THRIVE at the Centre des Impôts (Tax Office) and obtain the Unique Identification Number (NIU)", "Admin and Finance", "Critical", "Martial", "Arthur", "", "", "Not Started", "", ""],
    [3, "Secure a Tax Clearance Certificate (Attestation de Non-Redevance)", "Admin and Finance", "Critical", "Martial", "Arthur", "", "", "Not Started", "", ""],
    [4, "Register with the CNPS (Caisse Nationale de Prévoyance Sociale)", "Admin and Finance", "Medium", "Martial", "Arthur", "", "", "Not Started", "", ""],
    [5, "Sign a Memorandum of Understanding (MoU) with the regional delegate of public health of Adamawa", "Public health", "Critical", "Arthur", "", "", "", "In Progress", "2026-09-30", ""],
    [6, "Propose a number of banks where THRIVE could open their bank accounts with advantages and possible disadvantages", "Admin and Finance", "Critical", "Martial", "Arthur", "", "", "Not Started", "", ""],
    [7, "Open a Dual-Signatory Corporate Bank Account ( Executive Director and Treasurer)", "Admin and Finance", "Critical", "Martial", "Arthur", "", "", "Not Started", "", ""],
    [8, "Prepare urgent admin and finance general management plan, documents and tools", "Admin and Finance", "Critical", "Martial", "Arthur", "", "", "Not Started", "", ""],
    [9, "Visit the DMO of Ngaoundere urbain, Ngaoundere rurale and Dang with the regional MoU to review DHIS two gaps for thier districs, Identify and documents clear gaps related to MNCH, Asthma and COPD and obtain DHIS 2 data", "Public health", "Critical", "Arthur", "", "", "", "Not Started", "2026-09-30", ""],
    [10, "Prepare and sign annual operational plans or the THRIVE strategic 2026-2029 plan with each DMO tailored to district realities", "Public health", "Critical", "Arthur", "", "", "", "Not Started", "2026-09-30", ""],
    [11, "Conduct a thorough literature review on identified innovative spirometry and peak flow meters that may require research to validate their products and email them for a possible collaboration", "Public health", "Medium", "Arthur", "", "", "", "On Hold", "2026-09-30", ""],
    [12, "Create and propose the THRIVE Website for review to the core team and volunteers", "Design, media and web", "Critical", "Marius", "", "", "", "Not Started", "", ""],
    [13, "Revised the organisation website proposal and give feedback for improvement", "All teams", "Critical", "All", "", "", "", "Not Started", "", ""],
    [14, "Select the company where the organisation domain name will be bought and who will host the organisation website", "Design, media and web", "Critical", "Marius", "", "", "", "In Progress", "", ""],
    [15, "Use the domain name of the website and the organisation papers to apply for a free Google Workspace for non-profits", "Public health", "Critical", "Arthur", "", "", "https://strategy.amref.org/our-strategy/", "Not Started", "2026-09-15", ""],
    [16, "Share resources on logical models and operational plan development", "Public health", "Critical", "Arthur", "", "", "", "Completed", "2026-09-01", ""],
    [17, "Circulate the organisation’s bylaws and follow up on the revised version submitted to the Divisional Office", "Public health", "Critical", "Arthur", "", "", "", "In Progress", "2026-09-15", ""],
    [18, "Share relevant job aids and documentation on gender equality", "Public health", "Medium", "Arthur", "", "", "", "Completed", "2026-09-01", ""],
    [19, "Propose several organisation colours to the core team and volunteers for review and adoption", "Design, media and web", "Critical", "Sanjo", "", "", "", "Not Started", "", ""],
    [20, "Propose several organisation logo samples to the core team and volunteers for review and adoption", "Design, media and web", "Critical", "Sanjo", "", "", "", "Not Started", "2026-09-15", ""],
    [21, "Propose several organisation roll-up banner templates to the core team and volunteers for review and adoption", "Design, media and web", "Critical", "Sanjo", "", "", "", "Not Started", "", ""],
    [22, "Recruit a volunteer to support the graphic designer", "All teams", "Medium", "Arthur", "", "", "", "On Hold", "", ""],
    [23, "Engage one major community leader from each of the health districts of Ngaoundere rural, Ngaoundere urbain and Dang as THRIVE partners", "Public health", "High", "Arthur", "", "", "", "Not Started", "2026-09-30", ""],
    [24, "Organise a dedicated grant-development meeting", "All teams", "High", "Arthur", "", "", "", "In Progress", "", ""],
    [25, "Create a WhatsApp community with subgroups for the organisation’s different teams and workstreams", "All teams", "Critical", "Arthur", "", "", "", "Completed", "2026-09-03", ""],
    [26, "Prepare a number of organisation moto and share with the team for review and approval", "Public health", "Critical", "Arthur", "", "", "", "Not Started", "2026-09-04", ""],
    [27, "Create a master action list for the organisation where action items from all our meetings will be captured for easy follow-up and evaluation", "Public health", "Critical", "Arthur", "Martial", "All", "https://docs.google.com/spreadsheets/d/1Rzm9KQ6kjcXJEfoMjYH67Qvv1qo6KyIiMASueOQppHQ/edit?gid=27097374#gid=27097374", "Completed", "2026-09-01", ""],
    [28, "Share the current organisation documentation framework with the team with a message on how to use the framework", "Public health", "Critical", "Arthur", "Martial", "All", "", "Completed", "2026-09-01", ""],
    [29, "Create and share a team charter for review and approval", "Public health", "Critical", "Arthur", "Martial", "All", "", "Completed", "2026-09-04", ""],
    [30, "Propose several free virtual workplaces (project management and communication tools) that could be currently used by the team", "Data Management", "Critical", "Marius", "", "", "", "In Progress", "", ""],
    [31, "Create and share a nomenclature and coding system for organisational meeting minutes/notes and reports", "Public health", "Critical", "Adrien", "", "", "", "In Progress", "", ""],
    [32, "Share the current grant opportunities at hand with the team and brainstorm on how to start the writing process", "Public health", "Critical", "Arthur", "", "", "", "Completed", "2026-09-04", ""],
    [33, "Conduct a deep literature review on existing Cameroon MNCH data from UN, MINSANTE and INS and propose potential areas for grant writing", "Public health", "Critical", "Adrien", "", "", "", "In Progress", "2026-09-20", ""],
    [34, "Use 2023-2026 MNCH data to MAP organisation data with 2027-2030 visual projections", "Data Management", "Critical", "Marius", "", "", "", "Not Started", "", ""],
    [35, "Establish and document a structured file directory path for all institutional assets in shared Google Drive", "Public health", "Critical", "Arthur", "", "", "", "Not Started", "2026-11-01", ""],
    [36, "Recruit a volunteer to support the financial team", "All teams", "Medium", "Arthur", "", "", "", "Not Started", "", ""]
  ];

  const rows = [];
  const now = new Date();

  for (let i = 0; i < thriveItems.length; i++) {
    const item = thriveItems[i];
    const sn = item[0];
    const actionId = "ACT-2026-" + ("000" + sn).slice(-3);
    const actionItem = item[1];
    const team = item[2];
    const priority = item[3] === "Very high" ? "Critical" : item[3];
    const resp = item[4];
    const acc = item[5] || resp;
    const communicate = item[6];
    const link = item[7];
    const status = item[8];
    const dueStr = item[9];
    const comment = item[10];

    const pct = (status === "Completed") ? 1.0 : (status === "In Progress" ? 0.5 : 0.0);
    const dueDate = dueStr ? new Date(dueStr) : new Date(Date.now() + 14 * 86400000);
    const health = calculateHealth(dueDate, status, now);
    const daysLeft = calculateDaysRemaining(dueDate, status);

    rows.push([
      actionId,
      now,
      "arthur@example.org",
      "THRIVE Core Meeting",
      now,
      actionItem,
      actionItem,
      team,
      priority,
      resp,
      "=IFERROR(VLOOKUP(J" + (i + 2) + ", People!A:C, 3, FALSE), \"\")",
      acc,
      "=IFERROR(VLOOKUP(L" + (i + 2) + ", People!A:C, 3, FALSE), \"\")",
      communicate,
      now,
      dueDate,
      status,
      pct,
      health,
      daysLeft,
      link,
      comment,
      "",
      now,
      (status === "Completed" ? now : ""),
      "None",
      "",
      "Level 0"
    ]);
  }

  sheet.getRange(2, 1, rows.length, 28).setValues(rows);
  Logger.log("Successfully seeded 36 THRIVE Action Items!");
}

/**
 * 5. SETTINGS SHEET SETUP
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
    ["Organization Name", "THRIVE"],
    ["Reminder Hour", 8],
    ["Due Soon Days", 3],
    ["Escalation After Days", 3],
    ["Second Escalation After Days", 7],
    ["Reminder Email Sender Name", "THRIVE Action Tracker"],
    ["Management Escalation Email", "arthur@example.org"]
  ];

  sheet.getRange(2, 1, settings.length, 2).setValues(settings);
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 250);
  sheet.setFrozenRows(1);
}

/**
 * 6. REMINDER LOG SHEET SETUP
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
 * 7. DASHBOARD SHEET SETUP
 */
function setupDashboardSheet(sheet) {
  sheet.clear();
  sheet.getRange("A1").setValue("THRIVE ACTION ITEM TRACKER DASHBOARD")
       .setFontSize(16)
       .setFontWeight("bold")
       .setFontColor("#0F172A");
  
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
 * 8. FORM RESPONSES SHEET SETUP
 */
function setupFormResponsesSheet(sheet) {
  sheet.setFrozenRows(1);
}
