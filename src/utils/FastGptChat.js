export function fastgpt() {
  const isLoading = ref(false);
  const error = ref(null);
  const results = ref([]);

  const sendQuestion = async ({ chatId, variables, messages, onData }) => {
    isLoading.value = true;
    error.value = null;
    results.value = [];

    const data = {
      chatId: chatId || 'abcd',
      stream: true,
      detail: false,
      variables: variables || {},
      messages: messages || []
    };
// 云端
// https://cloud.fastgpt.cn/api/v1/chat/completions
// fastgpt-sw5swebtIUyUCmolJNRSoRctihOs2seMGBXOyyxlTEyFnYQXKYSqjqA2
// http://192.168.8.12:3000/api
// fastgpt-ufVDN83n4QafImX04ARiWL1frTqy2eWRraaOtsr7MRhQwkqwsWrkXbCHrQzlqTNl
    try {
      const response = await fetch('https://cloud.fastgpt.cn/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer fastgpt-sw5swebtIUyUCmolJNRSoRctihOs2seMGBXOyyxlTEyFnYQXKYSqjqA2', // Replace with your API key
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
        buffer = lines.pop(); // Retain incomplete line

        for (let line of lines) {
          line = line.trim();
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (dataStr === '[DONE]') {
              console.log('Stream complete');
              isLoading.value = false;
              return;
            }
            try {
              const json = JSON.parse(dataStr);
              results.value.push(json);
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
      error.value = err;
      console.error('Fetch error:', err);
    } finally {
      isLoading.value = false;
    }
  };
  return {
    isLoading,
    error,
    results,
    sendQuestion
  };
}

