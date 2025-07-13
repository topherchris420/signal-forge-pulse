import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingDown, TrendingUp, AlertTriangle, Brain, Activity } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface DriftMetric {
  metric: string
  current: number
  baseline: number
  drift: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  trend: 'improving' | 'degrading' | 'stable'
}

interface TemporalPattern {
  timeframe: string
  metaphorDensity: number
  pronounFragmentation: number
  emotionalCoherence: number
  narrativeStability: number
  driftScore: number
}

export function TemporalDriftTracker({ organizationId, unitId }: { organizationId: string, unitId?: string }) {
  const [driftMetrics, setDriftMetrics] = useState<DriftMetric[]>([])
  const [temporalPatterns, setTemporalPatterns] = useState<TemporalPattern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadDriftData()
    const interval = setInterval(loadDriftData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [organizationId, unitId, timeRange])

  const loadDriftData = async () => {
    try {
      // Load recent linguistic analyses
      const { data: analyses, error } = await supabase
        .from('linguistic_analyses')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('unit_id', unitId)
        .gte('created_at', new Date(Date.now() - getTimeRangeMs(timeRange)).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Load baseline data
      const { data: baseline } = await supabase
        .from('symbolic_baselines')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('unit_id', unitId)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()

      if (analyses && analyses.length > 0) {
        const currentAnalysis = analyses[analyses.length - 1]
        const baselineMetrics = baseline?.baseline_data || {}
        
        // Calculate drift metrics
        const metrics = calculateDriftMetrics(currentAnalysis.metrics, baselineMetrics)
        setDriftMetrics(metrics)
        
        // Calculate temporal patterns
        const patterns = calculateTemporalPatterns(analyses)
        setTemporalPatterns(patterns)
      }
    } catch (error) {
      console.error('Error loading drift data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDriftMetrics = (current: any, baseline: any): DriftMetric[] => {
    const metrics = [
      {
        metric: 'Metaphor Coherence',
        current: current.coherence?.metaphorDensity || 0,
        baseline: baseline.metaphorDensity || 0,
        type: 'metaphor'
      },
      {
        metric: 'Pronoun Distribution',
        current: calculatePronounCoherence(current.coherence?.pronounDistribution || {}),
        baseline: calculatePronounCoherence(baseline.pronounDistribution || {}),
        type: 'pronoun'
      },
      {
        metric: 'Emotional Stability',
        current: current.entropy?.emotionalStability || 0,
        baseline: baseline.emotionalStability || 0,
        type: 'emotional'
      },
      {
        metric: 'Narrative Continuity',
        current: current.coherence?.coherenceScore || 0,
        baseline: baseline.coherenceScore || 0,
        type: 'narrative'
      },
      {
        metric: 'Modal Certainty',
        current: current.coherence?.modalDensity || 0,
        baseline: baseline.modalDensity || 0,
        type: 'modal'
      }
    ]

    return metrics.map(m => {
      const drift = Math.abs(m.current - m.baseline)
      const severity = getDriftSeverity(drift, m.type)
      const trend = getTrend(m.current, m.baseline)
      
      return {
        metric: m.metric,
        current: m.current,
        baseline: m.baseline,
        drift,
        severity,
        trend
      }
    })
  }

  const calculatePronounCoherence = (pronounDist: Record<string, number>): number => {
    const weValues = (pronounDist.we || 0) + (pronounDist.our || 0) + (pronounDist.us || 0)
    const iValues = pronounDist.i || 0
    const theyValues = (pronounDist.they || 0) + (pronounDist.them || 0) + (pronounDist.their || 0)
    
    // Higher "we" usage indicates better team coherence
    return weValues / (weValues + iValues + theyValues + 0.001)
  }

  const getDriftSeverity = (drift: number, type: string): 'low' | 'medium' | 'high' | 'critical' => {
    const thresholds = {
      metaphor: { medium: 0.1, high: 0.2, critical: 0.35 },
      pronoun: { medium: 0.15, high: 0.3, critical: 0.5 },
      emotional: { medium: 0.1, high: 0.25, critical: 0.4 },
      narrative: { medium: 0.1, high: 0.2, critical: 0.35 },
      modal: { medium: 0.05, high: 0.15, critical: 0.25 }
    }
    
    const t = thresholds[type as keyof typeof thresholds] || thresholds.metaphor
    
    if (drift >= t.critical) return 'critical'
    if (drift >= t.high) return 'high'
    if (drift >= t.medium) return 'medium'
    return 'low'
  }

  const getTrend = (current: number, baseline: number): 'improving' | 'degrading' | 'stable' => {
    const diff = current - baseline
    if (Math.abs(diff) < 0.05) return 'stable'
    return diff > 0 ? 'improving' : 'degrading'
  }

  const calculateTemporalPatterns = (analyses: any[]): TemporalPattern[] => {
    const patterns = []
    const windowSize = Math.max(1, Math.floor(analyses.length / 8)) // 8 time periods
    
    for (let i = 0; i < analyses.length; i += windowSize) {
      const window = analyses.slice(i, i + windowSize)
      if (window.length === 0) continue
      
      const avgMetrics = window.reduce((acc, analysis) => {
        const m = analysis.metrics
        return {
          metaphorDensity: acc.metaphorDensity + (m.coherence?.metaphorDensity || 0),
          pronounFragmentation: acc.pronounFragmentation + (1 - calculatePronounCoherence(m.coherence?.pronounDistribution || {})),
          emotionalCoherence: acc.emotionalCoherence + (m.entropy?.emotionalStability || 0),
          narrativeStability: acc.narrativeStability + (m.coherence?.coherenceScore || 0),
          driftScore: acc.driftScore + (m.drift?.driftScore || 0)
        }
      }, {
        metaphorDensity: 0,
        pronounFragmentation: 0,
        emotionalCoherence: 0,
        narrativeStability: 0,
        driftScore: 0
      })
      
      Object.keys(avgMetrics).forEach(key => {
        avgMetrics[key as keyof typeof avgMetrics] /= window.length
      })
      
      patterns.push({
        timeframe: `Period ${Math.floor(i / windowSize) + 1}`,
        ...avgMetrics
      })
    }
    
    return patterns
  }

  const getTimeRangeMs = (range: string): number => {
    switch (range) {
      case '24h': return 24 * 60 * 60 * 1000
      case '7d': return 7 * 24 * 60 * 60 * 1000
      case '30d': return 30 * 24 * 60 * 60 * 1000
      default: return 7 * 24 * 60 * 60 * 1000
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'degrading': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Analyzing temporal patterns...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Temporal Symbolic Drift Tracker
              </CardTitle>
              <CardDescription>
                Multi-week linguistic baseline tracking and symbolic degradation analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {['24h', '7d', '30d'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driftMetrics.map((metric) => (
              <div
                key={metric.metric}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{metric.metric}</h4>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Current: {(metric.current * 100).toFixed(1)}%</span>
                    <span>Baseline: {(metric.baseline * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={metric.drift * 100} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between">
                    <Badge variant={getSeverityColor(metric.severity) as any}>
                      {metric.severity} drift
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(metric.drift * 100).toFixed(1)}% variance
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Symbolic Pattern Evolution</CardTitle>
          <CardDescription>
            Temporal progression of organizational linguistic characteristics
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {temporalPatterns.map((pattern, index) => (
              <div
                key={pattern.timeframe}
                className="flex items-center space-x-4 p-3 border rounded-lg"
              >
                <div className="w-20 text-sm font-medium">
                  {pattern.timeframe}
                </div>
                
                <div className="flex-1 grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Metaphor</div>
                    <div className="font-medium">{(pattern.metaphorDensity * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fragmentation</div>
                    <div className="font-medium">{(pattern.pronounFragmentation * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Coherence</div>
                    <div className="font-medium">{(pattern.emotionalCoherence * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stability</div>
                    <div className="font-medium">{(pattern.narrativeStability * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="w-16">
                  {pattern.driftScore > 0.7 && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}