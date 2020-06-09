import axios from 'axios'

const CheckBundleEnabled = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/enabledCheck`
})

export default CheckBundleEnabled