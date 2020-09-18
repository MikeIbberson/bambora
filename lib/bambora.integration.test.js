require('dotenv').config();
const Bambora = require('.');
const { getToken } = require('./utils');

const testInstance = new Bambora(process.env.PASSCODE);

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

const genOrderBody = () => ({
  shipping: genAddress(),
  billing: genAddress(),
  amount: 123.2,
  name: 'Rick',
  id: Math.floor(Math.random() * 10000 + 1),
});

const makePreAuth = async () =>
  testInstance.pre({
    ...genOrderBody(),
    token: await getToken({
      number: '4030000010001234',
      cvd: '123',
      'expiry_month': '02',
      'expiry_year': '20',
    }),
  });

beforeAll(() => {
  jest.setTimeout(10000);
});

describe('Bambora integration', () => {
  it('should full-cycle payment', async () => {
    const { amount, type, id } = await makePreAuth();

    const {
      id: authorizedId,
      type: authorizedType,
    } = await testInstance.complete({
      amount,
      id,
    });

    expect(type).toBe('PA');
    expect(authorizedType).toBe('PAC');

    const {
      type: returnedType,
    } = await testInstance.refund({
      id: authorizedId,
      amount,
    });

    expect(type).toBe('PA');
    expect(authorizedType).toBe('PAC');
    expect(returnedType).toBe('R');
  });

  it('should report pre-auth failure', async () => {
    const client = new Bambora(process.env.PASSCODE, true);
    const callback = jest.fn();

    await client.postPayment(
      {
        token: await getToken({
          number: '4030000010001234',
          cvd: '123',
          'expiry_month': '02',
          'expiry_year': '20',
        }),
        ...genOrderBody(),
      },
      callback,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: expect.any(String),
        message: expect.any(String),
        avsId: 'N',
        type: 'P',
      }),
    );
  });

  it('should decline payment', async () =>
    expect(
      testInstance.post({
        token: await getToken({
          number: '4003050500040005',
          cvd: '123',
          'expiry_month': '02',
          'expiry_year': '20',
        }),
        ...genOrderBody(),
      }),
    ).rejects.toMatchObject({
      approved: '0',
    }));
});
