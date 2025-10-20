// FOUC 방지: 페이지 로드 전에 테마 설정
(function() {
  try {
    const stored = localStorage.getItem('boston-theme-mode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = stored || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.add(mode);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.add('light');
  }
})();
