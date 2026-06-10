/* =========================================
   CSRF 설정 (Spring Security 연동)
   ========================================= */
$(function () {
    const csrfToken  = $('meta[name="_csrf"]').attr('content');
    const csrfHeader = $('meta[name="_csrf_header"]').attr('content');

    if (csrfToken && csrfHeader) {
        $(document).ajaxSend(function (e, xhr) {
            xhr.setRequestHeader(csrfHeader, csrfToken);
        });
    }

    // Spring Security 7은 GET /logout을 처리하지 않으므로 CSRF 토큰 포함 POST 폼으로 제출
    $(document).on('click', 'a[href="/logout"]', function (e) {
        e.preventDefault();
        var token = $('meta[name="_csrf"]').attr('content');
        var $form = $('<form>').attr({ method: 'POST', action: '/logout' });
        $form.append($('<input>').attr({ type: 'hidden', name: '_csrf', value: token }));
        $('body').append($form);
        $form[0].submit();
    });
});

/* =========================================
   로딩 오버레이
   ========================================= */
function showLoading() { $('.loading-overlay').addClass('show'); }
function hideLoading() { $('.loading-overlay').removeClass('show'); }

/* =========================================
   공통 AJAX 래퍼
   ========================================= */
function sendAjax(url, method, data, successCallback, errorCallback) {
    showLoading();
    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json; charset=utf-8',
        data: data ? JSON.stringify(data) : null,
        dataType: 'json',
        success: function (response) {
            hideLoading();
            if (response.success) {
                if (typeof successCallback === 'function') successCallback(response);
            } else {
                if (typeof errorCallback === 'function') errorCallback(response.message);
                else alert('처리 실패: ' + response.message);
            }
        },
        error: function (xhr) {
            hideLoading();
            if (xhr.status === 400 && xhr.responseJSON) {
                let msg = xhr.responseJSON.message || '입력값이 올바르지 않습니다.';
                if (xhr.responseJSON.data && typeof xhr.responseJSON.data === 'object') {
                    msg += '\n' + Object.values(xhr.responseJSON.data).join('\n');
                }
                alert(msg);
            } else if (xhr.status === 403) {
                alert('접근 권한이 없습니다.');
            } else {
                alert('서버와 통신 중 오류가 발생했습니다. (상태 코드: ' + xhr.status + ')');
            }
        }
    });
}

/* =========================================
   세션 타이머 (60분 역카운트)
   ========================================= */
(function initSessionTimer() {
    const TOTAL = 60 * 60;
    let remaining = TOTAL;
    const $display = $('.timer-display');
    const $extend  = $('.btn-extend');

    function formatTime(sec) {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return m + ':' + s;
    }

    function tick() {
        remaining--;
        $display.text(formatTime(remaining));
        if (remaining <= 300) {
            $display.addClass('warning');
        }
        if (remaining <= 0) {
            location.href = '/login?expired=true';
        }
    }

    if ($display.length) {
        $display.text(formatTime(remaining));
        setInterval(tick, 1000);
    }

    $extend.on('click', function () {
        $.get('/api/v1/session/extend', function () {
            remaining = TOTAL;
            $display.text(formatTime(remaining)).removeClass('warning');
        });
    });
})();

/* =========================================
   페이지네이션 렌더링 유틸
   ========================================= */
function renderPagination($container, total, currentPage, size, onPageClick) {
    const totalPages = Math.ceil(total / size);
    $container.empty();

    if (totalPages <= 1) return;

    const prevBtn = $('<button>').html('<i class="ph ph-caret-left"></i>')
        .prop('disabled', currentPage <= 1)
        .on('click', function () { onPageClick(currentPage - 1); });
    $container.append(prevBtn);

    const startPage = Math.max(1, currentPage - 2);
    const endPage   = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const btn = $('<button>').text(i).toggleClass('active', i === currentPage)
            .on('click', (function (p) { return function () { onPageClick(p); }; })(i));
        $container.append(btn);
    }

    const nextBtn = $('<button>').html('<i class="ph ph-caret-right"></i>')
        .prop('disabled', currentPage >= totalPages)
        .on('click', function () { onPageClick(currentPage + 1); });
    $container.append(nextBtn);
}

/* =========================================
   배지 유틸
   ========================================= */
const TEST_STATUS_BADGE = {
    'READY':       '<span class="badge badge-ready">미진행</span>',
    'IN_PROGRESS': '<span class="badge badge-progress">진행중</span>',
    'SUCCESS':     '<span class="badge badge-success">완료</span>',
    'FAIL':        '<span class="badge badge-fail">실패</span>',
    'HOLD':        '<span class="badge badge-hold">보류</span>'
};

const DEFECT_STATUS_BADGE = {
    'ANALYSIS':     '<span class="badge badge-analysis">분석중</span>',
    'FIXING':       '<span class="badge badge-fixing">조치중</span>',
    'FIX_COMPLETE': '<span class="badge badge-fix-complete">조치완료</span>',
    'RETEST':       '<span class="badge badge-retest">재테스트중</span>',
    'CLOSED':       '<span class="badge badge-closed">종료</span>'
};

function testStatusBadge(status)   { return TEST_STATUS_BADGE[status]   || status; }
function defectStatusBadge(status) { return DEFECT_STATUS_BADGE[status] || status; }

/* =========================================
   날짜 포맷 유틸
   ========================================= */
function formatDate(val) {
    if (!val) return '-';
    return String(val).substring(0, 10);
}

function formatDateTime(val) {
    if (!val) return '-';
    return String(val).replace('T', ' ').substring(0, 16);
}
