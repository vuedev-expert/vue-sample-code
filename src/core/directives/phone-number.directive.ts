import parsePhoneNumber from 'libphonenumber-js'

const formatPhoneNumber = (text: string) => {
  const phoneNumber = parsePhoneNumber(text)
  return phoneNumber?.formatInternational() ?? null
}

export default {
  beforeMount(el: HTMLElement) {
    const phoneNumber = formatPhoneNumber(el.innerText.trim())
    if (phoneNumber) {
      el.innerText = phoneNumber
    }
  },
  onMounted(el: any) {
    const phoneNumber = formatPhoneNumber(el.innerText.trim())
    if (phoneNumber) {
      el.innerText = phoneNumber
    }
  },
  updated(el: any) {
    const phoneNumber = formatPhoneNumber(el.innerText.trim())
    if (phoneNumber) {
      el.innerText = phoneNumber
    }
  }
}
