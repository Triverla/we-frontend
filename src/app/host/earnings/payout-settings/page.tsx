"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  useRequestWithdrawal, 
  useWithdrawalHistory,
  usePaymentMethods,
  useAddPaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
  PaymentMethod,
  PaymentMethodRequest
} from "@woothomes/hooks/useWallet";
import { toast } from "sonner";

// Payment Method Card Component
const PaymentMethodCard = ({
  method,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
}: {
  method: PaymentMethod;
  isDefault?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting?: boolean;
}) => {
  const getIcon = () => {
    switch (method.type) {
      case 'bank_transfer':
        return <Building2 className="h-6 w-6 text-blue-600" />;
      case 'paypal':
        return <CreditCard className="h-6 w-6 text-blue-600" />;
      case 'stripe':
        return <CreditCard className="h-6 w-6 text-purple-600" />;
      case 'mobile_money':
        return <CreditCard className="h-6 w-6 text-green-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDisplayText = () => {
    if (method.type === 'paypal') {
      return method.account_details.email || 'PayPal Account';
    } else if (method.type === 'bank_transfer') {
      const bankName = method.account_details.bank_name || 'Bank';
      const lastFour = method.account_details.account_number?.slice(-4) || '0000';
      return `${bankName} - ****${lastFour}`;
    } else if (method.type === 'mobile_money') {
      const provider = method.account_details.provider || 'Mobile Money';
      const phone = method.account_details.phone_number;
      return phone ? `${provider} - ${phone.slice(-4)}` : provider;
    }
    return method.name;
  };

  return (
    <div className={`bg-white p-4 rounded-lg border-2 ${
      isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    } shadow-sm ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{method.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{getDisplayText()}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500 capitalize">{method.status}</p>
              {!method.is_verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unverified
                </span>
              )}
              {isDefault && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check className="h-3 w-3 mr-1" />
                  Default
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isDefault && method.is_verified && (
            <button
              onClick={onSetDefault}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
            >
              Set Default
            </button>
          )}
          <button
            onClick={onEdit}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Payment Method Form
const AddPaymentMethodForm = ({
  onClose,
  onSave,
  isLoading = false,
}: {
  onClose: () => void;
  onSave: (method: PaymentMethodRequest) => void;
  isLoading?: boolean;
}) => {
  const [methodType, setMethodType] = useState<'bank_transfer' | 'paypal' | 'stripe' | 'mobile_money'>('bank_transfer');
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    bank_name: '',
    bank_code: '',
    account_name: '',
    routing_number: '',
    email: '',
    phone_number: '',
    provider: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (methodType === 'bank_transfer') {
      if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required';
      if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required';
      if (!formData.account_name.trim()) newErrors.account_name = 'Account name is required';
    } else if (methodType === 'paypal') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else if (methodType === 'mobile_money') {
      if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
      if (!formData.provider.trim()) newErrors.provider = 'Provider is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let account_details: Record<string, unknown> = {};
    
    if (methodType === 'bank_transfer') {
      account_details = {
        account_number: formData.account_number,
        bank_name: formData.bank_name,
        bank_code: formData.bank_code,
        account_name: formData.account_name,
        routing_number: formData.routing_number,
      };
    } else if (methodType === 'paypal') {
      account_details = {
        email: formData.email,
      };
    } else if (methodType === 'stripe') {
      account_details = {
        account_number: formData.account_number,
        routing_number: formData.routing_number,
      };
    } else if (methodType === 'mobile_money') {
      account_details = {
        phone_number: formData.phone_number,
        provider: formData.provider,
      };
    }

    onSave({
      type: methodType,
      name: formData.name,
      account_details,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Payment Method
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Method Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'bank_transfer' as const, label: 'Bank Transfer', icon: Building2 },
                  { key: 'paypal' as const, label: 'PayPal', icon: CreditCard },
                  { key: 'stripe' as const, label: 'Stripe', icon: CreditCard },
                  { key: 'mobile_money' as const, label: 'Mobile Money', icon: CreditCard },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setMethodType(option.key);
                      setErrors({}); // Clear errors when changing method type
                    }}
                    className={`p-3 text-center border rounded-lg ${
                      methodType === option.key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <option.icon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Primary Bank Account"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Conditional Fields Based on Method Type */}
            {methodType === 'bank_transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="e.g., First Bank of Nigeria"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bank_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.bank_name && <p className="text-red-600 text-sm mt-1">{errors.bank_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder="1234567890"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.account_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.account_number && <p className="text-red-600 text-sm mt-1">{errors.account_number}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.account_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.account_name && <p className="text-red-600 text-sm mt-1">{errors.account_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bank_code}
                    onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                    placeholder="e.g., 011"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {methodType === 'paypal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
            )}

            {methodType === 'mobile_money' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Money Provider
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.provider ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="9mobile">9mobile Money</option>
                    <option value="glo">Glo Money</option>
                  </select>
                  {errors.provider && <p className="text-red-600 text-sm mt-1">{errors.provider}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="e.g., +2348123456789"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
                </div>
              </>
            )}

            {methodType === 'stripe' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={formData.routing_number}
                    onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                    placeholder="123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Method'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Payout Settings Component
const PayoutSettingsPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  
  const router = useRouter();
  
  // API hooks
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading, error: paymentMethodsError } = usePaymentMethods();
  const { data: withdrawalHistory, isLoading: withdrawalLoading } = useWithdrawalHistory(1, 10);
  const addPaymentMethodMutation = useAddPaymentMethod();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const setDefaultPaymentMethodMutation = useSetDefaultPaymentMethod();
  
  const defaultMethod = paymentMethods.find(method => method.is_default);

  const handleAddPaymentMethod = async (newMethod: PaymentMethodRequest) => {
    try {
      await addPaymentMethodMutation.mutateAsync(newMethod);
      setShowAddForm(false);
      toast.success('Payment method added successfully!');
    } catch (error: any) {
      console.error('Failed to add payment method:', error);
      toast.error(error?.response?.data?.message || 'Failed to add payment method. Please try again.');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    setDeletingMethodId(id);
    try {
      await deletePaymentMethodMutation.mutateAsync(id);
      toast.success('Payment method deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete payment method:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete payment method. Please try again.');
    } finally {
      setDeletingMethodId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethodMutation.mutateAsync(id);
      toast.success('Default payment method updated successfully!');
    } catch (error: any) {
      console.error('Failed to set default payment method:', error);
      toast.error(error?.response?.data?.message || 'Failed to update default payment method. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex cursor-pointer items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Earnings
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1e3a8a] mb-2">
                Payout Settings
              </h1>
              <p className="text-gray-600">
                Manage your payment methods and withdrawal preferences
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Payment Methods
                </h2>
                <p className="text-gray-600 mt-1">
                  Add and manage your payout destinations
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </button>
            </div>
          </div>

          <div className="p-6">
            {paymentMethodsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paymentMethodsError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to load payment methods
                </h3>
                <p className="text-gray-600 mb-4">
                  There was an error loading your payment methods. Please try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payment methods
                </h3>
                <p className="text-gray-600 mb-4">
                  Add a payment method to receive your payouts
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    isDefault={method.is_default}
                    isDeleting={deletingMethodId === method.id}
                    onEdit={() => console.log('Edit', method.id)}
                    onDelete={() => handleDeleteMethod(method.id)}
                    onSetDefault={() => handleSetDefault(method.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Withdrawals
            </h2>
            <p className="text-gray-600 mt-1">
              Track your recent payout requests
            </p>
          </div>

          <div className="p-6">
            {withdrawalLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : withdrawalHistory?.withdrawals?.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No withdrawals yet
                </h3>
                <p className="text-gray-600">
                  Your withdrawal history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalHistory?.withdrawals?.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          ₦{withdrawal.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {withdrawal.withdrawal_method} • {new Date(withdrawal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        withdrawal.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : withdrawal.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : withdrawal.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddForm && (
          <AddPaymentMethodForm
            onClose={() => setShowAddForm(false)}
            onSave={handleAddPaymentMethod}
            isLoading={addPaymentMethodMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default PayoutSettingsPage;
