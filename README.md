#Welcome to the Server for the News Feed web app

#Notes:
Have the following variables ready in your .env file:
 - API_KEY 
 - SECRET_KEY

This server uses MongoDB to access and store information about the user.
Please be sure to have a MongoDB server installed and running or available at the URL

This server also uses the News API to fetch news results and return to the user. An API key is required.
One can be obtained at https://newsapi.org/

This will by default run on port 8080 unless changed in /bin/www

logHandler.js will try to write logs to /logs/system.log