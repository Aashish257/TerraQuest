# TerraQuest 🌍✨

> **TerraQuest** (formerly Travell) is an AI-powered travel platform designed for exploring destinations, generating personalized itineraries, tracking budgets, and connecting with local guides.

Built using a modern glassmorphic aesthetic, the project features a decoupled architecture with a TypeScript/Express backend API and a Next.js 14 App Router frontend.

---

## 📸 Interface Showcases

### 1. Welcome Landing Page
Sleek, dark glassmorphic design featuring glowing background gradients, interactive CTA buttons, and structured feature outlines.
![Landing Page](screenshots/logged_out_homepage_1781754401149.png)

### 2. Multi-Role Authentication
Interactive, validated signup panel with quick Traveler vs. Local Guide role toggle buttons.
![Authentication Sign Up](screenshots/registration_form_filled_1781754342572.png)

### 3. Explore & Discover Board
Searchable destination grid leveraging Mongoose text search indexes, filtering by activities, and budget brackets.
![Explore Destinations](screenshots/destinations_list_1781755062171.png)

### 4. AI Itinerary Planner
A prompt-wizard leveraging GPT-4o-mini to draft daily travel schedules, lodging suggestions, and budget estimates, complete with a saved plans history log and instant "Convert to Trip" actions.
![AI Itinerary Planner](screenshots/ai_planner_full_page_1781789635294.png)

### 5. Expense Logger & Budget Analytics
HSL color-coded metrics dashboard charting planned vs spent budgets, progress indicators, category breakdown meters, and live logs.
![Budget Dashboard](screenshots/final_budget_status_1781757158307.png)

### 6. Group Travel details & Invites
Shared trip dashboards detailing schedules, budget sums, and a member list for inviting active travelers.
![Trip Details Panel](screenshots/trip_details_page_verified_1781808819826.png)

---

## 🚀 Key Features

*   **🤖 AI Travel Planner**: Wizard form prompting GPT for itineraries based on budget levels, duration (1-30 days), and interests (Adventure, Food, Culture, etc.). Converts AI plans to trips instantly.
*   **📊 Budget Tracker & Expense Logger**: Nested expense controls with in-database aggregation pipelines recalculating balances (`Food`, `Stay`, `Transport`, `Activities`, `Other`).
*   **🧭 Destinations Search**: High-performance paginated lookups with text indexing, activity queries, and parsed budget ranges.
*   **👥 Local Guides & Polymorphic Reviews**: Direct directory for hiring guides. Polymorphic review models automatically trigger guide average ratings and total reviews recalculation upon submission.
*   **🔒 Multi-Role Auth**: Stateless JWT authentication sessions with role authorization guards (`traveler`, `guide`, `admin`).

---

## 🛠️ Technology Stack

### Backend API
*   **Core**: Express, TypeScript, Mongoose (MongoDB)
*   **Validation**: Zod (runtime env and payload parsing)
*   **Security & Auth**: JWT, bcrypt password hashing
*   **Testing**: Jest, Supertest, MongoDB Memory Server
*   **AI Service**: OpenAI API SDK

### Frontend App
*   **Core**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
*   **State Management**: Zustand (global store with persistent local storage sync)
*   **Forms**: React Hook Form with Zod schema resolver
*   **Icons**: Lucide React

---

## 📁 Directory Structure

```
TerraQuest/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection & Zod Env validation
│   │   ├── models/             # Mongoose schemas (User, Trip, Review, etc.)
│   │   ├── middleware/         # Auth JWT verification, RBAC, error handlers
│   │   ├── services/           # OpenAI, Aggregation statistics, Ratings recalculation
│   │   ├── controllers/        # Express handlers (Auth, Trip, Reviews, etc.)
│   │   ├── routes/             # REST endpoint routing mounts
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # HTTP entry listener
│   └── tests/
│       ├── setup.ts            # MongoMemoryServer lifecycle hooks
│       ├── unit/               # Service & schema rules assertions
│       └── integration/        # Endpoint contract verification tests
│
├── frontend/
│   ├── app/                    # Next.js 14 App Router layout routes
│   ├── components/
│   │   ├── layouts/            # Header & Footer glassmorphic components
│   │   └── shared/             # Destination, Guide cards, and form utilities
│   ├── lib/                    # Axios API client interceptors
│   └── store/                  # Zustand Auth global store
```

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v20 or higher)
*   MongoDB local instance or Atlas URI
*   OpenAI API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/terraquest
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Seed the destinations database:
   ```bash
   npm run seed
   ```
5. Run in development mode:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🧪 Testing

The backend includes a comprehensive unit and integration test suite utilizing Jest and `mongodb-memory-server` to run tests instantly in-memory without affecting your local database.

To execute the test suite:
```bash
cd backend
npm test
```

Currently, **85/85 tests are passing successfully**:
*   **Auth Services & Endpoints**: User registrations, JWT logins, and profile lookups.
*   **Trips & Budget Aggregations**: Mathematical spent vs remaining calculations.
*   **Polymorphic Reviews**: Ratings aggregation and Guide average rating updates.
*   **AI Planner API**: GPT plan requests and fallback generation schema controls.
