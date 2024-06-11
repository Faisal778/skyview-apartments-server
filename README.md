This is the server side github of **https://skyviewapartments-c882f.web.app/**
# Skyview Apartment Management API

## Introduction
This Node.js Express application provides a backend API for managing apartments, reservations, users, announcements, and payments for a fictional apartment complex named "Skyview Apartments."

## Technologies Used
- **Express.js**: Web framework for building APIs
- **Mongoose (implied by MongoClient)**: Object Document Mapper (ODM) for interacting with MongoDB
- **MongoDB**: NoSQL database for data storage
- **JWT (JSON Web Token)**: Authentication mechanism
- **Stripe**: Payment processing platform

## Installation
1. Clone this repository.
2. Install dependencies: `npm install` (or `yarn install`)
3. Create a `.env` file in the project root directory and set the following environment variables:
   - `DB_USER`: Your MongoDB username
   - `DB_PASS`: Your MongoDB password
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `ACCESS_TOKEN_SECRET`: A secret key used for generating JWT tokens

## Usage
1. Start the server: `node index.js` (or `npm start` or `yarn start`)
2. The server will listen on port 5000 by default (configurable via `PORT` environment variable).
3. Use a REST client (like Postman, Insomnia) or code in another language to interact with the API endpoints.

## API Endpoints

### User Management
- **GET** `/users` (Public): Retrieves all users.
- **GET** `/users/admin/:email` (Protected): Checks if a user is an admin. Requires a valid JWT token in the authorization header.
- **GET** `/users/member/:email` (Protected): Checks if a user is a member. Requires a valid JWT token in the authorization header.
- **POST** `/users` (Public): Creates a new user.
- **DELETE** `/users/:id` (Protected, Admin Only): Deletes a user. Requires a valid JWT token and admin privileges in the authorization header.
- **PATCH** `/users/admin/:id` (Protected, Admin Only): Updates a user's role to "admin." Requires a valid JWT token and admin privileges in the authorization header.

### Apartment Management
- **GET** `/apartments` (Public): Retrieves all apartments.

### Reservation Management
- **POST** `/reservation` (Public): Creates a new reservation.
- **GET** `/reservation` (Protected, Admin Only): Retrieves all reservations. Requires a valid JWT token and admin privileges in the authorization header.
- **GET** `/reservation?email=:email` (Protected, User or Admin): Retrieves reservations for a specific user (based on email). Requires a valid JWT token.
- **DELETE** `/reservation/:id` (Protected, Admin Only): Deletes a reservation. Requires a valid JWT token and admin privileges in the authorization header.

### JWT Authentication
- **POST** `/jwt` (Public): Generates a JWT token for a user.

### Announcement Management
- **GET** `/announcement` (Public): Retrieves all announcements.
- **POST** `/announcement` (Protected, Admin Only): Creates a new announcement. Requires a valid JWT token and admin privileges in the authorization header.

### Payment Management
- **POST** `/create-payment-intent` (Public): Creates a Stripe payment intent for a specific amount.
- **POST** `/payments` (Protected, Admin Only): Records a payment and deletes associated reservations. Requires a valid JWT token and admin privileges in the authorization header.
- **GET** `/payments/:email` (Protected, User or Admin): Retrieves payments for a specific user (based on email). Requires a valid JWT token.

## Notes
- Protected endpoints require a valid JWT token in the authorization header with the format `Bearer <token>`.
- Admin-only endpoints require additional checks for admin privileges within the JWT token.
- Error handling and validation are not explicitly shown in the code snippets for brevity, but should be implemented in a production environment.
