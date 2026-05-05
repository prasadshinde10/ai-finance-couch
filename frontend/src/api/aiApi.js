import axiosInstance from './axiosInstance'

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const getBudgetPrediction = async (token) => {
  const response = await axiosInstance.get('/api/ai/budget-prediction', buildAuthConfig(token))
  return response.data
}

export const getInsights = async (token) => {
  const response = await axiosInstance.get('/api/ai/insights', buildAuthConfig(token))
  return response.data
}

export const getNudges = async (token) => {
  const response = await axiosInstance.get('/api/ai/nudges', buildAuthConfig(token))
  return response.data
}
