/*************************************************
 * 1️⃣ 1성 계산기 (ocean1st.js)
 *************************************************/

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {

    // ===== 상수 정의 =====
    const GOLD_1STAR = { A: 3436, K: 3486, L: 3592 };
    const CORE_TO_ESSENCE = {
        WG: { guard: 1, wave: 1 },
        WP: { wave: 1, chaos: 1 },
        OD: { chaos: 1, life: 1 },
        VD: { life: 1, decay: 1 },
        ED: { decay: 1, guard: 1 }
    };
    const ESSENCE_TO_BLOCK = {
        guard: { clay: 1 },
        wave: { sand: 3 },
        chaos: { dirt: 4 },
        life: { gravel: 2 },
        decay: { granite: 1 }
    };
    const CORE_TO_FISH = {
        WG: { shrimp: 1 },
        WP: { domi: 1 },
        OD: { herring: 1 },
        VD: { goldfish: 1 },
        ED: { bass: 1 }
    };

    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');

    // ===== 유틸 함수 =====
    function add(target, src, mul = 1) {
        for (let k in src) {
            target[k] = (target[k] || 0) + src[k] * mul;
        }
    }

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        return `${sets} / ${remainder}`;
    }

    // ===== 계산 함수 =====
    window.calculate1Star = function(input) {
        let best = { gold: -1, A: 0, K: 0, L: 0 };
        const maxA = input.guard + input.decay;
        const maxK = input.wave + input.chaos;
        const maxL = input.decay;

        for (let A = 0; A <= maxA; A++) {
            for (let K = 0; K <= maxK; K++) {
                for (let L = 0; L <= maxL; L++) {
                    const ess = {
                        guard: CORE_TO_ESSENCE.WG.guard * (A + L) + CORE_TO_ESSENCE.ED.guard * L,
                        wave: CORE_TO_ESSENCE.WG.wave * (A + L) + CORE_TO_ESSENCE.WP.wave * (K + L),
                        chaos: CORE_TO_ESSENCE.WP.chaos * (K + L) + CORE_TO_ESSENCE.OD.chaos * (A + K),
                        life: CORE_TO_ESSENCE.OD.life * (A + K) + CORE_TO_ESSENCE.VD.life * (A + K),
                        decay: CORE_TO_ESSENCE.VD.decay * (A + K) + CORE_TO_ESSENCE.ED.decay * L
                    };

                    if (
                        ess.guard > input.guard ||
                        ess.wave > input.wave ||
                        ess.chaos > input.chaos ||
                        ess.life > input.life ||
                        ess.decay > input.decay
                    ) continue;

                    const gold = A * GOLD_1STAR.A + K * GOLD_1STAR.K + L * GOLD_1STAR.L;
                    if (gold > best.gold) best = { gold, A, K, L };
                }
            }
        }

        if (best.gold < 0) return null;

        const coreNeed = {
            WG: best.A + best.L,
            WP: best.K + best.L,
            OD: best.A + best.K,
            VD: best.A + best.K,
            ED: best.L
        };

        const essNeed = {}, blockNeed = {}, fishNeed = {};
        for (let c in coreNeed) {
            add(essNeed, CORE_TO_ESSENCE[c], coreNeed[c]);
            add(fishNeed, CORE_TO_FISH[c], coreNeed[c]);
        }
        for (let e in essNeed) add(blockNeed, ESSENCE_TO_BLOCK[e], essNeed[e]);

        return { best, coreNeed, essNeed, blockNeed, fishNeed };
    };

    // ===== 결과 업데이트 함수 =====
    window.update1StarResult = function(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-1").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();
        document.getElementById("result-premium-bonus-1").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        // 재료
        document.getElementById("result-acutis-1").textContent = setSwitcher.checked ? formatSet(r.best.A) : r.best.A;
        document.getElementById("result-frenzy-1").textContent = setSwitcher.checked ? formatSet(r.best.K) : r.best.K;
        document.getElementById("result-feather-1").textContent = setSwitcher.checked ? formatSet(r.best.L) : r.best.L;

        // 정수
        document.getElementById("result-essence-1").textContent =
            `수호 ${setSwitcher.checked ? formatSet(r.essNeed.guard) : r.essNeed.guard}, ` +
            `파동 ${setSwitcher.checked ? formatSet(r.essNeed.wave) : r.essNeed.wave}, ` +
            `혼란 ${setSwitcher.checked ? formatSet(r.essNeed.chaos) : r.essNeed.chaos}, ` +
            `생명 ${setSwitcher.checked ? formatSet(r.essNeed.life) : r.essNeed.life}, ` +
            `부식 ${setSwitcher.checked ? formatSet(r.essNeed.decay) : r.essNeed.decay}`;

        // 핵
        document.getElementById("result-core-1").textContent =
            `물결 수호 ${setSwitcher.checked ? formatSet(r.coreNeed.WG) : r.coreNeed.WG}, ` +
            `파동 오염 ${setSwitcher.checked ? formatSet(r.coreNeed.WP) : r.coreNeed.WP}, ` +
            `질서 파괴 ${setSwitcher.checked ? formatSet(r.coreNeed.OD) : r.coreNeed.OD}, ` +
            `활력 붕괴 ${setSwitcher.checked ? formatSet(r.coreNeed.VD) : r.coreNeed.VD}, ` +
            `침식 방어 ${setSwitcher.checked ? formatSet(r.coreNeed.ED) : r.coreNeed.ED}`;

        // 블록
        document.getElementById("result-block-1").textContent =
            `점토 ${setSwitcher.checked ? formatSet(r.blockNeed.clay || 0) : r.blockNeed.clay || 0}, ` +
            `모래 ${setSwitcher.checked ? formatSet(r.blockNeed.sand || 0) : r.blockNeed.sand || 0}, ` +
            `흙 ${setSwitcher.checked ? formatSet(r.blockNeed.dirt || 0) : r.blockNeed.dirt || 0}, ` +
            `자갈 ${setSwitcher.checked ? formatSet(r.blockNeed.gravel || 0) : r.blockNeed.gravel || 0}, ` +
            `화강암 ${setSwitcher.checked ? formatSet(r.blockNeed.granite || 0) : r.blockNeed.granite || 0}`;

        // 물고기
        document.getElementById("result-fish-1").textContent =
            `새우 ${setSwitcher.checked ? formatSet(r.fishNeed.shrimp || 0) : r.fishNeed.shrimp || 0}, ` +
            `도미 ${setSwitcher.checked ? formatSet(r.fishNeed.domi || 0) : r.fishNeed.domi || 0}, ` +
            `청어 ${setSwitcher.checked ? formatSet(r.fishNeed.herring || 0) : r.fishNeed.herring || 0}, ` +
            `금붕어 ${setSwitcher.checked ? formatSet(r.fishNeed.goldfish || 0) : r.fishNeed.goldfish || 0}, ` +
            `농어 ${setSwitcher.checked ? formatSet(r.fishNeed.bass || 0) : r.fishNeed.bass || 0}`;

        window.last1StarResult = r;
    };

    // ===== 버튼 클릭 함수 =====
    window.run1StarOptimization = function() {
        const r = calculate1Star({
            guard: +document.getElementById("input-oyster-1").value,
            wave: +document.getElementById("input-shell-1").value,
            chaos: +document.getElementById("input-octopus-1").value,
            life: +document.getElementById("input-seaweed-1").value,
            decay: +document.getElementById("input-urchin-1").value
        });
        if (!r) return alert("재료 부족");

        update1StarResult(r);
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    setSwitcher.addEventListener('change', () => {
        if (window.last1StarResult) update1StarResult(window.last1StarResult);
    });

    // ===== 입력칸 span 생성 삭제 =====
    // 이전에 inputs.forEach(...)로 span 생성하던 부분은 제거
    // util.js에서 span과 이벤트 모두 처리됨

});
