var currentPage      = 1;
var currentSize      = 20;
var previewData      = [];
var userList         = [];
var currentTcDetailId = null;
var currentTcDetail   = null;
var currentUserRole   = null;
var fromTcPendingFiles = [];

var TC_ALLOWED_EXTS  = ['pdf','ppt','pptx','xls','xlsx','doc','docx','hwp','hwpx','jpg','jpeg','png'];
var TC_BLOCKED_EXTS  = ['exe','bat','cmd','sh','js','jar','war'];
var TC_MAX_FILE_BYTES = 20 * 1024 * 1024;

$(function () {
    loadCodes();
    bindEvents();
    loadUserInfo();
});

function loadUserInfo() {
    sendAjax('/api/v1/session/user', 'GET', null, function (res) {
        const u = res.data;
        if (u) {
            $('#userAvatar').text(u.userName.charAt(0));
            $('#userName').text(u.userName + ' 님(' + roleLabel(u.role) + ')');
            currentUserRole = u.role;
        }
        loadList();
    }, function(){
        loadList();
    });
}

/* =========================================
   코드 로드
   ========================================= */
function loadCodes() {
    sendAjax('/api/v1/testcase/codes', 'GET', null, function (res) {
        // 개발담당자 (DEVELOPER 역할만)
        const developers = res.data.developers || [];
        const $dev = $('#tcDeveloperId');
        const $fromTcDev = $('#fromTcDeveloper');
        developers.forEach(function (u) {
            const opt = '<option value="' + u.userId + '">' + escHtml(u.userName) + ' (' + (u.organization||'') + ')</option>';
            $dev.append(opt);
            $fromTcDev.append(opt);
        });

        // 테스트담당자 (USER + PMO 역할) — 로그인 사용자 첫 번째
        const testers      = res.data.testers      || [];
        const loginUserId  = res.data.loginUserId;
        const loginRole    = res.data.loginUserRole;
        const $tester = $('#tcTesterId');

        // 로그인 사용자가 현업/PMO인 경우 첫 번째로 추가
        const loginUser = testers.find(function (u) { return u.userId == loginUserId; });
        if (loginUser && (loginRole === 'USER' || loginRole === 'PMO')) {
            $tester.append('<option value="' + loginUser.userId + '">' + escHtml(loginUser.userName) + ' (' + (loginUser.organization||'') + ')</option>');
        }
        testers.forEach(function (u) {
            if (u.userId != loginUserId) {
                $tester.append('<option value="' + u.userId + '">' + escHtml(u.userName) + ' (' + (u.organization||'') + ')</option>');
            }
        });

        // userList (전체) — 이후 editModal에서 참조용
        userList = testers;

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

        // 신규 등록 시 테스트 담당자 기본값을 로그인 사용자로 설정
        if (loginUserId && (loginRole === 'USER' || loginRole === 'PMO')) {
            $('#tcTesterId').val(loginUserId);
        }
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
        const deleteBtnHtml = (currentUserRole === 'PMO' || currentUserRole === 'USER')
            ? `<button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); if(confirm('삭제하시겠습니까?')) deleteTc(${item.testCaseId})"><i class="ph ph-trash"></i> 삭제</button>`
            : '';
        const editBtnHtml = (currentUserRole !== 'DEVELOPER') && (item.testStatus !== 'SUCCESS' || currentUserRole === 'ADMIN')
            ? `<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openEditModal(${item.testCaseId})"><i class="ph ph-pencil-simple"></i> 수정</button>`
            : '';
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
                <div style="display:flex;gap:4px;">
                    ${editBtnHtml}
                    ${deleteBtnHtml}
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

    // 상태변경 버튼 (이벤트 위임)
    $('#tcTableBody').on('click', '.btn-status', function () {
        openStatusModal($(this).data('id'));
    });

    // 상세 모달 버튼들은 testCase.html에 inline onclick으로 직접 바인딩됨
    // TC 연계 결함 등록 저장
    $('#btnFromTcDefectSave').on('click', saveDefectFromTc);

    // 결함 등록 팝업 파일 첨부
    $('#btnFromTcAddAttachment').on('click', function () {
        $('#fromTcAttachmentInput').val('').click();
    });
    $('#fromTcAttachmentInput').on('change', function () {
        if (this.files.length) handleFromTcFileSelection(this.files);
    });
    var $dropArea = $('#fromTcDropArea');
    $dropArea.on('dragover dragenter', function (e) {
        e.preventDefault(); e.stopPropagation();
        $(this).addClass('drag-over');
    });
    $dropArea.on('dragleave drop', function (e) {
        e.preventDefault(); e.stopPropagation();
        $(this).removeClass('drag-over');
    });
    $dropArea.on('drop', function (e) {
        var files = e.originalEvent.dataTransfer.files;
        if (files.length) handleFromTcFileSelection(files);
    });

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
    $('#tcName, #tcContent, #tcInputData, #tcExpectedResult, #tcRemark').val('');
    $('#tcDeveloperId').val('');
    // 테스트 담당자는 현재 선택된 첫 번째 옵션(로그인 사용자)으로 유지
    $('#tcTesterId').val($('#tcTesterId option:nth-child(2)').val() || '');
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
        $('#tcInputData').val(d.inputData || '');
        $('#tcExpectedResult').val(d.expectedResult || '');
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
        testContent:     $('#tcContent').val().trim()        || null,
        inputData:       $('#tcInputData').val().trim()      || null,
        expectedResult:  $('#tcExpectedResult').val().trim() || null,
        developerId:     $('#tcDeveloperId').val()           || null,
        testerId:        $('#tcTesterId').val()              || null,
        isTestAvailable: $('#tcAvailable').val() === 'true',
        remark:          $('#tcRemark').val().trim()         || null
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

        // 입력 데이터 / 예상 결과
        $('#tcDetailInputData').html(d.inputData ? escHtml(d.inputData).replace(/\n/g, '<br>') : '-');
        $('#tcDetailExpectedResult').html(d.expectedResult ? escHtml(d.expectedResult).replace(/\n/g, '<br>') : '-');

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

        // DEVELOPER는 수정 불가 / 완료 상태는 ADMIN만 수정 가능
        if (currentUserRole === 'DEVELOPER') {
            $('#btnTcDetailEdit').hide();
        } else if (d.testStatus === 'SUCCESS') {
            if (currentUserRole === 'ADMIN') {
                $('#btnTcDetailEdit').show();
            } else {
                $('#btnTcDetailEdit').hide();
            }
        } else {
            $('#btnTcDetailEdit').show();
        }

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
        closeModal('tcDetailModal');
        alert('상태코드 변경 되었습니다.');
        loadList(currentPage);
    });
}

function goToDefectCreate() {
    if (!currentTcDetail) return;
    closeModal('tcDetailModal');
    $('#fromTcTestCaseId').val(currentTcDetail.testCaseId || '');
    $('#fromTcTitle').val(currentTcDetail.testCaseName || '');
    $('#fromTcInputData').val(currentTcDetail.inputData || '');
    $('#fromTcContent, #fromTcFixContent').val('');
    $('#fromTcDeveloper').val(currentTcDetail.developerId || '');
    // 파일 첨부 초기화
    fromTcPendingFiles = [];
    $('#fromTcPendingFileList').hide().empty();
    $('#fromTcAttachmentInput').val('');
    openModal('fromTcDefectModal');
}

function saveDefectFromTc() {
    var content = $('#fromTcContent').val().trim();
    if (!content) { alert('결함 상세내용은 필수 입력입니다.'); return; }

    var tcId = $('#fromTcTestCaseId').val();
    var data = {
        testCaseId:    tcId ? parseInt(tcId) : null,
        businessUnit:  currentTcDetail.businessUnit  || null,
        majorCategory: currentTcDetail.majorCategory || null,
        middleCategory:currentTcDetail.middleCategory|| null,
        title:         currentTcDetail.testCaseName  || '',
        content:       content,
        fixContent:    $('#fromTcFixContent').val().trim() || null,
        developerId:   $('#fromTcDeveloper').val() || null
    };

    sendAjax('/api/v1/defect', 'POST', data, function (res) {
        var newDefectId = res.data ? res.data.defectId : null;
        var doFinish = function () {
            if (tcId) {
                sendAjax('/api/v1/testcase/' + tcId + '/status', 'PUT',
                    { testStatus: 'FAIL', isRetestRequested: false, testResult: null },
                    function () { location.href = '/defect'; },
                    function () { location.href = '/defect'; }
                );
            } else {
                location.href = '/defect';
            }
        };
        if (newDefectId && fromTcPendingFiles.length > 0) {
            uploadFromTcFilesSequentially(fromTcPendingFiles.slice(), newDefectId, doFinish);
        } else {
            doFinish();
        }
    });
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
   결함 등록 팝업 파일 첨부
   ========================================= */
function tcExtIconClass(ext) {
    if (['jpg','jpeg','png'].includes(ext))           return 'ph ph-image';
    if (['pdf'].includes(ext))                         return 'ph ph-file-pdf';
    if (['xls','xlsx'].includes(ext))                  return 'ph ph-file-xls';
    if (['doc','docx'].includes(ext))                  return 'ph ph-file-doc';
    if (['ppt','pptx'].includes(ext))                  return 'ph ph-file-ppt';
    if (['hwp','hwpx'].includes(ext))                  return 'ph ph-file-text';
    return 'ph ph-file';
}

function validateTcFile(file) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (TC_BLOCKED_EXTS.includes(ext)) return '보안 차단 확장자입니다: .' + ext;
    if (!TC_ALLOWED_EXTS.includes(ext)) return '허용되지 않는 파일 형식입니다: .' + ext;
    if (file.size > TC_MAX_FILE_BYTES)  return '파일 크기가 20MB를 초과합니다: ' + file.name;
    return null;
}

function handleFromTcFileSelection(files) {
    var errors = [];
    Array.from(files).forEach(function (f) {
        var err = validateTcFile(f);
        if (err) { errors.push(err); return; }
        var dup = fromTcPendingFiles.some(function (p) { return p.name === f.name && p.size === f.size; });
        if (!dup) fromTcPendingFiles.push(f);
    });
    if (errors.length) alert(errors.join('\n'));
    renderFromTcPendingFiles();
}

function renderFromTcPendingFiles() {
    var $list = $('#fromTcPendingFileList');
    if (!fromTcPendingFiles.length) { $list.hide().empty(); return; }
    $list.empty().show();
    fromTcPendingFiles.forEach(function (f, idx) {
        var ext    = f.name.split('.').pop().toLowerCase();
        var sizeKb = (f.size / 1024).toFixed(1) + 'KB';
        var item = '<div class="attachment-item" data-pending-idx="' + idx + '">'
            + '<div class="attachment-item-left">'
            +   '<i class="ph ph-paperclip attachment-icon ' + tcExtIconClass(ext) + '"></i>'
            +   '<div>'
            +     '<span class="attachment-name">' + escHtml(f.name) + '</span>'
            +     '<div class="attachment-size">' + sizeKb + ' · 저장 후 업로드됩니다</div>'
            +   '</div>'
            + '</div>'
            + '<button type="button" class="btn btn-danger btn-sm btn-icon btn-fromtc-remove" data-idx="' + idx + '"><i class="ph ph-x"></i></button>'
            + '</div>';
        $list.append(item);
    });
    $list.off('click', '.btn-fromtc-remove').on('click', '.btn-fromtc-remove', function () {
        fromTcPendingFiles.splice(parseInt($(this).data('idx')), 1);
        renderFromTcPendingFiles();
    });
}

function uploadFromTcFilesSequentially(files, defectId, done) {
    if (!files.length) { done(); return; }
    var file = files.shift();
    var fd = new FormData();
    fd.append('file', file);
    showLoading();
    $.ajax({
        url: '/api/v1/defect/' + defectId + '/attachments',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function () {
            hideLoading();
            uploadFromTcFilesSequentially(files, defectId, done);
        },
        error: function () {
            hideLoading();
            uploadFromTcFilesSequentially(files, defectId, done);
        }
    });
}

/* =========================================
   모달 유틸
   ========================================= */
function openModal(id)  { $('#' + id).addClass('open'); }
function closeModal(id) { $('#' + id).removeClass('open'); }

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
