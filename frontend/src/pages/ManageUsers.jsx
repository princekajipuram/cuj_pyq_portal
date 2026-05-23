import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { ListSkeleton } from '../components/common/Skeleton.jsx';
import { Users, Shield, Trash2, ArrowLeftRight } from 'lucide-react';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) {
      return;
    }

    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      if (res.data.success) {
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to toggle user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? All their uploaded assets will remain, but their login credentials will be revoked.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-left">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-505" />
          <span>Manage User Accounts</span>
        </h2>
        <p className="text-xs text-slate-400">View registered student accounts and toggle authorization roles.</p>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No registered users found.</p>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Auth Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-750 dark:text-slate-350 text-xs">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-850 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 flex items-center justify-center font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{item.name}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        item.role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 border border-purple-100/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{item.role === 'admin' ? 'Administrator' : 'Student'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(item._id, item.role)}
                        className="inline-flex p-2 hover:bg-slate-105 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Toggle Admin / Student role"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(item._id)}
                        className="inline-flex p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
