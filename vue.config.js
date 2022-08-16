const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ]
})

module.exports = {
  devServer: {
    proxy: {
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/vc': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      },
      '/cmmn': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      }
    },
  }
}