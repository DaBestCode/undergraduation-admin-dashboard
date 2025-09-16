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

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running!');
});

// ==== AUTH MIDDLEWARE (protects API endpoints) ====
async function checkAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const idToken = header.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// All endpoints under /api/* now require login
app.use('/api', checkAuth);

// =========== STUDENT ROUTES ===========

// GET all students
app.get('/api/students', async (req, res) => {
  const querySnapshot = await db.collection('students').get();
  const students = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(students);
});

// GET specific student by Firestore doc ID
app.get('/api/students/:id', async (req, res) => {
  const doc = await db.collection('students').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  res.json({ id: doc.id, ...doc.data() });
});

// CREATE new student
app.post('/api/students', async (req, res) => {
  const { name, email, status, grade, country, phone, lastActive } = req.body;
  if (!name || !email || !status) {
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
  res.json({ id: docRef.id, ...student });
});

// UPDATE student fields and log edits
app.put('/api/students/:id', async (req, res) => {
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
  res.json({ id: docRef.id, ...updated });
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
  await db.collection('students').doc(req.params.id).delete();
  res.json({ success: true });
});

// ======== ACTIVITY ENDPOINTS ==========

// ADD NOTE to activity timeline
app.post('/api/students/:id/notes', async (req, res) => {
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
});

// ADD LOGIN event
app.post('/api/students/:id/login', async (req, res) => {
  const docRef = db.collection('students').doc(req.params.id);
  await docRef.update({
    activity: admin.firestore.FieldValue.arrayUnion({
      type: 'login',
      text: 'User logged in',
      date: new Date().toISOString()
    }),
    lastActive: new Date().toISOString()
  });
  const updated = (await docRef.get()).data();
  res.json({ id: docRef.id, ...updated });
});

// ADD COMMUNICATION (email/SMS)
app.post('/api/students/:id/communications', async (req, res) => {
  const { type, channel, content } = req.body;
  const docRef = db.collection('students').doc(req.params.id);
  await docRef.update({
    communications: admin.firestore.FieldValue.arrayUnion({
      type,
      channel,
      content,
      date: new Date().toISOString()
    })
  });
  const updated = (await docRef.get()).data();
  res.json({ id: docRef.id, ...updated });
});

// ADD REMINDER as activity
app.post('/api/students/:id/reminders', async (req, res) => {
  const { text } = req.body;
  const docRef = db.collection('students').doc(req.params.id);
  await docRef.update({
    activity: admin.firestore.FieldValue.arrayUnion({
      type: 'reminder',
      text,
      date: new Date().toISOString(),
      done: false
    })
  });
  const updated = (await docRef.get()).data();
  res.json({ id: docRef.id, ...updated });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
