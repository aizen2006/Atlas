
interface Memory{

}



export class VectorStore {
    constructor(){}

    async create(memory:Memory){}

    async getById(id:number){}

    async delete(id:number){}

    async upsertEmbeddings(id:number,embeddings:number[]){}

    async deleteEmbeddings(id:number,embeddings:number[]){}

    async semanticSearch(queryEmbedding: number[], limit = 10) {
    //     Raw sqlite-vec query
    //     const ids = ...

    //     Drizzle fetch
    //     return ...
    }
}