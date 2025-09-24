"use client";
import { Input } from "@woothomes/components";
import { PaymentMethod } from "@woothomes/types/account";
import { useState } from "react";
// import { toast } from "sonner";

export default function Payments() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    card_holder: "",
    card_number: "",
    expiry_date: "",
    cvv: "",
    billing_address: {
      street: "",
      house_number: "",
      city: "",
      country: "",
      zip_code: "",
    },
  });

  const handleSave = async () => {
    try {
      // toast.success("Payment method added successfully");
    } catch {
      console.error("Failed to add payment method");
    }
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name of Card Holder
          </label>
          <Input
            type="text"
            value={paymentMethod.card_holder}
            onChange={(e) =>
              setPaymentMethod({
                ...paymentMethod,
                card_holder: e.target.value,
              })
            }
            className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <Input
            type="text"
            value={paymentMethod.card_number}
            onChange={(e) =>
              setPaymentMethod({
                ...paymentMethod,
                card_number: e.target.value,
              })
            }
            className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiration Date
            </label>
            <Input
              type="text"
              placeholder="MM/YY"
              value={paymentMethod.expiry_date}
              onChange={(e) =>
                setPaymentMethod({
                  ...paymentMethod,
                  expiry_date: e.target.value,
                })
              }
              className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CVV
            </label>
            <Input
              type="text"
              value={paymentMethod.cvv}
              onChange={(e) =>
                setPaymentMethod({ ...paymentMethod, cvv: e.target.value })
              }
              className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Billing Address
          </h3>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Street Name"
              value={paymentMethod.billing_address.street}
              onChange={(e) =>
                setPaymentMethod({
                  ...paymentMethod,
                  billing_address: {
                    ...paymentMethod.billing_address,
                    street: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="House Number"
                value={paymentMethod.billing_address.house_number}
                onChange={(e) =>
                  setPaymentMethod({
                    ...paymentMethod,
                    billing_address: {
                      ...paymentMethod.billing_address,
                      house_number: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
              />
              <Input
                type="text"
                placeholder="City"
                value={paymentMethod.billing_address.city}
                onChange={(e) =>
                  setPaymentMethod({
                    ...paymentMethod,
                    billing_address: {
                      ...paymentMethod.billing_address,
                      city: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={paymentMethod.billing_address.country}
                onChange={(e) =>
                  setPaymentMethod({
                    ...paymentMethod,
                    billing_address: {
                      ...paymentMethod.billing_address,
                      country: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
              >
                <option value="">Select Country</option>
                <option value="NG">Nigeria</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
              </select>
              <Input
                type="text"
                placeholder="Zip Code"
                value={paymentMethod.billing_address.zip_code}
                onChange={(e) =>
                  setPaymentMethod({
                    ...paymentMethod,
                    billing_address: {
                      ...paymentMethod.billing_address,
                      zip_code: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#0ea2e2] text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
