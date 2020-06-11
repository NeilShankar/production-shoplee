const mongoose = require('mongoose')
require("isomorphic-fetch");


require("../models/bundles");
const bundleModel = mongoose.model("Bundle");

require("../models/store");
const storeModel = mongoose.model("Store");

async function UpdateMetricsMonthly(shopData) {
    var shopURL = `https://${shopData}`

    const store = await storeModel.findOne({ url: shopURL })

    const updatedStore = await storeModel.findByIdAndUpdate(await store._id, {$set: {"Metrics": {
        "ThisMonth": {
            "Sales": 0,
            "AddToCarts": 0,
            "Views": 0,
            "Currency": store.Metrics.ThisMonth.Currency
       },
       "LastMonth": {
            "Sales": store.Metrics.ThisMonth.Sales,
            "AddToCarts": store.Metrics.ThisMonth.AddToCarts,
            "Views": store.Metrics.ThisMonth.Views,
            "Currency": store.Metrics.ThisMonth.Currency
       },
       "AllTime": {
            "Sales": store.Metrics.AllTime.Sales,
            "AddToCarts": store.Metrics.AllTime.AddToCarts,
            "Views": store.Metrics.AllTime.Views,
       }
    }}})
}

module.exports = UpdateMetricsMonthly