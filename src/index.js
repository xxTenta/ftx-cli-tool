require('dotenv').config()
const axios  = require('axios')
const crypto = require('crypto')
const colors = require('colors')

// env variables.
const args    = process.argv.slice(2, process.argv.length)
const API_KEY = process.env.API_KEY
const SECRET  = process.env.SECRET

// base url.
const URL = 'https://ftx.com/api'

// user authentication.
const userAuth = (ts, method, url, _body) => {
  const body = _body ? String(_body) : ""
  const payload = `${ts}${method}${url}${body}`

  const signature = crypto.createHmac('sha256', SECRET.toString('utf-8'))
                          .update(payload)
                          .digest('hex')

  return signature
}

// set authentication header.
const headers = (method, url, _body) => {
  const ts = Date.now()

  if (args[0] === 'main')
    return {
      'FTX-KEY': API_KEY,
      'FTX-SIGN': userAuth(ts, method, url, _body),
      'FTX-TS': ts
    }
  return {
    'FTX-KEY': API_KEY,
    'FTX-SIGN': userAuth(ts, method, url, _body),
    'FTX-TS': ts,
    'FTX-SUBACCOUNT': args[0]
  }
}

// helpers.
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// axios requests.
const getBalances = async () => {
  const header = headers('GET', '/api/wallet/balances', null)
  let response = await axios.get(`${URL}/wallet/balances`, { headers: header })
  response = response.data.result
  
  if (response && response.length > 0) {
    const available = response.map(pair => pair.usdValue).reduce((x, y) => x + y, 0)

    console.log(`
      ${`${`                 `} ${`ACCOUNT BALANCES`.bold} ${`                 `}`.bgBlack}`)

    response.forEach(pair => {
      console.log(`
      ${`${`${pair.coin}`.bold}`.padEnd(25)} ${`${(pair.availableWithoutBorrow).toFixed(6)}`.padEnd(19)} ${money.format(pair.usdValue).green}`)
    })

    console.log(`
      ${`Available Funds:`.yellow } ~ ${money.format(available).bold}
    `)
  }
}

const getPositions = async () => {
  const header = headers('GET', '/api/account', null)
  let response = await axios.get(`${URL}/account`, { headers: header })
  response = response.data ? response.data.result.positions : null

  /*
  if (response.length > 0) {
    const history = response.map(pair => pair.usdValue).reduce((x, y) => x + y, 0)

    console.log(`
      ${`${`                 `} ${`ACCOUNT BALANCES`.bold} ${`                 `}`.bgBlack}`)

    response.forEach(pair => {
      console.log(`
      ${`${`${pair.coin}`.bold}`.padEnd(25)} ${`${(pair.availableWithoutBorrow).toFixed(6)}`.padEnd(19)} ${money.format(pair.usdValue).green}`)
    })

    console.log(`
      ${`Available Funds:`.magenta} ~ ${money.format(available).bold}
    `)
  */

  console.log(response)
}

const executeTrade = async (market, side, price, type, size) => {
  const data = {
    market, side, price, type, size
  }

  const header = headers(market, side, price, type, size)
  const response = await axios.post(`${URL}/orders`, data, headers)
  console.log(response.data)

}

const main = () => {
  // [TODO] input validation.
  if (!args[0]) {
    console.log(`
      ${`${`                 `} ${`API USAGE`.bold} ${`                 `}`.bgBlack}

      ${`npm start`.green} ${`[Account Name (${`main`.blue} if not subaccount)]`.red} [arg2] ... arg[n]

      ${`${`       `} ${`GET COMMANDS`.bold} ${`        `}`.bgBlack}
      
      ${`~$`.bold} ${`npm start`.green} ${`GET`.red} balances
      ${`~$`.bold} ${`npm start`.green} ${`GET`.red} positions

      ${`${`       `} ${`POST COMMANDS`.bold} ${`       `}`.bgBlack}

      ${`~$`.bold} ${`npm start`.green} ${`POST`.red} [place_order] [market] [side] [price] [type] [size]

      @sliveofpuss-justasliver.com
    `)
  } else if (args[1] === 'GET') {
    if      (args[2] === 'balances')      getBalances()
    else if (args[2] === 'positions') getPositions()
    // ----
  } else if (args[1] === 'POST') {
    if (args[2] === 'trade')
      executeTrade(argvs[3], argv[4], argv[5], argv[6], argv[7])
  } else {
    console.log(`
      ${`${`                 `} ${`API USAGE`.bold} ${`                 `}`.bgBlack}

      ${`npm start`.green} ${`[Account Name (${`main`.blue} if not subaccount)]`.red} [arg2] ... arg[n]

      ${`${`       `} ${`GET COMMANDS`.bold} ${`        `}`.bgBlack}
      
      ${`~$`.bold} ${`npm start`.green} ${`GET`.red} balances
      ${`~$`.bold} ${`npm start`.green} ${`GET`.red} positions

      ${`${`       `} ${`POST COMMANDS`.bold} ${`       `}`.bgBlack}

      ${`~$`.bold} ${`npm start`.green} ${`POST`.red} [place_order] [market] [side] [price] [type] [size]

      @sliveofpuss-justasliver.com
    `)
  }
}

main()
