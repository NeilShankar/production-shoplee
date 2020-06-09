import axios from 'axios'

const GetAllProducts = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/allProducts`
})

export default GetAllProducts