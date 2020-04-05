import fetch from 'node-fetch';
import { Telegram } from 'telegraf';
import { IApiResponse, ICountryData } from './types';
import { convertNumberToEmoji, convertCountryToEmoji, convertStringToHeaderCase } from './helpers';
import { RedisClient } from './redis';
import { updatedDiff } from 'deep-object-diff';

let cacheKey = 'prev-%country%';

const statsToDisplay = [
    'total_cases',
    'total_recovered',
    'total_deaths',
    'total_active_cases',
    'total_new_cases_today',
    'total_new_deaths_today',
    'total_serious_cases',
    'total_danger_rank',
];

async function init() {
    const redisClient = new RedisClient(process.env.REDIS_URL!);
    const telegramClient = getTelegramClient(process.env.BOT_TOKEN!);
    cacheKey = cacheKey.replace('%country%', process.env.COUNTRY!.toLowerCase());

    const prevCountryData = await redisClient.getCache(cacheKey);
    const currCountryData = await fetchCountryStats(process.env.API_URL!, process.env.COUNTRY!);
    const message = getMessage(currCountryData, statsToDisplay);

    if (!prevCountryData) {
        await telegramClient.sendMessage(process.env.CHAT_ID!, message);
        await redisClient.setCache(cacheKey, currCountryData);
    } else if (hasDataChanged(prevCountryData, currCountryData)) {
        await telegramClient.sendMessage(process.env.CHAT_ID!, message);
        await redisClient.setCache(cacheKey, currCountryData);
    } else {
        // nothing has changed don't send message
    }
    return;
}

function getTelegramClient(botToken: string) {
    return new Telegram(botToken);
}

async function fetchCountryStats(url: string, country: string) {
    const resp = await fetch(`${url}?countryTotal=${country}`);
    if (!resp.ok) {
        throw new Error('Unable to reach api');
    }
    const respJson = (await resp.json()) as IApiResponse;
    if (respJson.stat !== 'ok') {
        throw new Error('Unsuccessful response from api');
    }
    return respJson.countrydata[0];
}

function hasDataChanged(prevCountryData: ICountryData, currCountryData: ICountryData): boolean {
    return JSON.stringify(prevCountryData) !== JSON.stringify(currCountryData);
}

function findChangedData(prevCountryData: ICountryData, currCountryData: ICountryData) {
    const updatedFields = updatedDiff(prevCountryData, currCountryData);
    return updatedFields;
}

function getMessage(countryData: ICountryData, statKeys: string[]) {
    return statKeys.reduce((acc: string, key: string) => {
        const stats = countryData[key] != null ? convertNumberToEmoji(countryData[key]!) : '⚠️';
        return (acc += `${convertStringToHeaderCase(key)}: ${stats}\n`);
    }, `${convertCountryToEmoji(process.env.COUNTRY!)}\n`);
}

init()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => {
        // success exit
        process.exit(0);
    });
