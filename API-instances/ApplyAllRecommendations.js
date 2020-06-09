import axios from 'axios'

const ApplyAllRecommendation = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/applyAllRecommendation`
})

export default ApplyAllRecommendation