import React, { useState } from 'react';

const EscrowTab = ({ user, handleWithdrawFromEscrow, loading, escrowTransactions, escrowBalance }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const transactionsPerPage = 3;

    // Calculate the transactions to display for the current page
    const startIndex = currentPage * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const currentTransactions = escrowTransactions.slice(startIndex, endIndex);

    // Handle previous and next buttons
    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (endIndex < escrowTransactions.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-full lg:w-3/4 mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
                Escrow Balance: {loading ? 'Loading...' : (escrowBalance !== null ? `KSh ${escrowBalance.toFixed(2)}` : 'N/A')}
            </h2>
            <div className="mt-4">
                <p className="text-gray-700 font-medium text-sm mb-2">Your Products Purchased by Others:</p>
                <ul className="divide-y divide-gray-200">
                    {currentTransactions.map((transaction) => {
                        return (
                            <li key={transaction.id} className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer relative">
                                <div>
                                    <p className="text-xs font-medium">Product: {transaction.productName}</p>
                                    <p className="text-xs text-gray-500">Price: KSh {transaction.amount}</p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                    <p className={`text-sm font-medium ${transaction.status === "held" ? "text-blue-500" : "text-green-500"}`}>Status: {transaction.status}</p>
                                    {transaction.status === "released" && (
                                        <button
                                            className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100 ml-2"
                                            onClick={() => handleWithdrawFromEscrow(transaction.id, transaction.amount)}
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                    <span className="tooltip absolute top-full left-0 w-full p-2 bg-gray-800 text-white text-xs opacity-0 pointer-events-none">
                                        The funds are frozen until the buyer confirms receipt.
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <div className="flex justify-between mt-4 border-t pt-4">
                    <button
                        className="border border-gray-300 text-gray-700 text-sm py-1 px-4 rounded hover:bg-gray-100"
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                    >
                        ← Previous
                    </button>
                    <button
                        className="border border-gray-300 text-gray-700 text-sm py-1 px-4 rounded hover:bg-gray-100"
                        onClick={handleNext}
                        disabled={endIndex >= escrowTransactions.length}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EscrowTab;
