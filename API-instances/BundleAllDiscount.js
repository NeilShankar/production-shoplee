import axios from 'axios'

const BundleAllDiscount = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/discountBundleAll`
})

export default BundleAllDiscount