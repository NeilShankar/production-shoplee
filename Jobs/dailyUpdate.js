const mongoose = require('mongoose')
require("isomorphic-fetch");


require("../models/bundles");
const bundleModel = mongoose.model("Bundle");

require("../models/store");
const storeModel = mongoose.model("Store");

const stopcock = require('stopcock')

async function UpdateRecommendedProducts(shopURL) {

    // First we get the StoreModel
    const store = await storeModel.findOne({ url: `https://${shopURL}` })

    if (store.UpdatingEnabled === false) {
        return ;
    }

    var bundleArr = []

    // Then We get the Bundles
    const bundles = await bundleModel.find({
        '_id': { $in: store.Bundles }
    }, function(err, res) {
        
        bundleArr.push(res)
    })

    // Find Match Function
    async function FindMatch(current) {
        if (current.ChoosenBy === "Collection") {
            const productCollection = await fetch(`https://${shopURL}/admin/api/2020-04/collections/${current.RelateID}/products.json`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  "X-Shopify-Access-Token": store.accessToken,
                }
              })
            
              const responseJson = await productCollection.json();

              function collectRandom(min, max) {
                return Math.floor(Math.random() * (max - min) + min);
              }

              const FbTproduct = collectRandom(0, responseJson.products.length);

              const NewRecommended = responseJson.products.filter(function(value, index,arr) {return value.published_at !== null })[FbTproduct]

              if (typeof NewRecommended === 'undefined') {
                const randomProd = await fetch(`https://${shopURL}/admin/api/2020-04/products.json`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    "X-Shopify-Access-Token": store.accessToken,
                    }
                 })
    
                const randomProdJson = await randomProd.json();

                var filteredProducts = await randomProdJson.products.filter(function(value, index,arr) {return value.published_at !== null && value.id !== current.SelectedProduct.Id })

                const FIbProd = collectRandom(0, await filteredProducts.length);

                NewRecommended = await filteredProducts[FIbProd]
            }

              var ImageSrc = ""

                if (NewRecommended["image"] != null) { 
                    ImageSrc = NewRecommended["image"]["src"] 
                } else {
                    ImageSrc = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
                }

              await bundleModel.findByIdAndUpdate(current._id, {$set: {
                  "NewRecommendedProduct":{
                    "Id": NewRecommended.id,
                    "Title": NewRecommended.title,
                    "ImageSrc": ImageSrc
                  }                 
              }})

            return "Choosen By Collection"
        } else if (current.ChoosenBy === "productType") {
            const SimilarProds = await fetch(`https://${shopURL}/admin/api/2020-04/products.json?product_type=${current.RelateID}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                "X-Shopify-Access-Token": store.accessToken,
                }
            })
    
            const SimProdsJson = await SimilarProds.json();

            function collectRandom(min, max) {
                return Math.floor(Math.random() * (max - min) + min);
            }

            const FbTproduct = collectRandom(0, SimProdsJson.products.length);

            var NewRecommended = SimProdsJson.products.filter(function(value, index,arr) {return value.published_at !== null })[FbTproduct]

            if (typeof NewRecommended === 'undefined') {
                const randomProd = await fetch(`https://${shopURL}/admin/api/2020-04/products.json`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    "X-Shopify-Access-Token": store.accessToken,
                    }
                 })
    
                const randomProdJson = await randomProd.json();

                var filteredProducts = await randomProdJson.products.filter(function(value, index,arr) {return value.published_at !== null && value.id !== current.SelectedProduct.Id })

                const FIbProd = collectRandom(0, await filteredProducts.length);

                NewRecommended = await filteredProducts[FIbProd]
            }

            var ImageSrc = ""

            if (NewRecommended["image"] != null) { 
                ImageSrc = NewRecommended["image"]["src"] 
            } else {
                ImageSrc = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            await bundleModel.findByIdAndUpdate(current._id, {$set: {
                "NewRecommendedProduct":{
                  "Id": NewRecommended.id,
                  "Title": NewRecommended.title,
                  "ImageSrc": ImageSrc
                }                 
            }})

            return "Choosen By Type"
        } else {
            const randomProd = await fetch(`https://${shopURL}/admin/api/2020-04/products.json`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                "X-Shopify-Access-Token": store.accessToken,
                }
            })
    
            const randomProdJson = await randomProd.json();

            var filteredProducts = randomProdJson.products.filter(function(value, index,arr) {return value.published_at !== null && value.id !== current.SelectedProduct.Id })

            function random(mn, mx) {  
                return Math.random() * (mx - mn) + mn; 
            }  

            const randomProdNumber = Math.floor(random(0, filteredProducts.length))

            var NewRecommended = filteredProducts[randomProdNumber]

            var ImageSrc = ""

            if (NewRecommended["image"] != null) { 
                ImageSrc = NewRecommended["image"]["src"] 
            } else {
                ImageSrc = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            await bundleModel.findByIdAndUpdate(current._id, {$set: {
                "NewRecommendedProduct":{
                  "Id": NewRecommended.id,
                  "Title": NewRecommended.title,
                  "ImageSrc": ImageSrc
                }                 
            }})

            return "Choosen Randomly."
        }
    }

    // Rate Limiting Stuff
    const findBundlesMatching = stopcock(FindMatch, { bucketSize: 1, interval: 1000 });

    await bundleMatch()

    // Main Function
    async function bundleMatch() {
        console.log("Started Daily Updater")
        bundleArr[0].forEach(element => {
            findBundlesMatching(element).then((res) => {
                console.log(res)
            }).catch((e) => {
                console.log(e)
            })
        });
    }

    return "Done"
}

module.exports = UpdateRecommendedProducts