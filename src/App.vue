<template>
  <div id="app">
    <Titlebar/>
    <div class="ui">
      <div class="box">
        <b-field class="field" label="Destination URL:">
          <b-input v-model="destURL"></b-input>
        </b-field>
      </div>
      <div class="table-container">
        <table v-if="proxies.length > 0" class="table">
          <thead>
            <tr>
              <th>Host</th>
              <th>Port</th>
              <th>Username</th>
              <th>Password</th>
              <th>Status</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proxy in proxies" v-bind:key="proxy.id">
              <td>{{proxy.host}}</td>
              <td>{{proxy.port}}</td>
              <td>{{proxy.user}}</td>
              <td>{{proxy.pass}}</td>
              <td v-if="proxy.status == 'OK'" style="color:#48C774">{{proxy.status}}</td>
              <td v-else style="color:#FF3860">{{proxy.status}}</td>
              <td v-if="proxy.response > 2000" style="color:#FFDD57">{{proxy.response}}ms</td>
              <td v-else-if="proxy.response > 0">{{proxy.response}}ms</td>
              <td v-else></td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <h1 style="text-align: center; line-height: 50vh; opacity: 0.2" class="title"><b-icon icon="download"></b-icon> Import Proxies</h1>
        </div>
      </div>
      <div class="toolbar">
        <div class="columns is-mobile is-vcentered">
          <div class="column is-3">
            <button class="button is-primary is-fullwidth" @click="isProxyModalActive = true"><b-icon icon="download"></b-icon>Import Proxies</button>
          </div>
          <div class="column is-3">
            <button v-if="proxies.length > 0" class="button is-primary is-fullwidth" @click="testProxies"><b-icon icon="wifi"></b-icon>Test Proxies</button>
            <button v-else class="button is-primary is-fullwidth" disabled><b-icon icon="wifi"></b-icon>Test Proxies</button>
          </div>
          <div class="column is-3">
            <button v-if="proxies.length > 0" class="button is-primary is-fullwidth" @click="clearProxies"><b-icon icon="delete"></b-icon>Clear Proxies</button>
            <button v-else class="button is-primary is-fullwidth" disabled><b-icon icon="delete"></b-icon>Clear Proxies</button>
          </div>
          <div class="column is-3">
            <button v-if="proxies.length > 0" class="button is-primary is-fullwidth" @click="exportWorking"><b-icon icon="upload"></b-icon>Export Working</button>
            <button v-else class="button is-primary is-fullwidth" disabled><b-icon icon="upload"></b-icon>Export Working</button>
          </div>
        </div>
      </div>
    </div>
    <!-- MODAL -->
        <b-modal v-model="isProxyModalActive" has-modal-card>
          <div class="modal-card">
            <header class="modal-card-head" style="width: auto">
              <p class="modal-card-title">
                <b-icon icon="upload"></b-icon> Import Proxies
              </p>
              <button type="button" class="delete" @click="isProxyModalActive = false" />
            </header>
            <section class="modal-card-body">
              <div class="field">
                <button @click="importProxiesFromFile()" class="button is-primary">Import From File</button>
              </div>
              <label class="label">OR</label>
              <b-field>
                <b-input v-model="proxiesText" type="textarea" spellcheck="false" placeholder="Paste proxies...">
                </b-input>
              </b-field>
            </section>
            <footer class="modal-card-foot">
              <button @click="importProxiesFromText()" class="button is-primary">Import</button>
            </footer>
          </div>
        </b-modal>
  </div>
</template>

<script>
import Titlebar from './components/Titlebar.vue'

export default {
  components: {
    Titlebar
  },
  mounted() {
    document.title = "Ping"
  },
  data() {
    return {
      proxies: [],
      destURL: 'http://example.com',
      isProxyModalActive: false,
      proxiesText: '',
    }
  },
  methods: {
    importProxiesFromText() {
      var pastedProxies = this.proxiesText.split('\n')
      for (let x in pastedProxies) {
        this.proxies.push({
          host: pastedProxies[x].split(':')[0],
          port: pastedProxies[x].split(':')[1],
          user: pastedProxies[x].split(':')[2],
          pass: pastedProxies[x].split(':')[3]
        })
      }
      this.isProxyModalActive = false
    },

    clearProxies() {
      this.proxies = []
      this.proxiesText = ''
      this.$buefy.toast.open({
        message: 'Cleared all proxies!',
        type: 'is-danger'
      })
    },

    exportWorking() {
      var working_proxies = []
      var self = this
      
      for (let x in this.proxies) {
        if (this.proxies[x].status == 'OK') {
          working_proxies.push(this.proxies[x])
        }
      }

      this.proxies = working_proxies

      if (working_proxies.length > 0)
        this.$buefy.dialog.confirm({
        'message': 'Export all working proxies?',
        confirmText: 'Yes',
        onConfirm: () => {
          var fs = window.require('fs')
          var file = fs.createWriteStream('working_proxies.txt')
          file.on('error', (err) => {
            self.$buefy.dialog.alert(err)
            return
          })
          for(let p in working_proxies) {
            if (working_proxies[p].user != undefined) {
              let line = `http://${working_proxies[p].user}:${working_proxies[p].pass}@${working_proxies[p].host}:${working_proxies[p].port}`
              file.write(line + '\n')
            } else {
              let line = `http://${working_proxies[p].host}:${working_proxies[p].port}`
              file.write(line + '\n')
            }
          }
          file.end()
        }
      })
      else {
        this.$buefy.dialog.alert('No proxies to export.')
      }
    },

    async testProxies() {
      var self = this
      var startTime = new Date().getTime()

      // allows us to create an async for / await loop
      const asyncRunProxyTest = {
        [Symbol.asyncIterator]() {
          return {
            i: 0,
            next() {
              if (this.i < self.proxies.length) {
                return Promise.resolve({value: this.i++, done: false})
              }

              return Promise.resolve({done: true})
            }
          }
        }
      }

      async function runTest() {
        const request = window.require('request')

        for await(let x of asyncRunProxyTest) {
          request({
            url: self.destURL,
            method: 'GET',
            headers: {'Cache-Control' : 'no-cache'},
            proxy: `http://${self.proxies[x].host}:${self.proxies[x].port}`,
            timeout: 10000
          }, function (err, res) {
            if (err) { 
              let time = new Date().getTime()
              self.proxies.splice(x, 1, {
                host: self.proxies[x].host,
                port: self.proxies[x].port,
                user: self.proxies[x].user,
                pass: self.proxies[x].pass,
                status: 'Failed',
                response: time - startTime
              })
              return
            }
            if (res.statusCode === 200) {
              let time = new Date().getTime()
              self.proxies.splice(x, 1, {
                host: self.proxies[x].host,
                port: self.proxies[x].port,
                user: self.proxies[x].user,
                pass: self.proxies[x].pass,
                status: 'OK',
                response: time - startTime
              })
            } else {
              let time = new Date().getTime()
              self.proxies.splice(x, 1, {
                host: self.proxies[x].host,
                port: self.proxies[x].port,
                user: self.proxies[x].user,
                pass: self.proxies[x].pass,
                status: 'Failed',
                response: time - startTime
              })
            }
          })
        }
      }

      runTest()
    }
  }
}
</script>

<style>
/* BULMA STYLE OVERRIDES */
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300&display=swap');

body, html {
  overflow: hidden !important;
  background: #1c202b !important;
  color: #fff !important;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  font-family: 'Nunito Sans', sans-serif !important;
}

.ui {
  margin: 30px;
}

button, input, textarea {
  font-family: 'Nunito Sans', sans-serif !important;
  -webkit-app-region: none;
}

input, textarea, h1, h2, h3, h4, h5, h6, .field, label, .box {
  background: #1c202b !important;
  color: #fff !important;
}

.card {
  background: #0a0b1d !important;
}

.card-header, .card-header-title {
  background: #7957d5 !important;
}

.modal:focus {
  outline: none !important;
}

.modal-card-body {
  background: #1c202b !important;
  color: #fff !important;
}

.modal-card-title {
  color: #fff !important;
}

.modal-card-head {
  background: #181c25 !important;
  border-bottom: none !important;
}

.modal-card-foot {
  background: #181c25 !important;
  border-top: none !important;
}

.panel-block:not(:last-child) {
  border-bottom: none !important;
}

input {
  font-size: 14pt !important;
}

input, textarea {
  border-color: #494e54 !important;
}

input::placeholder, textarea::placeholder {
  color: #fff !important;
  opacity: 0.2 !important;
}

.nav {
  -webkit-app-region: none !important;
}

.panel, .card, .box {
  box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.8), 0 0px 0 1px rgba(10, 10, 10, 0.03) !important;
}

.panel a {
  color: #fff;
}

.snackbar, .snackbar button {
  background: #0a0b1d !important;
  -webkit-app-region: none !important;
}

svg {
  margin-right: 5px;
}

a, button, .box {
  -webkit-app-region: none !important;
}

textarea:focus {
  outline: none;
}

.is-dark {
  background: #0a0b1d !important;
}

/* TABLE STYLE RESET */
.clear-user-agent-styles table,
.clear-user-agent-styles thead,
.clear-user-agent-styles tbody,
.clear-user-agent-styles tfoot,
.clear-user-agent-styles tr,
.clear-user-agent-styles th,
.clear-user-agent-styles td {
    display: block;
    width: auto;
    height: auto;
    margin: 0;
    padding: 0;
    border: none;
    text-align: left;
    font-weight: inherit;
    -webkit-border-horizontal-spacing: 0;
    -webkit-border-vertical-spacing: 0;
}
/*  */

th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #33394d !important;
  height: 30px;
  padding: 0px 0 0px 10px;
  color: #fff !important;
}

table {
  width: 100%;
  text-align: center;
  border-collapse: separate !important;
  border-spacing: 0px 4px !important;
  -webkit-app-region: none !important;
}

.table {
  background: none !important;
  color: #fff !important;
  padding-right: 10px;
}

tr {
  background: none !important;
}

td {
  padding: 0px 0px 0px 10px !important;
  background:#292e3d;
  border: none !important;
  height: 40px;
  line-height: 40px;
}

th {
  border: none !important;
  border-radius: 0 !important;
}

tr td:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

tr td:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

tr th:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

tr th:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.table-container {
  min-height: 64vh !important;
  max-height: 64vh !important;
  overflow-y: auto !important;
  -webkit-app-region: none !important;
}

.toolbar {
  width: 100%;
}

.button span {
  margin-right: 6px !important;
}

.title {
  font-weight: 300 !important;
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

.loading {
  font-size: 12pt;
  width: 40px;
  display: inline-block;
  text-align: center;
  /* padding-bottom: 12px; */
}

.loading span {
  animation-name: blink;
  animation-duration: 1.4s;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

.loading span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading span:nth-child(3) {
  animation-delay: 0.4s;
}

::-webkit-scrollbar {
  width: 0.8em;
}

::-webkit-scrollbar-track {
  background: none;
}

::-webkit-scrollbar-thumb {
  background: #7957d5;
  border-radius: 10px;
}

::-webkit-scrollbar-corner {
  display: none;
}
</style>
