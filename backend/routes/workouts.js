const express = require('express');
const WorkoutController = require('../controllers/workoutController');
// const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Desabilitado temporariamente para testes
// router.use(authMiddleware);

router.post('/', WorkoutController.createWorkout);
router.get('/', WorkoutController.getWorkouts);
router.get('/:workoutId', WorkoutController.getWorkout);
router.put('/:workoutId', WorkoutController.updateWorkout);
router.delete('/:workoutId', WorkoutController.deleteWorkout);
router.post('/:workoutId/export', WorkoutController.exportWorkout);

module.exports = router;