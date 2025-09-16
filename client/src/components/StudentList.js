import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../apiRequest';

function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

function timeAgo(date) {
  if (!date) return "N/A";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  return `${diffMin} min${diffMin !== 1 ? "s" : ""} ago`;
}

function getStatusColor(status) {
  switch (status) {
    case "Exploring": return "bg-gray-200 text-gray-800";
    case "Shortlisting": return "bg-yellow-200 text-yellow-800";
    case "Applying": return "bg-blue-200 text-blue-800";
    case "Essay": return "bg-purple-200 text-purple-800";
    case "Submitted": return "bg-green-200 text-green-800";
    case "Active": return "bg-green-200 text-green-800";
    case "Applicant": return "bg-indigo-200 text-indigo-800";
    default: return "bg-gray-100 text-gray-700";
  }
}

function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', status: 'Active', phone: '', grade: '', country: ''
  });

  useEffect(() => {
    apiRequest("get", '/api/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  const [filter, setFilter] = useState("all");

  const filteredStudents = students.filter(s => {
    if (filter === "notContacted") {
      // Assuming s.lastContacted is a timestamp string
      if (!s.lastContacted) return true;
      const days = (Date.now() - new Date(s.lastContacted)) / (1000 * 60 * 60 * 24);
      return days > 7;
    }
    if (filter === "highIntent") {
      // Mock: define your own high intent logic here (e.g., has document, status = Applying)
      return s.status === "Applying" || s.status === "Submitted";
    }
    if (filter === "needsEssay") {
      // Mock: students in "Essay" status
      return s.status === "Essay";
    }
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-8 font-bold text-gray-700 mb-4">
        <span>Total: {students.length}</span>
        <span>Active: {students.filter(s => s.status === "Active").length}</span>
        <span>Essay Stage: {students.filter(s => s.status === "Essay").length}</span>
        {/* Add more as needed */}
      </div>

      <h2 className="text-2xl font-bold mb-6">Student Directory</h2>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          className="flex-1 px-2 py-1 border rounded"
          placeholder="Search students by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-2 py-1 border rounded"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Exploring">Exploring</option>
          <option value="Shortlisting">Shortlisting</option>
          <option value="Applying">Applying</option>
          <option value="Essay">Essay</option>
          <option value="Submitted">Submitted</option>
          <option value="Active">Active</option>
          <option value="Applicant">Applicant</option>
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <button className={`px-2 py-1 rounded ${filter==="notContacted" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("notContacted")}>
          Not Contacted 7d
        </button>
        <button className={`px-2 py-1 rounded ${filter==="highIntent" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("highIntent")}>
          High Intent
        </button>
        <button className={`px-2 py-1 rounded ${filter==="needsEssay" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("needsEssay")}>
          Needs Essay Help
        </button>
        <button className={`px-2 py-1 rounded ${filter==="all" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("all")}>
          All
        </button>
      </div>

      {/* Add Student Form */}
      <form
        className="mb-8 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newStudent.name || !newStudent.email || !newStudent.status) return;
          try {
            const res = await apiRequest("post", '/api/students', newStudent);
            setStudents(prev => [...prev, res.data]);
            setNewStudent({
              name: '', email: '', status: 'Active', phone: '', grade: '', country: ''
            });
          } catch {
            alert('Failed to add student');
          }
        }}>
        <input
          type="text"
          className="px-2 py-1 border rounded"
          placeholder="Name"
          value={newStudent.name}
          onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
        <input
          type="email"
          className="px-2 py-1 border rounded"
          placeholder="Email"
          value={newStudent.email}
          onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
        <input
          type="text"
          className="px-2 py-1 border rounded"
          placeholder="Phone"
          value={newStudent.phone}
          onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} />
        <input
          type="text"
          className="px-2 py-1 border rounded"
          placeholder="Grade"
          value={newStudent.grade}
          onChange={e => setNewStudent({ ...newStudent, grade: e.target.value })} />
        <input
          type="text"
          className="px-2 py-1 border rounded"
          placeholder="Country"
          value={newStudent.country}
          onChange={e => setNewStudent({ ...newStudent, country: e.target.value })} />
        <select
          className="px-2 py-1 border rounded"
          value={newStudent.status}
          onChange={e => setNewStudent({ ...newStudent, status: e.target.value })}>
          <option value="Exploring">Exploring</option>
          <option value="Shortlisting">Shortlisting</option>
          <option value="Applying">Applying</option>
          <option value="Essay">Essay</option>
          <option value="Submitted">Submitted</option>
          <option value="Active">Active</option>
          <option value="Applicant">Applicant</option>
        </select>
        <button className="bg-green-500 text-white px-3 py-1 rounded" type="submit">Add Student</button>
      </form>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 font-semibold">Name</th>
              <th className="p-2 font-semibold">Email</th>
              <th className="p-2 font-semibold">Phone</th>
              <th className="p-2 font-semibold">Grade</th>
              <th className="p-2 font-semibold">Country</th>
              <th className="p-2 font-semibold">Status</th>
              <th className="p-2 font-semibold">Last Active</th>
              <th className="p-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter(s =>
                (s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
                && (statusFilter === "All" || s.status === statusFilter))
              .map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-semibold">{student.name}</td>
                  <td className="p-2">{student.email}</td>
                  <td className="p-2">{student.phone || "—"}</td>
                  <td className="p-2">{student.grade || "—"}</td>
                  <td className="p-2">{student.country || "—"}</td>
                  <td className="p-2">
                    <span className={`inline-block px-2 rounded ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-2">{timeAgo(student.lastActive)}</td>
                  <td className="p-2">
                    <Link to={`/students/${student.id}`}>
                      <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Profile</button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentList;
