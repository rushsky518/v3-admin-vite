<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import Admin from "./components/Admin.vue"
import Editor from "./components/Editor.vue"
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';

const userStore = useUserStore()
const isAdmin = userStore.roles.includes("admin")


// 创建一个响应式的当前时间变量
const currentTime = ref<Date>(new Date());
// 定义一个每秒更新时间的定时器
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
// 每秒钟更新一次时间
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer!);
});


</script>

<template>
  <div>
    <h1>
      实时时间：{{ currentTime }}
    </h1>
  </div>
  <component :is="isAdmin ? Admin : Editor" />
</template>
