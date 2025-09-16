import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentProfile from './components/StudentProfile';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from './Login';
import NavBar from './components/NavBar';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <Login />;

  return (
    <>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6 mt-6">
        <button
          onClick={() => signOut(auth)}
          className="fixed top-3 right-5 bg-pink-600 hover:bg-pink-700 text-white font-medium px-3 py-1 rounded shadow"
        >
          Sign Out
        </button>
        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentProfile />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
