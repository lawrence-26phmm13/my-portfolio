# My Portfolio — Full-stack Web Development Project

A beginner-friendly portfolio application using HTML, CSS, JavaScript, Node.js, Express and MongoDB.

## Features
- User registration and login
- Password hashing with bcrypt
- Session-based authentication stored in MongoDB
- Profile details: headline, about, location and contact number
- Create, read, update and delete education entries
- Add and delete skills
- Create, read, update and delete projects
- Logout
- Responsive colourful interface

## Requirements
Install Node.js (LTS) and have MongoDB running locally, or create a MongoDB Atlas database.

## Setup
1. Extract the ZIP and open the `my-portfolio` folder in VS Code.
2. Open a terminal in this folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` and rename the copy to `.env`.
5. Edit `.env` and set your MongoDB connection string and a long random `SESSION_SECRET`.

   Local MongoDB example:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/my_portfolio
   SESSION_SECRET=put_a_long_random_secret_here
   NODE_ENV=development
   ```

   For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string. Do not share your `.env` file or commit it to GitHub.

6. Start the server:

   ```bash
   npm start
   ```

7. Open `http://localhost:3000` in your browser.
8. Register an account. You will be redirected to your portfolio dashboard.

## MongoDB collections
- `users`: name, email and hashed password
- `portfolios`: profile details, skills, education entries and projects
- `sessions`: login session information (managed by connect-mongo)

In MongoDB Compass, connect to the same database and inspect these collections.

## API routes

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Portfolio (login required)
- `GET /api/portfolio`
- `PUT /api/portfolio`
- `POST /api/portfolio/skills`
- `DELETE /api/portfolio/skills`
- `POST /api/portfolio/education`
- `PUT /api/portfolio/education/:itemId`
- `DELETE /api/portfolio/education/:itemId`
- `POST /api/portfolio/projects`
- `PUT /api/portfolio/projects/:itemId`
- `DELETE /api/portfolio/projects/:itemId`

## Practical demonstration checklist
1. Register a new account.
2. Confirm the user record exists in MongoDB.
3. Log out and log back in.
4. Save profile information.
5. Add, edit and delete education details.
6. Add and delete skills.
7. Add, edit and delete a project.
8. Show the `users`, `portfolios` and `sessions` collections in MongoDB Compass.
9. Log out and show that the dashboard redirects to the login page.

## Notes
- The app uses server-side sessions. The browser receives an HTTP-only session cookie; passwords are hashed before saving.
- For a production deployment, use HTTPS, a strong secret, secure cookie settings, input validation, rate limiting and a managed database. Do not use the development fallback session secret in production.
- This is a learning project template. Review and understand each file so you can explain it during your practical showcase.
