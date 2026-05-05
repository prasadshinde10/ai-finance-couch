import axiosInstance from './axiosInstance'

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const addTransaction = async (data, token) => {
  const response = await axiosInstance.post('/api/transactions', data, buildAuthConfig(token))
  return response.data
}

export const getTransactions = async (token) => {
  const response = await axiosInstance.get('/api/transactions', buildAuthConfig(token))
  return response.data
}

export const deleteTransaction = async (id, token) => {
  const response = await axiosInstance.delete(`/api/transactions/${id}`, buildAuthConfig(token))
  return response.data
}

export const getStats = async (token) => {
  const response = await axiosInstance.get('/api/transactions/stats', buildAuthConfig(token))
  return response.data
}
