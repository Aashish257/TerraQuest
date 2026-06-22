# TerraQuest Phase 3 — Trips & Budget Management System

This document outlines the detailed architecture, design decisions, database hooks, and execution flow of the **Trips & Budget Tracker (Phase 3)** system in TerraQuest.

---

## 1. Scope & Objectives
Phase 3 enables travelers to create itineraries and manage active expenses.
*   **Trip Workspaces**: Allow creation of solo or group trips, defining destination, budget caps, and calendar bounds.
*   **Participant Control**: Enforce group invitation and removal controls, restricting administration to the trip creator.
*   **Expense Tracker**: Enable participants to log expenses categorized under Food, Stay, Transport, Activities, or Other.
*   **Real-time Analytics**: Pre-calculate and cache total expenditures, rendering visual progress meters and category distribution breakdowns.

---

## 2. Architecture & Data Flow

```mermaid
graph TD
    Client[Next.js Client] -->|POST /api/trips/:id/budget-entries| API[Express API Router]
    API -->|verifyTripAccess Middleware| AccessControl{Is Member or Owner?}
    AccessControl -->|No| Reject[403 Access Denied]
    AccessControl -->|Yes| Service[Budget Service]
    Service -->|Insert Entry| DB[(MongoDB: BudgetEntries)]
    DB -->|post save hook| Trigger[BudgetEntry.post('save')]
    Trigger -->|atomic $inc totalSpent| TripDB[(MongoDB: Trips)]
    Service -->|aggregation pipeline| Summary[calculateBudgetSummary]
    Summary -->|Return JSON| Client
```

---

## 3. Key Design Decisions & Code Refactoring

### 3.1 Caching `totalSpent` via Database Hooks
*   *Design*: Instead of executing an aggregation query on every request to view a trip list, we store `totalSpent` as a cached number directly on the [Trip.ts](file:///e:/Travell/backend/src/models/Trip.ts) document.
*   *Implementation*: We configure Mongoose `post('save')` and `post('findOneAndDelete')` hooks on the [BudgetEntry.ts](file:///e:/Travell/backend/src/models/BudgetEntry.ts) model to atomically increment or decrement the parent trip's `totalSpent` field using MongoDB's `$inc` operator.
*   *Rationale*: Reading trip lists is a high-frequency read operation. Caching the spent total reduces database load from \(O(N \times E)\) (where \(N\) is the number of trips and \(E\) is the number of expenses) to a constant \(O(1)\) read overhead.

### 3.2 Access Verification Middleware
*   *Design*: Enforce a strict authorization layer inside `verifyTripAccess`:
    *   Only the trip creator (`ownerId`) can update trip dates, delete the workspace, or add/remove group members.
    *   Any participant mapped in the `TripMember` collection is authorized to view details, list budget entries, log new expenses, or delete expenses.

### 3.3 Cascade Deletions
*   *Design*: When a trip is hard-deleted, all its member records and budget entries are cascade-deleted in the service layer:
```typescript
export const deleteTrip = async (tripId: string, userId: string) => {
  const trip = await tripRepository.findById(tripId);
  if (!trip) throw new AppError('Trip not found', 404);
  if (trip.ownerId.toString() !== userId) {
    throw new AppError('Access denied: Only the owner can delete this trip', 403);
  }
  
  await tripRepository.deleteOne({ _id: tripId });
  await tripMemberRepository.deleteMany({ tripId });
  await budgetRepository.deleteMany({ tripId });
};
```

---

## 4. Technology Code Breakdown

### 5.1 The Budget Hook Lifecycle
File: [BudgetEntry.ts](file:///e:/Travell/backend/src/models/BudgetEntry.ts)
The database hooks automatically sync the parent trip cache when expenses are logged or deleted:
```typescript
// Auto-increment on new expense log
BudgetEntrySchema.post('save', async function (doc) {
  await mongoose.model('Trip').findByIdAndUpdate(doc.tripId, {
    $inc: { totalSpent: doc.amount }
  });
});

// Auto-decrement on expense item removal
BudgetEntrySchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.model('Trip').findByIdAndUpdate(doc.tripId, {
      $inc: { totalSpent: -doc.amount }
    });
  }
});
```

### 5.2 Category Breakdown Aggregation
File: [budget.service.ts](file:///e:/Travell/backend/src/services/budget.service.ts)
The service runs an aggregation pipeline to group expenses:
```typescript
const result = await budgetRepository.aggregate([
  { $match: { tripId: objTripId } },
  {
    $group: {
      _id: '$category',
      total: { $sum: '$amount' },
    },
  },
]);
```
This groups the expenses by category and returns an array of totals (e.g., `[{ _id: 'Food', total: 150 }, { _id: 'Stay', total: 600 }]`).

---

## 6. Execution Flow & Step-by-Step Working

### 6.1 Logging an Expense (`POST /api/trips/:tripId/budget-entries`)
1.  **Request Input**: A traveler posts an expense: `{ category: 'Food', amount: 45.50, description: 'Lunch' }`.
2.  **Access Verification**: `verifyTripAccess` checks the `TripMember` collection. If the user is not part of the trip, the request is rejected with `403 Forbidden`.
3.  **Expense Persistence**: A new `BudgetEntry` document is created in MongoDB.
4.  **Hook Trigger**: The `post('save')` hook fires, calling `findByIdAndUpdate` on the parent trip to increment `totalSpent` by `45.50`.
5.  **Recalculation**: `calculateBudgetSummary` aggregates the current expenses, subtracts the total from the planned budget, and maps the remaining balance.
6.  **Response**: The server returns a `201 Created` status code and the budget summary.

---

## 7. Edge Cases & Error Handling

*   **Negative Budget Entry Amounts**: Enforced by Zod and Mongoose schema constraints (`min: 0.01`). If a user attempts to submit a negative amount, the request fails validation immediately.
*   **Duplicate Member Invitations**: `TripMember` uses a compound unique index `{ tripId: 1, userId: 1 }`. Inviting an existing member throws a database error, which is caught and returned as a `400 Bad Request` by the API layer.
*   **Date Constraint Enforcements**: The trip schema uses a pre-save hook to enforce `endDate > startDate`. If dates are invalid, the save operation is rejected at the database level.

---

## 8. Verification & Environment Notes

### 8.1 Integration Tests
Run tests verifying permissions and calculations:
```bash
npm run test backend/tests/integration/trip.integration.test.ts
```
This suite asserts trip creation, budget limits enforcement, aggregation outcomes, member security barriers, and cascade deletes.
