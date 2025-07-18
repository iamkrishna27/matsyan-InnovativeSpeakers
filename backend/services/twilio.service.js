const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return { success: true };
  } catch (err) {
    console.error('Twilio error:', err.message);
    return { error: err.message };
  }
};
