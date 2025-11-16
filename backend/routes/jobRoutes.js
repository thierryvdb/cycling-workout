const express = require('express');
const JobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Middleware para verificar se o usuário é admin (placeholder)
const requireAdmin = (req, res, next) => {
  // TODO: Implementar lógica de verificação de admin (ex: req.user.role === 'admin')
  next();
};

router.use(authMiddleware, requireAdmin);

router.post('/initialize', JobController.initializeScheduler);
router.post('/execute/:jobName', JobController.executeJob);
router.get('/status', JobController.getJobStatus);
router.get('/history', JobController.getJobHistory);
router.get('/:jobId', JobController.getJobDetails);

router.get('/user/:userId/sync-status', JobController.getUserSyncStatus);
router.put('/user/:userId/auto-sync', JobController.updateUserAutoSync);
router.post('/user/:userId/sync', JobController.syncUserManually);

module.exports = router;