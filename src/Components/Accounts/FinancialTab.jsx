import React from 'react';

const FinancialTab = () => {

    const generateFinancialReport = (type) => {
        // Function logic here
    };

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-full md:w-3/4 lg:w-2/3">
            <h3 className="text-xl font-semibold mb-4">Financial Summaries</h3>
            <div className="mt-2 flex flex-wrap gap-4">
                <button
                    className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100"
                    onClick={() => generateFinancialReport('monthly')}
                >
                    Monthly Report
                </button>
                <button
                    className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100"
                    onClick={() => generateFinancialReport('yearly')}
                >
                    Yearly Report
                </button>
            </div>
        </div>
    );
};

export default FinancialTab;
