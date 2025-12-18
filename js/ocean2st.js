/*************************************************
 * 2️⃣ 2성 계산기 (ocean2nd.js)
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    const GOLD_2STAR = { CORE: 7413, POTION: 7487, WING: 7592 };
    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');

    const inputs = [
        document.getElementById("input-guard-2"),
        document.getElementById("input-wave-2"),
        document.getElementById("input-chaos-2"),
        document.getElementById("input-life-2"),
        document.getElementById("input-decay-2")
    ];

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        if (sets > 0 && remainder > 0) return `${sets} / ${remainder}`;
        if (sets > 0) return `${sets} / 0`;
        return `0 / ${remainder}`;
    }

    // ===== 계산 함수 =====
    window.calculate2Star = function(input) {
        let best = { gold: -1, CORE: 0, POTION: 0, WING: 0 };
        let limit = Math.max(10, input.guard + input.wave + input.chaos + input.life + input.decay);

        for (let CORE = 0; CORE <= limit; CORE++) {
            for (let POTION = 0; POTION <= limit; POTION++) {
                for (let WING = 0; WING <= limit; WING++) {
                    let crystal = {
                        vital: CORE + WING,
                        erosion: CORE + POTION,
                        defense: WING,
                        regen: CORE + POTION,
                        poison: POTION + WING
                    };
                    let ess = {
                        guard: crystal.vital + crystal.defense,
                        wave: crystal.erosion + crystal.regen,
                        chaos: crystal.defense + crystal.poison,
                        life: crystal.vital + crystal.regen,
                        decay: crystal.erosion + crystal.poison
                    };

                    if (ess.guard > input.guard || ess.wave > input.wave || ess.chaos > input.chaos ||
                        ess.life > input.life || ess.decay > input.decay)
                        continue;

                    let gold = CORE * GOLD_2STAR.CORE + POTION * GOLD_2STAR.POTION + WING * GOLD_2STAR.WING;
                    if (gold > best.gold) best = { gold, CORE, POTION, WING };
                }
            }
        }

        if (best.gold < 0) return null;

        let crystalNeed = {
            vital: best.CORE + best.WING,
            erosion: best.CORE + best.POTION,
            defense: best.WING,
            regen: best.CORE + best.POTION,
            poison: best.POTION + best.WING
        };

        let essNeed = {
            guard: crystalNeed.vital + crystalNeed.defense,
            wave: crystalNeed.erosion + crystalNeed.regen,
            chaos: crystalNeed.defense + crystalNeed.poison,
            life: crystalNeed.vital + crystalNeed.regen,
            decay: crystalNeed.erosion + crystalNeed.poison
        };

        let coralBlockNeed = {
            guard: essNeed.guard,
            wave: essNeed.wave,
            chaos: essNeed.chaos,
            life: essNeed.life,
            decay: essNeed.decay
        };

        let materialNeed = {
            seaweed: 2 * (essNeed.guard + essNeed.wave + essNeed.chaos + essNeed.life + essNeed.decay),
            ink: crystalNeed.vital + crystalNeed.erosion + crystalNeed.defense + crystalNeed.regen + crystalNeed.poison,
            coralBlock: coralBlockNeed.guard + coralBlockNeed.wave + coralBlockNeed.chaos + coralBlockNeed.life + coralBlockNeed.decay
        };

        let mineralNeed = {
            lapis: crystalNeed.vital,
            redstone: crystalNeed.erosion,
            iron: crystalNeed.defense,
            gold: crystalNeed.regen,
            diamond: crystalNeed.poison
        };

        return { best, essNeed, crystalNeed, materialNeed, mineralNeed, coralBlockNeed };
    };

    // ===== 결과 업데이트 =====
    function update2StarResult(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-2").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();;
        document.getElementById("result-premium-bonus-2").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        document.getElementById("result-acutis-2").textContent = setSwitcher.checked ? formatSet(r.best.CORE) : r.best.CORE;
        document.getElementById("result-frenzy-2").textContent = setSwitcher.checked ? formatSet(r.best.POTION) : r.best.POTION;
        document.getElementById("result-feather-2").textContent = setSwitcher.checked ? formatSet(r.best.WING) : r.best.WING;

        document.getElementById("result-essence-2").textContent =
            `수호 ${setSwitcher.checked ? formatSet(r.essNeed.guard) : r.essNeed.guard}, ` +
            `파동 ${setSwitcher.checked ? formatSet(r.essNeed.wave) : r.essNeed.wave}, ` +
            `혼란 ${setSwitcher.checked ? formatSet(r.essNeed.chaos) : r.essNeed.chaos}, ` +
            `생명 ${setSwitcher.checked ? formatSet(r.essNeed.life) : r.essNeed.life}, ` +
            `부식 ${setSwitcher.checked ? formatSet(r.essNeed.decay) : r.essNeed.decay}`;

        document.getElementById("result-core-2").textContent =
            `활기 보존 ${setSwitcher.checked ? formatSet(r.crystalNeed.vital) : r.crystalNeed.vital}, ` +
            `파도 침식 ${setSwitcher.checked ? formatSet(r.crystalNeed.erosion) : r.crystalNeed.erosion}, ` +
            `방어 오염 ${setSwitcher.checked ? formatSet(r.crystalNeed.defense) : r.crystalNeed.defense}, ` +
            `격류 재생 ${setSwitcher.checked ? formatSet(r.crystalNeed.regen) : r.crystalNeed.regen}, ` +
            `맹독 혼란 ${setSwitcher.checked ? formatSet(r.crystalNeed.poison) : r.crystalNeed.poison}`;

        document.getElementById("result-material-2").textContent =
            `해초 ${setSwitcher.checked ? formatSet(r.materialNeed.seaweed) : r.materialNeed.seaweed}, ` +
            `먹물 ${setSwitcher.checked ? formatSet(r.materialNeed.ink) : r.materialNeed.ink}`;

        document.getElementById("result-coral-2").textContent =
            `관 ${setSwitcher.checked ? formatSet(r.coralBlockNeed.guard) : r.coralBlockNeed.guard}, ` +
            `사방 ${setSwitcher.checked ? formatSet(r.coralBlockNeed.wave) : r.coralBlockNeed.wave}, ` +
            `거품 ${setSwitcher.checked ? formatSet(r.coralBlockNeed.chaos) : r.coralBlockNeed.chaos}, ` +
            `불 ${setSwitcher.checked ? formatSet(r.coralBlockNeed.life) : r.coralBlockNeed.life}, ` +
            `뇌 ${setSwitcher.checked ? formatSet(r.coralBlockNeed.decay) : r.coralBlockNeed.decay}`;

        document.getElementById("result-extra-2").textContent =
            `청금석 블록 ${setSwitcher.checked ? formatSet(r.mineralNeed.lapis) : r.mineralNeed.lapis}, ` +
            `레드스톤 블록 ${setSwitcher.checked ? formatSet(r.mineralNeed.redstone) : r.mineralNeed.redstone}, ` +
            `철 ${setSwitcher.checked ? formatSet(r.mineralNeed.iron) : r.mineralNeed.iron}, ` +
            `금 ${setSwitcher.checked ? formatSet(r.mineralNeed.gold) : r.mineralNeed.gold}, ` +
            `다이아 ${setSwitcher.checked ? formatSet(r.mineralNeed.diamond) : r.mineralNeed.diamond}`;

        window.last2StarResult = r;
    }

    // ===== 버튼 클릭 함수 =====
    window.run2StarOptimization = function() {
        const r = calculate2Star({
            guard: +document.getElementById("input-guard-2").value,
            wave: +document.getElementById("input-wave-2").value,
            chaos: +document.getElementById("input-chaos-2").value,
            life: +document.getElementById("input-life-2").value,
            decay: +document.getElementById("input-decay-2").value
        });
        if (!r) return alert("재료 부족");

        update2StarResult(r);
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    setSwitcher.addEventListener('change', () => {
        if (window.last2StarResult) update2StarResult(window.last2StarResult);
    });

    // ===== 입력칸 세트 표시 =====
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.className = 'set-display';
        input.parentNode.appendChild(span);

        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 0;
            if (setSwitcher.checked) {
                const sets = Math.floor(value / SET_COUNT);
                const remainder = value % SET_COUNT;
                span.textContent = ` ${sets} / ${remainder}`;
            } else {
                span.textContent = '';
            }
        });
    });
});