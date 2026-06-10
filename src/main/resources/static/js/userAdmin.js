var currentPage = 1;
var currentSize  = 20;

$(function () {
    loadList();
    bindEvents();
    loadUserInfo();
});

function loadUserInfo() {
    sendAjax('/api/v1/session/user', 'GET', null, function (res) {
        const u = res.data;
        if (u) { $('#userAvatar').text(u.userName.charAt(0)); $('#userName').text(u.userName + ' 님'); }
    }, function(){});
}

/* =========================================
   목록 조회
   ========================================= */
function loadList(page) {
    currentPage = page || 1;
    const param = {
        keyword: $('#searchKeyword').val(),
        role:    $('#searchRole').val(),
        page:    currentPage,
        size:    currentSize
    };
    sendAjax('/api/v1/admin/users?' + $.param(param), 'GET', null, function (res) {
        renderTable(res.data.list || []);
        $('#totalCount').text(res.data.total + '건');
        renderPagination($('#userPagination'), res.data.total, currentPage, currentSize, loadList);
    });
}

/* =========================================
   테이블 렌더링
   ========================================= */
function renderTable(list) {
    const $body = $('#userTableBody');
    $body.empty();
    if (!list.length) {
        $body.html('<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted);">데이터가 없습니다.</td></tr>');
        return;
    }
    list.forEach(function (item, idx) {
        const no = (currentPage - 1) * currentSize + idx + 1;
        const activeBadge = item.isActive
            ? '<span class="active-badge">사용</span>'
            : '<span class="inactive-badge">미사용</span>';
        const roleBadge = getRoleBadge(item.role);
        const initial = item.userName ? item.userName.charAt(0) : '?';
        const toggleBtn = item.isActive
            ? `<button class="btn btn-warning btn-sm btn-toggle" data-id="${item.userId}" data-active="true"><i class="ph ph-toggle-right"></i> 비활성화</button>`
            : `<button class="btn btn-success btn-sm btn-toggle" data-id="${item.userId}" data-active="false"><i class="ph ph-toggle-left"></i> 활성화</button>`;
        const tr = `<tr>
            <td>${no}</td>
            <td><div style="display:flex;align-items:center;gap:8px;"><span class="user-avatar-sm">${initial}</span><span>${escHtml(item.userName)}</span></div></td>
            <td>${escHtml(item.loginId)}</td>
            <td>${escHtml(item.organization||'-')}</td>
            <td>${roleBadge}</td>
            <td>${escHtml(item.email||'-')}</td>
            <td>${escHtml(item.phone||'-')}</td>
            <td>${activeBadge}</td>
            <td>${formatDate(item.createdAt)}</td>
            <td style="white-space:nowrap;">
                <div style="display:flex;gap:4px;">
                    ${toggleBtn}
                    <button class="btn btn-secondary btn-sm btn-edit" data-id="${item.userId}"><i class="ph ph-pencil-simple"></i> 수정</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${item.userId}"><i class="ph ph-trash"></i> 삭제</button>
                </div>
            </td>
        </tr>`;
        $body.append(tr);
    });
}

function getRoleBadge(role) {
    switch (role) {
        case 'PMO':       return '<span class="role-badge role-pmo">PMO</span>';
        case 'DEVELOPER': return '<span class="role-badge role-developer">개발자</span>';
        case 'USER':      return '<span class="role-badge role-user">현업</span>';
        default:          return '<span class="role-badge">' + escHtml(role) + '</span>';
    }
}

/* =========================================
   이벤트 바인딩
   ========================================= */
function bindEvents() {
    $('#btnSearch').on('click', function () { loadList(1); });
    $('#searchKeyword').on('keypress', function (e) { if (e.key === 'Enter') loadList(1); });
    $('#btnCreate').on('click', openCreateModal);
    $('#btnUserSave').on('click', saveUser);

    $(document).on('click', '[data-close]', function () { closeModal($(this).data('close')); });
    $(document).on('click', '.modal-overlay', function (e) {
        if ($(e.target).hasClass('modal-overlay')) closeModal($(e.target).attr('id'));
    });

    $('#userTableBody').on('click', '.btn-toggle', function () {
        const id = $(this).data('id');
        const isActive = String($(this).data('active')) === 'true';
        const msg = isActive ? '사용자를 비활성화 하시겠습니까?' : '사용자를 활성화 하시겠습니까?';
        if (confirm(msg)) toggleStatus(id, isActive);
    });
    $('#userTableBody').on('click', '.btn-edit', function () { openEditModal($(this).data('id')); });
    $('#userTableBody').on('click', '.btn-delete', function () {
        if (confirm('사용자를 삭제하시겠습니까?')) deleteUser($(this).data('id'));
    });
}

/* =========================================
   등록/수정 모달
   ========================================= */
function openCreateModal() {
    $('#userFormTitle').text('사용자 등록');
    $('#userId').val('');
    $('#userLoginId').val('').prop('readonly', false);
    $('#userPassword').val('');
    $('#userNameInput, #userOrganization, #userEmail, #userPhone').val('');
    $('#userRole').val('USER');
    $('#userIsActive').val('true');
    $('#passwordGroup').show();
    openModal('userFormModal');
}

function openEditModal(userId) {
    sendAjax('/api/v1/admin/users/' + userId, 'GET', null, function (res) {
        const d = res.data;
        $('#userFormTitle').text('사용자 수정');
        $('#userId').val(d.userId);
        $('#userLoginId').val(d.loginId).prop('readonly', true);
        $('#userPassword').val('');
        $('#userNameInput').val(d.userName);
        $('#userOrganization').val(d.organization || '');
        $('#userRole').val(d.role);
        $('#userIsActive').val(d.isActive ? 'true' : 'false');
        $('#userEmail').val(d.email || '');
        $('#userPhone').val(d.phone || '');
        $('#passwordGroup').hide();
        openModal('userFormModal');
    });
}

function saveUser() {
    const userId   = $('#userId').val();
    const loginId  = $('#userLoginId').val().trim();
    const name     = $('#userNameInput').val().trim();

    if (!loginId) { alert('아이디는 필수 입력입니다.'); return; }
    if (!name)    { alert('이름은 필수 입력입니다.'); return; }

    if (!userId && !$('#userPassword').val()) {
        alert('비밀번호는 필수 입력입니다.'); return;
    }

    const data = {
        loginId:      loginId,
        password:     !userId ? $('#userPassword').val() : undefined,
        userName:     name,
        organization: $('#userOrganization').val().trim() || null,
        role:         $('#userRole').val(),
        isActive:     $('#userIsActive').val() === 'true',
        email:        $('#userEmail').val().trim() || null,
        phone:        $('#userPhone').val().trim() || null
    };

    const url    = userId ? '/api/v1/admin/users/' + userId : '/api/v1/admin/users';
    const method = userId ? 'PUT' : 'POST';

    sendAjax(url, method, data, function () {
        closeModal('userFormModal');
        loadList(userId ? currentPage : 1);
    });
}

function toggleStatus(userId, currentActive) {
    sendAjax('/api/v1/admin/users/' + userId, 'GET', null, function (res) {
        const d = res.data;
        const data = {
            loginId:      d.loginId,
            userName:     d.userName,
            organization: d.organization,
            role:         d.role,
            isActive:     !currentActive,
            email:        d.email,
            phone:        d.phone
        };
        sendAjax('/api/v1/admin/users/' + userId, 'PUT', data, function () { loadList(currentPage); });
    });
}

function deleteUser(userId) {
    sendAjax('/api/v1/admin/users/' + userId, 'DELETE', null, function () { loadList(currentPage); });
}

/* =========================================
   모달 유틸
   ========================================= */
function openModal(id)  { $('#' + id).addClass('open'); }
function closeModal(id) { $('#' + id).removeClass('open'); }
function escHtml(str)   { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
