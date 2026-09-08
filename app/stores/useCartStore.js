import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    checkouts: {},
  }),

  getters: {
    itemCount: (state) => state.items.reduce((count, item) => count + item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
    subtotal: (state) => Number(state.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2)),
  },

  actions: {
    addItem(item) {
      this.items.push({ ...item, id: crypto.randomUUID() })
    },

    updateQuantity(itemId, quantity) {
      const item = this.items.find((entry) => entry.id === itemId)
      if (!item) return
      item.quantity = Math.min(20, Math.max(1, Number(quantity) || 1))
    },

    removeItem(itemId) {
      this.items = this.items.filter((item) => item.id !== itemId)
    },

    rememberCheckout(reference, items) {
      this.checkouts[reference] = items.map(({ id, quantity }) => ({ id, quantity }))
    },

    completeCheckout(reference) {
      const paidItems = this.checkouts[reference]
      if (!paidItems) return
      for (const paid of paidItems) {
        const item = this.items.find((entry) => entry.id === paid.id)
        if (!item) continue
        if (item.quantity > paid.quantity) item.quantity -= paid.quantity
        else this.removeItem(item.id)
      }
      delete this.checkouts[reference]
    },

    replacePhoto(itemId, photo) {
      const item = this.items.find((entry) => entry.id === itemId)
      if (!item) return
      // A replaced photograph is a new cart item, distinct from any pending order.
      item.id = crypto.randomUUID()
      item.photo = photo
    },

    clearCart() {
      this.items = []
    },
  },

  persist: { storage: piniaPluginPersistedstate.localStorage() },
})
