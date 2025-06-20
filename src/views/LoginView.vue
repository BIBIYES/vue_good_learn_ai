<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo -->
      <div class="logo">
        <img src="../assets/img/logo.webp" alt="Logo" />
      </div>
      <!-- Logo下方的文字 -->
      <p class="logo-text">欢迎登录好助学</p>
      <p class="logo-text">基于AI大模型学生学习辅助平台</p>

      <!-- 登录表单 -->
      <div class="login-form">
        <div class="tabs">
          <span class="tab" :class="{ active: isLogin }" @click="isLogin = true"
            >账户登录</span
          >
          <span
            class="tab"
            :class="{ active: !isLogin }"
            @click="isLogin = false"
            >注册账户</span
          >
        </div>

        <!-- 登录表单 -->
        <el-form
          v-if="isLogin"
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          label-width="0px"
        >
          <el-form-item prop="userEmail">
            <el-input
              v-model="loginForm.userEmail"
              style="width: 350px"
              size="large"
              placeholder="请输入你的电子邮件"
              :suffix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="userPassword">
            <el-input
              v-model="loginForm.userPassword"
              type="password"
              show-password
              style="width: 350px"
              size="large"
              placeholder="请输入你的密码"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-button" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->

        <el-form
          v-if="!isLogin"
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          label-width="0px"
        >
          <el-popover
            placement="left"
            title="小贴士"
            :width="100"
            trigger="hover"
            content="你想以什么身份注册？"
          >
            <template #reference>
              <!-- 身份选择 -->
              <el-form-item prop="userRole">
                <el-radio-group v-model="registerForm.userRole">
                  <el-radio value="student">学生身份</el-radio>
                  <el-radio value="teacher">老师身份</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>
          </el-popover>

          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              style="width: 350px"
              size="large"
              placeholder="请输入你的姓名"
              :suffix-icon="User"
            />
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item prop="userEmail">
            <el-input
              v-model="registerForm.userEmail"
              style="width: 350px"
              size="large"
              placeholder="请输入你的电子邮件"
              :suffix-icon="Message"
            />
          </el-form-item>
          <!-- 验证码 -->
          <el-form-item>
            <div class="verification-code">
              <el-input
                v-model="registerForm.verificationCode"
                style="width: 230px"
                size="large"
                placeholder="请输入验证码"
              />
              <el-button
                size="large"
                style="margin-left: 10px"
                @click="getAVerificationCode"
                :disabled="isCounting"
                >{{ captchaCountdown }}</el-button
              >
            </div>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="userPassword">
            <el-input
              v-model="registerForm.userPassword"
              type="password"
              show-password
              style="width: 350px"
              size="large"
              placeholder="请输入你的密码"
            />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              show-password
              style="width: 350px"
              size="large"
              placeholder="再次输入你的密码"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { User, Message } from "@element-plus/icons-vue";
import { login, register, getVerificationCode } from "@/api/userApi";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { messageTools } from "@/utils/messageTools";

const router = useRouter();
const userStore = useUserStore();
// 登录注册切换器
const isLogin = ref(true);

// 登录表单数据
const loginForm = ref({
  userEmail: "",
  userPassword: "",
});

// 验证码倒计时
let captchaCountdown = ref("获取验证码"); // 绑定到 UI 的验证码倒计时显示
let isCounting = ref(false); // 判断是否正在倒计时
// 获取验证码
// 获取验证码
const getAVerificationCode = () => {
  if (isCounting.value) return; // 防止重复点击

  // 邮箱格式验证
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 简单的邮箱正则表达式
  if (!emailPattern.test(registerForm.value.userEmail)) {
    ElMessage({
      message: "请输入有效的电子邮件地址",
      type: "error",
      plain: true,
    });
    return;
  }

  // 获取验证码并处理结果
  handelGetAVerificationCode().then((success) => {
    if (success) {
      let time = 60; // 倒计时的初始值，单位为秒
      captchaCountdown.value = `${time}秒后重新获取`;
      isCounting.value = true; // 标记为倒计时开始

      const intervalId = setInterval(() => {
        time -= 1;
        if (time > 0) {
          captchaCountdown.value = `${time}秒后重新获取`;
        } else {
          clearInterval(intervalId);
          captchaCountdown.value = "获取验证码"; // 倒计时结束时恢复显示
          isCounting.value = false; // 倒计时结束
        }
      }, 1000); // 每秒更新一次
    }
  });
};

// 注册表单数据
const registerForm = ref({
  username: "",
  userEmail: "",
  userPassword: "",
  verificationCode: "",
  confirmPassword: "",
  userRole: "student", // 默认学生身份
});

// 密码强度校验：必须包含大写、小写字母，且不少于 8 位
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

// 登录表单校验规则
const loginRules = ref({
  userEmail: [
    { required: true, message: "请输入电子邮件", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的电子邮件地址",
      trigger: ["blur", "change"],
    },
  ],
  userPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: passwordPattern,
      message: "密码需包含大小写字母且不少于8位",
      trigger: "blur",
    },
  ],
});

// 注册表单校验规则
const registerRules = ref({
  username: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  userEmail: [
    { required: true, message: "请输入电子邮件", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的电子邮件地址",
      trigger: ["blur", "change"],
    },
  ],
  userPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: passwordPattern,
      message: "密码需包含大小写字母且不少于8位",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      trigger: "blur",
    },
  ],
});

// 处理登录操作
const handleLogin = async () => {
  // 前端校验：密码需包含大小写字母且不少于 8 位
  if (!passwordPattern.test(loginForm.value.userPassword)) {
    ElMessage({
      message: "密码需包含大小写字母且不少于8位",
      type: "error",
      plain: true,
    });
    return;
  }

  console.log(loginForm.value);
  const res = await login(loginForm.value);
  if (res.code === 200) {
    ElMessage({
      message: "登录成功",
      type: "success",
      plain: true,
    });
    // 将API返回的数据存储到store中
    userStore.setUser(res.data);
    // 修改跳转逻辑
    if (res.data.role === "student") {
      await router.push("/student/home"); // 改为跳转到home页面
    } else {
      await router.push("/teacher/course");
    }
  } else {
    ElMessage({
      message: "用户名或密码错误",
      type: "error",
      plain: true,
    });
  }
};

// 处理注册操作
const handleRegister = () => {
  // 判空
  if (
    registerForm.value.username === "" ||
    registerForm.value.userEmail === ""
  ) {
    ElMessage({
      message: "请输入姓名和电子邮件",
      type: "error",
      plain: true,
    });
    return;
  }
  // 判断密码
  if (registerForm.value.userPassword !== registerForm.value.confirmPassword) {
    ElMessage({
      message: "两次密码不一致",
      type: "error",
      plain: true,
    });
    return;
  }
  // 前端校验：密码强度
  if (!passwordPattern.test(registerForm.value.userPassword)) {
    ElMessage({
      message: "密码需包含大小写字母且不少于8位",
      type: "error",
      plain: true,
    });
    return;
  }
  register(registerForm.value).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage({
        message: "注册成功",
        type: "success",
        plain: true,
      });

      isLogin.value = true;
    } else {
      ElMessage({
        message: "该账号已经注册或格式不正确",
        type: "error",
        plain: true,
      });
    }
  });
};

// 令牌校验
const isToken = () => {
  const role = userStore.role;
  if (role === "student") {
    router.push("/student");
    messageTools.successMessage(`自动登录成功,欢迎您${userStore.name}同学`);
  } else if (role === "teacher") {
    router.push("/teacher");
    messageTools.successMessage(`自动登录成功,欢迎您${userStore.name}老师`);
  } else {
    return;
  }
};

// 获取验证码
const handelGetAVerificationCode = async () => {
  const e = await getVerificationCode(registerForm.value.userEmail);
  console.log(registerForm.value.userEmail);
  console.log(e);
  if (e.code === 200) {
    messageTools.successMessage(e.msg);
    return true;
  } else {
    messageTools.errorMessage(e.msg);
    return false;
  }
};

onMounted(() => {
  isToken();
});
</script>

<style lang="less" scoped>
/* 容器样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url(../assets/img/loginBackground.png) no-repeat;
  background-size: 100%;
}

.login-box {
  width: 400px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  transition: all 1s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 1);
  }
}

.logo img {
  width: 80px;
  margin-bottom: 10px;
}

.logo-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tab {
  padding: 10px;
  cursor: pointer;
}

.tab.active {
  border-bottom: 2px solid #007bff;
  font-weight: bold;
}

.input-group {
  margin-bottom: 15px;
}

.login-button {
  width: 98%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #3d9bff;
}

.verification-code {
  display: flex;
  width: 350px;
  justify-content: space-between;
}
</style>
