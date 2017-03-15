// require('dotenv').configure()
const mongoose = require('mongoose')
const express = require('express')
const app = express()

const MONGO_HOST = process.env.MONGO_HOST
const COFFEE_DB = process.env.COFFEE_DB

if (!MONGO_HOST || !COFFEE_DB) {
  console.log('Please populate both MONGO_HOST and COFFEE_DB environment variables')
  process.exit()
}
const DB_URL = `mongodb://${MONGO_HOST}/${COFFEE_DB}`

const [ AVAILABLE, UNAVAILABLE ] = ['available', 'unavailable']

const Schema = mongoose.Schema

const coffeeStatusSchema = new Schema({
  status: String
})

const getCurrentStatus = () => new Promise((resolve, error) => {
  return CoffeeStatus.find().sort({ _id: 'desc' }).exec((err, docs) => {
    if (err) return error(err)
    else return resolve(docs[0])
  })
})

const setStatus = status => new Promise((resolve, error) => {
  return new CoffeeStatus({ status: status }).
    save((err, status) => { 
      if (err) return error(err)
      else return resolve(status)
    })
})

const CoffeeStatus = mongoose.model('CoffeeStatus', coffeeStatusSchema)

mongoose.connect(DB_URL)

app.get('/coffee', (req, resp) => {
  getCurrentStatus().
    then(currentStatus => {
      resp.status(200)
      resp.write({ status: currentStatus })
    })
})

app.post('/coffee', (req, resp) => {
  getCurrentStatus().
    then(currentStatus => {
      if (currentStatus == UNAVAILABLE) {
        setCurrentStatus(AVAILABLE).
          then(statusAfterUpdate => {
            resp.status(200)
            resp.write({ status: statusAfterUpdate })
          })
      }
      else {
        resp.status(409)
        resp.write({ message: 'coffee already available' })
      }
    })
})

app.delete('/coffee', (req, resp) => {
  getCurrentStatus().
    then(currentStatus => {
      if (currentStatus == AVAILABLE) {
        setCurrentStatus(UNAVAILABLE).
          then(statusAfterUpdate => {
            resp.status(200)
            resp.write({ status: statusAfterUpdate })
          })
      }
      else {
        resp.status(409)
        resp.write({ message: 'coffee already unavailable' })
      }
    })
})

app.listen(process.env.PORT || 3000, () => {
  getCurrentStatus().then(status => {
    if (typeof status === 'undefined')
      setStatus(UNAVAILABLE).
        then(status => console.log('set default status to unavailable'))
    console.log('listening')
  })
}).on('error', console.log)
