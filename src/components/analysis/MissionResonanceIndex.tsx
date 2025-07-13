import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Target, TrendingDown, AlertCircle, CheckCircle, Edit } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface ResonanceData {
  id: string
  resonance_score: number
  drift_indicators: string[]
  linguistic_distance: number
  measured_at: string
}

interface Organization {
  id: string
  name: string
  mission_statement: string
  vision_statement: string
}

export function MissionResonanceIndex({ organizationId, unitId }: { organizationId: string, unitId?: string }) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [resonanceData, setResonanceData] = useState<ResonanceData[]>([])
  const [currentResonance, setCurrentResonance] = useState<ResonanceData | null>(null)
  const [isEditingMission, setIsEditingMission] = useState(false)
  const [newMission, setNewMission] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadOrganizationData()
    loadResonanceData()
    
    const interval = setInterval(loadResonanceData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [organizationId, unitId])

  const loadOrganizationData = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (error) throw error
      setOrganization(data)
      setNewMission(data.mission_statement || '')
    } catch (error) {
      console.error('Error loading organization:', error)
    }
  }

  const loadResonanceData = async () => {
    try {
      const { data, error } = await supabase
        .from('mission_resonance')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('unit_id', unitId)
        .order('measured_at', { ascending: false })
        .limit(24) // Last 24 measurements

      if (error) throw error
      
      setResonanceData(data || [])
      setCurrentResonance(data?.[0] || null)
    } catch (error) {
      console.error('Error loading resonance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateMissionStatement = async () => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ mission_statement: newMission })
        .eq('id', organizationId)

      if (error) throw error

      setOrganization({ ...organization!, mission_statement: newMission })
      setIsEditingMission(false)
      
      toast({
        title: "Mission Updated",
        description: "Mission statement updated successfully. Resonance analysis will recalibrate."
      })
    } catch (error) {
      console.error('Error updating mission:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update mission statement",
        variant: "destructive"
      })
    }
  }

  const triggerResonanceAnalysis = async () => {
    try {
      const response = await fetch(`/functions/v1/linguistic-processor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          text: "Sample communication for immediate resonance analysis",
          organizationId,
          unitId,
          missionStatement: organization?.mission_statement,
          analysisType: 'resonance'
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      toast({
        title: "Analysis Complete",
        description: "Mission resonance analysis updated"
      })

      loadResonanceData()
    } catch (error) {
      console.error('Error triggering analysis:', error)
      toast({
        title: "Analysis Failed",
        description: "Failed to trigger resonance analysis",
        variant: "destructive"
      })
    }
  }

  const getResonanceLevel = (score: number): { level: string, color: string, description: string } => {
    if (score >= 0.8) return { 
      level: 'Excellent', 
      color: 'bg-green-500', 
      description: 'Strong alignment with organizational mission' 
    }
    if (score >= 0.6) return { 
      level: 'Good', 
      color: 'bg-blue-500', 
      description: 'Adequate mission resonance with minor drift' 
    }
    if (score >= 0.4) return { 
      level: 'Moderate', 
      color: 'bg-yellow-500', 
      description: 'Noticeable mission drift requiring attention' 
    }
    if (score >= 0.2) return { 
      level: 'Poor', 
      color: 'bg-orange-500', 
      description: 'Significant mission disconnection' 
    }
    return { 
      level: 'Critical', 
      color: 'bg-red-500', 
      description: 'Severe mission misalignment - immediate intervention needed' 
    }
  }

  const calculateTrend = (): { direction: string, percentage: number } => {
    if (resonanceData.length < 2) return { direction: 'stable', percentage: 0 }
    
    const recent = resonanceData.slice(0, 5)
    const older = resonanceData.slice(5, 10)
    
    const recentAvg = recent.reduce((sum, r) => sum + r.resonance_score, 0) / recent.length
    const olderAvg = older.reduce((sum, r) => sum + r.resonance_score, 0) / (older.length || 1)
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (Math.abs(change) < 5) return { direction: 'stable', percentage: change }
    return { direction: change > 0 ? 'improving' : 'declining', percentage: Math.abs(change) }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading mission resonance data...</div>
  }

  const resonanceLevel = currentResonance ? getResonanceLevel(currentResonance.resonance_score) : null
  const trend = calculateTrend()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Mission Resonance Index (MRI)
              </CardTitle>
              <CardDescription>
                Real-time alignment between team communication and organizational mission
              </CardDescription>
            </div>
            <Button onClick={triggerResonanceAnalysis} variant="outline" size="sm">
              Analyze Now
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Resonance Score */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {currentResonance ? (currentResonance.resonance_score * 100).toFixed(1) : '--'}%
                </div>
                {resonanceLevel && (
                  <div className="space-y-2">
                    <Badge className={`${resonanceLevel.color} text-white`}>
                      {resonanceLevel.level} Resonance
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {resonanceLevel.description}
                    </p>
                  </div>
                )}
              </div>
              
              {currentResonance && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mission Alignment</span>
                      <span>{(currentResonance.resonance_score * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={currentResonance.resonance_score * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Linguistic Distance</span>
                      <span>{(currentResonance.linguistic_distance * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={currentResonance.linguistic_distance * 100} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    {trend.direction === 'improving' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {trend.direction === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {trend.direction === 'stable' && <AlertCircle className="w-4 h-4 text-gray-500" />}
                    <span>
                      {trend.direction === 'stable' 
                        ? 'Stable resonance' 
                        : `${trend.direction} by ${trend.percentage.toFixed(1)}%`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Drift Indicators */}
            <div className="space-y-4">
              <h4 className="font-medium">Drift Indicators</h4>
              {currentResonance?.drift_indicators?.length ? (
                <div className="space-y-2">
                  {currentResonance.drift_indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                    >
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="capitalize">{indicator.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No significant drift indicators detected
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Statement Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mission Statement</CardTitle>
              <CardDescription>
                The organizational mission used for resonance analysis
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsEditingMission(!isEditingMission)}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditingMission ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditingMission ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  rows={4}
                  placeholder="Enter your organization's mission statement..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateMissionStatement}>
                  Update Mission
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingMission(false)
                    setNewMission(organization?.mission_statement || '')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed">
                {organization?.mission_statement || 'No mission statement defined. Click Edit to add one.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resonance History */}
      <Card>
        <CardHeader>
          <CardTitle>Resonance History</CardTitle>
          <CardDescription>
            Recent mission alignment measurements
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {resonanceData.slice(0, 10).map((data, index) => (
              <div
                key={data.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {(data.resonance_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(data.measured_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {data.drift_indicators.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {data.drift_indicators.length} alerts
                    </Badge>
                  )}
                  <div 
                    className={`w-3 h-3 rounded-full ${getResonanceLevel(data.resonance_score).color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}