import Exercise from '../../models/exercise';
import Workout from "../../models/workout";
import UserWorkout from "../../models/user-workout";

const workoutController = {

    searchExercise: (req, res, next) => {
        let query = req.query.q;
        console.log(query);
        let regex = new RegExp('^' + query + '$', "i");
        Exercise.find({name: {'$regex': query, '$options': 'i'}}).limit(5).then(data => {
            console.log(data);

            res.json({
                success: true,
                data: data
            });

        }).catch(err => {
            console.error(err);
            next(err);
        });

    },

    searchWorkout: (req, res, next) => {
        let query = req.query.q;
        console.log(query);
        let regex = new RegExp('^' + query + '$', "i");
        Workout.find({search_name: {'$regex': query, '$options': 'i'}}).limit(5).populate({
            path: 'exercises.exercise'
        }).then(data => {
            console.log(data);
            res.json({
                success: true,
                data: data
            });

        }).catch(err => {
            console.error(err);
            next(err);
        });

    },

    addWorkout: (req, res, next) => {

        let unique = {
            search_name: req.body.search_name
        };

        let data = {
            description: req.body.description,
            exercises: req.body.exercises,
            name: req.body.name,
        };


        // Workout.findOneAndUpdate(unique, data, {upsert: true, setDefaultsOnInsert: true, new: true}).then(result => {
        //     res.json({
        //         success: true,
        //         data: result
        //     });
        // }).catch(err => {
        //     if (error.name === 'MongoError') {
        //         return next(new Error("Workout with Same Search Name Exists. Choose other name."));
        //     }
        //     return next(new Error("Could not Save Workout"));
        // });


        let combined = {
            ...data,
            ...unique
        };

        const newWorkout = new Workout(combined);
        newWorkout.save((error, result) => {
            if (error) {
                if (error.name === 'MongoError') {
                    return next(new Error("Workout with Same Search Name Exists. Choose other name."));
                }
                return next(new Error("Could not Save Workout"));
            }
            res.json({
                success: true,
                data: result
            });
        });
    },

    addUserWorkout: (req, res, next) => {

        let unique = {
            client: req.body.client,
            date: req.body.date
        };

        let data = {
            workout: req.body.workout,
        };


        UserWorkout.findOneAndUpdate(unique, data, {
            upsert: true,
            setDefaultsOnInsert: true,
            new: true
        }).then(result => {
            res.json({
                success: true,
                data: result
            });
        }).catch(err => {
            console.error(err);
            return next(new Error("Could not Save Workout for User"));
        });

    },

    getUserWorkout: (req, res, next) => {
        let query = {
            client: req.query.client,
            date: req.query.date
        };
        UserWorkout.findOne(query).populate({
            path: 'workout',
            populate: {
                path: 'exercises.exercise'
            }
        }).then(result => {
            res.json({
                success: true,
                data: result
            });
        }).catch(err => {
            return next(new Error("Could not Fetch Workout for User"));
        });

    }

};

export default workoutController;