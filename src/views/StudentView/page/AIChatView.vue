<script setup>
import ChatSidebar from '@/views/AIChat/ChatSidebar.vue'
</script>

<template>
  <div class="ai-chat-container">
    <ChatSidebar />
    <div class="chat-main">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-chat-container {
  display: flex;
  height: 100%;
  
  .chat-main {
    flex: 1;
    overflow: hidden;
    background-color: #fff;
  }
}
</style>
