import express from 'express';
import workoutController from '../../controllers/coach/workout-controller';

let router = express.Router();


router.post('/user/add', workoutController.addUserWorkout);
router.get('/user/search', workoutController.getUserWorkout);

router.get('/search', workoutController.searchWorkout);
router.post('/add', workoutController.addWorkout);


export default router ;