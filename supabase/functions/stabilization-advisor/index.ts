import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Narrative Stabilization Toolkit
class StabilizationAdvisor {
  
  // Generate resonance repair prompts
  static generateRepairPrompts(alertType: string, driftIndicators: string[], severity: string) {
    const prompts = {
      metaphor_decay: {
        title: "Metaphor Realignment Protocol",
        description: "Your team's shared symbolic language is becoming fragmented. Reconnect through intentional metaphor building.",
        actions: [
          "Begin your next team meeting by asking: 'What metaphor best describes our current project state?'",
          "Create a shared visual metaphor board where team members can contribute images that represent the work",
          "Use consistent metaphorical language in communications (e.g., if the project is a 'journey', maintain navigation language)",
          "Establish weekly 'metaphor check-ins' to ensure shared symbolic understanding"
        ],
        timeframe: "Implement over 2-3 weeks",
        success_indicators: ["Increased metaphor consistency", "Shared symbolic vocabulary", "Clearer conceptual alignment"]
      },
      
      pronoun_fragmentation: {
        title: "Collective Identity Restoration",
        description: "Language patterns suggest weakening team cohesion. Rebuild collective identity through intentional pronoun practice.",
        actions: [
          "Practice 'we-first' communication in all team updates",
          "Create shared ownership statements: 'We own this challenge together'",
          "Establish team rituals that reinforce collective identity",
          "Replace individual blame language with collective problem-solving language"
        ],
        timeframe: "Daily practice for 4 weeks",
        success_indicators: ["Increased 'we' usage", "Reduced individual isolation language", "Stronger collective ownership"]
      },
      
      emotional_instability: {
        title: "Emotional Coherence Protocol",
        description: "Communication shows emotional fragmentation. Stabilize through structured emotional alignment.",
        actions: [
          "Implement daily emotional weather reports at start of meetings",
          "Create safe spaces for expressing uncertainty without judgment",
          "Establish clear communication protocols for difficult conversations",
          "Practice collective emotional regulation through breathing or grounding exercises"
        ],
        timeframe: "6-8 weeks of consistent practice",
        success_indicators: ["Reduced emotional volatility", "Increased emotional vocabulary", "Better conflict resolution"]
      },
      
      mission_drift: {
        title: "Mission Reconnection Ritual",
        description: "Team language is drifting from organizational mission. Restore connection through targeted realignment.",
        actions: [
          "Read the mission statement aloud at the start of each significant meeting",
          "Create personal mission connection statements: 'This work connects to our mission by...'",
          "Develop project milestone language that explicitly references mission elements",
          "Schedule monthly 'mission alignment' discussions"
        ],
        timeframe: "Ongoing practice, evaluate after 6 weeks",
        success_indicators: ["Increased mission vocabulary", "Clearer purpose connection", "Aligned decision-making language"]
      },
      
      coherence_breakdown: {
        title: "Narrative Coherence Restoration",
        description: "Team communications lack coherent storyline. Rebuild shared narrative through structured storytelling.",
        actions: [
          "Establish clear beginning-middle-end structures in project communications",
          "Create shared project story artifacts (timelines, narrative summaries)",
          "Practice collective storytelling in retrospectives",
          "Develop consistent language for describing project phases and milestones"
        ],
        timeframe: "8-10 weeks of structured practice",
        success_indicators: ["Coherent project narratives", "Shared story vocabulary", "Clear temporal language"]
      }
    }
    
    return driftIndicators.map(indicator => prompts[indicator]).filter(Boolean)
  }
  
  // Generate symbolic alignment rituals
  static generateAlignmentRituals(organizationContext: any, unitContext: any, alertSeverity: string) {
    const rituals = []
    
    if (alertSeverity === 'critical') {
      rituals.push({
        name: "Emergency Narrative Reset",
        description: "A structured 2-hour session to rebuild foundational linguistic alignment",
        process: [
          "Silent individual reflection: 'What story are we telling ourselves about this work?'",
          "Pair sharing of individual narratives",
          "Group identification of narrative conflicts and overlaps",
          "Collective creation of new shared story",
          "Commitment ceremony to the new narrative"
        ],
        facilitator_notes: "Requires neutral facilitator. Focus on story, not blame.",
        duration: "2-3 hours",
        frequency: "One-time intensive, then monthly check-ins"
      })
    }
    
    if (alertSeverity === 'high' || alertSeverity === 'critical') {
      rituals.push({
        name: "Naming Ceremony",
        description: "Collective process to name and claim the current organizational moment",
        process: [
          "Individual writing: 'If this moment had a name, what would it be?'",
          "Small group clustering of similar names/themes",
          "Large group dialogue about emerging themes",
          "Consensus selection of 1-3 names for the current period",
          "Ritual adoption of the chosen names into regular communication"
        ],
        facilitator_notes: "Names should be descriptive, not evaluative. Focus on what IS, not what should be.",
        duration: "90 minutes",
        frequency: "Quarterly or during major transitions"
      })
    }
    
    rituals.push({
      name: "Reflective Query Practice",
      description: "Regular practice of asking questions that reveal and align symbolic understanding",
      process: [
        "Weekly team question: 'What metaphor captures our current reality?'",
        "Individual reflection before sharing",
        "Group dialogue without immediate problem-solving",
        "Identification of shared vs. divergent symbolic understanding",
        "Agreement on language to use going forward"
      ],
      facilitator_notes: "Questions are for exploration, not answers. Create psychological safety.",
      duration: "30 minutes weekly",
      frequency: "Weekly for 8 weeks, then biweekly"
    })
    
    return rituals
  }
  
  // Generate reframing strategies
  static generateReframingStrategies(specificContext: any) {
    return [
      {
        category: "Temporal Reframing",
        description: "Shift perspective on time and progress",
        strategies: [
          "Replace 'behind schedule' with 'learning what the timeline really needs'",
          "Replace 'deadline pressure' with 'approaching clarity point'",
          "Replace 'slow progress' with 'thorough foundation building'",
          "Replace 'time crunch' with 'focus intensification'"
        ]
      },
      {
        category: "Challenge Reframing", 
        description: "Transform problem language into growth language",
        strategies: [
          "Replace 'this is broken' with 'this is showing us what needs attention'",
          "Replace 'we failed' with 'we discovered what doesn't work'",
          "Replace 'it's impossible' with 'we haven't found the path yet'",
          "Replace 'we're stuck' with 'we're in a discovery phase'"
        ]
      },
      {
        category: "Collective Reframing",
        description: "Strengthen team identity and shared ownership",
        strategies: [
          "Replace 'your project' with 'our shared work'",
          "Replace 'individual responsibility' with 'collective stewardship'",
          "Replace 'blame assignment' with 'pattern understanding'",
          "Replace 'personal failure' with 'team learning opportunity'"
        ]
      },
      {
        category: "Purpose Reframing",
        description: "Reconnect daily work with larger meaning",
        strategies: [
          "Begin status updates with 'In service of [mission], today we...'",
          "Replace 'task completion' with 'mission advancement'",
          "Replace 'work requirements' with 'contribution opportunities'",
          "Replace 'job responsibilities' with 'stewardship commitments'"
        ]
      }
    ]
  }
  
  // Assess intervention effectiveness
  static assessInterventionEffectiveness(beforeMetrics: any, afterMetrics: any, intervention: any) {
    const improvements = {}
    const degradations = {}
    
    // Compare key linguistic metrics
    const metricComparisons = [
      'coherenceScore',
      'metaphorDensity', 
      'modalDensity',
      'emotionalStability',
      'resonanceScore'
    ]
    
    for (const metric of metricComparisons) {
      const before = beforeMetrics[metric] || 0
      const after = afterMetrics[metric] || 0
      const change = after - before
      
      if (Math.abs(change) > 0.05) { // Significant change threshold
        if (change > 0) {
          improvements[metric] = change
        } else {
          degradations[metric] = Math.abs(change)
        }
      }
    }
    
    // Calculate overall effectiveness score
    const improvementCount = Object.keys(improvements).length
    const degradationCount = Object.keys(degradations).length
    const totalMetrics = metricComparisons.length
    
    const effectivenessScore = (improvementCount - degradationCount) / totalMetrics
    
    return {
      effectivenessScore: Math.max(0, Math.min(1, (effectivenessScore + 1) / 2)), // Normalize to 0-1
      improvements,
      degradations,
      recommendation: effectivenessScore > 0.2 ? 'continue' : effectivenessScore > -0.2 ? 'modify' : 'discontinue'
    }
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

    const { alertId, action, organizationId, unitId } = await req.json()

    if (!alertId || !action) {
      throw new Error('Missing required parameters: alertId and action')
    }

    console.log(`Processing stabilization request for alert ${alertId}, action: ${action}`)

    // Get alert details
    const { data: alert, error: alertError } = await supabase
      .from('symbolic_alerts')
      .select('*')
      .eq('id', alertId)
      .single()

    if (alertError || !alert) {
      throw new Error('Alert not found')
    }

    let response = {}

    switch (action) {
      case 'generate_interventions':
        // Generate comprehensive intervention package
        const repairPrompts = StabilizationAdvisor.generateRepairPrompts(
          alert.alert_type,
          alert.recommended_actions?.drift_indicators || [],
          alert.severity
        )
        
        const alignmentRituals = StabilizationAdvisor.generateAlignmentRituals(
          { organizationId },
          { unitId },
          alert.severity
        )
        
        const reframingStrategies = StabilizationAdvisor.generateReframingStrategies({
          alertType: alert.alert_type,
          severity: alert.severity
        })
        
        response = {
          repairPrompts,
          alignmentRituals,
          reframingStrategies,
          implementationPlan: {
            immediate: "Choose 1-2 repair prompts to implement this week",
            shortTerm: "Begin one alignment ritual within 2 weeks", 
            longTerm: "Integrate reframing strategies into daily communication",
            evaluation: "Assess effectiveness after 4-6 weeks of consistent practice"
          }
        }
        
        // Store generated interventions
        for (const prompt of repairPrompts) {
          await supabase
            .from('stabilization_interventions')
            .insert({
              alert_id: alertId,
              intervention_type: 'prompt',
              content: JSON.stringify(prompt),
              implementation_status: 'suggested'
            })
        }
        
        for (const ritual of alignmentRituals) {
          await supabase
            .from('stabilization_interventions')
            .insert({
              alert_id: alertId,
              intervention_type: 'ritual',
              content: JSON.stringify(ritual),
              implementation_status: 'suggested'
            })
        }
        
        break
        
      case 'assess_effectiveness':
        // Assess intervention effectiveness
        const { interventionId, beforeMetrics, afterMetrics } = req.body
        
        const { data: intervention } = await supabase
          .from('stabilization_interventions')
          .select('*')
          .eq('id', interventionId)
          .single()
        
        if (intervention) {
          const assessment = StabilizationAdvisor.assessInterventionEffectiveness(
            beforeMetrics,
            afterMetrics,
            intervention
          )
          
          // Update intervention with effectiveness score
          await supabase
            .from('stabilization_interventions')
            .update({
              effectiveness_score: assessment.effectivenessScore,
              implementation_status: 'completed'
            })
            .eq('id', interventionId)
          
          response = { assessment }
        }
        
        break
        
      case 'mark_implemented':
        const { interventionId: implId } = req.body
        
        await supabase
          .from('stabilization_interventions')
          .update({
            implementation_status: 'implemented',
            implemented_at: new Date().toISOString()
          })
          .eq('id', implId)
        
        response = { success: true, message: 'Intervention marked as implemented' }
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        alertId,
        ...response
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Stabilization advisor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})