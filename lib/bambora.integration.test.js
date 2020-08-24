require('dotenv').config();
const Bambora = require('.');
const { getToken } = require('./utils');

const genAddress = (overrides = {}) => ({
  name: 'Finance manager',
  province: 'ON',
  address_line1: '480 Danforth Ave',
  address_line2: '',
  postal_code: 'M4K 1P4',
  phone_number: '(416) 465-4681',
  email_address: 'mibberson@3merge.ca',
  city: 'Toronto',
  country: 'CA',
  ...overrides,
});

describe('Bambora integration', () => {
  it('should return approved', async () => {
    const client = new Bambora(process.env.PASSCODE);
    const address = genAddress();
    const callback = jest.fn();

    const c = client.postPayment(
      {
        token: await getToken({
          number: '4030000010001234',
          cvd: '123',
          'expiry_month': '02',
          'expiry_year': '20',
        }),
        id: '902389',
        shipping: address,
        billing: address,
        amount: 123.2,
        name: 'Rick',
      },
      callback,
    );

    expect(callback).not.toHaveBeenCalled();
    expect(c).resolves.toMatchObject({
      approved: '1',
      type: 'PA',
    });
  });

  it('should report pre-auth failure', async () => {
    const client = new Bambora(process.env.PASSCODE, true);
    const address = genAddress();
    const callback = jest.fn();
    const id = '902389';

    await client.postPayment(
      {
        token: await getToken({
          number: '4030000010001234',
          cvd: '123',
          'expiry_month': '02',
          'expiry_year': '20',
        }),

        shipping: address,
        billing: address,
        amount: 123.2,
        name: 'Rick',
        id,
      },
      callback,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: expect.any(String),
        message: expect.any(String),
        avsId: 'N',
        type: 'P',
        id,
      }),
    );
  });

  it('should return declined', async () => {
    const client = new Bambora(process.env.PASSCODE);
    const address = genAddress();

    expect(
      client.postPayment({
        token: await getToken({
          number: '5100000020002000',
          cvd: '123',
          'expiry_month': '02',
          'expiry_year': '20',
        }),
        id: '902389',
        shipping: address,
        billing: address,
        amount: 123.2,
        name: 'Rick',
      }),
    ).resolves.toMatchObject({
      approved: '0',
    });
  });
});
