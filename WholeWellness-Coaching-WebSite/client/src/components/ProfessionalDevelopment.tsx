import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  GraduationCap, 
  Calendar as CalendarIcon, 
  Clock, 
  Award, 
  BookOpen, 
  Users, 
  Target, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface CECredit {
  id: string;
  title: string;
  provider: string;
  category: 'ethics' | 'clinical_skills' | 'trauma_informed' | 'group_therapy' | 'crisis_intervention' | 'supervision' | 'other';
  creditsEarned: number;
  completionDate: Date;
  expirationDate?: Date;
  certificateUrl?: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending_verification';
  verificationCode?: string;
}

interface ProfessionalCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  certificationNumber: string;
  issueDate: Date;
  expirationDate: Date;
  renewalRequiredCredits: number;
  currentPeriodCredits: number;
  status: 'active' | 'expired' | 'pending_renewal';
  category: 'license' | 'certification' | 'specialty';
  renewalUrl?: string;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetCompletionDate: Date;
  requiredCredits: number;
  earnedCredits: number;
  status: 'not_started' | 'in_progress' | 'completed';
  milestones: LearningMilestone[];
}

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completionDate?: Date;
}

interface PeerCollaboration {
  id: string;
  type: 'mentorship' | 'peer_consultation' | 'case_study' | 'supervision';
  title: string;
  description: string;
  participants: string[];
  scheduledDate: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  outcomes?: string;
  creditsAwarded?: number;
}

interface ProfessionalDevelopmentProps {
  coachId: number;
}

export default function ProfessionalDevelopment({ coachId }: ProfessionalDevelopmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: ceCredits = [], isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/coach/ce-credits', coachId],
    enabled: !!coachId,
  });

  const { data: certifications = [], isLoading: certificationsLoading } = useQuery({
    queryKey: ['/api/coach/certifications', coachId],
    enabled: !!coachId,
  });

  const { data: learningGoals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/coach/learning-goals', coachId],
    enabled: !!coachId,
  });

  const { data: collaborations = [], isLoading: collaborationsLoading } = useQuery({
    queryKey: ['/api/coach/peer-collaborations', coachId],
    enabled: !!coachId,
  });

  const addCreditMutation = useMutation({
    mutationFn: (creditData: Partial<CECredit>) =>
      apiRequest('POST', '/api/coach/ce-credits', creditData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/ce-credits'] });
      toast({
        title: "CE Credit Added",
        description: "Continuing education credit has been recorded successfully.",
      });
    },
  });

  const addCertificationMutation = useMutation({
    mutationFn: (certData: Partial<ProfessionalCertification>) =>
      apiRequest('POST', '/api/coach/certifications', certData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/certifications'] });
      toast({
        title: "Certification Added",
        description: "Professional certification has been recorded successfully.",
      });
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: (goalData: Partial<LearningGoal>) =>
      apiRequest('POST', '/api/coach/learning-goals', goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/learning-goals'] });
      toast({
        title: "Learning Goal Created",
        description: "New learning goal has been set successfully.",
      });
    },
  });

  const OverviewPanel = () => {
    const totalCredits = ceCredits.reduce((sum: number, credit: CECredit) => sum + credit.creditsEarned, 0);
    const activeCertifications = certifications.filter((cert: ProfessionalCertification) => cert.status === 'active');
    const expiringCertifications = certifications.filter((cert: ProfessionalCertification) => {
      const expirationDate = new Date(cert.expirationDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expirationDate <= threeMonthsFromNow && cert.status === 'active';
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalCredits}</div>
                  <div className="text-sm text-gray-600">Total CE Credits</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{activeCertifications.length}</div>
                  <div className="text-sm text-gray-600">Active Certifications</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{learningGoals.filter((g: LearningGoal) => g.status === 'in_progress').length}</div>
                  <div className="text-sm text-gray-600">Active Goals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{collaborations.filter((c: PeerCollaboration) => c.status === 'completed').length}</div>
                  <div className="text-sm text-gray-600">Collaborations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {expiringCertifications.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Renewal Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringCertifications.map((cert: ProfessionalCertification) => (
                  <div key={cert.id} className="bg-white rounded p-3 border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{cert.name}</h4>
                        <div className="text-sm text-gray-600">
                          Expires: {format(new Date(cert.expirationDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm">
                          Credits needed: {cert.renewalRequiredCredits - cert.currentPeriodCredits}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {Math.ceil((new Date(cert.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ceCredits.slice(0, 5).map((credit: CECredit) => (
                <div key={credit.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{credit.title}</h4>
                    <div className="text-sm text-gray-600">{credit.provider}</div>
                  </div>
                  <div className="text-right">
                    <Badge>{credit.creditsEarned} credits</Badge>
                    <div className="text-sm text-gray-600">
                      {format(new Date(credit.completionDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const CECreditsPanel = () => {
    const [newCreditDialog, setNewCreditDialog] = useState(false);
    const [creditForm, setCreditForm] = useState({
      title: '',
      provider: '',
      category: 'clinical_skills',
      creditsEarned: 0,
      completionDate: '',
      expirationDate: '',
      description: '',
      verificationCode: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addCreditMutation.mutate({
        ...creditForm,
        coachId,
        completionDate: new Date(creditForm.completionDate),
        expirationDate: creditForm.expirationDate ? new Date(creditForm.expirationDate) : undefined,
        status: 'completed',
      });
      setNewCreditDialog(false);
      setCreditForm({
        title: '',
        provider: '',
        category: 'clinical_skills',
        creditsEarned: 0,
        completionDate: '',
        expirationDate: '',
        description: '',
        verificationCode: '',
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Continuing Education Credits</h3>
          <Dialog open={newCreditDialog} onOpenChange={setNewCreditDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add CE Credit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Continuing Education Credit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course/Training Title</Label>
                    <Input
                      id="title"
                      value={creditForm.title}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider/Institution</Label>
                    <Input
                      id="provider"
                      value={creditForm.provider}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, provider: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={creditForm.category}
                      onValueChange={(value) => setCreditForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethics">Ethics</SelectItem>
                        <SelectItem value="clinical_skills">Clinical Skills</SelectItem>
                        <SelectItem value="trauma_informed">Trauma-Informed Care</SelectItem>
                        <SelectItem value="group_therapy">Group Therapy</SelectItem>
                        <SelectItem value="crisis_intervention">Crisis Intervention</SelectItem>
                        <SelectItem value="supervision">Supervision</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="creditsEarned">Credits Earned</Label>
                    <Input
                      id="creditsEarned"
                      type="number"
                      min="0"
                      step="0.5"
                      value={creditForm.creditsEarned}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, creditsEarned: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="completionDate">Completion Date</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={creditForm.completionDate}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, completionDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={creditForm.expirationDate}
                      onChange={(e) => setCreditForm(prev => ({ ...prev, expirationDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={creditForm.description}
                    onChange={(e) => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the training content and key learnings..."
                  />
                </div>

                <div>
                  <Label htmlFor="verificationCode">Verification Code (Optional)</Label>
                  <Input
                    id="verificationCode"
                    value={creditForm.verificationCode}
                    onChange={(e) => setCreditForm(prev => ({ ...prev, verificationCode: e.target.value }))}
                    placeholder="Certificate or verification code"
                  />
                </div>

                <Button type="submit" disabled={addCreditMutation.isPending} className="w-full">
                  {addCreditMutation.isPending ? 'Adding...' : 'Add Credit'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {ceCredits.map((credit: CECredit) => (
            <Card key={credit.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{credit.title}</h4>
                      <Badge variant="outline">{credit.category.replace('_', ' ')}</Badge>
                      <Badge>{credit.creditsEarned} credits</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{credit.provider}</div>
                    <div className="text-sm">
                      Completed: {format(new Date(credit.completionDate), 'MMM dd, yyyy')}
                      {credit.expirationDate && (
                        <span className="ml-4">
                          Expires: {format(new Date(credit.expirationDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                    {credit.description && (
                      <p className="text-sm text-gray-700">{credit.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {credit.certificateUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Certificate
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const CertificationsPanel = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Professional Certifications</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
        </div>

        <div className="grid gap-4">
          {certifications.map((cert: ProfessionalCertification) => (
            <Card key={cert.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{cert.name}</h4>
                      <Badge variant={cert.status === 'active' ? 'default' : cert.status === 'expired' ? 'destructive' : 'secondary'}>
                        {cert.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{cert.category}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{cert.issuingOrganization}</div>
                    <div className="text-sm">
                      <span className="font-medium">Certificate #:</span> {cert.certificationNumber}
                    </div>
                    <div className="text-sm grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Issued:</span> {format(new Date(cert.issueDate), 'MMM dd, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span> {format(new Date(cert.expirationDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Renewal Progress</span>
                        <span>{cert.currentPeriodCredits}/{cert.renewalRequiredCredits} credits</span>
                      </div>
                      <Progress value={(cert.currentPeriodCredits / cert.renewalRequiredCredits) * 100} />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {cert.renewalUrl && (
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Renew
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const LearningGoalsPanel = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Learning Goals</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Set New Goal
          </Button>
        </div>

        <div className="grid gap-4">
          {learningGoals.map((goal: LearningGoal) => (
            <Card key={goal.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    <Badge variant={
                      goal.status === 'completed' ? 'default' :
                      goal.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {goal.category}
                    </div>
                    <div>
                      <span className="font-medium">Target Date:</span> {format(new Date(goal.targetCompletionDate), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.earnedCredits}/{goal.requiredCredits} credits</span>
                    </div>
                    <Progress value={(goal.earnedCredits / goal.requiredCredits) * 100} />
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Milestones</h5>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone: LearningMilestone) => (
                        <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                          {milestone.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-full" />
                          )}
                          <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                            {milestone.title}
                          </span>
                          <span className="text-gray-500">
                            ({format(new Date(milestone.targetDate), 'MMM dd')})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (creditsLoading || certificationsLoading || goalsLoading || collaborationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Professional Development</h2>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credits">CE Credits</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewPanel />
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <CECreditsPanel />
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <CertificationsPanel />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <LearningGoalsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}