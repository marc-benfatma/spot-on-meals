import { Outlet, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function Admin() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

// Redirect component for /admin to /admin/restaurants
export function AdminIndex() {
  return <Navigate to="/admin/restaurants" replace />;
}
