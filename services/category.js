// const mongoose = require('mongoose');
// const Category = require('../models/category')
// const Product = require('../models/product')

// class CategoryService {

//     findCategoryByName(request) {
//         return Category.findOne(request);
//     }

//     addCategory(details) {
//         return new Category(details).save();
//     }

//     getCategories(storeId, categoryId) {
//         //only active Categories (status == 1)
//         if(!categoryId) {
//             return Category.find({store_id: storeId, parent: null, status: 1})
//         } else {
//             return Category.find({ store_id: storeId, parent: categoryId, status: 1})
//         }
//     }

//     getActiveCategory(categoryId) {
//         return Category.aggregate([
//             {
//                 $match: {
//                     _id: mongoose.Types.ObjectId(categoryId),
//                     status: 1
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
//                 "$project": {
//                     name: 1,
//                     status: 1,
//                     parent: 1,
//                     picture: 1,
//                     store_id: 1,
//                     subcategories: {
//                         "$filter": {
//                             input: "$subcategories",
//                             as: "item",
//                             cond: {
//                                 $eq: ["$$item.status", 1]
//                                 // $ne: ["item.status", 2]

//                                 // : 1
//                             }
//                         }
//                     }
//                 }
//             }
//         ])
//     }

//     getCategory(categoryId) {
//         return Category.aggregate([
//             {
//                 $match: {
//                     _id: mongoose.Types.ObjectId(categoryId),

//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "parent",
//                     as: "subcategories"
//                 }
//             }
//         ])
//     }

//     getOnlyCategory(request) {
//         return Category.findOne(request);
//     }

//     getCategorySubcategories(categoryId, pageNo, perPage, search) {
//         return Category.aggregate([
//             {
//                 $match: {
//                     _id: mongoose.Types.ObjectId(categoryId),

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
//                 $match: {
//                     "subcategories.name": new RegExp(search, 'i')
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id",
//                     name: { $first:"$name"},
//                     status: { $first: "$status" },
//                     subcategories: { $push: "$subcategories" }
//                 }
//             },
//             {
//                 "$skip":((pageNo - 1) * perPage)
//             },

//             {
//                 "$limit": perPage
//             },
//         ])
//     }

//     getTotalSubCategoriesCount(request, search) {
//         return Category.aggregate([
//             {
//                 $match: {
//                     _id: mongoose.Types.ObjectId(request.parent),

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
//                 $match: {
//                     "subcategories.name": new RegExp(search, 'i')
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id",
//                     name: { $first:"$name"},
//                     status: { $first: "$status" },
//                     subcategories: { $push: "$subcategories" }
//                 }
//             }
//         ]);
//     }

//     updateCategory(details, criteria) {
//         return Category.findOneAndUpdate(criteria, details, { new: true })
//     }

//     getAllCategoriesWithSubCategories(storeId) {
//         console.log(" Yahi hai voooooooo!");

//         return Category.aggregate([
//             {
//                 $match: {
//                     store_id: mongoose.Types.ObjectId(storeId),
//                     parent: null,
//                     status: 1 // Only Active Categories
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "parent",
//                     as: "subcategories"
//                 },
//             },

//             {
//                 "$project": {
//                     name: 1,
//                     status: 1,
//                     parent: 1,
//                     picture: 1,
//                     store_id: 1,
//                     subcategories: {
//                         "$filter": {
//                             input: "$subcategories",
//                             as: "item",
//                             cond: {
//                                 $eq: ["$$item.status", 1]
//                                 // $ne: ["item.status", 2]

//                                 // : 1
//                             }
//                         }
//                     }
//                 }
//             }

//         ])
//     }

//     getAllStoreCategoriesForCategoryManagement(storeId) {
//         return Category.aggregate([
//             {
//                 $match: {
//                     store_id: mongoose.Types.ObjectId(storeId),
//                     parent: null,
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "parent",
//                     as: "subcategories"
//                 }
//             } 
//         ])
//     }

//     getCategoriesWithPagination(pageNo, perPage, storeId, search, sort) {

//         let condition = [
//             {
//                 $match: {
//                     store_id: mongoose.Types.ObjectId(storeId),
//                     parent: null,
//                     name:new RegExp(search, 'i')
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "parent",
//                     as: "subcategories"
//                 }
//             } 
//         ]

//         return Category.aggregate(condition).skip((pageNo - 1) * perPage).limit(perPage).sort(sort); 
//     }

//     getTotalCategoriesCount(storeId, search) {

//         let condition = [
//             {
//                 $match: {
//                     store_id: mongoose.Types.ObjectId(storeId),
//                     parent: null,
//                     name:new RegExp(search, 'i')
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "parent",
//                     as: "subcategories"
//                 }
//             } 
//         ]

//         return Category.aggregate(condition);

//         // let condition = {
//         //     $and:
//         //         [
//         //             {
//         //                 $or:[
//         //                         { 
//         //                             name: new RegExp(search, 'i'),
//         //                         }
//         //                 ]
//         //             },
//         //             request
//         //         ]
//         // }
//         // return Category.countDocuments(condition);
//     }

//     async deleteSubCategory(subcategory_id, parentSession = null) {

//         let session;

//         if (parentSession) {

//             session = parentSession;

//         } else {

//             session = await mongoose.startSession();
//             session.startTransaction();
//         }

//         console.log('subcategory session ------------------------------------------------------------')


//         const opts = { session };

//         try {

//             let deletedProduct = await Product.deleteMany({ category_id: subcategory_id }, opts);
//             let deletedSubcategory = await Category.deleteMany({ _id: subcategory_id }, opts);

//             if (!parentSession) {

//                 await session.commitTransaction();
//                 session.endSession();
//             }

//             return deletedSubcategory;

//         } catch (e) {
//             console.log('e', e);
//             await session.abortTransaction();
//             session.endSession();

//             return e;
//         }

//     }

//     async deleteCategory(category, parentSession = null) {

//         let session;

//         if(parentSession) {

//             session = parentSession;

//         } else {

//             session = await mongoose.startSession();
//             session.startTransaction();
//         }

//         console.log('category session ------------------------------------------------------------')


//         const opts = { session };

//         try {

//             if(category._id) {

//                 let subcategories = await Category.find({ parent: category._id });

//                 for (let i = 0; i < subcategories.length; i++) {
//                     const element = subcategories[i];
//                     const test = await this.deleteSubCategory(subcategories[i]._id, session)
//                     // let deletedProducts = await Product.deleteMany({ category_id: element._id})
//                 }


//             } else {
//                 throw new Error('Invalid Category ID');
//             }

//             let deletedCategory = await Category.deleteMany({ _id: category._id }, opts);
//             console.log('deleted Subcategory', deletedCategory);

//             if(!parentSession) {

//                 await session.commitTransaction();
//                 session.endSession();
//             }

//             return deletedCategory;

//         } catch (e) {
//             await session.abortTransaction();
//             session.endSession();

//             return e;
//         }

//     }

// }

// module.exports = new CategoryService();


const mongoose = require('mongoose');
const Category = require('../models/category')
const Product = require('../models/product')

class CategoryService {

    findCategoryByName(request) {
        return Category.findOne(request);
    }

    addCategory(details) {
        return new Category(details).save();
    }

    getCategories(storeId, categoryId) {
        //only active Categories (status == 1)
        // , commission: { $not: { $gt: 0 } }
        // updated on 17-07-2020
        if (!categoryId) {
            return Category.find({ store_id: storeId, parent: null, status: 1 })
        } else {
            return Category.find({ store_id: storeId, parent: categoryId, status: 1 })
        }
    }

    getActiveCategory(categoryId) {
        return Category.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(categoryId),
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
                "$project": {
                    name: 1,
                    status: 1,
                    parent: 1,
                    picture: 1,
                    store_id: 1,
                    subcategories: {
                        "$filter": {
                            input: "$subcategories",
                            as: "item",
                            cond: {
                                $eq: ["$$item.status", 1]
                                // $ne: ["item.status", 2]

                                // : 1
                            }
                        }
                    }
                }
            }
        ])
    }

    getCategory(categoryId) {
        return Category.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(categoryId),
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "subcategories"
                }
            }
        ])
    }

    getOnlyCategory(request) {
        return Category.findOne(request);
    }
    // added by me
    getSubCategory(categoryId, storeId) {
        return Category.findOne({ _id: mongoose.Types.ObjectId(categoryId), store_id: mongoose.Types.ObjectId(storeId) });
    }

    getMainCategory(parentId, storeId) {
        return Category.findOne({ _id: mongoose.Types.ObjectId(parentId), store_id: mongoose.Types.ObjectId(storeId) });
    }
    getMainCategory2(id) {
        return Category.findOne({ _id: mongoose.Types.ObjectId(id) });
    }

    getCategorySubcategories(categoryId, pageNo, perPage, search) {
        return Category.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(categoryId),
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
                    "subcategories.name": new RegExp(search, 'i')
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    status: { $first: "$status" },
                    subcategories: { $push: "$subcategories" }
                }
            },
            {
                "$skip": ((pageNo - 1) * perPage)
            },

            {
                "$limit": perPage
            },
        ])
    }

    getTotalSubCategoriesCount(request, search) {
        return Category.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(request.parent),

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
                    "subcategories.name": new RegExp(search, 'i')
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    status: { $first: "$status" },
                    subcategories: { $push: "$subcategories" }
                }
            }
        ]);
    }

    updateCategory(details, criteria) {
        return Category.findOneAndUpdate(criteria, details, { new: true })
    }

    getAllCategoriesWithSubCategories(storeId) {
        console.log(" Yahi hai voooooooo!");

        return Category.aggregate([
            {
                $match: {
                    store_id: mongoose.Types.ObjectId(storeId),
                    parent: null,
                    status: 1 // Only Active Categories
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "subcategories"
                },
            },

            {
                "$project": {
                    name: 1,
                    status: 1,
                    parent: 1,
                    picture: 1,
                    store_id: 1,
                    subcategories: {
                        "$filter": {
                            input: "$subcategories",
                            as: "item",
                            cond: {
                                $eq: ["$$item.status", 1]
                                // $ne: ["item.status", 2]

                                // : 1
                            }
                        }
                    }
                }
            }

        ])
    }

    getAllStoreCategoriesForCategoryManagement(storeId) {
        return Category.aggregate([
            {
                $match: {
                    store_id: mongoose.Types.ObjectId(storeId),
                    parent: null,
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "subcategories"
                }
            }
        ])
    }

    getCategoriesWithPagination(pageNo, perPage, storeId, search, sort) {

        let condition = [
            {
                $match: {
                    store_id: mongoose.Types.ObjectId(storeId),
                    parent: null,
                    name: new RegExp(search, 'i')
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "subcategories"
                }
            }
        ]

        return Category.aggregate(condition).skip((pageNo - 1) * perPage).limit(perPage).sort(sort);
    }

    getTotalCategoriesCount(storeId, search) {

        let condition = [
            {
                $match: {
                    store_id: mongoose.Types.ObjectId(storeId),
                    parent: null,
                    name: new RegExp(search, 'i')
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "subcategories"
                }
            }
        ]

        return Category.aggregate(condition);

        // let condition = {
        //     $and:
        //         [
        //             {
        //                 $or:[
        //                         { 
        //                             name: new RegExp(search, 'i'),
        //                         }
        //                 ]
        //             },
        //             request
        //         ]
        // }
        // return Category.countDocuments(condition);
    }

    async deleteSubCategory(subcategory_id, parentSession = null) {

        let session;

        if (parentSession) {

            session = parentSession;

        } else {

            session = await mongoose.startSession();
            session.startTransaction();
        }

        console.log('subcategory session ------------------------------------------------------------')


        const opts = { session };

        try {

            let deletedProduct = await Product.deleteMany({ category_id: subcategory_id }, opts);
            let deletedSubcategory = await Category.deleteMany({ _id: subcategory_id }, opts);

            if (!parentSession) {

                await session.commitTransaction();
                session.endSession();
            }

            return deletedSubcategory;

        } catch (e) {
            console.log('e', e);
            await session.abortTransaction();
            session.endSession();

            return e;
        }

    }

    async deleteCategory(category, parentSession = null) {

        let session;

        if (parentSession) {

            session = parentSession;

        } else {

            session = await mongoose.startSession();
            session.startTransaction();
        }

        console.log('category session ------------------------------------------------------------')


        const opts = { session };

        try {

            if (category._id) {

                let subcategories = await Category.find({ parent: category._id });

                for (let i = 0; i < subcategories.length; i++) {
                    const element = subcategories[i];
                    const test = await this.deleteSubCategory(subcategories[i]._id, session)
                    // let deletedProducts = await Product.deleteMany({ category_id: element._id})
                }


            } else {
                throw new Error('Invalid Category ID');
            }

            let deletedCategory = await Category.deleteMany({ _id: category._id }, opts);
            console.log('deleted Subcategory', deletedCategory);

            if (!parentSession) {

                await session.commitTransaction();
                session.endSession();
            }

            return deletedCategory;

        } catch (e) {
            await session.abortTransaction();
            session.endSession();

            return e;
        }

    }

}

module.exports = new CategoryService();