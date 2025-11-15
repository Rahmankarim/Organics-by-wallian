import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#355E3B] mb-4">Terms of Service</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              By accessing and using the Origiganic by Wallian website, you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Origiganic by Wallian provides an online platform for purchasing premium quality dry fruits, 
              nuts, and related products. We reserve the right to modify, suspend, or discontinue the 
              service at any time without notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Account Registration</h4>
              <p className="text-gray-600">
                To place orders, you must create an account with accurate and complete information. 
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Account Responsibility</h4>
              <p className="text-gray-600">
                You are responsible for all activities that occur under your account. You must notify 
                us immediately of any unauthorized use of your account.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">4. Orders and Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Order Acceptance</h4>
              <p className="text-gray-600">
                All orders are subject to acceptance by us. We reserve the right to refuse or cancel 
                any order for any reason, including but not limited to product availability, errors 
                in product information, or suspected fraudulent activity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pricing</h4>
              <p className="text-gray-600">
                All prices are subject to change without notice. We reserve the right to modify prices 
                at any time. The price charged will be the price in effect at the time the order is placed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Payment</h4>
              <p className="text-gray-600">
                Payment must be received before products are shipped. We accept major credit cards and 
                other payment methods as indicated on our website.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">5. Shipping and Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Shipping Policy</h4>
              <p className="text-gray-600">
                We will make every effort to ship products within the timeframes specified. However, 
                delivery dates are estimates and we are not liable for delays caused by shipping carriers 
                or circumstances beyond our control.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Risk of Loss</h4>
              <p className="text-gray-600">
                Risk of loss and title for products pass to you upon delivery to the shipping carrier.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">6. Returns and Refunds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Return Policy</h4>
              <p className="text-gray-600">
                We accept returns of unopened products in original packaging within 30 days of delivery. 
                Customers are responsible for return shipping costs unless the return is due to our error.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Refund Processing</h4>
              <p className="text-gray-600">
                Refunds will be processed within 5-10 business days after we receive the returned items. 
                Refunds will be issued to the original payment method.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">7. Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We strive to provide accurate product information, including descriptions, images, and 
              nutritional facts. However, we do not warrant that product descriptions or other content 
              is accurate, complete, reliable, or error-free.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">8. Prohibited Uses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You may not use our website for any unlawful purpose or to solicit others to perform 
              unlawful acts. Prohibited uses include but are not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Violating any local, state, national, or international law</li>
              <li>Transmitting or procuring harmful content</li>
              <li>Infringing on intellectual property rights</li>
              <li>Harassing, abusing, or harming others</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Attempting to breach security or authentication measures</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">9. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              All content on this website, including text, graphics, logos, images, and software, is 
              the property of Origiganic by Wallian or its licensors and is protected by copyright and 
              other intellectual property laws. You may not reproduce, distribute, or create derivative 
              works without our express written permission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">10. Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">No Warranties</h4>
              <p className="text-gray-600">
                This website and all products are provided "as is" without any representations or 
                warranties, express or implied. We disclaim all warranties, including but not limited 
                to implied warranties of merchantability and fitness for a particular purpose.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Limitation of Liability</h4>
              <p className="text-gray-600">
                In no event shall Origiganic by Wallian be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the website or products.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">11. Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You agree to defend, indemnify, and hold harmless Origiganic by Wallian and its affiliates 
              from and against any claims, damages, costs, and expenses arising from your violation 
              of these terms or your use of the website.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">12. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              These terms shall be governed by and construed in accordance with the laws of the state 
              where our company is incorporated, without regard to conflict of law principles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">13. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Your continued use of the website 
              after any changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#355E3B]">14. Severability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              If any provision of these terms is found to be unenforceable, the remaining provisions 
              will remain in full force and effect.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <Card className="bg-[#355E3B] text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> legal@luxurydryfruits.com</p>
              <p><strong>Phone:</strong> 1-800-DRY-FRUIT</p>
              <p><strong>Address:</strong> 123 Luxury Street, Premium City, PC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
