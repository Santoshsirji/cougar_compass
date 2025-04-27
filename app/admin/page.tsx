import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the admin panel. Use the sidebar to navigate between different management sections.
      </p>
      
      {/* Optional: Add summary cards or quick links here later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Quick summary or stats.</CardDescription>
          </CardHeader>
          <CardContent>
             <p>Content coming soon...</p>
          </CardContent>
        </Card>
         {/* Add more cards as needed */}
      </div>

    </div>
  );
} 