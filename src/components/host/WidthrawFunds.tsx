"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@woothomes/components";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PrimaryButton } from "../ui/primaryButton";
import { usePaymentMethods, useRequestWithdrawal } from "@woothomes/hooks/useWallet";
import { toast } from "sonner";

export const WithdrawFundsSection = ({ 
  onBack, 
  availableBalance = 0 
}: { 
  onBack: () => void;
  availableBalance?: number;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    paymentMethodId: "",
  });
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");

  // API hooks
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  const withdrawalMutation = useRequestWithdrawal();

  // Filter to verified payment methods only
  const verifiedPaymentMethods = paymentMethods.filter(method => method.is_verified && method.status === 'active');

  useEffect(() => {
    // Auto-select default payment method if available
    const defaultMethod = verifiedPaymentMethods.find(method => method.is_default);
    if (defaultMethod && !withdrawalData.paymentMethodId) {
      setWithdrawalData(prev => ({ ...prev, paymentMethodId: defaultMethod.id }));
    }
  }, [verifiedPaymentMethods, withdrawalData.paymentMethodId]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleWithdrawalSubmit = async () => {
    try {
      setError("");
      const selectedPaymentMethod = verifiedPaymentMethods.find(method => method.id === withdrawalData.paymentMethodId);
      
      if (!selectedPaymentMethod) {
        setError("Please select a valid payment method");
        return;
      }

      const pinString = pin.join("");
      if (pinString.length !== 6) {
        setError("Please enter a complete 6-digit PIN");
        return;
      }

      await withdrawalMutation.mutateAsync({
        amount: parseFloat(withdrawalData.amount),
        withdrawal_method: selectedPaymentMethod.type,
        payment_method_id: withdrawalData.paymentMethodId,
        pin: pinString,
        description: `Withdrawal to ${selectedPaymentMethod.name}`,
      });

      toast.success('Withdrawal request submitted successfully!');
      setCurrentStep(3);
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      const errorMessage = error?.response?.data?.message || "Withdrawal failed. Please check your PIN and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const getPaymentMethodLabel = (method: any) => {
    if (method.type === 'paypal') {
      return `PayPal - ${method.account_details.email}`;
    } else if (method.type === 'bank_transfer') {
      const bankName = method.account_details.bank_name || 'Bank';
      const lastFour = method.account_details.account_number?.slice(-4) || '0000';
      return `${bankName} - ****${lastFour}`;
    } else if (method.type === 'mobile_money') {
      const provider = method.account_details.provider || 'Mobile Money';
      return `${provider} - ${method.account_details.phone_number}`;
    }
    return method.name;
  };

  const renderStep1 = () => {
    const withdrawalAmount = parseFloat(withdrawalData.amount) || 0;
    const isAmountValid = withdrawalAmount > 0 && withdrawalAmount <= availableBalance;
    const hasInsufficientFunds = withdrawalAmount > availableBalance;

    return (
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-16 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Amount to withdraw
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={withdrawalData.amount}
              onChange={(e) =>
                setWithdrawalData({ ...withdrawalData, amount: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                hasInsufficientFunds && withdrawalData.amount
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {hasInsufficientFunds && withdrawalData.amount && (
              <p className="text-red-600 text-sm mt-1">
                Insufficient funds. Maximum withdrawal amount is ₦{availableBalance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Available Balance Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Available Balance
                </p>
                <p className="text-lg font-bold text-blue-900">
                  ₦{availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" stroke="none">₦</text>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Payment method
            </label>
            {paymentMethodsLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading payment methods...
              </div>
            ) : verifiedPaymentMethods.length === 0 ? (
              <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  No verified payment methods available
                </div>
                <p className="text-sm mt-1">
                  Please add and verify a payment method in your payout settings.
                </p>
              </div>
            ) : (
              <Select
                value={withdrawalData.paymentMethodId}
                onValueChange={(value) => {
                  setWithdrawalData({
                    ...withdrawalData,
                    paymentMethodId: value,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {verifiedPaymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{getPaymentMethodLabel(method)}</span>
                        {method.is_default && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <PrimaryButton
            onClick={onBack}
            variant="secondary"
            className="flex-1 px-4 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </PrimaryButton>

          <PrimaryButton
            onClick={() => setCurrentStep(2)}
            disabled={!withdrawalData.amount || !withdrawalData.paymentMethodId || !isAmountValid || verifiedPaymentMethods.length === 0}
            variant="primary"
            className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </PrimaryButton>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-16 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
        <h2 className="text-xl font-bold mb-2 text-[#1e3a8a]">
          Enter withdrawal PIN
        </h2>
        <p className="text-sm text-gray-600">
          Enter the PIN set to withdraw fund
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-center space-x-3">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-3">
        <PrimaryButton
          onClick={onBack}
          variant="secondary"
          className="flex-1 px-4 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </PrimaryButton>

        <PrimaryButton
          onClick={handleWithdrawalSubmit}
          disabled={pin.some((digit) => !digit) || withdrawalMutation.isPending}
          variant="primary"
          className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {withdrawalMutation.isPending ? 'Processing...' : 'Submit PIN'}
        </PrimaryButton>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-16 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-xl font-bold text-blue-600 mb-2">
          Your withdrawal has been initiated and is pending
        </h2>
        <p className="text-sm text-gray-600">
          Your withdrawal request has been successfully submitted and is
          currently being processed by our team.
        </p>
      </div>

      <button
        onClick={onBack}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  return (
    <div className="py-8">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
};
