# Full-stack note-taking application

A React-based web application for managing Markdown content notes.
This application allows users to create, update, delete, and organize notes.
It also provides features like text search and filtering to easily manage and retrieve
information.

---

## Overview

This project is a **full-stack note-taking application** built using the following stack:

- **Frontend**: React for the user interface, styled-components for styling, and various libraries for animations and UI
  improvements.
- **Backend**: Express.js as the server-side framework, Mongoose for data modeling with MongoDB, and Redis for caching.
- **Database**: MongoDB for storing notes data efficiently.
- **Utilities**: Axios for API requests, Yup and Formik for form management, JSON Web Token (JWT) for authentication,
  and more.

The app is focused on delivering a seamless user experience and robust API handling, including support for text-based
note search, filtering, and CRUD operations.

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
   cd note-app
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

- The backend server (Express.js) listens for API requests and connects to MongoDB and Redis. It must be started before
  accessing the frontend.

### 2. Access the frontend

- While the backend is running, you can interact with the app through the web at `http://localhost:3000`.

### 3. API Endpoints

## Routes

### Notes API

The following routes are used for managing notes:

| HTTP Method | Endpoint                   | Description                                       |
|-------------|----------------------------|---------------------------------------------------|
| `POST`      | `api/v1/notes`             | Create a new note                                 |
| `GET`       | `api/v1/notes/my_notes`    | Get authenticated user paginated notes with query |
| `GET`       | `api/v1/notes/my_note/:id` | Get a note by its ID                              |
| `PUT`       | `api/v1/notes/my_note/:id` | Update a note by its ID                           |
| `DELETE`    | `api/v1/notes/my_note/:id` | Delete a note by its ID                           |

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
├── .idea/                         # IDE configuration files (e.g., for JetBrains tools)
├── backend/                       # Backend application code (Node.js, Express)
│   ├── config/                    # Configuration files for the backend
│   │   ├── config.js              # General backend configuration (e.g., API URL, server port)
│   │   ├── corsOptions.js         # CORS (Cross-Origin Resource Sharing) settings
│   │   ├── authConfig.js          # Authentication-related configurations
│   ├── constants/                 # HTTP codes and status messages
│   │   ├── httpCodes.js           # HTTP status codes (e.g., 200, 404, 500)
│   │   ├── statusMessages.js      # Status messages for different responses (e.g., success, error)
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
│   │   ├── db.service.js          # Database connection configuration (e.g., MongoDB or SQL)
│   │   ├── jwtAuth.service.js     # JWT authentication service (creating, verifying tokens)
│   │   ├── jwtProvider.service.js # Service for generating JWT tokens
│   │   ├── note.service.js        # Service for business logic around notes
│   │   ├── paginator.service.js   # Service for pagination (to split large result sets)
│   │   ├── passwordHasher.service.js # Service for hashing and verifying passwords
│   │   ├── rateLimiter.service.js # Service for rate-limiting requests
│   │   ├── user.service.js        # Service for user-related logic (e.g., user management)
│   ├── utils/                     # Utility functions for various tasks
│   │   ├── obj.utils.js           # Helper functions for working with objects
│   │   ├── system.utils.js        # Contains utility functions for system-level operations, such as graceful shutdown and other core utilities.
│   ├── validations/               # Validation logic for incoming requests (data validation)
│   │   ├── note.validation.js     # Validation logic for note-related fields (e.g., title, content)
│   │   ├── noteQuery.validation.js # Validation for note search/query parameters
│   │   ├── user.validation.js     # Validation for user-related fields (e.g., email, password)
│   ├── serverInitializer.js       # Responsible for initializing the server by setting up middleware, routing, and other core configurations for the application.
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
│   │   │   ├── userService.js     # Frontend service for interacting with user-related API
│   │   ├── components/            # Reusable React components for UI
│   │   │   ├── animations/        # Components for handling animations
│   │   │   ├── avatar/            # Components for displaying user avatars
│   │   │   ├── buttons/           # Button components (e.g., delete, pin)
│   │   │   ├── common/            # Common reusable components (e.g., loader, pagination)
│   │   │   ├── confirmationPopup/ # Component for handling confirmation popups (e.g., for delete actions)
│   │   │   ├── dynamicTabs/       # Component for rendering dynamic tabs (e.g., for navigation or content categorization)
│   │   │   ├── forms/             # Form components (login, registration, input fields)
│   │   │   ├── navbar/            # Navigation bar components
│   │   │   ├── note/              # Components related to note display and creation
│   │   │   ├── noteCards/         # Components for displaying notes
│   │   │   ├── notifications/     # Components for displaying notifications
│   │   │   ├── searchBar/         # Search bar component for filtering/searching notes
│   │   │   ├── tags/              # Components for managing tags on notes
│   │   │   ├── tooltip/           # Directory containing Tooltip component for displaying hoverable tooltips.
│   │   ├── constants/             # Contains constants used throughout the application, such as HTTP codes and status messages.
│   │   │   ├── httpCodes.js       # Defines HTTP status codes and their descriptions (e.g., 200 OK, 404 Not Found, 500 Internal Server Error).
│   │   ├── contexts/              # React contexts for managing global state
│   │   ├── hooks/                     # Custom React hooks for managing reusable logic across components
│   │   │   ├── usePaginatedNotes.js   # Hook for managing pagination logic, fetching notes, and handling page transitions
│   │   │   ├── useNoteData.js         # Hook for fetching and managing the state of a specific note, including unsaved changes
│   │   │   ├── useNoteActions.js      # Hook for handling actions related to notes, such as creating, updating, and deleting
│   │   │   ├── useFormNavigation.js   # Hook for managing keyboard navigation within forms (e.g., using arrow keys and Enter)
│   │   ├── pages/                 # Pages for the different app routes (Home, Login, Register, Note, etc.)
│   │   ├── services/              # Contains utility services for managing various frontend functionalities
│   │   │   ├── tokenStorageService.js # Service for managing JWT tokens in localStorage/sessionStorage
│   │   │   ├── cacheService.js    # Service for frontend caching (e.g., using indexedDB)
│   │   ├── styles/                # Styles (CSS) for the app's UI
│   │   ├── validations/           # Frontend form validation logic (email, password, etc.)
│   │   ├── App.jsx                # Main React component for the app (entry point)
│   │   ├── config.js              # Configuration file for frontend settings
│   │   ├── index.css              # Main CSS for styling the frontend app
│   │   ├── index.js               # React app entry point (rendering the app)
│   │   ├── reportWebVitals.js     # For measuring performance in the app
│   ├── package.json               # Node.js package manager file for frontend dependencies
├── shared-utils/                  # Contains shared utility functions and modules used across both frontend and backend applications. This folder includes reusable logic, helper functions, and other tools designed to be used consistently throughout the project for code modularity and maintainability.
├── .gitignore                     # Git ignore file (e.g., node_modules, .env, build files)
├── LICENSE                        # License file for the project
├── README.md                      # Project documentation (overview of the app, setup instructions)

```

---

## Potential Improvements

### 1. **Unit Tests**

- Implement unit tests for both backend routes (API endpoints) and frontend components. This will ensure that
  codebase remains stable and is less prone to regressions.

### 2. **Authentication**

- Enhance the authentication mechanism by integrating **OAuth** for social media logins (Google, Facebook, etc.). This
  would give users more login options and improve the overall user experience.

### 3. **Offline Access**

- Implement **service workers** and **IndexedDB** for **offline access**. This will allow users to access their notes
  even without an internet connection. The app could sync changes to the backend once the internet is available.

### 4. **Profile Image Upload**

- Allow users to upload and update their **profile image**. This will make user profiles more personalized and visually
  appealing.

### 5. **Logging**

- Integrate **Winston** or any other logging library for **error logging** and tracking user activity. This will help in
  debugging and provide insights into user behavior.

### 6. **N-gram Search Optimization**

- Implement an **n-gram based search** to optimize full-text searches for faster and more accurate results, especially
  for large datasets.

### 7. **Multi-session Login**

- Track and manage **multi-session logins** across different devices and browsers. This feature would help users stay
  logged in on multiple platforms at once.

### 8. **Pagination**

- Implement **cursor-based pagination** for better performance when displaying large sets of data (such as long note
  lists or user activity logs).

### 9. **Email Service**

- Add an **email service** to send notifications for actions like **user registration**, **password resets**, and **user
  activity**. You could also use this service to send weekly summaries or reminders.

### 10. **Email and Password Change**

- Allow users to **update their email** and **password** securely. Adding multi-factor authentication (MFA) can also
  improve security during these changes.

### 11. **Delete Account**

- Provide users with the option to **delete their account**. Ensure that the data is wiped securely from both the
  backend and frontend storage.

### 12. **Compression for Large Markdown Content (Frontend & Backend)**

- Implement **compression for large Markdown content** (using libraries like `pako` in the frontend and `zlib` in the
  backend) to reduce the amount of data transmitted over the network.

### 13. **Archive and Collection Notes**

- Enable users to **archive or group their notes** into different **collections**. This will help with better
  organization and easier access to notes.

### 14. **User Settings Section (Frontend)**

- Create a **user settings page** where users can:
    - Upload or change their profile image.
    - Update their email and password.
    - View and manage active sessions.
    - Customize preferences like theme, language, etc.

### 15. **Real-time Collaboration**

- Implement **real-time collaboration** for note editing, similar to Google Docs. This would allow multiple users to
  edit a note simultaneously with changes synced in real-time.

### 16. **Version History / Note History**

- Implement a **note history/version control** feature to track changes over time. Users can view past versions of a
  note and restore them if needed. This feature can be especially useful for collaborative environments.

### 17. **Data Encryption (Security)**

- Encrypt sensitive data (e.g., user data, note content) both at rest and in transit.
  This will help improve the app's security and protect user privacy.

### 18. **Notification System**

- Implement an in-app **notification system** to alert users about important updates, reminders, or new activities on
  their notes or account.

### 19. **Analytics & Reporting**

- Integrate **analytics** to track user interactions and gather insights on how users are engaging with the app. You can
  use this data to improve the user experience and prioritize new features.

### 20. **Caching in Server and Frontend (React & Express)**

- Frontend Caching: Use Service Workers for offline access, IndexedDB for storing notes and metadata, and localStorage
  for caching lightweight user preferences.
- Backend Caching: Implement Redis or Memcached to cache API responses and database queries, and use CDN for static
  assets to improve performance and reduce server load.

### 21. **Push Notification**

- Integrated push notification service to notify users of key actions:
    - Login activity.
    - Password changes.
    - Email updates.
    - Other critical notifications.
- Added frontend support for handling and displaying push notifications.
- Updated backend to send notification payloads using a secure and efficient push notification protocol.
- Enhanced user settings to allow toggling notification preferences.

---

## Contribution Guidelines

1. Fork the project.
2. Create a separate feature branch: `git checkout -b feature-name`.
3. Commit changes and push to GitHub.
4. Open a pull request for review.

---

## License

This project is open-source and available under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
