import UserSocket from "./socket";
//@ts-ignore
import { v4 as uuid } from 'uuid';
import { Matrix } from 'ml-matrix';
import { getEmbedding } from "./utils/ai-tools";
import { logger } from "./utils/logger";

type TreeNode = string;
type WeightedEdge = [TreeNode, TreeNode, number];

interface Graph {
    [key: string]: { [key: string]: number };
}

class Parser {
    private diagram: string;
    public firstNode: string;

    constructor(diagram: string) {
        this.diagram = diagram;
        this.firstNode = this.diagram.split("     ")[1].trim()
    }

    private parse(): WeightedEdge[] {
        const edges = this.diagram.split("     ").filter(line => line.includes('--'));
        let ret_edges: WeightedEdge[] =  edges.map(edge => {
            const [from, toWithWeight] = edge.split('-->');
            const [_, weight, to] = toWithWeight.split('|');

            return [from.trim(), to.trim(), Number(weight) / 100];
        });
        return  ret_edges
    }

    public toGraph(): Graph {
        const graph: Graph = {};
        const edges = this.parse();
        for (const [from, to, weight] of edges) {
            if (!(from in graph)) {
                graph[from] = {};
            }

            graph[from][to] = weight;
        }

        return graph;
    }
}

class Walker {
    private graph: Graph;
    private socket: UserSocket;
    private conversationId: string;


    constructor(graph: Graph, socket: UserSocket) {
        this.graph = graph;
        this.socket = socket
        this.conversationId = uuid()
    }

    public async walk(start: TreeNode): Promise<any> {
        let result: any = {pathTaken:[]}
        let [currentNode, messageFull] = start.split("[");
        let [message, expectedMessage] = messageFull.split(":");
        expectedMessage = expectedMessage.replace("]", "");
        const pathTaken: string[] = []
        while (true) {
            pathTaken.push(currentNode)
            logger.logProcess(`User${this.socket.index}`,`: Path taken - ${pathTaken}`)
            message = message.trim();
            expectedMessage = expectedMessage.trim();
            let messageResult: any = {
                node: currentNode,
                query: message,
                expectedResponse: expectedMessage
            }
            const startTime = new Date().getTime()

            const reply = await Promise.race([
                this.socket.emitEvent("botRequest", {
                    content: {
                        text: message,
                        userId: this.socket.deviceId,
                        appId: "AKAI_App_Id",
                        channel: "AKAI",
                        from: this.socket.deviceId,
                        context: null,
                        accessToken: null,
                        conversationId: this.conversationId
                    },
                    to: this.socket.deviceId, 
                    conversationId: this.conversationId
                }),
                new Promise((resolve, _) => {
                    setTimeout(() => {
                        resolve({
                            content:{
                                title: `No response received in ${parseInt(process.env.REQUEST_TIMEOUT_DURATION || '60000')/1000} sec`
                            }
                        });
                    }, parseInt(process.env.REQUEST_TIMEOUT_DURATION || '60000'));
                })
            ]);
            messageResult['timeTaken'] = new Date().getTime() - startTime
            messageResult['receivedResponse'] = reply.content.title
            messageResult['similarity'] =  await this.checkSimilarity(reply.content.title, message)
            messageResult['similarityResult'] = parseFloat(messageResult['similarity']) > 0.97 ? "Positive": "Negative"
            result.pathTaken.push(messageResult)
            const neighbors = this.graph[currentNode];
            if (!neighbors) {
                return result
            }
            const neighborsArr = Object.keys(neighbors);
            const weights = neighborsArr.map(neighbor => neighbors[neighbor]);
            let choice = this.weightedRandom(neighborsArr, weights);
            [currentNode, messageFull] = choice.split("[");
            [message, expectedMessage] = messageFull.split(":");
            expectedMessage = expectedMessage.replace("]", "");
        }
    }

    private weightedRandom(options: string[], weights: number[]): string {
        let i, pickedIndex,
            totalWeight = weights.reduce((prev, curr) => prev + curr, 0);
            
        let randomNum = Math.random() * totalWeight;
        
        for (i = 0; i < options.length; i++) {
            randomNum -= weights[i];

            if (randomNum < 0) {
                pickedIndex = i;
                break;
            }
        }

        let pickedNode = options[pickedIndex || 0];
        return pickedNode
    }

    private async checkSimilarity(receivedResponse: string, expectedResponse: string): Promise<any> {
        function cosineSimilarity(vector1: number[], vector2: number[]): number {
          const matrix1 = Matrix.columnVector(vector1);
          const matrix2 = Matrix.columnVector(vector2);
          
          const dotProduct = matrix1.transpose().mmul(matrix2).get(0, 0);
          const norm1 = matrix1.norm("frobenius");
          const norm2 = matrix2.norm("frobenius");
          
          return dotProduct / (norm1 * norm2);
        }
        
        const vector1 = await getEmbedding(receivedResponse)
        const vector2 = await getEmbedding(expectedResponse)
      
        const similarity = cosineSimilarity(vector1[0].embedding, vector2[0].embedding);
        return similarity;
      }
      
}

export default { Walker, Parser }


