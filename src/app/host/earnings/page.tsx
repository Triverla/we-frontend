"use client";

import React, { FC, MouseEventHandler, useState, useEffect } from "react";
import {
  ArrowLeft,
  BarChart3,
  Settings,
  CreditCard,
  ChevronRight,
  CircleChevronRight,
  Filter,
  Download,
  CoinsIcon,
} from "lucide-react";
import { WithdrawFundsSection } from "@woothomes/components";
import { useRouter } from "next/navigation";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";
import axios from "axios";
import {
  useWalletBalance,
  useWalletTransactions,
  WalletTransaction,
} from "@woothomes/hooks/useWallet";

// Using WalletTransaction from useWallet hook instead
export interface Transaction {
  amount: number;
  type: string;
  transactionId: string;
  date: string;
  status: string;
}

export interface StatCardProps {
  icon: FC<{ className?: string }>;
  title: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

// Reusable Card Component
const StatCard = ({
  icon: Icon,
  title,
  onClick,
  className = "",
}: StatCardProps) => {
  return (
    <div
      className={`bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <CircleChevronRight
          color="white"
          size={30}
          strokeWidth={1}
          fill="#06A2E2"
        />
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "successful":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(
        status
      )}`}
    >
      {status}
    </span>
  );
};

// Transaction Row Component using Flexbox
const TransactionRow = ({
  transaction,
  index,
}: {
  transaction: WalletTransaction;
  index: number;
}) => {
  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'credit' ? '+' : '-';
    return `${sign}₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center border-b border-gray-100 hover:bg-gray-50 py-3 px-4">
      <div className="flex-shrink-0 w-12 text-sm text-gray-700"> {index} </div>
      <div className={`flex-1 min-w-0 px-4 text-sm font-medium ${
        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
      }`}>
        {formatAmount(transaction.amount, transaction.type)}
      </div>
      <div className="flex-1 min-w-0 px-4 text-sm text-gray-700 capitalize">
        {transaction.type}
      </div>
      <div className="flex-1 min-w-0 px-4 text-sm text-gray-600">
        {transaction.reference}
      </div>
      <div className="flex-1 min-w-0 px-4 text-sm text-gray-600">
        {formatDate(transaction.created_at)}
      </div>
      <div className="flex-shrink-0 w-24">
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  );
};

// Transaction History Component
const TransactionHistory = ({
  transactions,
  startIdx = 1,
  endIdx = 0,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPrevPage = () => {},
  onNextPage = () => {},
}: {
  transactions: WalletTransaction[];
  startIdx?: number;
  endIdx?: number;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0 flex-1">
            Transaction History
          </h2>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View - Cards using Flexbox */}
      <div className="block md:hidden">
        {transactions.map((transaction, index) => (
          <div key={transaction.id} className="border-b border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  #{startIdx + index}
                </div>
                <div className={`text-sm font-medium ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">{transaction.type}</div>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={transaction.status} />
              </div>
            </div>
            <div className="text-xs text-gray-600 mb-1">{transaction.description}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Ref: {transaction.reference}</span>
              <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Flexbox Table */}
      <div className="hidden md:block">
        {/* Table Header using Flexbox */}
        <div className="flex items-center bg-gray-50 py-3 px-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 text-xs font-medium text-gray-500 uppercase tracking-wider">
            S/N
          </div>
          <div className="flex-1 min-w-0 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </div>
          <div className="flex-1 min-w-0 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Transaction Type
          </div>
          <div className="flex-1 min-w-0 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Transaction ID
          </div>
          <div className="flex-1 min-w-0 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </div>
          <div className="flex-shrink-0 w-24 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </div>
        </div>

        {/* Table Body using Flexbox */}
        <div>
          {transactions.map((transaction, index) => (
            <TransactionRow
              key={index}
              transaction={transaction}
              index={startIdx + index}
            />
          ))}
        </div>
      </div>

      {/* Pagination using Flexbox */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 flex-1">
            Showing {startIdx}-{endIdx} of {totalCount}
          </div>
          <div className="flex gap-2">
            <button
              className="cursor-pointer flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex-shrink-0 border border-gray-300 rounded disabled:opacity-50"
              onClick={onPrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="cursor-pointer flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex-shrink-0 border border-gray-300 rounded disabled:opacity-50"
              onClick={onNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const EarningsPayoutsDashboard = () => {
  const [showWithdrawFunds, setShowWithdrawFunds] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Use wallet APIs instead of old earnings APIs
  const {
    data: walletBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useWalletBalance();

  const {
    data: walletTransactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useWalletTransactions(currentPage, perPage);

  const router = useRouter();

  // Extract data from wallet APIs
  const totalEarnings = walletBalance?.available_balance || 0;
  const transactions = walletTransactionsData?.transactions || [];
  const totalCount = walletTransactionsData?.pagination?.total || 0;
  const totalPages = walletTransactionsData?.pagination?.last_page || 1;
  const startIdx = (currentPage - 1) * perPage + 1;
  const endIdx = Math.min(currentPage * perPage, totalCount);

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
            Go Back
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1e3a8a] mb-2">
                Earnings & Payouts
              </h1>
              <p className="text-gray-900">
                Track your earnings and withdraw funds
              </p>
            </div>

            <div className="mt-4 lg:mt-0 flex-shrink-0">
              <div className="flex items-center justify-end mb-1">
                <CoinsIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">
                  Total Earnings
                </span>
              </div>
              {isLoadingBalance ? (
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 text-right">
                  <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
                </div>
              ) : balanceError ? (
                <div className="text-lg text-red-600 text-right">
                  Error loading balance
                </div>
              ) : (
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 text-right">
                  ₦ {totalEarnings.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards using Flexbox */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl">
          <div className="flex-1">
            <StatCard
              icon={BarChart3}
              title="Analytics"
              onClick={() => router.push('/host/earnings/analytics')}
            />
          </div>
          <div className="flex-1">
            <StatCard
              icon={Settings}
              title="Payout Settings"
              onClick={() => router.push('/host/earnings/payout-settings')}
            />
          </div>
          <div className="flex-1">
            <StatCard
              icon={CreditCard}
              title="Withdraw Funds"
              onClick={() => setShowWithdrawFunds(true)}
            />
          </div>
        </div>

        {/* Dynamic Content Section - Either Transaction History or Withdraw Funds */}
        {showWithdrawFunds ? (
          <WithdrawFundsSection 
            onBack={() => setShowWithdrawFunds(false)} 
            availableBalance={totalEarnings}
          />
        ) : isLoadingTransactions ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Loading transactions...
          </div>
        ) : transactionsError ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-red-500">
            Failed to load wallet transactions
          </div>
        ) : (
          <TransactionHistory
            transactions={transactions}
            startIdx={startIdx}
            endIdx={endIdx}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNextPage={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
          />
        )}
      </div>
    </div>
  );
};

export default EarningsPayoutsDashboard;
