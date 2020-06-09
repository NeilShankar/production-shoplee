import axios from 'axios'

const GetBundleInstance = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/getBundleInfo`
})

export default GetBundleInstance