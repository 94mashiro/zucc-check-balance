import Sequelize from 'sequelize'
import path from 'path'

const db = new Sequelize('zucc','zucc','zucc', {
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '_db/user.sqlite')
})

export default db
