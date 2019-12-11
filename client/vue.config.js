require('dotenv').config()
module.exports = {
  "devServer": {
    "public": process.env.VUE_APP_HOSTNAME,
    "disableHostCheck": true
  },
  "transpileDependencies": [
    "vuetify"
  ]
}