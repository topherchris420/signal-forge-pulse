import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Sparkles, RefreshCw, CheckCircle, Timer, Target } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface Alert {
  id: string
  alert_type: string
  severity: string
  title: string
  description: string
  interpretive_analysis: string
  recommended_actions: any
  is_resolved: boolean
  created_at: string
}

interface Intervention {
  id: string
  intervention_type: string
  content: any
  implementation_status: string
  effectiveness_score: number | null
  created_at: string
}

export function NarrativeStabilizationToolkit({ organizationId, unitId }: { organizationId: string, unitId?: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAlerts()
    loadInterventions()
  }, [organizationId, unitId])

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('symbolic_alerts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('unit_id', unitId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
      if (data && data.length > 0 && !selectedAlert) {
        setSelectedAlert(data[0])
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadInterventions = async () => {
    if (!selectedAlert) return
    
    try {
      const { data, error } = await supabase
        .from('stabilization_interventions')
        .select('*')
        .eq('alert_id', selectedAlert.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInterventions(data || [])
    } catch (error) {
      console.error('Error loading interventions:', error)
    }
  }

  useEffect(() => {
    if (selectedAlert) {
      loadInterventions()
    }
  }, [selectedAlert])

  const generateInterventions = async () => {
    if (!selectedAlert) return
    
    setIsGenerating(true)
    try {
      const response = await fetch(`/functions/v1/stabilization-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          alertId: selectedAlert.id,
          action: 'generate_interventions',
          organizationId,
          unitId
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      toast({
        title: "Interventions Generated",
        description: "Narrative stabilization interventions have been created"
      })

      loadInterventions()
    } catch (error) {
      console.error('Error generating interventions:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate interventions",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const markImplemented = async (interventionId: string) => {
    try {
      const response = await fetch(`/functions/v1/stabilization-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          alertId: selectedAlert?.id,
          action: 'mark_implemented',
          interventionId
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      toast({
        title: "Marked as Implemented",
        description: "Intervention marked as implemented"
      })

      loadInterventions()
    } catch (error) {
      console.error('Error marking implemented:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update intervention status",
        variant: "destructive"
      })
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('symbolic_alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      toast({
        title: "Alert Resolved",
        description: "Alert marked as resolved"
      })

      loadAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast({
        title: "Resolution Failed",
        description: "Failed to resolve alert",
        variant: "destructive"
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'implemented': return 'secondary'
      case 'suggested': return 'outline'
      default: return 'outline'
    }
  }

  const renderInterventionContent = (intervention: Intervention) => {
    try {
      const content = typeof intervention.content === 'string' 
        ? JSON.parse(intervention.content) 
        : intervention.content

      switch (intervention.intervention_type) {
        case 'prompt':
          return (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{content.title}</h4>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Recommended Actions:</h5>
                <ul className="space-y-2">
                  {content.actions?.map((action: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Timeframe:</span>
                  <p className="text-muted-foreground">{content.timeframe}</p>
                </div>
                <div>
                  <span className="font-medium">Success Indicators:</span>
                  <ul className="text-muted-foreground">
                    {content.success_indicators?.map((indicator: string, index: number) => (
                      <li key={index}>• {indicator}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
          
        case 'ritual':
          return (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{content.name}</h4>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Process:</h5>
                <ol className="space-y-2">
                  {content.process?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="bg-muted p-3 rounded">
                <h5 className="font-medium">Facilitator Notes:</h5>
                <p className="text-sm text-muted-foreground">{content.facilitator_notes}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span>
                  <p className="text-muted-foreground">{content.duration}</p>
                </div>
                <div>
                  <span className="font-medium">Frequency:</span>
                  <p className="text-muted-foreground">{content.frequency}</p>
                </div>
              </div>
            </div>
          )
          
        default:
          return <p>Unknown intervention type</p>
      }
    } catch (error) {
      return <p>Error displaying intervention content</p>
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading stabilization toolkit...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Narrative Stabilization Toolkit
              </CardTitle>
              <CardDescription>
                Resonance repair prompts, alignment rituals, and symbolic stabilization interventions
              </CardDescription>
            </div>
            {selectedAlert && (
              <Button 
                onClick={generateInterventions}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Generate Interventions
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              Select an alert to view stabilization options
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No active alerts. System is stable.
                </p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAlert?.id === alert.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Intervention Details */}
        <Card className="lg:col-span-2">
          {selectedAlert ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedAlert.title}</CardTitle>
                    <CardDescription>
                      {selectedAlert.alert_type.replace('_', ' ')} • {selectedAlert.severity} severity
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => resolveAlert(selectedAlert.id)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="interventions">Interventions</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Interpretive Analysis</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedAlert.interpretive_analysis}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Immediate Actions Recommended</h4>
                      <ul className="space-y-1">
                        {selectedAlert.recommended_actions?.immediate?.map((action: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <Target className="w-3 h-3 mt-1 text-primary" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interventions" className="space-y-4">
                    {interventions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No interventions generated yet
                        </p>
                        <Button onClick={generateInterventions} disabled={isGenerating}>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Generate Interventions
                        </Button>
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {interventions.map((intervention, index) => (
                          <AccordionItem key={intervention.id} value={`intervention-${index}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-3">
                                <Badge variant={getStatusColor(intervention.implementation_status) as any}>
                                  {intervention.implementation_status}
                                </Badge>
                                <span className="capitalize">
                                  {intervention.intervention_type} Intervention
                                </span>
                                {intervention.effectiveness_score && (
                                  <span className="text-xs text-muted-foreground">
                                    {(intervention.effectiveness_score * 100).toFixed(0)}% effective
                                  </span>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                {renderInterventionContent(intervention)}
                                
                                {intervention.implementation_status === 'suggested' && (
                                  <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                      onClick={() => markImplemented(intervention.id)}
                                      size="sm"
                                    >
                                      Mark as Implemented
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="progress" className="space-y-4">
                    <div className="space-y-3">
                      {interventions.map((intervention) => (
                        <div
                          key={intervention.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex items-center gap-3">
                            {intervention.implementation_status === 'completed' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {intervention.implementation_status === 'implemented' && (
                              <Timer className="w-4 h-4 text-blue-500" />
                            )}
                            {intervention.implementation_status === 'suggested' && (
                              <Lightbulb className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="capitalize text-sm">
                              {intervention.intervention_type}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <Badge variant={getStatusColor(intervention.implementation_status) as any}>
                              {intervention.implementation_status}
                            </Badge>
                            {intervention.effectiveness_score && (
                              <div className="text-xs text-muted-foreground">
                                {(intervention.effectiveness_score * 100).toFixed(0)}% effective
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent>
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select an alert to view stabilization interventions
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}