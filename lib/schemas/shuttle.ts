import { z } from "zod";
// import { DayOfWeek } from "@prisma/client"; // No longer needed

// Define the structure expected from the form for a single route
const routeSchema = z.object({
  name: z.string().min(1, "Route name is required."),
  stops: z.array(z.string().min(1, "Stop name cannot be empty")).min(1, "At least one stop is required."),
  // Represents rows of departures, each inner array holds times for the stops
  times: z.array(z.array(z.string().optional())).min(1, "At least one departure time row is required."),
})
.refine(data => {
    // Add validation to ensure each time row has the same number of entries as stops
    return data.times.every(timeRow => timeRow.length === data.stops.length);
}, {
    message: "Each departure time row must have exactly one entry for each stop (use blank or '-' for no stop).",
    path: ["times"], // Attach error to the times field
});

// Define the main schema for the form data
export const shuttleScheduleFormSchema = z.object({
  // dayOfWeek: z.nativeEnum(DayOfWeek), // REMOVED
  date: z.date({ required_error: "A date for this schedule is required." }), // ADDED
  notes: z.string().optional(),
  scheduleData: z.array(routeSchema).min(1, "At least one route is required."),
});

// Type for the form values based on the Zod schema
export type ShuttleFormValues = z.infer<typeof shuttleScheduleFormSchema>; 