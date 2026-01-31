# 99dresses - Clothing Swap Platform

99dresses is a modern web application designed to facilitate a sustainable clothing swap ecosystem. Users can list their items, bid on others' items using a virtual credit system, and communicate with sellers to arrange swaps.

##  Key Features

- **User Authentication**: Secure register and login system.
- **Item Listing**: Users can upload clothing items with multiple images and descriptions.
- **Bidding System**: Bid on items using a virtual credit (wallet) system.
- **Real-time Notifications**: Instant updates for swap requests, bid acceptances, and messages.
- **Internal Messaging**: Dedicated chat interface for buyers and sellers to coordinate.
- **Wallet & Credits**: Manage virtual currency for swapping within the platform.
- **Seller Profiles**: View seller ratings, reviews, and their listed collection.

##  Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router Dom
- **Backend Integration**: Firebase SDK

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT & Bcrypt.js
- **Database / Storage**: Firebase (Firestore, Storage, Auth)

##  Project Structure

```text
├── backend/            # Express server, routes, and controllers
│   ├── config/         # Configuration (Firebase, etc.)
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth and other middleares
│   ├── routes/         # API endpoints
│   └── scripts/        # Utility scripts (CORS, etc.)
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context (Auth, Notifications)
│   │   ├── pages/      # Application views
│   │   └── firebase.js # Frontend firebase config
└── .gitignore          # Root level git ignore
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Account and Project

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `config/serviceAccountKey.json` with your Firebase service account credentials.
4. Create a `.env` file with:
   ```env
   PORT=5000
   JWT_SECRET=your_secret_here
   ```
5. Start the server:
   ```bash
   npm run start
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `src/firebase.js` with your Firebase Web Config.
4. Start the development server:
   ```bash
   npm run dev
   ```



