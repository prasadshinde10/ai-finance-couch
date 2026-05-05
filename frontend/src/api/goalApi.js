import axiosInstance from './axiosInstance'

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const createGoal = async (data, token) => {
  const response = await axiosInstance.post('/api/goals', data, buildAuthConfig(token))
  return response.data
}

export const getGoals = async (token) => {
  const response = await axiosInstance.get('/api/goals', buildAuthConfig(token))
  return response.data
}

export const updateGoalProgress = async (id, amount, token) => {
  const response = await axiosInstance.put(
    `/api/goals/${id}/progress`,
    { amount },
    buildAuthConfig(token)
  )
  return response.data
}

export const deleteGoal = async (id, token) => {
  const response = await axiosInstance.delete(`/api/goals/${id}`, buildAuthConfig(token))
  return response.data
}
