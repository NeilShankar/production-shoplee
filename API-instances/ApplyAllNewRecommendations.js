import axios from 'axios'

const ApplyAllNewRecommendation = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/applyAllNewRecommendation`
})

export default ApplyAllNewRecommendation