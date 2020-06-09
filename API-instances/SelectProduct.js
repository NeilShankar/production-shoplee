import axios from 'axios'

const SelectProduct = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/selectProduct`
})

export default SelectProduct