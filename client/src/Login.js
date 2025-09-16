import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      setError(null);
      if (onLogin) onLogin();
    } catch (e) {
      setError("Login Failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin} className="flex flex-col gap-2 max-w-xs mx-auto mt-20">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="border rounded px-2 py-1"
        />
        <input
          value={pw}
          type="password"
          onChange={e => setPw(e.target.value)}
          placeholder="Password"
          className="border rounded px-2 py-1"
        />
        <button type="submit" className="bg-green-600 text-white py-1 rounded">
          Sign In
        </button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
      <div className="mt-8 max-w-xs mx-auto bg-indigo-50 border border-indigo-200 rounded p-3 text-sm text-indigo-900 shadow">
        <div className="font-semibold mb-1">Test credentials for review:</div>
        <div>
          <b>Email:</b> <span className="font-mono">Undergraduation@gmail.com</span><br />
          <b>Password:</b> <span className="font-mono">password</span>
        </div>
      </div>
    </div>
  );
}
