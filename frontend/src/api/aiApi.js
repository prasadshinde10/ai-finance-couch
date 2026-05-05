import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const getBudgetPrediction = async (token) => {
  const response = await axios.get(`${API_URL}/api/ai/budget-prediction`, buildAuthConfig(token))
  return response.data
}

export const getInsights = async (token) => {
  const response = await axios.get(`${API_URL}/api/ai/insights`, buildAuthConfig(token))
  return response.data
}

export const getNudges = async (token) => {
  const response = await axios.get(`${API_URL}/api/ai/nudges`, buildAuthConfig(token))
  return response.data
}
