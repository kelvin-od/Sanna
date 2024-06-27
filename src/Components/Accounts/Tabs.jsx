import React from 'react';

const Tabs = ({ activeTab, setActiveTab }) => (
    <div className="mb-6 mt-16">
        <ul className="flex mb-0 list-none pl-0">
            <li className="-mb-px mr-2 last:mr-0 text-center">
                <button
                    className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${activeTab === 'tracking' ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'}`}
                    onClick={() => setActiveTab('tracking')}
                >
                    Tracking
                </button>
            </li>
            <li className="-mb-px mr-2 last:mr-0 text-center">
                <button
                    className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${activeTab === 'accounts' ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'}`}
                    onClick={() => setActiveTab('accounts')}
                >
                    Accounts
                </button>
            </li>
            <li className="-mb-px last:mr-0 mr-2 text-center">
                <button
                    className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${activeTab === 'escrow' ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'}`}
                    onClick={() => setActiveTab('escrow')}
                >
                    Escrow
                </button>
            </li>
            <li className="-mb-px last:mr-0 text-center">
                <button
                    className={`text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ${activeTab === 'financial' ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'}`}
                    onClick={() => setActiveTab('financial')}
                >
                    Financial
                </button>
            </li>
        </ul>
    </div>
);

export default Tabs;
