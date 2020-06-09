import axios from 'axios'

const GetAllBundles = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/getAllBundles`
})

export default GetAllBundles