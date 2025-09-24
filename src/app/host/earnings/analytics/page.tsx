"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWalletAnalytics, useWalletBalance, WalletAnalytics } from "@woothomes/hooks/useWallet";

// Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  loading = false,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          )}
          {change && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

// Period Selector Component
const PeriodSelector = ({
  selectedPeriod,
  onPeriodChange,
}: {
  selectedPeriod: '7d' | '30d' | '90d' | '1y';
  onPeriodChange: (period: '7d' | '30d' | '90d' | '1y') => void;
}) => {
  const periods = [
    { key: '7d' as const, label: 'Last 7 Days' },
    { key: '30d' as const, label: 'Last 30 Days' },
    { key: '90d' as const, label: 'Last 90 Days' },
    { key: '1y' as const, label: 'Last Year' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onPeriodChange(period.key)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedPeriod === period.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

// Simple Chart Component (placeholder for actual chart library)
const SimpleChart = ({
  title,
  data,
  loading = false,
}: {
  title: string;
  data: { label: string; value: number }[];
  loading?: boolean;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="flex items-center px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
          <Download className="h-4 w-4 mr-1" />
          Export
        </button>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-16 text-sm text-gray-600 font-medium">
                {item.label}
              </div>
              <div className="flex-1 ml-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-right text-sm font-medium text-gray-900">
                ₦{item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Analytics Component
const WalletAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const router = useRouter();

  // Fetch wallet data
  const { data: walletBalance, isLoading: balanceLoading } = useWalletBalance();
  const { data: analyticsData, isLoading: analyticsLoading } = useWalletAnalytics(selectedPeriod);

  // Chart data based on actual analytics data
  const chartData = [
    { label: 'Credits', value: analyticsData?.period_summary?.total_credits || 0 },
    { label: 'Debits', value: analyticsData?.period_summary?.total_debits || 0 },
    { label: 'Net Change', value: Math.abs(analyticsData?.period_summary?.net_change || 0) },
    { label: 'Transactions', value: (analyticsData?.period_summary?.transaction_count || 0) * 1000 }, // Scale for visibility
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex cursor-pointer items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Earnings
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1e3a8a] mb-2">
                Wallet Analytics
              </h1>
              <p className="text-gray-600">
                Detailed insights into your earnings and transaction patterns
              </p>
            </div>

            <div className="mt-4 lg:mt-0">
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Current Balance"
            value={`₦${(walletBalance?.available_balance || 0).toLocaleString()}`}
            icon={DollarSign}
            loading={balanceLoading}
          />
          <AnalyticsCard
            title="Total Credits"
            value={`₦${(analyticsData?.period_summary?.total_credits || 0).toLocaleString()}`}
            change="0%"
            changeType="positive"
            icon={TrendingUp}
            loading={analyticsLoading}
          />
          <AnalyticsCard
            title="Total Debits"
            value={`₦${(analyticsData?.period_summary?.total_debits || 0).toLocaleString()}`}
            change="0%"
            changeType="negative"
            icon={TrendingDown}
            loading={analyticsLoading}
          />
          <AnalyticsCard
            title="Net Change"
            value={`₦${(analyticsData?.period_summary?.net_change || 0).toLocaleString()}`}
            change="0%"
            changeType="positive"
            icon={Activity}
            loading={analyticsLoading}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Overview
            </h3>
            {analyticsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-28 h-4 bg-gray-200 rounded"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-36 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="font-semibold">
                    {analyticsData?.period_summary?.transaction_count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Wallets</span>
                  <span className="font-semibold">
                    {analyticsData?.total_wallets || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currencies</span>
                  <span className="font-semibold">
                    {analyticsData?.currencies?.join(', ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Period</span>
                  <span className="font-semibold capitalize">
                    {selectedPeriod}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Period Details
            </h3>
            {analyticsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Period</span>
                  <span className="font-semibold">
                    {analyticsData?.period || selectedPeriod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">NGN Balance</span>
                  <span className="font-semibold">
                    {analyticsData?.total_balances?.NGN?.formatted_balance || 'NGN 0.00'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <SimpleChart
          title="Transaction Summary"
          data={chartData}
          loading={analyticsLoading}
        />
      </div>
    </div>
  );
};

export default WalletAnalyticsPage;
