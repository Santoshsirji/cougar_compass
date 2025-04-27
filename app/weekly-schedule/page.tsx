// TODO: This page needs to fetch and display the user's actual weekly schedule.
// Currently, the schema doesn't store day/time info for courses.
// We need clarification on how this data should be sourced/stored.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile } from "@/app/actions/getUserProfile"; // Import action to get profile data
import { DayOfWeek } from '@prisma/client'; // Import necessary types

// Helper function to format time (optional, adjust as needed)
function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return 'N/A';
  // Basic check if it's HH:MM format
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  return timeString; // Return as is if not in expected format
}

// Type for the processed schedule data
type FormattedDayScheduleItem = {
  id: string; // Use courseCode + semester + occurrenceIndex as a pseudo-id
  courseCode: string;
  courseName: string;
  startTime: string | null | undefined;
  endTime: string | null | undefined;
  location: string | null | undefined;
};
type FormattedWeeklySchedule = Record<DayOfWeek, FormattedDayScheduleItem[]>;

async function getFormattedUserWeeklySchedule(): Promise<FormattedWeeklySchedule | null> {
  try {
    console.log("Fetching user profile for weekly schedule...");
    const userProfile = await getUserProfile();
    
    if (!userProfile) {
       console.log("No user profile found.");
       return null;
    }
    
    // Log the raw schedule data fetched
    console.log("Raw courseSchedule from DB:", JSON.stringify(userProfile.courseSchedule, null, 2));
    
    if (!userProfile.courseSchedule || userProfile.courseSchedule.length === 0) {
      console.log("User profile found, but courseSchedule is empty.");
      // Return an empty schedule object instead of null if schedule is just empty
      return { MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [], FRIDAY: [], SATURDAY: [], SUNDAY: [] };
    }

    // Initialize schedule object with empty arrays for each day
    const formattedSchedule: FormattedWeeklySchedule = {
      MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [], FRIDAY: [], SATURDAY: [], SUNDAY: []
    };

    // Process the fetched schedule
    userProfile.courseSchedule.forEach((courseItem) => {
      console.log(`Processing course: ${courseItem.courseCode} - ${courseItem.courseName}`);
      console.log("Occurrences for this course:", JSON.stringify(courseItem.occurrences, null, 2));
      
      // Iterate through each occurrence within the course item
      courseItem.occurrences?.forEach((occurrence, occIndex) => {
         console.log(` -- Processing occurrence ${occIndex}: Day=${occurrence.dayOfWeek}, Start=${occurrence.startTime}, End=${occurrence.endTime}, Loc=${occurrence.location}`);
         
         // Use the dayOfWeek from the occurrence 
         if (occurrence.dayOfWeek && formattedSchedule[occurrence.dayOfWeek]) {
           console.log(`   -- Adding occurrence to ${occurrence.dayOfWeek}`);
           formattedSchedule[occurrence.dayOfWeek].push({
             id: `${courseItem.courseCode}-${courseItem.semester}-${occIndex}`, // Create a unique ID
             courseCode: courseItem.courseCode,
             courseName: courseItem.courseName,
             startTime: occurrence.startTime, // Get time/location from occurrence
             endTime: occurrence.endTime,
             location: occurrence.location,
           });
         }
      });
    });

    // Optional: Sort entries within each day by startTime if needed
    Object.values(formattedSchedule).forEach(daySchedule => {
      daySchedule.sort((a, b) => {
        // Basic time string comparison (assumes HH:MM or consistent format)
        const timeA = a.startTime || '99:99'; // Put items without time last
        const timeB = b.startTime || '99:99';
        return timeA.localeCompare(timeB);
      });
    });

    // Log the final processed schedule
    console.log("Final formattedSchedule:", JSON.stringify(formattedSchedule, null, 2));

    return formattedSchedule;
  } catch (error) {
    console.error("Error fetching or processing weekly schedule:", error);
    return null; // Return null on error
  }
}

export default async function WeeklySchedulePage() {
  console.log("Rendering WeeklySchedulePage...");
  // Fetch the user's formatted schedule data
  const scheduleData = await getFormattedUserWeeklySchedule();
  console.log("Schedule data received by page component:", scheduleData ? 'Data received' : 'Null/Error');
  const daysOfWeek = Object.values(DayOfWeek); // Get enum values directly

  if (!scheduleData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Your Weekly Schedule</h1>
        <p className="text-center text-red-500">Could not load your schedule data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Your Weekly Schedule</h1>

      {/* Remove Placeholder Warning */}
      {/* <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md mb-6">
        <strong className="font-bold">Note:</strong> This is a placeholder schedule...
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const daySchedule = scheduleData[day] || [];
          return (
            <Card key={day} className="shadow-md min-h-[150px] flex flex-col"> {/* Added flex flex-col */}
              <CardHeader className="p-3 bg-primary/10 flex-shrink-0"> {/* Added flex-shrink-0 */}
                <CardTitle className="text-base font-semibold capitalize text-center text-primary">
                  {day.toLowerCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex-grow"> {/* Added flex-grow */} 
                {daySchedule.length === 0 ? (
                  <div className="flex items-center justify-center h-full"> {/* Center empty text */}
                     <p className="text-xs text-muted-foreground text-center pt-4">No classes scheduled.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {daySchedule.map((item) => (
                       // Add a slightly better visual separation/background for each item
                       <li key={item.id} className="text-xs border rounded p-2 bg-background/50">
                         <p className="font-medium text-primary/90 truncate">{item.courseCode} - {item.courseName}</p> 
                         <p className="text-muted-foreground text-[11px]">
                           🕒 {formatTime(item.startTime)} - {formatTime(item.endTime)}
                         </p>
                        {item.location && (
                            <p className="text-muted-foreground text-[11px] truncate">📍 {item.location}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 