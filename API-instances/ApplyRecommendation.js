import axios from 'axios'

const ApplyRecommendation = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/applyRecommendation`
})

export default ApplyRecommendation