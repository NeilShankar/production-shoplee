const mongoose = require("mongoose");
const delay = require("delay")
const { promisify } = require('util')
const sleep = promisify(setTimeout)

require("../models/store");
const storeModel = mongoose.model("Store");

require("../models/bundles");
const bundleModel = mongoose.model("Bundle");

require("isomorphic-fetch");

const InitializeBundles = async (ctx) => {
    const accessToken = ctx.session.accessToken
    const shop = ctx.session.shop
    
    var filteredProducts = []
    var bundlesData = []
    
    async function getAllProducts() {
        try {
            const countOfProducts = await fetch(`https://${shop}/admin/api/2020-04/products/count.json?published_status=published`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                "X-Shopify-Access-Token": accessToken,
                }
            })
    
            const countResponse = await countOfProducts.json();
            const totalAvailableProducts = countResponse.count

            const numberOfLoops = Math.ceil(totalAvailableProducts / 25)
            const numberOfPages = numberOfLoops - 1

            var since_id = 0
            let sinceTag = ""
            let AvailableProductsArray

            if (numberOfPages > 1) {
                for (i=0; i < numberOfPages; i++) {
                    if (i > 0) {
                        sinceTag = `&since_id=${since_id}`
                    }
    
                    const products = await fetch(`https://${shop}/admin/api/2020-04/products.json?published_status=published&limit=250${sinceTag}`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        "X-Shopify-Access-Token": accessToken,
                        }
                    })
            
                    const productsResponse = await products.json();
                    AvailableProductsArray = await productsResponse.products
    
                    since_id = productsResponse.products[productsResponse.products.length - 1]["id"]
    
                    AvailableProductsArray.forEach(async element => {
                        filteredProducts.push(element)
                    });
    
                    await sleep(500)
                }    
            } else {   
                    const products = await fetch(`https://${shop}/admin/api/2020-04/products.json?published_status=published&limit=250`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        "X-Shopify-Access-Token": accessToken,
                        }
                    })
            
                    const productsResponse = await products.json();
                    AvailableProductsArray = await productsResponse.products
    
                    AvailableProductsArray.forEach(async element => {
                        filteredProducts.push(element)
                    });
            }
            return AvailableProductsArray
        } catch (err) {
            console.log(err)
        }
    }

    async function getMatches() {
        try {
            filteredProducts.forEach(element => {
                var chooseFrom = filteredProducts.filter(function(value, index,arr) {return value.id !== element.id })

                function random(mn, mx) {  
                    return Math.random() * (mx - mn) + mn;  
                }  

                const randomProd = Math.floor(random(0, chooseFrom.length))

                const choosenProduct = chooseFrom[randomProd]

                let FP_image
                let SP_image

                if (choosenProduct["image"] != null) { 
                    FP_image = choosenProduct["image"]["src"] 
                } else {
                    FP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
                }

                if (element["image"] != null) { 
                    SP_image = element["image"]["src"] 
                } else {
                    SP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
                }

                bundlesData.push({
                    "SourceProduct": {
                        "Id": element.id,
                        "Title": element.title,
                        "ImageSrc": SP_image
                    },
                    "RecommendedProduct": {
                        "Id": choosenProduct.id,
                        "Title": choosenProduct.title,
                        "ImageSrc": FP_image
                    },
                    "NewRecommendedProduct": {
                        "Id": "None",
                        "Title": "None",
                        "ImageSrc": "None"
                    },
                    "SelectedProduct": {
                        "Id": choosenProduct.id,
                        "Title": choosenProduct.title,
                        "ImageSrc": FP_image
                    },
                    "ChoosenBy": "Random",
                    "RelateID": `RandomType`,
                    "Discount": 5
                })
            });

            return "Successfully Matched bundles"
        } catch (err) {
            console.log("Faced Error => ", err)
            return err
        }
    }

    async function createBundles() {
        try {
            var bundleMongoArr = []
            await bundleModel.insertMany(bundlesData)
                .then(function(docs) {
                    var responseBundleArr = []

                    responseBundleArr.push(docs)

                    responseBundleArr[0].forEach(element => {
                        bundleMongoArr.push(element._id)
                    });
                })
                .catch(function (err) {
                    console.log("> Bundle Inserting To Mongo Process Exited with Error: ", err)
                });

            await storeModel.findOneAndUpdate({ url: `https://${shop}` }, {$set: {"Bundles": bundleMongoArr}})
            await storeModel.findOneAndUpdate({ url:`https://${shop}`, {$set: { "ServiceEnabled": true }})
        } catch (err) {
            console.log("Got Error => ", err)
            return err
        }
    }

    await getAllProducts().then((res) => { console.log("Completed Getting Products") }).catch((err) => console.log(err))
    await getMatches().then((res) => { console.log("Completed Getting Bundle Matches") }).catch((err) => console.log(err))
    await createBundles().then((res) => { console.log("Completed Storing Bundle Matches") }).catch((err) => console.log(err))

}


module.exports = InitializeBundles