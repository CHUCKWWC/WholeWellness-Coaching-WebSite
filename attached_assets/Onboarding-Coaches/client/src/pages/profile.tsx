import CoachProfile from "@/components/coach-profile";
import ResourceLibrary from "@/components/resource-library";
import VideoLibrary from "@/components/video-library";
import WixBooking from "@/components/wix-booking";

export default function Profile() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Coach Profile</h1>
        <p className="text-gray-600 mt-2">Manage your professional profile and resources.</p>
      </div>

      <div className="space-y-8">
        <CoachProfile />
        <div className="grid lg:grid-cols-2 gap-8">
          <ResourceLibrary />
          <VideoLibrary />
        </div>
        <WixBooking />
      </div>
    </main>
  );
}
