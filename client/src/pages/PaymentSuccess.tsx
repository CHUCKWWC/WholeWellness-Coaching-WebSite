import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Mail } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccess() {
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Get booking details from localStorage
    const bookingData = localStorage.getItem('pendingBooking');
    if (bookingData) {
      setBookingDetails(JSON.parse(bookingData));
      // Clear the pending booking
      localStorage.removeItem('pendingBooking');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Thank you for your payment. Your coaching session has been booked successfully.
              </p>
            </div>

            {bookingDetails && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Booking Details</h3>
                <div className="space-y-2">
                  <p><strong>Service:</strong> {bookingDetails.serviceType?.charAt(0).toUpperCase() + bookingDetails.serviceType?.slice(1)} Coaching</p>
                  <p><strong>Date:</strong> {bookingDetails.selectedDate}</p>
                  <p><strong>Time:</strong> {bookingDetails.selectedTime}</p>
                  <p><strong>Client:</strong> {bookingDetails.name}</p>
                  <p><strong>Email:</strong> {bookingDetails.email}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• You'll receive a confirmation email with session details</li>
                <li>• A calendar invite will be sent with the meeting link</li>
                <li>• Our coach will contact you 24 hours before your session</li>
                <li>• Please check your email for any preparation materials</li>
              </ul>
            </div>

            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Need to Reschedule?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If you need to reschedule your session, please contact us at least 24 hours in advance.
              </p>
              <p className="text-sm">
                <strong>Email:</strong> support@wholewellnesscoaching.org<br />
                <strong>Phone:</strong> (210) 201-2422
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline">Browse Resources</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}