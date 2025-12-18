/*************************************************
 * 4️⃣ 스태미나 계산기 (정보탭 전문가 반영, 정수 평균값)
 *************************************************/

// 낚싯대 강화 단계별 드롭 수와 기본 조개 확률
const rodData = {
    1: { drop: 1, clamRate: 0 },
    2: { drop: 1, clamRate: 0.01 },
    3: { drop: 2, clamRate: 0.01 },
    4: { drop: 2, clamRate: 0.01 },
    5: { drop: 2, clamRate: 0.02 },
    6: { drop: 3, clamRate: 0.02 },
    7: { drop: 3, clamRate: 0.02 },
    8: { drop: 3, clamRate: 0.03 },
    9: { drop: 4, clamRate: 0.03 },
    10:{ drop: 4, clamRate: 0.03 },
    11:{ drop: 4, clamRate: 0.05 },
    12:{ drop: 5, clamRate: 0.05 },
    13:{ drop: 5, clamRate: 0.05 },
    14:{ drop: 5, clamRate: 0.05 },
    15:{ drop: 6, clamRate: 0.10 },
};

window.runStaminaSimulation = function runStaminaSimulation() {
    const stamina = +document.getElementById("input-stamina").value || 0;
    const item = document.getElementById("stamina-item-select").value;

    if (!stamina) return alert("스태미나를 입력해주세요.");

    // 전문가 값 가져오기
    const rodLV = +document.getElementById("info-expert-rod")?.value || 1;
    const stormLV = +document.getElementById("expert-storm")?.value || 0;
    const starLV = +document.getElementById("expert-star")?.value || 0;
    const clamLV = +document.getElementById("expert-clam-refill")?.value || 0;

    const staminaPerGather = 15;
    const gatherCount = Math.floor(stamina / staminaPerGather);

    // 낚싯대 드롭 수와 조개 확률
    const rodInfo = rodData[rodLV] || { drop: 1, clamRate: 0 };
    let totalDrops = gatherCount * rodInfo.drop;

    // 폭풍의 물질꾼: 비 오는 날만 적용 (여기선 가정으로 true)
    const isRain = true;
    if (stormLV > 0 && isRain) {
        const stormBonus = [0, 0.01, 0.03, 0.05, 0.07, 0.10];
        totalDrops = Math.floor(totalDrops * (1 + (stormBonus[stormLV] || 0)));
    }

    // 등급 확률
    const rate3 = 0.1 + 0.01 * starLV; // 3성
    const rate2 = 0.3;                  // 2성
    const rate1 = 1 - rate2 - rate3;    // 1성

    // 소수 기반으로 초기 계산
    let raw1 = totalDrops * rate1;
    let raw2 = totalDrops * rate2;
    let raw3 = totalDrops * rate3;

    // 정수로 변환 (버림)
    let count1 = Math.floor(raw1);
    let count2 = Math.floor(raw2);
    let count3 = Math.floor(raw3);

    // 남은 개수(totalDrops - sum) 나머지 처리: 확률 높은 순서대로 배분
    let remainder = totalDrops - (count1 + count2 + count3);
    const probOrder = [
        { count: 'count3', frac: raw3 - count3 },
        { count: 'count2', frac: raw2 - count2 },
        { count: 'count1', frac: raw1 - count1 }
    ].sort((a,b)=>b.frac - a.frac);

    for (let i = 0; i < remainder; i++) {
        if (probOrder[i % 3].count === 'count3') count3++;
        else if (probOrder[i % 3].count === 'count2') count2++;
        else count1++;
    }

    // 조개 등장 확률: 낚싯대 + 조개 무한리필
    const clamRatePerLV = [0, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.07];
    const clamRate = (rodInfo.clamRate || 0) + (clamRatePerLV[clamLV] || 0);
    const clamCount = Math.floor(gatherCount * clamRate);

    // 결과 출력
    const html = `
        <div class="stamina-result-products">
            <div>${item}★ <span>${count1}</span></div>
            <div>${item}★★ <span>${count2}</span></div>
            <div>${item}★★★ <span>${count3}</span></div>
            <div>조개 <span>${clamCount}</span></div>
        </div>
    `;
    document.getElementById("stamina-item-list").innerHTML = html;
}

window.updateStaminaExpertSummary = function updateStaminaExpertSummary() {
    const rodLV = +document.getElementById("info-expert-rod")?.value || 1;
    const stormLV = +document.getElementById("expert-storm")?.value || 0;
    const starLV = +document.getElementById("expert-star")?.value || 0;
    const clamLV = +document.getElementById("expert-clam-refill")?.value || 0;

    const summaryElem = document.getElementById("stamina-expert-summary");
    if (summaryElem) {
        summaryElem.textContent = `(폭풍 ${stormLV}LV, 별별별 ${starLV}LV, 조개 무한리필 ${clamLV}LV, 낚싯대 ${rodLV}강 적용)`;
    }
}

window.toggleDesc = function toggleDesc(id) {
    const elem = document.getElementById(id);
    if (!elem) return;
    elem.style.display = (elem.style.display === 'none' || elem.style.display === '') ? 'block' : 'none';
}
