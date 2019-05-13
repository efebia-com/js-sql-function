const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

module.exports = function (context, myTimer) {

    // Create connection to database
    const config =
    {
        authentication: {
            options: {
                userName: '<your_username>',
                password: '<your_password'
            },
            type: 'default'
        },
        server: '<your_servername>.database.windows.net',
        options:
        {
            database: '<your_dbname>',
            encrypt: true
        }
    }

    const connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            context.log(err);
        }
        else {
            queryDatabase();
        }
    }
    );

    function queryDatabase() {
        context.log('Reading rows from the Table...');
        const rows = [];

        // Read all rows from table
        const request = new Request("Select * from <your_table>;", function (err, rowCount, rows) {
            context.log(rowCount + ' row(s) returned');
        });

        request.on('row', function (columns) {
            const newColumns = [];
            columns.forEach(function (column) {
                context.log("%s\t%s", column.metadata.colName, column.value);
                newColumns.push({ colName: column.metadata.colName, value: column.value });
            });
            rows.push(newColumns);
        });

        request.on('requestCompleted', function () {
            context.res.status(200).json({
                rows: rows
            })
        });
        connection.execSql(request);
    }
};