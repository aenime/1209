#!/usr/bin/env node

/**
 * Test script to verify payment return URL functionality
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:10000';

async function testReturnUrl() {
    console.log('🧪 Testing Payment Return URL Functionality...');
    console.log('='.repeat(50));

    try {
        // Test 1: Success scenario
        console.log('\n📋 Test 1: Payment Success Scenario');
        const successUrl = `${SERVER_URL}/api/enhanced-payment/return?order_id=TEST_ORDER_SUCCESS&payment_status=SUCCESS&order_status=PAID`;
        console.log(`🔗 Testing URL: ${successUrl}`);
        
        try {
            const successResponse = await axios.get(successUrl, {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 400; // Accept redirects
                }
            });
            console.log(`✅ Success redirect status: ${successResponse.status}`);
            if (successResponse.headers.location) {
                console.log(`🎯 Redirect URL: ${successResponse.headers.location}`);
                if (successResponse.headers.location.includes('/thankyou')) {
                    console.log('✅ Correctly redirects to thank you page');
                } else {
                    console.log('❌ Does not redirect to thank you page');
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 302) {
                console.log(`✅ Success redirect status: ${error.response.status}`);
                console.log(`🎯 Redirect URL: ${error.response.headers.location}`);
                if (error.response.headers.location.includes('/thankyou')) {
                    console.log('✅ Correctly redirects to thank you page');
                } else {
                    console.log('❌ Does not redirect to thank you page');
                }
            } else {
                console.log('❌ Error:', error.message);
            }
        }

        // Test 2: Failure scenario
        console.log('\n📋 Test 2: Payment Failure Scenario');
        const failureUrl = `${SERVER_URL}/api/enhanced-payment/return?order_id=TEST_ORDER_FAIL&payment_status=FAILED&order_status=ACTIVE`;
        console.log(`🔗 Testing URL: ${failureUrl}`);
        
        try {
            const failureResponse = await axios.get(failureUrl, {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 400; // Accept redirects
                }
            });
            console.log(`✅ Failure redirect status: ${failureResponse.status}`);
            if (failureResponse.headers.location) {
                console.log(`🎯 Redirect URL: ${failureResponse.headers.location}`);
                if (failureResponse.headers.location.includes('/cart')) {
                    console.log('✅ Correctly redirects to cart page');
                } else {
                    console.log('❌ Does not redirect to cart page');
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 302) {
                console.log(`✅ Failure redirect status: ${error.response.status}`);
                console.log(`🎯 Redirect URL: ${error.response.headers.location}`);
                if (error.response.headers.location.includes('/cart')) {
                    console.log('✅ Correctly redirects to cart page');
                } else {
                    console.log('❌ Does not redirect to cart page');
                }
            } else {
                console.log('❌ Error:', error.message);
            }
        }

        // Test 3: Missing order ID scenario
        console.log('\n📋 Test 3: Missing Order ID Scenario');
        const missingOrderUrl = `${SERVER_URL}/api/enhanced-payment/return?payment_status=SUCCESS`;
        console.log(`🔗 Testing URL: ${missingOrderUrl}`);
        
        try {
            const missingResponse = await axios.get(missingOrderUrl, {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 400; // Accept redirects
                }
            });
            console.log(`✅ Missing order redirect status: ${missingResponse.status}`);
            if (missingResponse.headers.location) {
                console.log(`🎯 Redirect URL: ${missingResponse.headers.location}`);
                if (missingResponse.headers.location.includes('/cart')) {
                    console.log('✅ Correctly redirects to cart page with error');
                } else {
                    console.log('❌ Does not redirect to cart page');
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 302) {
                console.log(`✅ Missing order redirect status: ${error.response.status}`);
                console.log(`🎯 Redirect URL: ${error.response.headers.location}`);
                if (error.response.headers.location.includes('/cart')) {
                    console.log('✅ Correctly redirects to cart page with error');
                } else {
                    console.log('❌ Does not redirect to cart page');
                }
            } else {
                console.log('❌ Error:', error.message);
            }
        }

        console.log('\n🎉 Return URL Testing Complete!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run the test
testReturnUrl();
