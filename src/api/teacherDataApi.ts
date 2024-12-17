import request from '../utils/request'
/**
 * 查询学生错题总览
 * @returns 学生错题统计数据
 */
export const getWrongQuestionsOverview = () => {
    return request.get('/teacher/wrong-questions-overview')
}
  

/**
 * 查询课程错题难度分析
 * @returns 课程错题统计数据
 */
export const getCourseDifficultyAnalysis = () => {
    return request.get('/teacher/course-difficulty-analysis')
}
  
/**
 * 查询考试试卷错题率分析
 * @returns 试卷错题统计数据
 */
export const getExamPaperPerformance = () => {
    return request.get('/teacher/exam-paper-performance')
}
  
/**
 * 查询学生学习趋势与进步分析
 * @returns 学生学习进展统计数据
 */
export const getStudentLearningProgress = () => {
    return request.get('/teacher/student-learning-progress')
}  
