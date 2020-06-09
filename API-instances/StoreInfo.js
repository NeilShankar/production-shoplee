import axios from 'axios'

const GetStoreInfo = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/getStoreInfo`
})

export default GetStoreInfo