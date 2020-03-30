import fetch from 'node-fetch';
import { Telegram } from 'telegraf';
import { IApiResponse, ICountryData } from './types';
import { convertToEmoji } from './helpers';
import { difference } from 'deep-diff-object';
import { RedisClient } from './redis';

const key = 'prev-tr';

async function init() {
    const redisClient = new RedisClient(process.env.REDIS_URL!);
    const telegramClient = getTelegramClient(process.env.BOT_TOKEN!);

    const prevCountryData = await redisClient.getCache(key);
    const currCountryData = await fetchCountryStats(process.env.API_URL!, process.env.COUNTRY!);

    const message = getMessage(currCountryData);

    if (!prevCountryData) {
        // cache and send message
        await telegramClient.sendMessage(process.env.CHAT_ID!, message);
        await redisClient.setCache(key, currCountryData);
    } else if (hasDataChanged(prevCountryData, currCountryData)) {
        // cache and send message
        await telegramClient.sendMessage(process.env.CHAT_ID!, message);
        await redisClient.setCache(key, currCountryData);
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
    const changes = difference(currCountryData, prevCountryData);
    return !!Object.keys(changes).length;
}

function getMessage(countryData: ICountryData) {
    return (
        `🇹🇷\n` +
        `Total Cases: ${convertToEmoji(countryData.total_cases)}\n` +
        `Total Recovered: ${convertToEmoji(countryData.total_recovered)}\n` +
        `Total Deaths: ${convertToEmoji(countryData.total_deaths)}\n` +
        `Total Active Cases: ${convertToEmoji(countryData.total_active_cases)}\n` +
        `Total New Cases Today: ${convertToEmoji(countryData.total_new_cases_today)}\n` +
        `Total New Deaths Today: ${convertToEmoji(countryData.total_new_deaths_today)}\n` +
        `Total Serious Cases: ${convertToEmoji(countryData.total_serious_cases)}`
    );
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
