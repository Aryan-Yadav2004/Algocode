import bodyParser from "body-parser"
import express from 'express'

import serverConfig from './config/server.config.js'
// import runCpp from "./containers/runCppDocker.js"
// import sampleQueueProducer from './producers/sampleQueueProducer.js'
import apiRouter from './routes/index.js'
import { submission_queue } from "./utils/constanst.js"
import errorHandler from './utils/errorHandler.js'
import { SubmissionWorker } from "./workers/SubmissionWorker.js"
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(bodyParser.text())

app.use('/api', apiRouter)

app.use(errorHandler)


app.listen(serverConfig.PORT, () => {
    console.log('server started at *:' + 3000);
    SubmissionWorker(submission_queue);

    

    // sampleQueueProducer('SampleJob',{
    //     name: 'Ayush',
    //     company: 'Microsoft',
    //     position: 'SDE L61',
    //     loaction: 'Remote | BLR | Nodia'
    // },2).then(res => console.log(res + 'hi')).catch(err => console.log(err))

    // sampleQueueProducer('SampleJob',{
    //     name: 'Aryan',
    //     company: 'Microsoft',
    //     position: 'SDE L61',
    //     loaction: 'Remote | BLR | Nodia'
    // },1).then(res => console.log(res + 'hi')).catch(err => console.log(err))
   
//     const code = `
//     #include<iostream>
//     using namespace std;

//     int main() {
//         int x;
//         cin>>x;
//         cout<<"Value of x is "<<x<<endl;
//         for(int i = 0; i < x; i++){
//             cout<<i<<endl;
//         }
//         return 0;
//     }
// `

//     const inputTestCase = '100';

//     submissionQueueProducer({"1234" : {
//         language: 'CPP',
//         inputTestCase,
//         code
//     }});

    // runCpp(code, inputTestCase);

})
