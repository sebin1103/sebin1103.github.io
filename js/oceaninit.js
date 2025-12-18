



/*************************************************
 * 이벤트 등록
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
    // 스태미나 계산 버튼
    document.getElementById("stamina-calc-btn")?.addEventListener("click", runStaminaSimulation);

    // ===== 프리미엄 입력값 자동 반영 =====
    document.getElementById("info-expert-premium-price").addEventListener("input", () => {
        run1StarOptimization();
        run2StarOptimization();
        run3StarOptimization();
    });


    // 전문가 입력 변경 시 요약 업데이트
    const expertInputs = [
        "info-expert-rod",
        "expert-storm",
        "expert-star",
        "expert-clam-refill"
    ];
    expertInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener("input", updateStaminaExpertSummary);
    });

    // 초기 요약 반영
    updateStaminaExpertSummary();
});


