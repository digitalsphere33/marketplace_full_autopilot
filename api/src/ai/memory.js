/**
 * Memory System - Persistent decision/action logging
 * Uses Supabase for storing:
 * - CEO decisions
 * - Agent proposals
 * - Risk validations
 * - Action outcomes
 * - Performance metrics
 */

import { supabase } from '../supabase.js';

export class MemorySystem {
  /**
   * Log a CEO decision
   */
  static async logDecision(decision) {
    const { data, error } = await supabase
      .from('ai_decisions')
      .insert([
        {
          decision_id: `dec_${Date.now()}`,
          status: 'proposed',
          decision_json: decision,
          created_at: new Date().toISOString(),
          approved_at: null,
          executed_at: null,
        },
      ]);

    if (error) throw error;
    return data[0];
  }

  /**
   * Log agent proposal
   */
  static async logAgentProposal(agentName, proposal) {
    const { data, error } = await supabase
      .from('ai_agent_proposals')
      .insert([
        {
          proposal_id: `prop_${Date.now()}`,
          agent: agentName,
          proposal_json: proposal,
          status: 'pending_validation',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    return data[0];
  }

  /**
   * Log risk validation
   */
  static async logRiskValidation(proposalId, validation) {
    const { data, error } = await supabase
      .from('ai_risk_validations')
      .insert([
        {
          validation_id: `risk_${Date.now()}`,
          proposal_id: proposalId,
          approved: validation.approved,
          risk_score: validation.risk_score,
          concerns: validation.concerns,
          reasoning: validation.reasoning,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    return data[0];
  }

  /**
   * Log execution
   */
  static async logExecution(proposalId, result) {
    const { data, error } = await supabase
      .from('ai_executions')
      .insert([
        {
          execution_id: `exec_${Date.now()}`,
          proposal_id: proposalId,
          status: result.status,
          outcome: result.outcome,
          error: result.error || null,
          executed_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    return data[0];
  }

  /**
   * Get decision history
   */
  static async getDecisionHistory(limit = 50) {
    const { data, error } = await supabase
      .from('ai_decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics() {
    const { data: decisions, error: decErr } = await supabase
      .from('ai_decisions')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (decErr) throw decErr;

    const approved = decisions.filter(d => d.status === 'approved').length;
    const rejected = decisions.filter(d => d.status === 'rejected').length;
    const executed = decisions.filter(d => d.status === 'executed').length;

    return {
      total_decisions: decisions.length,
      approved,
      rejected,
      executed,
      approval_rate: approved / decisions.length,
      execution_rate: executed / approved,
      timestamp: new Date().toISOString(),
    };
  }
}

export default MemorySystem;
