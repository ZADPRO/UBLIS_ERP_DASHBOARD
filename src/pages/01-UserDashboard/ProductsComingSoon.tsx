import React, { useState, useEffect } from "react";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { Skeleton } from "primereact/skeleton";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

const ProductsComingSoon: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [layout, setLayout] = useState<"list" | "grid">("grid");

  useEffect(() => {
    const data: Product[] = [
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
    ];
    setProducts(data);
  }, []);

  const listItem = (product: Product, index: number) => (
    <div className="col-12" key={product.id}>
      <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
        <Skeleton className="w-9 sm:w-16rem xl:w-10rem shadow-2 h-6rem block xl:block mx-auto border-round" />
        <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
          <div className="flex flex-column align-items-center sm:align-items-start gap-3">
            <Skeleton className="w-8rem border-round h-2rem" />
            <Skeleton className="w-6rem border-round h-1rem" />
            <div className="flex align-items-center gap-3">
              <Skeleton className="w-6rem border-round h-1rem" />
              <Skeleton className="w-3rem border-round h-1rem" />
            </div>
          </div>
          <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
            <Skeleton className="w-4rem border-round h-2rem" />
            <Skeleton shape="circle" className="w-3rem h-3rem" />
          </div>
        </div>
      </div>
    </div>
  );

  const gridItem = (product: Product, index: number) => (
    <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={product.id}>
      <div className="p-4 border-1 surface-border surface-card border-round">
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
          <Skeleton className="w-6rem border-round h-1rem" />
          <Skeleton className="w-3rem border-round h-1rem" />
        </div>
        <div className="flex flex-column align-items-center gap-3 py-5">
          <Skeleton className="w-9 shadow-2 border-round h-10rem" />
          <Skeleton className="w-8rem border-round h-2rem" />
          <Skeleton className="w-6rem border-round h-1rem" />
        </div>
        <div className="flex align-items-center justify-content-between">
          <Skeleton className="w-4rem border-round h-2rem" />
          <Skeleton shape="circle" className="w-3rem h-3rem" />
        </div>
      </div>
    </div>
  );

  const itemTemplate = (product: Product, layout: string) => {
    if (layout === "list") return listItem(product, 0);
    else if (layout === "grid") return gridItem(product, 0);
  };

  const header = () => (
    <div className="flex items-center justify-between">
      <p>Products - Coming Soon</p>
      <DataViewLayoutOptions
        layout={layout}
        onChange={(e) => setLayout(e.value as "list" | "grid")}
      />
    </div>
  );

  return (
    <div>
      <p>Products - Coming Soon </p>
      <DataView
        value={products}
        // layout={layout}
        itemTemplate={(product, layout) => itemTemplate(product, layout)}
        // header={header()}
      />
    </div>
  );
};

export default ProductsComingSoon;
