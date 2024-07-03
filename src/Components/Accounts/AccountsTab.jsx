import React, { useState } from 'react';

const AccountsTab = ({ transactions, balance, handleDeposit, handleWithdrawFromAccount, handleConfirmReceipt }) => {
    const [isDepositOpen, setDepositOpen] = useState(false);
    const [isWithdrawOpen, setWithdrawOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showCount, setShowCount] = useState(3); // Show only 4 notifications initially
    const [page, setPage] = useState(1); // Track current page

    const handleConfirmClick = (transaction) => {
        handleConfirmReceipt(transaction.id, transaction.escrowTransactionId);
    };

    const handleDepositClick = () => {
        setDepositOpen(!isDepositOpen);
        setWithdrawOpen(false);
    };

    const handleWithdrawClick = () => {
        setWithdrawOpen(!isWithdrawOpen);
        setDepositOpen(false);
    };

    const confirmDeposit = () => {
        handleDeposit(parseFloat(depositAmount));
        setDepositOpen(false);
        setDepositAmount('');
    };

    const confirmWithdraw = () => {
        handleWithdrawFromAccount(parseFloat(withdrawAmount));
        setWithdrawOpen(false);
        setWithdrawAmount('');
    };

    // Pagination logic
    const filteredNotifications = transactions; // Replace with actual filtering logic if needed
    const totalPages = Math.ceil(filteredNotifications.length / showCount);
    const startIndex = (page - 1) * showCount;
    const endIndex = startIndex + showCount;
    const visibleNotifications = filteredNotifications.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-full lg:w-3/4 mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Account Balance: {balance !== null ? `KSh ${balance.toFixed(2)}` : 'Loading...'}</h2>
            <div className="divide-y divide-gray-200">
                <p className="text-gray-700 font-medium text-sm mb-2">Your Products/Goods on Transits:</p>
                {visibleNotifications.map((transaction) => (
                    <div key={transaction.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                            <p className="text-xs font-medium">Product: {transaction.productDetails.name}</p>
                            <p className="text-xs text-gray-500">Price: KSh {transaction.productDetails.crossSalePrice}</p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                            <p className={`text-xs font-medium ${transaction.status === "confirmed" ? "text-green-500" : "text-yellow-500"}`}>Status: {transaction.status}</p>
                            {transaction.status === "pending" && (
                                <button
                                    className="bg-green-500 text-xs text-white py-1 px-2 rounded mt-2 sm:mt-0 sm:ml-2"
                                    onClick={() => handleConfirmClick(transaction)}
                                >
                                    Confirm Receipt
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <button className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100" onClick={handleDepositClick}>
                    Deposit
                </button>
                <button className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100 ml-2" onClick={handleWithdrawClick}>
                    Withdraw
                </button>

                {isDepositOpen && (
                    <div className="mt-4">
                        <input
                            type="number"
                            className="border border-gray-300 p-1 rounded text-sm"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                        <button className="bg-green-500 text-sm text-white py-1 px-4 rounded ml-2" onClick={confirmDeposit}>
                            Confirm
                        </button>
                    </div>
                )}

                {isWithdrawOpen && (
                    <div className="mt-4">
                        <input
                            type="number"
                            className="border border-gray-300 p-1 rounded text-sm"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                        <button className="bg-green-500 text-sm text-white py-1 px-4 rounded ml-2" onClick={confirmWithdraw}>
                            Confirm
                        </button>
                    </div>
                )}

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between mt-4">
                        <button
                            className={`border border-gray-300 text-gray-700 text-sm py-1 px-4 rounded hover:bg-gray-100 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handlePrevPage}
                            disabled={page === 1}
                        >
                            ← Previous
                        </button>
                        <button
                            className={`border border-gray-300 text-gray-700 text-sm py-1 px-4 rounded hover:bg-gray-100 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountsTab;
