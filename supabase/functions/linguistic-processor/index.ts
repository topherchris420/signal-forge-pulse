import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Advanced NLP processing functions
class LinguisticAnalyzer {
  
  // Analyze linguistic coherence patterns
  static analyzeCoherence(text: string) {
    const words = text.toLowerCase().split(/\s+/)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Metaphor density analysis
    const metaphorIndicators = ['like', 'as', 'metaphor', 'symbolically', 'represents', 'embodies']
    const metaphorDensity = words.filter(w => metaphorIndicators.includes(w)).length / words.length
    
    // Pronoun distribution analysis
    const pronouns = ['i', 'we', 'you', 'they', 'us', 'them', 'our', 'their']
    const pronounDistribution = pronouns.reduce((acc, pronoun) => {
      acc[pronoun] = words.filter(w => w === pronoun).length / words.length
      return acc
    }, {} as Record<string, number>)
    
    // Modal compression (certainty indicators)
    const modalVerbs = ['will', 'would', 'should', 'could', 'might', 'may', 'must', 'shall']
    const modalDensity = words.filter(w => modalVerbs.includes(w)).length / words.length
    
    // Sentence complexity and coherence
    const avgSentenceLength = words.length / sentences.length
    const coherenceScore = this.calculateCoherenceScore(sentences)
    
    return {
      metaphorDensity,
      pronounDistribution,
      modalDensity,
      avgSentenceLength,
      coherenceScore,
      wordCount: words.length,
      sentenceCount: sentences.length
    }
  }
  
  // Calculate semantic coherence between sentences
  static calculateCoherenceScore(sentences: string[]) {
    if (sentences.length < 2) return 1.0
    
    let coherenceSum = 0
    for (let i = 1; i < sentences.length; i++) {
      const prev = sentences[i-1].toLowerCase().split(/\s+/)
      const curr = sentences[i].toLowerCase().split(/\s+/)
      
      // Simple lexical overlap measure
      const overlap = prev.filter(w => curr.includes(w)).length
      const union = new Set([...prev, ...curr]).size
      coherenceSum += overlap / union
    }
    
    return coherenceSum / (sentences.length - 1)
  }
  
  // Analyze sentiment entropy and emotional stability
  static analyzeEntropy(text: string) {
    const words = text.toLowerCase().split(/\s+/)
    
    // Sentiment indicators
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'achieve', 'progress', 'improve']
    const negativeWords = ['bad', 'terrible', 'negative', 'fail', 'problem', 'issue', 'concern', 'difficult']
    const neutralWords = ['maybe', 'perhaps', 'possibly', 'uncertain', 'unclear', 'ambiguous']
    
    const positive = words.filter(w => positiveWords.includes(w)).length
    const negative = words.filter(w => negativeWords.includes(w)).length
    const neutral = words.filter(w => neutralWords.includes(w)).length
    
    // Calculate entropy
    const total = positive + negative + neutral || 1
    const posRatio = positive / total
    const negRatio = negative / total
    const neuRatio = neutral / total
    
    const entropy = -[posRatio, negRatio, neuRatio]
      .filter(r => r > 0)
      .reduce((sum, r) => sum + r * Math.log2(r), 0)
    
    // Fragmentation indicators
    const fragmentationWords = ['but', 'however', 'although', 'despite', 'nevertheless', 'nonetheless']
    const fragmentationScore = words.filter(w => fragmentationWords.includes(w)).length / words.length
    
    return {
      entropy,
      sentimentDistribution: { positive, negative, neutral },
      fragmentationScore,
      emotionalStability: 1 - entropy / 2 // Normalized stability score
    }
  }
  
  // Track symbolic drift from baseline
  static analyzeDrift(currentText: string, baselineMetrics: any) {
    const current = this.analyzeCoherence(currentText)
    const entropy = this.analyzeEntropy(currentText)
    
    if (!baselineMetrics) {
      return {
        driftScore: 0,
        driftIndicators: [],
        confidence: 0.1
      }
    }
    
    // Calculate drift in key metrics
    const metaphorDrift = Math.abs(current.metaphorDensity - baselineMetrics.metaphorDensity)
    const modalDrift = Math.abs(current.modalDensity - baselineMetrics.modalDensity)
    const coherenceDrift = Math.abs(current.coherenceScore - baselineMetrics.coherenceScore)
    const entropyDrift = Math.abs(entropy.entropy - baselineMetrics.entropy)
    
    const driftScore = (metaphorDrift + modalDrift + coherenceDrift + entropyDrift) / 4
    
    const driftIndicators = []
    if (metaphorDrift > 0.1) driftIndicators.push('metaphor_decay')
    if (modalDrift > 0.1) driftIndicators.push('modal_compression')
    if (coherenceDrift > 0.1) driftIndicators.push('coherence_breakdown')
    if (entropyDrift > 0.5) driftIndicators.push('emotional_instability')
    
    return {
      driftScore,
      driftIndicators,
      confidence: Math.min(1, driftScore * 2),
      detailedDrift: {
        metaphorDrift,
        modalDrift,
        coherenceDrift,
        entropyDrift
      }
    }
  }
  
  // Calculate mission resonance
  static analyzeMissionResonance(text: string, missionStatement: string) {
    if (!missionStatement) return { resonanceScore: 0.5, confidence: 0 }
    
    const textWords = text.toLowerCase().split(/\s+/)
    const missionWords = missionStatement.toLowerCase().split(/\s+/)
    
    // Semantic overlap
    const overlap = textWords.filter(w => missionWords.includes(w)).length
    const semanticAlignment = overlap / Math.max(textWords.length, missionWords.length)
    
    // Key concept extraction (simplified)
    const missionConcepts = this.extractKeyConcepts(missionStatement)
    const textConcepts = this.extractKeyConcepts(text)
    
    const conceptOverlap = missionConcepts.filter(c => textConcepts.includes(c)).length
    const conceptAlignment = conceptOverlap / Math.max(missionConcepts.length, 1)
    
    const resonanceScore = (semanticAlignment + conceptAlignment) / 2
    
    return {
      resonanceScore,
      semanticAlignment,
      conceptAlignment,
      confidence: Math.min(1, (textWords.length / 50) * 0.8), // Higher confidence with more text
      driftIndicators: resonanceScore < 0.3 ? ['mission_drift', 'semantic_distance'] : []
    }
  }
  
  // Extract key concepts (simplified keyword extraction)
  static extractKeyConcepts(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/)
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'a', 'an', 'this', 'that', 'these', 'those']
    
    const meaningfulWords = words.filter(w => 
      w.length > 3 && 
      !stopWords.includes(w) &&
      /^[a-zA-Z]+$/.test(w)
    )
    
    // Simple frequency-based concept extraction
    const frequency: Record<string, number> = {}
    meaningfulWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    return Object.entries(frequency)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([word, _]) => word)
  }
  
  // Anonymize text while preserving linguistic patterns
  static anonymizeText(text: string): string {
    // Replace names with generic placeholders
    let anonymized = text
      .replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, '[PERSON]') // Names
      .replace(/\b[A-Z][a-z]+\sTeam\b/g, '[TEAM]') // Team names
      .replace(/\b[A-Z][a-z]+\sDepartment\b/g, '[DEPARTMENT]') // Department names
      .replace(/\b[A-Z][a-z]+\sProject\b/g, '[PROJECT]') // Project names
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE]') // Dates
      .replace(/\b\d{1,2}:\d{2}\b/g, '[TIME]') // Times
      .replace(/\$\d+(?:,\d{3})*(?:\.\d{2})?\b/g, '[AMOUNT]') // Dollar amounts
    
    return anonymized
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { text, organizationId, unitId, missionStatement, analysisType = 'full' } = await req.json()

    if (!text || !organizationId) {
      throw new Error('Missing required parameters: text and organizationId')
    }

    console.log(`Processing linguistic analysis for org ${organizationId}, unit ${unitId}`)

    // Anonymize the input text
    const anonymizedText = LinguisticAnalyzer.anonymizeText(text)
    
    // Get baseline metrics for drift analysis
    const { data: baseline } = await supabase
      .from('symbolic_baselines')
      .select('baseline_data')
      .eq('organization_id', organizationId)
      .eq('unit_id', unitId)
      .eq('baseline_type', 'comprehensive')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single()

    const baselineMetrics = baseline?.baseline_data

    // Perform analysis
    const results: any = {}
    
    if (analysisType === 'full' || analysisType === 'coherence') {
      results.coherence = LinguisticAnalyzer.analyzeCoherence(anonymizedText)
    }
    
    if (analysisType === 'full' || analysisType === 'entropy') {
      results.entropy = LinguisticAnalyzer.analyzeEntropy(anonymizedText)
    }
    
    if (analysisType === 'full' || analysisType === 'drift') {
      results.drift = LinguisticAnalyzer.analyzeDrift(anonymizedText, baselineMetrics)
    }
    
    if (analysisType === 'full' || analysisType === 'resonance') {
      results.resonance = LinguisticAnalyzer.analyzeMissionResonance(anonymizedText, missionStatement)
    }

    // Store the analysis results
    const { error: insertError } = await supabase
      .from('linguistic_analyses')
      .insert({
        organization_id: organizationId,
        unit_id: unitId,
        analysis_type: analysisType,
        time_window_start: new Date().toISOString(),
        time_window_end: new Date().toISOString(),
        metrics: results,
        baseline_metrics: baselineMetrics,
        variance_score: results.drift?.driftScore || 0,
        confidence_level: Math.max(...Object.values(results).map((r: any) => r.confidence || 0.5))
      })

    if (insertError) {
      console.error('Error storing analysis:', insertError)
    }

    // Check for alerts
    const alerts = []
    
    if (results.drift?.driftScore > 0.7) {
      alerts.push({
        alert_type: 'drift',
        severity: results.drift.driftScore > 0.9 ? 'critical' : 'high',
        title: 'Symbolic Drift Detected',
        description: `Significant linguistic drift detected in organizational unit`,
        interpretive_analysis: `The symbolic patterns show ${results.drift.driftIndicators.join(', ')} with a drift magnitude of ${(results.drift.driftScore * 100).toFixed(1)}%. This suggests the team's linguistic coherence is diverging from established baselines, potentially indicating cultural or operational misalignment.`,
        recommended_actions: {
          immediate: ['Review recent communication patterns', 'Schedule team alignment session'],
          stabilization: ['Implement narrative reset protocol', 'Conduct symbolic coherence workshop']
        }
      })
    }
    
    if (results.resonance?.resonanceScore < 0.3) {
      alerts.push({
        alert_type: 'resonance',
        severity: results.resonance.resonanceScore < 0.15 ? 'critical' : 'medium',
        title: 'Mission Resonance Decline',
        description: 'Team language showing drift from organizational mission',
        interpretive_analysis: `Current communication patterns show only ${(results.resonance.resonanceScore * 100).toFixed(1)}% alignment with the organizational mission. This linguistic distance suggests potential mission drift or unclear strategic messaging.`,
        recommended_actions: {
          immediate: ['Review mission statement clarity', 'Analyze recent strategic communications'],
          stabilization: ['Mission realignment workshop', 'Narrative coherence training']
        }
      })
    }

    // Store alerts
    for (const alert of alerts) {
      await supabase
        .from('symbolic_alerts')
        .insert({
          organization_id: organizationId,
          unit_id: unitId,
          ...alert
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: results,
        alerts: alerts.length,
        confidence: Math.max(...Object.values(results).map((r: any) => r.confidence || 0.5))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Linguistic processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})