/**
 * ACTION ITEM TRACKER - FRONTEND CONTROLLER (app.js)
 * Interactive UI Engine, Data Handler & Real THRIVE Action Items
 */

let GOOGLE_SHEETS_WEB_APP_URL = localStorage.getItem('google_sheet_webapp_url') || "https://script.google.com/macros/s/AKfycbza2H-bbGcbGmUAycjoET_vQutfiKP7nPBjKUTWzY7FDL82wqSI9StbK8f0wiJFiGQbTQ/exec";

// Organizational Directory (THRIVE Team Members)
const defaultPeople = [
    { name: "Arthur", role: "Executive Director / Public Health Lead", email: "arthur@example.org", team: "Public health" },
    { name: "Martial", role: "Operations & Finance Lead", email: "martial@example.org", team: "Admin and Finance" },
    { name: "Marius", role: "Web & Data Management Lead", email: "marius@example.org", team: "Data Management" },
    { name: "Adrien", role: "Research & Documentation Lead", email: "adrien@example.org", team: "Public health" },
    { name: "Sanjo", role: "Graphic Designer & Media Specialist", email: "sanjo@example.org", team: "Design, media and web" },
    { name: "Claire", role: "Finance Officer", email: "claire@example.org", team: "Admin and Finance" },
    { name: "All Team Members", role: "All Organization Members", email: "team@example.org", team: "All teams" }
];

// All 36 Real THRIVE Action Items
const defaultActions = [
    { id: "ACT-2026-001", actionItem: "Prepare the THRIVE August 2026-August 2027 logic model that will be used to develop the set-up and institutional build...", deliverable: "Logic model for THRIVE 2026-2027", team: "All teams", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 14, link: "", latestUpdate: "Need help", blocker: "" },
    { id: "ACT-2026-002", actionItem: "Register THRIVE at the Centre des Impôts (Tax Office) and obtain the Unique Identification Number (NIU)", deliverable: "NIU Tax Number Certificate", team: "Admin and Finance", priority: "Critical", responsible: "Martial", respRole: "Operations Lead", respEmail: "martial@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-25", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 9, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-003", actionItem: "Secure a Tax Clearance Certificate (Attestation de Non-Redevance)", deliverable: "Signed Tax Clearance Certificate", team: "Admin and Finance", priority: "Critical", responsible: "Martial", respRole: "Operations Lead", respEmail: "martial@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-28", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 12, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-004", actionItem: "Register with the CNPS (Caisse Nationale de Prévoyance Sociale)", deliverable: "CNPS Organizational Registration", team: "Admin and Finance", priority: "Medium", responsible: "Martial", respRole: "Operations Lead", respEmail: "martial@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-10-15", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 29, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-005", actionItem: "Sign a Memorandum of Understanding (MoU) with the regional delegate of public health of Adamawa", deliverable: "Signed Regional Public Health MoU", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "In Progress", pctComplete: 50, health: "On Track", daysRemaining: 14, link: "", latestUpdate: "MoU draft sent to Regional Delegate", blocker: "" },
    { id: "ACT-2026-006", actionItem: "Propose a number of banks where THRIVE could open their bank accounts with advantages and possible disadvantages", deliverable: "Banking Comparison Proposal", team: "Admin and Finance", priority: "Critical", responsible: "Martial", respRole: "Operations Lead", respEmail: "martial@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-20", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 4, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-007", actionItem: "Open a Dual-Signatory Corporate Bank Account ( Executive Director and Treasurer)", deliverable: "Active Corporate Dual-Signatory Bank Account", team: "Admin and Finance", priority: "Critical", responsible: "Martial", respRole: "Operations Lead", respEmail: "martial@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-10-05", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 19, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-008", actionItem: "Prepare urgent admin and finance general management plan, documents and tools", "deliverable": "Admin & Finance Management Toolkit", team: "Admin and Finance", priority: "Critical", responsible: "Martial", respRole: "Operations Lead", respEmail: "martial@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 14, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-009", actionItem: "Visit the DMO of Ngaoundere urbain, Ngaoundere rurale and Dang with the regional MoU to review DHIS two gaps", deliverable: "DHIS 2 Gap Assessment & Data Extract", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 14, link: "", latestUpdate: "Pending DMO schedule", blocker: "" },
    { id: "ACT-2026-010", actionItem: "Prepare and sign annual operational plans or the THRIVE strategic 2026-2029 plan with each DMO", deliverable: "Signed Annual Operational Plans (2026-2029)", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 14, link: "", latestUpdate: "Pending DMO review", blocker: "" },
    { id: "ACT-2026-011", actionItem: "Conduct a thorough literature review on identified innovative spirometry and peak flow meters", deliverable: "Spirometry Review Report & Outreach Emails", team: "Public health", priority: "Medium", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "On Hold", pctComplete: 20, health: "On Hold", daysRemaining: 14, link: "", latestUpdate: "On hold for tech specs", blocker: "" },
    { id: "ACT-2026-012", actionItem: "Create and propose the THRIVE Website for review to the core team and volunteers", deliverable: "Working THRIVE Website Prototype", team: "Design, media and web", priority: "Critical", responsible: "Marius", respRole: "Web & Data Lead", respEmail: "marius@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-25", status: "In Progress", pctComplete: 70, health: "On Track", daysRemaining: 9, link: "", latestUpdate: "Frontend layout completed", blocker: "" },
    { id: "ACT-2026-013", actionItem: "Revised the organisation website proposal and give feedback for improvement", deliverable: "Website Review Feedback Document", team: "All teams", priority: "Critical", responsible: "All Team Members", respRole: "All Organization Members", respEmail: "team@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-28", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 12, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-014", actionItem: "Select the company where the organisation domain name will be bought and who will host the organisation website", deliverable: "Domain & Hosting Provider Selection", team: "Design, media and web", priority: "Critical", responsible: "Marius", respRole: "Web & Data Lead", respEmail: "marius@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-18", status: "In Progress", pctComplete: 60, health: "On Track", daysRemaining: 2, link: "", latestUpdate: "Comparing Cloudflare vs Namecheap", blocker: "" },
    { id: "ACT-2026-015", actionItem: "Use the domain name of the website and the organisation papers to apply for a free Google Workspace for non-profits", deliverable: "Approved Google Workspace Non-Profit Account", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-15", status: "Not Started", pctComplete: 0, health: "Overdue", daysRemaining: -1, link: "https://strategy.amref.org/our-strategy/", latestUpdate: "Pending domain setup", blocker: "" },
    { id: "ACT-2026-016", actionItem: "Share resources on logical models and operational plan development", deliverable: "Logical Models & Operational Plan Resource Pack", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-01", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "", latestUpdate: "Resources shared in WhatsApp group", blocker: "" },
    { id: "ACT-2026-017", actionItem: "Circulate the organisation’s bylaws and follow up on the revised version submitted to the Divisional Office", deliverable: "Approved Registered Bylaws", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-15", status: "In Progress", pctComplete: 75, health: "Overdue", daysRemaining: -1, link: "", latestUpdate: "Follow-up at Divisional Office pending", blocker: "" },
    { id: "ACT-2026-018", actionItem: "Share relevant job aids and documentation on gender equality", deliverable: "Gender Equality Job Aids & Policy Docs", team: "Public health", priority: "Medium", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-01", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "", latestUpdate: "Docs shared with team", blocker: "" },
    { id: "ACT-2026-019", actionItem: "Propose several organisation colours to the core team and volunteers for review and adoption", deliverable: "Brand Color Palette Options", team: "Design, media and web", priority: "Critical", responsible: "Sanjo", respRole: "Graphic Designer", respEmail: "sanjo@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-20", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 4, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-020", actionItem: "Propose several organisation logo samples to the core team and volunteers for review and adoption", deliverable: "Official Logo Samples", team: "Design, media and web", priority: "Critical", responsible: "Sanjo", respRole: "Graphic Designer", respEmail: "sanjo@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-15", status: "Not Started", pctComplete: 0, health: "Overdue", daysRemaining: -1, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-021", actionItem: "Propose several organisation roll-up banner templates for review and adoption", deliverable: "Roll-up Banner Templates", team: "Design, media and web", priority: "Critical", responsible: "Sanjo", respRole: "Graphic Designer", respEmail: "sanjo@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-25", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 9, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-022", actionItem: "Recruit a volunteer to support the graphic designer", deliverable: "Graphic Design Volunteer Recruited", team: "All teams", priority: "Medium", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-10-01", status: "On Hold", pctComplete: 10, health: "On Hold", daysRemaining: 15, link: "", latestUpdate: "Drafting role description", blocker: "" },
    { id: "ACT-2026-023", actionItem: "Engage one major community leader from health districts of Ngaoundere rural, Ngaoundere urbain and Dang", deliverable: "Community Partnership Engagement", team: "Public health", priority: "High", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-30", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 14, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-024", actionItem: "Organise a dedicated grant-development meeting", deliverable: "Grant Writing Strategy & Team Minutes", team: "All teams", priority: "High", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-22", status: "In Progress", pctComplete: 40, health: "On Track", daysRemaining: 6, link: "", latestUpdate: "Agenda prepared", blocker: "" },
    { id: "ACT-2026-025", actionItem: "Create a WhatsApp community with subgroups for the organisation’s different teams and workstreams", deliverable: "Active WhatsApp Community & Subgroups", team: "All teams", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-03", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "", latestUpdate: "WhatsApp groups active", blocker: "" },
    { id: "ACT-2026-026", actionItem: "Prepare a number of organisation moto and share with the team for review and approval", deliverable: "Approved Organizational Motto", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-04", status: "Not Started", pctComplete: 0, health: "Overdue", daysRemaining: -12, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-027", actionItem: "Create a master action list for the organisation where action items from all our meetings will be captured", deliverable: "Live Action Item Tracker", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Martial", startDate: "2026-09-01", dueDate: "2026-09-01", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "https://docs.google.com/spreadsheets/d/1Rzm9KQ6kjcXJEfoMjYH67Qvv1qo6KyIiMASueOQppHQ/edit?gid=27097374#gid=27097374", latestUpdate: "Tracker online & operational", blocker: "" },
    { id: "ACT-2026-028", actionItem: "Share the current organisation documentation framework with the team with a message on how to use it", deliverable: "Documentation Framework Guide", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Martial", startDate: "2026-09-01", dueDate: "2026-09-01", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "", latestUpdate: "Shared in group", blocker: "" },
    { id: "ACT-2026-029", actionItem: "Create and share a team charter for review and approval", deliverable: "Approved THRIVE Team Charter", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Martial", startDate: "2026-09-01", dueDate: "2026-09-04", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "", latestUpdate: "Charter adopted", blocker: "" },
    { id: "ACT-2026-030", actionItem: "Propose several free virtual workplaces (project management and communication tools)", deliverable: "Virtual Workplace Tool Proposal", team: "Data Management", priority: "Critical", responsible: "Marius", respRole: "Web & Data Lead", respEmail: "marius@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-22", status: "In Progress", pctComplete: 60, health: "On Track", daysRemaining: 6, link: "", latestUpdate: "Testing Slack vs Trello vs Notion", blocker: "" },
    { id: "ACT-2026-031", actionItem: "Create and share a nomenclature and coding system for organisational meeting minutes/notes and reports", deliverable: "Document Coding Nomenclature Standard", team: "Public health", priority: "Critical", responsible: "Adrien", respRole: "Research & Doc Lead", respEmail: "adrien@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-25", status: "In Progress", pctComplete: 50, health: "On Track", daysRemaining: 9, link: "", latestUpdate: "Draft coding guide prepared", blocker: "" },
    { id: "ACT-2026-032", actionItem: "Share current grant opportunities at hand with the team and brainstorm writing process", deliverable: "Grant Pipeline List & Brainstorming Session", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-04", status: "Completed", pctComplete: 100, health: "Completed", daysRemaining: "—", link: "", latestUpdate: "Opportunities shared", blocker: "" },
    { id: "ACT-2026-033", actionItem: "Conduct deep literature review on existing Cameroon MNCH data from UN, MINSANTE and INS for grant writing", deliverable: "Cameroon MNCH Literature Review & Links Sheet", team: "Public health", priority: "Critical", responsible: "Adrien", respRole: "Research & Doc Lead", respEmail: "adrien@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-09-20", status: "In Progress", pctComplete: 80, health: "On Track", daysRemaining: 4, link: "", latestUpdate: "Populating Cam Health Stats sheet", blocker: "" },
    { id: "ACT-2026-034", actionItem: "Use 2023-2026 MNCH data to MAP organisation data with 2027-2030 visual projections", deliverable: "MNCH Visual Projection Model (2027-2030)", team: "Data Management", priority: "Critical", responsible: "Marius", respRole: "Web & Data Lead", respEmail: "marius@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-10-10", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 24, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-035", actionItem: "Establish and document a structured file directory path for all institutional assets in shared Google Drive", deliverable: "Google Drive File Directory Structure Manual", team: "Public health", priority: "Critical", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-11-01", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 46, link: "", latestUpdate: "", blocker: "" },
    { id: "ACT-2026-036", actionItem: "Recruit a volunteer to support the financial team", deliverable: "Finance Volunteer Recruited", team: "All teams", priority: "Medium", responsible: "Arthur", respRole: "Executive Director", respEmail: "arthur@example.org", accountable: "Arthur", startDate: "2026-09-01", dueDate: "2026-10-15", status: "Not Started", pctComplete: 0, health: "On Track", daysRemaining: 29, link: "", latestUpdate: "", blocker: "" }
];

let actionsStore = [];
let peopleStore = [];

document.addEventListener('DOMContentLoaded', () => {
    loadStore();
    recalculateAllHealth();
    populatePeopleDropdowns();
    renderPeopleTable();
    renderDashboard();
    renderTable();
    initDates();
    loadAppsScriptCode();

    if (GOOGLE_SHEETS_WEB_APP_URL) {
        fetchFromGoogleSheets();
    }
});

async function fetchFromGoogleSheets() {
    if (!GOOGLE_SHEETS_WEB_APP_URL) return;
    try {
        const res = await fetch(GOOGLE_SHEETS_WEB_APP_URL);
        const data = await res.json();
        if (data && data.status === "success") {
            if (data.actions && data.actions.length > 0) {
                actionsStore = data.actions;
                saveStore();
            }
            if (data.people && data.people.length > 0) {
                peopleStore = data.people;
                savePeopleStore();
            }
            recalculateAllHealth();
            populatePeopleDropdowns();
            renderDashboard();
            renderTable();
            console.log("✅ Synced live data from Google Sheets API!");
        }
    } catch (e) {
        console.warn("Could not sync from Google Sheets API:", e);
    }
}

function saveGoogleSheetsUrl() {
    const url = prompt("Paste your Google Apps Script Web App URL (Deploy > New deployment > Web App):", GOOGLE_SHEETS_WEB_APP_URL);
    if (url !== null) {
        GOOGLE_SHEETS_WEB_APP_URL = url.trim();
        localStorage.setItem('google_sheet_webapp_url', GOOGLE_SHEETS_WEB_APP_URL);
        if (GOOGLE_SHEETS_WEB_APP_URL) {
            fetchFromGoogleSheets();
            alert("🔗 Saved Google Sheets API URL! Syncing live data...");
        }
    }
}

function loadStore() {
    const savedActions = localStorage.getItem('action_tracker_items');
    if (savedActions) {
        try { actionsStore = JSON.parse(savedActions); } catch (e) { actionsStore = defaultActions; }
    } else {
        actionsStore = defaultActions;
        saveStore();
    }

    const savedPeople = localStorage.getItem('action_tracker_people');
    if (savedPeople) {
        try { peopleStore = JSON.parse(savedPeople); } catch (e) { peopleStore = defaultPeople; }
    } else {
        peopleStore = defaultPeople;
        savePeopleStore();
    }
}

function saveStore() {
    localStorage.setItem('action_tracker_items', JSON.stringify(actionsStore));
}

function savePeopleStore() {
    localStorage.setItem('action_tracker_people', JSON.stringify(peopleStore));
}

function initDates() {
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('newMeetingDate').value = todayStr;
    document.getElementById('newStartDate').value = todayStr;

    const due7 = new Date();
    due7.setDate(due7.getDate() + 7);
    document.getElementById('newDueDate').value = due7.toISOString().split('T')[0];
}

function populatePeopleDropdowns() {
    const respSelect = document.getElementById('newResponsible');
    const accSelect = document.getElementById('newAccountable');
    if (!respSelect || !accSelect) return;

    const individuals = peopleStore.filter(p => p.name !== 'All' && p.name !== 'All Team Members');

    const respOptions = [
        `<option value="All Team Members">👥 All Team Members — Everyone in Organization (Auto Email to All)</option>`,
        ...individuals.map(p => `<option value="${p.name}">👤 ${p.name} — ${p.role} (${p.email})</option>`)
    ].join('');

    const accOptions = individuals.map(p =>
        `<option value="${p.name}">👤 ${p.name} — ${p.role} (${p.email})</option>`
    ).join('');

    respSelect.innerHTML = respOptions;
    accSelect.innerHTML = accOptions;
}

function renderPeopleTable() {
    const tbody = document.getElementById('peopleTableBody');
    if (!tbody) return;

    tbody.innerHTML = peopleStore.map((p, idx) => `
        <tr>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td><span class="badge" style="background:rgba(99, 102, 241, 0.15); color:#A5B4FC;">${escapeHtml(p.role)}</span></td>
            <td><small style="color:#CBD5E1;">${escapeHtml(p.email)}</small></td>
            <td>${escapeHtml(p.team)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="deletePerson(${idx})" style="color:#EF4444;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function handleAddPerson(e) {
    e.preventDefault();
    const name = document.getElementById('personName').value.trim();
    const role = document.getElementById('personRole').value.trim();
    const email = document.getElementById('personEmail').value.trim();
    const team = document.getElementById('personTeam').value;

    if (!name || !role || !email) return;

    peopleStore.push({ name, role, email, team });
    savePeopleStore();
    populatePeopleDropdowns();
    renderPeopleTable();

    document.getElementById('personName').value = '';
    document.getElementById('personRole').value = '';
    document.getElementById('personEmail').value = '';

    alert(`✅ Added ${name} (${role}) to Organizational Directory!`);
}

function deletePerson(index) {
    if (confirm(`Remove ${peopleStore[index].name} from team directory?`)) {
        peopleStore.splice(index, 1);
        savePeopleStore();
        populatePeopleDropdowns();
        renderPeopleTable();
    }
}

function openPeopleModal() {
    renderPeopleTable();
    openModal('peopleModal');
}

function calculateHealth(item) {
    if (item.status === 'Completed') return 'Completed';
    if (item.status === 'Blocked') return 'Blocked';
    if (item.status === 'Cancelled') return 'Cancelled';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);

    const start = new Date(item.startDate);
    start.setHours(0, 0, 0, 0);

    const dueSoonThreshold = new Date(today.getTime() + 3 * 86400000);

    if (due < today) return 'Overdue';
    if (due <= dueSoonThreshold) return 'Due Soon';
    if (start <= today && item.status === 'Not Started') return 'Not Started';

    return 'On Track';
}

function calculateDaysRemaining(item) {
    if (item.status === 'Completed' || item.status === 'Cancelled') return '—';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);

    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

function recalculateAllHealth() {
    actionsStore.forEach(item => {
        item.health = calculateHealth(item);
        item.daysRemaining = calculateDaysRemaining(item);
    });
    saveStore();
}

function renderDashboard() {
    const total = actionsStore.length;
    const completed = actionsStore.filter(a => a.status === 'Completed').length;
    const inProgress = actionsStore.filter(a => a.status === 'In Progress').length;
    const notStarted = actionsStore.filter(a => a.status === 'Not Started').length;
    const blocked = actionsStore.filter(a => a.status === 'Blocked').length;
    const overdue = actionsStore.filter(a => a.health === 'Overdue').length;
    const dueSoon = actionsStore.filter(a => a.health === 'Due Soon').length;

    document.getElementById('statTotal').innerText = total;
    document.getElementById('statCompleted').innerText = completed;
    document.getElementById('statInProgress').innerText = inProgress;
    document.getElementById('statNotStarted').innerText = notStarted;
    document.getElementById('statBlocked').innerText = blocked;
    document.getElementById('statOverdue').innerText = overdue;
    document.getElementById('statDueSoon').innerText = dueSoon;

    renderAttentionList();
    renderCharts();
}

function renderAttentionList() {
    const attentionContainer = document.getElementById('attentionList');
    const urgentItems = actionsStore.filter(a =>
        a.health === 'Overdue' || a.health === 'Blocked' || a.health === 'Due Soon'
    );

    if (urgentItems.length === 0) {
        attentionContainer.innerHTML = '<p class="text-muted" style="grid-column:1/-1;">✨ All actions are on track! No immediate attention required.</p>';
        return;
    }

    attentionContainer.innerHTML = urgentItems.map(item => `
        <div class="attention-card" style="border-left: 4px solid ${getHealthColor(item.health)};">
            <div class="attention-card-header">
                <span class="id-badge">${item.id}</span>
                <span class="badge badge-${badgeClass(item.health)}">${item.health}</span>
            </div>
            <div class="attention-title">${escapeHtml(item.actionItem)}</div>
            <div class="attention-meta">
                <span><i class="fa-solid fa-user-check"></i> Resp: ${item.responsible === 'All' || item.responsible === 'All Team Members' ? '<strong style="color:#60A5FA;">👥 All Team Members</strong>' : escapeHtml(item.responsible)}</span>
                <span><i class="fa-solid fa-shield-halved"></i> Acc: ${escapeHtml(item.accountable || 'Arthur')}</span>
                <span><i class="fa-regular fa-calendar-xmark"></i> Due: ${item.dueDate}</span>
            </div>
        </div>
    `).join('');
}

function renderCharts() {
    drawStatusChart();
    drawPriorityChart();
    drawTeamChart();
}

function drawStatusChart() {
    const canvas = document.getElementById('chartStatus');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    const counts = {
        'Completed': actionsStore.filter(a => a.status === 'Completed').length,
        'In Progress': actionsStore.filter(a => a.status === 'In Progress').length,
        'Not Started': actionsStore.filter(a => a.status === 'Not Started').length,
        'Blocked': actionsStore.filter(a => a.status === 'Blocked').length
    };

    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
    const keys = Object.keys(counts);
    const maxVal = Math.max(...Object.values(counts), 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width - 60) / keys.length;

    keys.forEach((key, idx) => {
        const val = counts[key];
        const barHeight = (val / maxVal) * 130;
        const x = 30 + idx * barWidth;
        const y = 160 - barHeight;

        ctx.fillStyle = colors[idx];
        ctx.beginPath();
        ctx.roundRect(x + 10, y, barWidth - 20, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 6);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px Inter';
        ctx.fillText(key, x + barWidth / 2, 180);
    });
}

function drawPriorityChart() {
    const canvas = document.getElementById('chartPriority');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    const counts = {
        'Critical': actionsStore.filter(a => a.priority === 'Critical').length,
        'High': actionsStore.filter(a => a.priority === 'High').length,
        'Medium': actionsStore.filter(a => a.priority === 'Medium').length,
        'Low': actionsStore.filter(a => a.priority === 'Low').length
    };

    const colors = ['#EF4444', '#F97316', '#EAB308', '#10B981'];
    const keys = Object.keys(counts);
    const total = actionsStore.length || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let startAngle = 0;
    const centerX = canvas.width / 2 - 40;
    const centerY = canvas.height / 2;
    const radius = 65;

    keys.forEach((key, idx) => {
        const sliceAngle = (counts[key] / total) * 2 * Math.PI;
        ctx.fillStyle = colors[idx];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
    });

    ctx.fillStyle = '#151C2C';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fill();

    keys.forEach((key, idx) => {
        const lx = canvas.width - 110;
        const ly = 40 + idx * 28;
        ctx.fillStyle = colors[idx];
        ctx.fillRect(lx, ly, 12, 12);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${key} (${counts[key]})`, lx + 20, ly + 10);
    });
}

function drawTeamChart() {
    const canvas = document.getElementById('chartTeam');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    const teams = {};
    actionsStore.forEach(a => {
        teams[a.team] = (teams[a.team] || 0) + 1;
    });

    const keys = Object.keys(teams);
    const maxVal = Math.max(...Object.values(teams), 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    keys.forEach((team, idx) => {
        const val = teams[team];
        const barWidth = (val / maxVal) * (canvas.width - 150);
        const y = 20 + idx * 30;

        ctx.fillStyle = '#6366F1';
        ctx.beginPath();
        ctx.roundRect(110, y, barWidth, 18, [0, 4, 4, 0]);
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(team.length > 12 ? team.substring(0, 10) + '..' : team, 100, y + 14);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(val, 115 + barWidth, y + 14);
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    const filterPriority = document.getElementById('filterPriority').value;
    const filterTeam = document.getElementById('filterTeam').value;

    const filtered = actionsStore.filter(item => {
        const matchSearch = item.id.toLowerCase().includes(search) ||
            item.actionItem.toLowerCase().includes(search) ||
            item.responsible.toLowerCase().includes(search) ||
            item.deliverable.toLowerCase().includes(search);

        const matchStatus = !filterStatus || item.status === filterStatus;
        const matchPriority = !filterPriority || item.priority === filterPriority;
        const matchTeam = !filterTeam || item.team === filterTeam;

        return matchSearch && matchStatus && matchPriority && matchTeam;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:2rem; color:#64748B;">No matching action items found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const isAll = item.responsible === 'All' || item.responsible === 'All Team Members' || item.responsible === 'Everyone';
        const respPersonObj = peopleStore.find(p => p.name === item.responsible) || { role: item.respRole || "Member", email: item.respEmail };
        const accPersonObj = peopleStore.find(p => p.name === item.accountable) || { role: "Executive Lead", email: item.accEmail || `${(item.accountable || 'lead').toLowerCase()}@example.org` };

        const respDisplay = isAll ? `
            <span class="badge" style="background:rgba(59, 130, 246, 0.18); color:#93C5FD; border:1px solid rgba(59, 130, 246, 0.35); font-weight:600;">
                <i class="fa-solid fa-users"></i> All Team Members
            </span><br>
            <small style="color:#A5B4FC">All Organization Members</small><br>
            <small style="color:#64748B; font-size: 0.72rem;"><i class="fa-solid fa-envelope"></i> Automated Email to Everyone</small>
        ` : `
            <strong>${escapeHtml(item.responsible)}</strong><br>
            <small style="color:#A5B4FC">${escapeHtml(respPersonObj.role)}</small><br>
            <small style="color:#64748B">${escapeHtml(respPersonObj.email)}</small>
        `;

        const accDisplay = `
            <strong>${escapeHtml(item.accountable || 'Arthur')}</strong><br>
            <small style="color:#CBD5E1;">${escapeHtml(accPersonObj.role || 'Executive Lead')}</small><br>
            <small style="color:#64748B">${escapeHtml(accPersonObj.email || '')}</small>
        `;

        return `
        <tr>
            <td><span class="id-badge">${item.id}</span></td>
            <td class="item-cell">
                <div class="item-title">${escapeHtml(item.actionItem)}</div>
                <div class="item-sub">🎯 ${escapeHtml(item.deliverable)}</div>
            </td>
            <td><span class="badge" style="background:rgba(255,255,255,0.06); color:#CBD5E1;">${item.team}</span></td>
            <td><span class="prio-badge prio-${item.priority.toLowerCase()}">${item.priority}</span></td>
            <td>${respDisplay}</td>
            <td>${accDisplay}</td>
            <td>
                <small style="color:#94A3B8">Due: ${item.dueDate || 'N/A'}</small>
            </td>
            <td><span class="badge badge-${badgeClass(item.status)}">${item.status}</span></td>
            <td>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${item.pctComplete}%"></div></div>
                <small>${item.pctComplete}%</small>
            </td>
            <td><span class="badge badge-${badgeClass(item.health)}">${item.health}</span></td>
            <td><strong style="color:${daysColor(item.daysRemaining)}">${item.daysRemaining}</strong></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="openUpdateModal('${item.id}')">
                    <i class="fa-solid fa-pen"></i> Update
                </button>
            </td>
        </tr>
    `}).join('');
}

function filterTable() {
    renderTable();
}

function generateNextId() {
    const year = new Date().getFullYear();
    const prefix = `ACT-${year}-`;
    let max = 0;
    actionsStore.forEach(a => {
        if (a.id.startsWith(prefix)) {
            const num = parseInt(a.id.replace(prefix, ''), 10);
            if (num > max) max = num;
        }
    });
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

async function handleNewActionSubmit(e) {
    e.preventDefault();
    const newId = generateNextId();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const respName = document.getElementById('newResponsible').value;
    const accName = document.getElementById('newAccountable').value;

    let respRole = "Member";
    let respEmail = "";

    const isAll = (respName === "All Team Members" || respName === "All" || respName === "Everyone");
    if (isAll) {
        respRole = "All Organization Members";
        const allEmails = peopleStore
            .filter(p => p.name !== 'All' && p.name !== 'All Team Members' && p.email)
            .map(p => p.email);
        respEmail = allEmails.length > 0 ? allEmails.join(', ') : "all-team@organization.org";
    } else {
        const respPersonObj = peopleStore.find(p => p.name === respName) || { role: "Member", email: `${respName.toLowerCase()}@example.org` };
        respRole = respPersonObj.role;
        respEmail = respPersonObj.email;
    }

    const accPersonObj = peopleStore.find(p => p.name === accName) || { role: "Executive Lead", email: `${accName.toLowerCase()}@example.org` };

    const newItem = {
        id: newId,
        createdDate: now,
        createdBy: "web_user@example.org",
        meeting: document.getElementById('newMeeting').value,
        meetingDate: document.getElementById('newMeetingDate').value,
        actionItem: document.getElementById('newActionItem').value,
        deliverable: document.getElementById('newDeliverable').value,
        team: document.getElementById('newTeam').value,
        priority: document.getElementById('newPriority').value,
        responsible: respName,
        respRole: respRole,
        respEmail: respEmail,
        accountable: accName,
        accEmail: accPersonObj.email,
        supporting: "",
        startDate: document.getElementById('newStartDate').value,
        dueDate: document.getElementById('newDueDate').value,
        status: "Not Started",
        pctComplete: 0,
        health: "Not Started",
        daysRemaining: 0,
        link: document.getElementById('newLink').value,
        latestUpdate: "Action item created.",
        blocker: "",
        lastUpdated: now
    };

    newItem.health = calculateHealth(newItem);
    newItem.daysRemaining = calculateDaysRemaining(newItem);

    actionsStore.unshift(newItem);
    saveStore();
    closeModal('newActionModal');
    renderDashboard();
    renderTable();

    if (GOOGLE_SHEETS_WEB_APP_URL) {
        try {
            await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    actionType: "create",
                    values: [
                        "web_user@example.org",
                        newItem.meeting,
                        newItem.meetingDate,
                        newItem.actionItem,
                        newItem.deliverable,
                        newItem.team,
                        newItem.priority,
                        newItem.responsible,
                        newItem.accountable,
                        "",
                        newItem.startDate,
                        newItem.dueDate,
                        newItem.link,
                        ""
                    ]
                })
            });
        } catch (e) { console.warn("Failed to post to Google Sheets API:", e); }
    }

    alert(`✅ Action Item Created! Assigned ID: ${newId}`);
}

function openUpdateModal(id) {
    const item = actionsStore.find(a => a.id === id);
    if (!item) return;

    document.getElementById('updateTargetId').value = item.id;
    document.getElementById('updateItemInfo').innerHTML = `
        <strong>${item.id}</strong> — ${escapeHtml(item.actionItem)}<br>
        <small>Responsible: ${item.responsible} (${item.respEmail}) | Current Status: ${item.status}</small>
    `;
    document.getElementById('updateStatus').value = item.status;
    document.getElementById('updatePct').value = item.pctComplete;
    document.getElementById('updateProgress').value = item.latestUpdate || '';
    document.getElementById('updateBlocker').value = item.blocker || '';
    document.getElementById('updateDueDate').value = item.dueDate || '';
    document.getElementById('updateLink').value = item.link || '';

    toggleBlockerField();
    openModal('updateActionModal');
}

function toggleBlockerField() {
    const status = document.getElementById('updateStatus').value;
    const blockerBox = document.getElementById('blockerContainer');
    blockerBox.style.display = (status === 'Blocked') ? 'flex' : 'none';
}

async function handleUpdateActionSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('updateTargetId').value;
    const item = actionsStore.find(a => a.id === id);
    if (!item) return;

    const newStatus = document.getElementById('updateStatus').value;
    let newPct = parseInt(document.getElementById('updatePct').value, 10) || 0;

    if (newStatus === 'Completed') {
        newPct = 100;
    }

    item.status = newStatus;
    item.pctComplete = newPct;
    item.latestUpdate = document.getElementById('updateProgress').value;
    item.blocker = document.getElementById('updateBlocker').value;
    if (document.getElementById('updateDueDate').value) {
        item.dueDate = document.getElementById('updateDueDate').value;
    }
    item.link = document.getElementById('updateLink').value;
    item.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);

    item.health = calculateHealth(item);
    item.daysRemaining = calculateDaysRemaining(item);

    saveStore();
    closeModal('updateActionModal');
    renderDashboard();
    renderTable();

    if (GOOGLE_SHEETS_WEB_APP_URL) {
        try {
            await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    actionType: "update",
                    values: [
                        "web_user@example.org",
                        item.id,
                        item.status,
                        item.pctComplete,
                        item.latestUpdate,
                        item.blocker,
                        item.dueDate,
                        item.link
                    ]
                })
            });
        } catch (e) { console.warn("Failed to post update to Google Sheets API:", e); }
    }

    alert(`✅ Action Item ${id} Updated Successfully!`);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openNewActionModal() {
    populatePeopleDropdowns();
    openModal('newActionModal');
}

function openAppsScriptModal() {
    openModal('appsScriptModal');
}

function badgeClass(str) {
    return str.toLowerCase().replace(/\s+/g, '');
}

function getHealthColor(health) {
    switch (health) {
        case 'Completed': return '#10B981';
        case 'Blocked': return '#EF4444';
        case 'Overdue': return '#DC2626';
        case 'Due Soon': return '#F97316';
        case 'Not Started': return '#F59E0B';
        default: return '#14B8A6';
    }
}

function daysColor(days) {
    if (typeof days === 'number') {
        if (days < 0) return '#EF4444';
        if (days <= 3) return '#F97316';
    }
    return '#CBD5E1';
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function switchCodeTab(tabId, e) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    e.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

async function loadAppsScriptCode() {
    try {
        const setupRes = await fetch('google_apps_script/Setup.gs');
        const setupText = await setupRes.text();
        document.getElementById('setupCodeText').innerText = setupText;

        const codeRes = await fetch('google_apps_script/Code.gs');
        const codeText = await codeRes.text();
        document.getElementById('codeCodeText').innerText = codeText;
    } catch (e) {
        document.getElementById('setupCodeText').innerText = "// Refer to google_apps_script/Setup.gs file";
        document.getElementById('codeCodeText').innerText = "// Refer to google_apps_script/Code.gs file";
    }
}

function copyCode(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("📋 Code copied to clipboard!");
    });
}
