import { AbstractScrapeHandler } from "@scraper/abstract-scraper";
import { ScraperInterface } from "@functions/commons/scraper.interface";

const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

exports.startScrape = async (event: any) => {
    const payload = JSON.parse(event.body);
    const { scraperInfo, query } = payload;

    let scrapeService: ScraperInterface;
    scrapeService = new SeleniumScrapeService();

    console.log(`for ${scraperInfo.name} using ${scraperInfo.scrapeArgs.scraperEngine} scraper`);
    let result = await scrapeService.execute(query, scraperInfo);

    return result;
}

export class SeleniumScrapeService extends AbstractScrapeHandler implements ScraperInterface {
    private driver: any = null;

    public async execute(query: string, scraperInfo: any): Promise<any> {
        await this.initDriver();
        let results: any[] = [];

        try {
            const searchUrl = this.constructUri(query, scraperInfo.url);
            
            await this.driver.get(searchUrl);
            await this.driver.wait(until.elementLocated(By.css(scraperInfo.scrapeArgs.loadSelector)), 10000);

            const elements = await this.driver.findElements(By.css(scraperInfo.scrapeArgs.listIdentifier));
            const items = elements.map(async (elem: any) => {
                let dynamicObject1 : any = {};
                for (let arg of scraperInfo.scrapeArgs.extractArgs) {
                    const { keyName, selector, type } = arg;
                    console.log(`selec ${arg.selector}`);
                    let value = '';
                    switch (type) {
                        case 'src':
                            value = await elem.findElement(By.css(selector)).getAttribute('src');
                            break;
                        case 'text':
                        default:
                            console.log(`selector ${arg.selector}`)
                            value = await elem.findElement(By.css(selector)).getText();
                            break;
                    }

                    if (value != undefined && value != null && value.trim().length > 0) {
                        dynamicObject1[arg.keyName] = value;
                    }
                }
                results.push(dynamicObject1);

                return dynamicObject1;
            });
            
            await Promise.all(items);
        } catch (error) {
            console.error("Error while scraping:", error);
            return [];
        } finally {
            await this.closeDriver();
            return results;
        }
    }

    async initDriver() {
        this.driver = await new Builder().forBrowser('chrome').build();
    }

    async closeDriver() {
        if (this.driver) {
          await this.driver.quit();
        }
    }

    sleep(ms: any) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
