const getYear = () => new Date().getFullYear().toString();


const CONSTANTS = {
  SUPPORTED_FILE_TYPES: [".html", ".css", ".js", ".json"],
  CSS_VARIABLES: `
[data-bs-theme="light"] {
  --theme-bg: #ffffff;
  --theme-text: #212529;
  --theme-surface: #f8f9fa;
  --color-font-body: #000000;
  --color-background-body: #ffffff;
  --black-theme: #212529;
  --color-primary: var(--base1-light);
  --color-secundary: var(--base2-light);
  --color-inter1: var(--intermediaria1-light);
  --color-inter2: var(--intermediaria2-light);
  --color-inter3: var(--intermediaria3-light);
  --color-inter1-bg: var(--intermediaria1-background-light);
  --color-inter2-bg: var(--intermediaria2-background-light);
  --color-inter3-bg: var(--intermediaria3-background-light);
}

[data-bs-theme="dark"] {
--theme-bg: #212529;
--theme-text: #ffffff;
--theme-surface: #2c3035;
--color-font-body: var(--white);
--black-theme: #212529;
--color-background-body: #212529;
--color-font-body: var(--white);
--gray-100: #2c3035;
--color-grays-100: #2c3035;  /* Era #f8f9fa - mais escuro no escuro */
--gray-200: #3a3f45;  /* Era #ebebeb - mais escuro no escuro */
--color-grays-200: #3a3f45;  /* Era #ebebeb - mais escuro no escuro */
--gray-300: #4b5158;  /* Era #dee2e6 - mais escuro no escuro */
--color-grays-300: #4b5158;  /* Era #dee2e6 - mais escuro no escuro */
--gray-400: #64748b;  /* Era #ced4d4 - mais escuro no escuro */
--color-grays-400: #64748b;  /* Era #ced4d4 - mais escuro no escuro */
--gray-500: #94a3b8;  /* Era #adb4bd - ajuste proporcional */
--color-grays-500: #94a3b8;  /* Era #adb4bd - ajuste proporcional */
--gray-600: #cbd5e1;  /* Era #888888 - agora texto legível */
--color-grays-600: #cbd5e1;  /* Era #888888 - agora texto legível */
--gray-700: #dddddd;  /* Era #444444 - agora texto legível */
--color-grays-700: #dddddd;  /* Era #444444 - agora texto legível */
--gray-800: #e5e7eb;  /* Era #303030 - agora texto legível */
--color-grays-800: #e5e7eb;  /* Era #303030 - agora texto legível */
--gray-900: #f3f4f6;  /* Era #222222 - agora texto legível */
--color-grays-900: #f3f4f6;  /* Era #222222 - agora texto legível */
--link-normal: #3b82f6; /* azul claro */
--link-hover: #60a5fa;  /* azul mais claro */
--link-visited: #a78bfa; /* roxo claro */
--link-focus: #38bdf8;  /* azul claro */
    --color-primary: var(--base1-dark);
  --color-secundary: var(--base2-dark);
--color-inter1: var(--intermediaria1-dark);
  --color-inter2: var(--intermediaria2-dark);
  --color-inter3: var(--intermediaria3-dark);
  --color-inter1-bg: var(--intermediaria1-background-dark);
  --color-inter2-bg: var(--intermediaria2-background-dark);
  --color-inter3-bg: var(--intermediaria3-background-dark);
}`,
  EMPTY_PREVIEW: `<div style="display: flex; align-items: center; justify-content: center; height: 100%; "><svg  width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></div>`,
  YEAR: getYear(),
};

export default CONSTANTS;
