import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/login'
    },
    {
      path: '/teacher',
      name: 'home',
      redirect:'/teacher/course',
      meta: {
        title: '好助学-教师端'
      },
      component: () => import('../views/TeacherView/layout/HomeLayout.vue'),
      children: [
        {
          path: '/teacher/home',
          name: 'home',
          meta: {
            title: '好助学-首页'
          },
          component: () => import('../views/TeacherView/page/HomePage.vue')
        },
        {
          path: '/teacher/course',
          name: 'myCourses',
          meta: {
            title: '好助学-我的课程'
          },
          component: () => import('../views/TeacherView/page/CoursesView.vue')
        },
        {
          path: '/teacher/course/:courseId',
          name: 'courseDetail',
          meta: {
            title: '好助学-课程详情'
          },
          component: () =>
            import('../views/TeacherView/page/CourseQuestionsView.vue')
        },
        {
          path: '/teacher/exam-papers', // 新的试卷页面路由
          name: 'examPapers',
          meta: {
            title: '好助学-试卷列表'
          },
          component: () => import('@/views/TeacherView/page/ExamPapers.vue')
        },
        {
          path: '/teacher/exam-papers/:examPaperId',
          name: 'examDetail',
          meta: {
            title: '好助学-试卷详情'
          },
          component: () =>
            import('@/views/TeacherView/page/ExamPaperQuestionsView.vue'), // 跳转到试卷详情页
          props: true // 通过 props 传递路由参数
        },
        {
          path:"/check-page/:userId/:examPaperId",
          name:"check-page",
          meta:{
            title:"好助学-试卷检查"
          },
          component:()=>import("@/views/TeacherView/page/CheckPage.vue")
        },
        {
          path: '/teacher/profile',
          name: 'teacherProfile',
          meta: {
            title: '好助学-个人信息'
          },
          component: () => import('@/views/TeacherView/page/UserProfileView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        title: '好助学-登录页'
      },
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/student',
      name: 'student',
      redirect: '/student/exam-paper',
      meta: {
        title: '好助学-学生端'
      },
      component: () => import('@/views/StudentView/layout/HomeLayout.vue'),
      children: [
        {
          path: '/student/exam-paper',
          name: 'exam-paper',
          meta: {
            title: '好助学-试卷列表'
          },
          component: () => import('@/views/StudentView/page/ExamPaper.vue')
        },
        {
          path: '/student/profile',
          name: 'studentProfile',
          meta: {
            title: '好助学-个人信息'
          },
          component: () => import('@/views/StudentView/page/UserProfileView.vue')
        }
      ]
    },
    {
      path: '/student/do-question/:examPaperId',
      name: 'DoQuestion',
      meta: {
        title: '好助学-做题'
      },
      component: () => import('@/views/StudentView/page/DoQuestion.vue')
    },
    
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore() // 获取用户存储状态
  document.title = (to.meta.title as string) || '好助学'

  // 检查是否有 token，如果没有且不是去登录页，则重定向到登录页面
  if (!userStore.token && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
