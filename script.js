// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 加载数据
    loadApplications();
    updateStats();
    
    // 添加事件监听器
    document.getElementById('addBtn').addEventListener('click', openAddModal);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('applicationForm').addEventListener('submit', saveApplication);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteConfirmedApplication);
    
    // 筛选和排序事件监听器
    document.getElementById('statusFilter').addEventListener('change', filterAndSortApplications);
    document.getElementById('sortBy').addEventListener('change', filterAndSortApplications);
    document.getElementById('searchInput').addEventListener('input', filterAndSortApplications);
    
    // 当点击模态框外部时关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('applicationModal')) {
            closeModal();
        }
        if (event.target === document.getElementById('confirmModal')) {
            closeConfirmModal();
        }
    });
});

// 从 localStorage 加载申请数据
function loadApplications() {
    const applications = getApplicationsFromStorage();
    displayApplications(applications);
}

// 显示申请列表
function displayApplications(applications) {
    const applicationsList = document.getElementById('applicationsList');
    
    // 清空列表
    applicationsList.innerHTML = '';
    
    if (applications.length === 0) {
        applicationsList.innerHTML = '<div class="empty-message">暂无申请记录，点击"添加申请"开始跟踪</div>';
        return;
    }
    
    // 创建申请卡片
    applications.forEach(app => {
        const card = createApplicationCard(app);
        applicationsList.appendChild(card);
    });
}

// 筛选和排序申请
function filterAndSortApplications() {
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    
    let applications = getApplicationsFromStorage();
    
    // 筛选
    if (statusFilter) {
        applications = applications.filter(app => app.status === statusFilter);
    }
    
    if (searchText) {
        applications = applications.filter(app => 
            app.company.toLowerCase().includes(searchText) || 
            app.position.toLowerCase().includes(searchText)
        );
    }
    
    // 排序
    switch(sortBy) {
        case 'dateDesc':
            applications.sort((a, b) => new Date(b.applyDate) - new Date(a.applyDate));
            break;
        case 'dateAsc':
            applications.sort((a, b) => new Date(a.applyDate) - new Date(b.applyDate));
            break;
        case 'companyAsc':
            applications.sort((a, b) => a.company.localeCompare(b.company));
            break;
        case 'companyDesc':
            applications.sort((a, b) => b.company.localeCompare(a.company));
            break;
    }
    
    // 显示筛选和排序后的结果
    displayApplications(applications);
}

// 创建申请卡片
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    card.dataset.id = application.id;
    
    // 确定状态样式类
    let statusClass = '';
    switch(application.status) {
        case '准备中': statusClass = 'status-preparing'; break;
        case '已投递': statusClass = 'status-applied'; break;
        case '笔试': statusClass = 'status-assessment'; break;
        case '一面': statusClass = 'status-interview1'; break;
        case '二面': statusClass = 'status-interview2'; break;
        case '三面': statusClass = 'status-interview3'; break;
        case 'HR面': statusClass = 'status-hrInterview'; break;
        case 'Offer': statusClass = 'status-offer'; break;
        case '已拒绝': statusClass = 'status-rejected'; break;
        default: statusClass = 'status-applied';
    }
    
    // 格式化日期
    const formattedDate = new Date(application.applyDate).toLocaleDateString('zh-CN');
    
    // 构建卡片内容
    card.innerHTML = `
        <div class="application-header">
            <div>
                <div class="company-name">${application.company}</div>
                <div class="position-name">${application.position}</div>
                <div class="application-date">投递日期: ${formattedDate}</div>
                <span class="status ${statusClass}">${application.status}</span>
            </div>
        </div>
        
        <div class="application-actions">
            <button class="action-btn edit-btn" title="编辑">✏️</button>
            <button class="action-btn delete-btn" title="删除">🗑️</button>
        </div>
        
        ${application.jobLink ? `<div><a href="${application.jobLink}" target="_blank">查看职位链接</a></div>` : ''}
        
        ${application.notes ? `<div class="application-notes">${application.notes}</div>` : ''}
    `;
    
    // 添加编辑和删除按钮的事件监听器
    card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(application.id));
    card.querySelector('.delete-btn').addEventListener('click', () => openConfirmModal(application.id));
    
    return card;
}

// 打开添加申请模态框
function openAddModal() {
    // 重置表单
    document.getElementById('applicationForm').reset();
    document.getElementById('applicationId').value = '';
    document.getElementById('modalTitle').textContent = '添加申请';
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('applyDate').value = today;
    
    // 显示模态框
    document.getElementById('applicationModal').style.display = 'block';
}

// 打开编辑申请模态框
function openEditModal(id) {
    const applications = getApplicationsFromStorage();
    const application = applications.find(app => app.id === id);
    
    if (!application) return;
    
    // 填充表单
    document.getElementById('applicationId').value = application.id;
    document.getElementById('company').value = application.company;
    document.getElementById('position').value = application.position;
    document.getElementById('applyDate').value = application.applyDate;
    document.getElementById('status').value = application.status;
    document.getElementById('jobLink').value = application.jobLink || '';
    document.getElementById('notes').value = application.notes || '';
    
    document.getElementById('modalTitle').textContent = '编辑申请';
    
    // 显示模态框
    document.getElementById('applicationModal').style.display = 'block';
}

// 关闭模态框
function closeModal() {
    document.getElementById('applicationModal').style.display = 'none';
}

// 打开确认删除模态框
function openConfirmModal(id) {
    document.getElementById('confirmDeleteBtn').dataset.id = id;
    document.getElementById('confirmModal').style.display = 'block';
}

// 关闭确认删除模态框
function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// 保存申请
function saveApplication(event) {
    event.preventDefault();
    
    const id = document.getElementById('applicationId').value || generateId();
    const company = document.getElementById('company').value;
    const position = document.getElementById('position').value;
    const applyDate = document.getElementById('applyDate').value;
    const status = document.getElementById('status').value;
    const jobLink = document.getElementById('jobLink').value;
    const notes = document.getElementById('notes').value;
    
    const application = {
        id,
        company,
        position,
        applyDate,
        status,
        jobLink,
        notes
    };
    
    // 保存到 localStorage
    const applications = getApplicationsFromStorage();
    
    // 如果是编辑现有申请
    const existingIndex = applications.findIndex(app => app.id === id);
    if (existingIndex !== -1) {
        applications[existingIndex] = application;
    } else {
        // 如果是新申请
        applications.push(application);
    }
    
    saveApplicationsToStorage(applications);
    
    // 刷新列表和统计
    loadApplications();
    updateStats();
    
    // 关闭模态框
    closeModal();
}

// 确认删除申请
function deleteConfirmedApplication() {
    const id = document.getElementById('confirmDeleteBtn').dataset.id;
    
    // 从 localStorage 中删除
    let applications = getApplicationsFromStorage();
    
    // 保存被删除的申请，用于撤销
    lastDeletedApplication = applications.find(app => app.id === id);
    
    applications = applications.filter(app => app.id !== id);
    saveApplicationsToStorage(applications);
    
    // 刷新列表和统计
    loadApplications();
    updateStats();
    
    // 关闭确认模态框
    closeConfirmModal();
    
    // 显示撤销提示
    showUndoNotification();
}

// 显示撤销提示
function showUndoNotification() {
    // 清除之前的撤销超时
    if (undoTimeout) {
        clearTimeout(undoTimeout);
    }
    
    // 创建或更新撤销通知
    let undoNotification = document.getElementById('undoNotification');
    
    if (!undoNotification) {
        undoNotification = document.createElement('div');
        undoNotification.id = 'undoNotification';
        undoNotification.className = 'undo-notification';
        document.body.appendChild(undoNotification);
        
        // 创建撤销按钮
        const undoButton = document.createElement('button');
        undoButton.textContent = '撤销';
        undoButton.className = 'undo-button';
        undoButton.addEventListener('click', undoDelete);
        undoNotification.appendChild(undoButton);
    }
    
    // 更新通知内容
    undoNotification.innerHTML = `
        <span>已删除 ${lastDeletedApplication.company} 的申请</span>
        <button class="undo-button" onclick="undoDelete()">撤销</button>
    `;
    
    // 显示通知
    undoNotification.style.display = 'flex';
    
    // 设置10秒后自动隐藏
    undoTimeout = setTimeout(() => {
        undoNotification.style.display = 'none';
        lastDeletedApplication = null;
    }, 10000);
}

// 撤销删除
function undoDelete() {
    if (!lastDeletedApplication) return;
    
    // 恢复被删除的申请
    const applications = getApplicationsFromStorage();
    applications.push(lastDeletedApplication);
    saveApplicationsToStorage(applications);
    
    // 刷新列表和统计
    loadApplications();
    updateStats();
    
    // 隐藏撤销通知
    const undoNotification = document.getElementById('undoNotification');
    if (undoNotification) {
        undoNotification.style.display = 'none';
    }
    
    // 清除撤销数据
    lastDeletedApplication = null;
    if (undoTimeout) {
        clearTimeout(undoTimeout);
        undoTimeout = null;
    }
}

// 更新统计数据
function updateStats() {
    const applications = getApplicationsFromStorage();
    
    // 总申请数
    document.getElementById('totalCount').textContent = applications.length;
    
    // 进行中的申请数（不包括已拒绝和Offer）
    const activeCount = applications.filter(app => app.status !== '已拒绝' && app.status !== 'Offer').length;
    document.getElementById('activeCount').textContent = activeCount;
    
    // Offer数量
    const offerCount = applications.filter(app => app.status === 'Offer').length;
    document.getElementById('offerCount').textContent = offerCount;
}

// 从 localStorage 获取申请数据
function getApplicationsFromStorage() {
    const applicationsJson = localStorage.getItem('jobApplications');
    return applicationsJson ? JSON.parse(applicationsJson) : [];
}

// 保存申请数据到 localStorage
function saveApplicationsToStorage(applications) {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}


// 导出数据为CSV
function exportData() {
    const applications = getApplicationsFromStorage();
    
    if (applications.length === 0) {
        alert('暂无数据可导出');
        return;
    }
    
    // CSV表头
    let csvContent = '公司名称,职位名称,投递日期,当前状态,职位链接,备注\n';
    
    // 添加数据行
    applications.forEach(app => {
        // 处理CSV中的特殊字符
        const company = app.company.replace(/"/g, '""');
        const position = app.position.replace(/"/g, '""');
        const notes = app.notes ? app.notes.replace(/"/g, '""').replace(/\n/g, ' ') : '';
        
        csvContent += `"${company}","${position}","${app.applyDate}","${app.status}","${app.jobLink || ''}","${notes}"\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 设置文件名（包含当前日期）
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `秋招申请记录_${date}.csv`);
    link.style.visibility = 'hidden';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}