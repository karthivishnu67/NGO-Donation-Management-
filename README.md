# 23. NGO Donation Management System (MERN Stack)

## 1. Project Overview & Scope
Create fundraising campaigns, register donors, record online or offline donations, generate 80G tax receipts, and show campaign progress reports.

- **Suggested Roles**: `Admin`, `Campaign Manager`, `Donor`
- **Main Mongoose Models**: `User`, `Donor`, `Campaign`, `Donation`, `Receipt`

---

## 2. Demo Credentials
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hopebridge.org` | `admin123` | Full CRUD on Users, Donors, Campaigns, Donations, Receipts, Reports |
| **Campaign Manager** | `manager@hopebridge.org` | `manager123` | Create/Edit Campaigns, Donors, Donations, Receipts, Reports |
| **Donor** | `donor@hopebridge.org` | `donor123` | Browse Campaigns, Record Donations, View/Print 80G Receipts |

---

## 3. Folder Structure
- `backend/config/db.js` — MongoDB Atlas Mongoose connection & seeded Mongoose-validated fallback store
- `backend/models/` — `User.js`, `Donor.js`, `Campaign.js`, `Donation.js`, `Receipt.js` (with validation & indexes)
- `backend/middleware/authMiddleware.js` — JWT verification (`protect`) and Role Access (`authorizeRoles`)
- `backend/controllers/` — `authController.js`, `userController.js`, `donorController.js`, `campaignController.js`, `donationController.js`, `receiptController.js`, `reportController.js`
- `backend/routes/` — Express routers for each model
- `src/context/AuthContext.jsx` — React Context API for authentication state
- `src/pages/` — React JS (`.jsx`) pages with controlled forms using `event.preventDefault()`

---

## 4. Entity-Relationship (ER) Diagram
```text
+------------------+          +------------------+          +-------------------+
|       User       | 1     0..1|      Donor       | 1       *|     Donation      |
+------------------+----------+------------------+----------+-------------------+
| _id (PK)         |          | _id (PK)         |          | _id (PK)          |
| name             |          | donorCode (UNQ)  |          | donationCode (UNQ)|
| email (UNQ)      |          | name, email      |          | donorId (FK)      |
| password (Hash)  |          | phone, city      |          | campaignId (FK)   |
| role (Enum)      |          | panNumber        |          | amount            |
| status           |          | donorType (Enum) |          | donationType      |
+------------------+          | totalDonated     |          | paymentMode       |
                              | userId (FK)      |          | donationDate      |
                              +------------------+          +---------+---------+
                                                                      | 1
                                                                      |
+------------------+                                        +---------+---------+
|     Campaign     | 1                                     *|      Receipt      |
+------------------+----------------------------------------+-------------------+
| _id (PK)         |          (Campaign 1 : * Donation)     | _id (PK)          |
| title, category  |                                        | receiptNumber(UNQ)|
| goalAmount       |                                        | donationId (FK)   |
| raisedAmount     |                                        | donorId (FK)      |
| startDate/endDate|                                        | campaignId (FK)   |
| status, location |                                        | taxExemption: 80G |
+------------------+                                        +-------------------+
```
