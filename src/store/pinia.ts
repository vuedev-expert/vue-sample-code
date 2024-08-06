import { createPinia, Store } from 'pinia'

const pinia = createPinia()
let stores: Store[] = []
pinia.use(({ store }) => {
  stores.push(store)
})

function resetAllStores() {
  stores.forEach((store) => {
    store.$reset()
  })
  stores = []
}

export { resetAllStores }

export default pinia
