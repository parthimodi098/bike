export interface AddonOption {
  category: string;
  description: string;
  sizeOptions: string[];
}

export const AVAILABLE_ADDONS: AddonOption[] = [
  {
    category: "Helmet",
    description: "AXOR / SMK / Axxis",
    sizeOptions: ["M", "L", "XL"],
  },
  {
    category: "Helmet",
    description: "MT / LS2 / KYT",
    sizeOptions: ["M", "L", "XL"],
  },
  {
    category: "Helmet",
    description: "AGV / HJC or Similar",
    sizeOptions: ["M", "L", "XL"],
  },
  {
    category: "Jacket",
    description: "Regular",
    sizeOptions: ["M", "L", "XL"],
  },
  {
    category: "Jacket",
    description: "Touring",
    sizeOptions: ["M", "L", "XL"],
  },
  {
    category: "Gloves",
    description: "Short Gauntlet",
    sizeOptions: ["M", "L", "XL", "XXL"],
  },
  {
    category: "Gloves",
    description: "Long Gauntlet",
    sizeOptions: ["M", "L", "XL", "XXL"],
  },
  {
    category: "Knee Guards",
    description: "Standard",
    sizeOptions: ["Standard"],
  },
  {
    category: "Tank Bags",
    description: "",
    sizeOptions: ["Standard"],
  },
  {
    category: "Tail Bags",
    description: "",
    sizeOptions: ["Standard"],
  },
  {
    category: "Saddle Bags",
    description: "",
    sizeOptions: ["Standard"],
  },
  {
    category: "Top Box",
    description: "",
    sizeOptions: ["Standard"],
  },
  {
    category: "Gel Seat",
    description: "",
    sizeOptions: ["Standard"],
  },
];

export interface SelectedAddon {
  category: string;
  description: string;
  size: string;
  quantity: number;
}
