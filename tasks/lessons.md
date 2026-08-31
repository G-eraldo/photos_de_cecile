# Lessons

- For Nuxt nested routes, use `pages/section/index.vue` for the collection page when `pages/section/[slug].vue` is also present. A sibling `pages/section.vue` becomes the route parent and must contain `<NuxtPage />`; otherwise it masks child routes.
- For every new nested Nuxt route, verify the parent route does not mask it before testing the payment redirect in production.
