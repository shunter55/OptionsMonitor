const axios = require('axios');
const TDAOption = require('./TDAOption.js')

module.exports = class TDAStock {

	// apiData - quote data returned from TDA rest api.
	constructor(symbol) {
		this.isLoaded = false
		this.updateFromApiData(symbol)
	}

	// Update the Stock and Options using ApiData.
	updateFromApiData(symbol) {
		if (symbol == undefined && this.symbol == undefined) {
			Console.log("Error: Cannot update from ApiData without a symbol")
		} else {
			if (symbol != undefined) {
				this.symbol = symbol
			}
			this.getCallData(this.symbol, apiData => {
				this.updateWithApiData(apiData.quote, apiData.calls)
				this.isLoaded = true
			})
		}
	}

	updateWithApiData(quoteData, callData) {
		this.symbol = quoteData.symbol
		this.description = quoteData.description
		this.change = parseFloat(quoteData.change).toFixed(2)
		this.percentChange = parseFloat(quoteData.percentChange).toFixed(2)
		this.bid = parseFloat(quoteData.bid).toFixed(2)
		this.ask = parseFloat(quoteData.ask).toFixed(2)
		this.last = parseFloat(quoteData.last).toFixed(2)
		this.close = parseFloat(quoteData.close).toFixed(2)

		console.log(quoteData)

		this.options = {}
		for (var expireDate in callData) {
			var expireDateTrimmed = expireDate.substring(0, 10)
			var optionsForDay = callData[expireDate]
			// Add expiration date object.
			this.options[expireDateTrimmed] = {}

			for (var strikePrice in optionsForDay) {
				var optionData = optionsForDay[strikePrice]
				var option = new TDAOption(optionData)
				// Add strike price object.
				this.options[expireDateTrimmed][option.strikePrice] = option
			}
		}
	}

	getDate(offset = 0) {
		var date = new Date()
		date.setDate(date.getDate() + offset)
		return date.toISOString().slice(0, 10)
	}

	// Stock Symbol, Strike Count above and below current strike, up to number of days in the future.
	getCallData(symbol, callback, strikeCount = 5, dayOffset = 40) {
		var uri = 'https://api.tdameritrade.com/v1/marketdata/chains?apikey=NZP679F3SDK8UNGITLKMS4BTEXJULW71&symbol=' + symbol + '&contractType=CALL&strikeCount=' + strikeCount + '&includeQuotes=TRUE&strategy=ANALYTICAL&fromDate=' + this.getDate() + '&toDate=' + this.getDate(dayOffset)
		axios.get(uri).then(resp => {
			if (resp == undefined || resp.status == undefined || resp.status != 200) {
				// Request Failed, Retry
				setTimeout(getCallData, 1000, symbol, callback, strikeCount, dayOffset)
			} else {
				// Request Successful.
				var data = {
					"quote": resp.data.underlying,
					"calls": resp.data.callExpDateMap
				}
		    callback(data)
		  }
	  })
	}

	// Returns the list of Expire Tokens for the options.
	optionExpireTokens() {
		return Object.keys(this.options)
	}

	// Returns the list of strike prices for options with a given exipire date.
	optionStrikePrice(expireToken) {
		return Object.keys(this.options[expireToken])
	}

	// Returns the option.
	getOption(expire, strike) {
		return this.options[expire][strike]
	}

	getAllOptions() {
		var options = []
		this.optionExpireTokens().forEach(expire => {
			this.optionStrikePrice(expire).forEach(strike => {
				var option = this.getOption(expire, strike)
				options.push(option)
			})
		})
		return options
	}

	getAllOptionSymbols() {
		var options = []
		this.optionExpireTokens().forEach(expire => {
			this.optionStrikePrice(expire).forEach(strike => {
				var option = this.getOption(expire, strike)
				options.push(option.symbol)
			})
		})
		return options
	}

	// Register stock for live data. Start listening for updated.
	registerForLiveData(wsClient, liveRequests) {
		// Register all Option Symbols
		var optionSymbols = []

		this.optionExpireTokens().forEach(expire => {
			this.optionStrikePrice(expire).forEach(strike => {
				var option = this.getOption(expire, strike)
				optionSymbols.push(option.symbol)
			})
		})
	}

	// https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
	updateQuote(quoteData) {
		//console.log(quoteData)
		if (quoteData[1] != undefined)
			this.bid = quoteData[1]
		if (quoteData[2] != undefined)
			this.ask = quoteData[2]
		if (quoteData[3] != undefined)
			this.last = quoteData[3]
		if (quoteData[15] != undefined)
			this.close = quoteData[15]
		// console.log(this.symbol + " updated")
	}

	// wsClient callback to update data. Should be called when data for the stock is recieved.
	updateOption(optionData) {
		// Find the Option to update.
		var keySplit = optionData.key.split("_") //PFE_070921C41
    var stockSymbol = keySplit[0]
    var expire = keySplit[1].substring(0, 6)
    // Hacky solution to get expire date.
    var expireSym = "20" + expire.slice(4, 6) + "-" + expire.slice(0, 2) + "-" + expire.slice(2, 4)
    var strike = parseFloat(keySplit[1].substring(7)).toFixed(2)

    var option = this.getOption(expireSym, strike)
    if (option == undefined) {
    	console.log("Error: option[" + expireSym + "][" + strike + "] is undefined.")
    	return
    }

    if (option.symbol == optionData.key) {
    	// Update Option
    	option.update(optionData)
    } else {
    	console.log("ERROR: " + option.symbol + " does not match " + optionData.key + "!")
    }
	}
}


















