const express = require('express');
const WorkoutController = require('../controllers/workoutController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', WorkoutController.createWorkout);
router.get('/', WorkoutController.getWorkouts);
router.get('/:workoutId', WorkoutController.getWorkout);
router.put('/:workoutId', WorkoutController.updateWorkout);
router.delete('/:workoutId', WorkoutController.deleteWorkout);
router.post('/:workoutId/export', WorkoutController.exportWorkout);

module.exports = router;