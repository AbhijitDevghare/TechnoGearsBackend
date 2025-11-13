const {CartService} = require("../services/index")

class CartContoller
{
       static async addToCart(req, res,next) {
        try {
            let { productId, quantity } = req.body;
            const userId = req.user.id
            const cart = await CartService.addToCart(userId, productId, quantity);
            res.status(200).json(cart);
        } catch (error) {
            next(error)
        }
        };

        static async getUserCart (req, res,next) {
            try {
                const userId = req.user.id            ;
                const cart = await CartService.getUserCart(userId);
                res.status(200).json({
                    cart:cart
                });
            } catch (error) {
                next(error)
            }
        };

    static async removeItemFromCart(req,res,next)
    {

        try {
            const userId = req.user.id
            const productId = req.params.productId
            
            const cart = await await CartService.removeFromCart(userId,productId)
    
            res.status(200).json({
                success:true,
                cart
            })
        } catch (error) {
            next(error)
        }
        
    }
    static async updateCart(req,res,next)
    {

    }

}

module.exports = CartContoller