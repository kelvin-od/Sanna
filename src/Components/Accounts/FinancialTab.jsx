import React from 'react';

const FinancialTab = () => {

    const generateFinancialReport = () => {
        // Function logic here
    };

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-[70%]">
            <h3 className="text-xl font-semibold mb-4">Financial Summaries</h3>
            <div className="mt-2 space-x-4">
                <button className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100 ml-2" onClick={() => generateFinancialReport('monthly')}>
                    Monthly Report
                </button>
                <button className="border border-green-500 text-gray-700 text-sm py-1 px-4 rounded hover:bg-green-100 ml-2" onClick={() => generateFinancialReport('yearly')}>
                    Yearly Report
                </button>
            </div>
        </div>
    );


} 



export default FinancialTab;
