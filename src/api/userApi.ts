/**
 * 这是登录接口的调用
 */
import request from '../utils/request'
import type { UnwrapRef } from 'vue'

// 登录接口
export const login = (
  data: UnwrapRef<{ userPassword: string; userEmail: string }>
) => {
  return request.post('/user/login', data)
}

// 获取验证码的接口
export const getVerificationCode = (email: string) => {
  return request.post('/user/send-verification-code', { email })
}

// 注册接口
export const register = (
  data: UnwrapRef<{
    userPassword: string
    confirmPassword: string
    userEmail: string
    userRole: string
    authenticator: string
    username: string
  }>
) => {
  return request.post('/user/register', data)
}

/**
 * 获取用户自己课程列表
 * @param userId
 * @returns 课程列表
 */
export function selectCoursesByUserId(userId: number) {
  return request.get(`/user/${userId}/courses`)
}

/**
 * 创建课程
 * @param data 课程信息
 * @returns
 */
export function insertCourse(userId: number, data: { courseName: string }) {
  return request.post(`/user/${userId}/course`, data) // 简化为 /courses
}

/**
 * 获取用户自己的试卷
 * @param userId
 * @returns 试卷列表
 */
export function selectExamPapersByUserId(userId: number) {
  return request.get(`/user/${userId}/exam-papers`)
}

/**
 * 当前用户创建试卷
 * @param data 试卷信息
 * @returns
 * @param userId
 */
export function insertExamPaperByUserId(
  userId: number,
  data: { examPaperName: string }
) {
  return request.post(`/user/${userId}/exam-paper`, data)
}

/**
 * 学生加入试卷
 * @param userId 
 * @param examPaperId 
 * @returns 
 */

export function insertStudentJoinExamPaper(
  userId: number,
  examPaperId: number
) {
  return request.post(`/user/${userId}/exam-papers/${examPaperId}`)
}

/**
 * 学生查看已加入的试卷
 * @param userId 学生id
 * @returns 试卷列表
 */
export function getStudentJoinExamPaper(userId: number) {
  return request.get(`/user/${userId}/student-exam-papers`)
}

/**
 * 更新用户个人信息
 * @param data 用户信息
 * @returns 更新结果
 */
export const updateUserProfile = (data: {
  userId: number
  username: string
  cqipcId: string | null
  birthday: string | null
  address: string | null
  avatar: string | null
}) => {
  return request.put('/user/profile', data)
}

/**
 * 上传用户头像
 * @param formData 包含头像文件的 FormData 对象
 * @returns 上传结果
 */
export const uploadAvatar = (formData: FormData) => {
  return request.post('/files/avatar', formData)
}

