# Howdy! Welcome to my tastytrade frontend take-home

To run, please execute
`bun install && bun run dev`
or if you prefer npm
`npm install && npm run dev`

## Here's a list of objectives for the project

- When the app first starts up, it should prompt for a username and password your
  sandbox user created in step 6 of Tastytrade Open API Registration and Sandbox User
- After the user provides a username and password, the app should exchange them for a
  session token as described in https://developer.tastytrade.com/api-overview/#auth-
  patterns. This session token will be used to authenticate all subsequent requests.
- Once a customer has successfully authenticated, the app should display a list of any
  watchlists the customer has previously created. This will be blank initially.
- The Watchlist screen should consisting of the following features:
- An interaction for users to switch between different watchlists
- The watchlist table composed of the following columns:
  - Stock Symbol
  - Bid Price
  - Ask Price
  - Last Price
- A way to modify a watchlist
  - Add a symbol to an existing watchlist
  - Remove a symbol from an existing watchlist
  - Create a new watchlist with a given name
  - Delete a watchlist
- Watchlists should be created and managed via interactions with the watchlists
  endpoints.
- When the user is adding a symbol to a watchlist, they should be presented with a
  symbol search screen to allow for auto-completion of a symbol.
- When a specific watchlist is displayed, the application should refresh the quotes on the
  active watchlist every 5 seconds.
- Bonus 1: Instead of polling, use streaming market data
  (https://developer.tastytrade.com/streaming-market-data/) to constantly stream and
  update prices when a watchlist is displayed.
- Bonus 2: Add an interaction which displays a new view when a user clicks on a symbol in
  the watchlist. This view should have the symbol, the current last price, and a 24 hour
  price chart (https://developer.tastytrade.com/streaming-market-data/#candle-events)
  for the symbol. Feel free to use an open source charting library to render the chart.
