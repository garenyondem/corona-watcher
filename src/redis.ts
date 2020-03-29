
import ioRedis, { Redis } from 'ioredis';
import { ICountryData } from './types';

export class RedisClient {

    #client: Redis

    constructor(host: string) {
        this.#client = new ioRedis(host);
    }
    async  setCache(key: string, countryData: ICountryData) {
        const cachResult = await this.#client.set(key, JSON.stringify(countryData));
        return cachResult;
    }
    async  getCache(key: string): Promise<ICountryData | null> {
        const prevCountryData = await this.#client.get(key);
        return prevCountryData ? (JSON.parse(prevCountryData) as ICountryData) : null;
    }
}