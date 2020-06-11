const getSubscriptionUrl = async (ctx, accessToken, shop) => {
    const query = JSON.stringify({
      query: `mutation {
        appSubscriptionCreate(
            name: "Basic Plan"
            returnUrl: "${process.env.HOST}"
            trialDays: 14
            test: true
            lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                    price: { amount: 9.99, currencyCode: USD }
                }
              }
            }
            ]
          ) {
              userErrors {
                field
                message
              }
              confirmationUrl
              appSubscription {
                id
              }
          }
      }`
    });
  
    const response = await fetch(`https://${shop}/admin/api/2020-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-Shopify-Access-Token": accessToken,
      },
      body: query
    })
  
    const responseJson = await response.json();
    const confirmationUrl = responseJson.data.appSubscriptionCreate.confirmationUrl
    return ctx.redirect(confirmationUrl)
  };
  
  module.exports = getSubscriptionUrl;