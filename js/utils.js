//sleep timer
module.exports.sleep = async (ms) => {
    return new Promise((resolve) => { setTimeout(resolve, ms) })
};


//Use this function to build a string that tracks previous requests
module.exports.buildNewsURL = (searchCriteria) => {
    const URL_BASE = ''
    // const sampleURL = `top-headlines__country=us`

    const { endpoint = 'top-headlines', country, category, pageSize, page, keyword } = searchCriteria;
    const { searchIn, dateFrom, dateTo, language, sortBy } = searchCriteria;

    if (endpoint === 'top-headlines') {
        //top-headlines__ country= & category= & pageSize= & page= & q=
        const immCountry = country ? country === 'all' || country ==='default' ? '' : `country=${country}` : '';
        const immKeyword = immCountry ? (keyword ? `&q=${keyword}` : '') : (keyword ? `q=${keyword}` : 'q=news');
        const immCategory = category ? `&category=${category}` : '';
        const immPageSize = pageSize ? `&pageSize=${pageSize}` : '';
        const immPage = page ? `&page=${page}` : '';

        const newsURL =
            `${URL_BASE}${endpoint}__`
            + `${immCountry}${immKeyword}${immCategory}${immPageSize}`
            + `${immPage}`;
            //+ `${URL_API_PRE}${apiKey}`;
        
        // console.log('The built url: ' + newsURL)

        return newsURL;
    } else if (endpoint === 'everything') {
        //everything__ q= &searchIn=(title/description/content) &from=(2024-01-20) &to=(2024-01-20)
        //&language=(ar/de/en/es/fr/he/it/nl/no/pt/ru/sv/ud/zh)
        //&sortBy=(relevancy/popularity/publishedAt)
        //&pageSize= &page=
        const immKeyword = keyword ? `q=${keyword}` : '&q=news';
        const immSearchIn = searchIn ? `&searchIn=${searchIn}` : '';
        const immFrom = dateFrom ? `&from=${dateFrom}` : '';
        const immTo = dateTo ? `&to=${dateTo}` : '';
        const immLang = language ? `&language=${language}` : '';
        const immSort = sortBy ? `&sortBy${sortBy}` : '';
        const immPageSize = pageSize ? `&pageSize=${pageSize}` : '';
        const immPage = page ? `&page=${page}` : '';

        const newsURL =
            `${URL_BASE}${endpoint}__`
            + `${immKeyword}${immSearchIn}${immFrom}`
            + `${immTo}${immLang}${immSort}`
            + `${immPageSize}${immPage}`;

        // console.log('The built url: ' + newsURL)

        return newsURL;

    }

}