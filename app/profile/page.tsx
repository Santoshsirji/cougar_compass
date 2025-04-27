import { redirect } from "next/navigation";
import Link from "next/link"; // Import Link
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import {
  User, Clock, BookOpen, AlertTriangle, GraduationCap, Phone, Mail, MapPin, CalendarDays, Building, Star, Edit, FileText, Award, ShieldCheck, Users
} from "lucide-react";
import { getUserProfile, type UserProfileData } from "@/app/actions/getUserProfile"; // Import the action
import { DayOfWeek } from '@prisma/client'; // Import DayOfWeek

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Helper component for info items
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label?: string, value: React.ReactNode }) => (
  <div className={`flex items-start text-sm ${!value || value === "N/A" || value === "None" ? "opacity-60" : ""}`}>
    <Icon className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
    <div className="flex-1">
      {label && <span className="font-medium text-foreground">{label}: </span>}
      <span className="text-muted-foreground">{value || "N/A"}</span>
    </div>
  </div>
);

// Helper function to format time for display (if not already available)
function formatDisplayTime(timeString: string | null | undefined): string {
  if (!timeString) return '-';
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  return timeString;
}

export default async function ProfilePage() {
  const user = await getUserProfile(); // Call the server action

  // Handle cases where user data couldn't be fetched (already handled in action, but good practice)
  if (!user) {
     // Redirect to login, maybe with an error message if needed
     // The middleware should ideally catch unauthenticated users first,
     // but this handles cases where the action returns null for other reasons (e.g., DB error)
    console.error("ProfilePage: Failed to get user profile data.");
    redirect("/auth/login?error=ProfileNotFound"); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <Card className="overflow-hidden shadow-lg border-border/50 relative">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              {/* Prioritize imageURL, then image, then fallback */}
              <AvatarImage 
                src={user.imageURL || user.image || undefined} 
                alt={user.name || "User profile"} 
              />
              <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                {getInitials(user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">{user.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                {user.major} Major {user.minor ? `• ${user.minor} Minor` : ''} • {user.classStanding}
              </CardDescription>
              <Badge variant="secondary" className="mt-2 capitalize">
                {user.role.toLowerCase()}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Link href="/profile/edit">
                 <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                 </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <User className="mr-2 h-5 w-5 text-primary" /> Contact & Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={Mail} value={user.email} />
                {user.studentId && <InfoItem icon={GraduationCap} label="Student ID" value={user.studentId} />}
                {user.phone && <InfoItem icon={Phone} label="Phone" value={user.phone} />}
                {user.mobile && <InfoItem icon={Phone} label="Mobile" value={user.mobile} />}
                {user.address && (
                  <InfoItem 
                    icon={MapPin} 
                    label="Address" 
                    value={`${user.address}${user.city ? ", "+user.city : ""}${user.zipcode ? " "+user.zipcode : ""}`}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                   <Building className="mr-2 h-5 w-5 text-primary" /> Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={CalendarDays} label="Catalog Year" value={user.degreeCatalogYear} />
                <InfoItem icon={Users} label="Advisor" value={user.advisor} />
                <InfoItem icon={Award} label="Honors Program" value={user.honorsProgram ? "Yes" : "No"} />
                <InfoItem icon={Award} label="Academic Honors" value={user.academicHonors || "None"} />
                <InfoItem icon={ShieldCheck} label="Academic Standing" value={user.academicStanding || "Good"} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Performance & Courses */} 
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <Star className="mr-2 h-5 w-5 text-primary" /> Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                    <div>
                      <p className="text-3xl font-semibold text-primary">{user.gpa.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Overall GPA</p>
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-primary">{user.lastTermGpa.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Last Term GPA</p>
                    </div>
                </div>
                 {user.holdsAndWarnings && (
                   <div className="mt-4 flex items-center text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                      <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{user.holdsAndWarnings}</span>
                    </div>
                )}
              </CardContent>
            </Card>

             <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="schedule">Current Schedule</TabsTrigger>
                <TabsTrigger value="taken">Courses Taken</TabsTrigger>
                <TabsTrigger value="audit">Academic Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule">
                 <Card className="shadow-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <Clock className="mr-2 h-5 w-5 text-primary" /> Current Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.courseSchedule.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic text-center py-4">No courses scheduled.</p>
                      ) : (
                        <ul className="space-y-4">
                          {user.courseSchedule.map((course, index) => (
                            <li key={index} className="p-3 bg-muted/30 rounded-md border border-border/50">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                   <p className="font-medium text-foreground">{course.courseName} <span className="text-muted-foreground">({course.courseCode})</span></p>
                                   <p className="text-xs text-muted-foreground">{course.semester} • <span className="capitalize">{course.status.replace('_', ' ').toLowerCase()}</span></p>
                                </div>
                                {course.grade && <Badge variant="outline">{course.grade}</Badge>}
                              </div>
                              {/* Display Occurrences */}
                              {course.occurrences && course.occurrences.length > 0 && (
                                <div className="mt-2 space-y-1 pl-4 border-l border-dashed border-border/80">
                                  {course.occurrences.map((occ, occIndex) => (
                                    <div key={occIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                                       <span className="font-medium capitalize w-16 flex-shrink-0">{occ.dayOfWeek.toLowerCase()}:</span>
                                       <span>{formatDisplayTime(occ.startTime)} - {formatDisplayTime(occ.endTime)}</span>
                                       {occ.location && <span className="ml-auto pl-2">📍 {occ.location}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(!course.occurrences || course.occurrences.length === 0) && (
                                 <p className="text-xs text-muted-foreground italic pl-4 mt-1">No specific meeting times listed.</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="taken">
                  <Card className="shadow-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <BookOpen className="mr-2 h-5 w-5 text-primary" /> Courses Taken
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.coursesTaken.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic text-center py-4">No completed courses found.</p>
                      ) : (
                        <div className="overflow-x-auto relative border rounded-md">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                              <tr>
                                <th scope="col" className="px-4 py-3">Course</th>
                                <th scope="col" className="px-4 py-3">Semester</th>
                                <th scope="col" className="px-4 py-3 text-center">Credits</th>
                                <th scope="col" className="px-4 py-3 text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {user.coursesTaken.map((course, index) => (
                                <tr key={index} className="border-t dark:border-border/50 hover:bg-muted/10">
                                  <td className="px-4 py-2 font-medium text-foreground whitespace-nowrap">
                                    {course.courseName} ({course.courseCode})
                                  </td>
                                  <td className="px-4 py-2 text-muted-foreground">{course.semester}</td>
                                  <td className="px-4 py-2 text-center text-muted-foreground">{course.creditHours}</td>
                                  <td className="px-4 py-2 text-center font-semibold text-foreground">{course.grade}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
              </TabsContent>
              
              <TabsContent value="audit">
                  <Card className="shadow-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-semibold">
                          <FileText className="mr-2 h-5 w-5 text-primary" /> Academic Audit
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                         <Button asChild variant="secondary" disabled={!user.auditFileData}>
                           <a href={"/api/user/audit-file"} target="_blank" rel="noopener noreferrer" >
                              View Latest Audit File
                           </a>
                        </Button>
                        {!user.auditFileData && <p className="text-xs text-muted-foreground mt-2">No audit file uploaded.</p>} 
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 