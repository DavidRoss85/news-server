# Welcome to the Server for the News Feed web app

## Notes:
1. Have the following variables ready in your .env file:
 - API_KEY 
 - SECRET_KEY
 - MONGO_LOCAL_URL

2. This server uses MongoDB to access and store information about the user.
Please be sure to have a MongoDB server installed and running or available at the MONGO_LOCAL_URL

3. This server uses [The News API](https://newsapi.org/) to fetch news results and return to the user.  API_KEY is required.
One can be obtained at [https://newsapi.org/](https://newsapi.org/)

4. SECRET_KEY is any string used for generating the JSON web token.

4. The server will by default run on port 8080 unless changed in /bin/www
use *npm start* for normal operation or *npm run gstart* for google-cloud functions framework

5. logHandler.js will try to write logs to /logs/system.log