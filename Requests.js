module.exports = class LiveRequests {
	constructor(auth) {
		this.auth = auth
		this.requestId = 0

		//Converts ISO-8601 response in snapshot to ms since epoch accepted by Streamer
		var tokenTimeStampAsDateObj = new Date(auth.streamerInfo.tokenTimestamp);
		var tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();
		this.credentials = {
		  "userid": auth.accounts[0].accountId,
		  "token": auth.streamerInfo.token,
		  "company": auth.accounts[0].company,
		  "segment": auth.accounts[0].segment,
		  "cddomain": auth.accounts[0].accountCdDomainId,
		  "usergroup": auth.streamerInfo.userGroup,
		  "accesslevel": auth.streamerInfo.accessLevel,
		  "authorized": "Y",
		  "timestamp": tokenTimeStampAsMs,
		  "appid": auth.streamerInfo.appId,
		  "acl": auth.streamerInfo.acl
		}
	}

	// Utilities
	jsonToQueryString(json) {
	  return Object.keys(json).map(function(key) {
	    return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
	  }).join('&');
	}

	login() {
		return {
	    "requests": [
	      {
	        "service": "ADMIN",
	        "command": "LOGIN",
	        "requestid": this.requestId++,
	        "account": this.auth.accounts[0].accountId,
	        "source": this.auth.streamerInfo.appId,
	        "parameters": {
	          "credential": this.jsonToQueryString(this.credentials),
	          "token": this.auth.streamerInfo.token,
	          "version": "1.0"
	        }
	      }
	    ]
	  }
	}

	// Stocks - Array of stock symbols.
	quotes(stocks) {
		return {
	    "requests": [
	      {
	        "service": "QUOTE",
	        "requestid": this.requestId++,
	        "command": "SUBS",
	        "account": this.auth.accounts[0].accountId,
	        "source": this.auth.streamerInfo.appId,
	        "parameters": {
	            "keys": stocks.join(),
	            "fields": "0,1,2,3,4,5,15"
	        }
	      }
	    ]
	  }
	}

	// Options - Array of option symbols.
	options(options) {
		return {
	    "requests": [
	      {
	        "service": "OPTION",
	        "requestid": this.requestId++,
	        "command": "SUBS",
	        "account": this.auth.accounts[0].accountId,
	        "source": this.auth.streamerInfo.appId,
	        "parameters": {
	            "keys": options.join(), //callOption("TQQQ", "06", "25", "21", "109"),
	            "fields": "0,2,3"
	        }
	      }
	    ]
	  }
	}

}


















