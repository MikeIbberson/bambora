# 💸 Bambora

For information on the underlying responses from this
package, see [Bambora's](https://dev.na.bambora.com/docs/)
payment API.

## Usage

The package exports a single default class. The constructor
takes two arguments: (1) your API key and (2) a boolean to
enable/disable pre-authorization.

```javascript
const BamboraNode = require('bambora-node');

module.exports = async () =>
  new BamboraNode(
    process.env.PASSCODE,
    false, // skipPreAuthorization
  ).postPayment({
    id: 1,
    token: 'foo',
    shipping: {},
    billing: {},
    // ...etc
  });
```

### Testing

When testing your code, you'll require tokens. Our `utils`
file exports a single method, `getToken`, that you can use
for this purpose. Provide it with
[sample card details](https://dev.na.bambora.com/docs/references/payment_APIs/test_cards/)
and it does the rest.
