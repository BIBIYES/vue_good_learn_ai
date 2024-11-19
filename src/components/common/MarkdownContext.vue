<script setup>
import '@/assets/css/github-markdown.css'
import { marked } from 'marked';
const renderMarkdown = (content) => {
    return marked(content)
}

const props = defineProps({
  content: String
})
</script>
<template>
     <div class="article-content markdown-body" v-html="renderMarkdown(content)"></div>
</template>
<style scoped>
@import 'github-markdown-css/github-markdown.css';
div{
    width: 100%;
    border-radius: 10px;
    padding: 10px;
}

</style>