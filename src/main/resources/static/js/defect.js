var currentPage    = 1;
var currentSize    = 10;
var currentDefectId = null;
var currentUserRole = null;
var pendingFiles   = [];   // 등록 모드에서 임시 보관하는 파일 목록

var ALLOWED_EXTS   = ['pdf','ppt','pptx','xls','xlsx','doc','docx','hwp','hwpx','jpg','jpeg','png'];
var BLOCKED_EXTS   = ['exe','bat','cmd','sh','js','jar','war'];
var MAX_FILE_BYTES = 20 * 1024 * 1024;

$(function () {
    loadCodes();
    loadList();
    bindEvents();
    loadUserInfo();
});

function loadUserInfo() {
    sendAjax('/api/v1/session/user', 'GET', null, function (res) {
        var u = res.data;
        if (u) {
            $('#userAvatar').text(u.userName.charAt(0));
            $('#userName').text(u.userName + ' 님(' + roleLabel(u.role) + ')');
            currentUserRole = u.role;
        }
    }, function(){});
}

/* =========================================
   코드 로드
   ========================================= */
function loadCodes() {
    sendAjax('/api/v1/defect/codes', 'GET', null, function (res) {
        var devs = res.data.developers || [];
        var $dev = $('#defectDeveloperId');
        devs.forEach(function (u) {
            $dev.append('<option value="' + u.userId + '">' + escHtml(u.userName) + ' (' + (u.organization||'') + ')</option>');
        });

        var biz = res.data.businessCategories || [];
        var $biz = $('#defectBusinessUnit');
        var $filterBiz = $('#filterDefectBusinessUnit');
        biz.forEach(function (c) {
            $biz.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
            $filterBiz.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });

        // 테스트케이스 상세에서 넘어온 경우 자동 pre-fill
        preFillFromTestCase();
    }, function(){});
}

function preFillFromTestCase() {
    var raw = sessionStorage.getItem('defect_prefill');
    if (!raw) return;
    sessionStorage.removeItem('defect_prefill');

    var d;
    try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || !d.businessUnit) return;

    openCreateModal();

    // 업무단위 세팅
    $('#defectBusinessUnit').val(d.businessUnit);

    // 담당개발자 세팅 (테스트 담당자 매핑)
    if (d.developerId) $('#defectDeveloperId').val(d.developerId);

    if (!d.majorCategory) return;

    // 대분류 로드 후 값 세팅 → 중분류 로드
    var majUrl = '/api/v1/defect/categories?businessUnit=' + encodeURIComponent(d.businessUnit) + '&level=MAJOR';
    sendAjax(majUrl, 'GET', null, function (res) {
        var $maj = $('#defectMajorCategory').empty()
            .append('<option value="">선택</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $maj.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        $maj.val(d.majorCategory);

        if (!d.middleCategory) return;

        // 중분류 로드 후 값 세팅
        var midUrl = '/api/v1/defect/categories?businessUnit=' + encodeURIComponent(d.businessUnit)
                   + '&level=MIDDLE&parentCodeValue=' + encodeURIComponent(d.majorCategory);
        sendAjax(midUrl, 'GET', null, function (res2) {
            var $mid = $('#defectMiddleCategory').empty()
                .append('<option value="">선택 (선택사항)</option>')
                .prop('disabled', false);
            (res2.data || []).forEach(function (c) {
                $mid.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
            });
            $mid.val(d.middleCategory);
        }, function () {});
    }, function () {});
}

/* =========================================
   필터 카스케이드 드롭다운
   ========================================= */
function loadFilterDefectMajorCategories(businessUnit) {
    var url = '/api/v1/defect/categories?businessUnit=' + encodeURIComponent(businessUnit) + '&level=MAJOR';
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#filterDefectMajorCategory').empty()
            .append('<option value="">대분류 전체</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
    }, function(){});
}

function loadFilterDefectMiddleCategories(businessUnit, majorCodeValue) {
    var url = '/api/v1/defect/categories?businessUnit=' + encodeURIComponent(businessUnit)
            + '&level=MIDDLE&parentCodeValue=' + encodeURIComponent(majorCodeValue);
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#filterDefectMiddleCategory').empty()
            .append('<option value="">중분류 전체</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
    }, function(){});
}

function resetFilterDefectCascade() {
    $('#filterDefectMajorCategory').empty().append('<option value="">대분류 전체</option>').prop('disabled', true);
    $('#filterDefectMiddleCategory').empty().append('<option value="">중분류 전체</option>').prop('disabled', true);
}

/* =========================================
   카스케이드 드롭다운 (등록/수정 폼)
   ========================================= */
function loadMajorCategories(businessUnit, selectedValue) {
    var url = '/api/v1/defect/categories?businessUnit=' + encodeURIComponent(businessUnit) + '&level=MAJOR';
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#defectMajorCategory').empty()
            .append('<option value="">선택</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        if (selectedValue) $sel.val(selectedValue);
    }, function(){});
}

function loadMiddleCategories(businessUnit, majorCodeValue, selectedValue) {
    var url = '/api/v1/defect/categories?businessUnit=' + encodeURIComponent(businessUnit)
            + '&level=MIDDLE&parentCodeValue=' + encodeURIComponent(majorCodeValue);
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#defectMiddleCategory').empty()
            .append('<option value="">선택 (선택사항)</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        if (selectedValue) $sel.val(selectedValue);
    }, function(){});
}

/* =========================================
   목록 조회
   ========================================= */
function loadList(page) {
    currentPage = page || 1;
    var param = {
        keyword:              $('#searchKeyword').val(),
        searchStatus:         $('#searchStatus').val(),
        searchBusinessUnit:   $('#filterDefectBusinessUnit').val(),
        searchMajorCategory:  $('#filterDefectMajorCategory').val(),
        searchMiddleCategory: $('#filterDefectMiddleCategory').val(),
        page:                 currentPage,
        size:                 currentSize
    };
    sendAjax('/api/v1/defect?' + $.param(param), 'GET', null, function (res) {
        renderTable(res.data.list || []);
        $('#totalCount').text(res.data.total + '건');
        renderPagination($('#defectPagination'), res.data.total, currentPage, currentSize, loadList);
    });
}

/* =========================================
   테이블 렌더링
   ========================================= */
function renderTable(list) {
    var $body = $('#defectTableBody');
    $body.empty();
    if (!list.length) {
        $body.html('<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-muted);">데이터가 없습니다.</td></tr>');
        return;
    }
    list.forEach(function (item, idx) {
        var no = (currentPage - 1) * currentSize + idx + 1;
        var finalBadge = item.isFinalClosed
            ? '<span class="final-closed-badge closed">종료</span>'
            : '<span class="final-closed-badge">미종료</span>';
        var buCell;
        if (item.businessUnitName) {
            buCell = escHtml(item.businessUnitName);
            if (item.majorCategoryName) {
                buCell += '<br><small style="color:var(--text-muted);">' + escHtml(item.majorCategoryName) + '</small>';
            }
        } else {
            buCell = escHtml(item.businessName || '-');
        }
        var titleCell = item.testCaseName
            ? escHtml(item.testCaseName)
            : escHtml(item.title || '-');
        var tcContentCell = item.content
            ? '<span style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" title="' + escHtml(item.content) + '">' + escHtml(item.content) + '</span>'
            : '-';
        var tr = '<tr class="clickable-row" data-id="' + item.defectId + '">'
            + '<td>' + no + '</td>'
            + '<td>' + buCell + '</td>'
            + '<td style="max-width:180px;" title="' + escHtml(item.testCaseName || item.title) + '">' + titleCell + '</td>'
            + '<td style="max-width:200px;">' + tcContentCell + '</td>'
            + '<td>' + escHtml(item.registrantName||'-') + '</td>'
            + '<td>' + escHtml(item.developerName||'-') + '</td>'
            + '<td>' + defectStatusBadge(item.defectStatus) + '</td>'
            + '<td><span class="fix-content-cell" title="' + escHtml(item.fixContent) + '">' + escHtml(item.fixContent||'-') + '</span></td>'
            + '<td style="white-space:nowrap;">' + finalBadge + '</td>'
            + '<td style="white-space:nowrap;">' + formatDateTime(item.createdAt) + '</td>'
            + '<td style="white-space:nowrap;">'
            +   '<div style="display:flex;gap:4px;">'
            +     '<button class="btn btn-primary btn-sm btn-detail-open" data-id="' + item.defectId + '"><i class="ph ph-clipboard-text"></i> 조치등록</button>'
            +     '<button class="btn btn-secondary btn-sm btn-edit" data-id="' + item.defectId + '"><i class="ph ph-pencil-simple"></i> 수정</button>'
            +     '<button class="btn btn-danger btn-sm btn-delete" data-id="' + item.defectId + '" style="display:none;"><i class="ph ph-trash"></i> 삭제</button>'
            +   '</div>'
            + '</td>'
            + '</tr>';
        $body.append(tr);
    });
}

/* =========================================
   이벤트 바인딩
   ========================================= */
function bindEvents() {
    $('#btnSearch').on('click', function () { loadList(1); });
    $('#searchKeyword').on('keypress', function (e) { if (e.key === 'Enter') loadList(1); });
    $('#btnCreate').on('click', openCreateModal);
    $('#btnDefectSave').on('click', saveDefect);
    $('#btnDefectStatusSave').on('click', saveDefectStatus);

    // 필터 카스케이드: 업무단위 → 대분류
    $('#filterDefectBusinessUnit').on('change', function () {
        var bu = $(this).val();
        resetFilterDefectCascade();
        if (bu) loadFilterDefectMajorCategories(bu);
        loadList(1);
    });

    // 필터 카스케이드: 대분류 → 중분류
    $('#filterDefectMajorCategory').on('change', function () {
        var bu  = $('#filterDefectBusinessUnit').val();
        var maj = $(this).val();
        $('#filterDefectMiddleCategory').empty().append('<option value="">중분류 전체</option>').prop('disabled', !maj);
        if (bu && maj) loadFilterDefectMiddleCategories(bu, maj);
        loadList(1);
    });

    // 필터 중분류 변경 → 즉시 재조회
    $('#filterDefectMiddleCategory').on('change', function () { loadList(1); });

    // 업무단위 변경 → 대분류 로드 (등록/수정 폼)
    $('#defectBusinessUnit').on('change', function () {
        var bu = $(this).val();
        $('#defectMajorCategory').empty().append('<option value="">선택</option>').prop('disabled', !bu);
        $('#defectMiddleCategory').empty().append('<option value="">대분류를 먼저 선택하세요</option>').prop('disabled', true);
        if (bu) loadMajorCategories(bu, null);
    });

    // 대분류 변경 → 중분류 로드
    $('#defectMajorCategory').on('change', function () {
        var bu  = $('#defectBusinessUnit').val();
        var maj = $(this).val();
        $('#defectMiddleCategory').empty().append('<option value="">선택 (선택사항)</option>').prop('disabled', !maj);
        if (bu && maj) loadMiddleCategories(bu, maj, null);
    });

    $(document).on('click', '[data-close]', function () { closeModal($(this).data('close')); });
    $(document).on('click', '.modal-overlay', function (e) {
        if ($(e.target).hasClass('modal-overlay')) {
            var id = $(e.target).attr('id');
            if (id !== 'defectFormModal' && id !== 'defectDetailModal') closeModal(id);
        }
    });

    // 행 클릭 → 상세 모달 (버튼·링크 클릭은 제외)
    $('#defectTableBody').on('click', 'tr.clickable-row', function (e) {
        if ($(e.target).closest('button, a').length) return;
        openDetailModal($(this).data('id'));
    });

    $('#defectTableBody').on('click', '.btn-edit',        function () { openEditModal($(this).data('id')); });
    $('#defectTableBody').on('click', '.btn-delete',      function () { if (confirm('삭제하시겠습니까?')) deleteDefect($(this).data('id')); });
    $('#defectTableBody').on('click', '.btn-detail-open', function () { openDetailModal($(this).data('id')); });

    // 상태 선택 시 스텝 업데이트
    $('#defectStatusValue').on('change', function () { updateStatusSteps($(this).val()); });
    $('#detailStatusValue').on('change', function () { updateDetailStatusSteps($(this).val()); });

    // 상세 모달 버튼
    $('#btnDetailStatusSave').on('click', saveDetailStatus);
    $('#btnDetailEdit').on('click', function () {
        closeModal('defectDetailModal');
        openEditModal(currentDefectId);
    });

    // 파일 선택 버튼
    $('#btnAddAttachment').on('click', function () { $('#attachmentInput').click(); });

    // 파일 선택 처리
    $('#attachmentInput').on('change', function () {
        handleFileSelection(Array.from(this.files));
        this.value = '';   // 동일 파일 재선택 허용
    });

    // 드래그앤드롭
    var $drop = $('#attachDropArea');
    $drop.on('dragover dragleave', function (e) {
        e.preventDefault();
        $(this).toggleClass('drag-over', e.type === 'dragover');
    });
    $drop.on('drop', function (e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        handleFileSelection(Array.from(e.originalEvent.dataTransfer.files));
    });
}

/* =========================================
   파일 선택 공통 핸들러
   ========================================= */
function handleFileSelection(files) {
    if (!files.length) return;
    if (currentDefectId) {
        // 수정 모드: 즉시 업로드
        files.forEach(function (file) {
            var err = validateFile(file);
            if (err) { alert(file.name + '\n' + err); return; }
            uploadAttachment(file);
        });
    } else {
        // 등록 모드: 대기열에 추가
        files.forEach(function (file) {
            var err = validateFile(file);
            if (err) { alert(file.name + '\n' + err); return; }
            pendingFiles.push(file);
        });
        renderPendingFiles();
    }
}

/* =========================================
   클라이언트 파일 검증
   ========================================= */
function validateFile(file) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (BLOCKED_EXTS.indexOf(ext) >= 0) return '보안상 허용되지 않는 파일 형식입니다. (' + ext + ')';
    if (ALLOWED_EXTS.indexOf(ext) < 0)  return '허용되지 않는 파일 형식입니다. (' + ext + ')';
    if (file.size > MAX_FILE_BYTES)       return '파일 크기가 20MB를 초과합니다.';
    return null;
}

/* =========================================
   등록 모드 pending 파일 렌더링
   ========================================= */
function renderPendingFiles() {
    var $list = $('#pendingFileList');
    if (!pendingFiles.length) { $list.hide().empty(); return; }
    $list.empty().show();
    pendingFiles.forEach(function (file, idx) {
        var size = (file.size / 1024).toFixed(1) + 'KB';
        var ext  = file.name.split('.').pop().toLowerCase();
        var item = '<div class="attachment-item" data-pending-idx="' + idx + '">'
            + '<div class="attachment-item-left">'
            +   '<i class="ph ph-paperclip attachment-icon ' + extIconClass(ext) + '"></i>'
            +   '<div>'
            +     '<span class="attachment-name">' + escHtml(file.name) + '</span>'
            +     '<div class="attachment-size">' + size + ' · 저장 후 업로드됩니다</div>'
            +   '</div>'
            + '</div>'
            + '<button class="btn btn-danger btn-sm btn-icon btn-remove-pending" data-idx="' + idx + '"><i class="ph ph-x"></i></button>'
            + '</div>';
        $list.append(item);
    });

    // 대기 파일 제거
    $list.off('click', '.btn-remove-pending').on('click', '.btn-remove-pending', function () {
        pendingFiles.splice(parseInt($(this).data('idx')), 1);
        renderPendingFiles();
    });
}

/* =========================================
   목록 조회
   ========================================= */
function openCreateModal() {
    currentDefectId = null;
    pendingFiles    = [];
    $('#defectFormTitle').text('결함 등록');
    $('#defectId').val('');
    $('#defectBusinessUnit').val('');
    $('#defectMajorCategory').empty().append('<option value="">업무단위를 먼저 선택하세요</option>').prop('disabled', true);
    $('#defectMiddleCategory').empty().append('<option value="">대분류를 먼저 선택하세요</option>').prop('disabled', true);
    $('#defectTitle, #defectContent, #defectFixContent').val('');
    $('#defectDeveloperId').val('');
    $('#attachmentList').empty();
    $('#pendingFileList').hide().empty();
    openModal('defectFormModal');
}

function openEditModal(defectId) {
    sendAjax('/api/v1/defect/' + defectId, 'GET', null, function (res) {
        var d = res.data;
        currentDefectId = d.defectId;
        pendingFiles    = [];
        $('#defectFormTitle').text('결함 수정');
        $('#defectId').val(d.defectId);
        $('#defectTitle').val(d.title);
        $('#defectContent').val(d.content || '');
        $('#defectFixContent').val(d.fixContent || '');
        $('#defectDeveloperId').val(d.developerId || '');

        $('#defectMajorCategory').empty().append('<option value="">선택</option>').prop('disabled', true);
        $('#defectMiddleCategory').empty().append('<option value="">선택 (선택사항)</option>').prop('disabled', true);
        $('#defectBusinessUnit').val(d.businessUnit || '');

        if (d.businessUnit) {
            loadMajorCategories(d.businessUnit, d.majorCategory || null);
            if (d.majorCategory) {
                loadMiddleCategories(d.businessUnit, d.majorCategory, d.middleCategory || null);
            }
        }

        $('#pendingFileList').hide().empty();
        renderAttachments(d.attachments || []);
        openModal('defectFormModal');
    });
}

function saveDefect() {
    var businessUnit  = $('#defectBusinessUnit').val();
    var majorCategory = $('#defectMajorCategory').val();
    var title         = $('#defectTitle').val().trim();
    var content       = $('#defectContent').val().trim();

    if (!businessUnit)  { alert('업무단위는 필수 선택입니다.'); return; }
    if (!majorCategory) { alert('대분류는 필수 선택입니다.'); return; }
    if (!title)         { alert('제목은 필수 입력입니다.'); return; }
    if (!content)       { alert('상세내용은 필수 입력입니다.'); return; }

    var data = {
        businessUnit:   businessUnit,
        majorCategory:  majorCategory,
        middleCategory: $('#defectMiddleCategory').val() || null,
        title:          title,
        content:        content,
        fixContent:     $('#defectFixContent').val().trim() || null,
        developerId:    $('#defectDeveloperId').val() || null
    };

    var defectId = $('#defectId').val();
    var url      = defectId ? '/api/v1/defect/' + defectId : '/api/v1/defect';
    var method   = defectId ? 'PUT' : 'POST';

    sendAjax(url, method, data, function (res) {
        if (!defectId && pendingFiles.length) {
            // 신규 등록 후 defectId를 다시 조회해서 pending 파일 업로드
            uploadPendingFilesAfterCreate(function () {
                closeModal('defectFormModal');
                loadList(1);
            });
        } else {
            closeModal('defectFormModal');
            loadList(defectId ? currentPage : 1);
        }
    });
}

/* 신규 등록 직후 최신 결함 ID 확인 후 pending 파일 업로드 */
function uploadPendingFilesAfterCreate(done) {
    // 방금 생성된 결함을 조회해 ID 확보 (목록 첫 행 = 최신)
    sendAjax('/api/v1/defect?page=1&size=1', 'GET', null, function (res) {
        var list = res.data && res.data.list;
        if (!list || !list.length) { done(); return; }
        var newId = list[0].defectId;
        uploadFilesSequentially(pendingFiles.slice(), newId, function () {
            pendingFiles = [];
            done();
        });
    }, function () { done(); });
}

function uploadFilesSequentially(files, defectId, done) {
    if (!files.length) { done(); return; }
    var file = files.shift();
    var formData = new FormData();
    formData.append('file', file);
    formData.append('referenceType', 'DEFECT');
    formData.append('referenceId', defectId);
    showLoading();
    $.ajax({
        url: '/api/v1/attachment/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function (res) {
            hideLoading();
            if (!res.success) alert('업로드 실패: ' + res.message + ' (' + file.name + ')');
            uploadFilesSequentially(files, defectId, done);
        },
        error: function () {
            hideLoading();
            alert('파일 업로드 중 오류가 발생했습니다. (' + file.name + ')');
            uploadFilesSequentially(files, defectId, done);
        }
    });
}

function deleteDefect(defectId) {
    sendAjax('/api/v1/defect/' + defectId, 'DELETE', null, function () { loadList(currentPage); });
}

/* =========================================
   상태 변경 모달
   ========================================= */
function openStatusModal(defectId) {
    sendAjax('/api/v1/defect/' + defectId, 'GET', null, function (res) {
        var d = res.data;
        $('#statusDefectId').val(d.defectId);
        $('#defectStatusValue').val(d.defectStatus || 'ANALYSIS');
        $('#defectFinalClosed').val(d.isFinalClosed ? 'true' : 'false');
        $('#defectStatusFixContent').val(d.fixContent || '');
        updateStatusSteps(d.defectStatus || 'ANALYSIS');
        openModal('defectStatusModal');
    });
}

function saveDefectStatus() {
    var defectId = $('#statusDefectId').val();
    var data = {
        defectStatus:  $('#defectStatusValue').val(),
        isFinalClosed: $('#defectFinalClosed').val() === 'true',
        fixContent:    $('#defectStatusFixContent').val().trim() || null
    };
    sendAjax('/api/v1/defect/' + defectId + '/status', 'PUT', data, function () {
        closeModal('defectStatusModal');
        loadList(currentPage);
    });
}

function updateStatusSteps(currentStatus) {
    var order = ['ANALYSIS', 'FIXING', 'FIX_COMPLETE', 'RETEST', 'CLOSED'];
    var currentIdx = order.indexOf(currentStatus);
    $('#defectStatusModal .step-item').each(function (i) {
        $(this).removeClass('active done');
        if (i < currentIdx)        $(this).addClass('done');
        else if (i === currentIdx) $(this).addClass('active');
    });
}

function updateDetailStatusSteps(currentStatus) {
    var order = ['ANALYSIS', 'FIXING', 'FIX_COMPLETE', 'RETEST', 'CLOSED'];
    var currentIdx = order.indexOf(currentStatus);
    $('#detailStatusSteps .step-item').each(function (i) {
        $(this).removeClass('active done');
        if (i < currentIdx)        $(this).addClass('done');
        else if (i === currentIdx) $(this).addClass('active');
    });
}

/* =========================================
   결함 상세 모달
   ========================================= */
function openDetailModal(defectId) {
    sendAjax('/api/v1/defect/' + defectId, 'GET', null, function (res) {
        var d = res.data;
        currentDefectId = d.defectId;

        // 헤더
        $('#detailModalTitle').text(escHtml(d.title));
        $('#detailDefectNo').text('#' + d.defectId);

        // 기본 정보
        $('#detailBusinessUnit').text(d.businessUnitName || d.businessUnit || '-');
        $('#detailMajorCategory').text(d.majorCategoryName || d.majorCategory || '-');
        $('#detailMiddleCategory').text(d.middleCategoryName || d.middleCategory || '-');
        $('#detailStatusBadge').html(defectStatusBadge(d.defectStatus));
        $('#detailRegistrant').text(d.registrantName || '-');
        $('#detailDeveloper').text(d.developerName || '-');
        $('#detailFinalClosedBadge').html(
            d.isFinalClosed
                ? '<span class="final-closed-badge closed">종료</span>'
                : '<span class="final-closed-badge">미종료</span>'
        );
        $('#detailCreatedAt').text(formatDateTime(d.createdAt));

        // 내용 (줄바꿈 처리)
        $('#detailContent').html(escHtml(d.content || '-').replace(/\n/g, '<br>'));

        // 조치내용
        var fixText = d.fixContent ? escHtml(d.fixContent).replace(/\n/g, '<br>') : '-';
        $('#detailFixContent').html(fixText);
        $('#detailFixBlock').toggle(!!d.fixContent);

        // 첨부파일
        renderDetailAttachments(d.attachments || []);

        // 상태 변경 폼 초기값
        $('#detailStatusValue').val(d.defectStatus || 'ANALYSIS');
        $('#detailFinalClosedSelect').val(d.isFinalClosed ? 'true' : 'false');
        $('#detailStatusFixContent').val(d.fixContent || '');
        updateDetailStatusSteps(d.defectStatus || 'ANALYSIS');

        // 역할별 버튼 가시성
        // 수정: PMO, USER(현업사용자)만 표시
        $('#btnDetailEdit').toggle(currentUserRole === 'PMO' || currentUserRole === 'USER');
        // 조치등록: DEVELOPER, PMO만 표시
        $('#btnDetailStatusSave').toggle(currentUserRole === 'DEVELOPER' || currentUserRole === 'PMO');

        openModal('defectDetailModal');
    });
}

function saveDetailStatus() {
    var data = {
        defectStatus:  $('#detailStatusValue').val(),
        isFinalClosed: $('#detailFinalClosedSelect').val() === 'true',
        fixContent:    $('#detailStatusFixContent').val().trim() || null
    };
    sendAjax('/api/v1/defect/' + currentDefectId + '/status', 'PUT', data, function () {
        closeModal('defectDetailModal');
        loadList(currentPage);
        alert('조치등록 되었습니다.');
    });
}

function renderDetailAttachments(list) {
    var $section = $('#detailAttachSection');
    var $list    = $('#detailAttachList');
    $list.empty();
    if (!list.length) {
        $section.hide();
        return;
    }
    $section.show();
    list.forEach(function (a) {
        var size = a.fileSize ? (a.fileSize / 1024).toFixed(1) + 'KB' : '';
        var ext  = (a.originalFilename || '').split('.').pop().toLowerCase();
        var item = '<div class="attachment-item">'
            + '<div class="attachment-item-left">'
            +   '<i class="ph ph-paperclip attachment-icon ' + extIconClass(ext) + '"></i>'
            +   '<div>'
            +     '<a href="/api/v1/attachment/' + a.attachmentId + '/download" class="attachment-name" target="_blank">' + escHtml(a.originalFilename) + '</a>'
            +     '<div class="attachment-size">' + size + '</div>'
            +   '</div>'
            + '</div>'
            + '<a href="/api/v1/attachment/' + a.attachmentId + '/download" class="btn btn-secondary btn-sm btn-icon" title="다운로드" target="_blank"><i class="ph ph-download-simple"></i></a>'
            + '</div>';
        $list.append(item);
    });
}

/* =========================================
   첨부파일 (수정 모드)
   ========================================= */
function renderAttachments(list) {
    var $list = $('#attachmentList');
    $list.empty();
    if (!list.length) {
        $list.html('<p style="font-size:12px;color:var(--text-muted);">첨부파일이 없습니다.</p>');
        return;
    }
    list.forEach(function (a) {
        var size = a.fileSize ? (a.fileSize / 1024).toFixed(1) + 'KB' : '';
        var ext  = (a.originalFilename || '').split('.').pop().toLowerCase();
        var item = '<div class="attachment-item" data-id="' + a.attachmentId + '">'
            + '<div class="attachment-item-left">'
            +   '<i class="ph ph-paperclip attachment-icon ' + extIconClass(ext) + '"></i>'
            +   '<div>'
            +     '<a href="/api/v1/attachment/' + a.attachmentId + '/download" class="attachment-name">' + escHtml(a.originalFilename) + '</a>'
            +     '<div class="attachment-size">' + size + '</div>'
            +   '</div>'
            + '</div>'
            + '<button class="btn btn-danger btn-sm btn-icon btn-del-attachment" data-id="' + a.attachmentId + '"><i class="ph ph-x"></i></button>'
            + '</div>';
        $list.append(item);
    });

    $list.off('click', '.btn-del-attachment').on('click', '.btn-del-attachment', function () {
        var attachId = $(this).data('id');
        if (confirm('첨부파일을 삭제하시겠습니까?')) {
            sendAjax('/api/v1/attachment/' + attachId, 'DELETE', null, function () {
                openEditModal(currentDefectId);
            });
        }
    });
}

function uploadAttachment(file) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('referenceType', 'DEFECT');
    formData.append('referenceId', currentDefectId);
    showLoading();
    $.ajax({
        url: '/api/v1/attachment/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function (res) {
            hideLoading();
            if (!res.success) { alert('업로드 실패: ' + res.message); return; }
            openEditModal(currentDefectId);
        },
        error: function () { hideLoading(); alert('파일 업로드 중 오류가 발생했습니다.'); }
    });
}

/* =========================================
   유틸
   ========================================= */
function extIconClass(ext) {
    if (['jpg','jpeg','png'].indexOf(ext) >= 0) return 'icon-img';
    if (ext === 'pdf')                          return 'icon-pdf';
    if (['doc','docx','hwp','hwpx'].indexOf(ext) >= 0) return 'icon-doc';
    if (['xls','xlsx'].indexOf(ext) >= 0)       return 'icon-xls';
    if (['ppt','pptx'].indexOf(ext) >= 0)       return 'icon-ppt';
    return '';
}

function openModal(id)  { $('#' + id).addClass('open'); }
function closeModal(id) { $('#' + id).removeClass('open'); }
function escHtml(str)   { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
