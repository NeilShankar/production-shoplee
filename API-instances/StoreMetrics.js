import axios from 'axios'

const GetMetrics = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/getMetrics`
})

export default GetMetrics