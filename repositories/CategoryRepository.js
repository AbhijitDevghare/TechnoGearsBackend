const {Category} = require("../models/index")
class CategoryRepository
{
  async createCategory(categoryName)
  {
    const category = {
      name:categoryName
    }
    return await Category.create(category);
  }

  async findCategory(category)
  {

    return await Category.find({name:category})
  }

}

module.exports = new CategoryRepository();
