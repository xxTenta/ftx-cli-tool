const router = require("express").Router();
const { createGame } = require("../game-engine/create-game")

module.exports = db => {
  // --- GET REQUESTS ---
  router.get("/account", (request, response) => {
    db.query(`SELECT * FROM account`)
      .then(({ rows: account }) => {
        response.json(account)
      })
  })

  // --- POST REQUESTS ---
  router.post("/account", async (request, response) => {
    const market = await
      db.query(`
        INSERT INTO account (name, api_key, balance)
        VALUES ($1::text, $2::text, $3::float)
      `, [ request.body.name, request.body.api_key, request.body.balance])

    response.send(market)
  })

  // --- PUT REQUESTS ---
  router.put("/account", async (request, response) => {
    const account = await
      db.query(`
        UPDATE account SET balance = $1::float WHERE id = $2::integer
      `, [ request.body.balance, request.body.id ])

    response.send(account)
  })

  return router
}
