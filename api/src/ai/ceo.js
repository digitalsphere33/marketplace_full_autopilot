/**
 * AI CEO Module
 * Strategic decision maker for marketplace automation
 * Role: Analyze metrics → Delegate tasks → NO DIRECT EXECUTION
 */

import axios from 'axios';

const SYSTEM_PROMPT = `You are the AI CEO of MzanziMart marketplace.
Your role is STRATEGIC DECISION-MAKING ONLY. You NEVER execute actions directly.

CONSTRAINTS:
1. Output ONLY valid JSON (no free text)
2. Every task must have reasoning + risk level
3. All actions delegated to specialized agents
4. Never make financial transactions directly
5. Always include budget/limit constraints

AGENTS AVAILABLE:
- MarketingAgent: Campaign creation, promotions, email
- FinanceAgent: Revenue analysis, payouts, commissions
- OperationsAgent: Listing curation, inventory
- RiskAgent: MANDATORY gate for all actions (you cannot bypass this)

OUTPUT FORMAT:
{
  "decision": "description",
  "tasks": [
    {
      "agent": "MarketingAgent|FinanceAgent|OperationsAgent",
      "action": "action_name",
      "params": {},
      "budget": 500,
      "reasoning": "why this action",
      "risk_level": "low|medium|high"
    }
  ],
  "reasoning": "strategic rationale",
  "approval_required": boolean
}
`;

export class AICEOModule {
  constructor(aiProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * Analyze marketplace metrics and make strategic decisions
   */
  async analyzeAndDecide(metrics) {
    const prompt = `
Analyze these marketplace metrics and propose strategic tasks:

METRICS:
- Daily Revenue: R${metrics.dailyRevenue}
- Active Listings: ${metrics.activeListings}
- New Users (24h): ${metrics.newUsers}
- Avg Order Value: R${metrics.avgOrderValue}
- Seller Count: ${metrics.sellerCount}
- System Errors (24h): ${metrics.errors}

GOAL: Increase revenue to R500+/day

Based on these metrics, what 1-3 high-impact tasks should agents execute?
Output ONLY valid JSON.
`;

    try {
      const response = await this.aiProvider.generate(prompt, SYSTEM_PROMPT);
      const decision = JSON.parse(response);
      
      // Validation
      if (!decision.tasks || !Array.isArray(decision.tasks)) {
        throw new Error('Invalid response: tasks must be array');
      }

      return {
        status: 'success',
        decision,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get available metrics from marketplace
   */
  static createMetricsSnapshot(dbData) {
    return {
      dailyRevenue: dbData.dailyRevenue || 0,
      activeListings: dbData.listingCount || 0,
      newUsers: dbData.newUsersToday || 0,
      avgOrderValue: dbData.avgOrderValue || 0,
      sellerCount: dbData.sellerCount || 0,
      errors: dbData.errorsToday || 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export default AICEOModule;
