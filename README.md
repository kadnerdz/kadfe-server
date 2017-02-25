# Backend Code For Kadfe!

## Endpoints

### /brewed?user=<user>
*"Coffee is made"*
POST request for when coffee has been made.
*NB:* `user` parameter is optional.

### /coffee/claim?user=<user>
*"User claims coffee"*
POST request for when coffee has been claimed.

### /coffee/claim?user=<user>
*"User releases coffee"*
DELETE request for when coffee has been released.

### /status
*"Status of the coffee"*
GET request to check the coffee status.
