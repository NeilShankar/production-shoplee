import axios from 'axios'

const BundleInstance = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/saveBundleInfo`
})

export default BundleInstance