import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Brain, Target, Users, Calendar, MessageSquare, Shield, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface RiskPrediction {
  clientId: string;
  clientName: string;
  currentRiskLevel: 'low' | 'medium' | 'high' | 'crisis';
  predictedRiskLevel: 'low' | 'medium' | 'high' | 'crisis';
  riskFactors: string[];
  confidenceScore: number;
  timeframe: string;
  recommendations: string[];
  lastAssessment: Date;
}

interface CoachingRecommendation {
  id: string;
  type: 'session_frequency' | 'intervention_type' | 'group_placement' | 'resource_allocation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedOutcome: string;
  implementationSteps: string[];
  clientsAffected: number;
  successProbability: number;
}

interface PatternAnalysis {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  affectedClients: string[];
  suggestedActions: string[];
}

interface AIInsightsDashboardProps {
  coachId: number;
}

export default function AIInsightsDashboard({ coachId }: AIInsightsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const { data: riskPredictions = [], isLoading: riskLoading } = useQuery({
    queryKey: ['/api/ai/risk-predictions', coachId, selectedTimeframe],
    enabled: !!coachId,
  });

  const { data: coachingRecommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/ai/coaching-recommendations', coachId],
    enabled: !!coachId,
  });

  const { data: patternAnalysis = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['/api/ai/pattern-analysis', coachId, selectedTimeframe],
    enabled: !!coachId,
  });

  const { data: performanceInsights, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/ai/performance-insights', coachId],
    enabled: !!coachId,
  });

  const RiskPredictionPanel = () => {
    const highRiskPredictions = riskPredictions.filter((p: RiskPrediction) => 
      p.predictedRiskLevel === 'high' || p.predictedRiskLevel === 'crisis'
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Risk Predictions</h3>
          <div className="flex space-x-2">
            {['24h', '7d', '30d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        {highRiskPredictions.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                High-Risk Alerts ({highRiskPredictions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highRiskPredictions.map((prediction: RiskPrediction) => (
                  <div key={prediction.clientId} className="bg-white rounded p-3 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{prediction.clientName}</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <Badge variant="outline">{prediction.currentRiskLevel}</Badge>
                          <span>→</span>
                          <Badge variant={prediction.predictedRiskLevel === 'crisis' ? 'destructive' : 'secondary'}>
                            {prediction.predictedRiskLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{Math.round(prediction.confidenceScore * 100)}% confidence</div>
                        <div className="text-gray-600">{prediction.timeframe}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="mb-2">
                        <strong>Risk Factors:</strong> {prediction.riskFactors.join(', ')}
                      </div>
                      <div>
                        <strong>Recommendations:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {prediction.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {riskPredictions.filter((p: RiskPrediction) => 
            p.predictedRiskLevel !== 'high' && p.predictedRiskLevel !== 'crisis'
          ).map((prediction: RiskPrediction) => (
            <Card key={prediction.clientId}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{prediction.clientName}</h4>
                      <Badge variant="outline">{prediction.currentRiskLevel}</Badge>
                      {prediction.predictedRiskLevel !== prediction.currentRiskLevel && (
                        <>
                          <span>→</span>
                          <Badge variant={prediction.predictedRiskLevel === 'high' ? 'destructive' : 'default'}>
                            {prediction.predictedRiskLevel}
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Confidence: {Math.round(prediction.confidenceScore * 100)}% | Timeframe: {prediction.timeframe}
                    </div>
                    <div className="text-sm">
                      <strong>Key factors:</strong> {prediction.riskFactors.slice(0, 3).join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      Last assessed: {new Date(prediction.lastAssessment).toLocaleDateString()}
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

  const RecommendationsPanel = () => {
    const criticalRecommendations = coachingRecommendations.filter((r: CoachingRecommendation) => 
      r.priority === 'critical' || r.priority === 'high'
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Coaching Recommendations</h3>

        <div className="grid gap-4">
          {criticalRecommendations.map((rec: CoachingRecommendation) => (
            <Card key={rec.id} className={rec.priority === 'critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    {rec.title}
                  </CardTitle>
                  <Badge variant={rec.priority === 'critical' ? 'destructive' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">{rec.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Expected Outcome:</strong>
                      <p className="mt-1">{rec.expectedOutcome}</p>
                    </div>
                    <div>
                      <strong>Success Probability:</strong>
                      <div className="flex items-center mt-1">
                        <Progress value={rec.successProbability} className="flex-1 mr-2" />
                        <span>{rec.successProbability}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <strong>Implementation Steps:</strong>
                    <ol className="list-decimal list-inside ml-4 mt-1 text-sm">
                      {rec.implementationSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="text-sm text-gray-600">
                    Affects {rec.clientsAffected} client{rec.clientsAffected !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {coachingRecommendations.filter((r: CoachingRecommendation) => 
            r.priority === 'medium' || r.priority === 'low'
          ).map((rec: CoachingRecommendation) => (
            <Card key={rec.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge variant="outline">{rec.priority}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span>Success rate: {rec.successProbability}%</span>
                  <span>{rec.clientsAffected} clients affected</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const PatternAnalysisPanel = () => {
    const negativePatterns = patternAnalysis.filter((p: PatternAnalysis) => p.impact === 'negative');
    const positivePatterns = patternAnalysis.filter((p: PatternAnalysis) => p.impact === 'positive');

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Behavioral Pattern Analysis</h3>

        {negativePatterns.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-3 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Concerning Patterns
            </h4>
            <div className="space-y-3">
              {negativePatterns.map((pattern: PatternAnalysis, idx) => (
                <Card key={idx} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{pattern.pattern}</h5>
                      <Badge variant="destructive">{pattern.frequency}x detected</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                    <div className="text-sm mb-2">
                      <strong>Affected clients:</strong> {pattern.affectedClients.length}
                    </div>
                    <div className="text-sm">
                      <strong>Suggested actions:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {pattern.suggestedActions.map((action, actionIdx) => (
                          <li key={actionIdx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {positivePatterns.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Positive Patterns
            </h4>
            <div className="space-y-3">
              {positivePatterns.map((pattern: PatternAnalysis, idx) => (
                <Card key={idx} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{pattern.pattern}</h5>
                      <Badge variant="default">{pattern.frequency}x detected</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                    <div className="text-sm mb-2">
                      <strong>Benefiting clients:</strong> {pattern.affectedClients.length}
                    </div>
                    <div className="text-sm">
                      <strong>Replication strategies:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {pattern.suggestedActions.map((action, actionIdx) => (
                          <li key={actionIdx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PerformanceInsightsPanel = () => {
    if (!performanceInsights) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Performance Optimization</h3>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Goal Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current Rate</span>
                    <span>{performanceInsights.goalAchievementRate}%</span>
                  </div>
                  <Progress value={performanceInsights.goalAchievementRate} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Predicted Improvement</span>
                    <span>+{performanceInsights.predictedImprovement}%</span>
                  </div>
                  <Progress value={performanceInsights.goalAchievementRate + performanceInsights.predictedImprovement} />
                </div>
                <div className="text-sm">
                  <strong>Key factors:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {performanceInsights.improvementFactors?.map((factor: string, idx: number) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Client Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Engagement Score</span>
                    <span>{performanceInsights.engagementScore}/100</span>
                  </div>
                  <Progress value={performanceInsights.engagementScore} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Response Rate:</span>
                    <div>{performanceInsights.responseRate}%</div>
                  </div>
                  <div>
                    <span className="font-medium">Session Attendance:</span>
                    <div>{performanceInsights.attendanceRate}%</div>
                  </div>
                </div>
                <div className="text-sm">
                  <strong>Optimization tips:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {performanceInsights.engagementTips?.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI-Powered Scheduling Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{performanceInsights.optimalSessionLength}min</div>
                  <div className="text-sm text-gray-600">Optimal Session Length</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceInsights.idealFrequency}</div>
                  <div className="text-sm text-gray-600">Ideal Frequency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{performanceInsights.bestTimeSlot}</div>
                  <div className="text-sm text-gray-600">Best Time Slot</div>
                </div>
              </div>
              <div className="text-sm">
                <strong>Scheduling recommendations:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {performanceInsights.schedulingTips?.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (riskLoading || recommendationsLoading || patternsLoading || performanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          AI Insights Dashboard
        </h2>
        <Badge variant="outline" className="text-sm">
          Powered by Advanced Analytics
        </Badge>
      </div>

      <Tabs defaultValue="risk" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk">Risk Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="mt-6">
          <RiskPredictionPanel />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <RecommendationsPanel />
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <PatternAnalysisPanel />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceInsightsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}