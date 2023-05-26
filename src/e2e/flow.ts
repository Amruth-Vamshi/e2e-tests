import { testRunner } from "./testRunner";

(async ()=>{
    testRunner(
        `Graph TD
        A[When should I sow paddy in Kharif? : Paddy is sown between the months June-July ] 
        A --> |30| B[What are some other crops that i can grow in Kharif to improve yield? : intercropping, alternative methods ] 
        A --> |50| C[ Where can I buy the seeds from : Go-SUGAM Portal ]
        A --> |20| D[What all should be kept in mind while sowing paddy?: best practices on sowing paddy in Odisha]
        C --> |100| E[ Where can I buy these seeds from : Seeds DBT scheme]
        E --> |100| F[What are the best varities of seeds available? : advisory on qulity of seeds available ]`,
        10
    )
})()
