import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const createGoal = async (data, token) => {
  const response = await axios.post(`${API_URL}/api/goals`, data, buildAuthConfig(token))
  return response.data
}

export const getGoals = async (token) => {
  const response = await axios.get(`${API_URL}/api/goals`, buildAuthConfig(token))
  return response.data
}

export const updateGoalProgress = async (id, amount, token) => {
  const response = await axios.put(
    `${API_URL}/api/goals/${id}/progress`,
    { amount },
    buildAuthConfig(token)
  )
  return response.data
}

export const deleteGoal = async (id, token) => {
  const response = await axios.delete(`${API_URL}/api/goals/${id}`, buildAuthConfig(token))
  return response.data
}
