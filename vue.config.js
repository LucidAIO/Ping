module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                productName: "Ping",
                appId: "com.lucid.ping",
                // icon: "./logo.ico",
                // linux: {
                //     icon: "./logo.png"
                // },
                asar: false,
                nodeIntegration: true
            }
        }
    }
}