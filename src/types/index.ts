export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  planLimits: {
    agents: number;
    logsPerMonth: number;
    apiKeys: number;
    dataRetention: number;
    tokensPerDay: number;
  };
  orgName?: string;
}

export interface Permissions {
  allowedTools: string[];
  blockedTools: string[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerDay: number;
  };
  allowedDomains: string[];
}

export interface AgentMetadata {
  framework: string;
  environment: 'production' | 'staging' | 'development';
  version?: string;
  tags?: string[];
}

export interface AgentStats {
  totalActions: number;
  totalTokensUsed: number;
  lastSeenAt?: string | null;
  firstSeenAt?: string | null;
}

export interface Agent {
  id: string;
  agentId: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'killed';
  permissions: Permissions;
  metadata: AgentMetadata;
  stats: AgentStats;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  agentId: string;
  agentName: string;
  event: string;
  action: {
    tool: string;
    input: Record<string, any>;
    output?: Record<string, any>;
  };
  context: Record<string, any>;
  timestamp: string;
  duration?: number;
  success: boolean;
  traceId: string;
}

export interface Alert {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    agents: number;
    logsPerMonth: number;
    apiKeys: number;
    dataRetention: number;
  };
}

export interface AlertRule {
  id: string;
  agentId?: string;
  type: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}
