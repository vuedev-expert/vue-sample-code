import { useToast } from 'vue-toastification'

class ToastService {
  toast = useToast()

  success(message: string) {
    this.toast.success(message)
  }
  error(message: string) {
    this.toast.error(message)
  }

  warn(message: string) {
    this.toast.warning(message)
  }
}

export default new ToastService()
