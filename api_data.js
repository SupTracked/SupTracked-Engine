define({ "api": [
  {
    "type": "post",
    "url": "/friend",
    "title": "Add a friend to a consumption",
    "name": "AddFriendConsumption",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the consumption</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>name of the friend</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumption_id",
            "description": "<p>id of the consumption the friend is attached to</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>name of the friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "owner",
            "description": "<p>id of the owner of the experience</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"id\": 1,\n   \"consumption_id\": q\",\n   \"name\": \"John Smith\",\n   \"owner\": 1\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingField",
            "description": "<p>consumption_id and name required - one or more was not provided</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"consumption_id and name required\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "post",
    "url": "/consumption",
    "title": "Create a consumption",
    "name": "CreateConsumption",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "drug_id",
            "description": "<p>ID of the drug consumed</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "method_id",
            "description": "<p>ID of the method used to consume the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "location",
            "description": "<p>location of the consumption</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the created consumption</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created\n{\n  \"id\": 3,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingField",
            "description": "<p>date, count, experience_id, drug_id, and method_id required - one or more was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "timestampError",
            "description": "<p>timestamp must be positive unix time integer, down to seconds resolution</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "invalidExperience",
            "description": "<p>the requested experience association doesn't exist or belong to this user</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "invalidDrug",
            "description": "<p>the requested drug association doesn't exist or belong to this user</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "invalidMethon",
            "description": "<p>the requested method association doesn't exist or belong to this user</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"date, count, experience_id, drug_id, and method_id required\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"timestamp must be positive unix time integer, down to seconds resolution\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"the requested experience association doesn't exist or belong to this user\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"the requested drug association doesn't exist or belong to this user\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"the requested method association doesn't exist or belong to this user\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "delete",
    "url": "/consumption",
    "title": "Delete a consumption",
    "name": "DeleteConsumption",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the experience</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "delete",
    "url": "/consumption/friend",
    "title": "Delete a friend from a consumption",
    "name": "DeleteFriendConsumption",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the friend</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "get",
    "url": "/consumption",
    "title": "Get a JSON object of a consumption",
    "name": "GetConsumption",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the desired consumption</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "drug",
            "description": "<p>JSON object of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "drug.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drug.name",
            "description": "<p>name of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drug.unit",
            "description": "<p>unit of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "method",
            "description": "<p>JSON object of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "method.id",
            "description": "<p>ID of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "method.name",
            "description": "<p>name of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "location",
            "description": "<p>location of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "friends",
            "description": "<p>array of JSON objects for friends associated with this consumption.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "friends.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "friends.name",
            "description": "<p>name of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "friends.consumption_id",
            "description": "<p>consumption_id of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "friends.owner",
            "description": "<p>owner of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "owner",
            "description": "<p>id of the owner of the consumption</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"id\": 3,\n   \"date\": 1445543583,\n   \"count\": 3,\n   \"experience_id\": \"1\",\n   \"drug\": [\n       \"id\": 1,\n       \"name\": \"phenylpiracetam\",\n       \"unit\": \"mg\"\n    ],\n   \"method\": [\n       \"id\": 1,\n       \"name\": \"oral\",\n       \"consumption_id\": 1,\n       \"owner\": 1\n    ],\n   \"location\": \"San Juan\",\n   \"friends\": [\n       {\"name\": \"John Smith\", \"id\": 321},\n       {\"name\": \"Frank Johnson\", \"id\": 964}\n    ],\n   \"owner\": 1\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "get",
    "url": "/consumption/experience",
    "title": "Get a JSON object of all consumptions from a given experience",
    "name": "GetConsumptionsByExp",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the desired experience's consumptions</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions",
            "description": "<p>array of JSON objects for consumptions in this experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.id",
            "description": "<p>id of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions.drug",
            "description": "<p>JSON object of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.drug.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.drug.name",
            "description": "<p>name of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.drug.unit",
            "description": "<p>unit of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions.method",
            "description": "<p>JSON object of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.method.id",
            "description": "<p>ID of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.method.name",
            "description": "<p>name of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.location",
            "description": "<p>location of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions.friends",
            "description": "<p>array of JSON objects for friends associated with this consumption.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.friends.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.friends.name",
            "description": "<p>name of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.friends.consumption_id",
            "description": "<p>consumption_id of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.friends.owner",
            "description": "<p>owner of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.owner",
            "description": "<p>id of the owner of the consumption</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"consumptions\": [{\n    \"count\": 2,\n    \"date\": \"1445648036\",\n    \"drug\": {\n      \"id\": 1,\n      \"name\": \"Aspirin\",\n      \"unit\": \"mg\",\n    },\n    \"experience_id\": 1,\n    \"friends\": [{\n      \"id\": 1,\n      \"name\": \"John Smith\",\n      \"consumption_id\": 1,\n      \"owner\": 1\n    }],\n    \"id\": 1,\n    \"location\": \"San Juan\",\n    \"method\": {\n      \"id\": 1,\n      \"name\": \"oral\"\n    },\n    \"owner\": 1\n  }]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no consumptions found for the given experience</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"experience id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "get",
    "url": "/friends",
    "title": "Get a unique list of friends by name",
    "name": "GetFriendList",
    "group": "Consumption",
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "friendcount",
            "description": "<p>number of unique friends</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "friends.friend",
            "description": "<p>JSON array for individual friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "friends.friend.name",
            "description": "<p>friend's name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "friends.friend.use_count",
            "description": "<p>number of consumptions the friend is in</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nfriends: [\n   {\"name\": \"John Smith\"}\n   {\"name\": \"Michael Johnson\"}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "get",
    "url": "/consumption/search",
    "title": "Retrieve an array of experiences with consumptions that match the provided criteria",
    "name": "SearchConsumption",
    "group": "Consumption",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences",
            "description": "<p>JSON array of full experiences</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.id",
            "description": "<p>id of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.date",
            "description": "<p>date of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.ttime",
            "description": "<p>id of the consumption for which T-0:00 time format is based off</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.title",
            "description": "<p>title of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.notes",
            "description": "<p>notes for the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.panicmsg",
            "description": "<p>user's panic message for the created experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.rating_id",
            "description": "<p>rating of general experience quality</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.owner",
            "description": "<p>id of the owner of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions",
            "description": "<p>array of consumptions for the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.id",
            "description": "<p>id of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug",
            "description": "<p>JSON object of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug.name",
            "description": "<p>name of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug.unit",
            "description": "<p>unit of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions.method",
            "description": "<p>JSON object of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.method.id",
            "description": "<p>ID of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.method.name",
            "description": "<p>name of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.location",
            "description": "<p>location of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends",
            "description": "<p>array of JSON objects for friends associated with this consumption.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.name",
            "description": "<p>name of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.consumption_id",
            "description": "<p>consumption_id of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.owner",
            "description": "<p>owner of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.owner",
            "description": "<p>id of the owner of the consumption</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n  \"date\": 1445543583,\n  \"id\": 1,\n  \"notes\": null,\n  \"owner\": 1,\n  \"panicmsg\": null,\n  \"rating_id\": null,\n  \"title\": \"My Title\",\n  \"ttime\": null,\n  \"consumptions\": [{\n    \"id\": 1,\n    \"date\": \"1445648036\",\n    \"count\": 2,\n    \"experience_id\": 1,\n    \"drug\": {\n      \"id\": 1,\n      \"name\": \"Aspirin\",\n      \"unit\": \"mg\"\n    },\n    \"method\": {\n      \"id\": 1,\n      \"name\": \"oral\"\n    },\n    \"location\": \"San Juan\",\n    \"friends\": [{\n      \"id\": 1,\n      \"name\": \"John Smith\"\n    }],\n    \"owner\": 1\n  }]\n}]",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "startdate",
            "description": "<p>Unix timestamp of beginning of date range to select</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "enddate",
            "description": "<p>Unix timestamp of end of date range to select</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number[]</p> ",
            "optional": true,
            "field": "drug_id",
            "description": "<p>array of drug ids to search for</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number[]</p> ",
            "optional": true,
            "field": "method_id",
            "description": "<p>array of method ids to search for</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "location",
            "description": "<p>string that must be contained in the location field</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "limit",
            "description": "<p>only return this number of rows</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "offset",
            "description": "<p>offset the returned number of rows by this amount (requires limit)</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noResults",
            "description": "<p>no experiences or consumptions match the provided criteria</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "needCriteria",
            "description": "<p>no experiences match the provided criteria (at least one must be provided)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found Bad Request",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"at least one field must be provided\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "put",
    "url": "/consumption",
    "title": "Update a consumption",
    "name": "UpdateConsumption",
    "group": "Consumption",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "drug_id",
            "description": "<p>ID of the drug consumed</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "method_id",
            "description": "<p>ID of the method used to consume the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "location",
            "description": "<p>location of the consumption</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noFields",
            "description": "<p>no fields to set were provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "illegalField",
            "description": "<p>a field to update was send that is not permitted (must be in above list)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"no fields provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"consumption\": \"custom field requested that is not permitted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Consumption"
  },
  {
    "type": "post",
    "url": "/drug",
    "title": "Create a drug",
    "name": "CreateDrug",
    "group": "Drug",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>name of the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "unit",
            "description": "<p>unit of measurement for the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "notes",
            "description": "<p>notes about the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "classification",
            "description": "<p>drug classification</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "family",
            "description": "<p>drug's chemical family</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "rarity",
            "description": "<p>drug rarity</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the created drug</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created\n{\n  \"id\": 3,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingField",
            "description": "<p>a required field was missing</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"drug\": \"name, unit, notes, classification, family, and rarity required\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/drug.js",
    "groupTitle": "Drug"
  },
  {
    "type": "delete",
    "url": "/drug",
    "title": "Delete a drug",
    "name": "DeleteDrug",
    "group": "Drug",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the drug</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "inUse",
            "description": "<p>drug is currently used in a consumption; followed by array of full consumptions it's used in</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"drug\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"drug\": \"drug in use\",\n  \"consumptions\": [array of consumption objects]\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/drug.js",
    "groupTitle": "Drug"
  },
  {
    "type": "get",
    "url": "/drug/all",
    "title": "Get a unique list of all drugs owned by the user, ordered from most used to least used",
    "name": "GetAllDrugs",
    "group": "Drug",
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "drugs",
            "description": "<p>json array of drugs.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "drugs.drug",
            "description": "<p>JSON array for individual drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "drugs.drug.id",
            "description": "<p>drug id.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drugs.drug.name",
            "description": "<p>drug name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drugs.drug.unit",
            "description": "<p>drug name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drugs.drug.notes",
            "description": "<p>drug name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drugs.drug.classification",
            "description": "<p>drug name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drugs.drug.family",
            "description": "<p>drug family</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "drugs.drug.rarity",
            "description": "<p>drug rarity</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "drugs.drug.use_count",
            "description": "<p>number of times that the drug has been used in consumptions</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "drugs.drug.owner",
            "description": "<p>id of the owner of the drug</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n  \"id\": 2,\n  \"name\": \"Ibuprofen\",\n  \"unit\": \"mg\",\n  \"notes\": \"Ibuprofen is a painkiller\",\n  \"classification\": \"COX inhibitor\",\n  \"family\": \"NSAID\",\n  \"rarity\": \"Common\",\n  \"use_count\": 0,\n  \"owner\": 1\n}, {\n  \"id\": 1,\n  \"name\": \"Phenylpiracetam\",\n  \"unit\": \"mg\",\n  \"notes\": \"Phenylpiracetam is a phenylated analog of the drug piracetam.\",\n  \"classification\": \"AMPA modulator\",\n  \"family\": \"*racetam\",\n  \"rarity\": \"Common\",\n  \"use_count\": 0,\n  \"owner\": 1\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/drug.js",
    "groupTitle": "Drug"
  },
  {
    "type": "get",
    "url": "/drug",
    "title": "Get a JSON object of an drug",
    "name": "GetDrug",
    "group": "Drug",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the desired drug</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>name of the drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "unit",
            "description": "<p>unit of measurement for the drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "notes",
            "description": "<p>notes about the drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "classification",
            "description": "<p>drug classification</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "family",
            "description": "<p>drug's chemical family</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "rarity",
            "description": "<p>drug rarity</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "owner",
            "description": "<p>id of the owner of the experience</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"id\": 1,\n   \"name\": \"Phenylpiracetam\",\n   \"unit\": \"mg\",\n   \"notes\": \"Phenylpiracetam is a phenylated analog of the drug piracetam.\",\n   \"classification\": \"AMPA modulator\",\n   \"family\": \"*racetam\",\n   \"rarity\": \"Common\",\n   \"owner\" 1\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"drug\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/drug.js",
    "groupTitle": "Drug"
  },
  {
    "type": "put",
    "url": "/drug",
    "title": "Update a drug",
    "name": "UpdateDrug",
    "group": "Drug",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "name",
            "description": "<p>name of the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "unit",
            "description": "<p>unit of measurement for the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "notes",
            "description": "<p>notes about the drug</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "classification",
            "description": "<p>drug classification</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "family",
            "description": "<p>drug's chemical family</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "rarity",
            "description": "<p>drug rarity</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noFields",
            "description": "<p>no fields to set were provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "illegalField",
            "description": "<p>a field to update was send that is not permitted (must be in above list)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"drug\": \"no fields provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"drug\": \"custom field requested that is not permitted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/drug.js",
    "groupTitle": "Drug"
  },
  {
    "type": "post",
    "url": "/experience",
    "title": "Create an experience",
    "name": "CreateExperience",
    "group": "Experience",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "title",
            "description": "<p>Title of the new experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "date",
            "description": "<p>Unix timestamp of the date and time of the experience</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the created experience</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created\n{\n  \"id\": 3,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingField",
            "description": "<p>title and valid date required - one or more was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "timestampError",
            "description": "<p>timestamp must be positive unix time integer, down to seconds resolution</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"experience\": \"title and valid date required\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"experience\": \"timestamp must be positive unix time integer, down to seconds resolution\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/experience.js",
    "groupTitle": "Experience"
  },
  {
    "type": "delete",
    "url": "/experience",
    "title": "Delete an experience",
    "name": "DeleteExperience",
    "group": "Experience",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the experience</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"experience\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/experience.js",
    "groupTitle": "Experience"
  },
  {
    "type": "get",
    "url": "/experience",
    "title": "Get a JSON object of an experience",
    "name": "GetExperience",
    "group": "Experience",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the desired experience</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "date",
            "description": "<p>date of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "ttime",
            "description": "<p>id of the consumption for which T-0:00 time format is based off</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "title",
            "description": "<p>title of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "notes",
            "description": "<p>notes for the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "panicmsg",
            "description": "<p>user's panic message for the created experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "rating_id",
            "description": "<p>rating of general experience quality</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "owner",
            "description": "<p>id of the owner of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions",
            "description": "<p>array of consumptions for the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.id",
            "description": "<p>id of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions.drug",
            "description": "<p>JSON object of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.drug.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.drug.name",
            "description": "<p>name of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.drug.unit",
            "description": "<p>unit of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions.method",
            "description": "<p>JSON object of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.method.id",
            "description": "<p>ID of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.method.name",
            "description": "<p>name of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.location",
            "description": "<p>location of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "consumptions.friends",
            "description": "<p>array of JSON objects for friends associated with this consumption.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.friends.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "consumptions.friends.name",
            "description": "<p>name of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.friends.consumption_id",
            "description": "<p>consumption_id of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.friends.owner",
            "description": "<p>owner of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "consumptions.owner",
            "description": "<p>id of the owner of the consumption</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"date\": 1445543583,\n   \"id\": 1,\n   \"notes\": \"This is great.\",\n   \"owner\": 1,\n   \"panicmsg\": \"Oh snap help me!\",\n   \"rating_id\": 3,\n   \"title\": \"Great Time\",\n   \"ttime\": null,\n   \"consumptions\": [{\n     \"count\": 2,\n     \"date\": \"1445648036\",\n     \"drug\": {\n       \"id\": 1,\n       \"name\": \"Aspirin\",\n       \"unit\": \"mg\",\n     },\n     \"method\": {\n       \"id\": 1,\n       \"name\": \"oral\"\n     },\n     \"experience_id\": 1,\n     \"friends\": [{\n       \"id\": 1,\n       \"name\": \"John Smith\",\n       \"consumption_id\": 1,\n       \"owner\": 1\n     }],\n     \"id\": 1,\n     \"location\": \"San Juan\",\n       \"id\": 1,\n       \"name\": \"mg\"\n     },\n     \"owner\": 1\n   }]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"experience\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/experience.js",
    "groupTitle": "Experience"
  },
  {
    "type": "get",
    "url": "/experience/search",
    "title": "Retrieve an array of experiences that match the provided criteria",
    "name": "SearchExperience",
    "group": "Experience",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences",
            "description": "<p>JSON array of full experiences</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.id",
            "description": "<p>id of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.date",
            "description": "<p>date of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.ttime",
            "description": "<p>id of the consumption for which T-0:00 time format is based off</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.title",
            "description": "<p>title of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.notes",
            "description": "<p>notes for the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.panicmsg",
            "description": "<p>user's panic message for the created experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.rating_id",
            "description": "<p>rating of general experience quality</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.owner",
            "description": "<p>id of the owner of the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions",
            "description": "<p>array of consumptions for the experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.id",
            "description": "<p>id of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.date",
            "description": "<p>Unix timestamp of the date and time of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.count",
            "description": "<p>numerical quantity as measured by the drug's unit</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.experience_id",
            "description": "<p>ID of the experience the consumption is part of</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug",
            "description": "<p>JSON object of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug.name",
            "description": "<p>name of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.drug.unit",
            "description": "<p>unit of drug</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions.method",
            "description": "<p>JSON object of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.method.id",
            "description": "<p>ID of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.method.name",
            "description": "<p>name of method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.location",
            "description": "<p>location of the consumption</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends",
            "description": "<p>array of JSON objects for friends associated with this consumption.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.id",
            "description": "<p>ID of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.name",
            "description": "<p>name of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.consumption_id",
            "description": "<p>consumption_id of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.friends.owner",
            "description": "<p>owner of friend</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "experiences.consumptions.owner",
            "description": "<p>id of the owner of the consumption</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n  \"date\": 1445543583,\n  \"id\": 1,\n  \"notes\": null,\n  \"owner\": 1,\n  \"panicmsg\": null,\n  \"rating_id\": null,\n  \"title\": \"My Title\",\n  \"ttime\": null,\n  \"consumptions\": [{\n    \"id\": 1,\n    \"date\": \"1445648036\",\n    \"count\": 2,\n    \"experience_id\": 1,\n    \"drug\": {\n      \"id\": 1,\n      \"name\": \"Aspirin\",\n      \"unit\": \"mg\"\n    },\n    \"method\": {\n      \"id\": 1,\n      \"name\": \"oral\"\n    },\n    \"location\": \"San Juan\",\n    \"friends\": [{\n      \"id\": 1,\n      \"name\": \"John Smith\",\n      \"consumption_id\": 1,\n      \"owner\": 1\n    }],\n    \"owner\": 1\n  }]\n}]",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "startdate",
            "description": "<p>Unix timestamp of beginning of date range to select</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "enddate",
            "description": "<p>Unix timestamp of end of date range to select</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "title",
            "description": "<p>experiences where this string is contained in the title will be retrieved</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "notes",
            "description": "<p>experiences where this string is contained in the notes field will be retrieved</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "rating_id",
            "description": "<p>experiences with this rating will be retrieved</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "limit",
            "description": "<p>only return this number of rows</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "offset",
            "description": "<p>offset the returned number of rows by this amount (requires limit)</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noResults",
            "description": "<p>no experiences match the provided criteria</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found Bad Request",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/experience.js",
    "groupTitle": "Experience"
  },
  {
    "type": "put",
    "url": "/experience",
    "title": "Update an experience",
    "name": "UpdateExperience",
    "group": "Experience",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "date",
            "description": "<p>date of the experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "ttime",
            "description": "<p>id of the consumption for which T-0:00 time format is based off</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "title",
            "description": "<p>title of the experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "notes",
            "description": "<p>notes for the experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "panicmsg",
            "description": "<p>user's panic message for the created experience</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "rating_id",
            "description": "<p>rating of general experience quality</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noFields",
            "description": "<p>no fields to set were provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "illegalField",
            "description": "<p>a field to update was send that is not permitted (must be in above list)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"experience\": \"no fields provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"experience\": \"custom field requested that is not permitted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/experience.js",
    "groupTitle": "Experience"
  },
  {
    "type": "get",
    "url": "/consumption/locations",
    "title": "Get a unique list of all locations used in consumptions owned by the user, ordered from most used to least used",
    "name": "GetAllConsumptionLocations",
    "group": "Location",
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "locationcount",
            "description": "<p>number of unique locations</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "locations",
            "description": "<p>json array of locations.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "locations.location",
            "description": "<p>JSON array for individual locations</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "locations.location.name",
            "description": "<p>location name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "locations.location.use_count",
            "description": "<p>number of times that the location has been used in consumptions</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n  location: 'Maine',\n  use_count: 1\n}, {\n  location: 'San Juan',\n  use_count: 1\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/consumption.js",
    "groupTitle": "Location"
  },
  {
    "type": "post",
    "url": "/method",
    "title": "Create a method",
    "name": "CreateMethod",
    "group": "Method",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>name of the method</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "icon",
            "description": "<p>data URI for the method icon</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the created method</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created\n{\n  \"id\": 3,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingField",
            "description": "<p>a required field was missing</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"method\": \"name and icon required\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/method.js",
    "groupTitle": "Method"
  },
  {
    "type": "delete",
    "url": "/method",
    "title": "Delete a method",
    "name": "DeleteMethod",
    "group": "Method",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the method</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "inUse",
            "description": "<p>method is currently used in a consumption; followed by array of full consumptions it's used in</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"method\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"method\": \"drug in use\",\n  \"consumptions\": [array of consumption objects]\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/method.js",
    "groupTitle": "Method"
  },
  {
    "type": "get",
    "url": "/method/all",
    "title": "Get a unique list of all methods owned by the user",
    "name": "GetAllMethods",
    "group": "Method",
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "methods",
            "description": "<p>json array of methods.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "methods.method",
            "description": "<p>JSON array for individual method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "methods.method.id",
            "description": "<p>method id.</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "methods.method.name",
            "description": "<p>method name</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "methods.method.icon",
            "description": "<p>method icon</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "methods.method.use_count",
            "description": "<p>number of times that the method has been used in consumptions</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "methods.method.owner",
            "description": "<p>id of the owner of the method</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n  \"id\": 1,\n  \"name\": \"Oral\",\n  \"icon\": \"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=\",\n  \"use_count\": 3,\n  \"owner\": 1\n}, {\n  \"id\": 2,\n  \"name\": \"Bucal\",\n  \"icon\": \"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=\",\n  \"use_count\": 1,\n  \"owner\": 1\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/method.js",
    "groupTitle": "Method"
  },
  {
    "type": "get",
    "url": "/method",
    "title": "Get a JSON object of a method",
    "name": "GetMethod",
    "group": "Method",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the desired method</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>name of the method</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "icon",
            "description": "<p>data URI for the method icon</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "owner",
            "description": "<p>method owner id</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"id\": 1,\n   \"name\": \"Oral\",\n   \"icon\": \"mg\",\n   \"owner\": 1,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "missingID",
            "description": "<p>id was not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noRecords",
            "description": "<p>no results found for the given ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"method\": \"id must be provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/method.js",
    "groupTitle": "Method"
  },
  {
    "type": "put",
    "url": "/method",
    "title": "Update a method",
    "name": "UpdateMethod",
    "group": "Method",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "id",
            "description": "<p>id of the method</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "name",
            "description": "<p>name of the method</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": true,
            "field": "icon",
            "description": "<p>data URI for the method icon</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noFields",
            "description": "<p>no fields to set were provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "illegalField",
            "description": "<p>a field to update was send that is not permitted (must be in above list)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"method\": \"no fields provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"method\": \"custom field requested that is not permitted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/method.js",
    "groupTitle": "Method"
  },
  {
    "type": "post",
    "url": "/register",
    "title": "Register a user",
    "name": "RegisterUser",
    "group": "Registration",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "size": "5...",
            "optional": false,
            "field": "username",
            "description": "<p>username for the new user</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "size": "10...",
            "optional": false,
            "field": "password",
            "description": "<p>password for the new user</p> "
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "validationError",
            "description": "<p>one or more validations on the username or password failed</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "hashError",
            "description": "<p>an error was encountered during password hashing</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  userpass: \"username must be at least five characters and alphanumeric; password must be at least ten characters\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 server error\n{\n  \"hash\": \"general hash error\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/register.js",
    "groupTitle": "Registration"
  },
  {
    "type": "get",
    "url": "/status/db",
    "title": "View DB status",
    "name": "GetDBStatus",
    "group": "Status",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Boolean</p> ",
            "optional": false,
            "field": "online",
            "description": "<p>indicates whether the database is online</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "tables",
            "description": "<p>count of database tables</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"online\": true,\n   \"tables\": 4\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/status.js",
    "groupTitle": "Status"
  },
  {
    "type": "get",
    "url": "/status",
    "title": "View system status",
    "name": "GetStatus",
    "group": "Status",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "status",
            "description": "<p>always returns &quot;up&quot;</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "host",
            "description": "<p>hostname of the server running the API</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "uptime",
            "description": "<p>uptime of the script in seconds</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object[]</p> ",
            "optional": false,
            "field": "database",
            "description": "<p>database information</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "database.file",
            "description": "<p>location of the sqlite database file</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Boolean</p> ",
            "optional": false,
            "field": "database.online",
            "description": "<p>indicates whether the database is online</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "database.tables",
            "description": "<p>count of database tables</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": \"up\",\n   \"host\": \"yourHostName\",\n   \"uptime\": 3,\n   \"database\": {\n     \"file\": \"data/db/suptracked.db\",\n     \"online\": true,\n     \"tables\": 4\n   }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/status.js",
    "groupTitle": "Status"
  },
  {
    "type": "get",
    "url": "/status/up",
    "title": "Check whether the system is up",
    "name": "GetUp",
    "group": "Status",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "status",
            "description": "<p>always returns &quot;up&quot;</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": \"up\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/status.js",
    "groupTitle": "Status"
  },
  {
    "type": "get",
    "url": "/user",
    "title": "Get user data",
    "name": "GetUser",
    "group": "User",
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "username",
            "description": "<p>id of the created experience</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "emergcontact",
            "description": "<p>phone number of the user's emergency contact</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "phone",
            "description": "<p>phone number of the user</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "admin",
            "description": "<p>1 if the user is an administrator, 0 if they are not</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"username\": jsmith,\n  \"emergcontact\": 5551234567,\n  \"phone\": 694165516,\n  \"admin\": 1,\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "put",
    "url": "/user",
    "title": "Update an experience",
    "name": "UpdateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "emergcontact",
            "description": "<p>phone number of the user's emergency contct</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": true,
            "field": "phone",
            "description": "<p>phone number for the user</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "noFields",
            "description": "<p>no fields to set were provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "illegalField",
            "description": "<p>a field to update was send that is not permitted (must be in above list)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"user\": \"no fields provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"user\": \"custom field requested that is not permitted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "put",
    "url": "/user/password",
    "title": "Update the user's password",
    "name": "UpdateUserPassword",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "password",
            "description": "<p>user's new password</p> "
          }
        ]
      }
    },
    "permission": [
      {
        "name": "ValidUserBasicAuthRequired"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "tooShort",
            "description": "<p>password too short or not provided</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "hashError",
            "description": "<p>a general hashing error was encountered</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"password\": \"password too short or not provided\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Server Errror\n{\n  \"hash\": \"general hash error\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  }
] });