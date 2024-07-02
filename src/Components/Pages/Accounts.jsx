import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AppContext/AppContext';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, getDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '../Navbar/Navbar';
import Tabs from '../Accounts/Tabs';
import TrackingTab from '../Accounts/TrackingTab';
import AccountsTab from '../Accounts/AccountsTab';
import EscrowTab from '../Accounts/EscrowTab';
import FinancialTab from '../Accounts/FinancialTab';

const Accounts = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('tracking');
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(null);
    const [escrowBalance, setEscrowBalance] = useState(null);
    const [escrowTransactions, setEscrowTransactions] = useState([]);
    const [loadingEscrow, setLoadingEscrow] = useState(true);

    useEffect(() => {
        if (user) {
            console.log(`Fetching data for user: ${user.uid}`);

            // Fetch purchases made by the user
            const transactionsQuery = query(collection(db, "purchases"), where("buyerId", "==", user.uid));
            const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
                const transactionsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTransactions(transactionsData);
                console.log(`Fetched transactions: `, transactionsData);
            });

            // Fetch user's balance
            const userRef = doc(db, "users", user.uid);
            const userUnsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const userData = doc.data();
                    console.log(`Fetched user data: `, userData);
                    setBalance(userData.balance || 0);
                } else {
                    console.log("User document does not exist");
                }
            });

            // Fetch user's escrow transactions and calculate the escrow balance
            const escrowQuery = query(collection(db, "escrow"), where("sellerId", "==", user.uid));
            const unsubscribeEscrowTransactions = onSnapshot(escrowQuery, (snapshot) => {
                const escrowData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEscrowTransactions(escrowData);
                console.log(`Fetched escrow transactions: `, escrowData);

                // Calculate the total escrow balance
                const totalEscrowBalance = escrowData.reduce((acc, transaction) => {
                    if (transaction.status === 'held' || transaction.status === 'released') {
                        return acc + parseFloat(transaction.amount);
                    }
                    return acc;
                }, 0);

                setEscrowBalance(totalEscrowBalance);
                setLoadingEscrow(false);
            });

            return () => {
                unsubscribeTransactions();
                userUnsubscribe();
                unsubscribeEscrowTransactions();
            };
        } else {
            console.log("User not available in context");
        }
    }, [user]);

    const handleDeposit = async (amount) => {
        try {
            if (balance === null || balance === undefined) {
                alert("Balance information not available");
                return;
            }

            const newBalance = balance + amount;
            await updateDoc(doc(db, "users", user.uid), {
                balance: newBalance,
            });

            setBalance(newBalance); // Update local state

            alert(`Deposit of KSh ${amount.toFixed(2)} successful`);
        } catch (err) {
            console.error("Error making deposit: ", err);
            alert("Error making deposit");
        }
    };

    const handleWithdrawFromAccount = async (amount) => {
        try {
            if (balance === null || balance === undefined) {
                alert("Balance information not available");
                return;
            }

            if (balance < amount) {
                alert("Insufficient balance");
                return;
            }

            const newBalance = balance - amount;
            await updateDoc(doc(db, "users", user.uid), {
                balance: newBalance,
            });

            setBalance(newBalance); // Update local state

            alert(`Withdrawal of KSh ${amount.toFixed(2)} from account successful`);
        } catch (err) {
            console.error("Error making withdrawal from account: ", err);
            alert("Error making withdrawal from account");
        }
    };

    const handleWithdrawFromEscrow = async (transactionId, amount) => {
        try {
            const transactionRef = doc(db, "escrow", transactionId);

            await updateDoc(transactionRef, {
                status: "withdrawn",
            });

            const newEscrowBalance = escrowBalance - amount;
            const newBalance = balance + amount;
            await updateDoc(doc(db, "users", user.uid), {
                balance: newBalance,
            });

            setEscrowBalance(newEscrowBalance); // Update local state
            setBalance(newBalance); // Update local state

            alert(`Withdrawal of KSh ${amount.toFixed(2)} from escrow successful`);
        } catch (err) {
            console.error("Error making withdrawal from escrow: ", err);
            alert("Error making withdrawal from escrow");
        }
    };

    const handleConfirmReceipt = async (purchaseId) => {
        if (!purchaseId) {
            console.error('Purchase ID is missing');
            return;
        }

        try {
            const purchaseRef = doc(db, "purchases", purchaseId);
            const escrowQuery = query(collection(db, "escrow"), where("purchaseId", "==", purchaseId));
            const escrowQuerySnapshot = await getDocs(escrowQuery);

            // Ensure only one escrow transaction matches the purchaseId
            if (escrowQuerySnapshot.size !== 1) {
                console.error(`Expected exactly one escrow transaction for purchase ID ${purchaseId}, found ${escrowQuerySnapshot.size}`);
                return;
            }

            // Update purchase status to "confirmed"
            await updateDoc(purchaseRef, {
                status: "confirmed",
            });

            // Update escrow transaction status to "confirmed"
            const escrowTransactionRef = escrowQuerySnapshot.docs[0].ref;
            await updateDoc(escrowTransactionRef, {
                status: "confirmed",
            });

            // Notify the seller about the confirmation
            const purchaseDoc = await getDoc(purchaseRef);
            const purchaseData = purchaseDoc.data();
            const sellerRef = doc(db, "users", purchaseData.sellerId);

            await addDoc(collection(db, "notifications"), {
                userId: purchaseData.sellerId,
                type: "receiptConfirmed",
                message: `The buyer has confirmed the receipt of the product ${purchaseData.productDetails.name}.`,
                timestamp: serverTimestamp(),
            });

            console.log(`Confirmed receipt for purchase ${purchaseId} and updated escrow transaction`);
        } catch (err) {
            console.error("Error confirming receipt: ", err);
            alert("Error confirming receipt");
        }
    };

    return (
        <div className="relative">
            <div className="fixed top-0 z-10 w-full bg-white shadow-md">
                <Navbar />
            </div>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto px-16 py-8">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    {activeTab === 'tracking' && <TrackingTab />}
                    {activeTab === 'accounts' &&
                        <AccountsTab
                            transactions={transactions}
                            balance={balance}
                            handleDeposit={handleDeposit}
                            handleWithdrawFromAccount={handleWithdrawFromAccount}
                            handleConfirmReceipt={handleConfirmReceipt}
                        />
                    }
                    {activeTab === 'escrow' && (
                        <EscrowTab
                            escrowTransactions={escrowTransactions}
                            escrowBalance={escrowBalance}
                            handleWithdrawFromEscrow={handleWithdrawFromEscrow} 
                            user={user}
                            loading={loadingEscrow}
                        />
                    )}
                    {activeTab === 'financial' && <FinancialTab />}
                </div>
            </div>
        </div>
    );
};

export default Accounts;
