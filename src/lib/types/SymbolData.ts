export interface SymbolData {
    symbol: string;
    description: string;
    listedMarket: string;
    priceIncrements: string;
    tradingHours: string;
    options: boolean;
    instrumentType: string;
}

export const mapSymbolDataFromApi = (apiData: any): SymbolData => {
    return {
        symbol: apiData.symbol,
        description: apiData.description,
        listedMarket: apiData['listed-market'],
        priceIncrements: apiData['price-increments'],
        tradingHours: apiData['trading-hours'],
        options: apiData.options,
        instrumentType: apiData['instrument-type']
    }
}