/* =========================
   채광 페이지 전용 스크립트 (mining.js)
   - 탭(정보/스태미나/판매) 기본 UI 구성
   - 판매탭: 보석 상점가(그라밋/에메리오/샤인플레어) + 판매가 퍼센트(기준 100) + 갯수 계산
   - 판매 탭 옆에 "제작" 탭 추가: 라이프 스톤(하급/중급/상급) 재료 계산
   ========================= */

(function () {
  // ---- 유틸 ----
  function $(id) { return document.getElementById(id); }
  function clampInt(v, min, max) {
    v = Number.isFinite(+v) ? Math.floor(+v) : 0;
    if (Number.isFinite(min)) v = Math.max(min, v);
    if (Number.isFinite(max)) v = Math.min(max, v);
    return v;
  }
  function formatNumber(n) {
    n = Math.floor(Number(n) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // ---- 토글(설명 열기/닫기) ----
  window.toggleDesc = window.toggleDesc || function toggleDesc(id) {
    const el = $(id);
    if (!el) return;
    const cur = el.style.display;
    el.style.display = (cur === "none" || cur === "") ? "block" : "none";
  };

  // ---- 위키 기반 테이블 ----
  // 럭키 히트: LV별 (확률, 추가드롭개수)
  const luckyHitTable = {
    0: { p: 0, extra: 0 },
    1: { p: 0.01, extra: 1 },
    2: { p: 0.02, extra: 1 },
    3: { p: 0.03, extra: 1 },
    4: { p: 0.04, extra: 1 },
    5: { p: 0.05, extra: 1 },
    6: { p: 0.06, extra: 1 },
    7: { p: 0.07, extra: 1 },
    8: { p: 0.08, extra: 2 },
    9: { p: 0.10, extra: 2 },
    10:{ p: 0.15, extra: 3 },
  };

  // 아래 3개 테이블은 기존 코드가 참조하길래,
  // 없으면 에러나서 스태미나/판매 둘 다 멈추니까 안전 기본값을 넣어둠

  // [수정 1] 불붙은 곡괭이 테이블 기본값 교체
  // LV1~9: 1~9%, LV10: 15%
  const flamingPickTable = (typeof window.flamingPickTable === "object" && window.flamingPickTable)
    ? window.flamingPickTable
    : {
        0: 0,
        1: 0.01,
        2: 0.02,
        3: 0.03,
        4: 0.04,
        5: 0.05,
        6: 0.06,
        7: 0.07,
        8: 0.08,
        9: 0.09,
        10: 0.15,
      };

  const ingotPriceTable = (typeof window.ingotPriceTable === "object" && window.ingotPriceTable)
    ? window.ingotPriceTable
    : { 0: 0 };

  const gemPriceTable = (typeof window.gemPriceTable === "object" && window.gemPriceTable)
    ? window.gemPriceTable
    : { 0: 0 };

  // 반짝반짝 눈이 부셔(보석 판매가) 고정 수치
  const gemPriceTableFixed = { 0:0, 1:0.05, 2:0.07, 3:0.10, 4:0.20, 5:0.30, 6:0.50 };

  // id가 중복이라도 값이 들어간 입력칸을 찾아서 레벨을 가져오도록 처리
  function getGemPriceLv() {
    const nodes = document.querySelectorAll("#mining-expert-gemprice");
    let lv = 0;
    nodes.forEach((n) => {
      const v = Number(n.value);
      if (Number.isFinite(v) && v !== 0) lv = v; // 값이 있는 걸 우선
    });
    return clampInt(lv, 0, 6);
  }

  // 판매탭 보석 상점가 (요청값)
  const gemShopPrice = {
    gramit: 7000,
    emerio: 7500,
    shineflare: 8000,
  };
  const gemNameMap = {
    gramit: "그라밋",
    emerio: "에메리오",
    shineflare: "샤인플레어",
  };

  // ---- 제작탭(라이프 스톤) 레시피 ----
  const lifeStoneRecipes = {
    low: {
      name: "하급 라이프 스톤",
      perOne: {
        "조약돌 뭉치": 2,
        "구리블럭": 8,
        "레드스톤 블럭": 3,
        "코룸": 1,
      },
    },
    mid: {
      name: "중급 라이프 스톤",
      perOne: {
        "심층암 조약돌 뭉치": 2,
        "청금석 블럭": 5,
        "철블럭": 5,
        "다이아블럭": 3,
        "리프톤 주괴": 2,
      },
    },
    high: {
      name: "상급 라이프 스톤",
      perOne: {
        "구리블럭": 30,
        "자수정 블럭": 20,
        "철블럭": 7,
        "금블럭": 7,
        "다이아블럭": 5,
        "세렌트 주괴": 3,
      },
    },
  };

  // ---- UI 스타일 주입(조금 더 예쁘게) ----
  function injectUIStyleOnce() {
    if (document.getElementById("mining-ui-style")) return;
    const style = document.createElement("style");
    style.id = "mining-ui-style";
    style.textContent = `
      .mining-card{
        background:#fff;border:1px solid #e5e7eb;border-radius:16px;
        padding:16px;margin:12px 0;
        box-shadow:0 6px 16px rgba(0,0,0,.04);
      }
      .mining-title{font-weight:900;margin-bottom:10px}
      .mining-grid{display:grid;grid-template-columns:160px 1fr;gap:10px;align-items:center;margin:8px 0}
      .mining-input, .mining-select{
        padding:10px;border:1px solid #e5e7eb;border-radius:12px;outline:none;
      }
      .mining-input:focus, .mining-select:focus{border-color:#9ca3af}
      .mining-btn{
        padding:10px 14px;border-radius:12px;border:1px solid #e5e7eb;
        background:#111827;color:#fff;font-weight:800;cursor:pointer;
      }
      .mining-note{color:#6b7280}
      .mining-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .mining-box{padding:12px;border:1px solid #e5e7eb;border-radius:14px}
      .mining-k{color:#6b7280}
      .mining-v{font-size:22px;font-weight:900}

      /* 제작(라이프 스톤) 결과 표 */
      .mining-table{
        width:100%;
        border-collapse:separate;
        border-spacing:0;
        overflow:hidden;
        border:1px solid #e5e7eb;
        border-radius:14px;
      }
      .mining-table th, .mining-table td{
        padding:10px 12px;
        border-bottom:1px solid #e5e7eb;
        text-align:left;
      }
      .mining-table th{
        background:#f9fafb;
        color:#374151;
        font-weight:800;
      }
      .mining-table tr:last-child td{border-bottom:none;}
      .mining-td-right{text-align:right;}
      .mining-pill{
        display:inline-block;
        padding:6px 10px;
        border:1px solid #e5e7eb;
        border-radius:999px;
        background:#f9fafb;
        color:#111827;
        font-weight:800;
        font-size:12px;
      }

      /* [수정 2] 채광 정보탭 UI를 해양 정보탭 스타일로 맞춤 */
      #tab-info #info-expert{
        background-color:#f7f9fc;
        border:1px solid #d1d9e6;
        border-radius:12px;
        padding:20px;
        max-width:600px;
        margin-top:20px;
        box-shadow:0 4px 12px rgba(0,0,0,0.05);
      }
      #tab-info #info-expert h3{
        font-size:1.2rem;
        font-weight:600;
        color:#2a3f54;
        margin-bottom:16px;
      }
      #info-expert-rod-row{
        display:flex;
        align-items:center;
        justify-content:center;
        padding:12px 20px;
        max-width:300px;
        margin:20px auto;
        border-radius:12px;
        box-shadow:0 6px 15px rgba(0,0,0,0.08);
        background:#ffffff;
        color:#2a3f54;
        font-weight:500;
        text-align:center;
      }
      #info-expert-rod-row .fish-label{
        flex:1;
        text-align:left;
        font-size:0.95rem;
        font-weight:600;
        color:#2a3f54;
      }
      #info-expert-rod-row input{
        width:80px;
        padding:6px 10px;
        border:1px solid #ccc;
        border-radius:6px;
        text-align:right;
      }
      .fish-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:12px;
      }
      #tab-info #info-expert .fish-label{
        font-size:0.95rem;
        color:#34495e;
        flex:1;
      }
      #tab-info #info-expert .input-area{
        flex:0 0 120px;
        display:flex;
        justify-content:flex-end;
      }
      #tab-info #info-expert .input-area input{
        width:110px;
        padding:8px 10px;
        border:1px solid #ccc;
        border-radius:6px;
        text-align:right;
        transition:border-color 0.2s, box-shadow 0.2s;
      }
      #tab-info #info-expert .input-area input:focus{
        border-color:#4a90e2;
        box-shadow:0 0 4px rgba(74,144,226,0.3);
        outline:none;
      }
      .expert-desc{
        width:100%;
        margin:6px 0 12px 0;
        padding:10px 12px;
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:6px;
        display:none;
        line-height:1.5;
        color:#334155;
      }
      .info-btn{
        margin-left:6px;
        font-size:13px;
        cursor:pointer;
        color:#2563eb;
        user-select:none;
      }
    `;
    document.head.appendChild(style);
  }

  // ---- 상단 탭에 "제작" 추가 + 패널 생성 ----
  function ensureLifeCraftTab() {
    // 이미 있으면 끝
    if ($("tab-life-craft")) return;

    const nav = document.querySelector(".sub-header-inner");
    const saleLink = nav ? nav.querySelector('a[data-target="tab-craft"]') : null;

    // nav나 판매링크가 없으면, 패널만 만들어 두고 탭은 못 붙일 수도 있음(그래도 안전)
    const craftPanel = $("tab-craft");
    if (!craftPanel) return;

    // 패널 생성 (판매 패널과 같은 부모에 붙임)
    const parent = craftPanel.parentElement;
    if (parent) {
      const panel = document.createElement("div");
      panel.id = "tab-life-craft";
      panel.className = craftPanel.className || "tab-content";
      panel.style.display = "none";
      parent.appendChild(panel);
    }

    // 탭 링크 생성 (판매 옆에)
    if (nav && saleLink) {
      const a = document.createElement("a");
      a.href = "#";
      a.dataset.target = "tab-life-craft";
      a.textContent = "제작";
      a.style.marginLeft = "10px";
      saleLink.insertAdjacentElement("afterend", a);
    }
  }

  // ---- UI 삽입 ----
  function ensureMiningUI() {
    injectUIStyleOnce();
    ensureLifeCraftTab();

    const info = $("tab-info");
    const stamina = $("tab-stamina");
    const sale = $("tab-craft");         // 기존: 판매 탭 패널
    const lifeCraft = $("tab-life-craft"); // 신규: 제작 탭 패널

    // ========== 정보탭 ==========
    if (info && !info.dataset.built) {
      info.dataset.built = "1";

      // [수정 2] 정보탭 UI만 해양 정보탭 구조로 변경
      info.innerHTML = `
        <h2 class="content-title">채광 - 정보</h2>

        <div id="info-expert">
          <h3>⛏️ 현재 전문가 세팅 (채광)</h3>

          <div id="info-expert-rod-row">
            <div class="fish-label">곡괭이 스펙</div>
            <input id="mining-pickaxe-lv" type="number" min="1" max="15" placeholder="예) 10">
          </div>

          <div class="fish-row">
            <div class="fish-label">
              럭키 히트 
              <span class="info-btn" onclick="toggleDesc('desc-lucky')">ⓘ</span>
            </div>
            <div class="input-area">
              <input id="mining-expert-lucky" type="number" min="0" max="10" placeholder="LV">
            </div>
          </div>

          <div id="desc-lucky" class="expert-desc">
            LV별로 확률적으로 광석이 추가 드롭돼요. (레벨이 높을수록 확률/추가 개수 증가)
          </div>

          <div class="fish-row">
            <div class="fish-label">
              불붙은 곡괭이 
              <span class="info-btn" onclick="toggleDesc('desc-flame')">ⓘ</span>
            </div>
            <div class="input-area">
              <input id="mining-expert-flame" type="number" min="0" max="10" placeholder="LV">
            </div>
          </div>

          <div id="desc-flame" class="expert-desc">
            채광 시 일정 확률로 광석이 주괴 1개로 제련되어 드롭돼요.
          </div>

          <div class="fish-row">
            <div class="fish-label">
              반짝반짝 눈이 부셔
              <span class="info-btn" onclick="toggleDesc('desc-gem-price')">ⓘ</span>
            </div>
            <div class="input-area">
              <input id="mining-expert-gemprice" type="number" min="0" max="6" placeholder="LV">
            </div>
          </div>

          <div id="desc-gem-price" class="expert-desc">
            보석 판매가가 레벨에 따라 증가해요. (판매탭 계산에 반영됨)
          </div>

          <div id="mining-expert-summary" class="mining-note" style="margin-top:10px;"></div>
        </div>
      `;
    }

    // ========== 스태미나 탭 ==========
    if (stamina && !stamina.dataset.built) {
      stamina.dataset.built = "1";
      stamina.innerHTML = `
        <h2 class="content-title">채광 - 스태미나</h2>

        <div class="mining-card">
          <div class="mining-grid">
            <div>스태미나</div>
            <input id="mining-stamina" class="mining-input" type="number" min="0" placeholder="예) 300">
          </div>

          <div class="mining-grid">
            <div>1회 채광 스태미나</div>
            <input id="mining-stamina-per" class="mining-input" type="number" min="1" placeholder="예) 15" value="15">
          </div>

          <div class="mining-grid">
            <div>기본 광석 드롭(회당)</div>
            <input id="mining-base-ore" class="mining-input" type="number" min="1" placeholder="예) 1" value="1">
          </div>

          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;">
            <button id="mining-run" class="mining-btn">예상 드롭 계산</button>
            <div id="mining-run-note" class="mining-note"></div>
          </div>
        </div>

        <div id="mining-stamina-result" class="mining-card" style="display:none;"></div>

        <div class="mining-card">
          <div class="mining-title">광석 -> 주괴 변환 (광석 16개당 주괴 1개)</div>

          <div class="mining-grid">
            <div>광석 개수</div>
            <input id="mining-ore-count" class="mining-input" type="number" min="0" placeholder="예) 123">
          </div>

          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;">
            <button id="mining-ore-run" class="mining-btn">주괴 계산</button>
            <div id="mining-ore-note" class="mining-note"></div>
          </div>

          <div id="mining-ore-result" style="margin-top:12px;display:none;"></div>
        </div>
      `;
    }

    // ========== 판매 탭(기존 tab-craft를 판매로 사용) ==========
    if (sale && !sale.dataset.built) {
      sale.dataset.built = "1";
      sale.innerHTML = `
        <h2 class="content-title">채광 - 판매</h2>

        <div class="mining-card">
          <div class="mining-title">채광 보석 상점가 계산</div>

          <div class="mining-grid">
            <div>보석 종류</div>
            <select id="mining-gem-type" class="mining-select">
              <option value="gramit">그라밋</option>
              <option value="emerio">에메리오</option>
              <option value="shineflare">샤인플레어</option>
            </select>
          </div>

          <div class="mining-grid">
            <div>판매가 퍼센트(기준 100)</div>
            <input id="mining-gem-extra-percent" class="mining-input" type="number" placeholder="예) 118" value="100">
          </div>

          <div class="mining-grid">
            <div>갯수</div>
            <input id="mining-gem-count" class="mining-input" type="number" min="0" placeholder="예) 10" value="1">
          </div>

          <button id="mining-gem-run" class="mining-btn" style="margin-top:10px;">계산</button>

          <div id="mining-gem-result" style="margin-top:12px;"></div>
        </div>
      `;
    }

    // ========== 제작 탭(라이프 스톤 재료 계산) ==========
    if (lifeCraft && !lifeCraft.dataset.built) {
      lifeCraft.dataset.built = "1";
      lifeCraft.innerHTML = `
        <h2 class="content-title">채광 - 제작</h2>

        <div class="mining-card">
          <div class="mining-title">라이프 스톤 재료 계산</div>

          <div class="mining-grid">
            <div>종류</div>
            <select id="life-stone-type" class="mining-select">
              <option value="low">하급 라이프 스톤</option>
              <option value="mid">중급 라이프 스톤</option>
              <option value="high">상급 라이프 스톤</option>
            </select>
          </div>

          <div class="mining-grid">
            <div>갯수</div>
            <input id="life-stone-count" class="mining-input" type="number" min="0" placeholder="예) 10" value="1">
          </div>

          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;">
            <button id="life-stone-run" class="mining-btn">재료 계산</button>
            <span class="mining-pill">1개당 재료 기준 자동 합산</span>
          </div>

          <div id="life-stone-result" style="margin-top:12px;"></div>
        </div>
      `;
    }
  }

  // ---- 전문가 요약 업데이트 ----
  function updateExpertSummary() {
    const luckyLv = clampInt($("mining-expert-lucky")?.value, 0, 10);
    const flameLv = clampInt($("mining-expert-flame")?.value, 0, 10);
    const ingotLv = clampInt($("mining-expert-ingotprice")?.value, 0, 6);

    const gemLv = getGemPriceLv();

    const lucky = luckyHitTable[luckyLv] || luckyHitTable[0];
    const flameP = flamingPickTable[flameLv] || 0;
    const ingotRate = ingotPriceTable[ingotLv] || 0;
    const gemRate = (gemPriceTableFixed[gemLv] ?? (gemPriceTable[gemLv] || 0));

    const el = $("mining-expert-summary");
    if (!el) return;

    el.textContent =
      `럭키 히트 ${luckyLv}LV(기대 ${Math.round(lucky.p*1000)/10}% × ${lucky.extra}개), ` +
      `불붙은 곡괭이 ${flameLv}LV(${Math.round(flameP*1000)/10}% 확률), ` +
      `주괴 판매가 +${Math.round(ingotRate*100)}%, 보석 판매가 +${Math.round(gemRate*100)}%`;
  }

  // ---- 스태미나 계산 ----
  function runMiningStamina() {
    const stamina = Math.max(0, Number($("mining-stamina")?.value || 0));
    const staminaPer = Math.max(1, Number($("mining-stamina-per")?.value || 15));
    const baseOre = Math.max(1, Number($("mining-base-ore")?.value || 1));

    const actions = Math.floor(stamina / staminaPer);

    const luckyLv = clampInt($("mining-expert-lucky")?.value, 0, 10);
    const flameLv = clampInt($("mining-expert-flame")?.value, 0, 10);

    const lucky = luckyHitTable[luckyLv] || luckyHitTable[0];
    const flameP = flamingPickTable[flameLv] || 0;

    const baseOreTotal = actions * baseOre;
    const luckyExtraExpected = actions * lucky.p * lucky.extra;
    const ingotFromFlameExpected = actions * flameP;

    const oreExpected = Math.round(baseOreTotal + luckyExtraExpected);
    const luckyExpectedRounded = Math.round(luckyExtraExpected);
    const ingotExpectedRounded = Math.round(ingotFromFlameExpected);

    // 추가: 광석 16개 -> 주괴 1개 기준 변환 결과
    const ingotFromOre = Math.floor(oreExpected / 16);
    const oreRemainder = oreExpected % 16;

    const result = $("mining-stamina-result");
    if (!result) return;

    result.style.display = "block";
    result.innerHTML = `
      <div class="mining-title">예상 결과</div>

      <div class="mining-result-grid">
        <div class="mining-box">
          <div class="mining-k">채광 횟수</div>
          <div class="mining-v">${formatNumber(actions)}회</div>
        </div>

        <div class="mining-box">
          <div class="mining-k">광석(기대)</div>
          <div class="mining-v">${formatNumber(oreExpected)}개</div>
          <div class="mining-k" style="margin-top:6px;">(럭키 히트 기여 약 ${formatNumber(luckyExpectedRounded)}개)</div>
        </div>

        <div class="mining-box">
          <div class="mining-k">광석→주괴(16:1)</div>
          <div class="mining-v">${formatNumber(ingotFromOre)}개</div>
          <div class="mining-k" style="margin-top:6px;">남는 광석 ${formatNumber(oreRemainder)}개</div>
        </div>

        <div class="mining-box">
          <div class="mining-k">주괴(제련 드롭 기대)</div>
          <div class="mining-v">${formatNumber(ingotExpectedRounded)}개</div>
          <div class="mining-k" style="margin-top:6px;">(불붙은 곡괭이 기대값)</div>
        </div>
      </div>
    `;
  }

  // ---- 스태미나 탭 추가: 광석 -> 주괴(16:1) ----
  function runOreToIngotCalc() {
    const ore = Math.max(0, Math.floor(Number($("mining-ore-count")?.value || 0)));
    const ingot = Math.floor(ore / 16);
    const remainder = ore % 16;

    const box = $("mining-ore-result");
    if (!box) return;

    box.style.display = "block";
    box.innerHTML = `
      <div class="mining-result-grid">
        <div class="mining-box">
          <div class="mining-k">주괴</div>
          <div class="mining-v">${formatNumber(ingot)}개</div>
        </div>
        <div class="mining-box">
          <div class="mining-k">남는 광석</div>
          <div class="mining-v">${formatNumber(remainder)}개</div>
        </div>
      </div>
    `;
  }

  // ---- 판매탭: 보석 상점가 계산 ----
  // 입력값 118 => 118% (1.18배)로 계산
  // 여기에 반짝반짝 눈이 부셔(보석 판매가) 레벨을 곱해서 최종 퍼센트 적용
  function runGemShopCalc() {
    const type = $("mining-gem-type")?.value || "gramit";
    const base = gemShopPrice[type] || 0;

    const percentRaw = Number($("mining-gem-extra-percent")?.value || 100);
    const percent = Number.isFinite(percentRaw) ? percentRaw : 100;

    const count = clampInt($("mining-gem-count")?.value, 0, 1000000);

    const gemLv = getGemPriceLv();
    const gemRate = (gemPriceTableFixed[gemLv] ?? (gemPriceTable[gemLv] || 0));
    const finalPercent = percent * (1 + gemRate);

    const unit = Math.round(base * (finalPercent / 100));
    const total = unit * count;

    const el = $("mining-gem-result");
    if (!el) return;

    el.innerHTML = `
      <div class="mining-result-grid">
        <div class="mining-box">
          <div class="mining-k">선택 보석</div>
          <div class="mining-v" style="font-size:20px">${gemNameMap[type] || "보석"}</div>
          <div class="mining-k" style="margin-top:6px">상점가 ${formatNumber(base)}골드</div>
        </div>

        <div class="mining-box">
          <div class="mining-k">보정 후 개당</div>
          <div class="mining-v" style="font-size:20px">${formatNumber(unit)}골드</div>
          <div class="mining-k" style="margin-top:6px">(${finalPercent.toFixed(1)}%)</div>
        </div>

        <div class="mining-box" style="grid-column:1 / -1;">
          <div class="mining-k">총 판매가</div>
          <div class="mining-v">${formatNumber(total)}골드</div>
          <div class="mining-k" style="margin-top:6px">갯수 ${formatNumber(count)}개</div>
        </div>
      </div>
    `;
  }

  // ---- 제작탭: 라이프 스톤 재료 계산 ----
  function runLifeStoneCalc() {
    const type = $("life-stone-type")?.value || "low";
    const count = clampInt($("life-stone-count")?.value, 0, 1000000);

    const recipe = lifeStoneRecipes[type] || lifeStoneRecipes.low;
    const perOne = recipe.perOne || {};

    // [추가] 1세트=64개 기준으로 (몇 세트 + 몇 개) 표시 문자열 생성
    const rows = Object.keys(perOne).map((mat) => {
      const per = Number(perOne[mat] || 0);
      const total = per * count;

      const set = Math.floor(total / 64);
      const rest = total % 64;

      let setText = "";
      if (set > 0 && rest > 0) {
        setText = ` (${set}세트 + ${rest}개)`;
      } else if (set > 0) {
        setText = ` (${set}세트)`;
      } else {
        setText = ` (${rest}개)`;
      }

      return { mat, per, total, setText };
    });

    const el = $("life-stone-result");
    if (!el) return;

    if (count === 0) {
      el.innerHTML = `<div class="mining-note">갯수를 1 이상으로 입력하면 재료가 계산돼요.</div>`;
      return;
    }

    const tableRows = rows.map(r => `
      <tr>
        <td>${r.mat}</td>
        <td class="mining-td-right">${formatNumber(r.per)}</td>
        <td class="mining-td-right">${formatNumber(r.total)}${r.setText}</td>
      </tr>
    `).join("");

    el.innerHTML = `
      <div class="mining-box" style="margin-bottom:10px;">
        <div class="mining-k">선택</div>
        <div class="mining-v" style="font-size:20px">${recipe.name}</div>
        <div class="mining-k" style="margin-top:6px;">갯수 ${formatNumber(count)}개 기준</div>
      </div>

      <table class="mining-table">
        <thead>
          <tr>
            <th>재료</th>
            <th class="mining-td-right">1개당</th>
            <th class="mining-td-right">총 필요</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }

  // ---- 이벤트 바인딩 ----
  function bindMiningEvents() {
    const runBtn = $("mining-run");
    if (runBtn && !runBtn.dataset.bound) {
      runBtn.dataset.bound = "1";
      runBtn.addEventListener("click", runMiningStamina);
    }

    const oreBtn = $("mining-ore-run");
    if (oreBtn && !oreBtn.dataset.bound) {
      oreBtn.dataset.bound = "1";
      oreBtn.addEventListener("click", runOreToIngotCalc);
    }

    const oreInput = $("mining-ore-count");
    if (oreInput && !oreInput.dataset.boundAuto) {
      oreInput.dataset.boundAuto = "1";
      oreInput.addEventListener("input", runOreToIngotCalc);
      oreInput.addEventListener("change", runOreToIngotCalc);
    }

    const gemBtn = $("mining-gem-run");
    if (gemBtn && !gemBtn.dataset.bound) {
      gemBtn.dataset.bound = "1";
      gemBtn.addEventListener("click", runGemShopCalc);
    }

    // 판매탭 자동 계산
    ["mining-gem-type", "mining-gem-extra-percent", "mining-gem-count"].forEach(id => {
      const el = $(id);
      if (!el || el.dataset.boundAuto) return;
      el.dataset.boundAuto = "1";
      el.addEventListener("change", runGemShopCalc);
      el.addEventListener("input", runGemShopCalc);
    });

    // 제작(라이프 스톤) 계산
    const lifeBtn = $("life-stone-run");
    if (lifeBtn && !lifeBtn.dataset.bound) {
      lifeBtn.dataset.bound = "1";
      lifeBtn.addEventListener("click", runLifeStoneCalc);
    }
    ["life-stone-type", "life-stone-count"].forEach(id => {
      const el = $(id);
      if (!el || el.dataset.boundAuto) return;
      el.dataset.boundAuto = "1";
      el.addEventListener("change", runLifeStoneCalc);
      el.addEventListener("input", runLifeStoneCalc);
    });

    // 전문가 입력 변화 시 요약 갱신
    ["mining-expert-lucky","mining-expert-flame","mining-expert-ingotprice","mining-expert-gemprice"]
      .forEach(id => {
        const el = $(id);
        if (!el || el.dataset.bound) return;
        el.dataset.bound = "1";
        el.addEventListener("input", () => {
          updateExpertSummary();
          runGemShopCalc();
        });
      });

    updateExpertSummary();
    if ($("mining-gem-result")) runGemShopCalc();
    if ($("mining-ore-result") && $("mining-ore-count") && $("mining-ore-count").value !== "") runOreToIngotCalc();
    if ($("life-stone-result")) runLifeStoneCalc();
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureMiningUI();
    bindMiningEvents();

    // 탭 전환 시에도 혹시 DOM이 다시 생기는 구조면 재바인딩
    document.querySelectorAll(".sub-header-inner a[data-target]").forEach(tab => {
      if (tab.dataset.boundMiningTab) return;
      tab.dataset.boundMiningTab = "1";
      tab.addEventListener("click", () => {
        setTimeout(() => {
          ensureMiningUI();
          bindMiningEvents();
        }, 0);
      });
    });
  });
})();
