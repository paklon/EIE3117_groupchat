## EIE3117 Group Chat System v1.0.0

### Setup 

- This project uses MongoDB Atlas for the database.
- Before running the application, **create your own MongoDB cluster** (or local MongoDB).
- In `.env` file in the project root **replace the MongoDB URI** with your own:

  ```env
  MONGODB_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster>.<id>.mongodb.net/groupchatdb?retryWrites=true&w=majority
  SESSION_SECRET=change_this_secret
  PORT=3000
  ```
## Required Modules

Please install the following Node.js modules before running the project:

```bash
npm install express mongoose ejs dotenv express-session connect-mongo cookie-parser bcryptjs multer
```

### Module Purpose
- `express` – web framework for routing and server setup.
- `mongoose` – MongoDB object modeling and database connection.
- `ejs` – template engine for rendering HTML pages.
- `dotenv` – loads environment variables from `.env`.
- `express-session` – handles user sessions.
- `connect-mongo` – stores sessions in MongoDB.
- `cookie-parser` – reads cookies from the browser.
- `bcryptjs` – hashes and verifies user passwords.
- `multer` – handles image/file uploads.

### How to run

```bash
npm install
node server.js
# then open http://localhost:3000
```

### Features

- User registration and login with “remember me” option  
- Session-based login status using cookies  
- Create, join, and leave chat groups  
- Send text and image messages, manual “refresh chat”  
- MongoDB Atlas integration  
- Footer: `© 2026 EIE3117 23079398d Yuen Pak Hei`
