/*************************************************
 * 3️⃣ 3성 계산기 (ocean3rd.js)
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    const GOLD_3STAR = { AQUA: 10699, NAUTILUS: 10824, SPINE: 10892 };
    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');

    const inputs = [
        document.getElementById("input-oyster-3"),
        document.getElementById("input-conch-3"),
        document.getElementById("input-octopus-3"),
        document.getElementById("input-seaweed-3"),
        document.getElementById("input-urchin-3")
    ];

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        if (sets > 0 && remainder > 0) return `${sets} / ${remainder}`;
        if (sets > 0) return `${sets} / 0`;
        return `0 / ${remainder}`;
    }

    // ===== 계산 함수 =====
    window.calculate3Star = function(input) {
        let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };
        let limit = Math.max(10, input.guard + input.wave + input.chaos + input.life + input.decay);

        for (let AQUA = 0; AQUA <= limit; AQUA++) {
            for (let NAUTILUS = 0; NAUTILUS <= limit; NAUTILUS++) {
                for (let SPINE = 0; SPINE <= limit; SPINE++) {
                    // 영약 계산 (2성의 결정과 동일한 구조)
                    let potion = {
                        immortal: AQUA + NAUTILUS,      // 불멸 재생 = 아쿠아 + 나우틸러스
                        barrier: AQUA + NAUTILUS,       // 파동 장벽 = 아쿠아 + 나우틸러스
                        corrupt: SPINE + NAUTILUS,      // 타락 침식 = 척추 + 나우틸러스
                        frenzy: SPINE + NAUTILUS,       // 생명 광란 = 척추 + 나우틸러스
                        venom: AQUA + SPINE             // 맹독 파동 = 아쿠아 + 척추
                    };
                    
                    // 엘릭서 계산 (2성의 에센스와 동일한 구조)
                    let elixir = {
                        guard: potion.immortal + potion.barrier,    // 수호 = 불멸재생 + 파동장벽
                        wave: potion.barrier + potion.venom,        // 파동 = 파동장벽 + 맹독파동
                        chaos: potion.corrupt + potion.frenzy,      // 혼란 = 타락침식 + 생명광란
                        life: potion.immortal + potion.frenzy,      // 생명 = 불멸재생 + 생명광란
                        decay: potion.corrupt + potion.venom        // 부식 = 타락침식 + 맹독파동
                    };

                    if (elixir.guard > input.guard || elixir.wave > input.wave || elixir.chaos > input.chaos ||
                        elixir.life > input.life || elixir.decay > input.decay)
                        continue;

                    let gold = AQUA * GOLD_3STAR.AQUA + NAUTILUS * GOLD_3STAR.NAUTILUS + SPINE * GOLD_3STAR.SPINE;
                    if (gold > best.gold) best = { gold, AQUA, NAUTILUS, SPINE };
                }
            }
        }

        if (best.gold < 0) return null;

        let potionNeed = {
            immortal: best.AQUA + best.NAUTILUS,
            barrier: best.AQUA + best.NAUTILUS,
            corrupt: best.SPINE + best.NAUTILUS,
            frenzy: best.SPINE + best.NAUTILUS,
            venom: best.AQUA + best.SPINE
        };

        let elixirNeed = {
            guard: potionNeed.immortal + potionNeed.barrier,
            wave: potionNeed.barrier + potionNeed.venom,
            chaos: potionNeed.corrupt + potionNeed.frenzy,
            life: potionNeed.immortal + potionNeed.frenzy,
            decay: potionNeed.corrupt + potionNeed.venom
        };

        let seaSquirtNeed = {
            guard: elixirNeed.guard,
            wave: elixirNeed.wave,
            chaos: elixirNeed.chaos,
            life: elixirNeed.life,
            decay: elixirNeed.decay
        };

        let materialNeed = {
            glassBottle: 3 * (elixirNeed.guard + elixirNeed.wave + elixirNeed.chaos + elixirNeed.life + elixirNeed.decay),
            seaSquirt: seaSquirtNeed.guard + seaSquirtNeed.wave + seaSquirtNeed.chaos + seaSquirtNeed.life + seaSquirtNeed.decay,
            glowInkSac: potionNeed.immortal + potionNeed.barrier + potionNeed.corrupt + potionNeed.frenzy + potionNeed.venom,
            glowBerry: 2 * (potionNeed.immortal + potionNeed.barrier + potionNeed.corrupt + potionNeed.frenzy + potionNeed.venom)
        };

        let netherNeed = {
            netherrack: 16 * elixirNeed.guard,
            magmaBlock: 8 * elixirNeed.wave,
            soulSoil: 8 * elixirNeed.chaos,
            crimsonStem: 4 * elixirNeed.life,
            warpedStem: 4 * elixirNeed.decay
        };

        let flowerNeed = {
            cornflower: potionNeed.immortal,
            dandelion: potionNeed.barrier,
            daisy: potionNeed.corrupt,
            poppy: potionNeed.frenzy,
            blueOrchid: potionNeed.venom
        };

        return { best, elixirNeed, potionNeed, materialNeed, netherNeed, flowerNeed, seaSquirtNeed };
    };

    // ===== 결과 업데이트 =====
    function update3StarResult(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-3").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();
        document.getElementById("result-premium-bonus-3").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        document.getElementById("result-aqua-3").textContent = setSwitcher.checked ? formatSet(r.best.AQUA) : r.best.AQUA;
        document.getElementById("result-nautilus-3").textContent = setSwitcher.checked ? formatSet(r.best.NAUTILUS) : r.best.NAUTILUS;
        document.getElementById("result-spine-3").textContent = setSwitcher.checked ? formatSet(r.best.SPINE) : r.best.SPINE;

        document.getElementById("result-essence-3").textContent =
            `수호 ${setSwitcher.checked ? formatSet(r.elixirNeed.guard) : r.elixirNeed.guard}, ` +
            `파동 ${setSwitcher.checked ? formatSet(r.elixirNeed.wave) : r.elixirNeed.wave}, ` +
            `혼란 ${setSwitcher.checked ? formatSet(r.elixirNeed.chaos) : r.elixirNeed.chaos}, ` +
            `생명 ${setSwitcher.checked ? formatSet(r.elixirNeed.life) : r.elixirNeed.life}, ` +
            `부식 ${setSwitcher.checked ? formatSet(r.elixirNeed.decay) : r.elixirNeed.decay}`;

        document.getElementById("result-core-3").textContent =
            `불멸 재생 ${setSwitcher.checked ? formatSet(r.potionNeed.immortal) : r.potionNeed.immortal}, ` +
            `파동 장벽 ${setSwitcher.checked ? formatSet(r.potionNeed.barrier) : r.potionNeed.barrier}, ` +
            `타락 침식 ${setSwitcher.checked ? formatSet(r.potionNeed.corrupt) : r.potionNeed.corrupt}, ` +
            `생명 광란 ${setSwitcher.checked ? formatSet(r.potionNeed.frenzy) : r.potionNeed.frenzy}, ` +
            `맹독 파동 ${setSwitcher.checked ? formatSet(r.potionNeed.venom) : r.potionNeed.venom}`;

        document.getElementById("result-material-3").textContent =
            `불우렁쉥이 ${setSwitcher.checked ? formatSet(r.materialNeed.seaSquirt) : r.materialNeed.seaSquirt}, ` +
            `유리병 ${setSwitcher.checked ? formatSet(r.materialNeed.glassBottle) : r.materialNeed.glassBottle}, ` +
            `발광 먹물 ${setSwitcher.checked ? formatSet(r.materialNeed.glowInkSac) : r.materialNeed.glowInkSac}, ` +
            `발광 열매 ${setSwitcher.checked ? formatSet(r.materialNeed.glowBerry) : r.materialNeed.glowBerry}`;

        document.getElementById("result-block-3").textContent =
            `네더렉 ${setSwitcher.checked ? formatSet(r.netherNeed.netherrack) : r.netherNeed.netherrack}, ` +
            `마그마 ${setSwitcher.checked ? formatSet(r.netherNeed.magmaBlock) : r.netherNeed.magmaBlock}, ` +
            `영혼흙 ${setSwitcher.checked ? formatSet(r.netherNeed.soulSoil) : r.netherNeed.soulSoil}, ` +
            `진홍빛자루 ${setSwitcher.checked ? formatSet(r.netherNeed.crimsonStem) : r.netherNeed.crimsonStem}, ` +
            `뒤틀린자루 ${setSwitcher.checked ? formatSet(r.netherNeed.warpedStem) : r.netherNeed.warpedStem}`;

        document.getElementById("result-flower-3").textContent =
            `수레국화 ${setSwitcher.checked ? formatSet(r.flowerNeed.cornflower) : r.flowerNeed.cornflower}, ` +
            `민들레 ${setSwitcher.checked ? formatSet(r.flowerNeed.dandelion) : r.flowerNeed.dandelion}, ` +
            `데이지 ${setSwitcher.checked ? formatSet(r.flowerNeed.daisy) : r.flowerNeed.daisy}, ` +
            `양귀비 ${setSwitcher.checked ? formatSet(r.flowerNeed.poppy) : r.flowerNeed.poppy}, ` +
            `선애기별꽃 ${setSwitcher.checked ? formatSet(r.flowerNeed.blueOrchid) : r.flowerNeed.blueOrchid}`;

        window.last3StarResult = r;
    }

    // ===== 버튼 클릭 함수 =====
    window.run3StarOptimization = function() {
        const r = calculate3Star({
            guard: +document.getElementById("input-oyster-3").value,
            wave: +document.getElementById("input-conch-3").value,
            chaos: +document.getElementById("input-octopus-3").value,
            life: +document.getElementById("input-seaweed-3").value,
            decay: +document.getElementById("input-urchin-3").value
        });
        if (!r) return alert("재료 부족");

        update3StarResult(r);
        document.getElementById("result-card-3").style.display = "block";
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    setSwitcher.addEventListener('change', () => {
        if (window.last3StarResult) update3StarResult(window.last3StarResult);
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