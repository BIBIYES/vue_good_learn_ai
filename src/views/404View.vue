<template>
  <div class="container">
    <img src="@/assets/img/404.png" alt="404 Not Found" />
    <h1>拒绝你访问</h1>
    <p>你的账号权限不支持你访问到这个页面~</p>
    <p><router-link to="/">返回首页</router-link></p>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.container {
  font-family: 'Montserrat', Arial, sans-serif;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #555;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  max-width: 100%;
  padding: 20px;
}

h1 {
  margin-top: 0;
  font-size: 60px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

p {
  font-size: 20px;
  margin-bottom: 30px;
  color: #777;
}

a {
  color: #666;
  text-decoration: none;
  border: 2px solid #666;
  padding: 12px 24px;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-size: 18px;
}

a:hover {
  background-color: #666;
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(102, 102, 102, 0.4);
}

img {
  max-width: 15%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 40px;
}
</style>
