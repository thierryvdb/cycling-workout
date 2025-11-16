<template>
  <div id="app" :class="appTheme">
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Carregando Cycling Workout App...</p>
      </div>
    </div>

    <div v-else class="app-layout">
      <header class="app-header" :class="{ 'header-scrolled': isScrolled }">
        <div class="header-container">
          <router-link to="/" class="logo">
            <span class="logo-icon">🚴‍♂️</span>
            <span class="logo-text">Cycling Workout</span>
          </router-link>

          <nav class="main-nav">
            <router-link 
              v-for="item in navItems" 
              :key="item.to"
              :to="item.to"
              class="nav-link"
              :class="{ active: $route.name === item.name }"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text">{{ item.text }}</span>
            </router-link>
          </nav>

          <div class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name || 'Ciclista' }}</span>
              <span class="user-ftp" v-if="currentUser?.ftp">
                FTP: {{ currentUser.ftp }}W
              </span>
            </div>
            <div class="user-actions">
              <button 
                @click="toggleTheme" 
                class="theme-toggle"
                :title="isDarkTheme ? 'Modo Claro' : 'Modo Escuro'"
              >
                {{ isDarkTheme ? '☀️' : '🌙' }}
              </button>
              <router-link to="/profile" class="profile-btn">
                👤
              </router-link>
            </div>
          </div>

          <button 
            @click="toggleMobileMenu" 
            class="mobile-menu-toggle"
            :class="{ active: isMobileMenuOpen }"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div v-if="isMobileMenuOpen" class="mobile-menu">
          <nav class="mobile-nav">
            <router-link 
              v-for="item in navItems" 
              :key="item.to"
              :to="item.to"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              :class="{ active: $route.name === item.name }"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text">{{ item.text }}</span>
            </router-link>
          </nav>
          <div class="mobile-user-info">
            <span class="user-name">{{ currentUser?.name || 'Ciclista' }}</span>
            <span class="user-ftp" v-if="currentUser?.ftp">
              FTP: {{ currentUser.ftp }}W
            </span>
          </div>
        </div>
      </header>

      <main class="app-main">
        <div class="container">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>

      <footer class="app-footer">
        <div class="footer-container">
          <div class="footer-content">
            <div class="footer-section">
              <h4>Cycling Workout App</h4>
              <p>Crie, visualize e exporte seus treinos de ciclismo de forma profissional.</p>
            </div>
            <div class="footer-section">
              <h4>Recursos</h4>
              <ul>
                <li>Construtor de Treinos Visual</li>
                <li>Exportação .FIT, .ZWO, .ERG</li>
                <li>Gráficos Interativos</li>
                <li>Cálculo Automático de TSS</li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Suporte</h4>
              <ul>
                <li><a href="#" @click.prevent="showHelp">Documentação</a></li>
                <li><a href="#" @click.prevent="showContact">Contato</a></li>
                <li><a href="#" @click.prevent="showAbout">Sobre</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2024 Cycling Workout App. Desenvolvido com ❤️ para ciclistas.</p>
          </div>
        </div>
      </footer>

      <div class="notifications-container">
        <transition-group name="notification-fade">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification"
            :class="`notification-${notification.type}`"
            @click="removeNotification(notification.id)"
          >
            <span class="notification-icon">
              {{ getNotificationIcon(notification.type) }}
            </span>
            <div class="notification-content">
              <p class="notification-title">{{ notification.title }}</p>
              <p class="notification-message">{{ notification.message }}</p>
            </div>
            <button class="notification-close" @click="removeNotification(notification.id)">
              ×
            </button>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const workoutStore = useWorkoutStore()
    const router = useRouter()

    const isLoading = ref(true)
    const isScrolled = ref(false)
    const isMobileMenuOpen = ref(false)
    const isDarkTheme = ref(false)
    const notifications = ref([])
    let notificationId = 0

    const currentUser = computed(() => workoutStore.currentUser)
    
    const appTheme = computed(() => 
      isDarkTheme.value ? 'theme-dark' : 'theme-light'
    )

    const navItems = computed(() => [
      { 
        to: '/', 
        name: 'Dashboard',
        icon: '📊', 
        text: 'Dashboard' 
      },
      { 
        to: '/builder', 
        name: 'WorkoutBuilder',
        icon: '🏋️', 
        text: 'Construtor' 
      },
      { 
        to: '/history', 
        name: 'History',
        icon: '📝', 
        text: 'Histórico' 
      },
      { 
        to: '/profile', 
        name: 'Profile',
        icon: '👤', 
        text: 'Perfil' 
      }
    ])

    const loadInitialData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        await workoutStore.loadWorkouts()
        
        const savedTheme = localStorage.getItem('cycling-workout-theme')
        if (savedTheme) {
          isDarkTheme.value = savedTheme === 'dark'
        }
        
      } catch (error) {
        showNotification('error', 'Erro ao carregar', 'Não foi possível carregar os dados iniciais.')
      } finally {
        isLoading.value = false
      }
    }

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value
      localStorage.setItem('cycling-workout-theme', isDarkTheme.value ? 'dark' : 'light')
    }

    const showNotification = (type, title, message, duration = 5000) => {
      const id = ++notificationId
      const notification = {
        id,
        type,
        title,
        message,
        duration
      }
      
      notifications.value.push(notification)
      
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    }

    const getNotificationIcon = (type) => {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      return icons[type] || '💡'
    }

    const showHelp = () => {
      showNotification('info', 'Ajuda', 'Documentação em desenvolvimento...')
    }

    const showContact = () => {
      showNotification('info', 'Contato', 'Entre em contato: suporte@cyclingworkout.app')
    }

    const showAbout = () => {
      showNotification('info', 'Sobre', 'Cycling Workout App v1.0 - Desenvolvido para ciclistas apaixonados!')
    }

    onMounted(() => {
      loadInitialData()
      window.addEventListener('scroll', handleScroll)
      
      window.showNotification = showNotification
      window.removeNotification = removeNotification
      
      setTimeout(() => {
        if (!isLoading.value) {
          showNotification('success', 'Bem-vindo!', 'Seu Cycling Workout App está pronto!')
        }
      }, 1500)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      isLoading,
      isScrolled,
      isMobileMenuOpen,
      isDarkTheme,
      notifications,
      currentUser,
      appTheme,
      navItems,
      toggleMobileMenu,
      closeMobileMenu,
      toggleTheme,
      showNotification,
      removeNotification,
      getNotificationIcon,
      showHelp,
      showContact,
      showAbout
    }
  }
}
</script>

<style>
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #e74c3c;
  --background-color: #f8f9fa;
  --surface-color: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #e0e0e0;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  --header-height: 70px;
  --container-max-width: 1200px;
  --border-radius: 8px;
  
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}

.theme-dark {
  --primary-color: #2980b9;
  --secondary-color: #27ae60;
  --accent-color: #c0392b;
  --background-color: #1a1a1a;
  --surface-color: #2d2d2d;
  --text-primary: #ecf0f1;
  --text-secondary: #bdc3c7;
  --border-color: #404040;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  background: var(--surface-color);
  box-shadow: var(--shadow);
  z-index: 1000;
  transition: all var(--transition-normal);
}

.header-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.3em;
  transition: transform var(--transition-fast);
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 1.5em;
  margin-right: 8px;
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-nav {
  display: flex;
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  font-weight: 500;
}

.nav-link:hover {
  color: var(--primary-color);
  background: var(--background-color);
}

.nav-link.active {
  color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.nav-icon {
  font-size: 1.1em;
}

.nav-text {
  font-size: 0.9em;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 0.9em;
}

.user-ftp {
  font-size: 0.8em;
  color: var(--text-secondary);
  background: var(--background-color);
  padding: 2px 8px;
  border-radius: 10px;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.theme-toggle,
.profile-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color var(--transition-fast);
}

.theme-toggle:hover,
.profile-btn:hover {
  background: var(--background-color);
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  gap: 4px;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background: var(--text-primary);
  transition: all var(--transition-fast);
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--surface-color);
  box-shadow: var(--shadow);
  border-top: 1px solid var(--border-color);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--primary-color);
  background: var(--background-color);
}

.mobile-user-info {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
}

.app-main {
  flex: 1;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 30px 20px;
}

.app-footer {
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.footer-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.footer-section p,
.footer-section ul {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-section a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-section a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8em;
}

.notifications-container {
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 1100;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  margin-bottom: 10px;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  border-left: 4px solid;
  cursor: pointer;
  transition: all var(--transition-normal);
  max-width: 350px;
}

.notification:hover {
  transform: translateX(-5px);
}

.notification-success {
  border-left-color: #27ae60;
}

.notification-error {
  border-left-color: #e74c3c;
}

.notification-warning {
  border-left-color: #f39c12;
}

.notification-info {
  border-left-color: #3498db;
}

.notification-icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.notification-message {
  font-size: 0.85em;
  color: var(--text-secondary);
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color var(--transition-fast);
}

.notification-close:hover {
  background: var(--background-color);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .main-nav,
  .user-info {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .user-actions {
    gap: 5px;
  }

  .container {
    padding: 20px 15px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .notifications-container {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 15px;
  }

  .logo-text {
    display: none;
  }

  .container {
    padding: 15px 10px;
  }
}
</style>