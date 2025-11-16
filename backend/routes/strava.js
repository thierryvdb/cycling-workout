const express = require('express');
const StravaController = require('../controllers/stravaController');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware);

router.post('/authenticate', StravaController.authenticate);
router.post('/sync', StravaController.syncActivities);
router.get('/activities', StravaController.getUserActivities);
router.post('/link', StravaController.linkActivityToWorkout);
router.get('/activities/:activityId', StravaController.getActivityDetails);

module.exports = router;