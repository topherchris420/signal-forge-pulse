import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Slack, Calendar, MessageSquare, Video, Plus, Settings, Trash2, RefreshCw } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface DataSource {
  id: string
  organization_id: string
  source_type: string
  source_config: any
  is_active: boolean
  last_sync: string | null
  created_at: string
}

const sourceIcons = {
  slack: Slack,
  teams: MessageSquare,
  google_workspace: Calendar,
  zoom: Video
}

const sourceLabels = {
  slack: 'Slack',
  teams: 'Microsoft Teams',
  google_workspace: 'Google Workspace',
  zoom: 'Zoom'
}

export function DataSourceManager({ organizationId }: { organizationId: string }) {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [newSource, setNewSource] = useState({
    type: '',
    config: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDataSources()
  }, [organizationId])

  const loadDataSources = async () => {
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDataSources(data || [])
    } catch (error) {
      console.error('Error loading data sources:', error)
      toast({
        title: "Error",
        description: "Failed to load data sources",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addDataSource = async () => {
    try {
      const { error } = await supabase
        .from('data_sources')
        .insert({
          organization_id: organizationId,
          source_type: newSource.type,
          source_config: newSource.config,
          is_active: true
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Data source added successfully"
      })

      setIsAddingSource(false)
      setNewSource({ type: '', config: {} })
      loadDataSources()
    } catch (error) {
      console.error('Error adding data source:', error)
      toast({
        title: "Error",
        description: "Failed to add data source",
        variant: "destructive"
      })
    }
  }

  const triggerSync = async (sourceId: string, sourceType: string, config: any) => {
    try {
      const response = await fetch(`/functions/v1/data-integrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          sourceId,
          organizationId,
          sourceType,
          config
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      toast({
        title: "Sync Complete",
        description: `Processed ${result.processedCommunications} communications from ${sourceLabels[sourceType as keyof typeof sourceLabels]}`
      })

      loadDataSources()
    } catch (error) {
      console.error('Error syncing data source:', error)
      toast({
        title: "Sync Error",
        description: "Failed to sync data source",
        variant: "destructive"
      })
    }
  }

  const deleteDataSource = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from('data_sources')
        .delete()
        .eq('id', sourceId)

      if (error) throw error

      toast({
        title: "Success", 
        description: "Data source deleted"
      })

      loadDataSources()
    } catch (error) {
      console.error('Error deleting data source:', error)
      toast({
        title: "Error",
        description: "Failed to delete data source",
        variant: "destructive"
      })
    }
  }

  const renderConfigForm = () => {
    switch (newSource.type) {
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="xoxb-..."
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { ...newSource.config, botToken: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="channels">Channel IDs (comma-separated)</Label>
              <Textarea
                id="channels"
                placeholder="C1234567890,C0987654321"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { 
                    ...newSource.config, 
                    channels: e.target.value.split(',').map(c => c.trim()) 
                  }
                })}
              />
            </div>
          </div>
        )
      
      case 'teams':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Microsoft Teams access token"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { ...newSource.config, accessToken: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="teamIds">Team IDs (comma-separated)</Label>
              <Textarea
                id="teamIds"
                placeholder="team-id-1,team-id-2"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { 
                    ...newSource.config, 
                    teamIds: e.target.value.split(',').map(t => t.trim()) 
                  }
                })}
              />
            </div>
          </div>
        )
      
      case 'google_workspace':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Google Workspace access token"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { ...newSource.config, accessToken: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="driveIds">Drive IDs (optional)</Label>
              <Textarea
                id="driveIds"
                placeholder="drive-id-1,drive-id-2"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { 
                    ...newSource.config, 
                    driveIds: e.target.value.split(',').map(d => d.trim()).filter(Boolean) 
                  }
                })}
              />
            </div>
          </div>
        )
      
      case 'zoom':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jwtToken">JWT Token</Label>
              <Input
                id="jwtToken"
                type="password"
                placeholder="Zoom JWT token"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { ...newSource.config, jwtToken: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="Zoom account ID"
                onChange={(e) => setNewSource({
                  ...newSource,
                  config: { ...newSource.config, accountId: e.target.value }
                })}
              />
            </div>
          </div>
        )
      
      default:
        return <p className="text-muted-foreground">Select a source type to configure</p>
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading data sources...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Manage real-time integrations with communication platforms
            </CardDescription>
          </div>
          <Dialog open={isAddingSource} onOpenChange={setIsAddingSource}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Data Source</DialogTitle>
                <DialogDescription>
                  Connect a new communication platform for linguistic analysis
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sourceType">Source Type</Label>
                  <Select 
                    value={newSource.type} 
                    onValueChange={(value) => setNewSource({ ...newSource, type: value, config: {} })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                      <SelectItem value="google_workspace">Google Workspace</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {renderConfigForm()}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingSource(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={addDataSource}
                  disabled={!newSource.type || Object.keys(newSource.config).length === 0}
                >
                  Add Source
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {dataSources.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No data sources configured. Add your first integration to begin real-time analysis.
            </p>
          ) : (
            dataSources.map((source) => {
              const Icon = sourceIcons[source.source_type as keyof typeof sourceIcons]
              const label = sourceLabels[source.source_type as keyof typeof sourceLabels]
              
              return (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">{label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {source.last_sync 
                          ? `Last sync: ${new Date(source.last_sync).toLocaleString()}`
                          : 'Never synced'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={source.is_active ? "default" : "secondary"}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerSync(source.id, source.source_type, source.source_config)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDataSource(source.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}