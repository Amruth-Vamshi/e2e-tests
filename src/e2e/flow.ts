import { testRunner } from "./testRunner";

(async ()=>{
    testRunner(
        process.env.INPUT_GRAPH || '',
        parseInt(process.env.INPUT_USER_COUNT || '10')
    )
})()
