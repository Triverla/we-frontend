"use client";

import ChangePasswordModal from "@woothomes/components/account/ChangePasswordModal";
import { useState } from "react";
// import { toast } from "sonner";

export default function Security() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handle2FA = async () => {
    try {
      // toast.success("2FA settings updated");
    } catch (error) {
      console.log(error, " error");
      console.error("Failed to update 2FA settings");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // toast.success("Account deleted successfully");
    } catch (error) {
      console.log(error, " error");
      console.error("Failed to delete account");
    }
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Change Password
            </h3>
            <p className="text-sm text-gray-500">Update your password</p>
          </div>
          <button
            onClick={handleChangePassword}
            className="bg-[#15a4de] text-white rounded-b-full rounded-t-full py-1 px-3 text-center cursor-pointer"
          >
            <span className="text-xl font-bold">&gt;</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              2 Factor Authentication
            </h3>
            <p className="text-sm text-gray-500">
              Add an extra layer of security
            </p>
          </div>
          <button
            onClick={handle2FA}
            className="bg-[#15a4de] text-white rounded-b-full rounded-t-full py-1 px-3 text-center cursor-pointer"
          >
            <span className="text-xl font-bold">&gt;</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="text-lg font-medium text-red-600">
              Delete Account
            </h3>
            <p className="text-sm text-gray-500">
              Permanently delete your account
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-[#15a4de] text-white rounded-b-full rounded-t-full py-1 px-3 text-center cursor-pointer"
          >
            <span className="text-xl font-bold">&gt;</span>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
}
