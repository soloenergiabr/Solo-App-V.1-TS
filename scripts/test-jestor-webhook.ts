import axios from 'axios';

async function testWebhook() {
    try {
        console.log('Testing Jestor Webhook...');

        const payload = {
            id_jestor: "test_jestor_id_123",
            status: "Ganho",
            valor_projeto: 50000,
            email: "test@example.com",
            cpf: "123.456.789-00"
        };

        console.log('Sending payload:', payload);

        const response = await axios.post('http://localhost:3000/api/webhooks/jestor', payload, {
            validateStatus: () => true
        });

        console.log('Response Status:', response.status);
        console.log('Response Body:', response.data);

        if (response.status === 500 && response.data.error && response.data.error.includes('Indication not found')) {
            console.log('✅ SUCCESS: Webhook endpoint is reachable and processing logic is working (correctly failed to find non-existent indication).');
        } else if (response.status === 200) {
            console.log('✅ SUCCESS: Webhook processed successfully.');
        } else {
            console.log('⚠️ UNEXPECTED RESPONSE: Check server logs.');
        }

    } catch (error: any) {
        console.error('❌ ERROR: Could not connect to server. Is it running on port 3000?');
        console.error(error.message);
    }
}

testWebhook();
