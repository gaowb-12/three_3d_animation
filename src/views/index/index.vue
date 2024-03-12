
<script setup lang="ts">
    import { Engine } from '@/utils/engine';
    import { onMounted, ref } from 'vue'
    const canvas = ref<HTMLElement>();
    onMounted(()=>{
        init()
    })
    function init(){
        let engine = new Engine(canvas.value as HTMLElement);
    }
</script>

<template>
    <div ref="canvas" id="canvas"></div>
</template>