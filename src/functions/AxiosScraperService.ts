import { ScraperInterface } from '@functions/commons/scraper.interface';
const cheerio = require('cheerio'); 
// const XRay = require('x-ray');
// const x = XRay();
const axios = require('axios');

exports.executeAxios = async (event: any) => {
    const payload = JSON.parse(event.body);
    const { scraperInfo, query } = payload;

    let scrapeService: ScraperInterface;
    scrapeService = new AxiosScraperService();

    console.log(`for ${scraperInfo.name} using ${scraperInfo.scrapeArgs.scraperEngine} scraper`);
    let result = await scrapeService.execute(query, scraperInfo);

    return result;
}

class AxiosScraperService implements ScraperInterface {
    public async execute(query: string, scraperInfo: any): Promise<any> {
        // const x = require('x-ray-scraper');
 
        const searchUrl = scraperInfo.url.replace('{query}', query);
        console.log('searchUrl ' + searchUrl);

        return axios.get(searchUrl) 
	        .then(( data: any ) => {
                console.log(data)
                const html = cheerio.load(data); 

                // elementList
                return data;
        });
    }
}