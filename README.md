# Welcome to the Server for the News Feed web app

## Notes:
1. **Have the following variables ready in your .env file:**
 - API_KEY 
 - SECRET_KEY
 - MONGO_LOCAL_URL
 - PORT
 - SEC_PORT

2. **This server uses MongoDB to access and store information about the user.**
Please be sure to have a MongoDB server installed and running or available at the MONGO_LOCAL_URL

3. **This server uses [The News API](https://newsapi.org/) to fetch news results and return to the user.  API_KEY is required.**
One can be obtained at [https://newsapi.org/]

4. **SECRET_KEY is any string used for generating the JSON web token.**

5. **The server will by default run on port 8080 (HTTP) and 8523 (HTTPS) if PORT/SEC_PORT is not specified.**
Use *npm start* for normal operation or *npm run gstart* for google-cloud functions framework

6. **The front end app can handle the creation and updating of user preferences**
No need to create a collection, the front end app has a 'signup' feature that can create new users.

7. **logHandler.js will try to write logs to /logs/system.log**

## Welcome to the app

This is a back-end application that is paired with the "react-news-api" project. his was made as part of a portfolio made while in Nucamp coding bootcamp. Please feel free to analyze and comment.

**When a request is made to the server, it will go to one of several endpoints.** 
 - The news endpoint receives a post with the search criteria in the request body, which is parsed using the express JSON middleware. The news API module then handles requesting information from the news API endpoint before returning it to the client. 
 - The login endpoint receives the user's credentials and returns a JSON web token that's used to authenticate future requests. This authentication is handled by the Passport Library, which also handles user creation and password hashing at the signup endpoint. Since the user's ID is stored on the token, this can be used to access specific information at the settings endpoint without using request parameters. Both the settings and user endpoints utilize functions in the DB handler module to access and modify database entries.

### Check out [My Portfolio Page](https://davidross-web-portfolio.web.app).