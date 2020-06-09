import axios from 'axios'

const BundleEnable = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/bundlesEnabled`
})

export default BundleEnable