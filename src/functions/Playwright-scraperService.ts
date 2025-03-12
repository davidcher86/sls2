import { chromium } from 'playwright';
import { ScraperInterface } from './commons/scraper.interface';
import { AbstractScrapeHandler } from '../scraper/abstract-scraper';

module.exports.startScrape = async (event: any) => {
    // const payload = event.body;
    const { scraperInfo, query } = event;

    let scrapeService: ScraperInterface;
    scrapeService = new PlaywrightScrapeService();

    console.log(`for ${scraperInfo.name} using ${scraperInfo.scrapeArgs.scraperEngine} scraper`);
    let result = await scrapeService.execute(query, scraperInfo);

    return result;
}

export class PlaywrightScrapeService extends AbstractScrapeHandler implements ScraperInterface {
    public async execute(query: string, scraperInfo: any): Promise<any> {
        // Launch a new instance of a Chromium browser with headless mode
        // disabled for visibility
        const browser = await chromium.launch({
            headless: false
        });

        console.log('playwrite starts scraping: ' + scraperInfo.name);
        
        // Create a new Playwright context to isolate browsing session
        const context = await browser.newContext();
        // Open a new page/tab within the context
        const page = await context.newPage();

        const searchUrl = this.constructUri(query, scraperInfo.url);

        try {
            console.log(`searchUrl ${searchUrl}`);
            await page.goto(searchUrl);

            // Wait for 1 second to ensure page content loads properly
            await page.waitForTimeout(1000);

            const items = await page.$$eval(scraperInfo.scrapeArgs.listIdentifier, (list, scraperInfo) => {
                // return list;
                let results: any[] = [];
                let dynamicObject : any = {};
                list.forEach((element: any) => {
                    scraperInfo.scrapeArgs.extractArgs.forEach((arg: any) => {
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
                                value = element.querySelector(selector).getAttribute('src');
                                break;
                            case 'text':
                            default:
                                value = element.querySelector(selector).textContent?.trim();
                                break;
                        }
                        // console.log(`value: ${value}`);
                        dynamicObject[key] = value;
                    });
                    
                    results.push(dynamicObject);
                });
                return results;
            }, scraperInfo);

            return items;
        } catch (error) {
            console.log('error: ' + error);
            return [];          
        } finally {
            // Close the browser context and terminate the browser instance
            await context.close();
            await browser.close();
        }
    }
}