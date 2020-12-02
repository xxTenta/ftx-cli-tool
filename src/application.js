const fs = require("fs")
const path = require("path")

const express = require("express")
const bodyparser = require("body-parser")
const helmet = require("helmet")
const cors = require("cors")

const whitelist   = [
  'http://localhost:3000'
]

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const app = express()

const db = require("./db")

const ftx = require("./routes/ftx")

function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      file,
      {
        encoding: "utf-8"
      },
      (error, data) => {
        if (error) return reject(error);
        resolve(data);
      }
    )
  })
}

module.exports = function application () {
  app.use(cors());
  app.options('*', cors(corsOptions))
  app.use(helmet());
  app.use(bodyparser.json());

  app.use("/api", ftx(db))

  // [TODO] remove in production.
  Promise.all([
    read(path.resolve(__dirname, `db/schema/create.sql`)),
  ])
    .then(([create]) => {
      app.get("/api/debug/reset", (request, response) => {
        db.query(create)
          .then(() => {
            console.log("Database Reset");
            response.status(200).send("Database Reset")
          })
          .catch(console.log)
      
      })
    })
    .catch(error => {
      console.log(`Error setting up the reset route: ${error}`);
    })

  app.close = function() {
    return db.end()
  }

  return app
}
