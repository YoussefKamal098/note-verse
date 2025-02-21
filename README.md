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

**Backend**

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
LOGS_DIR=./logs
EMAIL_HOST=smtp.gmail.com         # SMTP host (default: smtp.gmail.com)
EMAIL_PORT=465                    # SMTP port (default: 465 for secure connection)
EMAIL_SECURE=true                 # Whether to use a secure connection (true/false)
EMAIL_USER=your-email@example.com # Email username
EMAIL_PASS=your-email-password    # Email password
EMAIL_FROM=your-email@example.com # Default sender email address (optional)
EMAIL_TEMPLATES_DIR=./templates/emails  # Directory containing email templates
```

**Frontend**

```env
API_BASE_URL=http://localhost:5000/api/v1
NOTES_PER_PAGE=10
```

---

## Start the Application

### Development Mode

#### Express Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
   > This command typically uses a tool like [nodemon](https://www.npmjs.com/package/nodemon) for hot-reloading, so any
   changes in your backend code will automatically restart the server.  
   > Ensure your environment variables (e.g., port number) are set as needed.

#### React Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
   > This command launches the React development server (typically on port 3000), which supports hot module replacement
   for instant feedback during development.

---

### Production Mode

#### Express Backend

1. **Build the project (if applicable):**  
   If you’re using Babel, TypeScript, or another transpiler, run the build script:
   ```bash
   npm run build
   ```
2. **Start the server in production mode:**
   ```bash
   npm start
   ```
   > Ensure you set the environment variable `NODE_ENV=production` before starting the server.  
   > For improved process management and automatic restarts, consider using [PM2](https://pm2.keymetrics.io/):
   ```bash
   pm2 start dist/app.js --name "my-express-app"
   ```

#### React Frontend

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
   > This command creates an optimized bundle in the `build` directory.
2. **Serve the static files:**
    - **Option A:** Use a static file server like [serve](https://www.npmjs.com/package/serve):
      ```bash
      npm install -g serve
      serve -s build
      ```
    - **Option B:** Integrate the frontend with your Express backend by adding middleware to serve static files. For
      example, add the following to your Express app:
      ```js
      const path = require('path');
      // Serve static files from the React app
      app.use(express.static(path.join(__dirname, 'frontend/build')));
 
      // The "catchall" handler: for any request that doesn't match one above, send back React's index.html.
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
      });
      ```
   > This approach allows both your backend API and the React frontend to run together on the same server.

---

## Usage

### 1. Start the backend server

- The backend server (Express.js) listens for API requests and connects to MongoDB and Redis. It must be started before
  accessing the frontend.

### 2. Access the frontend

- While the backend is running, you can interact with the app through the web at `http://localhost:3000`.

## API Endpoints

### Routes

#### Notes API

The following routes are used for managing notes:

| HTTP Method | Endpoint                   | Description                                            |
|-------------|----------------------------|--------------------------------------------------------|
| `POST`      | `api/v1/notes`             | Create a new note                                      |
| `GET`       | `api/v1/notes/my_notes`    | Retrieve authenticated user paginated notes with query |
| `GET`       | `api/v1/notes/my_note/:id` | Retrieve the authenticated user's note by its ID       |
| `PUT`       | `api/v1/notes/my_note/:id` | Update the authenticated user's note by its ID         |
| `DELETE`    | `api/v1/notes/my_note/:id` | Delete the authenticated user's note by its ID         |

#### User and Authentication API

The following routes are used for user management and authentication:

| HTTP Method | Endpoint               | Description                                                            |
|-------------|------------------------|------------------------------------------------------------------------|
| `POST`      | `api/v1/auth/register` | Register a new user                                                    |
| `POST`      | `api/v1/auth/login`    | Log in an existing user                                                |
| `POST`      | `api/v1/auth/logout`   | Log out the currently logged-in user                                   |
| `POST`      | `api/v1/auth/refresh`  | Refresh the access token using the stored JWT in the cookie in browser |
| `GET`       | `api/v1/users/me`      | Retrieve the logged-in user's profile                                  |

---

## Folder and File Structure

### Project Structure

```
notes_app/
├── .idea/                         # IDE configuration files (e.g., for JetBrains tools)
├── backend/                       # Backend application code (Node.js, Express)
│   ├── config/                    # Configuration files for the backend
│   ├── constants/                 # Centralized application constants and configurations
│   ├── controllers/               # Controller files for handling HTTP requests
│   ├── errors/                    # Error handling classes and functions
│   ├── middlewares/               # Middleware for various backend operations
│   ├── models/                    # Database models using ORM/ODM (e.g., Mongoose schemas)
│   ├── queues/                    # Background job queues and workers and task scheduling (e.g., using Bull)
│   ├── repositories/              # Data access layer for database queries and operations
│   ├── routes/                    # API routes for defining endpoints and HTTP methods
│   ├── services/                  # Service layer for business logic and external integrations
│   ├── types/                     # Global type definitions (JSDoc typedefs) for application models, configs, and utilities
│   ├── utils/                     # Utility functions for various tasks
│   ├── validations/               # Validation logic for incoming requests (data validation)
│   ├── .nvmrc                     # Node.js version specification .nvmrc  
│   ├── serverInitializer.js       # Responsible for initializing the server by setting up middleware, routing, and other core configurations for the application.
│   ├── app.js                     # Main application setup (e.g., middleware, routing)
│   ├── package.json               # Node.js package manager file for backend dependencies
├── frontend/                      # Frontend React app code
│   ├── public/                    # Static files for the frontend (e.g., images, icons)
│   ├── src/                       # Source code for the React application
│   │   ├── api/                   # API communication layer (making HTTP requests to backend)
│   │   ├── components/            # Reusable React components for UI
│   │   │   ├── animations/        # Components for handling animations
│   │   │   ├── buttons/           # Button components (e.g., delete, pin)
│   │   │   ├── common/            # Common reusable components (e.g., loader, pagination)
│   │   │   ├── confirmationPopup/ # Component for handling confirmation popups (e.g., for delete actions)
│   │   │   ├── dynamicTabs/       # Component for rendering dynamic tabs (e.g., for navigation or content categorization)
│   │   │   ├── errors/            # Contains components for handling and displaying errors.
│   │   │   ├── forms/             # Form components (login, registration, input fields)
│   │   │   ├── navbar/            # Navigation bar components
│   │   │   ├── note/              # Components related to note display and creation
│   │   │   ├── noteCards/         # Components for displaying notes
│   │   │   ├── notifications/     # Components for displaying notifications
│   │   │   ├── searchBar/         # Search bar component for filtering/searching notes
│   │   │   ├── tags/              # Components for managing tags on notes
│   │   │   ├── tooltip/           # Directory containing Tooltip component for displaying hoverable tooltips.
│   │   │   ├── userMenu/          # Contains the UserMenu component and related styles/components for displaying and interacting with the user menu (e.g., toggling the dropdown, showing the user avatar, theme switch, etc.).
│   │   ├── config/                # The 'config' directory contains configuration files that manage various frontend settings, such as environment variables
│   │   ├── constants/             # Contains constants used throughout the application, such as HTTP codes and status messages.
│   │   ├── contexts/              # React contexts for managing global state
│   │   ├── hooks/                 # Custom React hooks for managing reusable logic across components
│   │   ├── pages/                 # Pages for the different app routes (Home, Login, Register, Note, Errors, etc.)
│   │   ├── services/              # Contains utility services for managing various frontend functionalities
│   │   ├── styles/                # Styles (CSS) for the app's UI
│   │   ├── validations/           # Frontend form validation logic (email, password, etc.)
│   │   ├── workers/               # Web Workers for running background tasks without blocking the main thread
│   │   ├── App.jsx                # Main React component for the app (entry point)
│   │   ├── index.css              # Main CSS for styling the frontend app
│   │   ├── index.js               # React app entry point (rendering the app)
│   │   ├── reportWebVitals.js     # For measuring performance in the app
│   ├── .nvmrc                     # Node.js version specification .nvmrc
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

- Implement an **n-gram-based search** to optimize full-text searches for faster and more accurate results, especially
  for large datasets.

### 7. **Pagination**

- Implement **cursor-based pagination** for better performance when displaying large sets of data (such as long note
  lists or user activity logs).

### 8. **Email Service**

- Add an **email service** to send notifications for actions like **user registration**, **password resets**, and **user
  activity**. You could also use this service to send weekly summaries or reminders.

### 9. **Email and Password Change**

- Allow users to **update their email** and **password** securely. Adding multi-factor authentication (MFA) can also
  improve security during these changes.

### 10. **Delete Account**

- Provide users with the option to **delete their account**. Ensure that the data is wiped securely from both the
  backend and frontend storage.

### 11. **Compression for Large Markdown Content (Frontend & Backend)**

- Implement **compression for large Markdown content** (using libraries like `pako` in the frontend and `zlib` in the
  backend) to reduce the amount of data transmitted over the network.

### 12. **Archive and Collection Notes**

- Enable users to **archive or group their notes** into different **collections**. This will help with better
  organization and easier access to notes.

### 13. **User Settings Section (Frontend)**

- Create a **user settings page** where users can:
    - Upload or change their profile image.
    - Update their email and password.
    - View and manage active sessions.
    - Customize preferences like theme, language, etc.

### 14. **Real-time Collaboration**

- Implement **real-time collaboration** for note editing, similar to Google Docs. This would allow multiple users to
  edit a note simultaneously with changes synced in real-time.

### 15. **Version History / Note History**

- Implement a **note history/version control** feature to track changes over time. Users can view past versions of a
  note and restore them if needed. This feature can be especially useful for collaborative environments.

### 16. **Data Encryption (Security)**

- Encrypt sensitive data (e.g., user data, note content) both at rest and in transit.
  This will help improve the app's security and protect user privacy.

### 17. **Notification System**

- Implement an in-app **notification system** to alert users about important updates, reminders, or new activities on
  their notes or account.

### 18. **Analytics & Reporting**

- Integrate **analytics** to track user interactions and gather insights on how users are engaging with the app. You can
  use this data to improve the user experience and prioritize new features.

### 19. **Push Notification**

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
