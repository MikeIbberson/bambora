const axios = require('axios');

/**
 * @NOTE
 * Purely for development!
 * Do not accept non-tokenized CC cards on the server.
 * For test cards, reference https://dev.na.bambora.com/docs/references/payment_APIs/test_cards/
 */
exports.getToken = async (cardDetails) => {
  const {
    data: { token },
  } = await axios.post(
    'https://api.na.bambora.com/scripts/tokenization/tokens',
    cardDetails,
  );

  return token;
};
