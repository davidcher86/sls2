export class AbstractScrapeHandler {
    protected constructUri(query: string, uri: string): string {
        const searchUrl = uri.replace('{query}', query);
        console.log('searchUrl ' + searchUrl);

        return searchUrl;
    }
}