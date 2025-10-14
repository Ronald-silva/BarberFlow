
import React, { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { DashboardIcon, CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon, LogoutIcon } from '../components/icons';

const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }
    
    const navItems = [
        { to: 'overview', icon: <DashboardIcon />, text: 'Visão Geral', adminOnly: true },
        { to: 'schedule', icon: <CalendarIcon />, text: 'Agenda', adminOnly: false },
        { to: 'clients', icon: <UsersIcon />, text: 'Clientes', adminOnly: false },
        { to: 'services', icon: <ScissorsIcon />, text: 'Serviços', adminOnly: true },
        { to: 'professionals', icon: <TeamIcon />, text: 'Profissionais', adminOnly: true },
        { to: 'settings', icon: <SettingsIcon />, text: 'Configurações', adminOnly: true },
    ].filter(item => !item.adminOnly || user.role === UserRole.ADMIN);

    return (
        <div className="flex h-screen bg-brand-dark text-brand-text">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-secondary p-5 flex flex-col">
                <div className="text-2xl font-bold text-brand-primary mb-10">BarberFlow</div>
                <nav className="flex-1">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 p-2 rounded-lg mb-2 transition-colors ${
                                isActive ? 'bg-brand-primary text-brand-secondary' : 'hover:bg-gray-700'
                                }`
                            }
                        >
                            {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                            <span>{item.text}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-auto">
                     <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-2 w-full text-left rounded-lg hover:bg-gray-700 transition-colors"
                     >
                        <LogoutIcon className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
