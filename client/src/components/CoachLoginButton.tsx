import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap } from "lucide-react";
import AuthForm from "@/components/AuthForm";

export default function CoachLoginButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full p-4 h-auto"
            size="lg"
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Coach Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-center text-xl font-semibold mb-4">
            Coach Portal Access
          </DialogTitle>
          <div className="mb-4 text-center text-sm text-gray-600">
            Sign in to access your coaching dashboard, certification courses, and client management tools.
          </div>
          <AuthForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}