# 🚴 Cycling Workout App - Roadmap de Desenvolvimento

## 📊 Status Atual: 70% Completo

### ✅ Funcionalidades Core (100%)
- [x] Sistema de usuários com FTP, VO2max, FC máx, peso
- [x] Workout Builder com drag & drop
- [x] Zonas de potência (Z1-Z7)
- [x] Zonas de frequência cardíaca
- [x] Sistema de cadência
- [x] Cálculo de TSS (Training Stress Score)
- [x] Cálculo de Intensity Factor (IF)
- [x] Exportação .ZWO (Zwift)
- [x] Exportação .ERG
- [x] Integração completa com Strava
- [x] Histórico de treinos
- [x] Dashboard básico
- [x] Autenticação JWT
- [x] PostgreSQL como banco de dados

---

## 🎯 FASE 1 - Melhorias Essenciais (Prioridade ALTA)

### 1.1 UX do Workout Builder ⚡
**Tempo estimado: 1-2 dias**

- [ ] Duplo clique para editar duração de blocos
- [ ] Atalhos de teclado (Ctrl+C/V para copiar blocos, Delete para remover)
- [ ] Zoom in/out na timeline
- [ ] Grid de tempo na timeline (marcadores a cada 5min)
- [ ] Modo de edição rápida (sem modal)

**Arquivos afetados:**
- `frontend/src/components/WorkoutCreator/WorkoutBlock.vue`
- `frontend/src/views/WorkoutBuilder.vue`

---

### 1.2 Templates de Treinos 📝
**Tempo estimado: 2-3 dias**

**Backend:**
```sql
CREATE TABLE workout_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'endurance', 'vo2max', 'threshold', 'recovery'
  difficulty VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  is_public BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  blocks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Features:**
- [ ] Salvar treino como template
- [ ] Galeria de templates (públicos + privados)
- [ ] Categorias: Endurance, VO2max, Threshold, Recovery, Sweet Spot
- [ ] Filtros por dificuldade e duração
- [ ] Carregar template no builder com 1 clique

**Arquivos a criar:**
- `backend/models/WorkoutTemplate.js`
- `backend/controllers/templateController.js`
- `backend/routes/templates.js`
- `frontend/src/views/TemplateGallery.vue`
- `frontend/src/api/templateAPI.js`

---

### 1.3 Exportação .FIT Binária ⌚
**Tempo estimado: 2-3 dias**

A exportação .FIT atual retorna JSON. Precisa gerar arquivo binário válido.

**Implementação:**
```bash
npm install fit-file-writer
```

**Features:**
- [ ] Gerar .FIT binário correto
- [ ] Suporte a structured workouts (steps)
- [ ] Targets de potência, FC e cadência
- [ ] Validação do arquivo gerado

**Arquivo a modificar:**
- `backend/utils/FileGenerator.js`

---

## 🎯 FASE 2 - Analytics & Performance (Prioridade MÉDIA)

### 2.1 Dashboard de Analytics 📊
**Tempo estimado: 5-7 dias**

**Features:**
- [ ] Gráfico de Evolução do FTP (Chart.js line chart)
- [ ] CTL/ATL/TSB (Chronic/Acute Training Load, Training Stress Balance)
- [ ] TSS acumulado: dia/semana/mês
- [ ] Distribuição de tempo por zona
- [ ] Volume total: horas, km, TSS
- [ ] Métricas comparativas: mês atual vs anterior

**Backend:**
```sql
CREATE TABLE ftp_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ftp_value INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW(),
  method VARCHAR(50) -- 'manual', 'auto', 'test'
);
```

**Arquivos a criar:**
- `frontend/src/views/Analytics.vue`
- `frontend/src/components/Analytics/FTPChart.vue`
- `frontend/src/components/Analytics/TSBChart.vue`
- `frontend/src/components/Analytics/ZoneDistribution.vue`
- `backend/models/FTPHistory.js`
- `backend/controllers/analyticsController.js`

---

### 2.2 Progresso nas Zonas 📈
**Tempo estimado: 3-4 dias**

**Features:**
- [ ] Tempo total em cada zona (Z1-Z7) por período
- [ ] Comparativo: tempo planejado vs executado
- [ ] Heatmap de zonas por dia da semana
- [ ] Identificação de gaps (zonas pouco trabalhadas)

---

### 2.3 Métricas Avançadas 🔢
**Tempo estimado: 3-4 dias**

**Features:**
- [ ] Normalized Power (NP)
- [ ] Variability Index (VI = NP / Avg Power)
- [ ] Work (kJ)
- [ ] Efficiency Factor (NP / Avg HR)
- [ ] Decoupling aeróbico (primeira vs segunda metade)

**Cálculos:**
```javascript
// Normalized Power (30-second rolling average)
function calculateNP(powerData) {
  const rollingAvg30s = calculateRollingAverage(powerData, 30)
  const fourthPower = rollingAvg30s.map(p => Math.pow(p, 4))
  const avgFourthPower = average(fourthPower)
  return Math.pow(avgFourthPower, 0.25)
}
```

---

## 🎯 FASE 3 - Periodização (Prioridade MÉDIA-BAIXA)

### 3.1 Planejamento de Temporada 📅
**Tempo estimado: 7-10 dias**

**Backend:**
```sql
CREATE TABLE training_phases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  phase_type VARCHAR(50), -- 'base', 'build', 'peak', 'recovery'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_tss_per_week INTEGER,
  notes TEXT
);

CREATE TABLE scheduled_workouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  workout_id INTEGER REFERENCES workouts(id),
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP
);
```

**Features:**
- [ ] Calendário de treinos (FullCalendar.js ou similar)
- [ ] Arrastar workouts para datas
- [ ] Fases de periodização: Base, Build, Peak, Recovery
- [ ] TSS alvo por semana
- [ ] Alertas de carga excessiva
- [ ] Sugestão automática de rest days

**Arquivos a criar:**
- `frontend/src/views/TrainingCalendar.vue`
- `backend/models/TrainingPhase.js`
- `backend/models/ScheduledWorkout.js`

---

### 3.2 Macrociclos e Mesociclos 🗓️
**Tempo estimado: 5-7 dias**

**Features:**
- [ ] Definir macrociclos (ex: preparação para prova em 16 semanas)
- [ ] Mesociclos de 3-4 semanas
- [ ] Progressão automática de carga (rampa de TSS)
- [ ] Semana de recuperação a cada 3-4 semanas

---

## 🎯 FASE 4 - IA e Automação (Prioridade BAIXA)

### 4.1 Recomendações Inteligentes 🤖
**Tempo estimado: 10-15 dias**

**Features:**
- [ ] Sugestão de próximo treino baseado em:
  - TSS acumulado da semana
  - Último treino realizado
  - Fase atual de periodização
  - Nível de fadiga (TSB)
- [ ] Ajuste automático de FTP baseado em performances
- [ ] Detecção de overtraining:
  - TSS/dia > threshold por X dias consecutivos
  - TSB muito negativo
  - Sem dias de recuperação

**Algoritmo de detecção de overtraining:**
```javascript
function detectOvertraining(user) {
  const last7Days = getActivities(user, 7)
  const avgTSSperDay = calculateAvgTSS(last7Days)
  const tsb = calculateTSB(user)
  const restDays = countRestDays(last7Days)

  if (avgTSSperDay > 100 && tsb < -30 && restDays === 0) {
    return {
      risk: 'HIGH',
      recommendation: 'Dia de descanso ou treino de recuperação Z1-Z2'
    }
  }
}
```

---

### 4.2 Auto-ajuste de FTP 📈
**Tempo estimado: 5-7 dias**

**Features:**
- [ ] Detectar novos recordes em intervalos (5min, 20min, 60min)
- [ ] Sugerir novo FTP baseado em:
  - 95% do power em 20min
  - 75% do power em 5min
- [ ] Histórico de mudanças de FTP
- [ ] Recálculo automático de zonas

---

## 🎯 FASE 5 - Integrações e Exportações (Prioridade BAIXA)

### 5.1 TrainingPeaks Integration 📊
**Tempo estimado: 7-10 dias**

**Features:**
- [ ] OAuth com TrainingPeaks
- [ ] Import de workouts do TP
- [ ] Export de workouts para TP
- [ ] Sync bidirecional de TSS

---

### 5.2 Relatórios e Exportações 📄
**Tempo estimado: 5-7 dias**

**Features:**
- [ ] Relatório semanal em PDF
  - Resumo de TSS
  - Gráficos de zonas
  - Comparativo com semana anterior
- [ ] Export CSV de todos os workouts
- [ ] Export JSON de estrutura completa
- [ ] Email automático com relatório semanal

**Implementação:**
```bash
npm install puppeteer pdfkit
```

---

## 🎯 FASE 6 - Mobile & PWA (Prioridade BAIXA)

### 6.1 Progressive Web App 📱
**Tempo estimado: 10-15 dias**

**Features:**
- [ ] Service Worker para offline
- [ ] Instalação como app nativo
- [ ] Notificações push
- [ ] Modo offline com sync posterior
- [ ] Layout responsivo mobile-first

---

## 📋 Backlog de Melhorias Menores

### Interface
- [ ] Dark mode
- [ ] Temas customizáveis
- [ ] Internacionalização (i18n)
- [ ] Tooltips explicativos
- [ ] Tour guiado para novos usuários

### Performance
- [ ] Lazy loading de componentes
- [ ] Paginação infinita no histórico
- [ ] Cache de queries com Redis
- [ ] Otimização de queries SQL
- [ ] CDN para assets estáticos

### Segurança
- [ ] Rate limiting nas APIs
- [ ] CSRF protection
- [ ] Validação de inputs com Joi/Yup
- [ ] Sanitização de dados
- [ ] Logs de auditoria

### Testes
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Cypress)
- [ ] Coverage > 80%

---

## 🗓️ Timeline Sugerida

| Fase | Duração | Prioridade |
|------|---------|------------|
| Fase 1 - Melhorias Essenciais | 1-2 semanas | ALTA |
| Fase 2 - Analytics | 2-3 semanas | MÉDIA |
| Fase 3 - Periodização | 3-4 semanas | MÉDIA-BAIXA |
| Fase 4 - IA | 4-6 semanas | BAIXA |
| Fase 5 - Integrações | 2-3 semanas | BAIXA |
| Fase 6 - Mobile | 3-4 semanas | BAIXA |

**Total estimado:** 15-22 semanas (4-6 meses) para implementação completa

---

## 🚀 Quick Wins (Rápido de Implementar)

1. **Duplo clique para editar** (2-3 horas)
2. **Atalhos de teclado** (3-4 horas)
3. **Dark mode** (1 dia)
4. **Templates básicos** (2 dias)
5. **Gráfico de FTP** (1 dia)
6. **TSS acumulado semanal** (4-6 horas)

---

## 📚 Recursos Necessários

### NPM Packages
```json
{
  "fit-file-writer": "^2.0.0",
  "chart.js": "^4.3.0", // Já instalado
  "vue-chartjs": "^5.2.0", // Já instalado
  "pdfkit": "^0.14.0",
  "puppeteer": "^21.0.0",
  "@fullcalendar/vue3": "^6.1.0",
  "date-fns": "^2.30.0"
}
```

### Bibliotecas Úteis
- **Cálculos de ciclismo:** cycling-power-model
- **FIT SDK:** fit-file-parser
- **TrainingPeaks API:** oficial TP SDK

---

## 💡 Sugestões Extras

### Gamificação
- [ ] Badges por conquistas (1000km, 100 workouts, etc)
- [ ] Streaks de treinos consecutivos
- [ ] Leaderboard entre amigos

### Social
- [ ] Compartilhar treinos nas redes sociais
- [ ] Adicionar amigos
- [ ] Comentários em atividades

### Coach Features
- [ ] Múltiplos atletas por coach
- [ ] Dashboard do coach
- [ ] Biblioteca compartilhada de workouts
- [ ] Mensagens entre coach-atleta

---

**Última atualização:** 2025-11-16
**Versão atual:** 0.7 (70% completo)
**Próxima release:** v0.8 (Fase 1 completa)
