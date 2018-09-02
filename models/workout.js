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

WorkoutSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret, options) => {
        ret.videoCount = 0;

        ret.exercises.forEach(
            ex => {
                ret.videoCount++;
                if (ex.videoA) {
                    ret.videoCount++;
                    if (ex.videoB) {
                        ret.videoCount++
                    }
                }
            }
        );
    },
});

export default mongoose.model('Workout', WorkoutSchema);
