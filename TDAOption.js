module.exports = class TDAOption {
	
	// apiData - the data returned from TDA option api. Ex: '111.0': [{}].
	constructor(apiData) {
		var data = apiData[0]
		// TQQQ_062521C111
		this.symbol = data.symbol
		this.description = data.description
		// 111
		this.strikePrice = parseFloat(data.strikePrice).toFixed(2)
		// 3
		this.bid = parseFloat(data.bid).toFixed(2)
		// 3.3
		this.ask = parseFloat(data.ask).toFixed(2)
		this.expirationDate = new Date(data.expirationDate)
		
		//this.data = data
	}


	// Update Option Data using stream data.
	update(streamData) {
		// console.log(streamData)
		if (streamData[0] != undefined) {
			console.log(this.symbol + ": " + streamData[0])
		}

		if (streamData[2] != undefined)
			this.bid = parseFloat(streamData[2]).toFixed(2)
		if (streamData[3 != undefined])
			this.ask = parseFloat(streamData[3]).toFixed(2)
		// console.log(this.symbol + " updated")
	}

}