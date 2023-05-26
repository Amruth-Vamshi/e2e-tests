import dotenv from 'dotenv';
dotenv.config();
import UserSocket from './socket';
import Tree from './graph'
import { createUser, deleteAllUsers } from './utils/user';
import * as fs from 'fs';

let finalResult: any= {userFlows:[]}

const walk = async (userSocket: UserSocket, userCount: number, diagram:string) => {
    try {
        const parser = new Tree.Parser(diagram)
        const graph = parser.toGraph();
        await userSocket.connect();
        const walker = new Tree.Walker(graph,userSocket);
        let result = await walker.walk(parser.firstNode);
        result['totalTimeTaken'] = result.pathTaken.reduce((sum: number, path: any) => sum + path.timeTaken, 0);
        result['averageTimeTaken'] = result['totalTimeTaken'] / result.pathTaken.length;
        result['totalPositveResponse'] = result.pathTaken.reduce((sum: number, path: any) => sum + (path.similarityResult == "Positive"? 1 : 0), 0);
        result['totalNegativeResponse'] = result.pathTaken.length - result['totalPositveResponse']
        result['userId'] = userSocket.deviceId
        finalResult.userFlows.push(result)
        if(finalResult.userFlows.length == userCount) {
            let additionalParams: any = {
                totalTimeTaken: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalTimeTaken, 0),
                totalPositiveResponse: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalPositveResponse, 0),
                totalNegativeResponse: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalNegativeResponse, 0)
            }
            additionalParams['averageTimeTaken'] = additionalParams['totalTimeTaken'] / finalResult.userFlows.length;
            additionalParams['totalTimeTaken'] = `${additionalParams['totalTimeTaken']/1000} sec`
            additionalParams['averageTimeTaken'] = `${additionalParams['averageTimeTaken']/1000} sec`
            finalResult = Object.assign(additionalParams, finalResult);
            const jsonData = JSON.stringify(finalResult, null, 2);
            const filePath = './testResult.json';
            await deleteAllUsers()
            fs.writeFile(filePath, jsonData, (err) => {
                if (err) {
                console.error('Error writing JSON data:', err);
                return;
                }
                console.log('Result written to file:', filePath);
            });
        }
        userSocket.close()
    } catch(err) {
        console.log(err)
        userSocket.close()
    }
}

export async function testRunner (diagram: string,userCount: number){
    let userData = []
    for(let i=1;i<=userCount;i++){
        let data = await createUser(`tester_${i}@amakrushi.ai`,`tester-amakrushi-${i}`,i)
        if(!data) {console.error('unable to create user', `tester_${i}@amakrushi.ai`); continue;}
        userData.push({token: data.token,id: data.user.id})
    }

    userData.forEach((user,index)=>{
        const userSocket = new UserSocket(user.token,user.id,index+1)
        walk(userSocket,userCount,diagram)
    })
};
