import mysql2, { Connection } from 'mysql2'
class DataBase{
    connectToDB(){
        const db = mysql2.createConnection({
            host:'localhost',
            database:'e-commerce-ts',
            user:'root',
            password:''
        })
        return db
    }
}

export default DataBase