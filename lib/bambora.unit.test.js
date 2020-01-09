const Bambora = require('.');

describe('Bambora', () => {
  it('should fail to instantiate without a key', () =>
    expect(() => new Bambora()).toThrowError());

  it('should setup client', () => {
    const b = new Bambora(123);

    expect(b).toHaveProperty('$client');
    expect(b.$client.defaults).toHaveProperty(
      'baseURL',
      expect.any(String),
    );

    expect(b.$client.defaults.headers).toHaveProperty(
      'Authorization',
      expect.any(String),
    );
  });

  it('should format request as token payment', async () => {
    const b = new Bambora(123);
    b.$client.post = jest
      .fn()
      .mockResolvedValue({ data: { approved: '1' } });

    await expect(
      b.postPayment({
        token: '123',
        name: 'Foo',
        amount: 12.34,
      }),
    ).resolves.toMatchObject({
      approved: '1',
    });
  });

  it('should catch errors', async () => {
    const b = new Bambora(123);
    b.$client.post = jest.fn().mockRejectedValue(null);

    await expect(
      b.postPayment({
        token: '123',
        name: 'Foo',
        amount: 12.34,
      }),
    ).resolves.toMatchObject({
      approved: '0',
    });
  });
});
