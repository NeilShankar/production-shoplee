const mongoose = require("mongoose");
const delay = require('delay');
const getSymbolFromCurrency = require('currency-symbol-map')

require("../models/store");
const storeModel = mongoose.model("Store");
require("isomorphic-fetch");

const getMetrics = async (ctx) => {
   var shopURL = `https://${ctx.session.shop}`

   async function metricsGet() {
       const store = await storeModel.findOne({ url: `${shopURL}` })

       var allReturnData = {
            "ThisMonth": {
                "Sales": store.Metrics.ThisMonth.Sales,
                "AddToCarts": store.Metrics.ThisMonth.AddToCarts,
                "Views": store.Metrics.ThisMonth.Views,
                "Currency": store.Metrics.ThisMonth.Currency
            },
            "LastMonth": {
                "Sales": store.Metrics.LastMonth.Sales,
                "AddToCarts": store.Metrics.LastMonth.AddToCarts,
                "Views": store.Metrics.LastMonth.Views,
                "Currency": store.Metrics.LastMonth.Currency
            },
            "AllTime": {
                "Sales": store.Metrics.AllTime.Sales,
                "AddToCarts": store.Metrics.AllTime.AddToCarts,
                "Views": store.Metrics.AllTime.Views
            },
            "Currency": await getSymbolFromCurrency(store.Metrics.ThisMonth.Currency)
       }

       return allReturnData
   }

   ctx.body = await metricsGet()
}

module.exports = getMetrics