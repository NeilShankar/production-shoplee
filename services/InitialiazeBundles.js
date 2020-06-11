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
    var allProductsArray = []
    var categoriedArray = []
    var productLoopCount = 0
    var allCollections = []
    var collectionBundleArray = []
    var productTypeBundleArray = []
    var totalBundlesArray = []

    async function getAllProducts(NumberOfProducts) {
        const pages = Math.ceil(NumberOfProducts / 250)
        var productsArr = []
        const loopsPage = pages - 1

        if (pages > 1) {
            var nextPageId = ""
            var since_id = 0
            for (i=0; i < loopsPage; i++) {

                if (i > 0) {
                    nextPageId = `&since_id=${since_id}`
                }

                const products = await fetch(`https://${shop}/admin/api/2020-04/products.json?limit=250&fields=id,title,image,product_type${nextPageId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "X-Shopify-Access-Token": accessToken,
                    }
                })

                const productsJson = await products.json();
                productsArr = [...await productsJson.products]
                since_id = productsArr[productsArr.length - 1]["id"]
                
                await sleep(500)
            }
        } else {
            const products = await fetch(`https://${shop}/admin/api/2020-04/products.json?limit=250&fields=id,title,image,product_type`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "X-Shopify-Access-Token": accessToken,
                }
            })

            const productsJson = await products.json();
            productsArr = [...await productsJson.products]
        }

        return productsArr
    }

    async function getProductInit() {
        const productCount = await fetch(`https://${shop}/admin/api/2020-04/products/count.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Shopify-Access-Token": accessToken,
            }
        })

        const countJson = await productCount.json();
        var count = await countJson.count

        const productArray = await getAllProducts(count)

        return productArray
    }

    async function getCollections() {
        var collectsArr = []

        async function getNextPageUrl(linkHeader){
            var linkArray = linkHeader.split(',');
            for(var i=linkArray.length-1;i>=0;i--){
                var linkFields = linkArray[i].split('>;');
                if(linkFields[1].indexOf("next")>-1){
                    var nexPageUrl = linkFields[0].trim();
                    nextPageUrl = nexPageUrl.substring(1, nexPageUrl.length);
                    //Logger.log("substring:"+nextPageUrl);
                    return nextPageUrl;
                }
            }
            return '';
        }

        const collectsCount = await fetch(`https://${shop}/admin/api/2020-04/collects/count.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Shopify-Access-Token": accessToken,
            }
        })

        const countsJson = await collectsCount.json();
        var count = await countsJson.count
        var loops = Math.ceil(await count/250)
        var macLoops = loops - 1       

        if (loops > 1) {
            var requestUrl = `https://${shop}/admin/api/2020-04/collects.json?limit=250`
            for (i=0; i < macLoops; i++) {
                
                const collectsArray = await fetch(`${requestUrl}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "X-Shopify-Access-Token": accessToken,
                    }
                })

                const collectsJson = await collectsArray.json();
                collectsArr = [...await collectsJson.collects]

                var fullLink = JSON.stringify(collectsArray.headers._headers.link)
                var nextUrl = await getNextPageUrl(fullLink)

                if (i === 0 && nextUrl) {
                    requestUrl = nextUrl.substring(2)
                } else {
                    requestUrl = nextUrl
                }

                await sleep(500)
            }
        } else {
            const collectsArray = await fetch(`https://${shop}/admin/api/2020-04/collects.json?limit=250`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "X-Shopify-Access-Token": accessToken,
                }
            })

            const collectsJson = await collectsArray.json();
            collectsArr = [...await collectsJson.collects]
        }

        return collectsArr
    }

    async function getCategorize() {
        var categArr = []
        
        for (i=0; i < allProductsArray.length; i++) {
            if (allCollections.some(collect => collect.product_id === allProductsArray[i].id)) {
                categArr.push({
                    "product_id": allProductsArray[i].id,
                    "type": "Collection"
                })
            } else {
                categArr.push({
                    "product_id": allProductsArray[i].id,
                    "type": "productType"
                })
            }
        }

        return categArr
    }

    async function getCollectionBundles() {
        var collectionsBundles = []

        for (i=0; i < categoriedArray.length; i++) {
            var filteredCollects = allCollections.filter(function(value, index, arr){ return value.product_id !== categoriedArray[i].product_id;})

            if (categoriedArray[i].type === "Collection") {
                var collection = allCollections.filter(function(value, index, arr){ return value.product_id === categoriedArray[i].product_id;})
                var foundCollect = filteredCollects.filter(function(value, index, arr) {return value.collection_id === collection[0].collection_id})

                function random(mn, mx) {  
                    return Math.random() * (mx - mn) + mn;  
                }  

                const randomProd = Math.floor(random(0, foundCollect.length))

                collectionsBundles.push({ "SourceProduct": categoriedArray[i].product_id, "FoundProduct": foundCollect[randomProd].product_id, "RelateId": collection[0].collection_id, "Type": "Collection" })
            }
        }

        return collectionsBundles
    }

    async function getProductTypeBundles() {
        var productTypeBundles = []

        for (i=0; i < categoriedArray.length; i++) {
            var filteredProducts = allProductsArray.filter(function(value, index,arr) {return value.id !== categoriedArray[i].product_id })
            var productInfo = allProductsArray.filter(function(value, index,arr) {return value.id === categoriedArray[i].product_id })

            if (categoriedArray[i].type === "productType") {
                var similarProducts = filteredProducts.filter(function(value, index, arr) { return value.product_type ===  productInfo[0].product_type })

                if (similarProducts.length <= 0) {
                    function random(mn, mx) {  
                        return Math.random() * (mx - mn) + mn;  
                    }  

                    const randomProd = Math.floor(random(0, filteredProducts.length))

                    productTypeBundles.push({ "SourceProduct": productInfo[0].id, "FoundProduct": filteredProducts[randomProd].id, "RelateId": "Random", "Type": "RandomProduct" })
                } else {
                    function random(mn, mx) {  
                        return Math.random() * (mx - mn) + mn;  
                    }  

                    const randomProd = Math.floor(random(0, similarProducts.length))

                    productTypeBundles.push({ "SourceProduct": productInfo[0].id, "FoundProduct": similarProducts[randomProd].id, "RelateId": productInfo[0].product_type, "Type": "productType" })
                }
            }
        }

        return productTypeBundles
    }

    async function getBundlesData() {
        var bundlesDataArr = []

        for (i=0; i < totalBundlesArray.length; i++) {
            var currentBundle = totalBundlesArray[i]

            var SourceProductData = allProductsArray.filter(function(value, index, arr) { return value.id === totalBundlesArray[i].SourceProduct })
            var FoundProductData = allProductsArray.filter(function(value, index, arr) { return value.id === totalBundlesArray[i].FoundProduct })
            let FP_image
            let SP_image

            if (FoundProductData[0]["image"] != null) { 
                FP_image = FoundProductData[0]["image"]["src"] 
            } else {
                FP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            if (SourceProductData[0]["image"] != null) { 
                SP_image = SourceProductData[0]["image"]["src"] 
            } else {
                SP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            bundlesDataArr.push({
                "SourceProduct": {
                    "Id": SourceProductData[0].id,
                    "Title": SourceProductData[0].title,
                    "ImageSrc": SP_image
                },
                "RecommendedProduct": {
                    "Id": FoundProductData[0].id,
                    "Title": FoundProductData[0].title,
                    "ImageSrc": FP_image
                },
                "NewRecommendedProduct": {
                    "Id": "None",
                    "Title": "None",
                    "ImageSrc": "None"
                },
                "SelectedProduct": {
                    "Id": FoundProductData[0].id,
                    "Title": FoundProductData[0].title,
                    "ImageSrc": FP_image
                },
                "ChoosenBy": currentBundle.Type,
                "RelateID": currentBundle.RelateID,
                "Discount": 0
            })
        }

        return bundlesDataArr
    }

    var startTime = new Date().getTime()
    allProductsArray = await getProductInit().catch((err) => { console.log(`Bundle Initialization Process For ${shop}, faced error: `, err) })
    console.log("> Completed Getting All Product Details")
    console.log("> Working On Collections Now")
    allCollections = await getCollections().catch((err) => { console.log(`Bundle Initialization Process For ${shop}, faced error: `, err) })
    console.log("> Completed Getting Collections")
    console.log("> Working on Categorizing Now")
    categoriedArray = await getCategorize().catch((err) => { console.log(`Bundle Initialization Process For ${shop}, faced error: `, err) })
    console.log("> Completed Categorizing")
    console.log("> Working On Matching Collection Bundles Now")
    collectionBundleArray = await getCollectionBundles().catch((err) => { console.log(`Bundle Initialization Process For ${shop}, faced error: `, err) })
    console.log("> Completed Bundle Creation Batch 1")
    console.log("> Working On Bundle Creation Batch 2")
    productTypeBundleArray = await getProductTypeBundles().catch((err) => { console.log(`Bundle Initialization Process For ${shop}, faced error: `, err) })
    console.log("> Completed Bundle Creation Batch 2")
    console.log("> Working On Creating Bundles In Database Now")
    totalBundlesArray = [...collectionBundleArray, ...productTypeBundleArray]
    databaseBundleArray = await getBundlesData().catch((err) => { console.log(`Bundle Initialization Process For ${shop}, faced error: `, err) })
    console.log("> Completed Bundle Data Creation")
    console.log("> Inserting to MongoDB Atlas - Cluster 004 - Singapore_East")
    var bundleMongoArr = []
    await bundleModel.insertMany(databaseBundleArray)
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

    var endTime = new Date().getTime()
    var totalTime = endTime - startTime
    var smallTotalTime = totalTime.toFixed(0)

    console.log(`> Created ${databaseBundleArray.length} new Bundle Records in MongoDB`)
    console.log(`> Initializing Setup Completed from ${shop}, in ${smallTotalTime} milliseconds!`)
}


module.exports = InitializeBundles