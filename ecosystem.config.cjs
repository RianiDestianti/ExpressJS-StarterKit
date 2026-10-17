module.exports = {
  apps: [
    {
      name: "expressjs-skeleton",
      script: "dist/index.js",
      watch: false,
      autorestart: true,
      max_memory_restart: "500M"
    }
  ]
}
