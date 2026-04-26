/**
 * AI Provider - Unified interface for LLM calls
 * Supports: Anthropic, OpenRouter, Ollama
 */

import axios from 'axios';

export class AIProvider {
  constructor(config) {
    this.provider = config.provider || 'anthropic';
    this.model = config.model || 'claude-3-sonnet';
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async generate(userPrompt, systemPrompt) {
    if (this.provider === 'anthropic') {
      return this.generateAnthropic(userPrompt, systemPrompt);
    } else if (this.provider === 'openrouter') {
      return this.generateOpenRouter(userPrompt, systemPrompt);
    } else if (this.provider === 'ollama') {
      return this.generateOllama(userPrompt, systemPrompt);
    } else {
      throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  async generateAnthropic(userPrompt, systemPrompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0].text;
  }

  async generateOpenRouter(userPrompt, systemPrompt) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  async generateOllama(userPrompt, systemPrompt) {
    const response = await axios.post(
      `${this.baseUrl}/api/generate`,
      {
        model: this.model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
      }
    );

    return response.data.response;
  }
}

export default AIProvider;
