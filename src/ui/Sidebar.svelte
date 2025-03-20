<script>
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Home, User, Menu, LogOut, FileSpreadsheet } from '@lucide/svelte';

	// Sidebar state (expanded or collapsed)
	let isExpanded = writable(true);

	import { page } from '$app/stores';

	$: currentPath.set($page.url.pathname);

	// Navigation links array
	const navLinks = [
		{ name: 'Dashboard', href: '/dashboard', icon: Home },
		{ name: 'Manifest', href: '/manifest', icon: FileSpreadsheet },
		{ name: 'Profile', href: '#', icon: User }
	];
	let currentPath = writable('');

	onMount(() => {
		currentPath.update(() => window.location.pathname);
	});
</script>

<div class="flex h-full">
	<aside
		class="h-full rounded-lg border-r border-gray-200
        bg-[white] p-2 shadow-xl
        transition-all duration-300 dark:border-gray-700 dark:bg-gray-900"
		class:!w-[60px]={!$isExpanded}
		class:!w-[250px]={$isExpanded}
	>
		<div class="flex items-center justify-between p-4" class:justify-center={!$isExpanded}>
			{#if $isExpanded}
				<span class="text-lg font-semibold">A<span class="text-primary">1</span> Global</span>
			{/if}
			<button class="hover:bg-primary hover:text-font-dark rounded-lg p-2" on:click={toggleSidebar}>
				<Menu size={20} />
			</button>
		</div>

		<nav class="mt-5 flex flex-col gap-2">
			{#each navLinks as link}
				<a
					href={link.href}
					class="hover:bg-primary hover:text-font-dark flex items-center gap-3 rounded-lg p-3 transition-all duration-300"
					class:justify-center={!$isExpanded}
					class:bg-primary={$currentPath === link.href}
					class:text-font-dark={$currentPath === link.href}
				>
					<svelte:component this={link.icon} size={20} />

					{#if $isExpanded}
						<span class="text-sm font-medium transition-opacity">{link.name}</span>
					{/if}
				</a>
			{/each}

			<form method="POST" action="/auth/logout" class="inline">
				<button
					type="submit"
					class="hover:bg-primary hover:text-font-dark flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-300"
					class:justify-center={!$isExpanded}
				>
					<LogOut size={20} />
					{#if $isExpanded}
						<span class="text-sm font-medium transition-opacity">Log out</span>
					{/if}
				</button>
			</form>
		</nav>
	</aside>
</div>
