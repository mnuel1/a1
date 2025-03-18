<script>
    import { writable } from "svelte/store";
    import { onMount } from 'svelte';
    import { Home, User, Menu, LogOut, FileSpreadsheet } from "@lucide/svelte";

    // Sidebar state (expanded or collapsed)
    let isExpanded = writable(true);

    // Toggle Sidebar
    const toggleSidebar = () => {
        isExpanded.update(val => !val);
    };

    // Navigation links array
    const navLinks = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Manifest", href: "/manifest", icon: FileSpreadsheet },
        { name: "Profile", href: "#", icon: User },        
    ];

    // Store the current path
    let currentPath = writable("");

    // Set currentPath on mount
    onMount(() => {
        currentPath.set(window.location.pathname);
    });
</script>

<div class="flex h-full">
    <aside 
        class="h-full bg-[white] dark:bg-gray-900 border-r 
        border-gray-200 dark:border-gray-700 transition-all 
        duration-300 shadow-xl p-2 rounded-lg"
        class:!w-[60px]={!$isExpanded}
        class:!w-[250px]={$isExpanded}>


        <div 
            class="flex items-center justify-between p-4"
            class:justify-center={!$isExpanded}>
            {#if $isExpanded}
                <span class="text-lg font-semibold">A<span class="text-primary">1</span> Global</span>
            {/if}
            <button class="p-2 rounded-lg hover:bg-primary hover:text-font-dark" on:click={toggleSidebar}>
                <Menu size={20} />
            </button>
        </div>


        <nav class="mt-5 flex flex-col gap-2">
            {#each navLinks as link}
                <a 
                    href={link.href} 
                    class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary hover:text-font-dark"
                    class:justify-center={!$isExpanded}
                    class:bg-primary={$currentPath === link.href}
                    class:text-font-dark={$currentPath === link.href}>
                    
                    <svelte:component this={link.icon} size={20} />
                    
                    {#if $isExpanded}
                        <span class="text-sm font-medium transition-opacity">{link.name}</span>
                    {/if}
                </a>                
            {/each}
            <form method="POST" action="/auth/logout" class="inline">
                <button 
                    type="submit" 
                    class="flex w-full cursor-pointer items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary hover:text-font-dark"
                    class:justify-center={!$isExpanded}>
                    <LogOut size={20}/>
                    {#if $isExpanded}
                        <span class="text-sm font-medium transition-opacity">Log out</span>
                    {/if}
                </button>
            </form>

        </nav>
    </aside>
</div>
