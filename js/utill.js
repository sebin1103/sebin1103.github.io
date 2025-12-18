/*************************************************
 * 공통 유틸
 *************************************************/
function add(target, src, mul = 1) {
    for (let k in src) {
        target[k] = (target[k] || 0) + src[k] * mul;
    }
}




/*************************************************
 * 1/2/3성 계산기 세트 모드 (util.js)
 *************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const setSwitcher = document.getElementById('switcher-set');
    const SET_COUNT = 64;

    // 숫자를 세트/나머지로 변환
    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        return `${sets} / ${remainder}`;
    }

    // 입력칸 span 업데이트
    function updateInputSpan(input) {
        const span = input.parentNode.querySelector('.set-display');
        const value = parseInt(input.value) || 0;
        span.textContent = setSwitcher.checked ? ` ${formatSet(value)}` : '';
    }

    // 입력칸 span 생성 + 이벤트 등록
    function setupInputSetDisplay(container) {
        const inputs = container.querySelectorAll('.input-grid input');
        inputs.forEach(input => {
            // span 한 번만 생성
            let span = input.parentNode.querySelector('.set-display');
            if (!span) {
                span = document.createElement('span');
                span.className = 'set-display';
                input.parentNode.appendChild(span);
            }

            // 이벤트 한 번만 등록
            if (!input.dataset.setListenerAdded) {
                input.addEventListener('input', () => updateInputSpan(input));
                input.dataset.setListenerAdded = 'true';
            }

            // 초기값 반영
            updateInputSpan(input);
        });
    }

    // 성급 변경 시
    window.switchStarLevel = function(level) {
        document.querySelectorAll('.star-level').forEach(card => card.style.display = 'none');
        const current = document.getElementById('star-' + level);
        current.style.display = 'block';
        setupInputSetDisplay(current);
    };

    // 스위치 ON/OFF 시 입력칸 + 결과창 업데이트
    setSwitcher.addEventListener('change', () => {
        const currentStar = document.querySelector('.star-level:not([style*="display: none"])');
        if (currentStar) setupInputSetDisplay(currentStar);

        if (window.last1StarResult) window.update1StarResult(window.last1StarResult);
        if (window.last2StarResult) window.update2StarResult(window.last2StarResult);
        if (window.last3StarResult) window.update3StarResult(window.last3StarResult);
    });

    // 초기화: 첫 화면 1성 입력칸 span 생성
    const firstStar = document.getElementById('star-1');
    if (firstStar) setupInputSetDisplay(firstStar);
});