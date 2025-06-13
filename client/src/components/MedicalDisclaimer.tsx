import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MedicalDisclaimerProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  title?: string;
  type?: "coaching" | "weight-loss" | "general";
}

export default function MedicalDisclaimer({ 
  isOpen, 
  onAccept, 
  onDecline, 
  title = "Medical Disclaimer",
  type = "general" 
}: MedicalDisclaimerProps) {
  const [hasRead, setHasRead] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const getDisclaimerContent = () => {
    if (type === "weight-loss") {
      return {
        title: "MEDICAL DISCLAIMER - Weight Loss Program",
        content: `
IMPORTANT: PLEASE READ CAREFULLY

By using the Wholewellness Coaching AI Self-Service Weight Loss Program Custom GPT, ("the App"), you acknowledge and agree to the following:

The information and guidance provided through Wholewellness Coaching's AI Self-Service App meal plan suggestions are for general informational and educational purposes only. This service is not intended to be a substitute for professional medical advice, diagnosis, or treatment.

NOT MEDICAL ADVICE
Wholewellness Coaching and its representatives are not licensed physicians, dietitians, or healthcare providers. The recommendations, strategies, meal plans, or other dietary guidance provided in this App should not be construed as medical advice.

CONSULT YOUR HEALTHCARE PROVIDER
Before beginning any meal plan, diet, or nutritional change, you should consult with your physician or other qualified healthcare provider, particularly if you have any pre-existing health conditions, are taking medications, are pregnant or nursing, have food allergies, or have any special dietary needs.

INDIVIDUAL RESULTS MAY VARY
Results from following these meal plan suggestions will vary from person to person. No specific outcome or result is guaranteed, and individual results depend on numerous factors including but not limited to your individual health status, genetics, metabolism, adherence to the suggestions, and other lifestyle factors.

ASSUMPTION OF RISK
Participation in any dietary change carries inherent risks. By using the Wholewellness Coaching AI Self-Service App, you acknowledge these risks and agree to assume full responsibility for your health and well-being.

RELEASE OF LIABILITY
By using the Wholewellness Coaching AI Self-Service App, you release Wholewellness Coaching, its owners, employees, contractors, and agents from any liability, injury, loss, or damage that may occur as a result of your use of the App's meal plan suggestions.

ACKNOWLEDGMENT
By continuing to use this App, you acknowledge that you have read, understood, and agree to this disclaimer. You confirm that you will consult with your healthcare provider before beginning any meal plan suggested by this App and will continue to follow the advice of qualified medical professionals regarding your health.
        `
      };
    }

    return {
      title: "MEDICAL DISCLAIMER - Coaching Services",
      content: `
IMPORTANT: PLEASE READ CAREFULLY

The Services Do Not Include Medical Care
Whole Wellness Coaching is designed to be a guided self-help program that, in some cases, may include individualized support and feedback from a wellness coach. The Services do not include the provision of medical care, mental health services, or other professional healthcare services.

NOT FOR EMERGENCIES
USE OF THE SERVICES IS NOT FOR EMERGENCIES. IF YOU THINK YOU HAVE A MEDICAL OR MENTAL HEALTH EMERGENCY, CALL 911 OR GO TO THE NEAREST OPEN CLINIC OR EMERGENCY ROOM.

IF YOU ARE CONSIDERING OR COMMITTING SUICIDE OR FEEL THAT YOU ARE A DANGER TO YOURSELF OR TO OTHERS, YOU MUST DISCONTINUE USE OF THE SERVICES IMMEDIATELY, CALL 911, OR NOTIFY APPROPRIATE POLICE OR EMERGENCY MEDICAL PERSONNEL.

NOT MEDICAL ADVICE
The Services cannot and are not intended to provide medical advice. Whole Wellness Coaching provides educational and informative content but does not replace professional consultation, advice, or treatment from a healthcare provider.

CONSULT YOUR HEALTHCARE PROVIDER
IF YOU REQUIRE MENTAL HEALTH THERAPY SERVICES, YOU SHOULD CONTACT A QUALIFIED HEALTHCARE PROFESSIONAL IN YOUR AREA. Before beginning any coaching program, you should consult with your physician or other qualified healthcare provider, particularly if you have any pre-existing health conditions or are taking medications.

INDIVIDUAL RESULTS MAY VARY
Results from coaching services will vary from person to person. No specific outcome or result is guaranteed, and individual results depend on numerous factors including but not limited to your individual circumstances, commitment to the program, and other lifestyle factors.

ASSUMPTION OF RISK
Participation in coaching services carries inherent risks. By using our Services, you acknowledge these risks and agree to assume full responsibility for your health and well-being.

RELEASE OF LIABILITY
By using our Services, you release Wholewellness Coaching, its owners, employees, contractors, and agents from any liability, injury, loss, or damage that may occur as a result of your use of our coaching services.

ACKNOWLEDGMENT
By continuing to use our Services, you acknowledge that you have read, understood, and agree to this disclaimer. You confirm that you will consult with your healthcare provider as appropriate and will continue to follow the advice of qualified medical professionals regarding your health.
      `
    };
  };

  const disclaimer = getDisclaimerContent();

  const handleScrollEnd = () => {
    setHasRead(true);
  };

  const canProceed = hasRead && acknowledged;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {disclaimer.title}
          </DialogTitle>
          <DialogDescription>
            Please read the following disclaimer carefully before proceeding with our services.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-600">
              <Shield className="h-4 w-4" />
              <CardTitle className="text-sm">Required Reading</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Scroll to the bottom to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea 
              className="h-64 w-full rounded border p-4"
              onScroll={(e) => {
                const target = e.currentTarget;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
                  handleScrollEnd();
                }
              }}
            >
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {disclaimer.content}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="acknowledgment" 
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
              disabled={!hasRead}
            />
            <label 
              htmlFor="acknowledgment" 
              className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                !hasRead ? 'text-gray-400' : 'text-gray-900'
              }`}
            >
              I have read, understood, and agree to the medical disclaimer above. 
              I acknowledge that I will consult with my healthcare provider as appropriate.
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onDecline}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              I Do Not Agree
            </Button>
            <Button 
              onClick={onAccept}
              disabled={!canProceed}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              I Agree & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}