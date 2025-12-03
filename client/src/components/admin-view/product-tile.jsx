import React from 'react';
import {Card, CardContent, CardFooter} from "../ui/card"
import {Button} from "@/components/ui/button.jsx";
import instance from "@/utils/axios.js";
import {Badge} from "@/components/ui/badge.jsx";

const AdminProductTile = ({product, setFormData, setOpenCreateProductsDialog, setCurrentEditedId, handleDelete,}) => {

  function calculateSale() {
    return product?.price - (Number(product?.price) * Number(product?.salePrice) / 100)
  }

  return (
    <Card className="w-full max-w-sm mx-auto relative overflow-hidden">
      <div>
        <div className="relative">
          <img
            src={instance.defaults.baseURL + product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
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
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-bold">${calculateSale()}</span>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => handleDelete(product?._id)}>Delete</Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default AdminProductTile;