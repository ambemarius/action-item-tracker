/**
 * ACTION ITEM TRACKER - PERSONALIZED EMAIL DIGEST AUTOMATION
 * Specification Version: 1.2
 * 
 * Features:
 * - Filters action items by Person Name or Email Address.
 * - Excludes Completed and Cancelled tasks (sends ONLY active/outstanding tasks).
 * - Generates a rich, responsive HTML Email Dashboard for each team member.
 * - Function sendTestEmailDigest() sends test report for Ambe Marius (ambengwa48@gmail.com).
 * - Function sendPersonalizedEmailDigests() runs for all team members in the People sheet.
 */

/**
 * Send a Test Email Digest directly to Ambe Marius (ambengwa48@gmail.com)
 * Run this function from Apps Script Editor to test the email immediately!
 */
function sendTestEmailDigest() {
  const testEmail = "ambengwa48@gmail.com";
  const testPersonName = "Marius";
  
  const result = generateAndSendDigestForPerson(testPersonName, testEmail, true);
  
  if (result.success) {
    Logger.log("✅ Test email digest successfully sent to " + testEmail);
    SpreadsheetApp.getUi().alert("✅ Test Email Digest (Uncompleted Tasks Only) sent successfully to " + testEmail + "!");
  } else {
    Logger.log("❌ Failed to send test email digest: " + result.error);
    SpreadsheetApp.getUi().alert("❌ Error sending test email: " + result.error);
  }
}

/**
 * Automated Daily / Weekly Personalized Email Digest Engine
 * Iterates through all active team members in the 'People' sheet and sends their individual digest.
 */
function sendPersonalizedEmailDigests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const peopleSheet = ss.getSheetByName("People");
  if (!peopleSheet || peopleSheet.getLastRow() <= 1) return;

  const peopleData = peopleSheet.getDataRange().getValues();
  let sentCount = 0;

  for (let i = 1; i < peopleData.length; i++) {
    const personName = peopleData[i][0];
    const email = peopleData[i][2] || peopleData[i][1];
    const active = peopleData[i][4];

    if (!personName || !email || active === false) continue;

    const res = generateAndSendDigestForPerson(personName, email, false);
    if (res.success) sentCount++;
  }

  Logger.log("✅ Sent personalized email digests to " + sentCount + " team members.");
}

/**
 * Helper: Generates HTML Digest for a person's UNCOMPLETED tasks & Sends via Gmail
 */
function generateAndSendDigestForPerson(personName, recipientEmail, isTest) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const trackerSheet = ss.getSheetByName("Action Tracker");
    if (!trackerSheet || trackerSheet.getLastRow() <= 1) {
      return { success: false, error: "No action items found in sheet." };
    }

    const data = trackerSheet.getDataRange().getValues();
    const userTasks = [];

    const nameSearch = (personName || "").toString().trim().toLowerCase();
    const emailSearch = (recipientEmail || "").toString().trim().toLowerCase();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      const respName = (row[9] || "").toString().trim().toLowerCase();
      const respEmail = (row[10] || "").toString().trim().toLowerCase();
      const accName = (row[11] || "").toString().trim().toLowerCase();
      const accEmail = (row[12] || "").toString().trim().toLowerCase();
      const status = (row[16] || "").toString().trim();

      // STRICT EXCLUSION: Skip Completed or Cancelled tasks!
      if (status === "Completed" || status === "Cancelled") {
        continue;
      }

      // Filter by Name or Email match
      let isMatch = false;

      if (nameSearch && (respName.includes(nameSearch) || accName.includes(nameSearch) || nameSearch.includes(respName))) {
        isMatch = true;
      }
      if (emailSearch && (respEmail.includes(emailSearch) || accEmail.includes(emailSearch))) {
        isMatch = true;
      }
      if (respName === "all" || respName === "all teams") {
        isMatch = true;
      }
      if (isTest && (respName.includes("marius") || respName.includes("arthur") || i <= 8)) {
        isMatch = true;
      }

      if (isMatch) {
        userTasks.push({
          id: row[0],
          actionItem: row[5],
          deliverable: row[6],
          team: row[7],
          priority: row[8],
          responsible: row[9],
          accountable: row[11],
          dueDate: formatDateStr(row[15]),
          status: row[16],
          pctComplete: Math.round((row[17] || 0) * 100),
          health: row[18],
          daysRemaining: row[19],
          link: row[20],
          update: row[21],
          blocker: row[22]
        });
      }
    }

    // Individual Task Counts (Uncompleted)
    const totalOutstanding = userTasks.length;
    const inProgress = userTasks.filter(t => t.status === "In Progress").length;
    const overdue = userTasks.filter(t => t.health === "Overdue").length;
    const blocked = userTasks.filter(t => t.status === "Blocked").length;
    const notStarted = userTasks.filter(t => t.status === "Not Started" || t.status === "Pending").length;

    // Do not send digest if person has 0 outstanding tasks (unless test mode)
    if (totalOutstanding === 0 && !isTest) {
      Logger.log("Skipping email for " + personName + " — 0 outstanding tasks.");
      return { success: true };
    }

    const htmlBody = buildHtmlEmailBody(personName, userTasks, totalOutstanding, inProgress, overdue, blocked, notStarted);
    const textBody = `Hello ${personName},\n\nHere is your THRIVE Outstanding Action Items Digest.\nTotal Outstanding: ${totalOutstanding} | In Progress: ${inProgress} | Overdue: ${overdue} | Blocked: ${blocked}\n\nPlease check your email viewer for your personalized dashboard.`;

    MailApp.sendEmail({
      to: recipientEmail,
      subject: `📋 THRIVE Action Items Digest — ${personName} (${totalOutstanding} Outstanding${overdue > 0 ? ', ' + overdue + ' OVERDUE' : ''})`,
      body: textBody,
      htmlBody: htmlBody,
      name: "THRIVE Executive Command Center"
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Builds HTML Email Body Template
 */
function buildHtmlEmailBody(name, tasks, total, inProgress, overdue, blocked, notStarted) {
  let tableRowsHtml = "";
  if (tasks.length === 0) {
    tableRowsHtml = `<tr><td colspan="7" style="padding: 25px; text-align: center; color: #10B981; font-weight: bold;">🎉 Great job! You currently have 0 uncompleted action items.</td></tr>`;
  } else {
    tableRowsHtml = tasks.map(t => {
      const statusBg = getStatusBgColor(t.status);
      const statusTextColor = getStatusTextColor(t.status);
      const healthColor = getHealthTextColor(t.health);
      const prioBg = getPriorityBgColor(t.priority);

      return `
        <tr style="border-bottom: 1px solid #1E293B;">
          <td style="padding: 12px 10px; font-family: monospace; font-weight: bold; color: #818CF8;">${t.id}</td>
          <td style="padding: 12px 10px; color: #F8FAFC;">
            <strong>${escapeHtmlStr(t.actionItem)}</strong>
            ${t.blocker ? `<br><small style="color:#EF4444;">⚠️ Blocker: ${escapeHtmlStr(t.blocker)}</small>` : ''}
            ${t.link ? `<br><a href="${t.link}" style="color:#6366F1; font-size:12px; text-decoration:underline;">🔗 Working Document</a>` : ''}
          </td>
          <td style="padding: 12px 10px; color: #94A3B8; font-size: 13px;">${t.team}</td>
          <td style="padding: 12px 10px;">
            <span style="background: ${prioBg}; color: #FFFFFF; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">${t.priority}</span>
          </td>
          <td style="padding: 12px 10px; color: #CBD5E1; font-size: 13px;">${t.dueDate}</td>
          <td style="padding: 12px 10px;">
            <span style="background: ${statusBg}; color: ${statusTextColor}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">${t.status} (${t.pctComplete}%)</span>
          </td>
          <td style="padding: 12px 10px;">
            <span style="color: ${healthColor}; font-weight: bold; font-size: 13px;">${t.health}</span>
          </td>
        </tr>
      `;
    }).join("");
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>THRIVE Individual Outstanding Action Items</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #F8FAFC;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B0F17; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="700" cellspacing="0" cellpadding="0" style="background-color: #151C2C; border-radius: 16px; overflow: hidden; border: 1px solid #1E293B; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 25px 30px; text-align: left;">
                  <h1 style="margin: 0; font-size: 22px; color: #FFFFFF; font-weight: 800;">📋 THRIVE Action Items Digest</h1>
                  <p style="margin: 5px 0 0 0; color: #E0E7FF; font-size: 14px;">Outstanding Tasks Digest for <strong>${name}</strong></p>
                </td>
              </tr>

              <!-- KPI Metric Summary Cards -->
              <tr>
                <td style="padding: 25px 30px 15px 30px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="25%" style="padding: 4px;">
                        <div style="background: #1E293B; border-radius: 10px; padding: 12px; text-align: center; border: 1px solid #334155;">
                          <span style="color: #94A3B8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Outstanding</span>
                          <h2 style="margin: 4px 0 0 0; color: #F8FAFC; font-size: 22px;">${total}</h2>
                        </div>
                      </td>
                      <td width="25%" style="padding: 4px;">
                        <div style="background: rgba(59, 130, 246, 0.15); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(59, 130, 246, 0.3);">
                          <span style="color: #3B82F6; font-size: 11px; font-weight: bold; text-transform: uppercase;">In Progress</span>
                          <h2 style="margin: 4px 0 0 0; color: #3B82F6; font-size: 22px;">${inProgress}</h2>
                        </div>
                      </td>
                      <td width="25%" style="padding: 4px;">
                        <div style="background: rgba(239, 68, 68, 0.18); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.3);">
                          <span style="color: #EF4444; font-size: 11px; font-weight: bold; text-transform: uppercase;">Overdue</span>
                          <h2 style="margin: 4px 0 0 0; color: #EF4444; font-size: 22px;">${overdue}</h2>
                        </div>
                      </td>
                      <td width="25%" style="padding: 4px;">
                        <div style="background: rgba(245, 158, 11, 0.15); border-radius: 10px; padding: 12px; text-align: center; border: 1px solid rgba(245, 158, 11, 0.3);">
                          <span style="color: #F59E0B; font-size: 11px; font-weight: bold; text-transform: uppercase;">Pending</span>
                          <h2 style="margin: 4px 0 0 0; color: #F59E0B; font-size: 22px;">${notStarted}</h2>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Personal Action Items Table -->
              <tr>
                <td style="padding: 0 30px 25px 30px;">
                  <h3 style="color: #F8FAFC; font-size: 16px; margin: 0 0 12px 0;">🎯 Your Outstanding Action Items (Uncompleted Only)</h3>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #0F172A; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background: #1E293B; text-align: left; font-size: 12px; color: #94A3B8;">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Action Item</th>
                        <th style="padding: 10px;">Team</th>
                        <th style="padding: 10px;">Priority</th>
                        <th style="padding: 10px;">Due Date</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px;">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tableRowsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- CTA Footer Buttons -->
              <tr>
                <td style="background: #0F172A; padding: 20px 30px; text-align: center; border-top: 1px solid #1E293B;">
                  <a href="https://ambemarius.github.io/action-item-tracker../" target="_blank" style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(99,102,241,0.4);">
                    🌐 Open Interactive Dashboard
                  </a>
                  <p style="margin: 15px 0 0 0; color: #64748B; font-size: 12px;">Automated Notification System • THRIVE Executive Command Center</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getStatusBgColor(status) {
  switch (status) {
    case 'Completed': return 'rgba(16, 185, 129, 0.2)';
    case 'In Progress': return 'rgba(59, 130, 246, 0.2)';
    case 'Blocked': return 'rgba(239, 68, 68, 0.25)';
    case 'On Hold': return 'rgba(245, 158, 11, 0.2)';
    default: return 'rgba(148, 163, 184, 0.2)';
  }
}

function getStatusTextColor(status) {
  switch (status) {
    case 'Completed': return '#10B981';
    case 'In Progress': return '#3B82F6';
    case 'Blocked': return '#EF4444';
    case 'On Hold': return '#F59E0B';
    default: return '#94A3B8';
  }
}

function getHealthTextColor(health) {
  switch (health) {
    case 'Completed': return '#10B981';
    case 'Overdue': return '#EF4444';
    case 'Blocked': return '#EF4444';
    case 'Due Soon': return '#F97316';
    default: return '#14B8A6';
  }
}

function getPriorityBgColor(priority) {
  switch (priority) {
    case 'Critical': return '#EF4444';
    case 'High': return '#F97316';
    case 'Medium': return '#EAB308';
    default: return '#10B981';
  }
}

function formatDateStr(d) {
  if (!d) return "N/A";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return d;
  return dateObj.toISOString().split('T')[0];
}

function escapeHtmlStr(str) {
  return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
