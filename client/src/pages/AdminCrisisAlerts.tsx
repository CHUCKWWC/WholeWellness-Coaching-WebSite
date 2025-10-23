import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Shield,
  Phone,
  Mail,
  ArrowUpCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type CrisisAlert = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  coachType: string;
  triggerMessage: string;
  severityLevel: "low" | "medium" | "high" | "critical";
  detectedKeywords: string[];
  aiAssessment: string;
  status: "new" | "acknowledged" | "escalated" | "resolved";
  escalatedTo?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
};

const SEVERITY_CONFIG = {
  low: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Low", icon: Clock },
  medium: { color: "bg-orange-100 text-orange-800 border-orange-300", label: "Medium", icon: AlertTriangle },
  high: { color: "bg-red-100 text-red-800 border-red-300", label: "High", icon: ArrowUpCircle },
  critical: { color: "bg-red-600 text-white border-red-700", label: "Critical", icon: Shield },
};

const STATUS_CONFIG = {
  new: { color: "bg-blue-100 text-blue-800", label: "New" },
  acknowledged: { color: "bg-purple-100 text-purple-800", label: "Acknowledged" },
  escalated: { color: "bg-orange-100 text-orange-800", label: "Escalated" },
  resolved: { color: "bg-green-100 text-green-800", label: "Resolved" },
};

export default function AdminCrisisAlerts() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);
  const [resolution, setResolution] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch crisis alerts
  const { data: alerts = [], isLoading } = useQuery<CrisisAlert[]>({
    queryKey: ['/api/digest/crisis-alerts', statusFilter],
  });

  // Update alert status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, resolution }: { id: string; status: string; resolution?: string }) => {
      return apiRequest('PUT', '/api/digest/crisis-alerts/update', {
        id,
        status,
        resolution,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/digest/crisis-alerts'] });
      toast({
        title: "Alert updated",
        description: "Crisis alert status has been updated successfully.",
      });
      setSelectedAlert(null);
      setResolution("");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating alert",
        description: error.message || "Failed to update alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResolve = () => {
    if (!selectedAlert || !resolution.trim()) {
      toast({
        title: "Resolution required",
        description: "Please provide resolution details before resolving the alert.",
        variant: "destructive",
      });
      return;
    }

    updateStatus.mutate({
      id: selectedAlert.id,
      status: "resolved",
      resolution: resolution.trim(),
    });
  };

  const handleAcknowledge = (alert: CrisisAlert) => {
    updateStatus.mutate({
      id: alert.id,
      status: "acknowledged",
    });
  };

  const handleEscalate = (alert: CrisisAlert) => {
    updateStatus.mutate({
      id: alert.id,
      status: "escalated",
    });
  };

  const filteredAlerts = statusFilter === "all" 
    ? alerts 
    : alerts.filter(a => a.status === statusFilter);

  const criticalCount = alerts.filter(a => a.severityLevel === "critical" && a.status !== "resolved").length;
  const newCount = alerts.filter(a => a.status === "new").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6" data-testid="crisis-alerts-dashboard">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Crisis Alerts Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor and respond to mental health crisis alerts</p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            {criticalCount > 0 && (
              <Badge className="bg-red-600 text-white text-xs sm:text-sm" data-testid="badge-critical-count">
                {criticalCount} Critical
              </Badge>
            )}
            {newCount > 0 && (
              <Badge className="bg-blue-600 text-white text-xs sm:text-sm" data-testid="badge-new-count">
                {newCount} New
              </Badge>
            )}
          </div>
        </div>

        {/* Emergency Resources Card */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-red-800 dark:text-red-200">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              Emergency Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <strong>988 Suicide & Crisis Lifeline:</strong> Call/Text 988
            </div>
            <div>
              <strong>Crisis Text Line:</strong> Text HOME to 741741
            </div>
            <div>
              <strong>National Domestic Violence Hotline:</strong> 1-800-799-7233
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-1 sm:gap-2 flex-wrap overflow-x-auto pb-2" data-testid="status-filters">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm" : "text-xs sm:text-sm"}
            data-testid="filter-all"
          >
            All ({alerts.length})
          </Button>
          <Button
            variant={statusFilter === "new" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setStatusFilter("new")}
            className={statusFilter === "new" ? "bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm" : "text-xs sm:text-sm"}
            data-testid="filter-new"
          >
            New ({alerts.filter(a => a.status === "new").length})
          </Button>
          <Button
            variant={statusFilter === "acknowledged" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setStatusFilter("acknowledged")}
            className={statusFilter === "acknowledged" ? "bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm" : "text-xs sm:text-sm"}
            data-testid="filter-acknowledged"
          >
            Acknowledged ({alerts.filter(a => a.status === "acknowledged").length})
          </Button>
          <Button
            variant={statusFilter === "escalated" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setStatusFilter("escalated")}
            className={statusFilter === "escalated" ? "bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm" : "text-xs sm:text-sm"}
            data-testid="filter-escalated"
          >
            Escalated ({alerts.filter(a => a.status === "escalated").length})
          </Button>
          <Button
            variant={statusFilter === "resolved" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => setStatusFilter("resolved")}
            className={statusFilter === "resolved" ? "bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm" : "text-xs sm:text-sm"}
            data-testid="filter-resolved"
          >
            Resolved ({alerts.filter(a => a.status === "resolved").length})
          </Button>
        </div>

        {/* Alerts Display - Cards on Mobile, Table on Desktop */}
        {isMobile ? (
          /* Mobile Card View */
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No crisis alerts found
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => {
                const severityConfig = SEVERITY_CONFIG[alert.severityLevel];
                const statusConfig = STATUS_CONFIG[alert.status];
                const SeverityIcon = severityConfig.icon;

                return (
                  <Card key={alert.id} data-testid={`alert-card-${alert.id}`} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <Badge className={`${severityConfig.color} flex items-center gap-1 w-fit text-xs`}>
                          <SeverityIcon className="h-3 w-3" />
                          {severityConfig.label}
                        </Badge>
                        <Badge className={`${statusConfig.color} text-xs`}>{statusConfig.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{alert.userName || "Unknown User"}</div>
                          {alert.userEmail && (
                            <div className="text-xs text-muted-foreground">{alert.userEmail}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coach: <span className="capitalize">{alert.coachType}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(alert?.detectedKeywords ?? []).slice(0, 3).map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {(alert?.detectedKeywords ?? []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(alert?.detectedKeywords ?? []).length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedAlert(alert)}
                        data-testid={`button-view-${alert.id}`}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No crisis alerts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlerts.map((alert) => {
                      const severityConfig = SEVERITY_CONFIG[alert.severityLevel];
                      const statusConfig = STATUS_CONFIG[alert.status];
                      const SeverityIcon = severityConfig.icon;

                      return (
                        <TableRow key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-800" data-testid={`alert-row-${alert.id}`}>
                          <TableCell>
                            <Badge className={`${severityConfig.color} flex items-center gap-1 w-fit`}>
                              <SeverityIcon className="h-3 w-3" />
                              {severityConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{alert.userName || "Unknown User"}</div>
                                {alert.userEmail && (
                                  <div className="text-xs text-muted-foreground">{alert.userEmail}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{alert.coachType}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(alert?.detectedKeywords ?? []).slice(0, 3).map((keyword, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {(alert?.detectedKeywords ?? []).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(alert?.detectedKeywords ?? []).length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAlert(alert)}
                              data-testid={`button-view-${alert.id}`}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Alert Details Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full" data-testid="dialog-alert-details">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Crisis Alert Details
              </DialogTitle>
              <DialogDescription>
                Review and manage this crisis alert
              </DialogDescription>
            </DialogHeader>

            {selectedAlert && (
              <div className="space-y-4">
                {/* Severity & Status */}
                <div className="flex gap-4">
                  <Badge className={SEVERITY_CONFIG[selectedAlert.severityLevel].color}>
                    {SEVERITY_CONFIG[selectedAlert.severityLevel].label} Severity
                  </Badge>
                  <Badge className={STATUS_CONFIG[selectedAlert.status].color}>
                    {STATUS_CONFIG[selectedAlert.status].label}
                  </Badge>
                </div>

                {/* User Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{selectedAlert.userName || "Unknown User"}</span>
                    </div>
                    {selectedAlert.userEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedAlert.userEmail}</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Coach: <span className="capitalize">{selectedAlert.coachType}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trigger Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Trigger Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      {selectedAlert.triggerMessage}
                    </p>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detected Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.detectedKeywords.map((keyword, i) => (
                        <Badge key={i} variant="destructive">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assessment */}
                {selectedAlert.aiAssessment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedAlert.aiAssessment}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Resolution (for resolved alerts) */}
                {selectedAlert.status === "resolved" && selectedAlert.resolution && (
                  <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-green-800 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        Resolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedAlert.resolution}</p>
                      {selectedAlert.resolvedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Resolved: {format(new Date(selectedAlert.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Resolution Form (for active alerts) */}
                {selectedAlert.status !== "resolved" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Add Resolution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Describe the actions taken and outcome..."
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={4}
                        data-testid="textarea-resolution"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter className="flex gap-2 flex-wrap">
              {selectedAlert?.status === "new" && (
                <Button
                  variant="outline"
                  onClick={() => handleAcknowledge(selectedAlert)}
                  disabled={updateStatus.isPending}
                  data-testid="button-acknowledge"
                >
                  Acknowledge
                </Button>
              )}
              {selectedAlert?.status !== "escalated" && selectedAlert?.status !== "resolved" && (
                <Button
                  variant="outline"
                  onClick={() => selectedAlert && handleEscalate(selectedAlert)}
                  disabled={updateStatus.isPending}
                  data-testid="button-escalate"
                >
                  Escalate
                </Button>
              )}
              {selectedAlert?.status !== "resolved" && (
                <Button
                  onClick={handleResolve}
                  disabled={updateStatus.isPending || !resolution.trim()}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-resolve"
                >
                  {updateStatus.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
