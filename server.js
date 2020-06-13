require('isomorphic-fetch');
require('dotenv').config();
const Koa = require('koa');

const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
var ObjectId = require('mongoose').Types.ObjectId;
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const Sentry = require('@sentry/node');
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const getSubscriptionUrl = require('./server/getSubscriptionUrl');

const postFrequentProduct = require('./routes/frequent-bought')
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const cookie = require('cookie');

// Emailer - Sendgrid :)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Jobs
const UpdateRecommendedProducts = require('./Jobs/dailyUpdate')
const UpdateMetricsMonthly = require('./Jobs/monthlyMetricsUpdate')

// Service Handlers
const updateBundleInfo = require('./services/updateBundleInfo')
const getBundleInfo = require('./services/getBundleInfo')
const getProducts = require('./services/getProducts')
const getStoreInfo = require('./services/getStoreInfo')
const getMetrics = require('./services/getMetricInfo')

// API Endpoints For Bundles
const InitializeBundles = require('./services/InitialiazeBundles')
const getAllBundles = require('./services/GetAllBundles')
const DiscountBundle = require('./services/BundleDiscount')
const SelectProduct = require('./services/SelectProduct')
const DiscountAllBundle = require('./services/BundleAllDiscount')
const GetAllProduct = require('./services/GetAllProduct')
const ResetProducts = require('./services/ResetProducts')
const ApplyRecommendation = require('./services/ApplyRecommendation')
const ApplyNewRecommendation = require('./services/ApplyNewRecommendation')
const ApplyAllNewRecommendation = require('./services/ApplyAllNewRecommendation')
const ApplyAllRecommendation = require('./services/ApplyAllRecommendation')
const EnabledBundles = require('./services/BundlesEnabled')
const CheckEnabled = require('./services/CheckEnabled')
const generateDiscount = require('./routes/discounter')
const EnabledUpdating = require('./services/CheckUpdateEnabled')
const EnableUpdater = require('./services/EnableUpdater')
const checkFirstTime = require('./services/checkFirstTime')

// Theme Required Snippets
const cartSnippet = require('./scripts/cart-snippet.js')

// Testing Routes
const getThemes = require('./templates/default')

const schedule = require('node-schedule');

const {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  HOST,
} = process.env;

var cors = require('koa2-cors');

const throng = require('throng')

const WORKERS = process.env.WEB_CONCURRENCY || 1

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start)

function start() {
  app.prepare().then(() => {  

    var bodyParser = require('koa-bodyparser');
  
    const server = new Koa();
    server.use(bodyParser());
  
    const router = new Router();
    server.use(session({ sameSite: 'none', secure: true }, server));
  
    server.keys = [SHOPIFY_API_SECRET_KEY]; 
  
    function checkOriginAgainstWhitelist(ctx) {
      const requestOrigin = ctx.accept.headers.origin || process.env.HOST;
      require('./models/store')
      const storeModel = mongoose.model('Store')
      
      storeModel.findOne({'url': requestOrigin}, function(err, resad){
        console.log('Valid Origin Point.');
        if (!resad) {
          storeModel.findOne({ 'domain': requestOrigin }, function(err, res) {
            if (!res) {
              requestOrigin = process.env.HOST
            }
          })
        }
      });    
      return requestOrigin;
    }
    
    var corsOptions = {
      origin: '*'
    };
  
    server.use(cors(corsOptions));

    router.get('/privacy', async (ctx) => {
      await app.render(ctx.req, ctx.res, '/privacy', ctx.query)
      ctx.respond = false
    })
  
    router.get('/loaderio-a469609e66b2b2365980f945fab11300', ctx => {
      ctx.body = "loaderio-a469609e66b2b2365980f945fab11300"
    })
  
    router.get('/load-test', async (ctx) => {
      require('./models/store')
      const storeModel = mongoose.model('Store')
  
      async function getStoreData() {
        const store = await storeModel.findOne({ url: `https://test-nsn.myshopify.com` })
  
        return store
      }
  
      ctx.body = await getStoreData()
    })

    const Agenda = require('agenda');
  
    const agenda = new Agenda({
        db: {address: process.env.MONGO_DB_URL, collection: 'Jobs'},
        processEvery: '30 seconds'
    });
  
    server.use(
      createShopifyAuth({
        apiKey: SHOPIFY_API_KEY,
        secret: SHOPIFY_API_SECRET_KEY,
        scopes: ['read_products', 'write_products', 'read_themes', 'write_themes', 'write_price_rules', 'read_price_rules', 'read_script_tags', 'write_script_tags', 'read_orders', 'write_orders'],
        accessMode: 'offline',
        async afterAuth(ctx) {
          const { shop, accessToken } = ctx.session;
  
          ctx.cookies.set("shopOrigin", shop, {
            httpOnly: false,
            secure: true,
            sameSite: 'none'
          });
  
          require('./models/store')
          const storeModel = mongoose.model('Store')
  
          require("./models/bundles");
          const bundleModel = mongoose.model("Bundle");
  
          require("./models/user");
          const userModel = mongoose.model("User");
  
          const response = await fetch(
          `https://${ctx.session.shop}/admin/api/2020-04/shop.json`,
              {
                  method: "GET",
                  headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": accessToken,
                  },
              }
          );
    
            const responseJson = await response.json();
            var results = JSON.parse(JSON.stringify(responseJson));
  
            var user = await userModel.findOne({ email: results.shop.email }, async (err, res) => {
              if (!res) {
                var newUser = userModel({
                  name: results.shop.shop_owner,
                  email: results.shop.email,
                  shop: results.shop.name
                })
    
                newUser.save(async function(err, doc) {
                  if (err) return console.error(err);
                  console.log("User saved succussfully!");
                });
              }
            })        
        
            ShopUser = results.shop.shop_owner
            ShopName = results.shop.name
            Currency = results.shop.currency
  
            const msg = {
              to: results.shop.email,
              from: 'neilshankarnath@gmail.com',
              templateId: 'd-6d457b5b28ac4fb18ac0cb012724b908',
          
              dynamic_template_data: {
                name: `${results.shop.shop_owner}`,
                app_url: `${process.env.HOST}`
              },
            };
        
            const {
              classes: {
                Mail,
              },
            } = require('@sendgrid/helpers');
        
            const mail = Mail.create(msg);
            const body = mail.toJSON();
            console.log('Sending install Email.', body);
            await sgMail.send(msg);
  
          storeModel.findOne({ url: `https://${shop}`}, async (err, res) => {
            if (err) {
              console.log(err)
            }
  
            if (res) {
              await storeModel.findByIdAndUpdate(res._id, { accessToken: accessToken, "BundleConfigs.Enabled": true, "ServiceEnabled": true }, async (err, res) => {
                if (err) {
                  console.log(err)
                }
              })
  
              const scriptTagGet = await fetch(
                `https://${ctx.session.shop}/admin/api/2020-04/script_tags.json?src=${process.env.HOST}/scripts/cart-snippet.js`, {
                        method: "GET",
                        headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Access-Token": accessToken,
                        }
              });
  
              const reScripts = await scriptTagGet.json()
  
              var scriptsArr = []
              scriptsArr = [...reScripts.script_tags]
  
              scriptsArr.forEach(async (element) => {
                await fetch(
                  `https://${ctx.session.shop}/admin/api/2020-04/script_tags/${element.id}.json`, {
                          method: "DELETE",
                          headers: {
                          "Content-Type": "application/json",
                          "X-Shopify-Access-Token": accessToken,
                          }
                });
              });
  
              console.log("Pre-Initiliazed, so not doing more work...")          
            } else {
              let SalesJobInfo
              let UpdaterJobInfo

              agenda.define('update products', {priority: 'high', concurrency: 10}, async (job, done) => {
                const {shopData} = job.attrs.data;
                UpdateRecommendedProducts(shopData).then(() => done)
              });
    
              (async function() {
                const dailyUpdater = agenda.create('update products', {shopData: `${shop}`});
                await agenda.start();
                await dailyUpdater.repeatEvery('0 0 * * *', {skipImmediate: true}).save();
                UpdaterJobInfo = dailyUpdater.attrs._id
              })();
    
              agenda.define('update sales', {priority: 'high', concurrency: 10}, async (job, done) => {
                const {shopData} = job.attrs.data;
                UpdateMetricsMonthly(shopData).then(() => done)
              });
    
              (async function() {
                const salesUpdate = agenda.create('update sales', {shopData: `${shop}`});
                await agenda.start();
                await salesUpdate.repeatEvery('0 0 1 * *', {skipImmediate: true}).save();
                SalesJobInfo = salesUpdate.attrs._id

                const storeData = storeModel({
                  url: `https://${shop}`,
                  domain: `https://${results.shop.domain}`,
                  accessToken: accessToken,
                  FreeShipEnabled: false,
                  FreeShippingThreshold: 0,
                  BundleConfigs: {
                    title: "Frequently Bought Products",
                    titleColor: "#000",
                    buttonText: "Add Bundle To Cart",
                    buttonBackground: "#000",
                    buttonTextColor: "#fff",
                    buttonBorderColor: "#fff",
                    buttonHoverBackground: "#fff",
                    buttonHoverTextColor: "#000",
                    buttonHoverBorderColor: "#000",
                    Enabled: true
                  }, 
                  Metrics: {
                    ThisMonth: {
                      Sales: 0,
                      AddToCarts: 0,
                      Views: 0,
                      Currency: Currency
                    },
                    LastMonth: {
                      Sales: 0,
                      AddToCarts: 0,
                      Views: 0,
                      Currency: Currency
                    },
                    AllTime: {
                      Sales: 0,
                      AddToCarts: 0,
                      Views: 0,
                    }
                  },
                  ShopInfo: {
                    UserName: ShopUser,
                    ShopName: ShopName
                  },
                  UpdatingEnabled: true,
                  ServiceEnabled: false,
                  UpdaterJobInfo: `${UpdaterJobInfo}`,
                  SalesJobInfo: `${SalesJobInfo}`
                })
    
                storeData.save(async function(err, doc) {
                  if (err) return console.error(err);
                  console.log("Document saved succussfully!");
                });
              })();

              // Saving Store Data to MongoDB  
              getThemes(`https://${shop}`, accessToken)
              InitializeBundles(ctx)
            }
          })
  
          var ScriptData = JSON.stringify({
            "script_tag": {
              "event": "onload",
              "src": `${process.env.HOST}/scripts/cart-snippet.js`
            }
          })
  
          const scriptTag = await fetch(
            `https://${ctx.session.shop}/admin/api/2020-04/script_tags.json`,
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": accessToken,
                    },
                    body: ScriptData
                }
            );
  
          const orderWebhook = await registerWebhook({
            address: `${process.env.HOST}/webhooks/orders/create`,
            topic: 'ORDERS_CREATE',
            accessToken,
            shop,
            apiVersion: ApiVersion.April20
          });       
          
          const uninstallWebhook = await registerWebhook({
            address: `${process.env.HOST}/webhooks/app/uninstalled`,
            topic: 'APP_UNINSTALLED',
            accessToken,
            shop,
            apiVersion: ApiVersion.April20
          });  
          
          const productCreateHook = await registerWebhook({
            address: `${process.env.HOST}/webhooks/products/create`,
            topic: 'PRODUCTS_CREATE',
            accessToken,
            shop,
            apiVersion: ApiVersion.April20
          }); 
          
          const productDeleteHook = await registerWebhook({
            address: `${process.env.HOST}/webhooks/products/delete`,
            topic: 'PRODUCTS_DELETE',
            accessToken,
            shop,
            apiVersion: ApiVersion.April20
          });

          const productsUpdateHook = await registerWebhook({
            address: `${process.env.HOST}/webhooks/products/update`,
            topic: 'PRODUCTS_UPDATE',
            accessToken,
            shop,
            apiVersion: ApiVersion.April20
          });

          const themeChanges = await registerWebhook({
            address: `${process.env.HOST}/webhooks/themes/publish`,
            topic: 'THEMES_PUBLISH',
            accessToken,
            shop,
            apiVersion: ApiVersion.April20
          });
  
          if (uninstallWebhook.success) {
            console.log('Successfully registered webhook uninstall hook!');
          } else {
            console.log('Failed to register webhook', uninstallWebhook.result);
          }

          if (productsUpdateHook.success) {
            console.log('Successfully registered webhook - product update hook!');
          } else {
            console.log('Failed to register webhook', productsUpdateHook.result);
          }

          if (productCreateHook.success) {
            console.log('Successfully registered webhook - product create hook!');
          } else {
            console.log('Failed to register webhook', productCreateHook.result);
          }

          if (productDeleteHook.success) {
            console.log('Successfully registered webhook - product delete hook!');
          } else {
            console.log('Failed to register webhook', productDeleteHook.result);
          }

          if (themeChanges.success) {
            console.log('Successfully registered webhook - theme change hook!');
          } else {
            console.log('Failed to register webhook', themeChanges.result);
          }
  
          if (orderWebhook.success) {
            console.log('Successfully registered webhook order hook!');
          } else {
            console.log('Failed to register webhook', orderWebhook.result);
          }
  
          await getSubscriptionUrl(ctx, accessToken, shop);     
        }
      })
    );
  
    router.get('/dashboard', async (ctx) => {
      await app.render(ctx.req, ctx.res, '/', ctx.query)
      ctx.respond = false
    })
  
    router.get('/bundles', async (ctx) => {
      await app.render(ctx.req, ctx.res, '/bundles', ctx.query)
      ctx.respond = false
    })
  
    router.get('/bundle-configuration', async (ctx) => {
      await app.render(ctx.req, ctx.res, '/bundle-configuration', ctx.query)
      ctx.respond = false
    })
  
    router
    .get('/api', ctx => {
      ctx.res.statusCode = 200;  
      ctx.body = "> Shop Lee API is up and running"
    })
    .post('/api/saveBundleInfo', updateBundleInfo)
    .get('/api/getBundleInfo', getBundleInfo)
    .get('/api/getProducts', getProducts)
    .get('/api/allProducts', GetAllProduct)
    .get('/api/checkFirstTime', checkFirstTime)
    .get('/api/resetProducts', ResetProducts)
    .get('/api/checkUpdatesEnable', EnabledUpdating)
    .get('/api/getStoreInfo', getStoreInfo)
    .get('/api/getAllBundles', getAllBundles)
    .post('/api/bundlesEnabled', EnabledBundles)
    .get('/api/enabledCheck', CheckEnabled)
    .get('/api/applyAllNewRecommendation', ApplyAllNewRecommendation)
    .get('/api/applyAllRecommendation', ApplyAllRecommendation)
    .post('/api/updatesEnable', EnableUpdater)
    .post('/api/selectProduct', SelectProduct)
    .post('/api/applyRecommendation', ApplyRecommendation)
    .post('/api/applyNewRecommendation', ApplyNewRecommendation)
    .post('/api/discountBundle', DiscountBundle)
    .post('/api/discountBundleAll', DiscountAllBundle)
    .get('/api/getMetrics', getMetrics)
    .get('/api/currentShop', ctx => {
      ctx.body = ctx.session.shop
    })
  
    router
    .get('/post-product/:id', postFrequentProduct)
    .post('/generate-discount/:id', generateDiscount)
  
    router.post('/api/conversions', async (ctx) => {
      require('./models/store')
      const storeModel = mongoose.model('Store')
  
      const store = await storeModel.findOne({ url: `https://${ctx.session.shop}` })
  
      const increaseSales = await store.Metrics.ThisMonth.Sales + ctx.request.body.sale
      const storeUpdate = await storeModel.findOneAndUpdate({ url: `https://${ctx.session.shop}` }, {$set: {"Metrics.ThisMonth.Sales": increaseSales}})
  
      ctx.body = "Hello."
    })
  
    // Scripts.
    router
    .get('/scripts/cart-snippet.js', cartSnippet)
  
    // Sentry
    Sentry.init({ dsn: 'https://4fd23a47916849a1abc8c822cb6d598f@o397020.ingest.sentry.io/5251173' });
  
    // MongoDB Configurations 
    const mongoose = require('mongoose')
    mongoose.connect(`${process.env.MONGO_DB_URL}`, {useNewUrlParser: true,  useUnifiedTopology: true, useFindAndModify: false });
  
    var db = mongoose.connection;
  
    db.on("error", console.error.bind(console, "connection error:"));
  
    db.once("open", function() {
      console.log("Connection To MongoDB Atlas Successful!");
    });
  
    // Webhooks
  
    const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});
  
    router
    .post('/webhooks/themes/publish', webhook, async (ctx) => {
      getThemes(`https://${ctx.state.webhook.domain}`)
    })
    .post('/webhooks/app/uninstalled', webhook, async (ctx) => {
      ctx.res.statusCode = 200;
      const webhook = ctx.state.webhook
  
      require('./models/store')
      const storeModel = mongoose.model('Store')
      
      const updateUninstalledState = await storeModel.findOneAndUpdate({ url: `https://${webhook.domain}`}, {$set: {"BundleConfigs.Enabled": false, "ServiceEnabled": false}})
  
      const msg = {
        to: webhook.payload.email,
        from: 'neilshankarnath@gmail.com',
        templateId: 'd-128559708c5949cf8eb51bac9cca8218',
    
        dynamic_template_data: {
          subject: `Oh, no! We Are Sorry To See You Go ${webhook.payload.shop_owner}!`,
          name: `${webhook.payload.shop_owner}`,
          shopURL:`https://${webhook.domain}`
        },
      };
  
      const {
        classes: {
          Mail,
        },
      } = require('@sendgrid/helpers');
  
      const mail = Mail.create(msg);
      const body = mail.toJSON();
      console.log('Sending Uninstall Email.', body);
      await sgMail.send(msg);
  
      ctx.body = "Sent."
    })
    .post('/webhooks/orders/create', webhook, async (ctx) => {
      ctx.res.statusCode = 200;
      const order = ctx.state.webhook.payload
      require('./models/store')
      const storeModel = mongoose.model('Store')
  
      if (order.discount_codes.length) {
        const storeMod = await storeModel.findOne({ url: `https://${ctx.state.webhook.domain}` })
        const discountsArray = await storeMod.DiscountCodes
  
        for (var i = 0; i < discountsArray.length; i++) {
          if (discountsArray[i] === order.discount_codes[0].code) {
            var newSales = storeMod.Metrics.ThisMonth.Sales + Math.trunc(parseInt(order.subtotal_price))
            var newAllSales = storeMod.Metrics.AllTime.Sales + Math.trunc(parseInt(order.subtotal_price))
            const update = await storeModel.findByIdAndUpdate(storeMod._id, {$set: {"Metrics.ThisMonth.Sales": newSales, "Metrics.AllTime.Sales": newAllSales}})
            } 
          }
        }
    })
    .post('/webhooks/shop/redact', webhook, async (ctx) => {
      ctx.res.statusCode = 200;
      const payload = ctx.state.webhook.payload
  
      require('./models/store')
      const storeModel = mongoose.model('Store')
  
      require("./models/bundles");
      const bundleModel = mongoose.model("Bundle");
  
      var BundleArr = []
  
      var store = await storeModel.findOne({ url: `https://${payload.shop_domain}` }, async (err, res) => {
        BundleArr = [...res.Bundles]
      })

      var jobStore = await storeModel.findOne({ url: `https://${payload.shop_domain}` })

      var q = {
        _id: ObjectId(await jobStore.UpdaterJobInfo)
      };

      var q2 = {
        _id: ObjectId(await jobStore.SalesJobInfo)
      };
      
      agenda.cancel(q, function(err, numRemoved) {
          if(err) return res.status(500).send(err);
      });

      agenda.cancel(q2, function(err, numRemoved) {
        if(err) return res.status(500).send(err);
      });
  
      var deleteStore = await storeModel.deleteOne(store._id)
  
      var deleteBundles = await bundleModel.deleteMany({ _id: { $in: [...BundleArr] }})
    })
    .post('/webhooks/customers/redact', webhook, async (ctx) => {
      ctx.res.statusCode = 200;
      const payload = ctx.state.webhook.payload
  
      const msg = {
        to: 'neilshankarnath@gmail.com',
        from: 'neilshankarnath@gmail.com',
        subject: `New Customer Data RedAct From ${payload.shop_domain}`,
        text: `${payload}`,
      };
  
      await sgMail.send(msg);
  
      ctx.body = "New Customer Redact."
    })
    .post('/webhooks/customers/data_request', webhook, async (ctx) => {
      ctx.res.statusCode = 200;
      const payload = ctx.state.webhook.payload
  
      const msg = {
        to: 'neilshankarnath@gmail.com',
        from: 'neilshankarnath@gmail.com',
        subject: `New Customer Data Request From ${payload.shop_domain}`,
        text: `${payload}`,
      };
  
      await sgMail.send(msg);
  
      ctx.body = "New Customer Data Request."
    })
    .post('/webhooks/products/create', webhook, async (ctx) => {
      const payload = ctx.state.webhook.payload
  
      require('./models/store')
      const storeModel = mongoose.model('Store')

      const store = await storeModel.findOne({ url: `https://${ctx.state.webhook.domain}` })
  
      require("./models/bundles");
      const bundleModel = mongoose.model("Bundle");

      await bundleModel.findOne({ "SourceProduct.Id": payload.id }, (err, res) => {
        if (res) {
          return ;
        }
      })

      const products = await fetch(`https://${ctx.state.webhook.domain}/admin/api/2020-04/products.json?limit=250&fields=id,title,image,product_type,published_at`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              "X-Shopify-Access-Token": store.accessToken,
          }
      })

      const productsJson = await products.json();
      var chooseFrom = await productsJson.products
      var filteredProducts = await chooseFrom.filter(function(value, index, arr){ return value.published_at !== null && value.id !== ctx.state.webhook.payload.id;})

      function random(mn, mx) {  
        return Math.random() * (mx - mn) + mn;  
      }  

      const randomProd = Math.floor(random(0, filteredProducts.length))

      choosenProduct = filteredProducts[randomProd]
      let FP_image
      let SP_image

      if (choosenProduct["image"] != null) { 
        FP_image = choosenProduct["image"]["src"] 
      } else {
        FP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
      }

      if (ctx.state.webhook.payload["image"] != null) { 
        SP_image = ctx.state.webhook.payload["image"]["src"] 
      } else {
        SP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
      }

      var bundleInstance = new bundleModel({
        "SourceProduct": {
        "Id": ctx.state.webhook.payload.id,
        "Title": ctx.state.webhook.payload.title,
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
        "ChoosenBy": "RandomProduct",
        "RelateID": `Random`,
        "Discount": 5
      })

      await bundleInstance.save(async function(err, doc) {
        if (err) return console.error(err)
        console.log("New Bundle Created Because of New product data --> ", doc.SourceProduct)

        await storeModel.findOneAndUpdate(
          { _id: store._id },
          { $push: { Bundles: doc._id }},
          function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Success.");
            }
          });
      })

      ctx.response.status = 200;
      ctx.body = "New Product Created"
    })
    .post('/webhooks/products/delete', webhook, async (ctx) => {
      const payload = ctx.state.webhook.payload
  
      require('./models/store')
      const storeModel = mongoose.model('Store')

      const store = await storeModel.findOne({ url: `https://${ctx.state.webhook.domain}` })
  
      require("./models/bundles");
      const bundleModel = mongoose.model("Bundle");

      const deletedBundle = await bundleModel.findOneAndDelete({ "SourceProduct.Id": `${payload.id}` }, function (err, res) {
        if (err) { console.log(err); ctx.response.status = 404;}
      })

      const products = await fetch(`https://${ctx.state.webhook.domain}/admin/api/2020-04/products.json?limit=250&fields=id,title,image,product_type,published_at`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              "X-Shopify-Access-Token": store.accessToken,
          }
      })

      const productsJson = await products.json();
      var chooseFrom = await productsJson.products
      
      const Bundles = await bundleModel.find({
        '_id': { $in: store.Bundles }
      })

      Bundles.forEach(async element => {
        if (parseInt(element.SelectedProduct.Id) === payload.id) {
            var filteredProds = chooseFrom.filter(function(value, index, arr) { return value.published_at !== null && value.id !== element.SourceProduct.Id })

            function random(mn, mx) {  
              return Math.random() * (mx - mn) + mn;  
            }  

            const randomProd = Math.floor(random(0, filteredProds.length))

            const choosenProd = filteredProds[randomProd]

            let SP_image
            if (choosenProd["image"] != null) { 
                SP_image = choosenProd["image"]["src"]
            } else {
                SP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            const updateBundle = await bundleModel.findByIdAndUpdate(element._id, {$set: { "SelectedProduct": {
              "Id": choosenProd.id,
              "Title": choosenProd.title,
              "ImageSrc": SP_image
            }, "RecommendedProduct": {
              "Id": choosenProd.id,
              "Title": choosenProd.title,
              "ImageSrc": SP_image
            }, "NewRecommendedProduct": {
              "Id": choosenProd.id,
              "Title": choosenProd.title,
              "ImageSrc": SP_image
            }}})

            console.log(updateBundle)
        }
      });

      ctx.response.status = 200;
    })
    .post('/webhooks/products/update', webhook, async (ctx) => {
      const payload = ctx.state.webhook.payload
      const payloadId = payload.id
  
      require('./models/store')
      const storeModel = mongoose.model('Store')

      const store = await storeModel.findOne({ url: `https://${ctx.state.webhook.domain}` })
  
      require("./models/bundles");
      const bundleModel = mongoose.model("Bundle");

      var findId = payloadId.toString()

      const findBundle = await bundleModel.findOne({ "SourceProduct.Id": findId }, async (err, res) => {
        if (err) console.log(err)

        if (res) {
          if (payload.published_at === null) {
            await bundleModel.findByIdAndDelete(res._id)
          } else {
            return ;
          }
        } else {
          if (payload.published_at === null) {
            return ;
          } else {
            const products = await fetch(`https://${ctx.state.webhook.domain}/admin/api/2020-04/products.json?limit=250&fields=id,title,image,product_type,published_at`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  "X-Shopify-Access-Token": store.accessToken,
              }
            })

            const productsJson = await products.json();
            var chooseFrom = await productsJson.products
            var filteredProducts = await chooseFrom.filter(function(value, index, arr){ return value.published_at !== null && value.id !== ctx.state.webhook.payload.id })

            function random(mn, mx) {  
              return Math.random() * (mx - mn) + mn;  
            }  

            const randomProd = Math.floor(random(0, filteredProducts.length))

            choosenProduct = filteredProducts[randomProd]
            let FP_image
            let SP_image

            if (choosenProduct["image"] != null) { 
              FP_image = choosenProduct["image"]["src"] 
            } else {
              FP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            if (ctx.state.webhook.payload["image"] != null) {
              SP_image = ctx.state.webhook.payload["image"]["src"] 
            } else {
              SP_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
            }

            var bundleInstance = new bundleModel({
              "SourceProduct": {
              "Id": ctx.state.webhook.payload.id,
              "Title": ctx.state.webhook.payload.title,
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
              "ChoosenBy": "RandomProduct",
              "RelateID": `Random`,
              "Discount": 5
            })
      
            await bundleInstance.save(async function(err, doc) {
              if (err) return console.error(err)
              console.log("New Bundle Created Because of New product data --> ", doc.SourceProduct)
      
              await storeModel.findOneAndUpdate(
                { _id: store._id },
                { $push: { Bundles: doc._id }},
                function (error, success) {
                  if (error) {
                      console.log(error);
                  } else {
                      console.log("Success.");
                  }
                });
            })
          }
        }
      })

      if (payload.published_at === null) {
          const prodRes = await fetch(`https://${ctx.state.webhook.domain}/admin/api/2020-04/products.json?limit=250&fields=id,title,image,product_type,published_at`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Shopify-Access-Token": store.accessToken,
            }
          })

          const productsResJson = await prodRes.json();
          var chooseFromRes = await productsResJson.products
          var filteredResProducts = await chooseFromRes.filter(function(value, index, arr){ return value.published_at !== null && value.id !== ctx.state.webhook.payload.id;})

          function random(mn, mx) {  
            return Math.random() * (mx - mn) + mn;  
          }  

          const randomProd = Math.floor(random(0, filteredResProducts.length))

          chooseProduct = filteredResProducts[randomProd]
          let SPR_image 

          if (ctx.state.webhook.payload["image"] != null) { 
            SPR_image = ctx.state.webhook.payload["image"]["src"] 
          } else {
            SPR_image = "https://cynthiarenee.com/wp-content/uploads/2018/11/placeholder-product-image.png"
          }

          const findBundleSP = await bundleModel.updateMany({ "SelectedProduct.Id": findId }, { $set: { "SelectedProduct": {
            "Id": chooseProduct.id,
            "Title": chooseProduct.title,
            "ImageSrc": SPR_image
          }, "RecommendedProduct": {
            "Id": chooseProduct.id,
            "Title": chooseProduct.title,
            "ImageSrc": SPR_image
          }, "NewRecommendedProduct": {
            "Id": chooseProduct.id,
            "Title": chooseProduct.title,
            "ImageSrc": SPR_image
          }}
        })           
      }
  })
    
  
    server.use(graphQLProxy({ version: ApiVersion.April20 }));
  
    router.get('*', verifyRequest(), async (ctx) => {
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
      ctx.res.statusCode = 200;
    })
    
    server.use(router.allowedMethods());
    server.use(router.routes());
  
    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
}