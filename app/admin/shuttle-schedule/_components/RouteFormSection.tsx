'use client';

import { useState, useEffect } from 'react';
import { Control, UseFormRegister, UseFormSetValue, UseFormGetValues, FormState } from 'react-hook-form';
import { Trash2, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ShuttleFormValues } from "@/lib/schemas/shuttle";

interface RouteFormSectionProps {
    routeIndex: number;
    removeRoute: (index: number) => void;
    control: Control<ShuttleFormValues>;
    register: UseFormRegister<ShuttleFormValues>;
    setValue: UseFormSetValue<ShuttleFormValues>;
    getValues: UseFormGetValues<ShuttleFormValues>;
    formState: FormState<ShuttleFormValues>;
    canRemoveRoute: boolean;
}

export function RouteFormSection({ 
    routeIndex,
    removeRoute,
    control,
    register,
    setValue,
    getValues,
    formState,
    canRemoveRoute 
}: RouteFormSectionProps) {

    const initialRouteData = getValues(`scheduleData.${routeIndex}`);
    const [stops, setStops] = useState<string[]>(initialRouteData?.stops?.map(stop => stop ?? '') || ['']);
    const initialTimes = initialRouteData?.times?.map((row: (string | null | undefined)[]) => 
        row.map((time: string | null | undefined) => time ?? '')
    ) || [['']];
    const [times, setTimes] = useState<string[][]>(initialTimes);

    const routeNamePath = `scheduleData.${routeIndex}.name` as const;
    const stopsPath = `scheduleData.${routeIndex}.stops` as const;
    const timesPath = `scheduleData.${routeIndex}.times` as const;

    useEffect(() => {
        setValue(stopsPath, stops, { shouldValidate: true, shouldDirty: true });
    }, [stops, setValue, stopsPath]);

    useEffect(() => {
        setValue(timesPath, times, { shouldValidate: true, shouldDirty: true });
    }, [times, setValue, timesPath]);

    const handleAddStop = () => {
        const newStops = [...stops, ''];
        setStops(newStops);
        const newTimes = times.map((row: string[]) => [...row, '']);
        setTimes(newTimes);
    };

    const handleRemoveStop = (stopIndex: number) => {
        const newStops = stops.filter((_: string, index: number) => index !== stopIndex);
        setStops(newStops);
        const newTimes = times.map((row: string[]) => {
            const newRow = [...row];
            newRow.splice(stopIndex, 1);
            return newRow;
        });
        setTimes(newTimes);
    };

    const handleStopChange = (index: number, value: string) => {
        const newStops = [...stops];
        newStops[index] = value;
        setStops(newStops);
    };

    const addDepartureRow = () => {
        const newRow = Array(stops.length).fill('');
        setTimes([...times, newRow]);
    };

    const removeTimeRow = (rowIndex: number) => {
        const newTimes = times.filter((_: string[], index: number) => index !== rowIndex);
        setTimes(newTimes);
    };

     const handleTimeChange = (rowIndex: number, colIndex: number, value: string) => {
        const newTimes = times.map((row: string[], rIdx: number) => {
            if (rIdx === rowIndex) {
                const newRow = [...row];
                newRow[colIndex] = value;
                return newRow;
            }
            return row;
        });
        setTimes(newTimes);
    };

    const routeErrors = formState.errors.scheduleData?.[routeIndex];

    return (
        <Card className="pt-4 relative mb-6 border shadow-sm">
            {canRemoveRoute && (
                <Button
                    type="button" variant="ghost" size="icon"
                    onClick={() => removeRoute(routeIndex)}
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 z-10"
                    aria-label="Remove Route"
                > <Trash2 className="h-4 w-4" /> </Button>
            )}
            <CardContent className="space-y-4">
                <FormField
                    control={control} name={routeNamePath}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Route Name</FormLabel>
                            <FormControl><Input placeholder="e.g., To Newark / To Caldwell" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    <FormLabel>Stops</FormLabel>
                    <div className="space-y-2 mt-1">
                        {stops.map((stop, stopIndex) => (
                            <div key={`stop-${routeIndex}-${stopIndex}`} className="flex items-center space-x-2">
                                <Input 
                                    placeholder={`Stop ${stopIndex + 1} Name`}
                                    value={stop}
                                    onChange={(e) => handleStopChange(stopIndex, e.target.value)}
                                />
                                <input type="hidden" {...register(`${stopsPath}.${stopIndex}`)} />
                                
                                {stops.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStop(stopIndex)} className="text-destructive hover:bg-destructive/10" aria-label="Remove Stop"> <Trash2 className="h-4 w-4" /> </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddStop}> <PlusCircle className="mr-2 h-4 w-4" /> Add Stop </Button>
                    {routeErrors?.stops?.root && (
                        <p className="text-sm font-medium text-destructive mt-1"> {routeErrors.stops.root.message} </p>
                    )}
                </div>

                <div>
                    <FormLabel>Times</FormLabel>
                    <Card className="mt-1 border-none">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {stops.map((stopName, stopIndex) => (<TableHead key={`header-${routeIndex}-${stopIndex}`}>{stopName || `Stop ${stopIndex + 1}`}</TableHead>))}
                                        <TableHead className="w-[50px]"> {/* Actions */} </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {times.map((timeRow, timeIndex) => (
                                        <TableRow key={`time-row-${routeIndex}-${timeIndex}`}>
                                            {stops.map((_, stopIndex) => (
                                                <TableCell key={`time-cell-${routeIndex}-${timeIndex}-${stopIndex}`}>
                                                     <Input 
                                                         placeholder="Time / -"
                                                         value={timeRow[stopIndex] ?? ''} 
                                                         onChange={(e) => handleTimeChange(timeIndex, stopIndex, e.target.value)}
                                                     />
                                                    <input type="hidden" {...register(`${timesPath}.${timeIndex}.${stopIndex}`)} />
                                                 </TableCell>
                                            ))}
                                            <TableCell className="text-right">
                                                {times.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTimeRow(timeIndex)} className="text-destructive hover:bg-destructive/10" aria-label="Remove Departure Time"> <Trash2 className="h-4 w-4" /> </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addDepartureRow} disabled={stops.length === 0}> <PlusCircle className="mr-2 h-4 w-4" /> Add Departure Time </Button>
                     {routeErrors?.times?.root && (
                        <p className="text-sm font-medium text-destructive mt-1"> {routeErrors.times.root.message} </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 