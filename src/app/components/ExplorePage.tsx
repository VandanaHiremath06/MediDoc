import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Dumbbell,
  Apple,
  BookOpen,
  X,
  ChefHat,
  Calendar,
  Sparkles,
} from "lucide-react";
import { ImageWithFallback } from "./Figma/ImageWithFallback";
import ThemeToggle from "./ThemeToggle";

interface ExplorePageProps {
  onBack: () => void;
}

interface DetailedContent {
  type:
    | "routine"
    | "exercise"
    | "diet"
    | "article"
    | "nutrient"
    | "women"
    | "womenhealth"
    | "hygiene"
    | "disease"
    | "healthcare";

  title: string;
  content: string;
  image?: string;
  author?: string;
  specialty?: string;
}

const healthThumbnails = {
  routines:
    "https://images.unsplash.com/photo-1580916846078-19be39005e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  exercises:
    "https://images.unsplash.com/photo-1518310383802-640c2de311b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  diet: "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  articles:
    "https://images.unsplash.com/photo-1576669801945-7a346954da5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  nutrients:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",

  healthcare:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400",

  womenHealth:
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",

  hygiene:
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",

  diseases:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
};
const nutrientEnrichment = [
  {
    title: "Iron Rich Foods",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    description:
      "Iron supports oxygen transport and prevents anemia. Include spinach, beans, red meat, lentils, and pumpkin seeds.",
  },
  {
    title: "Vitamin D Essentials",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    description:
      "Vitamin D improves bone strength and immunity. Get sunlight exposure and include eggs, fish, and fortified milk.",
  },
];
const dailyHealthcareTips = [
  {
    title: "Morning Hydration",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
    description:
      "Drink 2 glasses of water after waking up to improve metabolism and detoxification.",
  },
  {
    title: "Screen Break Rule",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    description:
      "Follow the 20-20-20 rule to reduce eye strain from devices.",
  },
];
const womenHealth = [
  {
    title: "PCOS Awareness",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",
    description:
      "PCOS affects hormones and metabolism. Symptoms include irregular periods, acne, and weight gain.",
  },
  {
    title: "Breast Cancer Screening",
    image:
      "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=400",
    description:
      "Regular self-examinations and mammograms help detect breast cancer early.",
  },
];
const hygieneTips = [
  {
    title: "Hand Hygiene",
    image:
      "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400",
    description:
      "Wash hands regularly for at least 20 seconds to prevent infections.",
  },
  {
    title: "Oral Care",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400",
    description:
      "Brush twice daily and floss regularly to prevent gum disease.",
  },
];
const diseaseInfo = [
  {
    title: "Diabetes",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    description:
      "Cause: Insulin resistance.\nSymptoms: Fatigue, thirst, weight loss.\nEffects: Heart disease, kidney damage.",
  },
  {
    title: "Hypertension",
    image:
      "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=400",
    description:
      "Cause: High salt intake, stress.\nSymptoms: Headache, dizziness.\nEffects: Stroke, heart disease.",
  },
];
const getDayOfWeek = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};

const dietRecipesByDay = {
  "Infants 0-2": {
    Monday: [
      {
        name: "Mashed Banana",
        description: "Soft mashed banana for easy digestion",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Sweet Potato Puree",
        description: "Smooth sweet potato rich in vitamins",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Avocado Mash",
        description: "Creamy avocado packed with healthy fats",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Oat Cereal",
        description: "Soft oatmeal porridge with milk",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Pear Puree",
        description: "Gentle on tummy, naturally sweet",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Rice Cereal",
        description: "Iron-fortified rice cereal",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
    ],
    Thursday: [
      {
        name: "Carrot Puree",
        description: "Vitamin A rich soft carrot blend",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Apple Sauce",
        description: "Smooth unsweetened apple puree",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
    ],
    Friday: [
      {
        name: "Butternut Squash",
        description: "Creamy squash puree",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Pea Puree",
        description: "Protein-rich green peas",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
    ],
    Saturday: [
      {
        name: "Peach Puree",
        description: "Sweet soft peaches blended smooth",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Yogurt",
        description: "Plain full-fat yogurt for gut health",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
    ],
    Sunday: [
      {
        name: "Mixed Veggie Mash",
        description: "Combination of soft vegetables",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Breast Milk/Formula",
        description: "Primary nutrition source",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
    ],
  },
  "Toddlers 2-5": {
    Monday: [
      {
        name: "Mini Pancakes",
        description: "Small fluffy pancakes with fruit",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Mac & Cheese",
        description: "Whole wheat pasta with cheese sauce",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Fruit Yogurt",
        description: "Yogurt with mixed berries",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Chicken Fingers",
        description: "Baked chicken strips with veggies",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Scrambled Eggs",
        description: "Soft scrambled eggs with toast",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Mini Pizza",
        description: "English muffin pizza with veggies",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Thursday: [
      {
        name: "Cereal Bowl",
        description: "Whole grain cereal with milk",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Spaghetti",
        description: "Pasta with mild tomato sauce",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Friday: [
      {
        name: "Waffle Sticks",
        description: "Whole wheat waffle fingers with fruit",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Fish Sticks",
        description: "Baked fish with sweet potato",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "French Toast",
        description: "Cinnamon French toast with berries",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Quesadilla",
        description: "Cheese quesadilla with mild salsa",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Sunday: [
      {
        name: "Smoothie",
        description: "Fruit smoothie with hidden veggies",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Meatballs",
        description: "Mini turkey meatballs with pasta",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Children 5-10": {
    Monday: [
      {
        name: "Banana Pancakes",
        description:
          "Whole wheat pancakes with mashed banana and honey",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Veggie Pasta",
        description:
          "Colorful pasta with mixed vegetables and cheese",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Oatmeal Bowl",
        description: "Oats with fresh berries, nuts, and milk",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Chicken Nuggets",
        description: "Baked chicken with sweet potato fries",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Egg Sandwich",
        description: "Scrambled eggs on whole grain toast",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Veggie Pizza",
        description: "Homemade pizza with colorful vegetables",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Thursday: [
      {
        name: "Smoothie Bowl",
        description:
          "Berry smoothie topped with granola and fruits",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Fish Tacos",
        description: "Grilled fish with whole wheat tortillas",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
    ],
    Friday: [
      {
        name: "French Toast",
        description:
          "Whole grain bread with cinnamon and fruit",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Mini Burgers",
        description: "Lean beef patties with veggie sides",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Saturday: [
      {
        name: "Yogurt Parfait",
        description:
          "Greek yogurt layered with granola and berries",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Spaghetti",
        description:
          "Whole wheat pasta with tomato sauce and veggies",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
    ],
    Sunday: [
      {
        name: "Cereal Bowl",
        description: "Whole grain cereal with milk and banana",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Roast Chicken",
        description: "Baked chicken with roasted vegetables",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
    ],
  },
  "Preteens 10-14": {
    Monday: [
      {
        name: "Protein Waffles",
        description: "Waffles with peanut butter and banana",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Chicken Wrap",
        description: "Grilled chicken wrap with veggies",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Bagel & Cream Cheese",
        description: "Whole wheat bagel with fruit",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Pasta Primavera",
        description: "Pasta with fresh vegetables",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Breakfast Burrito",
        description: "Eggs, cheese, and veggies in tortilla",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Teriyaki Chicken",
        description: "Chicken with rice and broccoli",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Granola & Yogurt",
        description: "Greek yogurt with granola and honey",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Turkey Sandwich",
        description:
          "Whole grain sandwich with turkey and avocado",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Fruit Smoothie",
        description: "Mixed fruit smoothie with protein",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Tacos",
        description: "Lean beef tacos with all the fixings",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "Pancakes",
        description: "Buttermilk pancakes with berries",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Pizza Night",
        description: "Homemade pizza with healthy toppings",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Sunday: [
      {
        name: "Eggs & Bacon",
        description: "Scrambled eggs with turkey bacon",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Stir Fry",
        description: "Mixed vegetable and chicken stir fry",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Teens 14-18": {
    Monday: [
      {
        name: "Power Smoothie",
        description:
          "Protein-packed smoothie with banana and berries",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Chicken Bowl",
        description: "Brown rice bowl with grilled chicken",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Breakfast Sandwich",
        description: "Egg and cheese on English muffin",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Sub Sandwich",
        description: "Turkey sub with veggies and hummus",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Oatmeal Power Bowl",
        description: "Oats with nuts, seeds, and fruit",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Burrito Bowl",
        description: "Rice, beans, chicken, and fresh toppings",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Greek Yogurt Parfait",
        description: "Layers of yogurt, granola, and berries",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Grilled Salmon",
        description: "Salmon with quinoa and steamed veggies",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Avocado Toast",
        description:
          "Whole grain toast with smashed avocado and egg",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Pasta Night",
        description:
          "Whole wheat pasta with marinara and veggies",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
    ],
    Saturday: [
      {
        name: "Protein Pancakes",
        description: "High-protein pancakes with fruit",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Burger & Sweet Potato",
        description: "Lean beef burger with sweet potato fries",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Sunday: [
      {
        name: "Veggie Omelette",
        description: "Three-egg omelette with mixed vegetables",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Steak & Veggies",
        description: "Grilled steak with roasted vegetables",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Young Adults 18-30": {
    Monday: [
      {
        name: "Protein Smoothie",
        description:
          "Banana, protein powder, almond milk, and spinach",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Grilled Chicken Bowl",
        description:
          "Quinoa with grilled chicken, avocado, and veggies",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Avocado Toast",
        description:
          "Whole grain toast with smashed avocado and poached eggs",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Salmon Bowl",
        description:
          "Brown rice with grilled salmon and steamed broccoli",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Overnight Oats",
        description:
          "Oats soaked in almond milk with chia seeds and berries",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Chicken Stir Fry",
        description:
          "Mixed vegetables and chicken with brown rice",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Greek Yogurt Bowl",
        description:
          "Greek yogurt with granola, nuts, and honey",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Turkey Wrap",
        description:
          "Whole wheat wrap with turkey, hummus, and veggies",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Protein Pancakes",
        description:
          "Oat pancakes with protein powder and fresh fruit",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Shrimp Tacos",
        description:
          "Grilled shrimp with cabbage slaw and lime",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "Acai Bowl",
        description:
          "Acai smoothie topped with granola and tropical fruits",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Lean Steak",
        description:
          "Grilled steak with sweet potato and asparagus",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Sunday: [
      {
        name: "Veggie Omelette",
        description:
          "Egg white omelette with spinach, tomatoes, and feta",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Baked Cod",
        description:
          "Herb-crusted cod with quinoa and roasted veggies",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Adults 30-45": {
    Monday: [
      {
        name: "Chia Seed Pudding",
        description:
          "Chia seeds in almond milk with berries and almonds",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Mediterranean Bowl",
        description:
          "Farro with grilled chicken, olives, and feta cheese",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Green Smoothie",
        description:
          "Kale, apple, ginger, and lemon juice blend",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Lentil Soup",
        description:
          "Hearty lentil soup with vegetables and herbs",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Whole Grain Toast",
        description:
          "Toast with almond butter, banana, and cinnamon",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Grilled Salmon",
        description:
          "Wild salmon with roasted Brussels sprouts",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Berry Bowl",
        description:
          "Mixed berries with coconut yogurt and walnuts",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Chicken Salad",
        description:
          "Grilled chicken on mixed greens with balsamic",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Egg White Scramble",
        description:
          "Scrambled egg whites with spinach and mushrooms",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Turkey Meatballs",
        description:
          "Lean turkey meatballs with zucchini noodles",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "Quinoa Porridge",
        description:
          "Warm quinoa with cinnamon, dates, and nuts",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Baked Chicken",
        description:
          "Herb-roasted chicken with cauliflower mash",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Sunday: [
      {
        name: "Veggie Frittata",
        description: "Baked egg dish with colorful vegetables",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Fish Curry",
        description: "Light coconut fish curry with brown rice",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Middle Age 45-60": {
    Monday: [
      {
        name: "Oat Bran Cereal",
        description: "Heart-healthy oat bran with berries",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Grilled Fish",
        description: "Omega-3 rich fish with quinoa",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Green Smoothie Bowl",
        description: "Spinach, kale, and fruit smoothie bowl",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Mediterranean Salad",
        description: "Chickpeas, olives, feta, and greens",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Whole Wheat Toast",
        description: "Avocado toast with seeds",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Turkey Breast",
        description: "Roasted turkey with sweet potato",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Berry Smoothie",
        description: "Antioxidant-rich berry blend",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Lentil Bowl",
        description: "Protein-packed lentils with vegetables",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Egg White Scramble",
        description: "Low-cholesterol egg whites with veggies",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Baked Chicken",
        description:
          "Herb chicken with roasted Brussels sprouts",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "Quinoa Breakfast",
        description: "Quinoa porridge with nuts and honey",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Salmon Dinner",
        description: "Wild salmon with asparagus",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Sunday: [
      {
        name: "Greek Yogurt Bowl",
        description: "Probiotic yogurt with fresh fruit",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Veggie Stir Fry",
        description: "Colorful vegetables with tofu",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Seniors 60-75": {
    Monday: [
      {
        name: "Porridge with Walnuts",
        description:
          "Heart-healthy oats with walnuts and berries",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Steamed Fish",
        description:
          "Gentle white fish with carrots and spinach",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Warm Milk & Toast",
        description:
          "Whole grain toast with cottage cheese and tomatoes",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Lentil Stew",
        description:
          "Protein-rich lentil stew with root vegetables",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Fruit Salad",
        description:
          "Fresh seasonal fruits with a drizzle of honey",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Tofu Stir Fry",
        description:
          "Soft tofu with mixed vegetables and ginger",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Soft Boiled Eggs",
        description: "Eggs with whole grain toast and avocado",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Chicken Soup",
        description: "Nourishing chicken soup with vegetables",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Smoothie",
        description:
          "Banana, spinach, and almond milk smoothie",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Baked Salmon",
        description:
          "Omega-3 rich salmon with steamed broccoli",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "Rice Porridge",
        description:
          "Soft rice porridge with cinnamon and raisins",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Vegetable Curry",
        description: "Mild vegetable curry with basmati rice",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Sunday: [
      {
        name: "Yogurt Bowl",
        description:
          "Probiotic yogurt with soft fruits and honey",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Grilled Chicken",
        description:
          "Tender grilled chicken with mashed sweet potato",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
  "Elderly 75+": {
    Monday: [
      {
        name: "Soft Porridge",
        description:
          "Creamy oatmeal with honey and soft fruits",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Poached Fish",
        description:
          "Gently poached white fish with pureed vegetables",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Tuesday: [
      {
        name: "Scrambled Eggs",
        description:
          "Soft scrambled eggs with whole grain toast",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Chicken Soup",
        description: "Nourishing bone broth chicken soup",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Wednesday: [
      {
        name: "Fruit Smoothie",
        description: "Easy-to-digest blended fruit smoothie",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Soft Tofu",
        description: "Silken tofu with mild seasoning",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Thursday: [
      {
        name: "Rice Porridge",
        description: "Congee with ginger and soft vegetables",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Lentil Puree",
        description: "Soft lentil puree with herbs",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Friday: [
      {
        name: "Yogurt Parfait",
        description: "Full-fat yogurt with soft fruits",
        image:
          "https://images.unsplash.com/photo-1575445744788-d77f5e02044a?w=400",
      },
      {
        name: "Baked Salmon",
        description: "Tender baked salmon with mashed potato",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Saturday: [
      {
        name: "Warm Milk & Toast",
        description:
          "Soft whole grain toast with cottage cheese",
        image:
          "https://images.unsplash.com/photo-1632748441719-b62b3d01c48a?w=400",
      },
      {
        name: "Vegetable Stew",
        description: "Soft-cooked vegetable stew",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
    Sunday: [
      {
        name: "Banana Mash",
        description: "Mashed banana with oats and cinnamon",
        image:
          "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=400",
      },
      {
        name: "Chicken Puree",
        description: "Tender chicken with pureed sweet potato",
        image:
          "https://images.unsplash.com/photo-1580916846078-19be39005e32?w=400",
      },
    ],
  },
};

const healthArticlesDetailed = {
  "Infants 0-2": [
    {
      title: "Nutrition in the First 1000 Days",
      author: "Dr. Jennifer Martinez",
      specialty: "Pediatric Nutritionist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "The first 1000 days from conception to age 2 are critical for lifelong health. During this period, proper nutrition supports rapid brain development, immune system formation, and physical growth. Breast milk or formula provides essential nutrients. Around 6 months, introduce iron-rich solid foods gradually. Avoid honey before age 1 and minimize salt and sugar. Focus on nutrient-dense whole foods, establish regular feeding routines, and consult your pediatrician about any concerns.",
    },
    {
      title: "Developmental Milestones to Watch",
      author: "Dr. Thomas Lee",
      specialty: "Child Development Specialist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Infants develop rapidly in their first two years. By 4-6 months, most babies can roll over and sit with support. By 9-12 months, they typically crawl and may start walking. Social smiles appear around 2 months, and babbling begins around 6 months. Remember that development varies significantly—some children hit milestones earlier or later. Provide tummy time, talk and read to your baby, and create a safe environment for exploration. Consult your pediatrician if you have concerns.",
    },
    {
      title: "Safe Sleep Practices for Infants",
      author: "Dr. Rebecca Chen",
      specialty: "Pediatrician",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Safe sleep practices dramatically reduce the risk of SIDS (Sudden Infant Death Syndrome). Always place babies on their backs to sleep on a firm mattress. Keep the crib free of loose bedding, pillows, and toys. Room-sharing (but not bed-sharing) is recommended for the first 6-12 months. Maintain a comfortable room temperature and avoid overheating. Never sleep with an infant on a couch or chair. Use a pacifier at nap time and bedtime if desired.",
    },
  ],
  "Toddlers 2-5": [
    {
      title: "Encouraging Healthy Eating Habits",
      author: "Dr. Amanda Foster",
      specialty: "Child Nutritionist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Toddlers are naturally picky eaters as they assert independence. Offer a variety of colorful fruits and vegetables without pressure. Toddlers need to see new foods 10-15 times before accepting them. Involve children in meal prep, make eating fun, and model healthy habits yourself. Avoid using food as rewards or punishment. Provide regular meal and snack times, limit juice to 4oz daily, and ensure adequate calcium for bone development.",
    },
    {
      title: "Building Social Skills Through Play",
      author: "Dr. Michael Brown",
      specialty: "Child Psychologist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Ages 2-5 are crucial for developing social skills. Parallel play (playing alongside other children) evolves into cooperative play. Teach sharing, taking turns, and using words to express feelings. Playdates, preschool, and group activities provide practice opportunities. Role-play social situations at home. Praise positive interactions and gently correct inappropriate behavior. Remember that conflict is normal—use it as a teaching opportunity for problem-solving and emotional regulation.",
    },
    {
      title: "Managing Tantrums and Big Emotions",
      author: "Dr. Laura Wilson",
      specialty: "Child Behavioral Specialist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Tantrums peak around ages 2-3 as toddlers experience big emotions they can't yet express. Stay calm, ensure safety, and wait out the tantrum without giving in to unreasonable demands. Validate feelings (\"I see you're upset\") while maintaining boundaries. Teach emotion words and coping strategies like deep breaths. Prevent tantrums by maintaining routines, avoiding overstimulation, and offering choices when possible. Consistent, loving responses help children learn emotional regulation.",
    },
  ],
  "Children 5-10": [
    {
      title: "Building Healthy Eating Habits Early",
      author: "Dr. Sarah Johnson",
      specialty: "Pediatric Nutritionist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Early childhood is a critical period for establishing healthy eating habits that will last a lifetime. Research shows that food preferences developed during ages 2-14 often persist into adulthood. Focus on introducing a variety of colorful fruits and vegetables, making mealtimes enjoyable family events, and avoiding food as rewards or punishments. Encourage children to listen to their hunger cues and involve them in age-appropriate meal preparation to build positive relationships with food.",
    },
    {
      title: "The Importance of Outdoor Play",
      author: "Dr. Michael Chen",
      specialty: "Child Development Specialist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Physical activity through outdoor play is essential for children's physical, cognitive, and emotional development. Aim for at least 60 minutes of moderate to vigorous activity daily. Outdoor play helps develop motor skills, builds strong bones and muscles, promotes healthy weight, improves sleep quality, and enhances social skills. Activities like cycling, swimming, and team sports also teach important life skills like cooperation, resilience, and problem-solving.",
    },
    {
      title: "Managing Screen Time Effectively",
      author: "Dr. Emily Rodriguez",
      specialty: "Child Psychologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Excessive screen time can impact children's sleep, physical activity, and social development. The American Academy of Pediatrics recommends limiting screen time to 1-2 hours of quality programming for children over 2 years. Create screen-free zones (like bedrooms and dining areas), establish consistent rules, encourage educational content, and model healthy screen habits yourself. Balance digital engagement with physical activities, creative play, and face-to-face interactions.",
    },
  ],
  "Preteens 10-14": [
    {
      title: "Navigating Puberty and Body Changes",
      author: "Dr. Elizabeth Morgan",
      specialty: "Adolescent Medicine Specialist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Puberty brings dramatic physical and emotional changes. Girls typically begin between 8-13, boys between 9-14. Changes include growth spurts, body hair, voice changes (boys), breast development (girls), and mood fluctuations. Open communication is essential—normalize these changes and answer questions honestly. Focus on health rather than appearance, ensure adequate nutrition and sleep, and address hygiene needs. Watch for signs of depression or anxiety and seek professional help if needed.",
    },
    {
      title: "Developing Healthy Screen Habits",
      author: "Dr. Kevin Park",
      specialty: "Adolescent Psychologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Preteens face increasing screen exposure through school, social life, and entertainment. Set reasonable limits (1-2 hours recreational screen time), establish tech-free zones (bedrooms, dinner table), and monitor content without being intrusive. Encourage face-to-face friendships, outdoor activities, and hobbies. Teach digital citizenship, online safety, and critical thinking about social media. Model healthy tech habits yourself. Watch for signs of problematic use like sleep disruption or social withdrawal.",
    },
    {
      title: "Building Self-Esteem and Resilience",
      author: "Dr. Sophia Rodriguez",
      specialty: "School Psychologist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Ages 10-14 are sensitive for self-esteem as children compare themselves to peers and navigate social hierarchies. Praise effort over outcome, help identify strengths, and normalize struggles as learning opportunities. Encourage diverse interests and activities where they can experience success. Teach problem-solving and coping skills. Maintain open communication without judgment. Help them develop a growth mindset—abilities can be developed through effort and practice. Model self-compassion and healthy self-talk.",
    },
  ],
  "Teens 14-18": [
    {
      title: "Fitness Tips for Young Adults",
      author: "Dr. James Wilson",
      specialty: "Sports Medicine Physician",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Young adulthood is the perfect time to build a strong fitness foundation. Combine strength training 2-3 times weekly with cardiovascular exercise 3-4 times weekly. Focus on compound movements like squats, deadlifts, and push-ups for maximum efficiency. Prioritize proper form over heavy weights to prevent injuries. Include flexibility work through yoga or stretching. Track your progress, set realistic goals, and remember that consistency beats intensity. Build habits now that will serve you for decades.",
    },
    {
      title: "Nutrition for an Active Lifestyle",
      author: "Dr. Amanda Lee",
      specialty: "Sports Nutritionist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Active young adults need adequate fuel for performance and recovery. Prioritize whole foods: lean proteins for muscle repair, complex carbohydrates for energy, healthy fats for hormone production, and plenty of fruits and vegetables for micronutrients. Time your meals strategically—eat protein and carbs within 30 minutes post-workout. Stay hydrated with 8-10 glasses of water daily, more if exercising intensely. Avoid restrictive diets; focus on nutrient density and balanced eating.",
    },
    {
      title: "Mental Health and Well-being",
      author: "Dr. Robert Kumar",
      specialty: "Clinical Psychologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Your 20s can be challenging as you navigate career, relationships, and identity. Prioritize mental health through regular exercise (which boosts mood-regulating neurotransmitters), adequate sleep (7-9 hours nightly), and stress management techniques like meditation or journaling. Build strong social connections, seek professional help when needed, and remember that mental health is as important as physical health. Practice self-compassion and set healthy boundaries in work and relationships.",
    },
  ],
  "Young Adults 18-30": [
    {
      title: "Fitness Tips for Young Adults",
      author: "Dr. James Wilson",
      specialty: "Sports Medicine Physician",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Young adulthood is the perfect time to build a strong fitness foundation. Combine strength training 2-3 times weekly with cardiovascular exercise 3-4 times weekly. Focus on compound movements like squats, deadlifts, and push-ups for maximum efficiency. Prioritize proper form over heavy weights to prevent injuries. Include flexibility work through yoga or stretching. Track your progress, set realistic goals, and remember that consistency beats intensity. Build habits now that will serve you for decades.",
    },
    {
      title: "Nutrition for an Active Lifestyle",
      author: "Dr. Amanda Lee",
      specialty: "Sports Nutritionist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Active young adults need adequate fuel for performance and recovery. Prioritize whole foods: lean proteins for muscle repair, complex carbohydrates for energy, healthy fats for hormone production, and plenty of fruits and vegetables for micronutrients. Time your meals strategically—eat protein and carbs within 30 minutes post-workout. Stay hydrated with 8-10 glasses of water daily, more if exercising intensely. Avoid restrictive diets; focus on nutrient density and balanced eating.",
    },
    {
      title: "Mental Health and Well-being",
      author: "Dr. Robert Kumar",
      specialty: "Clinical Psychologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Your 20s can be challenging as you navigate career, relationships, and identity. Prioritize mental health through regular exercise (which boosts mood-regulating neurotransmitters), adequate sleep (7-9 hours nightly), and stress management techniques like meditation or journaling. Build strong social connections, seek professional help when needed, and remember that mental health is as important as physical health. Practice self-compassion and set healthy boundaries in work and relationships.",
    },
  ],
  "Adults 30-45": [
    {
      title: "Managing Stress in Your Prime Years",
      author: "Dr. Lisa Thompson",
      specialty: "Integrative Medicine Specialist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Ages 30-50 often bring increased responsibilities—career advancement, family obligations, financial pressures. Chronic stress can impact cardiovascular health, immune function, and mental well-being. Combat stress through regular physical activity, mindfulness practices, adequate sleep, and maintaining social connections. Learn to delegate, set boundaries, and prioritize self-care. Consider stress-reduction techniques like deep breathing, progressive muscle relaxation, or therapy. Remember that managing stress is not selfish—it's essential for long-term health.",
    },
    {
      title: "Heart Health Prevention Strategies",
      author: "Dr. David Martinez",
      specialty: "Cardiologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Your 30s and 40s are crucial for cardiovascular disease prevention. Key strategies include regular aerobic exercise (150 minutes weekly), maintaining healthy weight, managing blood pressure and cholesterol, avoiding smoking, limiting alcohol, and eating a heart-healthy diet rich in fruits, vegetables, whole grains, and omega-3 fatty acids. Get regular health screenings to catch issues early. Small lifestyle changes now can dramatically reduce your risk of heart disease later in life.",
    },
    {
      title: "Maintaining Metabolism as You Age",
      author: "Dr. Rachel Green",
      specialty: "Endocrinologist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Metabolism naturally slows with age, but you can counteract this. Build and maintain muscle mass through resistance training—muscle burns more calories at rest than fat. Eat adequate protein (0.8-1g per pound of body weight), stay active throughout the day (not just during workouts), get sufficient sleep, and manage stress (chronic stress elevates cortisol, which can slow metabolism). Don't severely restrict calories; this can backfire by slowing metabolism further. Focus on nutrient-dense whole foods.",
    },
  ],
  "Middle Age 45-60": [
    {
      title: "Hormone Changes and Health",
      author: "Dr. Catherine White",
      specialty: "Endocrinologist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Midlife brings hormonal shifts—menopause for women (typically 45-55) and andropause for men (gradual testosterone decline). Women may experience hot flashes, mood changes, and sleep disruption. Men may notice decreased energy and libido. Maintain a healthy weight, exercise regularly, and eat a balanced diet rich in calcium and vitamin D for bone health. Stay mentally and socially active. Hormone replacement therapy may help some individuals—discuss risks and benefits with your doctor.",
    },
    {
      title: "Preventing Chronic Disease",
      author: "Dr. Marcus Johnson",
      specialty: "Preventive Medicine Specialist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Your 40s and 50s are crucial for preventing or managing chronic diseases. Risk factors for heart disease, diabetes, and cancer increase with age. Get regular screenings: blood pressure, cholesterol, blood sugar, colonoscopy, mammogram. Don't smoke, limit alcohol, maintain healthy weight, exercise regularly, and eat a diet rich in vegetables, fruits, whole grains, and lean proteins. Manage stress through mindfulness, hobbies, or therapy. Small changes now dramatically improve quality of life later.",
    },
    {
      title: "Maintaining Muscle and Metabolism",
      author: "Dr. Jennifer Taylor",
      specialty: "Sports Medicine",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Muscle mass naturally decreases 3-8% per decade after 30, accelerating after 60. This sarcopenia slows metabolism and increases fall risk. Combat it through resistance training 2-3 times weekly. Focus on major muscle groups with progressive overload. Eat adequate protein (0.8-1g per pound body weight), especially after workouts. Include balance exercises and stretching. Stay active throughout the day—not just during workouts. Maintaining muscle mass is one of the best predictors of healthy aging.",
    },
  ],
  "Seniors 60-75": [
    {
      title: "Staying Active and Independent",
      author: "Dr. George Peterson",
      specialty: "Geriatric Medicine",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "Regular physical activity is key to maintaining independence in your 60s and 70s. Aim for 150 minutes weekly of moderate activity like brisk walking, swimming, or cycling. Add balance exercises (tai chi, yoga) to prevent falls—the leading cause of injury in seniors. Strength training maintains muscle mass and bone density. Social activities like group exercise classes provide both physical and mental benefits. Listen to your body, warm up properly, and consult your doctor before starting new activities.",
    },
    {
      title: "Cognitive Health and Memory",
      author: "Dr. Linda Chen",
      specialty: "Neurologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "While some memory changes are normal with aging, significant decline is not. Keep your brain active through puzzles, reading, learning new skills, and social engagement. The Mediterranean diet (rich in vegetables, fish, olive oil) supports brain health. Regular physical activity increases blood flow to the brain. Manage cardiovascular risk factors (hypertension, diabetes) as they affect cognition. Get adequate sleep and treat sleep apnea if present. If you notice significant memory changes, consult your doctor promptly.",
    },
    {
      title: "Managing Medications Safely",
      author: "Dr. Paul Martinez",
      specialty: "Geriatric Pharmacist",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Seniors often take multiple medications, increasing risk of interactions and side effects. Keep an updated medication list including over-the-counter drugs and supplements. Use one pharmacy when possible so they can check for interactions. Take medications exactly as prescribed and don't stop without consulting your doctor. Use pill organizers to prevent missed doses. Review your medications with your doctor annually—some may no longer be needed. Report any new symptoms promptly as they may be medication side effects.",
    },
  ],
  "Elderly 75+": [
    {
      title: "Bone Health and Osteoporosis Prevention",
      author: "Dr. Patricia Anderson",
      specialty: "Geriatric Medicine Specialist",
      image:
        "https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?w=400",
      content:
        "After 50, bone density naturally decreases, increasing fracture risk. Protect your bones through weight-bearing exercises (walking, dancing), resistance training, adequate calcium (1000-1200mg daily), vitamin D (800-1000 IU daily), and avoiding smoking and excessive alcohol. Have bone density scans as recommended. Consider balance exercises to prevent falls. Include calcium-rich foods like dairy, leafy greens, and fortified foods. Discuss with your doctor whether supplements are needed.",
    },
    {
      title: "Cognitive Health in Senior Years",
      author: "Dr. William Chang",
      specialty: "Neurologist",
      image:
        "https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=400",
      content:
        "Maintain brain health through lifelong learning, social engagement, regular physical activity, adequate sleep, and a Mediterranean-style diet rich in vegetables, fruits, whole grains, fish, and olive oil. Stay mentally active with puzzles, reading, or learning new skills. Manage cardiovascular risk factors (hypertension, diabetes, high cholesterol) as they impact brain health. Stay socially connected—isolation is a risk factor for cognitive decline. If you notice memory changes, consult your doctor promptly.",
    },
    {
      title: "Managing Chronic Conditions Naturally",
      author: "Dr. Susan Patel",
      specialty: "Integrative Geriatrics",
      image:
        "https://images.unsplash.com/photo-1643297654397-97b3201abc7c?w=400",
      content:
        "Many chronic conditions can be managed or improved through lifestyle modifications. For diabetes, focus on blood sugar control through diet, exercise, and medication adherence. For hypertension, reduce sodium, maintain healthy weight, and manage stress. For arthritis, gentle exercise and anti-inflammatory foods help. Work closely with your healthcare team, take medications as prescribed, and communicate any concerns. Complementary approaches like tai chi, meditation, and acupuncture may help when combined with conventional treatment.",
    },
  ],
};

const healthContent = {
  "Infants 0-2": {
    routines: [
      "Ensure 12-16 hours of sleep daily including naps for healthy development",
      "Tummy time 3-5 times daily for 3-5 minutes to build neck and shoulder muscles",
      "Regular pediatric check-ups for vaccinations and growth monitoring",
      "Create a consistent bedtime routine for better sleep patterns",
    ],
    exercises: [
      {
        name: "Tummy Time",
        description:
          "Builds neck, back, and shoulder strength while awake",
      },
      {
        name: "Reaching Games",
        description:
          "Encourages reaching and grasping to develop motor skills",
      },
      {
        name: "Gentle Movement",
        description:
          "Bicycle legs and gentle stretches during diaper changes",
      },
      {
        name: "Supervised Crawling",
        description: "Safe exploration in childproofed areas",
      },
    ],
  },
  "Toddlers 2-5": {
    routines: [
      "Get 10-13 hours of sleep daily for energy and growth",
      "Establish regular meal and snack times to support nutrition",
      "Encourage independence in dressing, toileting, and hygiene",
      "Limit screen time to 1 hour of quality programming daily",
    ],
    exercises: [
      {
        name: "Active Play",
        description:
          "3 hours daily - Running, jumping, climbing for development",
      },
      {
        name: "Dancing",
        description:
          "Fun movement that improves coordination and rhythm",
      },
      {
        name: "Ball Games",
        description:
          "Kicking, throwing, catching builds motor skills",
      },
      {
        name: "Playground Time",
        description:
          "Climbing, swinging, sliding for strength and balance",
      },
    ],
  },
  "Children 5-10": {
    routines: [
      "Get 9-11 hours of sleep daily for proper growth and development",
      "Play outdoors for at least 1 hour to build strong bones and social skills",
      "Limit screen time to 2 hours maximum for better focus and sleep",
      "Brush teeth twice daily and floss to establish good oral hygiene habits",
    ],
    exercises: [
      {
        name: "Jump Rope",
        description:
          "15 minutes daily - Improves cardiovascular health and coordination",
      },
      {
        name: "Swimming",
        description:
          "2-3 times per week - Full-body workout that's easy on joints",
      },
      {
        name: "Cycling",
        description:
          "20-30 minutes - Builds leg strength and endurance",
      },
      {
        name: "Dancing",
        description:
          "Fun cardio activity that improves rhythm and flexibility",
      },
    ],
  },
  "Preteens 10-14": {
    routines: [
      "Get 9-12 hours of sleep for growth spurts and development",
      "Establish screen time limits to protect sleep and mental health",
      "Maintain good hygiene habits including daily showering and dental care",
      "Encourage open communication about physical and emotional changes",
    ],
    exercises: [
      {
        name: "Team Sports",
        description:
          "Soccer, basketball - builds fitness and social skills",
      },
      {
        name: "Bike Riding",
        description:
          "30-45 minutes - cardiovascular health and independence",
      },
      {
        name: "Swimming",
        description: "Full-body exercise that's fun and social",
      },
      {
        name: "Active Games",
        description:
          "Tag, capture the flag - enjoyable cardio workout",
      },
    ],
  },
  "Teens 14-18": {
    routines: [
      "Aim for 8-10 hours of sleep despite busy schedules",
      "Balance academics, activities, and social life to prevent burnout",
      "Practice stress management through hobbies, exercise, or mindfulness",
      "Develop healthy relationships with food, body image, and self-care",
    ],
    exercises: [
      {
        name: "Gym Workouts",
        description:
          "Strength training with proper form 3x per week",
      },
      {
        name: "Running",
        description:
          "20-30 minutes - builds endurance and mental clarity",
      },
      {
        name: "Sports Practice",
        description:
          "School or club sports for fitness and teamwork",
      },
      {
        name: "Yoga",
        description:
          "Flexibility, strength, and stress relief combined",
      },
    ],
  },
  "Young Adults 18-30": {
    routines: [
      "Get 7-9 hours of quality sleep for muscle recovery and mental health",
      "Exercise 4-5 times per week mixing cardio and strength training",
      "Stay hydrated with 8 glasses of water daily for optimal performance",
      "Practice stress management through meditation, journaling, or hobbies",
    ],
    exercises: [
      {
        name: "Jogging",
        description:
          "30 minutes, 4x per week - Builds cardiovascular endurance",
      },
      {
        name: "Weight Training",
        description:
          "Build muscle strength and bone density with resistance exercises",
      },
      {
        name: "HIIT Workouts",
        description:
          "20 minutes high intensity - Burns calories efficiently",
      },
      {
        name: "Yoga",
        description:
          "Flexibility, mindfulness, and core strength development",
      },
    ],
  },
  "Adults 30-45": {
    routines: [
      "Prioritize 7-8 hours of sleep for hormone balance and recovery",
      "Schedule regular health checkups and cancer screenings",
      "Maintain work-life balance to prevent burnout and stress-related illness",
      "Practice mindfulness daily for mental clarity and stress reduction",
    ],
    exercises: [
      {
        name: "Brisk Walking",
        description:
          "45 minutes daily - Low-impact cardiovascular exercise",
      },
      {
        name: "Strength Training",
        description:
          "3x per week - Maintains muscle mass and metabolism",
      },
      {
        name: "Pilates",
        description:
          "Core strengthening and posture improvement",
      },
      {
        name: "Swimming",
        description:
          "Low-impact full-body cardio that's joint-friendly",
      },
    ],
  },
  "Middle Age 45-60": {
    routines: [
      "Get 7-8 hours of quality sleep for hormone balance and recovery",
      "Schedule annual health screenings and preventive care",
      "Build stress management into daily routine through meditation or hobbies",
      "Stay socially connected to support mental and emotional health",
    ],
    exercises: [
      {
        name: "Power Walking",
        description:
          "45 minutes daily - low-impact cardiovascular health",
      },
      {
        name: "Weight Training",
        description:
          "3x per week - preserve muscle mass and bone density",
      },
      {
        name: "Yoga or Pilates",
        description: "Core strength, flexibility, and balance",
      },
      {
        name: "Cycling",
        description:
          "Joint-friendly cardio that builds leg strength",
      },
    ],
  },
  "Seniors 60-75": {
    routines: [
      "Maintain consistent sleep schedule for better quality rest",
      "Regular medical checkups including bone density and heart health",
      "Stay socially active to maintain cognitive function and mood",
      "Practice balance exercises daily to prevent falls and maintain independence",
    ],
    exercises: [
      {
        name: "Walking",
        description:
          "30 minutes daily - Maintains cardiovascular health safely",
      },
      {
        name: "Tai Chi",
        description:
          "Balance, flexibility, and stress reduction through gentle movement",
      },
      {
        name: "Light Resistance",
        description:
          "Maintain muscle mass and bone density with light weights",
      },
      {
        name: "Water Aerobics",
        description:
          "Joint-friendly exercise that builds strength and endurance",
      },
    ],
  },
  "Elderly 75+": {
    routines: [
      "Maintain consistent sleep schedule with 7-9 hours nightly",
      "Stay socially active through community centers, family, and friends",
      "Practice daily balance and mobility exercises to prevent falls",
      "Keep mind active with puzzles, reading, and lifelong learning",
    ],
    exercises: [
      {
        name: "Gentle Walking",
        description:
          "20-30 minutes - safe cardiovascular activity",
      },
      {
        name: "Chair Exercises",
        description:
          "Seated movements for strength and flexibility",
      },
      {
        name: "Tai Chi",
        description:
          "Improves balance, reduces fall risk, gentle on joints",
      },
      {
        name: "Stretching",
        description:
          "Daily gentle stretches to maintain mobility",
      },
    ],
  },
};

export default function ExplorePage({
  onBack,
}: ExplorePageProps) {
  const [selectedAge, setSelectedAge] = useState<
    keyof typeof healthContent
  >("Young Adults 18-30");
  const [detailModal, setDetailModal] =
    useState<DetailedContent | null>(null);
  const currentDay = getDayOfWeek();

  const content = healthContent[selectedAge];
  const todaysRecipes =
    dietRecipesByDay[selectedAge][
      currentDay as keyof (typeof dietRecipesByDay)[typeof selectedAge]
    ];
  const articles = healthArticlesDetailed[selectedAge];

  const openDetail = (detail: DetailedContent) => {
    setDetailModal(detail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore Health & Wellness
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Discover healthy routines, exercises, and nutrition
            tips tailored for your age
          </p>

          {/* Age Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {Object.keys(healthContent).map((age) => (
              <button
                key={age}
                onClick={() =>
                  setSelectedAge(
                    age as keyof typeof healthContent,
                  )
                }
                className={`p-3 rounded-xl font-semibold text-sm transition-all ${
                  selectedAge === age
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg"
                }`}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Routines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() =>
                openDetail({
                  type: "routine",
                  title: "Daily Health Routines",
                  content: content.routines.join("\n\n"),
                  image: healthThumbnails.routines,
                })
              }
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.routines}
                  alt="Daily Routines"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-pink-500 p-3 rounded-full">
                    <Heart className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Daily Routines
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {content.routines.map((routine, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {routine}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.nutrients}
                  alt="Nutrients"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-full">
                    <Apple className="text-white" size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Nutrient Enrichment
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {nutrientEnrichment.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "nutrient",
                        title: item.title,
                        content: item.description,
                        image: item.image,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:scale-[1.02] transition"
                  >
                    <h4 className="font-semibold">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Exercises */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() =>
                openDetail({
                  type: "exercise",
                  title: "Recommended Exercises",
                  content: content.exercises
                    .map((e) => `${e.name}: ${e.description}`)
                    .join("\n\n"),
                  image: healthThumbnails.exercises,
                })
              }
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.exercises}
                  alt="Exercises"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <Dumbbell
                      className="text-white"
                      size={24}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Recommended Exercises
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {content.exercises.map((exercise, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {exercise.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Daily Healthcare */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.healthcare}
                  alt="Healthcare"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-cyan-500 p-3 rounded-full">
                    <Heart className="text-white" size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Daily Healthcare
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {dailyHealthcareTips.map((tip, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "healthcare",
                        title: tip.title,
                        content: tip.description,
                        image: tip.image,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold">
                      {tip.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Women Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.womenHealth}
                  alt="Women Health"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-pink-500 p-3 rounded-full">
                    <Heart className="text-white" size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Women Health
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {womenHealth.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "womenhealth",
                        title: item.title,
                        content: item.description,
                        image: item.image,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Hygiene */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.hygiene}
                  alt="Hygiene"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-yellow-500 p-3 rounded-full">
                    <Sparkles
                      className="text-white"
                      size={24}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Health Hygiene
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {hygieneTips.map((tip, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "hygiene",
                        title: tip.title,
                        content: tip.description,
                        image: tip.image,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold">
                      {tip.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Diseases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.diseases}
                  alt="Diseases"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-red-500 p-3 rounded-full">
                    <BookOpen
                      className="text-white"
                      size={24}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Diseases & Symptoms
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {diseaseInfo.map((disease, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "disease",
                        title: disease.title,
                        content: disease.description,
                        image: disease.image,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold">
                      {disease.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {disease.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Daily Recipes */}
            {/*<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.diet}
                  alt="Recipes"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-full">
                    <ChefHat className="text-white" size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Today's Recipes
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {todaysRecipes.map((recipe, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "diet",
                        title: recipe.name,
                        content: recipe.description,
                        image: recipe.image,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold">
                      {recipe.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {recipe.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>*/}
            {/* Doctor Articles */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.articles}
                  alt="Articles"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-purple-500 p-3 rounded-full">
                    <BookOpen
                      className="text-white"
                      size={24}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Famous Doctor Articles
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {articles.map((article, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      openDetail({
                        type: "article",
                        title: article.title,
                        content: article.content,
                        image: article.image,
                        author: article.author,
                        specialty: article.specialty,
                      })
                    }
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold">
                      {article.title}
                    </h4>

                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {article.author}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div> */}

            {/* Today's Diet Recipes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.diet}
                  alt="Diet & Nutrition"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500 p-3 rounded-full">
                      <ChefHat
                        className="text-white"
                        size={24}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Today's Recipes
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Calendar size={16} />
                    <span>{currentDay}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {todaysRecipes.map((meal, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() =>
                      openDetail({
                        type: "diet",
                        title: meal.name,
                        content: meal.description,
                        image: meal.image,
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={meal.image}
                          alt={meal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {meal.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {meal.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Health Articles by Specialists */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={healthThumbnails.articles}
                  alt="Health Articles"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="bg-purple-500 p-3 rounded-full">
                    <BookOpen
                      className="text-white"
                      size={24}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Health Articles
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {articles.map((article, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={() =>
                      openDetail({
                        type: "article",
                        title: article.title,
                        content: article.content,
                        image: article.image,
                        author: article.author,
                        specialty: article.specialty,
                      })
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={article.image}
                          alt={article.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {article.author} • {article.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDetailModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={detailModal.image || ""}
                alt={detailModal.title}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              <div className="whitespace-pre-line">
                {detailModal.content}
              </div>
              {detailModal.image && (
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={detailModal.image}
                    alt={detailModal.title}
                    className="w-full h-full object-cover"
                  />
                  <button
  onClick={() => setDetailModal(null)}
  aria-label="Close"
  title="Close"
  className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
>
                    <X
                      size={24}
                      className="text-gray-800 dark:text-gray-200"
                    />
                  </button>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  {detailModal.title}
                </h3>
                {detailModal.author && (
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      {detailModal.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {detailModal.author}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {detailModal.specialty}
                      </p>
                    </div>
                  </div>
                )}
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {detailModal.content}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}