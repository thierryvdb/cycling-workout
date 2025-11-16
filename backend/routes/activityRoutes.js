const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware.js');

// Todas as rotas aqui são protegidas e requerem autenticação
router.use(authMiddleware);

// GET /api/activities - Busca a lista de atividades do usuário logado
router.get('/', ActivityController.getActivitiesForUser);

// GET /api/activities/:activityId - Busca os detalhes de uma atividade específica
router.get('/:activityId', ActivityController.getActivityDetails);

// GET /api/activities/:activityId/streams - Busca os dados de telemetria (streams) de uma atividade
router.get('/:activityId/streams', ActivityController.getActivityStreams);

module.exports = router;