import mongoose , {Schema} from 'mongoose';

const WorkoutSchema = new mongoose.Schema({

    name: String,
    search_name: {
        type: String,
        unique: true
    },
    description: String,
    exercises: [{
        exercise: {
            type: Schema.Types.ObjectId,
            ref: 'Exercise'
        } ,
        reps : Number ,
        sets : Number ,
        rest : Number
    }]
});

export default mongoose.model('Workout2', WorkoutSchema);
