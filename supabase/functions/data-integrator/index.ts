import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Integration modules for different platforms
class DataIntegrator {
  
  // Slack integration
  static async integrateSlack(config: any, organizationId: string) {
    const { botToken, channels } = config
    
    console.log('Integrating Slack data for org:', organizationId)
    
    const communications = []
    
    for (const channelId of channels) {
      try {
        // Get channel history
        const response = await fetch(`https://slack.com/api/conversations.history`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            channel: channelId,
            limit: 100
          })
        })
        
        const data = await response.json()
        
        if (data.ok && data.messages) {
          for (const message of data.messages) {
            if (message.text && message.text.length > 10) {
              communications.push({
                source_type: 'slack',
                event_type: 'message',
                content: message.text,
                metadata: {
                  channel: channelId,
                  timestamp: message.ts,
                  thread_ts: message.thread_ts,
                  user_type: message.bot_id ? 'bot' : 'human',
                  reaction_count: message.reactions?.length || 0
                },
                occurred_at: new Date(parseFloat(message.ts) * 1000).toISOString()
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Slack channel ${channelId}:`, error)
      }
    }
    
    return communications
  }
  
  // Microsoft Teams integration
  static async integrateTeams(config: any, organizationId: string) {
    const { accessToken, teamIds } = config
    
    console.log('Integrating Teams data for org:', organizationId)
    
    const communications = []
    
    for (const teamId of teamIds) {
      try {
        // Get team channels
        const channelsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/teams/${teamId}/channels`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        const channelsData = await channelsResponse.json()
        
        if (channelsData.value) {
          for (const channel of channelsData.value) {
            // Get channel messages
            const messagesResponse = await fetch(
              `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channel.id}/messages`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            
            const messagesData = await messagesResponse.json()
            
            if (messagesData.value) {
              for (const message of messagesData.value) {
                if (message.body?.content && message.body.content.length > 10) {
                  communications.push({
                    source_type: 'teams',
                    event_type: 'message',
                    content: message.body.content,
                    metadata: {
                      team: teamId,
                      channel: channel.id,
                      messageId: message.id,
                      importance: message.importance,
                      reply_count: message.replyToId ? 1 : 0
                    },
                    occurred_at: message.createdDateTime
                  })
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Teams data for team ${teamId}:`, error)
      }
    }
    
    return communications
  }
  
  // Google Workspace integration
  static async integrateGoogleWorkspace(config: any, organizationId: string) {
    const { accessToken, driveIds, calendarIds } = config
    
    console.log('Integrating Google Workspace data for org:', organizationId)
    
    const communications = []
    
    // Google Drive documents
    if (driveIds) {
      for (const driveId of driveIds) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=parents in '${driveId}' and mimeType='application/vnd.google-apps.document'`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          const data = await response.json()
          
          if (data.files) {
            for (const file of data.files) {
              // Get document content
              const contentResponse = await fetch(
                `https://docs.googleapis.com/v1/documents/${file.id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              )
              
              const contentData = await contentResponse.json()
              
              if (contentData.body?.content) {
                const textContent = this.extractGoogleDocText(contentData.body.content)
                
                if (textContent.length > 50) {
                  communications.push({
                    source_type: 'google_workspace',
                    event_type: 'document',
                    content: textContent,
                    metadata: {
                      drive: driveId,
                      documentId: file.id,
                      title: file.name,
                      lastModified: file.modifiedTime
                    },
                    occurred_at: file.modifiedTime
                  })
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching Google Drive data for ${driveId}:`, error)
        }
      }
    }
    
    return communications
  }
  
  // Extract text from Google Docs structure
  static extractGoogleDocText(content: any): string {
    let text = ''
    
    for (const element of content) {
      if (element.paragraph?.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun?.content) {
            text += elem.textRun.content
          }
        }
      }
    }
    
    return text.trim()
  }
  
  // Zoom integration (for meeting transcripts)
  static async integrateZoom(config: any, organizationId: string) {
    const { jwtToken, accountId } = config
    
    console.log('Integrating Zoom data for org:', organizationId)
    
    const communications = []
    
    try {
      // Get recent meetings
      const meetingsResponse = await fetch(
        `https://api.zoom.us/v2/users/me/meetings?type=previous_meetings&page_size=100`,
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      const meetingsData = await meetingsResponse.json()
      
      if (meetingsData.meetings) {
        for (const meeting of meetingsData.meetings) {
          // Check if meeting has transcript
          try {
            const transcriptResponse = await fetch(
              `https://api.zoom.us/v2/meetings/${meeting.id}/recordings`,
              {
                headers: {
                  'Authorization': `Bearer ${jwtToken}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            
            const transcriptData = await transcriptResponse.json()
            
            if (transcriptData.recording_files) {
              for (const file of transcriptData.recording_files) {
                if (file.file_type === 'TRANSCRIPT') {
                  // Download transcript content
                  const transcriptContent = await fetch(file.download_url, {
                    headers: {
                      'Authorization': `Bearer ${jwtToken}`
                    }
                  })
                  
                  const transcriptText = await transcriptContent.text()
                  
                  if (transcriptText.length > 100) {
                    communications.push({
                      source_type: 'zoom',
                      event_type: 'meeting',
                      content: transcriptText,
                      metadata: {
                        meetingId: meeting.id,
                        topic: meeting.topic,
                        duration: meeting.duration,
                        participants: meeting.participants_count,
                        transcript_url: file.download_url
                      },
                      occurred_at: meeting.start_time
                    })
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching transcript for meeting ${meeting.id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Zoom meetings:', error)
    }
    
    return communications
  }
  
  // Generic communication processor
  static async processCommunications(communications: any[], organizationId: string, sourceId: string, supabase: any) {
    const processed = []
    
    for (const comm of communications) {
      try {
        // Create content hash for deduplication
        const contentHash = await this.createHash(comm.content)
        
        // Check if already processed
        const { data: existing } = await supabase
          .from('communication_events')
          .select('id')
          .eq('content_hash', contentHash)
          .limit(1)
        
        if (existing && existing.length > 0) {
          continue // Skip duplicate
        }
        
        // Anonymize content
        const anonymizedContent = this.anonymizeContent(comm.content)
        
        const event = {
          organization_id: organizationId,
          source_id: sourceId,
          event_type: comm.event_type,
          content_hash: contentHash,
          anonymized_content: anonymizedContent,
          metadata: comm.metadata,
          occurred_at: comm.occurred_at,
          processed_at: new Date().toISOString()
        }
        
        processed.push(event)
        
        // Trigger linguistic analysis
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/linguistic-processor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: anonymizedContent,
            organizationId,
            analysisType: 'full'
          })
        })
        
      } catch (error) {
        console.error('Error processing communication:', error)
      }
    }
    
    // Batch insert processed communications
    if (processed.length > 0) {
      const { error } = await supabase
        .from('communication_events')
        .insert(processed)
      
      if (error) {
        console.error('Error inserting communications:', error)
      }
    }
    
    return processed.length
  }
  
  // Create hash for content deduplication
  static async createHash(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Anonymize content while preserving linguistic patterns
  static anonymizeContent(content: string): string {
    return content
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[PERSON]')
      .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE]')
      .replace(/\$\d+(?:,\d{3})*(?:\.\d{2})?\b/g, '[AMOUNT]')
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

    const { sourceId, organizationId, sourceType, config } = await req.json()

    if (!sourceId || !organizationId || !sourceType) {
      throw new Error('Missing required parameters')
    }

    console.log(`Starting data integration for ${sourceType} - org: ${organizationId}`)

    let communications = []

    // Route to appropriate integration
    switch (sourceType) {
      case 'slack':
        communications = await DataIntegrator.integrateSlack(config, organizationId)
        break
      case 'teams':
        communications = await DataIntegrator.integrateTeams(config, organizationId)
        break
      case 'google_workspace':
        communications = await DataIntegrator.integrateGoogleWorkspace(config, organizationId)
        break
      case 'zoom':
        communications = await DataIntegrator.integrateZoom(config, organizationId)
        break
      default:
        throw new Error(`Unsupported source type: ${sourceType}`)
    }

    // Process and store communications
    const processedCount = await DataIntegrator.processCommunications(
      communications, 
      organizationId, 
      sourceId, 
      supabase
    )

    // Update source sync timestamp
    await supabase
      .from('data_sources')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', sourceId)

    return new Response(
      JSON.stringify({
        success: true,
        sourceType,
        rawCommunications: communications.length,
        processedCommunications: processedCount,
        syncedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Data integration error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})