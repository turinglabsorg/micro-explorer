import app from './App'
require('dotenv').config()
const {exec} = require('child_process')
const port = process.env.PORT || 4001
app.engine('html', require('ejs').renderFile);

app.listen(port, (err) => {
  if (err) {
    return console.log(err)
  }
  return console.log(`MircoExplorer listening at port ${port}`)
})