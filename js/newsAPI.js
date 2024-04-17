const apiKey = process.env.API_KEY

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(apiKey);

// const { systemLog } = require('../logs/logHandler');
const { writeCache, checkCache, setLimit, checkLimit } = require('./redisClient');
const { buildNewsURL } = require('./utils');
const handleError = require('./handleError');
const { ERROR_NEWS } = require('./DEFAULTS')
const LIMIT_MESSAGE = 'Server limit reached. Please come back in 24hrs...'


//Handles calls to the news API
module.exports.results = async (searchRequest) => {

  // systemLog(`News request received: ${searchRequest}`);
  let myResults = { "empty": "results" };
  const searchText = buildNewsURL(searchRequest);
  const cachedResult = await checkCache(searchText);

  //Check Cache
  if (!cachedResult) {
    const timeLeft = await checkLimit();
    //If request limit reached:
    if (timeLeft !== 'none') {
      myResults = { ...ERROR_NEWS, message: LIMIT_MESSAGE };
      console.log('Time left till requests can be made: ' + timeLeft + 'ms');
      return myResults;
    }


    console.log('Requesting from server...')
    //There are only 2 endpoints for the NewsAPI. Each takes an object with search properties.
    //See notes below
    try {
      if (searchRequest.endpoint === 'top-headlines') {
        myResults = await newsapi.v2.topHeadlines({ ...buildRequestObj(searchRequest) });

      } else if (searchRequest.endpoint === 'everything') {
        myResults = await newsapi.v2.everything({ ...buildRequestObj(searchRequest) });

      };
      console.log('Request complete\n**Writing to cache**\nkey: ' + searchText)
      writeCache(searchText, myResults);

    } catch (err) {

      //If NewsAPI throws a 'Too many requests' error:
      if (err.name === 'NewsAPIError: rateLimited') {
        await setLimit()
        console.log('Feed Limit reached');
        myResults = { ...ERROR_NEWS, message: LIMIT_MESSAGE}
      }else{
        handleError(err, 'newsAPI/results');
        myResults = ERROR_NEWS;
      }


    }
  } else {
    //Found in cache:
    console.log('**Loading from cache**\nkey: ' + searchText)
    myResults = cachedResult
  }

  return myResults;
};


//This will format the object for use with the NewsAPI
const buildRequestObj = (searchRequest) => {

  const { endpoint = 'top-headlines', country, category, pageSize, page, keyword } = searchRequest;
  const { searchIn, dateFrom, dateTo, language, sortBy } = searchRequest;

  if (endpoint === 'top-headlines') {
    const immCountry = country ? country === 'all' || country === 'default' ? '' : country : '';
    const immCategory = category || '';
    const immKeyword = (immCountry || immCategory) ? (keyword ? keyword : '') : (keyword ? keyword : 'news');
    const immPageSize = parseInt(pageSize) || null;
    const immPage = parseInt(page) || null;

    const searchObj = {
      q: immKeyword,
      category: immCategory,
      country: immCountry,
      page: immPage,
      pageSize: immPageSize,
      //sources: 'bbc'
    };

    //remove falsy properties
    Object.keys(searchObj).forEach(key => {
      if (!searchObj[key]) {
        delete searchObj[key];
      }
    });

    return searchObj;

  } else if (endpoint === 'everything') {

    //everything
    const immKeyword = keyword || 'news';
    const immSearchIn = searchIn || '';
    const immFrom = dateFrom || '';
    const immTo = dateTo || '';
    const immLang = language || '';
    const immSort = sortBy || '';
    const immPageSize = parseInt(pageSize) || null;
    const immPage = parseInt(page) || null;

    const searchObj = {
      q: immKeyword,
      searchIn: immSearchIn,
      from: immFrom,
      to: immTo,
      language: immLang,
      sortBy: immSort,
      pageSize: immPageSize,
      page: immPage,
      // domains: 'bbc.co.uk, techcrunch.com',
      // sources: 'bbc-news,the-verge',
    }

    //remove falsy properties
    Object.keys(searchObj).forEach(key => {
      if (!searchObj[key]) {
        delete searchObj[key];
      }
    });

    return searchObj;
  }

};



//***************NOTES*****************

// Installation
// $ npm install newsapi --save


// Usage
/*
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(apiKey);
// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them
newsapi.v2.topHeadlines({
  sources: 'bbc-news,the-verge',
  q: 'bitcoin',
  category: 'business',
  language: 'en',
  country: 'us'
}).then(response => {
  console.log(response);

});


// To query /v2/everything
// You must include at least one q, source, or domain
newsapi.v2.everything({
  q: 'bitcoin',
  sources: 'bbc-news,the-verge',
  domains: 'bbc.co.uk, techcrunch.com',
  from: '2017-12-01',
  to: '2017-12-12',
  language: 'en',
  sortBy: 'relevancy',
  page: 2
}).then(response => {
  console.log(response);

});



// To query sources
// All options are optional
newsapi.v2.sources({
  category: 'technology',
  language: 'en',
  country: 'us'
}).then(response => {
  console.log(response);

});
*/