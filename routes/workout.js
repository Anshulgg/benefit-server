import express from 'express';
import workoutController from '../controllers/workout-controller';

let router = express.Router();

// TODO: Remove this route.
router.get('/exercise/list', workoutController.getExerciseList);
router.get('/exercise/:id/url', workoutController.getSignedUrl);
router.get('/exercise/import', workoutController.importExercises);
router.get('/free', workoutController.getFreeWorkout);


router.get('/user/get', workoutController.getUserDefaultWorkout);


export default router ;