const axios = require('axios');
const get = require('lodash.get');

const v1 = 'https://api.na.bambora.com/v1';

module.exports = class BamboraNode {
  constructor(key, enablePreAuthorization = true) {
    if (!key) throw new Error('Passcode required');
    const Authorization = `Passcode ${key}`;

    // should we expand this integration
    // keeping it in the context might make it more portable
    this.$complete = !enablePreAuthorization;

    this.$client = axios.create({
      baseURL: v1,
      headers: {
        Authorization,
      },
    });
  }

  async postPayment(orderProps = {}, onPreAuthMismatch) {
    try {
      const {
        token: code,
        amount,
        billing,
        shipping,
        name,
      } = orderProps;
      const response = await this.$client.post(
        '/payments',
        {
          amount,
          payment_method: 'token',
          token: {
            complete: this.$complete,
            code,
            name,
          },
          billing,
          shipping,
        },
      );

      const { id, message } = get(
        response,
        'data.card.avs',
        {
          id: 'Y',
        },
      );

      if (
        typeof onPreAuthMismatch === 'function' &&
        // https://dev.na.bambora.com/docs/references/checkout/misc/
        // the type property will let users know the transaction type
        get(response, 'data.type') === 'P' &&
        // https://dev.na.bambora.com/docs/references/AVS/
        // these codes correspond to completed or unavailable responses
        !['0', 'D', 'M', 'S', 'X', 'Y'].includes(String(id))
      )
        onPreAuthMismatch({
          ...response.data,
          ...orderProps,
          transactionId: get(response, 'data.id'),
          avsId: id,
          message,
        });

      return response.data;
    } catch (e) {
      return {
        approved: '0',
        trace: e,
      };
    }
  }
};
