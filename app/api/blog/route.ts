import { type NextRequest, NextResponse } from "next/server"
// Dynamic import - will be loaded at runtime
import type { IBlogPost } from "@/lib/models"

const sampleBlogPosts: IBlogPost[] = [
  {
    title: "10 Amazing Health Benefits of Almonds You Need to Know",
    slug: "health-benefits-of-almonds",
    excerpt:
      "Discover why almonds are considered a superfood and how they can transform your health when consumed regularly.",
    content: `
# 10 Amazing Health Benefits of Almonds You Need to Know

Almonds are more than just a tasty snack – they're a nutritional powerhouse that can significantly impact your health and well-being. Let's explore the incredible benefits of incorporating almonds into your daily diet.

## 1. Heart Health Champion

Almonds are rich in monounsaturated fats, which help reduce bad cholesterol levels and lower the risk of heart disease. Studies show that eating almonds regularly can improve your cardiovascular health significantly.

## 2. Brain Food Supreme

The vitamin E in almonds acts as a powerful antioxidant that protects brain cells from oxidative stress. Regular consumption may help improve memory and cognitive function.

## 3. Weight Management Support

Despite being calorie-dense, almonds can actually help with weight management. Their protein and fiber content increase satiety, helping you feel full for longer periods.

## 4. Blood Sugar Control

Almonds have a low glycemic index and can help regulate blood sugar levels, making them an excellent snack choice for people with diabetes.

## 5. Bone Health Booster

Rich in calcium, magnesium, and phosphorus, almonds support strong bones and may help prevent osteoporosis.

## 6. Skin Health Enhancement

The vitamin E and healthy fats in almonds nourish your skin from within, promoting a healthy, glowing complexion.

## 7. Digestive Health Support

The fiber in almonds promotes healthy digestion and supports beneficial gut bacteria.

## 8. Energy Booster

Almonds provide sustained energy thanks to their balanced combination of protein, healthy fats, and complex carbohydrates.

## 9. Anti-Inflammatory Properties

The antioxidants in almonds help reduce inflammation throughout the body, supporting overall health.

## 10. Cancer Prevention

Some studies suggest that the antioxidants and vitamin E in almonds may help protect against certain types of cancer.

## How to Incorporate Almonds into Your Diet

- Eat a handful (about 23 almonds) as a snack
- Add sliced almonds to your morning oatmeal or yogurt
- Use almond flour in baking
- Make homemade almond milk
- Include almonds in your trail mix

Remember, moderation is key. While almonds are incredibly healthy, they're also calorie-dense, so stick to recommended serving sizes for optimal benefits.
    `,
    featuredImage: "/Features/almond.jpg",
    author: "Rahman Karim",
    category: "Nutrition",
    tags: ["almonds", "health", "nutrition", "heart-health", "brain-food"],
    metaTitle: "10 Amazing Health Benefits of Almonds - Complete Guide",
    metaDescription: "Discover the incredible health benefits of almonds including heart health, brain function, weight management, and more. Learn how to incorporate almonds into your daily diet.",
    isPublished: true,
    publishedAt: new Date("2024-01-20"),
    readTime: 8,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    title: "Dates: Nature's Perfect Energy Source for Active Lifestyles",
    slug: "dates-natural-energy-source",
    excerpt:
      "Learn why dates are the ideal natural energy booster for athletes, busy professionals, and anyone seeking sustained energy throughout the day.",
    content: `
# Dates: Nature's Perfect Energy Source for Active Lifestyles

In our fast-paced world, finding natural, healthy sources of energy is more important than ever. Dates, often called "nature's candy," offer the perfect solution for sustained energy without the crash associated with processed sugars.

## Why Dates Are Energy Powerhouses

Dates contain natural sugars (glucose, fructose, and sucrose) that provide immediate energy, while their fiber content ensures a steady release of energy over time.

## Pre-Workout Fuel

Eating 2-3 dates 30 minutes before exercise provides:
- Quick energy for performance
- Potassium for muscle function
- Natural carbohydrates for endurance

## Post-Workout Recovery

Dates help replenish glycogen stores and provide minerals lost during exercise.

## Daily Energy Management

- Morning energy boost without caffeine crash
- Afternoon slump prevention
- Healthy dessert alternative

## Nutritional Profile

Per 100g of dates:
- Calories: 277
- Carbohydrates: 75g
- Fiber: 6.7g
- Potassium: 696mg
- Antioxidants: High levels

## Best Ways to Enjoy Dates

1. **Plain snacking** - 2-3 dates for quick energy
2. **Date energy balls** - Blend with nuts and seeds
3. **Smoothie sweetener** - Natural alternative to sugar
4. **Stuffed dates** - Fill with nuts or nut butter

## Storage Tips

- Store in airtight containers
- Refrigerate for longer shelf life
- Can be frozen for up to one year

Choose dates as your natural energy source and experience sustained vitality throughout your day!
    `,
    featuredImage: "/Features/dates.jpg",
    author: "Chef Rajesh Kumar",
    category: "Energy Foods",
    tags: ["dates", "energy", "workout", "natural-sugars", "endurance"],
    metaTitle: "Dates: Nature's Perfect Energy Source - Complete Guide",
    metaDescription: "Learn why dates are the ideal natural energy booster for athletes and busy professionals. Discover nutritional benefits and best ways to enjoy dates.",
    isPublished: true,
    publishedAt: new Date("2024-01-18"),
    readTime: 6,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    title: "Walnuts and Brain Health: The Science Behind the Connection",
    slug: "walnuts-brain-health",
    excerpt:
      "Explore the fascinating research linking walnut consumption to improved cognitive function, memory, and overall brain health.",
    content: `
# Walnuts and Brain Health: The Science Behind the Connection

The resemblance between a walnut and the human brain isn't just coincidental – science shows that walnuts are indeed brain food in the truest sense.

## The Omega-3 Connection

Walnuts are the only tree nut significantly high in omega-3 fatty acids, specifically alpha-linolenic acid (ALA), which is crucial for brain health.

## Scientific Research Findings

Recent studies have shown that regular walnut consumption can:

### Improve Cognitive Function
- Better working memory
- Enhanced processing speed
- Improved reasoning abilities

### Support Brain Development
- Critical for children's brain development
- Important during pregnancy for fetal brain development

### Protect Against Age-Related Decline
- May reduce risk of Alzheimer's disease
- Helps maintain cognitive function in older adults

## How Much Should You Eat?

Research suggests that eating 1 ounce (about 14 walnut halves) daily provides optimal brain health benefits.

## Beyond Omega-3s

Walnuts also contain:
- **Vitamin E**: Protects brain cells from oxidative stress
- **Folate**: Important for brain function and mental health
- **Antioxidants**: Combat inflammation in the brain

## Incorporating Walnuts into Your Diet

### Breakfast Options
- Add to oatmeal or yogurt
- Walnut-crusted French toast
- Smoothie bowls with chopped walnuts

### Snack Ideas
- Plain handful of walnuts
- Walnut and apple slices
- Trail mix with walnuts

### Meal Additions
- Walnut-crusted salmon
- Salads with toasted walnuts
- Walnut pesto pasta

## Storage and Freshness

- Store in refrigerator for up to 6 months
- Freeze for longer storage
- Buy from reputable sources for freshness

## The Bottom Line

The evidence is clear: walnuts are a simple, delicious way to support your brain health throughout life. Make them a regular part of your diet for optimal cognitive function.

Remember: A healthy brain starts with healthy choices, and walnuts are one of the best choices you can make!
    `,
    featuredImage: "/Features/walnut.jpg",
    author: "Dr. Sarah Neuroscientist",
    category: "Brain Health",
    tags: ["walnuts", "brain-health", "omega-3", "cognitive-function", "memory"],
    metaTitle: "Walnuts and Brain Health: The Science Behind the Connection",
    metaDescription: "Explore the fascinating research linking walnut consumption to improved cognitive function, memory, and overall brain health. Discover the science behind walnuts as brain food.",
    isPublished: true,
    publishedAt: new Date("2024-01-15"),
    readTime: 7,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    title: "Cashews: The Natural Mood Booster You Need in Your Life",
    slug: "cashews-mood-booster",
    excerpt:
      "Discover how cashews can naturally improve your mood, reduce stress, and support mental well-being through their unique nutritional profile.",
    content: `
# Cashews: The Natural Mood Booster You Need in Your Life

Feeling stressed or down? Before reaching for that sugary snack, consider grabbing a handful of cashews instead. These creamy, delicious nuts pack a powerful punch when it comes to supporting your mental well-being.

## The Mood-Food Connection

Cashews contain several nutrients that directly impact brain chemistry and mood regulation:

### Tryptophan - The Happiness Amino Acid
Cashews are rich in tryptophan, which your body converts to serotonin – the "feel-good" neurotransmitter.

### Magnesium - The Relaxation Mineral
Just one ounce of cashews provides about 20% of your daily magnesium needs, helping to:
- Reduce anxiety and stress
- Improve sleep quality
- Relax muscles and nerves

## Scientific Benefits for Mental Health

### Stress Reduction
The magnesium in cashews helps regulate cortisol levels, your body's primary stress hormone.

### Anxiety Management
Regular consumption may help reduce symptoms of anxiety through improved neurotransmitter function.

### Better Sleep
The combination of tryptophan and magnesium promotes better sleep quality, which is crucial for mental health.

## Nutritional Profile (per 1 oz serving)

- **Calories**: 157
- **Protein**: 5.2g
- **Magnesium**: 83mg (20% DV)
- **Tryptophan**: 68mg
- **Zinc**: 1.6mg
- **Iron**: 1.9mg

## How to Incorporate Cashews for Mood Benefits

### Daily Snacking
- Eat 1 ounce (about 18 cashews) as an afternoon snack
- Combine with dark chocolate for extra mood benefits

### Meal Additions
- Cashew cream for smoothies
- Chopped cashews in stir-fries
- Cashew butter on whole grain toast

### Stress-Busting Recipe: Mood-Boosting Trail Mix
**Ingredients:**
- 1 cup raw cashews
- 1/2 cup dark chocolate chips
- 1/4 cup dried cherries
- 1/4 cup pumpkin seeds

Mix and store in airtight container for a perfect mood-boosting snack!

## Best Practices for Maximum Benefits

### Choose Raw or Dry Roasted
Avoid heavily salted or flavored varieties that may contain unhealthy additives.

### Timing Matters
- Eat in the afternoon to combat stress
- Include in dinner for better sleep
- Have with breakfast for sustained mood support

### Storage Tips
- Store in cool, dry place
- Refrigerate for longer freshness
- Buy in smaller quantities for optimal freshness

## Additional Mental Health Benefits

### Cognitive Function
The healthy fats in cashews support brain function and memory.

### Energy Levels
Steady blood sugar from cashews prevents energy crashes that can affect mood.

### Overall Well-being
The protein and healthy fats contribute to overall physical health, which supports mental well-being.

## The Bottom Line

Cashews are more than just a delicious snack – they're a natural mood booster that can help you manage stress, improve sleep, and support overall mental well-being. 

Make cashews a regular part of your diet and experience the natural mood-lifting benefits of this incredible nut!

*Remember: While cashews can support mental health, they're not a replacement for professional mental health care when needed.*
    `,
    featuredImage: "/Features/Cashews.jpg",
    author: "Dr. Maya Wellness Expert",
    category: "Mental Health",
    tags: ["cashews", "mood", "stress", "mental-health", "serotonin"],
    metaTitle: "Cashews: The Natural Mood Booster - Complete Guide",
    metaDescription: "Discover how cashews can naturally improve your mood, reduce stress, and support mental well-being through their unique nutritional profile.",
    isPublished: true,
    publishedAt: new Date("2024-01-12"),
    readTime: 9,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Import MongoDB client only when needed
    const { default: clientPromise } = await import('@/lib/mongodb')
    const client = await clientPromise
    const db = client.db("organic_orchard")

    // Check if blog collection is empty and initialize with sample data
    const count = await db.collection("blog").countDocuments()
    if (count === 0) {
      await db.collection("blog").insertMany(sampleBlogPosts as any)
    }

    // DEVELOPMENT ONLY: Force re-seed if you want to update sample data
    // Uncomment the lines below when you want to refresh the blog data
    // await db.collection("blog").deleteMany({})
    // await db.collection("blog").insertMany(sampleBlogPosts as any)

    const url = new URL(request.url)
    const category = url.searchParams.get("category")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    const query: any = {}
    if (category) {
      query.category = category
    }

    const posts = await db.collection("blog").find(query).sort({ publishedAt: -1 }).limit(limit).toArray()

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Blog fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
