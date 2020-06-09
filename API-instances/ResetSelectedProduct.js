import axios from 'axios'

const ResetProducts = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/resetProducts`
})

export default ResetProducts