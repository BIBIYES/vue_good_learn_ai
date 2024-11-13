import { ElMessage } from 'element-plus'

const defaultMessage = (msg: string) => {
  ElMessage(msg)
}
const successMessage = (msg: string) => {
  ElMessage({
    message: msg,
    type: 'success'
  })
}
const warningMessage = (msg: string) => {
  ElMessage({
    message: msg,
    type: 'warning'
  })
}
const errorMessage = (msg: string) => {
  ElMessage.error(msg)
}

export const messageTools = {
  defaultMessage,
  successMessage,
  warningMessage,
  errorMessage
}
