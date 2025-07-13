-- Create tables for real-time organizational linguistic analysis

-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mission_statement TEXT,
  vision_statement TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data sources and integrations
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'slack', 'teams', 'google_workspace', 'zoom'
  source_config JSONB NOT NULL, -- API credentials and config
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Teams/units within organizations
CREATE TABLE public.organizational_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL, -- 'team', 'department', 'project', 'division'
  parent_unit_id UUID REFERENCES public.organizational_units(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Raw communication data (anonymized)
CREATE TABLE public.communication_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.organizational_units(id),
  source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'message', 'meeting', 'email', 'document'
  content_hash TEXT NOT NULL, -- For deduplication
  anonymized_content TEXT, -- Processed, anonymized text
  metadata JSONB, -- Channel, timestamp, participants count, etc.
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Linguistic analysis results
CREATE TABLE public.linguistic_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.organizational_units(id),
  analysis_type TEXT NOT NULL, -- 'coherence', 'entropy', 'drift', 'resonance'
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metrics JSONB NOT NULL, -- All the calculated metrics
  baseline_metrics JSONB, -- Historical baseline for comparison
  variance_score NUMERIC(5,4), -- 0-1 score for how different from baseline
  confidence_level NUMERIC(3,2), -- 0-1 confidence in the analysis
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Symbolic drift tracking
CREATE TABLE public.symbolic_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.organizational_units(id),
  baseline_type TEXT NOT NULL, -- 'metaphor', 'pronoun', 'tone', 'narrative'
  time_period_days INTEGER NOT NULL, -- Days of data used for baseline
  baseline_data JSONB NOT NULL, -- The actual baseline patterns
  established_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mission resonance tracking
CREATE TABLE public.mission_resonance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.organizational_units(id),
  resonance_score NUMERIC(5,4) NOT NULL, -- 0-1 alignment with mission
  drift_indicators JSONB, -- Specific areas of divergence
  linguistic_distance NUMERIC(5,4), -- Semantic distance from mission language
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alerts and warnings
CREATE TABLE public.symbolic_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.organizational_units(id),
  alert_type TEXT NOT NULL, -- 'drift', 'entropy', 'resonance', 'fragmentation'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  interpretive_analysis TEXT, -- Human-readable interpretation
  recommended_actions JSONB, -- Suggested stabilization actions
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Narrative stabilization interventions
CREATE TABLE public.stabilization_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.symbolic_alerts(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL, -- 'prompt', 'ritual', 'reframe', 'reset'
  content TEXT NOT NULL, -- The actual intervention content
  implementation_status TEXT NOT NULL DEFAULT 'suggested', -- 'suggested', 'implemented', 'completed'
  effectiveness_score NUMERIC(3,2), -- 0-1 score of how well it worked
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  implemented_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linguistic_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbolic_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_resonance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbolic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stabilization_interventions ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for demo - in production would be more complex)
CREATE POLICY "Organizations are viewable by authenticated users" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Data sources are viewable by authenticated users" ON public.data_sources FOR SELECT USING (true);
CREATE POLICY "Organizational units are viewable by authenticated users" ON public.organizational_units FOR SELECT USING (true);
CREATE POLICY "Communication events are viewable by authenticated users" ON public.communication_events FOR SELECT USING (true);
CREATE POLICY "Linguistic analyses are viewable by authenticated users" ON public.linguistic_analyses FOR SELECT USING (true);
CREATE POLICY "Symbolic baselines are viewable by authenticated users" ON public.symbolic_baselines FOR SELECT USING (true);
CREATE POLICY "Mission resonance is viewable by authenticated users" ON public.mission_resonance FOR SELECT USING (true);
CREATE POLICY "Symbolic alerts are viewable by authenticated users" ON public.symbolic_alerts FOR SELECT USING (true);
CREATE POLICY "Stabilization interventions are viewable by authenticated users" ON public.stabilization_interventions FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_communication_events_org_time ON public.communication_events(organization_id, occurred_at);
CREATE INDEX idx_linguistic_analyses_org_time ON public.linguistic_analyses(organization_id, time_window_start);
CREATE INDEX idx_symbolic_alerts_org_severity ON public.symbolic_alerts(organization_id, severity) WHERE NOT is_resolved;
CREATE INDEX idx_mission_resonance_org_time ON public.mission_resonance(organization_id, measured_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_symbolic_baselines_updated_at
  BEFORE UPDATE ON public.symbolic_baselines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER TABLE public.linguistic_analyses REPLICA IDENTITY FULL;
ALTER TABLE public.symbolic_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.mission_resonance REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.linguistic_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.symbolic_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_resonance;