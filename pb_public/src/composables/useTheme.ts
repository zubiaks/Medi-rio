import { computed, ref } from "vue";

type Theme = "dark" | "light";
const saved = localStorage.getItem("media-vault-theme");
const theme = ref<Theme>(saved === "light" ? "light" : "dark");

function applyTheme() {
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem("media-vault-theme", theme.value);
}

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    applyTheme();
  }

  applyTheme();

  return {
    theme: computed(() => theme.value),
    themeIcon: computed(() => theme.value === "dark" ? "☀" : "◐"),
    toggleTheme,
  };
}
