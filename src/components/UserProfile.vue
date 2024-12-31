<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-wrapper">
          <el-avatar :size="100" :src=avatarUrl />
          <div class="avatar-upload">
            <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false"
              :on-change="handleAvatarChange" accept="image/*">
              <el-button size="small">更换头像</el-button>
            </el-upload>
          </div>
        </div>
        <h2>{{ userStore.name }}</h2>
        <span class="role-tag" :class="userStore.role">
          {{ userStore.role === 'teacher' ? '教师' : '学生' }}
        </span>
      </div>

      <div class="career-goal">
        <h3>职业目标</h3>
        <div class="goal-tag">Java后端工程师</div>
      </div>

      <div class="skills-section">
        <h3>技能掌握度</h3>
        <div class="skills-grid">
          <div class="skill-item" v-for="skill in skills" :key="skill.name">
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-percentage">{{ skill.percentage }}%</span>
            </div>
            <el-progress 
              :percentage="skill.percentage"
              :color="skill.color"
              :stroke-width="15"
              :show-text="false"
            />
          </div>
        </div>
      </div>

      <div class="profile-info">
        <el-form ref="formRef" :model="profileForm" :rules="rules" label-width="100px">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="profileForm.name" />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input v-model="maskedEmail" disabled />
          </el-form-item>

          <el-form-item label="学校ID" prop="cqipcId">
            <el-input v-model="profileForm.cqipcId" />
          </el-form-item>

          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="profileForm.birthday" type="date" placeholder="选择日期" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" :clearable="true" />
          </el-form-item>

          <el-form-item label="地址" prop="address">
            <el-input v-model="profileForm.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
          </el-form-item>
        </el-form>
      </div>

      <div class="profile-actions">
        <el-button type="primary" @click="handleSave()">保存修改</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { updateUserProfile, uploadAvatar } from "@/api/userApi"
const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)

const profileForm = ref({
  id: userStore.id,
  name: userStore.name,
  cqipcId: userStore.cqipcId,
  birthday: userStore.birthday ? userStore.birthday : "",
  address: userStore.address,
  avatar: userStore.avatar,
  email: userStore.email
})

const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  cqipcId: [
    { required: true, message: '请输入学校ID', trigger: 'blur' }
  ]
}
// 头像计算属性
const avatarUrl = computed(() => {
  // 如果上传了头像

  if (userStore.avatar) {
    return '/api' + userStore.avatar
  }
  return `https://q2.qlogo.cn/headimg_dl?dst_uin=${userStore.email}&spec=640`
})

const maskedEmail = computed(() => {
  const email = userStore.email;
  if (!email) return '';
  const [username, domain] = email.split('@');
  const maskedUsername = username.slice(0, 3) + '*'.repeat(username.length - 3);
  return `${maskedUsername}@${domain}`;
})

const handleAvatarChange = async (uploadFile) => {
  if (!uploadFile.raw) return

  const formData = new FormData()
  formData.append('photo', uploadFile.raw)

  try {
    const res = await uploadAvatar(formData)
    if (res.code === 200) {
      profileForm.value.avatar = res.data
      ElMessage.success('头像上传成功！保存后生效')
    }
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await updateUserProfile({
          userId: profileForm.value.id,
          username: profileForm.value.name,
          cqipcId: profileForm.value.cqipcId,
          birthday: profileForm.value.birthday || null,
          address: profileForm.value.address || null,
          avatar: profileForm.value.avatar || null
        })
        if (res.code === 200) {
          ElMessage.success(res.msg)
          userStore.setUser({
            ...userStore.$state,
            name: profileForm.value.name,
            cqipc_id: profileForm.value.cqipcId,
            birthday: profileForm.value.birthday,
            address: profileForm.value.address,
            avatar: profileForm.value.avatar
          })
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
  })
}

const handleCancel = () => {
  router.back()
}

const skills = ref([
  { name: 'Vue.js', percentage: 60, color: '#42b883' },
  { name: 'Java基础', percentage: 80, color: '#f89820' },
  { name: 'javaEE企业级应用开发', percentage: 75, color: '#6db33f' },
  { name: 'MySQL数据库', percentage: 75, color: '#00758f' },
  { name: '网页设计', percentage: 82, color: '#f7df1e' }
])
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  width: 100%;
  padding: 20px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-upload {
  margin-top: 10px;
}

.profile-header h2 {
  margin: 15px 0 5px;
  color: #333;
}

.role-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 14px;
}

.role-tag.teacher {
  background-color: #e6f7ff;
  color: #1890ff;
}

.role-tag.student {
  background-color: #f6ffed;
  color: #52c41a;
}

.career-goal {
  margin: 20px 0;
  text-align: center;
}

.goal-tag {
  display: inline-block;
  padding: 8px 20px;
  background: #f0f9ff;
  color: #1890ff;
  border-radius: 20px;
  font-weight: bold;
  margin-top: 10px;
}

.skills-section {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}
.skills-section:hover{
  /* 悬浮阴影效果 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
}


.skills-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.skill-item {
  padding: 10px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skill-name {
  font-weight: 500;
  color: #333;
}

.skill-percentage {
  color: #666;
}

.profile-info {
  margin: 30px 0;
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-cascader) {
  width: 100%;
}
</style>
