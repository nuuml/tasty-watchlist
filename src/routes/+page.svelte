<script lang="ts">
    import { Button } from '$lib/components/index'
    import { session } from '$lib/stores/index'
</script>

<Button on:click={async () => {await session.logout()}}>
    Logout
</Button>