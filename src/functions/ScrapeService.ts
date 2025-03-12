const AWS = require("aws-sdk");
const lambda = new AWS.Lambda();
const data = require('@mocked-data/data.json');
const serverlessEnv = process.env.SERVERLESS_ENV;

exports.start = async (event: any) => {
    console.log(`env: ${serverlessEnv}, body: ${JSON.stringify(event)}`)
    const payload = JSON.parse(event.body);
    // const payload = event.body;
    console.log(JSON.stringify(payload));
    const query = payload.query;

    // let scrapeService: ScraperInterface;
    let scrapeServiceName: string;
    let name: string;
    const scrapeList = data.userID;

    let responseObject : any = {};

    const results: any = scrapeList.filter((scrape: any) => scrape.activated).map(async (scraperInfo: any) => {
        console.log('scrape: ', scraperInfo.name);
        switch (scraperInfo.scrapeArgs.scraperEngine) {
            case 'static':
                scrapeServiceName = "sls-scraper-dev-axiosScraper";
                name = "Puppeteer-scraperService";
                // scrapeService = new AxiosScraperService();
                break;
            case 'playwright':
                scrapeServiceName = "sls-scraper-dev-playrightScraper";
                name = "Playwright-scraperService";
                // scrapeService = new PlaywrightScrapeService();
                break;
            case 'selenium':
                scrapeServiceName = "sls-scraper-dev-seleniumScraper";
                name = "Selenium-scraperService";
                // scrapeService = new SeleniumScrapeService();
                break;
            case 'puppeteer':
            default:
                scrapeServiceName = "sls-scraper-dev-puppeteerScraper";
                name = "Puppeteer-scraperService";
                // scrapeService = new PuppeteerScrapeService();
                break;
        }

        console.log(`for ${scraperInfo.name} using ${scraperInfo.scrapeArgs.scraperEngine} scraper`);

        // const cachedResult = await this.cacheService.get(`${query}-${scraperInfo.name}`);

        let result;
        // if (cachedResult) {
        //     console.log(`retrieving reult from cache for ${query}-${scraperInfo.name}`);
        //     result = cachedResult
        // } else {
            // result = await scrapeService.execute(query, scraperInfo);
            console.log('payload: ', payload);
            if (serverlessEnv === 'local') {
                console.log('local');
                // const myFunction = require(`./${name}`);
                const myFunction = require(`./Puppeteer-scraperService`);

                result = await myFunction.startScrape({scraperInfo: scraperInfo, query: query});
            } else {
                result = await lambda.invoke({
                    FunctionName: scrapeServiceName,
                    InvocationType: "RequestResponse",
                    Payload: JSON.stringify({scrapeInfo: scraperInfo, query: query}), // Sending payload
              }).promise();
        //     await this.cacheService.set(`${query}-$test`, result, 40000);
            }

        // const res = await scrapeService.execute(query, scraperInfo);
        console.log('result: ', result);
        responseObject[scraperInfo.name] = result;
        return result;
    });

    // await Promise.all(results);
    // return responseObject;
    // await Promise.all(results);
    return {
        statusCode: 200,
        body: responseObject,
    };
}
