import mongodb from '../database/mongodb';
import Papa from 'papaparse';
import fs from 'fs';

let file = fs.readFileSync('f.csv', 'utf-8');
import Exercise from '../models/exercise';


mongodb.getConnection()
    .then(() => {
        Papa.parse(file, {
            header: true,
            complete: function (results) {
                // console.log("Finished:", results.data);
                results.data.forEach(data => {
                    let exercise = new Exercise({
                        sno: parseInt(data.Sno),
                        name: data['Exercise Name'],
                        intensity: data['Exercise Intensity'],
                        mets: parseInt(data.METS),
                        timeTaken: data['Time Taken'],
                        base: data['Base'],
                        repFormat: data['Rep Format'],
                        flow: data.Flow,
                        type: data.Type,
                        videoA: data['Video-A'] === '1',
                        videoB: data['Video-B'] === '1',
                    });

                    // exercise.save().then(da => {
                    //     console.log(da);
                    // });

                });

            }
        });
    })
    .catch((err) => {
        console.log(err);
    });


