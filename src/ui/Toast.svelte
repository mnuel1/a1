<script lang="ts">
import { toasts } from '../stores/toast';
	import { onMount } from 'svelte';

	let allToasts:any = [];
	toasts.subscribe((t) => (allToasts = t));

	onMount(() => {
		toasts.set([]);
	});
</script>

{#if allToasts.length > 0}
	<div class="toast-container">
		{#each [...allToasts].reverse() as toast (toast.id)}
			<div class="toast {toast.type}">
				{toast.message}
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: 5%;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		gap: 10px;
		z-index: 1000;
		max-height: 80vh;
		overflow-y: none;
	}

	.toast {
		padding: 14px 20px;
		border-radius: 8px;
		color: white;
		font-weight: bold;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
		opacity: 1;
		animation: fadeInOut 3s ease-in-out forwards;
	}

	.success { background: #4CAF50; }
	.error { background: #f44336; }
	.info { background: #2196F3; }
	.warning { background: #ff9800; }
  
	@keyframes fadeInOut {
		0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
		10% { opacity: 1; transform: translateY(0) scale(1); }
		90% { opacity: 1; transform: translateY(0) scale(1); }
		100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
	}
</style>