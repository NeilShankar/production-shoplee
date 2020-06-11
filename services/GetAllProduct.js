const { promisify } = require('util')
const sleep = promisify(setTimeout)
require("isomorphic-fetch");

const GetAllProduct = async (ctx) => {
    const shop = ctx.session.shop
    const accessToken = ctx.session.accessToken

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

    async function prods() {
        var productsAll = await getProductInit()

        var ProductInfo = []

        productsAll.forEach(element => {
            var ImageSrc = ""
            if (element["image"] != null) { 
                ImageSrc = element["image"]["src"] 
            } else {
                ImageSrc = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }
            ProductInfo.push({
                "id": element.id,
                "title": element.title,
                "image": ImageSrc
            })
        })
        
        return ProductInfo
    }

    ctx.response.body = await prods()

}

module.exports = GetAllProduct