import { testRunner } from "./testRunner";
import dotenv from 'dotenv';
dotenv.config();

(async ()=>{
    console.log(process.env.INPUT_GRAPH,process.env.INPUT_USER_COUNT)
    testRunner(
        process.env.INPUT_GRAPH || '',
        parseInt(process.env.INPUT_USER_COUNT || '10')
    )
})()
