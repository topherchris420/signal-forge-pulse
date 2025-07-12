import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Activity,
  Users,
  BarChart3,
  Zap,
  CheckCircle,
  Clock
} from "lucide-react"

const Index = () => {
  const metrics = [
    {
      title: "Linguistic Coherence",
      value: "87%",
      change: "+2.3%",
      trend: "up",
      description: "Overall organizational alignment",
      icon: Brain,
      color: "signal-blue"
    },
    {
      title: "Communication Entropy",
      value: "0.23",
      change: "-0.05",
      trend: "down",
      description: "Fragmentation index",
      icon: TrendingUp,
      color: "signal-success"
    },
    {
      title: "Active Warnings",
      value: "3",
      change: "-2",
      trend: "down",
      description: "Requires attention",
      icon: AlertTriangle,
      color: "signal-warning"
    },
    {
      title: "Teams Monitored",
      value: "47",
      change: "+5",
      trend: "up",
      description: "Across 12 departments",
      icon: Users,
      color: "signal-purple"
    }
  ]

  const recentAlerts = [
    {
      id: 1,
      title: "Engineering Team - Semantic Drift Detected",
      severity: "medium",
      time: "2 hours ago",
      description: "Increased technical jargon density in cross-team communications"
    },
    {
      id: 2,
      title: "Marketing Department - Tone Inconsistency",
      severity: "low",
      time: "4 hours ago",
      description: "Varying sentiment patterns in external messaging"
    },
    {
      id: 3,
      title: "Executive Communications - Narrative Disruption",
      severity: "high",
      time: "6 hours ago",
      description: "Conflicting strategic messaging detected"
    }
  ]

  const systemStatus = [
    { component: "Data Ingestion", status: "operational", uptime: "99.9%" },
    { component: "NLP Processing", status: "operational", uptime: "99.7%" },
    { component: "Alert System", status: "operational", uptime: "100%" },
    { component: "API Gateway", status: "operational", uptime: "99.8%" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground">
            Real-time organizational intelligence and communication analysis
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title} className="border border-border hover:border-border/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    metric.trend === 'up' ? 'text-signal-success bg-signal-success/10' : 'text-signal-success bg-signal-success/10'
                  }`}>
                    {metric.change}
                  </span>
                  <span>{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Latest organizational intelligence warnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.severity === 'high' ? 'bg-signal-danger' :
                    alert.severity === 'medium' ? 'bg-signal-warning' : 'bg-signal-success'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <Badge variant={
                        alert.severity === 'high' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Platform health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatus.map((system) => (
                <div key={system.component} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{system.component}</div>
                    <div className="text-xs text-muted-foreground">Uptime: {system.uptime}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-signal-success" />
                    <span className="text-xs text-signal-success">Operational</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing Load</span>
                  <span className="text-sm text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" size="sm">
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Review Security
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Manage Teams
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
