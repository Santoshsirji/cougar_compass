'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Control, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod"; // Import Zod
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { getUserProfile, UserProfileData } from '@/app/actions/getUserProfile';
import { updateUserProfile } from '@/app/actions/updateUserProfile'; // Only import the function
import { ClassStanding, CourseStatus, DayOfWeek } from '@prisma/client'; // Import enums
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from 'lucide-react'; 
import { useTransition, useRef } from 'react';
import { Loader2, Upload, FileText, Download, PlusCircle } from 'lucide-react';
import { uploadAuditFile } from '@/app/actions/uploadAuditFile';
import Link from 'next/link'; // Correct import for Next.js Link

// Define nested schemas locally for complex array types used in this form
const courseScheduleEntrySchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  courseName: z.string().min(1, "Course name is required"),
  semester: z.string().min(1, "Semester is required"),
  status: z.nativeEnum(CourseStatus),
  grade: z.string().optional().nullable(), // Allow null for grade in schedule
  // Remove single occurrence fields
  // dayOfWeek: z.nativeEnum(DayOfWeek).optional().nullable(), 
  // startTime: z.string().optional().nullable(), 
  // endTime: z.string().optional().nullable(),   
  // location: z.string().optional().nullable(),  
  // Add array of occurrences
  occurrences: z.array(z.object({ // Define occurrence schema inline or separately
    dayOfWeek: z.nativeEnum(DayOfWeek), // Day is required within an occurrence
    startTime: z.string().optional().nullable(), 
    endTime: z.string().optional().nullable(),   
    location: z.string().optional().nullable(), 
  })).optional(), // The occurrences array itself is optional
});

const courseTakenEntrySchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  courseName: z.string().min(1, "Course name is required"),
  semester: z.string().min(1, "Semester is required"),
  grade: z.string().min(1, "Grade is required"),
  creditHours: z.number().int().min(0, "Credit hours must be non-negative"),
});

// Define schema and type locally within the client component file
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  phone: z.string().optional().or(z.literal('')),
  mobile: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  zipcode: z.string().optional().or(z.literal('')),
  studentId: z.string().optional().or(z.literal('')),
  major: z.string().min(1, "Major is required."),
  minor: z.string().optional().or(z.literal('')),
  classStanding: z.nativeEnum(ClassStanding).optional(),
  // New Academic Fields
  gpa: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? undefined : parseFloat(String(val)),
    z.number().min(0).max(5, "GPA must be between 0 and 5").optional()
  ),
  lastTermGpa: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? undefined : parseFloat(String(val)),
    z.number().min(0).max(5, "GPA must be between 0 and 5").optional()
  ),
  academicStanding: z.string().optional().or(z.literal('')),
  academicHonors: z.string().optional().or(z.literal('')),
  honorsProgram: z.boolean().optional(),
  holdsAndWarnings: z.string().optional().or(z.literal('')), // Added Holds/Warnings
  advisor: z.string().optional().or(z.literal('')),
  // Representing arrays as potentially editable JSON strings for simplicity
  // A real implementation would use useFieldArray from react-hook-form
   courseSchedule: z.array(courseScheduleEntrySchema).optional(),
   coursesTaken: z.array(courseTakenEntrySchema).optional(),
});
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// --- Helper Component for Schedule Occurrences --- 
interface ScheduleOccurrencesProps {
  courseIndex: number;
  control: Control<UpdateProfileInput>;
}

function ScheduleOccurrences({ courseIndex, control }: ScheduleOccurrencesProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `courseSchedule.${courseIndex}.occurrences`,
  });

  return (
     // Add slight padding and potentially a subtle background to group occurrences
     <div className="space-y-2 p-3 rounded-md bg-muted/50">
       <Label className="text-xs font-semibold text-muted-foreground block mb-2">Meeting Times & Locations</Label>
       {fields.length === 0 && (
         <p className="text-xs text-muted-foreground italic text-center py-2">No meeting times added yet.</p>
       )}
       {fields.map((item, occIndex) => (
         // More compact grid, adjust columns/gaps
         <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_1fr_auto] items-center gap-x-2 gap-y-1 p-2 border rounded-md relative group bg-background shadow-sm">
          {/* DayOfWeek Select */}
          <FormField
            control={control}
            name={`courseSchedule.${courseIndex}.occurrences.${occIndex}.dayOfWeek`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Day</FormLabel> {/* Hide label visually */} 
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Day" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(DayOfWeek).map((day) => (
                      <SelectItem key={day} value={day} className="capitalize text-xs">
                        {day.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          {/* StartTime Input */}
          <FormField
            control={control}
            name={`courseSchedule.${courseIndex}.occurrences.${occIndex}.startTime`}
            render={({ field }) => (
              <FormItem>
                 <FormLabel className="sr-only">Start Time</FormLabel>
                 <FormControl><Input type="time" className="h-8 text-xs" placeholder="Start" {...field} value={field.value || ''} /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           {/* EndTime Input */}
          <FormField
            control={control}
            name={`courseSchedule.${courseIndex}.occurrences.${occIndex}.endTime`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">End Time</FormLabel>
                 <FormControl><Input type="time" className="h-8 text-xs" placeholder="End" {...field} value={field.value || ''} /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           {/* Location Input */}
           <FormField
            control={control}
            name={`courseSchedule.${courseIndex}.occurrences.${occIndex}.location`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1"> {/* Allow location to take space */}
                <FormLabel className="sr-only">Location</FormLabel>
                 <FormControl><Input className="h-8 text-xs" placeholder="Room/Online" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           {/* Remove Occurrence Button - Positioned within grid flow */}
           <Button
             type="button"
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-muted-foreground hover:text-destructive sm:ml-1" 
             onClick={() => remove(occIndex)}
           >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove Time</span>
          </Button>
         </div>
       ))}
       {/* Add Button - aligned left */}
       <div className="flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 text-xs h-7"
            onClick={() => append({ dayOfWeek: DayOfWeek.MONDAY, startTime: null, endTime: null, location: null })} // Default new entry
          >
            <PlusCircle className="mr-1 h-3 w-3" /> Add Time/Location
          </Button>
       </div>
     </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  
  // State for Audit File Upload
  const [selectedAuditFile, setSelectedAuditFile] = useState<File | null>(null);
  const [isUploadingAudit, startAuditUploadTransition] = useTransition();
  const [hasAuditFile, setHasAuditFile] = useState(false); // Track if file exists in DB
  const auditFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      zipcode: '',
      studentId: '',
      major: '', 
      minor: '',
      classStanding: undefined, // Default to undefined for Select placeholder
      // New fields
      gpa: undefined,
      lastTermGpa: undefined,
      academicStanding: '',
      academicHonors: '',
      honorsProgram: false,
      holdsAndWarnings: '',
      advisor: '',
      courseSchedule: [], // Initialize as empty array, will be stringified later if needed for textarea
      coursesTaken: [],   // Initialize as empty array
    },
    mode: 'onChange', // Add mode for better UX with field arrays
  });

  // Setup field arrays
  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control: form.control as any,
    name: "courseSchedule"
  });

  const { fields: takenFields, append: appendTaken, remove: removeTaken } = useFieldArray({
    control: form.control as any,
    name: "coursesTaken"
  });

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const profile = await getUserProfile();
      if (profile) {
        form.reset({
          name: profile.name || '',
          phone: profile.phone || '',
          mobile: profile.mobile || '',
          address: profile.address || '',
          city: profile.city || '',
          zipcode: profile.zipcode || '',
          studentId: profile.studentId || '',
          major: profile.major || 'Undeclared', // Ensure default if null/empty
          minor: profile.minor || '',
          classStanding: profile.classStanding || undefined,
          honorsProgram: profile.honorsProgram || false,
          advisor: profile.advisor || '',
          // New Fields
          gpa: profile.gpa ?? undefined, // Handle null from DB
          lastTermGpa: profile.lastTermGpa ?? undefined, // Handle null from DB
          academicStanding: profile.academicStanding || '',
          academicHonors: profile.academicHonors || '',
          holdsAndWarnings: profile.holdsAndWarnings || '',
          // For Textarea approach: Stringify JSON arrays
          // Pass arrays directly for useFieldArray
          courseSchedule: profile.courseSchedule || [],
          coursesTaken: profile.coursesTaken || [],
        });
        setUserData(profile);
        // Set initial state for whether audit file exists
        setHasAuditFile(!!profile?.auditFileData);
      } else {
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Please try again later.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [toast, form]); // Added form

  const onSubmit: SubmitHandler<UpdateProfileInput> = async (data) => {
    setIsSaving(true);
    console.log("Form Data Submitted:", data); // Log submitted data
    
    // Ensure array fields are actually arrays before sending (handle potential edge cases?)
    const dataToSend = {
      ...data,
      courseSchedule: Array.isArray(data.courseSchedule) ? data.courseSchedule : [],
      coursesTaken: Array.isArray(data.coursesTaken) ? data.coursesTaken : [],
    };
    
    console.log("Data being sent to server action:", dataToSend);

    const result = await updateUserProfile(dataToSend);
    
    if (result.success) {
      toast({ title: "Success", description: result.message });
      router.push('/profile'); // Redirect back to profile page
      router.refresh(); // Refresh profile page data
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    
    setIsSaving(false);
  };

  // Handler for Audit File Upload
  const handleAuditUpload = () => {
      if (!selectedAuditFile) {
          toast({ title: "Info", description: "Please select a PDF file first.", variant: "default" });
          return;
      }

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('auditFile', selectedAuditFile);

      startAuditUploadTransition(async () => {
          try {
              // Pass the FormData directly to the server action
              const result = await uploadAuditFile(formData);

              if (result.success) {
                  toast({ title: "Success", description: result.message });
                  setSelectedAuditFile(null); // Clear selection
                  if(auditFileInputRef.current) auditFileInputRef.current.value = ""; // Clear file input
                  setHasAuditFile(true); // Update state to show file exists
              } else {
                  toast({ title: "Error", description: result.message, variant: "destructive" });
              }
          } catch (error) {
              console.error("Error uploading file:", error);
              toast({ title: "Error", description: "Failed to upload the file.", variant: "destructive" });
          }
      });
  };

  // Handler for file input change
  const handleAuditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
           // Basic client-side validation
           if (file.size > 5 * 1024 * 1024) {
               toast({ title: "Error", description: "File size exceeds 5MB limit.", variant: "destructive" });
               setSelectedAuditFile(null);
               if(auditFileInputRef.current) auditFileInputRef.current.value = ""; // Clear input
               return;
           }
           if (file.type !== 'application/pdf') {
               toast({ title: "Error", description: "Only PDF files are allowed.", variant: "destructive" });
               setSelectedAuditFile(null);
                if(auditFileInputRef.current) auditFileInputRef.current.value = ""; // Clear input
               return;
           }
          setSelectedAuditFile(file);
      } else {
          setSelectedAuditFile(null);
      }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your personal and academic information. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FieldValues>)} className="space-y-6">
                {/* --- Personal Information --- */}
                <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={userData?.email || ''} disabled /> 
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control as any} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control as any} name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 <FormField control={form.control as any} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl><Input placeholder="123 University Ave" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField control={form.control as any} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="College Town" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control as any} name="zipcode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl><Input placeholder="12345" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                 </div>

                {/* --- Academic Information --- */}
                <h3 className="text-lg font-medium border-b pb-2 pt-4">Academic Information</h3>
                 <FormField control={form.control as any} name="studentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl><Input placeholder="e.g., 453926" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField control={form.control as any} name="major" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major *</FormLabel>
                      <FormControl><Input placeholder="Computer Science" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="minor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minor</FormLabel>
                      <FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="gpa" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cumulative GPA</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="5"
                            placeholder="e.g., 3.8"
                            {...field}
                            // Ensure value is a number or empty string for the input
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string for clearing the input, otherwise parse as float
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                   <FormField control={form.control as any} name="lastTermGpa" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Term GPA</FormLabel>
                        <FormControl>
                           <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="5"
                            placeholder="e.g., 4.0"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control as any} name="academicStanding" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Standing</FormLabel>
                        <FormControl><Input placeholder="e.g., Good Standing" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control as any} name="academicHonors" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Honors</FormLabel>
                         <FormControl><Textarea placeholder="e.g., Dean's List Fall 2023, Cum Laude" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
                 <FormField
                    control={form.control as any}
                    name="classStanding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Standing</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your class standing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ClassStanding).map((standing) => (
                              <SelectItem key={standing} value={standing} className="capitalize">
                                {standing.toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <FormField control={form.control as any} name="advisor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advisor Name</FormLabel>
                      <FormControl><Input placeholder="Dr. Jane Smith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField
                    control={form.control as any}
                    name="honorsProgram"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Honors Program
                            </FormLabel>
                            <FormDescription>
                            Are you currently enrolled in the university honors program?
                            </FormDescription>
                        </div>
                        </FormItem>
                    )}
                    />
                <div className="space-y-4 rounded-md border p-4 md:col-span-2 shadow-sm bg-card"> {/* Added shadow and bg */} 
                     <h4 className="font-medium text-card-foreground leading-none">Academic Audit File (PDF)</h4>
                     
                     {/* Status Display */} 
                     <div className="flex items-center space-x-2 text-sm">
                         {hasAuditFile ? (
                             <>
                                 <FileText className="h-4 w-4 flex-shrink-0 text-green-600" />
                                 <span className="text-muted-foreground">Current file uploaded.</span>
                                 <Link 
                                     href="/api/user/audit-file" 
                                     target="_blank" 
                                     rel="noopener noreferrer" 
                                     className="text-primary hover:underline inline-flex items-center ml-auto text-xs font-medium"
                                 >
                                     View / Download
                                     <Download className="h-3 w-3 ml-1" />
                                 </Link>
                             </>
                         ) : (
                             <>
                                  {/* Consider using a different icon like FileX if available */}
                                  <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" /> 
                                  <span className="text-muted-foreground">No audit file uploaded.</span>
                             </>
                         )}
                     </div>
                    
                     {/* Upload Area */} 
                     <div className="pt-2 space-y-2">
                         <Label htmlFor="audit-pdf" className="text-sm font-medium">Upload New PDF (Max 5MB)</Label>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                             <Input 
                                 id="audit-pdf"
                                 type="file" 
                                 accept=".pdf" 
                                 onChange={handleAuditFileChange} // Use specific handler
                                 disabled={isUploadingAudit} // Disable during upload
                                 ref={auditFileInputRef}
                                 className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                             />
                             <Button 
                                 type="button" // Important: Set type to button to prevent form submission
                                 onClick={handleAuditUpload} // Use specific handler
                                 disabled={!selectedAuditFile || isUploadingAudit} 
                                 size="sm"
                                 className="w-full sm:w-auto flex-shrink-0" // Adjust width for smaller screens
                             >
                                 {isUploadingAudit ? (
                                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                                 ) : (
                                      <><Upload className="mr-2 h-4 w-4" /> Upload Audit</>
                                  )}
                              </Button>
                          </div>
                          {selectedAuditFile && !isUploadingAudit && (
                              <p className="text-xs text-muted-foreground pt-1">Selected: {selectedAuditFile.name}</p>
                          )}
                      </div>
                 </div>
                 <FormField control={form.control as any} name="holdsAndWarnings" render={({ field }) => (
                   <FormItem className="md:col-span-2"> {/* Make it span full width */} 
                     <FormLabel>Holds and Warnings</FormLabel>
                     <FormControl><Textarea placeholder="List any holds or warnings on your account" {...field} /></FormControl>
                     <FormMessage />
                   </FormItem>
                 )} />

                {/* --- Course Schedule --- */}
                <div className="space-y-4 border-t pt-4 mt-4">
                   <h4 className="text-md font-medium">Course Schedule (Current & Planned)</h4>
                   <p className="text-sm text-muted-foreground">List courses you are currently taking or plan to take.</p>
                   {scheduleFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 mb-4 shadow-sm bg-card relative group">
                      {/* Remove Course Button (positioned top-right) */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSchedule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Course</span>
                      </Button>

                      {/* Course Details Section (Grid Layout) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <FormField
                          control={form.control as any}
                          name={`courseSchedule.${index}.courseCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Code</FormLabel>
                              <FormControl><Input placeholder="CS 101" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`courseSchedule.${index}.courseName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Name</FormLabel>
                              <FormControl><Input placeholder="Intro to CS" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`courseSchedule.${index}.semester`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Semester</FormLabel>
                              <FormControl><Input placeholder="Fall 2024" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`courseSchedule.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.values(CourseStatus).map((status) => (
                                    <SelectItem key={status} value={status} className="capitalize">
                                      {status.replace('_', ' ').toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`courseSchedule.${index}.grade`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade (Optional)</FormLabel>
                              <FormControl><Input placeholder="Leave blank if N/A" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div> {/* End of Course Details Grid */}

                      {/* Meeting Times Section (Nested Field Array) */}
                      <div className="border-t border-dashed pt-3">
                        <ScheduleOccurrences courseIndex={index} control={form.control as any} />
                      </div>

                    </div> // End of main course entry div
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    // Add default values for new fields here
                    onClick={() => appendSchedule({ 
                        courseCode: '', 
                        courseName: '', 
                        semester: '', 
                        status: CourseStatus.PLANNED, 
                        grade: null,
                        occurrences: [],
                    })}
                  >
                    Add Course to Schedule
                  </Button>
                </div>

                {/* --- Courses Taken --- */}
                <div className="space-y-4 border-t pt-4 mt-4">
                   <h4 className="text-md font-medium">Completed Course History</h4>
                   <p className="text-sm text-muted-foreground">List courses you have already completed.</p>
                   {takenFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 border p-3 rounded-md relative group">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-grow">
                         <FormField
                          control={form.control as any}
                          name={`coursesTaken.${index}.courseCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Code</FormLabel>
                              <FormControl><Input placeholder="MA 101" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`coursesTaken.${index}.courseName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Name</FormLabel>
                              <FormControl><Input placeholder="Calculus I" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name={`coursesTaken.${index}.semester`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Semester</FormLabel>
                              <FormControl><Input placeholder="Spring 2023" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control as any}
                          name={`coursesTaken.${index}.grade`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                              <FormControl><Input placeholder="A-" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control as any}
                          name={`coursesTaken.${index}.creditHours`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit Hours</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="3"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} // Ensure number
                                />
                                </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         className="absolute top-1 right-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={() => removeTaken(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Course</span>
                      </Button>
                     </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => appendTaken({ courseCode: '', courseName: '', semester: '', grade: '', creditHours: 0 })}
                  >
                    Add Course Taken
                  </Button>
                </div>

                {/* --- Form Actions --- */}
                 <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                   <Button type="button" variant="ghost" onClick={() => router.push('/profile')}>Cancel</Button>
                   <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                      {isSaving ? "Saving..." : "Save Changes"}
                   </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 