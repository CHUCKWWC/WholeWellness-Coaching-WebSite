import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  onTimeSelect: (date: Date, time: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
}

export default function TimeSlotPicker({ onTimeSelect, selectedDate, selectedTime }: TimeSlotPickerProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate time slots for a given date
  const generateTimeSlots = (selectedDate: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
    
    // Different hours for weekdays vs weekends
    const startHour = isWeekend ? 10 : 9;
    const endHour = isWeekend ? 16 : 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is in the past
        let available = true;
        if (isToday) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);
          available = slotTime > now;
        }
        
        // Simulate some booked slots (in real app, this would come from API)
        const randomlyBooked = Math.random() > 0.7;
        if (randomlyBooked) available = false;
        
        slots.push({
          time: timeString,
          available
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    if (date) {
      const slots = generateTimeSlots(date);
      setTimeSlots(slots);
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (date && time) {
      onTimeSelect(date, time);
    }
  };

  // Disable past dates and dates too far in the future
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60); // 60 days in advance
    
    return date < today || date > maxDate;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Select a Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Times for {date.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className="w-full"
                  >
                    {slot.time}
                    {!slot.available && selectedTime !== slot.time && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Booked
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No available slots for this date
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {date && selectedTime && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-green-800 mb-2">
                Selected Appointment
              </h3>
              <p className="text-green-700">
                {date.toLocaleDateString()} at {selectedTime}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}