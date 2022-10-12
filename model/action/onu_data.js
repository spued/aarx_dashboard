var db_conn = require('../core/data_connection');

function getOverAllData() {
    let sql = "SELECT * FROM aarx_status LIMIT 10";
    db_conn.getConnection(async function(err, db) {
        db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
        });
    })
    
}

module.exports = {
    getOverAllData
}