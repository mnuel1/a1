<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import { PieChart, ChoroplethChart, AreaChart } from '@carbon/charts-svelte';
	import '@carbon/charts-svelte/styles.css';

	import pieData from './pieData';
	import pieOption from './pieOption';
	import geoData from './geoData'
	import geoOption from './geoOption';
	import areaData from './areaData';
	import areaOption from './areaOption';
	
	let { data }: { data: PageServerData } = $props();

</script>

<div class="flex h-full w-full ">
	<main class="flex-1 p-6">
		<h2 class="text-2xl font-bold">Dashboard</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
			<div class="bg-white p-6 rounded-lg shadow-md">
				<h3 class="text-lg font-semibold">Statistics</h3>
				<p class="text-3xl font-bold">1,240</p>
			</div>
			<div class="bg-white p-6 rounded-lg shadow-md">
				<h3 class="text-lg font-semibold">Statistics</h3>
				<p class="text-3xl font-bold">$45,000</p>
			</div>
			<div class="bg-white p-6 rounded-lg shadow-md">
				<h3 class="text-lg font-semibold">Statistics</h3>
				<p class="text-3xl font-bold">320</p>
			</div>
			<div class="bg-white p-6 rounded-lg shadow-md">
				<h3 class="text-lg font-semibold">Statistics</h3>
				<p class="text-3xl font-bold">320</p>
			</div>
		</div>

		<!-- Graph Section -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
			<!-- Pie Chart -->
			<div class="bg-white p-6 rounded-lg shadow-md">
				<PieChart data={pieData} options={pieOption} />
			</div>

			<!-- <div class="bg-white p-6 rounded-lg shadow-md">
				<ChoroplethChart data={geoData} options={geoOption}/>
			</div> -->

		</div>

		<div class="mt-6 bg-white p-6 rounded-lg shadow-md">
			<!-- <AreaChart data={areaData} options={areaOption}/> -->
		</div>
	</main>
</div>
