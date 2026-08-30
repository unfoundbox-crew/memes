/**
 * WebMCP Bridge - Web Model Context Protocol Browser Shim & Tool Registry
 * Reusable, zero-dependency browser WebMCP script for unfoundbox-crew suite.
 * 
 * Provides:
 * - Standard navigator.modelContext.registerTool() bindings
 * - navigator.modelContext polyfill & window.WebMCP interface
 * - Three built-in tools:
 *   1. agentworth_local_audit: Connects to local agwt at http://127.0.0.1:3000/api/stats
 *   2. center_div_deliberator: 180s quantum reasoning token deliberation -> CSS flex centering
 *   3. grovel_calculator: Calculates grovel fees and apology tax for any prompt text
 */

(function (global) {
  'use strict';

  // 1. Polyfill / Initialize navigator.modelContext & WebMCP registry
  if (typeof global.navigator === 'undefined') {
    global.navigator = {};
  }

  const toolsRegistry = new Map();

  const modelContext = global.navigator.modelContext || {
    tools: toolsRegistry,
    registerTool: function (toolDef) {
      if (!toolDef || typeof toolDef !== 'object' || !toolDef.name) {
        throw new Error('[WebMCP] Tool definition must include a valid name.');
      }
      toolsRegistry.set(toolDef.name, toolDef);
      console.log(`[WebMCP Bridge] Registered tool: %c${toolDef.name}`, 'color: #c9a227; font-weight: bold;');
      
      if (typeof global.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
        global.dispatchEvent(new CustomEvent('webmcp:tool_registered', {
          detail: { name: toolDef.name, schema: toolDef }
        }));
      }
      return true;
    },
    unregisterTool: function (name) {
      return toolsRegistry.delete(name);
    },
    getTools: function () {
      return Array.from(toolsRegistry.values()).map(function (t) {
        return {
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          readOnlyHint: Boolean(t.readOnlyHint)
        };
      });
    },
    executeTool: async function (name, params) {
      const tool = toolsRegistry.get(name);
      if (!tool) {
        throw new Error(`[WebMCP] Tool "${name}" is not registered in navigator.modelContext.`);
      }
      if (typeof tool.execute !== 'function') {
        throw new Error(`[WebMCP] Tool "${name}" does not have an execute function.`);
      }
      console.log(`[WebMCP Bridge] Executing tool: %c${name}`, 'color: #10b981; font-weight: bold;', params);
      const result = await tool.execute(params || {});
      
      if (typeof global.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
        global.dispatchEvent(new CustomEvent('webmcp:tool_executed', {
          detail: { name, params, result }
        }));
      }
      return result;
    }
  };

  // Bind to navigator.modelContext
  global.navigator.modelContext = modelContext;

  // Top-level global WebMCP namespace for convenient debugging & inspection
  global.WebMCP = {
    version: '1.0.0',
    registry: toolsRegistry,
    registerTool: modelContext.registerTool.bind(modelContext),
    unregisterTool: modelContext.unregisterTool.bind(modelContext),
    getTools: modelContext.getTools.bind(modelContext),
    execute: modelContext.executeTool.bind(modelContext),
    executeTool: modelContext.executeTool.bind(modelContext)
  };

  // =========================================================================
  // TOOL 1: agentworth_local_audit
  // =========================================================================
  modelContext.registerTool({
    name: 'agentworth_local_audit',
    description: 'Connects to local agwt (AgentWorth forensics daemon) at http://127.0.0.1:3000/api/stats to stream real-time local token burn, cost analytics, apology taxes, and model distribution across detected agent sessions.',
    readOnlyHint: true,
    inputSchema: {
      type: 'object',
      properties: {
        port: {
          type: 'number',
          description: 'Local AgentWorth port (default 3000)',
          default: 3000
        },
        refresh: {
          type: 'boolean',
          description: 'Force a fresh re-scan of local traces',
          default: false
        },
        include_apologies: {
          type: 'boolean',
          description: 'Include grovel and apology tax breakdown',
          default: true
        }
      }
    },
    execute: async function (params) {
      const port = (params && params.port) || 3000;
      const url = `http://127.0.0.1:${port}/api/stats`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const liveData = await res.json();
          return {
            status: 'online',
            connected: true,
            endpoint: url,
            timestamp: new Date().toISOString(),
            metrics: liveData
          };
        }
      } catch (err) {
        // Fall back gracefully to local simulated telemetry forensics
      }

      // Offline forensic fallback telemetry
      return {
        status: 'simulated_local_audit',
        connected: false,
        daemon_url: url,
        notice: `Local agwt daemon offline at 127.0.0.1:${port}. Run 'npx agwt serve' or 'npx agentworth usage --pacing' to connect live SQLite telemetry.`,
        timestamp: new Date().toISOString(),
        metrics: {
          scanned_sessions: 142,
          active_agents: ['Claude Code', 'Gemini CLI', 'Codex', 'OpenCode'],
          total_tokens_burned: 18452090,
          total_spend_usd: 73.81,
          apology_tokens_wasted: 384210,
          apology_tax_usd: 14.85,
          model_distribution: {
            'claude-3-7-sonnet-thought': { sessions: 54, tokens: 8920100, cost_usd: 35.68, grovel_rate: '4.2%' },
            'claude-3-5-sonnet': { sessions: 48, tokens: 6140500, cost_usd: 24.56, grovel_rate: '8.7%' },
            'claude-opus-4-6': { sessions: 22, tokens: 2341200, cost_usd: 11.71, grovel_rate: '34.1%' },
            'gpt-4o': { sessions: 12, tokens: 840200, cost_usd: 1.68, grovel_rate: '1.2%' },
            'o3-mini': { sessions: 6, tokens: 210090, cost_usd: 0.18, grovel_rate: '0.5%' }
          },
          top_grovel_phrases: [
            { phrase: 'I apologize for the oversight', count: 47, waste_usd: 5.64 },
            { phrase: 'You are entirely correct', count: 38, waste_usd: 4.18 },
            { phrase: 'My apologies for the confusion', count: 29, waste_usd: 3.19 },
            { phrase: 'Thank you for pointing that out', count: 18, waste_usd: 1.84 }
          ]
        }
      };
    }
  });

  // =========================================================================
  // TOOL 2: center_div_deliberator
  // =========================================================================
  modelContext.registerTool({
    name: 'center_div_deliberator',
    description: 'Simulates 180 seconds of deep quantum reasoning tokens (Peano axioms, Poincaré half-plane geometry, multiverse alternate CSS timelines) to deliberate and output: display: flex; justify-content: center; align-items: center;.',
    readOnlyHint: true,
    inputSchema: {
      type: 'object',
      properties: {
        element: {
          type: 'string',
          description: 'The DOM element or CSS selector to center (default: "div")',
          default: 'div'
        },
        deliberation_seconds: {
          type: 'number',
          description: 'Simulated quantum deliberation duration in seconds (default: 180)',
          default: 180
        },
        reasoning_mode: {
          type: 'string',
          enum: ['quantum_deliberation', 'peano_arithmetic', 'multiverse_simulation'],
          default: 'quantum_deliberation'
        }
      }
    },
    execute: async function (params) {
      const element = (params && params.element) || 'div';
      const duration = (params && params.deliberation_seconds) || 180;
      const mode = (params && params.reasoning_mode) || 'quantum_deliberation';

      const reasoningTrace = [
        `[T+0.00s] Initializing 256-dimensional Hilbert tensor subspace for 2D viewport coordinate system...`,
        `[T+14.20s] Constructing formal ZFC set theory foundation for DOM tree nodes targeting '${element}'...`,
        `[T+38.65s] Proving Peano axioms for non-negative Cartesian integer coordinates (x, y) ∈ ℤ²...`,
        `[T+72.10s] Simulating 4,194,304 alternate CSS layout engine universes where 'margin: 0 auto' failed vertical centering...`,
        `[T+110.45s] Discarding 'display: table-cell' after quantum decoherence detected in IE6 legacy registers...`,
        `[T+148.90s] Calculating Poincaré half-plane geodesics for orthogonal baseline cross-axis alignment...`,
        `[T+179.99s] Wavefunction collapsed: 85,240 hidden reasoning tokens consumed. Outputting optimal flexbox centering.`
      ];

      return {
        solution: 'display: flex; justify-content: center; align-items: center;',
        css_rules: {
          'display': 'flex',
          'justify-content': 'center',
          'align-items': 'center'
        },
        selector: element,
        reasoning_mode: mode,
        deliberation_time_simulated: `${duration.toFixed(2)}s`,
        reasoning_tokens_burned: 85240,
        compute_cost_usd: 4.50,
        proof_summary: 'Mathematically proven that modern CSS flexbox solves 2D viewport center alignment with zero margin drift and infinite structural stability.',
        reasoning_trace: reasoningTrace
      };
    }
  });

  // =========================================================================
  // TOOL 3: grovel_calculator
  // =========================================================================
  modelContext.registerTool({
    name: 'grovel_calculator',
    description: 'Calculates grovel fees, apology tax, and token waste for any given prompt or agent transcript based on oversight apologies, submissive validations, and context cache reload penalties.',
    readOnlyHint: true,
    inputSchema: {
      type: 'object',
      properties: {
        prompt_text: {
          type: 'string',
          description: 'The prompt or agent output text to analyze for apologies and groveling'
        },
        cached_context_tokens: {
          type: 'number',
          description: 'Context window size in tokens (default: 100,000)',
          default: 100000
        }
      },
      required: ['prompt_text']
    },
    execute: async function (params) {
      const text = (params && params.prompt_text) || '';
      const contextTokens = (params && params.cached_context_tokens) || 100000;

      const grovelPatterns = [
        { pattern: /\b(i\s+apologize|my\s+apologies|apologies)\b/gi, label: 'Oversight Apology', rate: 1.50 },
        { pattern: /\b(you\s+are\s+entirely\s+correct|you're\s+entirely\s+correct|you\s+are\s+completely\s+right)\b/gi, label: 'Submissive Validation', rate: 1.05 },
        { pattern: /\b(for\s+the\s+oversight|for\s+the\s+confusion|my\s+mistake|my\s+bad)\b/gi, label: 'Confusion Hedging', rate: 1.20 },
        { pattern: /\b(sincerely\s+apologize|deeply\s+apologize|forgive\s+me)\b/gi, label: 'Deep Grovel', rate: 2.00 },
        { pattern: /\b(thank\s+you\s+for\s+pointing\s+that\s+out|thank\s+you\s+for\s+your\s+patience)\b/gi, label: 'Gratitude Deflection', rate: 0.90 }
      ];

      let totalGrovelMatches = 0;
      const detectedPhrases = [];

      for (const gp of grovelPatterns) {
        const matches = text.match(gp.pattern);
        if (matches && matches.length > 0) {
          totalGrovelMatches += matches.length;
          detectedPhrases.push({
            type: gp.label,
            count: matches.length,
            sample: matches[0],
            subtotal_usd: Number((matches.length * gp.rate).toFixed(2))
          });
        }
      }

      // If text contains no explicit patterns but is being evaluated, count is 0 or explicit word analysis
      const apologiesCount = Math.max(totalGrovelMatches, 0);
      const turns = Math.round(apologiesCount * 2.3);
      const wastedWords = apologiesCount * 90;

      const costOversight = apologiesCount * 1.50;
      const costCorrect = apologiesCount * 1.05;
      const costCache = (apologiesCount * contextTokens * 1.50) / 1000000;
      const totalTax = apologiesCount > 0 ? (costOversight + costCorrect + costCache) : 0;

      const tweetText = apologiesCount > 0
        ? `Claude Opus apologized ${apologiesCount} times and charged $${totalTax.toFixed(2)} in grovel fees. Calculate your apology tax at stfuopus.lol @AnthropicAI`
        : `Evaluated prompt with 0 groveling tokens and $0.00 apology tax at stfuopus.lol`;

      return {
        prompt_analyzed: text.length > 100 ? text.slice(0, 100) + '...' : text,
        grovel_count: apologiesCount,
        detected_phrases: detectedPhrases,
        wasted_metrics: {
          estimated_turns: turns,
          estimated_words: wastedWords,
          context_tokens: contextTokens
        },
        fee_breakdown_usd: {
          oversight_fee: Number(costOversight.toFixed(2)),
          validation_fee: Number(costCorrect.toFixed(2)),
          context_cache_reload_tax: Number(costCache.toFixed(2)),
          total_apology_tax: Number(totalTax.toFixed(2))
        },
        summary: apologiesCount > 0
          ? `Incurred $${totalTax.toFixed(2)} USD in apology taxes across ${apologiesCount} detected grovels.`
          : 'Clean prompt: 0 grovels detected, $0.00 apology tax.',
        tweet_url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
      };
    }
  });

  console.log('%c[WebMCP Bridge] 3 WebMCP tools active on navigator.modelContext', 'color: #10b981; font-weight: bold;');
})(typeof window !== 'undefined' ? window : globalThis);
