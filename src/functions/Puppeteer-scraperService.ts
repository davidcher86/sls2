import puppeteer from 'puppeteer';
import { ScraperInterface } from './commons/scraper.interface';
import { AbstractScrapeHandler } from '../scraper/abstract-scraper';

module.exports.startScrape = async (event: any) => {
    console.log('event:' + event);
    const payload = event;
    const {scraperInfo, query} = payload;

    let scrapeService: ScraperInterface;
    scrapeService = new PuppeteerScrapeService();
    let result: any = [];
    try {
        console.log(`for ${scraperInfo.name} using ${scraperInfo.scrapeArgs.scraperEngine} scraper`);
        let result = await scrapeService.execute(query, scraperInfo);
        console.log('items returned: ' + result.length);
        return result;
    } catch (error) {
        console.log('error: ' + error);
        return [];
    }
    // console.log(`result: ${result}`);

    // return {
    //     statusCode: 200,
    //     body: JSON.stringify({
    //       message: "Go Serverless v4! Your function executed successfully!",
    //     }),
    //   };
}

class PuppeteerScrapeService extends AbstractScrapeHandler implements ScraperInterface {
    public async execute(query: string, scraperInfo: any): Promise<any> {
        const browser = await puppeteer.launch({ 
            args: scraperInfo.disableSec ? [
              '--disable-web-security',
            ] : [],
            headless: true 
        });
 
        console.log('puppeteer startד scraping: ' + scraperInfo.name);
        const page = await browser.newPage();
        if (scraperInfo.disableSec) {
            await page.setBypassCSP(true);
        }
        // await page.setBypassCSP(true);
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        
        // console.log('data: ' + data.userID[0].scrapeArgs.extractArgs);
        const searchUrl = this.constructUri(query, scraperInfo.url);

        // await page.goto(searchUrl, { waitUntil: 'load' });
        // console.log('waiting for: ' + scraperInfo.scrapeArgs.loadSelector);
        // await page.waitForSelector(scraperInfo.scrapeArgs.loadSelector);

        let items: any[] = [];
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
            // await page.exposeFunction("extractValue", this.extractValue);

            console.log('waiting for: ' + scraperInfo.scrapeArgs.loadSelector);
            await page.waitForSelector(scraperInfo.scrapeArgs.loadSelector);

            items = await page.$$eval(scraperInfo.scrapeArgs.listIdentifier, (list, scraperInfo) => {
                let results: any[] = [];
                list.forEach((element: any) => {
                    let dynamicObject : any = {};
                    scraperInfo.scrapeArgs.extractArgs.forEach(async (arg: any) => {
                        let selector = arg.selector;
                        let key = arg.keyName;
                        let type = arg.type;
                        if (element.querySelector(selector) == undefined || element.querySelector(selector) == null) {
                            return;
                        }

                        // console.log(`selector: ${selector}, key: ${key}, type: ${type}`);
                        let value = '';
                        switch (type) {
                            case 'src':
                                value = await element.querySelector(selector).getAttribute('src');
                                break;
                            case 'text':
                            default:
                                value = await element.querySelector(selector).textContent?.trim();
                                break;
                        }

                        dynamicObject[key] = value;
                    });
                    if (Object.keys("name") != undefined && Object.keys("name") != null && Object.keys("name").length > 0)
                        results.push(dynamicObject);
                });
                return results;
            }, scraperInfo);

            console.log('items returned: ' + items.length);
            return items;
        } catch (error) {
            console.log('error: ' + error);
            return [];          
        } finally {
            await browser.close();
        }
    }
    
    extractValue(type: String, selector: String, elem: any): any {
        switch (type) {
            case 'src':

                return elem.querySelector(selector).getAttribute('src');
                break;
            case 'text':
            default:
                return elem.querySelector(selector).textContent?.trim();
        }
    }
}
