import dotenv from 'dotenv';
dotenv.config();
import UserSocket from './socket';
import Tree from './graph'
import { createUser, deleteUser } from './utils/user';
import * as fs from 'fs';

const diagram = `
    flowchart TD
    A[When should I sow paddy in Kharif? : Paddy is sown between the months June-July ] 
    A --> |30| B[What are some other crops that I can grow in Kharif to improve yield? : intercropping, alternative methods ] 
    A --> |50| C[ Where can I buy the seeds from : Go-SUGAM Portal ]
    A --> |20| D[What all should be kept in mind while sowing paddy?: best practices on sowing paddy in Odisha]
    C --> |100| E[ Where can I buy these seeds from : Seeds DBT scheme]
    E --> |100| F[What are the best varieties of seeds available? : advisory on quality of seeds available ]
`;

let finalResult: any= {userFlows:[]}

const walk = async (userSocket: UserSocket, userCount: number) => {
    try {
        const parser = new Tree.Parser(diagram)
        const graph = parser.toGraph();
        await userSocket.connect();
        const walker = new Tree.Walker(graph,userSocket);
        let result = await walker.walk("A[When should I sow paddy in Kharif? : Paddy is sown between the months June-July ]");
        result['totalTimeTaken'] = result.pathTaken.reduce((sum: number, path: any) => sum + path.timeTaken, 0);
        result['averageTimeTaken'] = result['totalTimeTaken'] / result.pathTaken.length;
        result['userId'] = userSocket.deviceId
        finalResult.userFlows.push(result)
        if(finalResult.userFlows.length == userCount) {
            let additionalParams: any = {
                totalTimeTaken: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalTimeTaken, 0)
            }
            additionalParams['averageTimeTaken'] = additionalParams['totalTimeTaken'] / finalResult.userFlows.length;
            additionalParams['totalTimeTaken'] = `${additionalParams['totalTimeTaken']/1000} sec`
            additionalParams['averageTimeTaken'] = `${additionalParams['averageTimeTaken']/1000} sec`
            finalResult = Object.assign(additionalParams, finalResult);
            const jsonData = JSON.stringify(finalResult, null, 2);
            const filePath = './flow-1_result.json';
            fs.writeFile(filePath, jsonData, (err) => {
                if (err) {
                console.error('Error writing JSON data:', err);
                return;
                }
                console.log('Result written to file:', filePath);
            });
        }
        await deleteUser(userSocket.deviceId)
        userSocket.close()
    } catch(err) {
        console.log(err)
        await deleteUser(userSocket.deviceId)
        userSocket.close()
    }
}

(async () => {
    let userCount = 100
    for(let i=1;i<=userCount;i++){
        let data = await createUser(`tester${i}@amakrushi.ai`,`tester-amakrushi-${i}`)
        if(!data) {console.error('unable to create user', `tester${i}@amakrushi.ai`); continue;}
        const userSocket = new UserSocket(data.token,data.user.id)
        walk(userSocket,userCount)
    }
})();
