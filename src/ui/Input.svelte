<script lang="ts">
  export let type: string = "text";
  export let name: string = "";
  export let label: string = "";
  export let value: string = "";
  export let placeholder: string = "";
  export let required: boolean = false;
  export let error: string = "";
  export let canAutoComplete: boolean = false
</script>

<div class="w-full">
  {#if label}
    <label for="" class="block text-md font-medium mb-2">{label}</label>
  {/if}

  <input
    type={type}
    name={name}
    bind:value
    placeholder={placeholder}
    required={required}
    autocomplete={canAutoComplete ? "on" : "off"}
    class="w-full px-3 py-2 border rounded-lg 
			focus:outline-none focus:ring-red-300 focus:border-0"
  />

  {#if error}
    <p class="text-red-600 text-sm mt-1">{error}.</p>
  {/if}
</div>
