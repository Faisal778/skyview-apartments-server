This is the server side github of **https://github.com/fms-faisal/skyview-apartments-client**
# Skyview Apartment Management API

## Introduction
This Node.js Express application provides a backend API for managing apartments, reservations, users, announcements, and payments for an apartment complex named "Skyview Apartments."

## Technologies Used
- **Express.js**: Web framework for building APIs
- **MongoDB**: NoSQL database for data storage
- **JWT (JSON Web Token)**: Authentication mechanism
- **Stripe**: Payment processing platform

## Installation
1. Clone this repository.
   ```
   git clone https://github.com/fms-faisal/skyview-apartments-server.git
   ```

2. Navigate to the project directory.
   ```
   cd skyview-apartments-server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. **Set Up Environment Variables**
   Create a `.env` file in the project root directory and set the following environment variables:
   - `DB_USER`: Your MongoDB username
   - `DB_PASS`: Your MongoDB password
   - `ACCESS_TOKEN_SECRET`: A secret key used for generating JWT tokens
   - `STRIPE_SECRET_KEY`: Your Stripe secret key

5. Start the server:
    ```
   node index.js
    ``` 
2. The server will listen on port 5000 by default (configurable via `PORT` environment variable).


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
- **POST** `/reservation`: Creates a new reservation.
- **GET** `/reservation/agreement`: Retrieves pending reservations.
- **DELETE** `/reservation/:id`: Deletes a reservation.

### JWT Authentication
- **POST** `/jwt` (Public): Generates a JWT token for a user.

### Announcement Management
- **GET** `/announcement`: Retrieves all announcements.
- **POST** `/announcement`: Creates a new announcement.

### Payment Management
- **POST** `/create-payment-intent`: Creates a Stripe payment intent for a specific amount.
- **POST** `/payments`: Records a payment and deletes associated reservations.
- **GET** `/payments/:email`: Retrieves payments for a specific user (based on email).

