// https://developer.tdameritrade.com/user-principal/apis/get/userprincipals-0 with streamerSubscriptionKeys,streamerConnectionInfo in fields.
var userPrincipalsResponse = {
  "userId": "sjkobata",
  "userCdDomainId": "A000000031889039",
  "primaryAccountId": "865179634",
  "lastLoginTime": "2021-06-23T23:54:05+0000",
  "tokenExpirationTime": "2021-06-24T00:24:06+0000",
  "loginTime": "2021-06-23T23:54:06+0000",
  "accessLevel": "CUS",
  "stalePassword": false,
  "streamerInfo": {
    "streamerBinaryUrl": "streamer-bin.tdameritrade.com",
    "streamerSocketUrl": "streamer-ws.tdameritrade.com",
    "token": "e66ef94df169a3246e2b759580ab3e367fe1ebb3",
    "tokenTimestamp": "2021-06-23T23:54:09+0000",
    "userGroup": "ACCT",
    "accessLevel": "ACCT",
    "acl": "AKBHBPCNDRDTESF7G1G3G5G7GKGRH1H3H5M1MAOFPNQSRFSDTBTETFTOTTUAURXBXNXOD2D4D6D8E2E4E6E8F2F4F6H7I1",
    "appId": "DP"
  },
  "professionalStatus": "NON_PROFESSIONAL",
  "quotes": {
    "isNyseDelayed": false,
    "isNasdaqDelayed": false,
    "isOpraDelayed": false,
    "isAmexDelayed": false,
    "isCmeDelayed": true,
    "isIceDelayed": true,
    "isForexDelayed": true
  },
  "streamerSubscriptionKeys": {
    "keys": [
      {
        "key": "a55c811acaf126118d2a5aee7cb7770521e5699599f1eb3c804a2a9daab7206e9"
      }
    ]
  },
  "exchangeAgreements": {
    "NYSE_EXCHANGE_AGREEMENT": "ACCEPTED",
    "NASDAQ_EXCHANGE_AGREEMENT": "ACCEPTED",
    "OPRA_EXCHANGE_AGREEMENT": "ACCEPTED"
  },
  "accounts": [
    {
      "accountId": "865179634",
      "displayName": "sjkobata",
      "accountCdDomainId": "A000000031889040",
      "company": "AMER",
      "segment": "AMER",
      "acl": "AKBHBPCNDRDTESF7G1G3G5G7GKGRH1H3H5M1MAOFPNQSRFSDTBTETFTOTTUAURXBXNXO",
      "authorizations": {
        "apex": false,
        "levelTwoQuotes": false,
        "stockTrading": true,
        "marginTrading": true,
        "streamingNews": false,
        "optionTradingLevel": "FULL",
        "streamerAccess": true,
        "advancedMargin": true,
        "scottradeAccount": false
      }
    }
  ]
}

module.exports = userPrincipalsResponse




