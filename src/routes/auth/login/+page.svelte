<script lang="ts">

	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	import { showToast } from '../../../stores/toast';
	
	import Input from '../../../ui/Input.svelte';

	let { form }: { form: ActionData } = $props();
	
	$effect(() => {
		if (form?.errorMsg) {
			showToast(form.errorMsg);
		}
	});


</script>

<div class="min-h-screen flex items-center justify-center">
	
	<div class="grid grid-cols-2 rounded-lg 
		shadow-2xl w-[912px] h-[520px] border border-gray-300">		
		<div class="bg-primary p-4 rounded-l-lg">
			<h1 class="font-main text-6xl mt-24 font-semibold">Welcome to
				<span class="text-7xl font-bold"> A1 Portal </span>
			</h1>			
		</div>

		<div class="p-4">
			<h2 class="font-main text-4xl font-bold text-center mt-24 tracking-wide">
				Login
			</h2>
  
			<form 
				method="post" 
				action="?/login" 
				use:enhance 
				class="space-y-4 mt-4">
				
				<Input
					type="text"
					label="Login ID"
					name="loginID"
					placeholder="0011"
					required={true}
					error={form?.idError ?? ''}
				/>
				<Input
					type= "password"
					name="password"
					label= "Password"
					placeholder= "*****"
					required={true}
					canAutoComplete={false}
					error={form?.passError ?? ''}
				/>						
				<button
					type="submit"
					class="w-full bg-blue-600 text-white py-2
					 rounded-md hover:bg-blue-700 transition"
				>
					Login
				</button>
			</form>


		</div>
	 
		
	</div>
</div>
  

