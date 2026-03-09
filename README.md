# QRify

Simple Express application for generating and tracking QR codes with user authentication.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run start
   ```

3. By default the app listens on port **3008** (or whatever `PORT` env var you set). Open:
   ```
   http://localhost:3008   # serves the built‑in web interface (index.html)
   ```

The `public` folder contains a simple client (`index.html` + `app.js`) that allows you to sign up/login, generate QR codes, and view the dashboard directly from the browser.


> If port 3000 is already in use you can either kill the existing process (`netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`) or set `PORT=3000` before running. The server will log the actual port it uses.

## Features

QRify provides a complete backend and a minimal web interface for managing
custom QR codes.  All of the following are implemented and can be exercised
from the browser, curl, Postman, etc.

- **User authentication** – signup and login using email/password; passwords are
  stored hashed with bcrypt, and JWT tokens are issued on login.  A simple
  middleware (`middleware/auth.js`) protects API routes by verifying the token.
- **QR code generation** – POST `/qr/generate` accepts a payload containing the
  target text/URL, a type label, and optional parameters for expiration date,
  password protection and one-time-use.  The server stores the record in MongoDB
  and returns a data‑URL image plus a shortened redirect link.
- **Redirect endpoint** – GET `/r/:id` performs dynamic behaviour:
  * if the document does not exist the client sees `QR not found`
  * checks expiry (`expireAt`) and returns `QR expired` if it has passed
  * if a password was set the link requires `?password=<value>`
  * one-time codes flip a `used` flag and return `QR already used` afterward
  * every successful hit increments a `scans` counter and then redirects to
    the original text value (typically a URL)
- **Scan counter** – each redirect increments a counter stored in the database
  which can be viewed in the dashboard.
- **Expiry, password, one-time use** – all enforced by the redirect route logic.
- **Dashboard** – GET `/qr/dashboard` returns a JSON array of all QR records
  (the simple front end refreshes this list after any operation).  You can see
  scan counts, expiry dates, and follow redirect links from the dashboard.

Additional capabilities you can build on top of the existing code include
per-user dashboards, QR code types (WiFi, contact card, etc.) and a more
sophisticated front end.

## Architecture & folder structure

The project is a standard Express application with a few additional folders
for models, routes and middleware.  MongoDB is used via Mongoose for persistence.

```
qrify
│
├── server.js              # entry point: sets up Express, connects to Mongo, \ 
│                         # serves static files and mounts routers
├── package.json           # project metadata and dependencies
├── models
│    ├── User.js           # Mongoose schema for users (email + hashed password)
│    └── QR.js             # Mongoose schema for QR records (text,type,scans,...)    
├── routes
│    ├── auth.js           # /auth/signup and /auth/login endpoints
│    └── qr.js             # /qr/generate, /qr/dashboard, /r/:id redirect, etc.
├── middleware
│    └── auth.js           # JWT verification, attaches `req.user` to requests
└── public
     ├── index.html        # simple web interface (forms + dashboard)
     └── app.js            # front-end logic to call the API and render results
```

The `public` directory is served statically; you can replace it with a richer
React/Vue/Angular frontend if desired.  The server is configured to listen on
port **3008** by default, but an environment variable `PORT` may override that.

### How it works

1. **Start the server** – `npm run start` runs `nodemon server.js`; the server
   connects to a local MongoDB instance (`mongodb://127.0.0.1:27017/qrify`)
   and prints "DB Connected".
2. **User flow** – a visitor signs up, logs in, and receives a JWT.  The token
   is stored in the browser (localStorage) and sent on subsequent requests to
   protected endpoints.
3. **Generating a QR** – when the client posts data to `/qr/generate`, the
   server creates a new QR document, constructs a `http://<host>/r/<id>` link,
   and uses the `qrcode` package to create an image.  The payload returned to
   the client includes both the image and link.
4. **Redirects and scans** – hitting `/r/:id` triggers the logic described in the
   Features section above.  Successful redirects update the record and send the
   user to the stored destination.
5. **Dashboard** – the client can fetch `/qr/dashboard` to list all records.  It
   rebuilds the page each time you click "Refresh".

This README explains what the project does and how each piece interacts – you
can hand it to someone to help them understand or extend the app.
