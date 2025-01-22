import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ElNotification } from 'element-plus'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404View.vue')
    },
    {
      path: '/',
      name: 'index',
      redirect: '/login'
    },
    
    {
      path: '/login',
      name: 'login',
      meta: {
        title: 'AI好助学-登录页'
      },
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/student',
      name: 'student',
      redirect: '/student/home',
      meta: {
        title: 'AI好助学-学生端'
      },
      component: () => import('@/views/StudentView/layout/HomeLayout.vue'),
      children: [
        {
          path: 'home',
          name: 'studentHome',
          meta: {
            title: 'AI好助学-首页'
          },
          component: () => import('@/views/StudentView/page/HomeView.vue')
        },
        {
          path: 'exam-paper',
          name: 'exam-paper',
          meta: {
            title: 'AI好助学-试卷列表'
          },
          component: () => import('@/views/StudentView/page/ExamPaper.vue')
        },
        {
          path: 'profile',
          name: 'studentProfile',
          meta: {
            title: 'AI好助学-个人信息'
          },
          component: () => import('@/views/StudentView/page/UserProfileView.vue')
        },
        {
          path: 'wrong-question',
          name: 'wrongQuestion',
          meta: {
            title: 'AI好助学-错题本'
          },
          component: () => import('@/views/StudentView/page/WrongQuestionView.vue')
        },
        {
          path: '/student/practice',
          component: () => import('@/views/StudentView/page/PracticeView.vue'),
          meta: {
            title: '智能练习',
            requiresAuth: true
          }
        },
        {
          path: '/student/ai-chat',
          name: 'aiChat',
          meta: {
            title: 'AI好助学-AI聊天'
          },
          component: () => import('@/views/StudentView/page/AIChatView.vue'),
          children: [
            {
              path: '',
              name: 'chatHome',
              component: () => import('@/views/AIChat/ChatHome.vue')
            },
            {
              path: ':sessionId',
              name: 'chatSession',
              component: () => import('@/views/AIChat/ChatSession.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/student/do-question/:examPaperId',
      name: 'DoQuestion',
      meta: {
        title: 'AI好助学-做题'
      },
      component: () => import('@/views/StudentView/page/DoQuestion.vue')
    },
    {
      path: '/teacher',
      name: 'teacher',
      redirect: '/teacher/course',
      meta: {
        title: 'AI好助学-教师端'
      },
      component: () => import('../views/TeacherView/layout/HomeLayout.vue'),
      children: [
        {
          path: '/teacher/home',
          name: 'teacherHome',
          meta: {
            title: 'AI好助学-首页'
          },
          component: () => import('../views/TeacherView/page/HomeView.vue')
        },
        {
          path: '/teacher/course',
          name: 'myCourses',
          meta: {
            title: 'AI好助学-我的课程'
          },
          component: () => import('../views/TeacherView/page/CoursesView.vue')
        },
        {
          path: '/teacher/course/:courseId',
          name: 'courseDetail',
          meta: {
            title: 'AI好助学-课程详情'
          },
          component: () =>
            import('../views/TeacherView/page/CourseQuestionsView.vue')
        },
        {
          path: '/teacher/exam-papers',
          name: 'examPapers',
          meta: {
            title: 'AI好助学-试卷列表'
          },
          component: () => import('@/views/TeacherView/page/ExamPapers.vue')
        },
        {
          path: '/teacher/exam-papers/:examPaperId',
          name: 'examDetail',
          meta: {
            title: 'AI好助学-试卷详情'
          },
          component: () =>
            import('@/views/TeacherView/page/ExamPaperQuestionsView.vue'),
          props: true
        },
        {
          path: "/check-page/:userId/:examPaperId",
          name: "check-page",
          meta: {
            title: "AI好助学-试卷检查"
          },
          component: () => import("@/views/TeacherView/page/CheckPage.vue")
        },
        {
          path: '/teacher/profile',
          name: 'teacherProfile',
          meta: {
            title: 'AI好助学-个人信息'
          },
          component: () => import('@/views/TeacherView/page/UserProfileView.vue')
        },
        {
          path: '/teacher/student-terminal',
          name: 'studentTerminal',
          meta: {
            title: 'AI好助学-学生终端'
          },
          component: () => import('@/views/TeacherView/page/StudentTerminal.vue')
        }
      ]
    },
    
    
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore() // 获取用户存储状态
  document.title = (to.meta.title as string) || 'AI好助学'

  // 检查是否有 token
  if (!userStore.token && to.path !== '/login') {
    return next('/login')
  }

  // 检查角色权限
  if (to.path.startsWith('/student') && userStore.role !== 'student') {
    return next('/404')
  }
  if (to.path.startsWith('/teacher') && userStore.role !== 'teacher') {
    return next('/404')
  }

  // 检查姓名中是否包含******
  if (!['/student/profile', '/teacher/profile'].includes(to.path) && /\*{6}/.test(userStore.name)) {
    ElNotification({
      title: '提示',
      message: '请修改真实姓名后才能使用系统',
      type: 'warning',
      duration: 5000
    })
    
    if (userStore.role === 'student') {
      return next('/student/profile')
    } else if (userStore.role === 'teacher') {
      return next('/teacher/profile')
    }
  }

  next()
})

export default router
