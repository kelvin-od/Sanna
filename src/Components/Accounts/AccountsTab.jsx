import React, { useState } from 'react';

const AccountsTab = ({ transactions, balance, handleDeposit, handleWithdrawFromAccount, handleConfirmReceipt }) => {
    const [isDepositOpen, setDepositOpen] = useState(false);
    const [isWithdrawOpen, setWithdrawOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

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

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-[70%]">
            <h2 className="text-2xl font-bold mb-4">Account Balance: {balance !== null ? `KSh ${balance.toFixed(2)}` : 'Loading...'}</h2>
            <div className="divide-y divide-gray-200">
                <p className="text-gray-700 font-medium text-sm mb-2">Your Products/Goods on Transits:</p>
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium">Product: {transaction.productDetails.name}</p>
                            <p className="text-xs text-gray-500">Price: KSh {transaction.productDetails.crossSalePrice}</p>
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${transaction.status === "confirmed" ? "text-green-500" : "text-yellow-500"}`}>Status: {transaction.status}</p>
                            {transaction.status === "pending" && (
                                <button
                                    className="bg-green-500 text-xs text-white py-1 px-2 rounded mt-2"
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
            </div>
        </div>
    );
};

export default AccountsTab;
