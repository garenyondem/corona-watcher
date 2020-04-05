export interface IApiResponse {
    stat: string;
    countrydata: ICountryData[];
}

export interface ICountryData {
    [key: string]: number | undefined;
    total_cases?: number;
    total_recovered?: number;
    total_deaths?: number;
    total_new_cases_today?: number;
    total_new_deaths_today?: number;
    total_active_cases?: number;
    total_serious_cases?: number;
    total_danger_rank?: number;
}
