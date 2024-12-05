import { ref } from 'vue'

export class FastGPT {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.isLoading = ref(false);
    this.error = ref(null);
    this.results = ref([]);
  }

  async sendQuestion({ chatId, variables, messages, onData }) {
    this.isLoading.value = true;
    this.error.value = null;
    this.results.value = [];

    const data = {
      chatId: chatId || 'abcd',
      stream: true,
      detail: false,
      variables: variables || {},
      messages: messages || []
    };

    try {
      const response = await fetch('https://cloud.fastgpt.cn/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let lines = buffer.split('\n');
        buffer = lines.pop();

        for (let line of lines) {
          line = line.trim();
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (dataStr === '[DONE]') {
              console.log('Stream complete');
              this.isLoading.value = false;
              return;
            }
            try {
              const json = JSON.parse(dataStr);
              this.results.value.push(json);
              if (typeof onData === 'function') {
                onData(json);
              }
            } catch (err) {
              console.error('JSON parse error:', err);
            }
          }
        }
      }
    } catch (err) {
      this.error.value = err;
      console.error('Fetch error:', err);
      throw err;
    } finally {
      this.isLoading.value = false;
    }
  }
}