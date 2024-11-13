import request from '@/utils/request'

export const getAiAnswer = (msg: string) => {
  return request.get('/chat/sse', {
    params: {
      question: msg
    }
  })
}
