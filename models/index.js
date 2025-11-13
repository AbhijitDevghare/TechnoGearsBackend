

const Schemas = {
    User : require("./UserSchema"),
    Admin:require("./AdminSchema"),
    Product:require("./ProductSchema"),
    Category:require("./CategorySchema"),
    Order:require("./OrderSchema.js"),
    Payment:require("./PaymentSchema.js")
}

module.exports=Schemas