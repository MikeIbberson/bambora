require('dotenv').config();
const Bambora = require('.');
const { getToken } = require('./utils');

let client;

const address = {
  name: 'Jon Doe',
  province: 'BC',
  address_line1: '1234 Fake Street',
  address_line2: '',
  postal_code: 'L1sR9R',
  phone_number: '905-555-2343',
  email_address: 'mibberson@3merge.ca',
  city: 'Pickering',
  country: 'CA',
};

beforeAll(() => {
  client = new Bambora(process.env.PASSCODE);
});

describe('Bambora integration', () => {
  it('should return approved', async () =>
    expect(
      client.postPayment({
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
      }),
    ).resolves.toMatchObject({
      approved: '1',
    }));

  it('should return declined', async () =>
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
    }));
});
