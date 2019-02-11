const { Pool } = require('pg')

const pool = new Pool({
    user: 'vjuycveqxwapqj',
    host: 'ec2-54-83-50-174.compute-1.amazonaws.com',
    database: 'd41ca6ak9b8j22',
    password: '243ebd0e7a52a6d4cba4bf5f4c8ee132b739607be35ff4620392d119747d2f4d',
    port: 5432,
    ssl: true
});

const doQuery = async (query, params) => {
    const ans = await pool.query(query, params);
    console.log(ans.rows);
    return ans.rows;
}

const getAllOwners = async () => {
    const query = 'select * from owners';
    const ans = await doQuery(query);
    return ans;
}

const getAllVehicles = async () => {
    const query = 'select * from vehicles';
    const ans = await doQuery(query);
    return ans;
}

const getOwnerByCedula = async (cedula) => {
    const query = 'select * from owners where cedula = '.concat(["'" + cedula + "'"]);
    const ans = await doQuery(query);
    return ans[0];
}

const getVehicleByPlaca = async (placa) => {
    const query = 'select * from vehicles where placa = '.concat(["'" + placa + "'"]);
    const ans = await doQuery(query);
    return ans[0];
}

const getVehiclesByCedula = async (ownerid) => {
    const query = 'select * from vehicles where ownerid = '.concat("'" + ownerid + "'");
    const ans = await doQuery(query);
    return ans;
}

const addOwner = async (owner) => {
    let query = 'insert into owners values($1,$2) returning *';
    const ans = await doQuery(query, [owner.cedula, owner.nombre]);
    return ans[0];
}

const addVehicle = async (vehicle) => {
    let query = 'insert into vehicles values($1,$2,$3,$4) returning *';
    const ans = await doQuery(query, [vehicle.placa, vehicle.marca, vehicle.tipo, vehicle.ownerid]);
    return ans[0];
}

const addVehicleAndOwner = async (owner, vehicle) => {
    const client = await pool.connect()
    let ans = null;
    try {
        // Add vehicle like a transation to avoid garbage in db
        await client.query('BEGIN');
        let queryOwner = 'insert into owners values($1,$2)';
        await client.query(queryOwner, [owner.cedula, owner.nombre]);
        let queryVehicle = 'insert into vehicles values($1,$2,$3,$4) returning *';
        ans = await client.query(queryVehicle, [vehicle.placa, vehicle.marca, vehicle.tipo, vehicle.ownerid]);
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    } finally {
        client.release();
    }
    return ans;
}


const getAllBrandsWithQuantity = async () => {
    let query = 'select lower(marca) as nombre, count(*) as cantidad from vehicles group by nombre';
    const ans = await doQuery(query);
    return ans;
}

module.exports = { getAllOwners, getVehiclesByCedula, getOwnerByCedula, getAllVehicles, getVehicleByPlaca, addOwner, addVehicle, getAllBrandsWithQuantity, addVehicleAndOwner }

