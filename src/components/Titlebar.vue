<template>
    <div class="titlebar">
        <img src="@/assets/logo.png" width="15" style="padding-top:3px;margin-left:4px;">
        <div class="titlebar-btns">
            <button @click="minApp()">−</button>
            <button id="quit-app" @click="quitApp()">×</button>
        </div>
    </div>
</template>

<script>
const {remote} = window.require('electron')

export default {
    name: 'Titlebar',
    methods: {
        quitApp() {
            remote.getCurrentWindow().close()
        },

        minApp() {
            remote.getCurrentWindow().minimize()
        },

        maxApp() {

            remote.getCurrentWindow().maximize()
        }
    }
}
</script>

<style scoped>
.titlebar {
    height: 30px;
    background: #0a0b1d;
    margin-bottom: 10px;
}

.titlebar img {
    position: absolute;
    left: 8px;
    top: 5px;
}

.titlebar button {
    -webkit-app-region: none;
    height: 30px;
    width: 50px;
    outline: none;
    border: none;
    font-size: 14pt;
    text-align: center;
    background: none;
    color: #ccc;
}

.titlebar-btns {
    position: absolute;
    right: 0;
    top: 0;
}

.titlebar-btns button:hover {
    background: #101230;
}

#quit-app:hover {
    background: #f14668;
}
</style>