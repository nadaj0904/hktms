var currentPage      = 1;
var currentSize      = 20;
var previewData      = [];
var userList         = [];
var currentTcDetailId = null;
var currentTcDetail   = null;

$(function () {
    loadCodes();
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
   코드 로드
   ========================================= */
function loadCodes() {
    sendAjax('/api/v1/testcase/codes', 'GET', null, function (res) {
        userList = res.data.users || [];
        const $dev    = $('#tcDeveloperId');
        const $tester = $('#tcTesterId');
        userList.forEach(function (u) {
            $dev.append('<option value="' + u.userId + '">' + escHtml(u.userName) + ' (' + (u.organization||'') + ')</option>');
            $tester.append('<option value="' + u.userId + '">' + escHtml(u.userName) + ' (' + (u.organization||'') + ')</option>');
        });

        const biz = res.data.businessCategories || [];
        // 등록 모달용 드롭다운
        const $biz = $('#tcBusinessUnit');
        biz.forEach(function (c) {
            $biz.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        // 검색 필터용 드롭다운
        const $filterBiz = $('#filterBusinessUnit');
        biz.forEach(function (c) {
            $filterBiz.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
    }, function(){});
}

/* =========================================
   카스케이드 드롭다운
   ========================================= */
function loadTcMajorCategories(businessUnit, selectedValue) {
    var url = '/api/v1/testcase/categories?businessUnit=' + encodeURIComponent(businessUnit) + '&level=MAJOR';
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#tcMajorCategory').empty()
            .append('<option value="">선택</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        if (selectedValue) $sel.val(selectedValue);
    }, function(){});
}

function loadTcMiddleCategories(businessUnit, majorCodeValue, selectedValue) {
    var url = '/api/v1/testcase/categories?businessUnit=' + encodeURIComponent(businessUnit)
            + '&level=MIDDLE&parentCodeValue=' + encodeURIComponent(majorCodeValue);
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#tcMiddleCategory').empty()
            .append('<option value="">선택 (선택사항)</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        if (selectedValue) $sel.val(selectedValue);
    }, function(){});
}

function loadTcMinorCategories(businessUnit, middleCodeValue, selectedValue) {
    var url = '/api/v1/testcase/categories?businessUnit=' + encodeURIComponent(businessUnit)
            + '&level=MINOR&parentCodeValue=' + encodeURIComponent(middleCodeValue);
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#tcMinorCategory').empty()
            .append('<option value="">선택 (선택사항)</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
        if (selectedValue) $sel.val(selectedValue);
    }, function(){});
}

function resetTcCascade(fromLevel) {
    if (fromLevel <= 1) {
        $('#tcMajorCategory').empty().append('<option value="">업무단위를 먼저 선택하세요</option>').prop('disabled', true);
    }
    if (fromLevel <= 2) {
        $('#tcMiddleCategory').empty().append('<option value="">대분류를 먼저 선택하세요</option>').prop('disabled', true);
    }
    if (fromLevel <= 3) {
        $('#tcMinorCategory').empty().append('<option value="">중분류를 먼저 선택하세요</option>').prop('disabled', true);
    }
}

/* =========================================
   목록 조회
   ========================================= */
function loadList(page) {
    currentPage = page || 1;
    const param = {
        keyword:        $('#searchKeyword').val(),
        searchStatus:   $('#searchStatus').val(),
        businessUnit:   $('#filterBusinessUnit').val(),
        majorCategory:  $('#filterMajorCategory').val(),
        middleCategory: $('#filterMiddleCategory').val(),
        page: currentPage,
        size: currentSize
    };
    const qs = $.param(param);
    sendAjax('/api/v1/testcase?' + qs, 'GET', null, function (res) {
        renderTable(res.data.list || []);
        $('#totalCount').text(res.data.total + '건');
        renderPagination($('#tcPagination'), res.data.total, currentPage, currentSize, loadList);
    });
}

/* =========================================
   테이블 렌더링
   ========================================= */
function renderTable(list) {
    const $body = $('#tcTableBody');
    $body.empty();
    if (!list.length) {
        $body.html('<tr><td colspan="13" style="text-align:center; padding:40px; color:var(--text-muted);">데이터가 없습니다.</td></tr>');
        return;
    }
    list.forEach(function (item, idx) {
        const no = (currentPage - 1) * currentSize + idx + 1;
        const availBadge = item.isTestAvailable
            ? '<span class="available-badge available-y">가능</span>'
            : '<span class="available-badge available-n">불가</span>';
        const retestBadge = item.isRetestRequested
            ? '<span class="retest-badge">재요청</span>' : '-';
        const tr = `<tr class="clickable-row" data-id="${item.testCaseId}">
            <td>${no}</td>
            <td>${escHtml(item.businessUnitName || item.businessUnit || '-')}</td>
            <td>${escHtml(item.majorCategoryName || item.majorCategory||'-')}</td>
            <td>${escHtml(item.middleCategoryName || item.middleCategory||'-')}</td>
            <td>${escHtml(item.minorCategoryName || item.minorCategory||'-')}</td>
            <td style="max-width:200px;"><span title="${escHtml(item.testCaseName)}">${escHtml(item.testCaseName)}</span></td>
            <td>${escHtml(item.developerName||'-')}</td>
            <td>${escHtml(item.testerName||'-')}</td>
            <td>${availBadge}</td>
            <td>${testStatusBadge(item.testStatus)}</td>
            <td>${formatDate(item.completedDate)}</td>
            <td>${retestBadge}</td>
            <td style="white-space:nowrap;">
                <div style="display:flex;gap:4px;" onclick="event.stopPropagation()">
                    <button class="btn btn-primary   btn-sm btn-status" data-id="${item.testCaseId}"><i class="ph ph-arrows-clockwise"></i> 상태변경</button>
                    <button class="btn btn-secondary btn-sm btn-edit"   data-id="${item.testCaseId}"><i class="ph ph-pencil-simple"></i> 수정</button>
                    <button class="btn btn-danger    btn-sm btn-delete" data-id="${item.testCaseId}"><i class="ph ph-trash"></i> 삭제</button>
                </div>
            </td>
        </tr>`;
        $body.append(tr);
    });
}

/* =========================================
   이벤트 바인딩
   ========================================= */
function bindEvents() {
    // 검색
    $('#btnSearch').on('click', function () { loadList(1); });
    $('#searchKeyword').on('keypress', function (e) { if (e.key === 'Enter') loadList(1); });

    // 필터 업무단위 → 대분류 카스케이드
    $('#filterBusinessUnit').on('change', function () {
        var bu = $(this).val();
        resetFilterCascade(1);
        if (bu) loadFilterMajorCategories(bu);
        loadList(1);
    });
    // 필터 대분류 → 중분류 카스케이드
    $('#filterMajorCategory').on('change', function () {
        var bu  = $('#filterBusinessUnit').val();
        var maj = $(this).val();
        resetFilterCascade(2);
        if (bu && maj) loadFilterMiddleCategories(bu, maj);
        loadList(1);
    });
    // 필터 중분류 변경
    $('#filterMiddleCategory').on('change', function () { loadList(1); });
    // 상태 필터 변경
    $('#searchStatus').on('change', function () { loadList(1); });

    // 신규 등록 버튼
    $('#btnCreate').on('click', function () { openCreateModal(); });

    // 카스케이드 드롭다운
    $('#tcBusinessUnit').on('change', function () {
        var bu = $(this).val();
        resetTcCascade(1);
        if (bu) loadTcMajorCategories(bu, null);
    });
    $('#tcMajorCategory').on('change', function () {
        var bu  = $('#tcBusinessUnit').val();
        var maj = $(this).val();
        resetTcCascade(2);
        if (bu && maj) loadTcMiddleCategories(bu, maj, null);
    });
    $('#tcMiddleCategory').on('change', function () {
        var bu  = $('#tcBusinessUnit').val();
        var mid = $(this).val();
        resetTcCascade(3);
        if (bu && mid) loadTcMinorCategories(bu, mid, null);
    });

    // 저장
    $('#btnTcSave').on('click', saveTc);

    // 상태 저장
    $('#btnStatusSave').on('click', saveStatus);

    // 모달 닫기
    $(document).on('click', '[data-close]', function () {
        closeModal($(this).data('close'));
    });
    // 모든 모달은 취소 버튼 클릭시에만 닫힘 (배경 클릭 닫기 비활성)

    // 행 클릭 → 상세 모달
    $('#tcTableBody').on('click', '.clickable-row', function () {
        openTcDetailModal($(this).data('id'));
    });

    // 수정/삭제/상태변경 (이벤트 위임)
    $('#tcTableBody').on('click', '.btn-edit', function () {
        openEditModal($(this).data('id'));
    });
    $('#tcTableBody').on('click', '.btn-delete', function () {
        if (confirm('삭제하시겠습니까?')) deleteTc($(this).data('id'));
    });
    $('#tcTableBody').on('click', '.btn-status', function () {
        openStatusModal($(this).data('id'));
    });

    // 상세 모달 – 수정 버튼
    $('#btnTcDetailEdit').on('click', function () {
        closeModal('tcDetailModal');
        openEditModal(currentTcDetailId);
    });
    // 상세 모달 – 상태 저장
    $('#btnTcDetailStatusSave').on('click', saveTcDetailStatus);
    // 상세 모달 – 결함관리 등록
    $('#btnTcDetailToDefect').on('click', goToDefectCreate);

    // 엑셀 업로드
    $('#btnExcelUpload').on('click', function () { $('#excelFileInput').val('').click(); });
    $('#excelFileInput').on('change', function () {
        if (this.files[0]) uploadExcelPreview(this.files[0]);
    });
    $('#btnExcelImport').on('click', importExcel);
    $('#btnExcelDownload').on('click', function () { location.href = '/api/v1/testcase/excel/download'; });
}

/* =========================================
   등록/수정 모달
   ========================================= */
function openCreateModal() {
    $('#tcFormTitle').text('테스트케이스 등록');
    $('#tcId').val('');
    $('#tcBusinessUnit').val('');
    resetTcCascade(1);
    $('#tcName, #tcContent, #tcRemark').val('');
    $('#tcDeveloperId, #tcTesterId').val('');
    $('#tcAvailable').val('true');
    openModal('tcFormModal');
}

function openEditModal(tcId) {
    sendAjax('/api/v1/testcase/' + tcId, 'GET', null, function (res) {
        const d = res.data;
        $('#tcFormTitle').text('테스트케이스 수정');
        $('#tcId').val(d.testCaseId);
        $('#tcName').val(d.testCaseName);
        $('#tcContent').val(d.testContent || '');
        $('#tcDeveloperId').val(d.developerId || '');
        $('#tcTesterId').val(d.testerId || '');
        $('#tcAvailable').val(d.isTestAvailable ? 'true' : 'false');
        $('#tcRemark').val(d.remark || '');

        // 카스케이드 드롭다운 복원
        resetTcCascade(1);
        $('#tcBusinessUnit').val(d.businessUnit || '');
        if (d.businessUnit) {
            loadTcMajorCategories(d.businessUnit, d.majorCategory || null);
            if (d.majorCategory) {
                loadTcMiddleCategories(d.businessUnit, d.majorCategory, d.middleCategory || null);
                if (d.middleCategory) {
                    loadTcMinorCategories(d.businessUnit, d.middleCategory, d.minorCategory || null);
                }
            }
        }
        openModal('tcFormModal');
    });
}

function saveTc() {
    const businessUnit  = $('#tcBusinessUnit').val();
    const majorCategory = $('#tcMajorCategory').val();
    const name          = $('#tcName').val().trim();

    if (!businessUnit)  { alert('업무단위는 필수 선택입니다.'); return; }
    if (!majorCategory) { alert('대분류는 필수 선택입니다.'); return; }
    if (!name)          { alert('테스트명은 필수 입력입니다.'); return; }

    const data = {
        businessUnit:    businessUnit,
        majorCategory:   majorCategory,
        middleCategory:  $('#tcMiddleCategory').val() || null,
        minorCategory:   $('#tcMinorCategory').val() || null,
        testCaseName:    name,
        testContent:     $('#tcContent').val().trim() || null,
        developerId:     $('#tcDeveloperId').val() || null,
        testerId:        $('#tcTesterId').val() || null,
        isTestAvailable: $('#tcAvailable').val() === 'true',
        remark:          $('#tcRemark').val().trim() || null
    };

    const tcId = $('#tcId').val();
    const url    = tcId ? '/api/v1/testcase/' + tcId : '/api/v1/testcase';
    const method = tcId ? 'PUT' : 'POST';

    sendAjax(url, method, data, function () {
        closeModal('tcFormModal');
        loadList(tcId ? currentPage : 1);
    });
}

/* =========================================
   삭제
   ========================================= */
function deleteTc(tcId) {
    sendAjax('/api/v1/testcase/' + tcId, 'DELETE', null, function () { loadList(currentPage); });
}

/* =========================================
   상태 변경 모달
   ========================================= */
function openStatusModal(tcId) {
    sendAjax('/api/v1/testcase/' + tcId, 'GET', null, function (res) {
        const d = res.data;
        $('#statusTcId').val(d.testCaseId);
        $('#statusValue').val(d.testStatus || 'READY');
        $('#statusResult').val(d.testResult || '');
        $('#statusRetest').val(d.isRetestRequested ? 'true' : 'false');
        openModal('tcStatusModal');
    });
}

function saveStatus() {
    const tcId = $('#statusTcId').val();
    const data = {
        testStatus:        $('#statusValue').val(),
        testResult:        $('#statusResult').val().trim() || null,
        isRetestRequested: $('#statusRetest').val() === 'true'
    };
    sendAjax('/api/v1/testcase/' + tcId + '/status', 'PUT', data, function () {
        closeModal('tcStatusModal');
        loadList(currentPage);
    });
}

/* =========================================
   엑셀 업로드/프리뷰/임포트
   ========================================= */
function uploadExcelPreview(file) {
    const formData = new FormData();
    formData.append('file', file);
    showLoading();
    $.ajax({
        url: '/api/v1/testcase/excel/preview',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function (res) {
            hideLoading();
            if (!res.success) { alert('파싱 실패: ' + res.message); return; }
            previewData = res.data;
            renderPreview(previewData);
            openModal('excelPreviewModal');
        },
        error: function () { hideLoading(); alert('엑셀 파싱 중 오류가 발생했습니다.'); }
    });
}

function renderPreview(rows) {
    const $body = $('#excelPreviewBody');
    $body.empty();
    let errorCount = 0;
    rows.forEach(function (r) {
        const hasErr = r.error && r.error !== '';
        if (hasErr) errorCount++;
        const tr = `<tr class="${hasErr ? 'has-error' : ''}">
            <td>${r.rowNum}</td>
            <td>${escHtml(r.businessUnitName)}</td>
            <td>${escHtml(r.majorCategoryName)}</td>
            <td>${escHtml(r.middleCategoryName)}</td>
            <td>${escHtml(r.minorCategoryName)}</td>
            <td>${escHtml(r.testCaseName)}</td>
            <td class="error-cell">${escHtml(r.error)}</td>
        </tr>`;
        $body.append(tr);
    });
    $('#previewTotalCount').text(rows.length);
    $('#previewErrorCount').text(errorCount);
    $('#btnExcelImport').prop('disabled', errorCount > 0);
}

function importExcel() {
    const validRows = previewData.filter(function (r) { return !r.error || r.error === ''; });
    const list = validRows.map(function (r) {
        return {
            businessUnit:    r.businessUnit   || null,
            majorCategory:   r.majorCategory  || null,
            middleCategory:  r.middleCategory || null,
            minorCategory:   r.minorCategory  || null,
            testCaseName:    r.testCaseName,
            developerId:     null,
            testerId:        null,
            isTestAvailable: true,
            testStatus:      'READY'
        };
    });
    sendAjax('/api/v1/testcase/excel/import', 'POST', list, function (res) {
        alert(res.message);
        closeModal('excelPreviewModal');
        loadList(1);
    });
}

/* =========================================
   테스트케이스 상세 모달
   ========================================= */
function openTcDetailModal(tcId) {
    sendAjax('/api/v1/testcase/' + tcId, 'GET', null, function (res) {
        var d = res.data;
        currentTcDetailId = d.testCaseId;
        currentTcDetail   = d;

        // 헤더
        $('#tcDetailTitle').text(escHtml(d.testCaseName));
        $('#tcDetailNo').text('#' + d.testCaseId);

        // 기본 정보
        $('#tcDetailBusinessUnit').text(d.businessUnitName  || d.businessUnit  || '-');
        $('#tcDetailMajorCategory').text(d.majorCategoryName || d.majorCategory || '-');
        $('#tcDetailMiddleCategory').text(d.middleCategoryName || d.middleCategory || '-');
        $('#tcDetailMinorCategory').text(d.minorCategoryName || d.minorCategory || '-');
        $('#tcDetailStatusBadge').html(testStatusBadge(d.testStatus));
        $('#tcDetailDeveloper').text(d.developerName || '-');
        $('#tcDetailTester').text(d.testerName || '-');
        $('#tcDetailAvailable').html(
            d.isTestAvailable
                ? '<span class="available-badge available-y">가능</span>'
                : '<span class="available-badge available-n">불가</span>'
        );
        $('#tcDetailCompletedDate').text(formatDate(d.completedDate) || '-');
        $('#tcDetailRetest').html(
            d.isRetestRequested
                ? '<span class="retest-badge">재요청</span>'
                : '-'
        );
        $('#tcDetailCreatedAt').text(formatDateTime(d.createdAt) || '-');

        // 테스트 내용
        $('#tcDetailContent').html(d.testContent ? escHtml(d.testContent).replace(/\n/g, '<br>') : '-');

        // 테스트 결과
        if (d.testResult) {
            $('#tcDetailResult').html(escHtml(d.testResult).replace(/\n/g, '<br>'));
            $('#tcDetailResultBlock').show();
        } else {
            $('#tcDetailResult').text('-');
            $('#tcDetailResultBlock').hide();
        }

        // 상태 변경 폼 초기값
        $('#tcDetailStatusValue').val(d.testStatus || 'READY');
        $('#tcDetailRetestValue').val(d.isRetestRequested ? 'true' : 'false');
        $('#tcDetailResultInput').val(d.testResult || '');
        updateTcDetailStatusSteps(d.testStatus || 'READY');

        openModal('tcDetailModal');
    });
}

function saveTcDetailStatus() {
    var data = {
        testStatus:        $('#tcDetailStatusValue').val(),
        isRetestRequested: $('#tcDetailRetestValue').val() === 'true',
        testResult:        $('#tcDetailResultInput').val().trim() || null
    };
    sendAjax('/api/v1/testcase/' + currentTcDetailId + '/status', 'PUT', data, function () {
        openTcDetailModal(currentTcDetailId);
        loadList(currentPage);
    });
}

function goToDefectCreate() {
    if (!currentTcDetail) return;
    sessionStorage.setItem('defect_prefill', JSON.stringify({
        businessUnit:  currentTcDetail.businessUnit  || '',
        majorCategory: currentTcDetail.majorCategory || '',
        middleCategory:currentTcDetail.middleCategory|| '',
        developerId:   currentTcDetail.testerId      || ''
    }));
    location.href = '/defect';
}

function updateTcDetailStatusSteps(currentStatus) {
    var order = ['READY', 'IN_PROGRESS', 'SUCCESS', 'FAIL', 'HOLD'];
    var currentIdx = order.indexOf(currentStatus);
    $('#tcDetailStatusSteps .step-item').each(function (i) {
        $(this).removeClass('active done fail');
        var step = $(this).data('step');
        if (step === currentStatus) {
            $(this).addClass(currentStatus === 'FAIL' ? 'fail' : 'active');
        } else if (i < currentIdx && currentStatus !== 'FAIL' && currentStatus !== 'HOLD') {
            $(this).addClass('done');
        }
    });
}

/* =========================================
   필터 카스케이드 드롭다운
   ========================================= */
function loadFilterMajorCategories(businessUnit) {
    var url = '/api/v1/testcase/categories?businessUnit=' + encodeURIComponent(businessUnit) + '&level=MAJOR';
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#filterMajorCategory').empty()
            .append('<option value="">대분류 전체</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
    }, function(){});
}

function loadFilterMiddleCategories(businessUnit, majorCodeValue) {
    var url = '/api/v1/testcase/categories?businessUnit=' + encodeURIComponent(businessUnit)
            + '&level=MIDDLE&parentCodeValue=' + encodeURIComponent(majorCodeValue);
    sendAjax(url, 'GET', null, function (res) {
        var $sel = $('#filterMiddleCategory').empty()
            .append('<option value="">중분류 전체</option>')
            .prop('disabled', false);
        (res.data || []).forEach(function (c) {
            $sel.append('<option value="' + escHtml(c.codeValue) + '">' + escHtml(c.codeName) + '</option>');
        });
    }, function(){});
}

function resetFilterCascade(fromLevel) {
    if (fromLevel <= 1) {
        $('#filterMajorCategory').empty()
            .append('<option value="">대분류 전체</option>')
            .prop('disabled', true);
    }
    if (fromLevel <= 2) {
        $('#filterMiddleCategory').empty()
            .append('<option value="">중분류 전체</option>')
            .prop('disabled', true);
    }
}

/* =========================================
   모달 유틸
   ========================================= */
function openModal(id)  { $('#' + id).addClass('open'); }
function closeModal(id) { $('#' + id).removeClass('open'); }

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
