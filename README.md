# Backend Code For Kadfe!

## Endpoints

### /coffee
+ `GET` return current coffee status
  Status Code: 200
  Body: `{ 'status': 'coffee_status' }` where `'coffee_status'` is one of: `available`, `unavailable`

+ `POST` make new coffee
  + In case of coffee being unavailable:
      + Status Code: 200
      + Body: `{ 'status': 'available' }`
  + In case of coffee being already available:
      + Status Code: 409
      + Body: `{ 'message': 'coffee already available' }`

+ `DELETE` remove a coffee claim
  + In case of coffee being unavailable:
      + Status Code: 409
      + Body: `{ 'message': 'coffee already unavailable' }`
  + In case of coffee being already available:
      + Status Code: 200
      + Body: `{ 'status': 'unavailable' }`
