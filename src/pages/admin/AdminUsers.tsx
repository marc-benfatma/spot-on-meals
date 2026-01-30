import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and roles</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">User Management</h3>
            <p className="text-muted-foreground">
              User management functionality will be available once role-based access control is configured.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
