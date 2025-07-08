const jwt = require('jsonwebtoken')
const Secret = 'Autotrends'

function setUser (user){
    return jwt.sign({
        number:user.phone_number,
        uid:user.user_uid
    },Secret)
}

function getUser (token){
    if(!token) return null;

    try {
        return jwt.verify(token,Secret)
    } catch (error) {
        return null
    }
}

module.exports = {setUser}