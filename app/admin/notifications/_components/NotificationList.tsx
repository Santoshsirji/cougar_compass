'use client';

import { useState, useTransition } from 'react';
import { NotificationWithCreator } from "@/app/actions/getNotifications";
import { deleteNotification } from '@/app/actions/deleteNotification';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Edit, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotificationForm } from "./NotificationForm";

interface NotificationListProps {
    initialNotifications: NotificationWithCreator[];
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<NotificationWithCreator | null>(null);

    const handleDelete = (id: string) => {
        startDeleteTransition(async () => {
            const result = await deleteNotification(id);
            if (result.success) {
                setNotifications(current => current.filter(n => n.id !== id));
                toast({ title: "Success", description: result.message });
                setNotificationToDelete(null);
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    const openDeleteDialog = (notification: NotificationWithCreator) => {
        setNotificationToDelete(notification);
    };

    const closeDeleteDialog = () => {
        setNotificationToDelete(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Notifications</CardTitle>
                 <CardDescription>Notifications displayed across the site.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Add Notification Button triggers Dialog */} 
                <div className="flex justify-end mb-4">
                     <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                           <Button size="sm">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Notification
                          </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-[425px]">
                           <DialogHeader>
                              <DialogTitle>Add New Notification</DialogTitle>
                              <DialogDescription>Enter the details for the new notification.</DialogDescription>
                          </DialogHeader>
                          {/* Pass callback to close dialog on success */}
                          <NotificationForm onSubmitSuccess={() => setShowAddDialog(false)} /> 
                      </DialogContent>
                   </Dialog>
                </div>
                <Table>
                    <TableHeader><TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow></TableHeader>
                    <TableBody>
                        {notifications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No notifications found.
                                </TableCell>
                            </TableRow>
                        )}
                        {notifications.map((notification) => (
                            <TableRow key={notification.id}>
                                <TableCell className="font-medium">{notification.title}</TableCell>
                                <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                                <TableCell>
                                    {notification.expiresAt 
                                        ? notification.expiresAt.toLocaleDateString()
                                        : <Badge variant="outline">Never</Badge>}
                                </TableCell>
                                <TableCell>{notification.createdBy?.name || 'N/A'}</TableCell>
                                <TableCell>{notification.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <AlertDialog open={notificationToDelete?.id === notification.id} onOpenChange={open => !open && closeDeleteDialog()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                 <DropdownMenuItem disabled> {/* Disabled until Edit form/dialog is ready */} 
                                                    <Edit className="mr-2 h-4 w-4"/> Edit
                                                 </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                     <DropdownMenuItem onSelect={(e) => {e.preventDefault(); openDeleteDialog(notification);}} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                         <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the notification titled "{notificationToDelete?.title}".
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => handleDelete(notificationToDelete!.id)} 
                                                disabled={isDeleting} 
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 