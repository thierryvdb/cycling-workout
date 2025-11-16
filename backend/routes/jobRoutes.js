const express = require('express');
const JobController = require('../controllers/jobController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.post('/initialize', JobController.initializeScheduler);
router.post('/execute/:jobName', JobController.executeJob);
router.get('/status', JobController.getJobStatus);
router.get('/history', JobController.getJobHistory);
router.get('/:jobId', JobController.getJobDetails);

router.get('/user/:userId/sync-status', JobController.getUserSyncStatus);
router.put('/user/:userId/auto-sync', JobController.updateUserAutoSync);
router.post('/user/:userId/sync', JobController.syncUserManually);

module.exports = router;