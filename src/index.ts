import fetch from 'node-fetch';
import { Telegram } from 'telegraf';
import { IApiResponse, ICountryData } from './types';

async function init() {
    const client = getTelegramClient(process.env.BOT_TOKEN!);
    const countryData = await fetchCountryStats(process.env.API_URL!, process.env.COUNTRY!);
    const message = getMessage(countryData);
    await client.sendMessage(process.env.CHAT_ID!, message);
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

function getMessage(countryData: ICountryData) {
    return `🇹🇷 
            Total Cases: ${countryData.total_cases}
            Total Recovered: ${countryData.total_recovered}
            Total Deaths: ${countryData.total_deaths}
            Total Active Cases: ${countryData.total_active_cases}
            Total New Cases Today: ${countryData.total_new_cases_today}
            Total New Deaths Today: ${countryData.total_new_deaths_today}
            Total Serious Cases: ${countryData.total_serious_cases}
            `;
}

init()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        process.exit();
    });
