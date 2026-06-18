import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileBarChart,
  HelpCircle,
  SlidersHorizontal,
  ScrollText,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { logout, getUser } from "../services/authService";
import { ROLES, ADMIN_PORTAL_ROLES, ROLE_LABELS } from "../constants/roles";
import "../styles/Admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true, roles: ADMIN_PORTAL_ROLES },
  {
    to: "/admin/students",
    label: "Students",
    icon: Users,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VIEWER],
  },
  { to: "/admin/sessions", label: "Sessions", icon: ClipboardList, roles: ADMIN_PORTAL_ROLES },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart, roles: ADMIN_PORTAL_ROLES },
  {
    to: "/admin/questions",
    label: "Questions",
    icon: HelpCircle,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSMENT_MANAGER, ROLES.VIEWER],
  },
  {
    to: "/admin/configuration",
    label: "Configuration",
    icon: SlidersHorizontal,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSMENT_MANAGER, ROLES.VIEWER],
  },
  { to: "/admin/users", label: "User Management", icon: ShieldCheck, roles: [ROLES.SUPER_ADMIN] },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, roles: [ROLES.SUPER_ADMIN] },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">Admin Console</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span className="admin-user-name">{user?.email}</span>
            <span className="admin-user-role">{ROLE_LABELS[user?.role] || user?.role}</span>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
