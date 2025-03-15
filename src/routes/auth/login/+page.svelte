<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-lg w-96">
	  <h2 class="text-2xl font-bold text-center">Login</h2>
  

	  <form method="post" action="?/login" use:enhance class="space-y-4 mt-4">
			<div>
				<label for="id" class="block text-sm font-medium">Login ID</label>
				<input
					id="id"
					type="text"
					class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
					required
				/>
			</div>
  
			<div>
				<label for="password" class="block text-sm font-medium">Password</label>
				<input
					id="password"
					type="password"
					class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
					required
				/>
			</div>
		
			<button
				type="submit"
				class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
			>
				Login
			</button>
	  </form>
	  
		<p style="color: red">{form?.message ?? ''}</p>
	</div>
</div>
  

