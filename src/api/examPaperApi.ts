import request from '@/utils/request'

// 删除试卷
export function deleteExamPaperById(examPaperId: number) {
  return request.delete(`/exam-papers/${examPaperId}`) // DELETE 请求用于删除试卷
}

// 获取试卷详情
export function selectExamPaperById(examPaperId: number) {
  return request.get(`/exam-papers/${examPaperId}`) // GET 请求获取试卷详情
}



// 学生添加试卷
export function addExamPaper(data: { studentId: number; examPaperId: number }) {
  console.log(data)

  return request.post('/studentExamPapers', data) // POST 请求用于添加试卷
}

// 学生获取它自己的试卷
export function getStudentExamPapers(studentId: number) {
  return request.get(`/studentExamPapers/students/${studentId}/examPapers`) // GET 请求获取试卷详情
}

// 更新试卷
export function updateExamPaperById(
  examPaperId: number,
  data: {
    examPaperName: string
  }
) {
  return request.put(`/exam-papers/${examPaperId}`, data) // PUT 请求用于更新试卷
}
