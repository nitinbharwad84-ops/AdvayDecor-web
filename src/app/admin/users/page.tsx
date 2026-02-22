'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Trash2, UserPlus, RefreshCw, Mail, Phone, Clock, FileText, LayoutDashboard, ChevronLeft, ChevronRight, X, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // New User State
    const [newEmail, setNewEmail] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);

    // Edit User State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<UserProfile>>({});
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setUsers(data.users || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast.success('User deleted successfully');
            setUsers(users.filter(u => u.id !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEmail || !newPassword || !newFullName) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsAddingUser(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newEmail,
                    password: newPassword,
                    full_name: newFullName,
                    phone: newPhone
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast.success('User added successfully');

            // Reset form
            setNewEmail('');
            setNewPassword('');
            setNewFullName('');
            setNewPhone('');
            setIsAddOpen(false);

            // Refresh list
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add user');
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser.full_name) {
            toast.error('Full name is required');
            return;
        }

        setIsSavingEdit(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    full_name: editingUser.full_name,
                    phone: editingUser.phone
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            toast.success('User updated successfully');

            // Close mask and refresh list
            setIsEditOpen(false);
            setEditingUser({});
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const displayedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div style={{ padding: '0 0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0a0a23', marginBottom: '0.25rem' }}>Manage Users</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>View, add, or delete customer accounts.</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.875rem 1.5rem', borderRadius: '0.75rem',
                            background: '#0a0a23', color: '#fff', fontSize: '0.9rem',
                            fontWeight: 600, border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(10,10,35,0.15)'
                        }}
                    >
                        <UserPlus size={18} /> Add New User
                    </button>
                </div>

                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            width: '100%', padding: '0.875rem 1rem 0.875rem 3rem',
                            borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                            fontSize: '0.95rem', background: '#fff'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <RefreshCw className="animate-spin" size={32} color="#00b4d8" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#cbd5e1' }}>
                        <Users size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0a0a23', marginBottom: '0.5rem' }}>No users found</h3>
                    <p style={{ color: '#64748b' }}>We couldn't find any users matching your criteria.</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined At</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00b4d8, #90e0ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                                                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: '#0a0a23' }}>{user.full_name || 'No Name Found'}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', marginBottom: '0.25rem' }}><Mail size={14} color="#94a3b8" /> {user.email}</p>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><Phone size={14} color="#94a3b8" /> {user.phone || 'No phone'}</p>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#4b5563' }}><Clock size={14} color="#94a3b8" /> {new Date(user.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setIsEditOpen(true);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem', borderRadius: '0.5rem',
                                                        background: '#f8fafc', color: '#0a0a23',
                                                        border: '1px solid #e2e8f0', cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="Edit User"
                                                >
                                                    <PenLine size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                                                    disabled={deletingId === user.id}
                                                    style={{
                                                        padding: '0.5rem', borderRadius: '0.5rem',
                                                        background: '#fff1f2', color: '#ef4444',
                                                        border: '1px solid #ffe4e6', cursor: 'pointer',
                                                        opacity: deletingId === user.id ? 0.5 : 1, transition: 'all 0.2s'
                                                    }}
                                                    title="Delete User"
                                                >
                                                    {deletingId === user.id ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '36px', height: '36px', borderRadius: '0.5rem',
                                        border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : '#fff',
                                        color: currentPage === 1 ? '#cbd5e1' : '#0a0a23', cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '36px', height: '36px', borderRadius: '0.5rem',
                                        border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : '#fff',
                                        color: currentPage === totalPages ? '#cbd5e1' : '#0a0a23', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(10,10,35,0.6)', backdropFilter: 'blur(4px)',
                            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '1.5rem', padding: '2rem',
                                width: '100%', maxWidth: '500px', position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setIsAddOpen(false)}
                                style={{
                                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                                    background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>Add New User</h2>

                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Email Address *</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="user@example.com"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            value={newFullName}
                                            onChange={e => setNewFullName(e.target.value)}
                                            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            value={newPhone}
                                            onChange={e => setNewPhone(e.target.value)}
                                            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Temporary Password *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Min 6 characters"
                                        minLength={6}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddOpen(false)}
                                        style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', background: '#f8fafc', color: '#64748b', fontSize: '0.95rem', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAddingUser}
                                        style={{ flex: 2, padding: '1rem', borderRadius: '0.75rem', background: '#00b4d8', color: '#fff', fontSize: '0.95rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {isAddingUser ? <RefreshCw className="animate-spin" size={18} /> : null}
                                        {isAddingUser ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {isEditOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(10,10,35,0.6)', backdropFilter: 'blur(4px)',
                            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '1.5rem', padding: '2rem',
                                width: '100%', maxWidth: '500px', position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setIsEditOpen(false)}
                                style={{
                                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                                    background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a23', marginBottom: '1.5rem' }}>Edit User</h2>

                            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Email Address</label>
                                    <input
                                        disabled
                                        type="email"
                                        value={editingUser.email || ''}
                                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', background: '#f8fafc', color: '#94a3b8' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Email cannot be changed directly for security reasons.</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingUser.full_name || ''}
                                            onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Phone</label>
                                        <input
                                            type="tel"
                                            value={editingUser.phone || ''}
                                            onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(false)}
                                        style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', background: '#f8fafc', color: '#64748b', fontSize: '0.95rem', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingEdit}
                                        style={{ flex: 2, padding: '1rem', borderRadius: '0.75rem', background: '#0a0a23', color: '#fff', fontSize: '0.95rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {isSavingEdit ? <RefreshCw className="animate-spin" size={18} /> : null}
                                        {isSavingEdit ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
