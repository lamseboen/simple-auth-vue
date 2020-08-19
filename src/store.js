import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import router from './router'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser (state, userData) {
      state.idToken = userData.token
      state.userId = userData.userId
    },
    storeUser (state, user) {
      state.user = user
    },
    dummy () {
      return true
    },
    clearAuthData (state) {
      state.idToken = null
      state.userId = null
      state.user = null
    }
  },
  actions: {
    setLogoutTimer ({ dispatch }, expirationTime) {
      setTimeout(() => {
        dispatch('logout')
      }, expirationTime * 1000)
    },
    signup ({ commit, dispatch }, payload) {
      axios.instanceAuth.post('/accounts:signUp?key=AIzaSyCrS4jrRGEEaiXxaWHPz6ik3KdmXmBULco', {
        email: payload.email,
        password: payload.password,
        returnSecureToken: true
      })
        .then(res => {
          console.log('signup -> res', res)
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          })
          const now = new Date()
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000)
          localStorage.setItem('token', res.data.idToken)
          localStorage.setItem('expirationDate', expirationDate)
          dispatch('storeUser', payload)
          dispatch('setLogoutTimer', res.data.expiresIn)
        })
        .catch(error => console.log(error))
    },
    login ({ commit, dispatch }, payload) {
      axios.instanceAuth.post('/accounts:signInWithPassword?key=AIzaSyCrS4jrRGEEaiXxaWHPz6ik3KdmXmBULco', {
        email: payload.email,
        password: payload.password,
        returnSecureToken: true
      })
        .then(res => {
          console.log('login -> res', res)
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          })
          const now = new Date()
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1)
          // console.log()
          localStorage.setItem('token', res.data.idToken)
          localStorage.setItem('userId', res.data.localId)
          localStorage.setItem('expirationDate', expirationDate)
          dispatch('storeUser', payload)
          dispatch('setLogoutTimer', res.data.expiresIn)
          dispatch('setLogoutTimer', res.data.expiresIn)
        })
        .catch(error => console.log(error))
    },
    tryAutoLogin ({ commit, dispatch }) {
      const token = localStorage.getItem('token')
      if (!token) {
        return true
      }
      const expirationDate = localStorage.getItem('expirationDate')
      console.log('tryAutoLogin -> expirationDate', expirationDate)
      const now = new Date()
      console.log('tryAutoLogin -> now', now)
      if (now !== expirationDate) {
        alert('leaw')
        dispatch('logout')
      }
      const userId = localStorage.getItem('userId')
      commit('authUser', {
        token,
        userId
      })
    },
    storeUser ({ commit, state }, payload) {
      if (!state.idToken) {
        return
      }
      axios.instanceGlobal.post('/users.json' + '?auth=' + state.idToken, payload)
        .then(res => {
          console.log(res)
          commit('dummy')
        })
        .catch(error => console.log(error))
    },
    fetchUser ({ commit, state }) {
      if (!state.idToken) {
        return
      }
      axios.instanceGlobal.get('/users.json' + '?auth=' + state.idToken)
        .then(res => {
          console.log('fetchUser -> res', res)
          const data = res.data
          const users = []
          for (const key in data) {
            const user = data[key]
            user.id = key
            users.push(user)
          }
          commit('storeUser', users[0])
        })
        .catch(error => console.log(error))
    },
    logout ({ commit }) {
      commit('clearAuthData')
      localStorage.removeItem('expirationDate')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.replace('/signin').catch(err => { err })
    }
  },
  getters: {
    user (state) {
      return state.user
    },
    isAuthenticated (state) {
      return state.idToken !== null
    }
  }
})
