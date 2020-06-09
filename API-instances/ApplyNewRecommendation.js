import axios from 'axios'

const ApplyNewRecommendation = axios.create({
  baseURL: `https://bundles-shoplee.herokuapp.com/api/applyNewRecommendation`
})

export default ApplyNewRecommendation