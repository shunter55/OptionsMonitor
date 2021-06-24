const http = require('http');

var WebSocketClient = require('websocket').client;
const fs = require('fs').promises;

const auth = require('./AuthData.js')
const LiveRequests = require('./Requests.js')
const TDAStock = require('./TDAStock.js')

const liveRequests = new LiveRequests(auth)

// Stocks that should be monitored.
var stockSymbols = ['TQQQ', 'LMND', 'PFE', 'ZNGA', "TWTR", "AEO", "RIOT", "PINS"]
//const stockSymbols = ['PINS', "ZNGA", "TWTR"]


// Utility
// Get name of call option.
function callOption(ticker, mo, day, yr, price) {
  return ticker + "_" + mo + day + yr + "C" + price
}
// Get name of put option.
function putOption(ticker, mo, day, yr, price) {
  return ticker + "_" + mo + day + yr + "P" + price
}

var wsClient = new WebSocketClient();

// Send a request on the ws connection.
wsClient.send = function send(msg) {
  if (this.connection != undefined && this.connection.connected) {
    //console.log("Sending Message: ")
    //console.log(msg)
    this.connection.sendUTF(JSON.stringify(msg))
  } else {
    console.log("ERROR: Failed to send " + JSON.stringify(msg))
  }
}
// Send Login Request.
wsClient.login = function login(connection) {
  console.log("Logging in.")
  wsClient.connection = connection
  wsClient.send(liveRequests.login());
}

wsClient.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});
wsClient.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
    console.log('WebSocket Client Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      //console.log("Received: '" + message.utf8Data + "'");
      update(JSON.parse(message.utf8Data))
    } else {
      //console.log(message)
    }
  });
  wsClient.login(connection);
});

// Connect to TD Ameritrade.
const uri = 'wss://' + auth.streamerInfo.streamerSocketUrl + '/ws'
console.log("Connecting to: " + uri)
wsClient.connect(uri);

// Server ------------------------------------------------------------------
const hostname = '127.0.0.1';
const port = 3000;

var count = 0
const server = http.createServer((req, res) => {
  // console.log(req.url)
  switch (req.url) {
    case "/":
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html')
      res.end(htmlFile)
      break
    case "/stocks":
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/json')
      res.end(JSON.stringify(stocks))
      break
    default:
      res.writeHead(404);
      res.end(JSON.stringify({error:"Resource not found"}));
      break
  }
});

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// File to serve.
let htmlFile;

fs.readFile(__dirname + "/OptionsMonitor.html")
  .then(contents => {
      htmlFile = contents;
      server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
  })
  .catch(err => {
      console.error(`Could not read index.html file: ${err}`);
      process.exit(1);
  });

// --------------------------------------------------------------------------

// Stock Data.
var stocks = []
// Add all stocks in stockSymbols
setTimeout(function() {
  stockSymbols.forEach(sym => {
    stocks.push(new TDAStock(sym))
  })
}, 100)

setTimeout(() => {
  start()
}, 1000)

// Returns true if all the stocks are loaded.
function stocksLoaded() {
  if (stocks.length <= 0)
    return false

  for (idx in stocks) {
    if (!stocks[idx].isLoaded) {
      return false
    }
  }
  return true
}

function printStocks() {
  var str = ""
  if (stocksLoaded()) {
    stocks.forEach(stock => {
      //console.log(stock.symbol)
      //console.log("   $" + stock.bid + " - $" + stock.ask)
      str += stock.symbol + "\n" + "   $" + stock.bid + " - $" + stock.ask + "\n"
      var options = stock.options
      Object.keys(options).forEach(date => {
        //console.log("      " + date)
        str += "      " + date + "\n"
        Object.keys(options[date]).forEach(price => {
          var option = options[date][price]
          //console.log("         $" + price + ": (" + (parseFloat(option.bid) / parseFloat(stock.bid) * 100).toFixed(2) + "% : $" + (option.bid * 100).toFixed(2) + ") $" + option.bid + " - $" + option.ask)
          str += "         $" + price + ": (" + (parseFloat(option.bid) / parseFloat(stock.bid) * 100).toFixed(2) + "% : $" + (option.bid * 100).toFixed(2) + ") $" + option.bid + " - $" + option.ask + "\n"
        })
      })
    })
  }
  return str
}

// Register all stock quotes and options for live data.
function registerForLiveData(wsClient, liveRequests) {
  // Register Quote
  wsClient.send(liveRequests.quotes(stockSymbols))
  // Register Calls
  var allOptionSymbols = []
  stocks.forEach(stock => {
    stock.getAllOptionSymbols().forEach(sym => allOptionSymbols.push(sym))
  })
  wsClient.send(liveRequests.options(allOptionSymbols))
}

// Update Stocks when liveData is recieved.
function update(liveData) {
  if (liveData.data != undefined) {
    // Stock Live Updates
    liveData.data.forEach(serviceType => {
      // console.log("------> " + serviceType.service)

      switch(serviceType.service) {
        case "OPTION":
          serviceType.content.forEach(optionData => {
            keySplit = optionData.key.split("_") //PFE_070921C41
            var stockSymbol = keySplit[0]
            stocks.find(s => s.symbol == stockSymbol).updateOption(optionData)
          })
          break
        case "QUOTE":
          serviceType.content.forEach(quoteData => {
            var stockSymbol = quoteData.key
            stocks.find(s => s.symbol == stockSymbol).updateQuote(quoteData)
          })
          break
      }
    })
  }
  else if (liveData.notify != undefined && liveData.notify[0].heartbeat != undefined) {
    // Heartbeat
    var heartbeat = liveData.notify[0].heartbeat
    console.log("heartbeat: " + heartbeat)
  } else {
    console.log("Other LiveData: " + liveData)
  }
}

function start() {
  if (stocksLoaded()) {
    printStocks()
    registerForLiveData(wsClient, liveRequests)
  } else {
    setTimeout(start, 500)
  }
}
















