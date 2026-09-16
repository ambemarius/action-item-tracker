/**
 * ACTION ITEM TRACKER - FRONTEND CONTROLLER (app.js)
 * Interactive UI Engine, Data Handler & Organizational Directory Manager
 */

// Initial Organizational People Store
const defaultPeople = [
    { name: "Arthur Pendelton", role: "Executive Director", email: "arthur@example.org", team: "Administration" },
    { name: "Martial Kouam", role: "Operations Director", email: "martial@example.org", team: "Administration" },
    { name: "Claire Vance", role: "Finance Manager", email: "claire@example.org", team: "Finance" },
    { name: "David Nkomo", role: "Senior Programs Officer", email: "david@example.org", team: "Programs" },
    { name: "Emma Watson", role: "Logistics Lead", email: "emma@example.org", team: "Operations" },
    { name: "Sarah Jenkins", role: "Communications Specialist", email: "sarah@example.org", team: "Communications" },
    { name: "Paul Mbida", role: "M&E Lead Evaluator", email: "paul@example.org", team: "Monitoring & Evaluation" }
];

// Initial Sample Actions
const defaultActions = [
    {
        id: "ACT-2026-001",
        createdDate: "2026-09-15 09:30:00",
        createdBy: "arthur@example.org",
        meeting: "Weekly Management Meeting",
        meetingDate: "2026-09-15",
        actionItem: "Prepare and submit the Q3 financial audit report.",
        deliverable: "Final signed PDF audit report delivered to ED.",
        team: "Finance",
        priority: "High",
        responsible: "Arthur Pendelton",
        respRole: "Executive Director",
        respEmail: "arthur@example.org",
        accountable: "Martial Kouam",
        accEmail: "martial@example.org",
        supporting: "Claire Vance",
        startDate: "2026-09-15",
        dueDate: "2026-09-22",
        status: "In Progress",
        pctComplete: 60,
        health: "On Track",
        daysRemaining: 6,
        link: "https://drive.google.com",
        latestUpdate: "Draft report compiled, pending review.",
        blocker: "",
        lastUpdated: "2026-09-16 10:00:00"
    },
    {
        id: "ACT-2026-002",
        createdDate: "2026-09-14 14:00:00",
        createdBy: "martial@example.org",
        meeting: "Operations Sync",
        meetingDate: "2026-09-14",
        actionItem: "Deploy backup generator at main data center.",
        deliverable: "Generator online with verified 24h run test.",
        team: "Operations",
        priority: "Critical",
        responsible: "Emma Watson",
        respRole: "Logistics Lead",
        respEmail: "emma@example.org",
        accountable: "Martial Kouam",
        accEmail: "martial@example.org",
        supporting: "Tech Vendor",
        startDate: "2026-09-10",
        dueDate: "2026-09-15", // Overdue!
        status: "In Progress",
        pctComplete: 80,
        health: "Overdue",
        daysRemaining: -1,
        link: "",
        latestUpdate: "Fuel tank delivered, wiring delayed.",
        blocker: "",
        lastUpdated: "2026-09-15 16:30:00"
    },
    {
        id: "ACT-2026-003",
        createdDate: "2026-09-16 08:45:00",
        createdBy: "claire@example.org",
        meeting: "Programs Committee",
        meetingDate: "2026-09-16",
        actionItem: "Finalize field survey questionnaires for North Region.",
        deliverable: "Printed and digital survey forms distributed.",
        team: "Programs",
        priority: "High",
        responsible: "David Nkomo",
        respRole: "Senior Programs Officer",
        respEmail: "david@example.org",
        accountable: "Claire Vance",
        accEmail: "claire@example.org",
        supporting: "M&E Officers",
        startDate: "2026-09-16",
        dueDate: "2026-09-18",
        status: "Blocked",
        pctComplete: 20,
        health: "Blocked",
        daysRemaining: 2,
        link: "",
        latestUpdate: "Awaiting ethical clearance approval from Ministry.",
        blocker: "Official stamp pending at Ministry office.",
        lastUpdated: "2026-09-16 11:00:00"
    }
];

// App Stores
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
});

// Load / Save Local Storage
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

// ORGANIZATIONAL PEOPLE DIRECTORY MANAGER
function populatePeopleDropdowns() {
    const respSelect = document.getElementById('newResponsible');
    const accSelect = document.getElementById('newAccountable');

    if (!respSelect || !accSelect) return;

    const optionsHtml = peopleStore.map(p => 
        `<option value="${p.name}">${p.name} — ${p.role} (${p.email})</option>`
    ).join('');

    respSelect.innerHTML = optionsHtml;
    accSelect.innerHTML = optionsHtml;
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

// HEALTH CALCULATION
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

// DASHBOARD METRICS & CANVAS CHARTS
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
                <span><i class="fa-regular fa-user"></i> ${item.responsible}</span>
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

// RENDER MASTER TABLE
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
        const respPersonObj = peopleStore.find(p => p.name === item.responsible) || { role: item.respRole || "Member", email: item.respEmail };
        return `
        <tr>
            <td><span class="id-badge">${item.id}</span></td>
            <td class="item-cell">
                <div class="item-title">${escapeHtml(item.actionItem)}</div>
                <div class="item-sub">🎯 ${escapeHtml(item.deliverable)}</div>
            </td>
            <td><span class="badge" style="background:rgba(255,255,255,0.06); color:#CBD5E1;">${item.team}</span></td>
            <td><span class="prio-badge prio-${item.priority.toLowerCase()}">${item.priority}</span></td>
            <td>
                <strong>${escapeHtml(item.responsible)}</strong><br>
                <small style="color:#A5B4FC">${escapeHtml(respPersonObj.role)}</small><br>
                <small style="color:#64748B">${escapeHtml(respPersonObj.email)}</small>
            </td>
            <td>${escapeHtml(item.accountable)}</td>
            <td>
                <small style="color:#94A3B8">Due: ${item.dueDate}</small>
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

// ACTION SUBMISSION HANDLERS
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

function handleNewActionSubmit(e) {
    e.preventDefault();
    const newId = generateNextId();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const respName = document.getElementById('newResponsible').value;
    const accName = document.getElementById('newAccountable').value;

    const respPersonObj = peopleStore.find(p => p.name === respName) || { role: "Member", email: `${respName.toLowerCase()}@example.org` };
    const accPersonObj = peopleStore.find(p => p.name === accName) || { role: "Member", email: `${accName.toLowerCase()}@example.org` };

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
        respRole: respPersonObj.role,
        respEmail: respPersonObj.email,
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
    document.getElementById('updateDueDate').value = item.dueDate;
    document.getElementById('updateLink').value = item.link || '';

    toggleBlockerField();
    openModal('updateActionModal');
}

function toggleBlockerField() {
    const status = document.getElementById('updateStatus').value;
    const blockerBox = document.getElementById('blockerContainer');
    blockerBox.style.display = (status === 'Blocked') ? 'flex' : 'none';
}

function handleUpdateActionSubmit(e) {
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
    alert(`✅ Action Item ${id} Updated Successfully!`);
}

// UTILITY FUNCTIONS
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
    switch(health) {
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
        document.getElementById('setupCodeText').innerText = "// Fetch failed. Please refer to google_apps_script/Setup.gs file directly.";
        document.getElementById('codeCodeText').innerText = "// Fetch failed. Please refer to google_apps_script/Code.gs file directly.";
    }
}

function copyCode(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("📋 Code copied to clipboard!");
    });
}
