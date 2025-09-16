import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../apiRequest';

// Mock interaction timeline data (replace with real if you have it)
const interactionTimeline = [
  { type: "login", label: "Logged in", date: "2025-09-14T19:30:00Z" },
  { type: "ai", label: "Asked AI: 'Best schools for CS in US?'", date: "2025-09-13T18:02:00Z" },
  { type: "document", label: "Uploaded essay.docx", date: "2025-09-10T15:11:00Z" },
];

function InteractionTimeline({ timeline }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-2">Interaction Timeline</h3>
      <ul className="space-y-2">
        {timeline.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {/* Use Tailwind badge/color for different types */}
            <span className={`inline-block w-2 h-2 rounded-full ${
              item.type === "login" ? "bg-green-500"
                : item.type === "ai" ? "bg-indigo-500"
                : "bg-yellow-500"
            }`}></span>
            <span className="font-medium">{item.label}</span>
            <span className="ml-auto text-xs text-gray-500">{new Date(item.date).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudentProfile() {
  let { id } = useParams();
  const [student, setStudent] = useState(null);
  const [note, setNote] = useState('');
  const [commText, setCommText] = useState('');
  const [commType, setCommType] = useState('email');
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [reminderText, setReminderText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("get", `/api/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(() => setStudent(null));
  }, [id]);

  const handleAddNote = async () => {
    if (!note) return;
    try {
      const res = await apiRequest("post", `/api/students/${student.id}/notes`, { note });
      setStudent(res.data);
      setNote('');
    } catch (err) {
      alert("Failed to add note");
    }
  };

  const handleMockLogin = async () => {
    try {
      const res = await apiRequest("post", `/api/students/${student.id}/login`);
      setStudent(res.data);
    } catch {
      alert('Mock login failed');
    }
  };

  const handleAddCommunication = async () => {
    if (!commText) return;
    try {
      const res = await apiRequest("post", `/api/students/${student.id}/communications`, {
        type: commType,
        channel: commType === 'email' ? 'Email' : 'SMS',
        content: commText
      });
      setStudent(res.data);
      setCommText('');
    } catch {
      alert("Failed to log communication");
    }
  };

  const handleAddReminder = async () => {
    if (!reminderText) return;
    try {
      const res = await apiRequest("post", `/api/students/${student.id}/reminders`, { text: reminderText });
      setStudent(res.data);
      setReminderText('');
    } catch {
      alert("Failed to add reminder");
    }
  };

  const statusToPercent = {
    "Exploring": 0,
    "Shortlisting": 25,
    "Applying": 50,
    "Essay": 75,
    "Submitted": 100,
    "Active": 100,
    "Applicant": 10,
  };
  const progressPercent = statusToPercent[student?.status] ?? 0;

  if (!student) return <div>Loading...</div>;

  return (
    <div>
      <div className="p-6 max-w-lg mx-auto">
        {/* Edit controls */}
        {!editMode && (
          <button
            className="mb-2 px-3 py-1 bg-yellow-400 rounded text-sm"
            onClick={() => {
              setEditMode(true);
              setEditFields({
                name: student.name,
                email: student.email,
                status: student.status,
                grade: student.grade || "",
                country: student.country || "",
                lastActive: student.lastActive || ""
              });
            }}
          >
            Edit
          </button>
        )}

        {editMode ? (
          <>
            <input
              className="block w-full mb-2 px-1 py-1 border rounded"
              value={editFields.name}
              onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
              placeholder="Name"
            />
            <input
              className="block w-full mb-2 px-1 py-1 border rounded"
              value={editFields.email}
              onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))}
              placeholder="Email"
            />
            <input
              className="block w-full mb-2 px-1 py-1 border rounded"
              value={editFields.grade}
              onChange={e => setEditFields(f => ({ ...f, grade: e.target.value }))}
              placeholder="Grade"
            />
            <input
              className="block w-full mb-2 px-1 py-1 border rounded"
              value={editFields.country}
              onChange={e => setEditFields(f => ({ ...f, country: e.target.value }))}
              placeholder="Country"
            />
            <input
              className="block w-full mb-2 px-1 py-1 border rounded"
              value={editFields.lastActive}
              onChange={e => setEditFields(f => ({ ...f, lastActive: e.target.value }))}
              placeholder="Last Active (ISO string)"
            />
            <select
              className="block w-full mb-2 px-1 py-1 border rounded"
              value={editFields.status}
              onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))}
            >
              <option value="Exploring">Exploring</option>
              <option value="Shortlisting">Shortlisting</option>
              <option value="Applying">Applying</option>
              <option value="Essay">Essay</option>
              <option value="Submitted">Submitted</option>
              <option value="Active">Active</option>
              <option value="Applicant">Applicant</option>
            </select>
            <button
              className="mr-2 px-3 py-1 bg-green-500 text-white rounded"
              onClick={async () => {
                try {
                  const res = await apiRequest("put", `/api/students/${student.id}`, editFields);
                  setStudent(res.data);
                  setEditMode(false);
                } catch {
                  alert('Update failed');
                }
              }}
            >Save</button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => setEditMode(false)}
            >Cancel</button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">{student.name}</h2>
            <p className="mb-1">Email: {student.email}</p>
            <p className="mb-1">Grade: {student.grade || "N/A"}</p>
            <p className="mb-1">Country: {student.country || "N/A"}</p>
            <p className="mb-1">Last Active: {student.lastActive ? new Date(student.lastActive).toLocaleString() : "N/A"}</p>
            <p className="mb-1">Status: <span className="rounded bg-blue-100 px-2">{student.status}</span></p>
          </>
        )}

        <button
          className="mt-4 px-3 py-1 bg-red-500 text-white rounded"
          onClick={async () => {
            if (!window.confirm('Are you sure you want to delete this student?')) return;
            try {
              await apiRequest("delete", `/api/students/${student.id}`);
              navigate('/'); // Redirects to student list after delete
            } catch {
              alert('Delete failed');
            }
          }}>
          Delete Student
        </button>

        <button
          className="ml-3 px-3 py-1 bg-purple-500 text-white rounded"
          onClick={handleMockLogin}
        >
          Mock Login
        </button>

        <h3 className="mt-4 font-semibold">Activity Feed</h3>
        <ul className="mb-4">
          {student.activity?.map((log, idx) => (
            <li key={idx} className="border-b py-1">
              <span className="text-xs text-gray-500 mr-2">{new Date(log.date).toLocaleString()}</span>
              <span className="font-bold">{log.type === 'note' ? 'Note:' : log.type === 'login' ? 'Login:' : log.type === 'edit' ? 'Edit:' : log.type === 'reminder' ? 'Reminder:' : ''}</span>
              <span className={
                log.type === 'note' ? 'text-blue-600 mr-1' :
                log.type === 'edit' ? 'text-yellow-600 mr-1' :
                log.type === 'login' ? 'text-purple-600 mr-1' :
                log.type === 'reminder' ? 'text-pink-600 mr-1' : 'text-green-600 mr-1'
              }>
                {log.type === 'note' ? '📝' :
                log.type === 'edit' ? '✏️' :
                log.type === 'login' ? '🔑' :
                log.type === 'reminder' ? '⏰' : '🟢'}
              </span>
              {log.text}
            </li>
          ))}
        </ul>

        <div className="w-full" style={{ border: '1px solid #ccc', borderRadius: 4, marginTop: 16, background: '#eee', height: 24 }}>
          <div
            style={{
              width: `${progressPercent}%`,
              background: 'green',
              height: '24px',
              borderRadius: 4,
              transition: 'width 0.3s'
            }}
          />
        </div>

        {/* Reminders */}
        <div className="flex gap-2 mt-6">
          <input
            className="flex-1 px-2 py-1 border rounded"
            value={reminderText}
            onChange={e => setReminderText(e.target.value)}
            placeholder="Schedule a reminder..."
          />
          <button onClick={handleAddReminder} className="bg-pink-500 text-white px-3 py-1 rounded">Add Reminder</button>
        </div>

        {/* Note adding */}
        <div className="flex gap-2 mt-4">
          <input
            className="flex-1 px-2 py-1 border rounded"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
          />
          <button onClick={handleAddNote} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
        </div>

        {/* Communication Log */}
        <h3 className="mt-6 font-semibold">Communication Log</h3>
        <ul className="mb-4">
          {student.communications?.map((c, idx) => (
            <li key={idx} className="border-b py-1">
              <span className="text-xs text-gray-500 mr-2">{new Date(c.date).toLocaleString()}</span>
              <span className="font-bold">{c.channel}:</span> {c.content}
            </li>
          ))}
        </ul>

        {/* Communication Form */}
        <div className="flex gap-2 mt-2">
          <select value={commType} onChange={e => setCommType(e.target.value)} className="border rounded px-2 py-1">
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
          <input
            className="flex-1 px-2 py-1 border rounded"
            value={commText}
            onChange={e => setCommText(e.target.value)}
            placeholder="Communication details..."
          />
          <button onClick={handleAddCommunication} className="bg-green-500 text-white px-3 py-1 rounded">Log</button>
        </div>
      </div>
      <InteractionTimeline timeline={interactionTimeline} />

    </div>
  );
}

export default StudentProfile;
