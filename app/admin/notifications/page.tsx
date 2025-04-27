import { getNotifications } from "@/app/actions/getNotifications";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NotificationList from "./_components/NotificationList"; // Client component for list + actions

export default async function AdminNotificationsPage() {
    
    // Fetch notifications directly in the Server Component
    const notifications = await getNotifications();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Notifications</h1>
                {/* Button to trigger Add Notification Dialog (logic will be in NotificationList/Form) */}
                 <Button disabled> {/* Disabled until Dialog is implemented */} 
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Notification
                 </Button>
            </div>

             <p className="text-muted-foreground">
                Create, view, and delete site-wide notifications.
            </p>

            {/* Pass data and actions to the client component */}
             <NotificationList initialNotifications={notifications} /> 

        </div>
    );
} 