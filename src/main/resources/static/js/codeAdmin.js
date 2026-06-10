var selectedGroupId   = null;
var selectedGroupCode = null;
var allGroups         = [];   // 전체 그룹 캐시 (필터링용 + 상위그룹 select용)

$(function () {
    loadUserInfo();
    loadGroups();
    bindEvents();
});

function loadUserInfo() {
    sendAjax('/api/v1/session/user', 'GET', null, function (res) {
        const u = res.data;
        if (u) { $('#userAvatar').text(u.userName.charAt(0)); $('#userName').text(u.userName + ' 님'); }
    }, function () {});
}

/* =========================================================
   코드 그룹
   ========================================================= */
function loadGroups() {
    sendAjax('/api/v1/admin/code-groups', 'GET', null, function (res) {
        allGroups = res.data || [];
        renderGroups(applyGroupFilter(allGroups));
    });
}

function applyGroupFilter(list) {
    const bu    = $('#filterBusinessUnit').val();
    const level = $('#filterCategoryLevel').val();
    return list.filter(function (g) {
        const matchBu = !bu || (bu === 'SYSTEM' ? !g.businessUnit : g.businessUnit === bu);
        const matchLv = !level || (g.categoryLevel || 'SYSTEM') === level;
        return matchBu && matchLv;
    });
}

function renderGroups(list) {
    const $area = $('#groupListArea');
    $area.empty();
    if (!list.length) {
        $area.html('<div class="empty-msg">등록된 코드 그룹이 없습니다.</div>');
        return;
    }
    list.forEach(function (g) {
        const activeBadge = g.isActive
            ? '<span class="active-badge">사용</span>'
            : '<span class="inactive-badge">미사용</span>';
        const levelBadge  = getLevelBadge(g.categoryLevel);
        const buBadge     = g.businessUnit
            ? `<span class="bu-badge">${escHtml(getBusinessUnitName(g.businessUnit))}</span>`
            : '';
        const $item = $(`
            <div class="group-item" data-id="${g.codeGroupId}" data-code="${escHtml(g.groupCode)}">
                <div class="group-item-info">
                    <div class="group-item-top">
                        ${levelBadge}${buBadge}
                    </div>
                    <div class="group-item-code">${escHtml(g.groupCode)}</div>
                    <div class="group-item-name">${escHtml(g.groupName)}</div>
                </div>
                ${activeBadge}
                <div class="group-item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon btn-edit-group" data-id="${g.codeGroupId}" title="수정">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-icon btn-delete-group" data-id="${g.codeGroupId}" title="삭제">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>`);
        if (g.codeGroupId === selectedGroupId) $item.addClass('active');
        $area.append($item);
    });
}

function getLevelBadge(level) {
    switch (level) {
        case 'MAJOR':  return '<span class="level-badge level-major">대분류</span>';
        case 'MIDDLE': return '<span class="level-badge level-middle">중분류</span>';
        case 'MINOR':  return '<span class="level-badge level-minor">소분류</span>';
        default:       return '<span class="level-badge level-system">시스템</span>';
    }
}

function getBusinessUnitName(bu) {
    const map = { HR: '조직인사', SALES: '영업', ADMIN: '어드민', AUTH: '권한관리',
                  COMPLIANCE: '준법', DB: 'DB관리', COMMON: '공통지원',
                  COMMISSION: '위촉지원', REPORT: '리포트' };
    return map[bu] || bu;
}

function openCreateGroupModal() {
    $('#groupFormTitle').text('코드 그룹 등록');
    $('#codeGroupId').val('');
    $('#groupCode').val('').prop('readonly', false);
    $('#groupName, #groupDescription').val('');
    $('#groupSortOrder').val('0');
    $('#groupIsActive').val('true');
    $('#groupBusinessUnit').val('');
    $('#groupCategoryLevel').val('SYSTEM');
    $('#groupParentGroupCode').val('');
    $('#parentGroupRow').hide();
    populateParentGroupSelect();
    openModal('groupFormModal');
}

function openEditGroupModal(codeGroupId) {
    sendAjax('/api/v1/admin/code-groups/' + codeGroupId, 'GET', null, function (res) {
        const d = res.data;
        $('#groupFormTitle').text('코드 그룹 수정');
        $('#codeGroupId').val(d.codeGroupId);
        $('#groupCode').val(d.groupCode).prop('readonly', true);
        $('#groupName').val(d.groupName);
        $('#groupDescription').val(d.description || '');
        $('#groupSortOrder').val(d.sortOrder != null ? d.sortOrder : 0);
        $('#groupIsActive').val(d.isActive ? 'true' : 'false');
        $('#groupBusinessUnit').val(d.businessUnit || '');
        $('#groupCategoryLevel').val(d.categoryLevel || 'SYSTEM');
        populateParentGroupSelect();
        const needParent = (d.categoryLevel === 'MIDDLE' || d.categoryLevel === 'MINOR');
        $('#parentGroupRow').toggle(needParent);
        if (needParent) $('#groupParentGroupCode').val(d.parentGroupCode || '');
        openModal('groupFormModal');
    });
}

function populateParentGroupSelect() {
    const $sel = $('#groupParentGroupCode');
    $sel.empty().append('<option value="">선택</option>');
    allGroups.filter(function (g) {
        return g.categoryLevel === 'MAJOR' || !g.categoryLevel || g.categoryLevel === 'SYSTEM';
    }).forEach(function (g) {
        $sel.append(`<option value="${escHtml(g.groupCode)}">${escHtml(g.groupCode)} - ${escHtml(g.groupName)}</option>`);
    });
}

function saveGroup() {
    const id        = $('#codeGroupId').val();
    const groupCode = $('#groupCode').val().trim().toUpperCase();
    const groupName = $('#groupName').val().trim();
    if (!groupCode) { alert('그룹코드는 필수 입력입니다.'); return; }
    if (!groupName) { alert('그룹명은 필수 입력입니다.'); return; }

    const level  = $('#groupCategoryLevel').val();
    const parent = (level === 'MIDDLE' || level === 'MINOR') ? $('#groupParentGroupCode').val().trim() || null : null;

    const data = {
        groupCode:       groupCode,
        groupName:       groupName,
        description:     $('#groupDescription').val().trim() || null,
        sortOrder:       parseInt($('#groupSortOrder').val()) || 0,
        isActive:        $('#groupIsActive').val() === 'true',
        businessUnit:    $('#groupBusinessUnit').val() || null,
        categoryLevel:   level || 'SYSTEM',
        parentGroupCode: parent
    };

    const url    = id ? '/api/v1/admin/code-groups/' + id : '/api/v1/admin/code-groups';
    const method = id ? 'PUT' : 'POST';

    sendAjax(url, method, data, function () {
        closeModal('groupFormModal');
        loadGroups();
        if (id && parseInt(id) === selectedGroupId) loadCodes(selectedGroupId, selectedGroupCode);
    });
}

function deleteGroup(codeGroupId) {
    if (!confirm('코드 그룹을 삭제하면 하위 코드도 함께 삭제됩니다. 계속하시겠습니까?')) return;
    sendAjax('/api/v1/admin/code-groups/' + codeGroupId, 'DELETE', null, function () {
        if (codeGroupId === selectedGroupId) {
            selectedGroupId = null;
            selectedGroupCode = null;
            resetCodePanel();
        }
        loadGroups();
    });
}

/* =========================================================
   코드
   ========================================================= */
function loadCodes(codeGroupId, groupCode) {
    selectedGroupId   = codeGroupId;
    selectedGroupCode = groupCode;

    $('.group-item').removeClass('active');
    $('.group-item[data-id="' + codeGroupId + '"]').addClass('active');

    $('#selectedGroupBadge').text(groupCode).show();
    $('#btnCreateCode').prop('disabled', false);

    sendAjax('/api/v1/admin/code-groups/' + codeGroupId + '/codes', 'GET', null, function (res) {
        renderCodes(res.data || []);
    });
}

function renderCodes(list) {
    $('#codeEmptyMsg').hide();
    const $wrapper = $('#codeTableWrapper').show();
    const $body    = $('#codeTableBody').empty();

    if (!list.length) {
        $body.html('<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">등록된 코드가 없습니다.</td></tr>');
        return;
    }
    list.forEach(function (c, idx) {
        const activeBadge = c.isActive
            ? '<span class="active-badge">사용</span>'
            : '<span class="inactive-badge">미사용</span>';
        $body.append(`<tr>
            <td>${idx + 1}</td>
            <td><code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${escHtml(c.codeValue)}</code></td>
            <td>${escHtml(c.codeName)}</td>
            <td style="text-align:center;">${c.sortOrder != null ? c.sortOrder : 0}</td>
            <td>${activeBadge}</td>
            <td>
                <div style="display:flex;gap:4px;">
                    <button class="btn btn-secondary btn-sm btn-icon btn-edit-code" data-id="${c.codeId}" title="수정"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon btn-delete-code" data-id="${c.codeId}" title="삭제"><i class="ph ph-trash"></i></button>
                </div>
            </td>
        </tr>`);
    });
}

function resetCodePanel() {
    $('#selectedGroupBadge').hide();
    $('#btnCreateCode').prop('disabled', true);
    $('#codeTableWrapper').hide();
    $('#codeEmptyMsg').text('← 왼쪽에서 코드 그룹을 선택하세요').show();
}

function openCreateCodeModal() {
    if (!selectedGroupId) return;
    $('#codeFormTitle').text('코드 등록');
    $('#codeId').val('');
    $('#codeGroupIdForCode').val(selectedGroupId);
    $('#codeValue').val('').prop('readonly', false);
    $('#codeName').val('');
    $('#codeSortOrder').val('0');
    $('#codeIsActive').val('true');
    openModal('codeFormModal');
}

function openEditCodeModal(codeId) {
    sendAjax('/api/v1/admin/codes/' + codeId, 'GET', null, function (res) {
        const d = res.data;
        $('#codeFormTitle').text('코드 수정');
        $('#codeId').val(d.codeId);
        $('#codeGroupIdForCode').val(d.codeGroupId);
        $('#codeValue').val(d.codeValue).prop('readonly', true);
        $('#codeName').val(d.codeName);
        $('#codeSortOrder').val(d.sortOrder != null ? d.sortOrder : 0);
        $('#codeIsActive').val(d.isActive ? 'true' : 'false');
        openModal('codeFormModal');
    });
}

function saveCode() {
    const id         = $('#codeId').val();
    const codeGroupId = $('#codeGroupIdForCode').val();
    const codeValue  = $('#codeValue').val().trim();
    const codeName   = $('#codeName').val().trim();
    if (!codeValue) { alert('코드값은 필수 입력입니다.'); return; }
    if (!codeName)  { alert('코드명은 필수 입력입니다.'); return; }

    const data = {
        codeGroupId: parseInt(codeGroupId),
        codeValue:   codeValue,
        codeName:    codeName,
        sortOrder:   parseInt($('#codeSortOrder').val()) || 0,
        isActive:    $('#codeIsActive').val() === 'true'
    };

    const url    = id ? '/api/v1/admin/codes/' + id : '/api/v1/admin/codes';
    const method = id ? 'PUT' : 'POST';

    sendAjax(url, method, data, function () {
        closeModal('codeFormModal');
        loadCodes(selectedGroupId, selectedGroupCode);
    });
}

function deleteCode(codeId) {
    if (!confirm('코드를 삭제하시겠습니까?')) return;
    sendAjax('/api/v1/admin/codes/' + codeId, 'DELETE', null, function () {
        loadCodes(selectedGroupId, selectedGroupCode);
    });
}

/* =========================================================
   이벤트 바인딩
   ========================================================= */
function bindEvents() {
    $('#btnCreateGroup').on('click', openCreateGroupModal);
    $('#btnGroupSave').on('click', saveGroup);
    $('#btnCreateCode').on('click', openCreateCodeModal);
    $('#btnCodeSave').on('click', saveCode);

    // 필터 변경 시 목록 재렌더
    $('#filterBusinessUnit, #filterCategoryLevel').on('change', function () {
        renderGroups(applyGroupFilter(allGroups));
    });

    // 분류수준 변경 시 상위그룹 행 표시/숨김
    $('#groupCategoryLevel').on('change', function () {
        const need = ($(this).val() === 'MIDDLE' || $(this).val() === 'MINOR');
        $('#parentGroupRow').toggle(need);
    });

    $(document).on('click', '[data-close]', function () { closeModal($(this).data('close')); });
    $(document).on('click', '.modal-overlay', function (e) {
        if ($(e.target).hasClass('modal-overlay')) closeModal($(e.target).attr('id'));
    });

    $(document).on('click', '.group-item', function (e) {
        if ($(e.target).closest('.group-item-actions').length) return;
        const id   = $(this).data('id');
        const code = $(this).data('code');
        loadCodes(id, code);
    });

    $(document).on('click', '.btn-edit-group', function (e) {
        e.stopPropagation();
        openEditGroupModal($(this).data('id'));
    });
    $(document).on('click', '.btn-delete-group', function (e) {
        e.stopPropagation();
        deleteGroup($(this).data('id'));
    });
    $(document).on('click', '.btn-edit-code',   function () { openEditCodeModal($(this).data('id')); });
    $(document).on('click', '.btn-delete-code', function () { deleteCode($(this).data('id')); });

    $('#groupCode').on('input', function () {
        $(this).val($(this).val().toUpperCase());
    });
}

/* =========================================================
   유틸
   ========================================================= */
function openModal(id)  { $('#' + id).addClass('open'); }
function closeModal(id) { $('#' + id).removeClass('open'); }
function escHtml(str)   { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
