module.exports.TOKEN_TTL = 86400000; // ONE DAY
module.exports.LOG_PATH = ''
module.exports.ERROR_NEWS = {
    "status": "error",
    "totalResults": 0,
    "articles": [
        {
            "source": {
                "id": "",
                "name": ""
            },
            "author": "",
            "title": "",
            "description": "",
            "url": "",
            "urlToImage": "",
            "publishedAt": "",
            "content": ""
        }
    ]
};

module.exports.TEST_USER_SETTINGS = {
    "avatar": "",
    "preferences": {
        "region": "",
        "homepage": [
            {
                "id": 0,
                "title": "US News",
                "tileType": "slide",
                "row": 1,
                "numArticles": 20,
                "sizing": {
                    "md": "4",
                    "className": ""
                },
                "style": {
                    "border": "2px solid black"
                },
                "innerSizing": {
                    "className": "slideHolder"
                },
                "componentAttribute": {},
                "search": {
                    "endpoint": "top-headlines",
                    "country": "us",
                    "category": "",
                    "keyword": "",
                    "fromDate": "",
                    "toDate": "",
                    "language": "",
                    "sortBy": "",
                    "sources": "",
                    "errorMode": false
                }
            },
            {
                "id": 1,
                "title": "Artificial Intelligence",
                "tileType": "pallette",
                "row": 1,
                "numArticles": 12,
                "sizing": {
                    "md": "4",
                    "className": ""
                },
                "style": {
                    "border": "2px solid black"
                },
                "innerSizing": {},
                "componentAttribute": {
                    "md": "4"
                },
                "search": {
                    "endpoint": "everything",
                    "country": "default",
                    "category": "",
                    "keyword": "Artificial Intelligence",
                    "fromDate": "",
                    "toDate": "",
                    "language": "",
                    "sortBy": "",
                    "sources": "",
                    "errorMode": false
                }
            },
            {
                "id": 2,
                "title": "Microsoft",
                "tileType": "list",
                "row": 1,
                "numArticles": 10,
                "sizing": {
                    "md": "4",
                    "className": ""
                },
                "style": {
                    "border": "2px solid black"
                },
                "innerSizing": {},
                "componentAttribute": {},
                "search": {
                    "endpoint": "everything",
                    "country": "default",
                    "category": "",
                    "keyword": "Microsoft",
                    "fromDate": "",
                    "toDate": "",
                    "language": "en",
                    "sortBy": "publishedAt",
                    "sources": "",
                    "errorMode": false
                }
            },
            {
                "id": 3,
                "title": "News Window",
                "tileType": "topic",
                "row": 2,
                "numArticles": 6,
                "sizing": {
                    "md": "4",
                    "className": ""
                },
                "style": {
                    "border": "2px solid black"
                },
                "innerSizing": {},
                "componentAttribute": {},
                "search": {
                    "endpoint": "top-headlines",
                    "country": "default",
                    "category": "",
                    "keyword": "",
                    "fromDate": "",
                    "toDate": "",
                    "language": "",
                    "sortBy": "",
                    "sources": "",
                    "errorMode": false
                }
            },
            {
                "id": 4,
                "title": "News Window",
                "tileType": "topic",
                "row": 2,
                "numArticles": 6,
                "sizing": {
                    "md": "4",
                    "className": ""
                },
                "style": {
                    "border": "2px solid black"
                },
                "innerSizing": {},
                "componentAttribute": {},
                "search": {
                    "endpoint": "top-headlines",
                    "country": "default",
                    "category": "",
                    "keyword": "",
                    "fromDate": "",
                    "toDate": "",
                    "language": "",
                    "sortBy": "",
                    "sources": "",
                    "errorMode": false
                }
            }
        ]
    }
};

module.exports.DEFAULT_USER_SETTINGS = {
    "username": "defaultUser",
    "avatar": "",
    "preferences": {
      "region": "",
      "homepage": [
        {
          "id": 0,
          "search": {
            "category": "",
            "country": "all",
            "endpoint": "top-headlines",
            "errorMode": false,
            "keyword": ""
          },
          "numArticles": 10,
          "title": "Top-Stories",
          "tileType": "slide",
          "row": 1,
          "sizing": {
            "md": "5",
            "className": ""
          },
          "innerSizing": {
            "className": "slideHolder"
          },
          "componentAttribute": {}
        },
        {
          "id": 1,
          "search": {
            "category": "entertainment",
            "country": "all",
            "endpoint": "top-headlines",
            "errorMode": false,
            "keyword": ""
          },
          "numArticles": 6,
          "title": "Entertainment",
          "tileType": "pallette",
          "row": 1,
          "sizing": {
            "md": "4",
            "className": ""
          },
          "innerSizing": {
            "className": ""
          },
          "componentAttribute": {
            "md": "6"
          }
        },
        {
          "id": 2,
          "search": {
            "category": "",
            "country": "all",
            "endpoint": "top-headlines",
            "errorMode": false,
            "keyword": ""
          },
          "numArticles": 8,
          "title": "News",
          "tileType": "list",
          "row": 1,
          "sizing": {
            "md": "3",
            "className": ""
          },
          "innerSizing": {
            "className": ""
          },
          "componentAttribute": {}
        },
        {
          "id": 3,
          "search": {
            "category": "",
            "country": "all",
            "endpoint": "top-headlines",
            "errorMode": false,
            "keyword": "Artificial Intelligence"
          },
          "numArticles": 6,
          "title": "AI News",
          "tileType": "topic",
          "row": 2,
          "sizing": {
            "md": "6",
            "className": ""
          },
          "innerSizing": {
            "className": ""
          },
          "componentAttribute": {}
        },
        {
          "id": 4,
          "search": {
            "category": "business",
            "country": "all",
            "endpoint": "top-headlines",
            "errorMode": false,
            "keyword": ""
          },
          "numArticles": 32,
          "title": "Business",
          "tileType": "pallette",
          "row": 2,
          "sizing": {
            "md": "6",
            "className": ""
          },
          "innerSizing": {
            "className": ""
          },
          "componentAttribute": {
            "md": "3"
          }
        }
      ]
    }
  }