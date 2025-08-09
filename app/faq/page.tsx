'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const faqs = [
  {
    id: 'shipping',
    category: 'Shipping',
    question: 'How long does shipping take?',
    answer: 'We offer free shipping on orders over $50. Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. International shipping is available and takes 7-14 business days.'
  },
  {
    id: 'freshness',
    category: 'Quality',
    question: 'How do you ensure the freshness of your dry fruits?',
    answer: 'All our dry fruits are sourced directly from trusted farms and stored in climate-controlled facilities. We package them in airtight containers and include freshness seals. Each product has a best-by date clearly marked.'
  },
  {
    id: 'returns',
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unopened items in original packaging. If you\'re not satisfied with your purchase, contact us within 30 days for a full refund or exchange.'
  },
  {
    id: 'organic',
    category: 'Quality',
    question: 'Are your products organic?',
    answer: 'We offer both organic and conventional options. All organic products are clearly labeled and certified by recognized organic certification bodies. Check the product description for certification details.'
  },
  {
    id: 'storage',
    category: 'Storage',
    question: 'How should I store my dry fruits?',
    answer: 'Store dry fruits in a cool, dry place away from direct sunlight. Once opened, transfer to airtight containers and refrigerate for maximum freshness. Most dry fruits last 6-12 months when stored properly.'
  },
  {
    id: 'bulk-orders',
    category: 'Orders',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes! We offer attractive discounts for bulk orders. Contact our customer service team with your requirements, and we\'ll provide a custom quote for orders over $200.'
  },
  {
    id: 'nutritional',
    category: 'Health',
    question: 'Are nutritional facts available for your products?',
    answer: 'Yes, detailed nutritional information is available on each product page. We provide information about calories, protein, fiber, vitamins, and minerals for all our products.'
  },
  {
    id: 'allergies',
    category: 'Health',
    question: 'Do you have allergen information?',
    answer: 'All our products include comprehensive allergen information. Common allergens like nuts, sulfites, and processing facility information are clearly listed on product pages and packaging.'
  }
]

const categories = ['All', 'Shipping', 'Quality', 'Returns', 'Storage', 'Orders', 'Health']

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#355E3B] mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about our premium dry fruits, shipping, and policies.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedCategory === category 
                ? 'bg-[#355E3B] hover:bg-[#2d4f32]' 
                : 'border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* FAQ Accordion */}
      <Card>
        <CardContent className="p-6">
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map(faq => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left hover:text-[#355E3B]">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <div className="mt-8 p-6 bg-[#355E3B] text-white rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
        <p className="mb-4">Our customer service team is here to help!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div>
            <strong>Email:</strong> support@luxurydryfruits.com
          </div>
          <div>
            <strong>Phone:</strong> 1-800-DRY-FRUIT
          </div>
          <div>
            <strong>Hours:</strong> Mon-Fri 9AM-6PM
          </div>
        </div>
      </div>
    </div>
  )
}
