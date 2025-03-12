export interface ScraperInterface {
    execute: (query: string, scraperInfo: any) => Promise<any>;
}