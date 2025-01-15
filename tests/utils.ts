import { MongoMemoryServer } from "mongodb-memory-server";

export type Teardown = () => Promise<void>;

export interface DBConfig {
    dbConnectionString: string
    closeDatabase: Teardown
}

export async function createDatabase(): Promise<DBConfig> {
    const mongoServer = await MongoMemoryServer.create();

    return {
        closeDatabase: async () => {
            await mongoServer.stop();
        },
        dbConnectionString: mongoServer.getUri(),
    };
}

export const invalidId = "1234";
export const nonExistentId = "999999999999999999999999";
