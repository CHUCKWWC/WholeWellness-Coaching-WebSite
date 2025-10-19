import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'session' | 'availability' | 'blocked';
  status?: string;
}

interface CoachCalendarProps {
  bookings?: any[];
  availability?: AvailabilitySlot[];
  onAddAvailability?: (slot: AvailabilitySlot) => void;
  onRemoveAvailability?: (id: string) => void;
}

export default function CoachCalendar({ 
  bookings = [], 
  availability = [],
  onAddAvailability,
  onRemoveAvailability 
}: CoachCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: true
  });

  // Get month data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Get events for a specific date
  const getEventsForDate = (day: number): CalendarEvent[] => {
    const date = new Date(year, month, day);
    const events: CalendarEvent[] = [];

    // Add bookings as events
    bookings.forEach(booking => {
      if (booking.scheduledDate) {
        const bookingDate = new Date(booking.scheduledDate);
        if (
          bookingDate.getDate() === day &&
          bookingDate.getMonth() === month &&
          bookingDate.getFullYear() === year
        ) {
          events.push({
            id: booking.id.toString(),
            title: booking.fullName,
            date: bookingDate,
            time: bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            type: 'session',
            status: booking.status
          });
        }
      }
    });

    // Add availability slots
    const dayOfWeek = date.getDay();
    availability.forEach(slot => {
      if (slot.dayOfWeek === dayOfWeek && slot.isRecurring) {
        events.push({
          id: slot.id,
          title: 'Available',
          date,
          time: `${slot.startTime} - ${slot.endTime}`,
          type: 'availability'
        });
      }
    });

    return events;
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const handleAddAvailability = () => {
    if (onAddAvailability) {
      onAddAvailability({
        id: Date.now().toString(),
        ...newSlot
      });
    }
    setShowAddAvailability(false);
    setNewSlot({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: true
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Coach Calendar
            </CardTitle>
            <CardDescription>Manage your availability and view scheduled sessions</CardDescription>
          </div>
          <Dialog open={showAddAvailability} onOpenChange={setShowAddAvailability}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-availability">
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability Slot</DialogTitle>
                <DialogDescription>Set your recurring weekly availability</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="day-of-week">Day of Week</Label>
                  <Select 
                    value={newSlot.dayOfWeek.toString()} 
                    onValueChange={(value) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(value) })}
                  >
                    <SelectTrigger id="day-of-week">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fullDayNames.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddAvailability} className="w-full">
                  Add Availability
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={previousMonth} data-testid="button-previous-month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[month]} {year}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth} data-testid="button-next-month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day names */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="p-2 min-h-24" />;
            }

            const events = getEventsForDate(day);
            const hasEvents = events.length > 0;

            return (
              <div
                key={day}
                className={`
                  p-2 min-h-24 border rounded-lg cursor-pointer transition-all
                  ${isToday(day) 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                  ${selectedDate?.getDate() === day && selectedDate?.getMonth() === month 
                    ? 'ring-2 ring-blue-500' 
                    : ''
                  }
                `}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                data-testid={`calendar-day-${day}`}
              >
                <div className="font-medium text-sm mb-1">{day}</div>
                <div className="space-y-1">
                  {events.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`
                        text-xs p-1 rounded truncate
                        ${event.type === 'session' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }
                      `}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold mb-3">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <div className="space-y-2">
              {getEventsForDate(selectedDate.getDate()).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.time}</p>
                    </div>
                  </div>
                  <Badge variant={event.type === 'session' ? 'default' : 'outline'}>
                    {event.type}
                  </Badge>
                </div>
              ))}
              {getEventsForDate(selectedDate.getDate()).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No events scheduled for this day
                </p>
              )}
            </div>
          </div>
        )}

        {/* Weekly Availability Summary */}
        {availability.length > 0 && (
          <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold mb-3">Weekly Availability</h4>
            <div className="space-y-2">
              {availability.map(slot => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{fullDayNames[slot.dayOfWeek]}</p>
                      <p className="text-xs text-gray-500">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  </div>
                  {onRemoveAvailability && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveAvailability(slot.id)}
                      data-testid={`button-remove-availability-${slot.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
