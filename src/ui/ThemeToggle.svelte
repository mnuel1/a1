<script>
  import { onMount } from "svelte";

  let isDark = false;

  // Check local storage for theme preference
  onMount(() => {
    isDark = localStorage.getItem("theme") === "dark";
    updateTheme();
  });

  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateTheme();
  }

  function updateTheme() {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
</script>

<button on:click={toggleTheme} class="p-2 border rounded">
  {isDark ? "Light Mode" : "Dark Mode"}
</button>
