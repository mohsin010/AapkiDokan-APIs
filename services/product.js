const Product = require('../models/product');
const Order = require('../models/order')
const Category = require('../models/category');
const mongoose = require('mongoose');

class ProductService {
    async updateProductsByStore(details, condition) {


        let products = await Product.updateMany(condition, details).exec()
        // if (products.length > 0) {
        //     products.forEach((product) => {
        //         //    let   id = product._id
        //         if (product.commission.store_comm_priority == 1 || product.commission.store_comm_priority == undefined) {

        //             Product.updateMany({ _id: product.id }, {status: 2})
        //         }
        //     })
        // } else {
        //     let condition2 = {
        //         store_id: condition.store_id
        //     }
        //     let products = await Product.find(condition2).exec()
        //     if (products.length > 0) {
        //         products.forEach((product) => {
        //             //    let   id = product._id
        //             if (product.commission.store_comm_priority == 1 || product.commission.store_comm_priority == undefined) {

        //                 Product.findOneAndUpdate({ _id: product.id }, { $set: details })

        //             }
        //         })
        //     }




        // }

        return;
    }

    async updateProductsByCategory(details, condition) {
        let products = await Product.find(condition).exec(
            // { category_id: mongoose.Types.ObjectId(categoryId) }
            //   function(err, rec) {

            //   if(err){
            //       console.log("Error") ;
            //   }else{
            //     console.log("Records Found") ;
            //   }
            //   }
        )
        if (products) {
            products.forEach((product) => {
                //    let   id = product._id
                if (product.commission.store_comm_priority < 4) {

                    Product.findOneAndUpdate({ _id: product.id }, { $set: details }, function (err, rec) {
                        console.log(rec);
                    }
                        //    commission: {
                        //        store_comm: details.commission.store_comm,
                        //        store_comm_priority: details.commission.store_comm_priority
                        //    }
                        //    }, 
                    )
                }
            })
        }

        // for (let i = 0; i <= products.length; i++) {


        // }
        return;

    }

    getStoreFeaturedProducts(store_id) {


        return Product.find({ store_id: store_id, is_featured: true, status: 1 })

        // return Category.aggregate([
        //     {
        //         $match: {
        //             store_id: mongoose.Types.ObjectId(store_id),
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "categories",
        //             localField: "_id",
        //             foreignField: "parent",
        //             as: "subcategories"
        //         }
        //     },
        //     {
        //         $unwind: "$subcategories"
        //     },
        //     {
        //         $match: {
        //             "subcategories.status": 1
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "subcategories._id",
        //             foreignField: "category_id",
        //             as: "subcategories.products"
        //         }
        //     },
        //     {
        //         "$group": {
        //             "_id": {
        //                 "subcategories": "$subcategories"

        //             },
        //         }
        //     },
        //     {
        //         $replaceRoot: { newRoot: "$_id.subcategories" }
        //     },
        //     {
        //         $project: {
        //             products: {
        //                 "$filter": {
        //                     input: "$products",
        //                     as: "item",
        //                     cond: {
        //                         $and: [
        //                             { $eq: ["$$item.status", 1] },
        //                             "$$item.is_featured"
        //                         ]

        //                         // $ne: ["item.status", 2]

        //                         // : 1
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $unwind: "$products"
        //     },
        //     {
        //         $group: {
        //             _id: "$abc", //group all by null field
        //             products: { $push: "$products" }
        //         }
        //     }
        //     // {
        //     //     $replaceRoot: { newRoot: { $mergeObjects: ["$_id.subcategories", "$products"] }  }
        //     // },

        // ])
        // return Product.find({ store_id: store_id, is_featured: true, status: 1 });
    }

    getProduct(request) {
        console.log('request', request)
        return Product.findOne(request);
    }

    getProductById(id) {
        console.log('id', id)
        return Product.findById(id);
    }

    updateProduct(criteria, details) {
        return Product.findOneAndUpdate(criteria, details, { new: true });
    }

    async getBestSellingProducts(store_id) {

        return Product.find({ store_id: store_id, is_best_selling: true, status: 1 })

        // return Category.aggregate([
        //     {
        //         $match: {
        //             store_id: mongoose.Types.ObjectId(store_id),
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "categories",
        //             localField: "_id",
        //             foreignField: "parent",
        //             as: "subcategories"
        //         }
        //     },
        //     {
        //         $unwind: "$subcategories"
        //     },
        //     {
        //         $match: {
        //             "subcategories.status": 1
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "subcategories._id",
        //             foreignField: "category_id",
        //             as: "subcategories.products"
        //         }
        //     },
        //     {
        //         "$group": {
        //             "_id": {
        //                 "subcategories": "$subcategories"

        //             },
        //         }
        //     },
        //     {
        //         $replaceRoot: { newRoot: "$_id.subcategories" }
        //     },
        //     {
        //         $project: {
        //             products: {
        //                 "$filter": {
        //                     input: "$products",
        //                     as: "item",
        //                     cond: {
        //                         $and: [
        //                             { $eq: ["$$item.status", 1] },
        //                             "$$item.is_best_selling"
        //                         ]

        //                         // $ne: ["item.status", 2]

        //                         // : 1
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $unwind: "$products"
        //     },
        //     {
        //         $group: {
        //             _id: "$abc", //group all by null field
        //             products: { $push: "$products" }
        //         }
        //     }
        //     // {
        //     //     $replaceRoot: { newRoot: { $mergeObjects: ["$_id.subcategories", "$products"] }  }
        //     // },

        // ])
        // let product =  await Product.find({ store_id: store_id, is_best_selling: true, status: 1 })
        // console.log('product', product)
        // return product;
    }

    // getBestSellingProducts(store_id, limit = null) {

    //     if (!limit)
    //         return Order.aggregate([
    //             {
    //                 $match: { store_id: mongoose.Types.ObjectId(store_id) }
    //             },
    //             {
    //                 "$unwind": "$products"
    //             },
    //             {
    //                 "$group": {
    //                     "_id": {
    //                         "product_id": "$products.product_id",
    //                         "variant_id": "$products.variant_id"
    //                     },
    //                     "quantity": { "$sum": "$products.quantity" }
    //                 }
    //             },
    //             {
    //                 "$replaceRoot": { newRoot: { $mergeObjects: ["$_id", "$$ROOT"] } }
    //             },
    //             {
    //                 "$project": { _id: 0 }
    //             },
    //             {
    //                 "$sort": { "quantity": -1 }
    //             },
    //             {
    //                 $limit: 5
    //             },
    //             {
    //                 "$lookup":
    //                 {
    //                     from: "products",
    //                     localField: "product_id",
    //                     foreignField: "_id",
    //                     as: 'product'
    //                 }
    //             }

    //         ])
    //     else
    //         return Order.aggregate([
    //             {
    //                 "$unwind": "$products"
    //             },
    //             {
    //                 "$group": {
    //                     "_id": {
    //                         "product_id": "$products.product_id",
    //                         "variant_id": "$products.variant_id"
    //                     },
    //                     "quantity": { "$sum": "$products.quantity" }
    //                 }
    //             },
    //             {
    //                 "$replaceRoot": { newRoot: { $mergeObjects: ["$_id", "$$ROOT"] } }
    //             },
    //             {
    //                 "$project": { _id: 0 }
    //             },
    //             {
    //                 "$sort": { "quantity": -1 }
    //             },
    //             {
    //                 "$lookup":
    //                 {
    //                     from: "products",
    //                     localField: "product_id",
    //                     foreignField: "_id",
    //                     as: 'product'
    //                 }
    //             }

    //         ])
    // }

    addProductToStore(details) {
        return new Product(details).save();
    }

    async getProducts(criteria, pageNo) {

        if (criteria.subcategory_id) {

            let condition = {
                $and:
                    [
                        {
                            $or:
                                [
                                    { name: new RegExp(criteria.search, 'i') },
                                    { tags: { "$regex": criteria.search, "$options": "i" } }
                                ]
                        },
                        {
                            store_id: criteria.store_id,
                            category_id: criteria.subcategory_id,
                            status: 1 //Only Active Products
                        }
                    ]
            }

            return Product.find(condition).limit(criteria.perPage).skip((criteria.pageNo - 1) * criteria.perPage);

        } else if (criteria.category_id) {

            return Product.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "category_id",
                        foreignField: "_id",
                        as: "subcategory"
                    }
                },
                {
                    $unwind: "$subcategory"
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "subcategory.parent",
                        foreignField: "_id",
                        as: "subcategory.category"
                    }
                },
                {
                    $match: {
                        "subcategory.category._id": mongoose.Types.ObjectId(criteria.category_id),
                        "subcategory.category.store_id": mongoose.Types.ObjectId(criteria.store_id),
                        "subcategory.status": 1,
                        status: 1
                    }
                },
                {
                    $sort: {
                        "subcategory.name": 1
                    }
                },
                {
                    $project: {
                        subcategory: 0
                    }
                },
                {
                    $skip: ((criteria.pageNo - 1) * criteria.perPage)
                },
                {
                    $limit: criteria.perPage
                }
            ])

            // Old code written by test Warrior

            // return Category.aggregate([
            //     {
            //         $match: {
            //             _id: mongoose.Types.ObjectId(criteria.category_id),
            //             store_id: mongoose.Types.ObjectId(criteria.store_id),
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "categories",
            //             localField: "_id",
            //             foreignField: "parent",
            //             as: "subcategories"
            //         }
            //     },
            //     {
            //         $unwind: "$subcategories"
            //     },
            //     {
            //         $match: {
            //             "subcategories.status": 1
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "products",
            //             localField: "subcategories._id",
            //             foreignField: "category_id",
            //             as: "subcategories.products"
            //         }
            //     },
            //     {
            //         "$group": {
            //             "_id": {
            //                 "subcategories": "$subcategories"
            //             },
            //         }
            //     },
            //     {
            //         $replaceRoot: { newRoot: "$_id.subcategories" }
            //     },
            //     {
            //         $project: {
            //             name: 1,
            //             status: 1,
            //             parent: 1,
            //             picture: 1,
            //             store_id: 1,
            //             products: {
            //                 "$filter": {
            //                     input: "$products",
            //                     as: "item",
            //                     cond: {
            //                         $eq: ["$$item.status", 1]
            //                     }
            //                 }
            //             }
            //         },


            //     },
            //     {
            //         "$skip": ((criteria.pageNo - 1) * criteria.perPage)
            //     },
            //     {
            //         "$limit": criteria.perPage
            //     }
            // ])

        } else {

            return Category.aggregate([
                {
                    $match: {
                        store_id: mongoose.Types.ObjectId(criteria.store_id),
                        status: 1
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "parent",
                        as: "subcategories"
                    }
                },
                {
                    $unwind: "$subcategories"
                },
                {
                    $match: {
                        "subcategories.status": 1
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "subcategories._id",
                        foreignField: "category_id",
                        as: "subcategories.products"
                    }
                },
                { "$unwind": "$subcategories.products" },
                {
                    $replaceRoot: { newRoot: "$subcategories.products" }
                },
                {
                    $match: {

                        $and:
                            [
                                {
                                    $or:
                                        [
                                            { name: new RegExp(criteria.search, 'i') },
                                            { tags: { "$regex": criteria.search, "$options": "i" } }
                                        ]
                                },
                                {
                                    status: 1,
                                }
                            ],
                    }
                },
                {
                    "$skip": ((criteria.pageNo - 1) * criteria.perPage)
                },
                {
                    "$limit": criteria.perPage
                },

            ])
        }
    }

    // async getProducts(criteria) {

    //     if (criteria.subcategory_id) {

    //         let condition = {
    //             $and:
    //                 [
    //                     {
    //                         $or:
    //                             [
    //                                 { name: new RegExp(criteria.search, 'i') },
    //                             ]
    //                     },
    //                     {
    //                         store_id: criteria.store_id,
    //                         category_id: criteria.subcategory_id,
    //                         // status : 1
    //                     }
    //                 ]
    //             }
    //             console.log('Condition :  ', condition );


    //         return Product.find(condition);

    //     } else if (criteria.category_id) {
    //         console.log("ffd");
    //         return Category.aggregate([
    //             {
    //                 $match: {
    //                     _id: mongoose.Types.ObjectId(criteria.category_id),
    //                     store_id: mongoose.Types.ObjectId(criteria.store_id),
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "categories",
    //                     localField: "_id",
    //                     foreignField: "parent",
    //                     as: "subcategories"
    //                 }
    //             },
    //             {
    //                 $unwind: "$subcategories"
    //             },
    //             {
    //                 $lookup: {
    //                     from: "products",
    //                     localField: "subcategories._id",
    //                     foreignField: "category_id",
    //                     as: "subcategories.products"
    //                 }
    //             },
    //             { "$unwind": {
    //                 path: "$subcategories.products",
    //                 preserveNullAndEmptyArrays: true
    //                 }
    //             },
    //             {
    //                 $match: { $or: [{ "subcategories.products.status": 1 }, { "subcategories.products": { $exists: false } }] }
    //             },
    //             // {
    //             //     $match: { "subcategories.products.status": 1 }
    //             // }
    //             {
    //                 "$group": {
    //                     "_id": {
    //                         // "_id": "$_id",
    //                         "subcategories": "$subcategories",

    //                     },
    //                     // "subCategories": "$subCategories.parent" ,
    //                     "products": { "$push": "$subcategories.products" }
    //                 }
    //             },
    //             {
    //                 $replaceRoot: { newRoot: "$_id.subcategories" }
    //             },
    //             {
    //                 $match: {
    //                     status: 1
    //                 }
    //             }

    //         ])

    //     } else {
    //         let condition = {
    //             $and:
    //                 [
    //                     {
    //                         $or:
    //                             [
    //                                 { name: new RegExp(criteria.search, 'i') },
    //                             ]
    //                     },
    //                     {
    //                         store_id: criteria.store_id,
    //                         status: 1 //Only Active Products
    //                     }
    //                 ]
    //             }

    //         return Product.find(condition);
    //     }
    // }

    getProductsWithPagination(request, pageNo, perPage, criteria, sort) {
        let condition = {
            $and:
                [
                    {
                        $or:
                            [
                                { name: new RegExp(criteria.search, 'i') },
                                { tags: { "$regex": criteria.search, "$options": "i" } }
                            ]
                    },
                    {
                        store_id: criteria.store_id,
                        category_id: criteria.subcategory_id
                    }
                ]
        }

        return Product.find(condition).skip((pageNo - 1) * perPage).limit(perPage).sort(sort);
    }

    getTotalProductsCount(request, criteria) {
        // if(criteria.subcategory_id && criteria.search) {
        let condition = {
            $and: [
                {
                    $or: [
                        { name: new RegExp(criteria.search, 'i') },
                    ]
                },
                {
                    store_id: criteria.store_id,
                    category_id: criteria.subcategory_id
                }
            ]
        }
        return Product.countDocuments(condition);
        // } else if(criteria.subcategory_id) {
        //     let condition = {
        //         $and:
        //             [
        //                 {
        //                     $and:
        //                         [
        //                             { category_id: criteria.subcategory_id },
        //                             { store_id:criteria.store_id },
        //                         ]
        //                 },
        //                 request
        //             ]
        //     }
        //     return Product.countDocuments(condition);
        // } else {
        //     let condition = {
        //         $and:
        //             [
        //                 {
        //                     $or:
        //                         [
        //                             { name: new RegExp(criteria.search, 'i') },
        //                         ]
        //                 },
        //                 request
        //             ]
        //     }
        //     return Product.countDocuments(condition);
        // }
    }

    deleteProduct(request) {

        return Product.deleteOne(request);
    }


    async addProductsFromSku(data, store_id) {

        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            let not_found_products = [];
            let duplicate_products = [];
            let updated_products = [];
            for (let i = 0; i < data.length; i++) {
                const element = data[i];

                const sku_id = element.sku_id;
                if (!sku_id) throw new Error('Sku ID is required at index ' + i);
                let newStore_id = mongoose.Types.ObjectId(store_id)

                let getproduct = await Product.find({ sku_id: sku_id, store_id: newStore_id });
                if (getproduct.length == 1) {
                    updated_products.push(sku_id);
                    // not_found_products.push(sku_id)
                    let product = getproduct[0].toJSON();
                    // if (!product) throw new Error('Sku ID is Invalid at index ' + i);
                    // if (product.store_id != newStore_id) throw new Error('Invalid Product Id for Product at index ' + i)


                    if (element.quantity) {
                        if (isNaN(Number(element.quantity)) || Number(element.quantity) < 0) throw new Error('Quantity is Invalid at index ' + i)
                    }

                    element.selling_price ? element.selling_price = element.selling_price : element.selling_price = product.price.cost_price;
                    element.discounted_price ? element.discounted_price = element.discounted_price : element.discounted_price = product.price.sale_price;

                    if (isNaN(Number(element.selling_price)) || Number(element.selling_price) < 1) throw new Error('Selling Price is Invalid at index ' + i)
                    if (isNaN(Number(element.discounted_price)) || Number(element.discounted_price) < 1) throw new Error('Discounted Price is Invalid at index ' + i)

                    if (Number(element.selling_price) < Number(element.discounted_price)) throw new Error('Discounted Price cannot be greater than the selling Price, Error at index ' + i)

                    let updateObject = {};
                    if (element.quantity <= 0) {
                        let stock_quantity = 0
                        if (element.quantity) stock_quantity = element.quantity;
                        updateObject.stock_quantity = stock_quantity
                        updateObject.status = 2
                    } else if (product.status == 2 && element.quantity > 0) {
                        if (element.quantity) updateObject.stock_quantity = element.quantity;
                        updateObject.status = 1
                    } else {
                        if (element.quantity) updateObject.stock_quantity = element.quantity;
                    }
                    // if (element.quantity) updateObject.stock_quantity = element.quantity;

                    if (element.selling_price || element.discounted_price) updateObject.price = {};

                    if (element.selling_price) {
                        updateObject.price.cost_price = element.selling_price
                    }
                    if (element.discounted_price) {
                        updateObject.price.sale_price = element.discounted_price
                    }

                    let newProduct = await Product.updateOne({ _id: product._id }, updateObject, { new: true, runValidators: true, session: session })
                } else if (getproduct.length > 1) {
                    duplicate_products.push(sku_id)
                } else {
                    not_found_products.push("" + sku_id);
                }
            }

            await session.commitTransaction();
            session.endSession();
            let not_found_products_count = not_found_products.length;
            let duplicate_products_count = duplicate_products.length;
            let updated_products_count = updated_products.length;
            let received_products = data.length;
            return {
                not_found_products: not_found_products,
                duplicate_products: duplicate_products,
                not_found_products_count: not_found_products_count,
                duplicate_products_count: duplicate_products_count,
                updated_products: updated_products,
                updated_products_count: updated_products_count,
                received_products: received_products,
                success: true,
                message: 'Products have been updated Successfully.'
            }

        } catch (e) {

            await session.abortTransaction();
            session.endSession();

            return {
                success: false,
                error: e
            }

        }

    }
    //Add New Products API
    async addNewProduct(data, store_id) {

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let added_Products = [];
            let duplicate_products = [];
            let not_added_products = [];
            for (let i = 0; i < data.length; i++) {
                let product = data[i]

                let checkProduct = await Product.findOne({ sku_id: product.sku_id, store_id: store_id })
                if (checkProduct) {
                    duplicate_products.push(checkProduct.sku_id)
                } else {

                    let newProduct = await new Product(product).save();
                    if (newProduct) {
                        added_Products.push(data[i].sku_id)
                    } else {

                        not_added_products.push(data[i].sku_id)
                    }
                }

            }

            await session.commitTransaction();
            session.endSession();
            let added_Products_Count = added_Products.length;
            let duplicate_products_count = duplicate_products.length;
            let not_added_products_count = not_added_products.length;
            let received_products = data.length;
            return {
                duplicate_products: duplicate_products,
                duplicate_products_count: duplicate_products_count,
                received_products: received_products,
                added_Products_Count: added_Products_Count,
                added_Products: added_Products,
                not_added_products: not_added_products,
                not_added_products_count: not_added_products_count,
                success: true,
                message: 'Products have been added Successfully.'
            }

        } catch (e) {

            await session.abortTransaction();
            session.endSession();

            return {
                success: false,
                error: e
            }

        }

    }


}

module.exports = new ProductService();