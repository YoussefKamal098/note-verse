# Full-stack note-taking application

A React-based web application for managing markdown content notes. This application allows users to create, update, delete, and organize notes. It also provides features like text search and filtering to easily manage and retrieve information.

---

## Overview

This project is a **full-stack note-taking application** built using the following stack:

- **Frontend**: React for the user interface, styled-components for styling, and various libraries for animations and UI improvements.
- **Backend**: Express.js as the server-side framework, Mongoose for data modeling with MongoDB, and Redis for caching.
- **Database**: MongoDB for storing notes data efficiently.
- **Utilities**: Axios for API requests, Yup and Formik for form management, JSON Web Token (JWT) for authentication, and more.

The app is focused on delivering a seamless user experience and robust API handling, including support for text-based note search, filtering, and CRUD operations.

---

## Features

- **Note CRUD**: Create, Read, Update, and Delete notes.
- **Search**: Full-text search for notes.
- **Tagging**: Add tags to notes for better organization.
- **Pinning**: Pin important notes for quick access.
- **Pagination**: Helps users navigate through a large list of notes by breaking the list into multiple pages.
---

## Installation

1. Clone the repository:
```shell script
git clone https://github.com/YoussefKamal098/note_app.git
   cd full-stack-note-app
```

2. Install dependencies:
```shell script
npm install
```

3. Set up the environment variables:
    - Create a new `.env` file in the root directory.
    - Add the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/notes
REDIS_URI=redis://127.0.0.1:6379
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=1
ALLOWED_ORIGINS=http://localhost:3000
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=1d
REFRESH_TOKEN_COOKIES_NAME=jwt
COOKIES_MAX_AGE=86400  # 24 hours in seconds
API_BASE_URL=http://localhost:5000/api/v1
NOTES_PER_PAGE=10
```

4. Start the application:
    - For development:
```shell script
npm run dev
```
- For production:
```shell script
npm run build
     npm start
```

---

## Usage

### 1. Start the backend server

- The backend server (Express.js) listens for API requests and connects to MongoDB and Redis. It must be started before accessing the frontend.

### 2. Access the frontend

- While the backend is running, you can interact with the app through the web at `http://localhost:3000`.

### 3. API Endpoints

## Routes
### Notes API
The following routes are used for managing notes:

| HTTP Method | Endpoint        | Description |
| --- |-----------------| --- |
| `POST` | `api/v1/notes`  | Create a new note |
| `GET` | `api/v1/notes/all`    | Get all notes |
| `GET` | `api/v1/notes/textSearch` | Perform text search |
| `GET` | `api/v1/notes/:id`     | Get a note by its ID |
| `PUT` | `api/v1/notes/:id`     | Update a note by its ID |
| `DELETE` | `api/v1/notes/:id`     | Delete a note by its ID |
### User and Authentication API
The following routes are used for user management and authentication:

| HTTP Method | Endpoint               | Description                                                            |
|-------------|------------------------|------------------------------------------------------------------------|
| `POST`      | `api/v1/auth/register` | Register a new user                                                    |
| `POST`      | `api/v1/auth/login`    | Log in an existing user                                                |
| `POST`      | `api/v1/auth/logout`   | Log out the currently logged-in user                                   |
| `POST`      | `api/v1/auth/refresh`  | Refresh the access token using the stored JWT in the cookie in browser |
| `GET`       | `api/v1/users/me`      | Get the logged-in user's profile                                       |

---

## Folder and File Structure

### Project Structure

```
notes_app/
│
├── .idea/                         # IDE configuration files (e.g., for JetBrains tools)
│
├── backend/                       # Backend application code (Node.js, Express)
│   ├── config/                    # Configuration files for the backend
│   │   ├── config.js              # General backend configuration (e.g., API URL, server port)
│   │   ├── corsOptions.js         # CORS (Cross-Origin Resource Sharing) settings
│   │   ├── db.js                  # Database connection configuration (e.g., MongoDB or SQL)
│   ├── controllers/               # Controller files for handling HTTP requests
│   │   ├── auth.controller.js     # Logic for handling authentication requests (login, logout)
│   │   ├── note.controller.js     # Logic for managing notes (CRUD operations)
│   │   ├── user.controller.js     # Logic for managing users (e.g., registration, profile)
│   ├── errors/                    # Error handling classes and functions
│   │   ├── app.error.js           # General error handling logic (custom error class)
│   ├── middlewares/               # Middleware for various backend operations
│   │   ├── auth.middleware.js     # Middleware to protect routes and check JWT token
│   │   ├── csp.middleware.js      # Middleware for Content Security Policy headers
│   │   ├── errorHandler.middleware.js  # Global error handler middleware
│   │   ├── notFound.middleware.js  # Middleware for handling 404 errors
│   │   ├── rateLimiter.middleware.js  # Rate-limiting middleware to prevent abuse
│   │   ├── timeout.middleware.js  # Timeout middleware to avoid long-running requests
│   ├── models/                    # Database models using ORM/ODM (e.g., Mongoose schemas)
│   │   ├── note.model.js          # Mongoose schema and model for the Note entity
│   │   ├── user.model.js          # Mongoose schema and model for the User entity
│   ├── repositories/              # Data access layer for database queries and operations
│   │   ├── note.repository.js     # Repository for interacting with the notes data in DB
│   │   ├── user.repository.js     # Repository for interacting with the users data in DB
│   ├── routes/                    # API routes for defining endpoints and HTTP methods
│   │   ├── auth.routes.js         # Routes for authentication (login, register, logout)
│   │   ├── index.js               # Main entry point for all backend routes
│   │   ├── note.routes.js         # Routes for managing notes (CRUD operations)
│   │   ├── user.routes.js         # Routes for managing user actions (profile, registration)
│   ├── services/                  # Service layer for business logic and external integrations
│   │   ├── cache.service.js       # Service for caching (e.g., using Redis)
│   │   ├── jwtAuth.service.js     # JWT authentication service (creating, verifying tokens)
│   │   ├── jwtProvider.service.js # Service for generating JWT tokens
│   │   ├── note.service.js        # Service for business logic around notes
│   │   ├── paginator.service.js   # Service for pagination (to split large result sets)
│   │   ├── passwordHasher.service.js # Service for hashing and verifying passwords
│   │   ├── rateLimiter.service.js # Service for rate-limiting requests
│   │   ├── user.service.js        # Service for user-related logic (e.g., user management)
│   ├── utils/                     # Utility functions for various tasks
│   │   ├── obj.utils.js           # Helper functions for working with objects
│   │   ├── string.utils.js        # Helper functions for string manipulation
│   ├── validations                # Validation logic for incoming requests (data validation)
│   │   ├── note.validation.js     # Validation logic for note-related fields (e.g., title, content)
│   │   ├── noteQuery.validation.js # Validation for note search/query parameters
│   │   ├── user.validation.js     # Validation for user-related fields (e.g., email, password)
│   ├── app.js                     # Main application setup (e.g., middleware, routing)
│   ├── package.json               # Node.js package manager file for backend dependencies
│
├── frontend/                      # Frontend React app code
│   ├── public/                    # Static files for the frontend (e.g., images, icons)
│   ├── src/                       # Source code for the React application
│   │   ├── api/                   # API communication layer (making HTTP requests to backend)
│   │   │   ├── apiClient.js       # Axios client for setting up API calls
│   │   │   ├── authService.js     # Frontend service for authentication-related API calls
│   │   │   ├── noteService.js     # Frontend service for interacting with note-related API
│   │   │   ├── tokenStorage.js    # Service for managing JWT tokens in localStorage/sessionStorage
│   │   │   ├── userService.js     # Frontend service for interacting with user-related API
│   │   ├── components/            # Reusable React components for UI
│   │   │   ├── animations/        # Components for handling animations
│   │   │   ├── buttons/           # Button components (e.g., delete, pin)
│   │   │   ├── common/            # Common reusable components (e.g., loader, pagination)
│   │   │   ├── forms/             # Form components (login, registration, input fields)
│   │   │   ├── navbar/            # Navigation bar components
│   │   │   ├── noteCard/          # Components for displaying notes
│   │   │   ├── notes/             # Components related to note display and creation
│   │   │   ├── searchBar/         # Search bar component for filtering/searching notes
│   │   │   ├── tags/              # Components for managing tags on notes
│   │   ├── contexts/              # React contexts for managing global state
│   │   ├── pages/                 # Pages for the different app routes (Home, Login, etc.)
│   │   ├── styles/                # Styles (CSS) for the app's UI
│   │   │   ├── customMarkdownEditor.css # Custom styles for markdown editor
│   │   │   ├── customTabs.css     # Styling for custom tab components
│   │   │   ├── global.css         # Global CSS for the entire frontend app
│   │   │   ├── pagination.css     # Pagination component styles
│   │   ├── validations            # Frontend form validation logic (email, password, etc.)
│   │   ├── App.jsx                # Main React component for the app (entry point)
│   │   ├── config.js              # Configuration file for frontend settings
│   │   ├── hooks.js               # Custom React hooks (e.g., for managing user authentication)
│   │   ├── index.css              # Main CSS for styling the frontend app
│   │   ├── index.js               # React app entry point (rendering the app)
│   │   ├── reportWebVitals.js     # For measuring performance in the app
│   │   ├── utils.js               # Helper functions for frontend
│   ├── package.json               # Node.js package manager file for frontend dependencies
│
├── .gitignore                     # Git ignore file (e.g., node_modules, .env, build files)
├── README.md                      # Project documentation (overview of the app, setup instructions)

```
---

## Potential Improvements

1. **Unit Tests**: Add unit tests for backend routes and frontend components.
2. **Authentication**: Enhance user authentication with OAuth.
3. **Offline Access**: Cache data locally for offline access.
4. **Profile Image Upload**: Users can upload and update their profile image.
5. **Logging**: Enhanced logging using Winston to track errors and user activity
6. **Ngram Search Optimization**: Implement n-gram based search for faster and more accurate full-text searches.
7. **Multi-session Login**: Track and manage user sessions across multiple devices and browsers.
8. **Pagination**: Cursor-based pagination to handle large datasets efficiently.
9. **Email Service**: Email notifications for user registration, password reset, and more.
10. **Email and Password Change**: Allows users to update their email and password securely.
11. **Delete Account**: Allow users to delete their account.
12. **Archive and Collection Notes**: Enable users to archive or group their notes into collections.
13. **User Settings Section (Frontend)**: Create a user settings section in the frontend where users can update their profile details and manage settings like email, password, and preferences. Design a user-friendly settings page in the frontend where users can:
    - Upload or change their profile image.
    - Update email and password.
    - View and manage active sessions.
---

## Contribution Guidelines

1. Fork the project.
2. Create a separate feature branch: `git checkout -b feature-name`.
3. Commit changes and push to GitHub.
4. Open a pull request for review.

---

## License

This project is open-source and available under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
