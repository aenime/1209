import React, { useState } from 'react';
import { getPrimaryThemeColor, getSecondaryThemeColor } from '../../utils/themeColorsSimple';

const SizeChart = ({ isOpen, onClose, category = 'unisex' }) => {
  const [activeTab, setActiveTab] = useState('men');
  const [activeSubTab, setActiveSubTab] = useState('clothing');
  const [isMobileView, setIsMobileView] = useState(false);

  // Get dynamic colors from database
  const keyColor = getPrimaryThemeColor();
  const sColor = getSecondaryThemeColor();

  // Comprehensive size charts with measurements in CM
  const sizeCharts = {
    men: {
      clothing: [
        { size: 'XS', chest: '81-86', waist: '66-71', hip: '86-91', shoulder: '42', length: '68' },
        { size: 'S', chest: '86-91', waist: '71-76', hip: '91-96', shoulder: '44', length: '70' },
        { size: 'M', chest: '91-96', waist: '76-81', hip: '96-101', shoulder: '46', length: '72' },
        { size: 'L', chest: '96-102', waist: '81-86', hip: '101-106', shoulder: '48', length: '74' },
        { size: 'XL', chest: '102-107', waist: '86-91', hip: '106-111', shoulder: '50', length: '76' },
        { size: '2XL', chest: '107-112', waist: '91-96', hip: '111-116', shoulder: '52', length: '78' },
        { size: '3XL', chest: '112-117', waist: '96-101', hip: '116-121', shoulder: '54', length: '80' },
        { size: '4XL', chest: '117-122', waist: '101-106', hip: '121-126', shoulder: '56', length: '82' },
        { size: '5XL', chest: '122-127', waist: '106-111', hip: '126-131', shoulder: '58', length: '84' }
      ],
      footwear: [
        { size: 'UK 6', us: '7', eu: '40', cm: '25.0' },
        { size: 'UK 7', us: '8', eu: '41', cm: '25.5' },
        { size: 'UK 8', us: '9', eu: '42', cm: '26.0' },
        { size: 'UK 9', us: '10', eu: '43', cm: '26.5' },
        { size: 'UK 10', us: '11', eu: '44', cm: '27.0' },
        { size: 'UK 11', us: '12', eu: '45', cm: '27.5' },
        { size: 'UK 12', us: '13', eu: '46', cm: '28.0' }
      ]
    },
    women: {
      clothing: [
        { size: 'XS', bust: '81-84', waist: '61-64', hip: '86-89', shoulder: '36', length: '58' },
        { size: 'S', bust: '84-87', waist: '64-67', hip: '89-92', shoulder: '37', length: '59' },
        { size: 'M', bust: '87-92', waist: '67-72', hip: '92-97', shoulder: '38', length: '60' },
        { size: 'L', bust: '92-97', waist: '72-77', hip: '97-102', shoulder: '39', length: '61' },
        { size: 'XL', bust: '97-102', waist: '77-82', hip: '102-107', shoulder: '40', length: '62' },
        { size: '2XL', bust: '102-107', waist: '82-87', hip: '107-112', shoulder: '41', length: '63' },
        { size: '3XL', bust: '107-112', waist: '87-92', hip: '112-117', shoulder: '42', length: '64' },
        { size: '4XL', bust: '112-117', waist: '92-97', hip: '117-122', shoulder: '43', length: '65' },
        { size: '5XL', bust: '117-122', waist: '97-102', hip: '122-127', shoulder: '44', length: '66' }
      ],
      footwear: [
        { size: 'UK 3', us: '5', eu: '36', cm: '22.5' },
        { size: 'UK 4', us: '6', eu: '37', cm: '23.0' },
        { size: 'UK 5', us: '7', eu: '38', cm: '23.5' },
        { size: 'UK 6', us: '8', eu: '39', cm: '24.0' },
        { size: 'UK 7', us: '9', eu: '40', cm: '24.5' },
        { size: 'UK 8', us: '10', eu: '41', cm: '25.0' },
        { size: 'UK 9', us: '11', eu: '42', cm: '25.5' }
      ]
    }
  };

  const measurementTips = {
    men: {
      chest: "Measure around the fullest part of your chest, keeping the tape parallel to the floor",
      waist: "Measure around your natural waistline, keeping the tape comfortably loose",
      hip: "Measure around the fullest part of your hips",
      shoulder: "Measure from one shoulder point to the other across your back"
    },
    women: {
      bust: "Measure around the fullest part of your bust, keeping the tape parallel to the floor",
      waist: "Measure around your natural waistline, the narrowest part of your torso",
      hip: "Measure around the fullest part of your hips",
      shoulder: "Measure from one shoulder point to the other across your back"
    }
  };

  if (!isOpen) return null;

  const currentData = sizeCharts[activeTab];
  const currentTips = measurementTips[activeTab];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div 
          className="text-white p-4 sm:p-6 relative overflow-hidden"
          style={{
            background: activeTab === 'men' 
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Size Chart Guide</h2>
                <p className="text-white/80 mt-1 text-sm sm:text-base">Find your perfect fit with our comprehensive size guide</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-100px)]">
          {/* Modern Tab Navigation */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            {/* Main Category Tabs - Gender */}
            <div className="border-b border-gray-100">
              <div className="flex bg-gray-50">
                <button
                  onClick={() => setActiveTab('men')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 relative ${
                    activeTab === 'men'
                      ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Man</span>
                  </div>
                  {activeTab === 'men' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('women')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 relative ${
                    activeTab === 'women'
                      ? 'text-white bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <span>Woman</span>
                  </div>
                  {activeTab === 'women' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Sub Category Tabs - Product Type */}
            <div className="bg-white">
              <div className="flex">
                <button
                  onClick={() => setActiveSubTab('clothing')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 relative ${
                    activeSubTab === 'clothing'
                      ? `text-${activeTab === 'men' ? 'blue' : 'pink'}-600 bg-${activeTab === 'men' ? 'blue' : 'pink'}-50 border-b-2 border-${activeTab === 'men' ? 'blue' : 'pink'}-600`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={activeSubTab === 'clothing' ? {
                    backgroundColor: activeTab === 'men' ? '#eff6ff' : '#fdf2f8',
                    color: activeTab === 'men' ? '#2563eb' : '#ec4899',
                    borderBottomColor: activeTab === 'men' ? '#2563eb' : '#ec4899'
                  } : {}}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">👕</span>
                    <span className="hidden sm:inline">Clothing</span>
                    <span className="sm:hidden">Clothe</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSubTab('footwear')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 relative ${
                    activeSubTab === 'footwear'
                      ? `text-${activeTab === 'men' ? 'blue' : 'pink'}-600 bg-${activeTab === 'men' ? 'blue' : 'pink'}-50 border-b-2 border-${activeTab === 'men' ? 'blue' : 'pink'}-600`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={activeSubTab === 'footwear' ? {
                    backgroundColor: activeTab === 'men' ? '#eff6ff' : '#fdf2f8',
                    color: activeTab === 'men' ? '#2563eb' : '#ec4899',
                    borderBottomColor: activeTab === 'men' ? '#2563eb' : '#ec4899'
                  } : {}}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">👟</span>
                    <span className="hidden sm:inline">Footwear</span>
                    <span className="sm:hidden">Shoes</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6">
            {/* Category Indicator */}
            <div className="mb-4 flex items-center justify-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                activeTab === 'men' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                <span className="mr-2">{activeTab === 'men' ? '👨' : '👩'}</span>
                <span className="capitalize">{activeTab}</span>
                <span className="mx-2">•</span>
                <span>{activeSubTab === 'clothing' ? '👕 Clothing' : '👟 Footwear'}</span>
              </div>
            </div>

            {/* Quick Size Selector - Mobile Only */}
            <div className="block sm:hidden mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Quick Size Finder
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].map((size) => (
                    <button
                      key={size}
                      className="bg-gray-100 border border-gray-300 rounded-md py-2 px-1 text-xs font-medium text-gray-700 transition-colors hover:shadow-md"
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = activeTab === 'men' ? '#dbeafe' : '#fce7f3';
                        e.target.style.color = activeTab === 'men' ? '#2563eb' : '#ec4899';
                        e.target.style.borderColor = activeTab === 'men' ? '#2563eb' : '#ec4899';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '';
                        e.target.style.color = '';
                        e.target.style.borderColor = '';
                      }}
                      onClick={() => {
                        const element = document.getElementById(`size-${size}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeSubTab === 'clothing' && (
              <>
                {/* Measurement Tips */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-yellow-800 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">How to Measure</h4>
                      <div className="text-yellow-700 text-xs sm:text-sm space-y-1">
                        {Object.entries(currentTips).map(([key, tip]) => (
                          <div key={key} className="mb-1">
                            <span className="font-medium capitalize text-xs sm:text-sm">{key}:</span>
                            <span className="block sm:inline ml-0 sm:ml-1 text-xs">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Size Table */}
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="min-w-[700px] sm:min-w-0">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm text-xs sm:text-sm">
                      <thead>
                        <tr 
                          className="text-white"
                          style={{ 
                            backgroundColor: activeTab === 'men' ? '#2563eb' : '#ec4899'
                          }}
                        >
                          <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Size</th>
                          <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">
                            {activeTab === 'men' ? 'Chest' : 'Bust'}
                          </th>
                          <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Waist</th>
                          <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Hip</th>
                          <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Shoulder</th>
                          <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.clothing.map((item, index) => (
                          <tr key={item.size} id={`size-${item.size}`} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-900">{item.size}</td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                              {activeTab === 'men' ? item.chest : item.bust}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700">{item.waist}</td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700">{item.hip}</td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700">{item.shoulder}</td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700">{item.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View - Alternative for very small screens */}
                <div className="block sm:hidden mt-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">Size Guide (Swipe for details)</h5>
                  <div className="space-y-2">
                    {currentData.clothing.slice(0, 5).map((item, index) => (
                      <div key={item.size} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-lg">{item.size}</span>
                          <span className="text-xs text-gray-500">All in CM</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">{activeTab === 'men' ? 'Chest:' : 'Bust:'}</span>
                            <span className="ml-1 font-medium">{activeTab === 'men' ? item.chest : item.bust}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Waist:</span>
                            <span className="ml-1 font-medium">{item.waist}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Hip:</span>
                            <span className="ml-1 font-medium">{item.hip}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Length:</span>
                            <span className="ml-1 font-medium">{item.length}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {currentData.clothing.length > 5 && (
                      <button 
                        onClick={() => setIsMobileView(!isMobileView)}
                        className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2 text-blue-600 text-sm font-medium"
                      >
                        {isMobileView ? 'Show Less' : `Show All ${currentData.clothing.length - 5} More Sizes`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile-only additional info */}
                <div className="sm:hidden mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-xs font-medium mb-1">💡 Swipe table horizontally to see all measurements</p>
                  <p className="text-blue-700 text-xs">Shoulder & Length measurements available on larger screens</p>
                </div>
              </>
            )}

            {activeSubTab === 'footwear' && (
              <>
                {/* Footwear Measurement Tips */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-blue-800 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Footwear Sizing Tips</h4>
                      <div className="text-blue-700 text-xs sm:text-sm space-y-1">
                        <div>• Measure feet in the evening when largest</div>
                        <div>• Stand on paper and mark toe and heel</div>
                        <div>• Measure distance in centimeters</div>
                        <div>• Choose larger size if between sizes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footwear Size Table */}
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="min-w-[400px] sm:min-w-0">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm text-xs sm:text-sm">
                      <thead>
                        <tr 
                          className="text-white"
                          style={{ 
                            backgroundColor: activeTab === 'men' ? '#2563eb' : '#ec4899'
                          }}
                        >
                          <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">UK</th>
                          <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">US</th>
                          <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">EU</th>
                          <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">CM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.footwear.map((item, index) => (
                          <tr key={item.size} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                            <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 font-semibold text-gray-900">{item.size}</td>
                            <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-700">{item.us}</td>
                            <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-700">{item.eu}</td>
                            <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-700">{item.cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Additional Notes */}
            <div className="mt-4 sm:mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">📏 Important Notes</h4>
              <div className="text-gray-700 text-xs sm:text-sm space-y-1">
                <div>• All measurements are in centimeters (CM)</div>
                <div>• Sizes may vary between brands and styles</div>
                <div>• Try on items when possible for best fit</div>
                <div>• Choose larger size if between sizes</div>
                <div>• Contact support for sizing assistance</div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-gray-600 text-xs sm:text-sm">
                Still not sure about sizing? 
                <button className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline">
                  Contact our support team →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChart;
