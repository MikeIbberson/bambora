const axios = require('axios');

const v1 = 'https://api.na.bambora.com/v1';

module.exports = class BamboraNode {
  constructor(key) {
    if (!key) throw new Error('Passcode required');
    const Authorization = `Passcode ${key}`;

    this.$client = axios.create({
      baseURL: v1,
      headers: {
        Authorization,
      },
    });
  }

  async postPayment({
    token: code,
    amount,
    billing,
    shipping,
    name,
  }) {
    try {
      const response = await this.$client.post(
        '/payments',
        {
          amount,
          payment_method: 'token',
          token: { code, name },
          billing,
          shipping,
        },
      );

      return response.data;
    } catch (e) {
      return {
        approved: '0',
        trace: e,
      };
    }
  }
};
