<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';


const currentTime = ref(new Date());
let timer = ref(null);

onMounted(() => {
  timer.value = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});

</script>

<template>
  <div>
    <h1> {{ currentTime  }}</h1>
  </div>
   
</template>