/* =========================
   메인 탭 활성화 (페이지 기준)
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = location.pathname.split("/").pop();

  document.querySelectorAll(".main-nav a").forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});


/* =========================
   하위 탭 전환
   ========================= */
document.querySelectorAll(".sub-header-inner a").forEach(tab => {
  tab.addEventListener("click", e => {
    e.preventDefault();

    // 탭 active 처리
    document.querySelectorAll(".sub-header-inner a")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    // 콘텐츠 전환
    const targetId = tab.dataset.target;
    if (!targetId) return;

    document.querySelectorAll(".tab-content")
      .forEach(c => c.style.display = "none");

    const target = document.getElementById(targetId);
    if (target) target.style.display = "block";
  });
});

