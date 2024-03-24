# Welcome to the Server for the News Feed web app

## Notes:
1. **Have the following variables ready in your .env file:**
 - API_KEY 
 - SECRET_KEY
 - MONGO_LOCAL_URL

2. **This server uses MongoDB to access and store information about the user.**
Please be sure to have a MongoDB server installed and running or available at the MONGO_LOCAL_URL

3. **This server uses [The News API](https://newsapi.org/) to fetch news results and return to the user.  API_KEY is required.**
One can be obtained at [https://newsapi.org/]

4. **SECRET_KEY is any string used for generating the JSON web token.**

5. **The server will by default run on port 8080 unless changed in /bin/www.**
Use *npm start* for normal operation or *npm run gstart* for google-cloud functions framework

6. **The front end app can handle the creation and updating of user preferences**

7. **logHandler.js will try to write logs to /logs/system.log**

## Welcome to the app

This is a back-end application that is paired with the "react-news-api" project. his was made as part of a portfolio made while in Nucamp coding bootcamp. Please feel free to analyze and comment.

### Check out [My Portfolio Page](https://davidross-web-portfolio.web.app).