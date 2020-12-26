<template>
  <div id="app">
    <Titlebar/>
    <div class="ui">
      <div class="box">
        <b-input v-model="destURL" placeholder="Destination URL"></b-input>
      </div>
      <div class="table-container">
        <table v-if="proxies.length > 0" class="table">
          <thead>
            <tr>
              <th></th>
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
              <td></td>
              <td>{{proxy.host}}</td>
              <td>{{proxy.port}}</td>
              <td>{{proxy.user}}</td>
              <td>{{proxy.pass}}</td>
              <td v-if="proxy.status == 'OK'" style="color:#00cc68">{{proxy.status}}</td>
              <td v-else style="color:#FF3860">{{proxy.status}}</td>
              <td v-if="proxy.response > 2000" style="color:#FFDD57">{{proxy.response}}ms</td>
              <td v-else-if="proxy.response > 0">{{proxy.response}}ms</td>
              <td v-else-if="proxy.response == 'ERROR'" style="color:#FF3860">{{proxy.response}}</td>
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
                <button @click="importProxiesFromFile()" class="button is-primary" disabled>Import From File</button>
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
import './assets/overrides.css'

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
              let line = `${working_proxies[p].host}:${working_proxies[p].port}:${working_proxies[p].user}:${working_proxies[p].pass}`
              file.write(line + '\n')
            } else {
              let line = `${working_proxies[p].host}:${working_proxies[p].port}`
              file.write(line + '\n')
            }
          }
          file.end()
          this.$buefy.toast.open({
            message: 'Exported working proxies to <b>working_proxies.txt</b>',
            type: 'is-success',
            position: 'is-top'
          })
        }
      })
      else {
        this.$buefy.dialog.alert('No proxies to export.')
      }
    },

    // TODO: figure out a way to stop testing while it's still going
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
        var tunnel = window.require('tunnel')
        var http = window.require('http')
        var https = window.require('https') // im pretty sure i can use HTTPS for both HTTP/HTTPS requests but idk
        var hostProtocol = self.destURL.split(':')[0]

        // this is really ugly. I know it and you know it. - TODO: refactor
        for await(let x of asyncRunProxyTest) {
          if (self.cancelTest) {console.log('cancelled!'); return}
          var tunnelingAgent

          if (hostProtocol == 'http') {
            if (self.proxies[x].user != undefined && self.proxies[x].pass != undefined) {
              tunnelingAgent = tunnel.httpOverHttp({
                proxy: {
                  host: self.proxies[x].host,
                  port: self.proxies[x].port,
                  proxyAuth: `${self.proxies[x].user}:${self.proxies[x].pass}`
                }
              })
            } else {
              tunnelingAgent = tunnel.httpOverHttp({
                proxy: {
                  host: self.proxies[x].host,
                  port: self.proxies[x].port
                }
              })
            }

            http.get(self.destURL, {
              agent: tunnelingAgent
            }, (res) => {
              if (res.statusCode == 200) {
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
                return
              }
            }).on('error', () => {
              self.proxies.splice(x, 1, {
                host: self.proxies[x].host,
                port: self.proxies[x].port,
                user: self.proxies[x].user,
                pass: self.proxies[x].pass,
                status: 'Failed',
                response: 'ERROR'
              })
            })

          } else {
            if (self.proxies[x].user != undefined && self.proxies[x].pass != undefined) {
              tunnelingAgent = tunnel.httpsOverHttps({
                proxy: {
                  host: self.proxies[x].host,
                  port: self.proxies[x].port,
                  proxyAuth: `${self.proxies[x].user}:${self.proxies[x].pass}`
                }
              })
            } else {
              tunnelingAgent = tunnel.httpsOverHttps({
                proxy: {
                  host: self.proxies[x].host,
                  port: self.proxies[x].port
                }
              })
            }

            https.get(self.destURL, {
              agent: tunnelingAgent
            }, (res) => {
              if(res.statusCode == 200) {
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
            }).on('error', () => {
              let time = new Date().getTime()
              self.proxies.splice(x, 1, {
                host: self.proxies[x].host,
                port: self.proxies[x].port,
                user: self.proxies[x].user,
                pass: self.proxies[x].pass,
                status: 'Failed',
                response: time - startTime
              })
            })
          }
        }
      }
      runTest()
    }
  }
}
</script>