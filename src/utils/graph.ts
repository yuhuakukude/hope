export const postQuery = async (endpoint: string, query: string, variables?: {}) => {
  try {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    }
    const response = await fetch(endpoint, options)
    const data = await response.json()
    if (data.errors) {
      throw new Error(data.errors[0].message)
    } else {
      return data
    }
  } catch (error) {
    console.log(error)
    return undefined
  }
}
