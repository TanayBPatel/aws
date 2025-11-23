
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RiskMetrics } from '../types';
import { ShieldAlert, TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const RiskAssessment: React.FC = () => {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);

  useEffect(() => {
    // Calls backend: getRiskMetrics
    api.getRiskMetrics('current').then(setMetrics);
  }, []);

  if (!metrics) return <div className="p-8 text-center text-textPrimary">Calculating Portfolio Risk...</div>;

  return (
    <div className="space-y-6 pb-20 font-sans min-h-screen px-2">
      <header className="pt-2 mb-4">
        <h1 className="text-2xl font-semibold text-textPrimary flex items-center gap-2">
          <ShieldAlert className="text-primary" />
          Risk Assessment
        </h1>
        <p className="text-sm text-textSecondary mt-1">AI-driven analysis based on your current holdings.</p>
      </header>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-cardDark p-4 border-borderBase">
          <div className="flex items-center gap-2 mb-2 text-textSecondary">
            <TrendingUp size={16} />
            <span className="text-xs font-medium uppercase">Beta</span>
          </div>
          <div className="text-2xl font-bold text-textPrimary">{metrics.beta}</div>
          <p className="text-xs text-textSecondary mt-1">
            {metrics.beta > 1 ? 'High Volatility' : 'Low Volatility'}
          </p>
        </Card>

        <Card className="bg-cardDark p-4 border-borderBase">
          <div className="flex items-center gap-2 mb-2 text-textSecondary">
            <Activity size={16} />
            <span className="text-xs font-medium uppercase">Sharpe Ratio</span>
          </div>
          <div className="text-2xl font-bold text-textPrimary">{metrics.sharpeRatio}</div>
          <p className="text-xs text-textSecondary mt-1">
            Risk-Adjusted Return
          </p>
        </Card>
        
        <Card className="bg-cardDark p-4 border-borderBase">
          <div className="flex items-center gap-2 mb-2 text-textSecondary">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium uppercase">Value at Risk (VaR)</span>
          </div>
          <div className="text-2xl font-bold text-error">{metrics.var}%</div>
          <p className="text-xs text-textSecondary mt-1">
            Max expected loss (95%)
          </p>
        </Card>

         <Card className="bg-cardDark p-4 border-borderBase">
          <div className="flex items-center gap-2 mb-2 text-textSecondary">
            <Activity size={16} />
            <span className="text-xs font-medium uppercase">Std Deviation</span>
          </div>
          <div className="text-2xl font-bold text-textPrimary">{metrics.standardDeviation}%</div>
          <p className="text-xs text-textSecondary mt-1">
            Portfolio Variance
          </p>
        </Card>
      </div>

      {/* Recommendations Section */}
      <section>
        <h2 className="text-lg font-medium text-textPrimary mb-3">Optimization Strategy</h2>
        <div className="space-y-3">
          {metrics.recommendations.map((rec, i) => (
            <div key={i} className="bg-surfaceLight p-4 rounded-xl flex items-start gap-3 border border-borderBase">
              <CheckCircle className="text-accentLime mt-1 shrink-0" size={18} />
              <p className="text-sm text-textPrimary">{rec}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
