const graphql = require('graphql');
const _ = require('lodash');
const db = require('../db/postgres');

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLInputObjectType, GraphQLInt } = graphql;

const OwnerType = new GraphQLObjectType({
    name: 'Owner',
    fields: () => ({
        cedula: { type: GraphQLID },
        nombre: { type: GraphQLString },
        vehicles: {
            type: new GraphQLList(VehicleType),
            resolve(parent, args) {
                return db.getVehiclesByCedula(parent.cedula)
                    .then(
                        data => {
                            return data;
                        })
                    .catch(
                        error => {
                            return 'The error is', error;
                        });
            }
        }
    })
});

const VehicleType = new GraphQLObjectType({
    name: 'Vehicle',
    fields: () => ({
        placa: { type: GraphQLID },
        marca: { type: GraphQLString },
        tipo: { type: GraphQLString },
        owner: {
            type: OwnerType,
            resolve(parent, args) {
                return db.getOwnerByCedula(parent.ownerid)
                    .then(
                        data => {
                            return data;
                        })
                    .catch(
                        error => {
                            return 'The error is', error;
                        });
            }
        }
    })
});

const BrandQueryType = new GraphQLObjectType({
    name: 'BrandQuery',
    fields: () => ({
        nombre: { type: GraphQLString },
        cantidad: { type: GraphQLInt },
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        owner: {
            type: OwnerType,
            args: { cedula: { type: GraphQLID } },
            resolve(parent, args) {
                return db.getOwnerByCedula(args.cedula)
                    .then(
                        data => {
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        },
        vehicle: {
            type: VehicleType,
            args: { placa: { type: GraphQLID } },
            resolve(parent, args) {
                return db.getVehicleByPlaca(args.placa)
                    .then(
                        data => {
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        },
        owners: {
            type: new GraphQLList(OwnerType),
            resolve(parent, args) {
                return db.getAllOwners()
                    .then(
                        data => {
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        },
        vehicles: {
            type: new GraphQLList(VehicleType),
            resolve(parent, args) {
                return db.getAllVehicles()
                    .then(
                        data => {
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        },
        brands: {
            type: new GraphQLList(BrandQueryType),
            resolve(parent, args) {
                return db.getAllBrandsWithQuantity()
                    .then(
                        data => {
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        }
    }
});

const OwnerInputType = new GraphQLInputObjectType(
    {
        name: 'OwnerInput',
        fields: () => ({
            cedula: { type: GraphQLID },
            nombre: { type: GraphQLString }
        })
    }
);

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addOwner: {
            type: OwnerType,
            args: {
                cedula: { type: GraphQLID },
                nombre: { type: GraphQLString }
            },
            resolve(parent, args) {
                const owner = {
                    cedula: args.cedula,
                    nombre: args.nombre
                };
                return db.addOwner(owner)
                    .then(
                        data => {
                            console.log(data)
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        },
        addVehicle: {
            type: VehicleType,
            args: {
                placa: { type: GraphQLID },
                marca: { type: GraphQLString },
                tipo: { type: GraphQLString },
                ownerid: { type: GraphQLString }
            },
            resolve(parent, args) {
                const vehicle = {
                    placa: args.placa,
                    marca: args.marca,
                    tipo: args.tipo,
                    ownerid: args.ownerid
                };
                return db.addVehicle(vehicle)
                    .then(
                        data => {
                            console.log(data)
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        }
        ,
        addVehicleAndOwner: {
            type: VehicleType,
            args: {
                placa: { type: GraphQLID },
                marca: { type: GraphQLString },
                tipo: { type: GraphQLString },
                ownerinput: { type: OwnerInputType }
            },
            resolve(parent, args) {
                const vehicle = {
                    placa: args.placa,
                    marca: args.marca,
                    tipo: args.tipo,
                    ownerid: args.ownerinput.cedula
                };
                const owner = {
                    cedula: args.ownerinput.cedula,
                    nombre: args.ownerinput.nombre
                };
                return db.addVehicleAndOwner(owner, vehicle)
                    .then(
                        data => {
                            console.log(data)
                            return data
                        })
                    .catch(
                        error => {
                            return 'The error is', error
                        });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});