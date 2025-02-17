const Users = require('./users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')

class Auth{
    #users
    constructor(){
        this.#users = new Users()
    }

    async login(data){
        const {email, password} = data
        if(!email || !password){
            return {
                message: 'Incorrect credentials',
                success: false
            }
        }

        const {success, data:user, message} = await this.#users.getOneByEmail(email)

        if(success && await this.#compare(password,user.password)){
            return {...this.#generateAuthData, message}
        }

        return {
            message: 'Incorrect credentials',
            success: false
        }

    }
  
    async singup(payload){
        payload.password = await this.#hash(payload.password, 10)

        if(!payload.password || !payload.email)
            return {message: 'Error interno, reintentar', succes: false}

        const {data: user, success, message} = await this.#users.create(payload)

        if(!success)
            return {
                message,
                success
            }
        
        return {...this.#generateAuthData(user), message }
    }

    #generateAuthData(userData){
        const user = {email: userData.email, name: userData.name}
            return {
                data   : user,
                success: true,
                token  : this.#createToken(user)
            }
    }

    #compare(string,hash){
        try {
            return bcrypt.compare(string,hash)
        } catch (error) {
            return false
        }
    }

    #createToken(data){
        return jwt.sign(data,jwtSecret,{
            expiresIn: '7d'
        })
    }

    #hash(password){
        try {
            return bcrypt.hash(password,10)
        } catch (error) {
            return false
        }
    }
}

module.exports = Auth