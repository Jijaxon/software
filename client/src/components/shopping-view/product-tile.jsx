import {Card, CardContent, CardFooter} from "../ui/card";
import {Button} from "../ui/button";
import {brandOptionsMap, categoryOptionsMap} from "@/config";
import {Badge} from "../ui/badge";
import instance from "@/utils/axios.js";
import {useSelector} from "react-redux";

function ShoppingProductTile({
                               product,
                               handleGetProductDetails,
                               handleAddtoCart,
                             }) {

  const {user} = useSelector(state => state.auth)

  function calculateSale() {
    return product?.price - (Number(product?.price) * Number(product?.salePrice) / 100)
  }

  return (
    <Card className="w-full max-w-sm mx-auto relative overflow-hidden">
      <div onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={instance.defaults.baseURL + product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {user && (
            <div className={"absolute w-full top-2 p-2 flex justify-between"}>
              <Badge className="bg-red-500 hover:bg-red-600">
                {`Only ${product?.totalStock} items left`}
              </Badge>
              {product?.salePrice > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600">
                  Sale {product?.salePrice}%
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-semibold text-primary">
                ${calculateSale()}
              </span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full"
          >
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;