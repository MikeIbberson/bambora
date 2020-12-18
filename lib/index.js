const axios = require('axios');
const get = require('lodash.get');

const v1 = 'https://api.na.bambora.com/v1';

module.exports = class BamboraNode {
  constructor(key, skipPreAuthorization = false) {
    if (!key) throw new Error('Passcode required');
    const Authorization = `Passcode ${key}`;

    // should we expand this integration
    // keeping it in the context might make it more portable
    this.$complete = skipPreAuthorization;

    if (skipPreAuthorization)
      // eslint-disable-next-line
      console.log(
        'The skipPreAuthorization param is deprecated',
      );

    this.$client = axios.create({
      baseURL: v1,
      headers: {
        Authorization,
      },
    });

    const makePaymentTokenMethod = (complete) => (params) =>
      this.__$postWithToken({
        ...params,
        complete,
      });

    const makePaymentAmountMethod = (params) => (params1) =>
      this.__$postWithAmount({
        ...params,
        ...params1,
      });

    this.pre = makePaymentTokenMethod(false);
    this.post = makePaymentTokenMethod(true);

    this.complete = makePaymentAmountMethod({
      verb: 'completions',
      payment_method: 'token',
    });

    this.void = makePaymentAmountMethod({
      verb: 'void',
    });

    this.refund = makePaymentAmountMethod({
      verb: 'returns',
    });

    // appease projects on first implementation of this project
    // originally, everything was done through one action
    this.postPayment = this.pay.bind(this);
  }

  static makePaymentPath(parts = []) {
    return ['/payments', ...parts]
      .filter(Boolean)
      .join('/');
  }

  async __$post(url, body) {
    try {
      const response = await this.$client.post(url, body);
      return response.data;
    } catch (e) {
      const err = new Error();
      throw Object.assign(err, e.response.data, {
        approved: '0',
      });
    }
  }

  async __$postWithAmount({ id, amount, verb, ...rest }) {
    return this.__$post(
      this.constructor.makePaymentPath([id, verb]),
      {
        ...rest,
        amount,
      },
    );
  }

  async __$postWithToken({
    token,
    amount,
    billing,
    shipping,
    name,
    // eslint-disable-next-line
    order_number,
    ...rest
  }) {
    return this.__$post(
      this.constructor.makePaymentPath(),
      {
        order_number,
        payment_method: 'token',
        amount,
        billing,
        shipping,
        token: {
          code: token,
          name,
          ...rest,
        },
      },
    );
  }

  async pay(orderProps = {}, onPreAuthMismatch) {
    try {
      const response = await this.__$postWithToken({
        ...orderProps,
        complete: this.$complete,
      });

      const { id, message } = get(response, 'card.avs', {
        id: 'Y',
      });

      if (
        typeof onPreAuthMismatch === 'function' &&
        // https://dev.na.bambora.com/docs/references/checkout/misc/
        // the type property will let users know the transaction type
        get(response, 'type') === 'P' &&
        // https://dev.na.bambora.com/docs/references/AVS/
        // these codes correspond to completed or unavailable responses
        !['0', 'D', 'M', 'S', 'X', 'Y'].includes(String(id))
      )
        onPreAuthMismatch({
          ...response,
          ...orderProps,
          transactionId: get(response, 'id'),
          avsId: id,
          message,
        });

      return response;
    } catch (e) {
      return {
        approved: '0',
        trace: e,
      };
    }
  }
};
