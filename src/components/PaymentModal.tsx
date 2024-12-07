"use client";

interface PaymentModalProps {
  amount: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  error: string | null;
}

const PaymentModal = ({
  amount,
  onConfirm,
  onCancel,
  isProcessing,
  error,
}: PaymentModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Confirm Game Entry</h3>

        <p className="mb-4">
          Entry fee: {amount} USDC will be deducted from your wallet to start
          the game.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center`}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⚪</span>
                Processing...
              </>
            ) : (
              "Confirm Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
