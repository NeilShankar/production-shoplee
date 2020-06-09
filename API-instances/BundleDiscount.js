import axios from 'axios'

const BundleDiscount = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/discountBundle`
})

export default BundleDiscount