import { MongoMemoryServer } from "mongodb-memory-server";

export async function createDatabase() {
    const mongoServer = await MongoMemoryServer.create();
    
    return {
        dbConnectionString: mongoServer.getUri(),
        closeDatabase: async () => {
            await mongoServer.stop();
        }
    }
}

export const nonExistentId = "999999999999999999999999";
export const invalidId = "1234";
