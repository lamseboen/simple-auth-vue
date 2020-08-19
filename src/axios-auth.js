import axios from 'axios'

const instanceAuth = axios.create({
  baseURL: 'https://identitytoolkit.googleapis.com/v1'
})
const instanceGlobal = axios.create({
  baseURL: 'https://learn-axios-c3534.firebaseio.com'
})

export default { instanceAuth, instanceGlobal }
