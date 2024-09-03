export const INSERT_INTO_USERS = 'INSERT INTO users(username,email,password) VALUES ($1, $2, $3)'

export const FIND_USER_BY_EMAIL = 'SELECT * FROM users WHERE email=$1'