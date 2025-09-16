# Undergraduation.com Admin CRM Dashboard

A modern, internal CRM web dashboard to help Undergraduation.com manage and track student engagement, application progress, and communication—all in one place.

---

## 🚀 Live Demo

- [[Loom video walkthrough]([url](https://www.loom.com/share/850d8b56e3d24245872c3bf1ce2887b7))]

---

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS (v3)
- **Backend**: Node/Express
- **Database**: Firebase
- **Authentication**: Firebase Auth

---

## 🎯 Features

### Student Directory

- Table view of all students with search and filter functions
- Key columns: Name, Email, Country, Application Status, Last Active
- Quick filters for “Not contacted in 7 days”, “High intent”, and “Needs essay help”
- Summary stats: active students, students in essay stage, etc.
- Click to view detailed individual profile

### Student Profile View

- Displays full student info (name, email, phone, grade, country, etc.)
- **Interaction Timeline**: Login history, AI questions asked, and document submit log
- **Communication Log:** Emails, SMS, calls (mocked content)
- **Internal Notes:** Add, edit, and delete notes for each student
- Visual progress bar for app stage (Exploring → Shortlisting → Applying → Submitted)

### Communication Tools

- Log/manual communication (e.g., “Called student to discuss essays”)
- Trigger follow-up email (mock, no real email sent)
- Schedule reminders or tasks for team (displayed in student profile)

### Insights & Filters

- Quick filters for engagement and progress (not contacted, needs essay, etc.)
- Dashboard summary cards for team insights


---

## 🧑‍💻 Test Login

> Use these credentials to access the admin dashboard for review:
>
> **Email:** `Undergraduation@gmail.com`  
> **Password:** `password`

---

🚀 Setup Instructions
1. Clone the Repository
git clone https://github.com/DaBestCode/undergraduation-admin-dashboard.git
cd undergraduation-admin-dashboard
2. Install Dependencies
Frontend:

cd client
npm install
Backend:

cd ../server
npm install
3. Configure Firebase Secrets (Do NOT Commit Real Keys!)
Frontend (client):

Copy .env.example → .env and fill in your Firebase Web config.

REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
Backend (server):

In the Firebase Console, go to Project Settings > Service Accounts.

Click "Generate new private key" and download.

Save as server/serviceAccountKey.json (this file is ignored by git for security).

You may look at serviceAccountKey.json.example for expected structure.

4. Start Development Servers
Backend (from /server):

npm start
# Express API listens on http://localhost:5000/
Frontend (from /client):

npm start
# React app on http://localhost:3000/
5. First-Time Use
Set up users in your Firebase auth console.

Login via the app, then you can view/add/manage students!

🗂️ Codebase Structure


undergraduation-admin-dashboard/
│
├── client/                           # React app (frontend)
│   ├── src/
│   │   ├── apiRequest.js             # Axios utility, handles authorization
│   │   ├── firebaseConfig.js         # Uses .env for Firebase settings
│   │   ├── components/               # Main React components
│   │   │   ├── StudentList.js
│   │   │   └── StudentProfile.js
│   │   └── ...
│   ├── .env.example                  # Sample environment config (never commit real .env)
│   └── ...
│
├── server/                           # Node.js backend (Express + Firebase Admin)
│   ├── server.js                     # Main Express app, routes, auth middleware
│   ├── serviceAccountKey.json.example# Sample for backend Firebase credential
│   └── ...
│
├── README.md
├── .gitignore
└── ...


🔒 Security Notes
Keep all secrets/keys out of GitHub!

Only share .env.example and serviceAccountKey.json.example for onboarding.

Update actual keys/secrets in your own deployments.

👥 Contributing
PRs and issues welcome. Please redact all secrets before submitting.
