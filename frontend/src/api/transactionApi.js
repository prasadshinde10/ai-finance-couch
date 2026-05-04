import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const addTransaction = async (data, token) => {
  const response = await axios.post(`${API_URL}/api/transactions`, data, buildAuthConfig(token))
  return response.data
}

export const getTransactions = async (token) => {
  const response = await axios.get(`${API_URL}/api/transactions`, buildAuthConfig(token))
  return response.data
}

export const deleteTransaction = async (id, token) => {
  const response = await axios.delete(`${API_URL}/api/transactions/${id}`, buildAuthConfig(token))
  return response.data
}

export const getStats = async (token) => {
  const response = await axios.get(`${API_URL}/api/transactions/stats`, buildAuthConfig(token))
  return response.data
}
