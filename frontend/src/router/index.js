import { createRouter, createWebHistory } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: 'Dashboard - Cycling Workout App',
      requiresAuth: true
    }
  },
  {
    path: '/builder',
    name: 'WorkoutBuilder',
    component: () => import('@/views/WorkoutBuilder.vue'),
    meta: {
      title: 'Construtor de Treinos - Cycling Workout App',
      requiresAuth: true
    }
  },
  {
    path: '/builder/:workoutId',
    name: 'WorkoutEditor',
    component: () => import('@/views/WorkoutBuilder.vue'),
    meta: {
      title: 'Editar Treino - Cycling Workout App',
      requiresAuth: true
    },
    props: true
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue'),
    meta: {
      title: 'Histórico - Cycling Workout App',
      requiresAuth: true
    }
  },
  {
    path: '/history/:activityId',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetail.vue'),
    props: true,
    meta: {
      title: 'Detalhes da Atividade',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: 'Perfil - Cycling Workout App',
      requiresAuth: true
    }
  },

### 4. Atualização das Rotas do Frontend (`router/index.js`)

Criei a nova rota para a página de detalhes e a adicionei à configuração do roteador.

```diff
--- a/frontend/src/router/index.js
+++ b/frontend/src/router/index.js
  {
    path: '/auth/strava/callback',
    name: 'StravaCallback',
    component: () => import('@/views/StravaCallback.vue'),
    meta: {
      title: 'Conectando com Strava...',
      requiresAuth: true
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: {
      title: 'Esqueci Minha Senha',
      requiresAuth: false
    }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: {
      title: 'Redefinir Senha',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: 'Login - Cycling Workout App',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Página Não Encontrada - Cycling Workout App'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  const workoutStore = useWorkoutStore()
  
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  if (to.meta.requiresAuth && !workoutStore.currentUser) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  console.log(`Navegação: ${from.name} -> ${to.name}`)
})

export default router