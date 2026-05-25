import { motion } from 'motion/react';
import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Terminal, Database, Activity, ShieldAlert, CheckCircle2, Cpu, Binary, XCircle, Upload, Play, RefreshCw, FileText, Settings, History, X, Lock, CreditCard, ArrowRight, ShieldCheck, TrendingUp, Zap, LockOpen } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import './index.css';

const MOCK_STRATEGIES = [
  { 
    id: 's1', 
    name: 'Quantum Queen MT5', 
    uploaded: '2026-05-13', 
    creator: 'AlgoSys', 
    version: '2.4.1', 
    description: 'High-frequency statistical arbitrage on G10 currencies. Includes aggressive stop-loss logic.',
    history: [
      { version: '2.4.0', uploaded: '2026-05-01', description: 'Quantum Queen standard statistical arbitration release. Optimized exit constraints on volatile regimes.' },
      { version: '2.3.5', uploaded: '2026-04-12', description: 'Production candidate with beta-regsum constraints for MT5 trading pipelines.' }
    ]
  },
  { 
    id: 's2', 
    name: 'Zenox', 
    uploaded: '2026-05-13', 
    creator: 'NivenTech', 
    version: '1.0.5', 
    description: 'Deep learning based pattern recognition for indices. Analyzes sub-second microstructure.',
    history: [
      { version: '1.0.4', uploaded: '2026-05-05', description: 'Zenox pattern recognition v1.0.4. Reduced sub-second delay parameters.' },
      { version: '1.0.0', uploaded: '2026-03-01', description: 'Initial release of index recognition models.' }
    ]
  },
  { id: 's3', name: 'P01_crypto_perps_adapter', uploaded: '2026-05-13', creator: 'Team Alpha', version: '3.1.0', description: 'Perpetual futures adapter with funding rate arbitrage and cross-exchange hedging.', history: [] },
  { id: 's4', name: 'P02_commodity_cta_adapter', uploaded: '2026-05-13', creator: 'Team Alpha', version: '1.2.2', description: 'Trend following CTA strategy applied to metals and energies. Uses multi-timeframe confirmation.', history: [] },
  { id: 's5', name: 'P03_crypto_options_adapter', uploaded: '2026-05-13', creator: 'Sigma Risk', version: '0.9.8-b', description: 'Volatility surface arbitrage on Deribit. Specifically built for BTC and ETH skew trades.', history: [] },
  { id: 's6', name: 'P04_spx_pcs_adapter', uploaded: '2026-05-13', creator: 'Theta Builders', version: '4.0.0', description: 'SPX put credit spread automated seller with strict delta hedging and fast tail-risk cuts.', history: [] },
  { id: 's7', name: 'P08_market_regime_crypto_adapter', uploaded: '2026-05-13', creator: 'Marco Polo', version: '2.2.1', description: 'Switches between momentum and mean reversion based on realtime computed volatility regime.', history: [] }
];

const GAUNTLET_STAGES = [
  { id: 'L0', name: 'DATA_INTEGRITY', category: 'CORE' },
  { id: 'L1', name: 'LOGIC_INTEGRITY', category: 'CORE' },
  { id: 'L1B', name: 'ECON_RATIONALE', category: 'CORE' },
  { id: 'L2A', name: 'RISK_DECOMP', category: 'CORE' },
  { id: 'L2B', name: 'STAT_INTEGRITY', category: 'CORE' },
  { id: 'L2C', name: 'WALK_FORWARD', category: 'CORE' },
  { id: 'L2D', name: 'MONTE_CARLO', category: 'CORE' },
  { id: 'L3', name: 'EXECUTION_SIM', category: 'ADVANCED' },
  { id: 'L4', name: 'STRESS_REPLAY', category: 'ADVANCED' },
  { id: 'L5', name: 'PORTFOLIO_IND', category: 'ADVANCED' },
  { id: 'L6', name: 'EVIDENCE_REPRO', category: 'ADVANCED' },
];

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERR' | 'SYS';
  pid: string;
  message: string;
  hash: string;
}

type StageStatus = 'idle' | 'running' | 'pass' | 'fail';
interface GauntletStageState {
  score: number;
  status: StageStatus;
}

const LOG_LEVELS = ['INFO', 'INFO', 'INFO', 'WARN', 'SYS', 'ERR'] as const;

const STREAM_DETAILS: Record<string, { desc: string, rate: string }> = {
  'TX_0x84A': { desc: 'Transferring optimized weight tensors to agent swarm.', rate: '14.2 MB/s' },
  'RAW_DATA': { desc: 'Injecting unrefined tick data streams for adversarial processing.', rate: '89.1 MB/s' },
  'VAL_TENSOR': { desc: 'Evaluating logic assertions against input models.', rate: '4.5 MB/s' },
  'SIG.P': { desc: 'Signal processing synchronization state.', rate: '1.2 MB/s' },
  'MATRIX_SYNC': { desc: 'Synchronizing environment matrices between swarm nodes.', rate: '0.8 MB/s' },
  'NODE_0': { desc: 'Internal data pipeline between root analysis processes.', rate: '22.0 MB/s' },
  'PIPE': { desc: 'Feeding agent findings back into primary validation loop.', rate: '15.4 MB/s' },
};

const STREAMS = [
  { id: 'TX_0x84A', style: 'top-[25%] left-[25%] w-[8%] border-b border-dashed flex-col justify-end pt-4', label: 'TX_0x84A', labelClass: 'mb-0.5 ml-1', isVertical: false, anim: { duration: 1.5, delay: 0 }, status: 'PROCESSING' },
  { id: 'RAW_DATA', style: 'top-[45%] left-[10%] w-[15%] border-b border-dotted flex-col justify-end pt-4', label: 'RAW_DATA', labelRight: 'SYS_OK', labelClass: 'mb-0.5 ml-1 flex justify-between w-full pr-1', isVertical: false, anim: { duration: 1.2, delay: 0.4 }, status: 'LIVE' },
  { id: 'VAL_TENSOR', style: 'top-[30%] right-[25%] w-[12%] border-b border-dashed pt-4', label: 'VAL_TENSOR', labelClass: 'absolute -top-3 right-0', isVertical: false, anim: { duration: 1.8, delay: 0.2 }, status: 'LIVE' },
  { id: 'SIG.P', style: 'top-[60%] right-[20%] w-[8%] border-b pt-4', label: 'SIG.P', labelClass: 'absolute -top-3 left-0', isVertical: false, anim: { duration: 1.4, delay: 0.7 }, status: 'ERROR' },
  { id: 'MATRIX_SYNC', style: 'top-[80%] right-[25%] w-[15%] border-b border-dotted pt-4', label: 'MATRIX_SYNC', labelClass: 'absolute -top-3 left-1', isVertical: false, anim: { duration: 1.1, delay: 0.1 }, status: 'PROCESSING' },
  { id: 'NODE_0', style: 'top-[5%] left-[48%] h-[35%] border-r border-dashed writing-vertical-rl text-right pl-4 pr-1 -ml-3', label: 'NODE_0', labelClass: 'mr-1 mt-1 block transform -rotate-90 origin-top-right translate-x-full', isVertical: true, anim: { duration: 2, delay: 0.5 }, status: 'LIVE' },
  { id: 'PIPE', style: 'top-[60%] left-[52%] h-[20%] border-r border-dotted writing-vertical-rl text-right pl-4 pr-1 ml-3', label: 'PIPE', labelClass: 'mr-1 mt-1 block transform -rotate-90 origin-top-right translate-x-full', isVertical: true, anim: { duration: 1.6, delay: 0.9 }, status: 'LIVE' },
];

const MOCK_LOGS = [
  "INJECTING ADVERSARIAL PAYLOAD",
  "VERIFYING STATE CHECKSUM",
  "RETICULATING HIDDEN SPLINES",
  "MONTE CARLO ITERATION STEP",
  "DETECTED OVERFIT IN LAYER",
  "AGENT ALPHA FOUND LEAKAGE",
  "RECALCULATING SHARPE RATIO",
  "DATA SCRUBBING COMPLETE",
  "TRIGGERING STRESS REGIME",
  "ECONOMIC RATIONALE PLAUSIBLE",
  "EXECUTING LIQUIDITY TRAPS",
  "EVALUATING DRAWDOWN RISKS",
];

function generateHex(length: number) {
  let result = '';
  const characters = '0123456789ABCDEF';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function incrementVersion(version: string): string {
  const parts = version.split('.');
  if (parts.length === 3) {
    const patch = parseInt(parts[2], 10);
    if (!isNaN(patch)) {
      parts[2] = (patch + 1).toString();
      return parts.join('.');
    }
  }
  return version + '.1';
}

export default function App() {
  const [appMode, setAppMode] = useState<'selection' | 'verification'>('selection');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Quantum Queen MT5');
  const [focusedStrategyId, setFocusedStrategyId] = useState<string | null>(null);

  const [strategies, setStrategies] = useState(MOCK_STRATEGIES);
  const [selectedVersionMap, setSelectedVersionMap] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'deep_analysis_3_99'>('free');
  const selectedPlanRef = useRef<'free' | 'deep_analysis_3_99'>('free');

  useEffect(() => {
    selectedPlanRef.current = selectedPlan;
  }, [selectedPlan]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStrategyName, setPaymentStrategyName] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [matrix, setMatrix] = useState<string[]>(Array(60).fill('0000'));
  const [gauntlet, setGauntlet] = useState<GauntletStageState[]>(
    GAUNTLET_STAGES.map(() => ({ score: 0, status: 'idle' as StageStatus }))
  );
  
  const gauntletRef = useRef<GauntletStageState[]>(
    GAUNTLET_STAGES.map(() => ({ score: 0, status: 'idle' as StageStatus }))
  );
  const failIndicesRef = useRef<number[]>([]);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const runStatusRef = useRef<'idle' | 'running' | 'completed'>('idle');
  
  useEffect(() => {
    runStatusRef.current = runStatus;
  }, [runStatus]);

  const runCountRef = useRef(0);

  const [cpuUsage, setCpuUsage] = useState(0);
  const [activeAgents, setActiveAgents] = useState<number[]>([]);
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Server Strategies');

  const [configPeriod, setConfigPeriod] = useState<'1y' | '3y' | '5y'>('3y');
  const [configRiskScale, setConfigRiskScale] = useState<string>('1.5x');
  const [configSlippage, setConfigSlippage] = useState<'Standard' | 'Adversarial' | 'Stress'>('Adversarial');
  const [configLeverage, setConfigLeverage] = useState<'1:10' | '1:50' | '1:100'>('1:50');

  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [equityData, setEquityData] = useState<{ x: number; y: number }[]>(() => {
    let eq = 10000;
    return Array.from({ length: 60 }).map((_, i) => {
       eq = eq * (1 + (Math.sin(i / 4) * 0.0003));
       return { x: i, y: eq };
    });
  });
  const eqXRef = useRef(60);

  const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = (hasFailed: boolean, failedStages: any[]) => {
    const data = {
      verification_id: `run_${generateHex(12).toLowerCase()}`,
      strategy_name: selectedStrategy,
      plan: selectedPlan === 'deep_analysis_3_99' ? 'NEXUS Deep Analysis' : 'Free Strategy Scan',
      verdict: hasFailed ? 'REJECTED_CONFIRMED_DEFECT' : 'PASSED_ALL_GATES',
      capital_readiness: hasFailed ? 'NOT_READY' : 'READY_FOR_CAPITAL',
      robustness_score: hasFailed ? 'None/100' : '98/100',
      strategy_rank_score: hasFailed ? 38.32 : 92.50,
      verification_mode: 'deterministic_offline',
      timestamp: new Date().toISOString(),
      gate_results: GAUNTLET_STAGES.map((stage, i) => ({
        gate_id: stage.id,
        gate_name: stage.name,
        status: gauntlet[i]?.status || 'idle',
        score: gauntlet[i]?.score || 0
      })),
      remediation: selectedPlan === 'deep_analysis_3_99' 
        ? [
            "Retest Strategy Logic with Simulated Stress Regime (Leverage 1:50, Slippage +1.5x, Backtest 5y)",
            "Introduce soft-stop delta hedging offsets on fast tail-risk events.",
            "Replace hard threshold exits with dynamic mean-reversion regression filters."
          ]
        : [
            "General: Review logic for potential overfitting in recent regimes.",
            "General: Consider adding basic volatility filter for entry conditions.",
            "General: Verify stop-loss execution safety vs. historical slippage spikes.",
            "Note: Detailed adversarial solutions locked. Deep Analysis required for specific parameter remediation."
          ],
      ...(selectedPlan === 'deep_analysis_3_99' ? {
        deep_insights: {
          slippage_sensitivity: {
            optimistic_0_5x: 1.82,
            realistic_1_0x: 1.45,
            conservative_1_5x: 0.98,
            verdict: "Fragile beyond 1.2x"
          },
          reproducibility: {
            git_hash: `0x${generateHex(16).toLowerCase()}`,
            data_parquet_id: `pq_${generateHex(8).toLowerCase()}_v4`,
            indicator_params: "MA_LEN: 24, RSI: 14, VOL_MULT: 1.5"
          },
          regime_performance: {
            bull: { pf: 1.92, win: "68%" },
            bear: { pf: 0.62, win: "32%", warning: "Ticking Time Bomb" },
            sideways: { pf: 1.24, win: "51%" }
          },
          human_audit: "AlgoXpert Team Verified",
          kill_verdict: "CONDITIONAL_DEPLOY: DO NOT DEPLOY if bearer regime detectors signal > 0.8 conf."
        }
      } : {})
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_report_${selectedStrategy.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (hasFailed: boolean) => {
    const headers = ["Field", "Value"];
    const rows = [
      ["Verification ID", `run_${generateHex(12).toLowerCase()}`],
      ["Strategy Name", selectedStrategy],
      ["Plan", selectedPlan === 'deep_analysis_3_99' ? "NEXUS Deep Analysis" : "Free Strategy Scan"],
      ["Verdict", hasFailed ? "REJECTED_CONFIRMED_DEFECT" : "PASSED_ALL_GATES"],
      ["Capital Readiness", hasFailed ? "NOT_READY" : "READY_FOR_CAPITAL"],
      ["Robustness Score", hasFailed ? "None/100" : "98/100"],
      ["Strategy Rank Score", hasFailed ? "38.32/100" : "92.50/100"],
      ["Verification Mode", "deterministic_offline"]
    ];
    
    let csvContent = headers.join(",") + "\n" + rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_report_${selectedStrategy.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (hasFailed: boolean, failedStages: any[]) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NEXUS Deep Verification Ledger - ${selectedStrategy}</title>
        <style>
          body { font-family: sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px; margin: 0; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #262626; padding: 30px; background: #000; }
          .header { border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #06b6d4; letter-spacing: 2px; font-family: monospace; }
          .subtitle { font-size: 11px; color: #737373; margin-top: 5px; font-family: monospace; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          .table th { background: #171717; border: 1px solid #262626; padding: 12px; text-align: left; color: #a3a3a3; }
          .table td { border: 1px solid #262626; padding: 12px; }
          .val { font-weight: bold; font-family: monospace; }
          .badge { padding: 4px 8px; font-size: 10px; font-weight: bold; font-family: monospace; }
          .fail { color: #f87171; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); }
          .pass { color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); }
          .section-title { font-size: 15px; color: #06b6d4; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #262626; padding-bottom: 5px; font-family: monospace; text-transform: uppercase; }
          .recommendation { background: #171717; border: 1px solid #262626; padding: 15px; font-size: 13px; margin-bottom: 30px; line-height: 1.5; }
          .footer { font-size: 11px; color: #525252; border-top: 1px solid #262626; padding-top: 20px; font-style: italic; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">NEXUS VERIFICATION LEDGER</div>
            <div class="subtitle">AUTOMATED ADVERSARIAL ANALYSIS // DEEPLINKSECURE_${generateHex(4).toUpperCase()}</div>
          </div>
          
          <table class="table">
            <thead>
              <tr><th style="width: 40%">Field</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>Strategy Name</td><td class="val">${selectedStrategy}</td></tr>
              <tr><td>Verification ID</td><td class="val">run_${generateHex(12).toLowerCase()}</td></tr>
              <tr><td>Plan Selected</td><td class="val">${selectedPlan === 'deep_analysis_3_99' ? 'NEXUS Deep Analysis' : 'Free Strategy Scan'}</td></tr>
              <tr><td>Verdict</td><td class="val"><span class="badge ${hasFailed ? 'fail' : 'pass'}">${hasFailed ? 'REJECTED_CONFIRMED_DEFECT' : 'PASSED_ALL_GATES'}</span></td></tr>
              <tr><td>Capital Readiness</td><td class="val">${hasFailed ? 'NOT_READY' : 'READY_FOR_CAPITAL'}</td></tr>
              <tr><td>Strategy Rank Score</td><td class="val">${hasFailed ? '38.32/100 (Fixable Defect)' : '92.50/100 (Production Ready)'}</td></tr>
              <tr><td>Verification Mode</td><td class="val">deterministic_offline</td></tr>
            </tbody>
          </table>

          <div class="section-title">Confirmatory Findings</div>
          <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">
            ${hasFailed 
              ? `The strategy demonstrated significant fragility under simulated market regime changes. Decisive failure was identified at gate ${failedStages.map(fs => fs?.id).join(', ')}.`
              : `The strategy successfully bypassed slip stress, Monte Carlo regime-shuffling, and simulated slippage checks with robust alpha preservation across all 11 gates.`
            }
          </p>

          <div class="section-title">Failure Mitigation Suggestions</div>
          <div class="recommendation">
            ${selectedPlan === 'deep_analysis_3_99' 
              ? `<b>Premium Actionable Rectification Steps:</b><br/>
                 1. Retest Strategy Logic with Simulated Stress Regime (Leverage 1:50, Slippage +1.5x, Backtest 5y)<br/>
                 2. Introduce soft-stop delta hedging offsets on fast tail-risk events to capture structural anomalies.<br/>
                 3. Shift optimization metrics away from simple Sortino ratios into adversarial multi-regime fitness levels.`
              : `UPGRADE REQUIRED: Detailed failure mitigations, retested configuration settings and failure-remedy parameters are locked. Upgrade to NEXUS Deep Analysis to unlock.`
            }
          </div>

          ${selectedPlan === 'deep_analysis_3_99' ? `
          <div class="section-title">Deep Adversarial Insights</div>
          <div class="recommendation" style="font-family: monospace; font-size: 11px;">
            <b>REGIME ANALYSIS:</b><br/>
            - BULL: PF 1.92 (Nominal)<br/>
            - BEAR: PF 0.62 (CRITICAL DECAY)<br/>
            - CHOP: PF 1.24 (Stable)<br/><br/>
            <b>SLIPPAGE SENSITIVITY:</b><br/>
            - 0.5x: 1.82 | 1.0x: 1.45 | 1.5x: 0.98<br/>
            Verdict: Strategy edge is fragile to execution volatility.<br/><br/>
            <b>REPRODUCIBILITY TRAIL:</b><br/>
            - GIT_HASH: 0x${generateHex(16).toLowerCase()}<br/>
            - DATA_ID: pq_${generateHex(8).toLowerCase()}_v4<br/><br/>
            <b>ADVISORY VERDICT:</b><br/>
            - STATUS: CONDITIONAL_DEPLOY<br/>
            - KILL CRITERIA: Reject deployment if bearer regime > 0.8 conf.<br/>
            - HUMAN AUDIT: AlgoXpert Certified.
          </div>
          ` : ''}

          <div class="footer">
            Generated automatically by NEXUS Protocol on ${new Date().toUTCString()}. Clean printable stylesheet; print or save as PDF inside browser for physical compliance.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_report_${selectedStrategy.replace(/\s+/g, '_').toLowerCase()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    
    // Basic validation (simulated)
    if (cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 4 || cardCvc.length < 3 || !cardName) {
      setPaymentError("Invalid payment details. Please check all fields.");
      return;
    }
    
    setPaymentStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('success');
      
      // Auto-trigger verification after success
      setTimeout(() => {
        setShowPaymentModal(false);
        handleVerify(paymentStrategyName, 'deep_analysis_3_99');
        // Reset form
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setCardName('');
      }, 1500);
    }, 2500);
  };

  const handleVerify = (strategyName: string, planOverride?: 'free' | 'deep_analysis_3_99') => {
    setSelectedStrategy(strategyName);
    setAppMode('verification');
    setActiveTab('Configuration & Run');
    
    const finalPlan = planOverride !== undefined ? planOverride : selectedPlan;
    setSelectedPlan(finalPlan);
    selectedPlanRef.current = finalPlan;
    
    // Immediately start running gauntlet and visualizations
    resetGauntlet(strategyName, finalPlan);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Basic Client-Side Validation
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
         setUploadError("File exceeds maximum allowed size of 50MB.");
         // Reset value to allow uploading same file again
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }
      
      const parts = file.name.split('.');
      const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
      const allowedExts = ['py', 'txt', 'json', 'mq5', 'ex5'];
      
      if (!allowedExts.includes(ext)) {
         setUploadError(`Invalid format (.${ext}). Allowed: ${allowedExts.join(', ')}`);
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }

      // Deep structure validation for text types
      if (['py', 'txt', 'json', 'mq5'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content.trim() === '') {
             setUploadError("The uploaded file is empty.");
             return;
          }
          // specific structural checks
          if (ext === 'json') {
             try {
                JSON.parse(content);
             } catch (err) {
                setUploadError("Invalid JSON structure in file.");
                return;
              }
          }
          if (ext === 'py') {
            if (!content.includes('class') && !content.includes('def') && !content.includes('import')) {
               setUploadError("Python file lacks basic strategy structure (imports, classes, or functions).");
               return;
            }
          }
          if (ext === 'mq5') {
            if (!content.includes('void') && !content.includes('int') && !content.includes('OnTick')) {
               setUploadError("MQL5 file lacks basic strategy structure (e.g. OnTick).");
               return;
            }
          }
          // Passed validation - Add and select with version register support
          setStrategies(prev => {
            const existingIdx = prev.findIndex(s => s.name.toLowerCase() === file.name.toLowerCase());
            if (existingIdx !== -1) {
              const existing = prev[existingIdx];
              const nextVer = incrementVersion(existing.version);
              const historyItem = {
                version: existing.version,
                uploaded: existing.uploaded,
                description: existing.description
              };
              const updatedHistory = existing.history ? [historyItem, ...existing.history] : [historyItem];
              const updatedStrategy = {
                ...existing,
                version: nextVer,
                uploaded: new Date().toISOString().split('T')[0],
                description: `User-uploaded local rule module v${nextVer}: ${file.name}. Validated signature, ready for premium backtests.`,
                history: updatedHistory
              };
              const newStrategies = [...prev];
              newStrategies[existingIdx] = updatedStrategy;
              
              // Set selection state mapping in microtask
              setTimeout(() => {
                setFocusedStrategyId(existing.id);
                setSelectedVersionMap(vprev => ({ ...vprev, [existing.id]: nextVer }));
              }, 20);
              
              return newStrategies;
            } else {
              const newId = `u-${Date.now()}`;
              const newStrategy = {
                id: newId,
                name: file.name,
                uploaded: new Date().toISOString().split('T')[0],
                creator: 'Local Operator',
                version: '1.0.0',
                description: `User-uploaded local rule module: ${file.name}. Validated signature, ready for premium backtests.`,
                history: []
              };
              
              setTimeout(() => {
                setFocusedStrategyId(newId);
                setSelectedVersionMap(vprev => ({ ...vprev, [newId]: '1.0.0' }));
              }, 20);
              
              return [newStrategy, ...prev];
            }
          });
          if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.onerror = () => {
          setUploadError("Failed to read file.");
          if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsText(file);
      } else {
        // Binary files passing general validation - Add and select with version registry support
        setStrategies(prev => {
          const existingIdx = prev.findIndex(s => s.name.toLowerCase() === file.name.toLowerCase());
          if (existingIdx !== -1) {
            const existing = prev[existingIdx];
            const nextVer = incrementVersion(existing.version);
            const historyItem = {
              version: existing.version,
              uploaded: existing.uploaded,
              description: existing.description
            };
            const updatedHistory = existing.history ? [historyItem, ...existing.history] : [historyItem];
            const updatedStrategy = {
              ...existing,
              version: nextVer,
              uploaded: new Date().toISOString().split('T')[0],
              description: `User-uploaded binary module v${nextVer}: ${file.name}. Ready for sandboxed evaluation.`,
              history: updatedHistory
            };
            const newStrategies = [...prev];
            newStrategies[existingIdx] = updatedStrategy;
            
            setTimeout(() => {
              setFocusedStrategyId(existing.id);
              setSelectedVersionMap(vprev => ({ ...vprev, [existing.id]: nextVer }));
            }, 20);
            
            return newStrategies;
          } else {
            const newId = `u-${Date.now()}`;
            const newStrategy = {
              id: newId,
              name: file.name,
              uploaded: new Date().toISOString().split('T')[0],
              creator: 'Local Operator',
              version: '1.0.0',
              description: `User-uploaded binary module: ${file.name}. Ready for sandboxed evaluation.`,
              history: []
            };
            
            setTimeout(() => {
              setFocusedStrategyId(newId);
              setSelectedVersionMap(vprev => ({ ...vprev, [newId]: '1.0.0' }));
            }, 20);
            
            return [newStrategy, ...prev];
          }
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const resetGauntlet = (strategyNameOverride?: string, planOverride?: 'free' | 'deep_analysis_3_99') => {
    const targetStrategyName = strategyNameOverride || selectedStrategy;
    const currentPlan = planOverride || selectedPlan;
    const initial = GAUNTLET_STAGES.map(() => ({ score: 0, status: 'idle' as StageStatus }));
    gauntletRef.current = initial;
    setGauntlet(initial);
    runCountRef.current += 1;
    
    // Always random failures to simulate reality, never guaranteed pass
    const fails: number[] = [];
    const numFails = Math.random() > 0.8 ? 0 : (Math.random() > 0.5 ? 1 : 2);
    while(fails.length < numFails) {
      const r = Math.floor(Math.random() * GAUNTLET_STAGES.length); 
      if (!fails.includes(r)) fails.push(r);
    }
    
    // if no fails, maybe one final check is hard
    failIndicesRef.current = fails;

    // Start with rich verification dispatch logs
    const t = new Date().toISOString().split('T')[1].slice(0, -1);
    const modeLabel = currentPlan === 'deep_analysis_3_99' ? 'NEXUS DEEP ANALYSIS (PREMIUM DETECTOR)' : 'STANDARD FREE SCAN';
    setLogs([
      {
        id: 'start-0',
        timestamp: t,
        level: 'SYS',
        pid: `0x${generateHex(4)}`,
        message: `LAUNCHING ADVERSARIAL GAUNTLET FOR ${targetStrategyName.toUpperCase()}`,
        hash: generateHex(8)
      },
      {
        id: 'start-1',
        timestamp: t,
        level: 'INFO',
        pid: `0x${generateHex(4)}`,
        message: `MODE: ${modeLabel} // DETECT_LEVEL: max_resolution`,
        hash: generateHex(8)
      },
      {
        id: 'start-2',
        timestamp: t,
        level: 'INFO',
        pid: `0x${generateHex(4)}`,
        message: `PARAMS: WINDOW=${configPeriod.toUpperCase()} | LEVERAGE=${configLeverage} | IMP_MODEL=${configSlippage.toUpperCase()}`,
        hash: generateHex(8)
      }
    ]);

    // Reset equity curve baseline so it can simulate a fresh build
    let eq = 10000;
    const initialEquity = Array.from({ length: 60 }).map((_, i) => {
       eq = eq * (1 + (Math.sin(i / 4) * 0.0003));
       return { x: i, y: eq };
    });
    setEquityData(initialEquity);
    eqXRef.current = 60;

    setRunStatus('running');
  };

  useEffect(() => {
    // Initial static logs on mount
    const t = new Date().toISOString().split('T')[1].slice(0, -1);
    setLogs([
      {
        id: 'init-0',
        timestamp: t,
        level: 'SYS',
        pid: '0x0000',
        message: 'NEXUS INTEL ENGINE INITIALIZED // STATIC CONFIG_READY',
        hash: '0x00000000'
      },
      {
        id: 'init-1',
        timestamp: t,
        level: 'SYS',
        pid: '0x0000',
        message: 'AWAITING OPERATOR CONTEXT // CHOOSE PARAMETERS AND DEPLOY RUN',
        hash: '0x00000000'
      }
    ]);
  }, []);

  // Engine loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Keep everything stationary when not actively running verification
      if (runStatusRef.current !== 'running') {
        if (runStatusRef.current === 'idle') {
          setCpuUsage(1.8);
          setActiveAgents([]);
        }
        return;
      }

      // Update logs randomly but slower (smooth flow)
      if (Math.random() > 0.5) {
        setLogs(prev => {
          const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
          const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)];
          const message = MOCK_LOGS[Math.floor(Math.random() * MOCK_LOGS.length)];
          const pid = `0x${generateHex(4)}`;
          const hash = generateHex(8);
          const newLog: LogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp,
            level,
            pid,
            message,
            hash
          };
          return [newLog, ...prev].slice(0, 24);
        });
        setActiveAgents([Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)]);
      } else {
        if (Math.random() > 0.7) {
          setActiveAgents([]);
        }
      }

      // Equity Curve simulation (positive growth) - runs slowly and smoothly
      eqXRef.current += 1;
      setEquityData(prev => {
        const lastVal = prev[prev.length - 1].y;
        // Make the growth highly realistic, subtle and gradual
        const baseGrow = 0.0018; // steady slower drift
        const jitter = (Math.random() * 0.01) - 0.004; 
        const newVal = lastVal * (1 + baseGrow + jitter);
        return [...prev.slice(1), { x: eqXRef.current, y: newVal }];
      });

      // Update matrix - slightly slower ticking effect
      if (Math.random() > 0.4) {
        setMatrix(prev => prev.map(() => generateHex(4)));
      }
      
      // CPU jitter matching heavy load during processing
      setCpuUsage(Math.floor(52 + Math.random() * 25));

      const next = [...gauntletRef.current];
      const activeIdx = next.findIndex(s => s.status === 'running');

      if (activeIdx === -1) {
        let lastRunIdx = -1;
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].status !== 'idle') {
            lastRunIdx = i;
            break;
          }
        }

        const idleIdx = next.findIndex(s => s.status === 'idle');
        if (idleIdx !== -1) {
          next[idleIdx] = { ...next[idleIdx], status: 'running', score: 0 };
        } else {
          // Gauntlet completed
          setRunStatus('completed');
        }
      } else {
        const stage = { ...next[activeIdx] };
        const isFail = failIndicesRef.current.includes(activeIdx);
        const threshold = 65 + Math.random() * 20; // Random fail threshold %

        // Slower and smoother increments, L0-L6 run faster per user request
        const incrementAmount = activeIdx <= 6 
          ? (Math.random() * 3.5) + 2.5 
          : (Math.random() * 1.5) + 0.8;
        stage.score += incrementAmount;

        if (isFail && stage.score >= threshold) {
          stage.score = threshold;
          stage.status = 'fail';
          // Inject an explicit failure log
          setLogs(prev => {
            const newLog: LogEntry = {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toISOString().split('T')[1].slice(0, -1),
              level: 'ERR',
              pid: `0x${generateHex(4)}`,
              message: `CRITICAL FAILURE IN ${GAUNTLET_STAGES[activeIdx].name}`,
              hash: generateHex(8)
            };
            return [newLog, ...prev].slice(0, 24);
          });
        } else if (!isFail && stage.score >= 100) {
          stage.score = 100;
          stage.status = 'pass';
        }
        next[activeIdx] = stage;
      }

      gauntletRef.current = next;
      setGauntlet(next);

    }, 120); // 120ms interval for ultra-smooth and slow, elegant visualization

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono overflow-hidden flex flex-col items-center justify-center relative selection:bg-white selection:text-black">
      
      {/* Noise background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]"></div>

      <div className="w-full min-h-screen md:min-h-0 md:h-[90vh] max-w-[1600px] border border-neutral-800 bg-black/80 flex flex-col relative shadow-[0_0_100px_rgba(255,255,255,0.05)] ring-1 ring-white/5 overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-10 border-b border-neutral-800 flex items-center justify-between px-4 text-xs tracking-widest text-neutral-500 bg-neutral-950/50 shrink-0">
          <div className="flex items-center gap-4">
            <span className="animate-pulse">● REC</span>
            <span>NEXUS_CORE // v7.4.2</span>
          </div>
          <div className="flex items-center gap-6 hidden md:flex">
            <span>SYS.LOAD: {cpuUsage}%</span>
            <span>NET.THROUGHPUT: {generateHex(6)} B/s</span>
            <span>MEM: 0x{generateHex(8)}</span>
          </div>
        </div>

        <div className="w-full bg-black/50 text-white flex flex-col shrink-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
               <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Nexus Verification GUI</h1>
               <div className="flex items-center gap-4">
                 <span className="text-emerald-400 text-sm">Logged In</span>
                 <button className="px-4 py-1 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition-colors text-sm">Logout</button>
               </div>
            </div>
            <div className="flex justify-center border-b border-neutral-800">
               {['Server Strategies', 'Configuration & Run', 'NEXUS Explainer', 'Final Report', 'History'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm transition-all tracking-wide ${activeTab === tab ? 'border-b-2 border-white text-white bg-white/5 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
        </div>

        {/* Main Area based on activeTab */}
        {activeTab === 'Server Strategies' ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-end items-center shrink-0 mb-2">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 px-4 py-2 border border-emerald-900 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] mr-4"
               >
                 <Upload className="w-4 h-4" />
                 Upload Strategy (Local)
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
                 accept=".py,.txt,.json,.mq5,.ex5"
               />

               <button className="flex items-center gap-2 px-4 py-2 border border-cyan-900 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/50 transition-all">
                 <RefreshCw className="w-4 h-4" />
                 Refresh Strategies
               </button>
            </div>
            
            {uploadError && (
              <div className="mb-4 bg-red-950/30 border border-red-900/50 text-red-400 p-3 text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><XCircle className="w-4 h-4 shrink-0" /> {uploadError}</span>
                <button onClick={() => setUploadError(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="flex-1 flex gap-6 min-h-0">
               {/* Strategy List */}
               <div className="w-1/3 xl:w-1/4 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {strategies.map(strategy => {
                    const isSelected = focusedStrategyId === strategy.id;
                    return (
                      <div 
                        key={strategy.id} 
                        onClick={() => setFocusedStrategyId(strategy.id)}
                        className={`flex items-center justify-between p-4 border transition-all cursor-pointer group ${isSelected ? 'border-cyan-500 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-neutral-800 bg-neutral-900/30 hover:bg-neutral-800/50'}`}
                      >
                         <div className="flex-1 flex items-start gap-4">
                           <div className="mt-1">
                             <FileText className={`w-5 h-5 transition-colors ${isSelected ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-white'}`} />
                           </div>
                           <div>
                             <div className={`font-bold transition-all mb-1 ${isSelected ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-neutral-200 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'}`}>
                               {strategy.name}
                             </div>
                             <div className="text-[10px] text-neutral-500 flex gap-4">
                               <span>Uploaded: {strategy.uploaded}</span>
                               <span>v{strategy.version}</span>
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           {isSelected ? (
                             <span className="text-[10px] tracking-wider text-cyan-400 font-mono bg-cyan-950/50 px-2.5 py-1 border border-cyan-800 uppercase">Selected</span>
                           ) : (
                             <span className="text-[10px] tracking-wider text-neutral-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Click to Analyze</span>
                           )}
                         </div>
                      </div>
                    );
                  })}
               </div>

               {/* Strategy Details Sidebar */}
               {focusedStrategyId ? (
                 <div className="w-2/3 xl:w-3/4 border border-neutral-800 bg-neutral-900/40 p-8 flex flex-col relative overflow-y-auto custom-scrollbar">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Settings className="w-32 h-32" />
                   </div>
                                      {(() => {
                      const strategy = strategies.find(s => s.id === focusedStrategyId);
                      if (!strategy) return null;
                      
                      const selectedVer = selectedVersionMap[strategy.id] || strategy.version;
                      const activeDetail = selectedVer === strategy.version 
                        ? strategy 
                        : (strategy.history?.find(h => h.version === selectedVer) || strategy);
                      
                      return (
                        <>
                          <h2 className="text-3xl font-black text-white mb-2 relative z-10 tracking-tight">{strategy.name}</h2>
                          <div className="flex flex-wrap gap-3 mb-6 relative z-10 shrink-0">
                            <span className="px-3 py-1 text-xs border border-cyan-900 bg-cyan-950/30 text-cyan-400 font-bold tracking-tight">v{activeDetail.version}</span>
                            <span className="px-3 py-1 text-xs border border-neutral-700 bg-neutral-800 text-neutral-300 font-mono uppercase tracking-widest leading-none flex items-center">AUTHOR: {strategy.creator}</span>
                          </div>

                          {/* Version Registry Dropdown */}
                          {strategy.history && strategy.history.length > 0 && (
                            <div className="mb-4 bg-neutral-950/40 p-3 border border-neutral-850 relative z-10 shrink-0">
                              <label className="text-[9px] tracking-widest text-neutral-500 font-bold block mb-1 uppercase font-mono">
                                VERSION REGISTER
                              </label>
                              <select 
                                value={selectedVer}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedVersionMap(prev => ({ ...prev, [strategy.id]: val }));
                                }}
                                className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-xs text-neutral-200 px-2.5 py-1 font-mono transition-colors focus:border-cyan-500 focus:outline-none cursor-pointer"
                              >
                                <option value={strategy.version}>v{strategy.version} (Active / Latest)</option>
                                {strategy.history.map(hist => (
                                  <option key={hist.version} value={hist.version}>
                                    v{hist.version} (Uploaded: {hist.uploaded})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="space-y-4 flex-1 relative z-10 overflow-y-auto custom-scrollbar animate-fadeIn">
                             <div>
                               <div className="text-[10px] text-neutral-500 mb-1">DESCRIPTION</div>
                               <div className="text-sm text-neutral-300 leading-relaxed">{activeDetail.description}</div>
                             </div>
                             <div>
                               <div className="text-[10px] text-neutral-500 mb-1">LAST UPLOAD</div>
                               <div className="text-sm text-neutral-300">{activeDetail.uploaded}</div>
                             </div>
                             <div>
                               <div className="text-[10px] text-neutral-500 mb-1">CHECKSUM</div>
                               <div className="text-sm font-mono text-neutral-400">0x{generateHex(16)}</div>
                             </div>
                          </div>

                          {/* Plan Selection Card Group */}
                          <div className="mt-8 border-t border-neutral-800 pt-8 shrink-0 relative z-10">
                             <div className="text-sm font-bold tracking-widest text-neutral-400 uppercase mb-4">
                               Free Scan or Deep Analysis?
                             </div>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                             {/* Free Scan Selection Card */}
                             <div className="border border-neutral-800 bg-neutral-950/40 p-6 transition-all hover:border-neutral-700 relative group flex flex-col">
                               <div className="flex justify-between items-start">
                                 <div>
                                   <h3 className="text-sm font-bold text-neutral-200">Free Strategy Scan</h3>
                                   <p className="text-xs text-neutral-500 mt-1">Automated logical verification for strategy architecture.</p>
                                 </div>
                                 <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-1 font-mono uppercase font-semibold">FREE</span>
                               </div>
                               <ul className="text-xs text-neutral-500 space-y-2 mt-4 pl-4 list-disc">
                                 <li><span className="font-bold text-neutral-400">Core Logic Audit</span>: Basic weakness identification</li>
                                 <li><span className="font-bold text-neutral-400">Surface Risk</span>: Volatility & Leverage signal checks</li>
                                 <li><span className="font-bold text-neutral-400">Monte Carlo Lite</span>: 50 iterations for base stability</li>
                                 <li><span className="font-bold text-neutral-400">Benchmark Drift</span>: Correlation vs. BTC/SPX</li>
                                 <li><span className="font-bold text-neutral-400">DD Stress</span>: Max Drawdown duration analysis</li>
                               </ul>
                               <button 
                                 onClick={() => handleVerify(strategy.name, 'free')}
                                 className="w-full mt-5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-sm py-2.5 uppercase tracking-wider font-bold transition-all cursor-pointer active:scale-[0.98]"
                               >
                                 Start Free Scan
                               </button>
                             </div>

                             {/* Paid Deep Analysis Selection Card */}
                             <div className="border-2 border-cyan-500 bg-cyan-950/20 p-6 relative shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col">
                               <div className="absolute top-0 right-0 bg-cyan-500 text-black font-extrabold text-[10px] px-2 py-0.5 tracking-widest uppercase shadow-sm">
                                 Beta Offer
                               </div>
                               <div className="absolute top-0 left-0 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 tracking-widest uppercase shadow-sm flex items-center gap-1">
                                 <TrendingUp className="w-2.5 h-2.5" />
                                 92% OFF
                               </div>
                               <div className="flex justify-between items-start mt-4">
                                 <div>
                                   <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                                     <Cpu className="w-4 h-4 animate-pulse shrink-0" />
                                     NEXUS Deep Analysis
                                   </h3>
                                   <p className="text-xs text-cyan-300/70 mt-1">Go deeper into what may break, why it may break, and what to retest next. <span className="text-cyan-400 font-bold tracking-tighter uppercase italic block mt-1">Phase 1 Early Access</span></p>
                                 </div>
                                 <div className="text-right flex flex-col items-end shrink-0">
                                   <div className="flex flex-col items-end">
                                     <span className="text-xs text-neutral-500 line-through decoration-red-500/50 leading-none mb-1 font-mono">$49.00</span>
                                     <div className="relative group/price">
                                       <span className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] tabular-nums">$3.99</span>
                                       <div className="absolute -inset-1 bg-cyan-400/10 blur-md rounded-full -z-10 group-hover:bg-cyan-400/20 transition-all"></div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                               <ul className="text-xs text-neutral-300 space-y-2 mt-4 pl-4 list-disc">
                                 <li>Hidden weakness detection</li>
                                 <li>Execution / slippage / regime risk insights</li>
                                 <li>Failure-mode breakdown</li>
                                 <li>Retest suggestions</li>
                                 <li>Enhanced human audit with AlgoXpert team</li>
                                 <li>Stronger NEXUS report output</li>
                               </ul>
                               <button 
                                 onClick={() => { setPaymentStrategyName(strategy.name); setPaymentStep('form'); setPaymentError(null); setShowPaymentModal(true); }}
                                 className="w-full mt-5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm py-3 uppercase tracking-widest font-extrabold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer active:scale-[0.98]"
                               >
                                 Unlock Deep Analysis — $3.99
                               </button>
                             </div>

                             </div>

                             <p className="text-[10px] text-neutral-500 leading-relaxed text-center mt-6 font-sans italic opacity-60">
                               NEXUS does not provide financial advice, trading signals, or performance guarantees. Reports are for strategy logic verification only.
                             </p>
                          </div>
                        </>
                      );
                   })()}
                 </div>
               ) : (
                 <div className="w-2/3 xl:w-3/4 border border-neutral-800 border-dashed bg-neutral-900/10 p-6 flex flex-col items-center justify-center text-neutral-600">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm text-center px-4">Select a strategy from the list to view its details and verification options.</p>
                 </div>
               )}
            </div>
          </div>
        ) : activeTab === 'Configuration & Run' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 relative min-h-0 overflow-y-auto md:overflow-hidden">

          
          {/* Data Streams Overlay */}
          <div className="hidden md:block absolute inset-0 pointer-events-none z-20 overflow-hidden text-[8px] text-white/50 font-mono">
            {STREAMS.map((stream) => {
              const isActive = activeStream === stream.id;
              return (
                <div 
                  key={stream.id}
                  className={`absolute flex pointer-events-auto cursor-crosshair transition-all duration-300 ${stream.style} ${isActive ? 'border-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] z-30' : 'border-neutral-700 text-white/50'}`}
                  onMouseEnter={() => setActiveStream(stream.id)}
                  onMouseLeave={() => setActiveStream(null)}
                >
                  <span className={`${stream.labelClass} transition-colors ${isActive ? 'text-white' : ''}`}>
                     {stream.labelRight ? (
                       <span className="flex justify-between w-full items-center">
                         <span className="flex items-center gap-1.5">
                           <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stream.status === 'ERROR' ? 'bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]' : stream.status === 'PROCESSING' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]'}`}></span>
                           {stream.label}
                         </span>
                         <span>{stream.labelRight}</span>
                       </span>
                     ) : (
                       <span className="flex items-center gap-1.5">
                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stream.status === 'ERROR' ? 'bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]' : stream.status === 'PROCESSING' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]'}`}></span>
                         {stream.label}
                       </span>
                     )}
                  </span>
                  <motion.div 
                    animate={runStatus === 'running' ? (stream.isVertical ? { height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] } : { width: ['0%', '100%', '0%'], left: ['0%', '0%', '100%'] }) : (stream.isVertical ? { height: '0%' } : { width: '0%' })} 
                    transition={runStatus === 'running' ? { duration: stream.anim.duration, repeat: Infinity, ease: 'linear', delay: stream.anim.delay } : { duration: 0 }}
                    className={`absolute transition-all duration-300 bg-white ${stream.isVertical ? '-right-[1px] w-[2px]' : '-bottom-[1px] h-[2px]'} ${isActive ? 'shadow-[0_0_15px_3px_rgba(255,255,255,1)]' : 'shadow-[0_0_8px_rgba(255,255,255,0.5)] opacity-50'}`} 
                  />
                  
                  {/* Tooltip Overlay */}
                  {isActive && (
                    <div className={`absolute border border-neutral-700 bg-neutral-950/95 backdrop-blur-sm p-3 w-56 shadow-[0_4px_20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 text-left z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none ${stream.isVertical ? 'top-1/2 left-8' : 'top-full left-0 mt-4'}`} style={{ writingMode: 'horizontal-tb' }}>
                      <div className="font-bold border-b border-neutral-800 mb-2 pb-2 text-white truncate flex items-center gap-2">
                        <span className="w-2 h-2 bg-white animate-pulse"></span>
                        {stream.id} STREAM
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-neutral-500">STATUS:</span>
                        <span className={`flex items-center gap-1 font-bold ${stream.status === 'ERROR' ? 'text-red-400' : stream.status === 'PROCESSING' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {stream.status} <span className="text-[8px] animate-pulse">●</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-500">THROUGHPUT:</span>
                        <span className="text-neutral-300 font-mono">{STREAM_DETAILS[stream.id].rate}</span>
                      </div>
                      <div className="text-neutral-400 mt-2 pt-2 border-t border-neutral-800 leading-relaxed whitespace-normal break-words">{STREAM_DETAILS[stream.id].desc}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Left Column: Input Model & Matrix */}
          <div className="col-span-1 md:col-span-3 border-r border-neutral-800 flex flex-col bg-neutral-950/20 relative z-10 min-h-[400px] md:min-h-0">
            <div className="p-2 border-b border-neutral-800 text-[10px] tracking-widest text-neutral-400 font-bold bg-neutral-900/50 shrink-0">
              [01] // THREAD_0xINIT
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-1">
                <Database className="w-5 h-5 text-neutral-300" />
                <div>
                  <div className="text-sm font-bold">SOURCE_MODEL.PY</div>
                  <div className="text-[10px] text-neutral-600">SIZE: 14.2 MB | ENC: UTF-8</div>
                </div>
              </div>

              {/* Data Hex Grid */}
              <div className="h-28 overflow-hidden font-mono text-[10px] leading-none text-neutral-500 relative border border-neutral-800/80 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10 pointer-events-none"></div>
                <div className="grid grid-cols-5 gap-0 opacity-80 h-full content-start">
                  {matrix.map((val, i) => (
                    <span key={i} className={`border border-neutral-800/50 p-1 flex items-center justify-center ${i % 7 === 0 ? 'text-white bg-white/5' : ''}`}>{val}</span>
                  ))}
                </div>
              </div>

              {/* Sleek Parameter Configuration Form */}
              <div className="border-t border-neutral-800/60 pt-3 flex-1 flex flex-col justify-between min-h-0">
                <div className="space-y-3">
                  <div className="text-[10px] tracking-wider text-neutral-400 font-bold uppercase mb-2 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    RUN CONFIGURATION
                  </div>

                  {/* Backtest Window Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-wider text-neutral-500 block">HISTORICAL BACKTEST WINDOW</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['1y', '3y', '5y'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => runStatus === 'idle' && setConfigPeriod(p)}
                          disabled={runStatus === 'running'}
                          className={`py-1 text-[10px] border font-bold uppercase transition-all tracking-wider ${
                            configPeriod === p
                              ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                              : 'border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slippage Mode Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-wider text-neutral-500 block">ADVERSARIAL IMPACT MODEL</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Standard', 'Adversarial', 'Stress'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => runStatus === 'idle' && setConfigSlippage(s)}
                          disabled={runStatus === 'running'}
                          className={`py-1 text-[9px] border font-bold uppercase transition-all tracking-wider ${
                            configSlippage === s
                              ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                              : 'border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Leverage Limit Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-wider text-neutral-500 block">CAPITAL LEVERAGE RATIO</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['1:10', '1:50', '1:100'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => runStatus === 'idle' && setConfigLeverage(l)}
                          disabled={runStatus === 'running'}
                          className={`py-1 text-[10px] border font-bold uppercase transition-all tracking-wider ${
                            configLeverage === l
                              ? 'border-neutral-400 bg-neutral-900 text-neutral-200'
                              : 'border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  {/* Jittering Metrics */}
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-neutral-500"><span>IN_NODE_0xINIT</span><span className="text-neutral-400">{generateHex(4)}</span></div>
                    <div className="flex justify-between text-neutral-500"><span>IN_NODE_0xPROX</span><span className="text-neutral-400">{generateHex(4)}</span></div>
                    <div className="w-full bg-neutral-900 h-1 mt-1 rounded-sm overflow-hidden">
                      <div className="bg-white h-full transition-all duration-75" style={{ width: runStatus === 'running' ? `${Math.random() * 100}%` : '5%' }}></div>
                    </div>
                  </div>

                  {/* GLOWING ACTION BUTTON */}
                  {runStatus === 'idle' ? (
                    <button
                      onClick={resetGauntlet}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-emerald-500 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all font-bold tracking-widest text-xs relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer active:scale-95 duration-150"
                    >
                      <Play className="w-3.5 h-3.5 fill-current animate-pulse md:inline" />
                      VERIFY STRATEGY
                    </button>
                  ) : runStatus === 'running' ? (
                    <div className="w-full py-3 border border-yellow-500/50 bg-yellow-950/10 text-yellow-500 text-center text-xs tracking-widest font-bold select-none anim-pulse flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
                      VERIFYING_ACTIVE...
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVerify(selectedStrategy)}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-700 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all font-bold tracking-widest text-xs cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      RE-RUN SETUP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Agent Swarm & Logs */}
          <div className="col-span-1 md:col-span-6 border-r border-neutral-800 flex flex-col relative bg-black min-h-[400px] md:min-h-0">
            
            {/* Top: Backtesting Demo */}
            <div className="h-1/2 border-b border-neutral-800 relative p-4 flex flex-col">
               <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                 <Activity className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] text-neutral-500">BACKTEST_EQ_CURVE</span>
               </div>
               
               {/* Background Swarm Agents */}
               <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none mix-blend-screen">
                 <motion.div 
                    animate={runStatus === 'running' ? { rotate: 360 } : { rotate: 0 }}
                    transition={runStatus === 'running' ? { duration: 20, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
                    className="absolute w-48 h-48 border border-neutral-800 border-dashed rounded-full"
                 />
                 {[0, 1, 2, 3].map((i) => {
                   const isActive = activeAgents.includes(i);
                   return (
                   <motion.div
                     key={i}
                     animate={runStatus === 'running' ? { rotate: 360 } : { rotate: i * 90 }}
                     transition={runStatus === 'running' ? { duration: 10 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.5 } : { duration: 0 }}
                     className="absolute w-60 h-60 border border-transparent rounded-full flex items-start justify-center"
                   >
                     <motion.div 
                        initial={false}
                        animate={{ 
                           scale: isActive ? 1.15 : 1,
                           backgroundColor: isActive ? '#262626' : '#171717',
                           color: isActive ? '#f5f5f5' : '#737373',
                           borderColor: isActive ? '#525252' : '#404040',
                           boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.3)' : 'none'
                        }}
                        transition={{ duration: 0.2 }}
                        className="p-1.5 border rounded-md relative"
                     >
                       {isActive && (
                          <motion.div 
                             initial={{ scale: 1, opacity: 0.5 }}
                             animate={{ scale: 1.8, opacity: 0 }}
                             transition={{ duration: 0.6, ease: "easeOut" }}
                             className="absolute inset-0 border border-white/40 rounded-md"
                          />
                       )}
                       <Binary className="w-4 h-4 relative z-10" />
                     </motion.div>
                   </motion.div>
                 )})}
               </div>

               <div className="flex-1 w-full h-full relative z-10" style={{ overflow: 'hidden' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={equityData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                     <YAxis domain={['auto', 'auto']} hide />
                     <Line 
                       type="monotone" 
                       dataKey="y" 
                       stroke="#10b981" 
                       strokeWidth={2} 
                       dot={false}
                       isAnimationActive={false}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
               <div className="absolute bottom-2 left-2 flex gap-4 text-[10px] z-20">
                 <div className="border border-neutral-800 px-2 bg-black text-neutral-500 max-w-[150px] md:max-w-[200px] truncate">
                    STRATEGY: {selectedStrategy}
                 </div>
                 <div className="border border-emerald-900 px-2 bg-emerald-950/50 text-emerald-400 font-bold tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    EQ: ${equityData[equityData.length - 1]?.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </div>
               </div>
            </div>

            {/* Bottom: Fast Logs */}
            <div className="h-1/2 flex flex-col">
              <div className="flex items-center gap-2 p-2 border-b border-neutral-800 bg-neutral-900/30 text-[10px] text-neutral-400 shrink-0">
                <Terminal className="w-3 h-3" />
                STD_OUT // TAIL -F
              </div>
              <div className="flex-1 p-3 overflow-hidden text-[10px] font-mono leading-relaxed text-neutral-500 relative flex flex-col justify-start">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-10"></div>
                 {logs.map((log, i) => (
                   <div key={log.id} className={`flex gap-3 whitespace-nowrap mb-0.5 ${i === 0 ? 'text-white' : i < 3 ? 'text-neutral-300' : 'text-neutral-600'}`}>
                     <span className="text-neutral-500 min-w-[75px]">[{log.timestamp}]</span>
                     <span className={`w-8 ${log.level === 'ERR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : log.level === 'SYS' ? 'text-cyan-500' : 'text-neutral-400'}`}>
                       {log.level}
                     </span>
                     <span className="text-neutral-500 w-16">[{log.pid}]</span>
                     <span className="flex-1 truncate">{log.message}</span>
                     <span className="text-neutral-600 hidden lg:inline-block border-l border-neutral-800 pl-2">{log.hash}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Right Column: 11-Layer Gauntlet */}
          <div className="col-span-1 md:col-span-3 flex flex-col bg-neutral-950/20 relative min-h-[500px] md:min-h-0">
            <div className="p-2 border-b border-neutral-800 text-[10px] tracking-widest text-neutral-400 font-bold bg-neutral-900/50 flex justify-between shrink-0">
              <span>[03] // GAUNTLET_EVAL</span>
              <span className="animate-pulse text-white">X_EXECUTION</span>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center gap-2 overflow-y-auto">
              {GAUNTLET_STAGES.map((stageInfo, i) => {
                const stage = gauntlet[i] || { score: 0, status: 'idle' };
                const { score, status } = stage;
                const isComplete = status === 'pass';
                const isFailed = status === 'fail';
                const isRunning = status === 'running';

                let borderClass = 'border-neutral-800 text-neutral-600';
                let bgClass = 'bg-transparent';
                let shadowClass = '';
                let dotClass = 'bg-neutral-800';
                let textClass = 'text-neutral-600';

                if (isComplete) {
                  borderClass = 'border-emerald-500';
                  bgClass = 'bg-emerald-950/30';
                  shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                  dotClass = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]';
                  textClass = 'text-emerald-300';
                } else if (isFailed) {
                  borderClass = 'border-red-500';
                  bgClass = 'bg-red-950/30';
                  shadowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.4)]';
                  dotClass = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]';
                  textClass = 'text-red-400';
                } else if (isRunning) {
                  borderClass = 'border-white';
                  bgClass = 'bg-white/10';
                  shadowClass = 'shadow-[0_0_15px_rgba(255,255,255,0.2)]';
                  dotClass = 'bg-white animate-ping';
                  textClass = 'text-white drop-shadow-md';
                }

                return (
                  <motion.div 
                    key={stageInfo.id} 
                    animate={isFailed ? { y: [0, -3, 0] } : { y: 0 }}
                    transition={isFailed ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                    className={`border p-2 px-3 text-[10px] relative overflow-hidden transition-all duration-300 ${borderClass} ${bgClass} ${shadowClass} ${textClass}`}
                  >
                    
                    {/* Background Progress */}
                    <div className={`absolute top-0 left-0 h-full ${isComplete ? 'bg-emerald-500/10' : isFailed ? 'bg-red-500/20' : 'bg-white/10'}`} style={{ width: `${score}%` }}></div>
                    
                    {/* Running Highlight */}
                    {isRunning && (
                       <motion.div 
                         initial={{ left: '-20%' }}
                         animate={{ left: '120%' }}
                         transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                         className="absolute inset-0 w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                       />
                    )}

                    {/* Passing Flash Animation */}
                    {isComplete && (
                      <motion.div 
                        initial={{ left: '-100%' }}
                        animate={{ left: '200%' }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent skew-x-12"
                      />
                    )}

                    {/* Failing Flash Animation */}
                    {isFailed && (
                      <motion.div 
                        initial={{ left: '-100%' }}
                        animate={{ left: '200%' }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-red-500/30 to-transparent skew-x-12"
                      />
                    )}

                    <div className="flex justify-between items-center relative z-10 h-full w-full">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 shrink-0 ${dotClass}`}></span>
                        <span className={`w-8 font-bold leading-none flex items-center ${isComplete ? 'text-emerald-400' : isFailed ? 'text-red-400' : ''}`}>{stageInfo.id}</span>
                        <span className="truncate leading-none flex items-center uppercase text-[8px] font-mono opacity-60">[{stageInfo.category}]</span>
                        <span className="truncate leading-none flex items-center">{stageInfo.name}</span>
                      </div>
                      <div className={`font-mono tabular-nums w-12 text-right leading-none flex items-center justify-end ${isComplete ? 'font-bold' : isFailed ? 'font-bold' : ''}`}>
                        {isComplete ? 'PASS' : isFailed ? 'FAIL' : score > 0 ? score.toFixed(1) + '%' : '---'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Verified Section */}
            {(() => {
               const hasFailed = gauntlet.some(s => s.status === 'fail');
               const allPassed = gauntlet.every(s => s.status === 'pass');

               let bottomBorder = 'border-neutral-700 text-neutral-500';
               let bottomText = 'AWAITING_VERIFICATION';
               let icon = <CheckCircle2 className="w-4 h-4" />;
               let activeClass = '';

               if (allPassed) {
                 bottomBorder = 'border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-emerald-950/20';
                 bottomText = 'LEDGER_VERIFIED';
                 activeClass = 'bg-emerald-400/10 text-emerald-500/70';
               } else if (hasFailed && runStatus === 'completed') {
                 bottomBorder = 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-red-950/20';
                 bottomText = 'STRATEGY_REJECTED';
                 icon = <XCircle className="w-4 h-4" />;
                 activeClass = 'bg-red-500/10 text-red-500/70';
               } else if (gauntlet.some(s => s.status === 'running')) {
                 bottomText = 'VERIFYING_LOGIC...';
               }

               return (
                <div className="border-t border-neutral-800 p-4 bg-neutral-900/50 flex flex-col items-center justify-center shrink-0">
                  <div className={`border p-2 w-full text-center relative group overflow-hidden transition-colors duration-1000 ${bottomBorder}`}>
                    <motion.div 
                        animate={{ left: ['-100%', '200%'] }} 
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className={`absolute top-0 w-1/4 h-full skew-x-[45deg] ${allPassed ? 'bg-emerald-400/10' : hasFailed && runStatus === 'completed' ? 'bg-red-500/10' : 'bg-white/5'}`}
                    />
                    <span className="font-bold tracking-widest text-xs uppercase flex items-center justify-center gap-2">
                      {icon} {bottomText}
                    </span>
                  </div>
                  <div className="w-full flex justify-between mt-3 text-[10px] text-neutral-500 font-mono">
                    <span className={activeClass}>SIG: 0x{generateHex(12)}</span>
                    <span className={activeClass}>T+0.04s</span>
                  </div>
                  {runStatus === 'completed' && (
                    <div className="w-full mt-4 flex gap-2">
                       <button 
                         onClick={() => setActiveTab('NEXUS Explainer')}
                         className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs py-2 uppercase tracking-wider font-bold transition-colors border border-neutral-700"
                       >
                         View Explainer
                       </button>
                       <button 
                         onClick={() => setActiveTab('Final Report')}
                         className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 hover:border-emerald-900 transition-colors text-xs py-2 uppercase tracking-wider font-bold"
                       >
                         View Full Report
                       </button>
                    </div>
                  )}
                </div>
               );
            })()}

          </div>
        </div>
        </div>
        ) : activeTab === 'NEXUS Explainer' ? (
          <div className="flex-1 overflow-y-auto bg-transparent text-neutral-200 p-8 font-sans">
            {runStatus !== 'completed' ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <History className="w-16 h-16 opacity-20 mx-auto mb-4" />
                <h2 className="text-xl mb-2">Awaiting Verification</h2>
                <p className="text-sm opacity-50">Please complete a strategy verification run first.</p>
              </div>
            ) : (() => {
              const hasFailed = gauntlet.some(s => s.status === 'fail');
              const failedStages = gauntlet.map((s, i) => s.status === 'fail' ? GAUNTLET_STAGES[i] : null).filter(Boolean);
              const firstFail = failedStages[0];

              return (
                <>
                  <h2 className="text-2xl font-bold text-emerald-400 mb-6">Customer Summary</h2>
                  
                  <h3 className="text-lg font-bold text-emerald-400 mt-6 border-b border-neutral-800 pb-2 mb-4">Final Package</h3>
                  <ul className="list-disc pl-6 space-y-1.5 text-sm">
                    <li>Strategy Name: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{selectedStrategy}</code></li>
                    <li>Verification Verdict: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{hasFailed ? 'REJECTED_CONFIRMED_DEFECT' : 'PASSED_ALL_GATES'}</code></li>
                    <li>Capital Readiness: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{hasFailed ? 'NOT_READY' : 'READY_FOR_CAPITAL'}</code></li>
                    {hasFailed && <li>Recommended Next Action: investigate_{firstFail?.name.toLowerCase()}</li>}
                    <li>Human Report Type: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{hasFailed ? 'Kill Report' : 'Approval Report'}</code></li>
                  </ul>

                  <h3 className="text-lg font-bold text-emerald-400 mt-8 border-b border-neutral-800 pb-2 mb-4">Ranking</h3>
                  <ul className="list-disc pl-6 space-y-1.5 text-sm">
                    <li>Strategy Rank Score: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{hasFailed ? '38.32/100' : '92.50/100'}</code></li>
                    <li>Strategy Rank Band: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{hasFailed ? 'Fixable Defect' : 'Production Ready'}</code></li>
                    <li>Robustness Score: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">{hasFailed ? 'n/a' : 'High'}</code></li>
                  </ul>

                  <h3 className="text-lg font-bold text-emerald-400 mt-8 border-b border-neutral-800 pb-2 mb-4">Plain-English Summary</h3>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {hasFailed ? 
                      `This strategy was rejected because it failed the ${firstFail?.name} check. The edge does not remain durable enough after verification tests are applied.` : 
                      `This strategy passed all required verification gates including DATA_INTEGRITY and EXECUTION_SIM. It demonstrates robust modeling and is clear for capital deployment.`
                    }
                  </p>

                  <h3 className="text-lg font-bold text-emerald-400 mt-8 border-b border-neutral-800 pb-2 mb-4">NEXUS Explanation</h3>
                  <ul className="list-disc pl-6 space-y-1.5 text-sm mb-4">
                    <li>Explanation Source: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">deterministic_template</code></li>
                    <li>Validation Status: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">not_applicable</code></li>
                  </ul>
                  <p className="text-sm leading-relaxed text-neutral-300 mb-4">
                    NEXUS explanation: This run evaluated strategy "{selectedStrategy}". The final outcome is {hasFailed ? 'REJECTED_CONFIRMED_DEFECT' : 'PASSED_ALL_GATES'} with capital readiness {hasFailed ? 'NOT_READY' : 'READY_FOR_CAPITAL'}. 
                    {hasFailed && ` The decisive failure came from gate ${firstFail?.id} with failure mode ${firstFail?.name}.`}
                  </p>

                  <h3 className="text-lg font-bold text-emerald-400 mt-8 border-b border-neutral-800 pb-2 mb-4">Why It {hasFailed ? 'Failed / Needs Review' : 'Passed'}</h3>
                  <ul className="list-disc pl-6 space-y-1.5 text-sm text-neutral-300 bg-neutral-800/30 p-4 rounded border border-neutral-700/50">
                    {hasFailed ? (
                      <>
                        <li>The main bottleneck is execution reality in {firstFail?.name}.</li>
                        <li>NEXUS estimates that execution costs exceed the allowed threshold.</li>
                        <li>This run still relies on default assumptions in some places, so the result should not be interpreted as a live-trading proof.</li>
                      </>
                    ) : (
                      <>
                        <li>The strategy successfully parsed and bypassed all simulated execution realities.</li>
                        <li>Statistically significant edge remained intact across all Monte Carlo variations.</li>
                        <li>Evidence reproduction was successful with matching deterministic hashes.</li>
                      </>
                    )}
                  </ul>

                  {hasFailed && (
                    <>
                      <h3 className="text-lg font-bold text-emerald-400 mt-8 border-b border-neutral-800 pb-2 mb-4">Key Failed Points</h3>
                      <ul className="list-disc pl-6 space-y-1.5 text-sm text-neutral-300">
                        {failedStages.map(fs => (
                           <li key={fs?.id}>gate_{fs?.id.toLowerCase()}: {fs?.name.toLowerCase()} (blocking)</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <br/>
                  {selectedPlan === 'free' && (
                    <div className="mt-8 pt-8 border-t border-neutral-800 animate-fadeIn">
                      <div className="bg-cyan-950/10 border border-cyan-500/30 p-8 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                          <Cpu className="w-28 h-28 text-cyan-500" />
                        </div>
                        <div className="relative z-10">
                          <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em] mb-2">PRO_REPORT_NUDGE</div>
                          <h4 className="text-2xl font-black text-cyan-400 tracking-tighter mb-3 leading-none">UNLOCK FULL ADVERSARIAL EXPLAINER</h4>
                          <p className="text-sm text-cyan-300/70 mb-8 max-w-xl leading-relaxed">
                            This explanation uses base-layer deterministic heuristics. Upgrade to <b className="text-cyan-400 font-bold">Deep Analysis</b> to unlock failure-pattern remediation, adversarial logic reasoning, and the full AlgoXpert human-audit trail for this strategy version.
                          </p>
                          <button 
                            onClick={() => { setPaymentStrategyName(selectedStrategy); setPaymentStep('form'); setPaymentError(null); setShowPaymentModal(true); }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-8 py-3.5 uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer active:scale-95 flex items-center gap-2"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Upgrade to NEXUS Deep — $3.99
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <br/><br/>
                </>
              );
            })()}
          </div>
        ) : activeTab === 'Final Report' ? (
          <div className="flex-1 overflow-y-auto bg-transparent text-neutral-200 p-8 font-sans">
            {runStatus !== 'completed' ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <History className="w-16 h-16 opacity-20 mx-auto mb-4" />
                <h2 className="text-xl mb-2">Awaiting Verification</h2>
                <p className="text-sm opacity-50">Please complete a strategy verification run first.</p>
              </div>
            ) : (() => {
              const hasFailed = gauntlet.some(s => s.status === 'fail');
              const failedStages = gauntlet.map((s, i) => s.status === 'fail' ? GAUNTLET_STAGES[i] : null).filter(Boolean);

              return (
                <>
                  {/* Premium Report Welcome Banner */}
                  {selectedPlan === 'deep_analysis_3_99' ? (
                    <div className="mb-6 p-4 border border-cyan-500 bg-cyan-950/20 text-cyan-400 rounded-sm relative shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                          <Cpu className="w-4 h-4 animate-pulse shrink-0" />
                          NEXUS DEEP COMPREHENSIVE REPORT UNLOCKED
                        </div>
                        <p className="text-xs text-cyan-300/80 mt-1">
                          Full adversarial vulnerability assessment successfully unlocked for {selectedStrategy}. Human audit by AlgoXpert team complete.
                        </p>
                      </div>
                      <span className="text-[9px] bg-cyan-500 text-black px-2 py-0.5 font-mono font-bold tracking-wider uppercase shrink-0">DEEP SCAN ACTIVE</span>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 border border-neutral-800 bg-neutral-900/30 text-neutral-400 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">STANDARD SCAN REPORT</div>
                        <p className="text-xs text-neutral-500 mt-1">You are currently viewing a standard logic-scan run. Upgrade to Deep Analysis for $3.99 to unlock remediation protocols and parameters retesting logs.</p>
                      </div>
                      <button onClick={() => { setPaymentStrategyName(selectedStrategy); setPaymentStep('form'); setPaymentError(null); setShowPaymentModal(true); }} className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0 cursor-pointer">
                        Upgrade report — $3.99
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-850 pb-4 mb-6 gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-emerald-400">NEXUS Verification Ledger</h2>
                      <p className="text-xs text-neutral-500 mt-1">Cryptographic audit reports of strategy logical edge and stress parameters</p>
                    </div>
                    
                    {/* Export Format Selector */}
                    <div className="flex items-center gap-2 bg-neutral-900/50 p-2 border border-neutral-800 rounded-sm shrink-0">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono mr-2">EXPORT FORMAT:</span>
                      {['JSON', 'CSV', 'PDF'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt.toLowerCase() as 'pdf' | 'json' | 'csv')}
                          className={`px-2.5 py-1 text-[10px] font-mono transition-all font-bold ${exportFormat === fmt.toLowerCase() ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                        >
                          {fmt}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setIsExporting(true);
                          setTimeout(() => {
                            if (exportFormat === 'json') {
                              handleExportJSON(hasFailed, failedStages);
                            } else if (exportFormat === 'csv') {
                              handleExportCSV(hasFailed);
                            } else {
                              handleExportPDF(hasFailed, failedStages);
                            }
                            setIsExporting(false);
                          }, 800);
                        }}
                        disabled={isExporting}
                        className={`ml-2 px-4 py-1.5 transition-all text-[10px] uppercase font-bold flex items-center gap-1.5 cursor-pointer ${isExporting ? 'bg-neutral-800 text-neutral-600 border-neutral-700' : 'bg-emerald-500 border border-emerald-400 text-black hover:bg-emerald-400 font-bold active:scale-95'}`}
                      >
                        {isExporting ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                            BUILDING...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 rotate-180 shrink-0" />
                            DOWNLOAD REPORT
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-emerald-400 mb-4">Summary</h3>
                 <div className="border border-neutral-700 rounded overflow-hidden mb-8 text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-800 border-b border-neutral-700">
                        <tr><th className="p-3 w-1/3">Field</th><th className="p-3">Value</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-700/50">
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Verification ID</td><td className="p-3"><code className="bg-neutral-800 px-1 py-0.5 rounded">run_{generateHex(12).toLowerCase()}</code></td></tr>
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Strategy Name</td><td className="p-3"><code className="bg-neutral-800 px-1 py-0.5 rounded">{selectedStrategy}</code></td></tr>
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Verdict</td><td className="p-3">{hasFailed ? '[FAIL] REJECTED_CONFIRMED_DEFECT' : '[PASS] PASSED_ALL_GATES'}</td></tr>
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Capital Readiness</td><td className="p-3">{hasFailed ? 'NOT_READY' : 'READY_FOR_CAPITAL'}</td></tr>
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Robustness Score</td><td className="p-3">{hasFailed ? 'None/100' : '98/100'}</td></tr>
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Strategy Rank Score</td><td className="p-3">{hasFailed ? '38.32/100 (Fixable Defect)' : '92.50/100 (Production Ready)'}</td></tr>
                        <tr><td className="p-3 font-semibold bg-neutral-900/30">Verification Mode</td><td className="p-3">deterministic_offline</td></tr>
                      </tbody>
                    </table>
                 </div>

                 <h3 className="text-lg font-bold text-emerald-400 mb-4">Gate Results</h3>
                 <div className="border border-neutral-700 rounded overflow-hidden mb-8 text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-800 border-b border-neutral-700">
                        <tr>
                          <th className="p-3">Gate</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Impact</th>
                          <th className="p-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-700/50">
                        {GAUNTLET_STAGES.map((stageInfo, i) => {
                          const state = gauntlet[i];
                          const isFail = state.status === 'fail';
                          const isUnrun = state.status === 'idle' || state.status === 'running'; // Shouldn't happen on complete, except short circuit
                          
                          if (isUnrun) {
                            return (
                              <tr key={stageInfo.id} className="opacity-50">
                                <td className="p-3">gate_{stageInfo.id.toLowerCase()}</td>
                                <td className="p-3">[SKIPPED]</td>
                                <td className="p-3">-</td>
                                <td className="p-3">Skipped due to prior failure</td>
                              </tr>
                            );
                          }

                          return (
                              <tr key={stageInfo.id}>
                                <td className="p-3">gate_{stageInfo.id.toLowerCase()}</td>
                                <td className={`p-3 font-bold ${isFail ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {isFail ? '[FAIL] fail' : '[PASS] pass'}
                                </td>
                                <td className={`p-3 ${isFail ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                                  {isFail ? 'blocking' : 'supporting'}
                                </td>
                                <td className="p-3">
                                  {isFail ? stageInfo.name.toLowerCase() : 'pass'}
                                </td>
                              </tr>
                          );
                        })}
                      </tbody>
                    </table>
                 </div>

                 <h3 className="text-lg font-bold text-emerald-400 mb-4">Confirmed Findings</h3>
                 {hasFailed ? (
                   <ul className="list-disc pl-6 space-y-1.5 text-sm text-neutral-300 mb-8">
                     {failedStages.map(fs => (
                       <li key={fs?.id}>gate_{fs?.id.toLowerCase()}: {fs?.name.toLowerCase()} (blocking)</li>
                     ))}
                   </ul>
                 ) : (
                   <div className="text-sm text-neutral-400 mb-8 italic">No deterministic findings blocking deployment.</div>
                 )}

                 {selectedPlan === 'free' && (
                   <div className="space-y-6 mb-8 animate-fadeIn">
                     <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-sm">
                       <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Activity className="w-4 h-4 text-neutral-500" />
                         Surface Verification Insights
                       </h3>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center text-[11px]">
                           <span className="text-neutral-500 uppercase">Monte Carlo Lite (50 Iter)</span>
                           <span className="text-emerald-400 font-mono">STABLE // 1.25% VAR</span>
                         </div>
                         <div className="flex justify-between items-center text-[11px]">
                           <span className="text-neutral-500 uppercase">Drawdown Recovery Stress</span>
                           <span className="text-neutral-300 font-mono">NOMINAL // 14 DAYS MAX</span>
                         </div>
                         <div className="flex justify-between items-center text-[11px]">
                           <span className="text-neutral-500 uppercase">BTC/SPX Correlation Drift</span>
                           <span className="text-neutral-300 font-mono">0.42 // LOW COUPLING</span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="bg-neutral-900/10 border border-neutral-800/50 p-5 rounded-sm">
                       <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <ShieldCheck className="w-4 h-4 text-neutral-600" />
                         General Remediation
                       </h3>
                       <ul className="text-[11px] text-neutral-400 space-y-2 list-disc pl-4">
                         <li>Review logic for potential overfitting in recent regimes.</li>
                         <li>Consider adding basic volatility filter for entry conditions.</li>
                         <li>Verify stop-loss execution safety vs. historical slippage spikes.</li>
                        </ul>
                      </div>

                      <div className="mt-4 bg-cyan-950/20 border-2 border-cyan-500/50 p-8 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-125 transition-all duration-700">
                          <Zap className="w-32 h-32 text-cyan-400" />
                        </div>
                        <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4 shrink-0">
                            <span className="bg-cyan-500 text-black text-[9px] font-black px-2 py-0.5 tracking-tighter uppercase">92% OFF</span>
                            <span className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase font-bold">// ADVERSARIAL_UNLOCK</span>
                          </div>
                          
                          <h3 className="text-2xl font-black text-white tracking-tighter mb-3 leading-tight uppercase italic">
                            Missing the <span className="text-cyan-400">Remediation Protocol</span>
                          </h3>
                          
                          <p className="text-sm text-neutral-400 mb-8 max-w-lg leading-relaxed">
                            Standard reports only signal failures. Upgrade to <span className="text-cyan-400 font-bold">Deep Analysis</span> to see exact parameter remediation, retested OOS configurations, and the full AlgoXpert human-audit log for {selectedStrategy}.
                          </p>
                          
                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <button 
                              onClick={() => { setPaymentStrategyName(selectedStrategy); setPaymentStep('form'); setPaymentError(null); setShowPaymentModal(true); }}
                              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-10 py-4 uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer active:scale-[0.97] flex items-center justify-center gap-3"
                            >
                              <LockOpen className="w-4 h-4" />
                              Unlock Report — $3.99
                            </button>
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                              LIMITED PHASE 1 PRICING
                            </span>
                          </div>
                        </div>
                      </div>
                   </div>
                 )}

                 {selectedPlan === 'deep_analysis_3_99' && (
                   <div className="space-y-8 mb-8 animate-fadeIn">
                      {/* Slippage Sensitivity */}
                      <div>
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 shrink-0" />
                          Slippage Sensitivity Range
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           {[
                             { label: 'Optimistic (0.5x)', pf: '1.82', status: 'Stable' },
                             { label: 'Realistic (1.0x)', pf: '1.45', status: 'Nominal' },
                             { label: 'Conservative (1.5x)', pf: '0.98', status: 'Fragile' }
                           ].map(item => (
                             <div key={item.label} className="bg-neutral-900 border border-neutral-800 p-3">
                               <div className="text-[10px] text-neutral-500 uppercase tracking-widest">{item.label}</div>
                               <div className="text-xl font-bold text-white mt-1">PF {item.pf}</div>
                               <div className={`text-[10px] uppercase font-bold mt-2 ${item.status === 'Fragile' ? 'text-red-400' : 'text-cyan-400'}`}>// {item.status}</div>
                             </div>
                           ))}
                        </div>
                        <p className="text-xs text-neutral-500 mt-3 italic">Strategy edge degrades significantly beyond 1.2x expected slippage. Execution quality is critical.</p>
                      </div>

                      {/* Reproducibility Trail */}
                      <div>
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                          <Database className="w-5 h-5 shrink-0" />
                          Reproducibility & OOS Trail
                        </h3>
                        <div className="bg-neutral-900 border border-neutral-800 p-4 font-mono text-xs space-y-2">
                           <div className="flex justify-between border-b border-neutral-800 pb-2">
                             <span className="text-neutral-500">GIT_COMMIT_HASH</span>
                             <span className="text-neutral-300">0x{generateHex(16).toLowerCase()}</span>
                           </div>
                           <div className="flex justify-between border-b border-neutral-800 pb-2">
                             <span className="text-neutral-500">DATA_PARQUET_ID</span>
                             <span className="text-neutral-300">pq_{generateHex(8).toLowerCase()}_v4</span>
                           </div>
                           <div className="flex justify-between border-b border-neutral-800 pb-2">
                             <span className="text-neutral-500">INDICATOR_PARAMS</span>
                             <span className="text-neutral-300">MA_LEN: 24, RSI: 14, VOL_MULT: 1.5</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-neutral-500">TEST_SLICE</span>
                             <span className="text-neutral-300">2018-01-01 to 2024-05-25</span>
                           </div>
                        </div>
                      </div>

                      {/* Parameter Sensitivity Surface */}
                      <div>
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 shrink-0" />
                          Parameter Sensitivity Surface
                        </h3>
                        <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                           <div className="w-full h-24 flex items-end gap-1 px-4">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div 
                                 key={i} 
                                 className={`flex-1 ${i > 7 && i < 13 ? 'bg-cyan-500' : 'bg-neutral-800'} transition-all`} 
                                 style={{ height: `${20 + Math.sin(i / 3) * 10 + (i > 7 && i < 13 ? 40 : 0)}%` }}
                                />
                              ))}
                           </div>
                           <div className="w-full flex justify-between mt-4 text-[9px] text-neutral-500 uppercase tracking-widest px-4">
                             <span>-20% VAR</span>
                             <span className="text-cyan-400 font-bold">Optimization Plateau</span>
                             <span>+20% VAR</span>
                           </div>
                           <div className="absolute top-4 right-4 text-[10px] text-cyan-400 font-bold bg-cyan-950/30 px-2 py-1 border border-cyan-800">ROBUST PLATEAU DETECTED</div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-3 italic">Nudge tests (±10/20%) show a plateau-like surface. No "lucky chromosome" peaks identified in primary parameter sets.</p>
                      </div>

                      {/* Regime Performance */}
                      <div>
                        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5 shrink-0" />
                          Regime-Segmented Results
                        </h3>
                        <div className="space-y-3">
                           {[
                             { label: 'Bull Market', pf: '1.92', win: '68%', color: 'text-emerald-400' },
                             { label: 'Bear Market', pf: '0.62', win: '32%', color: 'text-red-400' },
                             { label: 'Sideways / Chop', pf: '1.24', win: '51%', color: 'text-neutral-400' }
                           ].map(regime => (
                             <div key={regime.label} className="bg-neutral-900 border border-neutral-800 p-3 flex justify-between items-center">
                                <div>
                                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest">{regime.label}</div>
                                  <div className={`text-sm font-bold ${regime.color}`}>PF {regime.pf}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Win Rate</div>
                                  <div className="text-sm font-bold text-neutral-200">{regime.win}</div>
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="mt-4 p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
                           <ShieldAlert className="w-4 h-4 shrink-0" />
                           <span><strong>Ticking Time Bomb:</strong> Strategy demonstrates significant alpha decay in Bear Regimes. Immediate hedge required for downtime.</span>
                        </div>
                      </div>

                      {/* Kill Verdict */}
                      <div className="bg-neutral-950 border border-cyan-500/50 p-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-4">Final Advisory // Explicit Kill Verdict</div>
                        <div className="flex gap-6 items-center">
                           <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-lg font-bold text-white uppercase italic">Status: CONDITIONAL_DEPLOY</h4>
                              <p className="text-xs text-neutral-400 leading-relaxed">
                                Strategy passes primary logic gates but requires strict regime-filtering for bear markets. 
                                <br/><span className="text-cyan-400 font-bold underline decoration-dotted">DO NOT DEPLOY</span> if bearer regime detectors signal &gt; 0.8 conf. 
                                <br/>Human audit by AlgoXpert suggests limiting initial capital exposure to 25% of target allocation.
                              </p>
                           </div>
                        </div>
                      </div>
                   </div>
                 )}

                 {hasFailed && (
                   <>
                     <h3 className="text-lg font-bold text-emerald-400 mb-4">Failure Analysis</h3>
                     <div className="bg-neutral-800/30 p-4 rounded border border-neutral-700/50 mb-8 text-sm">
                        <b>Gate:</b> {failedStages[0]?.id} &nbsp;&nbsp; <b>Failure Mode:</b> {failedStages[0]?.name.toLowerCase()} &nbsp;&nbsp; <b>Recommended Fix:</b> investigate_{failedStages[0]?.name.toLowerCase()}
                     </div>
                   </>
                 )}

                 <p className="text-xs text-neutral-500 italic border-t border-neutral-700 pt-4 pb-8">Generated by NEXUS Verification Layer. Interpret this report together with scope, confidence level, warnings, and evidence class.</p>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 bg-transparent">
            <div className="text-center">
              <History className="w-16 h-16 opacity-20 mx-auto mb-4" />
              <h2 className="text-xl mb-2">{activeTab}</h2>
              <p className="text-sm opacity-50">Feature modules loading... System nominal.</p>
            </div>
          </div>
        )}

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Secure Upgrade
                </h3>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase font-mono">NEXUS Deep Analysis // {paymentStrategyName}</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {paymentStep === 'form' ? (
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div className="flex justify-between items-center p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mb-0.5">Early Adopter Tier</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 line-through font-mono">$49.00</span>
                        <div className="bg-red-500/20 text-red-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter">Save $45+</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">$3.99</div>
                      <span className="text-[8px] text-neutral-500 uppercase tracking-widest block">One-time protocol fee</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Cardholder Name</label>
                      <input 
                        required
                        type="text" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:outline-none px-3 py-2 text-sm text-neutral-200 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-neutral-600" />
                        <input 
                          required
                          type="text" 
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:outline-none pl-10 pr-3 py-2 text-sm text-neutral-200 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Expiry</label>
                        <input 
                          required
                          type="text" 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:outline-none px-3 py-2 text-sm text-neutral-200 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">CVC</label>
                        <input 
                          required
                          type="text" 
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="000"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:outline-none px-3 py-2 text-sm text-neutral-200 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-[10px] flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      {paymentError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-widest py-3 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Pay $3.99 & Unlock
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-600 uppercase font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Encrypted
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-600 uppercase font-bold">
                      <RefreshCw className="w-3.5 h-3.5" />
                      One-time charge
                    </div>
                  </div>
                </form>
              ) : paymentStep === 'processing' ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-16 h-16 mb-6">
                    <RefreshCw className="w-16 h-16 text-cyan-500 animate-spin opacity-20" />
                    <Cpu className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <h4 className="text-white font-bold tracking-widest uppercase mb-2">Authorizing Transaction</h4>
                  <p className="text-[10px] text-neutral-500 font-mono">Routing through secure gateway...</p>
                  <div className="mt-8 w-48 h-1 bg-neutral-800 overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-0 bg-cyan-500"
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-emerald-400 font-bold tracking-widest uppercase mb-2">Payment Confirmed</h4>
                  <p className="text-[10px] text-neutral-300 font-mono">NEXUS Deep Analysis Unlocked.</p>
                  <p className="text-[9px] text-neutral-500 mt-4 leading-relaxed">Initializing deep adversarial scan sequence...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-[10px] text-neutral-600 hidden md:block">
        SYSTEMS: NOMINAL // CACHE: CLEARED // LATENCY: 14ms
      </div>

    </div>
  );
}

