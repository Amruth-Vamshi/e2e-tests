import dotenv from 'dotenv';
dotenv.config();
import UserSocket from './socket';
import Tree from './graph'
import { createUser } from './utils/user';

let finalResult: any= {userFlows:[],errors:[]}

const walk = async (userSocket: UserSocket, diagram:string) => {
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
        await userSocket.close(finalResult)
    } catch(err) {
        console.log(err)
        let error: any = {'userId': userSocket.deviceId}
        error['error'] = `${err}`
        finalResult.errors.push(error)
        await userSocket.close(finalResult)
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
        walk(userSocket,diagram)
    })
};
