export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined,
            PORT: string,
            MONGO_URL: string,
            SECRET_KEY: string,
            // add more environment variables and their types here
        }
    }
}