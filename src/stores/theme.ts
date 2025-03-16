import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

const getInitialTheme = () => {
  if (!isBrowser) return 'light'; 
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) return storedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const theme = writable(getInitialTheme());

if (isBrowser) {
  theme.subscribe(value => {
    localStorage.setItem('theme', value);
    document.documentElement.classList.toggle('dark', value === 'dark');
  });
}
