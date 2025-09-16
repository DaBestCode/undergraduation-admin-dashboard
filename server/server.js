const express = require('express');
const cors = require('cors');
require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 5000;

// DEBUG 1: Show when the server starts
console.log("[SERVER] Starting backend with Firebase Admin SDK");

app.use(cors());
app.use(express.json());

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('API is running!');
});

// ==== AUTH MIDDLEWARE (protects API endpoints) ====
async function checkAuth(req, res, next) {
  const header = req.headers.authorization;
  console.log("[AUTH] Incoming request:", req.method, req.originalUrl);
  console.log("[AUTH] Authorization header:", header);

  if (!header || !header.startsWith("Bearer ")) {
    console.warn("[AUTH] Missing bearer token!");
    return res.status(401).json({ error: "Missing token" });
  }
  const idToken = header.split(" ")[1];

  try {
    // DEBUG: Show short token for troubleshooting (avoid logging whole token for security)
    console.log("[AUTH] Token first 60 chars:", idToken.substring(0, 60) + "...");
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log("[AUTH] Token valid. User ID:", decoded.uid, "Email:", decoded.email);
    req.user = decoded;
    next();
  } catch (e) {
    console.error("[AUTH] Invalid token!", e.message || e);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// All endpoints under /api/* now require login
app.use('/api', checkAuth);

// =========== STUDENT ROUTES ===========

// GET all students
app.get('/api/students', async (req, res) => {
  try {
    console.log("[ROUTE] GET all students (user:", req.user.uid, ")");
    const querySnapshot = await db.collection('students').get();
    const students = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(students);
  } catch (error) {
    console.error("[ROUTE] Error in GET /api/students:", error.message || error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET specific student by Firestore doc ID
app.get('/api/students/:id', async (req, res) => {
  try {
    console.log("[ROUTE] GET student", req.params.id, "(user:", req.user.uid, ")");
    const doc = await db.collection('students').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("[ROUTE] Error in GET /api/students/:id:", error.message || error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// CREATE new student
app.post('/api/students', async (req, res) => {
  try {
    console.log("[ROUTE] POST add student, body:", req.body, "(user:", req.user.uid, ")");
    const { name, email, status, grade, country, phone, lastActive } = req.body;
    if (!name || !email || !status) {
      console.warn("[ROUTE] Add student - missing fields!");
      return res.status(400).json({ error: 'Missing student fields' });
    }
    const activity = [{
      type: 'created',
      text: 'Student account created',
      date: new Date().toISOString()
    }];
    const docRef = await db.collection('students').add({
      name,
      email,
      status,
      grade: grade || "",
      country: country || "",
      phone: phone || "",
      lastActive: lastActive || new Date().toISOString(),
      activity,
      communications: []
    });
    const student = (await docRef.get()).data();
    console.log("[ROUTE] Student created with ID:", docRef.id);
    res.json({ id: docRef.id, ...student });
  } catch (error) {
    console.error("[ROUTE] Error in POST /api/students:", error.message || error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// UPDATE student fields and log edits
app.put('/api/students/:id', async (req, res) => {
  try {
    const docRef = db.collection('students').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });

    const prev = doc.data();
    const { name, email, status, grade, country, phone, lastActive } = req.body;
    let toUpdate = {};
    let activityUpdates = [];

    if (name !== undefined && name !== prev.name) {
      activityUpdates.push({
        type: 'edit',
        text: `Name changed from "${prev.name}" to "${name}"`,
        date: new Date().toISOString()
      });
      toUpdate.name = name;
    }
    if (email !== undefined && email !== prev.email) {
      activityUpdates.push({
        type: 'edit',
        text: `Email changed from "${prev.email}" to "${email}"`,
        date: new Date().toISOString()
      });
      toUpdate.email = email;
    }
    if (status !== undefined && status !== prev.status) {
      activityUpdates.push({
        type: 'edit',
        text: `Status changed from "${prev.status}" to "${status}"`,
        date: new Date().toISOString()
      });
      toUpdate.status = status;
    }
    if (grade !== undefined && grade !== prev.grade) {
      activityUpdates.push({
        type: 'edit',
        text: `Grade changed from "${prev.grade}" to "${grade}"`,
        date: new Date().toISOString()
      });
      toUpdate.grade = grade;
    }
    if (country !== undefined && country !== prev.country) {
      activityUpdates.push({
        type: 'edit',
        text: `Country changed from "${prev.country}" to "${country}"`,
        date: new Date().toISOString()
      });
      toUpdate.country = country;
    }
    if (phone !== undefined && phone !== prev.phone) {
      activityUpdates.push({
        type: 'edit',
        text: `Phone changed from "${prev.phone}" to "${phone}"`,
        date: new Date().toISOString()
      });
      toUpdate.phone = phone;
    }
    if (lastActive !== undefined && lastActive !== prev.lastActive) {
      activityUpdates.push({
        type: 'edit',
        text: `Last active changed from "${prev.lastActive}" to "${lastActive}"`,
        date: new Date().toISOString()
      });
      toUpdate.lastActive = lastActive;
    }
    // update fields
    if (Object.keys(toUpdate).length > 0)
      await docRef.update(toUpdate);

    // add activity logs (if any)
    if (activityUpdates.length > 0) {
      await docRef.update({
        activity: admin.firestore.FieldValue.arrayUnion(...activityUpdates)
      });
    }
    const updated = (await docRef.get()).data();
    console.log("[ROUTE] Student updated:", req.params.id);
    res.json({ id: docRef.id, ...updated });
  } catch (error) {
    console.error("[ROUTE] Error in PUT /api/students/:id:", error.message || error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
  try {
    await db.collection('students').doc(req.params.id).delete();
    console.log("[ROUTE] Student deleted:", req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("[ROUTE] Error in DELETE /api/students/:id:", error.message || error);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// ======== ACTIVITY ENDPOINTS ==========

app.post('/api/students/:id/notes', async (req, res) => {
  try {
    const { note } = req.body;
    const docRef = db.collection('students').doc(req.params.id);
    await docRef.update({
      activity: admin.firestore.FieldValue.arrayUnion({
        type: 'note',
        text: note,
        date: new Date().toISOString()
      })
    });
    const updated = (await docRef.get()).data();
    res.json({ id: docRef.id, ...updated });
  } catch (error) {
    console.error("[ROUTE] Error in POST /api/students/:id/notes:", error.message || error);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// (Add similar try/catch and logging for other endpoints as needed...)

app.listen(PORT, () => console.log(`[SERVER] Server running on port ${PORT}`));
