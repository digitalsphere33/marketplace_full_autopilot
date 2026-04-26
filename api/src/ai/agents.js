/**
 * Specialized Agent Modules
 * Each agent has a single responsibility
 * All outputs must be JSON (no free text)
 */

export class MarketingAgent {
  static getSystemPrompt() {
    return `You are the Marketing Agent for MzanziMart marketplace.
ONLY role: Create marketing campaigns and promotions.
OUTPUT: Valid JSON with campaign plan (no execution).
CONSTRAINTS:
- Budget limit provided by CEO
- Never access financial data
- Never create orders
- Include expected ROI
`;
  }

  static async execute(params, aiProvider) {
    const prompt = `
Create a marketing campaign plan:
- Budget: R${params.budget}
- Target: ${params.target || 'new users'}
- Duration: ${params.duration || '7 days'}

Output JSON with:
- Campaign name
- Channels (email, sms, social)
- Message templates
- Expected reach
- Expected ROI
`;

    const response = await aiProvider.generate(prompt, this.getSystemPrompt());
    return JSON.parse(response);
  }
}

export class FinanceAgent {
  static getSystemPrompt() {
    return `You are the Finance Agent.
ONLY role: Analyze revenue, calculate commissions, recommend payouts.
OUTPUT: Valid JSON (no execution).
CONSTRAINTS:
- Never transfer money directly
- Only recommend actions to be approved
- Always show calculations
`;
  }

  static async execute(params, aiProvider) {
    const prompt = `
Analyze financials:
- Daily revenue: R${params.dailyRevenue}
- Commission rate: ${params.commissionRate}%
- Total sellers: ${params.sellerCount}

Calculate and recommend:
- Platform commission earned
- Seller payouts
- Reserve balance
- Next payout date
`;

    const response = await aiProvider.generate(prompt, this.getSystemPrompt());
    return JSON.parse(response);
  }
}

export class OperationsAgent {
  static getSystemPrompt() {
    return `You are the Operations Agent.
ONLY role: Manage listings, inventory, quality control.
OUTPUT: Valid JSON (no execution).
CONSTRAINTS:
- Never remove seller accounts without approval
- Only recommend listing improvements
- Flag suspicious activity for review
`;
  }

  static async execute(params, aiProvider) {
    const prompt = `
Analyze marketplace operations:
- Total listings: ${params.listingCount}
- Avg quality score: ${params.avgQuality}
- Listings flagged: ${params.flaggedCount}
- Seller violations: ${params.violations}

Recommend:
- Listings to feature
- Sellers to contact for quality
- Listings to review/remove
`;

    const response = await aiProvider.generate(prompt, this.getSystemPrompt());
    return JSON.parse(response);
  }
}

export class RiskAgent {
  static getSystemPrompt() {
    return `You are the MANDATORY Risk Agent - gatekeeper of all actions.
ROLE: Validate all proposed actions before execution.
OUTPUT: JSON with approve/reject + reasoning.
CONSTRAINTS:
- You ALWAYS review before execution
- You can reject CEO decisions
- You must explain reasoning
- Flag suspicious patterns
`;
  }

  static async validate(task, aiProvider) {
    const prompt = `
Validate this marketplace task:
Agent: ${task.agent}
Action: ${task.action}
Budget: R${task.budget}
Risk Level: ${task.risk_level}
Reasoning: ${task.reasoning}

Respond with JSON:
{
  "approved": boolean,
  "risk_score": 0-100,
  "concerns": ["..."],
  "reasoning": "...",
  "conditions": ["..."]
}
`;

    const response = await aiProvider.generate(prompt, this.getSystemPrompt());
    return JSON.parse(response);
  }
}

export default { MarketingAgent, FinanceAgent, OperationsAgent, RiskAgent };
