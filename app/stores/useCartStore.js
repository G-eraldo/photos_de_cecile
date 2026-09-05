import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
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

    clearCart() {
      this.items = []
    },
  },

  persist: true,
})
