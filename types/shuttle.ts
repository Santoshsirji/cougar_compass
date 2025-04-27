import { DayOfWeek, Prisma } from "@prisma/client";

// Define the structure we want to return to the frontend
export type FormattedShuttleRoute = {
    name: string;
    stops: string[];
    times: string[][]; 
};

export type FormattedShuttleSchedule = {
    date: Date;
    notes: string | null;
    routes: FormattedShuttleRoute[];
};

// Type for schedule data including updater's name (used in Admin)
export type ShuttleScheduleWithUpdater = Prisma.ShuttleScheduleGetPayload<{
  include: {
    updatedBy: {
      select: {
        name: true,
      }
    }
  }
}>; 