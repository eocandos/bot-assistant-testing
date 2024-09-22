import axios from 'axios';

const { GRAPH_API_TOKEN } = process.env;

export const sendTextMessage = async (businessPhoneId, userPhone, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v20.0/${businessPhoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: userPhone,
        type: 'text',
        text: {
          body: 'Message: ' + message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'Error en el envío del Mensaje al usuario:',
      error.response ? error.response.data : error.message
    );
  }
};
