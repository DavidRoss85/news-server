const apiKey = process.env.API_KEY

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(apiKey);

// const { systemLog } = require('../logs/logHandler');
// const { writeCache, checkCache, setLimit, checkLimit } = require('./redisClient');
const { updateNewsCacheEntry, getNewsCacheEntry } = require('../db/dbHandler')
const { buildNewsURL } = require('./utils');
const handleError = require('./handleError');
const { ERROR_NEWS, CACHE_TTL } = require('./DEFAULTS')
const LIMIT_MESSAGE = 'Server limit reached. Please come back in 24hrs...'
const BAN_KEY = 'BANNED_TIME';
const { ONE_DAY, CACHE_ON } = require('./DEFAULTS');

//Handles calls to the news API
module.exports.results = async (searchRequest) => {

	// systemLog(`News request received: ${searchRequest}`);
	let myResults = { "empty": "results" };
	const searchText = buildNewsURL(searchRequest);

	//Check Cache
	const cachedResult = CACHE_ON ? await getNewsCacheEntry(searchText) : { result: 'error' };

	//If no match for the search criteria in cache fetch from server:
	if (!cachedResult || cachedResult.result === 'error') {
		myResults = await fetchFromServer(searchRequest, searchText);

		//If found in cache:
	} else if (cachedResult.result === 'success') {

		//check for expiry here and fetch news if expired
		if (Date.now() - cachedResult.data.updatedAt > CACHE_TTL) {
			myResults = await fetchFromServer(searchRequest, searchText);
			if (myResults.status !== 'error') {
				return myResults;
			}
		};

		//If the fetch fails or returns an error, default to expired cache entry:
		console.log('**Loading from cache**\nkey: ' + searchText)
		myResults = { ...cachedResult.data.data, message: "Loaded from cache" }
	};

	return myResults;
};


//Returns {status: 'ok'} or {staus: 'error'} depending on success
const fetchFromServer = async (searchRequest, searchText) => {
	const thisFunction = {
		parent: 'newsAPI',
		name: 'fetchFromServer',
	};

	//Get query restriction information:
	const lastCacheBanEntry = await getNewsCacheEntry(BAN_KEY);

	let timePassed = ONE_DAY;//-100000;
	//If restriction found:
	//Calculate time passed since ban (Needs to be greater than 24hrs)
	if (lastCacheBanEntry.result === 'success') {
		timePassed = Date.now() - lastCacheBanEntry.data.data;
		timePassed = isNaN(timePassed) ? ONE_DAY : timePassed;
	}

	//If request limit reached:
	//Return Error Object/Results
	if (timePassed < ONE_DAY) {
		console.log('Time left till requests can be made: ' + ((ONE_DAY - timePassed) / 3600000) + 'hours');
		return { ...ERROR_NEWS, message: LIMIT_MESSAGE };
	}

	//Last ban was > 24hrs ago... send fetch request to News API:
	try {
		console.log('Requesting from server...');
		const newsEndpoint = searchRequest.endpoint === 'top-headlines' ? 'topHeadlines' : 'everything';
		const myResults = await newsapi.v2[newsEndpoint]({ ...buildRequestObj(searchRequest) });

		if (CACHE_ON) {
			console.log('Request complete\n**Writing to cache**\nkey: ' + searchText);
			updateNewsCacheEntry(searchText, myResults);
		};

		return myResults;

	} catch (err) {
		//Will update the ban timer if API returns rate limeted error.
		let errMsg = '';
		if (err.name === 'NewsAPIError: rateLimited') {
			try {
				await updateNewsCacheEntry(BAN_KEY, Date.now());
				console.log('Feed Limit reached');
				errMsg = LIMIT_MESSAGE;
			} catch (err) {
				handleError(err, `${thisFunction.parent}/${thisFunction.name}`);
			}
		} else {
			const errObj = handleError(err, `${thisFunction.parent}/${thisFunction.name}`);
			errMsg = errObj.message;
		}

		return { ...ERROR_NEWS, message: errMsg };
	}

}


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