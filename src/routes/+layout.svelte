<script lang="ts">
	// import ThemeToggle from "../ui/ThemeToggle.svelte";
	// <ThemeToggle />

	import '../app.css';
	import Sidebar from "../ui/Sidebar.svelte";
	import Toast from '../ui/Toast.svelte';
	
	let { children, data } = $props();
	
	console.log(data)
</script>

<Toast />

<main class="bg-background dark:bg-background-dark 
	text-font-light dark:text-font-dark transition
	delay-150 font-main flex w-full h-full">
	
	{#if data.user}
		<div class="flex px-4 gap-4 w-full ">
			<Sidebar />
			<div class="min-h-screen bg-white rounded-md w-full">
				{@render children()}
			</div>
		</div>
	{:else}
		<div class="w-full">
			{@render children()}
		</div>
	{/if}

</main>
