<script lang="ts">
	// import ThemeToggle from "../ui/ThemeToggle.svelte";
	// <ThemeToggle />

	import '../app.css';
	import Sidebar from "../ui/Sidebar.svelte";
	import Toast from '../ui/Toast.svelte';
	
	let { children, data } = $props();
	
</script>

<Toast />

<main class="bg-background dark:bg-background-dark 
	text-font-light dark:text-font-dark transition
	delay-150 font-main">
	
	{#if data}
		<div class="flex">
			<Sidebar />
			{@render children()}
		</div>
	{:else}
		<!-- Show a loading spinner or message if data is unavailable -->
		<div class="flex justify-center items-center h-screen">
			<p class="text-gray-500 text-lg">Loading...</p>
		</div>
	{/if}

</main>
