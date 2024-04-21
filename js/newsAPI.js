const apiKey = process.env.API_KEY

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(apiKey);

// const { systemLog } = require('../logs/logHandler');
// const { writeCache, checkCache, setLimit, checkLimit } = require('./redisClient');
const { createNewsCacheEntry, updateNewsCacheEntry, deleteNewsCacheEntry, getNewsCacheEntry } = require('../db/dbHandler')
const { buildNewsURL } = require('./utils');
const handleError = require('./handleError');
const { ERROR_NEWS } = require('./DEFAULTS')
const LIMIT_MESSAGE = 'Server limit reached. Please come back in 24hrs...'
const BAN_KEY = 'BANNED_TIME';
const { ONE_DAY, CACHE_ON } = require('./DEFAULTS');

//Handles calls to the news API
module.exports.results = async (searchRequest) => {

	// systemLog(`News request received: ${searchRequest}`);
	let myResults = { "empty": "results" };
	const searchText = buildNewsURL(searchRequest);

	//Check Cache
	const cachedResult = await getNewsCacheEntry(searchText);

	//If no match for the search criteria in cache:
	if (!cachedResult || cachedResult.result === 'error') {
		// //Get query restriction information:
		// const lastCacheBanEntry = await getNewsCacheEntry(BAN_KEY);
		// console.log('\n\n*******************\n****CACHE BAN: ', lastCacheBanEntry);

		// let timePassed = ONE_DAY;//-100000;
		// //If restriction found:
		// if (lastCacheBanEntry.result === 'success') {
		//   //Calculate time passed since ban (Needs to be greater than 24hrs)
		//   timePassed = Date.now() - lastCacheBanEntry.data.data;
		//   timePassed = isNaN(timePassed) ? ONE_DAY : timePassed;
		// }

		// //If request limit reached:
		// if (timePassed < ONE_DAY) {
		//   myResults = { ...ERROR_NEWS, message: LIMIT_MESSAGE };
		//   console.log('Time left till requests can be made: ' + ((ONE_DAY - timePassed) / 3600000) + 'hours');
		//   return myResults;
		// }


		console.log('Requesting from server...')
		//There are only 2 endpoints for the NewsAPI. Each takes an object with search properties.
		//See notes below
		try {
			// myResults = await fetchFromServer(searchRequest);

			console.log('Request complete\n**Writing to cache**\nkey: ' + searchText);
			myResults = { ...ERROR_NEWS, message: 'Imitation news from server' }
			updateNewsCacheEntry(searchText, myResults);

		} catch (err) {

			//If NewsAPI throws a 'Too many requests' error:
			// if (err.name === 'NewsAPIError: rateLimited') {
			// 	await updateNewsCacheEntry(BAN_KEY, Date.now())
			// 	console.log('Feed Limit reached');
			// 	//Use old results if they exist/otherwise send error to client:
			// 	if (cachedResult.result === 'success') {
			// 		myResults = cachedResult.data.data;
			// 	} else {
			// 		myResults = { ...ERROR_NEWS, message: LIMIT_MESSAGE }
			// 	}
			// } else {
			// 	const errObj = handleError(err, 'newsAPI/results');
			// 	myResults = { ...ERROR_NEWS, message: errObj.message };
			// }


		}
	} else if (cachedResult.result === 'success') {
		//Found in cache:
		console.log('**Loading from cache**\nkey: ' + searchText)
		myResults = cachedResult.data.data
	}

	return myResults;
};


//LEFT OFF HERE!!

const fetchFromServer = async (searchRequest) => {
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

		// throw {name:'NewsAPIError: rateLimited',message:'Too many requests'};
		if (searchRequest.endpoint === 'top-headlines') {
			return await newsapi.v2.topHeadlines({ ...buildRequestObj(searchRequest) });

		} else if (searchRequest.endpoint === 'everything') {
			return await newsapi.v2.everything({ ...buildRequestObj(searchRequest) });

		};

	} catch (err) {
		//Will update the ban timer if API returns rate limeted error.
		let errMsg =''
		if (err.name === 'NewsAPIError: rateLimited') {
			await updateNewsCacheEntry(BAN_KEY, Date.now())
			console.log('Feed Limit reached');
			errMsg = LIMIT_MESSAGE;
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