import { ref } from 'vue'

/**
 * FastGPT 类用于与 FastGPT API 进行交互。
 */
export class FastGPT {
  /**
   * 构造函数，初始化 FastGPT 实例。
   * @param {string} apiKey - 必填，FastGPT API 的密钥。
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.isLoading = ref(false); // 是否正在加载
    this.error = ref(null); // 错误信息
    this.results = ref([]); // 结果数据
  }

  /**
   * 发送问题到 FastGPT API。
   * @param {Object} params - 请求参数。
   * @param {string} [params.chatId] - 聊天会话 ID，默认值为 'abcd'。
   * @param {Object} [params.variables] - 变量对象，默认为空对象。
   * @param {Array} [params.messages] - 消息数组，默认为空数组。
   * @param {Function} [onData] - 接收到数据时的回调函数。
   */
  async sendQuestion({ chatId, variables, messages, onData }) {
    this.isLoading.value = true; // 设置加载状态
    this.error.value = null; // 清除错误信息
    this.results.value = []; // 清除结果数据

    const data = {
      chatId: chatId || 'abcd', // 聊天会话 ID
      stream: true, // 是否启用流式响应
      detail: false, // 是否返回详细信息
      variables: variables || {}, // 变量对象
      messages: messages || [] // 消息数组
    };

    try {
      const response = await fetch('https://cloud.fastgpt.cn/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`, // 认证头
          'Content-Type': 'application/json' // 内容类型
        },
        body: JSON.stringify(data) // 请求体
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // 处理 HTTP 错误
      }

      const reader = response.body.getReader(); // 获取读取器
      const decoder = new TextDecoder('utf-8'); // 创建解码器
      let buffer = ''; // 缓冲区

      while (true) {
        const { value, done } = await reader.read(); // 读取数据
        if (done) break; // 如果读取完成，退出循环
        buffer += decoder.decode(value, { stream: true }); // 解码并追加到缓冲区

        let lines = buffer.split('\n'); // 按行分割
        buffer = lines.pop(); // 移除最后一行（可能不完整）

        for (let line of lines) {
          line = line.trim(); // 去除空格
          if (line.startsWith('data:')) { // 检查是否为数据行
            const dataStr = line.slice(5).trim(); // 获取数据部分
            if (dataStr === '[DONE]') {
              console.log('Stream complete'); // 流式响应完成
              this.isLoading.value = false; // 设置加载状态为 false
              return; // 返回
            }
            try {
              const json = JSON.parse(dataStr); // 解析 JSON 数据
              this.results.value.push(json); // 将结果添加到 results 中
              if (typeof onData === 'function') {
                onData(json); // 调用回调函数
              }
            } catch (err) {
              console.error('JSON parse error:', err); // 处理解析错误
            }
          }
        }
      }
    } catch (err) {
      this.error.value = err; // 设置错误信息
      console.error('Fetch error:', err); // 打印错误信息
      throw err; // 抛出错误
    } finally {
      this.isLoading.value = false; // 最终设置加载状态为 false
    }
  }
}