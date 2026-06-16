$(function () {
    // 세션 사용자 정보 설정
    loadUserInfo();
    // 대시보드 데이터 로드
    loadDashboard();
});

function loadUserInfo() {
    sendAjax('/api/v1/session/user', 'GET', null, function (res) {
        const u = res.data;
        if (u) {
            $('#userAvatar').text(u.userName ? u.userName.charAt(0) : '?');
            $('#userName').text(u.userName + ' 님');
        }
    }, function () { /* 세션 정보 없음 처리 불필요 */ });
}

function loadDashboard() {
    sendAjax('/api/v1/dashboard', 'GET', null, function (res) {
        const d = res.data;

        // 테스트 요약
        $('#totalTestCount').text(d.totalTestCount);
        $('#successCount').text(d.successCount);
        $('#inProgressCount').text(d.inProgressCount);
        $('#failCount').text(d.failCount);
        $('#holdCount').text(d.holdCount);
        $('#readyCount').text(d.readyCount);

        // 전체 진행률
        const rate = d.testProgressRate || 0;
        $('#testProgressBar').css('width', rate + '%');
        $('#testProgressRateBadge').text(rate + '%');

        // 결함 요약
        $('#totalDefectCount').text(d.totalDefectCount);
        $('#fixCompleteCount').text(d.fixCompleteCount);
        $('#closedCount').text(d.closedCount);
        $('#analysisCount').text(d.analysisCount);
        $('#fixingCount').text(d.fixingCount);
        $('#retestCount').text(d.retestCount);
        $('#defectProcessRate').text(d.defectProcessRate || 0);
        $('#defectProgressBar').css('width', (d.defectProcessRate || 0) + '%');

        // 업무별 진행 현황
        renderCategoryProgress(d.categoryProgressList || []);
    });
}

function renderCategoryProgress(list) {
    const $section = $('#categoryProgressSection');
    $section.empty();

    if (!list.length) {
        $section.html('<div class="empty-state"><div class="empty-icon"><i class="ph ph-chart-bar"></i></div><p>등록된 데이터가 없습니다.</p></div>');
        return;
    }

    list.forEach(function (item) {
        const pct      = item.progressRate || 0;
        const bizLabel = item.businessUnitName || item.majorCategory || '-';
        const row = `
            <div class="progress-row">
                <span class="progress-label" title="${escHtml(bizLabel)}">${escHtml(bizLabel)}</span>
                <div class="progress-bar-wrap">
                    <div class="progress-bar success" style="width:${pct}%"></div>
                </div>
                <span class="progress-pct">${pct}%</span>
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; padding-left:152px;">
                완료 ${item.successCount} / 전체 ${item.totalCount} &nbsp;|&nbsp; 실패 ${item.failCount}
            </div>
        `;
        $section.append(row);
    });
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
