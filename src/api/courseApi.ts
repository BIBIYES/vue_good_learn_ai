import request from '@/utils/request'

// 删除课程
export function deleteCourseById(courseId: number) {
  return request.delete(`/courses/${courseId}`) // 简化为 /courses/{courseId}
}

// 获取指定课程的题目
export function selectQuestionsByCourseId(courseId: number, pageNum: number = 1, pageSize: number = 10) {
  // 将分页参数添加到请求中
  return request.get(`/courses/${courseId}/questions`, {
    params: {
      pageNum, // 当前页码
      pageSize // 每页显示的条数
    }
  })
}

export const selectCourseByIdSearch = (courseId: number, keyWord: string) => {
  return request.get(`/courses/${courseId}/questions/search`,{
    params: {
      keyWord
    }
  })
}

// 获取当前课程
export function selectCourseById(courseId: Number) {
  return request.get(`/courses/${courseId}`)
}

// 更新课程
export function updateCourse(
  courseId: number,
  data: {
    courseName: string
  }
) {
  return request.put(`/courses/${courseId}`, data)
}
