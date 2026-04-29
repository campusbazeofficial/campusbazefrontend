import { ref, watch, onMounted } from "vue";

const theme = ref("dark");
const isLoading = ref(true);

// ✅ Run immediately when the module loads, not on mount
const initTheme = () => {
  const stored = localStorage.getItem("theme-preference");

  if (stored) {
    theme.value = stored;
  } else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    theme.value = "light";
  } else {
    theme.value = "dark";
  }

  // data-theme is already set by the inline script, but sync the ref
  // Don't call applyTheme() here — no need to write to DOM again
  isLoading.value = false;
};

initTheme(); // ← runs when the module is first imported

export function useTheme() {
  const applyTheme = () => {
    document.documentElement.setAttribute("data-theme", theme.value);
    localStorage.setItem("theme-preference", theme.value);
  };

  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };

  const setTheme = (newTheme) => {
    if (["light", "dark"].includes(newTheme)) {
      theme.value = newTheme;
    }
  };

  watch(theme, () => {
    applyTheme();
  });

  onMounted(() => {
    // Only set up the system listener here, don't re-init theme
    setupSystemThemeListener();
  });

  const setupSystemThemeListener = () => {
    if (!window.matchMedia) return;
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme-preference")) {
        theme.value = e.matches ? "dark" : "light";
      }
    };
    darkModeQuery.addEventListener("change", handleChange);
    return () => darkModeQuery.removeEventListener("change", handleChange);
  };

  return {
    theme,
    isLoading,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === "dark",
    isLight: () => theme.value === "light",
  };
}