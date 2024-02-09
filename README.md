# Simple FrontEnd for testing Node.js CRUD-API RS School task
## You can run it on a local server. For example, you can use VS Code "Go Live".
## On your Node.js server:
* Add following headers to responses:
  - Access-Control-Allow-Origin = *
  - Access-Control-Allow-Headers = Content-Type

* Add OPTIONS response (status 204) with the header:
  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE

* Add the header for responses with data as well as error messages:
  - Content-Type = application/json

* Use object for error messages:
  - { message: string }

### Default port is 4000
#### Note: if hobby input is empty or just spaces it will not be added to the hobbies array