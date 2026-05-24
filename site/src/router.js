import { createRouter, createWebHashHistory } from "vue-router"

// Hash routing — works on Cloudflare Pages without any
// rewrite-rule wrangling for deep links to /p/<name> etc.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "browse", component: () => import("@/pages/Browse.vue") },
    {
      path: "/p/:name",
      name: "package",
      component: () => import("@/pages/PackageDetail.vue"),
      props: true,
    },
    { path: "/submit", name: "submit", component: () => import("@/pages/Submit.vue") },
    { path: "/forum", name: "forum", component: () => import("@/pages/Forum.vue") },
    {
      path: "/forum/:number",
      name: "forum-thread",
      component: () => import("@/pages/ForumThread.vue"),
      props: (route) => ({ number: Number(route.params.number) }),
    },
    { path: "/account", name: "account", component: () => import("@/pages/Account.vue") },
    { path: "/about", name: "about", component: () => import("@/pages/About.vue") },
    { path: "/:pathMatch(.*)*", redirect: { name: "browse" } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
