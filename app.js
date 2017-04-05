// require('dotenv').configure()
const mongoose = require('mongoose')
const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const app = express()

const MONGO_HOST = process.env.MONGO_HOST
const MONGO_USER = process.env.MONGO_USER
const MONGO_PASS = process.env.MONGO_PASS
const MONGO_PORT = process.env.MONGO_PORT
const COFFEE_DB = process.env.COFFEE_DB

if (!MONGO_HOST || !MONGO_USER || !MONGO_PORT || !MONGO_PASS|| !COFFEE_DB) {
  console.log('Please populate both MONGO_HOST, MONGO_USER, MONGO_PASS, MONGO_PORT and COFFEE_DB environment variables')
  process.exit()
}
const DB_URL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${COFFEE_DB}`

const [ AVAILABLE, UNAVAILABLE ] = ['available', 'unavailable']

const Schema = mongoose.Schema

const coffeeStatusSchema = new Schema({
  status: String
})

const getCurrentStatus = () => new Promise((resolve, error) => {
  return CoffeeStatus.find().sort({ _id: 'desc' }).exec((err, docs) => {
    if (err) return error(err)
    else return resolve(docs[0])
  }).catch(console.log)
}).catch(console.log)

const setStatus = status => new Promise((resolve, error) => {
  return (new CoffeeStatus({ status })).
    save((err, newStatus) => {
      if (err) return error(err)
      else return resolve(newStatus)
    }).catch(console.log)
}).catch(console.log)

const CoffeeStatus = mongoose.model('CoffeeStatus', coffeeStatusSchema)

mongoose.connect(DB_URL)

app.get('/', (req, resp) => { resp.status(200); resp.send('hi') })

app.get('/coffee', (req, resp) => {
  getCurrentStatus().
    then(currentStatus => {
      resp.status(200)
      resp.send({ status: currentStatus.status })
    })
})

app.post('/coffee', (req, resp) => {
  setStatus(AVAILABLE).
    then(statusAfterUpdate => {
      resp.status(200)
      resp.send({ status: statusAfterUpdate.status })
      wss.broadcast(statusAfterUpdate.status)
    })
})

app.delete('/coffee', (req, resp) => {
  getCurrentStatus().
    then(currentStatus => {
      if (currentStatus.status == AVAILABLE) {
        setStatus(UNAVAILABLE).
          then(statusAfterUpdate => {
            resp.status(200)
            resp.send({ status: statusAfterUpdate.status })
            wss.broadcast(statusAfterUpdate.status)
          })
      }
      else {
        resp.status(409)
        resp.send({ message: 'coffee already unavailable' })
      }
    })
})

const server = http.createServer(app)

server.listen(process.env.PORT || 3000, () => {
  getCurrentStatus().then(status => {
    if (typeof status === 'undefined')
      setStatus(UNAVAILABLE).
        then(status => console.log('set default status to unavailable'))
    console.log('listening')
  })
}).on('error', console.log)

const wss = new WebSocket.Server({
  server,
  clientTracking: true,
  perMessageDeflate: false
})

wss.on('connection', ws => {
  console.log('client connected')
  getCurrentStatus().
    then(status => ws.send(status.status)).
    catch(err => ws.send(err))
  ws.on('message', message => {
    console.log(message)
  }).on('close', client => {
    console.log('client disconnected')
  }).on('error', client => {
    console.log('client error')
  })
})

setInterval(() => {
  wss.clients.forEach((client) => {
    client.ping()
  });
}, 45 * 1000)

setInterval(() => {
  var options = {
    hostname: 'kadfe-bot.herokuapp.com'
    protocol: 'https:'
  }

  var req = http.request(options, (res) => {});

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  }).end();
}, 60 * 1000)

wss.broadcast = message => {
  console.log('trying to broadcast: ' + message)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}
